# The Championship Formula

**An empirical study of English professional league tables across Tiers 1–4 in the three-points-for-a-win era (`1981–82` through `2024–25`) — asking what separates champions, contenders, and survivors from everyone else.**

This is a static, zero-runtime-dependency web application built on reconciled local data with no backend, no accounts, and no runtime API scraping. It extends the original Premier League (`1992–93` to `2024–25`) study across all four tiers of the English pyramid back to the 1981–82 introduction of three points for a win—spanning **176 tier-season slots**, **4,047 team-seasons**, **89,234 matches**, and **233,356 goals** (or **174 completed full-season tables**, **4,000 team-seasons**, **88,394 matches**, and **231,204 goals** with the two COVID-curtailed `2019–20` EFL League One and League Two tables excluded by default).

---

## Live Architecture & Files

- [`index.html`](index.html) — Editorial single-page layout (`<script defer>` classic scripts, no `type="module"`), interactive global scope bar (presets, Official vs. Raw Sporting Points toggle, Tier 1–4 filter, configurable `1981–82..2024–25` range, COVID curtailment opt-in), and accessible fallback states.
- [`analysis.js`](analysis.js) — Pure statistical calculation engine (`window.ChampionshipAnalysis` / UMD-style browser & Node test compatibility) implementing dataset schema validation, within-slot correlations, era and tier breakdowns, deduction sensitivity (`official` vs `raw`), non-relegating slot separation, and scorer availability checks.
- [`app.js`](app.js) — DOM & inline SVG visualization controller built exclusively with safe DOM/SVG node constructors (`textContent` only; zero `.innerHTML`), responsive interactive tooltips, and sortable full-archive tables.
- [`styles.css`](styles.css) — High-density newspaper/sports-analytics styling, tabular numerals, responsive layouts tested down to `360px` / `390px` viewports.
- [`data/england-tiers-1-4-1981-2025.json`](data/england-tiers-1-4-1981-2025.json) — Canonical dataset (`schemaVersion: "2.0.0"`, `3,334,102` bytes, canonical SHA-256 `95b58bdc3e1cfbc13b1749a20da203280e74e6b567335f91fa8c38e3d41b30ed`).
- [`data/england-tiers-1-4-1981-2025-bundle.js`](data/england-tiers-1-4-1981-2025-bundle.js) — Pre-bundled `window.__CHAMPIONSHIP_DATA__` mirror (`3,334,296` bytes) matching canonical SHA-256 so the app works identically when opened directly via `file://` without a local server.
- [`data/coverage-manifest.json`](data/coverage-manifest.json) — Full reconciliation manifest recording all `176` slots, `59` historical deduction audit records, `46` resolved match-level cross-check discrepancies, `118` club identity records, and the `33`-season Premier League parity check.
- [`data/premier-league-1992-2025.json`](data/premier-league-1992-2025.json) — Original audited Premier League baseline retained for regression parity and verified Golden Boot / club top-scorer attribution.
- [`scripts/import-data.mjs`](scripts/import-data.mjs) & [`scripts/reconcile-helpers.mjs`](scripts/reconcile-helpers.mjs) — Deterministic local ETL pipeline (supporting `--from-cache`, `--fetch`, and configurable `--end-year=YYYY` up to `2025`).
- [`tests/`](tests/) — Automated Node test suite covering schema validation, statistical edge cases, mathematical conservation laws, Premier League parity, offline `file://` rendering, interactive HTTP UI flows, XSS resilience, and viewport overflow checks.

---

## Sources, Attribution & Reconciliation Audit

### 1. Primary & Cross-Check Data Sources

