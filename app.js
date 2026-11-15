/**
 * THE CHAMPIONSHIP FORMULA — Client-Side Analytical & SVG Visualization Engine
 * Every statistic, prose figure, table cell, and chart coordinate is computed
 * at runtime from ./data/premier-league-1992-2025.json. Nothing is hardcoded.
 */

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/* ==========================================================================
   STATISTICAL PRIMITIVES
   ========================================================================== */
function sum(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s;
}

function mean(arr) {
  return arr.length ? sum(arr) / arr.length : 0;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function quantile(arr, q) {
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
}

function pearson(x, y) {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < x.length; i++) {
    const xv = x[i] - mx;
    const yv = y[i] - my;
    num += xv * yv;
    dx += xv * xv;
    dy += yv * yv;
  }
  return num / Math.sqrt(dx * dy);
}

function olsFit(x, y) {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
  }
  const slope = num / dx;
  const intercept = my - slope * mx;
  return { slope, intercept };
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
  return pearson(rankArray(x), rankArray(y));
}

function fmtSigned(val, digits = 2) {
  const fixed = Math.abs(val).toFixed(digits);
  return val >= 0 ? `+${fixed}` : `−${fixed}`;
}

/* ==========================================================================
   TOOLTIP MANAGEMENT
   ========================================================================== */
const tooltipEl = document.getElementById('chart-tooltip');

function showTooltip(event, html) {
  if (!tooltipEl) return;
  tooltipEl.innerHTML = html;
  tooltipEl.classList.add('visible');
  tooltipEl.setAttribute('aria-hidden', 'false');
  moveTooltip(event);
}

function moveTooltip(event) {
  if (!tooltipEl) return;
  const pad = 14;
  const rect = tooltipEl.getBoundingClientRect();
  let x = event.clientX + pad;
  let y = event.clientY + pad;
  if (x + rect.width + 12 > window.innerWidth) {
    x = event.clientX - rect.width - pad;
  }
  if (y + rect.height + 12 > window.innerHeight) {
    y = event.clientY - rect.height - pad;
  }
  tooltipEl.style.left = `${Math.max(8, x)}px`;
  tooltipEl.style.top = `${Math.max(8, y)}px`;
}

function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.classList.remove('visible');
  tooltipEl.setAttribute('aria-hidden', 'true');
}

function wireSvgTooltips(container) {
  const nodes = container.querySelectorAll('[data-tip]');
  nodes.forEach((node) => {
    node.addEventListener('pointerenter', (e) => showTooltip(e, node.getAttribute('data-tip')));
    node.addEventListener('pointermove', moveTooltip);
    node.addEventListener('pointerleave', hideTooltip);
    node.addEventListener('focus', (e) => {
      const r = node.getBoundingClientRect();
      showTooltip({ clientX: r.left + r.width / 2, clientY: r.top }, node.getAttribute('data-tip'));
    });
    node.addEventListener('blur', hideTooltip);
  });
}

/* ==========================================================================
   DATA LOADING & MODEL COMPUTATION
   ========================================================================== */
async function loadDataset() {
  try {
    const res = await fetch('./data/premier-league-1992-2025.json');
    if (res.ok) return await res.json();
  } catch (_) {
    // Fallback for file:// protocol
  }
  if (window.__PL_DATASET__) return window.__PL_DATASET__;
  throw new Error('Unable to load Premier League dataset JSON.');
}

function buildAnalyticalModel(dataset) {
  const seasons = dataset.seasons;
  const numSeasons = seasons.length;
  const firstSeason = seasons[0].season;
  const lastSeason = seasons[numSeasons - 1].season;

  const allTeams = [];
  let totalMatches = 0;
  let totalGoals = 0;

  for (const s of seasons) {
    totalMatches += (s.teamCount * s.gamesPerTeam) / 2;
    for (const r of s.table) {
      totalGoals += r.gf;
      const g = r.played;
      allTeams.push({
        season: s.season,
        startYear: s.startYear,
        teamCount: s.teamCount,
        gamesPerTeam: g,
        ...r,
        ppg: r.points / g,
        winRate: r.won / g,
        drawRate: r.drawn / g,
        lossRate: r.lost / g,
        gfPerGame: r.gf / g,
        gaPerGame: r.ga / g,
        gdPerGame: r.gd / g,
        pts38: (r.points / g) * 38,
        wins38: (r.won / g) * 38,
        draws38: (r.drawn / g) * 38,
        losses38: (r.lost / g) * 38,
        gf38: (r.gf / g) * 38,
        ga38: (r.ga / g) * 38,
        gd38: (r.gd / g) * 38,
        normPos: (r.pos - 1) / (s.teamCount - 1)
      });
    }
  }

  const seasons42 = seasons.filter((s) => s.gamesPerTeam === 42);
  const seasons38 = seasons.filter((s) => s.gamesPerTeam === 38);
  const teams38 = allTeams.filter((t) => t.gamesPerTeam === 38);

  // 1. Correlations across all 666 team-seasons
  const predictorDefs = [
    { key: 'winRate', rawKey: 'won', label: 'Wins per Game (W/G)', shortLabel: 'Wins / G' },
    { key: 'gdPerGame', rawKey: 'gd', label: 'Goal Difference per Game (GD/G)', shortLabel: 'GD / G' },
    { key: 'gfPerGame', rawKey: 'gf', label: 'Goals For per Game (GF/G)', shortLabel: 'GF / G' },
    { key: 'gaPerGame', rawKey: 'ga', label: 'Goals Against per Game (GA/G)', shortLabel: 'GA / G' },
    { key: 'drawRate', rawKey: 'drawn', label: 'Draws per Game (D/G)', shortLabel: 'Draws / G' }
  ];

  const ppgArr = allTeams.map((t) => t.ppg);
  const posArr = allTeams.map((t) => t.pos);
  const correlations = predictorDefs.map((def) => {
    const vals = allTeams.map((t) => t[def.key]);
    const rPpg = pearson(vals, ppgArr);
    const rPos = pearson(vals, posArr);
    const rhoPos = spearman(vals, posArr);
    const vals38 = teams38.map((t) => t[def.rawKey]);
    const rPts38 = pearson(vals38, teams38.map((t) => t.points));
    const rPos38 = pearson(vals38, teams38.map((t) => t.pos));
    return {
      ...def,
      rPpg,
      r2Ppg: rPpg * rPpg,
      absRPpg: Math.abs(rPpg),
      rPos,
      r2Pos: rPos * rPos,
      absRPos: Math.abs(rPos),
      rhoPos,
      rPts38,
      rPos38
    };
  }).sort((a, b) => b.absRPpg - a.absRPpg);

  // League-leading counts among Champions
  let champMostWins = 0;
  let champBestGd = 0;
  let champMostGf = 0;
  let champFewestGa = 0;
  let champMoreGfThanRunnerUp = 0;
  let champFewerGaThanRunnerUp = 0;

  for (const s of seasons) {
    const maxW = Math.max(...s.table.map((r) => r.won));
    const maxGd = Math.max(...s.table.map((r) => r.gd));
    const maxGf = Math.max(...s.table.map((r) => r.gf));
    const minGa = Math.min(...s.table.map((r) => r.ga));
    const c = s.table[0];
    const ru = s.table[1];
    if (c.won === maxW) champMostWins++;
    if (c.gd === maxGd) champBestGd++;
    if (c.gf === maxGf) champMostGf++;
    if (c.ga === minGa) champFewestGa++;
    if (c.gf > ru.gf) champMoreGfThanRunnerUp++;
    if (c.ga < ru.ga) champFewerGaThanRunnerUp++;
  }

  // 2. Champions vs Runners-up
  const champs = allTeams.filter((t) => t.pos === 1);
  const runnersUp = allTeams.filter((t) => t.pos === 2);

  function statsSummary(arr) {
    return {
      mean: mean(arr),
      median: median(arr),
      q1: quantile(arr, 0.25),
      q3: quantile(arr, 0.75),
      min: Math.min(...arr),
      max: Math.max(...arr)
    };
  }

  const champStats = {
    ppg: statsSummary(champs.map((x) => x.ppg)),
    pts38: statsSummary(champs.map((x) => x.pts38)),
    points: statsSummary(champs.map((x) => x.points)),
    wins38: statsSummary(champs.map((x) => x.wins38)),
    gf38: statsSummary(champs.map((x) => x.gf38)),
    ga38: statsSummary(champs.map((x) => x.ga38)),
    gd38: statsSummary(champs.map((x) => x.gd38))
  };

  const runnerStats = {
    ppg: statsSummary(runnersUp.map((x) => x.ppg)),
    pts38: statsSummary(runnersUp.map((x) => x.pts38)),
    points: statsSummary(runnersUp.map((x) => x.points)),
    wins38: statsSummary(runnersUp.map((x) => x.wins38)),
    gf38: statsSummary(runnersUp.map((x) => x.gf38)),
    ga38: statsSummary(runnersUp.map((x) => x.ga38)),
    gd38: statsSummary(runnersUp.map((x) => x.gd38))
  };

  const eraSplits = [
    {
      id: 'era1',
      name: 'Era I: Early Premier League',
      years: '1992–93 to 2002–03',
      startMin: 1992,
      startMax: 2002
    },
    {
      id: 'era2',
      name: 'Era II: The Big Four',
      years: '2003–04 to 2013–14',
      startMin: 2003,
      startMax: 2013
    },
    {
      id: 'era3',
      name: 'Era III: The Super-Club Era',
      years: '2014–15 to 2024–25',
      startMin: 2014,
      startMax: 2024
    }
  ].map((era) => {
    const cSub = champs.filter((c) => c.startYear >= era.startMin && c.startYear <= era.startMax);
    const rSub = runnersUp.filter((r) => r.startYear >= era.startMin && r.startYear <= era.startMax);
    return {
      ...era,
      count: cSub.length,
      champPpg: mean(cSub.map((x) => x.ppg)),
      champPts38: mean(cSub.map((x) => x.pts38)),
      champWins38: mean(cSub.map((x) => x.wins38)),
      champGf38: mean(cSub.map((x) => x.gf38)),
      champGa38: mean(cSub.map((x) => x.ga38)),
      champGd38: mean(cSub.map((x) => x.gd38)),
      runnerPpg: mean(rSub.map((x) => x.ppg)),
      runnerPts38: mean(rSub.map((x) => x.pts38))
    };
  });

  // 3. Survival & The 40-Point Myth
  const survivalSeries = seasons.map((s) => {
    const surv = s.table.find((r) => r.pos === s.survivalLinePos);
    const rel = s.table.find((r) => r.pos === s.relegationLinePos);
    return {
      season: s.season,
      startYear: s.startYear,
      gamesPerTeam: s.gamesPerTeam,
      survivingPos: surv.pos,
      survivingTeam: surv.team,
      survivingPts: surv.points,
      survivingPts38: (surv.points / s.gamesPerTeam) * 38,
      relegatedPos: rel.pos,
      relegatedTeam: rel.team,
      relegatedPts: rel.points,
      relegatedPts38: (rel.points / s.gamesPerTeam) * 38,
      guaranteedSafePts: rel.points + 1
    };
  });

  const survival38 = survivalSeries.filter((x) => x.gamesPerTeam === 38);
  const surv38Stats = statsSummary(survival38.map((x) => x.survivingPts));
  const rel38Stats = statsSummary(survival38.map((x) => x.relegatedPts));
  const rel40Plus38 = survival38.filter((x) => x.relegatedPts >= 40);
  const rel39Exact38 = survival38.filter((x) => x.relegatedPts === 39);
  const rel35Plus38 = survival38.filter((x) => x.relegatedPts >= 35);
  const survUnder40_38 = survival38.filter((x) => x.survivingPts < 40);
  const recent10RelMean = mean(survival38.slice(-10).map((x) => x.relegatedPts));

  // 4. Draws Analysis
  const seasonDrawLeaders = [];
  for (const s of seasons) {
    const maxD = Math.max(...s.table.map((r) => r.drawn));
    for (const r of s.table.filter((x) => x.drawn === maxD)) {
      seasonDrawLeaders.push({
        season: s.season,
        startYear: s.startYear,
        team: r.team,
        pos: r.pos,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        points: r.points,
        drawRate: r.drawn / r.played,
        relegated: r.relegated
      });
    }
  }

  const highDrawCampaigns = allTeams
    .filter((t) => t.drawRate >= 14 / 38 - 0.0001)
    .sort((a, b) => b.drawRate - a.drawRate || b.drawn - a.drawn);

  // 5. Golden Boot & Top Scorer Concentration
  let champWithGbCount = 0;
  const gbInstances = [];
  for (const s of seasons) {
    const champ = s.table[0];
    if (champ.hasGoldenBootWinner) champWithGbCount++;
    for (const gb of s.goldenBootWinners) {
      const primaryClub = gb.clubs[gb.clubs.length - 1];
      const clubRow = s.table.find((r) => r.team === primaryClub);
      gbInstances.push({
        season: s.season,
        player: gb.player,
        clubDisplay: gb.clubDisplay,
        primaryClub,
        goals: gb.goals,
        pos: clubRow.pos,
        points: clubRow.points,
        isChampion: clubRow.pos === 1
      });
    }
  }

  const top4Teams = allTeams.filter((t) => t.pos <= 4).map((t) => ({
    ...t,
    scorerPlayer: t.topScorer.player,
    scorerGoals: t.topScorer.goals,
    scorerGoalsPerGame: t.topScorer.goals / t.played,
    scorerShare: (t.topScorer.goals / t.gf) * 100
  }));

  const pos1Top4 = top4Teams.filter((t) => t.pos === 1);
  const pos2Top4 = top4Teams.filter((t) => t.pos === 2);
  const pos34Top4 = top4Teams.filter((t) => t.pos === 3 || t.pos === 4);

  const shareStats = {
    champ: statsSummary(pos1Top4.map((x) => x.scorerShare)),
    runner: statsSummary(pos2Top4.map((x) => x.scorerShare)),
    thirdFourth: statsSummary(pos34Top4.map((x) => x.scorerShare)),
    allTop4: statsSummary(top4Teams.map((x) => x.scorerShare)),
    rSharePpgTop4: pearson(top4Teams.map((x) => x.scorerShare), top4Teams.map((x) => x.ppg)),
    rShareGfTop4: pearson(top4Teams.map((x) => x.scorerShare), top4Teams.map((x) => x.gfPerGame)),
    rGbPpgAll: pearson(allTeams.map((x) => (x.hasGoldenBootWinner ? 1 : 0)), allTeams.map((x) => x.ppg)),
    rGbChampAll: pearson(allTeams.map((x) => (x.hasGoldenBootWinner ? 1 : 0)), allTeams.map((x) => (x.pos === 1 ? 1 : 0)))
  };

  return {
    dataset,
    seasons,
    numSeasons,
    firstSeason,
    lastSeason,
    allTeams,
    teams38,
    seasons42,
    seasons38,
    totalMatches,
    totalGoals,
    correlations,
    champMostWins,
    champBestGd,
    champMostGf,
    champFewestGa,
    champMoreGfThanRunnerUp,
    champFewerGaThanRunnerUp,
    champs,
    runnersUp,
    champStats,
    runnerStats,
    eraSplits,
    survivalSeries,
    survival38,
    surv38Stats,
    rel38Stats,
    rel40Plus38,
    rel39Exact38,
    rel35Plus38,
    survUnder40_38,
    recent10RelMean,
    seasonDrawLeaders,
    highDrawCampaigns,
    champWithGbCount,
    gbInstances,
    top4Teams,
    pos1Top4,
    pos2Top4,
    pos34Top4,
    shareStats
  };
}

