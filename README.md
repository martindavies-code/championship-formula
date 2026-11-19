# The Championship Formula

**An empirical study of English professional league tables across Tiers 1–4 in the three-points-for-a-win era (`1981–82` through `2025–26`) — asking what separates champions, contenders, and survivors from everyone else.**

This is a static, zero-runtime-dependency web application built on reconciled local data with no backend, no accounts, and no runtime API scraping. It extends the original Premier League (`1992–93` to `2024–25`) study across all four tiers of the English pyramid from the 1981–82 introduction of three points for a win through `2025–26`—spanning **180 tier-season slots**, **4,139 team-seasons**, **91,270 matches**, and **238,714 goals** (or **178 completed full-season tables**, **4,092 team-seasons**, **90,430 matches**, and **236,562 goals** with the two COVID-curtailed `2019–20` EFL League One and League Two tables excluded by default).

### Key Findings (The Surprising Bits First)

- **You do not have to win the most matches to win the league.** In `13` of `178` title races (all in Tiers 2–4), the champion won fewer games than a rival—from Burnley in `1981–82` (`21` wins vs Carlisle United's `23`) to Bromley in `2025–26` (`24` wins vs 4th-placed Salford City's `25`).
- **The "40 points for safety" rule breaks down both ways.** Across `168` tables with relegation, a relegated club reached 40-in-38 pace (`1.053` points a game) in `47` tables (`28.0%`). Yet in the `31` 38-game Premier League seasons (`1995–96` to `2025–26`), 17th place stayed safe below 40 points `22` times (`71.0%`)—even though in `2025–26` West Ham went down on `39`.
- **Attack vs. defence flips depending on how you measure it.** Inside single tables, goals conceded edges goals scored (`0.798` vs `0.796`, leading `92` of `178` tables); pooled across all clubs, goals scored tracks more variation in points per game (`65.8%` vs `61.0%`).
- **Leading the league in draws pulls clubs to the middle—with wild exceptions.** `62%` (`149 of 240`) of division draw leaders finished in the middle half, `15` went down, and only `1` won a title (Swindon Town, `1995–96`). Yet in `2025–26`, Premier League draw leaders AFC Bournemouth (`18` draws) still finished 6th, while League One draw leaders Bolton Wanderers (`18` draws) won promotion.
- **Most Premier League champions did not have the Golden Boot winner.** Only `12 of 34` verified Premier League champions (`35%`) fielded the league's top scorer—including `2025–26`, when Arsenal won the title with Viktor Gyökeres on `14` goals while Manchester City's Erling Haaland led the league with `27`.
- **Top play-off seeds miss out most of the time—and below 1st seed, seeding barely matters.** Across `112` standard four-team EFL play-off tournaments (`1988–89` to `2025–26`), 1st seeds won promotion `35.7%` of the time (`40/112`), vs `24.1%` for 2nd (`27`), `19.6%` for 3rd (`22`), and `20.5%` for 4th (`23`)—a pattern that stays consistent across the Championship, League One, and League Two (`43/117` top lower-tier seeds overall including the five `1986–88` inter-divisional promotions). In `2025–26`, all three finals went to lower seeds (`6th`-placed Hull City, `5th`-placed Bolton Wanderers, and `5th`-placed Notts County). Meanwhile, `11` clubs have been relegated by points deductions despite finishing safe on pitch points—most recently Leicester City (`-6`) in `2025–26`, when Sheffield Wednesday's `-18` penalty left them on an era-low `0` points.

---

## Live Architecture & Files