1. **Sean Elvidge — `England-football-results` (CC BY 4.0)**
   Pinned repository commit `fb4c796d5faffd7098d481bfc041778b80a2286c`:
   - `EnglandLeagueResults.csv` (SHA-256 `3de4a6938ebab33cf4fc47c545ad9de56690a523c561e7e880ef65ababcceab6`) — Match results aggregated directly to P/W/D/L/GF/GA without using rating or forecast columns. Ongoing/post-`2024–25` seasons (`2025/2026`, `2026/2027`) are explicitly excluded from the principal `1981–82..2024–25` endpoint.
   - `EnglishTeamPointDeductions.csv` (SHA-256 `bd03b1079cfc624f9648c2aa706b0382f36f98765d5983bd2521f127f48a5f14`) — Point deduction and appeal ledger.
   - `EnglishTeamNamePeriods.csv` (SHA-256 `61629e954c5bac4fbf04aa76a3393f238a9b4556a867bb8fe2ef412473038987`) — Club name lineage.
   - Attribution: *Match results and deduction logs derived in part from Sean Elvidge (`England-football-results`), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (whose compilation cites RSSSF, Curley 2016, ENFA, footballcsv, Wikipedia, Statto, 11v11, football-data.co.uk, and BBC).*
2. **RSSSF — England Football Statistics Archive (`engpaul/FLA/` & `tablese/`)**
   Independent cross-check across all `176` tables for final positions, automatic promotions, play-off winners, relegations, and deductions.
3. **Football-Data.co.uk (`E0`–`E3` CSVs)**
   Independent match-level cross-check across all four tiers from `1993–94` through `2024–25` (`128` tier-seasons).
4. **Wikipedia / Official EFL Statements**
   Verification of the COVID-curtailed `2019–20` EFL League One and League Two unweighted-PPG tables, Bury’s `2019` expulsion (preserving Bury’s `2018–19` Tier 4 2nd-place on-field promotion while noting their August 2019 EFL expulsion), and eight resolved omissions/discrepancies where RSSSF lagged official EFL rulings:
   - `2005–06` Tier 4 **Bury** (`-1` unregistered loanee)
   - `2006–07` Tier 4 **Boston United** (`-10` administration deduction; relegated to Conference North)
   - `2008–09` Tier 2 **Crystal Palace** (`-1` ineligible player)
   - `2009–10` Tier 3 **Hartlepool United** (`-3` ineligible player and table rank ordering)
   - `2012–13` Tier 3 **Portsmouth** (`-10` administration exit penalty)
   - `2015–16` Tier 3 **Bury** (`-3` retrospective registration penalty)
   - `2022–23` Tier 2 **Wigan Athletic** (`-6` combined from two `-3` penalties where RSSSF listed `-3`)
   - `2023–24` Tier 4 **Morecambe** (`-3` wage payment penalty)
5. **Premier League Baseline Regression Parity (`data/premier-league-1992-2025.json`)**
   All `33` Premier League seasons (`666` team-seasons, `12,786` matches, `34,433` goals) match cell-for-cell with zero discrepancies across table totals, official positions, deductions, relegations, and top-scorer awards.

---

## Structural Method & Scope Rules