/* ==========================================================================
   POPULATE MASTHEAD, LEDGER & PROSE (100% COMPUTED FROM JSON)
   ========================================================================== */
function renderEditorialCopy(m) {
  // Masthead metadata
  document.getElementById('meta-coverage').textContent =
    `${m.firstSeason}–${m.lastSeason} (${m.numSeasons} Seasons · ${m.allTeams.length} Team-Seasons)`;
  document.getElementById('meta-matches').textContent =
    `${m.totalMatches.toLocaleString()} Matches Aggregated`;
  document.getElementById('meta-goals').textContent =
    `${m.totalGoals.toLocaleString()} Goals Scored`;

  const deductionsCount = m.dataset.metadata.structuralRules.pointsDeductions.length;
  document.getElementById('normalisation-banner').innerHTML = `
    <div><strong>Structural Normalisation:</strong> ${m.seasons42.length} seasons (${m.seasons42[0].season}–${m.seasons42[m.seasons42.length - 1].season}) contested ${m.seasons42[0].gamesPerTeam} games across ${m.seasons42[0].teamCount} clubs (${m.seasons42.length * m.seasons42[0].teamCount} team-seasons, with 4 clubs relegated in 1994–95); the subsequent ${m.seasons38.length} seasons contested ${m.seasons38[0].gamesPerTeam} games across ${m.seasons38[0].teamCount} clubs (${m.seasons38.length * m.seasons38[0].teamCount} team-seasons). Cross-era comparisons normalise to per-game rates (and 38-game equivalents). All ${deductionsCount} historical points deductions are preserved in official standings.</div>
  `;

  // Executive Ledger
  document.getElementById('ledger-sample-note').textContent =
    `n = ${m.allTeams.length} team-seasons across ${m.numSeasons} completed campaigns`;

  const corrGf = m.correlations.find((c) => c.key === 'gfPerGame');
  const corrGa = m.correlations.find((c) => c.key === 'gaPerGame');
  const corrW = m.correlations.find((c) => c.key === 'winRate');
  const corrGd = m.correlations.find((c) => c.key === 'gdPerGame');
  const corrD = m.correlations.find((c) => c.key === 'drawRate');

  const gfAdvantageR2 = ((corrGf.r2Ppg - corrGa.r2Ppg) * 100).toFixed(1);
  const gfDiff38 = (m.champStats.gf38.mean - m.runnerStats.gf38.mean).toFixed(1);
  const gaDiff38 = Math.abs(m.champStats.ga38.mean - m.runnerStats.ga38.mean).toFixed(1);
  const drawLeaderMeanPos = mean(m.seasonDrawLeaders.map((x) => x.pos)).toFixed(1);
  const drawLeaderMedPos = median(m.seasonDrawLeaders.map((x) => x.pos)).toFixed(0);
  const drawLeaderBottomHalfPct = (
    (m.seasonDrawLeaders.filter((x) => x.pos >= 11).length / m.seasonDrawLeaders.length) * 100
  ).toFixed(1);
  const gbChampPct = ((m.champWithGbCount / m.numSeasons) * 100).toFixed(1);

  const ledgerCards = [
    {
      idx: '01 / Predictor Rank',
      stat: `${(corrGf.r2Ppg * 100).toFixed(1)}% vs ${(corrGa.r2Ppg * 100).toFixed(1)}%`,
      claim: 'Goals For out-predicts Goals Against; Wins rule all.',
      detail: `Across ${m.allTeams.length} team-seasons, Wins/G (${fmtSigned(corrW.rPpg, 3)}, R² ${(corrW.r2Ppg * 100).toFixed(1)}%) and GD/G (${fmtSigned(corrGd.rPpg, 3)}, R² ${(corrGd.r2Ppg * 100).toFixed(1)}%) lead. GF/G explains ${gfAdvantageR2} percentage points more PPG variance than GA/G.`
    },
    {
      idx: '02 / The Title Separation',
      stat: `+${gfDiff38} GF vs −${gaDiff38} GA`,
      claim: '1st and 2nd place have virtually identical defences.',
      detail: `Champions and runners-up concede almost the exact same goals per 38 games (${m.champStats.ga38.mean.toFixed(1)} vs ${m.runnerStats.ga38.mean.toFixed(1)}; median ${m.champStats.ga38.median.toFixed(0)} vs ${m.runnerStats.ga38.median.toFixed(0)}). Champions separate by scoring +${gfDiff38} more goals and winning ${m.champStats.wins38.mean.toFixed(1)} vs ${m.runnerStats.wins38.mean.toFixed(1)} games.`
    },
    {
      idx: '03 / Survival Threshold',
      stat: `${m.rel38Stats.mean.toFixed(1)} pts`,
      claim: 'Average 18th-place relegated total in the 38-game era.',
      detail: `Median 18th-place points is ${m.rel38Stats.median.toFixed(0)} (so ${m.rel38Stats.median + 1} points is the typical total needed to finish above 18th, not a guarantee: it would have fallen short in ${m.rel35Plus38.length} of ${m.survival38.length} seasons). Only ${m.rel40Plus38.length} of ${m.survival38.length} seasons saw a team relegated with 40+ points, and none since 2002–03.`
    },
    {
      idx: '04 / The Stalemate Penalty',
      stat: `r = ${fmtSigned(corrD.rPpg, 3)}`,
      claim: `Season draw-leaders finish at an average position of ${drawLeaderMeanPos}.`,
      detail: `Draws rank 5th of 5 predictors (R² ${(corrD.r2Ppg * 100).toFixed(1)}%). Across ${m.seasonDrawLeaders.length} season draw-leaders, median finish is ${drawLeaderMedPos}th, ${drawLeaderBottomHalfPct}% finish bottom-half, and 0 have won the league.`
    },
    {
      idx: '05 / Golden Boot Myth',
      stat: `${m.champWithGbCount} / ${m.numSeasons} (${gbChampPct}%)`,
      claim: 'Share of champions that contained the Golden Boot winner.',
      detail: `In ${m.numSeasons - m.champWithGbCount} of ${m.numSeasons} seasons, the top scorer played elsewhere. Within the Top 4 (n=${m.top4Teams.length}), top-scorer goal share averages ${m.shareStats.allTop4.mean.toFixed(1)}% and correlates at r = ${fmtSigned(m.shareStats.rSharePpgTop4, 3)} with PPG.`
    }
  ];

  document.getElementById('ledger-grid').innerHTML = ledgerCards
    .map(
      (c) => `
      <article class="ledger-card">
        <div>
          <div class="ledger-index">${c.idx}</div>
          <div class="ledger-stat num">${c.stat}</div>
          <h3 class="ledger-claim">${c.claim}</h3>
        </div>
        <p class="ledger-detail">${c.detail}</p>
      </article>
    `
    )
    .join('');

  // Section 1 Prose & Callout
  document.getElementById('sec1-prose').innerHTML = `
    <p>
      Correlating per-game rates across all <strong>${m.allTeams.length} team-seasons</strong> (${m.firstSeason} to ${m.lastSeason}) produces an unambiguous hierarchy. <strong>Wins per game</strong> ranks first against both Points per Game (<strong>r = ${fmtSigned(corrW.rPpg, 4)}</strong>, R² = ${(corrW.r2Ppg * 100).toFixed(1)}%) and finishing position (<strong>r = ${fmtSigned(corrW.rPos, 4)}</strong>, Spearman ρ = ${fmtSigned(corrW.rhoPos, 4)}), followed closely by <strong>Goal Difference per game</strong> (<strong>r = ${fmtSigned(corrGd.rPpg, 4)}</strong> with PPG, <strong>r = ${fmtSigned(corrGd.rPos, 4)}</strong> with position). In fact, in <strong>${m.champMostWins} of ${m.numSeasons} seasons (100.0%)</strong>, the Premier League champion led or co-led the division in wins—no club has ever won the title with fewer victories than a rival by bridging the gap with draws.
    </p>
    <p>
      The two results that overturn football orthodoxy sit at ranks three, four, and five. First, <strong>Goals For per game (r = ${fmtSigned(corrGf.rPpg, 4)}, R² = ${(corrGf.r2Ppg * 100).toFixed(1)}%) is substantially more predictive than Goals Against per game (r = ${fmtSigned(corrGa.rPpg, 4)}, R² = ${(corrGa.r2Ppg * 100).toFixed(1)}%)</strong>—explaining <strong>${gfAdvantageR2} percentage points more variance</strong> in points per game. Moreover, <strong>${m.champMostGf} of ${m.numSeasons} champions (${((m.champMostGf / m.numSeasons) * 100).toFixed(1)}%)</strong> boasted the league's highest-scoring attack, whereas only <strong>${m.champFewestGa} of ${m.numSeasons} (${((m.champFewestGa / m.numSeasons) * 100).toFixed(1)}%)</strong> had the stingiest defence. Second, <strong>Draws per game ranks dead last (5th of 5)</strong> and carries a <em>negative</em> correlation with points per game (<strong>r = ${fmtSigned(corrD.rPpg, 4)}</strong>, R² = ${(corrD.r2Ppg * 100).toFixed(1)}%) and worse league placement (<strong>r = ${fmtSigned(corrD.rPos, 4)}</strong>).
    </p>
  `;

  document.getElementById('sec1-callout-list').innerHTML = m.correlations
    .map(
      (c, i) => `
      <dt>#${i + 1} ${c.shortLabel}</dt>
      <dd>r = ${fmtSigned(c.rPpg, 3)} · R² ${(c.r2Ppg * 100).toFixed(1)}% · r(Pos) ${fmtSigned(c.rPos, 3)}</dd>
    `
    )
    .join('') + `
      <dt style="border-block-start: 1px solid var(--rule-light); padding-block-start: 0.4rem;">Champion #1 GF vs #1 GA</dt>
      <dd style="border-block-start: 1px solid var(--rule-light); padding-block-start: 0.4rem;">${m.champMostGf}/${m.numSeasons} (${((m.champMostGf / m.numSeasons) * 100).toFixed(0)}%) vs ${m.champFewestGa}/${m.numSeasons} (${((m.champFewestGa / m.numSeasons) * 100).toFixed(0)}%)</dd>
    `;

  // Populate Section 1 Table
  document.getElementById('sec1-corr-tbody').innerHTML = m.correlations
    .map(
      (c, idx) => `
      <tr>
        <th scope="row" class="text-col">#${idx + 1} ${c.shortLabel}</th>
        <td>${fmtSigned(c.rPpg, 4)}</td>
        <td>${(c.r2Ppg * 100).toFixed(1)}%</td>
        <td>${fmtSigned(c.rPos, 4)}</td>
        <td>${fmtSigned(c.rhoPos, 4)}</td>
      </tr>
    `
    )
    .join('');

  // Section 2 Prose, Callout & Era Cards
  const e1 = m.eraSplits[0];
  const e2 = m.eraSplits[1];
  const e3 = m.eraSplits[2];
  const ru90Count = m.runnersUp.filter((r) => r.pts38 >= 89.5).length;

  document.getElementById('sec2-prose').innerHTML = `
    <p>
      On a 38-game normalised basis across all ${m.numSeasons} seasons, the typical Premier League champion finishes on <strong>${m.champStats.pts38.mean.toFixed(1)} points</strong> (median <strong>${m.champStats.pts38.median.toFixed(1)}</strong>, <strong>${m.champStats.ppg.mean.toFixed(2)} PPG</strong>), winning <strong>${m.champStats.wins38.mean.toFixed(1)} matches</strong> with <strong>${m.champStats.gf38.mean.toFixed(1)} goals scored</strong>, <strong>${m.champStats.ga38.mean.toFixed(1)} goals conceded</strong>, and a <strong>+${m.champStats.gd38.mean.toFixed(1)} goal difference</strong>.
    </p>
    <p>
      Comparing champions directly against runners-up exposes the true separator at the top of the table. Runners-up average <strong>${m.runnerStats.ga38.mean.toFixed(1)} goals against per 38 games</strong> (median <strong>${m.runnerStats.ga38.median.toFixed(0)}</strong>)—virtually indistinguishable from champions' <strong>${m.champStats.ga38.mean.toFixed(1)}</strong> (median <strong>${m.champStats.ga38.median.toFixed(0)}</strong>). In <strong>${m.numSeasons - m.champFewerGaThanRunnerUp} of ${m.numSeasons} seasons (${(((m.numSeasons - m.champFewerGaThanRunnerUp) / m.numSeasons) * 100).toFixed(1)}%)</strong>, the runner-up conceded as few or fewer goals than the champion. What separates 1st from 2nd is attacking ceiling: champions outscore runners-up by <strong>+${gfDiff38} goals per 38 games</strong> (${m.champStats.gf38.mean.toFixed(1)} vs ${m.runnerStats.gf38.mean.toFixed(1)}) and turn stalemates into <strong>+${(m.champStats.wins38.mean - m.runnerStats.wins38.mean).toFixed(1)} extra wins</strong> (${m.champStats.wins38.mean.toFixed(1)} vs ${m.runnerStats.wins38.mean.toFixed(1)}).
    </p>
    <p>
      And the title standard has inflated dramatically. Across the first 11 seasons (${e1.years}), champions averaged <strong>${e1.champPts38.toFixed(1)} points per 38 games</strong> (${e1.champPpg.toFixed(2)} PPG). In the middle 11 seasons (${e2.years}), that rose to <strong>${e2.champPts38.toFixed(1)} points</strong> (${e2.champPpg.toFixed(2)} PPG). Over the last 11 seasons (${e3.years}), champions have averaged <strong>${e3.champPts38.toFixed(1)} points per 38 games</strong> (${e3.champPpg.toFixed(2)} PPG, +${e3.champGd38.toFixed(1)} GD), forcing modern contenders into near-perfection.
    </p>
  `;

  document.getElementById('sec2-callout-list').innerHTML = `
    <dt>Champion Points / 38g</dt>
    <dd>${m.champStats.pts38.mean.toFixed(1)} (med ${m.champStats.pts38.median.toFixed(0)}, ${m.champStats.ppg.mean.toFixed(2)} PPG)</dd>
    <dt>Runner-Up Points / 38g</dt>
    <dd>${m.runnerStats.pts38.mean.toFixed(1)} (med ${m.runnerStats.pts38.median.toFixed(1)}, ${m.runnerStats.ppg.mean.toFixed(2)} PPG)</dd>
    <dt>Wins / 38g (1st vs 2nd)</dt>
    <dd>${m.champStats.wins38.mean.toFixed(1)} vs ${m.runnerStats.wins38.mean.toFixed(1)} (+${(m.champStats.wins38.mean - m.runnerStats.wins38.mean).toFixed(1)})</dd>
    <dt>Goals For / 38g (1st vs 2nd)</dt>
    <dd>${m.champStats.gf38.mean.toFixed(1)} vs ${m.runnerStats.gf38.mean.toFixed(1)} (+${gfDiff38})</dd>
    <dt>Goals Against / 38g (1st vs 2nd)</dt>
    <dd>${m.champStats.ga38.mean.toFixed(1)} vs ${m.runnerStats.ga38.mean.toFixed(1)} (−${gaDiff38})</dd>
    <dt>Goal Diff / 38g (1st vs 2nd)</dt>
    <dd>+${m.champStats.gd38.mean.toFixed(1)} vs +${m.runnerStats.gd38.mean.toFixed(1)}</dd>
  `;

  document.getElementById('sec2-era-cards').innerHTML = m.eraSplits
    .map(
      (e, idx) => `
      <div class="era-card ${idx === 2 ? 'era-modern' : ''}">
        <div class="era-card-label">${e.name} (${e.count} Seasons)</div>
        <h4 class="era-card-years">${e.years}</h4>
        <dl class="finding-kv-list">
          <dt>Champion Mean Pts/38g</dt>
          <dd>${e.champPts38.toFixed(1)} (${e.champPpg.toFixed(2)} PPG)</dd>
          <dt>Runner-Up Mean Pts/38g</dt>
          <dd>${e.runnerPts38.toFixed(1)} (${e.runnerPpg.toFixed(2)} PPG)</dd>
          <dt>Champion Wins / 38g</dt>
          <dd>${e.champWins38.toFixed(1)}</dd>
          <dt>Champion GF : GA / 38g</dt>
          <dd>${e.champGf38.toFixed(1)} : ${e.champGa38.toFixed(1)} (+${e.champGd38.toFixed(1)})</dd>
        </dl>
      </div>
    `
    )
    .join('');

  // Populate Section 2 Distribution Table
  const distRows = [
    { label: 'Points / 38g', c: m.champStats.pts38, r: m.runnerStats.pts38, dec: 1 },
    { label: 'Points / Game (PPG)', c: m.champStats.ppg, r: m.runnerStats.ppg, dec: 2 },
    { label: 'Wins / 38g', c: m.champStats.wins38, r: m.runnerStats.wins38, dec: 1 },
    { label: 'Goals For / 38g', c: m.champStats.gf38, r: m.runnerStats.gf38, dec: 1 },
    { label: 'Goals Against / 38g', c: m.champStats.ga38, r: m.runnerStats.ga38, dec: 1 },
    { label: 'Goal Difference / 38g', c: m.champStats.gd38, r: m.runnerStats.gd38, dec: 1 }
  ];

  document.getElementById('sec2-dist-tbody').innerHTML = distRows
    .map(
      (row) => `
      <tr>
        <th scope="row" class="text-col" rowspan="2">${row.label}</th>
        <td class="text-col" style="color: var(--accent-champ); font-weight: 600;">1st (Champ)</td>
        <td>${row.c.mean.toFixed(row.dec)}</td>
        <td>${row.c.median.toFixed(row.dec)}</td>
        <td>${row.c.q1.toFixed(row.dec)}–${row.c.q3.toFixed(row.dec)}</td>
        <td>${row.c.min.toFixed(row.dec)}–${row.c.max.toFixed(row.dec)}</td>
      </tr>
      <tr>
        <td class="text-col" style="color: var(--accent-runner); font-weight: 600;">2nd (Runner-Up)</td>
        <td>${row.r.mean.toFixed(row.dec)}</td>
        <td>${row.r.median.toFixed(row.dec)}</td>
        <td>${row.r.q1.toFixed(row.dec)}–${row.r.q3.toFixed(row.dec)}</td>
        <td>${row.r.min.toFixed(row.dec)}–${row.r.max.toFixed(row.dec)}</td>
      </tr>
    `
    )
    .join('');

  // Section 3 Prose & Callout
  const rel40Names = m.rel40Plus38.map((x) => `${x.relegatedTeam} in ${x.season} (${x.relegatedPts} pts)`).join(', ');
  document.getElementById('sec3-prose').innerHTML = `
    <p>
      The "40-point mark" is English football's most durable numerological myth. Across the <strong>${m.survival38.length} seasons of the 38-game era</strong> (1995–96 to 2024–25), the highest relegated team (18th place) has averaged just <strong>${m.rel38Stats.mean.toFixed(1)} points</strong> (median <strong>${m.rel38Stats.median.toFixed(0)} points</strong>, IQR ${m.rel38Stats.q1.toFixed(0)}–${m.rel38Stats.q3.toFixed(0)}, range ${m.rel38Stats.min} to ${m.rel38Stats.max}). That means the points total needed to finish above 18th place outright, without relying on goal difference, has averaged <strong>${(m.rel38Stats.mean + 1).toFixed(1)} points</strong> (median <strong>${m.rel38Stats.median + 1} points</strong>). Treat 35 as a typical mark, not a safe line: it would not have beaten 18th place in <strong>${m.rel35Plus38.length} of ${m.survival38.length} seasons</strong>. Meanwhile, the lowest surviving team (17th place) has averaged <strong>${m.surv38Stats.mean.toFixed(1)} points</strong> (median <strong>${m.surv38Stats.median.toFixed(0)}</strong>), finishing below 40 points in <strong>${m.survUnder40_38.length} of ${m.survival38.length} seasons (${((m.survUnder40_38.length / m.survival38.length) * 100).toFixed(1)}%)</strong>.
    </p>
    <p>
      How often has a club gone down on 40 points or more in a 38-game season? Only <strong>${m.rel40Plus38.length} times in ${m.survival38.length} seasons (${((m.rel40Plus38.length / m.survival38.length) * 100).toFixed(1)}%)</strong>: ${rel40Names}. One more club went down on 39 (${m.rel39Exact38.map((x) => `${x.relegatedTeam} in ${x.season}`).join(', ')}), when 40 points would have been enough to finish above 18th. <strong>No club has been relegated with 40 or more points since 2002–03 (${m.survival38.length - 8} consecutive seasons)</strong>. As super-clubs have hoovered up points at the top of the pyramid, the bottom has compressed downward: over the last 10 seasons (2015–16 to 2024–25), the average 18th-place total has fallen to <strong>${m.recent10RelMean.toFixed(1)} points</strong>, bottoming out at 26 points (Luton Town, 2023–24) and 25 points (Leicester City, 2024–25).
    </p>
  `;

  document.getElementById('sec3-callout-list').innerHTML = `
    <dt>18th Place Mean / Median (38g)</dt>
    <dd>${m.rel38Stats.mean.toFixed(1)} / ${m.rel38Stats.median.toFixed(0)} pts (range ${m.rel38Stats.min}–${m.rel38Stats.max})</dd>
    <dt>17th Place Mean / Median (38g)</dt>
    <dd>${m.surv38Stats.mean.toFixed(1)} / ${m.surv38Stats.median.toFixed(0)} pts (range ${m.surv38Stats.min}–${m.surv38Stats.max})</dd>
    <dt>Needed to Beat 18th (18th + 1)</dt>
    <dd>${(m.rel38Stats.mean + 1).toFixed(1)} mean / ${m.rel38Stats.median + 1} median pts (not enough in ${m.rel35Plus38.length} of ${m.survival38.length} seasons at 35)</dd>
    <dt>Relegated with ≥ 40 pts (38g)</dt>
    <dd>${m.rel40Plus38.length} of ${m.survival38.length} seasons (0 since 2002–03)</dd>
    <dt>Survived with &lt; 40 pts (17th)</dt>
    <dd>${m.survUnder40_38.length} of ${m.survival38.length} seasons (${((m.survUnder40_38.length / m.survival38.length) * 100).toFixed(1)}%)</dd>
    <dt>Last 10 Seasons 18th Mean</dt>
    <dd>${m.recent10RelMean.toFixed(1)} pts (2015–16 to 2024–25)</dd>
  `;

  // Section 4 Prose, Callout & Table
  const dlTop4 = m.seasonDrawLeaders.filter((x) => x.pos <= 4);
  const dlRel = m.seasonDrawLeaders.filter((x) => x.relegated);

  document.getElementById('sec4-prose').innerHTML = `
    <p>
      Under three points for a win, a draw destroys two-thirds of the value of a fixture. Across all ${m.numSeasons} seasons, <strong>${m.seasonDrawLeaders.length} clubs</strong> have led or co-led their campaign in draws. Their average finishing position is <strong>${drawLeaderMeanPos}</strong> (median <strong>${drawLeaderMedPos}th</strong>). Not a single season draw-leader has ever finished 1st or 2nd.
    </p>
    <p>
      Only <strong>${dlTop4.length} of the ${m.seasonDrawLeaders.length} season draw-leaders (${((dlTop4.length / m.seasonDrawLeaders.length) * 100).toFixed(1)}%)</strong> managed a Top-Four finish: ${dlTop4.map((x) => `${x.team} in ${x.season} (${x.pos}${x.pos === 3 ? 'rd' : 'th'}, ${x.drawn}D)`).join('; ')}. Conversely, <strong>${m.seasonDrawLeaders.filter((x) => x.pos >= 11).length} of ${m.seasonDrawLeaders.length} (${drawLeaderBottomHalfPct}%)</strong> finished in the bottom half of the division, and <strong>${dlRel.length}</strong> were relegated outright (${dlRel.map((x) => `${x.season} ${x.team}, ${x.drawn}D`).join('; ')}). Drawing heavily does not build a platform for contention—it anchors a team to mid-table or the drop zone.
    </p>
  `;

  document.getElementById('sec4-callout-list').innerHTML = `
    <dt>Season Draw Leaders (incl. ties)</dt>
    <dd>${m.seasonDrawLeaders.length} club-seasons across ${m.numSeasons} yrs</dd>
    <dt>Mean / Median Finish</dt>
    <dd>${drawLeaderMeanPos} / ${drawLeaderMedPos}th place</dd>
    <dt>Won Title or Finished 2nd</dt>
    <dd>0 of ${m.seasonDrawLeaders.length} (0.0%)</dd>
    <dt>Finished in Top 4</dt>
    <dd>${dlTop4.length} of ${m.seasonDrawLeaders.length} (${((dlTop4.length / m.seasonDrawLeaders.length) * 100).toFixed(1)}%)</dd>
    <dt>Finished Bottom Half (11th–22nd)</dt>
    <dd>${m.seasonDrawLeaders.filter((x) => x.pos >= 11).length} of ${m.seasonDrawLeaders.length} (${drawLeaderBottomHalfPct}%)</dd>
    <dt>Relegated as Draw Leader</dt>
    <dd>${dlRel.length} club-seasons</dd>
  `;

  document.getElementById('sec4-draws-tbody').innerHTML = m.highDrawCampaigns
    .map(
      (t) => `
      <tr class="${t.relegated ? 'row-relegated' : ''}">
        <td class="text-col">${t.season}</td>
        <th scope="row" class="text-col">${t.team}${t.relegated ? '<span class="badge badge-rel">R</span>' : t.pos <= 4 ? '<span class="badge badge-top4">Top 4</span>' : ''}</th>
        <td>${t.pos}</td>
        <td><strong>${t.drawn}</strong></td>
        <td>${(t.drawRate * 100).toFixed(1)}%</td>
        <td>${t.won}–${t.drawn}–${t.lost}</td>
        <td>${t.points}</td>
      </tr>
    `
    )
    .join('');

  // Section 5 Prose, Callout & Table
  const gb1st = m.gbInstances.filter((x) => x.pos === 1).length;
  const gb2nd = m.gbInstances.filter((x) => x.pos === 2).length;
  const gb34 = m.gbInstances.filter((x) => x.pos === 3 || x.pos === 4).length;
  const gbOutTop4 = m.gbInstances.filter((x) => x.pos >= 5).length;

  document.getElementById('sec5-prose').innerHTML = `
    <p>
      How often does the Premier League champion employ the Golden Boot winner? In <strong>${m.champWithGbCount} of ${m.numSeasons} seasons (${gbChampPct}%)</strong>. In the other <strong>${m.numSeasons - m.champWithGbCount} seasons (${(100 - parseFloat(gbChampPct)).toFixed(1)}%)</strong>, the league's leading marksman played for a non-champion. Across all <strong>${m.gbInstances.length} Golden Boot winner-seasons</strong> (accounting for shared boots in 1997–98, 1998–99, 2010–11, 2018–19, and 2021–22), <strong>${gb1st}</strong> finished 1st (${((gb1st / m.gbInstances.length) * 100).toFixed(1)}%), <strong>${gb2nd}</strong> finished 2nd (${((gb2nd / m.gbInstances.length) * 100).toFixed(1)}%), <strong>${gb34}</strong> finished 3rd or 4th (${((gb34 / m.gbInstances.length) * 100).toFixed(1)}%), and <strong>${gbOutTop4} (${((gbOutTop4 / m.gbInstances.length) * 100).toFixed(1)}%) finished outside the Top Four altogether</strong>.
    </p>
    <p>
      Comparing the club top scorer's share of team league goals across all <strong>${m.top4Teams.length} Top-Four team-seasons</strong> shows how similarly elite attacks distribute scoring: <strong>Champions average ${m.shareStats.champ.mean.toFixed(1)}%</strong> (median <strong>${m.shareStats.champ.median.toFixed(1)}%</strong>), <strong>Runners-up average ${m.shareStats.runner.mean.toFixed(1)}%</strong> (median <strong>${m.shareStats.runner.median.toFixed(1)}%</strong>), and <strong>3rd/4th-place clubs average ${m.shareStats.thirdFourth.mean.toFixed(1)}%</strong> (median <strong>${m.shareStats.thirdFourth.median.toFixed(1)}%</strong>).
    </p>
    <p>
      What is the honest correlation? Across all ${m.allTeams.length} team-seasons, employing the Golden Boot winner correlates modestly with PPG (<strong>r = ${fmtSigned(m.shareStats.rGbPpgAll, 3)}</strong>, R² = ${(m.shareStats.rGbPpgAll ** 2 * 100).toFixed(1)}%) and winning the title (<strong>r = ${fmtSigned(m.shareStats.rGbChampAll, 3)}</strong>) because Golden Boot winners play for high-volume attacks. <strong>Within the Top Four (n=${m.top4Teams.length}), however, higher single-scorer goal share correlates slightly negatively with both Points per Game (r = ${fmtSigned(m.shareStats.rSharePpgTop4, 3)}) and team scoring rate (r = ${fmtSigned(m.shareStats.rShareGfTop4, 3)})</strong>—proving that multi-threat attacks (such as 2020–21 and 2021–22 Manchester City at 15.7% and 15.2%, or 2004–05 Chelsea at 18.1%) are just as lethal as single-spearhead champions (1994–95 Blackburn at 42.5%, 2003–04 Arsenal at 41.1%, or 2022–23 Manchester City at 38.3%).
    </p>
  `;

  document.getElementById('sec5-callout-list').innerHTML = `
    <dt>Champion Has Golden Boot</dt>
    <dd>${m.champWithGbCount} / ${m.numSeasons} seasons (${gbChampPct}%)</dd>
    <dt>GB Winner Finishes (n=${m.gbInstances.length})</dt>
    <dd>1st: ${gb1st} · 2nd: ${gb2nd} · 3rd–4th: ${gb34} · 5th+: ${gbOutTop4}</dd>
    <dt>1st Place Top-Scorer Share</dt>
    <dd>${m.shareStats.champ.mean.toFixed(1)}% mean / ${m.shareStats.champ.median.toFixed(1)}% med</dd>
    <dt>2nd Place Top-Scorer Share</dt>
    <dd>${m.shareStats.runner.mean.toFixed(1)}% mean / ${m.shareStats.runner.median.toFixed(1)}% med</dd>
    <dt>3rd–4th Top-Scorer Share</dt>
    <dd>${m.shareStats.thirdFourth.mean.toFixed(1)}% mean / ${m.shareStats.thirdFourth.median.toFixed(1)}% med</dd>
    <dt>r(Scorer Share, PPG) in Top 4</dt>
    <dd>${fmtSigned(m.shareStats.rSharePpgTop4, 3)} (all-league GB r = ${fmtSigned(m.shareStats.rGbPpgAll, 3)})</dd>
  `;

  // Populate Section 5 Golden Boot Table
  document.getElementById('sec5-gb-tbody').innerHTML = m.seasons
    .slice()
    .reverse()
    .map((s) => {
      const champ = s.table[0];
      const gbNames = s.goldenBootWinners.map((g) => `${g.player} (${g.clubDisplay})`).join('; ');
      const gbPositions = s.goldenBootWinners
        .map((g) => {
          const cName = g.clubs[g.clubs.length - 1];
          const r = s.table.find((x) => x.team === cName);
          return `${cName} (${r.pos}${r.pos === 1 ? 'st' : r.pos === 2 ? 'nd' : r.pos === 3 ? 'rd' : 'th'})`;
        })
        .join('; ');
      const champShare = ((champ.topScorer.goals / champ.gf) * 100).toFixed(1);
      return `
        <tr class="${champ.hasGoldenBootWinner ? 'row-champion' : ''}">
          <td class="text-col">${s.season}</td>
          <th scope="row" class="text-col">${gbNames}</th>
          <td><strong>${s.goldenBootGoals}</strong></td>
          <td class="text-col">${gbPositions}</td>
          <td class="text-col">${champ.team} — ${champ.topScorer.player} (${champ.topScorer.goals}/${champ.gf}, ${champShare}%)</td>
        </tr>
      `;
    })
    .join('');

  document.getElementById('archive-season-count').textContent = `${m.numSeasons}`;
  document.getElementById('footer-verification-note').textContent =
    `Verified against official Premier League tables & Football-Data.co.uk match records (${m.allTeams.length} team-seasons, 0 discrepancies).`;
}

