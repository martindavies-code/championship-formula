import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATASET_PATH = path.join(ROOT, 'data', 'england-tiers-1-4-1981-2025.json');
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || null;

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('No Chromium/Edge headless browser binary found.');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function startStaticServer(overrideJsonFn = null) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url, 'http://127.0.0.1');
      if (reqUrl.pathname === '/data/england-tiers-1-4-1981-2025.json' && overrideJsonFn) {
        return overrideJsonFn(req, res);
      }
      const rel = reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname.replace(/^\/+/, '');
      const full = path.resolve(ROOT, rel);
      if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(full);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(full).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function launchCdpSession() {
  const browserPath = findBrowser();
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-cdp-'));
  const proc = spawn(browserPath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  const browserWsUrl = await new Promise((resolve, reject) => {
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`Browser startup timeout: ${stderr}`)), 10000);
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      const m = /DevTools listening on (ws:\/\/[^\s]+)/.exec(stderr);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Browser exited early (${code}): ${stderr}`));
    });
  });

  const httpPortUrl = new URL(browserWsUrl);
  const targetsRes = await fetch(`http://127.0.0.1:${httpPortUrl.port}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const pageErrors = [];

  ws.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || 'Runtime exception');
    }
  });

  function send(method, params = {}) {
    const id = nextId++;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  await send('Page.enable');
  await send('Runtime.enable');

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: `(${expr})()`, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  async function navigateAndWait(url, readySelector = '#meta-coverage') {
    await send('Page.navigate', { url });
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 120));
      const ready = await evalJs(`() => {
        const meta = document.querySelector(${JSON.stringify(readySelector)})?.textContent || '';
        const err = !document.getElementById('fatal-error-panel')?.hidden;
        return (meta && meta !== 'Loading dataset…') || err;
      }`);
      if (ready) break;
    }
  }

  async function close() {
    try { ws.close(); } catch {}
    await new Promise((res) => {
      proc.once('exit', res);
      proc.kill();
      setTimeout(res, 1500);
    });
    try { fs.rmSync(userDir, { recursive: true, force: true, maxRetries: 4, retryDelay: 120 }); } catch {}
  }

  return { send, evalJs, navigateAndWait, pageErrors, close };
}

test('Static HTML & script architecture preserves offline file:// contract and zero innerHTML', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

  assert.equal(html.includes('type="module"'), false, 'index.html must not use type="module" so file:// works');
  assert.ok(html.includes('<script src="./data/england-tiers-1-4-1981-2025-bundle.js"></script>'));
  assert.ok(html.includes('<script defer src="./analysis.js"></script>'));
  assert.ok(html.includes('<script defer src="./app.js"></script>'));
  assert.equal(/\.\s*innerHTML\b/.test(appSrc), false, 'app.js must never assign innerHTML');
});

test('Real browser offline file:// rendering loads bundled dataset cleanly with zero JS exceptions', { timeout: 30000 }, async () => {
  const cdp = await launchCdpSession();
  try {
    const fileUrl = pathToFileURL(path.join(ROOT, 'index.html')).href;
    await cdp.navigateAndWait(fileUrl);
    const snap = await cdp.evalJs(`() => ({
      fatalHidden: document.getElementById('fatal-error-panel').hidden,
      coverage: document.getElementById('meta-coverage').textContent,
      matches: document.getElementById('meta-matches').textContent,
      goals: document.getElementById('meta-goals').textContent,
      ledgerCount: document.querySelectorAll('#ledger-grid .ledger-card').length,
      svgCount: document.querySelectorAll('svg').length,
      archiveRows: document.querySelectorAll('#archive-league-tbody tr').length,
    })`);

    assert.equal(cdp.pageErrors.length, 0, `Page errors on file://: ${cdp.pageErrors.join('; ')}`);
    assert.equal(snap.fatalHidden, true);
    assert.ok(snap.coverage.includes('174 Tier-Seasons'));
    assert.ok(snap.coverage.includes('4,000 Team-Seasons'));
    assert.equal(snap.ledgerCount, 6);
    assert.ok(snap.svgCount >= 5);
    assert.ok(snap.archiveRows >= 20);
  } finally {
    await cdp.close();
  }
});

