import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import '../analysis.js';
import '../app.js';

const CA = globalThis.ChampionshipAnalysis;
const CL = globalThis.ChampionshipLedger;
const ROOT = path.resolve(import.meta.dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'england-tiers-1-4-1981-2026.json'), 'utf8'));

test('validateDataset catches malformed objects, wrong schemaVersion, and missing fields', () => {
  assert.equal(CA.validateDataset(null).ok, false);
  assert.equal(CA.validateDataset({ schemaVersion: '1.0.0', tierSeasons: [] }).ok, false);
  const bad = structuredClone(dataset);
  bad.tierSeasons[0].table[0].played = '42';
  assert.equal(CA.validateDataset(bad).ok, false);
  assert.equal(CA.validateDataset(dataset).ok, true);
});

test('Safe statistical primitives return null instead of NaN on empty, constant, or degenerate inputs', () => {
  assert.equal(CA.mean([]), null);
  assert.equal(CA.median([]), null);
  assert.equal(CA.quantile([], 0.5), null);
  assert.equal(CA.statsSummary([]), null);
  assert.equal(CA.pearson([1], [2]), null);
  assert.equal(CA.pearson([5, 5, 5], [1, 2, 3]), null); // zero variance in X
  assert.equal(CA.spearman([5, 5, 5], [1, 2, 3]), null);
  assert.equal(CA.olsFit([4, 4], [1, 2]), null);
  assert.ok(Math.abs(CA.pearson([1, 2, 3], [2, 4, 6]) - 1) < 1e-12);
});

test('normalizeScope safely handles swapped years and invalid ranges', () => {
  const s = CA.normalizeScope(dataset, { tiers: [3, 1, 9], startYear: 2015, endYear: 1990 });
  assert.deepEqual(s.tiers, [1, 3]);
  assert.equal(s.startYear, 1990);
  assert.equal(s.endYear, 2015);
  assert.equal(s.rangeSwapped, true);
});

test('Empty tier filter produces valid isEmpty model without crashing', () => {
  const m = CA.buildAnalyticalModel(dataset, { tiers: [], startYear: 1981, endYear: 2024 });
  assert.equal(m.valid, true);
  assert.equal(m.isEmpty, true);
  assert.equal(m.numSlots, 0);
});

test('Zero-played or single-team synthetic slot guards division by zero cleanly', () => {
  const synth = structuredClone(dataset);
  synth.tierSeasons = [{
    ...dataset.tierSeasons[0],
    participantCount: 1,
    matchCount: 0,
    totalGoals: 0,
    table: [{ ...dataset.tierSeasons[0].table[0], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, rawPoints: 0, signedAdjustment: 0, points: 0 }],
  }];
  const m = CA.buildAnalyticalModel(synth, { tiers: [1], startYear: 1981, endYear: 2024 });
  assert.equal(m.valid, true);
  assert.equal(m.allTeams[0].ppg, null);
  assert.equal(m.allTeams[0].finishScore, null);
});

test('Curtailed opt-out default (178 slots) vs opt-in (180 slots)', () => {
  const mEx = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  assert.equal(mEx.numSlots, 178);
  assert.equal(mEx.allTeams.length, 4092);
  assert.deepEqual(mEx.excludedCurtailedSlots.map((s) => s.slotId).sort(), ['2019-20-T3', '2019-20-T4']);

  const mIn = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], includeCurtailed: true });
  assert.equal(mIn.numSlots, 180);
  assert.equal(mIn.allTeams.length, 4139);
});