- **Three-Points-for-a-Win Floor (`1981–82`)**: Prior to `1981–82`, English Football League divisions awarded two points for a win. Pre-`1981` two-point tables are omitted rather than rescaled because multiplying past wins by `1.5` invents outcomes without changing historical match incentives.
- **Invariant Tier + Historical Division Naming**: Tables always join on pyramid `tier` (`1` = top flight through `4` = fourth tier), while displaying the historically accurate division name for each season (e.g., `Football League First Division` in Tier 1 before `1992–93` vs. `Football League First Division` in Tier 2 from `1992–93` through `2003–04`; `Championship / League One / League Two` rebrand from `2004–05`; `EFL` prefix from `2016–17`).
- **Per-Game & Normalised Finish Score**: League sizes vary across `20`, `21`, `22`, `23`, and `24` clubs and schedules span `38`, `40`, `42`, `44`, and `46` games per team. Primary predictor ranking uses within-slot Pearson correlation against a normalised finish score $1 - (\text{pos} - 1)/(N - 1)$ (`1.00` = Champion, `0.00` = Bottom), preventing cross-schedule distortion.
- **COVID-19 Curtailed `2019–20` Tables**: `2019–20` EFL League One (`400` matches across `23` remaining active clubs after Bury’s expulsion) and `2019–20` EFL League Two (`440` matches) ended on unweighted points per game (`34–37` played per club). Both are excluded from default full-season baselines (`174` slots) and toggleable via **Include curtailed 2019–20 League One & League Two**.
- **Official Table vs. Raw Sporting Points (`3W + D`)**: Across the `174` completed default tables, `56` team-seasons experienced net point adjustments or deduction rulings (`58` across all `176` tables; `59` historical audit entries including Tottenham’s overturned `1994–95` deduction). Re-ranking purely by on-pitch `3W + D` shifts `188` team-season finishes and flips `10` clubs out of the relegation zone (*Middlesbrough 1996–97, Wrexham 2004–05, AFC Bournemouth 2007–08, Luton Town 2008–09, Plymouth Argyle 2010–11, Portsmouth 2011–12, Wigan Athletic 2019–20, Sheffield Wednesday 2020–21, Derby County 2021–22, Reading 2022–23*).
- **Non-Relegating Tier 4 Slots**: Ten Tier 4 seasons had zero automatic relegation (`1981–82` through `1985–86` under the pre-1987 Football League re-election system, `1990–91` during restructuring where 23rd-placed Aldershot and 24th-placed Wrexham remained, `1991–92` after Aldershot folded mid-season and 18th-placed Maidstone United later resigned pre-`1992–93`, plus ground-grading reprieves in `1993–94`, `1994–95`, and `1995–96`). These are automatically separated from survival-cutoff distributions, leaving `164` relegation-active tables.
- **Club Identity & Lineage Policy**: Contested or discontinued club transitions (`Wimbledon` relegated in `2003–04` -> renamed/relocated `Milton Keynes Dons` from `2004–05` vs. `AFC Wimbledon`; pre-1992 `Aldershot` vs. `Aldershot Town`) remain distinct `clubId` records in `coverage-manifest.json` with explicit per-season outcomes resolved from sources (`MISSING_NEXT_TIER_OUTCOMES` fails loudly on any unrecorded Tiers 1–3 exit).
- **Historical Tie-Break Rules**: From `1992–93` through `1998–99`, Football League Divisions One, Two, and Three (Tiers 2–4) broke ties on **Goals For (`GF`) ahead of Goal Difference (`GD`)**. Table sorting honors historical tie-break rules per division-season.
- **Explicit Scorer Coverage Boundary**: Verified Golden Boot and leading club-scorer figures cover **Premier League (`Tier 1, 1992–93 to 2024–25`, 33 seasons)** only. Pre-`1992` First Division seasons and Tiers 2–4 (`143` of `176` slots) mark scorer coverage explicitly as `unavailable` rather than fabricating figures or setting missing values to zero.

---

## Headline Empirical Findings

### 1. Predictor Hierarchy (`174` Completed Tables, `4,000` Team-Seasons)

| Predictor (Per Game) | Within-Slot Median `r` (Finish Score) | Interquartile Range `[Q1, Q3]` | Within-Slot Median `r` (PPG) | Why It Ranks Here |
| --- | --- | --- | --- | --- |
| **1. Win Rate (`W/G`)** | **`+0.9481`** | `[0.9311, 0.9599]` | `+0.9825` | Structural identity ($\text{PPG} = 3\cdot W/G + D/G$) |
| **2. Goal Difference (`GD/G`)** | **`+0.9247`** | `[0.9006, 0.9401]` | `+0.9478` | Net scoring balance per match |
| **3. Goals Against (`GA/G`)** | **`-0.7995`** (`|r| = 0.7995`) | `[-0.8329, -0.7453]` | `-0.8187` | Edges Goals For in **92 of 174** tables |
| **4. Goals For (`GF/G`)** | **`+0.7947`** (`|r| = 0.7947`) | `[0.7371, 0.8410]` | `+0.8209` | Slightly ahead of `GA/G` inside Tier 1 (`0.8363` vs `0.8235`) |
| **5. Draws (`D/G`)** | **`-0.0824`** (`|r| = 0.1564`) | `[-0.1868, +0.0811]` | `-0.0993` | Ranks last in every tier; worth only 1 point |