- [`index.html`](index.html) — Editorial single-page layout (`<script defer>` classic scripts, no `type="module"`), interactive global scope bar (presets, Official vs. On-Pitch Points toggle, Tier 1–4 filter, configurable `1981–82..2025–26` range, COVID curtailment opt-in), and accessible fallback states.
- **Reading Mode switch** (top of page): **Normal Person Mode** (default, plain English) vs **Statistics Sicko Mode** (jargon-heavy quant register with the [`assets/stats-sicko.jpg`](assets/stats-sicko.jpg) cartoon). Same data and numbers in both; only the prose, labels and headings change.
- [`analysis.js`](analysis.js) — Pure statistical calculation engine (`window.ChampionshipAnalysis` / UMD-style browser & Node test compatibility) implementing dataset schema validation, within-slot correlations, era and tier breakdowns, deduction sensitivity (`official` vs `raw`), non-relegating slot separation, and scorer availability checks.
- [`app.js`](app.js) — DOM & inline SVG visualization controller built exclusively with safe DOM/SVG node constructors (`textContent` only; zero `.innerHTML`), responsive interactive tooltips, and sortable full-archive tables.
- [`styles.css`](styles.css) — High-density newspaper/sports-analytics styling, tabular numerals, responsive layouts tested down to `320px` / `360px` / `390px` viewports.
- [`data/england-tiers-1-4-1981-2026.json`](data/england-tiers-1-4-1981-2026.json) — Canonical dataset (`schemaVersion: "2.0.0"`, `3,549,213` bytes, canonical SHA-256 `2d0d3073e478cbd6349dd2b723e60961cf70eda0c55cf7a55132b257232d7549`).
- [`data/england-tiers-1-4-1981-2026-bundle.js`](data/england-tiers-1-4-1981-2026-bundle.js) — Pre-bundled `window.__CHAMPIONSHIP_DATASET__` mirror (`3,549,407` bytes) matching canonical SHA-256 so the app works identically when opened directly via `file://` without a local server.
- [`data/coverage-manifest.json`](data/coverage-manifest.json) — Full reconciliation manifest recording all `180` slots, `62` historical deduction audit records, `46` minor single-goal match-level discrepancies vs RSSSF retained transparently (`0` Premier League discrepancies; `0` discrepancies in `2025–26`), `118` club identity records, and the `33`-season Premier League parity check.
- [`data/premier-league-1992-2025.json`](data/premier-league-1992-2025.json) & [`data/premier-league-2025-26-scorers.json`](data/premier-league-2025-26-scorers.json) — Original audited 1992–2025 Premier League baseline (retained untouched for regression parity) plus verified `2025–26` Premier League Golden Boot and club top-scorer records.
- [`scripts/import-data.mjs`](scripts/import-data.mjs) & [`scripts/reconcile-helpers.mjs`](scripts/reconcile-helpers.mjs) — Deterministic local ETL pipeline (supporting `--from-cache`, `--fetch`, and configurable `--end-year=YYYY` up to `2025`).
- [`tests/`](tests/) — Automated Node test suite covering schema validation, statistical edge cases, mathematical conservation laws, Premier League parity, offline `file://` rendering, interactive HTTP UI flows, XSS resilience, and viewport overflow checks.

---

## Sources, Attribution & Reconciliation Audit

### 1. Primary & Cross-Check Data Sources

1. **Sean Elvidge — `England-football-results` (CC BY 4.0)**
   Pinned repository commit `fb4c796d5faffd7098d481bfc041778b80a2286c`:
   - `EnglandLeagueResults.csv` (SHA-256 `3de4a6938ebab33cf4fc47c545ad9de56690a523c561e7e880ef65ababcceab6`) — Match results aggregated directly to P/W/D/L/GF/GA without using rating or forecast columns. In-progress post-`2025–26` fixtures (`2026/2027`) are explicitly excluded from the completed `1981–82..2025–26` endpoint.
   - `EnglishTeamPointDeductions.csv` (SHA-256 `bd03b1079cfc624f9648c2aa706b0382f36f98765d5983bd2521f127f48a5f14`) — Point deduction and appeal ledger (including `2025–26` Championship deductions for Sheffield Wednesday `-18`, Leicester City `-6`, and West Bromwich Albion `-2`).
   - `EnglishTeamNamePeriods.csv` (SHA-256 `61629e954c5bac4fbf04aa76a3393f238a9b4556a867bb8fe2ef412473038987`) — Club name lineage.
   - Attribution: *Match results and deduction logs derived in part from Sean Elvidge (`England-football-results`), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (whose compilation cites RSSSF, Curley 2016, ENFA, footballcsv, Wikipedia, Statto, 11v11, football-data.co.uk, and BBC).*
2. **RSSSF — England Football Statistics Archive (`engpaul/FLA/` & `tablese/`, including `eng2026.html`)**
   Independent cross-check across all `180` tables for final positions, automatic promotions, play-off winners, relegations, and deductions.