test('Real browser HTTP interactions, responsive mobile layout, sorting, and screenshots', { timeout: 45000 }, async () => {
  const { server, baseUrl } = await startStaticServer();
  const cdp = await launchCdpSession();
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigateAndWait(`${baseUrl}/`);

    const desktopInit = await cdp.evalJs(`() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      coverage: document.getElementById('meta-coverage').textContent,
      fewerWinsCount: document.querySelectorAll('#sec2-fewer-wins-box li').length,
      corrRows: document.querySelectorAll('#sec1-corr-tbody tr').length,
      sec5ScopeBannerHidden: document.getElementById('sec5-scope-banner').hidden,
    })`);
    assert.equal(cdp.pageErrors.length, 0);
    assert.ok(desktopInit.scrollW <= desktopInit.clientW, `Desktop horizontal overflow: ${desktopInit.scrollW} > ${desktopInit.clientW}`);
    assert.ok(desktopInit.coverage.includes('174 Tier-Seasons'));
    assert.equal(desktopInit.fewerWinsCount, 12);
    assert.equal(desktopInit.corrRows, 5);
    assert.equal(desktopInit.sec5ScopeBannerHidden, false); // mixed scope shows explicit warning banner

    if (SCREENSHOT_DIR) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(SCREENSHOT_DIR, 'desktop-all-tiers.png'), Buffer.from(shot.data, 'base64'));
    }

    // 1. Toggle curtailed 2019-20 L1/L2 + navigate archive to 2019-20 T3
    await cdp.evalJs(`() => {
      const cb = document.getElementById('scope-include-curtailed');
      cb.click();
    }`);
    await new Promise((r) => setTimeout(r, 150));
    const afterCurtail = await cdp.evalJs(`() => ({
      coverage: document.getElementById('meta-coverage').textContent,
      banner: document.getElementById('active-scope-banner').textContent,
    })`);
    assert.ok(afterCurtail.coverage.includes('176 Tier-Seasons'));
    assert.ok(afterCurtail.coverage.includes('4,047 Team-Seasons'));
    assert.ok(afterCurtail.banner.includes('Curtailed Included'));

    await cdp.evalJs(`() => {
      const tierSel = document.getElementById('archive-tier-select');
      tierSel.value = '3';
      tierSel.dispatchEvent(new Event('change'));
      const seasSel = document.getElementById('season-select');
      seasSel.value = '2019-20';
      seasSel.dispatchEvent(new Event('change'));
    }`);
    await new Promise((r) => setTimeout(r, 120));
    const archive19 = await cdp.evalJs(`() => ({
      title: document.getElementById('archive-summary-title').textContent,
      rows: document.querySelectorAll('#archive-league-tbody tr').length,
      scorersText: document.getElementById('archive-scorers-tbody').textContent,
    })`);
    assert.ok(archive19.title.includes('EFL League One') && archive19.title.includes('2019'), `Unexpected archive title: ${archive19.title}`);
    assert.equal(archive19.rows, 23);
    assert.ok(archive19.scorersText.includes('Scorer chart unavailable'));

    // Sort archive table & verify live status announcement
    await cdp.evalJs(`() => {
      document.querySelector('#archive-league-table button[data-sort-col="9"]').click();
    }`);
    const sortStatus = await cdp.evalJs(`() => ({
      live: document.getElementById('table-sort-status').textContent,
      ptsSort: document.querySelector('#archive-league-table thead th:nth-child(10)').getAttribute('aria-sort'),
    })`);
    assert.ok(sortStatus.live.includes('Pts'));
    assert.equal(sortStatus.ptsSort, 'descending');

    if (SCREENSHOT_DIR) {
      await cdp.evalJs(`() => document.getElementById('sec-archive').scrollIntoView()`);
      await new Promise((r) => setTimeout(r, 100));
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(SCREENSHOT_DIR, 'archive-2019-20-l1.png'), Buffer.from(shot.data, 'base64'));
    }

    // 2. EFL preset -> explicit unavailable scorer state, then jump to Original PL
    await cdp.evalJs(`() => document.querySelector('[data-preset="efl-tiers-2-4"]').click()`);
    await new Promise((r) => setTimeout(r, 120));
    const eflState = await cdp.evalJs(`() => ({
      unavailHidden: document.getElementById('sec5-unavailable-panel').hidden,
      verifiedHidden: document.getElementById('sec5-verified-panel').hidden,
    })`);
    assert.equal(eflState.unavailHidden, false);
    assert.equal(eflState.verifiedHidden, true);

    if (SCREENSHOT_DIR) {
      await cdp.evalJs(`() => document.getElementById('sec-golden-boot').scrollIntoView()`);
      await new Promise((r) => setTimeout(r, 100));
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(SCREENSHOT_DIR, 'unavailable-scorers.png'), Buffer.from(shot.data, 'base64'));
    }

    await cdp.evalJs(`() => document.getElementById('btn-jump-pl-scorers').click()`);
    await new Promise((r) => setTimeout(r, 150));
    const plState = await cdp.evalJs(`() => ({
      coverage: document.getElementById('meta-coverage').textContent,
      matches: document.getElementById('meta-matches').textContent,
      goals: document.getElementById('meta-goals').textContent,
      verifiedHidden: document.getElementById('sec5-verified-panel').hidden,
      scopeBannerHidden: document.getElementById('sec5-scope-banner').hidden,
    })`);
    assert.ok(plState.coverage.includes('33 Tier-Seasons'));
    assert.ok(plState.coverage.includes('666 Team-Seasons'));
    assert.ok(plState.matches.includes('12,786'));
    assert.ok(plState.goals.includes('34,433'));
    assert.equal(plState.verifiedHidden, false);
    assert.equal(plState.scopeBannerHidden, true);

    // 3. Empty scope state & reset (click only checked tier checkboxes)
    await cdp.evalJs(`() => document.querySelectorAll('#scope-tier-checkboxes input:checked').forEach(cb => cb.click())`);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(await cdp.evalJs(`() => document.getElementById('empty-scope-panel').hidden`), false);
    await cdp.evalJs(`() => document.getElementById('btn-reset-scope').click()`);
    await new Promise((r) => setTimeout(r, 120));
    assert.ok((await cdp.evalJs(`() => document.getElementById('meta-coverage').textContent`)).includes('174 Tier-Seasons'));

    // 4. Mobile 360px & 390px overflow verification
    for (const [w, h] of [[360, 780], [390, 844]]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
      await new Promise((r) => setTimeout(r, 150));
      const mob = await cdp.evalJs(`() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      })`);
      assert.ok(mob.scrollW <= mob.clientW, `Mobile ${w}px overflow: ${mob.scrollW} > ${mob.clientW}`);
      if (SCREENSHOT_DIR && w === 390) {
        await cdp.evalJs(`() => window.scrollTo(0, 0)`);
        await new Promise((r) => setTimeout(r, 100));
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(SCREENSHOT_DIR, 'mobile-390.png'), Buffer.from(shot.data, 'base64'));
      }
    }
    assert.equal(cdp.pageErrors.length, 0);
  } finally {
    await cdp.close();
    server.close();
  }
});

