import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATASET_PATH = path.join(ROOT, 'data', 'england-tiers-1-4-1981-2025.json');
const BUNDLE_PATH = path.join(ROOT, 'data', 'england-tiers-1-4-1981-2025-bundle.js');
const MANIFEST_PATH = path.join(ROOT, 'data', 'coverage-manifest.json');
const PL_OLD_PATH = path.join(ROOT, 'data', 'premier-league-1992-2025.json');

const rawJson = fs.readFileSync(DATASET_PATH, 'utf8');
const dataset = JSON.parse(rawJson);
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

test('Schema 2.0.0 metadata, slot totals, and exclusion of post-2024-25 seasons', () => {
  assert.equal(dataset.schemaVersion, '2.0.0');
  assert.equal(dataset.tierSeasons.length, 176);
  assert.equal(manifest.slots.length, 176);
  assert.equal(dataset.metadata.startYear, 1981);
  assert.equal(dataset.metadata.endYear, 2024);
  assert.equal(dataset.metadata.totalTierSeasonSlots, 176);
  assert.equal(dataset.metadata.completedSlots, 174);
  assert.equal(dataset.metadata.curtailedSlots, 2);
  assert.equal(dataset.metadata.totalTeamSeasons, 4047);
  assert.equal(dataset.metadata.totalMatchesPlayed, 89234);
  assert.equal(dataset.metadata.totalGoalsScored, 233356);

  const forbidden = dataset.tierSeasons.filter((s) => s.startYear >= 2025 || s.startYear < 1981);
  assert.equal(forbidden.length, 0);
  assert.equal(JSON.stringify(dataset.metadata).toLowerCase().includes('latest completed season'), false);
});

