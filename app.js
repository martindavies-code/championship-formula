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
     APPLICATION STATE & DUAL-VOICE REGISTER ('normal' vs 'sicko')
     ======================================================================== */
  const state = {
    dataset: null,
    model: null,
    voiceMode: 'normal', // 'normal' | 'sicko'
    scope: {
      tiers: [1, 2, 3, 4],
      startYear: 1981,
      endYear: 2025,
      includeCurtailed: false,
      pointsMode: 'official',
    },
    sec1Metric: 'gfPerGame',
    sec1Target: 'ppg',
    sec2Metric: 'ppg',
    sec3Mode: 'ppg',
    archiveTier: 1,
    archiveSeason: '2025-26',
    archiveMode: 'raw',
    archiveSortCol: 0,
    archiveSortDir: 'asc',
  };

  function isSicko(overrideMode) {
    return (overrideMode || state.voiceMode) === 'sicko';
  }

  const VOICE_CHROME = {
    'voice-label': 'Lexical Verbosity Vector:',
    'voice-hint': 'UNSUPERVISED QUANT MODE ENGAGED — zero hand-holding, maximum pedantry',
    'masthead-kicker': 'Panel-Data Econometric Spec v2.0.0 · 3-Pt Affine Regime (t ∈ [1981, 2025]) · Zero-Imputation ETL',
    'masthead-title': 'The Championship Formula: Within-Slot Pearsonian & Stacked OLS Decomposition of English Pyramid Standings',
    'masthead-deck': 'An unsmoothed, non-causal longitudinal audit of 180 unbalanced tier-season slots across heteroskedastic 38g–46g schedules and variable club cardinalities (K ∈ [20, 24]), isolating within-slot demeaned |r| hierarchies, right-tail champion drift, survival-boundary truncation, and single-elimination play-off variance.',
    'scope-presets-label': 'Slice Spec:',
    'preset-all': 'Full Panel: T1–T4 (1981–2026)',
    'preset-pl': 'PL Verified Subset (1992–2026)',
    'preset-t1': 'Top-Flight Stratum T1 (1981–2026)',
    'preset-efl': 'EFL Strata T2–T4 (1981–2026)',
    'scope-points-label': 'Target Vector (y):',
    'points-official': 'Observed Official Pts (post-penalty)',
    'points-raw': 'Counterfactual Raw 3W+D Vector',
    'scope-tiers-legend': 'Pyramid Strata (joined on invariant tier ∈ {1..4}; historical division nomenclature preserved)',
    'tier-check-1': 'Stratum T1 · First Div / PL',
    'tier-check-2': 'Stratum T2 · Second Div / Championship',
    'tier-check-3': 'Stratum T3 · Third Div / League One',
    'tier-check-4': 'Stratum T4 · Fourth Div / League Two',
    'scope-years-legend': 'Panel Window [t₀, t₁] (3-Pt Era Only; seasons indexed by start year)',
    'scope-from': 't₀',
    'scope-to': 't₁',
    'scope-curtail-legend': 'COVID-Truncated 2019–20 Slots',
    'scope-curtail-label': 'Ingest 2019–20 T3/T4 unweighted-PPG curtailed slots (n = +2; Bury FC expelled pre-kickoff)',
    'nav-takeaways': '00. Priors & Anomalies',
    'nav-ledger': 'Summary Tensor',
    'nav-sec1': '01. Within-Slot |r| & R²(PPG)',
    'nav-sec2': '02. Upper-Tail Drift',
    'nav-sec3': '03. Truncation & χ² Play-Offs',
    'nav-sec4': '04. Stalemate Kurtosis',
    'nav-sec5': '05. Scorer Concentration',
    'nav-sec6': '06. Raw Slot Ledger',
    'nav-sec7': '07. ETL & SHA-256 Spec',
    'empty-title': 'Empty Panel Intersection (N_slots = 0)',
    'empty-btn': 'Reset Slice Spec to Full Panel (T1–T4, 1981–2026)',
    'takeaways-heading': 'Headline Distributional Anomalies (Strictly Non-Causal, Zero Priors Assumed)',
    'ledger-heading': 'Six-Card Empirical Summary Tensor',
    'sec1-kicker': '01 / Within-Slot Collinearity, |r| & Stacked OLS R²(PPG)',
    'sec1-callout-title': 'Within-Slot Med. |r| vs. Pooled R²(PPG)',
    'sec1-scatter-title': 'Stacked Cross-Sectional Scatter & Bivariate OLS Fit',
    'sec1-x-label': 'Regressor (x):',
    'm-gf': 'GF/G',
    'm-ga': 'GA/G',
    'm-gd': 'GD/G',
    'm-w': 'W/G',
    'm-d': 'D/G',
    'sec1-y-label': 'Response (y):',
    'y-ppg': 'PPG',
    'y-finish': 'Norm. Finish Score [0,1]',
    'leg-champ': 'I(pos=1) Champion',
    'leg-ru': 'pos=2 / Promoted',
    'leg-topq': 'Upper Quartile / PO',
    'leg-mid': 'Mid-Distribution Field',
    'leg-rel': 'Relegated Tail',
    'sec1-bars-title': 'Within-Slot |r_finish| Distribution (IQR Whiskers + Pooled |r|)',
    'sec1-bars-sub': 'Box = within-slot IQR [Q1, Q3]; circle = median(|r|); diamond = stacked cross-sectional |r|',
    'sec1-table-cap': 'Within-Slot Pearson Distribution vs. Pooled Cross-Sectional R²(PPG)',
    'sec1-th-stat': 'Feature',
    'sec1-th-signed': 'Med. r',
    'sec1-th-abs': 'Med. |r| (IQR)',
    'sec1-th-ppg': 'Med. r(PPG)',
    'sec1-th-r2': 'Pooled R²(PPG)',
    'sec1-tier-cap': 'Stratum-Level GA/G vs. GF/G Metric Divergence Matrix',
    'sec1-tth-tier': 'Stratum',
    'sec1-tth-n': 'Slots',
    'sec1-tth-att': 'GF/G |r|',
    'sec1-tth-def': 'GA/G |r|',
    'sec1-tth-led': 'GA>GF Slots',
    'sec1-tth-var': 'R²(PPG) GF/GA',
    'sec2-kicker': '02 / Upper-Tail Title Manifolds & Non-Monotonic argmax(W)',
    'sec2-callout-title': 'Observed Champion Moment Vector (Per-Match)',
    'sec2-time-title': 'Longitudinal Title-Pair Trajectory (1st vs. 2nd Order Statistics)',
    'sec2-metric-label': 'Rate Vector:',
    'm2-ppg': 'PPG',
    'm2-w': 'W/G',
    'm2-gf': 'GF/G',
    'm2-ga': 'GA/G',
    'm2-gd': 'GD/G',
    'leg2-c': 'Champion (pos=1)',
    'leg2-r': 'Runner-Up (pos=2)',
    'leg2-avg': 'Cross-Stratum Annual Mean',
    'sec2-dist-title': 'Empirical Quantile Spread: 1st vs. 2nd Place (IQR + Min–Max)',
    'sec2-dist-sub': 'Box = interpolated IQR [Q1, Q3]; dot = median; whisker = [min, max]',
    'sec2-tbl-title': 'Parametric & Non-Parametric Title Moments by Stratum',
    'sec2-tbl-sub': 'Per-match normalization removes 38g vs. 46g schedule heteroskedasticity',
    'sec2-t1-cap': 'Order-Statistic Moments: pos=1 vs. pos=2 (Per-Match Rates)',
    'sec2-th-stat': 'Rate Metric',
    'sec2-th-fin': 'Order Stat',
    'sec2-th-avg': 'Mean (μ)',
    'sec2-th-med': 'Median',
    'sec2-th-iqr': 'IQR [Q1–Q3]',
    'sec2-th-rng': '[Min–Max]',
    'sec2-t2-cap': 'Stratum-Conditioned Mean Title Benchmarks (PPG, GF/G, GA/G)',
    'sec2-t2-tier': 'Stratum',
    'sec2-t2-n': 'Slots',
    'sec2-t2-cp': '1st PPG',
    'sec2-t2-rp': '2nd PPG',
    'sec2-t2-gf': '1st GF/G',
    'sec2-t2-ga': '1st GA/G',
    'sec3-kicker': '03 / Survival-Boundary Truncation, Cutoffs & Play-Off Stochasticity',
    'sec3-callout-title': 'Observed Relegation-Active Boundary Moments',
    'sec3-chart-title': 'Empirical Merit-Survival vs. Relegation-Ceiling Cutoffs Against Naive Heuristics',
    'sec3-scale-label': 'Projection:',
    's3-ppg': 'PPG (Cross-Stratum)',
    's3-46': '46g Linear Projection',
    's3-38': '38g Linear Projection',
    'leg3-safe': 'Lowest Merit Survivor',
    'leg3-rel': 'Highest Relegated Club',
    'leg3-40': '40/38g Heuristic (1.053 PPG)',
    'leg3-50': '50/46g Heuristic (1.087 PPG)',
    'sec3-t1-title': 'Relegation-Boundary Order Statistics by Stratum',
    'sec3-t1-sub': 'Observed official PPG on relegation-active slots (outcomeType reprieves strictly separated)',
    'sec3-t1-cap': 'Stratum-Level Merit Survivor vs. Highest Relegated PPG',
    'sec3-t1-tier': 'Stratum',
    'sec3-t1-n': 'Slots',
    'sec3-t1-msafe': 'Med. Safe PPG',
    'sec3-t1-lsafe': 'Min Safe PPG',
    'sec3-t1-hdrop': 'Max Drop PPG',
    'sec3-t1-club': 'Max-PPG Relegated Outlier',
    'sec3-t2-title': 'Automatic-Promotion Floor & All-Format Play-Off Seed Counts (T2–T4)',
    'sec3-t2-sub': 'Official last automatic-promotion PPG + all 1986–2026 English league play-off winners (4-team χ² matrix below)',
    'sec3-t2-cap': 'Auto-Promotion PPG Floor & Top/Bottom Seed Conversions',
    'sec3-t2-mauto': 'Med. Auto PPG',
    'sec3-t2-lauto': 'Min Auto PPG',
    'sec3-t2-po': 'Brackets',
    'sec3-t2-top': 'Top Seed',
    'sec3-t2-bot': 'Bottom Seed',
    'sec3-po-title': 'Empirical Play-Off Promotion Probability P(promo | seed_k) & Stratum Homogeneity (χ²)',
    'sec3-po-cap': 'Homogeneous 4-Team English League Play-Off Contingency Matrix (1988–89 Onward)',
    'sec3-po-tier': 'Stratum',
    'sec3-po-n': 'n',
    'sec3-po-s1': 'Seed 1',
    'sec3-po-s2': 'Seed 2',
    'sec3-po-s3': 'Seed 3',
    'sec3-po-s4': 'Seed 4',
    'sec3-po-t2': 'Seeds 1+2 (Home 2L)',
    'sec3-po-gap': 'Med. Δ(S1−S4)',
    'sec4-kicker': '04 / Stalemate-Maximizer Distribution & Co-Leader Non-Independence',
    'sec4-callout-title': 'Slot Draw-Leader Moments (Non-i.i.d.)',
    'sec4-c1-title': 'Empirical Finish-Percentile Quartile Capture of Slot Draw Leaders',
    'sec4-c1-sub': 'All argmax(D) club-seasons per slot (tied co-leaders retained; official finish percentiles)',
    'sec4-c2-title': 'Extreme Right-Tail Draw-Rate Outliers (D/G ≥ 14/38 ≈ 36.84%)',
    'sec4-c2-sub': '14+ D in 38g, 15+ in 40g, 16+ in 42g, or 17+ in 44g or 46g — top 20 sorted by D/G',
    'sec4-t-cap': 'High-Stalemate Tail Tuples (D/G ≥ 0.3684)',
    'sec4-th-s': 'Slot (Tier)',
    'sec4-th-d': 'D',
    'sec4-th-dp': 'D/G %',
    'sec5-kicker': '05 / Top-Scorer Goal-Share Concentration & Golden Boot Covariance',
    'sec5-callout-title': 'Verified PL Scorer Tensor (1992–2026)',
    'sec5-unavail-title': 'Missing-Not-At-Random Scorer Coverage Boundary (Zero-Imputation Refused)',
    'sec5-jump-btn': 'Filter to Verified PL Scorer Stratum (1992–93..2025–26)',
    'sec5-c1-title': 'Leading-Scorer Goal-Share Concentration vs. Official PPG (Top-4 Subsample)',
    'sec5-c1-sub': 'Verified Tier 1 PL Top-4 tuples (1992–93..2025–26; zero extrapolation to T2–T4)',
    'leg5-1': 'Champion (pos=1)',
    'leg5-2': 'Runner-Up (pos=2)',
    'leg5-34': 'pos ∈ {3, 4}',
    'leg5-gb': 'Ring = Golden Boot Incidence',
    'sec5-c2-title': 'Golden Boot Winner-Season Finish Histogram',
    'sec5-t-cap': 'PL Golden Boot Winner-Seasons vs. Champion Leading Scorer Ledger',
    'sec5-th-gb': 'Golden Boot Recipient(s)',
    'sec5-th-fin': 'Club Rank',
    'sec5-th-ch': 'Champion (Top Scorer)',
    'sec6-kicker': '06 / Interactive 180-Slot JSON-Serialized Panel Archive',
    'sec6-title': 'Full 180-Slot Historical Table Explorer (T1–T4, t ∈ [1981, 2025])',
    'sec6-tier-lbl': 'Stratum:',
    'sec6-season-lbl': 'Slot:',
    'sec6-disp-lbl': 'Projection:',
    'arc-raw': 'Raw Totals',
    'arc-pg': 'Per-Match Rate',
    'arc-38': '38g Linear Scale',
    'arc-th-ppg': 'PPG',
    'sec6-sc-cap': 'Slot Top-Scorer Vector',
    'sec6-sc-p38': 'G/38g',
    'sec7-kicker': '07 / Deterministic ETL Architecture, Audit Manifest & SHA-256 Spec',
    'sec7-title': 'Reproducible Ingestion Pipeline, Cross-Source Reconciliation & Formal Specification',
    'sec7-callout-title': 'Schema & Integrity Manifest',
  };

  function applyVoiceChrome() {
    const sicko = isSicko();
    if (typeof document === 'undefined') return;

    document.body?.classList.toggle('voice-sicko', sicko);
    document.querySelectorAll('[data-voice-mode]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.voiceMode === state.voiceMode ? 'true' : 'false');
    });

    const sickoCard = document.getElementById('sicko-hero-card');
    if (sickoCard) sickoCard.hidden = !sicko;

    document.querySelectorAll('[data-vk]').forEach((node) => {
      const key = node.dataset.vk;
      if (node.dataset.voiceNormal === undefined) {
        node.dataset.voiceNormal = node.textContent;
      }
      if (sicko && VOICE_CHROME[key] !== undefined) {
        node.textContent = VOICE_CHROME[key];
      } else {
        node.textContent = node.dataset.voiceNormal;
      }
    });

    const footerBrand = document.getElementById('footer-brand-line');
    if (footerBrand) {
      clearEl(footerBrand);
      if (sicko) {
        footerBrand.append(
          el('strong', { textContent: 'The Championship Formula (Statistics Sicko Mode)' }),
          ' — Unsmoothed panel-data audit of English Tiers 1–4 across t ∈ [1981–82, 2025–26] (completed slots only; strictly descriptive, zero causal identification or wagering priors).'
        );
      } else {
        footerBrand.append(
          el('strong', { textContent: 'The Championship Formula' }),
          ' — Plain-English study of English Tiers 1–4 across 1981–82 through 2025–26 (178 completed seasons plus the two curtailed 2019–20 tables; no forecasts or betting advice).'
        );
      }
    }
  }

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
      const res = await fetch('./data/england-tiers-1-4-1981-2026.json', { cache: 'no-store' });
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
    const sicko = isSicko();

    const metaCov = document.getElementById('meta-coverage');
    const metaMat = document.getElementById('meta-matches');
    const metaGoals = document.getElementById('meta-goals');
    const banner = document.getElementById('normalisation-banner');
    const activeBanner = document.getElementById('active-scope-banner');
    const sickoCap = document.getElementById('sicko-hero-caption');

    if (m.isEmpty) {
      if (metaCov) {
        metaCov.textContent = sicko
          ? (m.excludedCurtailedSlots?.length > 0
            ? `N_slots = 0 (${m.excludedCurtailedSlots.length} COVID-curtailed slots gated)`
            : 'N_slots = 0 (Empty Panel)')
          : (m.excludedCurtailedSlots?.length > 0
            ? `0 Active Tables (${m.excludedCurtailedSlots.length} Curtailed Excluded)`
            : '0 League Tables Selected');
      }
      if (metaMat) metaMat.textContent = '';
      if (metaGoals) metaGoals.textContent = '';
      if (sickoCap) {
        sickoCap.textContent = 'Fig. 0.0 — Analyst staring into an empty zero-row panel intersection (N_slots = 0). Expand slice predicates to resume ingest.';
      }
      if (activeBanner) {
        clearEl(activeBanner);
        if (m.excludedCurtailedSlots?.length > 0) {
          activeBanner.append(
            sicko
              ? `All ${m.excludedCurtailedSlots.length} matching tier-season ${plural(m.excludedCurtailedSlots.length, 'slot')} (${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' & ')}) are COVID-curtailed unweighted-PPG tables excluded by default. Toggle ingestion above or widen [t₀, t₁].`
              : `All ${m.excludedCurtailedSlots.length} matching ${plural(m.excludedCurtailedSlots.length, 'table')} (${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')}) were curtailed and excluded by default. Enable "Include Curtailed" above or broaden your filter.`
          );
        } else {
          activeBanner.append(sicko ? 'Empty slice: select ≥1 pyramid stratum ∈ {1..4} above.' : 'No league tables match this filter. Select at least one league tier above.');
        }
      }
      return;
    }

    if (metaCov) {
      metaCov.textContent = sicko
        ? `t ∈ [${m.firstSeason}, ${m.lastSeason}] · N_slots = ${m.numSlots} Tier-${plural(m.numSlots, 'Season')} (N_obs = ${fmtInt(m.allTeams.length)} Team-${plural(m.allTeams.length, 'Season')})`
        : `${m.firstSeason} to ${m.lastSeason} · ${m.numSlots} League ${plural(m.numSlots, 'Table')} (${fmtInt(m.allTeams.length)} Team ${plural(m.allTeams.length, 'Season')})`;
    }
    if (metaMat) metaMat.textContent = sicko ? `∑Matches = ${fmtInt(m.totalMatches)}` : `${fmtInt(m.totalMatches)} Matches`;
    if (metaGoals) metaGoals.textContent = sicko ? `∑Goals = ${fmtInt(m.totalGoals)}` : `${fmtInt(m.totalGoals)} Goals`;
    if (sickoCap) {
      sickoCap.textContent = `Fig. 0.0 — Unsupervised empirical sicko inspecting ${m.numSlots} unsmoothed CSV-reconciled tier-season slots (${fmtInt(m.allTeams.length)} rows, ${fmtInt(m.totalMatches)} matches; schema v${ds.schemaVersion}; strictly non-causal).`;
    }

    if (banner) {
      clearEl(banner);
      if (sicko) {
        banner.append(
          el('strong', { textContent: 'Specification & Normalization Invariant: ' }),
          `Canonical ${ds.metadata.totalTierSeasonSlots}-slot JSON panel (${fmtInt(ds.metadata.totalTeamSeasons)} Team-Seasons, ${fmtInt(ds.metadata.totalMatchesPlayed)} matches; schemaVersion ${ds.schemaVersion}) covering Tiers 1–4 across the 3-point affine payoff regime (1981–82..2025–26; Lucas-critique exclusion of pre-1981 2-pt tables and right-censored 2026/27 fixtures). Because schedule lengths vary across G ∈ {38g, 40g, 42g, 44g, 46g} and league cardinality across K ∈ [20, 24], all regressors are vectorized per match (W/G, D/G, GF/G, GA/G, GD/G, PPG) and standings projected onto normalized finish score y = 1 − (pos − 1)/(K − 1) ∈ [0, 1].`
        );
      } else {
        banner.append(
          el('strong', { textContent: 'How the numbers stay fair: ' }),
          `This study covers all ${ds.metadata.totalTierSeasonSlots} completed and curtailed league tables (${fmtInt(ds.metadata.totalTeamSeasons)} team seasons, ${fmtInt(ds.metadata.totalMatchesPlayed)} matches) across Tiers 1–4 from 1981–82—when three points for a win arrived—through 2025–26. Completed seasons run anywhere from 38 to 46 matches and divisions hold 20 to 24 clubs; the two curtailed 2019–20 tables ended early after 34–37 games. We measure stats per game and place every finish on a clean 0-to-1 scale (1 = first, 0 = last). Unfinished seasons after 2025–26 are left out. The filters above narrow every figure on this page; the Showing line always lists the slice in use.`
        );
      }
    }

    if (activeBanner) {
      clearEl(activeBanner);
      const tierStr = m.tiersPresent.map((t) => (sicko ? `T${t}` : `Tier ${t}`)).join(', ');
      const basisLabel = sicko
        ? (state.scope.pointsMode === 'raw'
          ? 'Counterfactual Raw 3W+D Vector (recomputes Section 1 within-slot |r|, pooled R²(PPG), scatter & archive points; official pos/titles/relegations/Cards 03–06 held invariant)'
          : 'Observed Official Table Points (inclusive of net administrative point adjustments)')
        : (state.scope.pointsMode === 'raw'
          ? 'On-pitch points before deductions (updates Section 1 correlations and scatter; titles, promotions, relegations and Cards 03–06 stay on official tables)'
          : 'Official league tables (including deductions)');
      const frag = document.createDocumentFragment();
      frag.append(
        el('strong', { textContent: sicko ? 'Active Slice: ' : 'Showing: ' }),
        sicko
          ? `Strata {${tierStr}} · [${m.firstSeason}, ${m.lastSeason}] (N_slots = ${m.numSlots}, N_obs = ${fmtInt(m.allTeams.length)}) · Target Vector: ${basisLabel}. `
          : `${tierStr} · ${m.firstSeason} to ${m.lastSeason} (${m.numSlots} ${plural(m.numSlots, 'table')}, ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')}) · Points: ${basisLabel}. `
      );
      if (m.excludedCurtailedSlots.length > 0) {
        frag.append(
          el('strong', { textContent: sicko ? 'Gated by Default: ' : 'Excluded by default: ' }),
          sicko
            ? `${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' & ')} (COVID-truncated at 34–37g; ranked via unweighted PPG; Bury FC expelled). Toggle ingestion above to append n=+${m.excludedCurtailedSlots.length}.`
            : `${m.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')} (ended early by COVID-19 after 34–37 games and decided on points per game; Bury were expelled from League One). Tick the box above to include them.`
        );
      } else if (m.includedCurtailedSlots.length > 0) {
        frag.append(
          el('strong', { textContent: sicko ? 'Curtailed Slots Ingested: ' : 'Curtailed Included: ' }),
          sicko
            ? `${m.includedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' & ')} (unweighted-PPG curtailed truncation active).`
            : `${m.includedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' & ')} (decided on points per game).`
        );
      }
      activeBanner.appendChild(frag);
    }
  }

  function buildLedgerViewSicko(m, scope) {
    const activeScope = scope || m?.scope || state.scope;
    const isRaw = (activeScope?.pointsMode || m?.scope?.pointsMode) === 'raw';
    if (!m || m.isEmpty) {
      const curtExcl = m?.excludedCurtailedSlots?.length ?? 0;
      const note = curtExcl > 0
        ? `N_slots = 0 (${curtExcl} COVID-curtailed ${plural(curtExcl, 'slot')} gated by default)`
        : 'N_slots = 0 (empty slice)';
      return { isEmpty: true, note, cards: [] };
    }

    const note = isRaw
      ? `N_slots = ${m.numSlots} Tier-${plural(m.numSlots, 'Season')} · N_obs = ${fmtInt(m.allTeams.length)} Team-${plural(m.allTeams.length, 'Season')} (Cards 01–02: counterfactual raw 3W+D; Cards 03–06: official standings invariant)`
      : `N_slots = ${m.numSlots} Tier-${plural(m.numSlots, 'Season')} · N_obs = ${fmtInt(m.allTeams.length)} Team-${plural(m.allTeams.length, 'Season')} (observed official standings)`;

    const drawPred = m.correlations.find((c) => c.key === 'drawRate');
    const winPred = m.correlations.find((c) => c.key === 'winRate');
    const gdPred = m.correlations.find((c) => c.key === 'gdPerGame');
    const atkDef = describeAtkVsDef(m);
    const smallSample = m.numSlots < 3;
    const drawSlotVals = drawPred?.slotValues ?? [];
    const drawNeg = drawSlotVals.filter((sv) => sv.rFinish < 0).length;
    const drawPos = drawSlotVals.filter((sv) => sv.rFinish > 0).length;
    const ss = m.survivalStats;
    const noRel = m.noRelegationSlots || [];
    const dl = m.drawLeaderStats;
    const dlMidPct = dl.count > 0 ? (dl.middleHalfCount / dl.count) * 100 : 0;
    const avail = m.scorerAnalysis.availableSlotsCount ?? 0;
    const withGb = m.scorerAnalysis.champWithGbCount ?? 0;
    const unavail = m.scorerAnalysis.unavailableSlotsCount ?? 0;
    const gbCount = (m.scorerAnalysis.gbInstances || []).length;

    const cards = [
      {
        idx: '01 · Within-Slot |r| Hierarchy',
        stat: smallSample ? `n = ${m.numSlots}` : fmtNum(winPred?.medianAbsRFinish, 3),
        claim: smallSample
          ? `Cross-slot median |r| suppressed (n = ${m.numSlots} < 3)${isRaw ? ' [raw 3W+D]' : ''}`
          : `W/G & GD/G dominate via algebraic collinearity; D/G ranks dead last${isRaw ? ' [raw 3W+D]' : ''}`,
        detail: smallSample
          ? `Insufficient panel depth (n = ${m.numSlots} < 3) for robust within-slot median(|r|) estimation.`
          : `Across ${m.numSlots} within-slot demeaned regressions onto normalized finish y ∈ [0,1], median |r| = ${fmtNum(winPred?.medianAbsRFinish, 3)} (W/G; affine PPG = 3·W/G + D/G identity), ${fmtNum(gdPred?.medianAbsRFinish, 3)} (GD/G), vs ${fmtNum(drawPred?.medianAbsRFinish, 3)} (D/G; signed median r = ${fmtSigned(drawPred?.medianRFinish, 3)}, negative in ${drawNeg}/${drawSlotVals.length} slots, positive in ${drawPos}).`,
      },
      {
        idx: '02 · Attack / Defence Aggregation Flip',
        stat: smallSample ? `n = ${m.numSlots}` : `${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}`,
        claim: smallSample
          ? `Dual-metric GA/G vs GF/G decomposition suppressed (n < 3)`
          : atkDef.diverges
            ? `Within-slot |r| favors ${atkDef.withinLeader === 'ga' ? 'GA/G' : 'GF/G'}; pooled OLS R²(PPG) flips to ${atkDef.pooledLeader === 'gf' ? 'GF/G' : 'GA/G'}`
            : `Within-slot |r| (${atkDef.withinLeader}) vs pooled R²(PPG) (${atkDef.pooledLeader})${isRaw ? ' [raw 3W+D]' : ''}`,
        detail: smallSample
          ? `Expand slice to ≥3 slots to compare within-slot median(|r|) against stacked cross-sectional OLS R²(PPG).`
          : `Within-slot demeaned |r_finish|: GA/G = ${fmtNum(atkDef.gaWithin, 3)} vs GF/G = ${fmtNum(atkDef.gfWithin, 3)} (GA/G beats GF/G in ${m.withinSlot.gaBeatsGfCount}/${m.withinSlot.comparableGfGaSlots} slots). Stacked cross-sectional OLS R²(PPG): GF/G = ${fmtNum(atkDef.gfR2 * 100, 1)}% vs GA/G = ${fmtNum(atkDef.gaR2 * 100, 1)}% — non-orthogonal, collinear variance projections; zero causal identifiability.`,
      },
      {
        idx: '03 · Upper-Tail Champion Manifold',
        stat: smallSample
          ? (m.champs[0] ? `${fmtNum(m.champs[0].officialPpg, 2)} PPG` : 'N/A')
          : `${fmtNum(m.champStats.ppg?.median, 2)} PPG`,
        claim: `${m.champFewerWinsCases.length}/${m.champs.length} champions violated argmax(W) monotonicity [official]`,
        detail: smallSample
          ? `Observed champions: ${m.champs.map((c) => `${c.team} ${c.season} T${c.tier} (${fmtNum(c.officialPpg, 2)} official PPG)`).join('; ')}.`
          : `Champion median = ${fmtNum(m.champStats.ppg?.median, 2)} official PPG, interpolated IQR [${fmtNum(m.champStats.ppg?.q1, 2)}, ${fmtNum(m.champStats.ppg?.q3, 2)}] (vs pos=2 median ${fmtNum(m.runnerStats.ppg?.median, 2)} PPG). In ${m.champFewerWinsCases.length} slots, argmax_i(3W_i + D_i) ≠ argmax_i(W_i).`,
      },
      {
        idx: '04 · Relegation Truncation Floor',
        stat: ss.slotCount === 0
          ? '0 Rel. Slots'
          : `${fmtNum(ss.slotCount < 3 ? m.survivalSeries[0]?.survivingPpg : ss.survivingPpg?.median, 3)} PPG`,
        claim: ss.slotCount === 0
          ? `${noRel.length} non-relegating ${plural(noRel.length, 'slot')} (0 relegation-active)`
          : `${ss.slotCount} relegation-active ${plural(ss.slotCount, 'slot')}${noRel.length > 0 ? ` (${noRel.length} non-relegating excluded)` : ''}`,
        detail: ss.slotCount === 0
          ? `No left-tail truncation boundary exists in this slice (${noRel.length} slots lacked automatic relegation via re-election, expansion, withdrawal, or reprieve).`
          : `Median lowest merit survivor = ${fmtNum(ss.survivingPpg?.median, 3)} official PPG (${fmtNum(ss.survivingPts38?.median, 1)}/38g; ${fmtNum(ss.survivingPts46?.median, 1)}/46g); relegated clubs hit ≥1.053 PPG (40/38g) in ${ss.relegatedAtOrAbove40Over38Rate.length}/${ss.slotCount} slots. Typed outcomeType guards exclude reprieved/expelled boundary rows.`,
      },
      {
        idx: '05 · Stalemate-Leader Quantile Capture',
        stat: smallSample ? `n = ${dl.count}` : `${fmtNum(dlMidPct, 0)}% IQR`,
        claim: `${dl.middleHalfCount}/${dl.count} argmax(D) tuples landed in [25%, 75%] finish-pct (${dl.championCount} title)`,
        detail: `Across ${dl.count} division draw-leader team-seasons (${dl.coLeaderSlotsCount} tied co-leader slots violate i.i.d. independence), median finish percentile = ${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}% (${ordinal(dl.pos?.median)} raw rank); ${dl.relegatedCount} relegated, ${dl.promotedCount} promoted, ${dl.championCount} title.`,
      },
      {
        idx: '06 · Golden Boot Covariance (Verified Strata)',
        stat: m.scorerAnalysis.status === 'unavailable' ? 'MNAR / N/A' : `${withGb} / ${avail}`,
        claim: m.scorerAnalysis.status === 'unavailable'
          ? `Zero-imputation boundary: 0 verified scorer slots in slice`
          : `${withGb}/${avail} PL champions (${fmtNum((withGb / Math.max(1, avail)) * 100, 1)}%) housed Golden Boot (${gbCount} winner-seasons)`,
        detail: m.scorerAnalysis.status === 'unavailable'
          ? 'Verified Golden Boot + club top-scorer vectors exist exclusively for Tier 1 PL (1992–93..2025–26). Pre-1992 T1 & T2–T4 are strictly non-imputed.'
          : `Verified PL 1992–2026 subsample (${avail} slots; ${unavail} unverified slots explicitly gated rather than zero-filled): r_pb(GB, Champion) = ${fmtSigned(m.scorerAnalysis.shareStats?.rGbChampAll, 3)}; Top-4 concentration r(share, PPG) = ${fmtSigned(m.scorerAnalysis.shareStats?.rSharePpgTop4, 3)}.`,
      },
    ];

    return { isEmpty: false, note, cards };
  }

  function buildLedgerView(m, scope, voiceMode) {
    if (isSicko(voiceMode)) return buildLedgerViewSicko(m, scope);
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
    const expansionSlots = noRel.filter((x) => !x.reElectionEra && x.expansionRestructure);
    const withdrewSlots = noRel.filter((x) => !x.reElectionEra && !x.expansionRestructure && (x.excludedOutcomeTypes || []).includes('withdrew'));
    const reprieveNoRelSlots = noRel.filter((x) => !x.reElectionEra && !x.expansionRestructure && !(x.excludedOutcomeTypes || []).includes('withdrew') && (x.excludedOutcomeTypes || []).includes('reprieved'));
    const otherNoRelSlots = noRel.filter((x) => !x.reElectionEra && !x.expansionRestructure && !(x.excludedOutcomeTypes || []).includes('withdrew') && !(x.excludedOutcomeTypes || []).includes('reprieved'));

    const noRelReasons = [];
    if (reElecSlots.length > 0) noRelReasons.push(`${reElecSlots.length} Fourth Division re-election ${plural(reElecSlots.length, 'season')} where automatic relegation was not in place`);
    if (expansionSlots.length > 0) noRelReasons.push(`${expansionSlots.length} after Football League expansion or restructuring`);
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
    let scorerDetail = 'Verified Golden Boot and club scorer tables cover the Premier League (1992–93 to 2025–26) only; widen your filter to inspect them.';
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

  function buildTakeawaysViewSicko(m, scope) {
    const activeScope = scope || m?.scope || state.scope;
    const isRaw = (activeScope?.pointsMode || m?.scope?.pointsMode) === 'raw';
    if (!m || m.isEmpty) {
      return { isEmpty: true, note: '', bullets: [] };
    }

    const note = `t ∈ [${m.firstSeason}, ${m.lastSeason}] · N_slots = ${m.numSlots}${isRaw ? ' (within-slot |r| on counterfactual 3W+D; outcomes official)' : ' (observed official standings)'}`;
    const bullets = [];
    const hasSlot = (id) => m.slots.some((s) => s.slotId === id);

    if (m.numSlots < 3) {
      const champList = m.champs.map((c) => `${c.team} (${c.season} T${c.tier}, ${c.points} pts, ${fmtNum(c.officialPpg, 3)} PPG)`).join('; ');
      bullets.push({
        lead: `Small-sample estimator suppression (N_slots = ${m.numSlots} < 3).`,
        body: `Cross-slot median(|r|) and quantile spreads are gated below n=3. Observed pos=1 tuples: ${champList}.`,
      });
      if (m.survivalSeries.length > 0) {
        const cutList = m.survivalSeries.map((s) => `${s.season} T${s.tier}: lowest merit survivor ${s.survivingTeam} (${fmtNum(s.survivingPpg, 3)} PPG) vs max relegated ${s.relegatedTeam} (${fmtNum(s.relegatedHighPpg, 3)} PPG)`).join('; ');
        bullets.push({ lead: 'Truncation boundary tuples.', body: `${cutList}.` });
      }
      return { isEmpty: false, note, bullets };
    }

    // 1. argmax(W) non-monotonicity
    if (m.champFewerWinsCases.length > 0) {
      const firstCase = m.champFewerWinsCases[0];
      const lastCase = m.champFewerWinsCases[m.champFewerWinsCases.length - 1];
      const fmtCase = (c) => {
        const rival = c.winLeaders[0];
        const rivalPart = rival ? ` vs pos=${rival.pos} ${rival.team} (${rival.won}W)` : '';
        return `${c.champion.team} ${c.season} T${c.tier} (${c.champion.won}W+${c.champion.drawn}D=${c.champion.points} pts${rivalPart})`;
      };
      const ex = m.champFewerWinsCases.length === 1 ? fmtCase(firstCase) : `${fmtCase(firstCase)} through ${fmtCase(lastCase)}`;
      bullets.push({
        lead: 'Non-monotonicity of argmax(W) under the 3W+D affine payoff matrix.',
        body: `In ${m.champFewerWinsCases.length}/${m.champs.length} title manifolds (exclusively T2–T4), argmax_i(3W_i + D_i) ≠ argmax_i(W_i)—spanning ${ex}.`,
      });
    } else {
      const latest = m.champs.slice().sort((a, b) => b.startYear - a.startYear)[0];
      bullets.push({
        lead: 'Zero argmax(W) inversions observed in this slice.',
        body: `Every pos=1 tuple weakly dominated the field in raw win count (latest: ${latest.team} ${latest.season}, ${latest.won}W, ${fmtNum(latest.officialPpg, 3)} PPG).`,
      });
    }

    // 2. Survival truncation
    const ss = m.survivalStats;
    const pl38 = m.survivalSeries.filter((x) => x.tier === 1 && x.startYear >= 1995 && x.gamesPerTeam === 38);
    if (ss.slotCount === 0) {
      bullets.push({
        lead: 'Zero relegation-active truncation boundaries in slice.',
        body: `All ${m.noRelegationSlots.length} selected slots lacked automatic relegation (re-election, expansion, withdrawal, or ground-grading reprieve).`,
      });
    } else if (m.tiersPresent.length === 1 && m.tiersPresent[0] === 1 && pl38.length >= 3) {
      const under40 = pl38.filter((x) => x.survivingPts < 40).length;
      const rel40 = pl38.filter((x) => x.relegatedPts >= 40).length;
      bullets.push({
        lead: 'Empirical CDF on 38g Premier League slots falsifies the naive 40-point heuristic.',
        body: `Across n=${pl38.length} homogeneous 38g PL slots, P(Pts_17th < 40) = ${under40}/${pl38.length} (${fmtNum((under40 / pl38.length) * 100, 1)}%), while P(Pts_18th ≥ 40) = ${rel40}/${pl38.length}.`,
      });
    } else {
      const rel40Count = ss.relegatedAtOrAbove40Over38Rate.length;
      const rel40Pct = (rel40Count / ss.slotCount) * 100;
      const pl38Tail = pl38.length >= 3
        ? ` Conversely, in the n=${pl38.length} 38g PL sub-panel, 17th stayed safe below 40 pts in ${pl38.filter((x) => x.survivingPts < 40).length}/${pl38.length} slots (${fmtNum((pl38.filter((x) => x.survivingPts < 40).length / pl38.length) * 100, 1)}%).`
        : '';
      bullets.push({
        lead: 'Cross-stratum truncation non-stationarity breaks the 1.053 PPG (40/38g) heuristic.',
        body: `Across ${ss.slotCount} relegation-active slots, ≥1 relegated club exceeded 1.053 PPG in ${rel40Count} slots (${fmtNum(rel40Pct, 1)}%); median merit survival floor = ${fmtNum(ss.survivingPpg?.median, 3)} PPG (${fmtNum(ss.survivingPts46?.median, 1)}/46g).${pl38Tail}`,
      });
    }

    // 3. Attack vs defence aggregation reversal
    const atkDef = describeAtkVsDef(m);
    const basisTag = isRaw ? ' [counterfactual raw 3W+D]' : '';
    bullets.push({
      lead: atkDef.diverges
        ? 'Aggregation-operator reversal between within-slot demeaned |r| and stacked OLS R²(PPG).'
        : 'Bivariate attack vs. defence comparison across within-slot |r| and pooled R²(PPG).',
      body: `Within-slot demeaned |r_finish|${basisTag}: GA/G = ${fmtNum(atkDef.gaWithin, 3)} vs GF/G = ${fmtNum(atkDef.gfWithin, 3)} (GA/G wins ${m.withinSlot.gaBeatsGfCount}/${m.withinSlot.comparableGfGaSlots} slots); stacked cross-sectional OLS R²(PPG): GF/G = ${fmtNum(atkDef.gfR2 * 100, 1)}% vs GA/G = ${fmtNum(atkDef.gaR2 * 100, 1)}% — non-orthogonal variance projections, NOT causal marginal effects.`,
    });

    // 4. Stalemate kurtosis
    const dl = m.drawLeaderStats;
    const dlMidPct = dl.count > 0 ? (dl.middleHalfCount / dl.count) * 100 : 0;
    const dl25T1 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T1');
    const dl25T3 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T3');
    const dl25Clause = dl25T1 && dl25T3
      ? ` High-leverage 2025–26 residuals: ${dl25T1.team} (${dl25T1.drawn}D, pos=${dl25T1.officialPos}) & ${dl25T3.team} (${dl25T3.drawn}D, promoted).`
      : dl25T1
        ? ` High-leverage 2025–26 residual: ${dl25T1.team} (${dl25T1.drawn}D, pos=${dl25T1.officialPos}).`
        : '';
    bullets.push({
      lead: 'Leptokurtic mid-distribution capture of argmax(D) tuples—with fat-tail outliers.',
      body: `${fmtNum(dlMidPct, 0)}% (${dl.middleHalfCount}/${dl.count}) of division draw leaders landed inside the [25%, 75%] finish-percentile IQR (${dl.coLeaderSlotsCount} tied co-leader slots violate i.i.d. sampling), ${dl.relegatedCount} suffered relegation, and ${dl.championCount} won a title.${dl25Clause}`,
    });

    // 5. Golden Boot covariance
    const sa = m.scorerAnalysis;
    if (sa.status !== 'unavailable' && sa.availableSlotsCount >= 3) {
      const has25T1 = hasSlot('2025-26-T1');
      bullets.push({
        lead: 'Weak bivariate point-biserial covariance between Golden Boot incidence and I(pos=1).',
        body: `Verified PL strata only (n=${sa.availableSlotsCount}; zero-imputation strictly refused on unverified slots): ${sa.champWithGbCount}/${sa.availableSlotsCount} (${fmtNum((sa.champWithGbCount / sa.availableSlotsCount) * 100, 0)}%) champions fielded the Golden Boot winner (r_pb = ${fmtSigned(sa.shareStats?.rGbChampAll, 3)}), with lower median top-scorer concentration (${fmtNum(sa.shareStats.champ?.median, 1)}% vs ${fmtNum(sa.shareStats.thirdFourth?.median, 1)}% in pos ∈ {3,4}).${has25T1 ? ' In 2025–26, Arsenal’s Gyökeres logged 14G vs Haaland’s 27G.' : ''}`,
      });
    }

    // 6. Play-off χ² stochasticity + administrative deductions
    const ds = m.deductionSensitivity;
    const pb = m.playoffSeedBreakdown;
    if (m.byTierPromotion.length > 0 && pb && pb.overall.total >= 3) {
      const ov = pb.overall;
      const [s1, s2, s3, s4] = ov.seeds;
      const chiStr = typeof pb.chi2TierContingency === 'number'
        ? ` (stratum×seed homogeneity χ²(${pb.chi2TierDf}) = ${fmtNum(pb.chi2TierContingency, 2)}, well within noise)`
        : '';
      const dedStr = ds.relegatedDueToDeductionCount > 0
        ? ` Separately, ${ds.relegatedDueToDeductionCount} clubs flipped relegation status under administrative deductions vs raw 3W+D${hasSlot('2025-26-T2') ? ' (including 2025–26 Leicester −6 & Sheffield Wednesday −18 → 0 official pts).' : '.'}`
        : '';
      bullets.push({
        lead: 'Single-elimination play-off variance swamps 46g regular-season priors across every EFL stratum.',
        body: `Across n=${ov.total} homogeneous 4-team brackets since 1988–89: P(promo | seed_1..4) = ${fmtNum(s1.pct, 1)}% / ${fmtNum(s2.pct, 1)}% / ${fmtNum(s3.pct, 1)}% / ${fmtNum(s4.pct, 1)}% (uniform χ²(3) = ${fmtNum(ov.chi2Uniform, 2)}; seeds 2–4 flat at χ²(2) = ${fmtNum(ov.chi2Seeds2to4, 2)}; home-2nd-leg composite = ${fmtNum(ov.topTwoPct, 1)}%)${chiStr}.${dedStr}`,
      });
    } else if (ds.relegatedDueToDeductionCount > 0) {
      bullets.push({
        lead: 'Administrative point deductions perturb relegation boundaries without shifting aggregate rank links.',
        body: `${ds.affectedRowsCount} club-seasons carry non-zero signedAdjustment; ${ds.relegatedDueToDeductionCount} suffered counterfactual relegation flips relative to raw 3W+D.`,
      });
    }

    return { isEmpty: false, note, bullets };
  }

  function buildTakeawaysView(m, scope, voiceMode) {
    if (isSicko(voiceMode)) return buildTakeawaysViewSicko(m, scope);
    const activeScope = scope || m?.scope || state.scope;
    const isRaw = (activeScope?.pointsMode || m?.scope?.pointsMode) === 'raw';
    if (!m || m.isEmpty) {
      return { isEmpty: true, note: '', bullets: [] };
    }

    const note = `${m.firstSeason} to ${m.lastSeason} · ${m.numSlots} ${plural(m.numSlots, 'table')}${isRaw ? ' (rank links on raw 3W+D points; outcomes official)' : ''}`;
    const bullets = [];
    const hasSlot = (id) => m.slots.some((s) => s.slotId === id);

    if (m.numSlots < 3) {
      const champList = m.champs.map((c) => `${c.team} (${c.season} Tier ${c.tier}, ${c.points} pts)`).join('; ');
      bullets.push({
        lead: `Small-sample snapshot (${m.numSlots} ${plural(m.numSlots, 'table')}).`,
        body: `Cross-season averages are suppressed below three tables. Official ${plural(m.champs.length, 'champion')}: ${champList}.`,
      });
      if (m.survivalSeries.length > 0) {
        const cutList = m.survivalSeries.map((s) => `${s.season} Tier ${s.tier}: ${s.survivingTeam} stayed up on ${s.survivingPts} pts while ${s.relegatedTeam} went down on ${s.relegatedHighPts}`).join('; ');
        bullets.push({ lead: 'Relegation boundary.', body: `${cutList}.` });
      } else if (m.noRelegationSlots.length > 0) {
        const allReElec = m.noRelegationSlots.every((x) => x.reElectionEra);
        bullets.push({
          lead: allReElec ? 'No automatic relegation here.' : 'No relegation here.',
          body: allReElec
            ? 'Automatic relegation was not in place in these Fourth Division re-election seasons; bottom clubs faced re-election.'
            : 'None of the selected tables had automatic relegation.',
        });
      }
      if (m.deductionSensitivity.affectedRowsCount > 0) {
        bullets.push({
          lead: 'Points deductions.',
          body: `${m.deductionSensitivity.affectedRowsCount} team ${plural(m.deductionSensitivity.affectedRowsCount, 'season')} here had points adjustments (${m.deductionSensitivity.relegatedDueToDeductionCount} relegated despite finishing safe on pitch points).`,
        });
      }
      return { isEmpty: false, note, bullets };
    }

    // 1. Fewer-wins champions (or top-flight win dominance + era climb)
    if (m.champFewerWinsCases.length > 0) {
      const firstCase = m.champFewerWinsCases[0];
      const lastCase = m.champFewerWinsCases[m.champFewerWinsCases.length - 1];
      const fmtCase = (c) => {
        const rival = c.winLeaders[0];
        const rivalPart = rival ? ` vs ${ordinal(rival.pos)}-placed ${rival.team}’s ${rival.won}` : '';
        return `${c.champion.team} in ${c.season} ${c.historicalDivisionName} (${c.champion.won} wins${rivalPart})`;
      };
      const examples = m.champFewerWinsCases.length === 1
        ? `—${fmtCase(firstCase)}`
        : `—from ${fmtCase(firstCase)} to ${fmtCase(lastCase)}`;
      bullets.push({
        lead: 'You do not have to win the most matches to win the league.',
        body: `In ${m.champFewerWinsCases.length} of ${m.champs.length} title races (all in Tiers 2–4), the champion won fewer games than a rival${examples}.`,
      });
    } else {
      const latestChamp = m.champs.slice().sort((a, b) => b.startYear - a.startYear)[0];
      const firstEra = m.eraSplits[0];
      const lastEra = m.eraSplits[m.eraSplits.length - 1];
      const eraClause = firstEra && lastEra && firstEra.id !== lastEra.id
        ? ` Champion pace also climbed from ${fmtNum(firstEra.champPpg, 2)} points a game in ${firstEra.years} to ${fmtNum(lastEra.champPpg, 2)} in ${lastEra.years}.`
        : '';
      bullets.push({
        lead: 'Every champion here at least matched the field for wins.',
        body: `No title winner in this selection trailed a rival in matches won—most recently ${latestChamp.team} (${latestChamp.won} wins, ${latestChamp.points} points in ${latestChamp.season}).${eraClause}`,
      });
    }

    // 2. Survival myth (40-point rule vs reality across tiers & PL 38-game baseline)
    const ss = m.survivalStats;
    const pl38 = m.survivalSeries.filter((x) => x.tier === 1 && x.startYear >= 1995 && x.gamesPerTeam === 38);
    if (ss.slotCount === 0) {
      const allReElec = m.noRelegationSlots.every((x) => x.reElectionEra);
      bullets.push({
        lead: allReElec ? 'Automatic relegation did not yet exist here.' : 'None of these tables had relegation.',
        body: allReElec
          ? `Across all ${m.noRelegationSlots.length} selected Fourth Division re-election seasons, bottom clubs faced re-election rather than automatic relegation.`
          : `All ${m.noRelegationSlots.length} selected tables finished with zero clubs relegated.`,
      });
    } else if (m.tiersPresent.length === 1 && m.tiersPresent[0] === 1 && pl38.length >= 3) {
      const under40 = pl38.filter((x) => x.survivingPts < 40).length;
      const rel40 = pl38.filter((x) => x.relegatedPts >= 40).length;
      const s25T1 = m.survivalSeries.find((x) => x.slotId === '2025-26-T1');
      const s25Tail = s25T1
        ? ` Even so, ${s25T1.season} came close: ${s25T1.relegatedTeam} went down on ${s25T1.relegatedHighPts} points while ${s25T1.survivingTeam} survived on ${s25T1.survivingPts}.`
        : '';
      bullets.push({
        lead: 'The famous “40 points for safety” rule is usually higher than Premier League clubs need.',
        body: `In ${pl38.length} 38-game Premier League seasons, 17th place stayed up below 40 points ${under40} times (${fmtNum((under40 / pl38.length) * 100, 1)}%), and only ${rel40} of ${pl38.length} saw a club go down on 40 or more.${s25Tail}`,
      });
    } else {
      const rel40Count = ss.relegatedAtOrAbove40Over38Rate.length;
      const rel40Pct = (rel40Count / ss.slotCount) * 100;
      const pl38Tail = pl38.length >= 3
        ? ` By contrast, in the ${pl38.length} 38-game Premier League seasons, 17th place stayed safe below 40 points ${pl38.filter((x) => x.survivingPts < 40).length} times (${fmtNum((pl38.filter((x) => x.survivingPts < 40).length / pl38.length) * 100, 1)}%).`
        : '';
      bullets.push({
        lead: rel40Pct >= 20
          ? 'The “40 points for safety” rule breaks down outside the top flight.'
          : 'Safety lines shift sharply from division to division.',
        body: `Across ${ss.slotCount} tables with relegation, a relegated club reached 40-in-38 pace (1.053 points a game) in ${rel40Count} tables (${fmtNum(rel40Pct, 1)}%), while the median lowest survivor earned ${fmtNum(ss.survivingPpg?.median, 3)}.${pl38Tail}`,
      });
    }

    // 3. Attack vs. defence flips by measurement
    const atkDef = describeAtkVsDef(m);
    const rawBasisTag = isRaw ? ' on raw 3W+D points' : '';
    if (atkDef.diverges) {
      bullets.push({
        lead: 'Attack vs. defence has no single winner—it flips depending on how you measure it.',
        body: `Inside individual tables${rawBasisTag}, ${atkDef.withinLeader === 'ga' ? 'conceding edges scoring' : 'scoring edges conceding'} (${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}, leading ${atkDef.withinLeader === 'ga' ? m.withinSlot.gaBeatsGfCount : m.withinSlot.gfBeatsGaCount} of ${m.withinSlot.comparableGfGaSlots} tables); pooled across clubs, ${atkDef.pooledLeader === 'gf' ? 'scoring' : 'conceding'} tracks more points-per-game variation (${fmtNum(atkDef.gfR2 * 100, 1)}% vs ${fmtNum(atkDef.gaR2 * 100, 1)}%, overlapping descriptive links).`,
      });
    } else if (atkDef.withinLeader === 'near-tie' || atkDef.withinLeader === 'tie') {
      bullets.push({
        lead: 'Attack and defence are nearly dead level on table rank.',
        body: `Within a table${rawBasisTag}, conceding and scoring sit at ${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)}, while pooled across clubs they track ${fmtNum(atkDef.gfR2 * 100, 1)}% (scoring) and ${fmtNum(atkDef.gaR2 * 100, 1)}% (conceding) of points-per-game variation.`,
      });
    } else {
      const winner = atkDef.withinLeader === 'ga' ? 'Defence' : 'Scoring';
      bullets.push({
        lead: `${winner} edges both measures here, though by a modest margin.`,
        body: `Inside individual tables${rawBasisTag}, conceding sits at ${fmtNum(atkDef.gaWithin, 3)} vs ${fmtNum(atkDef.gfWithin, 3)} for scoring, and pooled across clubs scoring tracks ${fmtNum(atkDef.gfR2 * 100, 1)}% of points-per-game variation vs ${fmtNum(atkDef.gaR2 * 100, 1)}% for conceding.`,
      });
    }

    // 4. Draws as a mid-table trap — with wild exceptions
    const dl = m.drawLeaderStats;
    const dlMidPct = dl.count > 0 ? (dl.middleHalfCount / dl.count) * 100 : 0;
    const dlChampNames = (dl.championCampaigns || []).map((c) => `${c.team} in ${c.season}`).join('; ');
    const dl25T1 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T1');
    const dl25T3 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T3');
    const dl25T2 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T2');
    let dl25Example = '';
    if (dl25T1 && dl25T3) {
      dl25Example = ` Yet 2025–26 showed both extremes: Premier League draw leaders ${dl25T1.team} (${dl25T1.drawn} draws) still finished ${ordinal(dl25T1.officialPos)}, while League One draw leaders ${dl25T3.team} (${dl25T3.drawn} draws) won promotion.`;
    } else if (dl25T1) {
      dl25Example = ` Yet in 2025–26, ${dl25T1.team} led the Premier League with ${dl25T1.drawn} draws and still finished ${ordinal(dl25T1.officialPos)}.`;
    } else if (dl25T2 && dl25T3) {
      dl25Example = ` In 2025–26, Championship draw leaders ${dl25T2.team} went down while League One draw leaders ${dl25T3.team} won promotion.`;
    }
    bullets.push({
      lead: 'Leading the league in draws usually pulls clubs to the middle—with wild exceptions.',
      body: `${fmtNum(dlMidPct, 0)}% (${dl.middleHalfCount} of ${dl.count}) of division draw leaders finished in the middle half, ${dl.relegatedCount} went down, and ${dl.championCount === 0 ? 'none won the title' : `only ${dl.championCount} won the league (${dlChampNames})`}.${dl25Example}`,
    });

    // 5. Golden Boot vs champions (when verified PL seasons are in scope)
    const sa = m.scorerAnalysis;
    if (sa.status !== 'unavailable' && sa.availableSlotsCount >= 3) {
      const withGb = sa.champWithGbCount;
      const avail = sa.availableSlotsCount;
      const lead = withGb * 2 < avail
        ? 'Most Premier League champions did not have the Golden Boot winner.'
        : withGb * 2 === avail
          ? 'Exactly half of Premier League champions here had the Golden Boot winner.'
          : 'A majority of Premier League champions here fielded the Golden Boot winner.';
      const has25T1 = hasSlot('2025-26-T1');
      const s25Note = has25T1
        ? ' In 2025–26, Arsenal won the title with Viktor Gyökeres on 14 goals while Manchester City’s Erling Haaland led the league with 27.'
        : '';
      bullets.push({
        lead,
        body: `Only ${withGb} of ${avail} verified Premier League champions (${fmtNum((withGb / avail) * 100, 0)}%) fielded the league’s top scorer, and champions relied slightly less on one scorer (${fmtNum(sa.shareStats.champ?.median, 1)}% median share of team goals) than 3rd- and 4th-place clubs (${fmtNum(sa.shareStats.thirdFourth?.median, 1)}%).${s25Note}`,
      });
    }

    // 6. EFL play-off seed breakdown & points deductions (or Tier 1 deduction note)
    const ds = m.deductionSensitivity;
    const pb = m.playoffSeedBreakdown;
    if (m.byTierPromotion.length > 0) {
      const poTotal = m.byTierPromotion.reduce((a, t) => a + t.poWinnerCount, 0);
      const poTop = m.byTierPromotion.reduce((a, t) => a + (t.poWinnerTopSeedCount ?? t.poWinnerThirdCount), 0);
      const hasAll25Efl = hasSlot('2025-26-T2') && hasSlot('2025-26-T3') && hasSlot('2025-26-T4');
      const po25Note = hasAll25Efl
        ? ' In 2025–26, all three English league play-off finals were won by the lower-seeded finalist (6th-placed Hull City, 5th-placed Bolton Wanderers and 5th-placed Notts County).'
        : '';
      let dedPart = '';
      if (ds.relegatedDueToDeductionCount > 0) {
        const has25T2 = hasSlot('2025-26-T2');
        dedPart = ` Meanwhile, ${ds.relegatedDueToDeductionCount} ${plural(ds.relegatedDueToDeductionCount, 'club')} went down after points deductions despite finishing safe on pitch points${has25T2 ? '—including Leicester City (−6) in 2025–26, when Sheffield Wednesday’s −18 penalty left them on an era-low 0 points.' : '.'}`;
      }
      if (pb && pb.overall.total >= 3) {
        const ov = pb.overall;
        const [s1, s2, s3, s4] = ov.seeds;
        const tierNames = pb.byTier.map((t) => t.shortLabel.replace(/\s*\(Tier \d\)/, ''));
        const tierClause = pb.byTier.length === 3
          ? '—a pattern that holds across the Championship, League One, and League Two'
          : pb.byTier.length === 2
            ? `—a similar split across ${tierNames[0]} and ${tierNames[1]}`
            : pb.byTier.length === 1
              ? ` in ${tierNames[0]} play-offs`
              : '';
        bullets.push({
          lead: s1.count * 2 < ov.total
            ? 'Top play-off seeds miss out most of the time—and below 1st seed, seeding barely matters.'
            : 'Top play-off seeds won most finals here, though lower seeds still broke through.',
          body: `Across ${ov.total} four-team English league play-offs since 1988–89, 1st seeds went up ${fmtNum(s1.pct, 0)}% of the time (${s1.count}), vs ${fmtNum(s2.pct, 0)}% for 2nd (${s2.count}), ${fmtNum(s3.pct, 0)}% for 3rd (${s3.count}), and ${fmtNum(s4.pct, 0)}% for 4th (${s4.count})${tierClause}.${po25Note}${dedPart}`,
        });
      } else if (poTotal >= 3) {
        const poTopPct = (poTop / poTotal) * 100;
        bullets.push({
          lead: poTop * 2 < poTotal
            ? 'Top play-off seeds miss out most of the time—and deductions can decide relegation.'
            : 'Play-offs remain volatile across seeds.',
          body: `Across ${poTotal} English league play-off tournaments, the top play-off seed won promotion ${poTop} times (${fmtNum(poTopPct, 0)}%).${po25Note}${dedPart}`,
        });
      }
    } else if (ds.relegatedDueToDeductionCount > 0) {
      bullets.push({
        lead: 'Points deductions have decided relegation without changing the wider patterns.',
        body: `${ds.affectedRowsCount} team ${plural(ds.affectedRowsCount, 'season')} here had points adjustments, and ${ds.relegatedDueToDeductionCount} ${plural(ds.relegatedDueToDeductionCount, 'club')} (${ds.relegatedDueToDeduction.map((x) => `${x.team} ${x.season}`).join(', ')}) went down despite finishing above the relegation line on pitch points alone.`,
      });
    }

    return { isEmpty: false, note, bullets };
  }

  function renderKeyTakeaways() {
    const m = state.model;
    const listEl = document.getElementById('takeaways-list');
    const noteEl = document.getElementById('takeaways-scope-note');
    const view = buildTakeawaysView(m, state.scope);
    if (noteEl) noteEl.textContent = view.note;
    if (!listEl) return;
    clearEl(listEl);
    if (view.isEmpty) return;

    for (const b of view.bullets) {
      listEl.appendChild(
        el('li', null,
          el('span', { className: 'takeaways-lead', textContent: `${b.lead} ` }),
          document.createTextNode(b.body)
        )
      );
    }
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

  const SICKO_PREDICTORS = {
    winRate: {
      label: 'W/G (Win-Rate Affine Component)',
      short: 'W/G',
      note: 'Algebraic collinearity identity: PPG = 3·W/G + D/G',
    },
    gdPerGame: {
      label: 'GD/G (Net Goal Differential / Match)',
      short: 'GD/G',
      note: 'First-order net scoring residual (GF/G − GA/G)',
    },
    gfPerGame: {
      label: 'GF/G (Offensive Output Rate)',
      short: 'GF/G',
      note: 'Gross scoring rate per match (unadjusted for xG or opponent strength)',
    },
    gaPerGame: {
      label: 'GA/G (Defensive Concession Rate)',
      short: 'GA/G',
      note: 'Goals-against rate per match (monotonically inverse to table rank)',
    },
    drawRate: {
      label: 'D/G (Stalemate Frequency Vector)',
      short: 'D/G',
      note: 'Non-monotonic affine component (1 pt/draw vs 3 pts/win induces sign flips across slots)',
    },
  };

  function plainPredictor(key, fallback) {
    const dict = isSicko() ? SICKO_PREDICTORS : PLAIN_PREDICTORS;
    return dict[key] || {
      label: fallback?.label || key,
      short: fallback?.shortLabel || key,
      note: fallback?.identityNote || '',
    };
  }

  function renderSection1() {
    const m = state.model;
    const sicko = isSicko();
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
        titleEl.textContent = sicko
          ? `Small-Sample Guard (N_slots = ${m.numSlots} < 3) — Cross-Slot Median |r| Suppressed`
          : `Small Sample (${m.numSlots} ${plural(m.numSlots, 'Table')}) — Cross-Season Ranking Suppressed`;
      } else if (sicko) {
        titleEl.textContent = atkDef.diverges
          ? `Within-Slot Demeaned |r| Favors ${atkDef.withinLeader === 'ga' ? 'GA/G' : 'GF/G'} While Stacked OLS R²(PPG) Reverses to ${atkDef.pooledLeader === 'gf' ? 'GF/G' : 'GA/G'}—and D/G Ranks ${ordinal(drawRankOverall)}/5`
          : `Within-Slot Median |r| vs. Pooled Cross-Sectional R²(PPG): W/G & GD/G Lead via Collinearity While D/G Ranks ${ordinal(drawRankOverall)}/5`;
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
            sicko
              ? `Insufficient panel depth (N_slots = ${m.numSlots}, N_obs = ${fmtInt(m.allTeams.length)}) for non-degenerate within-slot quantile estimation. Inspect single-slot OLS residuals below or widen [t₀, t₁] to ≥3 slots.`
              : `Too few tables (${m.numSlots} ${plural(m.numSlots, 'table')}, ${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')}) to summarise cross-season medians reliably. Inspect individual club figures below or widen the filter to at least three tables.`
          )
        );
      } else if (sicko) {
        proseEl.append(
          el('p', null,
            `Across N_slots = ${m.numSlots} tier-season slots (N_obs = ${fmtInt(m.allTeams.length)} team-seasons), each per-match regressor is evaluated via within-slot Pearson correlation r against normalized finish score y = 1 − (pos − 1)/(K − 1) ∈ [0, 1], eliminating inter-season schedule heteroskedasticity (38g–46g) and cardinality drift (K ∈ [20, 24]). Unsurprisingly, `,
            el('strong', { textContent: `W/G (median |r| = ${fmtNum(winPred?.medianAbsRFinish, 3)})` }),
            ' and ',
            el('strong', { textContent: `GD/G (${fmtNum(gdPred?.medianAbsRFinish, 3)})` }),
            ` top the hierarchy by structural algebraic identity (PPG ≡ 3·W/G + D/G; GD/G ≡ GF/G − GA/G).${isRawMode() ? ' Counterfactual raw 3W+D mode is active: deductions are stripped from PPG and finishScore here while official pos/relegation vectors stay fixed.' : ''}`
          ),
          el('p', null,
            'Attack vs. defence exhibits a textbook aggregation-operator sensitivity: within-slot demeaned ',
            el('strong', { textContent: `median(|r_finish|) puts GA/G at ${fmtNum(atkDef.gaWithin, 3)} vs GF/G at ${fmtNum(atkDef.gfWithin, 3)}` }),
            ` (Δ = ${fmtNum(atkDef.withinDiff, 3)}; GA/G strictly exceeds GF/G in ${m.withinSlot.gaBeatsGfCount}/${m.withinSlot.comparableGfGaSlots} slots vs ${m.withinSlot.gfBeatsGaCount} for GF/G), whereas stacked cross-sectional bivariate OLS yields `,
            el('strong', { textContent: `pooled R²(PPG) = ${fmtNum(atkDef.gfR2 * 100, 1)}% for GF/G vs ${fmtNum(atkDef.gaR2 * 100, 1)}% for GA/G` }),
            '. Because the two operators regress onto distinct targets (within-slot demeaned ordinal rank vs pooled cardinal PPG) and GF/G, GA/G are non-orthogonal collinear components, neither figure constitutes an additive variance partition or causal marginal effect.'
          ),
          el('p', null,
            `D/G ranks ${ordinal(drawRankOverall)}/5 overall, flipping sign across slots (r < 0 in ${drawNegSlots}/${drawPred?.slotCount ?? 0} slots; r > 0 in ${drawPosSlots}), so Jensen’s inequality forces `,
            el('strong', { textContent: `median(|r|) = ${fmtNum(drawPred?.medianAbsRFinish, 3)} > |median(r)| = ${fmtNum(Math.abs(drawPred?.medianRFinish ?? 0), 3)}` }),
            ` (signed median r = ${fmtSigned(drawPred?.medianRFinish, 3)}, IQR [${fmtSigned(drawPred?.q1RFinish, 3)}, ${fmtSigned(drawPred?.q3RFinish, 3)}]). Payoff-matrix arithmetic is decisive: over 22 fixtures, 11W+11L yields 33 pts vs 22 pts for 22D (and 11 pts for 11D).`
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
            ` (${fmtInt(m.allTeams.length)} team ${plural(m.allTeams.length, 'season')}), each stat is ranked by how closely it tracks final league position inside a single table on a 0-to-1 strength scale (0 = no linear link, 1 = perfect link). Placing every club from 1.00 (first) down to 0.00 (last) puts 20- to 24-club leagues and 38- to 46-game seasons on equal footing. Wins per game (median strength `,
            el('strong', { textContent: fmtNum(winPred?.medianAbsRFinish, 3) }),
            ') and goal difference per game (',
            el('strong', { textContent: fmtNum(gdPred?.medianAbsRFinish, 3) }),
            ') lead by definition: points come straight from wins and draws, and goal difference is simply goals scored minus goals conceded.',
            isRawMode() ? ' On-pitch points mode (3 points per win, 1 per draw, before deductions) updates points per game and rank links here, while official finishes and outcomes stay fixed.' : ''
          ),
          el('p', null,
            'Between attack and defence, two common ways of measuring strength can point differently: ',
            el('strong', { textContent: withinPhrase }),
            ` (goals conceded ${fmtNum(atkDef.gaWithin, 3)} vs goals scored ${fmtNum(atkDef.gfWithin, 3)}, gap ${fmtNum(Math.abs(Number(fmtNum(atkDef.gaWithin, 3)) - Number(fmtNum(atkDef.gfWithin, 3))), 3)}; defence stronger in ${m.withinSlot.gaBeatsGfCount} of ${m.withinSlot.comparableGfGaSlots} tables vs ${m.withinSlot.gfBeatsGaCount} for scoring${atkDef.ties > 0 ? `, ${atkDef.ties} tied` : ''}), whereas `,
            el('strong', { textContent: pooledPhrase }),
            ` (goals scored ${fmtNum(atkDef.gfR2 * 100, 1)}% vs goals conceded ${fmtNum(atkDef.gaR2 * 100, 1)}%, overlapping descriptive links rather than additive shares).${sec1Differs ? ' The measures use different outcomes and aggregation methods, so their rankings can differ.' : ''} Both margins are modest descriptive associations rather than tactical prescriptions.`
          ),
          el('p', null,
            `Draws per game rank ${ordinal(drawRankOverall)} of 5 ${tierDrawSummary}. Their direction flips from season to season—negative in ${drawNegSlots} of ${drawPred?.slotCount ?? 0} tables and positive in ${drawPosSlots}—leaving a `,
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
          sicko
            ? `|r|=${fmtNum(c.medianAbsRFinish, 3)} (r=${fmtSigned(c.medianRFinish, 3)})`
            : `${fmtNum(c.medianAbsRFinish, 3)} strength (signed ${fmtSigned(c.medianRFinish, 3)})`,
          idx === 0 ? 'highlight' : ''
        );
      });
      if (gfPool && gaPool) {
        appendKV(
          calloutEl,
          sicko ? 'Pooled OLS R²(PPG) GF/GA' : 'Pooled points variation (Att / Def)',
          `${fmtNum(gfPool.r2Ppg * 100, 1)}% / ${fmtNum(gaPool.r2Ppg * 100, 1)}%`
        );
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
      const sicko = isSicko();
      const basisTag = isRawMode() ? (sicko ? ' · counterfactual raw 3W+D' : ' · On-pitch points (before deductions)') : '';
      subEl.textContent = sicko
        ? `N_obs = ${fmtInt(valid.length)} Team-${plural(valid.length, 'Season')} · x = ${pp.short} vs y = ${targetIsPpg ? 'PPG' : 'y_finish ∈ [0,1]'}${basisTag}`
        : `${fmtInt(valid.length)} team ${plural(valid.length, 'season')} · ${pp.label} vs ${targetIsPpg ? 'Points per game' : 'Table rank (1 = 1st, 0 = last)'}${basisTag}`;
    }
    if (noteEl) {
      const sicko = isSicko();
      const basisNote = isRawMode() ? (sicko ? ' [Counterfactual raw 3W+D active]' : ' (On-pitch points active: deductions excluded here.)') : '';
      const targetName = targetIsPpg ? 'points per game' : 'table rank';
      noteEl.textContent = sicko
        ? `${pp.note}. Within-slot median r_finish = ${fmtSigned(slotMatch?.medianRFinish, 3)}; stacked OLS r = ${fmtSigned(pooledR, 3)}, R² = ${fmtPct((pooledR ?? 0) ** 2 * 100, 1)} (β̂₁ = ${fmtSigned(fit?.slope, 3)})${basisNote}`
        : `${pp.note}. Median link to table rank: ${fmtSigned(slotMatch?.medianRFinish, 3)}; pooled linear link to ${targetName}: ${fmtSigned(pooledR, 3)} (${fmtPct((pooledR ?? 0) ** 2 * 100, 1)} of variation)${basisNote}`;
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
    const sicko = isSicko();
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
    const rawNote = isRawMode()
      ? (sicko ? ' (Official standings held invariant under raw 3W+D toggle.)' : ' (Based on official league tables, unaffected by the on-pitch points toggle.)')
      : '';

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = sicko
          ? `Small-Sample Title Manifold (n = ${m.champs.length} < 3)`
          : `Title Race Snapshot: ${m.champs.length} ${plural(m.champs.length, 'Champion')} Selected`;
      } else if (sicko) {
        titleEl.textContent = m.champFewerWinsCases.length > 0
          ? `pos=1 Outperforms pos=2 by +${fmtNum((cStats.gdPerGame?.mean ?? 0) - (rStats.gdPerGame?.mean ?? 0), 2)} GD/G—Yet ${m.champFewerWinsCases.length}/${m.champs.length} Violated argmax(W)`
          : `Upper-Tail Separation: pos=1 Diverges from pos=2 Primarily via Mean GF/G (+${fmtNum((cStats.gfPerGame?.mean ?? 0) - (rStats.gfPerGame?.mean ?? 0), 2)})`;
      } else {
        titleEl.textContent = m.champFewerWinsCases.length > 0
          ? `Champions Average +${fmtNum((cStats.gdPerGame?.mean ?? 0) - (rStats.gdPerGame?.mean ?? 0), 2)} Better Goal Difference per Game—Yet ${m.champFewerWinsCases.length} Won Fewer Matches Than a Rival`
          : 'Title Standard: Champions Pull Ahead More Through Scoring Than Defence';
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (smallSample) {
        const pairSummaries = m.titlePairs.map((p) => `${p.season} Tier ${p.tier}: ${p.champion.team} (${p.champion.points} pts, ${fmtNum(p.champion.officialPpg, 2)}${sicko ? ' PPG' : '/game'}) beat ${p.runnerUp.team} (${p.runnerUp.points} pts, ${fmtNum(p.runnerUp.officialPpg, 2)}${sicko ? ' PPG' : '/game'})`).join('; ');
        proseEl.append(
          el('p', null,
            sicko
              ? `Small-sample estimator suppression (N_slots = ${m.champs.length} < 3): cross-slot μ and IQR spreads gated. Observed pairs: `
              : `Small-sample scope (${m.champs.length} ${plural(m.champs.length, 'title race')}, fewer than three tables): cross-season averages and spreads are suppressed. `,
            pairSummaries ? `${pairSummaries}.${rawNote}` : rawNote.trim()
          )
        );
      } else if (sicko) {
        proseEl.append(
          el('p', null,
            `Across N_slots = ${m.champs.length} completed title manifolds, first-order statistics yield μ_PPG(1st) = `,
            el('strong', { textContent: `${fmtNum(cStats.ppg?.mean, 3)} PPG` }),
            ` (IQR [${fmtNum(cStats.ppg?.q1, 2)}, ${fmtNum(cStats.ppg?.q3, 2)}]) vs μ_PPG(2nd) = ${fmtNum(rStats.ppg?.mean, 3)} PPG. Decomposition into offensive and defensive components shows `,
            el('strong', { textContent: `ΔGF/G = +${fmtNum((cStats.gfPerGame?.mean ?? 0) - (rStats.gfPerGame?.mean ?? 0), 3)}` }),
            ` (${fmtNum(cStats.gfPerGame?.mean, 2)} vs ${fmtNum(rStats.gfPerGame?.mean, 2)}) exceeding `,
            el('strong', { textContent: `|ΔGA/G| = ${fmtNum(Math.abs((cStats.gaPerGame?.mean ?? 0) - (rStats.gaPerGame?.mean ?? 0)), 3)}` }),
            ` (${fmtNum(cStats.gaPerGame?.mean, 2)} vs ${fmtNum(rStats.gaPerGame?.mean, 2)}); pos=1 outscored pos=2 in ${m.champMoreGfThanRunnerUp}/${m.titlePairs.length} slots and held lower GA/G in ${m.champFewerGaThanRunnerUp}.${rawNote}`
          ),
          el('p', null,
            m.champFewerWinsCases.length === 0
              ? 'Zero argmax(W) inversions occurred in this slice: every pos=1 tuple weakly dominated the division in raw W.'
              : `Crucially, the 3W+D linear functional is non-monotonic in W alone: ${m.champFewerWinsCases.length}/${m.champs.length} champions (exclusively T2–T4) satisfied argmax_i(3W_i + D_i) ≠ argmax_i(W_i), converting marginal draw-accumulation edges into title margins (e.g., ${m.champFewerWinsCases[0].champion.team} ${m.champFewerWinsCases[0].season} through ${m.champFewerWinsCases[m.champFewerWinsCases.length - 1].champion.team} ${m.champFewerWinsCases[m.champFewerWinsCases.length - 1].season}).`
          )
        );
      } else {
        proseEl.append(
          el('p', null,
            `Across ${m.champs.length} ${plural(m.champs.length, 'title race')}, champions averaged `,
            el('strong', { textContent: `${fmtNum(cStats.ppg?.mean, 2)} points per game` }),
            ` against ${fmtNum(rStats.ppg?.mean, 2)} for runners-up—building most of that cushion in front of goal. Title winners scored `,
            el('strong', { textContent: `${fmtNum(cStats.gfPerGame?.mean, 2)} goals a match` }),
            ` to the runner-up’s ${fmtNum(rStats.gfPerGame?.mean, 2)} and conceded `,
            el('strong', { textContent: `${fmtNum(cStats.gaPerGame?.mean, 2)}` }),
            ` to ${fmtNum(rStats.gaPerGame?.mean, 2)}, outscoring second place in ${m.champMoreGfThanRunnerUp} of ${m.titlePairs.length} races while conceding fewer in ${m.champFewerGaThanRunnerUp}.${rawNote}`
          ),
          el('p', null, (() => {
            if (m.champFewerWinsCases.length === 0) {
              return 'Every champion in this selection matched or beat every rival for matches won.';
            }
            const firstFw = m.champFewerWinsCases[0];
            const lastFw = m.champFewerWinsCases[m.champFewerWinsCases.length - 1];
            const fmtFw = (c) => {
              const rival = c.winLeaders[0];
              const rivalTxt = rival ? ` ahead of ${ordinal(rival.pos)}-placed ${rival.team}’s ${rival.won} wins` : '';
              return `${c.champion.team} in the ${c.season} ${c.historicalDivisionName} (${c.champion.won} wins and ${c.champion.drawn} draws for ${c.champion.points} points${rivalTxt})`;
            };
            const spanTxt = m.champFewerWinsCases.length === 1
              ? `: ${fmtFw(firstFw)}`
              : `—from ${fmtFw(firstFw)} through ${fmtFw(lastFw)}`;
            return `Step below the top flight and a cherished assumption breaks down: winning the most matches does not always win the title. Across Tiers 2–4, ${m.champFewerWinsCases.length} ${plural(m.champFewerWinsCases.length, 'champion')} finished first with fewer wins than a rival${spanTxt}.`;
          })())
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, sicko ? 'pos=1 PPG (μ / Med)' : 'Champion pts/game (Avg / Med)', smallSample && m.champs.length === 1 ? fmtNum(cStats.ppg?.mean, 2) : `${fmtNum(cStats.ppg?.mean, 2)} / ${fmtNum(cStats.ppg?.median, 2)}`, 'highlight');
      appendKV(calloutEl, sicko ? 'pos=2 PPG (μ / Med)' : 'Runner-up pts/game (Avg / Med)', smallSample && m.runnersUp.length === 1 ? fmtNum(rStats.ppg?.mean, 2) : `${fmtNum(rStats.ppg?.mean, 2)} / ${fmtNum(rStats.ppg?.median, 2)}`);
      appendKV(calloutEl, sicko ? 'pos=1 Mean W/G' : 'Champion win rate', `${fmtNum((cStats.winRate?.mean ?? 0) * 100, 1)}%`);
      appendKV(calloutEl, sicko ? 'pos=1 Mean GF/G / GA/G' : 'Champion scored / conceded', `${fmtNum(cStats.gfPerGame?.mean, 2)} / ${fmtNum(cStats.gaPerGame?.mean, 2)}`);
      appendKV(calloutEl, sicko ? 'argmax(W) inversions' : 'Champions trailing in wins', `${m.champFewerWinsCases.length} of ${m.champs.length}`);
    }

    if (eraEl) {
      clearEl(eraEl);
      for (const e of m.eraSplits) {
        eraEl.appendChild(el('div', { className: 'era-card' },
          el('div', { className: 'era-years', textContent: `${e.name} · ${e.years} (${e.count} ${plural(e.count, sicko ? 'slot' : 'table')})` }),
          el('div', { className: 'era-main num', textContent: `${fmtNum(e.champPpg, 2)} ${sicko ? 'PPG' : 'pts/game'}` }),
          el('div', { className: 'era-sub num', textContent: sicko ? `pos=2 ${fmtNum(e.runnerPpg, 2)} PPG · GD/G ${fmtSigned(e.champGdPerGame, 2)}` : `Runner-up ${fmtNum(e.runnerPpg, 2)} · Goal diff ${fmtSigned(e.champGdPerGame, 2)}/g` })
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
          el('h4', { textContent: sicko ? `argmax(W) Monotonicity Violations (n = ${m.champFewerWinsCases.length})` : `Champions With Fewer Wins Than a Rival (${m.champFewerWinsCases.length})` }),
          list
        );
      }
    }

    if (distTbody) {
      clearEl(distTbody);
      const metrics = sicko
        ? [['PPG', 'ppg', 2], ['W/G', 'winRate', 3], ['GF/G', 'gfPerGame', 2], ['GA/G', 'gaPerGame', 2], ['GD/G', 'gdPerGame', 2]]
        : [['Points / game', 'ppg', 2], ['Win rate', 'winRate', 3], ['Goals scored', 'gfPerGame', 2], ['Goals conceded', 'gaPerGame', 2], ['Goal difference', 'gdPerGame', 2]];
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
    const sicko = isSicko();
    const titleEl = document.getElementById('sec3-title');
    const proseEl = document.getElementById('sec3-prose');
    const calloutEl = document.getElementById('sec3-callout-list');
    const tierTbody = document.getElementById('sec3-tier-tbody');
    const promoTbody = document.getElementById('sec3-promo-tbody');
    const dedNoteEl = document.getElementById('sec3-deduction-note');

    const ss = m.survivalStats;
    const relAbove40Pct = ss.slotCount ? (ss.relegatedAtOrAbove40Over38Rate.length / ss.slotCount) * 100 : 0;
    const rawNote = isRawMode()
      ? (sicko ? ' (Official truncation boundaries held invariant under raw 3W+D toggle.)' : ' (Based on official league tables, unaffected by the on-pitch points toggle.)')
      : '';
    const smallSample = ss.slotCount < 3;
    const boundaryReprieves = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);
    const noRel = m.noRelegationSlots || [];
    const reElecOnly = noRel.length > 0 && noRel.every((x) => x.reElectionEra);

    if (titleEl) {
      if (ss.slotCount === 0) {
        titleEl.textContent = sicko
          ? (reElecOnly ? 'Zero Automatic Relegation (Pre-1986 Re-Election Regime)' : 'Zero Relegation-Active Slots in Current Slice')
          : (reElecOnly ? 'No Automatic Relegation in Selected Re-Election Seasons' : 'No Relegation in Selected Tables');
      } else if (smallSample) {
        titleEl.textContent = sicko
          ? `Small-Sample Truncation Snapshot (n = ${ss.slotCount} < 3)`
          : `Survival Cutoff Snapshot (${ss.slotCount} ${plural(ss.slotCount, 'Table')} With Relegation)`;
      } else {
        titleEl.textContent = sicko
          ? 'Cross-Stratum Truncation Non-Stationarity: 40/38g (1.053 PPG) Fails Below T1 While 50/46g (1.087 PPG) Overshoots Median Floors'
          : 'Safety Varies by Tier: 40-Point Pace Fails Lower-Tier Cutoffs, While 50-Point Pace Is Rarely Reached';
      }
    }

    if (proseEl) {
      clearEl(proseEl);
      if (ss.slotCount === 0) {
        const reElecCount = noRel.filter((x) => x.reElectionEra).length;
        const reasonText = reElecOnly
          ? `Automatic relegation was not in place across ${noRel.length === 1 ? 'this Fourth Division re-election season' : `these ${reElecCount} Fourth Division re-election seasons`} (${noRel.map((x) => `${x.season} Tier ${x.tier}`).join(', ')}); bottom clubs faced re-election instead.`
          : `None of the ${noRel.length} selected ${plural(noRel.length, sicko ? 'slot' : 'table')} had relegation (${noRel.map((x) => `${x.season} Tier ${x.tier}`).join(', ')}).`;
        proseEl.append(el('p', { textContent: `${reasonText} Widen the filter to examine survival cutoffs.` }));
      } else if (smallSample) {
        const slotDesc = m.survivalSeries.map((s) => `${s.season} Tier ${s.tier}: lowest survivor ${s.survivingTeam} (${s.survivingPts} pts, ${fmtNum(s.survivingPpg, 3)}${sicko ? ' PPG' : '/game'}) vs highest relegated ${s.relegatedTeam} (${s.relegatedHighPts} pts, ${fmtNum(s.relegatedHighPpg, 3)}${sicko ? ' PPG' : '/game'})`).join('; ');
        const reprieveDesc = boundaryReprieves.length > 0
          ? ` Boundary reprieves excluded from lowest merit survivor: ${boundaryReprieves.map((r) => `${r.team} (${r.season} Tier ${r.tier}, ${ordinal(r.pos)}, ${r.outcomeType})`).join(', ')}.`
          : '';
        proseEl.append(el('p', null, `Small-sample scope (${ss.slotCount} ${plural(ss.slotCount, sicko ? 'slot' : 'table')} with relegation, fewer than three): cross-season medians are suppressed. ${slotDesc}.${reprieveDesc}${rawNote}`));
      } else if (sicko) {
        const highRelMax = Math.max(...m.survivalSeries.map((x) => x.relegatedHighPpg ?? 0));
        const highRelTies = m.survivalSeries.filter((x) => Math.abs((x.relegatedHighPpg ?? 0) - highRelMax) < 1e-9);
        const highRelSlot = highRelTies[0] || null;
        const highRelDesc = highRelTies.map((x) => `${x.relegatedTeam}, ${x.relegatedHighPts} pts in ${x.season} T${x.tier}`).join('; ');
        proseEl.append(
          el('p', null,
            `Across N_rel = ${ss.slotCount} relegation-active slots (${ss.excludedNoRelegationCount} non-relegating slots separated via typed outcomeType enum), the empirical median lowest merit survivor sits at `,
            el('strong', { textContent: `${fmtNum(ss.survivingPpg?.median, 3)} official PPG` }),
            ` (linear projections: ${fmtNum(ss.survivingPts38?.median, 1)}/38g; ${fmtNum(ss.survivingPts46?.median, 1)}/46g), versus median relegation ceiling ${fmtNum(ss.relegatedPpg?.median, 3)} PPG. Relegated clubs reached ≥1.053 PPG (40/38g) in `,
            el('strong', { textContent: `${ss.relegatedAtOrAbove40Over38Rate.length}/${ss.slotCount} slots (${fmtNum(relAbove40Pct, 1)}%)` }),
            ` and ≥1.087 PPG (50/46g) in ${ss.relegatedAtOrAbove50Over46Rate.length}/${ss.slotCount}. Max-PPG relegated outlier: `,
            el('strong', { textContent: `${fmtNum(highRelSlot?.relegatedHighPpg, 3)} PPG` }),
            highRelSlot ? ` (${highRelDesc}${highRelTies.length > 1 ? ' — tied' : ''}).${rawNote}` : `.${rawNote}`
          )
        );
        const pb = m.playoffSeedBreakdown;
        if (m.byTierPromotion.length > 0 && pb && pb.overall.total >= 3) {
          const ov = pb.overall;
          const [s1, s2, s3, s4] = ov.seeds;
          proseEl.append(
            el('p', null,
              `At the upper promotion boundary of T2–T4, single-elimination knockout variance heavily discounts 46g regular-season priors: across n=${ov.total} homogeneous 4-team brackets (1988–89..2025–26), P(promo | seed_1..4) = `,
              el('strong', { textContent: `${fmtNum(s1.pct, 1)}% / ${fmtNum(s2.pct, 1)}% / ${fmtNum(s3.pct, 1)}% / ${fmtNum(s4.pct, 1)}%` }),
              ` (uniform χ²(3) = ${fmtNum(ov.chi2Uniform, 2)}; full χ² stratum-homogeneity matrix rendered below).`
            )
          );
        }
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
            proseEl.append(
              el('p', null,
                el('strong', { textContent: `38g PL homogeneous sub-panel (n=${n38}, excl. ${pl42Series.length} 42g 1992–95 slots): ` }),
                `pos=18 μ = ${fmtNum(pl38RelStats.mean, 1)} pts (med ${fmtNum(pl38RelStats.median, 0)}); P(Pts_18th ≥ 35) = ${pl38Rel35Plus}/${n38}; P(Pts_18th ≥ 40) = ${pl38Rel40Plus}/${n38}; P(Pts_17th < 40) = ${pl38SurvUnder40}/${n38} (${fmtNum((pl38SurvUnder40 / n38) * 100, 1)}%).`
              )
            );
          }
        }
      } else {
        const highRelMax = Math.max(...m.survivalSeries.map((x) => x.relegatedHighPpg ?? 0));
        const highRelTies = m.survivalSeries.filter((x) => Math.abs((x.relegatedHighPpg ?? 0) - highRelMax) < 1e-9);
        const highRelSlot = highRelTies[0] || null;
        const highRelDesc = highRelTies.map((x) => `${x.relegatedTeam}, ${x.relegatedHighPts} pts in the ${x.season} ${x.historicalDivisionName}`).join('; ');
        const exclParts = [];
        if (ss.excludedNoRelegationCount > 0) exclParts.push(`${ss.excludedNoRelegationCount} ${plural(ss.excludedNoRelegationCount, 'table')} without relegation separated`);
        if (boundaryReprieves.length > 0) exclParts.push(`${boundaryReprieves.length} reprieved boundary ${plural(boundaryReprieves.length, 'club')} excluded from lowest merit survivor`);
        const exclClause = exclParts.length > 0 ? ` (${exclParts.join('; ')})` : '';
        proseEl.append(
          el('p', null,
            `Across ${ss.slotCount} ${plural(ss.slotCount, 'table')} with relegation${exclClause}, the typical lowest surviving club needed `,
            el('strong', { textContent: `${fmtNum(ss.survivingPpg?.median, 3)} points per game` }),
            `—about ${fmtNum(ss.survivingPts38?.median, 1)} points over a 38-game season, or ${fmtNum(ss.survivingPts46?.median, 1)} over 46. Premier League folklore clings to 40 points (1.053 per game), yet Championship and League One relegation scraps routinely climb toward 49–50 points over 46 games (1.065–1.087 per game).${rawNote}`
          ),
          el('p', null,
            `In ${ss.relegatedAtOrAbove40Over38Rate.length} of ${ss.slotCount} ${plural(ss.slotCount, 'table')} (${fmtNum(relAbove40Pct, 1)}%), a club still went down despite keeping 40-point Premier League pace (1.053 per game or better). The unluckiest relegated ${highRelTies.length > 1 ? 'sides' : 'side'} in this slice earned `,
            el('strong', { textContent: `${fmtNum(highRelSlot?.relegatedHighPpg, 3)} points per game` }),
            highRelSlot ? ` (${highRelDesc}${highRelTies.length > 1 ? ' — tied' : ''}).` : '.'
          )
        );
        if (m.byTierPromotion.length > 0) {
          const poTotal = m.byTierPromotion.reduce((a, t) => a + t.poWinnerCount, 0);
          const poTop = m.byTierPromotion.reduce((a, t) => a + (t.poWinnerTopSeedCount ?? t.poWinnerThirdCount), 0);
          const pb = m.playoffSeedBreakdown;
          if (pb && pb.overall.total >= 3) {
            const ov = pb.overall;
            const [s1, s2, s3, s4] = ov.seeds;
            const has25T2 = m.slots.some((s) => s.slotId === '2025-26-T2');
            const has25EflAll = has25T2 && m.slots.some((s) => s.slotId === '2025-26-T3') && m.slots.some((s) => s.slotId === '2025-26-T4');
            const transTail = pb.transitionalCount > 0
              ? ` (${poTop} of ${poTotal} top lower-tier seeds including ${pb.transitionalCount} inter-divisional 1986–88 ${plural(pb.transitionalCount, 'final')})`
              : '';
            const po25Clause = has25EflAll
              ? ' In 2025–26, all three English league play-off finals were won by the lower-seeded finalist: 6th-placed Hull City (after 4th-placed Southampton were expelled for filming opposition training), 5th-placed Bolton Wanderers, and 5th-placed Notts County.'
              : '';
            const ded25Clause = has25T2
              ? ' Points deductions also reshaped the 2025–26 Championship bottom three: Leicester City (−6) dropped from 52 on-pitch points to 46 and went down, while Sheffield Wednesday (−18) finished on 0 points—the lowest official points total in the dataset.'
              : '';
            proseEl.append(
              el('p', null,
                `At the top of Tiers 2–4, play-off seeding is far from decisive: across ${ov.total} standard four-team play-offs since 1988–89, 1st seeds won promotion `,
                el('strong', { textContent: `${s1.count} times (${fmtNum(s1.pct, 1)}%)` }),
                `, ahead of 2nd (${fmtNum(s2.pct, 1)}%), 3rd (${fmtNum(s3.pct, 1)}%), and 4th seeds (${fmtNum(s4.pct, 1)}%)—see the full seed-by-tier breakdown below${transTail}.${po25Clause}${ded25Clause}`
              )
            );
          } else if (poTotal >= 3) {
            proseEl.append(
              el('p', null,
                `At the top of Tiers 2–4, play-off seeding is rarely decisive: across ${poTotal} English league play-off tournaments, the highest-ranked play-off entrant won promotion `,
                el('strong', { textContent: `${poTop} times (${fmtNum((poTop / poTotal) * 100, 1)}%)` }),
                '.'
              )
            );
          }
        }
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
      const u = sicko ? 'PPG' : 'pts/g';
      const slotSummary = ss.excludedNoRelegationCount > 0 ? `${ss.slotCount} (${ss.excludedNoRelegationCount} ${sicko ? 'non-relegating excl.' : 'without relegation excluded'})` : String(ss.slotCount);
      appendKV(calloutEl, sicko ? 'Relegation-active slots' : 'Tables with relegation', slotSummary);
      appendKV(calloutEl, sicko ? 'Med. merit survivor' : 'Median lowest survivor', smallSample && ss.slotCount === 1 ? `${fmtNum(ss.survivingPpg?.min, 3)} ${u}` : `${fmtNum(ss.survivingPpg?.median, 3)} ${u}`, 'highlight');
      appendKV(calloutEl, sicko ? 'Min merit survivor' : 'Lowest survivor ever', `${fmtNum(ss.survivingPpg?.min, 3)} ${u}`);
      appendKV(calloutEl, sicko ? 'Med. relegation ceiling' : 'Median highest dropped', smallSample && ss.slotCount === 1 ? `${fmtNum(ss.relegatedPpg?.min, 3)} ${u}` : `${fmtNum(ss.relegatedPpg?.median, 3)} ${u}`);
      appendKV(calloutEl, sicko ? 'Rel. ≥ 40/38g (1.053 PPG)' : 'Dropped on 40-in-38 pace (≥1.053)', `${ss.relegatedAtOrAbove40Over38Rate.length} / ${ss.slotCount}`);
      appendKV(calloutEl, sicko ? 'Rel. ≥ 50/46g (1.087 PPG)' : 'Dropped on 50-in-46 pace (≥1.087)', `${ss.relegatedAtOrAbove50Over46Rate.length} / ${ss.slotCount}`);
      if (boundaryReprieves.length > 0) {
        appendKV(calloutEl, sicko ? 'outcomeType reprieves gated' : 'Reprieved clubs excluded', boundaryReprieves.map((r) => `${r.team} (${r.season} Tier ${r.tier})`).join(', '));
      }
    }

    if (tierTbody) {
      clearEl(tierTbody);
      for (const t of m.byTierSurvival) {
        const mr = t.maxRelegatedRow;
        const mrTies = (t.maxRelegatedTies && t.maxRelegatedTies.length > 0) ? t.maxRelegatedTies : (mr ? [mr] : []);
        const mrDesc = mrTies.map((x) => `${x.relegatedTeam} (${x.season}, ${x.relegatedPts} pts)`).join('; ') + (mrTies.length > 1 ? ' — tied' : '');
        tierTbody.appendChild(el('tr', null,
          el('td', { className: 'text-col', textContent: `Tier ${t.tier}` }),
          el('td', { textContent: String(t.slotCount) }),
          el('td', { textContent: fmtNum(t.survivingPpg?.median, 3) }),
          el('td', { textContent: fmtNum(t.survivingPpg?.min, 3) }),
          el('td', { textContent: fmtNum(t.relegatedHighPpg?.max, 3) }),
          el('td', { className: 'text-col', textContent: mr ? mrDesc : '—' })
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
            el('td', { textContent: `${t.poWinnerTopSeedCount ?? t.poWinnerThirdCount}/${t.poWinnerCount}` }),
            el('td', { textContent: `${t.poWinnerBottomSeedCount ?? t.poWinnerLowestPosCount}/${t.poWinnerCount}` })
          ));
        }
      }
    }

    if (dedNoteEl) {
      const ds = m.deductionSensitivity;
      const examples = ds.relegatedDueToDeduction.slice(0, 4).map((x) => `${x.team} (${x.season}, ${x.signedAdjustment} pts)`).join(', ');
      const relClause = ds.relegatedDueToDeductionCount > 0
        ? `${ds.relegatedDueToDeductionCount} ${ds.relegatedDueToDeductionCount === 1 ? 'club went' : 'clubs went'} down after deductions despite finishing above the relegation line on pitch points alone (e.g. ${examples}).`
        : 'no clubs changed relegation status on pitch points alone in this selection.';
      const affectedClause = ds.affectedRowsCount > 0
        ? `${ds.affectedRowsCount} team ${plural(ds.affectedRowsCount, 'season')} had points adjustments; ${relClause}`
        : 'no clubs had points adjustments in this selection.';
      dedNoteEl.textContent = `Points-deduction check (survival cutoffs above stay on official tables): ${affectedClause}`;
    }

    renderSec3Chart();
    renderSec3Playoffs();
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
    const sicko = isSicko();
    const basisTag = isRawMode()
      ? (sicko ? ' · Official tables invariant under raw 3W+D toggle' : ' · Official league tables (unaffected by on-pitch toggle)')
      : '';
    const curtOn3 = (m.includedCurtailedSlots?.length ?? 0) > 0;
    const rangeTag = curtOn3 ? 'completed 38g–46g plus curtailed 34g–37g schedules' : 'completed 38g–46g schedules';
    const rangeTagPlain = curtOn3 ? 'completed 38- to 46-game seasons and the curtailed 34–37-game 2019–20 tables' : 'completed 38- to 46-game seasons';

    if (subEl) {
      subEl.textContent = sicko
        ? (mode === 'ppg'
          ? `Observed lowest merit survivor vs. highest relegated ceiling in official PPG (invariant across ${rangeTag})${basisTag}`
          : `${mult}g linear point-equivalent projection across N_rel = ${m.survivalSeries.length} relegation-active ${plural(m.survivalSeries.length, 'slot')}${basisTag}`)
        : (mode === 'ppg'
          ? `Lowest safe vs. highest relegated club in official points per game (comparable across ${rangeTagPlain})${basisTag}`
          : `${mult}-game official point equivalent across ${m.survivalSeries.length} ${plural(m.survivalSeries.length, 'table')} with relegation${basisTag}`);
    }
    if (noteEl) {
      const notes = [];
      const activeBoundaryReprieves = (m.excludedSurvivalRows || []).filter((r) => r.relegationActiveSlot);
      if (m.noRelegationSlots.length > 0) {
        notes.push(`Excludes ${m.noRelegationSlots.length} Tier 4 ${plural(m.noRelegationSlots.length, sicko ? 'slot' : 'table')} without relegation (${m.noRelegationSlots.map((x) => `${x.season} Tier ${x.tier}`).join(', ')}).`);
      }
      if (activeBoundaryReprieves.length > 0) {
        notes.push(`Excludes ${activeBoundaryReprieves.length} reprieved or expelled boundary ${plural(activeBoundaryReprieves.length, 'club')} from lowest merit survivor (${activeBoundaryReprieves.map((r) => `${r.team} ${r.season} Tier ${r.tier} (${ordinal(r.pos)}, ${r.outcomeType})`).join(', ')}).`);
      }
      notes.push(sicko
        ? `Dashed benchmarks: 1.053 PPG (40/38g → ${(40 / 38 * mult).toFixed(digits)}) and 1.087 PPG (50/46g → ${(50 / 46 * mult).toFixed(digits)}).`
        : `Dashed lines mark 1.053 points per game (40 over 38 games: ${(40 / 38 * mult).toFixed(digits)}) and 1.087 points per game (50 over 46 games: ${(50 / 46 * mult).toFixed(digits)}).`);
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

  function renderSec3Playoffs() {
    const m = state.model;
    const pb = m.playoffSeedBreakdown;
    const subEl = document.getElementById('sec3-playoff-subtitle');
    const proseEl = document.getElementById('sec3-playoff-prose');
    const legendEl = document.getElementById('sec3-playoff-legend');
    const chartEl = document.getElementById('chart-sec3-playoffs');
    const tableWrap = document.getElementById('sec3-playoff-table-wrap');
    const tbody = document.getElementById('sec3-playoff-seed-tbody');
    const noteEl = document.getElementById('sec3-playoff-seed-note');

    if (!chartEl || !pb) return;
    clearEl(proseEl);
    clearEl(legendEl);
    clearEl(chartEl);
    clearEl(tbody);
    if (noteEl) noteEl.textContent = '';

    const fmtGap = (g) => {
      if (!g || typeof g.median !== 'number' || !Number.isFinite(g.median)) return '—';
      return `${fmtNum(g.median, Math.abs(g.median % 1) < 1e-9 ? 0 : 1)} pts`;
    };
    const rawBasisTag = isRawMode() ? ' · Official league tables (unaffected by on-pitch toggle)' : '';

    if (pb.overall.total === 0) {
      if (tableWrap) tableWrap.hidden = true;
      if (subEl) subEl.textContent = 'No standard four-team English league play-offs in the current filter';
      if (proseEl) {
        if (pb.transitionalCount > 0) {
          const listStr = (pb.transitionalWinners || [])
            .map((w) => `${w.team} (${w.season} Tier ${w.tier}, ${ordinal(w.pos)})`)
            .join('; ');
          proseEl.append(
            el('p', {
              textContent: `Only transitional 1986–88 inter-divisional play-offs appear in this selection (${pb.transitionalCount} lower-tier ${plural(pb.transitionalCount, 'promotion')}: ${listStr}). Because those early brackets put three lower-tier clubs against one club from the division above, no 4th seed existed. Extend the range to 1988–89 or later for the four-team seed breakdown.`,
            })
          );
        } else {
          proseEl.append(
            el('p', {
              textContent: 'Select Tiers 2, 3, or 4 from 1988–89 onward to inspect how often the 1st, 2nd, 3rd, and 4th play-off seeds win promotion.',
            })
          );
        }
      }
      return;
    }

    if (pb.overall.total < 3) {
      if (tableWrap) tableWrap.hidden = true;
      if (subEl) {
        subEl.textContent = `Small-sample snapshot (${pb.overall.total} standard four-team ${plural(pb.overall.total, 'tournament')}—percentages suppressed below three)${rawBasisTag}`;
      }
      if (proseEl) {
        const listStr = (pb.standardWinners || [])
          .map((w) => `${w.season} Tier ${w.tier}: ${w.team} won promotion as ${ordinal(w.seedRank)} seed (${ordinal(w.pos)} place${typeof w.gap1to4 === 'number' ? `; 1st–4th gap: ${w.gap1to4} pts` : ''})`)
          .join('; ');
        proseEl.append(
          el('p', {
            textContent: `Too few tournaments (${pb.overall.total} standard four-team ${plural(pb.overall.total, 'play-off')}) to report seed percentages reliably. Promoted via play-offs here: ${listStr}. Widen the filter to at least three tournaments to compare seeds.`,
          })
        );
      }
      return;
    }

    if (tableWrap) tableWrap.hidden = false;
    const stdYears = (pb.standardWinners || []).map((w) => w.startYear);
    const firstStd = CA.formatSeasonLabel(Math.min(...stdYears));
    const lastStd = CA.formatSeasonLabel(Math.max(...stdYears));
    const ov = pb.overall;
    const [s1, s2, s3, s4] = ov.seeds;

    if (subEl) {
      subEl.textContent = isSicko()
        ? `Empirical P(promo | seed_k) across n = ${ov.total} homogeneous 4-team brackets (${firstStd}..${lastStd}; uniform χ²(3) = ${fmtNum(ov.chi2Uniform, 2)})${rawBasisTag}`
        : `Official promotion share by play-off seed across ${ov.total} standard four-team tournaments (${firstStd} to ${lastStd})${rawBasisTag}`;
    }

    const tierPalette = {
      2: { color: '#b8291f', shortName: 'the Championship', plainName: 'Championship', tableLabel: 'Championship (Tier 2)' },
      3: { color: '#1b5670', shortName: 'League One', plainName: 'League One', tableLabel: 'League One (Tier 3)' },
      4: { color: '#2e6f52', shortName: 'League Two', plainName: 'League Two', tableLabel: 'League Two (Tier 4)' },
    };

    const seriesList = [];
    if (pb.byTier.length > 1) {
      seriesList.push({
        key: 'all',
        label: isSicko() ? 'Pooled EFL (T2–T4)' : 'All EFL Combined',
        color: '#141412',
        isOverall: true,
        data: ov,
      });
    }
    for (const t of pb.byTier) {
      const meta = tierPalette[t.tier] || { color: '#6e6a61', shortName: `Tier ${t.tier}`, plainName: `Tier ${t.tier}`, tableLabel: t.shortLabel };
      seriesList.push({
        key: `t${t.tier}`,
        tier: t.tier,
        label: meta.tableLabel,
        shortName: meta.shortName,
        plainName: meta.plainName,
        color: meta.color,
        isOverall: false,
        data: t,
      });
    }

    if (proseEl) {
      if (isSicko()) {
        const tierChiTxt = typeof pb.chi2TierContingency === 'number'
          ? `A ${pb.byTier.length}×4 contingency test yields Pearson χ²(${pb.chi2TierDf}) = ${fmtNum(pb.chi2TierContingency, 2)}—deep inside the null sampling distribution, refuting any systematic pyramid gradient.`
          : 'Single-stratum filter active; expand to ≥2 EFL strata to evaluate inter-tier contingency homogeneity χ².';
        proseEl.append(
          el('p', null,
            `Conditioning on n = ${ov.total} homogeneous 4-team single-division knockout brackets (${firstStd}..${lastStd}), empirical promotion probabilities deviate modestly from discrete uniformity U{1..4} (25% baseline; goodness-of-fit `,
            el('strong', { textContent: `χ²(3) = ${fmtNum(ov.chi2Uniform, 2)}` }),
            `): `,
            el('strong', { textContent: `P(promo | S1) = ${fmtNum(s1.pct, 1)}% (${s1.count}/${ov.total})` }),
            ` vs `,
            el('strong', { textContent: `S2 = ${fmtNum(s2.pct, 1)}% (${s2.count}), S3 = ${fmtNum(s3.pct, 1)}% (${s3.count}), S4 = ${fmtNum(s4.pct, 1)}% (${s4.count})` }),
            `. Conditioning out Seed 1 leaves a virtually flat tail across Seeds 2–4 (`,
            el('strong', { textContent: `χ²_S2–4(2) = ${fmtNum(ov.chi2Seeds2to4, 2)}` }),
            `). Composite home-second-leg semi-final hosts (S1 ∪ S2) convert `,
            el('strong', { textContent: `${fmtNum(ov.topTwoPct, 1)}% (${ov.topTwoCount}/${ov.total})` }),
            ` vs ${fmtNum(100 - ov.topTwoPct, 1)}% for away-second-leg seeds.`
          ),
          el('p', null,
            el('strong', { textContent: 'Stratum invariance & dispersion paradox: ' }),
            `${tierChiTxt} Across active tiers, Seed 1 conversion sits at ${pb.byTier.map((t) => `T${t.tier}: ${fmtNum(t.seeds[0].pct, 1)}% (n=${t.total}, med. Δ(S1−S4) = ${fmtGap(t.gap1to4)})`).join('; ')}. Notably, tighter intra-bracket regular-season points dispersion does NOT monotonically depress Seed 1 conversion in finite samples (n ≈ 37–38 per stratum).`
          )
        );
      } else {
        const topSeedVerdict = s1.pct >= 50
          ? `winning ${fmtNum(s1.pct, 1)}% of finals in this shorter slice`
          : s1.pct >= 30
            ? `clearly ahead of equal 25% odds, yet still missing out ${fmtNum(100 - s1.pct, 1)}% of the time`
            : `near or below equal 25% odds and missing out ${fmtNum(100 - s1.pct, 1)}% of the time`;
        const seed4Note = s4.count > s3.count
          ? `—${s4.count - s3.count} more ${plural(s4.count - s3.count, 'promotion')} than 3rd seeds`
          : s4.count === s3.count
            ? '—level with 3rd seeds'
            : '';
        const scopeSubject = pb.byTier.length === 1
          ? `${tierPalette[pb.byTier[0].tier]?.plainName || `Tier ${pb.byTier[0].tier}`} four-team play-offs`
          : 'standard four-team English league play-offs';

        proseEl.append(
          el('p', null,
            `Across ${ov.total} ${scopeSubject} (${firstStd} to ${lastStd}), the highest-ranked entrant (1st seed) won promotion `,
            el('strong', { textContent: `${fmtNum(s1.pct, 1)}% of the time (${s1.count} of ${ov.total})` }),
            `—${topSeedVerdict}. Below 1st seed, finishing order separates clubs far less: `,
            el('strong', { textContent: `2nd seeds won ${fmtNum(s2.pct, 1)}% (${s2.count})` }),
            ', ',
            el('strong', { textContent: `3rd seeds ${fmtNum(s3.pct, 1)}% (${s3.count})` }),
            ', and ',
            el('strong', { textContent: `4th seeds ${fmtNum(s4.pct, 1)}% (${s4.count}${seed4Note})` }),
            `. Put together, the top two seeds—who host the semi-final second leg—went up `,
            el('strong', { textContent: `${fmtNum(ov.topTwoPct, 1)}% of the time (${ov.topTwoCount} of ${ov.total})` }),
            ` vs ${fmtNum(100 - ov.topTwoPct, 1)}% for the bottom two.`
          )
        );

        if (pb.byTier.length >= 2) {
          const tierRates = pb.byTier.map((t) => t.seeds[0].pct ?? 0);
          const minRate = Math.min(...tierRates);
          const maxRate = Math.max(...tierRates);
          const minN = Math.min(...pb.byTier.map((t) => t.total));
          const maxN = Math.max(...pb.byTier.map((t) => t.total));
          const consistent = minN >= 10 && (maxRate - minRate) <= 15;
          const rateList = pb.byTier.map((t, idx) => {
            const meta = tierPalette[t.tier];
            const text = `${fmtNum(t.seeds[0].pct, 1)}% in ${meta.shortName} (${t.seeds[0].count} of ${t.total})`;
            if (idx === pb.byTier.length - 1) return `and ${text}`;
            return text;
          }).join(pb.byTier.length === 2 ? ' ' : ', ');

          const lowestGapTier = pb.byTier.reduce((best, cur) => ((cur.gap1to4?.median ?? 999) < (best.gap1to4?.median ?? 999) ? cur : best), pb.byTier[0]);
          const highestTopSeedTier = pb.byTier.reduce((best, cur) => ((cur.seeds[0].pct ?? -1) > (best.seeds[0].pct ?? -1) ? cur : best), pb.byTier[0]);
          let gapTail = '';
          if (minN >= 15 && pb.byTier.length === 3 && lowestGapTier.tier === highestTopSeedTier.tier) {
            const others = pb.byTier.filter((t) => t.tier !== lowestGapTier.tier);
            const otherMedians = Array.from(new Set(others.map((t) => fmtGap(t.gap1to4))));
            const otherDesc = otherMedians.length === 1
              ? `${otherMedians[0]} in both ${tierPalette[others[0].tier].shortName} and ${tierPalette[others[1].tier].shortName}`
              : others.map((t) => `${fmtGap(t.gap1to4)} in ${tierPalette[t.tier].shortName}`).join(' and ');
            gapTail = ` One counter-intuitive twist: ${tierPalette[lowestGapTier.tier].plainName} had the tightest points spread between 1st and 4th seeds (median ${fmtGap(lowestGapTier.gap1to4)} vs ${otherDesc}), yet its 1st seed converted at the highest rate (${fmtNum(lowestGapTier.seeds[0].pct, 1)}%)—a reminder that differences across ${minN}–${maxN} tournaments per tier sit well within small-sample noise.`;
          } else {
            const gapSummary = pb.byTier.map((t) => `${tierPalette[t.tier].plainName} ${fmtGap(t.gap1to4)}`).join(', ');
            gapTail = ` Median 1st-to-4th seed points gaps are ${gapSummary}.`;
          }

          proseEl.append(
            el('p', null,
              el('strong', {
                textContent: consistent
                  ? 'Higher vs. lower tiers: the pattern stays consistent across levels.'
                  : 'Across the selected EFL tiers:',
              }),
              ` The 1st seed went up ${rateList}, while lower seeds stayed bunched across divisions rather than showing a steady gap between higher and lower leagues.${gapTail}`
            )
          );
        } else {
          const onlyTier = pb.byTier[0];
          proseEl.append(
            el('p', null,
              `In ${tierPalette[onlyTier.tier].shortName}, the median gap between 1st and 4th play-off seeds was `,
              el('strong', { textContent: fmtGap(onlyTier.gap1to4) }),
              ' (select multiple EFL tiers above to compare Championship, League One, and League Two side by side).'
            )
          );
        }
      }
    }

    if (legendEl) {
      for (const s of seriesList) {
        legendEl.appendChild(
          el('span', { className: 'legend-item' },
            el('span', { className: 'legend-swatch', style: { background: s.color } }),
            s.label
          )
        );
      }
      legendEl.appendChild(
        el('span', { className: 'legend-item' },
          el('span', { className: 'legend-swatch', style: { background: 'var(--accent-warn)', blockSize: '2px', inlineSize: '16px' } }),
          '25% equal-odds baseline'
        )
      );
    }

    // Grouped SVG Bar Chart
    const allPcts = seriesList.flatMap((s) => s.data.seeds.map((sd) => sd.pct ?? 0));
    const yMax = Math.max(50, Math.ceil((Math.max(...allPcts, 42) + 4) / 10) * 10);
    const W = 860;
    const H = 315;
    const pad = { top: 26, right: 86, bottom: 54, left: 48 };
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;
    const sy = (v) => pad.top + ih - (v / yMax) * ih;

    const svg = svgEl('svg', {
      viewBox: `0 0 ${W} ${H}`,
      role: 'img',
      'aria-label': 'English league play-off promotion rate by seed across tiers',
    });

    for (let pct = 0; pct <= yMax; pct += 10) {
      const py = sy(pct);
      svg.appendChild(svgEl('line', {
        x1: pad.left,
        x2: W - pad.right,
        y1: py,
        y2: py,
        stroke: pct === 0 ? '#8c867a' : '#ede8dd',
        'stroke-width': pct === 0 ? 1.2 : 1,
      }));
      svg.appendChild(svgEl('text', {
        x: pad.left - 8,
        y: py + 4,
        'text-anchor': 'end',
        'font-size': 11,
        fill: '#6e6a61',
        class: 'axis-label',
      }, `${pct}%`));
    }

    // 25% equal-odds dashed baseline with clear right-gutter label
    const y25 = sy(25);
    svg.appendChild(svgEl('line', {
      x1: pad.left,
      x2: W - pad.right,
      y1: y25,
      y2: y25,
      stroke: '#a66314',
      'stroke-width': 1.8,
      'stroke-dasharray': '5 4',
    }));
    svg.appendChild(svgEl('text', {
      x: W - pad.right + 7,
      y: y25 - 1,
      'text-anchor': 'start',
      'font-size': 10,
      'font-weight': 600,
      fill: '#a66314',
    }, '25% equal'));
    svg.appendChild(svgEl('text', {
      x: W - pad.right + 7,
      y: y25 + 11,
      'text-anchor': 'start',
      'font-size': 10,
      'font-weight': 600,
      fill: '#a66314',
    }, 'odds'));

    const seedAxes = [
      { title: '1st Seed', sub: 'Highest · Home 2nd leg' },
      { title: '2nd Seed', sub: '2nd · Home 2nd leg' },
      { title: '3rd Seed', sub: '3rd · Away 2nd leg' },
      { title: '4th Seed', sub: 'Lowest · Away 2nd leg' },
    ];
    const groupW = iw / 4;
    const innerBand = seriesList.length === 1 ? groupW * 0.42 : groupW * 0.80;
    const barGap = seriesList.length > 1 ? 4 : 0;
    const barW = (innerBand - barGap * (seriesList.length - 1)) / seriesList.length;
    const tipMap = new Map();

    seedAxes.forEach((ax, seedIdx) => {
      const gx = pad.left + seedIdx * groupW;
      const startX = gx + (groupW - innerBand) / 2;

      if (seedIdx > 0) {
        svg.appendChild(svgEl('line', {
          x1: gx,
          x2: gx,
          y1: pad.top,
          y2: pad.top + ih,
          stroke: '#f0ece2',
          'stroke-width': 1,
        }));
      }

      seriesList.forEach((ser, serIdx) => {
        const sd = ser.data.seeds[seedIdx];
        const pct = sd.pct ?? 0;
        const bx = startX + serIdx * (barW + barGap);
        const by = sy(pct);
        const bh = Math.max(2, pad.top + ih - by);
        const tid = `s3po-${seedIdx}-${serIdx}`;
        const diff25 = pct - 25;

        tipMap.set(tid, {
          title: `${ax.title} — ${ser.label}`,
          subtitle: `Standard four-team play-offs (${firstStd}–${lastStd})`,
          rows: [
            ['Promoted', `${sd.count} of ${ser.data.total}`],
            ['Promotion rate', `${fmtNum(pct, 1)}%`],
            ['Vs. 25% equal odds', `${fmtSigned(diff25, 1)} percentage pts`],
            ['Median 1st–4th gap', fmtGap(ser.data.gap1to4)],
          ],
        });

        svg.appendChild(svgEl('rect', {
          x: bx.toFixed(1),
          y: by.toFixed(1),
          width: barW.toFixed(1),
          height: bh.toFixed(1),
          fill: ser.color,
          'fill-opacity': ser.isOverall ? '0.92' : '0.82',
          tabindex: '0',
          'data-tip-id': tid,
        }));

        const labelY = Math.max(pad.top + 10, by - 6);
        svg.appendChild(svgEl('text', {
          x: (bx + barW / 2).toFixed(1),
          y: labelY.toFixed(1),
          'text-anchor': 'middle',
          'font-size': seriesList.length >= 4 ? 9.5 : 10.5,
          'font-weight': ser.isOverall ? 700 : 600,
          fill: ser.isOverall ? '#141412' : '#3e3c38',
          stroke: '#fcfbf8',
          'stroke-width': 3.5,
          'paint-order': 'stroke',
          'stroke-linejoin': 'round',
          class: 'axis-label',
        }, `${fmtNum(pct, 1)}%`));
      });

      const cx = gx + groupW / 2;
      svg.appendChild(svgEl('text', {
        x: cx.toFixed(1),
        y: H - 28,
        'text-anchor': 'middle',
        'font-size': 11.5,
        'font-weight': 700,
        fill: '#141412',
      }, ax.title));
      svg.appendChild(svgEl('text', {
        x: cx.toFixed(1),
        y: H - 13,
        'text-anchor': 'middle',
        'font-size': 9.8,
        fill: '#6e6a61',
      }, ax.sub));
    });

    wireDelegatedTooltips(svg, tipMap);
    chartEl.appendChild(svg);

    // Summary Table
    if (tbody) {
      for (const ser of seriesList) {
        const d = ser.data;
        const fmtSeedCell = (sd) => `${fmtNum(sd.pct, 1)}% (${sd.count})`;
        tbody.appendChild(
          el('tr', { className: ser.isOverall ? 'row-summary' : '' },
            el('td', { className: 'text-col', textContent: ser.label }),
            el('td', { textContent: String(d.total) }),
            el('td', { textContent: fmtSeedCell(d.seeds[0]) }),
            el('td', { textContent: fmtSeedCell(d.seeds[1]) }),
            el('td', { textContent: fmtSeedCell(d.seeds[2]) }),
            el('td', { textContent: fmtSeedCell(d.seeds[3]) }),
            el('td', { textContent: `${fmtNum(d.topTwoPct, 1)}% (${d.topTwoCount})` }),
            el('td', { textContent: fmtGap(d.gap1to4) })
          )
        );
      }
    }

    // Footnote
    if (noteEl) {
      const notes = [
        'Covers standard same-division four-team English league play-offs (1988–89 onward; normally 3rd–6th in Tiers 2–3 and 4th–7th in Tier 4, plus restructuring seasons 1990–91 and 1994–95).',
      ];
      if (pb.transitionalCount > 0) {
        notes.push(`Excludes ${pb.transitionalCount} transitional 1986–88 inter-divisional ${plural(pb.transitionalCount, 'promotion')} (three lower-tier clubs plus one higher-tier club, so no 4th seed existed; included in the all-format table above).`);
      }
      if (pb.hasSunderland1990) {
        notes.push('1989–90 Tier 2 officially credits 4th seed Sunderland after 2nd seed Swindon Town won the final 1–0 and were stripped of promotion for financial irregularities.');
      }
      if (pb.hasSouthampton2026) {
        notes.push('2025–26 Tier 2 saw 2nd seed Southampton expelled after the semi-finals for filming opposition training; 3rd seed Middlesbrough were reinstated for the final and defeated 1–0 by 4th seed Hull City.');
      }
      if (isRawMode()) {
        notes.push('Official league tables apply here (unaffected by the on-pitch points toggle).');
      }
      noteEl.textContent = notes.join(' ');
    }
  }

  /* ========================================================================
     SECTION 4: DRAWS ANALYSIS
     ======================================================================== */
  function renderSection4() {
    const m = state.model;
    const sicko = isSicko();
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
    const rawNote = isRawMode()
      ? (sicko ? ' (Observed official finish percentiles held invariant under raw 3W+D toggle.)' : ' (Based on official league tables, unaffected by the on-pitch points toggle.)')
      : '';
    const champText = dl.championCount > 0
      ? dl.championCampaigns.map((c) => `${c.team} (${c.season} Tier ${c.tier}, ${c.won}W–${c.drawn}D–${c.lost}L)`).join('; ')
      : null;

    if (titleEl) {
      if (smallSample) {
        titleEl.textContent = sicko
          ? `Small-Sample Stalemate Leaders (n = ${dl.count})`
          : `Draw Leaders in Selected Scope (${dl.count} Team ${plural(dl.count, 'Season')})`;
      } else if (sicko) {
        titleEl.textContent = dl.championCount > 0
          ? `argmax(D) Tuples Exhibit ${fmtNum(midPct, 0)}% IQR Finish-Percentile Capture—With Just ${dl.championCount} Title Outlier`
          : `argmax(D) Tuples Exhibit ${fmtNum(midPct, 0)}% IQR Finish-Percentile Capture (0 Title Outliers)`;
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
            `Small-sample scope (${dl.slotCount} ${plural(dl.slotCount, sicko ? 'slot' : 'table')}, fewer than three): cross-season medians and percentage shares are suppressed. Draw leaders here: ${listStr}.${rawNote}`
          )
        );
      } else if (sicko) {
        proseEl.append(
          el('p', null,
            `Extracting all slot-level stalemate maximizers (n = ${dl.count} club-seasons across ${dl.slotCount} slots; ${dl.coLeaderSlotsCount} tied co-leader slots violate strict i.i.d. sampling) yields a median normalized finish percentile of `,
            el('strong', { textContent: `${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}%` }),
            ` (${ordinal(dl.pos?.median)} raw rank across K ∈ [20, 24]). Quartile decomposition: `,
            el('strong', { textContent: `${dl.middleHalfCount} (${fmtNum(midPct, 1)}%) in [25%, 75%] IQR` }),
            `, ${dl.bottomQuarterCount} (${fmtNum(botPct, 1)}%) in <25%, and ${dl.topQuarterCount} (${fmtNum(topPct, 1)}%) in >75% — ${dl.relegatedCount} relegated, ${dl.promotedCount} promoted, `,
            champText ? `and ${dl.championCount} title outlier (${champText}).${rawNote}` : `and zero titles.${rawNote}`
          )
        );
      } else {
        const coLeaderNote = dl.coLeaderSlotsCount > 0
          ? ` (${dl.coLeaderSlotsCount} ${plural(dl.coLeaderSlotsCount, 'table')} produced tied co-leaders, so these ${dl.count} team seasons are not all separate tables)`
          : '';
        proseEl.append(
          el('p', null,
            `Draw heavily and the table tends to pull you toward the middle—though never quite as neatly as football clichés suggest. Across ${dl.count} team ${plural(dl.count, 'season')} that led or shared the lead for draws in ${dl.slotCount} ${plural(dl.slotCount, 'table')}${coLeaderNote}, the median finish sat ahead of `,
            el('strong', { textContent: `${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}%` }),
            ` of rivals (roughly ${ordinal(dl.pos?.median)} place in an average division, using a 0%–100% scale so 20- and 24-club leagues sit side by side).`
          ),
          el('p', null,
            `Even so, draw leaders turned up at every end of the table: `,
            el('strong', { textContent: `${dl.middleHalfCount} (${fmtNum(midPct, 1)}%)` }),
            ` landed in the middle half, `,
            el('strong', { textContent: `${dl.bottomQuarterCount} (${fmtNum(botPct, 1)}%)` }),
            ` sank into the bottom quarter, and `,
            el('strong', { textContent: `${dl.topQuarterCount} (${fmtNum(topPct, 1)}%)` }),
            ` climbed into the top quarter. Exactly `,
            el('strong', { textContent: `${dl.relegatedCount}` }),
            ` draw-leading ${dl.relegatedCount === 1 ? 'club was' : 'clubs were'} relegated and `,
            el('strong', { textContent: `${dl.promotedCount}` }),
            ` won promotion. `,
            champText
              ? `Just ${dl.championCount} draw ${plural(dl.championCount, 'leader')} took the title: ${champText}.${rawNote}`
              : `No draw-leading side in scope won the league title.${rawNote}`
          )
        );
        const dl25T1 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T1');
        const dl25T2 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T2');
        const dl25T3 = m.seasonDrawLeaders.find((r) => r.slotId === '2025-26-T3');
        if (dl25T1 && dl25T2 && dl25T3) {
          proseEl.append(
            el('p', null,
              `The 2025–26 season captures that spread in one year: ${dl25T1.team} led the Premier League with ${dl25T1.drawn} draws and still finished ${ordinal(dl25T1.officialPos)}, ${dl25T3.team} led League One with ${dl25T3.drawn} draws and won promotion via the play-offs, and Championship draw leaders ${dl25T2.team} (${dl25T2.drawn} draws, after a 6-point deduction) were relegated.`
            )
          );
        } else if (dl25T1) {
          proseEl.append(
            el('p', null,
              `In 2025–26, ${dl25T1.team} drew ${dl25T1.drawn} of 38 Premier League matches—nearly half their schedule—yet still finished ${ordinal(dl25T1.officialPos)}.`
            )
          );
        } else if (dl25T2 && dl25T3) {
          proseEl.append(
            el('p', null,
              `In 2025–26, draw leaders went in opposite directions: ${dl25T3.team} led League One with ${dl25T3.drawn} draws and won promotion, while Championship draw leaders ${dl25T2.team} (${dl25T2.drawn} draws, after a 6-point deduction) were relegated.`
            )
          );
        }
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, sicko ? 'argmax(D) tuples' : 'Draw-leading clubs', dl.coLeaderSlotsCount > 0 ? `${dl.count} across ${dl.slotCount} ${plural(dl.slotCount, sicko ? 'slot' : 'table')}` : String(dl.count));
      appendKV(calloutEl, sicko ? 'Med. finish % Pct' : 'Median finish', smallSample && dl.count === 1 ? `${ordinal(dl.pos?.min)} (${fmtNum((dl.finishScore?.min ?? 0) * 100, 1)}%)` : `${ordinal(dl.pos?.median)} (${sicko ? '' : 'ahead of '}${fmtNum((dl.finishScore?.median ?? 0) * 100, 1)}%)`, 'highlight');
      appendKV(calloutEl, sicko ? 'IQR [25%–75%] capture' : 'Middle half (25%–75%)', `${dl.middleHalfCount} / ${dl.count} (${fmtNum(midPct, 1)}%)`);
      appendKV(calloutEl, sicko ? 'Upper / lower quartile' : 'Top / bottom quarter', `${dl.topQuarterCount} / ${dl.bottomQuarterCount}`);
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

    const sicko = isSicko();
    if (sa.status === 'unavailable') {
      const unavailText = sicko
        ? 'Missing-not-at-random (MNAR) scorer coverage boundary: verified Golden Boot and club leading-scorer vectors exist solely for Tier 1 Premier League (1992–93..2025–26). Pre-1992 T1 and T2–T4 slots lack uniform source coverage and are strictly non-imputed.'
        : 'Verified Golden Boot and club top-scorer records cover the Premier League (1992–93 to 2025–26) only. Pre-1992 First Division seasons and Tiers 2–4 lack uniform club-level scorer tables in our verified sources, so nothing is estimated or filled in.';
      if (titleEl) {
        titleEl.textContent = sicko
          ? 'Scorer Concentration Estimators Gated Outside Verified PL Strata (1992–2026)'
          : 'Top-Scorer Records Are Unavailable Outside the Premier League (1992–2026)';
      }
      if (proseEl) {
        clearEl(proseEl);
        proseEl.append(el('p', { textContent: unavailText }));
      }
      if (calloutEl) {
        clearEl(calloutEl);
        appendKV(calloutEl, sicko ? 'Verified scorer slots' : 'Verified scorer tables', `0 of ${m.numSlots}`, 'highlight');
        appendKV(calloutEl, sicko ? 'Imputation policy' : 'Coverage policy', sicko ? 'PL 1992–2026 only (zero-fill refused)' : 'Premier League 1992–2026 only (no estimates)');
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
        scopeBanner.textContent = sicko
          ? `Coverage gate: Restricting to n = ${sa.availableSlotsCount} verified PL scorer slots (1992–93..2025–26). ${sa.unavailableSlotsCount} pre-1992/EFL ${plural(sa.unavailableSlotsCount, 'slot')} explicitly excluded rather than zero-imputed.`
          : `Coverage note: Showing ${sa.availableSlotsCount} verified Premier League ${plural(sa.availableSlotsCount, 'season')} (1992–93 to 2025–26). ${sa.unavailableSlotsCount} pre-1992 or lower-tier ${plural(sa.unavailableSlotsCount, 'table')} in your filter ${sa.unavailableSlotsCount === 1 ? 'is' : 'are'} omitted because matching club scorer records are not available.`;
      } else {
        scopeBanner.hidden = true;
      }
    }

    const ss = sa.shareStats;
    const pctWithGb = ((sa.champWithGbCount / Math.max(1, sa.availableSlotsCount)) * 100).toFixed(1);
    const pctWithoutGb = (100 - Number(pctWithGb)).toFixed(0);
    if (titleEl) {
      if (sicko) {
        titleEl.textContent = `Weak Point-Biserial Covariance: ${sa.champWithGbCount}/${sa.availableSlotsCount} (${pctWithGb}%) Verified PL Champions Housed the Golden Boot (r_pb = ${fmtSigned(ss.rGbChampAll, 3)})`;
      } else {
        titleEl.textContent = sa.champWithGbCount === 0
          ? `None of the ${sa.availableSlotsCount} Verified Premier League Champions Fielded the Golden Boot Winner`
          : sa.champWithGbCount === sa.availableSlotsCount
            ? `All ${sa.availableSlotsCount} Verified Premier League Champions Fielded the Golden Boot Winner`
            : `In ${pctWithoutGb}% of Verified Premier League Seasons, the Champion Did Not Field the Golden Boot Winner`;
      }
    }
    if (proseEl) {
      clearEl(proseEl);
      const rawNote = isRawMode()
        ? (sicko ? ' (Official PL standings invariant under counterfactual raw 3W+D mode.)' : ' (Based on official Premier League tables, unaffected by the on-pitch points toggle.)')
        : '';
      if (sicko) {
        proseEl.append(
          el('p', null,
            `Restricting strictly to the n = ${sa.availableSlotsCount} verified Tier 1 Premier League slots (1992–93..2025–26; zero-imputation explicitly enforced across ${sa.unavailableSlotsCount} unverified pre-1992/EFL slots), `,
            el('strong', { textContent: `${sa.champWithGbCount}/${sa.availableSlotsCount} (${pctWithGb}%)` }),
            ` pos=1 tuples included the League Golden Boot recipient (point-biserial r_pb(GB, I(pos=1)) = ${fmtSigned(ss.rGbChampAll, 3)}; r_pb(GB, officialPPG) = ${fmtSigned(ss.rGbPpgAll, 3)}).`
          ),
          el('p', null,
            `Across the Top-4 concentration subsample (n = ${sa.top4Teams.length} club-seasons), pos=1 exhibits lower median single-scorer goal share (`,
            el('strong', { textContent: `${fmtNum(ss.champ?.median, 1)}%` }),
            `, IQR [${fmtNum(ss.champ?.q1, 1)}%, ${fmtNum(ss.champ?.q3, 1)}%]) than pos ∈ {3, 4} (`,
            el('strong', { textContent: `${fmtNum(ss.thirdFourth?.median, 1)}%` }),
            `), yielding bivariate r(share, officialPPG) = ${fmtSigned(ss.rSharePpgTop4, 3)} — purely descriptive, zero causal identification.${rawNote}`
          )
        );
      } else {
        proseEl.append(
          el('p', null,
            `You do not need the division’s top marksman to lift the trophy. Across ${sa.availableSlotsCount} verified Premier League ${plural(sa.availableSlotsCount, 'season')} (1992–93 to 2025–26), only `,
            el('strong', { textContent: `${sa.champWithGbCount} of ${sa.availableSlotsCount} (${pctWithGb}%)` }),
            ` champions fielded the Golden Boot winner (linear link between fielding the Golden Boot winner and winning the title: ${fmtSigned(ss.rGbChampAll, 3)}).`
          ),
          el('p', null,
            `Spread the goals around and the pattern gets clearer still: among top-four clubs (${ss.champ?.count ?? 0} champions, ${ss.runner?.count ?? 0} runners-up, and ${ss.thirdFourth?.count ?? 0} third- and fourth-place finishers), champions leaned slightly less on a single scorer than third- and fourth-place sides—a median `,
            el('strong', { textContent: `${fmtNum(ss.champ?.median, 1)}%` }),
            ' of team goals against ',
            el('strong', { textContent: `${fmtNum(ss.thirdFourth?.median, 1)}%` }),
            ` (linear link between top-scorer share and official points per game: ${fmtSigned(ss.rSharePpgTop4, 3)}; descriptive only).${rawNote}`
          )
        );
      }
      const s25Pl = m.slots.find((s) => s.slotId === '2025-26-T1');
      if (s25Pl && sa.availableSlotsCount >= 3) {
        const c25 = s25Pl.enrichedTable[0];
        const ru25 = s25Pl.enrichedTable[1];
        if (c25?.topScorer && ru25?.topScorer) {
          const cShare = fmtNum((c25.topScorer.goals / c25.gf) * 100, 1);
          const ruShare = fmtNum((ru25.topScorer.goals / ru25.gf) * 100, 1);
          proseEl.append(
            el('p', null,
              sicko
                ? `2025–26 verification tuple: pos=1 ${c25.team} logged top-scorer share ${cShare}% (${c25.topScorer.player}: ${c25.topScorer.goals}/${c25.gf} GF) vs pos=2 ${ru25.team} at ${ruShare}% (Golden Boot ${ru25.topScorer.player}: ${ru25.topScorer.goals}/${ru25.gf} GF).`
                : `The 2025–26 season illustrates that pattern cleanly: ${c25.team} won the title with ${c25.topScorer.player} supplying ${c25.topScorer.goals} of their ${c25.gf} goals (${cShare}%), while runner-up ${ru25.team}’s ${ru25.topScorer.player} won the Golden Boot with ${ru25.topScorer.goals} of their ${ru25.gf} (${ruShare}%).`
            )
          );
        }
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, sicko ? 'Verified scorer slots' : 'Verified scorer tables', `${sa.availableSlotsCount} (PL 1992–2026)`);
      appendKV(calloutEl, sicko ? 'pos=1 w/ Golden Boot' : 'Champions with Golden Boot', `${sa.champWithGbCount} / ${sa.availableSlotsCount} (${pctWithGb}%)`, 'highlight');
      appendKV(calloutEl, sicko ? 'pos=1 Med. Goal Share' : 'Champion top-scorer share', `${fmtNum(ss.champ?.median, 1)}% median`);
      appendKV(calloutEl, sicko ? 'pos∈{3,4} Med. Share' : '3rd–4th top-scorer share', `${fmtNum(ss.thirdFourth?.median, 1)}% median`);
      appendKV(calloutEl, sicko ? 'Top-4 r(share, PPG)' : 'Share vs. points link (Top 4)', fmtSigned(ss.rSharePpgTop4, 3));
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
        { label: '5th+', n: sa.gbInstances.filter((x) => x.pos >= 5).length, col: '#8b8578' },
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
    const introProse = document.getElementById('sec6-intro-prose');
    if (introProse) {
      clearEl(introProse);
      if (isSicko()) {
        introProse.append(
          'Inspect any of the ',
          el('strong', { id: 'archive-season-count', textContent: String(m.numSlots) }),
          ' JSON-serialized tier-season slots in your active slice. Joins bind on invariant pyramid tier ∈ {1..4} while preserving historical division strings and per-slot tie-break rules.'
        );
      } else {
        introProse.append(
          'Browse any of the ',
          el('strong', { id: 'archive-season-count', textContent: String(m.numSlots) }),
          ' league tables in your current filter. Each season uses its historical division name rather than modern rebrands.'
        );
      }
    }

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
      appendKV(sumList, 'Golden Boot', slot.scorerCoverage === 'verified_pl_complete' ? `${(slot.goldenBootWinners || []).map((w) => w.player).join(' / ')} (${slot.goldenBootGoals})` : 'Unavailable (Premier League 1992–2026 only)');
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
          el('td', { colSpan: 5, className: 'text-col table-note-cell', textContent: `Scorer chart unavailable for ${slot.season} ${slot.historicalDivisionName}. Verified top-scorer records in this static archive cover Premier League (Tier 1, 1992–93 to 2025–26) only.` })
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
    const sicko = isSicko();
    const sourcesList = Array.isArray(meta.sources) ? meta.sources : [];
    const elv = sourcesList.find((s) => s.id === 'elvidge') || {};
    const proseEl = document.getElementById('sec7-prose');
    const calloutEl = document.getElementById('sec7-callout-list');
    const footerEl = document.getElementById('footer-verification-note');

    if (proseEl) {
      clearEl(proseEl);
      if (sicko) {
        proseEl.append(
          el('p', null,
            el('strong', { textContent: 'Deterministic Match-Level ETL (CC BY 4.0): ' }),
            elv.attribution || 'Sean Elvidge — England-football-results (CC BY 4.0).',
            elv.pinnedCommitSha ? ' Pinned SHA ' : '',
            elv.pinnedCommitSha ? el('code', { textContent: elv.pinnedCommitSha.slice(0, 12) }) : '',
            `. All ${meta.totalTierSeasonSlots ?? 180} JSON-validated tier-season slots (${fmtInt(meta.totalMatchesPlayed)} matches, ${fmtInt(meta.totalGoalsScored)} goals; schemaVersion ${state.dataset.schemaVersion}) are aggregated deterministically from raw fixture scores—strictly excluding forecast/Elo columns and enforcing exact ∑W = ∑L, ∑GF = ∑GA conservation laws.`
          ),
          el('p', null,
            el('strong', { textContent: 'Cross-Source Reconciliation & Residual Audit: ' }),
            `Triangulated against RSSSF (1981–2026) and football-data.co.uk E0–E3 CSVs (1993–2026) to lock 62 point-deduction audit rows, expunged records (Aldershot 1991–92), Bury’s 2019–20 expulsion, and historical GF-over-GD tie-break rules (1992–99 T2–T4). Exactly 46 minor single-goal Elvidge-vs-RSSSF residuals are logged verbatim in coverage-manifest.json rather than silently overwritten.`
          ),
          el('p', null,
            el('strong', { textContent: 'Estimator Specification & Boundary Guards: ' }),
            'Section 1 pairs within-slot demeaned median(|r_finish|) (plus signed median r so Jensen’s inequality on sign-flipping D/G stays transparent) with stacked cross-sectional OLS R²(PPG). Counterfactual raw 3W+D mode mutates PPG/finishScore in Section 1 and archive points while freezing official standings, titles, play-offs, and survival boundaries. Closed-set outcomeType enums isolate reprieved/expelled boundary rows (e.g., Stevenage 2019–20 T4) from lowest merit survivor estimation.'
          ),
          el('p', null,
            el('strong', { textContent: 'Lucas-Critique Floor (1981–82): ' }),
            'Pre-1981 two-point-for-a-win tables are omitted rather than naively rescaled via 3W+D because counterfactual point remapping ignores endogenous tactical equilibrium shifts toward victory-seeking risk. Right-censored post-2025–26 fixtures are strictly gated.'
          )
        );
      } else {
        proseEl.append(
          el('p', null,
            el('strong', { textContent: 'Primary match records (CC BY 4.0): ' }),
            elv.attribution || 'Sean Elvidge — England-football-results (CC BY 4.0).',
            elv.pinnedCommitSha ? ' Pinned commit ' : '',
            elv.pinnedCommitSha ? el('code', { textContent: elv.pinnedCommitSha.slice(0, 12) }) : '',
            `. All ${meta.totalTierSeasonSlots ?? 180} league tables (${fmtInt(meta.totalMatchesPlayed)} matches, ${fmtInt(meta.totalGoalsScored)} goals) are built directly from historical match scores, with no predictive models or ratings.`
          ),
          el('p', null,
            el('strong', { textContent: 'Independent checks and known differences: ' }),
            `RSSSF English league tables (1981–82 to 2025–26) and football-data.co.uk match records (1993–94 to 2025–26) were used to verify every points deduction, appeal, expunged record (Aldershot 1991–92), club expulsion (Bury 2019–20), and the Football League’s goals-scored-before-goal-difference tie-breaker (1992–93 to 1998–99 in Tiers 2–4). Across ${fmtInt(meta.totalMatchesPlayed)} matches, 46 minor historical single-goal discrepancies between RSSSF and Elvidge are logged in the project manifest rather than papered over.`
          ),
          el('p', null,
            el('strong', { textContent: 'How the numbers work: ' }),
            'Section 1 shows two complementary measures: how strongly each stat tracks final table position inside each individual league (averaged via the median across tables on a 0-to-1 scale, alongside the signed median so flips in direction—as with draws—stay visible), and how much variation in points per game it tracks when every club is pooled together. Attack and defence can legitimately order differently between those two views. Switching Points Basis to Raw (3W+D) strips out points deductions in Section 1 and the archive’s points columns while keeping official titles, promotions, play-offs and survival lines fixed. Clubs spared relegation by a reprieve, withdrawal or expulsion are tagged separately so they never distort the lowest merit survivor.'
          ),
          el('p', null,
            el('strong', { textContent: 'Why the study starts in 1981–82: ' }),
            'English football adopted three points for a win across all four top tiers in 1981–82. Earlier two-point seasons are left out because recalculating old tables under three points cannot replay how teams would have played for a win instead of a draw. Only completed seasons through 2025–26 are included.'
          )
        );
      }
    }

    if (calloutEl) {
      clearEl(calloutEl);
      appendKV(calloutEl, sicko ? 'Tier-Season Slots' : 'League tables', `${meta.totalTierSeasonSlots ?? '—'} (${meta.completedSlots ?? '—'} completed + ${meta.curtailedSlots ?? '—'} curtailed)`);
      appendKV(calloutEl, sicko ? 'Team-Seasons / Matches' : 'Team seasons / matches', `${fmtInt(meta.totalTeamSeasons)} / ${fmtInt(meta.totalMatchesPlayed)}`);
      appendKV(calloutEl, 'Match file SHA-256', elv.sha256?.EnglandLeagueResults ? elv.sha256.EnglandLeagueResults.slice(0, 16) + '…' : 'N/A');
      appendKV(calloutEl, 'Scorer coverage', meta.scorerCoverageSummary ? `${meta.scorerCoverageSummary.verifiedSlots} verified / ${meta.scorerCoverageSummary.unavailableSlots} unavailable` : 'N/A');
      appendKV(calloutEl, sicko ? 'Right-censored fixtures gated' : 'Excluded future seasons', Array.isArray(meta.excludedFutureSeasons) ? meta.excludedFutureSeasons.join(', ') : '2026/2027+');
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
    applyVoiceChrome();
    syncScopeControlsUI();
    renderMastheadAndBanner();
    renderSection7Methodology();

    const emptyPanel = document.getElementById('empty-scope-panel');
    const emptyMsgEl = document.getElementById('empty-scope-message');
    const sections = document.querySelectorAll('#main-content > section.analysis-section, #key-takeaways, #ledger');
    if (state.model.isEmpty) {
      if (emptyMsgEl) {
        emptyMsgEl.textContent = state.model.excludedCurtailedSlots?.length > 0
          ? `All ${state.model.excludedCurtailedSlots.length} matching ${plural(state.model.excludedCurtailedSlots.length, isSicko() ? 'slot' : 'table')} (${state.model.excludedCurtailedSlots.map((s) => `${s.season} ${s.historicalDivisionName}`).join(' and ')}) were curtailed and excluded by default. Enable "Include Curtailed" above or broaden your year/tier filter.`
          : 'Select at least one league tier (1–4) or broaden your year range to inspect historical league tables.';
      }
      renderKeyTakeaways();
      renderLedger();
      if (emptyPanel) emptyPanel.hidden = false;
      sections.forEach((sec) => { if (sec.id !== 'sec-methodology') sec.hidden = true; });
      return;
    }

    if (emptyPanel) emptyPanel.hidden = true;
    sections.forEach((sec) => { sec.hidden = false; });

    renderKeyTakeaways();
    renderLedger();
    renderSection1();
    renderSection2();
    renderSection3();
    renderSection4();
    renderSection5();
    renderArchive();

    // Curtailed-aware season-length captions (rendered after voice chrome so the override sticks)
    const curtOn = (state.model?.includedCurtailedSlots?.length ?? 0) > 0;
    const sec2Sub = document.getElementById('sec2-tbl-sub');
    if (sec2Sub) {
      sec2Sub.textContent = isSicko()
        ? (curtOn
          ? 'Per-match normalization removes schedule heteroskedasticity (completed 38g–46g plus curtailed 34g–37g strata)'
          : 'Per-match normalization removes 38g vs. 46g schedule heteroskedasticity')
        : (curtOn
          ? 'Per-game rates compare completed 38- to 46-game seasons and the curtailed 34–37-game 2019–20 tables on equal footing'
          : 'Per-game rates compare completed 38- to 46-game seasons on equal footing');
    }
  }

  function setVoiceMode(mode) {
    const next = mode === 'sicko' ? 'sicko' : 'normal';
    if (state.voiceMode === next) return;
    state.voiceMode = next;
    renderAll();
    const statusEl = document.getElementById('table-sort-status');
    if (statusEl) {
      statusEl.textContent = next === 'sicko'
        ? 'Statistics Sicko Mode enabled.'
        : 'Normal Person Mode enabled.';
    }
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
    document.querySelectorAll('[data-voice-mode]').forEach((btn) => {
      btn.addEventListener('click', () => setVoiceMode(btn.dataset.voiceMode));
    });

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
      updateScope({ ...CA.PRESETS['pl-1992-2026'] });
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
    } catch (err) {
      showFatalError(err?.message || 'Unable to load or validate league dataset.');
    }
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.ChampionshipLedger = { describeAtkVsDef, buildLedgerView, buildTakeawaysView };
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }
})();
