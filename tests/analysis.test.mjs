import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import '../analysis.js';

const CA = globalThis.ChampionshipAnalysis;
const ROOT = path.resolve(import.meta.dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'england-tiers-1-4-1981-2025.json'), 'utf8'));

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

test('Curtailed opt-out default (174 slots) vs opt-in (176 slots)', () => {
  const mEx = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  assert.equal(mEx.numSlots, 174);
  assert.equal(mEx.allTeams.length, 4000);
  assert.deepEqual(mEx.excludedCurtailedSlots.map((s) => s.slotId).sort(), ['2019-20-T3', '2019-20-T4']);

  const mIn = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], includeCurtailed: true });
  assert.equal(mIn.numSlots, 176);
  assert.equal(mIn.allTeams.length, 4047);
});

test('Official vs Raw Sporting points mode shifts PPG, ranks, and detects deduction relegations', () => {
  const mOff = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  const mRaw = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], pointsMode: 'raw' });

  assert.equal(mOff.deductionSensitivity.affectedRowsCount, 56);
  assert.equal(mOff.deductionSensitivity.relegatedDueToDeductionCount, 10);
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
  assert.equal(m.champFewerWinsCases.length, 12);
  assert.equal(m.champFewerWinsCases[0].slotId, '1981-82-T3');
  assert.equal(m.champFewerWinsCases[0].champion.team, 'Burnley');

  // 10 zero-relegation T4 slots (1981-86, 1990-92, 1993-96) properly separated from 164 active survival cutoffs
  assert.equal(m.noRelegationSlots.length, 10);
  assert.ok(m.noRelegationSlots.some((x) => x.slotId === '1990-91-T4'));
  assert.equal(m.survivalStats.slotCount, 164);
  const s2003T2 = m.survivalSeries.find((x) => x.slotId === '2003-04-T2');
  assert.ok(s2003T2);
  assert.equal(s2003T2.survivingPos, 21);
  assert.equal(s2003T2.relegatedPos, 22);

  // Within-slot GA/G vs GF/G
  assert.equal(m.withinSlot.gaBeatsGfCount, 92);
  assert.equal(m.withinSlot.gfBeatsGaCount, 82);
  assert.equal(m.correlations[m.correlations.length - 1].key, 'drawRate');
});

test('Scorer availability contract enforces explicit unavailable state outside PL 1992-2025', () => {
  const mEfl = CA.buildAnalyticalModel(dataset, CA.PRESETS['efl-tiers-2-4']);
  assert.equal(mEfl.scorerAnalysis.status, 'unavailable');
  assert.equal(mEfl.scorerAnalysis.availableSlotsCount, 0);

  const mPre92 = CA.buildAnalyticalModel(dataset, { tiers: [1], startYear: 1981, endYear: 1991 });
  assert.equal(mPre92.scorerAnalysis.status, 'unavailable');

  const mAll = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  assert.equal(mAll.scorerAnalysis.status, 'verified-partial');
  assert.equal(mAll.scorerAnalysis.availableSlotsCount, 33);

  const mPl = CA.buildAnalyticalModel(dataset, CA.PRESETS['pl-1992-2025']);
  assert.equal(mPl.scorerAnalysis.status, 'verified-full');
  assert.equal(mPl.scorerAnalysis.champWithGbCount, 12);
  assert.equal(mPl.scorerAnalysis.gbInstances.length, 41);
  assert.equal(mPl.surv38Stats.min, 32);
  assert.equal(mPl.surv38Stats.median, 38);
  assert.equal(mPl.rel38Stats.max, 42);
});

test('Stage 2 A1-A4: Attack/defence dual metrics, raw-mode official-outcome isolation, draw quartiles, and Stevenage reprieve', () => {
  const mOff = CA.buildAnalyticalModel(dataset, CA.PRESETS['all-4-tiers']);
  const mRaw = CA.buildAnalyticalModel(dataset, { ...CA.PRESETS['all-4-tiers'], pointsMode: 'raw' });
  const mPl = CA.buildAnalyticalModel(dataset, CA.PRESETS['pl-1992-2025']);

  // A1: Pooled R2(PPG) alongside within-slot |r| on both all-4-tiers and pl-1992-2025
  const plGfW = mPl.correlations.find((c) => c.key === 'gfPerGame').medianAbsRFinish;
  const plGaW = mPl.correlations.find((c) => c.key === 'gaPerGame').medianAbsRFinish;
  const plGfR2 = mPl.pooledCorrelations.find((p) => p.key === 'gfPerGame').r2Ppg;
  const plGaR2 = mPl.pooledCorrelations.find((p) => p.key === 'gaPerGame').r2Ppg;
  assert.ok(plGaW > plGfW, 'PL 1992-2025 within-slot |r| has GA/G slightly higher than GF/G');
  assert.ok(plGfR2 > plGaR2, 'PL 1992-2025 pooled R2(PPG) has GF/G higher than GA/G');
  assert.equal(mOff.byTierCorrelations.length, 4);
  for (const tc of mOff.byTierCorrelations) {
    assert.ok(Array.isArray(tc.pooledCorrelations) && tc.pooledCorrelations.length === 5);
    assert.equal(tc.drawRankInTier, 5);
  }

  // A2: Draw leader quartile counts and tie non-independence metadata
  const dl = mOff.drawLeaderStats;
  assert.equal(dl.count, 233);
  assert.equal(dl.bottomQuarterCount + dl.middleHalfCount + dl.topQuarterCount, dl.count);
  assert.equal(dl.bottomQuarterCount, 57);
  assert.equal(dl.middleHalfCount, 147);
  assert.equal(dl.topQuarterCount, 29);
  assert.equal(dl.coLeaderSlotsCount, 46);
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
