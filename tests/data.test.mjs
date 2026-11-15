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

// D1, D2, D3: Sourced independent relegation fixture across all 44 seasons (Tiers 1-4)
// Derived from RSSSF engpaul/FLA (1981-2007), RSSSF tablese (2008-2024), & Wikipedia/EFL rulings — NOT from importer inference flags.
const INDEPENDENT_EXPECTED_RELEGATIONS = {
  1981: [3, 3, 4, 0], // T4 re-election (RSSSF 1981-82.html)
  1982: [3, 3, 4, 0], // T4 re-election (RSSSF 1982-83.html)
  1983: [3, 3, 4, 0], // T4 re-election (RSSSF 1983-84.html)
  1984: [3, 3, 4, 0], // T4 re-election (RSSSF 1984-85.html)
  1985: [3, 3, 4, 0], // T4 re-election (RSSSF 1985-86.html)
  1986: [3, 3, 4, 1], // T4: Lincoln City 24th relegated (RSSSF 1986-87.html)
  1987: [4, 3, 4, 1], // T1: 18th Chelsea lost PO + 19th-21st; T4: Newport County 24th (RSSSF 1987-88.html)
  1988: [3, 3, 4, 1], // T4: Darlington 24th (RSSSF 1988-89.html)
  1989: [3, 3, 4, 1], // T4: Colchester United 24th (RSSSF 1989-90.html)
  1990: [2, 2, 3, 0], // D2: Restructuring; T4 0 relegated — 23rd Aldershot stayed up before 1991-92 withdrawal (RSSSF 1990-91.html)
  1991: [3, 3, 4, 0], // T4: 0 relegated — Aldershot expunged March 1992, 18th Maidstone resigned August 1992 (RSSSF 1991-92.html)
  1992: [3, 3, 4, 1], // T4: Halifax Town 22nd (RSSSF 1992-93.html)
  1993: [3, 3, 4, 0], // T4: 22nd Northampton reprieved, Kidderminster stadium grading (RSSSF 1993-94.html)
  1994: [4, 4, 5, 0], // PL 22->20 contraction; T4: 22nd Exeter reprieved, Macclesfield stadium grading (RSSSF 1994-95.html)
  1995: [3, 3, 4, 0], // T4: 24th Torquay reprieved, Stevenage stadium grading (RSSSF 1995-96.html)
  1996: [3, 3, 4, 1], // T4: Hereford United 24th (RSSSF 1996-97.html)
  1997: [3, 3, 4, 1], // T4: Doncaster Rovers 24th (RSSSF 1997-98.html)
  1998: [3, 3, 4, 1], // T4: Scarborough 24th (RSSSF 1998-99.html)
  1999: [3, 3, 4, 1], // T4: Chester City 24th (RSSSF 1999-00.html)
  2000: [3, 3, 4, 1], // T4: Barnet 24th (RSSSF 2000-01.html)
  2001: [3, 3, 4, 1], // T4: Halifax Town 24th (RSSSF 2001-02.html)
  2002: [3, 3, 4, 2], // Two-down starts; T4: Exeter City & Shrewsbury Town (RSSSF 2002-03.html)
  2003: [3, 3, 4, 2], // D1: T2 Walsall 22nd, Bradford 23rd, Wimbledon 24th; T4 Carlisle & York (RSSSF 2003-04.html & Wikipedia)
  2004: [3, 3, 4, 2], // T4: Kidderminster & Cambridge (RSSSF 2004-05.html)
  2005: [3, 3, 4, 2], // T4: Oxford United & Rushden & Diamonds (RSSSF 2005-06.html)
  2006: [3, 3, 4, 2], // T4: Boston United (-10 admin to Conf North) & Torquay United (Wikipedia/EFL)
  2007: [3, 3, 4, 2], // T4: Mansfield & Wrexham (RSSSF 2007-08.html)
  2008: [3, 3, 4, 2], // T4: Chester City & Luton Town (RSSSF eng09.html)
  2009: [3, 3, 4, 2], // T4: Grimsby Town & Darlington (RSSSF eng2010.html)
  2010: [3, 3, 4, 2], // T4: Lincoln City & Stockport County (RSSSF eng2011.html)
  2011: [3, 3, 4, 2], // T4: Hereford United & Macclesfield Town (RSSSF eng2012.html)
  2012: [3, 3, 4, 2], // T4: Barnet & Aldershot Town (RSSSF eng2013.html)
  2013: [3, 3, 4, 2], // T4: Bristol Rovers & Torquay United (RSSSF eng2014.html)
  2014: [3, 3, 4, 2], // T4: Cheltenham Town & Tranmere Rovers (RSSSF eng2015.html)
  2015: [3, 3, 4, 2], // T4: Dagenham & Redbridge & York City (RSSSF eng2016.html)
  2016: [3, 3, 4, 2], // T4: Hartlepool United & Leyton Orient (RSSSF eng2017.html)
  2017: [3, 3, 4, 2], // T4: Barnet & Chesterfield (RSSSF eng2018.html)
  2018: [3, 3, 4, 2], // T4: Notts County & Yeovil Town; Bury 2nd promoted before Aug 2019 expulsion (RSSSF eng2019.html & EFL)
  2019: [3, 3, 3, 1], // COVID curtailed L1/L2: T3 Tranmere/Southend/Bolton; T4 bottom Macclesfield -17, Stevenage reprieved (RSSSF eng2020.html & EFL)
  2020: [3, 3, 4, 2], // T4: Southend United & Grimsby Town (RSSSF eng2021.html)
  2021: [3, 3, 4, 2], // T4: Oldham Athletic & Scunthorpe United (RSSSF eng2022.html)
  2022: [3, 3, 4, 2], // T2: Reading, Blackpool, Wigan (-6); T4: Hartlepool & Rochdale (EFL/Wikipedia)
  2023: [3, 3, 4, 2], // T4: Sutton United & Forest Green Rovers (RSSSF eng2024.html)
  2024: [3, 3, 4, 2], // T4: Carlisle United & Morecambe (RSSSF eng2025.html)
};

