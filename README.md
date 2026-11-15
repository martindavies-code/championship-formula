# The Championship Formula

**An empirical study of every completed Premier League final table and top-scorer chart from 1992–93 through 2024–25 (33 seasons, 666 team-seasons, 12,786 matches, 34,433 goals).**

This repository contains a static, zero-dependency single-page web application (`index.html`, `styles.css`, `app.js`) and its verified local dataset (`data/premier-league-1992-2025.json`). Every statistic, correlation, quantile, table cell, and SVG chart rendered on the page is computed at runtime in the browser directly from `data/premier-league-1992-2025.json`.

---

## 1. Data Sources & Verification

### Primary Source
- **Wikipedia Premier League Season Articles (`1992–93 FA Premier League` through `2024–25 Premier League`)**:
  - Final league standings (`Pos`, `Team`, `Pld`, `W`, `D`, `L`, `GF`, `GA`, `GD`, `Pts`, relegation status, and official points deductions).
  - Top-scorer tables (`Rank`, `Player`, `Club(s)`, `Goals`), including split-club goal breakdowns for players transferred mid-season (e.g., Teddy Sheringham 1992–93, Andy Cole 1994–95, Louis Saha 2003–04, Darren Bent 2010–11, Demba Ba 2012–13).
  - For the 20 out of 132 Top-Four team-seasons where a club's leading league goalscorer finished below the league-wide Top 10 cutoff (such as 2024–25 Arsenal with Kai Havertz on 9 goals, or 2020–21 Chelsea with Jorginho on 7 goals), exact club-level leading league scorers were retrieved from the corresponding club season articles so that Top-Four goal-concentration figures suffer zero survivorship bias.

