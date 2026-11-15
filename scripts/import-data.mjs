import fs from 'node:fs';
import path from 'node:path';
import {
  PINNED_ELVIDGE_SHA,
  displayClubName,
  extractWinnerFromPlayoffText,
  formatSeasonLabel,
  historicalDivisionName,
  normalizeClubKey,
  parseCsv,
  parseRsssfFlaSeason,
  parseRsssfTableseSeason,
  presentDayTierLabel,
  sha256File,
  sha256String,
  slugifyClubId,
  sortStandings,
} from './reconcile-helpers.mjs';

const REPO_DIR = process.cwd();
const CACHE_ROOT = path.join(REPO_DIR, '.cache/sources');
const ELVIDGE_DIR = path.join(CACHE_ROOT, `elvidge_${PINNED_ELVIDGE_SHA.slice(0, 7)}`);
const RSSSF_FLA_DIR = path.join(CACHE_ROOT, 'rsssf/fla');
const RSSSF_TE_DIR = path.join(CACHE_ROOT, 'rsssf/tablese');
const FD_DIR = path.join(CACHE_ROOT, 'football-data');

const START_YEAR = 1981;
const args = process.argv.slice(2);
const doFetch = args.includes('--fetch');
const endYearArg = args.find((a) => a.startsWith('--end-year='));
const END_YEAR = endYearArg ? Number(endYearArg.split('=')[1]) : 2024;
if (!Number.isInteger(END_YEAR) || END_YEAR < START_YEAR || END_YEAR > 2025) {
  throw new Error(`Invalid --end-year value: ${END_YEAR}`);
}

const OUT_JSON = path.join(REPO_DIR, 'data/england-tiers-1-4-1981-2025.json');
const OUT_BUNDLE = path.join(REPO_DIR, 'data/england-tiers-1-4-1981-2025-bundle.js');
const OUT_MANIFEST = path.join(REPO_DIR, 'data/coverage-manifest.json');
const PL_BASELINE_PATH = path.join(REPO_DIR, 'data/premier-league-1992-2025.json');

// Sourced outcomes for clubs with no next-season league membership (sy < END_YEAR && nextTier === null).
// Tiers 1-3 missing next-season membership MUST appear here or the importer fails loudly.
// Note: Wimbledon (2003-04) was renamed/relocated as Milton Keynes Dons in 2004-05; we keep
// wimbledon, milton-keynes-dons, and afc-wimbledon as three distinct clubIds without settling naming disputes.
const MISSING_NEXT_TIER_OUTCOMES = new Map([
  ['2003|2|wimbledon', {
    promoted: false,
    relegated: true,
    administrativeOutcome: 'Finished 24th (relegated to 2004-05 Football League One); renamed and relocated as Milton Keynes Dons ahead of 2004-05 (kept distinct from both MK Dons and AFC Wimbledon in club identity records).',
    source: 'RSSSF 2003-04.html & Wikipedia 2003-04 Football League First Division',
  }],
  ['1990|4|aldershot', {
    promoted: false,
    relegated: false,
    administrativeOutcome: 'Finished 23rd (not relegated during League restructuring); remained in 1991-92 Fourth Division before withdrawing/folding in March 1992 with all 1991-92 results expunged.',
    source: 'RSSSF 1990-91.html & 1991-92.html',
  }],
  ['1991|4|maidstone united', {
    promoted: false,
    relegated: false,
    administrativeOutcome: 'Finished 18th (not relegated); resigned from the Football League in August 1992 prior to 1992-93 fixtures.',
    source: 'RSSSF 1991-92.html',
  }],
  ['2006|4|boston united', {
    promoted: false,
    relegated: true,
    administrativeOutcome: 'Relegated two divisions to Conference North due to CVA/administration (-10 final-day penalty).',
    source: 'RSSSF 2006-07.html & Wikipedia/EFL',
  }],
  ['2018|4|bury', {
    promoted: true,
    relegated: false,
    administrativeOutcome: 'Finished 2nd (promoted on final table); expelled from EFL in August 2019 before playing in 2019-20 League One.',
    source: 'RSSSF eng2019.html & Wikipedia/EFL',
  }],
]);

// Known non-relegating Tier 4 seasons (0 clubs relegated to non-league)
const NON_RELEGATING_TIER4_START_YEARS = new Set([1981, 1982, 1983, 1984, 1985, 1990, 1991, 1993, 1994, 1995]);

// Verified adjustments where official EFL tables differ from RSSSF tablese/fla (audited against Wikipedia + EFL rulings):
const VERIFIED_ADJUSTMENT_OVERRIDES = new Map([
  // key: `${startYear}|${tier}|${normKey}` -> { signedAdjustment, note }
  ['2005|4|bury', { signedAdjustment: -1, note: 'Verified via Wikipedia/EFL (RSSSF omitted -1 for fielding unregistered loanee Colin Marrison)' }],
  ['2006|4|boston united', { signedAdjustment: -10, note: 'Verified via Wikipedia/EFL (RSSSF omitted -10 administration deduction; relegated to Conference North)' }],
  ['2008|2|crystal palace', { signedAdjustment: -1, note: 'Verified via Wikipedia/EFL (RSSSF omitted -1 for fielding ineligible Rui Fonte)' }],
  ['2009|3|hartlepool united', { signedAdjustment: -3, note: 'Verified via Wikipedia/EFL (RSSSF eng2010 omitted -3 for fielding ineligible Gary Liddle and misranked 16th/22nd-23rd)' }],
  ['2012|3|portsmouth', { signedAdjustment: -10, note: 'Verified via Wikipedia/EFL (RSSSF eng2013 omitted -10 administration exit penalty)' }],
  ['2015|3|bury', { signedAdjustment: -3, note: 'Verified via Wikipedia/EFL (RSSSF eng2016 omitted retrospective -3 penalty applied July 2016 for Callum Styles)' }],
  ['2022|2|wigan athletic', { signedAdjustment: -6, note: 'Verified via Wikipedia/EFL (RSSSF eng2023 listed only -3 of two -3 penalties totaling -6)' }],
  ['2023|4|morecambe', { signedAdjustment: -3, note: 'Verified via Wikipedia/EFL (RSSSF eng2024 omitted -3 wage payment penalty)' }],
]);