Switching to **Raw Sporting Points (`3W + D`)** yields virtually identical within-slot median rankings (`W/G` `+0.9499`, `GD/G` `+0.9270`, `GA/G` `-0.8015`, `GF/G` `+0.7972`, `D/G` `-0.0832`). Expanding beyond the Premier League reveals the tier nuance: attacking volume leads marginally across Tier 1 (`1981–2025`: median `|r|` `0.8363` for `GF/G` vs `0.8235` for `GA/G`), whereas defensive solidity (`GA/G` `0.7894` vs `GF/G` `0.7826`) slightly leads across EFL Tiers 2–4, tilting the four-tier aggregate cleanly toward goals conceded.

### 2. Champion vs. Runner-Up & Era Drift (`174` Title Races)

- **Champions** average **`2.063 PPG`** (median `2.043`, IQR `1.939–2.164`, range `1.739–2.632`), **`61.0%`** win rate, **`1.845 GF/G`**, **`0.888 GA/G`**, and **`+0.957 GD/G`**.
- **Runners-up** average **`1.923 PPG`** (median `1.898`, IQR `1.826–2.000`, range `1.690–2.553`), **`56.0%`** win rate, **`1.692 GF/G`**, **`0.937 GA/G`**, and **`+0.755 GD/G`**.
- **Era Inflation**: Champion average `PPG` rose monotonically across all four 11-year slices:
  - `1981–82 to 1991–92` (`44` titles): **`2.009 PPG`** (`1.840 GF/G`, `0.937 GA/G`)
  - `1992–93 to 2002–03` (`44` titles): **`2.043 PPG`** (`1.767 GF/G`, `0.883 GA/G`)
  - `2003–04 to 2013–14` (`44` titles): **`2.073 PPG`** (`1.845 GF/G`, `0.856 GA/G`)
  - `2014–15 to 2024–25` (`42` titles): **`2.132 PPG`** (`1.932 GF/G`, `0.875 GA/G`)