### Independent Match-Level Verification (Spot-Checks)
- **Football-Data.co.uk Historical Match CSVs (`E0.csv`)**:
  - Four full seasons spanning the dataset's history were independently reconstructed from raw match-by-match full-time scores (`FTHG`, `FTAG`):
    1. **`1993-94`** (42-game era, 22 clubs, 462 matches): **0 discrepancies** across all 22 rows (`Pld`, `W`, `D`, `L`, `GF`, `GA`, `GD`, `Pts`).
    2. **`2003-04`** (38-game era, 20 clubs, 380 matches — Arsenal's unbeaten campaign): **0 discrepancies** across all 20 rows.
    3. **`2017-18`** (38-game era, 20 clubs, 380 matches — Manchester City's 100-point campaign): **0 discrepancies** across all 20 rows.
    4. **`2024-25`** (38-game era, 20 clubs, 380 matches — Liverpool's title campaign): **0 discrepancies** across all 20 rows.
  - Across all 33 seasons (666 team-seasons), automated conservation checks verified `W + D + L == Pld`, `GF - GA == GD`, `3W + D - pointsDeducted == Pts`, `∑W == ∑L`, and `∑GF == ∑GA`.

---

## 2. Structural Gotchas & Normalisation Decisions

1. **Season Length (42 Games vs. 38 Games)**:
   - **1992–93, 1993–94, and 1994–95** featured **22 clubs** playing **42 matches** each (66 team-seasons; 462 matches per season).
   - **1995–96 through 2024–25 (30 seasons)** featured **20 clubs** playing **38 matches** each (600 team-seasons; 380 matches per season).
   - **Normalisation Rule**: All cross-era correlations (`n = 666`) are computed on **per-game rates** (`Points/G`, `Wins/G`, `Draws/G`, `GF/G`, `GA/G`, `GD/G`). Where cross-era distributions or timelines are expressed in full-season units for intuitive reading, 42-game seasons are scaled to a **38-game equivalent** (`rate × 38`).

2. **Relegation Line Shifts**:
   - In **1992–93 and 1993–94**, 3 clubs were relegated from a 22-team table (19th survived; 20th–22nd relegated).
   - In **1994–95**, **4 clubs were relegated** (18th survived; 19th–22nd relegated) to contract the division from 22 to 20 clubs.
   - From **1995–96 onwards**, 3 clubs were relegated each season (17th survived; 18th–20th relegated).
   - The survival analysis presents both the **30-season 38-game era** (where the "40-point mark" cliché applies directly to a 38-game schedule) and the **all-33-season 38-game normalised series**.

3. **Three Points for a Win**:
   - Constant across all 33 Premier League seasons (no adjustment required).

4. **Official Points Deductions**:
   - Four points deductions occurred across the 33 seasons and are explicitly recorded in the JSON (`points`, `rawPoints`, `pointsDeducted`, `deductionReason`):
     - `1996-97` Middlesbrough: **−3 pts** (failed to fulfil fixture)
     - `2009-10` Portsmouth: **−9 pts** (entering administration)
     - `2023-24` Everton: **−8 pts** (PSR breaches, 6 + 2 pts)
     - `2023-24` Nottingham Forest: **−4 pts** (PSR breach)

---

## 3. Computed Headline Findings

### I. Predictor Hierarchy Across All 666 Team-Seasons (Per-Game Normalised)

| Rank | Metric (Per Game) | Pearson `r` (PPG) | Variance Explained `R²` (PPG) | Pearson `r` (Pos) | Spearman `ρ` (Pos) |
| :--- | :--- | ---: | ---: | ---: | ---: |
| **1** | **Wins / Game (`W/G`)** | **+0.9859** | **97.2%** | **−0.9238** | **−0.9572** |
| **2** | **Goal Difference / Game (`GD/G`)** | **+0.9623** | **92.6%** | **−0.9049** | **−0.9297** |
| **3** | **Goals For / Game (`GF/G`)** | **+0.8785** | **77.2%** | **−0.8053** | **−0.8249** |
| **4** | **Goals Against / Game (`GA/G`)** | **−0.8232** | **67.8%** | **+0.7984** | **+0.8074** |
| **5** | **Draws / Game (`D/G`)** | **−0.1915** | **3.7%** | **+0.1536** | **+0.1427** |

- **100% Win-Leader Rule**: In **33 of 33 seasons (100.0%)**, the champion led (or co-led) the league in wins. No club has ever won the Premier League with fewer wins than another team.
- **Goals For Beats Goals Against**: `GF/G` explains **9.4 percentage points more variance** in Points per Game than `GA/G` (`77.2%` vs `67.8%`). Moreover, **22 of 33 champions (66.7%)** had the league's #1 attack (most GF), whereas only **15 of 33 (45.5%)** had the #1 defence (fewest GA).
- **Draws Rank Dead Last**: `Draws/G` explains just **3.7%** of PPG variance (`2.4%` of position variance) and is *negatively* correlated with points (`r = −0.1915`).

---

### II. The Champion Profile vs. Runners-Up (38-Game Normalised, `n = 33`)

| Metric (per 38 Games) | Champion Mean | Champion Median (IQR) | Runner-Up Mean | Runner-Up Median (IQR) | Separation (1st − 2nd) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **Points / 38g** | **86.9** (`2.29 PPG`) | **87.0** (`82.0–91.0`) | **80.0** (`2.10 PPG`) | **79.6** (`76.0–84.0`) | **+6.9 pts** (`+0.18 PPG`) |
| **Wins / 38g** | **26.6** | **27.0** (`24.4–28.0`) | **23.9** | **24.0** (`22.0–26.0`) | **+2.7 wins** |
| **Goals For / 38g** | **82.2** | **80.0** (`73.0–93.0`) | **75.4** | **73.0** (`66.0–86.0`) | **+6.8 goals** |
| **Goals Against / 38g** | **32.0** | **33.0** (`27.0–36.0`) | **32.8** | **33.0** (`27.0–37.0`) | **−0.8 goals** |
| **Goal Difference / 38g** | **+50.1** | **+48.0** (`+41.0–+58.0`) | **+42.6** | **+40.0** (`+33.0–+51.0`) | **+7.6 GD** |

- **Champions and Runners-Up Have the Same Defence**: Both average `~32–33` goals conceded per 38 games (exact median `33.0` for both; mean difference just `0.8` goals over 38 games). In **17 of 33 seasons (51.5%)**, the runner-up conceded as few or fewer goals than the champion.
- **Era Inflation**: Splitting the 33 seasons into three 11-season eras shows a relentless escalation in the title standard:
  - **Era I (1992–93 to 2002–03)**: Champion mean **81.3 pts/38g** (`2.14 PPG`, `24.1 W/38g`, `+39.9 GD/38g`)
  - **Era II (2003–04 to 2013–14)**: Champion mean **88.4 pts/38g** (`2.33 PPG`, `27.3 W/38g`, `+54.2 GD/38g`)
  - **Era III (2014–15 to 2024–25)**: Champion mean **91.0 pts/38g** (`2.39 PPG`, `28.4 W/38g`, `+56.4 GD/38g`)

---

### III. The 40-Point Myth (30 Seasons of the 38-Game Era, 1995–96 to 2024–25)

- **Highest Relegated Total (18th Place)**: Mean **34.5 points**, median **34.0 points** (IQR `33–37`, range `25` [2024–25 Leicester City] to `42` [2002–03 West Ham United]).
- **Needed to Finish Above 18th Outright (`18th + 1`)**: Mean **35.5 points**, median **35 points**. This is a typical figure, not a guarantee: 35 points would not have beaten 18th place in **14 of 30 seasons**.
- **Lowest Surviving Total (17th Place)**: Mean **37.9 points**, median **38.0 points** (range `32` to `44`). In **22 of 30 seasons (73.3%)**, 17th place survived with **fewer than 40 points**.
- **How Often Was a Club Relegated on 40+ Points?**: Only **3 times in 30 seasons (10.0%)**—`1996-97` Sunderland (`40 pts`), `1997-98` Bolton Wanderers (`40 pts`, relegated on GD), and `2002-03` West Ham United (`42 pts`). A fourth club, `2010-11` Birmingham City, went down on **39 points**, when 40 would have been enough to finish above 18th. **Zero teams have been relegated with 40+ points in the last 22 seasons (since 2002–03)**, and the 18th-place average over the last 10 seasons (2015–16 to 2024–25) has fallen to **32.1 points**.

---

### IV. Draws Profile

- Across 33 seasons, **49 club-seasons** led or co-led their campaign in draws (`12` to `18` draws):
  - **Mean Finishing Position**: **12.0** | **Median Finishing Position**: **11th**.
  - **Finished 1st or 2nd**: **0 of 49 (0.0%)**.
  - **Finished Top 4**: **3 of 49 (6.1%)** — `1998-99` Chelsea (3rd, 15D), `2007-08` Liverpool (4th, 13D), and `2022-23` Newcastle United (4th, 14D).
  - **Finished Bottom Half (11th or lower)**: **31 of 49 (63.3%)**, including **4 relegations** (`1992-93` Crystal Palace, `1993-94` Sheffield United, `1996-97` Nottingham Forest, `2008-09` Newcastle United).

---

### V. The Golden Boot Question & Goal Concentration

- **How Often Has the Champion Contained the League's Top Scorer?**: **12 of 33 seasons (36.4%)**. In **21 of 33 seasons (63.6%)**, the Golden Boot winner did not win the league.
- **Where All 41 Golden Boot Winner-Seasons Finished** (including shared awards):
  - **1st Place (Champion)**: **12** (`29.3%`)
  - **2nd Place (Runner-Up)**: **9** (`22.0%`)
  - **3rd–4th Place**: **10** (`24.4%`)
  - **5th–11th Place (Outside Top 4)**: **10** (`24.4%`)
- **Club Top Scorer's Share of Team League Goals Across the Top Four (`n = 132`)**:
  - **Champions (1st, `n = 33`)**: Mean **26.0%**, median **23.5%** (range `15.2%` [2021–22 Man City, De Bruyne 15/99] to `42.5%` [1994–95 Blackburn, Shearer 34/80]).
  - **Runners-Up (2nd, `n = 33`)**: Mean **25.7%**, median **24.7%** (range `13.0%` [2024–25 Arsenal, Havertz 9/69] to `49.2%` [1993–94 Blackburn, Shearer 31/63]).
  - **3rd & 4th Place (`n = 66`)**: Mean **27.0%**, median **26.1%**.
  - **All Top Four (`n = 132`)**: Mean **26.4%**, median **25.2%**.
- **Correlation with Winning**:
  - Across all 666 team-seasons, having the Golden Boot winner correlates modestly with PPG (`r = +0.342`, `R² = 11.7%`) and winning the title (`r = +0.287`) because Golden Boot winners belong to high-scoring squads.
  - **Within the Top Four (`n = 132`), higher single-scorer share of team goals correlates slightly negatively with PPG (`r = −0.128`) and with team scoring rate (`r = −0.115`)**—demonstrating that spreading goals across the squad is slightly more common among high-point modern champions than relying on a single 30-goal spearhead.

---

## 4. Running Locally / Deploying to GitHub Pages

No build step or runtime dependencies are required. Serve the root directory with any static HTTP server (or push directly to a GitHub Pages branch):

```bash
npx serve .
# or
python -m http.server 8080
```