3. **Football-Data.co.uk (`E0`–`E3` CSVs)**
   Independent match-level cross-check across all four tiers from `1993–94` through `2025–26` (`132` tier-seasons).
4. **Wikipedia / Official EFL & Premier League Statements**
   Verification of the COVID-curtailed `2019–20` EFL League One and League Two unweighted-PPG tables, Bury’s `2019` expulsion (preserving Bury’s `2018–19` Tier 4 2nd-place on-field promotion while noting their August 2019 EFL expulsion), the `2025–26` Championship play-off disqualification/reinstatement (Southampton expelled after the semi-finals; Middlesbrough reinstated to face Hull City in the final), `2025–26` Premier League Golden Boot and club top scorers, and eight resolved omissions/discrepancies where RSSSF lagged official EFL rulings:
   - `2005–06` Tier 4 **Bury** (`-1` unregistered loanee)
   - `2006–07` Tier 4 **Boston United** (`-10` administration deduction; relegated to Conference North)
   - `2008–09` Tier 2 **Crystal Palace** (`-1` ineligible player)
   - `2009–10` Tier 3 **Hartlepool United** (`-3` ineligible player and table rank ordering)
   - `2012–13` Tier 3 **Portsmouth** (`-10` administration exit penalty)
   - `2015–16` Tier 3 **Bury** (`-3` retrospective registration penalty)
   - `2022–23` Tier 2 **Wigan Athletic** (`-6` combined from two `-3` penalties where RSSSF listed `-3`)
   - `2023–24` Tier 4 **Morecambe** (`-3` wage payment penalty)
5. **Premier League Baseline Regression Parity (`data/premier-league-1992-2025.json`)**
   All `33` historical `1992–2025` Premier League seasons (`666` team-seasons, `12,786` matches, `34,433` goals) match cell-for-cell with zero discrepancies across table totals, official positions, deductions, relegations, and top-scorer awards, extended to `34` seasons (`686` team-seasons, `13,166` matches, `35,478` goals) with verified `2025–26` records.

---

## Structural Method & Scope Rules

