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

// C1 & C2: Sourced independent relegation + promotion boundary fixture across all 44 seasons (Tiers 1-4).
// 1981-82..2006-07: verified by opening https://www.rsssf.org/engpaul/FLA/<yyyy>-<yy>.html (plus Wikipedia for 1995-96 FL/PL & 2006-07 L2).
// 2007-08..2024-25: full relegated club names across all 4 tiers verified by opening:
//   - 2007-08: https://www.rsssf.org/engpaul/FLA/2007-08.html
//   - 2008-09: https://www.rsssf.org/tablese/eng09.html
//   - 2009-10..2021-22, 2023-24..2024-25: https://www.rsssf.org/tablese/eng<YYYY>.html
//   - 2022-23: https://www.rsssf.org/tablese/eng2023.html (T1/T3/T4 + T2 Reading, Blackpool) & https://en.wikipedia.org/wiki/2022%E2%80%9323_EFL_Championship (T2 Wigan Athletic)
const INDEPENDENT_SEASON_OUTCOMES = {
  1981: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1981-82.html' },
  1982: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1982-83.html' },
  1983: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1983-84.html' },
  1984: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1984-85.html' },
  1985: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1985-86.html' },
  1986: { rel: [3, 3, 4, 1], prom: [2, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1986-87.html' },
  1987: { rel: [4, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1987-88.html' },
  1988: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1988-89.html' },
  1989: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1989-90.html' },
  1990: { rel: [2, 2, 3, 0], prom: [4, 4, 5], source: 'https://www.rsssf.org/engpaul/FLA/1990-91.html' },
  1991: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1991-92.html' },
  1992: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1992-93.html' },
  1993: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1993-94.html' },
  1994: { rel: [4, 4, 5, 0], prom: [2, 2, 3], source: 'https://www.rsssf.org/engpaul/FLA/1994-95.html' },
  1995: { rel: [3, 3, 4, 0], prom: [3, 3, 4], source: 'https://en.wikipedia.org/wiki/1995%E2%80%9396_FA_Premier_League & https://en.wikipedia.org/wiki/1995%E2%80%9396_Football_League' },
  1996: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1996-97.html' },
  1997: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1997-98.html' },
  1998: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1998-99.html' },
  1999: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/1999-00.html' },
  2000: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2000-01.html' },
  2001: { rel: [3, 3, 4, 1], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2001-02.html' },
  2002: { rel: [3, 3, 4, 2], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2002-03.html' },
  2003: { rel: [3, 3, 4, 2], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2003-04.html & https://en.wikipedia.org/wiki/2003%E2%80%9304_Football_League_First_Division' },
  2004: { rel: [3, 3, 4, 2], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2004-05.html' },
  2005: { rel: [3, 3, 4, 2], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2005-06.html' },
  2006: { rel: [3, 3, 4, 2], prom: [3, 3, 4], source: 'https://www.rsssf.org/engpaul/FLA/2006-07.html & https://en.wikipedia.org/wiki/2006%E2%80%9307_Football_League_Two' },
  2007: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/engpaul/FLA/2007-08.html',
    relegatedNames: {
      1: ['Reading', 'Birmingham City', 'Derby County'],
      2: ['Leicester City', 'Scunthorpe United', 'Colchester United'],
      3: ['AFC Bournemouth', 'Gillingham', 'Port Vale', 'Luton Town'],
      4: ['Mansfield Town', 'Wrexham'],
    },
  },
  2008: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng09.html',
    relegatedNames: {
      1: ['Newcastle United', 'Middlesbrough', 'West Bromwich Albion'],
      2: ['Norwich City', 'Southampton', 'Charlton Athletic'],
      3: ['Northampton Town', 'Crewe Alexandra', 'Cheltenham Town', 'Hereford United'],
      4: ['Chester City', 'Luton Town'],
    },
  },
  2009: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2010.html',
    relegatedNames: {
      1: ['Burnley', 'Hull City', 'Portsmouth'],
      2: ['Sheffield Wednesday', 'Plymouth Argyle', 'Peterborough United'],
      3: ['Gillingham', 'Wycombe Wanderers', 'Southend United', 'Stockport County'],
      4: ['Grimsby Town', 'Darlington'],
    },
  },
  2010: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2011.html',
    relegatedNames: {
      1: ['Birmingham City', 'Blackpool', 'West Ham United'],
      2: ['Preston North End', 'Sheffield United', 'Scunthorpe United'],
      3: ['Dagenham & Redbridge', 'Bristol Rovers', 'Plymouth Argyle', 'Swindon Town'],
      4: ['Lincoln City', 'Stockport County'],
    },
  },
  2011: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2012.html',
    relegatedNames: {
      1: ['Bolton Wanderers', 'Blackburn Rovers', 'Wolverhampton Wanderers'],
      2: ['Portsmouth', 'Coventry City', 'Doncaster Rovers'],
      3: ['Wycombe Wanderers', 'Chesterfield', 'Exeter City', 'Rochdale'],
      4: ['Hereford United', 'Macclesfield Town'],
    },
  },
  2012: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2013.html',
    relegatedNames: {
      1: ['Wigan Athletic', 'Reading', 'Queens Park Rangers'],
      2: ['Peterborough United', 'Wolverhampton Wanderers', 'Bristol City'],
      3: ['Scunthorpe United', 'Bury', 'Hartlepool United', 'Portsmouth'],
      4: ['Barnet', 'Aldershot Town'],
    },
  },
  2013: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2014.html',
    relegatedNames: {
      1: ['Norwich City', 'Fulham', 'Cardiff City'],
      2: ['Doncaster Rovers', 'Barnsley', 'Yeovil Town'],
      3: ['Tranmere Rovers', 'Carlisle United', 'Shrewsbury Town', 'Stevenage'],
      4: ['Bristol Rovers', 'Torquay United'],
    },
  },
  2014: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2015.html',
    relegatedNames: {
      1: ['Hull City', 'Burnley', 'Queens Park Rangers'],
      2: ['Millwall', 'Wigan Athletic', 'Blackpool'],
      3: ['Notts County', 'Crawley Town', 'Leyton Orient', 'Yeovil Town'],
      4: ['Cheltenham Town', 'Tranmere Rovers'],
    },
  },
  2015: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2016.html',
    relegatedNames: {
      1: ['Newcastle United', 'Norwich City', 'Aston Villa'],
      2: ['Charlton Athletic', 'Milton Keynes Dons', 'Bolton Wanderers'],
      3: ['Doncaster Rovers', 'Blackpool', 'Colchester United', 'Crewe Alexandra'],
      4: ['Dagenham & Redbridge', 'York City'],
    },
  },
  2016: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2017.html',
    relegatedNames: {
      1: ['Hull City', 'Middlesbrough', 'Sunderland'],
      2: ['Blackburn Rovers', 'Wigan Athletic', 'Rotherham United'],
      3: ['Port Vale', 'Swindon Town', 'Coventry City', 'Chesterfield'],
      4: ['Hartlepool United', 'Leyton Orient'],
    },
  },
  2017: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2018.html',
    relegatedNames: {
      1: ['Swansea City', 'Stoke City', 'West Bromwich Albion'],
      2: ['Barnsley', 'Burton Albion', 'Sunderland'],
      3: ['Oldham Athletic', 'Northampton Town', 'Milton Keynes Dons', 'Bury'],
      4: ['Barnet', 'Chesterfield'],
    },
  },
  2018: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2019.html',
    relegatedNames: {
      1: ['Cardiff City', 'Fulham', 'Huddersfield Town'],
      2: ['Rotherham United', 'Bolton Wanderers', 'Ipswich Town'],
      3: ['Plymouth Argyle', 'Walsall', 'Scunthorpe United', 'Bradford City'],
      4: ['Notts County', 'Yeovil Town'],
    },
  },
  2019: {
    rel: [3, 3, 3, 1], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2020.html & https://en.wikipedia.org/wiki/2019%E2%80%9320_EFL_League_One & https://en.wikipedia.org/wiki/2019%E2%80%9320_EFL_League_Two',
    relegatedNames: {
      1: ['AFC Bournemouth', 'Watford', 'Norwich City'],
      2: ['Charlton Athletic', 'Wigan Athletic', 'Hull City'],
      3: ['Tranmere Rovers', 'Southend United', 'Bolton Wanderers'],
      4: ['Macclesfield Town'],
    },
  },
  2020: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2021.html',
    relegatedNames: {
      1: ['Fulham', 'West Bromwich Albion', 'Sheffield United'],
      2: ['Wycombe Wanderers', 'Rotherham United', 'Sheffield Wednesday'],
      3: ['Rochdale', 'Northampton Town', 'Swindon Town', 'Bristol Rovers'],
      4: ['Southend United', 'Grimsby Town'],
    },
  },
  2021: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2022.html',
    relegatedNames: {
      1: ['Burnley', 'Watford', 'Norwich City'],
      2: ['Peterborough United', 'Derby County', 'Barnsley'],
      3: ['Gillingham', 'Doncaster Rovers', 'AFC Wimbledon', 'Crewe Alexandra'],
      4: ['Oldham Athletic', 'Scunthorpe United'],
    },
  },
  2022: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2023.html & https://en.wikipedia.org/wiki/2022%E2%80%9323_EFL_Championship',
    relegatedNames: {
      1: ['Leicester City', 'Leeds United', 'Southampton'],
      2: ['Reading', 'Blackpool', 'Wigan Athletic'],
      3: ['Milton Keynes Dons', 'Morecambe', 'Accrington Stanley', 'Forest Green Rovers'],
      4: ['Hartlepool United', 'Rochdale'],
    },
  },
  2023: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2024.html',
    relegatedNames: {
      1: ['Luton Town', 'Burnley', 'Sheffield United'],
      2: ['Birmingham City', 'Huddersfield Town', 'Rotherham United'],
      3: ['Cheltenham Town', 'Fleetwood Town', 'Port Vale', 'Carlisle United'],
      4: ['Sutton United', 'Forest Green Rovers'],
    },
  },
  2024: {
    rel: [3, 3, 4, 2], prom: [3, 3, 4],
    source: 'https://www.rsssf.org/tablese/eng2025.html',
    relegatedNames: {
      1: ['Leicester City', 'Ipswich Town', 'Southampton'],
      2: ['Luton Town', 'Plymouth Argyle', 'Cardiff City'],
      3: ['Crawley Town', 'Bristol Rovers', 'Cambridge United', 'Shrewsbury Town'],
      4: ['Carlisle United', 'Morecambe'],
    },
  },
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
  ['1986-87|T1/T2', {
    relUp: ['Leicester City', 'Manchester City', 'Aston Villa'],
    promDn: ['Derby County', 'Portsmouth'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1986-87.html', 'https://en.wikipedia.org/wiki/1986%E2%80%9387_Football_League'],
    rationale: 'First Division contraction from 22 to 20 clubs began over two seasons: 3 relegated while 19th-placed Charlton Athletic survived via transitional play-off vs Leeds United; 2 promoted from Second Division.',
  }],
  ['1987-88|T1/T2', {
    relUp: ['Chelsea', 'Portsmouth', 'Watford', 'Oxford United'],
    promDn: ['Millwall', 'Aston Villa', 'Middlesbrough'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1987-88.html', 'https://en.wikipedia.org/wiki/1987%E2%80%9388_Football_League'],
    rationale: 'First Division contraction from 21 to 20 clubs completed: 3 automatic relegations plus 18th-placed Chelsea losing the transitional play-off final to Middlesbrough (4 relegated vs 3 promoted).',
  }],
  ['1990-91|T1/T2', {
    relUp: ['Sunderland', 'Derby County'],
    promDn: ['Oldham Athletic', 'West Ham United', 'Sheffield Wednesday', 'Notts County'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1990-91.html', 'https://en.wikipedia.org/wiki/1990%E2%80%9391_Football_League'],
    rationale: 'First Division expanded from 20 to 22 clubs for 1991-92: only 2 relegated while 4 promoted from Second Division (top 3 plus play-off winner Notts County).',
  }],
  ['1990-91|T2/T3', {
    relUp: ['West Bromwich Albion', 'Hull City'],
    promDn: ['Cambridge United', 'Southend United', 'Grimsby Town', 'Tranmere Rovers'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1990-91.html', 'https://en.wikipedia.org/wiki/1990%E2%80%9391_Football_League'],
    rationale: 'Football League reorganisation (one fewer Second Division relegation place; 22nd-placed Leicester City spared) while 4 promoted from Third Division (top 3 plus play-off winner Tranmere Rovers).',
  }],
  ['1990-91|T3/T4', {
    relUp: ['Crewe Alexandra', 'Rotherham United', 'Mansfield Town'],
    promDn: ['Darlington', 'Stockport County', 'Hartlepool United', 'Peterborough United', 'Torquay United'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1990-91.html', 'https://en.wikipedia.org/wiki/1990%E2%80%9391_Football_League'],
    rationale: 'Football League reorganisation (one fewer Third Division relegation place; 21st-placed Fulham spared) while 5 promoted from Fourth Division (top 4 plus 7th-placed play-off winner Torquay United).',
  }],
  ['1994-95|T1/T2', {
    relUp: ['Crystal Palace', 'Norwich City', 'Leicester City', 'Ipswich Town'],
    promDn: ['Middlesbrough', 'Bolton Wanderers'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1994-95.html', 'https://en.wikipedia.org/wiki/1994%E2%80%9395_FA_Premier_League', 'https://en.wikipedia.org/wiki/1994%E2%80%9395_Football_League'],
    rationale: 'Premier League reduced from 22 to 20 clubs for 1995-96: 4 relegated while only 2 promoted from First Division (champions Middlesbrough plus play-off winner Bolton Wanderers).',
  }],
  ['1994-95|T2/T3', {
    relUp: ['Swindon Town', 'Burnley', 'Bristol City', 'Notts County'],
    promDn: ['Birmingham City', 'Huddersfield Town'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1994-95.html', 'https://en.wikipedia.org/wiki/1994%E2%80%9395_Football_League'],
    rationale: 'League restructuring accompanying Premier League reduction to 20 clubs: 4 relegated from First Division while only 2 promoted from Second Division (champions Birmingham City plus play-off winner Huddersfield Town).',
  }],
  ['1994-95|T3/T4', {
    relUp: ['Cambridge United', 'Plymouth Argyle', 'Cardiff City', 'Chester City', 'Leyton Orient'],
    promDn: ['Carlisle United', 'Walsall', 'Chesterfield'],
    sources: ['https://www.rsssf.org/engpaul/FLA/1994-95.html', 'https://en.wikipedia.org/wiki/1994%E2%80%9395_Football_League'],
    rationale: 'League restructuring: 5 relegated from Second Division while 3 promoted from Third Division (top 2 plus play-off winner Chesterfield).',
  }],
  ['2019-20|T3/T4', {
    relUp: ['Tranmere Rovers', 'Southend United', 'Bolton Wanderers'],
    promDn: ['Swindon Town', 'Crewe Alexandra', 'Plymouth Argyle', 'Northampton Town'],
    sources: ['https://www.rsssf.org/tablese/eng2020.html', 'https://en.wikipedia.org/wiki/2019%E2%80%9320_EFL_League_One', 'https://en.wikipedia.org/wiki/2019%E2%80%9320_EFL_League_Two'],
    rationale: 'Bury expelled from League One on 27 August 2019 (reducing League One to 23 active clubs with 3 relegated), while 4 promoted from League Two to restore League One to 24 clubs.',
  }],
]);

test('D1-D3 & C1-C4: Boundary conservation, per-slot relegation counts & 2007-2025 club names, and Wimbledon C4 separation hold', () => {
  const bySlot = new Map(dataset.tierSeasons.map((s) => [s.slotId, s]));

  // 1. Assert each slot's relegationSlots + promotionSlots equal independent source counts (and full names for 2007-2025)
  for (let sy = 1981; sy <= 2024; sy++) {
    const season = `${sy}-${String((sy + 1) % 100).padStart(2, '0')}`;
    const fx = INDEPENDENT_SEASON_OUTCOMES[sy];
    assert.ok(fx, `Missing independent fixture for ${season}`);
    assert.ok(fx.source && fx.source.startsWith('https://'), `Missing opened source URL for ${season}`);

    for (let tier = 1; tier <= 4; tier++) {
      const slotId = `${season}-T${tier}`;
      const s = bySlot.get(slotId);
      assert.ok(s, `Missing slot ${slotId}`);
      const relRows = s.table.filter((r) => r.relegated);
      assert.equal(s.relegationSlots, relRows.length, `${slotId} relegationSlots must equal count of relegated rows`);
      assert.equal(relRows.length, fx.rel[tier - 1], `${slotId} relegated count (${relRows.length}) mismatch vs source (${fx.rel[tier - 1]})`);
      if (tier >= 2) {
        const promRows = s.table.filter((r) => r.promoted);
        assert.equal(s.promotionSlots, promRows.length, `${slotId} promotionSlots must equal count of promoted rows`);
        assert.equal(promRows.length, fx.prom[tier - 2], `${slotId} promoted count (${promRows.length}) mismatch vs source (${fx.prom[tier - 2]})`);
      }
      if (fx.relegatedNames && fx.relegatedNames[tier]) {
        assert.deepEqual(relRows.map((r) => r.team), fx.relegatedNames[tier], `${slotId} relegated club names mismatch`);
      }
      const mSlot = manifest.slots.find((ms) => ms.slotId === slotId);
      assert.equal(mSlot.relegatedTeams.length, s.relegationSlots, `${slotId} manifest relegatedTeams count mismatch`);
      if (relRows.length === 0) {
        assert.equal(s.relegationLinePos, null, `${slotId} 0-relegation slot must have null relegationLinePos`);
        assert.equal(s.survivalLinePos, null, `${slotId} 0-relegation slot must have null survivalLinePos`);
      } else {
        assert.equal(s.relegationLinePos, Math.min(...relRows.map((r) => r.pos)), `${slotId} relegationLinePos`);
      }
    }

    // 2. C1: Pin both relUp and promDn counts across all 132 boundaries + exact rosters & opened URLs on every exception
    for (let t = 1; t <= 3; t++) {
      const up = bySlot.get(`${season}-T${t}`);
      const dn = bySlot.get(`${season}-T${t + 1}`);
      const relUpRows = up.table.filter((r) => r.relegated);
      const promDnRows = dn.table.filter((r) => r.promoted);
      const bKey = `${season}|T${t}/T${t + 1}`;
      assert.equal(relUpRows.length, fx.rel[t - 1], `${bKey} relUp count mismatch`);
      assert.equal(promDnRows.length, fx.prom[t - 1], `${bKey} promDn count mismatch`);

      if (relUpRows.length !== promDnRows.length) {
        const exc = DOCUMENTED_BOUNDARY_EXCEPTIONS.get(bKey);
        assert.ok(exc, `Undocumented boundary mismatch at ${bKey}: relUp=${relUpRows.length}, promDn=${promDnRows.length}`);
        assert.equal(exc.relUp.length, relUpRows.length, `${bKey} exception relUp length`);
        assert.equal(exc.promDn.length, promDnRows.length, `${bKey} exception promDn length`);
        assert.deepEqual(relUpRows.map((r) => r.team), exc.relUp, `${bKey} exception relUp teams`);
        assert.deepEqual(promDnRows.map((r) => r.team), exc.promDn, `${bKey} exception promDn teams`);
        assert.ok(Array.isArray(exc.sources) && exc.sources.length >= 1 && exc.sources.every((u) => u.startsWith('https://')), `${bKey} must cite opened https sources`);
      } else {
        assert.equal(DOCUMENTED_BOUNDARY_EXCEPTIONS.has(bKey), false, `Stale boundary exception ${bKey}`);
      }
    }
  }

  // 3. C4 & D1-D2 specific checks: Wimbledon plain sporting relegation vs legitimate administrative notes
  const wimSlot = bySlot.get('2003-04-T2');
  const wim = wimSlot.table.find((r) => r.team === 'Wimbledon');
  assert.equal(wim.pos, 24);
  assert.equal(wim.relegated, true, 'D1: 2003-04 T2 Wimbledon (24th) must have relegated=true');
  assert.equal(wim.administrativeOutcome, null, 'C4: Wimbledon plain sporting relegation must not carry administrativeOutcome');
  assert.ok(typeof wim.sourceNote === 'string' && wim.sourceNote.includes('Milton Keynes Dons'), 'C4: Wimbledon factual note lives in sourceNote');
  assert.equal(wimSlot.relegationSlots, 3);
  assert.equal(wimSlot.relegationLinePos, 22);
  assert.equal(wimSlot.survivalLinePos, 21);

  const aldSlot = bySlot.get('1990-91-T4');
  const ald = aldSlot.table.find((r) => r.team === 'Aldershot');
  assert.equal(aldSlot.relegationSlots, 0, 'D2: 1990-91 T4 must have relegationSlots=0');
  assert.equal(aldSlot.relegationLinePos, null);
  assert.equal(aldSlot.survivalLinePos, null);
  assert.equal(aldSlot.table.every((r) => r.relegated === false), true, 'D2: every row in 1990-91 T4 must have relegated=false');
  assert.ok(typeof ald.administrativeOutcome === 'string' && ald.administrativeOutcome.includes('withdrawing/folding'), 'C4: Aldershot keeps administrativeOutcome');

  const maid = bySlot.get('1991-92-T4').table.find((r) => r.team === 'Maidstone United');
  assert.ok(typeof maid.administrativeOutcome === 'string' && maid.administrativeOutcome.includes('resigned'), 'C4: Maidstone keeps administrativeOutcome');

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