test('Official vs Raw Sporting points mode shifts PPG, ranks, and detects deduction relegations', () => {
  const mOff = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  const mRaw = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], pointsMode: 'raw' });

  assert.equal(mOff.deductionSensitivity.affectedRowsCount, 59);
  assert.equal(mOff.deductionSensitivity.relegatedDueToDeductionCount, 11);
  assert.ok(mOff.deductionSensitivity.relegatedDueToDeduction.some((x) => x.slotId === '2025-26-T2' && x.team === 'Leicester City'));
  assert.ok(mRaw.correlations[0].medianRPpg > mOff.correlations[0].medianRPpg);

  const boroOff = mOff.allTeams.find((t) => t.slotId === '1996-97-T1' && t.team === 'Middlesbrough');
  const boroRaw = mRaw.allTeams.find((t) => t.slotId === '1996-97-T1' && t.team === 'Middlesbrough');
  assert.equal(boroOff.pointsUsed, 39);
  assert.equal(boroRaw.pointsUsed, 42);
  assert.equal(boroOff.effectivePos, 19);
  assert.equal(boroRaw.effectivePos, 14);
});

test('4-Tier empirical findings: fewer-wins champions, no-relegation separation, and GA vs GF', () => {
  const m = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  assert.equal(m.champFewerWinsCases.length, 13);
  assert.equal(m.champFewerWinsCases[0].slotId, '1981-82-T3');
  assert.equal(m.champFewerWinsCases[0].champion.team, 'Burnley');
  assert.ok(m.champFewerWinsCases.some((c) => c.slotId === '2025-26-T4' && c.champion.team === 'Bromley'));

  // 10 zero-relegation T4 slots (1981-86, 1990-92, 1993-96) properly separated from 168 active survival cutoffs
  assert.equal(m.noRelegationSlots.length, 10);
  assert.ok(m.noRelegationSlots.some((x) => x.slotId === '1990-91-T4'));
  assert.equal(m.survivalStats.slotCount, 168);
  const s2003T2 = m.survivalSeries.find((x) => x.slotId === '2003-04-T2');
  assert.ok(s2003T2);
  assert.equal(s2003T2.survivingPos, 21);
  assert.equal(s2003T2.relegatedPos, 22);

  // Within-slot GA/G vs GF/G
  assert.equal(m.withinSlot.gaBeatsGfCount, 92);
  assert.equal(m.withinSlot.gfBeatsGaCount, 86);
  assert.equal(m.correlations[m.correlations.length - 1].key, 'drawRate');
});

test('Scorer availability contract enforces explicit unavailable state outside PL 1992-2026', () => {
  const mEfl = CA.buildAnalyticalModel(dataset, CA.PRESETS['efl-tiers-2-4']);
  assert.equal(mEfl.scorerAnalysis.status, 'unavailable');
  assert.equal(mEfl.scorerAnalysis.availableSlotsCount, 0);

  const mPre92 = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 1981, endYear: 1991 });
  assert.equal(mPre92.scorerAnalysis.status, 'unavailable');

  const mAll = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  assert.equal(mAll.scorerAnalysis.status, 'verified-partial');
  assert.equal(mAll.scorerAnalysis.availableSlotsCount, 34);

  const mPl = CA.buildAnalyticalModel(dataset, CA.PRESETS['pl-1992-2026']);
  assert.equal(mPl.scorerAnalysis.status, 'verified-full');
  assert.equal(mPl.scorerAnalysis.champWithGbCount, 12);
  assert.equal(mPl.scorerAnalysis.gbInstances.length, 42);
  assert.equal(mPl.surv38Stats.min, 32);
  assert.equal(mPl.surv38Stats.median, 38);
  assert.equal(mPl.rel38Stats.max, 42);
});