- **Three-Points-for-a-Win Floor (`1981–82`)**: Prior to `1981–82`, English Football League divisions awarded two points for a win. Pre-`1981` two-point tables are omitted rather than rescaled because multiplying past wins by `1.5` invents outcomes without changing historical match incentives.
- **Invariant Tier + Historical Division Naming**: Tables always join on pyramid `tier` (`1` = top flight through `4` = fourth tier), while displaying the historically accurate division name for each season (e.g., `Football League First Division` in Tier 1 before `1992–93` vs. `Football League First Division` in Tier 2 from `1992–93` through `2003–04`; `Championship / League One / League Two` rebrand from `2004–05`; `EFL` prefix from `2016–17`).
- **Per-Game, Normalised Finish Score & `median(|r|)` vs. Pooled `R²(PPG)`**: League sizes vary across `20`, `21`, `22`, `23`, and `24` clubs and schedules span `38`, `40`, `42`, `44`, and `46` games per team. Primary predictor ranking uses within-slot Pearson correlation against a normalised finish score $1 - (\text{pos} - 1)/(N - 1)$ (`1.00` = Champion, `0.00` = Bottom), reported both as **median signed `r`** and **median of `|r|`** across tables (note that $\text{median}(|r|) \ge |\text{median}(r)|$ whenever signs flip across tables, as occurs for draws), alongside **pooled `R²(PPG)`** across stacked club-seasons.
- **COVID-19 Curtailed `2019–20` Tables**: `2019–20` EFL League One (`400` matches across `23` remaining active clubs after Bury’s expulsion) and `2019–20` EFL League Two (`440` matches) ended on unweighted points per game (`34–37` played per club). Both are excluded from default full-season baselines (`178` slots) and toggleable via **Include shortened 2019–20 League One & League Two**.
- **Official Table vs. Raw Sporting Points (`3W + D`) Toggle Semantics**: Across the `178` completed default tables, `59` team-seasons experienced net point adjustments or deduction rulings (`61` across all `180` tables; `62` historical audit entries including Tottenham’s overturned `1994–95` deduction). Switching **Points** to **On-Pitch Points (before deductions)** recomputes on-pitch points (`rawPoints`), `PPG` (`rawPpg`), `rawPos`, and `finishScore` (affecting Section 1 correlations/scatter and deduction sensitivity, shifting `193` finishes and lifting `11` relegated clubs above the relegation zone: *Middlesbrough 1996–97, Wrexham 2004–05, AFC Bournemouth 2007–08, Luton Town 2008–09, Plymouth Argyle 2010–11, Portsmouth 2011–12, Wigan Athletic 2019–20, Sheffield Wednesday 2020–21, Derby County 2021–22, Reading 2022–23, Leicester City 2025–26*). Official league positions (`rPos` / `pos`), champions, runners-up, promotion/play-off outcomes, survival/relegation cutoffs, draw-leader finishes, and Top-4 scorer outcomes always retain official league tables.
- **Typed `outcomeType` Separation of Non-Relegating & Reprieved Boundary Clubs**: Every club row carries a closed-set `outcomeType` (`none`, `reprieved`, `expelled`, `withdrew`, `administration_relegation`). Ten Tier 4 seasons had zero automatic relegation (`1981–82` through `1985–86` re-election era; `1990–91` restructuring; `1991–92` after Aldershot withdrew and Maidstone later resigned; plus ground-grading reprieves in `1993–94`, `1994–95`, and `1995–96`), leaving `168` relegation-active tables. Within relegation-active tables, `outcomeType` excludes non-merit survivors such as `2019–20` Tier 4 23rd-placed **Stevenage** (`reprieved` due to Bury’s Tier 3 expulsion) so **Morecambe** (22nd, `0.865 PPG`) is reported cleanly as the merit survivor.
- **Club Identity & Lineage Policy**: Contested or discontinued club transitions (`Wimbledon` relegated in `2003–04` -> renamed/relocated `Milton Keynes Dons` from `2004–05` vs. `AFC Wimbledon`; pre-1992 `Aldershot` vs. `Aldershot Town`) remain distinct `clubId` records in `coverage-manifest.json` with explicit per-season outcomes resolved from sources (`MISSING_NEXT_TIER_OUTCOMES` fails loudly on any unrecorded Tiers 1–3 exit).
- **Historical Tie-Break Rules**: From `1992–93` through `1998–99`, Football League Divisions One, Two, and Three (Tiers 2–4) broke ties on **Goals For (`GF`) ahead of Goal Difference (`GD`)**. Table sorting honors historical tie-break rules per division-season.
- **Explicit Scorer Coverage Boundary**: Verified Golden Boot and leading club-scorer figures (club-level) cover **Premier League (`Tier 1, 1992–93 to 2025–26`, 34 seasons)** only. Pre-`1992` First Division seasons and Tiers 2–4 (`146` of `180` slots; `144` of `178` completed tables) mark scorer coverage explicitly as `unavailable` rather than fabricating figures or setting missing values to zero.

---

## Headline Empirical Findings

### 1. Predictor Hierarchy (`178` Completed Tables, `4,092` Team-Seasons)

| Predictor (Per Game) | Within-Slot Med. Signed `r` | Within-Slot Med. `\|r\|` `[Q1, Q3]` | Within-Slot Med. `r` (PPG) | Pooled `R²(PPG)` | Why It Ranks Here |
| --- | --- | --- | --- | --- | --- |
| **1. Win Rate (`W/G`)** | **`+0.9478`** | **`0.9478`** `[0.9310, 0.9599]` | `+0.9825` | `95.7%` | Structural identity ($\text{PPG} = 3\cdot W/G + D/G$) |
| **2. Goal Difference (`GD/G`)** | **`+0.9245`** | **`0.9245`** `[0.8998, 0.9401]` | `+0.9479` | `89.6%` | Net scoring balance per match |
| **3. Goals Against (`GA/G`)** | **`-0.7985`** | **`0.7985`** `[0.7453, 0.8329]` | `-0.8187` | `61.0%` | Edges `GF/G` within-slot in **92 of 178** tables |
| **4. Goals For (`GF/G`)** | **`+0.7957`** | **`0.7957`** `[0.7392, 0.8432]` | `+0.8215` | **`65.8%`** | Leads pooled `R²(PPG)` and full T1 within-slot (`0.8413` vs `0.8225`) |
| **5. Draws (`D/G`)** | **`-0.0824`** (`[−0.1868, +0.0839]`) | **`0.1564`** `[0.0828, 0.2568]` | `-0.0949` | `1.0%` | Ranks 5/5 in every tier; 22 games: 11W+11L = 33 pts vs 22D = 22 pts (11D = 11 pts) |

