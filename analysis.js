/**
 * THE CHAMPIONSHIP FORMULA — Pure Statistical & Multi-Tier Analytical Engine
 * Zero DOM dependencies. Shared by the browser app (classic <script defer>)
 * and Node unit tests (CommonJS / ESM interop via globalThis + module.exports).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ChampionshipAnalysis = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const PRESETS = {
    'all-4-tiers': {
      id: 'all-4-tiers',
      label: 'All 4 Tiers (1981–82 to 2025–26)',
      tiers: [1, 2, 3, 4],
      startYear: 1981,
      endYear: 2025,
      includeCurtailed: false,
      pointsMode: 'official',
    },
    'pl-1992-2026': {
      id: 'pl-1992-2026',
      label: 'Premier League (1992–93 to 2025–26)',
      tiers: [1],
      startYear: 1992,
      endYear: 2025,
      includeCurtailed: false,
      pointsMode: 'official',
    },
    'tier1-full': {
      id: 'tier1-full',
      label: 'Tier 1 Full 3-Point Era (1981–82 to 2025–26)',
      tiers: [1],
      startYear: 1981,
      endYear: 2025,
      includeCurtailed: false,
      pointsMode: 'official',
    },
    'efl-tiers-2-4': {
      id: 'efl-tiers-2-4',
      label: 'EFL Tiers 2–4 (1981–82 to 2025–26)',
      tiers: [2, 3, 4],
      startYear: 1981,
      endYear: 2025,
      includeCurtailed: false,
      pointsMode: 'official',
    },
  };

  const TIER_LABELS = {
    1: 'Tier 1 (First Div / Premier League)',
    2: 'Tier 2 (Second Div / Championship)',
    3: 'Tier 3 (Third Div / League One)',
    4: 'Tier 4 (Fourth Div / League Two)',
  };

  const VALID_OUTCOME_TYPES = new Set(['none', 'reprieved', 'expelled', 'withdrew', 'administration_relegation']);
  const EXCLUDED_SURVIVAL_OUTCOMES = new Set(['reprieved', 'expelled', 'withdrew']);

  const PREDICTOR_DEFS = [
    {
      key: 'winRate',
      rawKey: 'won',
      label: 'Wins per Game (W/G)',
      shortLabel: 'Wins / G',
      identityType: 'accounting',
      identityNote: 'Exact component of PPG = 3·(W/G) + D/G',
    },
    {
      key: 'gdPerGame',
      rawKey: 'gd',
      label: 'Goal Difference per Game (GD/G)',
      shortLabel: 'GD / G',
      identityType: 'composite',
      identityNote: 'Exact difference GD/G = GF/G − GA/G',
    },
    {
      key: 'gfPerGame',
      rawKey: 'gf',
      label: 'Goals For per Game (GF/G)',
      shortLabel: 'GF / G',
      identityType: 'attack',
      identityNote: 'Attacking output per match',
    },
    {
      key: 'gaPerGame',
      rawKey: 'ga',
      label: 'Goals Against per Game (GA/G)',
      shortLabel: 'GA / G',
      identityType: 'defence',
      identityNote: 'Goals conceded per match (lower is better)',
    },
    {
      key: 'drawRate',
      rawKey: 'drawn',
      label: 'Draws per Game (D/G)',
      shortLabel: 'Draws / G',
      identityType: 'accounting',
      identityNote: 'Minor component of PPG = 3·(W/G) + D/G',
    },
  ];

  const ERA_DEFS = [
    {
      id: 'era-pre-pl',
      name: 'Pre-PL Decade',
      years: '1981–82 to 1991–92',
      startMin: 1981,
      startMax: 1991,
    },
    {
      id: 'era-early-pl',
      name: 'Early PL / FL',
      years: '1992–93 to 2002–03',
      startMin: 1992,
      startMax: 2002,
    },
    {
      id: 'era-rebrand',
      name: 'Big Four / Championship',
      years: '2003–04 to 2013–14',
      startMin: 2003,
      startMax: 2013,
    },
    {
      id: 'era-modern',
      name: 'Modern Super-Club / EFL',
      years: '2014–15 to 2025–26',
      startMin: 2014,
      startMax: 2025,
    },
  ];

  /* ========================================================================
     SAFE STATISTICAL PRIMITIVES
     ======================================================================== */
  function finiteNums(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (typeof v === 'number' && Number.isFinite(v)) out.push(v);
    }
    return out;
  }

  function sum(arr) {
    const clean = finiteNums(arr);
    let s = 0;
    for (let i = 0; i < clean.length; i++) s += clean[i];
    return s;
  }

  function mean(arr) {
    const clean = finiteNums(arr);
    return clean.length ? sum(clean) / clean.length : null;
  }

  function median(arr) {
    const clean = finiteNums(arr);
    if (!clean.length) return null;
    const s = clean.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  function quantile(arr, q) {
    const clean = finiteNums(arr);
    if (!clean.length) return null;
    const s = clean.slice().sort((a, b) => a - b);
    const pos = (s.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
  }

  function statsSummary(arr) {
    const clean = finiteNums(arr);
    if (!clean.length) return null;
    const sorted = clean.slice().sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    return {
      count: sorted.length,
      mean: mean(sorted),
      median: median(sorted),
      q1,
      q3,
      iqr: q1 !== null && q3 !== null ? q3 - q1 : null,
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }

  function pairedFinite(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) return [[], []];
    const xs = [];
    const ys = [];
    for (let i = 0; i < x.length; i++) {
      const xv = x[i];
      const yv = y[i];
      if (typeof xv === 'number' && Number.isFinite(xv) && typeof yv === 'number' && Number.isFinite(yv)) {
        xs.push(xv);
        ys.push(yv);
      }
    }
    return [xs, ys];
  }

  function pearson(x, y) {
    const [xs, ys] = pairedFinite(x, y);
    if (xs.length < 2) return null;
    const mx = mean(xs);
    const my = mean(ys);
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < xs.length; i++) {
      const xv = xs[i] - mx;
      const yv = ys[i] - my;
      num += xv * yv;
      dx += xv * xv;
      dy += yv * yv;
    }
    if (dx <= 1e-15 || dy <= 1e-15) return null;
    const denom = Math.sqrt(dx * dy);
    if (!Number.isFinite(denom) || denom === 0) return null;
    const r = num / denom;
    return Math.max(-1, Math.min(1, r));
  }

  function rankArray(arr) {
    const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length);
    let i = 0;
    while (i < indexed.length) {
      let j = i;
      while (j + 1 < indexed.length && indexed[j + 1].v === indexed[i].v) j++;
      const avgRank = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[indexed[k].i] = avgRank;
      i = j + 1;
    }
    return ranks;
  }

  function spearman(x, y) {
    const [xs, ys] = pairedFinite(x, y);
    if (xs.length < 2) return null;
    return pearson(rankArray(xs), rankArray(ys));
  }

  function olsFit(x, y) {
    const [xs, ys] = pairedFinite(x, y);
    if (xs.length < 2) return null;
    const mx = mean(xs);
    const my = mean(ys);
    let num = 0;
    let dx = 0;
    for (let i = 0; i < xs.length; i++) {
      const d = xs[i] - mx;
      num += d * (ys[i] - my);
      dx += d * d;
    }
    if (dx <= 1e-15) return null;
    const slope = num / dx;
    const intercept = my - slope * mx;
    return { slope, intercept };
  }

  /* ========================================================================
     DATASET VALIDATION & SCOPE SELECTION
     ======================================================================== */
  function validateDataset(dataset) {
    if (!dataset || typeof dataset !== 'object') {
      return { ok: false, error: 'Dataset is empty or not an object.' };
    }
    if (dataset.schemaVersion !== '2.0.0') {
      return { ok: false, error: `Unsupported dataset schemaVersion: ${String(dataset.schemaVersion)}` };
    }
    if (!Array.isArray(dataset.tierSeasons) || dataset.tierSeasons.length === 0) {
      return { ok: false, error: 'Dataset contains no tierSeasons array.' };
    }
    const reqNum = ['startYear', 'endYear', 'tier', 'participantCount', 'matchCount', 'totalGoals'];
    const rowNum = ['pos', 'played', 'won', 'drawn', 'lost', 'gf', 'ga', 'gd', 'rawPoints', 'signedAdjustment', 'points'];
    for (let i = 0; i < dataset.tierSeasons.length; i++) {
      const ts = dataset.tierSeasons[i];
      if (!ts || typeof ts !== 'object' || typeof ts.slotId !== 'string' || typeof ts.season !== 'string') {
        return { ok: false, error: `Malformed slot at index ${i}.` };
      }
      for (const k of reqNum) {
        if (typeof ts[k] !== 'number' || !Number.isFinite(ts[k])) {
          return { ok: false, error: `Invalid numeric field ${k} in slot ${ts.slotId}.` };
        }
      }
      if (!Array.isArray(ts.table) || ts.table.length === 0) {
        return { ok: false, error: `Empty or missing table in slot ${ts.slotId}.` };
      }
      for (let j = 0; j < ts.table.length; j++) {
        const row = ts.table[j];
        if (!row || typeof row.team !== 'string' || !row.team.length) {
          return { ok: false, error: `Missing club name in ${ts.slotId} row ${j}.` };
        }
        for (const rk of rowNum) {
          if (typeof row[rk] !== 'number' || !Number.isFinite(row[rk])) {
            return { ok: false, error: `Invalid numeric row field ${rk} in ${ts.slotId} (${row.team}).` };
          }
        }
        if (typeof row.outcomeType !== 'string' || !VALID_OUTCOME_TYPES.has(row.outcomeType)) {
          return { ok: false, error: `Invalid outcomeType "${String(row.outcomeType)}" in ${ts.slotId} (${row.team}).` };
        }
      }
    }
    return { ok: true };
  }

  function normalizeScope(dataset, rawScope) {
    const minAvail = dataset?.metadata?.startYear ?? 1981;
    const maxAvail = dataset?.metadata?.endYear ?? 2025;
    const s = rawScope && typeof rawScope === 'object' ? rawScope : {};

    let tiers = Array.isArray(s.tiers) ? s.tiers.map(Number).filter((t) => t >= 1 && t <= 4) : [1, 2, 3, 4];
    tiers = Array.from(new Set(tiers)).sort((a, b) => a - b);

    let startYear = Number.isInteger(Number(s.startYear)) ? Number(s.startYear) : minAvail;
    let endYear = Number.isInteger(Number(s.endYear)) ? Number(s.endYear) : maxAvail;
    startYear = Math.max(minAvail, Math.min(maxAvail, startYear));
    endYear = Math.max(minAvail, Math.min(maxAvail, endYear));

    let rangeSwapped = false;
    if (startYear > endYear) {
      const tmp = startYear;
      startYear = endYear;
      endYear = tmp;
      rangeSwapped = true;
    }

    return {
      tiers,
      startYear,
      endYear,
      rangeSwapped,
      includeCurtailed: Boolean(s.includeCurtailed),
      pointsMode: s.pointsMode === 'raw' ? 'raw' : 'official',
    };
  }

  function formatSeasonLabel(startYear) {
    const endShort = String((startYear + 1) % 100).padStart(2, '0');
    return `${startYear}–${endShort}`;
  }

  /* ========================================================================
     TEAM & SLOT ENRICHMENT
     ======================================================================== */
  function computeRawPosMap(slot) {
    const gfFirst = Array.isArray(slot.tieBreakRules) && slot.tieBreakRules[1] === 'gf';
    const isCurtailed = slot.status === 'curtailed';
    const sorted = slot.table.slice().sort((a, b) => {
      if (isCurtailed) {
        const ppgDiff = (b.rawPoints / Math.max(1, b.played)) - (a.rawPoints / Math.max(1, a.played));
        if (Math.abs(ppgDiff) > 1e-12) return ppgDiff;
        const gdPgDiff = (b.gd / Math.max(1, b.played)) - (a.gd / Math.max(1, a.played));
        if (Math.abs(gdPgDiff) > 1e-12) return gdPgDiff;
        return (b.gf / Math.max(1, b.played)) - (a.gf / Math.max(1, a.played));
      }
      if (b.rawPoints !== a.rawPoints) return b.rawPoints - a.rawPoints;
      if (gfFirst) {
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.gd !== a.gd) return b.gd - a.gd;
      } else {
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
      }
      return a.pos - b.pos;
    });
    const map = new Map();
    sorted.forEach((r, idx) => map.set(r.team, idx + 1));
    return map;
  }

  function enrichRow(slot, row, pointsMode, rawPos) {
    const g = row.played;
    const validGames = typeof g === 'number' && Number.isFinite(g) && g > 0;
    const ptsUsed = pointsMode === 'raw' ? row.rawPoints : row.points;
    const effectivePos = pointsMode === 'raw' && typeof rawPos === 'number' ? rawPos : row.pos;
    const validTeams = typeof slot.participantCount === 'number' && slot.participantCount > 1;
    const normPos = validTeams ? (effectivePos - 1) / (slot.participantCount - 1) : null;
    const finishScore = normPos !== null ? 1 - normPos : null;
    const officialFinishScore = validTeams ? 1 - (row.pos - 1) / (slot.participantCount - 1) : null;
    const officialPpg = validGames ? row.points / g : null;
    const rawPpg = validGames ? row.rawPoints / g : null;

    return {
      slotId: slot.slotId,
      season: slot.season,
      startYear: slot.startYear,
      endYear: slot.endYear,
      tier: slot.tier,
      historicalDivisionName: slot.historicalDivisionName,
      presentDayTierLabel: slot.presentDayTierLabel,
      teamCount: slot.participantCount,
      gamesPerTeam: g,
      plannedGamesPerTeam: slot.plannedGamesPerTeam,
      status: slot.status,
      relegationLinePos: slot.relegationLinePos,
      survivalLinePos: slot.survivalLinePos,
      scorerCoverage: slot.scorerCoverage,
      ...row,
      officialPos: row.pos,
      rawPos: rawPos ?? row.pos,
      effectivePos,
      pointsUsed: ptsUsed,
      ppg: validGames ? ptsUsed / g : null,
      officialPpg,
      rawPpg,
      winRate: validGames ? row.won / g : null,
      drawRate: validGames ? row.drawn / g : null,
      lossRate: validGames ? row.lost / g : null,
      gfPerGame: validGames ? row.gf / g : null,
      gaPerGame: validGames ? row.ga / g : null,
      gdPerGame: validGames ? row.gd / g : null,
      pts38: validGames ? (ptsUsed / g) * 38 : null,
      pts46: validGames ? (ptsUsed / g) * 46 : null,
      officialPts38: validGames ? officialPpg * 38 : null,
      officialPts46: validGames ? officialPpg * 46 : null,
      wins38: validGames ? (row.won / g) * 38 : null,
      draws38: validGames ? (row.drawn / g) * 38 : null,
      gf38: validGames ? (row.gf / g) * 38 : null,
      ga38: validGames ? (row.ga / g) * 38 : null,
      gd38: validGames ? (row.gd / g) * 38 : null,
      normPos,
      finishScore,
      officialFinishScore,
    };
  }

  /* ========================================================================
     CORRELATION COMPUTATION (WITHIN-SLOT DISTRIBUTION + BY-TIER + POOLED)
     ======================================================================== */
  function computeWithinSlotCorrelations(slots, pointsMode) {
    const slotCorrs = new Map(PREDICTOR_DEFS.map((d) => [d.key, []]));
    let gaBeatsGfCount = 0;
    let gfBeatsGaCount = 0;
    let comparableGfGaSlots = 0;

    for (const slot of slots) {
      const validRows = slot.enrichedTable.filter((r) => r.gamesPerTeam > 0 && r.finishScore !== null);
      if (validRows.length < 3) continue;
      const finishArr = validRows.map((r) => r.finishScore);
      const posArr = validRows.map((r) => r.pos);
      const ppgArr = validRows.map((r) => r.ppg);

      let gfR = null;
      let gaR = null;
      for (const def of PREDICTOR_DEFS) {
        const vals = validRows.map((r) => r[def.key]);
        const rFinish = pearson(vals, finishArr);
        const rPos = pearson(vals, posArr);
        const rPpg = pearson(vals, ppgArr);
        const rhoFinish = spearman(vals, finishArr);
        if (rFinish !== null) {
          slotCorrs.get(def.key).push({
            slotId: slot.slotId,
            season: slot.season,
            tier: slot.tier,
            rFinish,
            absRFinish: Math.abs(rFinish),
            rPos,
            rPpg,
            absRPpg: rPpg !== null ? Math.abs(rPpg) : null,
            rhoFinish,
          });
        }
        if (def.key === 'gfPerGame') gfR = rFinish;
        if (def.key === 'gaPerGame') gaR = rFinish;
      }
      if (gfR !== null && gaR !== null) {
        comparableGfGaSlots++;
        if (Math.abs(gaR) > Math.abs(gfR)) gaBeatsGfCount++;
        else if (Math.abs(gfR) > Math.abs(gaR)) gfBeatsGaCount++;
      }
    }

    const predictors = PREDICTOR_DEFS.map((def) => {
      const list = slotCorrs.get(def.key);
      const rFinishVals = list.map((x) => x.rFinish);
      const absRFinishVals = list.map((x) => x.absRFinish);
      const rPosVals = list.map((x) => x.rPos);
      const rPpgVals = list.map((x) => x.rPpg);
      const rhoVals = list.map((x) => x.rhoFinish);

      const finishStats = statsSummary(rFinishVals);
      const absStats = statsSummary(absRFinishVals);
      const posStats = statsSummary(rPosVals);
      const ppgStats = statsSummary(rPpgVals);
      const rhoStats = statsSummary(rhoVals);

      return {
        ...def,
        pointsMode,
        slotCount: list.length,
        medianRFinish: finishStats?.median ?? null,
        q1RFinish: finishStats?.q1 ?? null,
        q3RFinish: finishStats?.q3 ?? null,
        minRFinish: finishStats?.min ?? null,
        maxRFinish: finishStats?.max ?? null,
        medianAbsRFinish: absStats?.median ?? null,
        q1AbsRFinish: absStats?.q1 ?? null,
        q3AbsRFinish: absStats?.q3 ?? null,
        minAbsRFinish: absStats?.min ?? null,
        maxAbsRFinish: absStats?.max ?? null,
        medianR2Finish: absStats ? absStats.median * absStats.median : null,
        medianRPos: posStats?.median ?? null,
        medianRPpg: ppgStats?.median ?? null,
        medianRhoFinish: rhoStats?.median ?? null,
        slotValues: list,
      };
    }).sort((a, b) => (b.medianAbsRFinish ?? -1) - (a.medianAbsRFinish ?? -1));

    return {
      predictors,
      gaBeatsGfCount,
      gfBeatsGaCount,
      comparableGfGaSlots,
    };
  }

  function computePooledCorrelations(allTeams) {
    const valid = allTeams.filter((t) => t.gamesPerTeam > 0 && t.finishScore !== null && t.ppg !== null);
    if (valid.length < 3) return [];
    const finishArr = valid.map((t) => t.finishScore);
    const posArr = valid.map((t) => t.pos);
    const ppgArr = valid.map((t) => t.ppg);
    const scheduleSet = new Set(valid.map((t) => t.gamesPerTeam));
    const singleSchedule = scheduleSet.size === 1 ? valid[0].gamesPerTeam : null;

    return PREDICTOR_DEFS.map((def) => {
      const vals = valid.map((t) => t[def.key]);
      const rFinish = pearson(vals, finishArr);
      const rPos = pearson(vals, posArr);
      const rPpg = pearson(vals, ppgArr);
      const rhoFinish = spearman(vals, finishArr);
      const rhoPos = spearman(vals, posArr);
      const rRawPtsSingleSchedule = singleSchedule ? pearson(valid.map((t) => t[def.rawKey]), valid.map((t) => t.pointsUsed)) : null;
      return {
        ...def,
        isPooledDiagnostic: true,
        sampleSize: valid.length,
        rFinish,
        absRFinish: rFinish !== null ? Math.abs(rFinish) : null,
        rPos,
        absRPos: rPos !== null ? Math.abs(rPos) : null,
        r2Pos: rPos !== null ? rPos * rPos : null,
        rPpg,
        r2Ppg: rPpg !== null ? rPpg * rPpg : null,
        absRPpg: rPpg !== null ? Math.abs(rPpg) : null,
        rhoFinish,
        rhoPos,
        rRawPtsSingleSchedule,
      };
    }).sort((a, b) => (b.absRFinish ?? -1) - (a.absRFinish ?? -1));
  }

  /* ========================================================================
     MAIN ANALYTICAL MODEL BUILDER
     ======================================================================== */
  function buildAnalyticalModel(dataset, rawScope) {
    const val = validateDataset(dataset);
    if (!val.ok) {
      return { valid: false, error: val.error };
    }

    const scope = normalizeScope(dataset, rawScope);
    const matchingTierYears = dataset.tierSeasons.filter(
      (ts) =>
        scope.tiers.includes(ts.tier) &&
        ts.startYear >= scope.startYear &&
        ts.startYear <= scope.endYear
    );

    const excludedCurtailedSlots = matchingTierYears.filter(
      (ts) => ts.status === 'curtailed' && !scope.includeCurtailed
    );
    const includedCurtailedSlots = matchingTierYears.filter(
      (ts) => ts.status === 'curtailed' && scope.includeCurtailed
    );
    const rawSlots = matchingTierYears.filter(
      (ts) => ts.status !== 'curtailed' || scope.includeCurtailed
    );

    const slots = rawSlots.map((slot) => {
      const rawMap = computeRawPosMap(slot);
      return {
        ...slot,
        enrichedTable: slot.table.map((row) => enrichRow(slot, row, scope.pointsMode, rawMap.get(row.team))),
      };
    });

    if (slots.length === 0) {
      return {
        valid: true,
        isEmpty: true,
        scope,
        slots: [],
        excludedCurtailedSlots,
        includedCurtailedSlots,
        allTeams: [],
        totalMatches: 0,
        totalGoals: 0,
        numSeasons: 0,
        numSlots: 0,
      };
    }

    const allTeams = [];
    let totalMatches = 0;
    let totalGoals = 0;
    const seasonSet = new Set();
    const tierSet = new Set();

    for (const s of slots) {
      totalMatches += s.matchCount;
      totalGoals += s.totalGoals;
      seasonSet.add(s.season);
      tierSet.add(s.tier);
      for (const r of s.enrichedTable) {
        allTeams.push(r);
      }
    }

    const startYears = slots.map((s) => s.startYear);
    const firstSeason = formatSeasonLabel(Math.min(...startYears));
    const lastSeason = formatSeasonLabel(Math.max(...startYears));
    const scheduleSet = new Set(slots.filter((s) => s.status !== 'curtailed').map((s) => s.plannedGamesPerTeam));
    const hasUniformSchedule = scheduleSet.size === 1 && includedCurtailedSlots.length === 0;
    const uniformGames = hasUniformSchedule ? Array.from(scheduleSet)[0] : null;
    const allTeamsDeductionAffected = allTeams.filter((t) => t.signedAdjustment !== 0);

    // 1. Correlations (Primary within-slot distribution + By-Tier + Secondary Pooled Diagnostic)
    const withinSlot = computeWithinSlotCorrelations(slots, scope.pointsMode);
    const byTierCorrelations = [1, 2, 3, 4]
      .filter((tierNum) => slots.some((s) => s.tier === tierNum))
      .map((tierNum) => {
        const tSlots = slots.filter((s) => s.tier === tierNum);
        const w = computeWithinSlotCorrelations(tSlots, scope.pointsMode);
        const gfPred = w.predictors.find((p) => p.key === 'gfPerGame');
        const gaPred = w.predictors.find((p) => p.key === 'gaPerGame');
        const gaAdv = gfPred?.medianAbsRFinish !== null && gaPred?.medianAbsRFinish !== null
          ? gaPred.medianAbsRFinish - gfPred.medianAbsRFinish
          : null;
        const tAllTeams = tSlots.flatMap((x) => x.enrichedTable);
        const tPooled = computePooledCorrelations(tAllTeams);
        const drawIdx = w.predictors.findIndex((p) => p.key === 'drawRate');
        const drawPredTier = drawIdx >= 0 ? w.predictors[drawIdx] : null;
        return {
          tier: tierNum,
          label: TIER_LABELS[tierNum],
          slotCount: tSlots.length,
          teamSeasonCount: tAllTeams.length,
          predictors: w.predictors,
          pooledCorrelations: tPooled,
          gaBeatsGfCount: w.gaBeatsGfCount,
          gfBeatsGaCount: w.gfBeatsGaCount,
          comparableGfGaSlots: w.comparableGfGaSlots,
          gaMinusGfMedianAbsR: gaAdv,
          drawRankInTier: drawIdx >= 0 ? drawIdx + 1 : null,
          drawIsLastInTier: drawIdx >= 0 && drawIdx === w.predictors.length - 1,
          drawPositiveSlotsCount: drawPredTier ? drawPredTier.slotValues.filter((sv) => sv.rFinish > 0).length : 0,
        };
      });
    const pooledCorrelations = computePooledCorrelations(allTeams);

    // 2. Champions vs Runners-Up
    const champs = [];
    const runnersUp = [];
    const titlePairs = [];
    let champMostWins = 0;
    let champBestGd = 0;
    let champMostGf = 0;
    let champFewestGa = 0;
    let champMoreGfThanRunnerUp = 0;
    let champFewerGaThanRunnerUp = 0;
    const champFewerWinsCases = [];

    for (const s of slots) {
      const tbl = s.enrichedTable;
      const c = tbl[0];
      const ru = tbl[1];
      if (!c) continue;
      champs.push(c);
      if (ru) {
        runnersUp.push(ru);
        const ppgMargin = c.officialPpg !== null && ru.officialPpg !== null ? c.officialPpg - ru.officialPpg : null;
        titlePairs.push({
          slotId: s.slotId,
          season: s.season,
          startYear: s.startYear,
          tier: s.tier,
          historicalDivisionName: s.historicalDivisionName,
          champion: c,
          runnerUp: ru,
          ppgMargin,
          ptsMargin: c.points - ru.points,
          winRateGap: c.winRate !== null && ru.winRate !== null ? c.winRate - ru.winRate : null,
          gaGap: c.gaPerGame !== null && ru.gaPerGame !== null ? c.gaPerGame - ru.gaPerGame : null,
          gfGap: c.gfPerGame !== null && ru.gfPerGame !== null ? c.gfPerGame - ru.gfPerGame : null,
        });
      }
      const maxW = Math.max(...tbl.map((r) => r.won));
      const maxWinRate = Math.max(...tbl.map((r) => r.winRate ?? -1));
      const maxGd = Math.max(...tbl.map((r) => r.gd));
      const maxGf = Math.max(...tbl.map((r) => r.gf));
      const minGa = Math.min(...tbl.map((r) => r.ga));

      if (c.won === maxW) champMostWins++;
      else {
        const winLeaders = tbl.filter((r) => r.won === maxW);
        champFewerWinsCases.push({
          slotId: s.slotId,
          season: s.season,
          startYear: s.startYear,
          tier: s.tier,
          historicalDivisionName: s.historicalDivisionName,
          champion: c,
          runnerUp: ru,
          winLeaders,
          maxWins: maxW,
          maxWinRate,
        });
      }
      if (c.gd === maxGd) champBestGd++;
      if (c.gf === maxGf) champMostGf++;
      if (c.ga === minGa) champFewestGa++;
      if (ru && c.gf > ru.gf) champMoreGfThanRunnerUp++;
      if (ru && c.ga < ru.ga) champFewerGaThanRunnerUp++;
    }

    function profileMetrics(list) {
      return {
        count: list.length,
        ppg: statsSummary(list.map((x) => x.officialPpg)),
        winRate: statsSummary(list.map((x) => x.winRate)),
        drawRate: statsSummary(list.map((x) => x.drawRate)),
        gfPerGame: statsSummary(list.map((x) => x.gfPerGame)),
        gaPerGame: statsSummary(list.map((x) => x.gaPerGame)),
        gdPerGame: statsSummary(list.map((x) => x.gdPerGame)),
        pts38: statsSummary(list.map((x) => x.officialPts38)),
        pts46: statsSummary(list.map((x) => x.officialPts46)),
        points: statsSummary(list.map((x) => x.points)),
        wins38: statsSummary(list.map((x) => x.wins38)),
        gf38: statsSummary(list.map((x) => x.gf38)),
        ga38: statsSummary(list.map((x) => x.ga38)),
        gd38: statsSummary(list.map((x) => x.gd38)),
      };
    }

    const champStats = profileMetrics(champs);
    const runnerStats = profileMetrics(runnersUp);

    const byTierChampions = [1, 2, 3, 4]
      .filter((tierNum) => slots.some((s) => s.tier === tierNum))
      .map((tierNum) => {
        const cSub = champs.filter((x) => x.tier === tierNum);
        const rSub = runnersUp.filter((x) => x.tier === tierNum);
        return {
          tier: tierNum,
          label: TIER_LABELS[tierNum],
          slotCount: cSub.length,
          champStats: profileMetrics(cSub),
          runnerStats: profileMetrics(rSub),
          fewerWinsCount: champFewerWinsCases.filter((x) => x.tier === tierNum).length,
        };
      });

    const eraSplits = ERA_DEFS
      .filter((e) => e.startMax >= scope.startYear && e.startMin <= scope.endYear)
      .map((era) => {
        const cSub = champs.filter((c) => c.startYear >= era.startMin && c.startYear <= era.startMax);
        const rSub = runnersUp.filter((r) => r.startYear >= era.startMin && r.startYear <= era.startMax);
        return {
          ...era,
          count: cSub.length,
          champPpg: mean(cSub.map((x) => x.officialPpg)),
          champPts38: mean(cSub.map((x) => x.officialPts38)),
          champPts46: mean(cSub.map((x) => x.officialPts46)),
          champWinRate: mean(cSub.map((x) => x.winRate)),
          champGfPerGame: mean(cSub.map((x) => x.gfPerGame)),
          champGaPerGame: mean(cSub.map((x) => x.gaPerGame)),
          champGdPerGame: mean(cSub.map((x) => x.gdPerGame)),
          champGf38: mean(cSub.map((x) => x.gf38)),
          champGa38: mean(cSub.map((x) => x.ga38)),
          champGd38: mean(cSub.map((x) => x.gd38)),
          runnerPpg: mean(rSub.map((x) => x.officialPpg)),
          runnerPts38: mean(rSub.map((x) => x.officialPts38)),
        };
      })
      .filter((e) => e.count > 0);

    // 3. Survival, Relegation & Promotion Boundaries (always OFFICIAL table outcomes; typed outcomeType exclusion)
    // IMPORTANT: Never treat 0-relegation slots or reprieved/expelled/withdrew boundary clubs as merit survival cutoffs.
    const noRelegationSlots = [];
    const excludedSurvivalRows = [];
    const survivalSeries = [];

    for (const s of slots) {
      const relRows = s.enrichedTable.filter((r) => r.relegated);
      const safeRows = s.enrichedTable.filter((r) => !r.relegated);
      const adminExcludedInSlot = safeRows.filter((r) => !r.promoted && EXCLUDED_SURVIVAL_OUTCOMES.has(r.outcomeType));
      for (const ex of adminExcludedInSlot) {
        excludedSurvivalRows.push({
          slotId: s.slotId,
          season: s.season,
          tier: s.tier,
          historicalDivisionName: s.historicalDivisionName,
          relegationActiveSlot: relRows.length > 0,
          pos: ex.pos,
          team: ex.team,
          outcomeType: ex.outcomeType,
          officialPts: ex.points,
          officialPpg: ex.officialPpg,
          administrativeOutcome: ex.administrativeOutcome,
        });
      }

      if (relRows.length === 0) {
        const reasonList = adminExcludedInSlot.map((r) => `${r.team} (${r.outcomeType})`).join(', ');
        noRelegationSlots.push({
          slotId: s.slotId,
          season: s.season,
          tier: s.tier,
          historicalDivisionName: s.historicalDivisionName,
          reElectionEra: Boolean(s.reElectionEra),
          excludedOutcomeTypes: adminExcludedInSlot.map((r) => r.outcomeType),
          note: s.reElectionEra
            ? 'Football League re-election era (0 relegated)'
            : adminExcludedInSlot.some((r) => r.outcomeType === 'withdrew')
              ? `Zero bottom-place relegations (${reasonList})`
              : adminExcludedInSlot.some((r) => r.outcomeType === 'reprieved')
                ? `Zero teams relegated (Ground-grading reprieve: ${reasonList})`
                : 'Zero teams relegated in final standings',
        });
        continue;
      }

      const highestRel = relRows.slice().sort((a, b) => a.pos - b.pos)[0];
      const meritSafeRows = safeRows.filter((r) => !EXCLUDED_SURVIVAL_OUTCOMES.has(r.outcomeType));
      const lowestSafe = meritSafeRows.slice().sort((a, b) => b.pos - a.pos)[0];
      const safeAtLine = s.survivalLinePos !== null ? s.enrichedTable.find((r) => r.pos === s.survivalLinePos) : null;
      const surv = (safeAtLine && !EXCLUDED_SURVIVAL_OUTCOMES.has(safeAtLine.outcomeType))
        ? safeAtLine
        : lowestSafe;
      if (!surv || !highestRel) continue;

      const highRelPtsInTable = Math.max(...relRows.map((r) => r.points));
      const highRelPpgInTable = Math.max(...relRows.map((r) => r.officialPpg ?? 0));
      const guaranteedSafePpg = highestRel.played > 0 ? (highRelPtsInTable + 1) / highestRel.played : null;

      survivalSeries.push({
        slotId: s.slotId,
        season: s.season,
        startYear: s.startYear,
        tier: s.tier,
        historicalDivisionName: s.historicalDivisionName,
        gamesPerTeam: s.plannedGamesPerTeam,
        survivingPos: surv.pos,
        survivingTeam: surv.team,
        survivingPts: surv.points,
        survivingPpg: surv.officialPpg,
        survivingPts38: surv.officialPts38,
        survivingPts46: surv.officialPts46,
        relegatedPos: highestRel.pos,
        relegatedTeam: highestRel.team,
        relegatedPts: highestRel.points,
        relegatedHighPts: highRelPtsInTable,
        relegatedPpg: highestRel.officialPpg,
        relegatedHighPpg: highRelPpgInTable,
        relegatedPts38: highestRel.officialPts38,
        relegatedPts46: highestRel.officialPts46,
        guaranteedSafePts: highRelPtsInTable + 1,
        guaranteedSafePpg,
        hasDeductionImpact: relRows.some((r) => r.signedAdjustment !== 0) || safeRows.slice(-3).some((r) => r.signedAdjustment !== 0),
        excludedReprievedTeams: adminExcludedInSlot.map((r) => {
          const mod100 = r.pos % 100;
          const ord = mod100 >= 11 && mod100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][r.pos % 10] || 'th');
          return `${r.team} (${r.pos}${ord}, ${r.outcomeType})`;
        }),
      });
    }

    const survivalStats = {
      slotCount: survivalSeries.length,
      excludedNoRelegationCount: noRelegationSlots.length,
      excludedAdminBoundaryCount: excludedSurvivalRows.filter((x) => x.relegationActiveSlot).length,
      survivingPpg: statsSummary(survivalSeries.map((x) => x.survivingPpg)),
      relegatedPpg: statsSummary(survivalSeries.map((x) => x.relegatedPpg)),
      survivingPts38: statsSummary(survivalSeries.map((x) => x.survivingPts38)),
      relegatedPts38: statsSummary(survivalSeries.map((x) => x.relegatedPts38)),
      survivingPts46: statsSummary(survivalSeries.map((x) => x.survivingPts46)),
      relegatedPts46: statsSummary(survivalSeries.map((x) => x.relegatedPts46)),
      // Historical benchmarks: >= 40 pts in 38g = 40/38 = 1.05263 PPG; >= 50 pts in 46g = 50/46 = 1.08696 PPG
      relegatedAtOrAbove40Over38Rate: survivalSeries.filter((x) => (x.relegatedHighPpg ?? 0) >= 40 / 38 - 1e-9),
      relegatedAtOrAbove50Over46Rate: survivalSeries.filter((x) => (x.relegatedHighPpg ?? 0) >= 50 / 46 - 1e-9),
      survivedBelow40Over38Rate: survivalSeries.filter((x) => (x.survivingPpg ?? 99) < 40 / 38 - 1e-9),
      survivedBelow50Over46Rate: survivalSeries.filter((x) => (x.survivingPpg ?? 99) < 50 / 46 - 1e-9),
    };

    const byTierSurvival = [1, 2, 3, 4]
      .filter((tierNum) => survivalSeries.some((x) => x.tier === tierNum))
      .map((tierNum) => {
        const sub = survivalSeries.filter((x) => x.tier === tierNum);
        const raw38 = sub.filter((x) => x.gamesPerTeam === 38);
        const raw46 = sub.filter((x) => x.gamesPerTeam === 46);
        return {
          tier: tierNum,
          label: TIER_LABELS[tierNum],
          slotCount: sub.length,
          survivingPpg: statsSummary(sub.map((x) => x.survivingPpg)),
          relegatedPpg: statsSummary(sub.map((x) => x.relegatedPpg)),
          relegatedHighPpg: statsSummary(sub.map((x) => x.relegatedHighPpg)),
          survivingPtsRaw38: statsSummary(raw38.map((x) => x.survivingPts)),
          relegatedPtsRaw38: statsSummary(raw38.map((x) => x.relegatedPts)),
          survivingPtsRaw46: statsSummary(raw46.map((x) => x.survivingPts)),
          relegatedPtsRaw46: statsSummary(raw46.map((x) => x.relegatedPts)),
          recent10RelegatedPpg: mean(sub.slice(-10).map((x) => x.relegatedPpg)),
          maxRelegatedRow: sub.reduce((best, cur) => ((cur.relegatedPpg ?? -1) > (best?.relegatedPpg ?? -1) ? cur : best), null),
          minSurvivedRow: sub.reduce((best, cur) => ((cur.survivingPpg ?? 99) < (best?.survivingPpg ?? 99) ? cur : best), null),
        };
      });

    // Promotion thresholds (Tiers 2-4)
    const promotionSeries = [];
    const playoffWinners = [];
    for (const s of slots.filter((x) => x.tier >= 2)) {
      const autoRows = s.enrichedTable.filter((r) => r.promoted && r.promotionMethod === 'automatic');
      const poWin = s.enrichedTable.find((r) => r.promotionMethod === 'playoff');
      const lastAuto = autoRows.length ? autoRows[autoRows.length - 1] : null;
      if (lastAuto) {
        promotionSeries.push({
          slotId: s.slotId,
          season: s.season,
          tier: s.tier,
          lastAutoTeam: lastAuto.team,
          lastAutoPos: lastAuto.pos,
          lastAutoPts: lastAuto.points,
          lastAutoPpg: lastAuto.officialPpg,
          poWinner: poWin ? { team: poWin.team, pos: poWin.pos, pts: poWin.points, ppg: poWin.officialPpg } : null,
        });
      }
      if (poWin) {
        playoffWinners.push({
          slotId: s.slotId,
          season: s.season,
          tier: s.tier,
          team: poWin.team,
          pos: poWin.pos,
          topSeedPos: autoRows.length + 1,
          ppg: poWin.officialPpg,
        });
      }
    }

    const byTierPromotion = [2, 3, 4]
      .filter((tierNum) => promotionSeries.some((x) => x.tier === tierNum))
      .map((tierNum) => {
        const sub = promotionSeries.filter((x) => x.tier === tierNum);
        const poSub = playoffWinners.filter((x) => x.tier === tierNum);
        return {
          tier: tierNum,
          label: TIER_LABELS[tierNum],
          slotCount: sub.length,
          lastAutoPpg: statsSummary(sub.map((x) => x.lastAutoPpg)),
          lastAutoPts: statsSummary(sub.map((x) => x.lastAutoPts)),
          poWinnerCount: poSub.length,
          poWinnerMedianPos: median(poSub.map((x) => x.pos)),
          poWinnerThirdCount: poSub.filter((x) => x.pos === 3).length,
          poWinnerTopSeedCount: poSub.filter((x) => x.pos === x.topSeedPos).length,
          poWinnerLowestPosCount: poSub.filter((x) => (tierNum === 4 ? x.pos === 7 : x.pos === 6)).length,
        };
      });

    // Legacy PL 38-game survival shortcuts for exact PL-parity reporting
    const survival38 = survivalSeries.filter((x) => x.gamesPerTeam === 38 && x.tier === 1);
    const surv38Stats = survival38.length ? statsSummary(survival38.map((x) => x.survivingPts)) : null;
    const rel38Stats = survival38.length ? statsSummary(survival38.map((x) => x.relegatedPts)) : null;

    // 4. Draws Analysis (outcomes anchored to official standings even when Points Basis = Raw)
    const seasonDrawLeaders = [];
    let drawCoLeaderSlotsCount = 0;
    for (const s of slots) {
      const maxD = Math.max(...s.enrichedTable.map((r) => r.drawn));
      const leaders = s.enrichedTable.filter((x) => x.drawn === maxD);
      if (leaders.length > 1) drawCoLeaderSlotsCount++;
      for (const r of leaders) {
        seasonDrawLeaders.push(r);
      }
    }

    const highDrawRateCutoff = 14 / 38 - 1e-6; // ~36.84% draws (14+ in 38g, 16+ in 42g, 17+ in 46g)
    const highDrawCampaigns = allTeams
      .filter((t) => t.drawRate !== null && t.drawRate >= highDrawRateCutoff)
      .sort((a, b) => (b.drawRate - a.drawRate) || (b.drawn - a.drawn) || (a.startYear - b.startYear));

    const dlChampionRows = seasonDrawLeaders.filter((x) => x.champion);
    const drawLeaderStats = {
      count: seasonDrawLeaders.length,
      slotCount: slots.length,
      coLeaderSlotsCount: drawCoLeaderSlotsCount,
      finishScore: statsSummary(seasonDrawLeaders.map((x) => x.officialFinishScore)),
      pos: statsSummary(seasonDrawLeaders.map((x) => x.pos)),
      drawRate: statsSummary(seasonDrawLeaders.map((x) => x.drawRate)),
      topHalfCount: seasonDrawLeaders.filter((x) => x.officialFinishScore !== null && x.officialFinishScore >= 0.5).length,
      bottomQuarterCount: seasonDrawLeaders.filter((x) => x.officialFinishScore !== null && x.officialFinishScore < 0.25).length,
      middleHalfCount: seasonDrawLeaders.filter((x) => x.officialFinishScore !== null && x.officialFinishScore >= 0.25 && x.officialFinishScore <= 0.75).length,
      topQuarterCount: seasonDrawLeaders.filter((x) => x.officialFinishScore !== null && x.officialFinishScore > 0.75).length,
      relegatedCount: seasonDrawLeaders.filter((x) => x.relegated).length,
      promotedCount: seasonDrawLeaders.filter((x) => x.promoted).length,
      championCount: dlChampionRows.length,
      championCampaigns: dlChampionRows.map((c) => ({
        slotId: c.slotId,
        season: c.season,
        tier: c.tier,
        historicalDivisionName: c.historicalDivisionName,
        team: c.team,
        won: c.won,
        drawn: c.drawn,
        lost: c.lost,
        points: c.points,
      })),
    };

    const byTierDraws = [1, 2, 3, 4]
      .filter((tierNum) => slots.some((s) => s.tier === tierNum))
      .map((tierNum) => {
        const sub = allTeams.filter((t) => t.tier === tierNum && t.drawRate !== null);
        const leadSub = seasonDrawLeaders.filter((t) => t.tier === tierNum);
        return {
          tier: tierNum,
          label: TIER_LABELS[tierNum],
          slotCount: slots.filter((s) => s.tier === tierNum).length,
          leagueMeanDrawRate: mean(sub.map((x) => x.drawRate)),
          leaderMedianPos: median(leadSub.map((x) => x.pos)),
          leaderMedianFinishScore: median(leadSub.map((x) => x.officialFinishScore)),
          leaderTopHalfShare: leadSub.length ? leadSub.filter((x) => (x.officialFinishScore ?? -1) >= 0.5).length / leadSub.length : null,
          leaderRelegatedCount: leadSub.filter((x) => x.relegated).length,
          highDrawCount: highDrawCampaigns.filter((x) => x.tier === tierNum).length,
        };
      });

    // 5. Golden Boot & Top Scorer Coverage (strictly scoped to verified slots)
    const isVerifiedScorerSlot = (s) => s.scorerCoverage === 'verified_pl_complete' || s.scorerCoverage === 'verified';
    const availableScorerSlots = slots.filter(isVerifiedScorerSlot);
    const unavailableScorerSlots = slots.filter((s) => !isVerifiedScorerSlot(s));

    let scorerAnalysis;
    if (availableScorerSlots.length === 0) {
      scorerAnalysis = {
        status: 'unavailable',
        availableSlotsCount: 0,
        unavailableSlotsCount: unavailableScorerSlots.length,
        availableRangeLabel: null,
        note: 'Verified season top-scorer and club leading-scorer records cover Tier 1 Premier League (1992–93 to 2025–26) only. Historical First Division (pre-1992) and Football League/EFL Tiers 2–4 lack uniform season-long club top-scorer coverage in our verified sources, so no figures are guessed or zero-filled.',
      };
    } else {
      const availTeams = [];
      for (const s of availableScorerSlots) {
        for (const r of s.enrichedTable) availTeams.push(r);
      }
      let champWithGbCount = 0;
      const gbInstances = [];
      for (const s of availableScorerSlots) {
        const champ = s.enrichedTable[0];
        if (champ?.hasGoldenBootWinner) champWithGbCount++;
        for (const gb of s.goldenBootWinners || []) {
          const clubs = Array.isArray(gb.clubs) ? gb.clubs : [];
          const primaryClub = clubs[clubs.length - 1];
          const clubRow = s.enrichedTable.find(
            (r) => r.team === primaryClub || (Array.isArray(r.sourceAliases) && r.sourceAliases.includes(primaryClub))
          );
          if (clubRow) {
            gbInstances.push({
              season: s.season,
              tier: s.tier,
              player: gb.player,
              clubDisplay: gb.clubDisplay,
              primaryClub: clubRow.team,
              goals: gb.goals,
              pos: clubRow.pos,
              points: clubRow.pointsUsed,
              isChampion: clubRow.pos === 1,
            });
          }
        }
      }

      const top4Teams = availTeams
        .filter((t) => t.pos <= 4 && t.topScorer && typeof t.topScorer.goals === 'number' && t.gf > 0 && t.played > 0)
        .map((t) => ({
          ...t,
          scorerPlayer: t.topScorer.player,
          scorerGoals: t.topScorer.goals,
          scorerGoalsPerGame: t.topScorer.goals / t.played,
          scorerShare: (t.topScorer.goals / t.gf) * 100,
        }));

      const pos1Top4 = top4Teams.filter((t) => t.pos === 1);
      const pos2Top4 = top4Teams.filter((t) => t.pos === 2);
      const pos34Top4 = top4Teams.filter((t) => t.pos === 3 || t.pos === 4);

      scorerAnalysis = {
        status: unavailableScorerSlots.length === 0 ? 'verified-full' : 'verified-partial',
        availableSlotsCount: availableScorerSlots.length,
        unavailableSlotsCount: unavailableScorerSlots.length,
        availableRangeLabel: 'Premier League (Tier 1, 1992–93 to 2025–26)',
        champWithGbCount,
        gbInstances,
        top4Teams,
        pos1Top4,
        pos2Top4,
        pos34Top4,
        shareStats: {
          champ: statsSummary(pos1Top4.map((x) => x.scorerShare)),
          runner: statsSummary(pos2Top4.map((x) => x.scorerShare)),
          thirdFourth: statsSummary(pos34Top4.map((x) => x.scorerShare)),
          allTop4: statsSummary(top4Teams.map((x) => x.scorerShare)),
          rSharePpgTop4: pearson(top4Teams.map((x) => x.scorerShare), top4Teams.map((x) => x.officialPpg)),
          rShareGfTop4: pearson(top4Teams.map((x) => x.scorerShare), top4Teams.map((x) => x.gfPerGame)),
          rGbPpgAll: pearson(availTeams.map((x) => (x.hasGoldenBootWinner ? 1 : 0)), availTeams.map((x) => x.officialPpg)),
          rGbChampAll: pearson(availTeams.map((x) => (x.hasGoldenBootWinner ? 1 : 0)), availTeams.map((x) => (x.pos === 1 ? 1 : 0))),
        },
        note: unavailableScorerSlots.length > 0
          ? `Scoped strictly to ${availableScorerSlots.length} verified Tier 1 Premier League slots (1992–93 to 2025–26); ${unavailableScorerSlots.length} historical/EFL slots in your current filter have unavailable uniform scorer data and are omitted here.`
          : 'All slots in the current filter have verified official top-scorer records.',
      };
    }

    const positionShiftCount = allTeams.filter((t) => t.rawPos !== t.officialPos).length;
    const relegatedDueToDeduction = allTeams.filter(
      (t) => t.signedAdjustment < 0 && t.relegated && t.survivalLinePos !== null && t.rawPos <= t.survivalLinePos
    );
    const deductionSensitivity = {
      affectedRowsCount: allTeamsDeductionAffected.length,
      positionShiftCount,
      relegatedDueToDeductionCount: relegatedDueToDeduction.length,
      relegatedDueToDeduction: relegatedDueToDeduction.map((t) => ({
        slotId: t.slotId,
        season: t.season,
        tier: t.tier,
        team: t.team,
        officialPos: t.officialPos,
        rawPos: t.rawPos,
        signedAdjustment: t.signedAdjustment,
        officialPts: t.points,
        rawPts: t.rawPoints,
      })),
    };

    return {
      valid: true,
      isEmpty: false,
      dataset,
      scope,
      slots,
      excludedCurtailedSlots,
      includedCurtailedSlots,
      allTeamsDeductionAffected,
      deductionSensitivity,
      numSlots: slots.length,
      numSeasons: seasonSet.size,
      tiersPresent: Array.from(tierSet).sort((a, b) => a - b),
      firstSeason,
      lastSeason,
      hasUniformSchedule,
      uniformGames,
      allTeams,
      totalMatches,
      totalGoals,
      withinSlot,
      correlations: withinSlot.predictors,
      byTierCorrelations,
      pooledCorrelations,
      champMostWins,
      champBestGd,
      champMostGf,
      champFewestGa,
      champMoreGfThanRunnerUp,
      champFewerGaThanRunnerUp,
      champFewerWinsCases,
      champs,
      runnersUp,
      titlePairs,
      champStats,
      runnerStats,
      byTierChampions,
      eraSplits,
      noRelegationSlots,
      excludedSurvivalRows,
      survivalSeries,
      survivalStats,
      byTierSurvival,
      survival38,
      surv38Stats,
      rel38Stats,
      promotionSeries,
      playoffWinners,
      byTierPromotion,
      seasonDrawLeaders,
      highDrawCampaigns,
      drawLeaderStats,
      byTierDraws,
      scorerAnalysis,
    };
  }

  return {
    PRESETS,
    TIER_LABELS,
    PREDICTOR_DEFS,
    ERA_DEFS,
    mean,
    median,
    quantile,
    statsSummary,
    pearson,
    spearman,
    olsFit,
    validateDataset,
    normalizeScope,
    formatSeasonLabel,
    buildAnalyticalModel,
  };
});