test('Stage 2 A1-A4: Attack/defence dual metrics, raw-mode official-outcome isolation, draw quartiles, and Stevenage reprieve', () => {
  const mOff = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  const mRaw = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], pointsMode: 'raw' });
  const mPl = CA.buildAnalyticalModel(dataset, CA.PRESETS['pl-1992-2026']);

  // A1: Pooled R2(PPG) alongside within-slot |r| on both all-4-tiers and pl-1992-2026
  const plGfW = mPl.correlations.find((c) => c.key === 'gfPerGame').medianAbsRFinish;
  const plGaW = mPl.correlations.find((c) => c.key === 'gaPerGame').medianAbsRFinish;
  const plGfR2 = mPl.pooledCorrelations.find((p) => p.key === 'gfPerGame').r2Ppg;
  const plGaR2 = mPl.pooledCorrelations.find((p) => p.key === 'gaPerGame').r2Ppg;
  assert.ok(plGaW > plGfW, 'PL 1992-2026 within-slot |r| has GA/G slightly higher than GF/G');
  assert.ok(plGfR2 > plGaR2, 'PL 1992-2026 pooled R2(PPG) has GF/G higher than GA/G');
  assert.equal(mOff.byTierCorrelations.length, 4);
  for (const tc of mOff.byTierCorrelations) {
    assert.ok(Array.isArray(tc.pooledCorrelations) && tc.pooledCorrelations.length === 5);
    assert.equal(tc.drawRankInTier, 5);
  }

  // A2: Draw leader quartile counts and tie non-independence metadata
  const dl = mOff.drawLeaderStats;
  assert.equal(dl.count, 240);
  assert.equal(dl.bottomQuarterCount + dl.middleHalfCount + dl.topQuarterCount, dl.count);
  assert.equal(dl.bottomQuarterCount, 59);
  assert.equal(dl.middleHalfCount, 149);
  assert.equal(dl.topQuarterCount, 32);
  assert.equal(dl.coLeaderSlotsCount, 47);
  assert.equal(dl.championCampaigns.length, 1);
  assert.equal(dl.championCampaigns[0].team, 'Swindon Town');
  assert.equal(mPl.drawLeaderStats.championCount, 0);
  assert.equal(mPl.drawLeaderStats.championCampaigns.length, 0);

  // A3: Raw mode keeps official outcomes invariant (Reading 2022-23 T2 stays 44 pts in survivalSeries; rel40 stays 46)
  assert.equal(mRaw.survivalStats.relegatedAtOrAbove40Over38Rate.length, mOff.survivalStats.relegatedAtOrAbove40Over38Rate.length);
  const readOff = mOff.survivalSeries.find((s) => s.slotId === '2022-23-T2');
  const readRaw = mRaw.survivalSeries.find((s) => s.slotId === '2022-23-T2');
  assert.equal(readOff.relegatedHighPts, 44);
  assert.equal(readRaw.relegatedHighPts, 44);
  assert.equal(readRaw.relegatedTeam, readOff.relegatedTeam);
  assert.equal(mRaw.champStats.ppg.mean, mOff.champStats.ppg.mean);
  assert.deepEqual(mRaw.drawLeaderStats, mOff.drawLeaderStats);

  // A4: Curtailed 2019-20 T4 excludes reprieved Stevenage (23rd) and uses merit survivor Morecambe (22nd)
  const mCur = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], includeCurtailed: true });
  const l2Surv = mCur.survivalSeries.find((s) => s.slotId === '2019-20-T4');
  assert.equal(l2Surv.survivingTeam, 'Morecambe');
  assert.equal(l2Surv.survivingPos, 22);
  assert.equal(l2Surv.survivingPts, 32);
  assert.ok(mCur.excludedSurvivalRows.some((x) => x.slotId === '2019-20-T4' && x.team === 'Stevenage' && x.outcomeType === 'reprieved' && x.relegationActiveSlot === true));

  // A4: validateDataset rejects unknown outcomeType
  const badDs = structuredClone(dataset);
  badDs.tierSeasons = [structuredClone(badDs.tierSeasons[0])];
  badDs.tierSeasons[0].table[0].outcomeType = 'made_up';
  assert.equal(CA.validateDataset(badDs).ok, false);
});