test('Security & failure states: hostile XSS payloads never execute & corrupt JSON triggers fatal fallback', { timeout: 30000 }, async () => {
  // 1. Hostile XSS string inside team name and deduction reason
  const hostileDs = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  hostileDs.tierSeasons = [structuredClone(hostileDs.tierSeasons[0])];
  hostileDs.tierSeasons[0].table[0].team = '"><img src=x onerror="window.__xss=1">';
  hostileDs.tierSeasons[0].table[0].deductionReason = '<script>window.__xss=2</script>';
  hostileDs.tierSeasons[0].exceptions = ['Hostile <svg onload="window.__xss=3"> note'];

  const sXss = await startStaticServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(hostileDs));
  });
  const cdp1 = await launchCdpSession();
  try {
    await cdp1.navigateAndWait(`${sXss.baseUrl}/`);
    await new Promise((r) => setTimeout(r, 150));
    const res = await cdp1.evalJs(`() => ({
      xss: window.__xss ?? null,
      fatalHidden: document.getElementById('fatal-error-panel').hidden,
      firstClubText: document.querySelector('#archive-league-tbody tr td:nth-child(2)')?.textContent || '',
    })`);
    assert.equal(res.xss, null, 'XSS payload must NEVER execute!');
    assert.equal(res.fatalHidden, true);
    assert.ok(res.firstClubText.includes('<img src=x'));
    assert.equal(cdp1.pageErrors.length, 0);
  } finally {
    await cdp1.close();
    sXss.server.close();
  }

  // 2. Corrupt JSON fails loudly into #fatal-error-panel
  const sErr = await startStaticServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ schemaVersion: '0.0.1', broken: true }));
  });
  const cdp2 = await launchCdpSession();
  try {
    await cdp2.navigateAndWait(`${sErr.baseUrl}/`);
    await new Promise((r) => setTimeout(r, 150));
    const errRes = await cdp2.evalJs(`() => ({
      fatalHidden: document.getElementById('fatal-error-panel').hidden,
      fatalText: document.getElementById('fatal-error-message').textContent,
      mainHidden: document.getElementById('main-content').hidden,
    })`);
    assert.equal(errRes.fatalHidden, false);
    assert.ok(errRes.fatalText.includes('Unsupported dataset schemaVersion'));
    assert.equal(errRes.mainHidden, true);
  } finally {
    await cdp2.close();
    sErr.server.close();
  }
});