// Sourced Tier 4 exit & non-exit fixture covering every non-standard exit/reprieve plus re-election/modern rules
const EXPECTED_T4_EXIT_SOURCES = [
  { slotId: '1981-82-T4', relCount: 0, nonRelegatingReason: 're-election era' },
  { slotId: '1982-83-T4', relCount: 0, nonRelegatingReason: 're-election era' },
  { slotId: '1983-84-T4', relCount: 0, nonRelegatingReason: 're-election era' },
  { slotId: '1984-85-T4', relCount: 0, nonRelegatingReason: 're-election era' },
  { slotId: '1985-86-T4', relCount: 0, nonRelegatingReason: 're-election era' },
  { slotId: '1986-87-T4', relCount: 1, relegatedTeams: ['Lincoln City'] },
  { slotId: '1990-91-T4', relCount: 0, nonRelegatingReason: 'restructuring; Aldershot remained for 1991-92 before folding' },
  { slotId: '1991-92-T4', relCount: 0, nonRelegatingReason: 'Aldershot expunged; Maidstone resigned August 1992' },
  { slotId: '1992-93-T4', relCount: 1, relegatedTeams: ['Halifax Town'] },
  { slotId: '1993-94-T4', relCount: 0, nonRelegatingReason: 'Northampton reprieved; Kidderminster ground-grading' },
  { slotId: '1994-95-T4', relCount: 0, nonRelegatingReason: 'Exeter reprieved; Macclesfield ground-grading' },
  { slotId: '1995-96-T4', relCount: 0, nonRelegatingReason: 'Torquay reprieved; Stevenage ground-grading' },
  { slotId: '2006-07-T4', relCount: 2, relegatedTeams: ['Boston United', 'Torquay United'] },
  { slotId: '2018-19-T4', relCount: 2, relegatedTeams: ['Notts County', 'Yeovil Town'], promotedNonRel: 'Bury' },
  { slotId: '2019-20-T4', relCount: 1, relegatedTeams: ['Macclesfield Town'], safeAtBottom: 'Stevenage' },
  { slotId: '2024-25-T4', relCount: 2, relegatedTeams: ['Carlisle United', 'Morecambe'] },
];

// Genuine source-verified boundary mismatches between rel(T_k) and prom(T_{k+1}) across 132 boundaries
const DOCUMENTED_BOUNDARY_EXCEPTIONS = new Map([
  ['1986-87|T1/T2', 'T1 shrank 22->21: 19th T1 Charlton won transitional play-off vs T2 4th Leeds United (rel=3 vs prom=2)'],
  ['1987-88|T1/T2', 'T1 shrank 21->20: 18th T1 Chelsea lost transitional play-off vs T2 3rd Middlesbrough (rel=4 vs prom=3)'],
  ['1990-91|T1/T2', 'T1 expanded 20->22 ahead of 1991-92 (rel=2 vs prom=4)'],
  ['1990-91|T2/T3', 'Restructuring to hold T2 at 24 clubs while feeding T1 expansion (rel=2 vs prom=4)'],
  ['1990-91|T3/T4', 'Fourth Division promoted 5 clubs to hold T3 at 24 during expansion restructuring (rel=3 vs prom=5)'],
  ['1994-95|T1/T2', 'Premier League contracted 22->20 ahead of 1995-96 (rel=4 vs prom=2)'],
  ['1994-95|T2/T3', 'Knock-on contraction across Football League First/Second Division boundary (rel=4 vs prom=2)'],
  ['1994-95|T3/T4', 'Knock-on contraction across Football League Second/Third Division boundary (rel=5 vs prom=3)'],
  ['2019-20|T3/T4', 'Bury expelled from League One prior to 2019-20 fixtures, so 4 promoted from League Two to restore 24 clubs (rel=3 vs prom=4)'],
]);