// Known historical structural & exception notes keyed by `${startYear}|${tier}`
const SLOT_EXCEPTION_NOTES = new Map([
  ['1981|3', '1981-82 League Division 3: First season of 3 points for a win; champions Burnley (21W, 17D, 8L = 80 pts, +21 GD) finished ahead of runners-up Carlisle United (23W, 11D, 12L = 80 pts, +15 GD) despite fewer wins.'],
  ['1986|2', 'Transitional 1986-87 promotion/relegation play-offs included First Division 19th-placed Charlton Athletic, who defeated Second Division 4th-placed Leeds United to retain their top-flight place.'],
  ['1987|1', 'League Division 1 temporarily contracted from 22 to 21 clubs in 1987-88 (42 games -> 40 games) and then to 20 clubs for 1988-89; 18th-placed Chelsea entered the Second Division play-offs and were relegated.'],
  ['1987|2', 'League Division 2 temporarily stood at 23 clubs (44 games) during Football League restructuring; 3rd-placed Middlesbrough beat First Division 18th-placed Chelsea in the play-offs to earn promotion.'],
  ['1990|1', 'Football League First Division bottom two (19th-20th) relegated as the top flight expanded back to 22 clubs for 1991-92.'],
  ['1990|2', 'Top three clubs promoted automatically plus 4th-placed play-off winner Notts County (four promotions total) as the top tier expanded from 20 to 22 clubs.'],
  ['1990|3', 'Top three clubs promoted automatically plus 5th-placed play-off winner Tranmere Rovers (four promotions) while 22nd-24th relegated (only 3 down) during restructuring.'],
  ['1990|4', '1990-91 League Division 4: Four automatic promotion places plus 7th-placed play-off winner Torquay United (five promotions); zero clubs relegated (23rd-placed Aldershot and 24th-placed Wrexham retained ahead of Aldershot\'s mid-1991-92 withdrawal).'],
  ['1991|4', 'Aldershot withdrew after 36 matches (folded 25 March 1992) and all their Football League results were expunged, leaving 22 completed teams (42 matches each) and no bottom-club relegation.'],
  ['1992|1', 'Inaugural FA Premier League season (22 clubs, 42 games); Football League Division One became Tier 2.'],
  ['1992|4', 'Maidstone United resigned from the Football League in August 1992 before playing a fixture, leaving Football League Third Division (Tier 4) with 22 teams (42 matches each). Tie-break in Football League Tiers 2-4 from 1992-93 to 1998-99 ranked GF ahead of GD.'],
  ['1993|4', 'Northampton Town (22nd) were reprieved from relegation because Conference champions Kidderminster Harriers failed League ground-grading standards.'],
  ['1994|1', 'Premier League contracted from 22 to 20 clubs after 1994-95: four teams (19th-22nd) were relegated.'],
  ['1994|2', 'Only two teams promoted (champions Middlesbrough automatically plus 3rd-placed play-off winners Bolton Wanderers) because of the Premier League contraction from 22 to 20 clubs.'],
  ['1994|3', 'Only two teams promoted (Birmingham City and play-off winners Huddersfield Town) while five teams (20th-24th) were relegated during Pyramid contraction.'],
  ['1994|4', 'Exeter City (22nd) were reprieved from relegation because Conference champions Macclesfield Town failed League ground-grading standards. Division expanded back to 24 teams for 1995-96.'],
  ['1995|4', 'Torquay United (24th) were reprieved from relegation because Conference champions Stevenage Borough failed League ground-grading standards.'],
  ['2006|4', 'Boston United (23rd after a final-day 10-point administration penalty) were relegated two divisions directly to the Conference North alongside 24th-placed Torquay United.'],
  ['2019|3', 'Curtailed due to COVID-19: Bury were expelled before playing a fixture (leaving 23 active teams), and remaining clubs were ranked on unweighted points per game (34-36 matches played). Play-offs still took place; 3rd-placed Wycombe Wanderers (1.735 PPG vs Oxford United 1.714 PPG) won the final.'],
  ['2019|4', 'Curtailed due to COVID-19: final table ranked on unweighted PPG (36-37 matches played). Only bottom club Macclesfield Town (-17 points deducted net of appeals & August 2020 arbitration ruling) were relegated; 23rd-placed Stevenage were reprieved due to Bury\'s Tier 3 expulsion. Play-offs still took place; 7th-placed Northampton Town won promotion.'],
]);

async function fetchIfMissing(url, outPath) {
  if (!doFetch && fs.existsSync(outPath)) return;
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) return;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TheChampionshipFormulaImporter/2.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

async function ensureUpstreamCache() {
  const rawBase = `https://raw.githubusercontent.com/seanelvidge/England-football-results/${PINNED_ELVIDGE_SHA}`;
  const elvFiles = [
    'LICENCE.md',
    'README.md',
    'EnglandLeagueNames.csv',
    'EnglishTeamPointDeductions.csv',
    'EnglishTeamNamePeriods.csv',
    'EnglishTeamActivePeriods.csv',
    'EnglandLeagueResults.csv',
  ];
  for (const f of elvFiles) {
    await fetchIfMissing(`${rawBase}/${f}`, path.join(ELVIDGE_DIR, f));
  }
  for (let sy = START_YEAR; sy <= END_YEAR; sy++) {
    if (sy <= 2007) {
      const fname = `${sy}-${String((sy + 1) % 100).padStart(2, '0')}.html`;
      await fetchIfMissing(`https://www.rsssf.org/engpaul/FLA/${fname}`, path.join(RSSSF_FLA_DIR, fname));
    } else {
      const endY = sy + 1;
      const f4 = path.join(RSSSF_TE_DIR, `eng${endY}.html`);
      const f2 = path.join(RSSSF_TE_DIR, `eng${String(endY).slice(-2)}.html`);
      if (!fs.existsSync(f4) && !fs.existsSync(f2)) {
        try {
          await fetchIfMissing(`https://www.rsssf.org/tablese/eng${endY}.html`, f4);
        } catch {
          await fetchIfMissing(`https://www.rsssf.org/tablese/eng${String(endY).slice(-2)}.html`, f2);
        }
      }
    }
    if (sy >= 1993) {
      const code = String(sy).slice(-2) + String(sy + 1).slice(-2);
      for (const div of ['E0', 'E1', 'E2', 'E3']) {
        await fetchIfMissing(`https://www.football-data.co.uk/mmz4281/${code}/${div}.csv`, path.join(FD_DIR, `${code}/${div}.csv`));
      }
    }
  }
}

await ensureUpstreamCache();

// Read cached sources
const resultsPath = path.join(ELVIDGE_DIR, 'EnglandLeagueResults.csv');
const dedPath = path.join(ELVIDGE_DIR, 'EnglishTeamPointDeductions.csv');
const namePeriodsPath = path.join(ELVIDGE_DIR, 'EnglishTeamNamePeriods.csv');
const plBaseline = JSON.parse(fs.readFileSync(PL_BASELINE_PATH, 'utf8'));