Attack vs. defence depends legitimately on which metric is asked: **within-slot median `|r|` (finish rank)** puts `GA/G` slightly ahead (`0.7985` vs `0.7957`, winning `92` vs `86` tables — and similarly `0.8501` vs `0.8484` in `pl-1992-2026`), whereas **pooled `R²(PPG)`** puts `GF/G` ahead (`65.8%` from `r = +0.8111` vs `61.0%` from `r = -0.7812` across all 4 tiers, and `77.2%` vs `68.0%` in `pl-1992-2026`). The measures use different outcomes and aggregation methods, so their rankings can differ. Across all 45 Tier 1 seasons (`1981–2026`), `GF/G` leads both metrics (`0.8413` vs `0.8225`; `75.3%` vs `66.2%`), while `GA/G` leads within-slot in Tiers 2 and 3. Switching to **On-Pitch Points (`3W + D`)** yields virtually identical within-slot medians (`W/G` `+0.9498`, `GD/G` `+0.9266`, `GA/G` `-0.8009`, `GF/G` `+0.7985`, `D/G` signed `-0.0832` / `|r|` `0.1555`).

### 2. Champion vs. Runner-Up & Era Drift (`178` Title Races)

- **Champions** average **`2.064 PPG`** (median `2.043`, IQR `1.939–2.172`, range `1.739–2.632`), **`61.0%`** win rate, **`1.845 GF/G`**, **`0.888 GA/G`**, and **`+0.957 GD/G`**.
- **Runners-up** average **`1.924 PPG`** (median `1.898`, IQR `1.826–2.000`, range `1.690–2.553`), **`55.9%`** win rate, **`1.697 GF/G`**, **`0.939 GA/G`**, and **`+0.758 GD/G`**.
- **Era Inflation**: Champion average `PPG` rose monotonically across all four eras:
  - `1981–82 to 1991–92` (`44` titles): **`2.009 PPG`** (`1.840 GF/G`, `0.937 GA/G`)
  - `1992–93 to 2002–03` (`44` titles): **`2.043 PPG`** (`1.767 GF/G`, `0.883 GA/G`)
  - `2003–04 to 2013–14` (`44` titles): **`2.073 PPG`** (`1.845 GF/G`, `0.856 GA/G`)
  - `2014–15 to 2025–26` (`46` titles): **`2.130 PPG`** (`1.926 GF/G`, `0.877 GA/G`)
- **Tier Gradient**: Top-flight champions separate more sharply (`2.231 PPG` mean vs `2.054` 2nd) than Tier 2 (`2.031`), Tier 3 (`2.030`), or Tier 4 (`1.962`) title winners.
- **13 Champions Won Fewer Matches Than a Rival**: While every Tier 1 champion (`45/45`) won or shared the league lead in wins, **13 EFL champions (`13/178`) finished first with fewer wins than another club** (`2` in Tier 2, `5` in Tier 3, `6` in Tier 4), starting with **`1981–82` Third Division champions Burnley** (`21W, 17D, 8L = 80 pts` ahead of Carlisle United's `23W = 80 pts`) and running through **`2025–26` League Two champions Bromley** (`24W, 15D, 7L = 87 pts` ahead of 4th-placed Salford City's `25W = 81 pts`), alongside `1983–84` Chelsea, `1989–90` Bristol Rovers, `1990–91` Cambridge United & Darlington, `1997–98` Watford, `1999–00` Swansea City, `2006–07` Walsall, `2012–13` Gillingham, `2013–14` Chesterfield, `2014–15` AFC Bournemouth, and `2015–16` Wigan Athletic.

### 3. Survival & Promotion Cutoffs (`168` Relegation-Active Slots)

