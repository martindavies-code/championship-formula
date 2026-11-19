import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATASET_PATH = path.join(ROOT, 'data', 'england-tiers-1-4-1981-2026.json');
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
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function startStaticServer(overrideJsonFn = null) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url, 'http://127.0.0.1');
      if (reqUrl.pathname === '/data/england-tiers-1-4-1981-2026.json' && overrideJsonFn) {
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
  assert.ok(html.includes('<script src="./data/england-tiers-1-4-1981-2026-bundle.js"></script>'));
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
    assert.ok(snap.coverage.includes('178 League Tables'));
    assert.ok(snap.coverage.includes('4,092 Team Seasons'));
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
    assert.ok(desktopInit.coverage.includes('178 League Tables'));
    assert.equal(desktopInit.fewerWinsCount, 13);
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
    assert.ok(afterCurtail.coverage.includes('180 League Tables'));
    assert.ok(afterCurtail.coverage.includes('4,139 Team Seasons'));
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
    assert.ok(plState.coverage.includes('34 League Tables'));
    assert.ok(plState.coverage.includes('686 Team Seasons'));
    assert.ok(plState.matches.includes('13,166'));
    assert.ok(plState.goals.includes('35,478'));
    assert.equal(plState.verifiedHidden, false);
    assert.equal(plState.scopeBannerHidden, true);

    // 3. Empty scope state & reset (click only checked tier checkboxes)
    await cdp.evalJs(`() => document.querySelectorAll('#scope-tier-checkboxes input:checked').forEach(cb => cb.click())`);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(await cdp.evalJs(`() => document.getElementById('empty-scope-panel').hidden`), false);
    await cdp.evalJs(`() => document.getElementById('btn-reset-scope').click()`);
    await new Promise((r) => setTimeout(r, 120));
    assert.ok((await cdp.evalJs(`() => document.getElementById('meta-coverage').textContent`)).includes('178 League Tables'));

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

test('D4: Zero [object, undefined, NaN, or Infinity strings appear in rendered UI across presets, curtailed & raw modes', { timeout: 45000 }, async () => {
  const { server, baseUrl } = await startStaticServer();
  const cdp = await launchCdpSession();
  const badTokenRe = /\[object\b|\bundefined\b|\bNaN\b|\bInfinity\b/;
  async function assertCleanRender(label) {
    await new Promise((r) => setTimeout(r, 120));
    const txt = await cdp.evalJs(`() => document.body.innerText`);
    const m = badTokenRe.exec(txt);
    assert.equal(m, null, `Found forbidden token "${m?.[0]}" in rendered UI during ${label}`);
  }
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigateAndWait(`${baseUrl}/`);
    for (const preset of ['all-4-tiers', 'pl-1992-2026', 'tier1-full', 'efl-tiers-2-4']) {
      await cdp.evalJs(`() => document.querySelector('[data-preset="${preset}"]').click()`);
      await assertCleanRender(`preset:${preset}`);
    }
    await cdp.evalJs(`() => document.querySelector('[data-preset="all-4-tiers"]').click()`);
    await cdp.evalJs(`() => {
      const cb = document.getElementById('scope-include-curtailed');
      if (!cb.checked) cb.click();
    }`);
    await cdp.evalJs(`() => {
      const ts = document.getElementById('archive-tier-select');
      ts.value = '3';
      ts.dispatchEvent(new Event('change'));
      const ss = document.getElementById('season-select');
      ss.value = '2019-20';
      ss.dispatchEvent(new Event('change'));
    }`);
    await assertCleanRender('curtailed:2019-20-T3');

    await cdp.evalJs(`() => {
      const ts = document.getElementById('archive-tier-select');
      ts.value = '4';
      ts.dispatchEvent(new Event('change'));
      const ss = document.getElementById('season-select');
      ss.value = '1991-92';
      ss.dispatchEvent(new Event('change'));
    }`);
    await assertCleanRender('expelledClubs:1991-92-T4');

    await cdp.evalJs(`() => document.querySelector('[data-points-mode="raw"]').click()`);
    await assertCleanRender('rawMode+curtailed');
    assert.equal(cdp.pageErrors.length, 0);
  } finally {
    await cdp.close();
    server.close();
  }
});

test('Stage 2 A1-A5 browser DOM invariants: dual GF/GA metrics, draw copy/quartiles, Raw mode official isolation, and small-sample grammar', { timeout: 35000 }, async () => {
  const { server, baseUrl } = await startStaticServer();
  const cdp = await launchCdpSession();
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigateAndWait(`${baseUrl}/`);

    const allTiers = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec1: document.getElementById('sec-predictors').textContent,
      sec4: document.getElementById('sec-draws').textContent,
    })`);
    assert.ok(!/\b1 clubs\b/.test(allTiers.body), 'Must never render "1 clubs"');
    assert.ok(!allTiers.body.includes('Excludes 0'), 'Must omit zero-exclusion phrasing');
    assert.ok(!allTiers.body.includes('flipping the PL-only'), 'Must not contain removed false PL-flip claim');
    assert.ok(!allTiers.body.includes('22 from 11 draws'), 'Must not contain broken draw arithmetic');
    assert.ok(allTiers.sec1.includes('Pooled points variation') && allTiers.sec1.includes('65.8%') && allTiers.sec1.includes('61.0%') && allTiers.sec1.includes('winning 11 and losing 11') && allTiers.sec1.includes('drawing all 22 yields 22 points'), 'Section 1 must include pooled points variation and fixed draw arithmetic');
    assert.ok(allTiers.sec4.includes('62.1%') && allTiers.sec4.includes('tied co-leaders'), 'Section 4 must include quartile share and co-leader caveat');

    // PL-only slice: must show zero Swindon mention in Section 4 and honest dual GF/GA wording in Section 1
    await cdp.evalJs(`() => document.querySelector('[data-preset="pl-1992-2026"]').click()`);
    await new Promise((r) => setTimeout(r, 150));
    const plText = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec1: document.getElementById('sec-predictors').textContent,
      sec3: document.getElementById('sec-survival').textContent,
      sec4: document.getElementById('sec-draws').textContent,
    })`);
    assert.ok(!plText.body.includes('Excludes 0') && !plText.sec3.includes('0 excl.'), 'PL scope must omit zero-exclusion text');
    assert.ok(!plText.sec1.includes('attacking output slightly leads'));
    assert.ok(!plText.sec4.includes('Swindon'), 'PL-only Section 4 must never hardcode Swindon');
    assert.ok(plText.sec4.includes('No draw-leading side in scope won the league title'));

    // Raw mode on T2 2022-23: survival tier table stays official (Reading 44 pts, never 50 pts)
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelector('[data-points-mode="raw"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '2';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      eSel.value = '2022'; eSel.dispatchEvent(new Event('change'));
      sSel.value = '2022'; sSel.dispatchEvent(new Event('change'));
    }`);
    await new Promise((r) => setTimeout(r, 150));
    const rawSingle = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec1Title: document.getElementById('sec1-title').textContent,
      sec3Tier: document.getElementById('sec3-tier-tbody').textContent,
      sec3Prose: document.getElementById('sec3-prose').textContent,
      sec3Callout: document.getElementById('sec3-callout-list').textContent,
      sec4Title: document.getElementById('sec4-title').textContent,
    })`);
    assert.ok(!/\b1 (?:clubs|slots|tables|tiers|seasons|Tier-Seasons)\b/.test(rawSingle.body), 'Single-slot UI must use singular nouns for count 1');
    assert.ok(rawSingle.sec1Title.includes('Small Sample'), 'Single-slot selection must trigger small-sample guard');
    assert.ok(rawSingle.sec3Tier.includes('Reading') && rawSingle.sec3Tier.includes('44 pts') && rawSingle.sec3Tier.includes('0.957'), 'Raw mode survival tier table must keep official 44 pts / 0.957 PPG for Reading');
    assert.ok(!rawSingle.sec3Tier.includes('50 pts') && !rawSingle.sec3Prose.includes('50 pts') && rawSingle.sec3Callout.includes('0 / 1'), 'Raw mode must NOT leak 50 raw points / 1.087 PPG into official Reading relegation');
    assert.ok(rawSingle.sec4Title.includes('Draw Leaders in Selected Scope'));
    assert.equal(cdp.pageErrors.length, 0);
  } finally {
    await cdp.close();
    server.close();
  }
});