const elvMatchesRaw = parseCsv(fs.readFileSync(resultsPath, 'utf8'));
const dedRowsRaw = parseCsv(fs.readFileSync(dedPath, 'utf8'));
const namePeriodsRaw = parseCsv(fs.readFileSync(namePeriodsPath, 'utf8'));

// Build match aggregates from Elvidge CSV for START_YEAR..END_YEAR (strictly exclude future/ongoing seasons > END_YEAR)
const elvSlots = new Map();
const seenMatchKeys = new Set();
const excludedFutureSeasons = new Set();

for (const r of elvMatchesRaw) {
  const m = /^(\d{4})[\/-](\d{2,4})$/.exec(r.Season);
  if (!m) continue;
  const sy = Number(m[1]);
  if (sy < START_YEAR) continue;
  if (sy > END_YEAR) {
    excludedFutureSeasons.add(r.Season);
    continue;
  }
  const tier = Number(r.Tier);
  const hg = Number(r.hGoal);
  const ag = Number(r.aGoal);
  if (![1, 2, 3, 4].includes(tier) || !Number.isInteger(hg) || !Number.isInteger(ag) || hg < 0 || ag < 0) {
    throw new Error(`Invalid match row in Elvidge CSV: ${JSON.stringify(r)}`);
  }
  const mk = `${r.Date}|${r.HomeTeam}|${r.AwayTeam}|${tier}`;
  if (seenMatchKeys.has(mk)) {
    throw new Error(`Duplicate match key: ${mk}`);
  }
  seenMatchKeys.add(mk);

  const key = `${sy}|${tier}`;
  if (!elvSlots.has(key)) {
    elvSlots.set(key, { sy, tier, divisionRaw: r.Division, matchCount: 0, totalGoals: 0, teams: new Map() });
  }
  const slot = elvSlots.get(key);
  slot.matchCount++;
  slot.totalGoals += hg + ag;

  const ensureTeam = (name) => {
    if (!slot.teams.has(name)) {
      slot.teams.set(name, {
        elvName: name,
        normKey: normalizeClubKey(name, sy),
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0,
      });
    }
    return slot.teams.get(name);
  };
  const h = ensureTeam(r.HomeTeam);
  const a = ensureTeam(r.AwayTeam);
  h.played++; a.played++;
  h.gf += hg; h.ga += ag;
  a.gf += ag; a.ga += hg;
  if (hg > ag) { h.won++; a.lost++; }
  else if (hg < ag) { a.won++; h.lost++; }
  else { h.drawn++; a.drawn++; }
}

// Parse football-data 1993-2024 for cross-source verification
const fdSlots = new Map();
for (let sy = 1993; sy <= END_YEAR; sy++) {
  const code = String(sy).slice(-2) + String(sy + 1).slice(-2);
  for (let tier = 1; tier <= 4; tier++) {
    const csvPath = path.join(FD_DIR, `${code}/E${tier - 1}.csv`);
    if (!fs.existsSync(csvPath)) continue;
    const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
    const teams = new Map();
    for (const r of rows) {
      if (!r.HomeTeam || !r.AwayTeam) continue;
      const hg = Number(r.FTHG ?? r.HG);
      const ag = Number(r.FTAG ?? r.AG);
      const get = (n) => {
        const nk = normalizeClubKey(n, sy);
        if (!teams.has(nk)) teams.set(nk, { fdNames: new Set([n]), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 });
        teams.get(nk).fdNames.add(n);
        return teams.get(nk);
      };
      const h = get(r.HomeTeam);
      const a = get(r.AwayTeam);
      h.played++; a.played++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
      if (hg > ag) { h.won++; a.lost++; }
      else if (hg < ag) { a.won++; h.lost++; }
      else { h.drawn++; a.drawn++; }
    }
    fdSlots.set(`${sy}|${tier}`, teams);
  }
}

// Parse all RSSSF tables across START_YEAR..END_YEAR
const rsssfSlots = new Map();
const rsssfPlayoffs = new Map();
for (let sy = START_YEAR; sy <= END_YEAR; sy++) {
  let parsed;
  if (sy <= 2007) {
    const fname = `${sy}-${String((sy + 1) % 100).padStart(2, '0')}.html`;
    parsed = parseRsssfFlaSeason(fs.readFileSync(path.join(RSSSF_FLA_DIR, fname), 'utf8'), sy);
    for (const po of parsed.playoffFinals) rsssfPlayoffs.set(`${sy}|${po.tier}`, po.text);
  } else {
    const endY = sy + 1;
    const f4 = path.join(RSSSF_TE_DIR, `eng${endY}.html`);
    const f2 = path.join(RSSSF_TE_DIR, `eng${String(endY).slice(-2)}.html`);
    parsed = parseRsssfTableseSeason(fs.readFileSync(fs.existsSync(f4) ? f4 : f2, 'utf8'), sy);
    for (const po of parsed.playoffTexts) {
      if (po.text) rsssfPlayoffs.set(`${sy}|${po.tier}`, po.text);
    }
  }
  for (let tier = 1; tier <= 4; tier++) {
    rsssfSlots.set(`${sy}|${tier}`, parsed.tables[tier - 1] ?? []);
  }
}

// Group Elvidge deductions CSV entries by (startYear, normKey)
const dedBySeasonClub = new Map();
for (const r of dedRowsRaw) {
  const m = /^(\d{4})[\/-](\d{2,4})$/.exec(r.Season);
  if (!m) continue;
  const sy = Number(m[1]);
  if (sy < START_YEAR || sy > END_YEAR) continue;
  const nk = normalizeClubKey(r.Team, sy);
  const k = `${sy}|${nk}`;
  if (!dedBySeasonClub.has(k)) dedBySeasonClub.set(k, []);
  dedBySeasonClub.get(k).push({
    date: r.Date,
    team: r.Team,
    signedAdjustment: -Number(r.Pts_deducted),
    note: r.Notes,
  });
}

// Index next-season club memberships (S+1) to cross-check promotions/relegations deterministically!
const clubTierByYear = new Map(); // `${sy}|${normKey}` -> tier
for (const slot of elvSlots.values()) {
  for (const t of slot.teams.values()) {
    clubTierByYear.set(`${slot.sy}|${t.normKey}`, slot.tier);
  }
}

// Index PL baseline rows & top scorers
const plByYear = new Map(plBaseline.seasons.map((s) => [s.startYear, s]));