- **Overall Survival Baseline**: Across `168` relegation-active tables (`10` zero-relegation Tier 4 seasons excluded), the median lowest surviving side earned **`1.065 PPG`** (`40.5 pts` per 38 games; `49.0 pts` per 46 games), while the median highest relegated club finished on **`1.000 PPG`**.
- **Rule-of-Thumb Benchmarks Fail Across Tiers**: Relegated teams reached **`>= 1.053 PPG` (`40/38g`) in 47 of 168 tables (`28.0%`)** and **`>= 1.087 PPG` (`50/46g`) in 35 tables (`20.8%`)**.
  - **Highest relegated PPG**: **`1.174 PPG`** — `1988–89` Third Division **Southend United** (`54 pts / 46g`) and `2012–13` Championship **Peterborough United** (`54 pts / 46g`).
  - **Lowest safe PPG**: **`0.761 PPG`** — `1997–98` Football League Third Division (Tier 4) **Brighton & Hove Albion** (`35 pts / 46g`).
  - **Per-tier median lowest survivor**: Tier 1 **`1.026 PPG`** (`min 0.842`), Tier 2 **`1.068 PPG`** (`min 0.891`), Tier 3 **`1.087 PPG`** (`min 0.870`), Tier 4 **`1.022 PPG`** (`min 0.761`).
- **Premier League Preset Baseline Note (`pl-1992-2026`)**: The `pl-1992-2026` preset spans all **`34`** Premier League tables (`1992–93` to `2025–26`), including the three `42`-game `1992–95` seasons, whereas the 38-game Premier League survival baseline covers the **`31`** `38`-game seasons (`1995–96` to `2025–26`) only (`34.7` mean / `34` median pts for 18th place, `3/31` relegated on `40+` pts, `15/31` relegated at `>= 35` pts, `22/31` 17th place below `40` pts). The figures differ for that intentional scope definition rather than any data error, and Section 03 renders the computed 38-game Premier League baseline line alongside PL scopes that include `1992–95`.
- **Automatic Promotion & Play-Offs (`Tiers 2–4`)**: Median final automatic promotion floors sit at **`1.891 PPG`** (Tier 2), **`1.880 PPG`** (Tier 3), and **`1.761 PPG`** (Tier 4). Across all `117` completed EFL play-off promotions (`39` per tier, `1986–87` to `2025–26` excl. curtailed `2019–20` L1/L2), the top lower-tier seed went up `14/39` times in Tier 2, `14/39` in Tier 3, and `15/39` in Tier 4 (`43/117`, `36.8%`), while the bottom lower-tier seed went up `7/39` in Tier 2, `9/39` in Tier 3, and `9/39` in Tier 4.
- **Four-Team Play-Off Promotion Rate by Seed (`1988–89` to `2025–26`, `112` Completed Tournaments)**: Excluding the `5` earlier `1986–88` inter-divisional lower-tier promotions (where three lower-tier clubs joined one club from the division above, so no 4th seed existed), every seed starts from an apples-to-apples `25%` equal-odds baseline. The 1st seed holds a clear edge (`35.7%`) yet still misses out nearly two-thirds of the time, seeds 2–4 cluster tightly around `20%–24%`, and the split stays consistent across all three EFL levels (with a counter-intuitive twist: League Two has the tightest median 1st-to-4th points gap at `6` pts vs `9` in Championship and League One, yet the highest 1st-seed win rate at `40.5%`—well within small-sample variation across `37–38` tournaments per tier):

  | Tier | Play-Offs | 1st Seed | 2nd Seed | 3rd Seed | 4th Seed | Top 2 Seeds (Home 2nd Leg) | Median 1st–4th Gap |
  | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
  | **All EFL Combined** | **112** | **35.7% (40)** | **24.1% (27)** | **19.6% (22)** | **20.5% (23)** | **59.8% (67)** | **7.5 pts** |
  | Championship (Tier 2) | 38 | 34.2% (13) | 23.7% (9) | 23.7% (9) | 18.4% (7) | 57.9% (22) | 9 pts |
  | League One (Tier 3) | 37 | 32.4% (12) | 27.0% (10) | 16.2% (6) | 24.3% (9) | 59.5% (22) | 9 pts |
  | League Two (Tier 4) | 37 | 40.5% (15) | 21.6% (8) | 18.9% (7) | 18.9% (7) | 62.2% (23) | 6 pts |

  *(Disclosures: `1989–90` Tier 2 officially credits 4th seed Sunderland after 2nd seed Swindon Town won the final 1–0 and were stripped of promotion for financial irregularities; `2025–26` Tier 2 saw 2nd seed Southampton expelled after the semi-finals for filming opposition training, with 3rd seed Middlesbrough reinstated for the final and losing 1–0 to 4th seed Hull City; opting in to curtailed `2019–20` L1/L2 brings the total to `114` tournaments: `36.0% / 23.7% / 19.3% / 21.1%`.)*