test('Final polish: neutral divergence prose without causal claim and PL 38-game survival baseline disclosure', { timeout: 35000 }, async () => {
  const readmeText = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const removedA = ['stretched', 'by', 'high-scoring'].join(' ');
  const removedB = ['treats', 'every', 'division-year', 'identically'].join(' ');
  assert.ok(!readmeText.toLowerCase().includes(removedA) && !readmeText.toLowerCase().includes(removedB), 'README must not contain removed causal phrases');
  assert.ok(readmeText.includes('The measures use different outcomes and aggregation methods, so their rankings can differ.'), 'README must use neutral divergence wording');
  assert.ok(readmeText.includes('34') && readmeText.includes('1992–95') && readmeText.includes('31') && readmeText.includes('intentional scope definition'), 'README must disclose PL preset 34 vs 31 38-game baseline');

  const { server, baseUrl } = await startStaticServer();
  const cdp = await launchCdpSession();
  const bannedPatterns = ['[object', 'undefined', 'NaN', 'Infinity'];
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigateAndWait(`${baseUrl}/`);

    const assertNoBanned = (label, text) => {
      const lower = text.toLowerCase();
      assert.ok(!lower.includes(removedA) && !lower.includes(removedB), `${label} must not contain removed causal phrases`);
      for (const pat of bannedPatterns) {
        assert.ok(!text.includes(pat), `${label} must not contain "${pat}"`);
      }
    };

    // 1. Default scope (all-4-tiers): neutral divergence wording present, PL-only baseline note absent
    const defText = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec1: document.getElementById('sec-predictors').textContent,
      sec3: document.getElementById('sec3-prose').textContent,
    })`);
    assertNoBanned('default', defText.body);
    assert.ok(defText.sec1.includes('The measures use different outcomes and aggregation methods, so their rankings can differ.'));
    assert.ok(defText.sec1.includes('Both margins are modest descriptive associations rather than tactical prescriptions.'));
    assert.ok(!defText.sec3.includes('38-game Premier League baseline'), 'Non-PL all-4-tiers scope must stay unchanged without PL baseline line');

    // 2. PL preset (pl-1992-2026): neutral divergence wording AND computed 38-game PL baseline line with all 5 reference values
    await cdp.evalJs(`() => document.querySelector('[data-preset="pl-1992-2026"]').click()`);
    await new Promise((r) => setTimeout(r, 150));
    const plText = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec1: document.getElementById('sec-predictors').textContent,
      sec3: document.getElementById('sec3-prose').textContent,
    })`);
    assertNoBanned('pl-1992-2026', plText.body);
    assert.ok(plText.sec1.includes('The measures use different outcomes and aggregation methods, so their rankings can differ.'));
    assert.ok(plText.sec3.includes('38-game Premier League baseline'), 'PL preset must render computed 38-game PL baseline line');
    assert.ok(plText.sec3.includes('34.7 points') && plText.sec3.includes('median 34'), 'PL baseline must show mean 34.7 and median 34');
    assert.ok(plText.sec3.includes('15 of 31 seasons'), 'PL baseline must show 15 of 31 at 35 points');
    assert.ok(plText.sec3.includes('3 of 31') && plText.sec3.includes('40+ points'), 'PL baseline must show 3 of 31 on 40+ points');
    assert.ok(plText.sec3.includes('22 of 31 seasons'), 'PL baseline must show 22 of 31 below 40 points');

    // 3. PL small-sample guard (1992-93 to 1993-94, 2 slots): baseline line must not fire
    await cdp.evalJs(`() => {
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      sSel.value = '1992'; sSel.dispatchEvent(new Event('change'));
      eSel.value = '1993'; eSel.dispatchEvent(new Event('change'));
    }`);
    await new Promise((r) => setTimeout(r, 150));
    const plSmall = await cdp.evalJs(`() => document.getElementById('sec3-prose').textContent`);
    assertNoBanned('pl-small-sample', plSmall);
    assert.ok(plSmall.includes('Small-sample scope') && !plSmall.includes('38-game Premier League baseline'));

    // 4. Tier 4 only scope (1981-2024): PL baseline line must be absent
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '4';
        if (cb.checked !== want) cb.click();
      });
    }`);
    await new Promise((r) => setTimeout(r, 150));
    const t4Text = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec3: document.getElementById('sec3-prose').textContent,
    })`);
    assertNoBanned('tier-4-only', t4Text.body);
    assert.ok(!t4Text.sec3.includes('38-game Premier League baseline'), 'Tier 4 only scope must not show PL baseline line');

    // 5. Tier 2 2022-23 Raw mode: clean render, PL baseline line absent
    await cdp.evalJs(`() => {
      document.querySelector('[data-points-mode="raw"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '2';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      eSel.value = '2022'; eSel.dispatchEvent(new Event('change'));
      sSel.value = '2022'; sSel.dispatchEvent(new Event('change'));
    }`);
    await new Promise((r) => setTimeout(r, 150));
    const t2Raw = await cdp.evalJs(`() => ({
      body: document.body.innerText,
      sec3: document.getElementById('sec3-prose').textContent,
    })`);
    assertNoBanned('tier2-2022-23-raw', t2Raw.body);
    assert.ok(!t2Raw.sec3.includes('38-game Premier League baseline'));
    assert.equal(cdp.pageErrors.length, 0);
  } finally {
    await cdp.close();
    server.close();
  }
});