// Build Play-off winners explicitly from RSSSF play-off text + cross-check with next-season T-1 membership
const resolvedPlayoffWinners = new Map(); // `${sy}|${tier}` -> normKey

const tierSeasons = [];
const manifestSlots = [];
const matchDiscrepancies = [];
const deductionAudit = [];
const clubsRegistry = new Map();

for (let sy = START_YEAR; sy <= END_YEAR; sy++) {
  const seasonLabel = formatSeasonLabel(sy);
  const plRef = plByYear.get(sy) ?? null;

  for (let tier = 1; tier <= 4; tier++) {
    const slotKey = `${sy}|${tier}`;
    const elv = elvSlots.get(slotKey);
    const rsssfRows = rsssfSlots.get(slotKey);
    const fdMap = fdSlots.get(slotKey) ?? null;
    if (!elv) throw new Error(`Missing Elvidge slot ${slotKey}`);
    if (!rsssfRows || rsssfRows.length !== elv.teams.size) {
      throw new Error(`RSSSF count mismatch at ${slotKey}: rsssf=${rsssfRows?.length} vs elv=${elv.teams.size}`);
    }

    const isCurtailed = sy === 2019 && (tier === 3 || tier === 4);
    const participantCount = elv.teams.size;
    // Account for Aldershot (1991-92 T4 withdrawn mid-season -> 23 original / 22 completed), Maidstone (1992-93 T4 -> 22), Bury (2019-20 T3 -> 24 original / 23 active)
    const tieBreakRules = (tier >= 2 && sy >= 1992 && sy <= 1998)
      ? ['points', 'gf', 'gd', 'alpha']
      : isCurtailed
        ? ['officialPpg', 'gdPerGame', 'gfPerGame', 'alpha']
        : ['points', 'gd', 'gf', 'alpha'];

    const rsssfByNorm = new Map(rsssfRows.map((x) => [x.normKey, x]));

    // Build rows with Elvidge match totals + cross-source reconciliation + verified signedAdjustment
    const rawTable = [];
    for (const et of elv.teams.values()) {
      const rr = rsssfByNorm.get(et.normKey);
      if (!rr) throw new Error(`Team ${et.elvName} (${et.normKey}) missing in RSSSF ${slotKey}`);
      const fr = fdMap ? fdMap.get(et.normKey) : null;
      if (fdMap && !fr) throw new Error(`Team ${et.elvName} (${et.normKey}) missing in FD ${slotKey}`);

      // Record any match stat discrepancies across Elvidge vs RSSSF vs FD
      for (const f of ['played', 'won', 'drawn', 'lost', 'gf', 'ga']) {
        const rv = rr[f === 'played' ? 'p' : f === 'won' ? 'w' : f === 'drawn' ? 'd' : f === 'lost' ? 'l' : f];
        const ev = et[f];
        const fv = fr ? fr[f] : ev;
        if (ev !== rv || ev !== fv) {
          matchDiscrepancies.push({
            season: seasonLabel,
            tier,
            team: displayClubName(et.elvName, sy),
            field: f,
            elvidge: ev,
            rsssf: rv,
            ...(fr ? { footballData: fv } : {}),
            chosen: ev,
          });
        }
      }

      // Compute signedAdjustment from Elvidge deduction log & reconcile against RSSSF implied + verified overrides
      const dedEntries = dedBySeasonClub.get(`${sy}|${et.normKey}`) ?? [];
      const elvNetAdj = dedEntries.reduce((s, d) => s + d.signedAdjustment, 0);
      const override = VERIFIED_ADJUSTMENT_OVERRIDES.get(`${sy}|${tier}|${et.normKey}`);
      const signedAdjustment = override ? override.signedAdjustment : elvNetAdj;

      if (rr.adj !== signedAdjustment && !override) {
        throw new Error(`Unresolved deduction difference at ${slotKey} ${et.elvName}: RSSSF=${rr.adj}, Elvidge=${elvNetAdj}`);
      }
      if (signedAdjustment !== 0 || dedEntries.length > 0) {
        deductionAudit.push({
          season: seasonLabel,
          tier,
          team: displayClubName(et.elvName, sy),
          signedAdjustment,
          rsssfImpliedAdjustment: rr.adj,
          entries: dedEntries,
          overrideNote: override?.note ?? null,
        });
      }

      const rawPoints = 3 * et.won + et.drawn;
      const officialPoints = rawPoints + signedAdjustment;
      const teamDisplay = displayClubName(et.elvName, sy);
      const clubId = slugifyClubId(et.normKey, sy);

      // Register club metadata & aliases
      if (!clubsRegistry.has(clubId)) {
        clubsRegistry.set(clubId, {
          clubId,
          canonicalName: teamDisplay,
          aliases: new Set(),
        });
      }
      const creg = clubsRegistry.get(clubId);
      creg.aliases.add(et.elvName);
      creg.aliases.add(rr.rawName);
      if (fr) for (const fn of fr.fdNames) creg.aliases.add(fn);

      // Preserve PL verified topScorer if tier === 1 && plRef
      let plRow = null;
      if (tier === 1 && plRef) {
        plRow = plRef.table.find((x) => normalizeClubKey(x.team, sy) === et.normKey);
        if (!plRow) throw new Error(`PL baseline missing team ${et.elvName} in ${seasonLabel}`);
        // Strict field assertion against audited PL baseline
        for (const k of ['played', 'won', 'drawn', 'lost', 'gf', 'ga']) {
          if (plRow[k] !== et[k]) throw new Error(`PL baseline field diff ${seasonLabel} ${et.elvName} ${k}`);
        }
        if (plRow.points !== officialPoints) {
          throw new Error(`PL baseline pts diff ${seasonLabel} ${et.elvName}: pl=${plRow.points} vs calc=${officialPoints}`);
        }
        creg.aliases.add(plRow.team);
      }

      const deductionReasons = dedEntries
        .filter((d) => d.signedAdjustment !== 0)
        .map((d) => `${d.signedAdjustment > 0 ? `+${d.signedAdjustment}` : d.signedAdjustment} pts: ${d.note}`);
      const overturnNotes = dedEntries
        .filter((d) => d.signedAdjustment === 0)
        .map((d) => d.note);

      rawTable.push({
        clubId,
        normKey: et.normKey,
        team: teamDisplay,
        sourceAliases: [...new Set([et.elvName, rr.rawName, ...(fr ? [...fr.fdNames] : []), ...(plRow ? [plRow.team] : [])])].filter((a) => a !== teamDisplay),
        played: et.played,
        won: et.won,
        drawn: et.drawn,
        lost: et.lost,
        gf: et.gf,
        ga: et.ga,
        gd: et.gf - et.ga,
        rawPoints,
        signedAdjustment,
        points: officialPoints,
        deductionReason: deductionReasons.length ? deductionReasons.join(' | ') : (plRow?.deductionReason ?? null),
        appealNote: overturnNotes.length ? overturnNotes.join(' | ') : null,
        rsssfPos: rr.pos,
        rsssfUpper: Boolean(rr.upper),
        rsssfRelegatedMarker: Boolean(rr.relegatedMarker),
        rsssfPromotedMarker: Boolean(rr.promotedMarker),
        topScorer: plRow ? plRow.topScorer : null,
        hasGoldenBootWinner: plRow ? Boolean(plRow.hasGoldenBootWinner) : null,
      });
    }

    // Sort deterministically by historical tie-break rule (or official PPG in curtailed 2019-20 L1/L2)
    const sorted = sortStandings(rawTable, tieBreakRules, isCurtailed);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].pos = i + 1;
      // Assert official position agreement except known RSSSF bugs:
      // 1) 8 slots where RSSSF omitted/undercounted a deduction
      // 2) 2009-10 T3 where RSSSF eng2010 misordered Hartlepool (omitted -3) and swapped Southend(43)/Wycombe(45)
      const rsssfWrongOnThisSlot = [...VERIFIED_ADJUSTMENT_OVERRIDES.keys()].some((k) => k.startsWith(`${sy}|${tier}|`)) || (sy === 2009 && tier === 3);
      if (!rsssfWrongOnThisSlot && sorted[i].pos !== sorted[i].rsssfPos) {
        throw new Error(`Official pos mismatch at ${slotKey}: calc pos ${sorted[i].pos} (${sorted[i].team}) vs RSSSF ${sorted[i].rsssfPos}`);
      }
      if (tier === 1 && plRef) {
        const plRow = plRef.table.find((x) => normalizeClubKey(x.team, sy) === sorted[i].normKey);
        if (plRow.pos !== sorted[i].pos) {
          throw new Error(`PL pos mismatch at ${slotKey} ${sorted[i].team}: calc=${sorted[i].pos}, pl=${plRow.pos}`);
        }
      }
    }

    // Determine promotions, play-off winners, and relegations deterministically & verify against S -> S+1 transitions
    const nextYearCutoff = sy < END_YEAR;
    const candidatePoTeams = sorted.slice(0, 8).map((r) => r.normKey);
    const poWinnerKey = tier >= 2 && sy >= 1986
      ? extractWinnerFromPlayoffText(rsssfPlayoffs.get(slotKey), candidatePoTeams, sy)
      : null;

    // Cross-check promotion / relegation vs S+1 where available
    let promotedCount = 0;
    let relegatedCount = 0;
    const rowsPrelim = sorted.map((row) => {
      const isChamp = row.pos === 1;
      let promoted = false;
      let relegated = false;
      let administrativeOutcome = null;

      if (nextYearCutoff) {
        const nextTier = clubTierByYear.get(`${sy + 1}|${row.normKey}`) ?? null;
        if (tier > 1 && nextTier === tier - 1) {
          promoted = true;
        }
        if (tier < 4 && nextTier === tier + 1) {
          relegated = true;
        }
        if (nextTier === null) {
          const missKey = `${sy}|${tier}|${row.normKey}`;
          const documented = MISSING_NEXT_TIER_OUTCOMES.get(missKey);
          if (tier < 4) {
            if (!documented) {
              throw new Error(`Unresolved next-season disappearance in Tier ${tier} at ${slotKey} (${row.team}): add sourced entry to MISSING_NEXT_TIER_OUTCOMES.`);
            }
            promoted = Boolean(documented.promoted);
            relegated = Boolean(documented.relegated);
            if (documented.administrativeOutcome) administrativeOutcome = documented.administrativeOutcome;
          } else if (documented) {
            promoted = Boolean(documented.promoted);
            relegated = Boolean(documented.relegated);
            if (documented.administrativeOutcome) administrativeOutcome = documented.administrativeOutcome;
          } else {
            if (NON_RELEGATING_TIER4_START_YEARS.has(sy)) {
              throw new Error(`Unexpected Tier 4 exit in non-relegating season ${slotKey} (${row.team}): document outcome explicitly.`);
            }
            relegated = true;
          }
        }
      } else {
        // END_YEAR (2024-25): use RSSSF eng2025 markers + parsed playoff final winners
        if (tier > 1) {
          if (row.rsssfPromotedMarker || (poWinnerKey && row.normKey === poWinnerKey)) {
            promoted = true;
          }
        }
        relegated = Boolean(row.rsssfRelegatedMarker);
      }

      if (sy === 1989 && tier === 2 && row.normKey === 'sunderland') {
        administrativeOutcome = 'Promoted from play-offs after final winners Swindon Town were stripped of promotion';
      }
      if (sy === 2019 && tier === 4 && row.pos === 23) {
        administrativeOutcome = 'Reprieved from relegation following Bury expulsion in League One';
      }
      if ((sy === 1993 && tier === 4 && row.pos === 22) || (sy === 1994 && tier === 4 && row.pos === 22) || (sy === 1995 && tier === 4 && row.pos === 24)) {
        administrativeOutcome = 'Reprieved from relegation because Conference champions failed League ground-grading requirements';
      }
      return { row, isChamp, promoted, relegated, administrativeOutcome };
    });

    // Determine authoritative play-off winner key: parsed RSSSF final if promoted, else lowest-placed promoted club when play-offs were contested (excl. 1986-87 T2 where T1 Charlton stayed up)
    const promotedPrelim = rowsPrelim.filter((x) => x.promoted);
    let effectivePoWinnerKey = poWinnerKey && promotedPrelim.some((x) => x.row.normKey === poWinnerKey) ? poWinnerKey : null;
    if (!effectivePoWinnerKey && tier >= 2 && sy >= 1986 && !(sy === 1986 && tier === 2) && promotedPrelim.length >= 2) {
      effectivePoWinnerKey = promotedPrelim[promotedPrelim.length - 1].row.normKey;
    }

    const rowsFinal = rowsPrelim.map(({ row, isChamp, promoted, relegated, administrativeOutcome }) => {
      let promotionMethod = null;
      if (promoted) {
        promotedCount++;
        promotionMethod = (effectivePoWinnerKey && row.normKey === effectivePoWinnerKey) ? 'playoff' : 'automatic';
      }
      if (relegated) relegatedCount++;

      return {
        pos: row.pos,
        clubId: row.clubId,
        team: row.team,
        sourceAliases: row.sourceAliases,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        gf: row.gf,
        ga: row.ga,
        gd: row.gd,
        rawPoints: row.rawPoints,
        signedAdjustment: row.signedAdjustment,
        points: row.points,
        pointsDeducted: row.signedAdjustment < 0 ? -row.signedAdjustment : 0, // convenience parity alias
        deductionReason: row.deductionReason,
        appealNote: row.appealNote,
        champion: isChamp,
        promoted,
        promotionMethod,
        relegated,
        administrativeOutcome,
        topScorer: row.topScorer,
        hasGoldenBootWinner: row.hasGoldenBootWinner,
      };
    });

    // Sanity check 2024-25 T2/T3/T4 playoff winners extracted cleanly!
    if (sy === END_YEAR && tier >= 2 && promotedCount === 0) {
      throw new Error(`No promoted clubs found at ${slotKey}`);
    }
    if (sy === 2024 && tier >= 2) {
      const poWinner = rowsFinal.find((r) => r.promotionMethod === 'playoff')?.team;
      if (!poWinner) throw new Error(`Missing 2024-25 playoff winner extraction for T${tier}`);
    }

    // Relegation & survival boundary positions (honest when 0 relegated, e.g. 1981-85 T4 re-election or reprieved seasons)
    const relegatedRows = rowsFinal.filter((r) => r.relegated);
    const nonRelegatedRows = rowsFinal.filter((r) => !r.relegated);
    const firstRelegatedPos = relegatedRows.length > 0 ? Math.min(...relegatedRows.map((r) => r.pos)) : null;
    const lastSafePos = firstRelegatedPos !== null ? firstRelegatedPos - 1 : null;

    // Planned games per team (full double round-robin = 2 * (N_scheduled - 1); in 1991-92 T4 & 2019-20 T3 a club withdrew/was expelled)
    const nominalTeams = (sy === 1991 && tier === 4) ? 23 : (sy === 2019 && tier === 3) ? 24 : participantCount;
    const plannedGamesPerTeam = (sy === 1991 && tier === 4) ? 42 : 2 * (nominalTeams - 1);

    const slotExceptions = [];
    if (SLOT_EXCEPTION_NOTES.has(slotKey)) slotExceptions.push(SLOT_EXCEPTION_NOTES.get(slotKey));
    const slotDeds = rowsFinal.filter((r) => r.signedAdjustment !== 0 || r.appealNote);
    for (const d of slotDeds) {
      if (d.signedAdjustment !== 0) slotExceptions.push(`${d.team}: ${d.signedAdjustment} pts (${d.deductionReason})`);
      else if (d.appealNote) slotExceptions.push(`${d.team}: ${d.appealNote}`);
    }

    const slotObj = {
      slotId: `${seasonLabel}-T${tier}`,
      season: seasonLabel,
      startYear: sy,
      endYear: sy + 1,
      tier,
      competitionId: `ENG-T${tier}`,
      historicalDivisionName: historicalDivisionName(tier, sy),
      presentDayTierLabel: presentDayTierLabel(tier),
      participantCount,
      rowCount: rowsFinal.length,
      matchCount: elv.matchCount,
      totalGoals: elv.totalGoals,
      status: isCurtailed ? 'curtailed' : 'completed',
      rankingBasis: isCurtailed ? 'unweighted_ppg' : 'total_points',
      pointsRule: '3W_1D_0L',
      tieBreakRules,
      plannedGamesPerTeam,
      minGamesPlayed: Math.min(...rowsFinal.map((r) => r.played)),
      maxGamesPlayed: Math.max(...rowsFinal.map((r) => r.played)),
      relegationSlots: relegatedCount,
      relegationLinePos: firstRelegatedPos,
      survivalLinePos: lastSafePos,
      promotionSlots: promotedCount,
      reElectionEra: tier === 4 && sy <= 1985,
      expelledClubs: (sy === 2019 && tier === 3)
        ? [{ clubId: 'bury', team: 'Bury', outcome: 'Expelled on 27 August 2019 prior to playing a Football League match; initial -12 penalty did not accrue onto an active table row.' }]
        : (sy === 1991 && tier === 4)
          ? [{ clubId: 'aldershot', team: 'Aldershot', outcome: 'Withdrew after 36 games and folded (March 1992); all match results expunged from final standings.' }]
          : (sy === 1992 && tier === 4)
            ? [{ clubId: 'maidstone-united', team: 'Maidstone United', outcome: 'Resigned from the Football League in August 1992 prior to fixtures commencing.' }]
            : [],
      scorerCoverage: (tier === 1 && sy >= 1992 && plRef) ? 'verified_pl_complete' : 'unavailable',
      goldenBootGoals: (tier === 1 && plRef) ? plRef.goldenBootGoals : null,
      goldenBootWinners: (tier === 1 && plRef) ? plRef.goldenBootWinners : [],
      topScorers: (tier === 1 && plRef) ? plRef.topScorers : null,
      reconciliationStatus: fdMap ? 'triple_source_reconciled' : 'double_source_reconciled',
      sourceUrls: [
        `https://github.com/seanelvidge/England-football-results/blob/${PINNED_ELVIDGE_SHA}/EnglandLeagueResults.csv`,
        sy <= 2007
          ? `https://www.rsssf.org/engpaul/FLA/${sy}-${String((sy + 1) % 100).padStart(2, '0')}.html`
          : `https://www.rsssf.org/tablese/${sy === 2008 ? 'eng09' : `eng${sy + 1}`}.html`,
        ...(fdMap ? [`https://www.football-data.co.uk/mmz4281/${String(sy).slice(-2)}${String(sy + 1).slice(-2)}/E${tier - 1}.csv`] : []),
      ],
      exceptions: slotExceptions,
      table: rowsFinal,
    };

    tierSeasons.push(slotObj);
    manifestSlots.push({
      slotId: slotObj.slotId,
      season: slotObj.season,
      tier: slotObj.tier,
      historicalDivisionName: slotObj.historicalDivisionName,
      status: slotObj.status,
      rankingBasis: slotObj.rankingBasis,
      participantCount: slotObj.participantCount,
      matchCount: slotObj.matchCount,
      totalGoals: slotObj.totalGoals,
      promotionSlots: slotObj.promotionSlots,
      relegationSlots: slotObj.relegationSlots,
      relegationLinePos: slotObj.relegationLinePos,
      survivalLinePos: slotObj.survivalLinePos,
      promotedTeams: rowsFinal.filter((r) => r.promoted).map((r) => `${r.team} (${r.pos}${r.promotionMethod === 'playoff' ? ', PO' : ''})`),
      relegatedTeams: rowsFinal.filter((r) => r.relegated).map((r) => `${r.team} (${r.pos})`),
      scorerCoverage: slotObj.scorerCoverage,
      reconciliationStatus: slotObj.reconciliationStatus,
      exceptions: slotExceptions,
    });
  }
}