test('Headline ledger semantics: Items 1-6 across real scopes, fixtures, and edge cases', () => {
  const banBadNumbers = (view, label) => {
    assert.ok(!/\bNaN\b|\bInfinity\b|\bundefined\b|\[object/i.test(view.note), `${label} note bad token`);
    for (const c of view.cards) {
      for (const field of [c.idx, c.stat, c.claim, c.detail]) {
        assert.ok(!/\bNaN\b|\bInfinity\b|\bundefined\b|\[object/i.test(field), `${label} ${c.idx} bad token: ${field}`);
      }
    }
  };

  // Item 1, 2, 3, 4, 6 on default 178-table scope
  const mDef = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  const q1 = mDef.champStats.ppg.q1;
  const q3 = mDef.champStats.ppg.q3;
  const exactInQuartile = mDef.champs.filter((c) => c.officialPpg >= q1 && c.officialPpg <= q3).length;
  const roundedInQuartile = mDef.champs.filter((c) => c.officialPpg >= Number(q1.toFixed(2)) && c.officialPpg <= Number(q3.toFixed(2))).length;
  assert.equal(exactInQuartile, 88);
  assert.equal(roundedInQuartile, 88);
  assert.ok(exactInQuartile * 2 < mDef.champs.length, '88 of 178 (49.4%) is strictly below half');

  const drawPred = mDef.correlations.find((c) => c.key === 'drawRate');
  assert.equal(drawPred.slotValues.filter((s) => s.rFinish < 0).length, 113);
  assert.equal(drawPred.slotValues.filter((s) => s.rFinish > 0).length, 65);

  const vDef = CL.buildLedgerView(mDef, CA.PRESETS['all-4-tiers']);
  banBadNumbers(vDef, 'default');
  assert.ok(vDef.note.includes('178 league tables') && vDef.note.includes('4,092 team seasons') && vDef.note.includes('official standings'));
  // Card 01: scale definition, selected-table summary, exact sign counts, no causal claim
  assert.ok(vDef.cards[0].detail.includes('0–1 scale') && vDef.cards[0].detail.includes('Across 178 tables'));
  assert.ok(vDef.cards[0].detail.includes('negative in 113 of 178 tables and positive in 65'));
  assert.ok(!/barely help/i.test(vDef.cards[0].claim + vDef.cards[0].detail));
  // Card 02: variation not point share, non-additive, within-table median vs separate per-table count
  assert.ok(vDef.cards[1].claim.includes('points variation'));
  assert.ok(vDef.cards[1].detail.includes('median rank link') && vDef.cards[1].detail.includes('separately') && vDef.cards[1].detail.includes('92 of 178 tables'));
  assert.ok(vDef.cards[1].detail.includes('65.8% of points-per-game variation to scoring') && vDef.cards[1].detail.includes('61.0% to conceding') && vDef.cards[1].detail.includes('not additive shares or causes'));
  // Card 03: median + middle-half quartiles, no majority claim
  assert.ok(vDef.cards[2].detail.includes('Median champion: 2.04 official points') && vDef.cards[2].detail.includes('middle half roughly 1.94 to 2.17') && vDef.cards[2].detail.includes('1.90 median'));
  assert.ok(!/\bmost\b|\bmajority\b/i.test(vDef.cards[2].detail));
  // Card 04: 168 inside vs 10 outside with distinct reasons
  assert.ok(vDef.cards[3].claim.includes('168 tables with relegation; 10 without it'));
  assert.ok(vDef.cards[3].detail.includes('5 Fourth Division re-election seasons where automatic relegation was not in place') && vDef.cards[3].detail.includes('2 after club withdrawal') && vDef.cards[3].detail.includes('3 after ground-grading reprieve'));
  // Card 06: 12 of 34 minority, 42 co-winner instances, 144 omitted, no causal need claim
  assert.ok(vDef.cards[5].stat === '12 / 34' && vDef.cards[5].claim.includes('minority (12 of 34)'));
  assert.ok(vDef.cards[5].detail.includes('42 Golden Boot') && vDef.cards[5].detail.includes('144 pre-1992 or lower-tier tables omitted'));
  assert.ok(!/rarely|needed/i.test(vDef.cards[5].claim + vDef.cards[5].detail));

  // Item 6: Tier 1 2011-2013 near-tie reproduction + synthetic exact tie & pooled near-tie
  const scNear = { tiers: [1], startYear: 2011, endYear: 2013, includeCurtailed: false, pointsMode: 'official' };
  const mNear = CA.buildAnalyticalModel(dataset, scNear);
  const atkNear = CL.describeAtkVsDef(mNear);
  assert.equal(atkNear.withinLeader, 'near-tie');
  assert.equal(atkNear.withinNearTie, true);
  assert.equal(atkNear.pooledLeader, 'gf');
  const vNear = CL.buildLedgerView(mNear, scNear);
  banBadNumbers(vNear, 'near-tie-2011-13');
  assert.equal(vNear.cards[1].stat, '0.852 vs 0.851');
  assert.ok(vNear.cards[1].claim.includes('nearly equal on rank') && vNear.cards[1].claim.includes('scoring tracks more points variation'));
  assert.ok(!/\b(tie|level)\b/i.test(vNear.cards[1].claim));
  assert.ok(vNear.cards[1].detail.includes('nearly equal as a median rank link') && vNear.cards[1].detail.includes('0.0005 near-tie margin'));
  assert.ok(vNear.cards[1].detail.includes('81.5% of points-per-game variation to scoring') && vNear.cards[1].detail.includes('65.4% to conceding'));
  assert.ok(vNear.cards[0].detail.includes('negative in all 3 tables'));

  const mockTrueTie = structuredClone(mNear);
  mockTrueTie.correlations = mockTrueTie.correlations.map((c) => (
    c.key === 'gaPerGame' || c.key === 'gfPerGame' ? { ...c, medianAbsRFinish: 0.8 } : c
  ));
  mockTrueTie.pooledCorrelations = mockTrueTie.pooledCorrelations.map((p) => (
    p.key === 'gaPerGame' || p.key === 'gfPerGame' ? { ...p, r2Ppg: 0.65 } : p
  ));
  assert.equal(CL.describeAtkVsDef(mockTrueTie).withinLeader, 'tie');
  assert.equal(CL.describeAtkVsDef(mockTrueTie).pooledLeader, 'tie');
  const vTrueTie = CL.buildLedgerView(mockTrueTie, scNear);
  assert.ok(vTrueTie.cards[1].claim.includes('equal on rank and points variation') && !vTrueTie.cards[1].claim.includes('nearly equal'));

  const mockPoolNear = structuredClone(mNear);
  mockPoolNear.pooledCorrelations = mockPoolNear.pooledCorrelations.map((p) => (
    p.key === 'gfPerGame' ? { ...p, r2Ppg: 0.6503 } : p.key === 'gaPerGame' ? { ...p, r2Ppg: 0.6500 } : p
  ));
  assert.equal(CL.describeAtkVsDef(mockPoolNear).pooledLeader, 'near-tie');
  const vPoolNear = CL.buildLedgerView(mockPoolNear, scNear);
  assert.ok(vPoolNear.cards[1].detail.includes('nearly equal shares of points-per-game variation') && vPoolNear.cards[1].detail.includes('0.05 percentage points'));

  // Item 5: Tier 2 2021 raw mode disclosure (Reading 41 official vs 47 raw)
  const scRaw21 = { tiers: [2], startYear: 2021, endYear: 2021, includeCurtailed: false, pointsMode: 'raw' };
  const mRaw21 = CA.buildAnalyticalModel(dataset, scRaw21);
  const readRow = mRaw21.allTeams.find((t) => t.team === 'Reading');
  assert.equal(readRow.points, 41);
  assert.equal(readRow.rawPoints, 47);
  const vRaw21 = CL.buildLedgerView(mRaw21, scRaw21);
  banBadNumbers(vRaw21, 'raw-2021-t2');
  assert.ok(vRaw21.note.includes('Cards 01–02: raw 3W+D points; Cards 03–06: official standings'));
  assert.ok(vRaw21.cards[3].stat.includes('0.891 official pts/g'));
  assert.ok(vRaw21.cards[3].detail.includes('Reading stayed up on 41 official points (0.891 official per game; 47 raw points, 1.022 raw before a 6-point deduction)'));

  // Item 4 & Item 3: Tier 4 1981-85 zero-relegation & draw positive-heavy signs
  const scT4Early = { tiers: [4], startYear: 1981, endYear: 1985, includeCurtailed: false, pointsMode: 'official' };
  const mT4Early = CA.buildAnalyticalModel(dataset, scT4Early);
  const vT4Early = CL.buildLedgerView(mT4Early, scT4Early);
  banBadNumbers(vT4Early, 't4-1981-85');
  assert.ok(vT4Early.cards[0].detail.includes('negative in 1 of 5 tables and positive in 4'));
  assert.ok(vT4Early.cards[3].stat === 'No relegation' && vT4Early.cards[3].claim.includes('5 tables without relegation (0 with relegation)'));
  assert.ok(vT4Early.cards[3].detail.includes('automatic relegation was not in place') && !/suspended/i.test(vT4Early.cards[3].detail));

  // Scorer proportions from real dataset slices: 0, <50%, ==50% (2002-05), >50% (2001-04), all (2022-24), and fixtures
  const mPl0 = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 1992, endYear: 1993, includeCurtailed: false, pointsMode: 'official' });
  assert.ok(CL.buildLedgerView(mPl0).cards[5].claim.includes('0 of 2 champions'));
  const mPlMinor = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 1992, endYear: 1995, includeCurtailed: false, pointsMode: 'official' });
  assert.ok(CL.buildLedgerView(mPlMinor).cards[5].claim.includes('minority (1 of 4)'));
  const mPlHalf = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 2002, endYear: 2005, includeCurtailed: false, pointsMode: 'official' });
  assert.ok(CL.buildLedgerView(mPlHalf).cards[5].claim.includes('Half (2 of 4)'));
  const mPlMaj = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 2001, endYear: 2004, includeCurtailed: false, pointsMode: 'official' });
  assert.ok(CL.buildLedgerView(mPlMaj).cards[5].claim.includes('majority (3 of 4)'));
  const mPlAll = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 2022, endYear: 2024, includeCurtailed: false, pointsMode: 'official' });
  assert.ok(CL.buildLedgerView(mPlAll).cards[5].claim.includes('All 3 champions'));
  const mZeroGb = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 1992, endYear: 1992, includeCurtailed: false, pointsMode: 'official' });
  assert.ok(CL.buildLedgerView(mZeroGb).cards[5].claim.includes('did not field'));
  for (const [withGb, avail, pat] of [[0, 4, '0 of 4 champions'], [2, 4, 'Half (2 of 4)'], [2, 3, 'majority (2 of 3)'], [3, 3, 'All 3 champions']]) {
    const fake = structuredClone(mNear);
    fake.scorerAnalysis = { status: 'verified-full', availableSlotsCount: avail, unavailableSlotsCount: 0, champWithGbCount: withGb, gbInstances: Array(avail).fill({}) };
    assert.ok(CL.buildLedgerView(fake).cards[5].claim.includes(pat), `Unexpected claim for ${withGb}/${avail}`);
  }

  // Draw all-positive synthetic fixture
  const fakeAllPos = structuredClone(mNear);
  fakeAllPos.correlations = fakeAllPos.correlations.map((c) => (
    c.key === 'drawRate' ? { ...c, medianAbsRFinish: 0.25, medianRFinish: 0.25, slotValues: c.slotValues.map((sv) => ({ ...sv, rFinish: 0.25 })) } : c
  ));
  assert.ok(CL.buildLedgerView(fakeAllPos).cards[0].detail.includes('positive in all 3 tables'));

  // Curtailed-only excluded, curtailed opt-in, 1-table, 2-table, empty, each individual tier
  const mCurtExcl = CA.buildAnalyticalModel(dataset, { tiers: [3, 4], startYear: 2019, endYear: 2019, includeCurtailed: false, pointsMode: 'official' });
  const vCurtExcl = CL.buildLedgerView(mCurtExcl);
  assert.equal(vCurtExcl.isEmpty, true);
  assert.ok(vCurtExcl.note.includes('2 curtailed tables excluded by default'));
  const mEmpty = CA.buildAnalyticalModel(dataset, { tiers: [], startYear: 1981, endYear: 2024, includeCurtailed: false, pointsMode: 'official' });
  assert.equal(CL.buildLedgerView(mEmpty).isEmpty, true);

  for (const preset of [CA.PRESETS['pl-1992-2026'], { tiers: [1], startYear: 1981, endYear: 2025, includeCurtailed: false, pointsMode: 'official' }, { tiers: [2], startYear: 1981, endYear: 2025, includeCurtailed: false, pointsMode: 'official' }, { tiers: [3], startYear: 1981, endYear: 2025, includeCurtailed: false, pointsMode: 'official' }, { tiers: [4], startYear: 1981, endYear: 2025, includeCurtailed: false, pointsMode: 'official' }, { tiers: [1], startYear: 1992, endYear: 1993, includeCurtailed: false, pointsMode: 'official' }, { ...CA.PRESETS['all-4-tiers'], includeCurtailed: true }, { ...CA.PRESETS['all-4-tiers'], pointsMode: 'raw' }]) {
    const mm = CA.buildAnalyticalModel(dataset, preset);
    const vv = CL.buildLedgerView(mm, preset);
    assert.equal(vv.isEmpty, false);
    banBadNumbers(vv, JSON.stringify(preset));
    const tv = CL.buildTakeawaysView(mm, preset);
    assert.equal(tv.isEmpty, false);
    assert.ok(tv.bullets.length >= 2, `Expected takeaways bullets for ${JSON.stringify(preset)}`);
    for (const b of tv.bullets) {
      assert.ok(!/\bNaN\b|\bInfinity\b|\bundefined\b|\[object/i.test(`${b.lead} ${b.body}`), `Bad token in takeaways for ${JSON.stringify(preset)}`);
    }
  }

  // Play-off seed counts (all-format T2=14/39, T3=14/39, T4=15/39; bottom seeds 7/39, 9/39, 9/39) & standard 4-team breakdown
  assert.deepEqual(
    mDef.byTierPromotion.map((t) => [t.tier, t.poWinnerTopSeedCount, t.poWinnerBottomSeedCount, t.poWinnerCount]),
    [[2, 14, 7, 39], [3, 14, 9, 39], [4, 15, 9, 39]]
  );
  const pbDef = mDef.playoffSeedBreakdown;
  assert.equal(pbDef.allCount, 117);
  assert.equal(pbDef.transitionalCount, 5);
  assert.equal(pbDef.hasSunderland1990, true);
  assert.equal(pbDef.hasSouthampton2026, true);
  assert.equal(pbDef.overall.total, 112);
  assert.deepEqual(pbDef.overall.seeds.map((s) => s.count), [40, 27, 22, 23]);
  assert.equal(pbDef.overall.topTwoCount, 67);
  assert.equal(pbDef.overall.gap1to4.median, 7.5);
  assert.deepEqual(
    pbDef.byTier.map((t) => [t.tier, t.total, ...t.seeds.map((s) => s.count), t.gap1to4.median]),
    [
      [2, 38, 13, 9, 9, 7, 9],
      [3, 37, 12, 10, 6, 9, 9],
      [4, 37, 15, 8, 7, 7, 6],
    ]
  );

  // Curtailed opt-in adds 2019-20 L1 (Wycombe 1st seed) and L2 (Northampton 4th seed) => 114 standard tournaments
  const mCurPo = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], includeCurtailed: true });
  assert.equal(mCurPo.playoffSeedBreakdown.overall.total, 114);
  assert.deepEqual(mCurPo.playoffSeedBreakdown.overall.seeds.map((s) => s.count), [41, 27, 22, 24]);

  // PL-only has zero play-off seed records; Raw mode keeps official play-off seed breakdown invariant
  const mPlOnly = CA.buildAnalyticalModel(dataset, CA.PRESETS['pl-1992-2026']);
  assert.equal(mPlOnly.playoffSeedBreakdown.overall.total, 0);
  assert.equal(mPlOnly.playoffSeedBreakdown.byTier.length, 0);
  const mRawAll = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], pointsMode: 'raw' });
  assert.deepEqual(mRawAll.playoffSeedBreakdown.overall.seeds, pbDef.overall.seeds);

  const tDef = CL.buildTakeawaysView(mDef, CA.PRESETS['all-4-tiers']);
  assert.equal(tDef.bullets.length, 6);
  const tDefText = tDef.bullets.map((b) => `${b.lead} ${b.body}`).join(' ');
  assert.ok(tDefText.includes('Bromley') && tDefText.includes('Salford City') && tDefText.includes('112 four-team EFL play-offs') && tDefText.includes('36%') && tDefText.includes('Sheffield Wednesday') && tDefText.includes('Viktor Gyökeres'));
  const tPl = CL.buildTakeawaysView(mPlOnly, CA.PRESETS['pl-1992-2026']);
  const tPlText = tPl.bullets.map((b) => `${b.lead} ${b.body}`).join(' ');
  assert.ok(tPlText.includes('West Ham') && tPlText.includes('AFC Bournemouth') && tPlText.includes('Viktor Gyökeres'));
  assert.ok(!/Bromley|Bolton|Hull City|Sheffield Wednesday/i.test(tPlText), 'PL-only takeaways must not leak EFL examples');
  const tEarly = CL.buildTakeawaysView(mT4Early, scT4Early);
  assert.ok(!/suspended/i.test(tEarly.bullets.map((b) => `${b.lead} ${b.body}`).join(' ')), 'Tier 4 re-election takeaways must not say suspended');

  // Play-off chi-squared diagnostics & Statistics Sicko Mode views
  assert.ok(Math.abs(pbDef.overall.chi2Uniform - 7.357142857) < 1e-4);
  assert.ok(Math.abs(pbDef.overall.chi2Seeds2to4 - 0.583333333) < 1e-4);
  assert.ok(Math.abs(pbDef.chi2TierContingency - 1.54) < 0.02);
  assert.equal(pbDef.chi2TierDf, 6);

  const sickoLedger = CL.buildLedgerView(mDef, CA.PRESETS['all-4-tiers'], 'sicko');
  banBadNumbers(sickoLedger, 'sicko-ledger');
  const sickoLedgerText = sickoLedger.cards.map((c) => `${c.idx} ${c.stat} ${c.claim} ${c.detail}`).join(' ');
  assert.ok(sickoLedgerText.includes('R²(PPG)') && sickoLedgerText.includes('IQR') && sickoLedgerText.includes('GA/G') && sickoLedgerText.includes('argmax(W)'));

  const sickoTakeaways = CL.buildTakeawaysView(mDef, CA.PRESETS['all-4-tiers'], 'sicko');
  assert.equal(sickoTakeaways.bullets.length, 6);
  const sickoTakText = sickoTakeaways.bullets.map((b) => `${b.lead} ${b.body}`).join(' ');
  assert.ok(!/\bNaN\b|\bInfinity\b|\bundefined\b|\[object/i.test(sickoTakText));
  assert.ok(sickoTakText.includes('argmax(W)') && sickoTakText.includes('R²(PPG)') && sickoTakText.includes('χ²') && sickoTakText.includes('PPG'));
});