test('Headline ledger semantic DOM invariants: plain English without statistical misstatements', { timeout: 45000 }, async () => {
  const { server, baseUrl } = await startStaticServer();
  const cdp = await launchCdpSession();
  const shorthandRe = /within-slot|\|r\||R²\(PPG\)|\bIQR\b|% Pct|\b38g\b|\b46g\b|\bexcl\.|\bslots\b|\bmed\b|\bGA\/G\b|\bGF\/G\b|\bGD\/G\b|\bW\/G\b|\bPPG\b/i;
  const badTokenRe = /\[object\b|\bundefined\b|\bNaN\b|\bInfinity\b/;
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigateAndWait(`${baseUrl}/`);

    const checkLedger = async (label) => {
      await new Promise((r) => setTimeout(r, 150));
      const snap = await cdp.evalJs(`() => ({
        note: document.getElementById('ledger-sample-note').textContent,
        ledger: document.getElementById('ledger').innerText,
        emptyHidden: document.getElementById('empty-scope-panel').hidden,
        emptyMsg: document.getElementById('empty-scope-message').textContent,
      })`);
      const mShort = shorthandRe.exec(snap.ledger);
      assert.equal(mShort, null, `${label} ledger must avoid shorthand jargon (found "${mShort?.[0]}")`);
      const mBad = badTokenRe.exec(snap.ledger);
      assert.equal(mBad, null, `${label} ledger must avoid bad tokens (found "${mBad?.[0]}")`);
      return snap;
    };

    // 1. Default 178-table scope
    const defSnap = await checkLedger('default');
    assert.ok(defSnap.note.includes('178 league tables') && defSnap.note.includes('4,092 team seasons') && defSnap.note.includes('official standings'));
    assert.ok(defSnap.ledger.includes('negative in 113 of 178 tables and positive in 65'));
    assert.ok(defSnap.ledger.includes('65.8% of points-per-game variation to scoring') && defSnap.ledger.includes('61.0% to conceding'));
    assert.ok(defSnap.ledger.includes('middle half roughly 1.94 to 2.17') && !/\bmost\b|\bmajority\b/i.test(defSnap.ledger));
    assert.ok(defSnap.ledger.includes('168 tables with relegation; 10 without it'));
    assert.ok(defSnap.ledger.includes('minority (12 of 34)') && defSnap.ledger.includes('42 Golden Boot') && !/rarely|needed/i.test(defSnap.ledger));
    // Verify plain-English prose & Key Findings bullets across the full page (no statistical shorthand leaks)
    const fullPageText = await cdp.evalJs(`() => document.body.innerText`);
    const takeawaysSnap = await cdp.evalJs(`() => ({
      count: document.querySelectorAll('#takeaways-list li').length,
      text: document.getElementById('key-takeaways').innerText,
    })`);
    assert.equal(takeawaysSnap.count, 6);
    assert.ok(takeawaysSnap.text.includes('Bromley') && takeawaysSnap.text.includes('112 four-team EFL play-offs') && takeawaysSnap.text.includes('Sheffield Wednesday'));
    // Verify #sec3-playoff-panel renders grouped SVG bars, 4-row seed table, and zero jargon
    const poSnap = await cdp.evalJs(`() => ({
      panelText: document.getElementById('sec3-playoff-panel').innerText,
      barCount: document.querySelectorAll('#chart-sec3-playoffs svg rect[data-tip-id]').length,
      rowCount: document.querySelectorAll('#sec3-playoff-seed-tbody tr').length,
      tableHidden: document.getElementById('sec3-playoff-table-wrap').hidden,
    })`);
    assert.equal(poSnap.tableHidden, false);
    assert.equal(poSnap.barCount, 16, '4 seeds x 4 series (All EFL + Tiers 2, 3, 4) = 16 bars');
    assert.equal(poSnap.rowCount, 4, 'All EFL Combined + Championship + League One + League Two');
    assert.ok(poSnap.panelText.includes('35.7%') && poSnap.panelText.includes('24.1%') && poSnap.panelText.includes('19.6%') && poSnap.panelText.includes('20.5%'));
    assert.ok(poSnap.panelText.includes('40.5%') && poSnap.panelText.includes('34.2%') && poSnap.panelText.includes('32.4%'));
    assert.ok(poSnap.panelText.includes('1989–90') && poSnap.panelText.includes('2025–26') && poSnap.panelText.includes('transitional 1986–88'));

    const pageJargonRe = /within-slot|\|r\||R²\(PPG\)|\bIQR\b|% Pct|\b38g\b|\b46g\b|\bexcl\.|\bslots\b|\bGA\/G\b|\bGF\/G\b|\bGD\/G\b|\bW\/G\b|\bPPG\b|Tier-Seasons|Team-Seasons/i;
    const mPageJargon = pageJargonRe.exec(fullPageText);
    assert.equal(mPageJargon, null, `Full page must avoid shorthand jargon (found "${mPageJargon?.[0]}")`);

    // 2. PL preset (play-off breakdown hides table cleanly and shows clean prompt)
    await cdp.evalJs(`() => document.querySelector('[data-preset="pl-1992-2026"]').click()`);
    const plSnap = await checkLedger('pl-1992-2026');
    assert.ok(plSnap.ledger.includes('34 league tables') && plSnap.ledger.includes('77.2% of points-per-game variation'));
    const plPoSnap = await cdp.evalJs(`() => ({
      tableHidden: document.getElementById('sec3-playoff-table-wrap').hidden,
      barCount: document.querySelectorAll('#chart-sec3-playoffs svg rect').length,
      prose: document.getElementById('sec3-playoff-prose').innerText,
    })`);
    assert.equal(plPoSnap.tableHidden, true);
    assert.equal(plPoSnap.barCount, 0);
    assert.ok(plPoSnap.prose.includes('Select Tiers 2, 3, or 4 from 1988–89 onward'));

    // 3. Tier 1 2011-2013 near-tie reproduction
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '1';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      eSel.value = '2013'; eSel.dispatchEvent(new Event('change'));
      sSel.value = '2011'; sSel.dispatchEvent(new Event('change'));
    }`);
    const nearSnap = await checkLedger('tier1-2011-2013');
    assert.ok(nearSnap.ledger.includes('0.852 vs 0.851') && nearSnap.ledger.includes('nearly equal on rank'));
    assert.ok(nearSnap.ledger.includes('81.5% of points-per-game variation to scoring') && nearSnap.ledger.includes('65.4% to conceding'));

    // 4. Tier 2 2021 raw mode (Reading 41 official vs 47 raw)
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelector('[data-points-mode="raw"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '2';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      eSel.value = '2021'; eSel.dispatchEvent(new Event('change'));
      sSel.value = '2021'; sSel.dispatchEvent(new Event('change'));
    }`);
    const raw21Snap = await checkLedger('tier2-2021-raw');
    assert.ok(raw21Snap.note.includes('Cards 01–02: raw 3W+D points; Cards 03–06: official standings'));
    assert.ok(raw21Snap.ledger.includes('Reading stayed up on 41 official points') && raw21Snap.ledger.includes('47 raw points'));

    // 5. Tier 4 1981-1985 re-election zero-relegation scope
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '4';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      sSel.value = '1981'; sSel.dispatchEvent(new Event('change'));
      eSel.value = '1985'; eSel.dispatchEvent(new Event('change'));
    }`);
    const zeroRelSnap = await checkLedger('tier4-1981-85');
    assert.ok(zeroRelSnap.ledger.includes('5 tables without relegation (0 with relegation)'));
    assert.ok(zeroRelSnap.ledger.includes('automatic relegation was not in place'));
    const sec3ZeroRel = await cdp.evalJs(`() => document.getElementById('sec-survival').innerText`);
    assert.ok(sec3ZeroRel.includes('Automatic relegation was not in place') && !/suspended/i.test(sec3ZeroRel), 'Section 3 must not describe Fourth Division re-election seasons as suspended');

    // 6. Curtailed-only 2019-20 Tier 3-4 excluded by default -> empty state, then opt-in
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '3' || cb.value === '4';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      eSel.value = '2019'; eSel.dispatchEvent(new Event('change'));
      sSel.value = '2019'; sSel.dispatchEvent(new Event('change'));
    }`);
    const curtExclSnap = await checkLedger('curtailed-only-excluded');
    assert.equal(curtExclSnap.emptyHidden, false);
    assert.ok(curtExclSnap.emptyMsg.includes('curtailed and excluded by default'));
    await cdp.evalJs(`() => document.getElementById('scope-include-curtailed').click()`);
    const curtInclSnap = await checkLedger('curtailed-only-included');
    assert.equal(curtInclSnap.emptyHidden, true);
    assert.ok(curtInclSnap.note.includes('2 league tables'));

    // 7. Single-table 2022-23 T2 Raw mode
    await cdp.evalJs(`() => {
      document.querySelector('[data-preset="all-4-tiers"]').click();
      document.querySelector('[data-points-mode="raw"]').click();
      document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
        const want = cb.value === '2';
        if (cb.checked !== want) cb.click();
      });
      const sSel = document.getElementById('scope-start-year');
      const eSel = document.getElementById('scope-end-year');
      eSel.value = '2022'; eSel.dispatchEvent(new Event('change'));
      sSel.value = '2022'; sSel.dispatchEvent(new Event('change'));
    }`);
    const singleSnap = await checkLedger('single-t2-raw');
    assert.ok(singleSnap.note.includes('1 league table · 24 team seasons'));
    assert.equal(cdp.pageErrors.length, 0);
  } finally {
    await cdp.close();
    server.close();
  }
});