// Run internal conservation & parity checks before writing!
if (tierSeasons.length !== (END_YEAR - START_YEAR + 1) * 4) {
  throw new Error(`Expected ${(END_YEAR - START_YEAR + 1) * 4} slots, got ${tierSeasons.length}`);
}

let totalRows = 0;
let totalMatches = 0;
let totalGoals = 0;
for (const slot of tierSeasons) {
  totalRows += slot.table.length;
  totalMatches += slot.matchCount;
  totalGoals += slot.totalGoals;
  const sumW = slot.table.reduce((s, r) => s + r.won, 0);
  const sumL = slot.table.reduce((s, r) => s + r.lost, 0);
  const sumP = slot.table.reduce((s, r) => s + r.played, 0);
  const sumGF = slot.table.reduce((s, r) => s + r.gf, 0);
  const sumGA = slot.table.reduce((s, r) => s + r.ga, 0);
  if (sumW !== sumL) throw new Error(`Conservation fail W != L in ${slot.slotId}`);
  if (sumGF !== sumGA) throw new Error(`Conservation fail GF != GA in ${slot.slotId}`);
  if (sumP !== slot.matchCount * 2) throw new Error(`Conservation fail sum(P) != 2*matches in ${slot.slotId}`);
  if (sumGF !== slot.totalGoals) throw new Error(`Conservation fail sum(GF) != totalGoals in ${slot.slotId}`);
  for (const row of slot.table) {
    if (row.played !== row.won + row.drawn + row.lost) throw new Error(`Row conservation fail in ${slot.slotId} ${row.team}`);
    if (row.gd !== row.gf - row.ga) throw new Error(`GD fail in ${slot.slotId} ${row.team}`);
    if (row.rawPoints !== 3 * row.won + row.drawn) throw new Error(`RawPoints fail in ${slot.slotId} ${row.team}`);
    if (row.points !== row.rawPoints + row.signedAdjustment) throw new Error(`OfficialPoints fail in ${slot.slotId} ${row.team}`);
  }
  if (slot.relegationSlots !== slot.table.filter((r) => r.relegated).length) {
    throw new Error(`RelegationSlots mismatch in ${slot.slotId}`);
  }
}