/* ==========================================================================
   SECTION 1 CHARTS: SCATTER PLOT (666 TEAM-SEASONS) & PREDICTOR BARS
   ========================================================================== */
function renderSec1Scatter(m, metricKey = 'gfPerGame', targetKey = 'ppg') {
  const container = document.getElementById('chart-sec1-scatter');
  const metaMap = {
    gfPerGame: { label: 'Goals For per Game (GF/G)', unit: 'GF/G', digits: 2 },
    gaPerGame: { label: 'Goals Against per Game (GA/G)', unit: 'GA/G', digits: 2 },
    gdPerGame: { label: 'Goal Difference per Game (GD/G)', unit: 'GD/G', digits: 2 },
    winRate: { label: 'Wins per Game (W/G)', unit: 'W/G', digits: 2 },
    drawRate: { label: 'Draws per Game (D/G)', unit: 'D/G', digits: 2 }
  };
  const xMeta = metaMap[metricKey];
  const isPos = targetKey === 'pos';
  const yLabel = isPos ? 'Finishing Position (1st at top)' : 'Points per Game (PPG)';

  const xVals = m.allTeams.map((t) => t[metricKey]);
  const yVals = m.allTeams.map((t) => (isPos ? t.pos : t.ppg));
  const r = pearson(xVals, yVals);
  const r2 = r * r;
  const rho = spearman(xVals, yVals);
  const { slope, intercept } = olsFit(xVals, yVals);

  document.getElementById('sec1-scatter-subtitle').textContent =
    `${xMeta.label} vs. ${yLabel} across all ${m.allTeams.length} team-seasons · Pearson r = ${fmtSigned(r, 4)} (R² = ${(r2 * 100).toFixed(1)}%), Spearman ρ = ${fmtSigned(rho, 4)}`;

  const W = 680;
  const H = 400;
  const pad = { top: 24, right: 28, bottom: 48, left: 56 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const xMin = Math.min(...xVals);
  const xMax = Math.max(...xVals);
  const xSpan = xMax - xMin || 1;
  const xDomainMin = xMin - xSpan * 0.05;
  const xDomainMax = xMax + xSpan * 0.05;

  const yDomainMin = isPos ? 0.5 : 0.2;
  const yDomainMax = isPos ? 22.5 : 2.75;

  const scaleX = (v) => pad.left + ((v - xDomainMin) / (xDomainMax - xDomainMin)) * plotW;
  const scaleY = (v) =>
    isPos
      ? pad.top + ((v - yDomainMin) / (yDomainMax - yDomainMin)) * plotH
      : pad.top + (1 - (v - yDomainMin) / (yDomainMax - yDomainMin)) * plotH;

  // Grid ticks
  const xTicks = [];
  const xStep = (xDomainMax - xDomainMin) / 6;
  for (let i = 0; i <= 6; i++) {
    xTicks.push(xDomainMin + i * xStep);
  }
  const yTicks = isPos ? [1, 4, 8, 12, 17, 20, 22] : [0.5, 1.0, 1.5, 2.0, 2.5];

  // Regression line endpoints clipped to plot domain
  const lineX1 = xMin;
  const lineY1 = intercept + slope * lineX1;
  const lineX2 = xMax;
  const lineY2 = intercept + slope * lineX2;

  // Sort points so Champions & Runners-up render on top of mid-table dots
  const orderedTeams = [...m.allTeams].sort((a, b) => {
    const prio = (t) => (t.pos === 1 ? 4 : t.pos === 2 ? 3 : t.relegated ? 2 : t.pos <= 4 ? 1 : 0);
    return prio(a) - prio(b);
  });

  const dotsSvg = orderedTeams
    .map((t) => {
      const cx = scaleX(t[metricKey]).toFixed(1);
      const cy = scaleY(isPos ? t.pos : t.ppg).toFixed(1);
      let fill = 'var(--accent-neutral)';
      let radius = 3.3;
      let opacity = 0.52;
      if (t.pos === 1) {
        fill = 'var(--accent-champ)';
        radius = 5.2;
        opacity = 0.95;
      } else if (t.pos === 2) {
        fill = 'var(--accent-runner)';
        radius = 4.2;
        opacity = 0.85;
      } else if (t.pos <= 4) {
        fill = 'var(--accent-top4)';
        radius = 3.8;
        opacity = 0.75;
      } else if (t.relegated) {
        fill = 'var(--accent-rel)';
        radius = 3.8;
        opacity = 0.78;
      }
      const tip = `<strong>${t.season} ${t.team} (Pos ${t.pos})</strong>Pts: ${t.points} (${t.ppg.toFixed(2)} PPG, ${t.pts38.toFixed(1)}/38g)<br>W–D–L: ${t.won}–${t.drawn}–${t.lost} (${t.played}g)<br>GF–GA: ${t.gf}–${t.ga} (GD ${t.gd >= 0 ? '+' + t.gd : t.gd})<br>${xMeta.unit}: ${t[metricKey].toFixed(3)}`;
      return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" fill-opacity="${opacity}" stroke="#fcfbf8" stroke-width="0.6" tabindex="0" data-tip="${tip.replace(/"/g, '&quot;')}"></circle>`;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of ${xMeta.label} versus ${yLabel} across ${m.allTeams.length} Premier League team-seasons">
      <!-- Grid lines -->
      ${yTicks
        .map((yt) => {
          const y = scaleY(yt).toFixed(1);
          return `
            <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--rule-light)" stroke-dasharray="3,3" />
            <text x="${pad.left - 8}" y="${Number(y) + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" fill="var(--ink-muted)">${isPos ? yt : yt.toFixed(1)}</text>
          `;
        })
        .join('')}
      ${xTicks
        .map((xt) => {
          const x = scaleX(xt).toFixed(1);
          return `
            <line x1="${x}" y1="${pad.top}" x2="${x}" y2="${H - pad.bottom}" stroke="var(--rule-light)" stroke-dasharray="3,3" />
            <text x="${x}" y="${H - pad.bottom + 18}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="var(--ink-muted)">${xt.toFixed(2)}</text>
          `;
        })
        .join('')}

      <!-- Axes -->
      <line x1="${pad.left}" y1="${H - pad.bottom}" x2="${W - pad.right}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />

      <!-- OLS Trendline -->
      <line x1="${scaleX(lineX1).toFixed(1)}" y1="${scaleY(lineY1).toFixed(1)}" x2="${scaleX(lineX2).toFixed(1)}" y2="${scaleY(lineY2).toFixed(1)}" stroke="var(--ink-primary)" stroke-width="2" stroke-dasharray="6,4" />

      <!-- Data points -->
      ${dotsSvg}

      <!-- Axis Titles -->
      <text x="${pad.left + plotW / 2}" y="${H - 8}" text-anchor="middle" font-family="var(--font-mono)" font-size="11.5" font-weight="600" fill="var(--ink-primary)">${xMeta.label}</text>
      <text x="16" y="${pad.top + plotH / 2}" text-anchor="middle" transform="rotate(-90 16 ${pad.top + plotH / 2})" font-family="var(--font-mono)" font-size="11.5" font-weight="600" fill="var(--ink-primary)">${yLabel}</text>
    </svg>
  `;

  document.getElementById('sec1-scatter-note').textContent =
    `OLS fit: ${isPos ? 'Position' : 'PPG'} = ${intercept.toFixed(2)} ${slope >= 0 ? '+' : '−'} ${Math.abs(slope).toFixed(2)} × (${xMeta.unit}) · Hover or focus any dot to inspect team-season record.`;
  wireSvgTooltips(container);
}

function renderSec1Bars(m) {
  const container = document.getElementById('chart-sec1-bars');
  const W = 440;
  const H = 225;
  const pad = { top: 14, right: 64, bottom: 24, left: 100 };
  const plotW = W - pad.left - pad.right;
  const rowH = (H - pad.top - pad.bottom) / m.correlations.length;

  const barsSvg = m.correlations
    .map((c, i) => {
      const y = pad.top + i * rowH;
      const barW = Math.max(3, c.r2Ppg * plotW);
      const color =
        c.key === 'winRate' || c.key === 'gdPerGame'
          ? 'var(--ink-primary)'
          : c.key === 'gfPerGame'
          ? 'var(--accent-champ)'
          : c.key === 'gaPerGame'
          ? 'var(--accent-runner)'
          : 'var(--accent-warn)';
      return `
        <g transform="translate(0, ${y})">
          <text x="${pad.left - 10}" y="${rowH / 2 + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11.5" font-weight="600" fill="var(--ink-primary)">${c.shortLabel}</text>
          <rect x="${pad.left}" y="${rowH * 0.2}" width="${plotW}" height="${rowH * 0.6}" fill="var(--bg-subtle)" />
          <rect x="${pad.left}" y="${rowH * 0.2}" width="${barW.toFixed(1)}" height="${rowH * 0.6}" fill="${color}" />
          <text x="${pad.left + barW + 6}" y="${rowH / 2 + 4}" font-family="var(--font-mono)" font-size="11" font-weight="600" fill="var(--ink-primary)">${(c.r2Ppg * 100).toFixed(1)}%</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Horizontal bar chart comparing R-squared variance explained in Points Per Game for each metric">
      ${barsSvg}
    </svg>
  `;
}

/* ==========================================================================
   SECTION 2 CHARTS: 33-SEASON TIMELINE & QUANTILE DISTRIBUTIONS
   ========================================================================== */
function renderSec2Timeline(m, metric = 'pts38') {
  const container = document.getElementById('chart-sec2-timeline');
  const metaMap = {
    pts38: { label: 'Points (38-Game Normalised)', digits: 1, eraKey: 'champPts38' },
    wins38: { label: 'Wins (38-Game Normalised)', digits: 1, eraKey: 'champWins38' },
    gf38: { label: 'Goals For (38-Game Normalised)', digits: 1, eraKey: 'champGf38' },
    ga38: { label: 'Goals Against (38-Game Normalised)', digits: 1, eraKey: 'champGa38' },
    gd38: { label: 'Goal Difference (38-Game Normalised)', digits: 1, eraKey: 'champGd38' }
  };
  const cfg = metaMap[metric];

  const cVals = m.champs.map((c) => c[metric]);
  const rVals = m.runnersUp.map((r) => r[metric]);
  const allVals = [...cVals, ...rVals];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const span = maxV - minV || 1;
  const yMin = Math.floor(minV - span * 0.12);
  const yMax = Math.ceil(maxV + span * 0.12);

  document.getElementById('sec2-timeline-subtitle').textContent =
    `${cfg.label} for every Champion (1st) and Runner-Up (2nd), 1992–93 to 2024–25 · Champ Mean: ${mean(cVals).toFixed(1)} vs Runner-Up Mean: ${mean(rVals).toFixed(1)}`;

  const W = 1080;
  const H = 370;
  const pad = { top: 26, right: 28, bottom: 64, left: 52 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const scaleX = (idx) => pad.left + (idx / (m.numSeasons - 1)) * plotW;
  const scaleY = (v) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const yTicks = [];
  const step = Math.max(2, Math.round((yMax - yMin) / 5));
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
    yTicks.push(v);
  }

  // Era mean segments
  const eraLinesSvg = m.eraSplits
    .map((e) => {
      const iStart = e.startMin - 1992;
      const iEnd = e.startMax - 1992;
      const x1 = scaleX(iStart) - (iStart > 0 ? plotW / (m.numSeasons * 2) : 0);
      const x2 = scaleX(iEnd) + (iEnd < m.numSeasons - 1 ? plotW / (m.numSeasons * 2) : 0);
      const y = scaleY(e[cfg.eraKey]);
      return `
        <line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--accent-champ)" stroke-width="2" stroke-dasharray="5,3" />
        <text x="${((x1 + x2) / 2).toFixed(1)}" y="${(y - 7).toFixed(1)}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" font-weight="600" fill="var(--accent-champ)">${e.years.slice(0, 4)}–${e.years.slice(-2)} Mean: ${e[cfg.eraKey].toFixed(1)}</text>
      `;
    })
    .join('');

  // Vertical connectors & dots per season
  const dumbbellsSvg = m.seasons
    .map((s, idx) => {
      const c = m.champs[idx];
      const r = m.runnersUp[idx];
      const x = scaleX(idx).toFixed(1);
      const yc = scaleY(c[metric]).toFixed(1);
      const yr = scaleY(r[metric]).toFixed(1);
      const tipC = `<strong>${s.season} Champion: ${c.team}</strong>${cfg.label}: ${c[metric].toFixed(cfg.digits)} (Raw: ${c.points} pts, ${c.won}W ${c.drawn}D ${c.lost}L, GF ${c.gf} GA ${c.ga})<br>Runner-Up: ${r.team} (${r[metric].toFixed(cfg.digits)})`;
      const tipR = `<strong>${s.season} Runner-Up: ${r.team}</strong>${cfg.label}: ${r[metric].toFixed(cfg.digits)} (Raw: ${r.points} pts, ${r.won}W ${r.drawn}D ${r.lost}L, GF ${r.gf} GA ${r.ga})<br>Champion: ${c.team} (${c[metric].toFixed(cfg.digits)})`;
      return `
        <g>
          <line x1="${x}" y1="${yc}" x2="${x}" y2="${yr}" stroke="var(--rule-medium)" stroke-width="1.6" />
          <circle cx="${x}" cy="${yr}" r="4.2" fill="var(--accent-runner)" stroke="#fcfbf8" stroke-width="0.8" tabindex="0" data-tip="${tipR.replace(/"/g, '&quot;')}" />
          <circle cx="${x}" cy="${yc}" r="5.2" fill="var(--accent-champ)" stroke="#fcfbf8" stroke-width="0.9" tabindex="0" data-tip="${tipC.replace(/"/g, '&quot;')}" />
          <text x="${x}" y="${H - pad.bottom + 14}" text-anchor="end" transform="rotate(-45 ${x} ${H - pad.bottom + 14})" font-family="var(--font-mono)" font-size="10" fill="var(--ink-secondary)">${s.season}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dumbbell timeline comparing Champion and Runner-Up ${cfg.label} across all 33 Premier League seasons">
      ${yTicks
        .map((yt) => {
          const y = scaleY(yt).toFixed(1);
          return `
            <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--rule-light)" stroke-dasharray="3,3" />
            <text x="${pad.left - 8}" y="${Number(y) + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" fill="var(--ink-muted)">${yt}</text>
          `;
        })
        .join('')}
      <!-- Era dividers -->
      <line x1="${((scaleX(10) + scaleX(11)) / 2).toFixed(1)}" y1="${pad.top}" x2="${((scaleX(10) + scaleX(11)) / 2).toFixed(1)}" y2="${H - pad.bottom}" stroke="var(--rule-medium)" stroke-dasharray="2,4" />
      <line x1="${((scaleX(21) + scaleX(22)) / 2).toFixed(1)}" y1="${pad.top}" x2="${((scaleX(21) + scaleX(22)) / 2).toFixed(1)}" y2="${H - pad.bottom}" stroke="var(--rule-medium)" stroke-dasharray="2,4" />

      <line x1="${pad.left}" y1="${H - pad.bottom}" x2="${W - pad.right}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />

      ${eraLinesSvg}
      ${dumbbellsSvg}
    </svg>
  `;
  wireSvgTooltips(container);
}

function renderSec2Distributions(m) {
  const container = document.getElementById('chart-sec2-distributions');
  const panels = [
    { label: 'Points / 38g', key: 'pts38', c: m.champStats.pts38, r: m.runnerStats.pts38, min: 64, max: 102 },
    { label: 'Goals For / 38g', key: 'gf38', c: m.champStats.gf38, r: m.runnerStats.gf38, min: 50, max: 108 },
    { label: 'Goals Against / 38g', key: 'ga38', c: m.champStats.ga38, r: m.runnerStats.ga38, min: 12, max: 52 },
    { label: 'Goal Diff / 38g', key: 'gd38', c: m.champStats.gd38, r: m.runnerStats.gd38, min: 14, max: 82 }
  ];

  const W = 560;
  const H = 360;
  const pad = { top: 34, right: 30, bottom: 16, left: 168 };
  const plotW = W - pad.left - pad.right;
  const blockH = (H - pad.top - pad.bottom) / panels.length;

  const rowsSvg = panels
    .map((p, idx) => {
      const yTop = pad.top + idx * blockH;
      const sx = (v) => pad.left + ((v - p.min) / (p.max - p.min)) * plotW;

      const drawStrip = (teams, yCenter, color) =>
        teams
          .map((t, i) => {
            const jitter = ((i * 7) % 11 - 5) * 0.9;
            const tip = `<strong>${t.season} ${t.team} (${t.pos === 1 ? 'champion' : 'runner-up'})</strong>${p.label}: ${t[p.key].toFixed(1)}`;
            return `<circle cx="${sx(t[p.key]).toFixed(1)}" cy="${(yCenter + jitter).toFixed(1)}" r="2" fill="${color}" fill-opacity="0.45" data-tip="${tip.replace(/"/g, '&quot;')}" />`;
          })
          .join('');

      const drawBox = (stats, yCenter, color, fillSoft) => `
        <line x1="${sx(stats.min).toFixed(1)}" y1="${yCenter}" x2="${sx(stats.max).toFixed(1)}" y2="${yCenter}" stroke="${color}" stroke-width="1.4" />
        <line x1="${sx(stats.min).toFixed(1)}" y1="${yCenter - 4}" x2="${sx(stats.min).toFixed(1)}" y2="${yCenter + 4}" stroke="${color}" stroke-width="1.4" />
        <line x1="${sx(stats.max).toFixed(1)}" y1="${yCenter - 4}" x2="${sx(stats.max).toFixed(1)}" y2="${yCenter + 4}" stroke="${color}" stroke-width="1.4" />
        <rect x="${sx(stats.q1).toFixed(1)}" y="${yCenter - 6}" width="${Math.max(2, sx(stats.q3) - sx(stats.q1)).toFixed(1)}" height="12" fill="${fillSoft}" stroke="${color}" stroke-width="1.5" />
        <line x1="${sx(stats.median).toFixed(1)}" y1="${yCenter - 6}" x2="${sx(stats.median).toFixed(1)}" y2="${yCenter + 6}" stroke="${color}" stroke-width="2.5" />
        <circle cx="${sx(stats.mean).toFixed(1)}" cy="${yCenter}" r="2.6" fill="${color}" />
      `;

      return `
        <g>
          ${idx > 0 ? `<line x1="10" y1="${yTop}" x2="${W - 10}" y2="${yTop}" stroke="var(--rule-light)" />` : ''}
          <text x="${pad.left - 12}" y="${yTop + blockH / 2 - 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" font-weight="600" fill="var(--ink-primary)">${p.label}</text>
          <text x="${pad.left - 12}" y="${yTop + blockH / 2 + 11}" text-anchor="end" font-family="var(--font-mono)" font-size="9.5" fill="var(--ink-muted)">Means: 1st ${p.c.mean.toFixed(1)} | 2nd ${p.r.mean.toFixed(1)}</text>
          ${drawBox(p.c, yTop + blockH * 0.34, 'var(--accent-champ)', 'var(--accent-champ-soft)')}
          ${drawStrip(m.champs, yTop + blockH * 0.34, 'var(--accent-champ)')}
          ${drawBox(p.r, yTop + blockH * 0.68, 'var(--accent-runner)', 'var(--accent-runner-soft)')}
          ${drawStrip(m.runnersUp, yTop + blockH * 0.68, 'var(--accent-runner)')}
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Box-and-whisker quantile comparison between Champions and Runners-Up across Points, Goals For, Goals Against, and Goal Difference">
      <g font-family="var(--font-mono)" font-size="10" fill="var(--ink-secondary)">
        <rect x="${pad.left}" y="9" width="12" height="10" fill="var(--accent-champ-soft)" stroke="var(--accent-champ)" stroke-width="1.5" />
        <text x="${pad.left + 18}" y="18">Champions (1st)</text>
        <rect x="${pad.left + 120}" y="9" width="12" height="10" fill="var(--accent-runner-soft)" stroke="var(--accent-runner)" stroke-width="1.5" />
        <text x="${pad.left + 138}" y="18">Runners-up (2nd)</text>
        <circle cx="${pad.left + 252}" cy="14" r="2" fill="var(--ink-secondary)" fill-opacity="0.5" />
        <text x="${pad.left + 260}" y="18">One dot per season</text>
      </g>
      ${rowsSvg}
    </svg>
  `;
  wireSvgTooltips(container);
}