### 4. Draws (`240` Division Draw-Leader Club-Seasons Across `178` Tables)

- Draw leaders cluster in the middle half rather than occupying mid-table exclusively: **`149 of 240` (`62.1%`) finished in the middle half (`25%–75%` finish percentile)**, **`59` (`24.6%`) in the bottom quarter (`<25%`)**, and **`32` (`13.3%`) in the top quarter (`>75%`)**. Median finish percentile is **`43.5%`** (`13th` raw rank across 20–24 club divisions; `103/240` top half). Because `47` of the `178` tables had tied co-leaders, these `240` campaigns are not independent observations.
- **15** draw-leading clubs were relegated, **9** were promoted, and only **1** won a league title: **`1995–96` Football League Second Division (Tier 3) Swindon Town** (`25W–17D–4L`).
- Four completed sides in scope drew exactly half their matches (`50.0%`): Exeter City (`1986–87` T4, `23/46`), Hartlepool United (`1997–98` T4, `23/46`), Cardiff City (`1997–98` T4, `23/46`), and Leeds United (`1982–83` T2, `21/42`, finishing 8th).

### 5. Verified Premier League Scorer Concentration (`1992–93` to `2025–26`, `34` Seasons)

- Only **`12 of 34` Premier League champions** housed the league Golden Boot winner (correlation across all `686` PL team-seasons: `r = 0.278` with winning the title; `r = 0.344` with PPG).
- Among Top-4 sides (`n = 34` champions, `n = 34` runners-up, `n = 68` 3rd–4th finishers), champions show a slightly lower median leading-scorer share of team goals (**`23.53%`**) than runners-up (**`24.69%`**) and 3rd–4th finishers (**`26.10%`**), with a modest negative correlation between concentration share and official PPG (`r = -0.125`; descriptive association only).

---

### 6. Division Leading Scorers and Top-Four Club Scorers (descriptive, separate from the Golden Boot analysis)

Two extra data files sit beside the main dataset. They are descriptive and do not feed the Premier League scorer analysis in section 5.

- `data/division-leaders.json` (browser copy `division-leaders-bundle.js`): one record per division-season, with a status of `verified_league`, `disputed` or `not_verified`. A season is `verified_league` only when two league-scoped publishers agree on the full set of leaders and on the league goal count. Wikipedia and RSSSF are used only as corroboration. Disputed and unverified seasons carry no player or count. Source links are in the file.
- `data/tier1-club-leaders-1981-92.json` (browser copy `tier1-club-leaders-1981-92-bundle.js`): the leading league scorer of each top-four First Division club, 1981-82 to 1991-92. Rows with a transfer, a tie or a count conflict are kept and marked unresolved, not filled in.

The goals-per-game figure divides the leader's league goals by the division's scheduled league games per club (38, 40, 42, 44 or 46). The verified seasons are not a representative sample of all seasons.

## Development, Regeneration & Verification

Require **Node.js `>= 22.0.0`**. Zero npm runtime or build dependencies are needed.

```powershell
# Run the full test suite (data integrity, statistical engine, file://, HTTP UI & XSS tests)
npm test

# Rebuild dataset, browser bundle, and manifest deterministically from cached sources
npm run import

# Re-fetch upstream CSVs/HTML tables from network (respecting fixed 2025-26 endpoint)
npm run import:fetch
```

### Viewing Locally

- **Zero-server offline preview**: Double-click [`index.html`](index.html) (`file://`) — reads `data/england-tiers-1-4-1981-2026-bundle.js` automatically.
- **Static HTTP preview** (recommended for Chrome DevTools / JSON `fetch`): serve the repository root over HTTP (e.g., `npx --yes serve .` or any static server; loads [`data/england-tiers-1-4-1981-2026.json`](data/england-tiers-1-4-1981-2026.json) with strict schema validation).