const BUILD_BOUNDARY_EXCEPTIONS = new Set([
  '1986-87|T1/T2',
  '1987-88|T1/T2',
  '1990-91|T1/T2',
  '1990-91|T2/T3',
  '1990-91|T3/T4',
  '1994-95|T1/T2',
  '1994-95|T2/T3',
  '1994-95|T3/T4',
  '2019-20|T3/T4',
]);
const slotLookup = new Map(tierSeasons.map((s) => [s.slotId, s]));
for (let sy = START_YEAR; sy <= END_YEAR; sy++) {
  const lbl = formatSeasonLabel(sy);
  for (let t = 1; t <= 3; t++) {
    const up = slotLookup.get(`${lbl}-T${t}`);
    const dn = slotLookup.get(`${lbl}-T${t + 1}`);
    const relUp = up.table.filter((r) => r.relegated).length;
    const promDn = dn.table.filter((r) => r.promoted).length;
    const bKey = `${lbl}|T${t}/T${t + 1}`;
    if (relUp !== promDn && !BUILD_BOUNDARY_EXCEPTIONS.has(bKey)) {
      throw new Error(`Undocumented promotion/relegation boundary mismatch at ${bKey}: relUp=${relUp} vs promDn=${promDn}`);
    }
  }
}

// Check Premier League 1992-2025 exact regression totals
const plFiltered = tierSeasons.filter((s) => s.tier === 1 && s.startYear >= 1992 && s.startYear <= 2024);
const plCheck = {
  seasons: plFiltered.length,
  rows: plFiltered.reduce((s, x) => s + x.rowCount, 0),
  matches: plFiltered.reduce((s, x) => s + x.matchCount, 0),
  goals: plFiltered.reduce((s, x) => s + x.totalGoals, 0),
};
if (plCheck.seasons !== 33 || plCheck.rows !== 666 || plCheck.matches !== 12786 || plCheck.goals !== 34433) {
  throw new Error(`PL regression baseline mismatch: ${JSON.stringify(plCheck)}`);
}