- **Tier Gradient**: Top-flight champions separate more sharply (`2.231 PPG` mean vs `2.054` 2nd) than Tier 2 (`2.030`), Tier 3 (`2.025`), or Tier 4 (`1.964`) title winners.
- **12 Champions Won Fewer Matches Than a Rival**: While every Tier 1 champion (`44/44`) won or shared the league lead in wins, **12 EFL champions (`12/174`) finished first with fewer wins than another club** (`2` in Tier 2, `5` in Tier 3, `5` in Tier 4), starting with **`1981–82` Third Division champions Burnley** (`21W, 17D, 8L = 80 pts` ahead of Carlisle United's `23W = 80 pts`) and including `1983–84` Chelsea, `1989–90` Bristol Rovers, `1990–91` Cambridge United & Darlington, `1997–98` Watford, `1999–00` Swansea City, `2006–07` Walsall, `2012–13` Gillingham, `2013–14` Chesterfield, `2014–15` AFC Bournemouth, and `2015–16` Wigan Athletic.

### 3. Survival & Promotion Cutoffs (`164` Relegation-Active Slots)

- **Overall Survival Baseline**: Across `164` relegation-active tables (`10` zero-relegation Tier 4 seasons excluded), the median lowest surviving side earned **`1.065 PPG`** (`40.5 pts` per 38 games; `49.0 pts` per 46 games), while the median highest relegated club finished on **`1.000 PPG`**.
- **Rule-of-Thumb Benchmarks Fail Across Tiers**: Relegated teams reached **`>= 1.053 PPG` (`40/38g`) in 46 of 164 tables (`28.0%`)** and **`>= 1.087 PPG` (`50/46g`) in 35 tables (`21.3%`)**.
  - **Highest relegated PPG**: **`1.174 PPG`** — `1988–89` Third Division **Southend United** (`54 pts / 46g`) and `2012–13` Championship **Peterborough United** (`54 pts / 46g`).
  - **Lowest safe PPG**: **`0.761 PPG`** — `1997–98` Football League Third Division (Tier 4) **Brighton & Hove Albion** (`35 pts / 46g`).
  - **Per-tier median lowest survivor**: Tier 1 **`1.026 PPG`** (`min 0.842`), Tier 2 **`1.067 PPG`** (`min 0.891`), Tier 3 **`1.087 PPG`** (`min 0.870`), Tier 4 **`1.022 PPG`** (`min 0.761`).
- **Automatic Promotion & Play-Offs (`Tiers 2–4`)**: Median final automatic promotion floors sit at **`1.891 PPG`** (Tier 2), **`1.870 PPG`** (Tier 3), and **`1.761 PPG`** (Tier 4). Across `38` completed play-off tournaments per EFL tier (`1987–2025` excl. curtailed `2019–20` L1/L2), the top play-off seed promoted `14/38` times in Tier 2, `14/38` in Tier 3, and just `1/38` in Tier 4 (`8/38` won by the lowest seed in Tiers 3 and 4, `6/38` in Tier 2).

### 4. Draws (`233` Division Draw-Leader Team-Seasons)

- Clubs leading or co-leading their division in draws finished at a **median position of `13th`** (`43.5%` finish percentile; `99/233` top half).
- **14** draw-leading clubs were relegated, **7** were promoted, and only **1** won a league title: **`1995–96` Football League Second Division (Tier 3) Swindon Town** (`25W–17D–4L`).
- Four completed sides in scope drew exactly half their matches (`50.0%`): Exeter City (`1986–87` T4, `23/46`), Hartlepool United (`1997–98` T4, `23/46`), Cardiff City (`1997–98` T4, `23/46`), and Leeds United (`1982–83` T2, `21/42`, finishing 8th).

### 5. Verified Premier League Scorer Concentration (`1992–93` to `2024–25`, `33` Seasons)

- Only **`12 of 33` Premier League champions** housed the league Golden Boot winner (correlation across all `666` PL team-seasons: `r = 0.287` with winning the title; `r = 0.342` with PPG).
- Among Top-4 sides, top-scorer share of team goals correlates **slightly negatively** with PPG (`r = -0.128`): Premier League champions get a **median `23.53%`** of league goals from their leading scorer, compared with **`24.66%`** for runners-up and **`26.10%`** for 3rd–4th finishers.

---

## Development, Regeneration & Verification

Require **Node.js `>= 22.0.0`**. Zero npm runtime or build dependencies are needed.

```powershell
# Run the full test suite (data integrity, statistical engine, file://, HTTP UI & XSS tests)
npm test

# Rebuild dataset, browser bundle, and manifest deterministically from cached sources
npm run import

# Re-fetch upstream CSVs/HTML tables from network (respecting fixed 2024-25 endpoint)
npm run import:fetch
```

### Viewing Locally

- **Zero-server offline preview**: Double-click [`index.html`](index.html) (`file://`) — reads `data/england-tiers-1-4-1981-2025-bundle.js` automatically.
- **Static HTTP preview** (recommended for Chrome DevTools / JSON `fetch`): serve the repository root over HTTP (e.g., `npx --yes serve .` or any static server; loads [`data/england-tiers-1-4-1981-2025.json`](data/england-tiers-1-4-1981-2025.json) with strict schema validation).