/* ==========================================================================
   SECTION 3 CHART: THE 40-POINT MYTH SURVIVAL TIMELINE
   ========================================================================== */
function renderSec3Survival(m, mode = 'era38') {
  const container = document.getElementById('chart-sec3-survival');
  const isAll = mode === 'all38';
  const rows = isAll ? m.survivalSeries : m.survival38;
  const survKey = isAll ? 'survivingPts38' : 'survivingPts';
  const relKey = isAll ? 'relegatedPts38' : 'relegatedPts';

  const medRel = median(rows.map((x) => x[relKey]));
  const meanRel = mean(rows.map((x) => x[relKey]));

  document.getElementById('sec3-chart-subtitle').textContent = isAll
    ? `All 33 Seasons (1992–93 to 2024–25) Normalised to a 38-Game Scale · Mean Relegated: ${meanRel.toFixed(1)} pts/38g`
    : `38-Game Era (30 Seasons, 1995–96 to 2024–25) Official Points · Mean 18th: ${meanRel.toFixed(1)} pts (Median: ${medRel.toFixed(0)} pts)`;

  const W = 1080;
  const H = 350;
  const pad = { top: 24, right: 32, bottom: 64, left: 52 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const yMin = 20;
  const yMax = 48;
  const scaleX = (i) => pad.left + (i / (rows.length - 1)) * plotW;
  const scaleY = (v) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const yTicks = [20, 25, 30, 34, 38, 40, 45];
  const y40 = scaleY(40).toFixed(1);
  const yMed = scaleY(medRel).toFixed(1);

  const pointsSvg = rows
    .map((r, i) => {
      const x = scaleX(i).toFixed(1);
      const ys = scaleY(r[survKey]).toFixed(1);
      const yr = scaleY(r[relKey]).toFixed(1);
      const tipS = `<strong>${r.season} Lowest Surviving (${r.survivingPos}th): ${r.survivingTeam}</strong>Official Points: ${r.survivingPts} (${r.gamesPerTeam}g, ${r.survivingPts38.toFixed(1)}/38g)<br>Highest Relegated (${r.relegatedPos}th): ${r.relegatedTeam} (${r.relegatedPts} pts)`;
      const tipR = `<strong>${r.season} Highest Relegated (${r.relegatedPos}th): ${r.relegatedTeam}</strong>Official Points: ${r.relegatedPts} (${r.gamesPerTeam}g, ${r.relegatedPts38.toFixed(1)}/38g)<br>Safety Needed: ${r.guaranteedSafePts} pts (or ${r.relegatedPts} + GD)`;
      const above40 = r[relKey] >= 40;
      return `
        <g>
          <line x1="${x}" y1="${ys}" x2="${x}" y2="${yr}" stroke="var(--rule-medium)" stroke-width="1.5" />
          <circle cx="${x}" cy="${ys}" r="4.2" fill="var(--accent-top4)" stroke="#fcfbf8" stroke-width="0.8" tabindex="0" data-tip="${tipS.replace(/"/g, '&quot;')}" />
          <circle cx="${x}" cy="${yr}" r="${above40 ? 5.8 : 4.6}" fill="var(--accent-rel)" stroke="${above40 ? 'var(--accent-warn)' : '#fcfbf8'}" stroke-width="${above40 ? 2 : 0.8}" tabindex="0" data-tip="${tipR.replace(/"/g, '&quot;')}" />
          <text x="${x}" y="${H - pad.bottom + 14}" text-anchor="end" transform="rotate(-45 ${x} ${H - pad.bottom + 14})" font-family="var(--font-mono)" font-size="10" fill="var(--ink-secondary)">${r.season}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Timeline comparing lowest surviving points and highest relegated points against the 40-point line">
      ${yTicks
        .map((yt) => {
          const y = scaleY(yt).toFixed(1);
          return `
            <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--rule-light)" stroke-dasharray="3,3" />
            <text x="${pad.left - 8}" y="${Number(y) + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" fill="var(--ink-muted)">${yt}</text>
          `;
        })
        .join('')}

      <!-- 40-Point Myth Line -->
      <line x1="${pad.left}" y1="${y40}" x2="${W - pad.right}" y2="${y40}" stroke="var(--accent-warn)" stroke-width="2.2" stroke-dasharray="6,4" />
      <text x="${W - pad.right - 6}" y="${Number(y40) - 6}" text-anchor="end" font-family="var(--font-mono)" font-size="10.5" font-weight="700" fill="var(--accent-warn)">40-POINT MYTH LINE</text>

      <!-- Median Relegated Line -->
      <line x1="${pad.left}" y1="${yMed}" x2="${W - pad.right}" y2="${yMed}" stroke="var(--accent-rel)" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="${W - pad.right - 6}" y="${Number(yMed) + 13}" text-anchor="end" font-family="var(--font-mono)" font-size="10.5" font-weight="600" fill="var(--accent-rel)">MEDIAN RELEGATED: ${medRel.toFixed(1)} PTS</text>

      <line x1="${pad.left}" y1="${H - pad.bottom}" x2="${W - pad.right}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />

      ${pointsSvg}
    </svg>
  `;

  document.getElementById('sec3-chart-note').textContent =
    `Highlighted rings on relegated dots indicate the only campaigns where the highest relegated team reached ≥ 40 points (38-game scale). Hover any point for exact season survival details.`;
  wireSvgTooltips(container);
}

/* ==========================================================================
   SECTION 4 CHART: FINISHING POSITIONS OF SEASON DRAW LEADERS
   ========================================================================== */
function renderSec4DrawsChart(m) {
  const container = document.getElementById('chart-sec4-draws-pos');
  const W = 540;
  const H = 310;
  const pad = { top: 24, right: 24, bottom: 44, left: 44 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Group the 49 season draw leaders by finishing position (1..20)
  const byPos = {};
  for (let p = 1; p <= 20; p++) byPos[p] = [];
  for (const dl of m.seasonDrawLeaders) {
    byPos[dl.pos].push(dl);
  }

  const maxStack = Math.max(...Object.values(byPos).map((a) => a.length), 6);
  const scaleX = (pos) => pad.left + ((pos - 1) / 19) * plotW;
  const dotSpacing = Math.min(22, plotH / (maxStack + 1));

  const meanPos = mean(m.seasonDrawLeaders.map((x) => x.pos));
  const xMean = scaleX(meanPos).toFixed(1);

  let dotsSvg = '';
  for (let pos = 1; pos <= 20; pos++) {
    const items = byPos[pos];
    const x = scaleX(pos).toFixed(1);
    items.forEach((item, idx) => {
      const y = (H - pad.bottom - 14 - idx * dotSpacing).toFixed(1);
      const color =
        item.pos <= 4
          ? 'var(--accent-top4)'
          : item.relegated
          ? 'var(--accent-rel)'
          : 'var(--accent-warn)';
      const tip = `<strong>${item.season} ${item.team} (Pos ${item.pos})</strong>Draws: ${item.drawn} in ${item.played}g (${(item.drawRate * 100).toFixed(1)}%)<br>Record: ${item.won}W–${item.drawn}D–${item.lost}L (${item.points} pts)`;
      dotsSvg += `<circle cx="${x}" cy="${y}" r="6.5" fill="${color}" stroke="#fcfbf8" stroke-width="1" tabindex="0" data-tip="${tip.replace(/"/g, '&quot;')}" />`;
    });
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dot plot showing the finishing position of all ${m.seasonDrawLeaders.length} Premier League season draw-leaders from 1st to 20th">
      <!-- Zone backgrounds -->
      <rect x="${pad.left - 10}" y="${pad.top}" width="${scaleX(4.5) - pad.left + 10}" height="${plotH}" fill="var(--accent-top4-soft)" opacity="0.45" />
      <rect x="${scaleX(17.5)}" y="${pad.top}" width="${W - pad.right - scaleX(17.5) + 10}" height="${plotH}" fill="var(--accent-rel-soft)" opacity="0.45" />

      <text x="${pad.left + 4}" y="${pad.top + 14}" font-family="var(--font-mono)" font-size="9.5" font-weight="600" fill="var(--accent-top4)">TOP 4 (3)</text>
      <text x="${W - pad.right - 4}" y="${pad.top + 14}" text-anchor="end" font-family="var(--font-mono)" font-size="9.5" font-weight="600" fill="var(--accent-rel)">RELEGATED (4)</text>

      <!-- Mean Finish Line -->
      <line x1="${xMean}" y1="${pad.top}" x2="${xMean}" y2="${H - pad.bottom}" stroke="var(--ink-primary)" stroke-width="1.8" stroke-dasharray="4,3" />
      <text x="${Number(xMean) + 6}" y="${pad.top + 28}" font-family="var(--font-mono)" font-size="10.5" font-weight="700" fill="var(--ink-primary)">Mean Pos: ${meanPos.toFixed(1)}</text>

      <!-- Axis -->
      <line x1="${pad.left - 10}" y1="${H - pad.bottom}" x2="${W - pad.right + 10}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />
      ${Array.from({ length: 20 }, (_, i) => i + 1)
        .map((p) => {
          const x = scaleX(p).toFixed(1);
          return `<text x="${x}" y="${H - pad.bottom + 16}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="var(--ink-secondary)">${p}</text>`;
        })
        .join('')}
      <text x="${pad.left + plotW / 2}" y="${H - 6}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="600" fill="var(--ink-primary)">Final League Position (1st to 20th)</text>

      ${dotsSvg}
    </svg>
  `;

  document.getElementById('sec4-chart-note').textContent =
    `Each dot represents one of the ${m.seasonDrawLeaders.length} teams that led or co-led its season in draws. Zero finished 1st or 2nd.`;
  wireSvgTooltips(container);
}

/* ==========================================================================
   SECTION 5 CHARTS: TOP-SCORER GOAL SHARE & GOLDEN BOOT FINISHES
   ========================================================================== */
function renderSec5Charts(m) {
  const container = document.getElementById('chart-sec5-share');
  const W = 680;
  const H = 370;
  const pad = { top: 24, right: 28, bottom: 48, left: 56 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const xMin = 10;
  const xMax = 52;
  const yMin = 1.5;
  const yMax = 2.7;

  const scaleX = (v) => pad.left + ((v - xMin) / (xMax - xMin)) * plotW;
  const scaleY = (v) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const xVals = m.top4Teams.map((t) => t.scorerShare);
  const yVals = m.top4Teams.map((t) => t.ppg);
  const { slope, intercept } = olsFit(xVals, yVals);

  const xTicks = [15, 20, 25, 30, 35, 40, 45, 50];
  const yTicks = [1.6, 1.8, 2.0, 2.2, 2.4, 2.6];

  const ordered = [...m.top4Teams].sort((a, b) => b.pos - a.pos);
  const dotsSvg = ordered
    .map((t) => {
      const cx = scaleX(t.scorerShare).toFixed(1);
      const cy = scaleY(t.ppg).toFixed(1);
      const fill =
        t.pos === 1
          ? 'var(--accent-champ)'
          : t.pos === 2
          ? 'var(--accent-runner)'
          : 'var(--accent-top4)';
      const r = t.pos === 1 ? 5.4 : t.pos === 2 ? 4.5 : 3.9;
      const stroke = t.hasGoldenBootWinner ? 'var(--ink-primary)' : '#fcfbf8';
      const sw = t.hasGoldenBootWinner ? 2.0 : 0.7;
      const tip = `<strong>${t.season} ${t.team} (Pos ${t.pos})</strong>Club Top Scorer: ${t.scorerPlayer} (${t.scorerGoals} goals / ${t.gf} team GF = ${t.scorerShare.toFixed(1)}%)${t.hasGoldenBootWinner ? '<br>★ League Golden Boot Winner' : ''}<br>Points: ${t.points} (${t.ppg.toFixed(2)} PPG, ${t.pts38.toFixed(1)}/38g)`;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" fill-opacity="0.88" stroke="${stroke}" stroke-width="${sw}" tabindex="0" data-tip="${tip.replace(/"/g, '&quot;')}" />`;
    })
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of Club Top-Scorer Share of Team Goals versus Points Per Game across all 132 Top-Four team-seasons">
      ${yTicks
        .map((yt) => {
          const y = scaleY(yt).toFixed(1);
          return `
            <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--rule-light)" stroke-dasharray="3,3" />
            <text x="${pad.left - 8}" y="${Number(y) + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" fill="var(--ink-muted)">${yt.toFixed(1)}</text>
          `;
        })
        .join('')}
      ${xTicks
        .map((xt) => {
          const x = scaleX(xt).toFixed(1);
          return `
            <line x1="${x}" y1="${pad.top}" x2="${x}" y2="${H - pad.bottom}" stroke="var(--rule-light)" stroke-dasharray="3,3" />
            <text x="${x}" y="${H - pad.bottom + 18}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="var(--ink-muted)">${xt}%</text>
          `;
        })
        .join('')}

      <!-- Mean share vertical line -->
      <line x1="${scaleX(m.shareStats.champ.mean).toFixed(1)}" y1="${pad.top}" x2="${scaleX(m.shareStats.champ.mean).toFixed(1)}" y2="${H - pad.bottom}" stroke="var(--accent-champ)" stroke-width="1.3" stroke-dasharray="3,3" />
      <text x="${(scaleX(m.shareStats.champ.mean) + 5).toFixed(1)}" y="${pad.top + 13}" font-family="var(--font-mono)" font-size="10" font-weight="600" fill="var(--accent-champ)">Champ Mean: ${m.shareStats.champ.mean.toFixed(1)}%</text>

      <!-- OLS Trendline -->
      <line x1="${scaleX(12).toFixed(1)}" y1="${scaleY(intercept + slope * 12).toFixed(1)}" x2="${scaleX(50).toFixed(1)}" y2="${scaleY(intercept + slope * 50).toFixed(1)}" stroke="var(--ink-primary)" stroke-width="1.8" stroke-dasharray="5,4" />

      <line x1="${pad.left}" y1="${H - pad.bottom}" x2="${W - pad.right}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="var(--rule-heavy)" stroke-width="1.2" />

      ${dotsSvg}

      <text x="${pad.left + plotW / 2}" y="${H - 8}" text-anchor="middle" font-family="var(--font-mono)" font-size="11.5" font-weight="600" fill="var(--ink-primary)">Club Top Scorer's Share of Team League Goals (%)</text>
      <text x="16" y="${pad.top + plotH / 2}" text-anchor="middle" transform="rotate(-90 16 ${pad.top + plotH / 2})" font-family="var(--font-mono)" font-size="11.5" font-weight="600" fill="var(--ink-primary)">Points per Game (PPG)</text>
    </svg>
  `;

  document.getElementById('sec5-share-note').textContent =
    `Within Top 4 (n=${m.top4Teams.length}): r(Scorer Share, PPG) = ${fmtSigned(m.shareStats.rSharePpgTop4, 3)} · Black-ringed dots indicate League Golden Boot winners.`;
  wireSvgTooltips(container);

  // Right-side summary bar chart of where the 41 Golden Boot winners finished
  const gbContainer = document.getElementById('chart-sec5-gb-finishes');
  const buckets = [
    { label: '1st (Champion)', count: m.gbInstances.filter((x) => x.pos === 1).length, color: 'var(--accent-champ)' },
    { label: '2nd (Runner-Up)', count: m.gbInstances.filter((x) => x.pos === 2).length, color: 'var(--accent-runner)' },
    { label: '3rd–4th Place', count: m.gbInstances.filter((x) => x.pos === 3 || x.pos === 4).length, color: 'var(--accent-top4)' },
    { label: '5th–11th Place', count: m.gbInstances.filter((x) => x.pos >= 5).length, color: 'var(--accent-warn)' }
  ];

  const BW = 430;
  const BH = 155;
  const bPad = { top: 8, right: 90, bottom: 8, left: 118 };
  const bPlotW = BW - bPad.left - bPad.right;
  const bRowH = (BH - bPad.top - bPad.bottom) / buckets.length;

  gbContainer.innerHTML = `
    <svg viewBox="0 0 ${BW} ${BH}" role="img" aria-label="Distribution of league finishes for the ${m.gbInstances.length} Golden Boot winner-seasons">
      ${buckets
        .map((b, i) => {
          const y = bPad.top + i * bRowH;
          const pct = (b.count / m.gbInstances.length) * 100;
          const w = (b.count / 16) * bPlotW;
          return `
            <g transform="translate(0, ${y})">
              <text x="${bPad.left - 10}" y="${bRowH / 2 + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" font-weight="600" fill="var(--ink-primary)">${b.label}</text>
              <rect x="${bPad.left}" y="${bRowH * 0.18}" width="${bPlotW}" height="${bRowH * 0.64}" fill="var(--bg-subtle)" />
              <rect x="${bPad.left}" y="${bRowH * 0.18}" width="${w.toFixed(1)}" height="${bRowH * 0.64}" fill="${b.color}" />
              <text x="${bPad.left + w + 6}" y="${bRowH / 2 + 4}" font-family="var(--font-mono)" font-size="11" font-weight="600" fill="var(--ink-primary)">${b.count} (${pct.toFixed(1)}%)</text>
            </g>
          `;
        })
        .join('')}
    </svg>
  `;
}

/* ==========================================================================
   SECTION 6: INTERACTIVE 33-SEASON ARCHIVE & SORTABLE TABLE
   ========================================================================== */
function renderArchiveSeason(m, seasonId, displayMode = 'raw') {
  const s = m.seasons.find((x) => x.season === seasonId) || m.seasons[m.seasons.length - 1];
  const champ = s.table[0];
  const runner = s.table[1];
  const surv = s.table.find((x) => x.pos === s.survivalLinePos);
  const rel = s.table.find((x) => x.pos === s.relegationLinePos);
  const totalSeasonGoals = sum(s.table.map((x) => x.gf));
  const totalSeasonMatches = (s.teamCount * s.gamesPerTeam) / 2;

  document.getElementById('archive-summary-title').textContent = `${s.season} Campaign Ledger`;
  document.getElementById('archive-summary-list').innerHTML = `
    <dt>Format</dt>
    <dd>${s.teamCount} Clubs · ${s.gamesPerTeam} Games (${totalSeasonMatches} matches)</dd>
    <dt>Champion (Margin)</dt>
    <dd>${champ.team} (${champ.points} pts, +${champ.points - runner.points} over ${runner.team})</dd>
    <dt>Golden Boot</dt>
    <dd>${s.goldenBootWinners.map((g) => g.player).join(' / ')} (${s.goldenBootGoals} goals)</dd>
    <dt>Survival Cut (${surv.pos}th vs ${rel.pos}th)</dt>
    <dd>${surv.team} (${surv.points}) vs ${rel.team} (${rel.points})</dd>
    <dt>Total Goals (Goals / Match)</dt>
    <dd>${totalSeasonGoals} (${(totalSeasonGoals / totalSeasonMatches).toFixed(2)} / match)</dd>
  `;

  document.getElementById('archive-league-caption').textContent =
    `${s.season} Premier League Final Table (${displayMode === 'raw' ? 'Official Season Totals' : displayMode === 'perGame' ? 'Per-Game Rates' : '38-Game Normalised Totals'})`;

  // Reset sort header state to Pos ascending when switching season/mode
  const leagueTable = document.getElementById('archive-league-table');
  const ths = leagueTable.querySelectorAll('thead th');
  ths.forEach((th, idx) => {
    if (idx === 0) th.setAttribute('aria-sort', 'ascending');
    else th.removeAttribute('aria-sort');
  });

  const fmtCell = (rawVal, played, signed = false) => {
    if (displayMode === 'raw') {
      return signed && rawVal > 0 ? `+${rawVal}` : `${rawVal}`;
    }
    const factor = displayMode === 'perGame' ? 1 / played : 38 / played;
    const digits = displayMode === 'perGame' ? 2 : 1;
    const v = rawVal * factor;
    if (signed) return v >= 0 ? `+${v.toFixed(digits)}` : `−${Math.abs(v).toFixed(digits)}`;
    return v.toFixed(digits);
  };

  const numVal = (rawVal, played) => {
    if (displayMode === 'raw') return rawVal;
    const factor = displayMode === 'perGame' ? 1 / played : 38 / played;
    return rawVal * factor;
  };

  const tbody = document.getElementById('archive-league-tbody');
  tbody.innerHTML = s.table
    .map((r) => {
      const ppg = r.points / r.played;
      const rowClass = r.pos === 1 ? 'row-champion' : r.relegated ? 'row-relegated' : '';
      const badges = [
        r.pos === 1 ? '<span class="badge badge-champ">C</span>' : '',
        r.relegated ? '<span class="badge badge-rel">R</span>' : '',
        r.pointsDeducted > 0 ? `<span class="badge badge-ded">−${r.pointsDeducted} pts</span>` : '',
        r.hasGoldenBootWinner ? '<span class="badge badge-gb">GB</span>' : ''
      ].join('');

      return `
        <tr class="${rowClass}">
          <td data-value="${r.pos}">${r.pos}</td>
          <th scope="row" class="text-col" data-value="${r.team}">${r.team}${badges}</th>
          <td data-value="${r.played}">${r.played}</td>
          <td data-value="${numVal(r.won, r.played)}">${fmtCell(r.won, r.played)}</td>
          <td data-value="${numVal(r.drawn, r.played)}">${fmtCell(r.drawn, r.played)}</td>
          <td data-value="${numVal(r.lost, r.played)}">${fmtCell(r.lost, r.played)}</td>
          <td data-value="${numVal(r.gf, r.played)}">${fmtCell(r.gf, r.played)}</td>
          <td data-value="${numVal(r.ga, r.played)}">${fmtCell(r.ga, r.played)}</td>
          <td data-value="${numVal(r.gd, r.played)}">${fmtCell(r.gd, r.played, true)}</td>
          <td data-value="${numVal(r.points, r.played)}"><strong>${fmtCell(r.points, r.played)}</strong></td>
          <td data-value="${ppg}">${ppg.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  // Deductions footnote if any in this season
  const dedRows = s.table.filter((r) => r.pointsDeducted > 0);
  document.getElementById('archive-deduction-note').textContent = dedRows.length
    ? `Points deduction note: ${dedRows.map((d) => `${d.team} deducted ${d.pointsDeducted} points (${d.deductionReason})`).join('; ')}.`
    : `All ${s.teamCount} clubs completed ${s.gamesPerTeam} matches with no points deductions.`;

  // Top Scorers Table
  document.getElementById('archive-scorers-caption').textContent = `${s.season} Top Goalscorers`;
  document.getElementById('archive-scorers-tbody').innerHTML = s.topScorers
    .map((ts) => {
      const g38 = ((ts.goals / s.gamesPerTeam) * 38).toFixed(1);
      const isGb = ts.goals === s.goldenBootGoals;
      return `
        <tr class="${isGb ? 'row-champion' : ''}">
          <td>${ts.rank}</td>
          <th scope="row" class="text-col">${ts.player}${isGb ? '<span class="badge badge-gb">GB</span>' : ''}</th>
          <td class="text-col">${ts.clubDisplay}</td>
          <td><strong>${ts.goals}</strong></td>
          <td>${g38}</td>
        </tr>
      `;
    })
    .join('');
}

function setupSortableArchiveTable() {
  const table = document.getElementById('archive-league-table');
  const tbody = document.getElementById('archive-league-tbody');
  const statusEl = document.getElementById('table-sort-status');

  table.querySelectorAll('thead th > button[data-sort-col]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const th = btn.closest('th');
      const colIdx = parseInt(btn.getAttribute('data-sort-col'), 10);
      const type = th.getAttribute('data-type') || 'number';
      const currentSort = th.getAttribute('aria-sort');
      const direction = currentSort === 'ascending' ? 'descending' : 'ascending';

      table.querySelectorAll('thead th').forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', direction);

      const factor = direction === 'ascending' ? 1 : -1;
      const rows = Array.from(tbody.rows);
      const keyed = rows.map((row) => {
        const cell = row.cells[colIdx];
        const raw = cell.getAttribute('data-value') ?? cell.textContent.trim();
        return {
          row,
          val: type === 'number' ? parseFloat(raw) : raw
        };
      });

      keyed.sort((a, b) =>
        factor * (type === 'number' ? a.val - b.val : collator.compare(a.val, b.val))
      );

      // Reorder existing <tr> nodes in DOM without innerHTML replacement
      for (const item of keyed) {
        if (typeof tbody.moveBefore === 'function') {
          tbody.moveBefore(item.row, null);
        } else {
          tbody.appendChild(item.row);
        }
      }

      if (statusEl) {
        const colName = btn.textContent.replace('▼', '').trim();
        statusEl.textContent = `Sorted by ${colName}, ${direction}, ${rows.length} rows`;
      }
    });
  });
}