// Assemble canonical dataset
const dataset = {
  schemaVersion: '2.0.0',
  metadata: {
    title: 'The Championship Formula — English League Tiers 1–4 (1981–82 to 2024–25)',
    seasonsCovered: `${formatSeasonLabel(START_YEAR)} to ${formatSeasonLabel(END_YEAR)}`,
    startYear: START_YEAR,
    endYear: END_YEAR,
    tiersCovered: [1, 2, 3, 4],
    totalTierSeasonSlots: tierSeasons.length,
    completedSlots: tierSeasons.filter((s) => s.status === 'completed').length,
    curtailedSlots: tierSeasons.filter((s) => s.status === 'curtailed').length,
    totalTeamSeasons: totalRows,
    totalMatchesPlayed: totalMatches,
    totalGoalsScored: totalGoals,
    excludedFutureSeasons: [...excludedFutureSeasons].sort(),
    scorerCoverageSummary: {
      verifiedSlots: tierSeasons.filter((s) => s.scorerCoverage === 'verified_pl_complete').length,
      verifiedRange: 'Tier 1 (Premier League) 1992-93 to 2024-25',
      unavailableSlots: tierSeasons.filter((s) => s.scorerCoverage !== 'verified_pl_complete').length,
      policy: 'Missing scorer data is explicitly marked unavailable rather than zero-filled or estimated from partial lists.',
    },
    sources: [
      {
        id: 'elvidge',
        name: 'Sean Elvidge — England-football-results (EnglandLeagueResults.csv & EnglishTeamPointDeductions.csv)',
        pinnedCommitSha: PINNED_ELVIDGE_SHA,
        url: `https://github.com/seanelvidge/England-football-results/tree/${PINNED_ELVIDGE_SHA}`,
        licence: 'CC BY 4.0 (with underlying historical compilations cited by maintainer: RSSSF, Curley 2016, ENFA, footballcsv, Wikipedia, Statto, 11v11, football-data.co.uk, BBC)',
        attribution: 'Match results and deduction logs derived in part from Sean Elvidge (England-football-results), licensed under CC BY 4.0.',
        sha256: {
          EnglandLeagueResults: sha256File(resultsPath),
          EnglishTeamPointDeductions: sha256File(dedPath),
          EnglishTeamNamePeriods: sha256File(namePeriodsPath),
        },
      },
      {
        id: 'rsssf',
        name: 'RSSSF — England Football Statistics Archive (Paul Felton / Stuart Jackson & Ian King)',
        url: 'https://www.rsssf.org/engpaul/FLA/',
        scope: 'Official final table positions, promotions, play-off finals, relegations & deduction verification (1981-82..2024-25)',
      },
      {
        id: 'football-data',
        name: 'Football-Data.co.uk — England Historical Match Results (E0–E3 CSVs)',
        url: 'https://www.football-data.co.uk/englandm.php',
        scope: 'Independent match-by-match cross-check across all 4 tiers from 1993-94 through 2024-25 (128 tier-seasons)',
      },
      {
        id: 'wikipedia-efl',
        name: 'Wikipedia / EFL Official Statements',
        url: 'https://en.wikipedia.org/wiki/2019%E2%80%9320_EFL_League_One',
        scope: 'Verification of 2019-20 curtailed League One & League Two PPG tables and 8 resolved EFL deduction/ordering omissions in RSSSF',
      },
      {
        id: 'pl-baseline',
        name: 'Audited Championship Formula Premier League Baseline (1992-93..2024-25)',
        url: './data/premier-league-1992-2025.json',
        scope: 'Preserved Golden Boot and top-10 club/player scorer attribution for Tier 1 1992-93..2024-25 (666 team-seasons)',
      },
    ],
    structuralRules: {
      threePointsStart: 'Three points for a win was introduced across all four Football League divisions in 1981-82.',
      tierVsName: 'Tier (1–4) is the invariant structural identity; 1992-93 created the Premier League (Tier 1) and shifted Football League First/Second/Third Division to Tiers 2–4 (rebranded Championship / League One / League Two in 2004-05 and EFL in 2016-17).',
      tieBreaks: 'Points -> GD -> GF except Football League Tiers 2–4 from 1992-93 through 1998-99, which ranked Goals Scored (GF) ahead of Goal Difference (GD). 2019-20 League One & League Two were ranked by unweighted Points Per Game (PPG).',
      divisionSizes: 'Varying division sizes: 20, 21 (1987-88 T1), 22 (1981-87 T1/T2, 1991-95 T1/T4), 23 (1987-88 T2, 2019-20 T3 active clubs after Bury expulsion), and 24 teams (most T2–T4 seasons). Per-game normalisation uses actual matches played.',
      exclusionPolicy: '2019-20 League One & League Two (status: curtailed) are excluded from default completed-season aggregates and toggleable explicitly in UI controls.',
    },
  },
  tierSeasons,
};

