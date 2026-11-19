/**
 * THE CHAMPIONSHIP FORMULA — Client-Side Visualization & Archive Controller
 * Consumes precomputed validated model from window.ChampionshipAnalysis.
 * Strict security invariant: ZERO untrusted innerHTML anywhere in this file.
 */
(function () {
  'use strict';

  const CA = (typeof globalThis !== 'undefined' && globalThis.ChampionshipAnalysis)
    ? globalThis.ChampionshipAnalysis
    : (typeof window !== 'undefined' ? window.ChampionshipAnalysis : null);
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
    const pooledDiff = Math.abs(gaR2 - gfR2);
    const withinExactTie = withinDiff < 1e-12;
    const withinNearTie = !withinExactTie && withinDiff < 0.0005;
    const withinLeader = withinExactTie ? 'tie' : withinNearTie ? 'near-tie' : (gaWithin > gfWithin ? 'ga' : 'gf');
    const pooledExactTie = pooledDiff < 1e-12;
    const pooledNearTie = !pooledExactTie && pooledDiff < 0.0005;
    const pooledLeader = pooledExactTie ? 'tie' : pooledNearTie ? 'near-tie' : (gfR2 > gaR2 ? 'gf' : 'ga');
    const ties = Math.max(0, (m.withinSlot.comparableGfGaSlots ?? 0) - (m.withinSlot.gaBeatsGfCount ?? 0) - (m.withinSlot.gfBeatsGaCount ?? 0));

    return {
      gaWithin,
      gfWithin,
      withinDiff,
      withinExactTie,
      withinNearTie,
      withinLeader,
      gaR2,
      gfR2,
      pooledDiff,
      pooledExactTie,
      pooledNearTie,
      gaPooledRPpg: gaPool?.rPpg ?? null,
      gfPooledRPpg: gfPool?.rPpg ?? null,
      pooledLeader,
      diverges: (withinLeader === 'ga' || withinLeader === 'gf') && (pooledLeader === 'ga' || pooledLeader === 'gf') && withinLeader !== pooledLeader,
      ties,
    };
  }

  /* ========================================================================
     SAFE STRUCTURED TOOLTIP
     ======================================================================== */
  const tooltipEl = typeof document !== 'undefined' ? document.getElementById('chart-tooltip') : null;

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
      if (metaCov) {
        metaCov.textContent = m.excludedCurtailedSlots?.length > 0
          ? `0 Active Tables (${m.excludedCurtailedSlots.length} Curtailed Excluded)`
          : '0 League Tables Selected';
      }
      if (metaMat) metaMat.textContent = '';
      if (metaGoals) metaGoals.textContent = '';
      if (activeBanner) {
        clearEl(activeBanner);
        if (m.excludedCurtailedSlots?.length > 0) {
          activeBanner.append(
            `All ${m.excludedCurtailedSlots.length} matching ${plural(m.excludedCurtailedSlots.length, 'table')} (${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')}) were curtailed and excluded by default. Enable "Include Curtailed" above or broaden your filter.`
          );
        } else {
          activeBanner.append('No league tables match this filter. Select at least one league tier above.');
        }
      }
      return;
    }

    if (metaCov) metaCov.textContent = `${m.firstSeason} to ${m.lastSeason} · ${m.numSlots} League ${plural(m.numSlots, 'Table')} (${fmtInt(m.allTeams.length)} Team ${plural(m.allTeams.length, 'Season')})`;
    if (metaMat) metaMat.textContent = `${fmtInt(m.totalMatches)} Matches`;
    if (metaGoals) metaGoals.textContent = `${fmtInt(m.totalGoals)} Goals`;

    if (banner) {
      clearEl(banner);
      banner.append(
        el('strong', { textContent: 'Scope: ' }),
        `All ${ds.metadata.totalTierSeasonSlots} league tables (${fmtInt(ds.metadata.totalTeamSeasons)} team seasons, ${fmtInt(ds.metadata.totalMatchesPlayed)} matches) across Tiers 1–4 from 1981–82 (when three points for a win began) through 2024–25. Because seasons span 38 to 46 matches and leagues range from 20 to 24 clubs, comparisons use per-game rates and a 0-to-1 finish scale (1 = first, 0 = last). Seasons after 2024–25 are excluded.`
      );
    }

    if (activeBanner) {
      clearEl(activeBanner);
      const tierStr = m.tiersPresent.map((t) => `Tier ${t}`).join(', ');
      const basisLabel = state.scope.pointsMode === 'raw'
        ? 'On-pitch points before deductions (updates Section 1 correlations and scatter; titles, promotions, relegations and Cards 03–06 stay on official tables)'
        : 'Official league tables (including deductions)';
      const frag = document.createDocumentFragment();
      frag.append(
        el('strong', { textContent: 'Showing: ' }),
        `${tierStr} · ${m.firstSeason} to ${m.lastSeason} (${m.numSlots} ${plural(m.numSlots, 'table')}, ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')}) · Points: ${basisLabel}. `
      );
      if (m.excludedCurtailedSlots.length > 0) {
        frag.append(
          el('strong', { textContent: 'Excluded by default: ' }),
          `${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')} (ended early by COVID-19 after 34–37 games and decided on points per game; Bury were expelled from League One). Tick the box above to include them.`
        );
      } else if (m.includedCurtailedSlots.length > 0) {
        frag.append(
          el('strong', { textContent: 'Curtailed Included: ' }),
          `${m.includedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' & ')} (decided on points per game).`
        );
      }
      activeBanner.appendChild(frag);
    }
  }

  function buildLedgerView(m, scope) {
    const activeScope = scope || m?.scope || state.scope;
    const isRaw = (activeScope?.pointsMode || m?.scope?.pointsMode) === 'raw';

    if (!m || m.isEmpty) {
      const curtExcl = m?.excludedCurtailedSlots?.length ?? 0;
      const note = curtExcl > 0
        ? `0 active tables (${curtExcl} curtailed ${plural(curtExcl, 'table')} excluded by default)`
        : '0 league tables selected';
      return { isEmpty: true, note, cards: [] };
    }

    const note = isRaw
      ? `${m.numSlots} league ${plural(m.numSlots, 'table')} · ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')} (Cards 01–02: raw 3W+D points; Cards 03–06: official standings)`
      : `${m.numSlots} league ${plural(m.numSlots, 'table')} · ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')} (official standings)`;

    const drawPred = m.correlations.find((c) => c.key === 'drawRate');
    const winPred = m.correlations.find((c) => c.key === 'winRate');
    const gdPred = m.correlations.find((c) => c.key === 'gdPerGame');
    const atkDef = describeAtkVsDef(m);
    const smallSample = m.numSlots < 3;

    // Card 01: Within-table rank strength & exact draw-correlation sign counts
    const drawSlotVals = drawPred?.slotValues ?? [];
    const drawTotalSlots = drawSlotVals.length;
    const drawNegCount = drawSlotVals.filter((sv) => sv.rFinish < 0).length;
    const drawPosCount = drawSlotVals.filter((sv) => sv.rFinish > 0).length;
    const drawZeroCount = drawTotalSlots - drawNegCount - drawPosCount;
    const drawAlwaysLast = m.byTierCorrelations.length > 0 && m.byTierCorrelations.every((t) => t.drawIsLastInTier);

    let drawSignSentence = '';
    if (drawTotalSlots > 0) {
      if (drawNegCount === drawTotalSlots) {
        drawSignSentence = ` Signed draw links were negative in all ${drawTotalSlots} tables (median ${fmtSigned(drawPred?.medianRFinish, 3)}).`;
      } else if (drawPosCount === drawTotalSlots) {
        drawSignSentence = ` Signed draw links were positive in all ${drawTotalSlots} tables (median ${fmtSigned(drawPred?.medianRFinish, 3)}).`;
      } else {
        drawSignSentence = ` Signed draw links were negative in ${drawNegCount} of ${drawTotalSlots} tables and positive in ${drawPosCount}${drawZeroCount > 0 ? ` (${drawZeroCount} zero)` : ''} (median ${fmtSigned(drawPred?.medianRFinish, 3)}).`;
      }
    }

    // Card 02: Attack vs Defence (within-table rank medians, separate table wins count, pooled PPG variation)
    const atkDefStat = smallSample
      ? `${m.numSlots} ${plural(m.numSlots, 'table')}`
      : `${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}`;

    const rankHead = atkDef.withinLeader === 'ga'
      ? 'Defence edges within-table rank'
      : atkDef.withinLeader === 'gf'
        ? 'Scoring edges within-table rank'
        : atkDef.withinLeader === 'near-tie'
          ? 'Attack and defence are nearly equal on rank'
          : 'Attack and defence are equal on rank';
    const poolHead = atkDef.pooledLeader === 'gf'
      ? 'scoring tracks more points variation'
      : atkDef.pooledLeader === 'ga'
        ? 'defence tracks more points variation'
        : atkDef.pooledLeader === 'near-tie'
          ? 'both track nearly equal points variation'
          : 'both track equal points variation';
    const atkDefSameClaim = atkDef.withinLeader === 'ga'
      ? 'Defence leads on table rank and points variation'
      : atkDef.withinLeader === 'gf'
        ? 'Scoring leads on table rank and points variation'
        : atkDef.withinLeader === 'near-tie'
          ? 'Attack and defence are nearly equal on rank and points variation'
          : 'Attack and defence are equal on rank and points variation';
    const atkDefClaim = smallSample
      ? `Too few tables to compare attack and defence${isRaw ? ' (raw 3W+D)' : ''}`
      : `${atkDef.withinLeader === atkDef.pooledLeader ? atkDefSameClaim : `${rankHead}; ${poolHead}`}${isRaw ? ' (raw 3W+D)' : ''}`;

    const tieClause = atkDef.ties > 0 ? `, ${atkDef.ties} tied` : '';
    const atkDefRankSentence = atkDef.withinLeader === 'ga'
      ? `Within a table, conceding edges scoring as a median rank link (${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}, 0–1 scale); separately, defence led in ${m.withinSlot.gaBeatsGfCount} of ${m.withinSlot.comparableGfGaSlots} tables (${m.withinSlot.gfBeatsGaCount} for scoring${tieClause}).`
      : atkDef.withinLeader === 'gf'
        ? `Within a table, scoring edges conceding as a median rank link (${fmtNum(atkDef.gfWithin, 3)} vs ${fmtNum(atkDef.gaWithin, 3)}, 0–1 scale); separately, scoring led in ${m.withinSlot.gfBeatsGaCount} of ${m.withinSlot.comparableGfGaSlots} tables (${m.withinSlot.gaBeatsGfCount} for defence${tieClause}).`
        : atkDef.withinLeader === 'near-tie'
          ? `Within a table, conceding and scoring are nearly equal as a median rank link (${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}, within the 0.0005 near-tie margin); separately, defence led in ${m.withinSlot.gaBeatsGfCount} of ${m.withinSlot.comparableGfGaSlots} tables (${m.withinSlot.gfBeatsGaCount} for scoring${tieClause}).`
          : `Within a table, conceding and scoring are equal as a median rank link (${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}, 0–1 scale); across tables, defence led in ${m.withinSlot.gaBeatsGfCount} of ${m.withinSlot.comparableGfGaSlots} (${m.withinSlot.gfBeatsGaCount} for scoring${tieClause}).`;

    const poolModeTag = isRaw ? ' (on raw 3W+D points)' : '';
    const atkDefPtsSentence = atkDef.pooledLeader === 'gf'
      ? ` Pooled across clubs${poolModeTag}, linear comparison links ${fmtNum(atkDef.gfR2 * 100, 1)}% of points-per-game variation to scoring and ${fmtNum(atkDef.gaR2 * 100, 1)}% to conceding (overlapping links, not additive shares or causes).`
      : atkDef.pooledLeader === 'ga'
        ? ` Pooled across clubs${poolModeTag}, linear comparison links ${fmtNum(atkDef.gaR2 * 100, 1)}% of points-per-game variation to conceding and ${fmtNum(atkDef.gfR2 * 100, 1)}% to scoring (overlapping links, not additive shares or causes).`
        : atkDef.pooledLeader === 'near-tie'
          ? ` Pooled across clubs${poolModeTag}, linear comparison links nearly equal shares of points-per-game variation to scoring (${fmtNum(atkDef.gfR2 * 100, 1)}%) and conceding (${fmtNum(atkDef.gaR2 * 100, 1)}%) (within 0.05 percentage points; descriptive links, not causes).`
          : ` Pooled across clubs${poolModeTag}, linear comparison links an equal ${fmtNum(atkDef.gfR2 * 100, 1)}% of points-per-game variation to scoring and ${fmtNum(atkDef.gaR2 * 100, 1)}% to conceding (descriptive links, not additive shares or causes).`;

    // Card 03: Champions (official standings; middle-half interpolated quartiles vs majority)
    const champMedianTxt = fmtNum(m.champStats.ppg?.median, 2);
    const runnerMedianTxt = fmtNum(m.runnerStats.ppg?.median, 2);
    const champQ1Txt = fmtNum(m.champStats.ppg?.q1, 2);
    const champQ3Txt = fmtNum(m.champStats.ppg?.q3, 2);
    const champUnitShort = isRaw ? 'official pts/g' : 'pts/game';
    const champDetailSmall = `${m.champs.map((c) => {
      const rawDiff = isRaw && c.rawPoints !== undefined && c.rawPoints !== c.points
        ? `; ${c.rawPoints} raw points (${fmtNum(c.rawPpg, 2)} raw)`
        : '';
      return `${c.team} won the ${c.season} Tier ${c.tier} official title on ${c.points} official points (${fmtNum(c.officialPpg, 2)} official per game${rawDiff})`;
    }).join('; ')}.`;

    // Card 04: Survival (explicitly distinguish included relegating tables, excluded no-relegation reasons, and raw vs official deductions)
    const ss = m.survivalStats;
    const survSmallSample = ss.slotCount < 3;
    const noRel = m.noRelegationSlots || [];
    const activeBoundaryExcl = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);

    const reElecSlots = noRel.filter((x) => x.reElectionEra);
    const withdrewSlots = noRel.filter((x) => !x.reElectionEra && (x.excludedOutcomeTypes || []).includes('withdrew'));
    const reprieveNoRelSlots = noRel.filter((x) => !x.reElectionEra && !(x.excludedOutcomeTypes || []).includes('withdrew') && (x.excludedOutcomeTypes || []).includes('reprieved'));
    const otherNoRelSlots = noRel.filter((x) => !x.reElectionEra && !(x.excludedOutcomeTypes || []).includes('withdrew') && !(x.excludedOutcomeTypes || []).includes('reprieved'));

    const noRelReasons = [];
    if (reElecSlots.length > 0) noRelReasons.push(`${reElecSlots.length} Fourth Division re-election ${plural(reElecSlots.length, 'season')} where automatic relegation was not in place`);
    if (withdrewSlots.length > 0) noRelReasons.push(`${withdrewSlots.length} after club withdrawal or resignation`);
    if (reprieveNoRelSlots.length > 0) noRelReasons.push(`${reprieveNoRelSlots.length} after ground-grading reprieve`);
    if (otherNoRelSlots.length > 0) noRelReasons.push(`${otherNoRelSlots.length} without automatic relegation`);

    const survCardStat = ss.slotCount === 0
      ? 'No relegation'
      : survSmallSample
        ? (m.survivalSeries[0] ? `${fmtNum(m.survivalSeries[0].survivingPpg, 3)} ${isRaw ? 'official pts/g' : 'pts/game'}` : 'N/A')
        : (ss.survivingPpg ? `${fmtNum(ss.survivingPpg.median, 3)} ${isRaw ? 'official pts/g' : 'pts/game'}` : 'N/A');

    const survClaim = ss.slotCount === 0
      ? `${noRel.length} ${plural(noRel.length, 'table')} without relegation (0 with relegation)`
      : `${ss.slotCount} ${plural(ss.slotCount, 'table')} with relegation${noRel.length > 0 ? `; ${noRel.length} without it` : ''}${activeBoundaryExcl.length > 0 ? `; ${activeBoundaryExcl.length} reprieved boundary ${plural(activeBoundaryExcl.length, 'club')} excluded` : ''}${isRaw ? ' (official standings)' : ''}`;

    let survDetail = '';
    if (ss.slotCount === 0) {
      if (reElecSlots.length === noRel.length && noRel.length > 0) {
        survDetail = `No survival cutoff applies: automatic relegation was not in place across ${noRel.length === 1 ? 'this Fourth Division re-election season' : `these ${noRel.length} Fourth Division re-election seasons`} (bottom clubs faced re-election).`;
      } else {
        survDetail = `No survival cutoff applies across ${noRel.length === 1 ? 'this table' : `these ${noRel.length} tables`}: ${noRelReasons.join('; ')}.`;
      }
    } else if (survSmallSample) {
      const slotNotes = m.survivalSeries.map((s) => {
        const survRow = m.allTeams.find((r) => r.slotId === s.slotId && r.team === s.survivingTeam);
        const relRow = m.allTeams.find((r) => r.slotId === s.slotId && r.team === s.relegatedTeam);
        const survAdjWord = survRow && survRow.signedAdjustment < 0 ? 'deduction' : survRow && survRow.signedAdjustment > 0 ? 'addition' : 'adjustment';
        const relAdjWord = relRow && relRow.signedAdjustment < 0 ? 'deduction' : relRow && relRow.signedAdjustment > 0 ? 'addition' : 'adjustment';
        const survRawNote = isRaw && survRow && survRow.rawPoints !== s.survivingPts
          ? `; ${survRow.rawPoints} raw points, ${fmtNum(survRow.rawPpg, 3)} raw before a ${Math.abs(survRow.signedAdjustment)}-point ${survAdjWord}`
          : '';
        const relRawNote = isRaw && relRow && relRow.rawPoints !== s.relegatedHighPts
          ? `; ${relRow.rawPoints} raw points, ${fmtNum(relRow.rawPpg, 3)} raw before a ${Math.abs(relRow.signedAdjustment)}-point ${relAdjWord}`
          : '';
        return `In ${s.season} Tier ${s.tier}, ${s.survivingTeam} stayed up on ${s.survivingPts} official points (${fmtNum(s.survivingPpg, 3)} official per game${survRawNote}) while ${s.relegatedTeam} went down on ${s.relegatedHighPts} official points (${fmtNum(s.relegatedHighPpg, 3)} official per game${relRawNote})`;
      }).join('; ');
      const extraNoRel = noRel.length > 0 ? ` Outside those cutoffs: ${noRelReasons.join('; ')}.` : '';
      const extraReprieve = activeBoundaryExcl.length > 0
        ? ` Boundary reprieves excluded from lowest merit survivor: ${activeBoundaryExcl.map((r) => `${r.team} (${r.season} Tier ${r.tier}, ${ordinal(r.pos)})`).join(', ')}.`
        : '';
      const rawFloorNote = isRaw ? ' Survival cutoffs remain on official standings.' : '';
      survDetail = `${slotNotes}.${extraNoRel}${extraReprieve}${rawFloorNote}`;
    } else {
      const maxRelPpg = Math.max(...m.survivalSeries.map((s) => s.relegatedHighPpg ?? 0));
      const exclOutside = noRel.length > 0
        ? ` Separate: ${noRel.length} without relegation (${noRelReasons.join('; ')}).`
        : '';
      const exclReprieve = activeBoundaryExcl.length > 0
        ? ` Boundary reprieves excluded from lowest merit survivor: ${activeBoundaryExcl.map((r) => `${r.team} (${r.season} Tier ${r.tier}, ${ordinal(r.pos)})`).join(', ')}.`
        : '';
      const rawFloorNote = isRaw ? ' Survival cutoffs remain on official standings.' : '';
      survDetail = `Across those ${ss.slotCount} tables, the median lowest survivor earned ${fmtNum(ss.survivingPpg?.median, 3)} official points a game (roughly ${fmtNum(ss.survivingPts38?.median, 1)} over 38 games; ${fmtNum(ss.survivingPts46?.median, 1)} over 46); the highest relegated club earned ${fmtNum(maxRelPpg, 3)}.${exclOutside}${exclReprieve}${rawFloorNote}`;
    }

    // Card 05: Draw Leaders (official standings)
    const dl = m.drawLeaderStats;
    const dlMidPct = dl.count > 0 ? (dl.middleHalfCount / dl.count) * 100 : 0;
    const dlChampNames = (dl.championCampaigns || []).map((c) => `${c.team}, ${c.season} Tier ${c.tier}`).join('; ');

    // Card 06: Top Scorers (verified coverage only; neutral minority/half/majority wording, co-winners preserved)
    const avail = m.scorerAnalysis.availableSlotsCount ?? 0;
    const withGb = m.scorerAnalysis.champWithGbCount ?? 0;
    const unavail = m.scorerAnalysis.unavailableSlotsCount ?? 0;
    const gbWinnerCount = (m.scorerAnalysis.gbInstances || []).length;
    const scorerCardStat = m.scorerAnalysis.status === 'unavailable' ? 'Unavailable' : `${withGb} / ${avail}`;

    let scorerClaim = 'No uniform scorer data before 1992 or below Tier 1';
    let scorerDetail = 'Verified Golden Boot and club scorer tables cover the Premier League (1992–93 to 2024–25) only; widen your filter to inspect them.';
    if (m.scorerAnalysis.status !== 'unavailable') {
      if (withGb === 0) {
        scorerClaim = avail === 1
          ? 'The champion did not field the league’s top scorer'
          : `0 of ${avail} champions fielded the league’s top scorer`;
      } else if (withGb === avail) {
        scorerClaim = avail === 1
          ? 'The champion fielded the league’s top scorer'
          : `All ${avail} champions fielded the league’s top scorer`;
      } else if (withGb * 2 < avail) {
        scorerClaim = `A minority (${withGb} of ${avail}) of champions fielded the league’s top scorer`;
      } else if (withGb * 2 === avail) {
        scorerClaim = `Half (${withGb} of ${avail}) of champions fielded the league’s top scorer`;
      } else {
        scorerClaim = `A majority (${withGb} of ${avail}) of champions fielded the league’s top scorer`;
      }
      if (isRaw) scorerClaim += ' (official champions)';
      const coWinnerClause = gbWinnerCount !== avail
        ? ` (${gbWinnerCount} Golden Boot ${plural(gbWinnerCount, 'winner-season', 'winner-seasons')} including shared awards)`
        : '';
      const omitClause = unavail > 0
        ? `; ${unavail} pre-1992 or lower-tier ${plural(unavail, 'table')} omitted for lacking matching records`
        : '';
      scorerDetail = `Across ${avail} verified Premier League ${plural(avail, 'season')}${coWinnerClause}, ${withGb} ${plural(withGb, 'champion')} fielded the Golden Boot winner${isRaw ? ' (official standings)' : ''}${omitClause}.`;
    }

    const topLeadPhrase = m.correlations[0]?.key === 'gdPerGame'
      ? 'Goal difference and win rate track final rank closely'
      : 'Win rate tracks final rank closely';
    const quartileNote = m.champs.length < 8
      ? `quartiles roughly ${champQ1Txt} to ${champQ3Txt}, interpolated across ${m.champs.length} ${plural(m.champs.length, 'season')}`
      : `middle half roughly ${champQ1Txt} to ${champQ3Txt}, interpolated quartiles`;

    const cards = [
      {
        idx: '01 · What Tracks Rank',
        stat: smallSample ? `${m.numSlots} ${plural(m.numSlots, 'table')}` : (winPred ? fmtNum(winPred.medianAbsRFinish, 3) : 'N/A'),
        claim: smallSample
          ? `Too few tables to summarise rank links${isRaw ? ' (raw 3W+D)' : ''}`
          : `${topLeadPhrase}; ${drawAlwaysLast ? 'draws show the weakest link' : 'draws show a weak link'}${isRaw ? ' (raw 3W+D)' : ''}`,
        detail: smallSample
          ? `Pick at least three tables (${m.numSlots} ${plural(m.numSlots, 'table')}, ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')} selected) to summarise rank links${isRaw ? ' on raw 3W+D points' : ''}.`
          : `Across ${m.numSlots} tables${isRaw ? ' (raw 3W+D points)' : ''} on a 0–1 scale (0 = no linear link, 1 = perfect link with final rank), median strength is ${fmtNum(winPred?.medianAbsRFinish, 3)} for wins, ${fmtNum(gdPred?.medianAbsRFinish, 3)} for goal difference, and ${fmtNum(drawPred?.medianAbsRFinish, 3)} for draws.${drawSignSentence}`,
      },
      {
        idx: '02 · Attack vs. Defence',
        stat: atkDefStat,
        claim: atkDefClaim,
        detail: smallSample
          ? `Pick at least three tables to compare rank links and pooled points-per-game variation for scoring and conceding${isRaw ? ' (raw 3W+D)' : ''}.`
          : `${atkDefRankSentence}${atkDefPtsSentence}`,
      },
      {
        idx: '03 · Champions & Wins',
        stat: smallSample
          ? (m.champs[0] ? `${fmtNum(m.champs[0].officialPpg, 2)} ${champUnitShort}` : 'N/A')
          : `${champMedianTxt} ${champUnitShort}`,
        claim: `${m.champFewerWinsCases.length} ${plural(m.champFewerWinsCases.length, 'champion')} won fewer matches than a rival${isRaw ? ' (official standings)' : ''}`,
        detail: smallSample
          ? champDetailSmall
          : `Median champion: ${champMedianTxt} official points a game (${quartileNote}), vs ${runnerMedianTxt} median for runners-up.${isRaw ? ' Official standings apply here.' : ''} ${m.champFewerWinsCases.length > 0 ? `${m.champFewerWinsCases[0].champion.team} won the ${m.champFewerWinsCases[0].season} ${m.champFewerWinsCases[0].historicalDivisionName} with ${m.champFewerWinsCases[0].champion.won} wins.` : 'Every champion here at least matched rivals for wins.'}`,
      },
      {
        idx: '04 · Survival Line',
        stat: survCardStat,
        claim: survClaim,
        detail: survDetail,
      },
      {
        idx: '05 · Draw Leaders',
        stat: smallSample ? `${dl.count} ${plural(dl.count, 'club')}` : `${fmtNum(dlMidPct, 0)}%`,
        claim: smallSample
          ? `${dl.count} ${plural(dl.count, 'club')} led or tied in draws across ${m.numSlots} ${plural(m.numSlots, 'table')}${isRaw ? ' (official standings)' : ''}`
          : `${dl.middleHalfCount} of ${dl.count} draw leaders finished in the middle half; ${dl.championCount} won a title${isRaw ? ' (official standings)' : ''}`,
        detail: smallSample
          ? `${m.seasonDrawLeaders.map((r) => `${r.team} (${ordinal(r.officialPos)} official finish, ${r.drawn} draws in ${r.season} Tier ${r.tier})`).join('; ')}.`
          : `${dl.relegatedCount} draw ${plural(dl.relegatedCount, 'leader')} went down and ${dl.championCount} won the league${dlChampNames ? ` (${dlChampNames})` : ''}. Their median official finish was ${ordinal(dl.pos?.median)}, ahead of a median ${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}% of clubs in their division.`,
      },
      {
        idx: '06 · Top Scorers',
        stat: scorerCardStat,
        claim: scorerClaim,
        detail: scorerDetail,
      },
    ];

    return { isEmpty: false, note, cards };
  }

  function renderLedger() {
    const m = state.model;
    const grid = document.getElementById('ledger-grid');
    const noteEl = document.getElementById('ledger-sample-note');
    const view = buildLedgerView(m, state.scope);
    if (noteEl) noteEl.textContent = view.note;
    if (!grid) return;
    clearEl(grid);
    if (view.isEmpty) return;

    view.cards.forEach((c) => {
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
  const PLAIN_PREDICTORS = {
    winRate: {
      label: 'Wins per game',
      short: 'Wins / game',
      note: 'Wins are built directly into points (3 points for a win, 1 for a draw)',
    },
    gdPerGame: {
      label: 'Goal difference per game',
      short: 'Goal diff / game',
      note: 'Goals scored minus goals conceded per game',
    },
    gfPerGame: {
      label: 'Goals scored per game',
      short: 'Goals scored',
      note: 'Attacking output per game',
    },
    gaPerGame: {
      label: 'Goals conceded per game',
      short: 'Goals conceded',
      note: 'Defensive record per game (lower is better)',
    },
    drawRate: {
      label: 'Draws per game',
      short: 'Draws / game',
      note: 'Draws earn one point, so their link to table rank is weak and often negative',
    },
  };

  function plainPredictor(key, fallback) {
    return PLAIN_PREDICTORS[key] || {
      label: fallback?.label || key,
      short: fallback?.shortLabel || key,
      note: fallback?.identityNote || '',
    };
  }

  function renderSection1() {
    const m = state.model;
    const titleEl = document.getElementById('sec1-title');
    const proseEl = document.getElementById('sec1-prose');
    const calloutEl = document.getElementById('sec1-callout-list');
    const tbody = document.getElementById('sec1-corr-tbody');
    const tierTbody = document.getElementById('sec1-tier-tbody');

    const winPred = m.correlations.find((c) => c.key === 'winRate');
    const gdPred = m.correlations.find((c) => c.key === 'gdPerGame');
    const atkDef = describeAtkVsDef(m);
    const pooledMap = new Map(m.pooledCorrelations.map((p) => [p.key, p]));
    const gfPool = pooledMap.get('gfPerGame');
    const gaPool = pooledMap.get('gaPerGame');
    const drawPred = m.correlations.find((c) => c.key === 'drawRate');

    const smallSample = m.numSlots < 3;
    const drawRankOverall = m.correlations.findIndex((c) => c.key === 'drawRate') + 1;
    const drawAlwaysLast = m.byTierCorrelations.length > 0 && m.byTierCorrelations.every((t) => t.drawIsLastInTier);
    const drawPosSlots = drawPred ? drawPred.slotValues.filter((sv) => sv.rFinish > 0).length : 0;
    const drawNegSlots = drawPred ? drawPred.slotValues.filter((sv) => sv.rFinish < 0).length : 0;

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = `Small Sample (${m.numSlots} ${plural(m.numSlots, 'Table')}) — Cross-Season Ranking Suppressed`;
      } else {
        const marginVerb = atkDef.withinDiff < 0.002 ? 'Barely Leads' : atkDef.withinDiff < 0.02 ? 'Narrowly Leads' : 'Leads';
        const drawSuffix = drawAlwaysLast
          ? 'and Draws Rank Last in Every Tier'
          : `and Draws Rank ${ordinal(drawRankOverall)} Overall`;
        if (atkDef.diverges) {
          titleEl.textContent = `${atkDef.withinLeader === 'ga' ? 'Defence' : 'Scoring'} ${marginVerb} on Table Rank While ${atkDef.pooledLeader === 'gf' ? 'Scoring' : 'Defence'} Tracks More Points Variation—${drawSuffix}`;
        } else if (atkDef.withinLeader === 'near-tie' || atkDef.withinLeader === 'tie') {
          const rankDesc = atkDef.withinLeader === 'near-tie' ? 'Are Nearly Equal on Table Rank' : 'Are Equal on Table Rank';
          const poolDesc = (atkDef.pooledLeader === 'gf' || atkDef.pooledLeader === 'ga')
            ? `While ${atkDef.pooledLeader === 'gf' ? 'Scoring' : 'Defence'} Tracks More Points Variation`
            : atkDef.pooledLeader === 'near-tie' ? 'and Nearly Equal on Points Variation' : 'and Equal on Points Variation';
          titleEl.textContent = `Attack and Defence ${rankDesc} ${poolDesc}—${drawSuffix}`;
        } else {
          const poolTail = (atkDef.pooledLeader === 'near-tie' || atkDef.pooledLeader === 'tie')
            ? `on Rank While Points Variation Is ${atkDef.pooledLeader === 'near-tie' ? 'Nearly Equal' : 'Equal'}`
            : 'on Both Measures';
          titleEl.textContent = `${atkDef.withinLeader === 'ga' ? 'Defence' : 'Scoring'} ${marginVerb} ${poolTail}—${drawSuffix}`;
        }
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        proseEl.append(
          el('p', null,
            `Too few tables (${m.numSlots} ${plural(m.numSlots, 'table')}, ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')}) to summarise cross-season medians reliably. Inspect individual club figures below or widen the filter to at least three tables.`
          )
        );
      } else {
        const withinPhrase = atkDef.withinLeader === 'tie'
          ? 'within individual tables, scoring and conceding are equal'
          : atkDef.withinLeader === 'near-tie'
            ? 'within individual tables, scoring and conceding are nearly equal (within 0.0005)'
            : atkDef.withinLeader === 'ga'
              ? 'within individual tables, goals conceded has a slight edge'
              : 'within individual tables, goals scored has a slight edge';
        const pooledPhrase = atkDef.pooledLeader === 'tie'
          ? 'pooled across all clubs, scoring and conceding track an equal share of points-per-game variation'
          : atkDef.pooledLeader === 'near-tie'
            ? 'pooled across all clubs, scoring and conceding track nearly equal shares of points-per-game variation (within 0.05 percentage points)'
            : atkDef.pooledLeader === 'gf'
              ? 'pooled across all clubs, goals scored tracks more variation in points per game'
              : 'pooled across all clubs, goals conceded tracks more variation in points per game';
        const sec1Differs = atkDef.diverges
          || (atkDef.withinNearTie && (atkDef.pooledLeader === 'gf' || atkDef.pooledLeader === 'ga'))
          || (atkDef.pooledNearTie && (atkDef.withinLeader === 'gf' || atkDef.withinLeader === 'ga'));
        const tierDrawSummary = drawAlwaysLast
          ? `in ${m.byTierCorrelations.length === 1 ? `Tier ${m.byTierCorrelations[0].tier}` : `every selected tier (${m.byTierCorrelations.map((t) => `Tier ${t.tier}`).join(', ')})`}`
          : `across tiers (${m.byTierCorrelations.map((t) => `Tier ${t.tier}: ${ordinal(t.drawRankInTier)}`).join(', ')})`;

        proseEl.append(
          el('p', null,
            'Across ',
            el('strong', { textContent: `${m.numSlots} league ${plural(m.numSlots, 'table')}` }),
            ` (${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')}), each stat is ranked by how closely it tracks final league position inside a single table on a 0-to-1 strength scale (0 = no linear link, 1 = perfect link). Measuring position from 1.00 (first) to 0.00 (last) puts 20- to 24-club leagues and 38- to 46-game seasons on equal footing. Wins per game (median strength `,
            el('strong', { textContent: fmtNum(winPred?.medianAbsRFinish, 3) }),
            ') and goal difference per game (',
            el('strong', { textContent: fmtNum(gdPred?.medianAbsRFinish, 3) }),
            ') lead by definition: points come directly from wins and draws, and goal difference is simply goals scored minus goals conceded.',
            isRawMode() ? ' On-pitch points mode (3 points per win, 1 per draw, before deductions) updates points per game and rank links here, while official finishes and outcomes stay fixed.' : ''
          ),
          el('p', null,
            'Between attack and defence, two common ways of measuring strength can point differently: ',
            el('strong', { textContent: withinPhrase }),
            ` (goals conceded ${fmtNum(atkDef.gaWithin, 3)} vs goals scored ${fmtNum(atkDef.gfWithin, 3)}, gap ${fmtNum(atkDef.withinDiff, 3)}; defence stronger in ${m.withinSlot.gaBeatsGfCount} of ${m.withinSlot.comparableGfGaSlots} tables vs ${m.withinSlot.gfBeatsGaCount} for scoring${atkDef.ties > 0 ? `, ${atkDef.ties} tied` : ''}), whereas `,
            el('strong', { textContent: pooledPhrase }),
            ` (goals scored ${fmtNum(atkDef.gfR2 * 100, 1)}% vs goals conceded ${fmtNum(atkDef.gaR2 * 100, 1)}%, overlapping descriptive links rather than additive shares).${sec1Differs ? ' The measures use different outcomes and aggregation methods, so their rankings can differ.' : ''} Both margins are modest descriptive associations rather than tactical prescriptions.`
          ),
          el('p', null,
            `Draws per game rank ${ordinal(drawRankOverall)} of 5 ${tierDrawSummary}. Its direction flips from table to table—negative in ${drawNegSlots} of ${drawPred?.slotCount ?? 0} tables and positive in ${drawPosSlots}—giving a `,
            el('strong', { textContent: `median signed link of ${fmtSigned(drawPred?.medianRFinish, 3)}` }),
            ` (middle half ${fmtSigned(drawPred?.q1RFinish, 3)} to ${fmtSigned(drawPred?.q3RFinish, 3)}) and a `,
            el('strong', { textContent: `median strength of ${fmtNum(drawPred?.medianAbsRFinish, 3)}` }),
            `. Simple arithmetic explains why: over 22 matches, winning 11 and losing 11 yields 33 points, whereas drawing all 22 yields 22 points (and 11 draws yield just 11 points).`
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      m.correlations.forEach((c, idx) => {
        const pp = plainPredictor(c.key, c);
        appendKV(
          calloutEl,
          `${idx + 1}. ${pp.short}`,
          `${fmtNum(c.medianAbsRFinish, 3)} strength (signed ${fmtSigned(c.medianRFinish, 3)})`,
          idx === 0 ? 'highlight' : ''
        );
      });
      if (gfPool && gaPool) {
        appendKV(calloutEl, 'Pooled points variation (Att / Def)', `${fmtNum(gfPool.r2Ppg * 100, 1)}% / ${fmtNum(gaPool.r2Ppg * 100, 1)}%`);
      }
    }

    if (tbody) {
      clearEl(tbody);
      for (const c of m.correlations) {
        const pooled = pooledMap.get(c.key);
        const pp = plainPredictor(c.key, c);
        tbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: pp.short, title: pp.note }),
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
    const pp = plainPredictor(def.key, def);
    const targetIsPpg = state.sec1Target === 'ppg';
    const valid = m.allTeams.filter((t) => typeof t[def.key] === 'number' && Number.isFinite(t[def.key]) && Number.isFinite(targetIsPpg ? t.ppg : t.finishScore));

    if (valid.length < 2) {
      container.appendChild(el('p', { textContent: 'Not enough team seasons to draw a chart.' }));
      return;
    }

    const xVals = valid.map((t) => t[def.key]);
    const yVals = valid.map((t) => (targetIsPpg ? t.ppg : t.finishScore));
    const pooledR = CA.pearson(xVals, yVals);
    const fit = CA.olsFit(xVals, yVals);
    const slotMatch = m.correlations.find((c) => c.key === def.key);

    if (subEl) {
      const basisTag = isRawMode() ? ' · On-pitch points (before deductions)' : '';
      subEl.textContent = `${fmtInt(valid.length)} team ${plural(valid.length, 'season')} · ${pp.label} vs ${targetIsPpg ? 'Points per game' : 'Table rank (1 = 1st, 0 = last)'}${basisTag}`;
    }
    if (noteEl) {
      const basisNote = isRawMode() ? ' (On-pitch points active: deductions excluded here.)' : '';
      const targetName = targetIsPpg ? 'points per game' : 'table rank';
      noteEl.textContent = `${pp.note}. Median link to table rank: ${fmtSigned(slotMatch?.medianRFinish, 3)}; pooled linear link to ${targetName}: ${fmtSigned(pooledR, 3)} (${fmtPct((pooledR ?? 0) ** 2 * 100, 1)} of variation)${basisNote}`;
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

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Scatter chart of ${pp.label} against ${targetIsPpg ? 'Points per game' : 'Table rank'}` });

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
        subtitle: `Tier ${t.tier} · ${t.historicalDivisionName}`,
        rows: [
          ['Official finish', `${ordinal(t.officialPos)} of ${t.teamCount}`],
          [pp.short, fmtNum(xVal, 3)],
          ['Points / game', fmtNum(t.ppg, 3)],
          ['Record', `${t.won}W–${t.drawn}D–${t.lost}L (${t.pointsUsed} pts)`],
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
    svg.appendChild(svgEl('text', { x: pad.left + iw / 2, y: H - 10, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: '#3e3c38' }, pp.label));
    svg.appendChild(svgEl('text', {
      x: 16,
      y: pad.top + ih / 2,
      transform: `rotate(-90 16 ${pad.top + ih / 2})`,
      'text-anchor': 'middle',
      'font-size': 12,
      'font-weight': 600,
      fill: '#3e3c38',
    }, targetIsPpg ? 'Points per game' : 'Table rank (1 = 1st, 0 = last)'));

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
    const pad = { top: 18, right: 32, bottom: 32, left: 108 };
    const iw = W - pad.left - pad.right;
    const rowH = (H - pad.top - pad.bottom) / Math.max(1, m.correlations.length);
    const sx = (v) => pad.left + Math.max(0, Math.min(1, v)) * iw;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Middle half and median link strength with table rank for each stat' });
    const pooledMap = new Map(m.pooledCorrelations.map((p) => [p.key, p]));

    for (let g = 0; g <= 10; g += 2) {
      const v = g / 10;
      const px = sx(v);
      svg.appendChild(svgEl('line', { x1: px, x2: px, y1: pad.top, y2: H - pad.bottom, stroke: '#ede8dd', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: px, y: H - 10, 'text-anchor': 'middle', 'font-size': 10, fill: '#6e6a61', class: 'axis-label' }, v.toFixed(1)));
    }

    const tipMap = new Map();
    m.correlations.forEach((c, i) => {
      const pp = plainPredictor(c.key, c);
      const cy = pad.top + rowH * (i + 0.5);
      const q1 = c.q1AbsRFinish ?? 0;
      const q3 = c.q3AbsRFinish ?? 0;
      const med = c.medianAbsRFinish ?? 0;
      const minV = c.minAbsRFinish ?? q1;
      const maxV = c.maxAbsRFinish ?? q3;
      const pooled = pooledMap.get(c.key)?.absRFinish;

      svg.appendChild(svgEl('text', { x: pad.left - 8, y: cy + 4, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 600, fill: '#141412' }, pp.short));
      // Min-Max whisker
      svg.appendChild(svgEl('line', { x1: sx(minV), x2: sx(maxV), y1: cy, y2: cy, stroke: '#8c867a', 'stroke-width': 1.5 }));
      // Q1-Q3 bar
      const barColor = c.key === 'winRate' || c.key === 'gdPerGame' ? '#3e3c38' : c.key === 'gaPerGame' ? '#1b5670' : c.key === 'gfPerGame' ? '#b8291f' : '#a66314';
      svg.appendChild(svgEl('rect', { x: sx(q1), y: cy - 7, width: Math.max(3, sx(q3) - sx(q1)), height: 14, fill: barColor, 'fill-opacity': '0.28', stroke: barColor, 'stroke-width': 1.2 }));
      // Median dot
      const tid = `s1b-${i}`;
      tipMap.set(tid, {
        title: pp.label,
        subtitle: `${c.slotCount} league ${plural(c.slotCount, 'table')}`,
        rows: [
          ['Median strength (0–1)', fmtNum(med, 3)],
          ['Middle half', `${fmtNum(q1, 3)}–${fmtNum(q3, 3)}`],
          ['Lowest–highest', `${fmtNum(minV, 3)}–${fmtNum(maxV, 3)}`],
          ['All clubs pooled', fmtNum(pooled, 3)],
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
    const rawNote = isRawMode() ? ' (Based on official league tables, unaffected by the on-pitch points toggle.)' : '';

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = `Title Race Snapshot: ${m.champs.length} ${plural(m.champs.length, 'Champion')} Selected`;
      } else {
        titleEl.textContent = m.champFewerWinsCases.length > 0
          ? `Champions Average +${fmtNum((cStats.gdPerGame?.mean ?? 0) - (rStats.gdPerGame?.mean ?? 0), 2)} Better Goal Difference per Game—Yet ${m.champFewerWinsCases.length} Won Fewer Matches Than a Rival`
          : 'Title Standard: Champions Pull Ahead More Through Scoring Than Defence';
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        const pairSummaries = m.titlePairs.map((p) => `${p.season} Tier ${p.tier}: ${p.champion.team} (${p.champion.points} pts, ${fmtNum(p.champion.officialPpg, 2)}/game) beat ${p.runnerUp.team} (${p.runnerUp.points} pts, ${fmtNum(p.runnerUp.officialPpg, 2)}/game)`).join('; ');
        proseEl.append(
          el('p', null,
            `Small-sample scope (${m.champs.length} ${plural(m.champs.length, 'title race')}, fewer than three tables): cross-season averages and spreads are suppressed. `,
            pairSummaries ? `${pairSummaries}.${rawNote}` : rawNote.trim()
          )
        );
      } else {
        proseEl.append(
          el('p', null,
            `Across ${m.champs.length} ${plural(m.champs.length, 'title race')}, champions averaged `,
            el('strong', { textContent: `${fmtNum(cStats.ppg?.mean, 2)} points per game` }),
            ` (vs ${fmtNum(rStats.ppg?.mean, 2)} for runners-up), scoring `,
            el('strong', { textContent: `${fmtNum(cStats.gfPerGame?.mean, 2)} goals per game` }),
            ` (runners-up: ${fmtNum(rStats.gfPerGame?.mean, 2)}) and conceding `,
            el('strong', { textContent: `${fmtNum(cStats.gaPerGame?.mean, 2)}` }),
            ` (runners-up: ${fmtNum(rStats.gaPerGame?.mean, 2)}). Champions outscored the runner-up in ${m.champMoreGfThanRunnerUp} of ${m.titlePairs.length} races and conceded fewer in ${m.champFewerGaThanRunnerUp}.${rawNote}`
          ),
          el('p', null,
            m.champFewerWinsCases.length > 0
              ? `Looking beyond the top flight shows that title winners do not always win the most matches: ${m.champFewerWinsCases.length} ${plural(m.champFewerWinsCases.length, 'champion')} (all in Tiers 2–4) finished first with fewer wins than a rival, starting with Burnley in the 1981–82 Third Division (21 wins and 17 draws for 80 points, ahead of Carlisle United’s 23 wins).`
              : 'Every champion in this selection won at least as many matches as any rival.'
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Champion pts/game (Avg / Med)', smallSample && m.champs.length === 1 ? fmtNum(cStats.ppg?.mean, 2) : `${fmtNum(cStats.ppg?.mean, 2)} / ${fmtNum(cStats.ppg?.median, 2)}`, 'highlight');
      appendKV(calloutEl, 'Runner-up pts/game (Avg / Med)', smallSample && m.runnersUp.length === 1 ? fmtNum(rStats.ppg?.mean, 2) : `${fmtNum(rStats.ppg?.mean, 2)} / ${fmtNum(rStats.ppg?.median, 2)}`);
      appendKV(calloutEl, 'Champion win rate', `${fmtNum((cStats.winRate?.mean ?? 0) * 100, 1)}%`);
      appendKV(calloutEl, 'Champion scored / conceded', `${fmtNum(cStats.gfPerGame?.mean, 2)} / ${fmtNum(cStats.gaPerGame?.mean, 2)}`);
      appendKV(calloutEl, 'Champions trailing in wins', `${m.champFewerWinsCases.length} of ${m.champs.length}`);
    }

    if (eraEl) {
      clearEl(eraEl);
      for (const e of m.eraSplits) {
        eraEl.appendChild(el('div', { className: 'era-card' },
          el('div', { className: 'era-years', textContent: `${e.name} · ${e.years} (${e.count} ${plural(e.count, 'table')})` }),
          el('div', { className: 'era-main num', textContent: `${fmtNum(e.champPpg, 2)} pts/game` }),
          el('div', { className: 'era-sub num', textContent: `Runner-up ${fmtNum(e.runnerPpg, 2)} · Goal diff ${fmtSigned(e.champGdPerGame, 2)}/g` })
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
            textContent: `${c.season} ${c.historicalDivisionName} (Tier ${c.tier}): Champion ${c.champion.team} (${c.champion.won}W–${c.champion.drawn}D–${c.champion.lost}L, ${c.champion.points} pts) trailed ${rivals} in wins.`,
          }));
        }
        fewerBox.append(
          el('h4', { textContent: `Champions With Fewer Wins Than a Rival (${m.champFewerWinsCases.length})` }),
          list
        );
      }
    }

    if (distTbody) {
      clearEl(distTbody);
      const metrics = [
        ['Points / game', 'ppg', 2],
        ['Win rate', 'winRate', 3],
        ['Goals scored', 'gfPerGame', 2],
        ['Goals conceded', 'gaPerGame', 2],
        ['Goal difference', 'gdPerGame', 2],
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
      ppg: 'Official points per game',
      winRate: 'Win rate',
      gfPerGame: 'Goals scored per game',
      gaPerGame: 'Goals conceded per game',
      gdPerGame: 'Goal difference per game',
    };

    const pairs = m.titlePairs.filter((p) => Number.isFinite(p.champion[tk]) && Number.isFinite(p.runnerUp[tk]));
    if (pairs.length === 0) return;

    if (subEl) {
      const basisTag = isRawMode() ? ' · Official league tables' : '';
      subEl.textContent = `${labelMap[k]} across ${pairs.length} league ${plural(pairs.length, 'table')} (${m.firstSeason} to ${m.lastSeason})${basisTag}`;
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

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Title race over time for ${labelMap[k]}` });

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
        subtitle: `Tier ${p.tier} · ${p.historicalDivisionName}`,
        rows: [
          [labelMap[k], fmtNum(p.champion[tk], 3)],
          ['Official points', `${p.champion.points} (${p.champion.played} games)`],
          ['Runner-up', `${p.runnerUp.team} (${fmtNum(p.runnerUp[tk], 3)})`],
        ],
      });
      tipMap.set(rid, {
        title: `2nd: ${p.runnerUp.team} (${p.season})`,
        subtitle: `Tier ${p.tier} · ${p.historicalDivisionName}`,
        rows: [
          [labelMap[k], fmtNum(p.runnerUp[tk], 3)],
          ['Official points', `${p.runnerUp.points} (${p.runnerUp.played} games)`],
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
      { key: 'ppg', label: 'Pts / game' },
      { key: 'winRate', label: 'Win rate' },
      { key: 'gfPerGame', label: 'Scored' },
      { key: 'gaPerGame', label: 'Conceded' },
      { key: 'gdPerGame', label: 'Goal diff' },
    ];

    const W = 540;
    const H = 260;
    const pad = { top: 20, right: 24, bottom: 26, left: 82 };
    const iw = W - pad.left - pad.right;
    const rowH = (H - pad.top - pad.bottom) / defs.length;

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Spread comparison between champions and runners-up' });
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
        rows: [['Average / Median', `${fmtNum(cs.mean, 3)} / ${fmtNum(cs.median, 3)}`], ['Middle half', `${fmtNum(cs.q1, 3)}–${fmtNum(cs.q3, 3)}`], ['Lowest–highest', `${fmtNum(cs.min, 3)}–${fmtNum(cs.max, 3)}`]],
      });
      svg.appendChild(svgEl('circle', { cx: sx(cs.median), cy: y1, r: 4, fill: '#b8291f', 'data-tip-id': tidC }));

      // Runner-Up row (bottom half)
      const y2 = cy + 7;
      svg.appendChild(svgEl('line', { x1: sx(rs.min), x2: sx(rs.max), y1: y2, y2, stroke: '#1b5670', 'stroke-width': 1.2, 'stroke-opacity': '0.55' }));
      svg.appendChild(svgEl('rect', { x: sx(rs.q1), y: y2 - 4.5, width: Math.max(2, sx(rs.q3) - sx(rs.q1)), height: 9, fill: '#1b5670', 'fill-opacity': '0.3', stroke: '#1b5670' }));
      const tidR = `s2d-r-${idx}`;
      tipMap.set(tidR, {
        title: `2nd Place · ${d.label}`,
        rows: [['Average / Median', `${fmtNum(rs.mean, 3)} / ${fmtNum(rs.median, 3)}`], ['Middle half', `${fmtNum(rs.q1, 3)}–${fmtNum(rs.q3, 3)}`], ['Lowest–highest', `${fmtNum(rs.min, 3)}–${fmtNum(rs.max, 3)}`]],
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
    const rawNote = isRawMode() ? ' (Based on official league tables, unaffected by the on-pitch points toggle.)' : '';
    const smallSample = ss.slotCount < 3;
    const boundaryReprieves = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);
    const noRel = m.noRelegationSlots || [];
    const reElecOnly = noRel.length > 0 && noRel.every((x) => x.reElectionEra);

    if (titleEl) {
      titleEl.textContent = ss.slotCount === 0
        ? (reElecOnly
          ? 'No Automatic Relegation in Selected Re-Election Seasons'
          : 'No Relegation in Selected Tables')
        : smallSample
          ? `Survival Cutoff Snapshot (${ss.slotCount} ${plural(ss.slotCount, 'Table')} With Relegation)`
          : 'Safety Varies by Tier: 40-Point Pace Fails Lower-Tier Cutoffs, While 50-Point Pace Is Rarely Reached';
    }

    if (proseEl) {
      clearEl(proseEl);
      if (ss.slotCount === 0) {
        const reElecCount = noRel.filter((x) => x.reElectionEra).length;
        const reasonText = reElecOnly
          ? `Automatic relegation was not in place across ${noRel.length === 1 ? 'this Fourth Division re-election season' : `these ${reElecCount} Fourth Division re-election seasons`} (${noRel.map((x) => `${x.season} Tier ${x.tier}`).join(', ')}); bottom clubs faced re-election instead.`
          : `None of the ${noRel.length} selected ${plural(noRel.length, 'table')} had relegation (${noRel.map((x) => `${x.season} Tier ${x.tier}`).join(', ')}).`;
        proseEl.append(el('p', { textContent: `${reasonText} Widen the filter to examine survival cutoffs.` }));
      } else if (smallSample) {
        const slotDesc = m.survivalSeries.map((s) => `${s.season} Tier ${s.tier}: lowest survivor ${s.survivingTeam} (${s.survivingPts} pts, ${fmtNum(s.survivingPpg, 3)}/game) vs highest relegated ${s.relegatedTeam} (${s.relegatedHighPts} pts, ${fmtNum(s.relegatedHighPpg, 3)}/game)`).join('; ');
        const reprieveDesc = boundaryReprieves.length > 0
          ? ` Boundary reprieves excluded from lowest merit survivor: ${boundaryReprieves.map((r) => `${r.team} (${r.season} Tier ${r.tier}, ${ordinal(r.pos)}, ${r.outcomeType})`).join(', ')}.`
          : '';
        proseEl.append(el('p', null, `Small-sample scope (${ss.slotCount} ${plural(ss.slotCount, 'table')} with relegation, fewer than three): cross-season medians are suppressed. ${slotDesc}.${reprieveDesc}${rawNote}`));
      } else {
        const highRelSlot = m.survivalSeries.reduce((b, x) => ((x.relegatedHighPpg ?? 0) > (b?.relegatedHighPpg ?? 0) ? x : b), null);
        const exclParts = [];
        if (ss.excludedNoRelegationCount > 0) exclParts.push(`${ss.excludedNoRelegationCount} ${plural(ss.excludedNoRelegationCount, 'table')} without relegation separated`);
        if (boundaryReprieves.length > 0) exclParts.push(`${boundaryReprieves.length} reprieved boundary ${plural(boundaryReprieves.length, 'club')} excluded from lowest merit survivor`);
        const exclClause = exclParts.length > 0 ? ` (${exclParts.join('; ')})` : '';
        proseEl.append(
          el('p', null,
            `Across ${ss.slotCount} ${plural(ss.slotCount, 'table')} with relegation${exclClause}, the median lowest surviving side earned `,
            el('strong', { textContent: `${fmtNum(ss.survivingPpg?.median, 3)} points per game` }),
            ` (${fmtNum(ss.survivingPts38?.median, 1)} over 38 games; ${fmtNum(ss.survivingPts46?.median, 1)} over 46 games). Premier League folklore fixes on 40 points (1.053 per game), whereas Championship and League One relegation fights regularly sit near 49–50 points over 46 games (1.067–1.087 per game).${rawNote}`
          ),
          el('p', null,
            `In ${ss.relegatedAtOrAbove40Over38Rate.length} of ${ss.slotCount} ${plural(ss.slotCount, 'table')} (${fmtNum(relAbove40Pct, 1)}%), at least one relegated club reached 1.053 points per game (40-point 38-game pace) or more. The highest-scoring relegated club here earned `,
            el('strong', { textContent: `${fmtNum(highRelSlot?.relegatedHighPpg, 3)} points per game` }),
            highRelSlot ? ` (${highRelSlot.relegatedTeam}, ${highRelSlot.relegatedHighPts} pts in the ${highRelSlot.season} ${highRelSlot.historicalDivisionName}).` : '.'
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
      const slotSummary = ss.excludedNoRelegationCount > 0 ? `${ss.slotCount} (${ss.excludedNoRelegationCount} without relegation excluded)` : String(ss.slotCount);
      appendKV(calloutEl, 'Tables with relegation', slotSummary);
      appendKV(calloutEl, 'Median lowest survivor', smallSample && ss.slotCount === 1 ? `${fmtNum(ss.survivingPpg?.min, 3)} pts/g` : `${fmtNum(ss.survivingPpg?.median, 3)} pts/g`, 'highlight');
      appendKV(calloutEl, 'Lowest survivor ever', `${fmtNum(ss.survivingPpg?.min, 3)} pts/g`);
      appendKV(calloutEl, 'Median highest dropped', smallSample && ss.slotCount === 1 ? `${fmtNum(ss.relegatedPpg?.min, 3)} pts/g` : `${fmtNum(ss.relegatedPpg?.median, 3)} pts/g`);
      appendKV(calloutEl, 'Dropped on 40-in-38 pace (≥1.053)', `${ss.relegatedAtOrAbove40Over38Rate.length} / ${ss.slotCount}`);
      appendKV(calloutEl, 'Dropped on 50-in-46 pace (≥1.087)', `${ss.relegatedAtOrAbove50Over46Rate.length} / ${ss.slotCount}`);
      if (boundaryReprieves.length > 0) {
        appendKV(calloutEl, 'Reprieved clubs excluded', boundaryReprieves.map((r) => `${r.team} (${r.season} Tier ${r.tier})`).join(', '));
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
        promoTbody.appendChild(el('tr', null, el('td', { colSpan: 6, className: 'text-col table-note-cell', textContent: 'Select Tiers 2, 3, or 4 to view promotion and play-off cutoffs.' })));
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
        ? `${ds.relegatedDueToDeductionCount} ${ds.relegatedDueToDeductionCount === 1 ? 'club went' : 'clubs went'} down after deductions despite finishing above the relegation line on pitch points alone (e.g. ${examples}).`
        : 'no clubs changed relegation status on pitch points alone in this selection.';
      const affectedClause = ds.affectedRowsCount > 0
        ? `${ds.affectedRowsCount} team ${plural(ds.affectedRowsCount, 'season')} had points adjustments; ${relClause}`
        : 'no clubs had points adjustments in this selection.';
      dedNoteEl.textContent = `Points-deduction check (survival cutoffs above stay on official tables): ${affectedClause}`;
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
      container.appendChild(el('p', { textContent: 'No tables with relegation in the current selection.' }));
      return;
    }

    const mode = state.sec3Mode; // 'ppg' | 'pts46' | 'pts38'
    const mult = mode === 'pts46' ? 46 : mode === 'pts38' ? 38 : 1;
    const digits = mode === 'ppg' ? 2 : 1;
    const basisTag = isRawMode() ? ' · Official league tables (unaffected by on-pitch toggle)' : '';

    if (subEl) {
      subEl.textContent = mode === 'ppg'
        ? `Lowest safe vs. highest relegated club in official points per game (comparable across 38- to 46-game seasons)${basisTag}`
        : `${mult}-game official point equivalent across ${m.survivalSeries.length} ${plural(m.survivalSeries.length, 'table')} with relegation${basisTag}`;
    }
    if (noteEl) {
      const notes = [];
      const activeBoundaryReprieves = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);
      if (m.noRelegationSlots.length > 0) {
        notes.push(`Excludes ${m.noRelegationSlots.length} Tier 4 ${plural(m.noRelegationSlots.length, 'table')} without relegation (${m.noRelegationSlots.map((x) => `${x.season} Tier ${x.tier}`).join(', ')}).`);
      }
      if (activeBoundaryReprieves.length > 0) {
        notes.push(`Excludes ${activeBoundaryReprieves.length} reprieved or expelled boundary ${plural(activeBoundaryReprieves.length, 'club')} from lowest merit survivor (${activeBoundaryReprieves.map((r) => `${r.team} ${r.season} Tier ${r.tier} (${ordinal(r.pos)}, ${r.outcomeType})`).join(', ')}).`);
      }
      notes.push(`Dashed lines mark 1.053 points per game (40 over 38 games: ${(40 / 38 * mult).toFixed(digits)}) and 1.087 points per game (50 over 46 games: ${(50 / 46 * mult).toFixed(digits)}).`);
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

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Survival and relegation cutoff chart' });

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
        subtitle: `Tier ${s.tier} · ${s.historicalDivisionName}`,
        rows: [
          ['Position', `${ordinal(s.survivingPos)} (lowest safe)`],
          ['Points / game', fmtNum(s.survivingPpg, 3)],
          ['Points', `${s.survivingPts} (${s.gamesPerTeam} games)`],
        ],
      });
      tipMap.set(idR, {
        title: `Relegated: ${s.relegatedTeam} (${s.season})`,
        subtitle: `Tier ${s.tier} · ${s.historicalDivisionName}`,
        rows: [
          ['Highest dropped', `${fmtNum(s.relegatedHighPpg, 3)} pts/game`],
          ['Points', `${s.relegatedHighPts} (${s.gamesPerTeam} games)`],
          ['Guaranteed safe', `${s.guaranteedSafePts} pts (${fmtNum(s.guaranteedSafePpg, 3)}/game)`],
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
    const rawNote = isRawMode() ? ' (Based on official league tables, unaffected by the on-pitch points toggle.)' : '';
    const champText = dl.championCount > 0
      ? dl.championCampaigns.map((c) => `${c.team} (${c.season} Tier ${c.tier}, ${c.won}W–${c.drawn}D–${c.lost}L)`).join('; ')
      : null;

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = `Draw Leaders in Selected Scope (${dl.count} Team ${plural(dl.count, 'Season')})`;
      } else if (dl.championCount > 0) {
        titleEl.textContent = `Draw Leaders Cluster in the Middle Half (${fmtNum(midPct, 0)}%)—With Only ${dl.championCount} ${plural(dl.championCount, 'Champion')}`;
      } else {
        titleEl.textContent = `Draw Leaders Cluster in the Middle Half (${fmtNum(midPct, 0)}%)`;
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        const listStr = m.seasonDrawLeaders.map((r) => `${r.team} (${r.season} Tier ${r.tier}: ${r.drawn} draws, ${ordinal(r.pos)} of ${r.teamCount})`).join('; ');
        proseEl.append(
          el('p', null,
            `Small-sample scope (${dl.slotCount} ${plural(dl.slotCount, 'table')}, fewer than three): cross-season medians and percentage shares are suppressed. Draw leaders here: ${listStr}.${rawNote}`
          )
        );
      } else {
        const coLeaderNote = dl.coLeaderSlotsCount > 0
          ? ` (${dl.coLeaderSlotsCount} ${plural(dl.coLeaderSlotsCount, 'table')} produced tied co-leaders, so these ${dl.count} team seasons are not all separate tables)`
          : '';
        proseEl.append(
          el('p', null,
            `Across ${dl.count} team ${plural(dl.count, 'season')} that led or shared the lead for draws in ${dl.slotCount} ${plural(dl.slotCount, 'table')}${coLeaderNote}, the median finish sat ahead of `,
            el('strong', { textContent: `${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}%` }),
            ` of rivals (${ordinal(dl.pos?.median)} place on average league size; because divisions hold 20 to 24 clubs, a 0%–100% table rank puts every tier on the same scale).`
          ),
          el('p', null,
            `Even so, draw leaders finished across the whole table rather than solely in mid-table: `,
            el('strong', { textContent: `${dl.middleHalfCount} (${fmtNum(midPct, 1)}%)` }),
            ` landed in the middle half, `,
            el('strong', { textContent: `${dl.bottomQuarterCount} (${fmtNum(botPct, 1)}%)` }),
            ` in the bottom quarter, and `,
            el('strong', { textContent: `${dl.topQuarterCount} (${fmtNum(topPct, 1)}%)` }),
            ` in the top quarter. Exactly `,
            el('strong', { textContent: `${dl.relegatedCount}` }),
            ` draw-leading ${dl.relegatedCount === 1 ? 'club was' : 'clubs were'} relegated and `,
            el('strong', { textContent: `${dl.promotedCount}` }),
            ` won promotion. `,
            champText
              ? `${dl.championCount} draw ${plural(dl.championCount, 'leader')} won a title: ${champText}.${rawNote}`
              : `No draw-leading side in scope won the league title.${rawNote}`
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Draw-leading clubs', dl.coLeaderSlotsCount > 0 ? `${dl.count} across ${plural(dl.slotCount, 'table')}` : String(dl.count));
      appendKV(calloutEl, 'Median finish', smallSample && dl.count === 1 ? `${ordinal(dl.pos?.min)} (ahead of ${fmtNum((dl.finishScore?.min ?? 0) * 100, 1)}%)` : `${ordinal(dl.pos?.median)} (ahead of ${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}%)`, 'highlight');
      appendKV(calloutEl, 'Middle half (25%–75%)', `${dl.middleHalfCount} / ${dl.count} (${fmtNum(midPct, 1)}%)`);
      appendKV(calloutEl, 'Top / bottom quarter', `${dl.topQuarterCount} / ${dl.bottomQuarterCount}`);
      appendKV(calloutEl, 'Promoted / relegated / titles', `${dl.promotedCount} / ${dl.relegatedCount} / ${dl.championCount}`);
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
      const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Finishing positions of division draw leaders' });
      const tipMap = new Map();

      bins.forEach((b, i) => {
        const bh = (b.items.length / maxCount) * ih;
        const bx = pad.left + i * bw + bw * 0.16;
        const by = pad.top + ih - bh;
        const tid = `s4b-${i}`;
        tipMap.set(tid, {
          title: b.label.replace('\n', ' '),
          rows: [
            ['Draw-leading clubs', String(b.items.length)],
            ['Share', `${fmtNum((b.items.length / Math.max(1, dl.count)) * 100, 1)}%`],
            ['Relegated in group', String(b.items.filter((x) => x.relegated).length)],
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
      noteEl.textContent = `A 0%–100% table rank puts champions at 100% and bottom place at 0% across 20- to 24-club leagues (${dl.middleHalfCount} of ${dl.count} finished in the middle half; tied draw leaders each count separately).${rawNote}`;
    }

    if (tbody) {
      clearEl(tbody);
      const top20 = m.highDrawCampaigns.slice(0, 20);
      if (top20.length === 0) {
        tbody.appendChild(el('tr', null, el('td', { colSpan: 7, className: 'text-col table-note-cell', textContent: 'No team drew 36.8% or more of its matches in the current selection.' })));
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
      const unavailText = 'Verified Golden Boot and club top-scorer records cover the Premier League (1992–93 to 2024–25) only. Pre-1992 First Division seasons and Tiers 2–4 lack uniform club-level scorer tables in our verified sources, so nothing is estimated or filled in.';
      if (titleEl) titleEl.textContent = 'Top-Scorer Records Are Unavailable Outside the Premier League (1992–2025)';
      if (proseEl) {
        clearEl(proseEl);
        proseEl.append(el('p', { textContent: unavailText }));
      }
      if (calloutEl) {
        clearEl(calloutEl);
        appendKV(calloutEl, 'Verified scorer tables', `0 of ${m.numSlots}`, 'highlight');
        appendKV(calloutEl, 'Coverage policy', 'Premier League 1992–2025 only (no estimates)');
      }
      if (scopeBanner) scopeBanner.hidden = true;
      if (unavailPanel) unavailPanel.hidden = false;
      if (unavailCopy) unavailCopy.textContent = unavailText;
      if (verifiedPanel) verifiedPanel.hidden = true;
      return;
    }

    if (unavailPanel) unavailPanel.hidden = true;
    if (verifiedPanel) verifiedPanel.hidden = false;
    if (scopeBanner) {
      if (sa.status === 'verified-partial') {
        scopeBanner.hidden = false;
        scopeBanner.textContent = `Coverage note: Showing ${sa.availableSlotsCount} verified Premier League ${plural(sa.availableSlotsCount, 'season')} (1992–93 to 2024–25). ${sa.unavailableSlotsCount} pre-1992 or lower-tier ${plural(sa.unavailableSlotsCount, 'table')} in your filter ${sa.unavailableSlotsCount === 1 ? 'is' : 'are'} omitted because matching club scorer records are not available.`;
      } else {
        scopeBanner.hidden = true;
      }
    }

    const ss = sa.shareStats;
    const pctWithGb = ((sa.champWithGbCount / Math.max(1, sa.availableSlotsCount)) * 100).toFixed(1);
    const pctWithoutGb = (100 - Number(pctWithGb)).toFixed(0);
    if (titleEl) {
      titleEl.textContent = sa.champWithGbCount === 0
        ? `None of the ${sa.availableSlotsCount} Verified Premier League Champions Fielded the Golden Boot Winner`
        : sa.champWithGbCount === sa.availableSlotsCount
          ? `All ${sa.availableSlotsCount} Verified Premier League Champions Fielded the Golden Boot Winner`
          : `In ${pctWithoutGb}% of Verified Premier League Seasons, the Champion Did Not Field the Golden Boot Winner`;
    }
    if (proseEl) {
      clearEl(proseEl);
      const rawNote = isRawMode() ? ' (Based on official Premier League tables, unaffected by the on-pitch points toggle.)' : '';
      proseEl.append(
        el('p', null,
          `Across ${sa.availableSlotsCount} verified Premier League ${plural(sa.availableSlotsCount, 'season')} (1992–93 to 2024–25), `,
          el('strong', { textContent: `${sa.champWithGbCount} of ${sa.availableSlotsCount} (${pctWithGb}%)` }),
          ` champions had the league’s Golden Boot winner (linear link between fielding the Golden Boot winner and winning the title: ${fmtSigned(ss.rGbChampAll, 3)}).`
        ),
        el('p', null,
          `Among top-four clubs (${ss.champ?.count ?? 0} champions, ${ss.runner?.count ?? 0} runners-up, and ${ss.thirdFourth?.count ?? 0} third- and fourth-place finishers), champions relied slightly less on a single scorer than third- and fourth-place sides: a median `,
          el('strong', { textContent: `${fmtNum(ss.champ?.median, 1)}%` }),
          ' of team goals vs ',
          el('strong', { textContent: `${fmtNum(ss.thirdFourth?.median, 1)}%` }),
          ` (linear link between top-scorer share and official points per game: ${fmtSigned(ss.rSharePpgTop4, 3)}; descriptive only).${rawNote}`
        )
      );
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'Verified scorer tables', `${sa.availableSlotsCount} (PL 1992–2025)`);
      appendKV(calloutEl, 'Champions with Golden Boot', `${sa.champWithGbCount} / ${sa.availableSlotsCount} (${pctWithGb}%)`, 'highlight');
      appendKV(calloutEl, 'Champion top-scorer share', `${fmtNum(ss.champ?.median, 1)}% median`);
      appendKV(calloutEl, '3rd–4th top-scorer share', `${fmtNum(ss.thirdFourth?.median, 1)}% median`);
      appendKV(calloutEl, 'Share vs. points link (Top 4)', fmtSigned(ss.rSharePpgTop4, 3));
    }

    const gbSubEl = document.getElementById('sec5-gb-subtitle');
    if (gbSubEl) gbSubEl.textContent = `${sa.availableSlotsCount} verified Premier League ${plural(sa.availableSlotsCount, 'season')} (${sa.gbInstances.length} Golden Boot winner-seasons, including ties)`;

    renderSec5Charts(sa);
  }

  function renderSec5Charts(sa) {
    const shareEl = document.getElementById('chart-sec5-share');
    const gbEl = document.getElementById('chart-sec5-gb-finishes');
    const noteEl = document.getElementById('sec5-share-note');
    const tbody = document.getElementById('sec5-gb-tbody');

    if (noteEl) {
      const basisTag = isRawMode() ? ' (Official points per game shown, unaffected by the on-pitch toggle.)' : '';
      noteEl.textContent = `Covers ${sa.top4Teams.length} top-four team seasons in ${sa.availableRangeLabel}. Linear link between top-scorer goal share and official points per game: ${fmtSigned(sa.shareStats.rSharePpgTop4, 3)}.${basisTag}`;
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

      const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Top-four scorer goal share against official points per game' });
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
          subtitle: `Premier League ${ordinal(t.pos)} · Top scorer: ${t.scorerPlayer}`,
          rows: [
            ['Goal share', `${fmtNum(t.scorerShare, 1)}% (${t.scorerGoals}/${t.gf})`],
            ['Official pts/game', fmtNum(t.officialPpg, 3)],
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
      const fmtPtsBadge = (row) => (isRawMode() && row.signedAdjustment !== 0 ? `${row.points} official pts (${row.rawPoints} on-pitch)` : `${row.points} pts`);
      appendKV(sumList, 'Champion', c ? `${c.team} (${fmtPtsBadge(c)})` : '—', 'highlight');
      appendKV(sumList, 'Runner-Up', ru ? `${ru.team} (${fmtPtsBadge(ru)})` : '—');
      appendKV(sumList, 'Clubs / Matches', `${slot.participantCount} / ${slot.matchCount}`);
      appendKV(sumList, 'Total Goals', `${slot.totalGoals} (${fmtNum(slot.totalGoals / Math.max(1, slot.matchCount), 2)}/game)`);
      appendKV(sumList, 'Tie-Break Rule', slot.tieBreakRules?.[1] === 'gf' ? 'Points → Goals Scored → Goal Diff' : slot.status === 'curtailed' ? 'Points per Game → Goal Diff/Game' : 'Points → Goal Diff → Goals Scored');
      appendKV(sumList, 'Golden Boot', slot.scorerCoverage === 'verified_pl_complete' ? `${(slot.goldenBootWinners || []).map((w) => w.player).join(' / ')} (${slot.goldenBootGoals})` : 'Unavailable (Premier League 1992–2025 only)');
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
        notes.unshift('On-pitch points mode: position, points and points-per-game columns reflect results on the pitch, while title, promotion and relegation badges keep official outcomes.');
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
      dedNote.textContent = notes.length > 0 ? notes.join(' · ') : 'No points deductions, expulsions, or unusual fixture counts in this league table.';
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
          el('strong', { textContent: 'Primary match records (CC BY 4.0): ' }),
          elv.attribution || 'Sean Elvidge — England-football-results (CC BY 4.0).',
          elv.pinnedCommitSha ? ' Pinned commit ' : '',
          elv.pinnedCommitSha ? el('code', { textContent: elv.pinnedCommitSha.slice(0, 12) }) : '',
          `. All ${meta.totalTierSeasonSlots ?? 176} league tables (${fmtInt(meta.totalMatchesPlayed)} matches, ${fmtInt(meta.totalGoalsScored)} goals) are built directly from historical match scores, with no predictive models or ratings.`
        ),
        el('p', null,
          el('strong', { textContent: 'Independent checks and known differences: ' }),
          'RSSSF English league tables (1981–82 to 2024–25) and football-data.co.uk match records (1993–94 to 2024–25) were used to verify every points deduction, appeal, expunged record (Aldershot 1991–92), club expulsion (Bury 2019–20), and the Football League’s goals-scored-before-goal-difference tie-breaker (1992–93 to 1998–99 in Tiers 2–4). Across 89,234 matches, 46 minor historical single-goal discrepancies between RSSSF and Elvidge are logged in the project manifest rather than papered over.'
        ),
        el('p', null,
          el('strong', { textContent: 'How the numbers work: ' }),
          'Section 1 shows two complementary measures: how strongly each stat tracks final table position inside each individual league (averaged via the median across tables on a 0-to-1 scale, alongside the signed median so flips in direction—as with draws—stay visible), and how much variation in points per game it tracks when every club is pooled together. Attack and defence can legitimately order differently between those two views. Switching Points Basis to Raw (3W+D) strips out points deductions in Section 1 and the archive’s points columns while keeping official titles, promotions, play-offs and survival lines fixed. Clubs spared relegation by a reprieve, withdrawal or expulsion are tagged separately so they never distort the lowest merit survivor.'
        ),
        el('p', null,
          el('strong', { textContent: 'Why the study starts in 1981–82: ' }),
          'English football adopted three points for a win across all four top tiers in 1981–82. Earlier two-point seasons are left out because recalculating old tables under three points cannot replay how teams would have played for a win instead of a draw. Only completed seasons through 2024–25 are included.'
        )
      );
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, 'League tables', `${meta.totalTierSeasonSlots ?? '—'} (${meta.completedSlots ?? '—'} completed + ${meta.curtailedSlots ?? '—'} curtailed)`);
      appendKV(calloutEl, 'Team seasons / matches', `${fmtInt(meta.totalTeamSeasons)} / ${fmtInt(meta.totalMatchesPlayed)}`);
      appendKV(calloutEl, 'Match file SHA-256', elv.sha256?.EnglandLeagueResults ? elv.sha256.EnglandLeagueResults.slice(0, 16) + '…' : 'N/A');
      appendKV(calloutEl, 'Scorer coverage', meta.scorerCoverageSummary ? `${meta.scorerCoverageSummary.verifiedSlots} verified / ${meta.scorerCoverageSummary.unavailableSlots} unavailable` : 'N/A');
      appendKV(calloutEl, 'Excluded future seasons', Array.isArray(meta.excludedFutureSeasons) ? meta.excludedFutureSeasons.join(', ') : '2025/2026+');
    }

    if (footerEl) {
      const hashPreview = meta.canonicalJsonSha256 ? `${meta.canonicalJsonSha256.slice(0, 16)}…` : 'local';
      footerEl.textContent = `Dataset v${state.dataset.schemaVersion} · SHA-256 ${hashPreview} · Sources: Sean Elvidge (CC BY 4.0), RSSSF, football-data.co.uk`;
    }
  }

  /* ========================================================================
     FULL RE-RENDER COORDINATOR & EVENT WIRING
     ======================================================================== */
  function renderAll() {
    syncScopeControlsUI();
    renderMastheadAndBanner();

    const emptyPanel = document.getElementById('empty-scope-panel');
    const emptyMsgEl = document.getElementById('empty-scope-message');
    const sections = document.querySelectorAll('#main-content > section.analysis-section, #ledger');
    if (state.model.isEmpty) {
      if (emptyMsgEl) {
        emptyMsgEl.textContent = state.model.excludedCurtailedSlots?.length > 0
          ? `All ${state.model.excludedCurtailedSlots.length} matching ${plural(state.model.excludedCurtailedSlots.length, 'table')} (${state.model.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')}) were curtailed and excluded by default. Enable "Include Curtailed" above or broaden your year/tier filter.`
          : 'Select at least one league tier (1–4) or broaden your year range to inspect historical league tables.';
      }
      renderLedger();
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

  if (typeof globalThis !== 'undefined') {
    globalThis.ChampionshipLedger = { describeAtkVsDef, buildLedgerView };
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }
})();