test('D1-D3: Boundary conservation, per-slot relegation counts, and sourced T4 exit fixtures hold', () => {
  const bySlot = new Map(dataset.tierSeasons.map((s) => [s.slotId, s]));

  // 1. Assert each slot's relegationSlots equals its relegated rows & matches independent fixture across all 176 slots
  for (let sy = 1981; sy <= 2024; sy++) {
    const season = `${sy}-${String((sy + 1) % 100).padStart(2, '0')}`;
    const expectedVec = INDEPENDENT_EXPECTED_RELEGATIONS[sy];
    assert.ok(expectedVec, `Missing independent fixture for ${season}`);
    for (let tier = 1; tier <= 4; tier++) {
      const slotId = `${season}-T${tier}`;
      const s = bySlot.get(slotId);
      assert.ok(s, `Missing slot ${slotId}`);
      const relRows = s.table.filter((r) => r.relegated);
      assert.equal(s.relegationSlots, relRows.length, `${slotId} relegationSlots must equal count of relegated rows`);
      assert.equal(relRows.length, expectedVec[tier - 1], `${slotId} relegated count (${relRows.length}) mismatch vs independent source (${expectedVec[tier - 1]})`);
      const mSlot = manifest.slots.find((ms) => ms.slotId === slotId);
      assert.equal(mSlot.relegatedTeams.length, s.relegationSlots, `${slotId} manifest relegatedTeams count mismatch`);
      if (relRows.length === 0) {
        assert.equal(s.relegationLinePos, null, `${slotId} 0-relegation slot must have null relegationLinePos`);
        assert.equal(s.survivalLinePos, null, `${slotId} 0-relegation slot must have null survivalLinePos`);
      } else {
        assert.equal(s.relegationLinePos, Math.min(...relRows.map((r) => r.pos)), `${slotId} relegationLinePos`);
      }
    }

    // 2. Boundary conservation check: rel(T_k) == prom(T_{k+1}) unless in documented source exception list
    for (let t = 1; t <= 3; t++) {
      const up = bySlot.get(`${season}-T${t}`);
      const dn = bySlot.get(`${season}-T${t + 1}`);
      const relUp = up.table.filter((r) => r.relegated).length;
      const promDn = dn.table.filter((r) => r.promoted).length;
      const bKey = `${season}|T${t}/T${t + 1}`;
      if (relUp !== promDn) {
        assert.ok(DOCUMENTED_BOUNDARY_EXCEPTIONS.has(bKey), `Undocumented boundary mismatch at ${bKey}: relUp=${relUp}, promDn=${promDn}`);
      } else {
        assert.equal(DOCUMENTED_BOUNDARY_EXCEPTIONS.has(bKey), false, `Stale boundary exception ${bKey}`);
      }
    }
  }

  // 3. Specific sourced D1, D2 & Tier 4 exit spot checks + distinct Wimbledon / MK Dons / AFC Wimbledon identities
  const wimSlot = bySlot.get('2003-04-T2');
  const wim = wimSlot.table.find((r) => r.team === 'Wimbledon');
  assert.equal(wim.pos, 24);
  assert.equal(wim.relegated, true, 'D1: 2003-04 T2 Wimbledon (24th) must have relegated=true');
  assert.equal(wimSlot.relegationSlots, 3);
  assert.equal(wimSlot.relegationLinePos, 22);
  assert.equal(wimSlot.survivalLinePos, 21);
  const wimManifest = manifest.slots.find((ms) => ms.slotId === '2003-04-T2');
  assert.equal(wimManifest.relegationSlots, 3);
  assert.equal(wimManifest.relegationLinePos, 22);
  assert.equal(wimManifest.survivalLinePos, 21);

  const aldSlot = bySlot.get('1990-91-T4');
  assert.equal(aldSlot.relegationSlots, 0, 'D2: 1990-91 T4 must have relegationSlots=0');
  assert.equal(aldSlot.relegationLinePos, null);
  assert.equal(aldSlot.survivalLinePos, null);
  assert.equal(aldSlot.table.every((r) => r.relegated === false), true, 'D2: every row in 1990-91 T4 must have relegated=false');

  for (const fx of EXPECTED_T4_EXIT_SOURCES) {
    const s = bySlot.get(fx.slotId);
    assert.equal(s.relegationSlots, fx.relCount, `T4 fixture ${fx.slotId}`);
    if (fx.relegatedTeams) {
      assert.deepEqual(s.table.filter((r) => r.relegated).map((r) => r.team), fx.relegatedTeams);
    }
    if (fx.promotedNonRel) {
      const pr = s.table.find((r) => r.team === fx.promotedNonRel);
      assert.equal(pr.promoted, true);
      assert.equal(pr.relegated, false);
    }
    if (fx.safeAtBottom) {
      assert.equal(s.table.find((r) => r.team === fx.safeAtBottom).relegated, false);
    }
  }

  // Distinct club identities preserved for Wimbledon vs Milton Keynes Dons vs AFC Wimbledon
  const clubIds = new Set(manifest.clubs.map((c) => c.clubId));
  assert.ok(clubIds.has('wimbledon'));
  assert.ok(clubIds.has('milton-keynes-dons'));
  assert.ok(clubIds.has('afc-wimbledon'));
  assert.ok(clubIds.has('aldershot'));
  assert.ok(clubIds.has('aldershot-town'));
});
