/**
 * THE CHAMPIONSHIP FORMULA — Client-Side Visualization & Archive Controller
 * Consumes precomputed validated model from window.ChampionshipAnalysis.
 * Strict security invariant: ZERO untrusted innerHTML anywhere in this file.
 */
(function () {
  'use strict';

  const CA = typeof window !== 'undefined' ? window.ChampionshipAnalysis : null;
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ========================================================================
     SAFE DOM & SVG PRIMITIVES
     ======================================================================== */
  function clearEl(node) {
    if (node) node.replaceChildren();
  }

  function el(tag, opts, ...children) {
    const node = document.createElement(tag);
    if (opts && typeof opts === 'object') {
      for (const [k, v] of Object.entries(opts)) {
        if (v === undefined || v === null) continue;
        if (k === 'className') node.className = v;
        else if (k === 'textContent') node.textContent = String(v);
        else if (k === 'dataset' && typeof v === 'object') {
          for (const [dk, dv] of Object.entries(v)) {
            if (dv !== undefined && dv !== null) node.dataset[dk] = String(dv);
          }
        } else if (k === 'style' && typeof v === 'object') {
          Object.assign(node.style, v);
        } else if (k in node && k !== 'list' && k !== 'type' && k !== 'role') {
          node[k] = v;
        } else {
          node.setAttribute(k, String(v));
        }
      }
    }
    for (const child of children) {
      if (child === undefined || child === null || child === false) continue;
      if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(String(child)));
      } else {
        node.appendChild(child);
      }
    }
    return node;
  }

  function svgEl(tag, attrs, ...children) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs && typeof attrs === 'object') {
      for (const [k, v] of Object.entries(attrs)) {
        if (v !== undefined && v !== null) node.setAttribute(k, String(v));
      }
    }
    for (const child of children) {
      if (child === undefined || child === null || child === false) continue;
      if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(String(child)));
      } else {
        node.appendChild(child);
      }
    }
    return node;
  }

  function appendKV(dlNode, label, value, highlightClass) {
    dlNode.appendChild(el('dt', { textContent: label }));
    dlNode.appendChild(el('dd', {
      className: highlightClass ? `num ${highlightClass}` : 'num',
      textContent: value,
    }));
  }

  function fmtNum(val, digits = 2) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return 'N/A';
    return val.toFixed(digits);
  }

  function fmtSigned(val, digits = 2) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return 'N/A';
    const fixed = Math.abs(val).toFixed(digits);
    if (Math.abs(val) < Math.pow(10, -(digits + 1))) return (0).toFixed(digits);
    return val >= 0 ? `+${fixed}` : `−${fixed}`;
  }

  function fmtInt(val) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return 'N/A';
    return Math.round(val).toLocaleString();
  }

  function fmtPct(val, digits = 1) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return 'N/A';
    return `${val.toFixed(digits)}%`;
  }

  function plural(n, singular, pluralWord) {
    return Math.abs(n) === 1 ? singular : (pluralWord || `${singular}s`);
  }

  function ordinal(n) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
    const v = Math.round(n);
    const mod100 = v % 100;
    const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][v % 10] || 'th');
    return `${v}${suffix}`;
  }

  function isRawMode() {
    return state.scope.pointsMode === 'raw';
  }

  function describeAtkVsDef(m) {
    const gaPred = m.correlations.find((c) => c.key === 'gaPerGame');
    const gfPred = m.correlations.find((c) => c.key === 'gfPerGame');
    const gaPool = m.pooledCorrelations.find((p) => p.key === 'gaPerGame');
    const gfPool = m.pooledCorrelations.find((p) => p.key === 'gfPerGame');

    const gaWithin = gaPred?.medianAbsRFinish ?? 0;
    const gfWithin = gfPred?.medianAbsRFinish ?? 0;
    const gaR2 = gaPool?.r2Ppg ?? 0;
    const gfR2 = gfPool?.r2Ppg ?? 0;

    const withinDiff = Math.abs(gaWithin - gfWithin);
    const withinLeader = withinDiff < 0.0005 ? 'tie' : (gaWithin > gfWithin ? 'ga' : 'gf');
    const pooledLeader = Math.abs(gaR2 - gfR2) < 0.0005 ? 'tie' : (gfR2 > gaR2 ? 'gf' : 'ga');
    const ties = Math.max(0, (m.withinSlot.comparableGfGaSlots ?? 0) - (m.withinSlot.gaBeatsGfCount ?? 0) - (m.withinSlot.gfBeatsGaCount ?? 0));

    return {
      gaWithin,
      gfWithin,
      withinDiff,
      withinLeader,
      gaR2,
      gfR2,
      gaPooledRPpg: gaPool?.rPpg ?? null,
      gfPooledRPpg: gfPool?.rPpg ?? null,
      pooledLeader,
      diverges: withinLeader !== 'tie' && pooledLeader !== 'tie' && withinLeader !== pooledLeader,
      ties,
    };
  }

  /* ========================================================================
     SAFE STRUCTURED TOOLTIP
     ======================================================================== */
  const tooltipEl = document.getElementById('chart-tooltip');

  function showTooltipData(data, clientX, clientY) {
    if (!tooltipEl || !data) return;
    clearEl(tooltipEl);
    tooltipEl.appendChild(el('strong', { textContent: data.title }));
    if (data.subtitle) {
      tooltipEl.appendChild(el('div', { className: 'tip-sub', textContent: data.subtitle }));
    }
    if (Array.isArray(data.rows)) {
      for (const row of data.rows) {
        tooltipEl.appendChild(el('div', { className: 'tip-row' },
          el('span', { textContent: row[0] }),
          el('span', { className: 'num', textContent: row[1] })
        ));
      }
    }
    tooltipEl.classList.add('visible');
    tooltipEl.setAttribute('aria-hidden', 'false');
    moveTooltip(clientX, clientY);
  }

  function moveTooltip(clientX, clientY) {
    if (!tooltipEl || !tooltipEl.classList.contains('visible')) return;
    const pad = 14;
    const rect = tooltipEl.getBoundingClientRect();
    let left = clientX + pad;
    let top = clientY + pad;
    if (left + rect.width > window.innerWidth - 10) {
      left = Math.max(8, clientX - rect.width - pad);
    }
    if (top + rect.height > window.innerHeight - 10) {
      top = Math.max(8, clientY - rect.height - pad);
    }
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('visible');
    tooltipEl.setAttribute('aria-hidden', 'true');
  }

  function wireDelegatedTooltips(svg, tipRegistry) {
    svg.addEventListener('pointermove', (evt) => {
      const target = evt.target?.closest?.('[data-tip-id]');
      if (!target) {
        hideTooltip();
        return;
      }
      const data = tipRegistry.get(target.dataset.tipId);
      if (data) showTooltipData(data, evt.clientX, evt.clientY);
    });
    svg.addEventListener('pointerleave', hideTooltip);
    svg.addEventListener('focusin', (evt) => {
      const target = evt.target?.closest?.('[data-tip-id]');
      if (!target) return;
      const data = tipRegistry.get(target.dataset.tipId);
      if (data) {
        const r = target.getBoundingClientRect();
        showTooltipData(data, r.left + r.width / 2, r.top);
      }
    });
    svg.addEventListener('focusout', hideTooltip);
  }

  /* ========================================================================
     TEAM CATEGORY CLASSIFICATION FOR SCATTER PALETTE
     ======================================================================== */
  function pointColor(t) {
    if (t.champion || t.pos === 1) return '#b8291f';
    if (t.pos === 2 || t.promoted) return '#1b5670';
    if (t.relegated) return '#6e1a1a';
    if (t.finishScore !== null && t.finishScore >= 0.72) return '#2e6f52';
    return '#8b8578';
  }

  /* ========================================================================
     APPLICATION STATE
     ======================================================================== */
  const state = {
    dataset: null,
    model: null,
    scope: {
      tiers: [1, 2, 3, 4],
      startYear: 1981,
      endYear: 2024,
      includeCurtailed: false,
      pointsMode: 'official',
    },
    sec1Metric: 'gfPerGame',
    sec1Target: 'ppg',
    sec2Metric: 'ppg',
    sec3Mode: 'ppg',
    archiveTier: 1,
    archiveSeason: '2024-25',
    archiveMode: 'raw',
    archiveSortCol: 0,
    archiveSortDir: 'asc',
  };

  /* ========================================================================
     DATASET LOADING & VALIDATION
     ======================================================================== */
  async function loadDataset() {
    let ds = null;
    const isFileProtocol = typeof window !== 'undefined' && window.location?.protocol === 'file:';

    if (isFileProtocol) {
      if (typeof window !== 'undefined' && window.__CHAMPIONSHIP_DATASET__) {
        ds = window.__CHAMPIONSHIP_DATASET__;
      } else {
        throw new Error('Offline file:// bundle (window.__CHAMPIONSHIP_DATASET__) was not loaded.');
      }
    } else if (typeof fetch === 'function') {
      const res = await fetch('./data/england-tiers-1-4-1981-2025.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching dataset JSON`);
      ds = await res.json();
    } else if (typeof window !== 'undefined' && window.__CHAMPIONSHIP_DATASET__) {
      ds = window.__CHAMPIONSHIP_DATASET__;
    } else {
      throw new Error('No verified dataset JSON or local bundle was loaded.');
    }

    const valid = CA.validateDataset(ds);
    if (!valid.ok) {
      throw new Error(`Dataset validation failed: ${valid.error}`);
    }
    return ds;
  }

  function showFatalError(errMsg) {
    const panel = document.getElementById('fatal-error-panel');
    const msgEl = document.getElementById('fatal-error-message');
    const mainEl = document.getElementById('main-content');
    const scopeBar = document.querySelector('.scope-bar');
    if (msgEl) msgEl.textContent = errMsg;
    if (panel) panel.hidden = false;
    if (mainEl) mainEl.hidden = true;
    if (scopeBar) scopeBar.hidden = true;
    const metaCov = document.getElementById('meta-coverage');
    if (metaCov) metaCov.textContent = 'Dataset Error';
  }

  /* ========================================================================
     HEADER, SCOPE BAR & LEDGER RENDERING
     ======================================================================== */
  function syncScopeControlsUI() {
    const activePreset = Object.values(CA.PRESETS).find((p) =>
      p.startYear === state.scope.startYear &&
      p.endYear === state.scope.endYear &&
      p.includeCurtailed === state.scope.includeCurtailed &&
      p.pointsMode === state.scope.pointsMode &&
      p.tiers.length === state.scope.tiers.length &&
      p.tiers.every((t, i) => state.scope.tiers[i] === t)
    );

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.setAttribute('aria-pressed', activePreset && activePreset.id === btn.dataset.preset ? 'true' : 'false');
    });

    document.querySelectorAll('[data-points-mode]').forEach((btn) => {
      btn.setAttribute('aria-pressed', state.scope.pointsMode === btn.dataset.pointsMode ? 'true' : 'false');
    });

    document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
      cb.checked = state.scope.tiers.includes(Number(cb.value));
    });

    const startSel = document.getElementById('scope-start-year');
    const endSel = document.getElementById('scope-end-year');
    if (startSel) startSel.value = String(state.scope.startYear);
    if (endSel) endSel.value = String(state.scope.endYear);

    const curtCb = document.getElementById('scope-include-curtailed');
    if (curtCb) curtCb.checked = Boolean(state.scope.includeCurtailed);
  }

  function renderMastheadAndBanner() {
    const ds = state.dataset;
    const m = state.model;

    const metaCov = document.getElementById('meta-coverage');
    const metaMat = document.getElementById('meta-matches');
    const metaGoals = document.getElementById('meta-goals');
    const banner = document.getElementById('normalisation-banner');
    const activeBanner = document.getElementById('active-scope-banner');

    if (m.isEmpty) {
      if (metaCov) metaCov.textContent = '0 Tier-Seasons Selected';
      if (metaMat) metaMat.textContent = '';
      if (metaGoals) metaGoals.textContent = '';
      if (activeBanner) {
        clearEl(activeBanner);
        activeBanner.append('No tier-season tables match this filter. Select at least one pyramid tier above.');
      }
      return;
    }

    if (metaCov) metaCov.textContent = `${m.firstSeason} to ${m.lastSeason} · ${m.numSlots} ${plural(m.numSlots, 'Tier-Season')} (${fmtInt(m.allTeams.length)} Team-Seasons)`;
    if (metaMat) metaMat.textContent = `${fmtInt(m.totalMatches)} Matches`;
    if (metaGoals) metaGoals.textContent = `${fmtInt(m.totalGoals)} Goals`;

    if (banner) {
      clearEl(banner);
      banner.append(
        el('strong', { textContent: 'Historical & Structural Scope: ' }),
        `Full verified corpus covers ${ds.metadata.totalTierSeasonSlots} tier-season slots (${fmtInt(ds.metadata.totalTeamSeasons)} club-seasons, ${fmtInt(ds.metadata.totalMatchesPlayed)} matches) across Tiers 1–4 from 1981–82 (first season of three points for a win) through 2024–25. Division schedules span 38, 40, 42, 44 and 46 matches per team, so primary comparisons use per-game rates and within-slot finish score `,
        el('code', { textContent: '1 − (pos − 1)/(N − 1)' }),
        '. Ongoing/post-2024–25 seasons are excluded.'
      );
    }

    if (activeBanner) {
      clearEl(activeBanner);
      const tierStr = m.tiersPresent.map((t) => `T${t}`).join(', ');
      const basisLabel = state.scope.pointsMode === 'raw'
        ? 'Raw Sporting Points (3W+D, pre-deductions — updates club PPG, rawPos and finishScore in Section 1 correlations/scatter and sensitivity diagnostics; official league outcomes, official rPos and Sections 2–5 outcomes stay on official tables)'
        : 'Official League Table Points (incl. deductions/appeals)';
      const frag = document.createDocumentFragment();
      frag.append(
        el('strong', { textContent: 'Active Filter: ' }),
        `${tierStr} · ${m.firstSeason}–${m.lastSeason} (${m.numSlots} ${plural(m.numSlots, 'slot')}, ${fmtInt(m.allTeams.length)} club-seasons) · Basis: ${basisLabel}. `
      );
      if (m.excludedCurtailedSlots.length > 0) {
        frag.append(
          el('strong', { textContent: 'Default Exclusion: ' }),
          `${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')} excluded from full-season baselines because COVID-19 curtailment produced uneven 34–37 match tables decided on unweighted PPG (plus Bury’s expulsion left Tier 3 with 23 active clubs). Use the toggle above to include them.`
        );
      } else if (m.includedCurtailedSlots.length > 0) {
        frag.append(
          el('strong', { textContent: 'Curtailed Included: ' }),
          `Includes ${m.includedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' & ')} (ranked by unweighted PPG per EFL resolution).`
        );
      }
      activeBanner.appendChild(frag);
    }
  }

  function renderLedger() {
    const m = state.model;
    const grid = document.getElementById('ledger-grid');
    const note = document.getElementById('ledger-sample-note');
    if (!grid) return;
    clearEl(grid);
    if (note) note.textContent = `${m.numSlots} ${plural(m.numSlots, 'slot')} · ${fmtInt(m.allTeams.length)} club-seasons (${state.scope.pointsMode === 'raw' ? 'Raw 3W+D' : 'Official'})`;

    const gfPred = m.correlations.find((c) => c.key === 'gfPerGame');
    const gaPred = m.correlations.find((c) => c.key === 'gaPerGame');
    const drawPred = m.correlations.find((c) => c.key === 'drawRate');
    const winPred = m.correlations.find((c) => c.key === 'winRate');
    const gdPred = m.correlations.find((c) => c.key === 'gdPerGame');
    const atkDef = describeAtkVsDef(m);
    const smallSample = m.numSlots < 3;

    const atkDefStat = smallSample
      ? `${m.numSlots} ${plural(m.numSlots, 'slot')}`
      : `${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}`;

    const survCardStat = smallSample
      ? (m.survivalSeries[0] ? `${fmtNum(m.survivalSeries[0].survivingPpg, 3)} PPG` : 'N/A')
      : (m.survivalStats.slotCount > 0 && m.survivalStats.survivingPpg
        ? `${fmtNum(m.survivalStats.survivingPpg.median, 3)} PPG`
        : 'N/A');

    const scorerCardStat = m.scorerAnalysis.status === 'unavailable'
      ? 'Unavailable'
      : `${m.scorerAnalysis.champWithGbCount} / ${m.scorerAnalysis.availableSlotsCount}`;

    const dl = m.drawLeaderStats;
    const dlMidPct = dl.count > 0 ? (dl.middleHalfCount / dl.count) * 100 : 0;
    const dlChampNames = (dl.championCampaigns || []).map((c) => `${c.team} ${c.season} T${c.tier}`).join(', ');
    const drawAlwaysLast = m.byTierCorrelations.length > 0 && m.byTierCorrelations.every((t) => t.drawIsLastInTier);
    const ss = m.survivalStats;
    const survExclParts = [];
    if (m.noRelegationSlots.length > 0) survExclParts.push(`${m.noRelegationSlots.length} non-relegating`);
    if (ss.excludedAdminBoundaryCount > 0) survExclParts.push(`${ss.excludedAdminBoundaryCount} reprieved`);
    const survExclNote = survExclParts.length > 0 ? ` (${survExclParts.join(', ')} excl.)` : '';

    const cards = [
      {
        idx: '01 · Predictor Hierarchy',
        stat: smallSample ? `${m.numSlots} ${plural(m.numSlots, 'table')}` : (winPred ? fmtNum(winPred.medianRFinish, 3) : 'N/A'),
        claim: smallSample
          ? 'Too few tables (< 3) for cross-season medians'
          : (drawAlwaysLast ? 'Win rate & GD lead by definition; Draws rank last' : 'Win rate & GD lead by definition; Draws rank weakest'),
        detail: smallSample
          ? `Only ${m.numSlots} ${plural(m.numSlots, 'table')} selected (${fmtInt(m.allTeams.length)} club-seasons). Cross-season median r and percentiles are suppressed below 3 tables.`
          : `Within-slot median |r| (finish): W/G ${fmtNum(winPred?.medianAbsRFinish, 3)}, GD/G ${fmtNum(gdPred?.medianAbsRFinish, 3)} (PPG = 3·W/G + D/G; GD = GF − GA). Draws: med signed r = ${fmtSigned(drawPred?.medianRFinish, 3)}, med |r| = ${fmtNum(drawPred?.medianAbsRFinish, 3)}.`,
      },
      {
        idx: '02 · Attack vs. Defence',
        stat: atkDefStat,
        claim: smallSample
          ? 'Within-slot Attack vs. Defence suppressed (< 3 slots)'
          : atkDef.diverges
            ? `${atkDef.withinLeader === 'ga' ? 'GA/G' : 'GF/G'} edges finish rank; ${atkDef.pooledLeader === 'gf' ? 'GF/G' : 'GA/G'} leads R²(PPG)`
            : atkDef.withinLeader === 'tie'
              ? 'Attack and defence virtually tied within-slot'
              : `${atkDef.withinLeader === 'ga' ? 'Goals Against' : 'Goals For'} leads both finish rank & R²(PPG)`,
        detail: smallSample
          ? `Select at least 3 tables to compare within-slot GF/G vs GA/G medians and pooled R²(PPG).`
          : `Within-slot med |r| (finish): GA/G ${fmtNum(atkDef.gaWithin, 3)} vs GF/G ${fmtNum(atkDef.gfWithin, 3)} (${m.withinSlot.gaBeatsGfCount}–${m.withinSlot.gfBeatsGaCount} across ${m.withinSlot.comparableGfGaSlots} tables); pooled R²(PPG): GF/G ${fmtNum(atkDef.gfR2 * 100, 1)}% vs GA/G ${fmtNum(atkDef.gaR2 * 100, 1)}%.`,
      },
      {
        idx: '03 · Champions & Wins',
        stat: smallSample
          ? (m.champs[0] ? `${fmtNum(m.champs[0].officialPpg, 2)} PPG` : 'N/A')
          : `${fmtNum(m.champStats.ppg?.median, 2)} PPG`,
        claim: `${m.champFewerWinsCases.length} ${plural(m.champFewerWinsCases.length, 'champion')} won fewer matches than a rival`,
        detail: smallSample
          ? `${m.champs.map((c) => `${c.season} T${c.tier}: ${c.team} (${c.points} official pts, ${fmtNum(c.officialPpg, 2)} PPG)`).join('; ')}.`
          : `Official 1st-place median is ${fmtNum(m.champStats.ppg?.median, 2)} PPG (IQR ${fmtNum(m.champStats.ppg?.q1, 2)}–${fmtNum(m.champStats.ppg?.q3, 2)}) vs ${fmtNum(m.runnerStats.ppg?.median, 2)} PPG for 2nd. ${m.champFewerWinsCases.length > 0 ? `Includes ${m.champFewerWinsCases[0].champion.team} (${m.champFewerWinsCases[0].season} ${m.champFewerWinsCases[0].historicalDivisionName}, ${m.champFewerWinsCases[0].champion.won}W).` : 'Every champion led or co-led in wins within this filter.'}`,
      },
      {
        idx: '04 · Survival Thresholds',
        stat: survCardStat,
        claim: smallSample
          ? (ss.slotCount > 0 ? `${ss.slotCount} ${plural(ss.slotCount, 'relegation table')} (official)` : 'Zero relegation in selected slice')
          : `${ss.slotCount} ${plural(ss.slotCount, 'relegation battle')}${survExclNote}`,
        detail: ss.slotCount === 0
          ? 'All selected slots had zero relegation (re-election or reprieve era).'
          : smallSample
            ? m.survivalSeries.map((s) => `${s.season} T${s.tier}: safe ${s.survivingTeam} ${s.survivingPts} pts (${fmtNum(s.survivingPpg, 3)} PPG) vs rel ${s.relegatedTeam} ${s.relegatedHighPts} pts (${fmtNum(s.relegatedHighPpg, 3)} PPG)`).join('; ')
            : `Official median lowest survivor: ${fmtNum(ss.survivingPpg?.median, 3)} PPG (~${fmtNum(ss.survivingPts38?.median, 1)}/38g or ${fmtNum(ss.survivingPts46?.median, 1)}/46g); highest relegated hit ${fmtNum(Math.max(...m.survivalSeries.map((s) => s.relegatedHighPpg ?? 0)), 3)} PPG.`,
      },
      {
        idx: '05 · Draw Leaders',
        stat: smallSample
          ? `${dl.count} ${plural(dl.count, 'club')}`
          : (dl.finishScore?.median !== null && dl.finishScore?.median !== undefined ? `${fmtNum(dl.finishScore.median * 100, 1)}% Pct` : 'N/A'),
        claim: smallSample
          ? `${dl.count} draw-leading ${plural(dl.count, 'club')} in ${m.numSlots} selected ${plural(m.numSlots, 'table')}`
          : `${dl.middleHalfCount} of ${dl.count} (${fmtNum(dlMidPct, 0)}%) in middle half; ${dl.championCount} ${plural(dl.championCount, 'title')}`,
        detail: smallSample
          ? m.seasonDrawLeaders.map((r) => `${r.team} (${ordinal(r.officialPos)}, ${r.drawn}D in ${r.season} T${r.tier})`).join('; ')
          : `${dl.relegatedCount} draw ${plural(dl.relegatedCount, 'leader')} relegated and ${dl.championCount} won a title${dlChampNames ? ` (${dlChampNames})` : ''}; median ${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}% percentile (${ordinal(dl.pos?.median)} across mixed 20–24 club divisions).`,
      },
      {
        idx: '06 · Scorer Coverage',
        stat: scorerCardStat,
        claim: m.scorerAnalysis.status === 'unavailable' ? 'Pre-1992 & EFL T2–T4 scorer data unavailable' : 'Champions & Golden Boot winners loosely linked',
        detail: m.scorerAnalysis.status === 'unavailable'
          ? 'Verified season top-scorer tables exist for Tier 1 Premier League (1992–93..2024–25) only. Switch scope to inspect.'
          : `Across ${m.scorerAnalysis.availableSlotsCount} verified PL ${plural(m.scorerAnalysis.availableSlotsCount, 'slot')}, ${m.scorerAnalysis.champWithGbCount} ${plural(m.scorerAnalysis.champWithGbCount, 'champion')} fielded the Golden Boot winner${m.scorerAnalysis.unavailableSlotsCount > 0 ? ` (${m.scorerAnalysis.unavailableSlotsCount} non-PL/pre-92 ${plural(m.scorerAnalysis.unavailableSlotsCount, 'slot')} omitted)` : ''}.`,
      },
    ];

    cards.forEach((c) => {
      grid.appendChild(
        el('article', { className: 'ledger-card' },
          el('div', null,
            el('div', { className: 'ledger-index', textContent: c.idx }),
            el('div', { className: 'ledger-stat num', textContent: c.stat }),
            el('p', { className: 'ledger-claim', textContent: c.claim })
          ),
          el('p', { className: 'ledger-detail', textContent: c.detail })
        )
      );
    });
  }

  /* ========================================================================
     SECTION 1: PREDICTOR HIERARCHY & SCATTER
     ======================================================================== */
  function renderSection1() {
    const m = state.model;
    const titleEl = document.getElementById('sec1-title');
    const proseEl = document.getElementById('sec1-prose');
    const calloutEl = document.getElementById('sec1-callout-list');
    const tbody = document.getElementById('sec1-corr-tbody');
    const tierTbody = document.getElementById('sec1-tier-tbody');

    const winPred = m.correlations.find((c) => c.key === 'winRate');
    const gdPred = m.correlations.find((c) => c.key === 'gdPerGame');
    const gaPred = m.correlations.find((c) => c.key === 'gaPerGame');
    const gfPred = m.correlations.find((c) => c.key === 'gfPerGame');
    const drawPred = m.correlations.find((c) => c.key === 'drawRate');
    const atkDef = describeAtkVsDef(m);
    const pooledMap = new Map(m.pooledCorrelations.map((p) => [p.key, p]));
    const gfPool = pooledMap.get('gfPerGame');
    const gaPool = pooledMap.get('gaPerGame');

    const smallSample = m.numSlots < 3;
    const drawRankOverall = m.correlations.findIndex((c) => c.key === 'drawRate') + 1;
    const drawAlwaysLast = m.byTierCorrelations.length > 0 && m.byTierCorrelations.every((t) => t.drawIsLastInTier);
    const drawPosSlots = drawPred ? drawPred.slotValues.filter((sv) => sv.rFinish > 0).length : 0;
    const drawNegSlots = drawPred ? drawPred.slotValues.filter((sv) => sv.rFinish < 0).length : 0;

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = `Small Sample (${m.numSlots} ${plural(m.numSlots, 'Table')}) — Cross-Season Ranking Suppressed`;
      } else {
        const marginVerb = atkDef.withinDiff < 0.002 ? 'Vies Closely With' : atkDef.withinDiff < 0.02 ? 'Narrowly Edges' : 'Leads';
        const drawSuffix = drawAlwaysLast
          ? `While Draws Rank Last in Every Selected Tier`
          : `While Draws Rank ${ordinal(drawRankOverall)} Overall`;
        if (atkDef.diverges) {
          titleEl.textContent = `${atkDef.withinLeader === 'ga' ? 'Goals Against' : 'Goals For'} ${marginVerb} Within-Slot Rank While ${atkDef.pooledLeader === 'gf' ? 'Goals For' : 'Goals Against'} Leads Pooled R²(PPG)—${drawSuffix}`;
        } else if (atkDef.withinLeader === 'tie') {
          titleEl.textContent = `Attack and Defence Match Within-Slot While Draws Rank Last`;
        } else {
          titleEl.textContent = `${atkDef.withinLeader === 'ga' ? 'Goals Against' : 'Goals For'} ${marginVerb} On Both Metrics—${drawSuffix}`;
        }
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        proseEl.append(
          el('p', null,
            `Too few tables (${m.numSlots} ${plural(m.numSlots, 'table')}, ${fmtInt(m.allTeams.length)} club-seasons) to summarise cross-season medians or percentages reliably. Inspect individual club figures below or widen the year/tier filter to at least 3 tables.`
          )
        );
      } else {
        const withinPhrase = atkDef.withinLeader === 'tie'
          ? 'within-slot median |r| with finish score puts GF/G and GA/G virtually level'
          : atkDef.withinLeader === 'ga'
            ? 'within-slot median |r| with finish score slightly favours goals conceded (GA/G)'
            : 'within-slot median |r| with finish score slightly favours goals scored (GF/G)';
        const pooledPhrase = atkDef.pooledLeader === 'tie'
          ? 'pooled R² with PPG is virtually equal'
          : atkDef.pooledLeader === 'gf'
            ? 'pooled R² with PPG favours goals scored (GF/G)'
            : 'pooled R² with PPG favours goals conceded (GA/G)';
        const tierDrawSummary = drawAlwaysLast
          ? `across ${m.byTierCorrelations.length === 1 ? `Tier ${m.byTierCorrelations[0].tier}` : `each selected tier (${m.byTierCorrelations.map((t) => `T${t.tier}`).join(', ')})`}`
          : `across tiers (${m.byTierCorrelations.map((t) => `T${t.tier}: ${ordinal(t.drawRankInTier)}`).join(', ')})`;

        proseEl.append(
          el('p', null,
            'Across ',
            el('strong', { textContent: `${m.numSlots} ${plural(m.numSlots, 'tier-season table')}` }),
            ` (${fmtInt(m.allTeams.length)} club-seasons), predictors are ranked by their `,
            el('strong', { textContent: 'within-slot median of |r| with normalised finish score' }),
            ' (1.00 = 1st, 0.00 = last — the median across divisions of each table’s absolute r, rather than |median signed r|) so 20–24 club divisions and 38–46 game schedules enter on equal footing. Wins/G (med |r| ',
            el('strong', { textContent: fmtNum(winPred?.medianAbsRFinish, 3) }),
            ') and GD/G (med |r| ',
            el('strong', { textContent: fmtNum(gdPred?.medianAbsRFinish, 3) }),
            ') lead by accounting identity (',
            el('code', { textContent: 'PPG = 3·(W/G) + D/G' }),
            '; ',
            el('code', { textContent: 'GD/G = GF/G − GA/G' }),
            ').',
            isRawMode() ? ' Raw Sporting Points mode (3W+D) updates PPG, rawPos and finishScore here while official table position (rPos) and outcomes stay fixed.' : ''
          ),
          el('p', null,
            'Between attack and defence, two standard metrics can point differently: ',
            el('strong', { textContent: withinPhrase }),
            ` (GA/G ${fmtNum(atkDef.gaWithin, 3)} vs GF/G ${fmtNum(atkDef.gfWithin, 3)}, gap ${fmtNum(atkDef.withinDiff, 3)}; defence stronger in ${m.withinSlot.gaBeatsGfCount} of ${m.withinSlot.comparableGfGaSlots} tables vs ${m.withinSlot.gfBeatsGaCount} for attack${atkDef.ties > 0 ? `, ${atkDef.ties} tied` : ''}), whereas `,
            el('strong', { textContent: pooledPhrase }),
            ` (GF/G ${fmtNum(atkDef.gfR2 * 100, 1)}% from r = ${fmtSigned(gfPool?.rPpg, 3)} vs GA/G ${fmtNum(atkDef.gaR2 * 100, 1)}% from r = ${fmtSigned(gaPool?.rPpg, 3)}).${atkDef.diverges ? ' The measures use different outcomes and aggregation methods, so their rankings can differ.' : ''} Both margins are modest descriptive associations rather than tactical prescriptions.`
          ),
          el('p', null,
            `Meanwhile draw rate ranks ${ordinal(drawRankOverall)} of 5 predictors ${tierDrawSummary}: `,
            el('strong', { textContent: `median signed r = ${fmtSigned(drawPred?.medianRFinish, 3)}` }),
            ` (signed Q1–Q3: ${fmtSigned(drawPred?.q1RFinish, 3)} to ${fmtSigned(drawPred?.q3RFinish, 3)}; negative in ${drawNegSlots} vs positive in ${drawPosSlots} of ${drawPred?.slotCount ?? 0} tables), giving a `,
            el('strong', { textContent: `median of |r| = ${fmtNum(drawPred?.medianAbsRFinish, 3)}` }),
            `. Arithmetic explains why: over 22 matches, winning 11 and losing 11 yields 33 points, whereas drawing all 22 yields 22 points (and 11 draws yield just 11 points).`
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      m.correlations.forEach((c, idx) => {
        appendKV(
          calloutEl,
          `${idx + 1}. ${c.shortLabel}`,
          `med r ${fmtSigned(c.medianRFinish, 3)} (med |r| ${fmtNum(c.medianAbsRFinish, 3)})`,
          idx === 0 ? 'highlight' : ''
        );
      });
      if (gfPool && gaPool) {
        appendKV(calloutEl, 'Pooled R²(PPG) GF/GA', `${fmtNum(gfPool.r2Ppg * 100, 1)}% / ${fmtNum(gaPool.r2Ppg * 100, 1)}%`);
      }
    }

    if (tbody) {
      clearEl(tbody);
      for (const c of m.correlations) {
        const pooled = pooledMap.get(c.key);
        tbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: c.shortLabel, title: c.identityNote }),
          el('td', { textContent: fmtSigned(c.medianRFinish, 3) }),
          el('td', { textContent: `${fmtNum(c.medianAbsRFinish, 3)} (${fmtNum(c.q1AbsRFinish, 2)}–${fmtNum(c.q3AbsRFinish, 2)})` }),
          el('td', { textContent: fmtSigned(c.medianRPpg, 3) }),
          el('td', { textContent: pooled?.r2Ppg !== null && pooled?.r2Ppg !== undefined ? `${fmtNum(pooled.r2Ppg * 100, 1)}%` : 'N/A' })
        ));
      }
    }

    if (tierTbody) {
      clearEl(tierTbody);
      for (const row of m.byTierCorrelations) {
        const gf = row.predictors.find((p) => p.key === 'gfPerGame');
        const ga = row.predictors.find((p) => p.key === 'gaPerGame');
        const tGfPool = row.pooledCorrelations?.find((p) => p.key === 'gfPerGame');
        const tGaPool = row.pooledCorrelations?.find((p) => p.key === 'gaPerGame');
        tierTbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: `Tier ${row.tier}` }),
          el('td', { textContent: String(row.slotCount) }),
          el('td', { textContent: fmtNum(gf?.medianAbsRFinish, 3) }),
          el('td', { textContent: fmtNum(ga?.medianAbsRFinish, 3) }),
          el('td', { textContent: `${row.gaBeatsGfCount}/${row.comparableGfGaSlots}` }),
          el('td', { textContent: `${fmtNum((tGfPool?.r2Ppg ?? 0) * 100, 1)}% / ${fmtNum((tGaPool?.r2Ppg ?? 0) * 100, 1)}%` })
        ));
      }
    }

    renderSec1Scatter();
    renderSec1Bars();
  }

  function renderSec1Scatter() {
    const m = state.model;
    const container = document.getElementById('chart-sec1-scatter');
    const subEl = document.getElementById('sec1-scatter-subtitle');
    const noteEl = document.getElementById('sec1-scatter-note');
    if (!container) return;
    clearEl(container);

    const def = CA.PREDICTOR_DEFS.find((d) => d.key === state.sec1Metric) || CA.PREDICTOR_DEFS[2];
    const targetIsPpg = state.sec1Target === 'ppg';
    const valid = m.allTeams.filter((t) => typeof t[def.key] === 'number' && Number.isFinite(t[def.key]) && Number.isFinite(targetIsPpg ? t.ppg : t.finishScore));

    if (valid.length < 2) {
      container.appendChild(el('p', { textContent: 'Insufficient observations for scatter plot.' }));
      return;
    }

    const xVals = valid.map((t) => t[def.key]);
    const yVals = valid.map((t) => (targetIsPpg ? t.ppg : t.finishScore));
    const pooledR = CA.pearson(xVals, yVals);
    const fit = CA.olsFit(xVals, yVals);
    const slotMatch = m.correlations.find((c) => c.key === def.key);

    if (subEl) {
      const basisTag = isRawMode() ? ' · Raw 3W+D Points Basis' : '';
      subEl.textContent = `${fmtInt(valid.length)} team-seasons · ${def.label} vs ${targetIsPpg ? 'Points Per Game' : 'Normalised Finish Score (1=1st..0=Last)'}${basisTag}`;
    }
    if (noteEl) {
      const basisNote = isRawMode() ? ' (Raw 3W+D basis active: deductions excluded from PPG and Finish Score).' : '';
      noteEl.textContent = `${def.identityNote}. Within-slot median r(Finish) = ${fmtSigned(slotMatch?.medianRFinish, 3)}; pooled sample r(PPG) = ${fmtSigned(pooledR, 3)} (R² = ${fmtPct((pooledR ?? 0) ** 2 * 100, 1)})${basisNote}`;
    }

    const W = 760;
    const H = 430;
    const pad = { top: 24, right: 24, bottom: 48, left: 56 };
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;

    let xMin = Math.min(...xVals);
    let xMax = Math.max(...xVals);
    const xPad = Math.max(0.05, (xMax - xMin) * 0.06);
    xMin -= xPad;
    xMax += xPad;

    const yMin = targetIsPpg ? Math.max(0, Math.min(...yVals) - 0.1) : -0.04;
    const yMax = targetIsPpg ? Math.max(...yVals) + 0.1 : 1.04;

    const sx = (v) => pad.left + ((v - xMin) / Math.max(1e-9, xMax - xMin)) * iw;
    const sy = (v) => pad.top + ih - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * ih;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Scatter plot of ${def.label} against ${targetIsPpg ? 'Points Per Game' : 'Finish Score'}` });

    // Grid lines
    for (let i = 0; i <= 5; i++) {
      const yVal = yMin + ((yMax - yMin) * i) / 5;
      const py = sy(yVal);
      svg.appendChild(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: py, y2: py, stroke: '#d5cfc2', 'stroke-dasharray': i === 0 ? '' : '3 3', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: pad.left - 8, y: py + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, yVal.toFixed(2)));
    }
    for (let i = 0; i <= 5; i++) {
      const xVal = xMin + ((xMax - xMin) * i) / 5;
      const px = sx(xVal);
      svg.appendChild(svgEl('line', { x1: px, x2: px, y1: pad.top, y2: H - pad.bottom, stroke: '#ede8dd', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: px, y: H - pad.bottom + 18, 'text-anchor': 'middle', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, xVal.toFixed(2)));
    }

    // Draw points: neutral first, special tiers last so champions remain visible
    const ordered = valid.slice().sort((a, b) => {
      const rank = (t) => (t.champion ? 4 : t.relegated ? 3 : t.promoted || t.pos === 2 ? 2 : 1);
      return rank(a) - rank(b);
    });

    const tipMap = new Map();
    ordered.forEach((t, idx) => {
      const xVal = t[def.key];
      const yVal = targetIsPpg ? t.ppg : t.finishScore;
      const isKey = t.champion || t.relegated || t.pos === 2;
      const id = `s1-${idx}`;
      tipMap.set(id, {
        title: `${t.team} (${t.season})`,
        subtitle: `T${t.tier} · ${t.historicalDivisionName}`,
        rows: [
          ['Official Pos', `${t.officialPos} of ${t.teamCount}`],
          [def.shortLabel, fmtNum(xVal, 3)],
          ['PPG', fmtNum(t.ppg, 3)],
          ['Record', `${t.won}W-${t.drawn}D-${t.lost}L (${t.pointsUsed} pts)`],
        ],
      });
      svg.appendChild(svgEl('circle', {
        cx: sx(xVal).toFixed(1),
        cy: sy(yVal).toFixed(1),
        r: t.champion ? 4.2 : isKey ? 3.2 : 2.3,
        fill: pointColor(t),
        'fill-opacity': isKey ? '0.84' : '0.42',
        stroke: t.champion ? '#141412' : 'none',
        'stroke-width': t.champion ? '0.8' : '0',
        'data-tip-id': id,
      }));
    });

    // OLS fit line
    if (fit) {
      const lx1 = xMin;
      const lx2 = xMax;
      const ly1 = fit.slope * lx1 + fit.intercept;
      const ly2 = fit.slope * lx2 + fit.intercept;
      svg.appendChild(svgEl('line', {
        x1: sx(lx1).toFixed(1),
        y1: sy(ly1).toFixed(1),
        x2: sx(lx2).toFixed(1),
        y2: sy(ly2).toFixed(1),
        stroke: '#141412',
        'stroke-width': 2.2,
        'stroke-dasharray': '6 4',
      }));
    }

    // Axis labels
    svg.appendChild(svgEl('text', { x: pad.left + iw / 2, y: H - 10, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: '#3e3c38' }, def.label));
    svg.appendChild(svgEl('text', {
      x: 16,
      y: pad.top + ih / 2,
      transform: `rotate(-90 16 ${pad.top + ih / 2})`,
      'text-anchor': 'middle',
      'font-size': 12,
      'font-weight': 600,
      fill: '#3e3c38',
    }, targetIsPpg ? 'Points Per Game (PPG)' : 'Normalised Finish Score'));

    wireDelegatedTooltips(svg, tipMap);
    container.appendChild(svg);
  }

  function renderSec1Bars() {
    const m = state.model;
    const container = document.getElementById('chart-sec1-bars');
    if (!container) return;
    clearEl(container);

    const W = 520;
    const H = 225;
    const pad = { top: 18, right: 32, bottom: 32, left: 96 };
    const iw = W - pad.left - pad.right;
    const rowH = (H - pad.top - pad.bottom) / Math.max(1, m.correlations.length);
    const sx = (v) => pad.left + Math.max(0, Math.min(1, v)) * iw;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Within-slot IQR and median magnitude correlation per predictor' });
    const pooledMap = new Map(m.pooledCorrelations.map((p) => [p.key, p]));

    for (let g = 0; g <= 10; g += 2) {
      const v = g / 10;
      const px = sx(v);
      svg.appendChild(svgEl('line', { x1: px, x2: px, y1: pad.top, y2: H - pad.bottom, stroke: '#ede8dd', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: px, y: H - 10, 'text-anchor': 'middle', 'font-size': 10, fill: '#6e6a61', class: 'axis-label' }, v.toFixed(1)));
    }

    const tipMap = new Map();
    m.correlations.forEach((c, i) => {
      const cy = pad.top + rowH * (i + 0.5);
      const q1 = c.q1AbsRFinish ?? 0;
      const q3 = c.q3AbsRFinish ?? 0;
      const med = c.medianAbsRFinish ?? 0;
      const minV = c.minAbsRFinish ?? q1;
      const maxV = c.maxAbsRFinish ?? q3;
      const pooled = pooledMap.get(c.key)?.absRFinish;

      svg.appendChild(svgEl('text', { x: pad.left - 8, y: cy + 4, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 600, fill: '#141412' }, c.shortLabel));
      // Min-Max whisker
      svg.appendChild(svgEl('line', { x1: sx(minV), x2: sx(maxV), y1: cy, y2: cy, stroke: '#8c867a', 'stroke-width': 1.5 }));
      // Q1-Q3 bar
      const barColor = c.key === 'winRate' || c.key === 'gdPerGame' ? '#3e3c38' : c.key === 'gaPerGame' ? '#1b5670' : c.key === 'gfPerGame' ? '#b8291f' : '#a66314';
      svg.appendChild(svgEl('rect', { x: sx(q1), y: cy - 7, width: Math.max(3, sx(q3) - sx(q1)), height: 14, fill: barColor, 'fill-opacity': '0.28', stroke: barColor, 'stroke-width': 1.2 }));
      // Median dot
      const tid = `s1b-${i}`;
      tipMap.set(tid, {
        title: c.label,
        subtitle: `${c.slotCount} within-slot correlations`,
        rows: [
          ['Median |r| (Finish)', fmtNum(med, 3)],
          ['IQR |r|', `${fmtNum(q1, 3)}–${fmtNum(q3, 3)}`],
          ['Min..Max |r|', `${fmtNum(minV, 3)}–${fmtNum(maxV, 3)}`],
          ['Pooled |r|', fmtNum(pooled, 3)],
        ],
      });
      svg.appendChild(svgEl('circle', { cx: sx(med), cy, r: 5, fill: barColor, 'data-tip-id': tid }));
      if (typeof pooled === 'number' && Number.isFinite(pooled)) {
        const px = sx(pooled);
        svg.appendChild(svgEl('polygon', {
          points: `${px},${cy - 5} ${px + 5},${cy} ${px},${cy + 5} ${px - 5},${cy}`,
          fill: '#fcfbf8',
          stroke: '#141412',
          'stroke-width': 1.4,
          'data-tip-id': tid,
        }));
      }
      svg.appendChild(svgEl('text', { x: Math.min(W - 4, sx(maxV) + 6), y: cy + 4, 'font-size': 10, fill: '#3e3c38', class: 'axis-label' }, fmtNum(med, 3)));
    });

    wireDelegatedTooltips(svg, tipMap);
    container.appendChild(svg);
  }

  /* ========================================================================
     SECTION 2: CHAMPIONS vs RUNNERS-UP & FEWER-WINS COUNTEREXAMPLES
     ======================================================================== */
  function renderSection2() {
    const m = state.model;
    const titleEl = document.getElementById('sec2-title');
    const proseEl = document.getElementById('sec2-prose');
    const calloutEl = document.getElementById('sec2-callout-list');
    const eraEl = document.getElementById('sec2-era-cards');
    const distTbody = document.getElementById('sec2-dist-tbody');
    const tierTbody = document.getElementById('sec2-tier-tbody');
    const fewerBox = document.getElementById('sec2-fewer-wins-box');

    const cStats = m.champStats;
    const rStats = m.runnerStats;
    const smallSample = m.numSlots < 3;
    const rawNote = isRawMode() ? ' (Official league outcomes; unaffected by Raw Sporting toggle.)' : '';

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = `Title Race Snapshot: ${m.champs.length} ${plural(m.champs.length, 'Champion')} in Selected Scope`;
      } else {
        titleEl.textContent = m.champFewerWinsCases.length > 0
          ? `Champions Lead by +${fmtNum((cStats.gdPerGame?.mean ?? 0) - (rStats.gdPerGame?.mean ?? 0), 2)} GD/G—Though ${m.champFewerWinsCases.length} Won Fewer Matches Than a Rival`
          : `Title Standard: Champions Outscore Runners-Up More Than They Out-Defend Them`;
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        const pairSummaries = m.titlePairs.map((p) => `${p.season} T${p.tier}: ${p.champion.team} (${p.champion.points} pts, ${fmtNum(p.champion.officialPpg, 2)} PPG) beat ${p.runnerUp.team} (${p.runnerUp.points} pts, ${fmtNum(p.runnerUp.officialPpg, 2)} PPG)`).join('; ');
        proseEl.append(
          el('p', null,
            `Small-sample scope (${m.champs.length} ${plural(m.champs.length, 'title race')}, < 3 tier-seasons): cross-season title averages and spreads are suppressed. `,
            pairSummaries ? `${pairSummaries}.${rawNote}` : rawNote.trim()
          )
        );
      } else {
        proseEl.append(
          el('p', null,
            `Across ${m.champs.length} ${plural(m.champs.length, 'title race')} in scope, champions average `,
            el('strong', { textContent: `${fmtNum(cStats.ppg?.mean, 2)} PPG` }),
            ` (vs ${fmtNum(rStats.ppg?.mean, 2)} for 2nd place) behind `,
            el('strong', { textContent: `${fmtNum(cStats.gfPerGame?.mean, 2)} GF/G` }),
            ` (2nd: ${fmtNum(rStats.gfPerGame?.mean, 2)}) and `,
            el('strong', { textContent: `${fmtNum(cStats.gaPerGame?.mean, 2)} GA/G` }),
            ` (2nd: ${fmtNum(rStats.gaPerGame?.mean, 2)}). Champions outscored the runner-up in ${m.champMoreGfThanRunnerUp} of ${m.titlePairs.length} races and conceded fewer in ${m.champFewerGaThanRunnerUp}.${rawNote}`
          ),
          el('p', null,
            m.champFewerWinsCases.length > 0
              ? `Expanding outside Tier 1 highlights that title winners do not always top the win column: ${m.champFewerWinsCases.length} ${plural(m.champFewerWinsCases.length, 'champion')} (all in Tiers 2–4) finished 1st despite fewer wins than another club, led historically by Burnley in the 1981–82 Third Division (21 wins and 17 draws for 80 points vs Carlisle United’s 23 wins).`
              : 'Every champion inside this filtered selection led or shared the lead in total matches won.'
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Champion PPG (Mean / Med)', smallSample && m.champs.length === 1 ? fmtNum(cStats.ppg?.mean, 2) : `${fmtNum(cStats.ppg?.mean, 2)} / ${fmtNum(cStats.ppg?.median, 2)}`, 'highlight');
      appendKV(calloutEl, 'Runner-Up PPG (Mean / Med)', smallSample && m.runnersUp.length === 1 ? fmtNum(rStats.ppg?.mean, 2) : `${fmtNum(rStats.ppg?.mean, 2)} / ${fmtNum(rStats.ppg?.median, 2)}`);
      appendKV(calloutEl, 'Champion Win Rate', `${fmtNum((cStats.winRate?.mean ?? 0) * 100, 1)}% (${fmtNum(cStats.winRate?.mean, 3)})`);
      appendKV(calloutEl, 'Champ GF/G vs GA/G', `${fmtNum(cStats.gfPerGame?.mean, 2)} / ${fmtNum(cStats.gaPerGame?.mean, 2)}`);
      appendKV(calloutEl, 'Champs Not Leading Wins', `${m.champFewerWinsCases.length} of ${m.champs.length}`);
    }

    if (eraEl) {
      clearEl(eraEl);
      for (const e of m.eraSplits) {
        eraEl.appendChild(el('div', { className: 'era-card' },
          el('div', { className: 'era-years', textContent: `${e.name} · ${e.years} (${e.count} ${plural(e.count, 'slot')})` }),
          el('div', { className: 'era-main num', textContent: `${fmtNum(e.champPpg, 2)} PPG` }),
          el('div', { className: 'era-sub num', textContent: `Runner-up ${fmtNum(e.runnerPpg, 2)} · GD ${fmtSigned(e.champGdPerGame, 2)}/G` })
        ));
      }
    }

    if (fewerBox) {
      clearEl(fewerBox);
      if (m.champFewerWinsCases.length === 0) {
        fewerBox.hidden = true;
      } else {
        fewerBox.hidden = false;
        const list = el('ul');
        for (const c of m.champFewerWinsCases) {
          const rivals = c.winLeaders.map((w) => `${w.team} ${w.won}W (${w.points} pts)`).join(', ');
          list.appendChild(el('li', {
            textContent: `${c.season} ${c.historicalDivisionName} (T${c.tier}): Champion ${c.champion.team} (${c.champion.won}W-${c.champion.drawn}D-${c.champion.lost}L, ${c.champion.points} pts) trailed ${rivals} in wins.`,
          }));
        }
        fewerBox.append(
          el('h4', { textContent: `Champions With Fewer Wins Than Another Club (${m.champFewerWinsCases.length})` }),
          list
        );
      }
    }

    if (distTbody) {
      clearEl(distTbody);
      const metrics = [
        ['PPG', 'ppg', 2],
        ['Win Rate', 'winRate', 3],
        ['Goals For / G', 'gfPerGame', 2],
        ['Goals Ag. / G', 'gaPerGame', 2],
        ['Goal Diff / G', 'gdPerGame', 2],
      ];
      for (const [label, key, d] of metrics) {
        const cs = cStats[key];
        const rs = rStats[key];
        if (!cs || !rs) continue;
        distTbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: label }),
          el('td', { className: 'text-col', textContent: '1st Place' }),
          el('td', { textContent: fmtNum(cs.mean, d) }),
          el('td', { textContent: fmtNum(cs.median, d) }),
          el('td', { textContent: `${fmtNum(cs.q1, d)}–${fmtNum(cs.q3, d)}` }),
          el('td', { textContent: `${fmtNum(cs.min, d)}–${fmtNum(cs.max, d)}` })
        ));
        distTbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: label }),
          el('td', { className: 'text-col', textContent: '2nd Place' }),
          el('td', { textContent: fmtNum(rs.mean, d) }),
          el('td', { textContent: fmtNum(rs.median, d) }),
          el('td', { textContent: `${fmtNum(rs.q1, d)}–${fmtNum(rs.q3, d)}` }),
          el('td', { textContent: `${fmtNum(rs.min, d)}–${fmtNum(rs.max, d)}` })
        ));
      }
    }

    if (tierTbody) {
      clearEl(tierTbody);
      for (const t of m.byTierChampions) {
        tierTbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: `Tier ${t.tier}` }),
          el('td', { textContent: String(t.slotCount) }),
          el('td', { textContent: fmtNum(t.champStats.ppg?.mean, 2) }),
          el('td', { textContent: fmtNum(t.runnerStats.ppg?.mean, 2) }),
          el('td', { textContent: fmtNum(t.champStats.gfPerGame?.mean, 2) }),
          el('td', { textContent: fmtNum(t.champStats.gaPerGame?.mean, 2) })
        ));
      }
    }

    renderSec2Timeline();
    renderSec2Distributions();
  }

  function renderSec2Timeline() {
    const m = state.model;
    const container = document.getElementById('chart-sec2-timeline');
    const subEl = document.getElementById('sec2-timeline-subtitle');
    if (!container) return;
    clearEl(container);

    const k = state.sec2Metric;
    const tk = k === 'ppg' ? 'officialPpg' : k;
    const labelMap = {
      ppg: 'Official Points Per Game (PPG)',
      winRate: 'Win Rate (W / G)',
      gfPerGame: 'Goals For Per Game (GF / G)',
      gaPerGame: 'Goals Against Per Game (GA / G)',
      gdPerGame: 'Goal Difference Per Game (GD / G)',
    };

    const pairs = m.titlePairs.filter((p) => Number.isFinite(p.champion[tk]) && Number.isFinite(p.runnerUp[tk]));
    if (pairs.length === 0) return;

    if (subEl) {
      const basisTag = isRawMode() ? ' · Official league outcomes' : '';
      subEl.textContent = `${labelMap[k]} across ${pairs.length} ${plural(pairs.length, 'tier-season')} (${m.firstSeason} to ${m.lastSeason})${basisTag}`;
    }

    const years = Array.from(new Set(pairs.map((p) => p.startYear))).sort((a, b) => a - b);
    const allVals = pairs.flatMap((p) => [p.champion[tk], p.runnerUp[tk]]);
    const yMin = Math.min(...allVals) - (k === 'gdPerGame' ? 0.15 : 0.08);
    const yMax = Math.max(...allVals) + (k === 'gdPerGame' ? 0.15 : 0.08);

    const W = 820;
    const H = 320;
    const pad = { top: 20, right: 24, bottom: 40, left: 52 };
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;

    const minY = years[0];
    const maxY = years[years.length - 1];
    const sx = (yr) => (maxY === minY ? pad.left + iw / 2 : pad.left + ((yr - minY) / (maxY - minY)) * iw);
    const sy = (v) => pad.top + ih - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * ih;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Title race trajectory for ${labelMap[k]}` });

    for (let i = 0; i <= 4; i++) {
      const val = yMin + ((yMax - yMin) * i) / 4;
      const py = sy(val);
      svg.appendChild(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: py, y2: py, stroke: '#ede8dd' }));
      svg.appendChild(svgEl('text', { x: pad.left - 8, y: py + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, val.toFixed(2)));
    }
    const tickStep = Math.max(1, Math.ceil(years.length / 8));
    for (let i = 0; i < years.length; i += tickStep) {
      const yr = years[i];
      svg.appendChild(svgEl('text', { x: sx(yr), y: H - 14, 'text-anchor': 'middle', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, CA.formatSeasonLabel(yr)));
    }

    // Annual mean lines for Champions vs Runners-Up
    const cPts = [];
    const rPts = [];
    for (const yr of years) {
      const yp = pairs.filter((p) => p.startYear === yr);
      cPts.push(`${sx(yr).toFixed(1)},${sy(CA.mean(yp.map((x) => x.champion[tk]))).toFixed(1)}`);
      rPts.push(`${sx(yr).toFixed(1)},${sy(CA.mean(yp.map((x) => x.runnerUp[tk]))).toFixed(1)}`);
    }
    svg.appendChild(svgEl('polyline', { fill: 'none', stroke: '#1b5670', 'stroke-width': 2, 'stroke-opacity': '0.7', points: rPts.join(' ') }));
    svg.appendChild(svgEl('polyline', { fill: 'none', stroke: '#b8291f', 'stroke-width': 2.3, points: cPts.join(' ') }));

    const tipMap = new Map();
    pairs.forEach((p, idx) => {
      const x = sx(p.startYear);
      const yc = sy(p.champion[tk]);
      const yr2 = sy(p.runnerUp[tk]);
      const cid = `s2c-${idx}`;
      const rid = `s2r-${idx}`;
      tipMap.set(cid, {
        title: `1st: ${p.champion.team} (${p.season})`,
        subtitle: `T${p.tier} · ${p.historicalDivisionName}`,
        rows: [
          [labelMap[k], fmtNum(p.champion[tk], 3)],
          ['Official Pts', `${p.champion.points} (${p.champion.played}g)`],
          ['Runner-Up', `${p.runnerUp.team} (${fmtNum(p.runnerUp[tk], 3)})`],
        ],
      });
      tipMap.set(rid, {
        title: `2nd: ${p.runnerUp.team} (${p.season})`,
        subtitle: `T${p.tier} · ${p.historicalDivisionName}`,
        rows: [
          [labelMap[k], fmtNum(p.runnerUp[tk], 3)],
          ['Official Pts', `${p.runnerUp.points} (${p.runnerUp.played}g)`],
          ['Champion', `${p.champion.team} (${fmtNum(p.champion[tk], 3)})`],
        ],
      });
      svg.appendChild(svgEl('circle', { cx: x.toFixed(1), cy: yr2.toFixed(1), r: 3.1, fill: '#1b5670', 'fill-opacity': '0.68', 'data-tip-id': rid }));
      svg.appendChild(svgEl('circle', { cx: x.toFixed(1), cy: yc.toFixed(1), r: 3.6, fill: '#b8291f', 'fill-opacity': '0.88', 'data-tip-id': cid }));
    });

    wireDelegatedTooltips(svg, tipMap);
    container.appendChild(svg);
  }

  function renderSec2Distributions() {
    const m = state.model;
    const container = document.getElementById('chart-sec2-distributions');
    if (!container) return;
    clearEl(container);

    const defs = [
      { key: 'ppg', label: 'PPG' },
      { key: 'winRate', label: 'W / G' },
      { key: 'gfPerGame', label: 'GF / G' },
      { key: 'gaPerGame', label: 'GA / G' },
      { key: 'gdPerGame', label: 'GD / G' },
    ];

    const W = 540;
    const H = 260;
    const pad = { top: 20, right: 24, bottom: 26, left: 74 };
    const iw = W - pad.left - pad.right;
    const rowH = (H - pad.top - pad.bottom) / defs.length;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Quantile comparison between Champions and Runners-Up' });
    const tipMap = new Map();

    defs.forEach((d, idx) => {
      const cs = m.champStats[d.key];
      const rs = m.runnerStats[d.key];
      if (!cs || !rs) return;
      const gMin = Math.min(cs.min, rs.min);
      const gMax = Math.max(cs.max, rs.max);
      const span = Math.max(1e-6, gMax - gMin);
      const sx = (v) => pad.left + ((v - gMin) / span) * iw;
      const cy = pad.top + rowH * (idx + 0.5);

      svg.appendChild(svgEl('text', { x: pad.left - 8, y: cy + 4, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 600, fill: '#141412' }, d.label));

      // Champion row (top half)
      const y1 = cy - 7;
      svg.appendChild(svgEl('line', { x1: sx(cs.min), x2: sx(cs.max), y1, y2: y1, stroke: '#b8291f', 'stroke-width': 1.2, 'stroke-opacity': '0.55' }));
      svg.appendChild(svgEl('rect', { x: sx(cs.q1), y: y1 - 4.5, width: Math.max(2, sx(cs.q3) - sx(cs.q1)), height: 9, fill: '#b8291f', 'fill-opacity': '0.35', stroke: '#b8291f' }));
      const tidC = `s2d-c-${idx}`;
      tipMap.set(tidC, {
        title: `1st Place · ${d.label}`,
        rows: [['Mean / Med', `${fmtNum(cs.mean, 3)} / ${fmtNum(cs.median, 3)}`], ['IQR', `${fmtNum(cs.q1, 3)}–${fmtNum(cs.q3, 3)}`], ['Min–Max', `${fmtNum(cs.min, 3)}–${fmtNum(cs.max, 3)}`]],
      });
      svg.appendChild(svgEl('circle', { cx: sx(cs.median), cy: y1, r: 4, fill: '#b8291f', 'data-tip-id': tidC }));

      // Runner-Up row (bottom half)
      const y2 = cy + 7;
      svg.appendChild(svgEl('line', { x1: sx(rs.min), x2: sx(rs.max), y1: y2, y2, stroke: '#1b5670', 'stroke-width': 1.2, 'stroke-opacity': '0.55' }));
      svg.appendChild(svgEl('rect', { x: sx(rs.q1), y: y2 - 4.5, width: Math.max(2, sx(rs.q3) - sx(rs.q1)), height: 9, fill: '#1b5670', 'fill-opacity': '0.3', stroke: '#1b5670' }));
      const tidR = `s2d-r-${idx}`;
      tipMap.set(tidR, {
        title: `2nd Place · ${d.label}`,
        rows: [['Mean / Med', `${fmtNum(rs.mean, 3)} / ${fmtNum(rs.median, 3)}`], ['IQR', `${fmtNum(rs.q1, 3)}–${fmtNum(rs.q3, 3)}`], ['Min–Max', `${fmtNum(rs.min, 3)}–${fmtNum(rs.max, 3)}`]],
      });
      svg.appendChild(svgEl('circle', { cx: sx(rs.median), cy: y2, r: 4, fill: '#1b5670', 'data-tip-id': tidR }));
    });

    wireDelegatedTooltips(svg, tipMap);
    container.appendChild(svg);
  }

  /* ========================================================================
     SECTION 3: SURVIVAL, RELEGATION & PROMOTION
     ======================================================================== */
  function renderSection3() {
    const m = state.model;
    const titleEl = document.getElementById('sec3-title');
    const proseEl = document.getElementById('sec3-prose');
    const calloutEl = document.getElementById('sec3-callout-list');
    const tierTbody = document.getElementById('sec3-tier-tbody');
    const promoTbody = document.getElementById('sec3-promo-tbody');
    const dedNoteEl = document.getElementById('sec3-deduction-note');

    const ss = m.survivalStats;
    const relAbove40Pct = ss.slotCount ? (ss.relegatedAtOrAbove40Over38Rate.length / ss.slotCount) * 100 : 0;
    const rawNote = isRawMode() ? ' (Official league outcomes; unaffected by Raw Sporting toggle.)' : '';
    const smallSample = ss.slotCount < 3;
    const boundaryReprieves = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);

    if (titleEl) {
      titleEl.textContent = ss.slotCount === 0
        ? 'Relegation Suspended Across Selected Re-Election / Reprieve Seasons'
        : smallSample
          ? `Survival Cutoff Snapshot (${ss.slotCount} ${plural(ss.slotCount, 'Relegation-Active Table')})`
          : `Survival Varies by Tier: 40/38g Fails Lower-Tier Cutoffs While 50/46g Is Rarely Reached`;
    }

    if (proseEl) {
      clearEl(proseEl);
      if (ss.slotCount === 0) {
        proseEl.append(el('p', { textContent: `All ${m.noRelegationSlots.length} selected ${plural(m.noRelegationSlots.length, 'slot')} experienced zero relegation (${m.noRelegationSlots.map((x) => `${x.season} T${x.tier}`).join(', ')}). Expand the scope to examine active relegation boundaries.` }));
      } else if (smallSample) {
        const slotDesc = m.survivalSeries.map((s) => `${s.season} T${s.tier}: lowest survivor ${s.survivingTeam} (${s.survivingPts} pts, ${fmtNum(s.survivingPpg, 3)} PPG) vs highest relegated ${s.relegatedTeam} (${s.relegatedHighPts} pts, ${fmtNum(s.relegatedHighPpg, 3)} PPG)`).join('; ');
        const reprieveDesc = boundaryReprieves.length > 0
          ? ` Boundary reprieves excluded from lowest merit survivor: ${boundaryReprieves.map((r) => `${r.team} (${r.season} T${r.tier}, ${ordinal(r.pos)}, ${r.outcomeType})`).join(', ')}.`
          : '';
        proseEl.append(el('p', null, `Small-sample scope (${ss.slotCount} ${plural(ss.slotCount, 'relegation-active table')}, < 3 slots): cross-season medians are suppressed. ${slotDesc}.${reprieveDesc}${rawNote}`));
      } else {
        const highRelSlot = m.survivalSeries.reduce((b, x) => ((x.relegatedHighPpg ?? 0) > (b?.relegatedHighPpg ?? 0) ? x : b), null);
        const exclParts = [];
        if (ss.excludedNoRelegationCount > 0) exclParts.push(`${ss.excludedNoRelegationCount} ${plural(ss.excludedNoRelegationCount, 'zero-relegation slot')} separated`);
        if (boundaryReprieves.length > 0) exclParts.push(`${boundaryReprieves.length} ${plural(boundaryReprieves.length, 'boundary reprieve row')} excluded from lowest merit survivor`);
        const exclClause = exclParts.length > 0 ? ` (${exclParts.join('; ')})` : '';
        proseEl.append(
          el('p', null,
            `Across ${ss.slotCount} ${plural(ss.slotCount, 'relegation-active table')}${exclClause}, the median lowest surviving side earned `,
            el('strong', { textContent: `${fmtNum(ss.survivingPpg?.median, 3)} PPG` }),
            ` (${fmtNum(ss.survivingPts38?.median, 1)} on a 38-game scale; ${fmtNum(ss.survivingPts46?.median, 1)} over 46 games). Premier League survival folklore fixes on 40 points (1.053 PPG), whereas Championship and League One relegation battles regularly require ~49–50 points over 46 games (1.067–1.087 PPG).${rawNote}`
          ),
          el('p', null,
            `In ${ss.relegatedAtOrAbove40Over38Rate.length} of ${ss.slotCount} ${ss.slotCount === 1 ? 'table' : 'tables'} (${fmtNum(relAbove40Pct, 1)}%), at least one relegated club reached ≥ 1.053 PPG (40/38g). The highest-scoring relegated club in scope hit `,
            el('strong', { textContent: `${fmtNum(highRelSlot?.relegatedHighPpg, 3)} PPG` }),
            highRelSlot ? ` (${highRelSlot.relegatedTeam} ${highRelSlot.relegatedHighPts} pts in ${highRelSlot.season} ${highRelSlot.historicalDivisionName}).` : '.'
          )
        );
        const pl42Series = m.survivalSeries.filter((x) => x.tier === 1 && x.startYear >= 1992 && x.startYear <= 1994);
        const pl38Series = m.survivalSeries.filter((x) => x.tier === 1 && x.startYear >= 1995 && x.gamesPerTeam === 38);
        if (m.tiersPresent.length === 1 && m.tiersPresent[0] === 1 && pl42Series.length > 0 && pl38Series.length >= 3) {
          const pl38RelStats = CA.statsSummary(pl38Series.map((x) => x.relegatedPts));
          const pl38SurvStats = CA.statsSummary(pl38Series.map((x) => x.survivingPts));
          if (pl38RelStats && pl38SurvStats) {
            const n38 = pl38Series.length;
            const pl38Rel40Plus = pl38Series.filter((x) => x.relegatedPts >= 40).length;
            const pl38Rel35Plus = pl38Series.filter((x) => x.relegatedPts >= 35).length;
            const pl38SurvUnder40 = pl38Series.filter((x) => x.survivingPts < 40).length;
            const pl38SurvUnder40Pct = fmtNum((pl38SurvUnder40 / n38) * 100, 1);
            proseEl.append(
              el('p', null,
                el('strong', { textContent: '38-game Premier League baseline' }),
                ` (${n38} seasons, ${pl38Series[0].season} to ${pl38Series[n38 - 1].season}, excluding ${pl42Series.length} 1992–95 42-game ${plural(pl42Series.length, 'table')}): highest relegated club (18th place) averaged `,
                el('strong', { textContent: `${fmtNum(pl38RelStats.mean, 1)} points` }),
                ' (median ',
                el('strong', { textContent: fmtNum(pl38RelStats.median, 0) }),
                `), 35 points would not have beaten 18th place in `,
                el('strong', { textContent: `${pl38Rel35Plus} of ${n38} seasons` }),
                ', ',
                el('strong', { textContent: `${pl38Rel40Plus} of ${n38}` }),
                ' saw a club relegated on 40+ points, and 17th place finished below 40 points in ',
                el('strong', { textContent: `${pl38SurvUnder40} of ${n38} seasons (${pl38SurvUnder40Pct}%)` }),
                ` (17th mean ${fmtNum(pl38SurvStats.mean, 1)}, median ${fmtNum(pl38SurvStats.median, 0)}).`
              )
            );
          }
        }
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      const slotSummary = ss.excludedNoRelegationCount > 0 ? `${ss.slotCount} (${ss.excludedNoRelegationCount} zero-rel. excl.)` : String(ss.slotCount);
      appendKV(calloutEl, 'Relegation-Active Slots', slotSummary);
      appendKV(calloutEl, 'Med. Lowest Survivor', smallSample && ss.slotCount === 1 ? `${fmtNum(ss.survivingPpg?.min, 3)} PPG` : `${fmtNum(ss.survivingPpg?.median, 3)} PPG`, 'highlight');
      appendKV(calloutEl, 'Min. Survivor Ever', `${fmtNum(ss.survivingPpg?.min, 3)} PPG`);
      appendKV(calloutEl, 'Med. Highest Relegated', smallSample && ss.slotCount === 1 ? `${fmtNum(ss.relegatedPpg?.min, 3)} PPG` : `${fmtNum(ss.relegatedPpg?.median, 3)} PPG`);
      appendKV(calloutEl, 'Rel ≥ 1.053 PPG (40/38g)', `${ss.relegatedAtOrAbove40Over38Rate.length} / ${ss.slotCount}`);
      appendKV(calloutEl, 'Rel ≥ 1.087 PPG (50/46g)', `${ss.relegatedAtOrAbove50Over46Rate.length} / ${ss.slotCount}`);
      if (boundaryReprieves.length > 0) {
        appendKV(calloutEl, 'Reprieved Clubs Excluded', boundaryReprieves.map((r) => `${r.team} (${r.season} T${r.tier})`).join(', '));
      }
    }

    if (tierTbody) {
      clearEl(tierTbody);
      for (const t of m.byTierSurvival) {
        const mr = t.maxRelegatedRow;
        tierTbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: `Tier ${t.tier}` }),
          el('td', { textContent: String(t.slotCount) }),
          el('td', { textContent: fmtNum(t.survivingPpg?.median, 3) }),
          el('td', { textContent: fmtNum(t.survivingPpg?.min, 3) }),
          el('td', { textContent: fmtNum(t.relegatedHighPpg?.max, 3) }),
          el('td', { className: 'text-col', textContent: mr ? `${mr.relegatedTeam} (${mr.season}, ${mr.relegatedHighPts} pts)` : '—' })
        ));
      }
    }

    if (promoTbody) {
      clearEl(promoTbody);
      if (m.byTierPromotion.length === 0) {
        promoTbody.appendChild(el('tr', null, el('td', { colSpan: 6, className: 'text-col table-note-cell', textContent: 'Select Tiers 2, 3, or 4 to view promotion & play-off cutoffs.' })));
      } else {
        for (const t of m.byTierPromotion) {
          promoTbody.appendChild(el('tr', null,
            el('td', { className: 'text-col', textContent: `Tier ${t.tier}` }),
            el('td', { textContent: fmtNum(t.lastAutoPpg?.median, 3) }),
            el('td', { textContent: fmtNum(t.lastAutoPpg?.min, 3) }),
            el('td', { textContent: String(t.poWinnerCount) }),
            el('td', { textContent: `${t.poWinnerThirdCount}/${t.poWinnerCount}` }),
            el('td', { textContent: `${t.poWinnerLowestPosCount}/${t.poWinnerCount}` })
          ));
        }
      }
    }

    if (dedNoteEl) {
      const ds = m.deductionSensitivity;
      const examples = ds.relegatedDueToDeduction.slice(0, 4).map((x) => `${x.team} ${x.season} ${x.signedAdjustment}`).join(', ');
      const relClause = ds.relegatedDueToDeductionCount > 0
        ? `${ds.relegatedDueToDeductionCount} ${ds.relegatedDueToDeductionCount === 1 ? 'club was' : 'clubs were'} relegated after deductions despite finishing above the bottom on 3W+D points (e.g. ${examples}).`
        : 'no clubs changed relegation status on raw 3W+D points in this scope.';
      const affectedClause = ds.affectedRowsCount > 0
        ? `${ds.affectedRowsCount} ${plural(ds.affectedRowsCount, 'club-season')} received points adjustments; ${relClause}`
        : 'no clubs received points adjustments in this scope.';
      dedNoteEl.textContent = `On-pitch 3W+D sensitivity check (official survival cutoffs above retain actual league points): ${affectedClause}`;
    }

    renderSec3Chart();
  }

  function renderSec3Chart() {
    const m = state.model;
    const container = document.getElementById('chart-sec3-survival');
    const subEl = document.getElementById('sec3-chart-subtitle');
    const noteEl = document.getElementById('sec3-chart-note');
    if (!container) return;
    clearEl(container);

    if (m.survivalSeries.length === 0) {
      container.appendChild(el('p', { textContent: 'No active relegation seasons in current scope.' }));
      return;
    }

    const mode = state.sec3Mode; // 'ppg' | 'pts46' | 'pts38'
    const mult = mode === 'pts46' ? 46 : mode === 'pts38' ? 38 : 1;
    const digits = mode === 'ppg' ? 2 : 1;
    const basisTag = isRawMode() ? ' · Official league points (unaffected by Raw toggle)' : '';

    if (subEl) {
      subEl.textContent = mode === 'ppg'
        ? `Lowest safe vs. highest relegated club in Official Points Per Game (directly comparable across 38–46 game leagues)${basisTag}`
        : `Normalised ${mult}-game official point equivalent (PPG × ${mult}) across ${m.survivalSeries.length} ${plural(m.survivalSeries.length, 'relegation-active table')}${basisTag}`;
    }
    if (noteEl) {
      const notes = [];
      const activeBoundaryReprieves = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);
      if (m.noRelegationSlots.length > 0) {
        notes.push(`Excludes ${m.noRelegationSlots.length} zero-relegation Tier 4 ${plural(m.noRelegationSlots.length, 'slot')} (${m.noRelegationSlots.map((x) => `${x.season} T${x.tier}`).join(', ')}).`);
      }
      if (activeBoundaryReprieves.length > 0) {
        notes.push(`Excludes ${activeBoundaryReprieves.length} reprieved/expelled boundary ${plural(activeBoundaryReprieves.length, 'club')} from lowest merit survivor (${activeBoundaryReprieves.map((r) => `${r.team} ${r.season} T${r.tier} (${ordinal(r.pos)}, ${r.outcomeType})`).join(', ')}).`);
      }
      notes.push(`Horizontal rules mark 1.053 PPG (40 points per 38 games: ${(40 / 38 * mult).toFixed(digits)}) and 1.087 PPG (50 points per 46 games: ${(50 / 46 * mult).toFixed(digits)}).`);
      noteEl.textContent = notes.join(' ');
    }

    const years = Array.from(new Set(m.survivalSeries.map((s) => s.startYear))).sort((a, b) => a - b);
    const vals = m.survivalSeries.flatMap((s) => [s.survivingPpg * mult, s.relegatedHighPpg * mult]);
    const yMin = Math.min(...vals, 0.72 * mult);
    const yMax = Math.max(...vals, 1.24 * mult);

    const W = 820;
    const H = 310;
    const pad = { top: 20, right: 24, bottom: 40, left: 52 };
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;

    const minY = years[0];
    const maxY = years[years.length - 1];
    const sx = (yr) => (maxY === minY ? pad.left + iw / 2 : pad.left + ((yr - minY) / (maxY - minY)) * iw);
    const sy = (v) => pad.top + ih - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * ih;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Survival and relegation threshold chart' });

    for (let i = 0; i <= 4; i++) {
      const val = yMin + ((yMax - yMin) * i) / 4;
      const py = sy(val);
      svg.appendChild(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: py, y2: py, stroke: '#ede8dd' }));
      svg.appendChild(svgEl('text', { x: pad.left - 8, y: py + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, val.toFixed(digits)));
    }
    const tickStep = Math.max(1, Math.ceil(years.length / 8));
    for (let i = 0; i < years.length; i += tickStep) {
      svg.appendChild(svgEl('text', { x: sx(years[i]), y: H - 14, 'text-anchor': 'middle', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, CA.formatSeasonLabel(years[i])));
    }

    // Reference benchmark lines: 40/38 and 50/46
    const b40 = (40 / 38) * mult;
    const b50 = (50 / 46) * mult;
    svg.appendChild(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: sy(b40), y2: sy(b40), stroke: '#a66314', 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }));
    svg.appendChild(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: sy(b50), y2: sy(b50), stroke: '#1b5670', 'stroke-width': 1.8, 'stroke-dasharray': '2 3' }));

    // Annual averages
    const sLine = [];
    const rLine = [];
    for (const yr of years) {
      const sub = m.survivalSeries.filter((x) => x.startYear === yr);
      sLine.push(`${sx(yr).toFixed(1)},${sy(CA.mean(sub.map((x) => x.survivingPpg * mult))).toFixed(1)}`);
      rLine.push(`${sx(yr).toFixed(1)},${sy(CA.mean(sub.map((x) => x.relegatedHighPpg * mult))).toFixed(1)}`);
    }
    svg.appendChild(svgEl('polyline', { fill: 'none', stroke: '#2e6f52', 'stroke-width': 2.1, points: sLine.join(' ') }));
    svg.appendChild(svgEl('polyline', { fill: 'none', stroke: '#6e1a1a', 'stroke-width': 2.1, points: rLine.join(' ') }));

    const tipMap = new Map();
    m.survivalSeries.forEach((s, idx) => {
      const px = sx(s.startYear);
      const ySurv = sy(s.survivingPpg * mult);
      const yRel = sy(s.relegatedHighPpg * mult);
      const idS = `s3s-${idx}`;
      const idR = `s3r-${idx}`;
      tipMap.set(idS, {
        title: `Survived: ${s.survivingTeam} (${s.season})`,
        subtitle: `T${s.tier} · ${s.historicalDivisionName}`,
        rows: [
          ['Position', `${s.survivingPos} (lowest safe)`],
          ['PPG', fmtNum(s.survivingPpg, 3)],
          ['Points', `${s.survivingPts} (${s.gamesPerTeam}g)`],
        ],
      });
      tipMap.set(idR, {
        title: `Relegated: ${s.relegatedTeam} (${s.season})`,
        subtitle: `T${s.tier} · ${s.historicalDivisionName}`,
        rows: [
          ['Highest Rel PPG', fmtNum(s.relegatedHighPpg, 3)],
          ['Points', `${s.relegatedHighPts} (${s.gamesPerTeam}g)`],
          ['Guaranteed Safe', `${s.guaranteedSafePts} pts (${fmtNum(s.guaranteedSafePpg, 3)} PPG)`],
        ],
      });
      svg.appendChild(svgEl('circle', { cx: px.toFixed(1), cy: ySurv.toFixed(1), r: 3.1, fill: '#2e6f52', 'fill-opacity': '0.72', 'data-tip-id': idS }));
      svg.appendChild(svgEl('circle', { cx: px.toFixed(1), cy: yRel.toFixed(1), r: 3.1, fill: '#6e1a1a', 'fill-opacity': '0.72', 'data-tip-id': idR }));
    });

    wireDelegatedTooltips(svg, tipMap);
    container.appendChild(svg);
  }

  /* ========================================================================
     SECTION 4: DRAWS ANALYSIS
     ======================================================================== */
  function renderSection4() {
    const m = state.model;
    const titleEl = document.getElementById('sec4-title');
    const proseEl = document.getElementById('sec4-prose');
    const calloutEl = document.getElementById('sec4-callout-list');
    const tbody = document.getElementById('sec4-draws-tbody');
    const chartEl = document.getElementById('chart-sec4-draws-pos');
    const noteEl = document.getElementById('sec4-chart-note');

    const dl = m.drawLeaderStats;
    const smallSample = m.numSlots < 3;
    const botPct = dl.count > 0 ? (dl.bottomQuarterCount / dl.count) * 100 : 0;
    const midPct = dl.count > 0 ? (dl.middleHalfCount / dl.count) * 100 : 0;
    const topPct = dl.count > 0 ? (dl.topQuarterCount / dl.count) * 100 : 0;
    const rawNote = isRawMode() ? ' (Official league outcomes; unaffected by Raw Sporting toggle.)' : '';
    const champText = dl.championCount > 0
      ? dl.championCampaigns.map((c) => `${c.team} (${c.season} T${c.tier}, ${c.won}W–${c.drawn}D–${c.lost}L)`).join('; ')
      : null;

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = `Draw Leaders in Selected Scope (${dl.count} ${plural(dl.count, 'Club-Season')})`;
      } else if (dl.championCount > 0) {
        titleEl.textContent = `Leading in Draws Clusters in the Middle Half (${fmtNum(midPct, 0)}% Between 25%–75%)—With ${dl.championCount} ${plural(dl.championCount, 'Champion')}`;
      } else {
        titleEl.textContent = `Leading in Draws Clusters in the Middle Half (${fmtNum(midPct, 0)}% Between 25%–75%)`;
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        const listStr = m.seasonDrawLeaders.map((r) => `${r.team} (${r.season} T${r.tier}: ${r.drawn}D, ${ordinal(r.pos)} of ${r.teamCount})`).join('; ');
        proseEl.append(
          el('p', null,
            `Small-sample scope (${dl.slotCount} ${plural(dl.slotCount, 'table')}, < 3 slots): cross-season medians and percentage distributions are suppressed. Draw leaders in scope: ${listStr}.${rawNote}`
          )
        );
      } else {
        const coLeaderNote = dl.coLeaderSlotsCount > 0
          ? ` (${dl.coLeaderSlotsCount} ${plural(dl.coLeaderSlotsCount, 'table')} produced tied co-leaders, so these ${dl.count} club-seasons are not independent observations)`
          : '';
        proseEl.append(
          el('p', null,
            `Across ${dl.count} ${plural(dl.count, 'club-season')} that led or co-led their division in draws within ${dl.slotCount} ${plural(dl.slotCount, 'table')}${coLeaderNote}, median finish percentile is `,
            el('strong', { textContent: `${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}%` }),
            ` (${ordinal(dl.pos?.median)} raw rank; because division sizes vary from 20 to 24 clubs, finish percentile — 100% first to 0% last — is used for cross-tier splits).`
          ),
          el('p', null,
            `Finish distribution spans the entire table rather than collapsing strictly to mid-table: `,
            el('strong', { textContent: `${dl.middleHalfCount} (${fmtNum(midPct, 1)}%)` }),
            ` finished in the middle half (25%–75% finish percentile), `,
            el('strong', { textContent: `${dl.bottomQuarterCount} (${fmtNum(botPct, 1)}%)` }),
            ` finished in the bottom quarter (<25%), and `,
            el('strong', { textContent: `${dl.topQuarterCount} (${fmtNum(topPct, 1)}%)` }),
            ` finished in the top quarter (>75%). Exactly `,
            el('strong', { textContent: `${dl.relegatedCount}` }),
            ` draw-leading ${dl.relegatedCount === 1 ? 'club was' : 'clubs were'} relegated and `,
            el('strong', { textContent: `${dl.promotedCount}` }),
            ` earned promotion. `,
            champText
              ? `${dl.championCount} draw ${plural(dl.championCount, 'leader')} won a title: ${champText}.${rawNote}`
              : `No draw-leading side in scope won the league title.${rawNote}`
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Draw-Leader Club-Seasons', dl.coLeaderSlotsCount > 0 ? `${dl.count} across ${plural(dl.slotCount, 'table')}` : String(dl.count));
      appendKV(calloutEl, 'Median Finish Percentile', smallSample && dl.count === 1 ? `${fmtNum((dl.finishScore?.min ?? 0) * 100, 1)}% (${ordinal(dl.pos?.min)} raw)` : `${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}% (${ordinal(dl.pos?.median)} raw)`, 'highlight');
      appendKV(calloutEl, 'Middle Half (25%–75%)', `${dl.middleHalfCount} / ${dl.count} (${fmtNum(midPct, 1)}%)`);
      appendKV(calloutEl, 'Top / Bottom Quarters', `${dl.topQuarterCount} (>75%) / ${dl.bottomQuarterCount} (<25%)`);
      appendKV(calloutEl, 'Promoted / Relegated / Champ', `${dl.promotedCount} / ${dl.relegatedCount} / ${dl.championCount}`);
    }

    if (chartEl) {
      clearEl(chartEl);
      const bins = [
        { label: 'Top Quarter\n(>75%–100%)', items: m.seasonDrawLeaders.filter((x) => (x.officialFinishScore ?? 0) > 0.75), color: '#2e6f52' },
        { label: 'Upper Mid\n(50%–75%)', items: m.seasonDrawLeaders.filter((x) => (x.officialFinishScore ?? 0) >= 0.5 && (x.officialFinishScore ?? 0) <= 0.75), color: '#1b5670' },
        { label: 'Lower Mid\n(25%–<50%)', items: m.seasonDrawLeaders.filter((x) => (x.officialFinishScore ?? 0) >= 0.25 && (x.officialFinishScore ?? 0) < 0.5), color: '#a66314' },
        { label: 'Bottom Quarter\n(0%–<25%)', items: m.seasonDrawLeaders.filter((x) => (x.officialFinishScore ?? 0) < 0.25), color: '#6e1a1a' },
      ];
      const maxCount = Math.max(1, ...bins.map((b) => b.items.length));
      const W = 520;
      const H = 225;
      const pad = { top: 20, right: 20, bottom: 44, left: 42 };
      const iw = W - pad.left - pad.right;
      const ih = H - pad.top - pad.bottom;
      const bw = iw / bins.length;
      const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Finish percentile distribution of division draw leaders' });
      const tipMap = new Map();

      bins.forEach((b, i) => {
        const bh = (b.items.length / maxCount) * ih;
        const bx = pad.left + i * bw + bw * 0.16;
        const by = pad.top + ih - bh;
        const tid = `s4b-${i}`;
        tipMap.set(tid, {
          title: b.label.replace('\n', ' '),
          rows: [
            ['Draw-Leader Clubs', String(b.items.length)],
            ['Share', `${fmtNum((b.items.length / Math.max(1, dl.count)) * 100, 1)}%`],
            ['Relegated in Bin', String(b.items.filter((x) => x.relegated).length)],
          ],
        });
        svg.appendChild(svgEl('rect', { x: bx, y: by, width: bw * 0.68, height: Math.max(2, bh), fill: b.color, 'fill-opacity': '0.78', 'data-tip-id': tid }));
        svg.appendChild(svgEl('text', { x: bx + bw * 0.34, y: by - 5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#141412', class: 'axis-label' }, String(b.items.length)));
        const lines = b.label.split('\n');
        svg.appendChild(svgEl('text', { x: bx + bw * 0.34, y: H - 24, 'text-anchor': 'middle', 'font-size': 10, fill: '#3e3c38' }, lines[0]));
        svg.appendChild(svgEl('text', { x: bx + bw * 0.34, y: H - 11, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6e6a61' }, lines[1]));
      });

      wireDelegatedTooltips(svg, tipMap);
      chartEl.appendChild(svg);
    }

    if (noteEl) {
      noteEl.textContent = `Percentile normalisation places champions at 100% and last place at 0% cleanly across 20-, 21-, 22-, 23-, and 24-club tables (${dl.middleHalfCount}/${dl.count} in the 25%–75% middle half; co-leader ties share slot outcomes).${rawNote}`;
    }

    if (tbody) {
      clearEl(tbody);
      const top20 = m.highDrawCampaigns.slice(0, 20);
      if (top20.length === 0) {
        tbody.appendChild(el('tr', null, el('td', { colSpan: 7, className: 'text-col table-note-cell', textContent: 'No team-seasons ≥ 36.8% draw rate in current filter.' })));
      } else {
        for (const t of top20) {
          tbody.appendChild(el('tr', null,
            el('td', { className: 'text-col', textContent: `${t.season} (T${t.tier})` }),
            el('td', { className: 'text-col', textContent: t.team }),
            el('td', { textContent: String(t.pos) }),
            el('td', { textContent: String(t.drawn) }),
            el('td', { textContent: `${fmtNum((t.drawRate ?? 0) * 100, 1)}%` }),
            el('td', { textContent: `${t.won}–${t.drawn}–${t.lost}` }),
            el('td', { textContent: String(t.points) })
          ));
        }
      }
    }
  }

  /* ========================================================================
     SECTION 5: GOLDEN BOOT & SCORER COVERAGE BOUNDARY
     ======================================================================== */
  function renderSection5() {
    const m = state.model;
    const sa = m.scorerAnalysis;
    const titleEl = document.getElementById('sec5-title');
    const proseEl = document.getElementById('sec5-prose');
    const calloutEl = document.getElementById('sec5-callout-list');
    const scopeBanner = document.getElementById('sec5-scope-banner');
    const unavailPanel = document.getElementById('sec5-unavailable-panel');
    const unavailCopy = document.getElementById('sec5-unavailable-copy');
    const verifiedPanel = document.getElementById('sec5-verified-panel');

    if (sa.status === 'unavailable') {
      if (titleEl) titleEl.textContent = 'Top-Scorer Coverage Is Explicitly Unavailable Outside Premier League (1992–2025)';
      if (proseEl) {
        clearEl(proseEl);
        proseEl.append(el('p', { textContent: sa.note }));
      }
      if (calloutEl) {
        clearEl(calloutEl);
        appendKV(calloutEl, 'Verified Scorer Slots', `0 of ${m.numSlots}`, 'highlight');
        appendKV(calloutEl, 'Policy', 'Explicit unavailable (no estimates)');
      }
      if (scopeBanner) scopeBanner.hidden = true;
      if (unavailPanel) unavailPanel.hidden = false;
      if (unavailCopy) unavailCopy.textContent = sa.note;
      if (verifiedPanel) verifiedPanel.hidden = true;
      return;
    }

    if (unavailPanel) unavailPanel.hidden = true;
    if (verifiedPanel) verifiedPanel.hidden = false;
    if (scopeBanner) {
      if (sa.status === 'verified-partial') {
        scopeBanner.hidden = false;
        scopeBanner.textContent = `Scope Notice: ${sa.note}`;
      } else {
        scopeBanner.hidden = true;
      }
    }

    const ss = sa.shareStats;
    const pctWithGb = ((sa.champWithGbCount / Math.max(1, sa.availableSlotsCount)) * 100).toFixed(1);
    if (titleEl) {
      titleEl.textContent = `Across Verified PL Seasons, ${(100 - Number(pctWithGb)).toFixed(0)}% of Champions Lacked the Golden Boot Winner`;
    }
    if (proseEl) {
      clearEl(proseEl);
      const rawNote = isRawMode() ? ' (Official PL league outcomes; unaffected by Raw Sporting toggle.)' : '';
      proseEl.append(
        el('p', null,
          `Within the ${sa.availableSlotsCount} verified Premier League tables (1992–93 to 2024–25), `,
          el('strong', { textContent: `${sa.champWithGbCount} of ${sa.availableSlotsCount} (${pctWithGb}%)` }),
          ` champions contained the league’s Golden Boot winner (individual season-winner correlation with finishing 1st: r = ${fmtSigned(ss.rGbChampAll, 3)}).`
        ),
        el('p', null,
          `Among Top-Four clubs (1st n = ${ss.champ?.count ?? 0}, 2nd n = ${ss.runner?.count ?? 0}, 3rd–4th n = ${ss.thirdFourth?.count ?? 0}), champions show a slightly lower median leading-scorer share than 3rd–4th finishers: `,
          el('strong', { textContent: `${fmtNum(ss.champ?.median, 1)}%` }),
          ` vs `,
          el('strong', { textContent: `${fmtNum(ss.thirdFourth?.median, 1)}%` }),
          ` (Pearson r between concentration share and official PPG = ${fmtSigned(ss.rSharePpgTop4, 3)}; descriptive correlation only).${rawNote}`
        )
      );
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Verified Scorer Slots', `${sa.availableSlotsCount} (PL 1992–2025)`);
      appendKV(calloutEl, 'Champs w/ Golden Boot', `${sa.champWithGbCount} / ${sa.availableSlotsCount} (${pctWithGb}%)`, 'highlight');
      appendKV(calloutEl, 'Champ Top-Scorer Share', `${fmtNum(ss.champ?.median, 1)}% median`);
      appendKV(calloutEl, '3rd–4th Top-Scorer Share', `${fmtNum(ss.thirdFourth?.median, 1)}% median`);
      appendKV(calloutEl, 'r(Share vs. PPG, Top-4)', fmtSigned(ss.rSharePpgTop4, 3));
    }

    const gbSubEl = document.getElementById('sec5-gb-subtitle');
    if (gbSubEl) gbSubEl.textContent = `${sa.availableSlotsCount} verified Premier League seasons (${sa.gbInstances.length} Golden Boot winner-seasons)`;

    renderSec5Charts(sa);
  }

  function renderSec5Charts(sa) {
    const shareEl = document.getElementById('chart-sec5-share');
    const gbEl = document.getElementById('chart-sec5-gb-finishes');
    const noteEl = document.getElementById('sec5-share-note');
    const tbody = document.getElementById('sec5-gb-tbody');

    if (noteEl) {
      const basisTag = isRawMode() ? ' (Official PPG plotted; unaffected by Raw Sporting toggle.)' : '';
      noteEl.textContent = `Computed over ${sa.top4Teams.length} Top-Four club-seasons within ${sa.availableRangeLabel}. r(Concentration Share, Official PPG) = ${fmtSigned(sa.shareStats.rSharePpgTop4, 3)}.${basisTag}`;
    }

    if (shareEl) {
      clearEl(shareEl);
      const W = 740;
      const H = 320;
      const pad = { top: 20, right: 24, bottom: 44, left: 54 };
      const iw = W - pad.left - pad.right;
      const ih = H - pad.top - pad.bottom;

      const xs = sa.top4Teams.map((t) => t.scorerShare);
      const ys = sa.top4Teams.map((t) => t.officialPpg);
      const xMin = Math.min(...xs) - 2;
      const xMax = Math.max(...xs) + 2;
      const yMin = Math.min(...ys) - 0.1;
      const yMax = Math.max(...ys) + 0.1;
      const sx = (v) => pad.left + ((v - xMin) / Math.max(1e-9, xMax - xMin)) * iw;
      const sy = (v) => pad.top + ih - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * ih;

      const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Top-four scorer goal concentration against Official PPG' });
      for (let i = 0; i <= 4; i++) {
        const v = yMin + ((yMax - yMin) * i) / 4;
        svg.appendChild(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: sy(v), y2: sy(v), stroke: '#ede8dd' }));
        svg.appendChild(svgEl('text', { x: pad.left - 8, y: sy(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, v.toFixed(2)));
      }
      for (let i = 0; i <= 4; i++) {
        const v = xMin + ((xMax - xMin) * i) / 4;
        svg.appendChild(svgEl('text', { x: sx(v), y: H - 16, 'text-anchor': 'middle', 'font-size': 11, fill: '#6e6a61', class: 'axis-label' }, `${v.toFixed(0)}%`));
      }

      const tipMap = new Map();
      sa.top4Teams.forEach((t, i) => {
        const col = t.pos === 1 ? '#b8291f' : t.pos === 2 ? '#1b5670' : '#2e6f52';
        const tid = `s5-${i}`;
        tipMap.set(tid, {
          title: `${t.team} (${t.season})`,
          subtitle: `PL #${t.pos} · Top scorer: ${t.scorerPlayer}`,
          rows: [
            ['Scorer Share', `${fmtNum(t.scorerShare, 1)}% (${t.scorerGoals}/${t.gf})`],
            ['Official PPG', fmtNum(t.officialPpg, 3)],
            ['Golden Boot', t.hasGoldenBootWinner ? 'Yes' : 'No'],
          ],
        });
        svg.appendChild(svgEl('circle', {
          cx: sx(t.scorerShare).toFixed(1),
          cy: sy(t.officialPpg).toFixed(1),
          r: t.pos === 1 ? 5 : 4,
          fill: col,
          'fill-opacity': '0.78',
          stroke: t.hasGoldenBootWinner ? '#141412' : 'none',
          'stroke-width': t.hasGoldenBootWinner ? 2 : 0,
          'data-tip-id': tid,
        }));
      });

      const fit = CA.olsFit(xs, ys);
      if (fit) {
        svg.appendChild(svgEl('line', {
          x1: sx(xMin), y1: sy(fit.slope * xMin + fit.intercept),
          x2: sx(xMax), y2: sy(fit.slope * xMax + fit.intercept),
          stroke: '#141412', 'stroke-width': 2, 'stroke-dasharray': '5 4',
        }));
      }

      wireDelegatedTooltips(svg, tipMap);
      shareEl.appendChild(svg);
    }

    if (gbEl) {
      clearEl(gbEl);
      const buckets = [
        { label: '1st (Champ)', n: sa.gbInstances.filter((x) => x.pos === 1).length, col: '#b8291f' },
        { label: '2nd Place', n: sa.gbInstances.filter((x) => x.pos === 2).length, col: '#1b5670' },
        { label: '3rd–4th', n: sa.gbInstances.filter((x) => x.pos === 3 || x.pos === 4).length, col: '#2e6f52' },
        { label: '5th–20th', n: sa.gbInstances.filter((x) => x.pos >= 5).length, col: '#8b8578' },
      ];
      const maxN = Math.max(1, ...buckets.map((b) => b.n));
      const W = 500;
      const H = 175;
      const pad = { top: 18, right: 16, bottom: 32, left: 28 };
      const iw = W - pad.left - pad.right;
      const ih = H - pad.top - pad.bottom;
      const bw = iw / buckets.length;
      const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Golden Boot winners by club finishing position' });
      buckets.forEach((b, i) => {
        const bh = (b.n / maxN) * ih;
        const bx = pad.left + i * bw + bw * 0.2;
        const by = pad.top + ih - bh;
        svg.appendChild(svgEl('rect', { x: bx, y: by, width: bw * 0.6, height: Math.max(2, bh), fill: b.col, 'fill-opacity': '0.82' }));
        svg.appendChild(svgEl('text', { x: bx + bw * 0.3, y: by - 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#141412' }, String(b.n)));
        svg.appendChild(svgEl('text', { x: bx + bw * 0.3, y: H - 10, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#3e3c38' }, b.label));
      });
      gbEl.appendChild(svg);
    }

    if (tbody) {
      clearEl(tbody);
      const availSlots = sa.availableSlotsCount > 0
        ? state.model.slots.filter((s) => s.scorerCoverage === 'verified_pl_complete' || s.scorerCoverage === 'verified')
        : [];
      for (const s of availSlots.slice().reverse()) {
        const champ = s.enrichedTable[0];
        const winnersStr = (s.goldenBootWinners || []).map((w) => w.player).join(' / ');
        const goalsStr = String(s.goldenBootGoals ?? '—');
        const finStr = (s.goldenBootWinners || []).map((w) => {
          const cl = w.clubs[w.clubs.length - 1];
          const row = s.table.find((r) => r.team === cl || (Array.isArray(r.sourceAliases) && r.sourceAliases.includes(cl)));
          return row ? `${row.team} (#${row.pos})` : w.clubDisplay;
        }).join(' / ');
        tbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: s.season }),
          el('td', { className: 'text-col', textContent: winnersStr }),
          el('td', { textContent: goalsStr }),
          el('td', { className: 'text-col', textContent: finStr }),
          el('td', { className: 'text-col', textContent: `${champ.team} (${champ.topScorer?.player ?? '—'}, ${champ.topScorer?.goals ?? '—'})` })
        ));
      }
    }
  }

  /* ========================================================================
     SECTION 6: INTERACTIVE MULTI-TIER ARCHIVE EXPLORER
     ======================================================================== */
  function syncArchiveSelectors() {
    const m = state.model;
    const tierSel = document.getElementById('archive-tier-select');
    const seasonSel = document.getElementById('season-select');
    const countEl = document.getElementById('archive-season-count');
    if (countEl) countEl.textContent = String(m.numSlots);
    if (!tierSel || !seasonSel) return;

    const tiers = m.tiersPresent;
    if (!tiers.includes(state.archiveTier)) {
      state.archiveTier = tiers[0] ?? 1;
    }

    clearEl(tierSel);
    for (const t of tiers) {
      tierSel.appendChild(el('option', { value: String(t), textContent: CA.TIER_LABELS[t] || `Tier ${t}` }));
    }
    tierSel.value = String(state.archiveTier);

    const tierSlots = m.slots.filter((s) => s.tier === state.archiveTier).slice().sort((a, b) => b.startYear - a.startYear);
    if (!tierSlots.some((s) => s.season === state.archiveSeason)) {
      state.archiveSeason = tierSlots[0]?.season ?? '';
    }

    clearEl(seasonSel);
    for (const s of tierSlots) {
      const optLabel = `${s.season} — ${s.historicalDivisionName}${s.status === 'curtailed' ? ' (Curtailed)' : ''}`;
      seasonSel.appendChild(el('option', { value: s.season, textContent: optLabel }));
    }
    seasonSel.value = state.archiveSeason;
  }

  function renderArchive() {
    syncArchiveSelectors();
    const m = state.model;
    const slot = m.slots.find((s) => s.tier === state.archiveTier && s.season === state.archiveSeason) || m.slots[0];
    if (!slot) return;

    const sumTitle = document.getElementById('archive-summary-title');
    const sumList = document.getElementById('archive-summary-list');
    const caption = document.getElementById('archive-league-caption');
    const tbody = document.getElementById('archive-league-tbody');
    const scorersTbody = document.getElementById('archive-scorers-tbody');
    const dedNote = document.getElementById('archive-deduction-note');

    if (sumTitle) sumTitle.textContent = `${slot.season} ${slot.historicalDivisionName} (Tier ${slot.tier})`;
    if (caption) caption.textContent = `${slot.season} ${slot.historicalDivisionName} — Final Standings`;

    if (sumList) {
      clearEl(sumList);
      const c = slot.enrichedTable.find((r) => r.champion) || slot.enrichedTable[0];
      const ru = slot.enrichedTable.find((r) => r.officialPos === 2) || slot.enrichedTable[1];
      const fmtPtsBadge = (row) => (isRawMode() && row.signedAdjustment !== 0 ? `${row.points} official pts (Raw: ${row.rawPoints})` : `${row.points} pts`);
      appendKV(sumList, 'Champion', c ? `${c.team} (${fmtPtsBadge(c)})` : '—', 'highlight');
      appendKV(sumList, 'Runner-Up', ru ? `${ru.team} (${fmtPtsBadge(ru)})` : '—');
      appendKV(sumList, 'Teams / Matches', `${slot.participantCount} / ${slot.matchCount}`);
      appendKV(sumList, 'Total Goals', `${slot.totalGoals} (${fmtNum(slot.totalGoals / Math.max(1, slot.matchCount), 2)}/game)`);
      appendKV(sumList, 'Tie-Break Rule', slot.tieBreakRules?.[1] === 'gf' ? 'Points → GF → GD' : slot.status === 'curtailed' ? 'Unweighted PPG → GD/G' : 'Points → GD → GF');
      appendKV(sumList, 'Golden Boot', slot.scorerCoverage === 'verified_pl_complete' ? `${(slot.goldenBootWinners || []).map((w) => w.player).join(' / ')} (${slot.goldenBootGoals})` : 'Unavailable (scope policy)');
    }

    if (tbody) {
      clearEl(tbody);
      const scale38 = state.archiveMode === 'norm38';
      const perGame = state.archiveMode === 'perGame';

      for (const r of slot.enrichedTable) {
        const g = Math.max(1, r.played);
        const factor = scale38 ? 38 / g : perGame ? 1 / g : 1;
        const fmtCell = (val, dec) => (scale38 ? val * factor : perGame ? val * factor : val).toFixed(scale38 ? 1 : perGame ? 2 : dec);

        const clubCell = el('td', { className: 'text-col' }, document.createTextNode(r.team));
        if (r.champion) clubCell.appendChild(el('span', { className: 'status-badge champ', textContent: 'C' }));
        else if (r.promoted) clubCell.appendChild(el('span', { className: `status-badge ${r.promotionMethod === 'playoff' ? 'playoff' : 'auto'}`, textContent: r.promotionMethod === 'playoff' ? 'PO↑' : 'P↑' }));
        if (r.relegated) clubCell.appendChild(el('span', { className: 'status-badge rel', textContent: 'R↓' }));
        if (r.signedAdjustment !== 0) clubCell.appendChild(el('span', { className: 'status-badge ded', textContent: `${r.signedAdjustment > 0 ? '+' : ''}${r.signedAdjustment}` }));

        const rowClass = r.champion ? 'row-champ' : r.relegated ? 'row-relegated' : '';
        tbody.appendChild(el('tr', { className: rowClass },
          el('td', { textContent: String(state.scope.pointsMode === 'raw' ? r.rawPos : r.officialPos) }),
          clubCell,
          el('td', { textContent: String(r.played) }),
          el('td', { textContent: fmtCell(r.won, 0) }),
          el('td', { textContent: fmtCell(r.drawn, 0) }),
          el('td', { textContent: fmtCell(r.lost, 0) }),
          el('td', { textContent: fmtCell(r.gf, 0) }),
          el('td', { textContent: fmtCell(r.ga, 0) }),
          el('td', { textContent: fmtSigned(r.gd * factor, scale38 ? 1 : perGame ? 2 : 0) }),
          el('td', { textContent: fmtCell(r.pointsUsed, 0) }),
          el('td', { textContent: fmtNum(r.ppg, 2) })
        ));
      }
      applyCurrentArchiveSort(false);
    }

    if (scorersTbody) {
      clearEl(scorersTbody);
      if (slot.scorerCoverage !== 'verified_pl_complete' && slot.scorerCoverage !== 'verified') {
        scorersTbody.appendChild(el('tr', null,
          el('td', { colSpan: 5, className: 'text-col table-note-cell', textContent: `Scorer chart unavailable for ${slot.season} ${slot.historicalDivisionName}. Verified top-scorer records in this static archive cover Premier League (Tier 1, 1992–93 to 2024–25) only.` })
        ));
      } else {
        for (const sc of slot.topScorers || []) {
          const g38 = (sc.goals / Math.max(1, slot.plannedGamesPerTeam)) * 38;
          scorersTbody.appendChild(el('tr', null,
            el('td', { textContent: String(sc.rank) }),
            el('td', { className: 'text-col', textContent: sc.player }),
            el('td', { className: 'text-col', textContent: sc.clubDisplay }),
            el('td', { textContent: String(sc.goals) }),
            el('td', { textContent: g38.toFixed(1) })
          ));
        }
      }
    }

    if (dedNote) {
      const notes = [...(slot.exceptions || [])];
      if (isRawMode()) {
        notes.unshift('Raw 3W+D mode: table Pos, Pts and PPG columns simulate on-pitch points while C/P↑/R↓ badges reflect official league outcomes.');
      }
      if (slot.expelledClubs?.length) {
        const expelledText = slot.expelledClubs
          .map((c) => (typeof c === 'string' ? c : `${c.team || c.clubId || 'Club'}: ${c.outcome || 'Administrative ruling'}`))
          .join(' | ');
        notes.push(`Administrative / expulsion notes: ${expelledText}`);
      }
      const adminRows = slot.table
        .filter((r) => r.administrativeOutcome || r.sourceNote)
        .map((r) => `${r.team}: ${[r.administrativeOutcome, r.sourceNote].filter(Boolean).join(' · ')}`);
      notes.push(...adminRows);
      dedNote.textContent = notes.length > 0 ? notes.join(' · ') : 'No point deductions, expulsions, or fixture-count exceptions in this division-season.';
    }
  }

  /* ========================================================================
     SORTABLE ARCHIVE TABLE (RE-ORDERS EXISTING TR NODES CLEANLY)
     ======================================================================== */
  function getSortVal(tr, colIdx, type) {
    const raw = (tr.children[colIdx]?.textContent || '').trim().replace(/^([+\u2212-])/, (m, s) => (s === '\u2212' ? '-' : s));
    if (type === 'number') {
      const n = Number.parseFloat(raw.replace(/,/g, ''));
      return Number.isNaN(n) ? Number.NEGATIVE_INFINITY : n;
    }
    return raw;
  }

  function applyCurrentArchiveSort(announce = false) {
    const table = document.getElementById('archive-league-table');
    const tbody = document.getElementById('archive-league-tbody');
    const statusEl = document.getElementById('table-sort-status');
    if (!table || !tbody) return;

    const col = state.archiveSortCol;
    const dir = state.archiveSortDir;
    const ths = Array.from(table.querySelectorAll('thead th'));
    const activeTh = ths[col];
    const type = activeTh?.dataset.type || 'number';

    ths.forEach((th, idx) => {
      if (!th.querySelector('button')) return;
      if (idx === col) th.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    });

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const va = getSortVal(a, col, type);
      const vb = getSortVal(b, col, type);
      const cmp = type === 'number' ? va - vb : collator.compare(String(va), String(vb));
      return dir === 'asc' ? cmp : -cmp;
    });
    const frag = document.createDocumentFragment();
    rows.forEach((r) => frag.appendChild(r));
    tbody.appendChild(frag);

    if (announce && statusEl && activeTh) {
      statusEl.textContent = `Sorted archive table by ${activeTh.textContent.replace(/[▼▲]/g, '').trim()}, ${dir === 'asc' ? 'ascending' : 'descending'}.`;
    }
  }

  /* ========================================================================
     SECTION 7: METHODOLOGY & ATTRIBUTION
     ======================================================================== */
  function renderSection7Methodology() {
    const meta = state.dataset.metadata || {};
    const sourcesList = Array.isArray(meta.sources) ? meta.sources : [];
    const elv = sourcesList.find((s) => s.id === 'elvidge') || {};
    const proseEl = document.getElementById('sec7-prose');
    const calloutEl = document.getElementById('sec7-callout-list');
    const footerEl = document.getElementById('footer-verification-note');

    if (proseEl) {
      clearEl(proseEl);
      proseEl.append(
        el('p', null,
          el('strong', { textContent: 'Primary Match & Deduction Ledger (CC BY 4.0): ' }),
          elv.attribution || 'Sean Elvidge — England-football-results (CC BY 4.0).',
          elv.pinnedCommitSha ? ` Pinned commit ` : '',
          elv.pinnedCommitSha ? el('code', { textContent: elv.pinnedCommitSha.slice(0, 12) }) : '',
          `. All ${meta.totalTierSeasonSlots ?? 176} tier-season tables (${fmtInt(meta.totalMatchesPlayed)} matches, ${fmtInt(meta.totalGoalsScored)} goals) are aggregated directly from match scores with zero win-probability/team-rating forecasts.`
        ),
        el('p', null,
          el('strong', { textContent: 'Independent Cross-Checks & Known Discrepancies: ' }),
          'RSSSF Full League Archive (1981–82 to 2007–08) and RSSSF English tables (2008–09 to 2024–25) plus football-data.co.uk CSVs (1993–94 to 2024–25) reconciled every point deduction, appeal, expunged fixture (Aldershot 1991–92), club expulsion (Bury 2019–20), and Football League GF-before-GD tie-break rule (1992–93 to 1998–99 Tiers 2–4). The coverage manifest also logs 46 minor historical single-goal match discrepancies between RSSSF and Elvidge across the 89,234-match corpus, retained transparently.'
        ),
        el('p', null,
          el('strong', { textContent: 'Statistical & Raw-Points Semantics: ' }),
          'Section 1 reports both within-slot median |r| with Finish Score (showing median(|r|) alongside signed median r — because median(|r|) >= |median(r)| whenever draw correlations change sign across tables) and pooled R²(PPG) across stacked team-seasons; attacking vs defensive ordering can legitimately differ between those two metrics. Toggling Points Basis to Raw (3W+D) removes points deductions and adjustments in PPG, rawPos and Finish Score (Section 1 & deduction sensitivity) while keeping official league positions (rPos), titles, promotions, play-offs and survival/relegation cutoffs anchored to official league outcomes. Boundary clubs with non-merit survival or exit outcomes are tagged by a closed outcomeType vocabulary (reprieved, expelled, withdrew, administration_relegation) so reprieved bottom clubs do not mask merit relegation lines.'
        ),
        el('p', null,
          el('strong', { textContent: 'Methodological Scope: ' }),
          'Three points for a win was adopted uniformly across English Tiers 1–4 starting in 1981–82. Earlier two-point seasons are out of scope because converting two points to three points without replaying incentives does not produce equivalent football. This study describes completed tables only and excludes post-2024–25 seasons.'
        )
      );
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Corpus Slots', `${meta.totalTierSeasonSlots ?? '—'} (${meta.completedSlots ?? '—'} complete + ${meta.curtailedSlots ?? '—'} curtailed)`);
      appendKV(calloutEl, 'Team-Seasons / Matches', `${fmtInt(meta.totalTeamSeasons)} / ${fmtInt(meta.totalMatchesPlayed)}`);
      appendKV(calloutEl, 'Pinned Match SHA-256', elv.sha256?.EnglandLeagueResults ? elv.sha256.EnglandLeagueResults.slice(0, 16) + '…' : 'N/A');
      appendKV(calloutEl, 'Scorer Coverage', meta.scorerCoverageSummary ? `${meta.scorerCoverageSummary.verifiedSlots} verified / ${meta.scorerCoverageSummary.unavailableSlots} unavail.` : 'N/A');
      appendKV(calloutEl, 'Excluded Future Seasons', Array.isArray(meta.excludedFutureSeasons) ? meta.excludedFutureSeasons.join(', ') : '2025/2026+');
    }

    if (footerEl) {
      const hashPreview = meta.canonicalJsonSha256 ? `${meta.canonicalJsonSha256.slice(0, 16)}…` : 'local';
      footerEl.textContent = `Schema v${state.dataset.schemaVersion} · Canonical SHA-256 ${hashPreview} · Attribution: Sean Elvidge (CC BY 4.0) + RSSSF + football-data.co.uk`;
    }
  }

  /* ========================================================================
     FULL RE-RENDER COORDINATOR & EVENT WIRING
     ======================================================================== */
  function renderAll() {
    syncScopeControlsUI();
    renderMastheadAndBanner();

    const emptyPanel = document.getElementById('empty-scope-panel');
    const sections = document.querySelectorAll('#main-content > section.analysis-section, #ledger');
    if (state.model.isEmpty) {
      if (emptyPanel) emptyPanel.hidden = false;
      sections.forEach((sec) => { if (sec.id !== 'sec-methodology') sec.hidden = true; });
      return;
    }

    if (emptyPanel) emptyPanel.hidden = true;
    sections.forEach((sec) => { sec.hidden = false; });

    renderLedger();
    renderSection1();
    renderSection2();
    renderSection3();
    renderSection4();
    renderSection5();
    renderArchive();
  }

  function updateScope(patch) {
    state.scope = CA.normalizeScope(state.dataset, { ...state.scope, ...patch });
    state.model = CA.buildAnalyticalModel(state.dataset, state.scope);
    renderAll();
  }

  function populateYearDropdowns() {
    const startSel = document.getElementById('scope-start-year');
    const endSel = document.getElementById('scope-end-year');
    if (!startSel || !endSel) return;
    clearEl(startSel);
    clearEl(endSel);
    const minY = state.dataset.metadata.startYear;
    const maxY = state.dataset.metadata.endYear;
    for (let y = minY; y <= maxY; y++) {
      const label = CA.formatSeasonLabel(y);
      startSel.appendChild(el('option', { value: String(y), textContent: label }));
      endSel.appendChild(el('option', { value: String(y), textContent: label }));
    }
  }

  function wireEvents() {
    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = CA.PRESETS[btn.dataset.preset];
        if (preset) updateScope({ ...preset });
      });
    });

    document.querySelectorAll('[data-points-mode]').forEach((btn) => {
      btn.addEventListener('click', () => updateScope({ pointsMode: btn.dataset.pointsMode }));
    });

    document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const checked = Array.from(document.querySelectorAll('#scope-tier-checkboxes input[type="checkbox"]:checked')).map((x) => Number(x.value));
        updateScope({ tiers: checked });
      });
    });

    document.getElementById('scope-start-year')?.addEventListener('change', (e) => {
      updateScope({ startYear: Number(e.target.value) });
    });
    document.getElementById('scope-end-year')?.addEventListener('change', (e) => {
      updateScope({ endYear: Number(e.target.value) });
    });
    document.getElementById('scope-include-curtailed')?.addEventListener('change', (e) => {
      updateScope({ includeCurtailed: e.target.checked });
    });

    document.getElementById('btn-reset-scope')?.addEventListener('click', () => {
      updateScope({ ...CA.PRESETS['all-4-tiers'] });
    });
    document.getElementById('btn-jump-pl-scorers')?.addEventListener('click', () => {
      updateScope({ ...CA.PRESETS['pl-1992-2025'] });
    });

    document.querySelectorAll('[data-sec1-metric]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sec1Metric = btn.dataset.sec1Metric;
        document.querySelectorAll('[data-sec1-metric]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        renderSec1Scatter();
      });
    });
    document.querySelectorAll('[data-sec1-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sec1Target = btn.dataset.sec1Target;
        document.querySelectorAll('[data-sec1-target]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        renderSec1Scatter();
      });
    });

    document.querySelectorAll('[data-sec2-metric]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sec2Metric = btn.dataset.sec2Metric;
        document.querySelectorAll('[data-sec2-metric]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        renderSec2Timeline();
      });
    });

    document.querySelectorAll('[data-sec3-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sec3Mode = btn.dataset.sec3Mode;
        document.querySelectorAll('[data-sec3-mode]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        renderSec3Chart();
      });
    });

    document.getElementById('archive-tier-select')?.addEventListener('change', (e) => {
      state.archiveTier = Number(e.target.value);
      renderArchive();
    });
    document.getElementById('season-select')?.addEventListener('change', (e) => {
      state.archiveSeason = e.target.value;
      renderArchive();
    });

    document.querySelectorAll('[data-archive-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.archiveMode = btn.dataset.archiveMode;
        document.querySelectorAll('[data-archive-mode]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        renderArchive();
      });
    });

    document.querySelectorAll('#archive-league-table thead button[data-sort-col]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const col = Number(btn.dataset.sortCol);
        if (state.archiveSortCol === col) {
          state.archiveSortDir = state.archiveSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.archiveSortCol = col;
          state.archiveSortDir = col === 0 || col === 1 ? 'asc' : 'desc';
        }
        applyCurrentArchiveSort(true);
      });
    });
  }

  async function initApp() {
    if (!CA) {
      showFatalError('Statistical analysis module (analysis.js) failed to initialize.');
      return;
    }
    try {
      state.dataset = await loadDataset();
      populateYearDropdowns();
      state.scope = CA.normalizeScope(state.dataset, CA.PRESETS['all-4-tiers']);
      state.model = CA.buildAnalyticalModel(state.dataset, state.scope);
      wireEvents();
      renderAll();
      renderSection7Methodology();
    } catch (err) {
      showFatalError(err?.message || 'Unable to load or validate league dataset.');
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }
})();