/* ==========================================================================
   INITIALIZATION & INTERACTIVE CONTROLS WIRING
   ========================================================================== */
async function init() {
  const dataset = await loadDataset();
  const model = buildAnalyticalModel(dataset);

  renderEditorialCopy(model);

  // Section 1 initial render & controls
  let sec1Metric = 'gfPerGame';
  let sec1Target = 'ppg';
  renderSec1Scatter(model, sec1Metric, sec1Target);
  renderSec1Bars(model);

  document.querySelectorAll('[data-sec1-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sec1Metric = btn.getAttribute('data-sec1-metric');
      document.querySelectorAll('[data-sec1-metric]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      renderSec1Scatter(model, sec1Metric, sec1Target);
    });
  });

  document.querySelectorAll('[data-sec1-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sec1Target = btn.getAttribute('data-sec1-target');
      document.querySelectorAll('[data-sec1-target]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      renderSec1Scatter(model, sec1Metric, sec1Target);
    });
  });

  // Section 2 initial render & controls
  renderSec2Timeline(model, 'pts38');
  renderSec2Distributions(model);

  document.querySelectorAll('[data-sec2-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const metric = btn.getAttribute('data-sec2-metric');
      document.querySelectorAll('[data-sec2-metric]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      renderSec2Timeline(model, metric);
    });
  });

  // Section 3 initial render & controls
  renderSec3Survival(model, 'era38');
  document.querySelectorAll('[data-sec3-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-sec3-mode');
      document.querySelectorAll('[data-sec3-mode]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      renderSec3Survival(model, mode);
    });
  });

  // Section 4 & 5 renders
  renderSec4DrawsChart(model);
  renderSec5Charts(model);

  // Section 6 Season Select & Archive Table
  const seasonSelect = document.getElementById('season-select');
  seasonSelect.innerHTML = model.seasons
    .slice()
    .reverse()
    .map((s) => `<option value="${s.season}">${s.season} — Champion: ${s.table[0].team} (${s.table[0].points} pts)</option>`)
    .join('');

  let currentArchiveSeason = model.lastSeason;
  let currentArchiveMode = 'raw';
  renderArchiveSeason(model, currentArchiveSeason, currentArchiveMode);
  setupSortableArchiveTable();

  seasonSelect.addEventListener('change', () => {
    currentArchiveSeason = seasonSelect.value;
    renderArchiveSeason(model, currentArchiveSeason, currentArchiveMode);
  });

  document.querySelectorAll('[data-archive-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentArchiveMode = btn.getAttribute('data-archive-mode');
      document.querySelectorAll('[data-archive-mode]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      renderArchiveSeason(model, currentArchiveSeason, currentArchiveMode);
    });
  });
}

init().catch((err) => {
  console.error(err);
});