const jsonStr = JSON.stringify(dataset, null, 2) + '\n';
const canonicalHash = sha256String(jsonStr);
dataset.metadata.canonicalJsonSha256 = canonicalHash;
const finalJsonStr = JSON.stringify(dataset, null, 2) + '\n';
const finalHash = sha256String(finalJsonStr);

const bundleStr = [
  '/* Auto-generated by scripts/import-data.mjs. Do not edit manually. */',
  `/* canonicalSha256: ${finalHash} */`,
  `window.__CHAMPIONSHIP_DATASET__ = ${finalJsonStr.trimEnd()};`,
  '',
].join('\n');

const manifestObj = {
  schemaVersion: '2.0.0',
  generatedForEndpoint: formatSeasonLabel(END_YEAR),
  canonicalDatasetFile: 'data/england-tiers-1-4-1981-2025.json',
  canonicalJsonSha256: finalHash,
  totals: {
    slotsExpected: 176,
    slotsPresent: tierSeasons.length,
    completedSlots: dataset.metadata.completedSlots,
    curtailedSlots: dataset.metadata.curtailedSlots,
    teamSeasons: totalRows,
    matches: totalMatches,
    goals: totalGoals,
    plRegressionParity: plCheck,
  },
  matchDiscrepancies,
  deductionAudit,
  missingNextTierOutcomes: [...MISSING_NEXT_TIER_OUTCOMES.entries()].map(([key, v]) => ({ key, ...v })),
  clubLineagePolicy: {
    renamedOrRelocated: 'Contested sporting-identity continuity cases (e.g. Wimbledon -> Milton Keynes Dons in 2004, and reformed AFC Wimbledon) are stored as distinct clubId records (wimbledon, milton-keynes-dons, afc-wimbledon) rather than silently aliasing clubs across identities.',
    historicalSplit: 'Aldershot (pre-1992 Football League club, folded 1992) and Aldershot Town (post-2008 League Two entrant) are likewise separated by distinct clubIds (aldershot vs. aldershot-town).',
  },
  clubs: [...clubsRegistry.values()]
    .map((c) => ({ clubId: c.clubId, canonicalName: c.canonicalName, aliases: [...c.aliases].sort() }))
    .sort((a, b) => a.clubId.localeCompare(b.clubId)),
  slots: manifestSlots,
};

const manifestStr = JSON.stringify(manifestObj, null, 2) + '\n';

// Atomic temp-file write -> rename
function writeAtomic(targetPath, content) {
  const tmpPath = `${targetPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, targetPath);
}

writeAtomic(OUT_JSON, finalJsonStr);
writeAtomic(OUT_BUNDLE, bundleStr);
writeAtomic(OUT_MANIFEST, manifestStr);

console.log(`SUCCESS: Generated ${tierSeasons.length} tier-seasons (${totalRows} team-seasons, ${totalMatches} matches, ${totalGoals} goals).`);
console.log(`PL 1992-2025 Regression Parity: ${JSON.stringify(plCheck)}`);
console.log(`Match discrepancies documented: ${matchDiscrepancies.length}`);
console.log(`Deductions audited: ${deductionAudit.length}`);
console.log(`2024-25 playoff winners detected: T2=${tierSeasons.find((s) => s.slotId === '2024-25-T2').table.find((r) => r.promotionMethod === 'playoff')?.team}, T3=${tierSeasons.find((s) => s.slotId === '2024-25-T3').table.find((r) => r.promotionMethod === 'playoff')?.team}, T4=${tierSeasons.find((s) => s.slotId === '2024-25-T4').table.find((r) => r.promotionMethod === 'playoff')?.team}`);