test('Voice mode switcher: Normal Person Mode vs Statistics Sicko Mode with cartoon asset & responsive layout', { timeout: 35000 }, async () => {
  const { server, baseUrl } = await startStaticServer();
  const cdp = await launchCdpSession();
  const pageJargonRe = /within-slot|\|r\||R²\(PPG\)|\bIQR\b|% Pct|\b38g\b|\b46g\b|\bexcl\.|\bslots\b|\bGA\/G\b|\bGF\/G\b|\bGD\/G\b|\bW\/G\b|\bPPG\b|Tier-Seasons|Team-Seasons/i;
  const badTokenRe = /\[object\b|\bundefined\b|\bNaN\b|\bInfinity\b/;
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigateAndWait(`${baseUrl}/`);

    // Default state: Normal Person Mode active, cartoon hidden, zero jargon
    const init = await cdp.evalJs(`() => ({
      normalPressed: document.querySelector('[data-voice-mode="normal"]').getAttribute('aria-pressed'),
      sickoPressed: document.querySelector('[data-voice-mode="sicko"]').getAttribute('aria-pressed'),
      sickoCardHidden: document.getElementById('sicko-hero-card').hidden,
      bodyText: document.body.innerText,
    })`);
    assert.equal(init.normalPressed, 'true');
    assert.equal(init.sickoPressed, 'false');
    assert.equal(init.sickoCardHidden, true);
    assert.equal(pageJargonRe.exec(init.bodyText), null, 'Normal Person Mode must stay jargon-free');

    // Toggle into Statistics Sicko Mode
    await cdp.evalJs(`() => document.querySelector('[data-voice-mode="sicko"]').click()`);
    await new Promise((r) => setTimeout(r, 250));
    const sickoSnap = await cdp.evalJs(`() => {
      const img = document.querySelector('#sicko-hero-card img');
      return {
        hasBodyClass: document.body.classList.contains('voice-sicko'),
        normalPressed: document.querySelector('[data-voice-mode="normal"]').getAttribute('aria-pressed'),
        sickoPressed: document.querySelector('[data-voice-mode="sicko"]').getAttribute('aria-pressed'),
        sickoCardHidden: document.getElementById('sicko-hero-card').hidden,
        imgComplete: Boolean(img?.complete),
        imgNaturalWidth: img?.naturalWidth || 0,
        title: document.getElementById('masthead-title').textContent,
        poTbodyH: document.querySelector('#sec3-playoff-seed-tbody')?.getBoundingClientRect().height || 0,
        bodyText: document.body.innerText,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      };
    }`);
    assert.equal(sickoSnap.hasBodyClass, true);
    assert.equal(sickoSnap.normalPressed, 'false');
    assert.equal(sickoSnap.sickoPressed, 'true');
    assert.equal(sickoSnap.sickoCardHidden, false);
    assert.equal(sickoSnap.imgComplete, true);
    assert.ok(sickoSnap.imgNaturalWidth > 200, 'Stats Sicko cartoon image must load cleanly');
    assert.ok(sickoSnap.poTbodyH > 100, `Play-off seed table tbody must render full height in Sicko mode (got ${sickoSnap.poTbodyH})`);
    assert.ok(sickoSnap.title.includes('Within-Slot Pearsonian'));
    assert.equal(badTokenRe.exec(sickoSnap.bodyText), null, 'Sicko mode must have zero NaN/undefined/Infinity/[object tokens');
    for (const token of ['Within-Slot', 'R²(PPG)', 'IQR', 'GA/G', 'GF/G', 'χ²', 'argmax(W)', 'OLS', 'PPG']) {
      assert.ok(sickoSnap.bodyText.includes(token), `Sicko mode should surface quant jargon token "${token}"`);
    }
    assert.ok(sickoSnap.scrollW <= sickoSnap.clientW, 'Sicko desktop layout must not overflow horizontally');

    // Check Sicko mode across PL preset & 320px narrow mobile viewport
    await cdp.evalJs(`() => document.querySelector('[data-preset="pl-1992-2026"]').click()`);
    await new Promise((r) => setTimeout(r, 150));
    const sickoPl = await cdp.evalJs(`() => document.body.innerText`);
    assert.equal(badTokenRe.exec(sickoPl), null, 'Sicko mode on PL preset must have zero bad tokens');

    await cdp.evalJs(`() => document.querySelector('[data-preset="all-4-tiers"]').click()`);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 780, deviceScaleFactor: 2, mobile: true });
    await new Promise((r) => setTimeout(r, 160));
    const sicko320 = await cdp.evalJs(`() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    })`);
    assert.ok(sicko320.scrollW <= sicko320.clientW, `Sicko mode 320px overflow: ${sicko320.scrollW} > ${sicko320.clientW}`);

    // Toggle back to Normal Person Mode and confirm pristine restoration
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.evalJs(`() => document.querySelector('[data-voice-mode="normal"]').click()`);
    await new Promise((r) => setTimeout(r, 150));
    const backNormal = await cdp.evalJs(`() => ({
      hasBodyClass: document.body.classList.contains('voice-sicko'),
      sickoCardHidden: document.getElementById('sicko-hero-card').hidden,
      title: document.getElementById('masthead-title').textContent,
      bodyText: document.body.innerText,
    })`);
    assert.equal(backNormal.hasBodyClass, false);
    assert.equal(backNormal.sickoCardHidden, true);
    assert.equal(backNormal.title, 'The Championship Formula');
    assert.equal(pageJargonRe.exec(backNormal.bodyText), null, 'Returning to Normal Person Mode must restore jargon-free prose');
    assert.equal(cdp.pageErrors.length, 0);
  } finally {
    await cdp.close();
    server.close();
  }
});