test('Bundle JS file matches canonical dataset SHA-256 identity for offline file:// loading', () => {
  const bundleSrc = fs.readFileSync(BUNDLE_PATH, 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(bundleSrc, ctx);
  assert.ok(ctx.window.__CHAMPIONSHIP_DATASET__, 'Bundle must attach window.__CHAMPIONSHIP_DATASET__');

  const bundleSerialized = JSON.stringify(ctx.window.__CHAMPIONSHIP_DATASET__, null, 2) + '\n';
  assert.equal(bundleSerialized, rawJson, 'Bundled dataset must serialize byte-identically to canonical JSON');

  const shaWithoutField = (obj) => {
    const c = structuredClone(obj);
    delete c.metadata.canonicalJsonSha256;
    return crypto.createHash('sha256').update(JSON.stringify(c, null, 2) + '\n', 'utf8').digest('hex');
  };
  assert.equal(shaWithoutField(ctx.window.__CHAMPIONSHIP_DATASET__), dataset.metadata.canonicalJsonSha256);
  assert.equal(shaWithoutField(dataset), dataset.metadata.canonicalJsonSha256);
  const fullJsonSha = crypto.createHash('sha256').update(rawJson, 'utf8').digest('hex');
  assert.equal(manifest.canonicalJsonSha256, fullJsonSha);
  assert.ok(bundleSrc.includes(`canonicalSha256: ${fullJsonSha}`));
});

test('Historical division names respect era boundaries by tier', () => {
  const get = (id) => dataset.tierSeasons.find((s) => s.slotId === id);
  assert.equal(get('1981-82-T1').historicalDivisionName, 'Football League First Division');
  assert.equal(get('1991-92-T1').historicalDivisionName, 'Football League First Division');
  assert.equal(get('1992-93-T1').historicalDivisionName, 'Premier League');
  assert.equal(get('1992-93-T2').historicalDivisionName, 'Football League First Division');
  assert.equal(get('2003-04-T2').historicalDivisionName, 'Football League First Division');
  assert.equal(get('2004-05-T2').historicalDivisionName, 'Football League Championship');
  assert.equal(get('2015-16-T4').historicalDivisionName, 'Football League Two');
  assert.equal(get('2016-17-T2').historicalDivisionName, 'EFL Championship');
  assert.equal(get('2024-25-T3').historicalDivisionName, 'EFL League One');
  assert.equal(get('2024-25-T4').historicalDivisionName, 'EFL League Two');
});

test('Mathematical conservation laws hold on all 176 slots and 4,047 team rows', () => {
  let totalRows = 0;
  let totalMatches = 0;
  let totalGoals = 0;

  for (const s of dataset.tierSeasons) {
    assert.equal(s.table.length, s.participantCount, `${s.slotId} participant count mismatch`);
    let sumW = 0;
    let sumL = 0;
    let sumP = 0;
    let sumGf = 0;
    let sumGa = 0;

    s.table.forEach((r, idx) => {
      assert.equal(r.pos, idx + 1, `${s.slotId} position continuity`);
      assert.equal(r.played, r.won + r.drawn + r.lost, `${s.slotId} ${r.team} W+D+L`);
      assert.equal(r.gd, r.gf - r.ga, `${s.slotId} ${r.team} GD`);
      assert.equal(r.rawPoints, 3 * r.won + r.drawn, `${s.slotId} ${r.team} rawPoints`);
      assert.equal(r.points, r.rawPoints + r.signedAdjustment, `${s.slotId} ${r.team} official points`);
      sumW += r.won;
      sumL += r.lost;
      sumP += r.played;
      sumGf += r.gf;
      sumGa += r.ga;
    });

    assert.equal(sumW, sumL, `${s.slotId} total W must equal total L`);
    assert.equal(sumGf, sumGa, `${s.slotId} total GF must equal total GA`);
    assert.equal(sumP, 2 * s.matchCount, `${s.slotId} sum(P) = 2 * matches`);
    assert.equal(sumGf, s.totalGoals, `${s.slotId} sum(GF) = totalGoals`);

    // Verify tie-break order respects historical rule (1992-99 T2-T4 GF before GD)
    const gfFirst = s.tieBreakRules[1] === 'gf';
    const isCurtailed = s.status === 'curtailed';
    for (let i = 0; i + 1 < s.table.length; i++) {
      const a = s.table[i];
      const b = s.table[i + 1];
      if (isCurtailed) {
        assert.ok(a.points / a.played >= b.points / b.played - 1e-12, `${s.slotId} curtailed PPG sort`);
      } else if (a.points === b.points) {
        if (gfFirst) assert.ok(a.gf >= b.gf, `${s.slotId} GF-first tie-break violated`);
        else assert.ok(a.gd >= b.gd, `${s.slotId} GD-first tie-break violated`);
      } else {
        assert.ok(a.points > b.points, `${s.slotId} points descending`);
      }
    }

    totalRows += s.table.length;
    totalMatches += s.matchCount;
    totalGoals += s.totalGoals;
  }

  assert.equal(totalRows, 4047);
  assert.equal(totalMatches, 89234);
  assert.equal(totalGoals, 233356);
});

test('Premier League 1992-93..2024-25 cell-level parity with verified PL dataset', () => {
  const plOld = JSON.parse(fs.readFileSync(PL_OLD_PATH, 'utf8'));
  const plNew = dataset.tierSeasons.filter((s) => s.tier === 1 && s.startYear >= 1992 && s.startYear <= 2024);
  assert.equal(plNew.length, 33);
  assert.equal(plNew.reduce((a, s) => a + s.table.length, 0), 666);
  assert.equal(plNew.reduce((a, s) => a + s.matchCount, 0), 12786);
  assert.equal(plNew.reduce((a, s) => a + s.totalGoals, 0), 34433);

  for (const os of plOld.seasons) {
    const ns = plNew.find((x) => x.season === os.season);
    assert.ok(ns, `Missing PL season ${os.season}`);
    assert.equal(ns.table.length, os.table.length);
    for (let i = 0; i < os.table.length; i++) {
      const a = os.table[i];
      const b = ns.table[i];
      for (const k of ['pos', 'played', 'won', 'drawn', 'lost', 'gf', 'ga', 'points', 'pointsDeducted', 'relegated', 'hasGoldenBootWinner']) {
        assert.equal(b[k], a[k], `${os.season} ${a.team} ${k}`);
      }
      assert.equal(b.topScorer?.goals ?? null, a.topScorer?.goals ?? null);
    }
  }
});

test('Spot checks: historical anomalies, deductions, tie-breaks, and 2024-25 play-offs', () => {
  const get = (id) => dataset.tierSeasons.find((s) => s.slotId === id);

  // 1981-82 T3 Burnley 21W champion ahead of Carlisle 23W
  const s81t3 = get('1981-82-T3');
  assert.equal(s81t3.table[0].team, 'Burnley');
  assert.equal(s81t3.table[0].won, 21);
  assert.equal(s81t3.table[0].points, 80);
  assert.equal(s81t3.table[1].team, 'Carlisle United');
  assert.equal(s81t3.table[1].won, 23);
  assert.equal(s81t3.table[1].points, 80);

  // 1998-99 T2 GF-before-GD tie-break saved Port Vale over Bury
  const s98t2 = get('1998-99-T2');
  const pv = s98t2.table.find((r) => r.team === 'Port Vale');
  const bury98 = s98t2.table.find((r) => r.team === 'Bury');
  assert.equal(pv.pos, 21);
  assert.equal(pv.relegated, false);
  assert.equal(bury98.pos, 22);
  assert.equal(bury98.relegated, true);

  // 2018-19 T4 Bury 2nd promoted on table before August 2019 expulsion (never marked relegated!)
  const s18t4 = get('2018-19-T4');
  const bury18 = s18t4.table.find((r) => r.team === 'Bury');
  assert.equal(bury18.pos, 2);
  assert.equal(bury18.promoted, true);
  assert.equal(bury18.relegated, false);
  assert.equal(s18t4.survivalLinePos, 22);

  // 2019-20 T3/T4 curtailed
  const s19t3 = get('2019-20-T3');
  assert.equal(s19t3.status, 'curtailed');
  assert.equal(s19t3.participantCount, 23);
  assert.equal(s19t3.table.find((r) => r.team === 'Wycombe Wanderers').promotionMethod, 'playoff');
  assert.equal(s19t3.table.find((r) => r.team === 'Bolton Wanderers').signedAdjustment, -12);

  const s19t4 = get('2019-20-T4');
  assert.equal(s19t4.status, 'curtailed');
  assert.equal(s19t4.table.find((r) => r.team === 'Macclesfield Town').signedAdjustment, -17);
  assert.equal(s19t4.table.find((r) => r.team === 'Stevenage').relegated, false);
  assert.equal(s19t4.table.find((r) => r.team === 'Northampton Town').promotionMethod, 'playoff');

  // Reconciled RSSSF deduction omissions
  assert.equal(get('2009-10-T3').table.find((r) => r.team === 'Hartlepool United').signedAdjustment, -3);
  assert.equal(get('2022-23-T2').table.find((r) => r.team === 'Wigan Athletic').signedAdjustment, -6);
  assert.equal(get('2023-24-T4').table.find((r) => r.team === 'Morecambe').signedAdjustment, -3);

  // 2024-25 play-offs & champions
  assert.equal(get('2024-25-T1').table[0].team, 'Liverpool');
  assert.equal(get('2024-25-T2').table.find((r) => r.promotionMethod === 'playoff').team, 'Sunderland');
  assert.equal(get('2024-25-T3').table.find((r) => r.promotionMethod === 'playoff').team, 'Charlton Athletic');
  assert.equal(get('2024-25-T4').table.find((r) => r.promotionMethod === 'playoff').team, 'AFC Wimbledon');
});
