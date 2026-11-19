window.__PL_DATASET__ = {
  "metadata": {
    "title": "Premier League Final Tables & Top Scorers (1992-93 to 2024-25)",
    "seasonsCovered": "1992-93 through 2024-25",
    "totalSeasons": 33,
    "totalTeamSeasons": 666,
    "totalMatchesPlayed": 12786,
    "sources": [
      {
        "name": "Wikipedia Premier League Season Articles (1992–93 FA Premier League through 2024–25 Premier League)",
        "urlPattern": "https://en.wikipedia.org/wiki/{season}_Premier_League",
        "role": "Primary source for official final standings, points deductions, and top-scorer charts (plus club season articles for Top-4 club leading league scorers outside the league top 10)."
      },
      {
        "name": "Football-Data.co.uk Historical Match CSVs (E0.csv)",
        "urlPattern": "https://www.football-data.co.uk/mmz4281/{seasonCode}/E0.csv",
        "role": "Independent match-level verification source; 1993-94 (462 matches), 2003-04 (380 matches), 2017-18 (380 matches), and 2024-25 (380 matches) aggregated from raw full-time scores with zero discrepancies."
      }
    ],
    "structuralRules": {
      "pointsSystem": "3 points for a win, 1 point for a draw, 0 points for a loss across all 33 seasons.",
      "seasonFormats": [
        {
          "seasons": "1992-93 to 1994-95 (3 seasons)",
          "teams": 22,
          "gamesPerTeam": 42,
          "relegatedCount": "3 in 1992-93 and 1993-94 (positions 20-22); 4 in 1994-95 (positions 19-22) to reduce the division to 20 clubs."
        },
        {
          "seasons": "1995-96 to 2024-25 (30 seasons)",
          "teams": 20,
          "gamesPerTeam": 38,
          "relegatedCount": "3 per season (positions 18-20)."
        }
      ],
      "pointsDeductions": [
        {
          "season": "1996-97",
          "team": "Middlesbrough",
          "pointsDeducted": 3,
          "reason": "Failed to fulfil fixture at Blackburn Rovers"
        },
        {
          "season": "2009-10",
          "team": "Portsmouth",
          "pointsDeducted": 9,
          "reason": "Entering administration"
        },
        {
          "season": "2023-24",
          "team": "Everton",
          "pointsDeducted": 8,
          "reason": "Profitability and Sustainability Rules (PSR) breaches (6 + 2 points)"
        },
        {
          "season": "2023-24",
          "team": "Nottingham Forest",
          "pointsDeducted": 4,
          "reason": "Profitability and Sustainability Rules (PSR) breach"
        }
      ],
      "normalisationPolicy": "All cross-era comparisons normalise counting statistics (Points, Wins, Draws, Losses, GF, GA, GD, Top-Scorer Goals) by games played (per-game rate, and where shown on a 38-game scale, rate × 38)."
    },
    "goldenBootClubRule": "hasGoldenBootWinner credits a transferred winner's goals per club: a club is flagged only when the player's club-specific league tally is itself the season's highest club-specific tally (not on final-club status alone). 1992-93: Teddy Sheringham won the award with 22 league goals combined across Nottingham Forest (1) and Tottenham Hotspur (21); his 21 for Tottenham was the season's highest club-specific tally (next best: Les Ferdinand's 20), so Tottenham is flagged, while his 1 for Forest was not, so Forest is not. Division-wide Golden Boot totals remain the combined league figure (22)."
  },
  "seasons": [
    {
      "season": "1992-93",
      "startYear": 1992,
      "endYear": 1993,
      "teamCount": 22,
      "gamesPerTeam": 42,
      "relegationLinePos": 20,
      "survivalLinePos": 19,
      "goldenBootGoals": 22,
      "goldenBootWinners": [
        {
          "player": "Teddy Sheringham",
          "clubs": [
            "Nottingham Forest",
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Nottingham Forest / Tottenham Hotspur",
          "goals": 22,
          "clubBreakdown": [
            {
              "club": "Nottingham Forest",
              "goals": 1
            },
            {
              "club": "Tottenham Hotspur",
              "goals": 21
            }
          ]
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Teddy Sheringham",
          "clubs": [
            "Nottingham Forest",
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Nottingham Forest / Tottenham Hotspur",
          "goals": 22,
          "clubBreakdown": [
            {
              "club": "Nottingham Forest",
              "goals": 1
            },
            {
              "club": "Tottenham Hotspur",
              "goals": 21
            }
          ]
        },
        {
          "rank": 2,
          "player": "Les Ferdinand",
          "clubs": [
            "Queens Park Rangers"
          ],
          "clubDisplay": "Queens Park Rangers",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Dean Holdsworth",
          "clubs": [
            "Wimbledon"
          ],
          "clubDisplay": "Wimbledon",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Micky Quinn",
          "clubs": [
            "Coventry City"
          ],
          "clubDisplay": "Coventry City",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Alan Shearer",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "David White",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Chris Armstrong",
          "clubs": [
            "Crystal Palace"
          ],
          "clubDisplay": "Crystal Palace",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Eric Cantona",
          "clubs": [
            "Leeds United",
            "Manchester United"
          ],
          "clubDisplay": "Leeds United / Manchester United",
          "goals": 15,
          "clubBreakdown": [
            {
              "club": "Leeds United",
              "goals": 6
            },
            {
              "club": "Manchester United",
              "goals": 9
            }
          ]
        },
        {
          "rank": 7,
          "player": "Brian Deane",
          "clubs": [
            "Sheffield United"
          ],
          "clubDisplay": "Sheffield United",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Mark Hughes",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Matt Le Tissier",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Ian Wright",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 15,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 42,
          "won": 24,
          "drawn": 12,
          "lost": 6,
          "gf": 67,
          "ga": 31,
          "gd": 36,
          "points": 84,
          "rawPoints": 84,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mark Hughes",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Aston Villa",
          "played": 42,
          "won": 21,
          "drawn": 11,
          "lost": 10,
          "gf": 57,
          "ga": 40,
          "gd": 17,
          "points": 74,
          "rawPoints": 74,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dean Saunders",
            "goals": 13,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Norwich City",
          "played": 42,
          "won": 21,
          "drawn": 9,
          "lost": 12,
          "gf": 61,
          "ga": 65,
          "gd": -4,
          "points": 72,
          "rawPoints": 72,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mark Robins",
            "goals": 14,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Blackburn Rovers",
          "played": 42,
          "won": 20,
          "drawn": 11,
          "lost": 11,
          "gf": 68,
          "ga": 46,
          "gd": 22,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Queens Park Rangers",
          "played": 42,
          "won": 17,
          "drawn": 12,
          "lost": 13,
          "gf": 63,
          "ga": 55,
          "gd": 8,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Les Ferdinand",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Liverpool",
          "played": 42,
          "won": 16,
          "drawn": 11,
          "lost": 15,
          "gf": 62,
          "ga": 55,
          "gd": 7,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Sheffield Wednesday",
          "played": 42,
          "won": 15,
          "drawn": 14,
          "lost": 13,
          "gf": 55,
          "ga": 51,
          "gd": 4,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Tottenham Hotspur",
          "played": 42,
          "won": 16,
          "drawn": 11,
          "lost": 15,
          "gf": 60,
          "ga": 66,
          "gd": -6,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Teddy Sheringham",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 9,
          "team": "Manchester City",
          "played": 42,
          "won": 15,
          "drawn": 12,
          "lost": 15,
          "gf": 56,
          "ga": 51,
          "gd": 5,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "David White",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Arsenal",
          "played": 42,
          "won": 15,
          "drawn": 11,
          "lost": 16,
          "gf": 40,
          "ga": 38,
          "gd": 2,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ian Wright",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Chelsea",
          "played": 42,
          "won": 14,
          "drawn": 14,
          "lost": 14,
          "gf": 51,
          "ga": 54,
          "gd": -3,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Wimbledon",
          "played": 42,
          "won": 14,
          "drawn": 12,
          "lost": 16,
          "gf": 56,
          "ga": 55,
          "gd": 1,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dean Holdsworth",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Everton",
          "played": 42,
          "won": 15,
          "drawn": 8,
          "lost": 19,
          "gf": 53,
          "ga": 55,
          "gd": -2,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Sheffield United",
          "played": 42,
          "won": 14,
          "drawn": 10,
          "lost": 18,
          "gf": 54,
          "ga": 53,
          "gd": 1,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Brian Deane",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Coventry City",
          "played": 42,
          "won": 13,
          "drawn": 13,
          "lost": 16,
          "gf": 52,
          "ga": 57,
          "gd": -5,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Micky Quinn",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Ipswich Town",
          "played": 42,
          "won": 12,
          "drawn": 16,
          "lost": 14,
          "gf": 50,
          "ga": 55,
          "gd": -5,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Leeds United",
          "played": 42,
          "won": 12,
          "drawn": 15,
          "lost": 15,
          "gf": 57,
          "ga": 62,
          "gd": -5,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Eric Cantona",
            "goals": 6,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Southampton",
          "played": 42,
          "won": 13,
          "drawn": 11,
          "lost": 18,
          "gf": 54,
          "ga": 61,
          "gd": -7,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Matt Le Tissier",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Oldham Athletic",
          "played": 42,
          "won": 13,
          "drawn": 10,
          "lost": 19,
          "gf": 63,
          "ga": 74,
          "gd": -11,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Crystal Palace",
          "played": 42,
          "won": 11,
          "drawn": 16,
          "lost": 15,
          "gf": 48,
          "ga": 61,
          "gd": -13,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Chris Armstrong",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 21,
          "team": "Middlesbrough",
          "played": 42,
          "won": 11,
          "drawn": 11,
          "lost": 20,
          "gf": 54,
          "ga": 75,
          "gd": -21,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 22,
          "team": "Nottingham Forest",
          "played": 42,
          "won": 10,
          "drawn": 10,
          "lost": 22,
          "gf": 41,
          "ga": 62,
          "gd": -21,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Teddy Sheringham",
            "goals": 1,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1993-94",
      "startYear": 1993,
      "endYear": 1994,
      "teamCount": 22,
      "gamesPerTeam": 42,
      "relegationLinePos": 20,
      "survivalLinePos": 19,
      "goldenBootGoals": 34,
      "goldenBootWinners": [
        {
          "player": "Andy Cole",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 34
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Andy Cole",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 34,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Alan Shearer",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 31,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Matt Le Tissier",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Chris Sutton",
          "clubs": [
            "Norwich City"
          ],
          "clubDisplay": "Norwich City",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Ian Wright",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Peter Beardsley",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Mark Bright",
          "clubs": [
            "Sheffield Wednesday"
          ],
          "clubDisplay": "Sheffield Wednesday",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Eric Cantona",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Dean Holdsworth",
          "clubs": [
            "Wimbledon"
          ],
          "clubDisplay": "Wimbledon",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Rod Wallace",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Tony Cottee",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Les Ferdinand",
          "clubs": [
            "Queens Park Rangers"
          ],
          "clubDisplay": "Queens Park Rangers",
          "goals": 16,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 42,
          "won": 27,
          "drawn": 11,
          "lost": 4,
          "gf": 80,
          "ga": 38,
          "gd": 42,
          "points": 92,
          "rawPoints": 92,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Eric Cantona",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Blackburn Rovers",
          "played": 42,
          "won": 25,
          "drawn": 9,
          "lost": 8,
          "gf": 63,
          "ga": 36,
          "gd": 27,
          "points": 84,
          "rawPoints": 84,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 31,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Newcastle United",
          "played": 42,
          "won": 23,
          "drawn": 8,
          "lost": 11,
          "gf": 82,
          "ga": 41,
          "gd": 41,
          "points": 77,
          "rawPoints": 77,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andy Cole",
            "goals": 34,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 42,
          "won": 18,
          "drawn": 17,
          "lost": 7,
          "gf": 53,
          "ga": 28,
          "gd": 25,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ian Wright",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Leeds United",
          "played": 42,
          "won": 18,
          "drawn": 16,
          "lost": 8,
          "gf": 65,
          "ga": 39,
          "gd": 26,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Rod Wallace",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Wimbledon",
          "played": 42,
          "won": 18,
          "drawn": 11,
          "lost": 13,
          "gf": 56,
          "ga": 53,
          "gd": 3,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dean Holdsworth",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Sheffield Wednesday",
          "played": 42,
          "won": 16,
          "drawn": 16,
          "lost": 10,
          "gf": 76,
          "ga": 54,
          "gd": 22,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mark Bright",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Liverpool",
          "played": 42,
          "won": 17,
          "drawn": 9,
          "lost": 16,
          "gf": 59,
          "ga": 55,
          "gd": 4,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Queens Park Rangers",
          "played": 42,
          "won": 16,
          "drawn": 12,
          "lost": 14,
          "gf": 62,
          "ga": 61,
          "gd": 1,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Les Ferdinand",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Aston Villa",
          "played": 42,
          "won": 15,
          "drawn": 12,
          "lost": 15,
          "gf": 46,
          "ga": 50,
          "gd": -4,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Coventry City",
          "played": 42,
          "won": 14,
          "drawn": 14,
          "lost": 14,
          "gf": 43,
          "ga": 45,
          "gd": -2,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Norwich City",
          "played": 42,
          "won": 12,
          "drawn": 17,
          "lost": 13,
          "gf": 65,
          "ga": 61,
          "gd": 4,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Chris Sutton",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "West Ham United",
          "played": 42,
          "won": 13,
          "drawn": 13,
          "lost": 16,
          "gf": 47,
          "ga": 58,
          "gd": -11,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Chelsea",
          "played": 42,
          "won": 13,
          "drawn": 12,
          "lost": 17,
          "gf": 49,
          "ga": 53,
          "gd": -4,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Tottenham Hotspur",
          "played": 42,
          "won": 11,
          "drawn": 12,
          "lost": 19,
          "gf": 54,
          "ga": 59,
          "gd": -5,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Manchester City",
          "played": 42,
          "won": 9,
          "drawn": 18,
          "lost": 15,
          "gf": 38,
          "ga": 49,
          "gd": -11,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Everton",
          "played": 42,
          "won": 12,
          "drawn": 8,
          "lost": 22,
          "gf": 42,
          "ga": 63,
          "gd": -21,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Tony Cottee",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Southampton",
          "played": 42,
          "won": 12,
          "drawn": 7,
          "lost": 23,
          "gf": 49,
          "ga": 66,
          "gd": -17,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Matt Le Tissier",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Ipswich Town",
          "played": 42,
          "won": 9,
          "drawn": 16,
          "lost": 17,
          "gf": 35,
          "ga": 58,
          "gd": -23,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Sheffield United",
          "played": 42,
          "won": 8,
          "drawn": 18,
          "lost": 16,
          "gf": 42,
          "ga": 60,
          "gd": -18,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 21,
          "team": "Oldham Athletic",
          "played": 42,
          "won": 9,
          "drawn": 13,
          "lost": 20,
          "gf": 42,
          "ga": 68,
          "gd": -26,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 22,
          "team": "Swindon Town",
          "played": 42,
          "won": 5,
          "drawn": 15,
          "lost": 22,
          "gf": 47,
          "ga": 100,
          "gd": -53,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1994-95",
      "startYear": 1994,
      "endYear": 1995,
      "teamCount": 22,
      "gamesPerTeam": 42,
      "relegationLinePos": 19,
      "survivalLinePos": 18,
      "goldenBootGoals": 34,
      "goldenBootWinners": [
        {
          "player": "Alan Shearer",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 34
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Alan Shearer",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 34,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Robbie Fowler",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Les Ferdinand",
          "clubs": [
            "Queens Park Rangers"
          ],
          "clubDisplay": "Queens Park Rangers",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Stan Collymore",
          "clubs": [
            "Nottingham Forest"
          ],
          "clubDisplay": "Nottingham Forest",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Andy Cole",
          "clubs": [
            "Newcastle United",
            "Manchester United"
          ],
          "clubDisplay": "Newcastle United / Manchester United",
          "goals": 21,
          "clubBreakdown": [
            {
              "club": "Newcastle United",
              "goals": 9
            },
            {
              "club": "Manchester United",
              "goals": 12
            }
          ]
        },
        {
          "rank": 6,
          "player": "Jürgen Klinsmann",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Matt Le Tissier",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Teddy Sheringham",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Ian Wright",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Uwe Rösler",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Dean Saunders",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Chris Sutton",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 15,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Blackburn Rovers",
          "played": 42,
          "won": 27,
          "drawn": 8,
          "lost": 7,
          "gf": 80,
          "ga": 39,
          "gd": 41,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 34,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 42,
          "won": 26,
          "drawn": 10,
          "lost": 6,
          "gf": 77,
          "ga": 28,
          "gd": 49,
          "points": 88,
          "rawPoints": 88,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andrei Kanchelskis",
            "goals": 14,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Nottingham Forest",
          "played": 42,
          "won": 22,
          "drawn": 11,
          "lost": 9,
          "gf": 72,
          "ga": 43,
          "gd": 29,
          "points": 77,
          "rawPoints": 77,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Stan Collymore",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 42,
          "won": 21,
          "drawn": 11,
          "lost": 10,
          "gf": 65,
          "ga": 37,
          "gd": 28,
          "points": 74,
          "rawPoints": 74,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robbie Fowler",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Leeds United",
          "played": 42,
          "won": 20,
          "drawn": 13,
          "lost": 9,
          "gf": 59,
          "ga": 38,
          "gd": 21,
          "points": 73,
          "rawPoints": 73,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Newcastle United",
          "played": 42,
          "won": 20,
          "drawn": 12,
          "lost": 10,
          "gf": 67,
          "ga": 47,
          "gd": 20,
          "points": 72,
          "rawPoints": 72,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andy Cole",
            "goals": 9,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Tottenham Hotspur",
          "played": 42,
          "won": 16,
          "drawn": 14,
          "lost": 12,
          "gf": 66,
          "ga": 58,
          "gd": 8,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jürgen Klinsmann",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Queens Park Rangers",
          "played": 42,
          "won": 17,
          "drawn": 9,
          "lost": 16,
          "gf": 61,
          "ga": 59,
          "gd": 2,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Les Ferdinand",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Wimbledon",
          "played": 42,
          "won": 15,
          "drawn": 11,
          "lost": 16,
          "gf": 48,
          "ga": 65,
          "gd": -17,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Southampton",
          "played": 42,
          "won": 12,
          "drawn": 18,
          "lost": 12,
          "gf": 61,
          "ga": 63,
          "gd": -2,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Matt Le Tissier",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Chelsea",
          "played": 42,
          "won": 13,
          "drawn": 15,
          "lost": 14,
          "gf": 50,
          "ga": 55,
          "gd": -5,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Arsenal",
          "played": 42,
          "won": 13,
          "drawn": 12,
          "lost": 17,
          "gf": 52,
          "ga": 49,
          "gd": 3,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ian Wright",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Sheffield Wednesday",
          "played": 42,
          "won": 13,
          "drawn": 12,
          "lost": 17,
          "gf": 49,
          "ga": 57,
          "gd": -8,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "West Ham United",
          "played": 42,
          "won": 13,
          "drawn": 11,
          "lost": 18,
          "gf": 44,
          "ga": 48,
          "gd": -4,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Everton",
          "played": 42,
          "won": 11,
          "drawn": 17,
          "lost": 14,
          "gf": 44,
          "ga": 51,
          "gd": -7,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Coventry City",
          "played": 42,
          "won": 12,
          "drawn": 14,
          "lost": 16,
          "gf": 44,
          "ga": 62,
          "gd": -18,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Manchester City",
          "played": 42,
          "won": 12,
          "drawn": 13,
          "lost": 17,
          "gf": 53,
          "ga": 64,
          "gd": -11,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Uwe Rösler",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Aston Villa",
          "played": 42,
          "won": 11,
          "drawn": 15,
          "lost": 16,
          "gf": 51,
          "ga": 56,
          "gd": -5,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dean Saunders",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Crystal Palace",
          "played": 42,
          "won": 11,
          "drawn": 12,
          "lost": 19,
          "gf": 34,
          "ga": 49,
          "gd": -15,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Norwich City",
          "played": 42,
          "won": 10,
          "drawn": 13,
          "lost": 19,
          "gf": 37,
          "ga": 54,
          "gd": -17,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 21,
          "team": "Leicester City",
          "played": 42,
          "won": 6,
          "drawn": 11,
          "lost": 25,
          "gf": 45,
          "ga": 80,
          "gd": -35,
          "points": 29,
          "rawPoints": 29,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 22,
          "team": "Ipswich Town",
          "played": 42,
          "won": 7,
          "drawn": 6,
          "lost": 29,
          "gf": 36,
          "ga": 93,
          "gd": -57,
          "points": 27,
          "rawPoints": 27,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1995-96",
      "startYear": 1995,
      "endYear": 1996,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 31,
      "goldenBootWinners": [
        {
          "player": "Alan Shearer",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 31
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Alan Shearer",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 31,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Robbie Fowler",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 28,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Les Ferdinand",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Dwight Yorke",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Teddy Sheringham",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Chris Armstrong",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Andrei Kanchelskis",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Ian Wright",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Eric Cantona",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Stan Collymore",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Dion Dublin",
          "clubs": [
            "Coventry City"
          ],
          "clubDisplay": "Coventry City",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 25,
          "drawn": 7,
          "lost": 6,
          "gf": 73,
          "ga": 35,
          "gd": 38,
          "points": 82,
          "rawPoints": 82,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Eric Cantona",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Newcastle United",
          "played": 38,
          "won": 24,
          "drawn": 6,
          "lost": 8,
          "gf": 66,
          "ga": 37,
          "gd": 29,
          "points": 78,
          "rawPoints": 78,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Les Ferdinand",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 20,
          "drawn": 11,
          "lost": 7,
          "gf": 70,
          "ga": 34,
          "gd": 36,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robbie Fowler",
            "goals": 28,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Aston Villa",
          "played": 38,
          "won": 18,
          "drawn": 9,
          "lost": 11,
          "gf": 52,
          "ga": 35,
          "gd": 17,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dwight Yorke",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Arsenal",
          "played": 38,
          "won": 17,
          "drawn": 12,
          "lost": 9,
          "gf": 49,
          "ga": 32,
          "gd": 17,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ian Wright",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Everton",
          "played": 38,
          "won": 17,
          "drawn": 10,
          "lost": 11,
          "gf": 64,
          "ga": 44,
          "gd": 20,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andrei Kanchelskis",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 18,
          "drawn": 7,
          "lost": 13,
          "gf": 61,
          "ga": 47,
          "gd": 14,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 31,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 8,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 16,
          "drawn": 13,
          "lost": 9,
          "gf": 50,
          "ga": 38,
          "gd": 12,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Teddy Sheringham",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Nottingham Forest",
          "played": 38,
          "won": 15,
          "drawn": 13,
          "lost": 10,
          "gf": 50,
          "ga": 54,
          "gd": -4,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "West Ham United",
          "played": 38,
          "won": 14,
          "drawn": 9,
          "lost": 15,
          "gf": 43,
          "ga": 52,
          "gd": -9,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Chelsea",
          "played": 38,
          "won": 12,
          "drawn": 14,
          "lost": 12,
          "gf": 46,
          "ga": 44,
          "gd": 2,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Middlesbrough",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 35,
          "ga": 50,
          "gd": -15,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Leeds United",
          "played": 38,
          "won": 12,
          "drawn": 7,
          "lost": 19,
          "gf": 40,
          "ga": 57,
          "gd": -17,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Wimbledon",
          "played": 38,
          "won": 10,
          "drawn": 11,
          "lost": 17,
          "gf": 55,
          "ga": 70,
          "gd": -15,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Sheffield Wednesday",
          "played": 38,
          "won": 10,
          "drawn": 10,
          "lost": 18,
          "gf": 48,
          "ga": 61,
          "gd": -13,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Coventry City",
          "played": 38,
          "won": 8,
          "drawn": 14,
          "lost": 16,
          "gf": 42,
          "ga": 60,
          "gd": -18,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dion Dublin",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Southampton",
          "played": 38,
          "won": 9,
          "drawn": 11,
          "lost": 18,
          "gf": 34,
          "ga": 52,
          "gd": -18,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Manchester City",
          "played": 38,
          "won": 9,
          "drawn": 11,
          "lost": 18,
          "gf": 33,
          "ga": 58,
          "gd": -25,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Queens Park Rangers",
          "played": 38,
          "won": 9,
          "drawn": 6,
          "lost": 23,
          "gf": 38,
          "ga": 57,
          "gd": -19,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 8,
          "drawn": 5,
          "lost": 25,
          "gf": 39,
          "ga": 71,
          "gd": -32,
          "points": 29,
          "rawPoints": 29,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1996-97",
      "startYear": 1996,
      "endYear": 1997,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 25,
      "goldenBootWinners": [
        {
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 25
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Ian Wright",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Robbie Fowler",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Ole Gunnar Solskjær",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Dwight Yorke",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Les Ferdinand",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Fabrizio Ravanelli",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Dion Dublin",
          "clubs": [
            "Coventry City"
          ],
          "clubDisplay": "Coventry City",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Matt Le Tissier",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Dennis Bergkamp",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Steve Claridge",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Stan Collymore",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Juninho",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 21,
          "drawn": 12,
          "lost": 5,
          "gf": 76,
          "ga": 44,
          "gd": 32,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ole Gunnar Solskjær",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Newcastle United",
          "played": 38,
          "won": 19,
          "drawn": 11,
          "lost": 8,
          "gf": 73,
          "ga": 40,
          "gd": 33,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Arsenal",
          "played": 38,
          "won": 19,
          "drawn": 11,
          "lost": 8,
          "gf": 62,
          "ga": 32,
          "gd": 30,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ian Wright",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 38,
          "won": 19,
          "drawn": 11,
          "lost": 8,
          "gf": 62,
          "ga": 37,
          "gd": 25,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robbie Fowler",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Aston Villa",
          "played": 38,
          "won": 17,
          "drawn": 10,
          "lost": 11,
          "gf": 47,
          "ga": 34,
          "gd": 13,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dwight Yorke",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Chelsea",
          "played": 38,
          "won": 16,
          "drawn": 11,
          "lost": 11,
          "gf": 58,
          "ga": 55,
          "gd": 3,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Sheffield Wednesday",
          "played": 38,
          "won": 14,
          "drawn": 15,
          "lost": 9,
          "gf": 50,
          "ga": 51,
          "gd": -1,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Wimbledon",
          "played": 38,
          "won": 15,
          "drawn": 11,
          "lost": 12,
          "gf": 49,
          "ga": 46,
          "gd": 3,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Leicester City",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 46,
          "ga": 54,
          "gd": -8,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Steve Claridge",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 13,
          "drawn": 7,
          "lost": 18,
          "gf": 44,
          "ga": 51,
          "gd": -7,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Leeds United",
          "played": 38,
          "won": 11,
          "drawn": 13,
          "lost": 14,
          "gf": 28,
          "ga": 38,
          "gd": -10,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Derby County",
          "played": 38,
          "won": 11,
          "drawn": 13,
          "lost": 14,
          "gf": 45,
          "ga": 58,
          "gd": -13,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 9,
          "drawn": 15,
          "lost": 14,
          "gf": 42,
          "ga": 43,
          "gd": -1,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "West Ham United",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 39,
          "ga": 48,
          "gd": -9,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Everton",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 44,
          "ga": 57,
          "gd": -13,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Southampton",
          "played": 38,
          "won": 10,
          "drawn": 11,
          "lost": 17,
          "gf": 50,
          "ga": 56,
          "gd": -6,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Matt Le Tissier",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Coventry City",
          "played": 38,
          "won": 9,
          "drawn": 14,
          "lost": 15,
          "gf": 38,
          "ga": 54,
          "gd": -16,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dion Dublin",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Sunderland",
          "played": 38,
          "won": 10,
          "drawn": 10,
          "lost": 18,
          "gf": 35,
          "ga": 53,
          "gd": -18,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Middlesbrough",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 51,
          "ga": 60,
          "gd": -9,
          "points": 39,
          "rawPoints": 42,
          "pointsDeducted": 3,
          "deductionReason": "Failed to fulfil fixture at Blackburn Rovers",
          "relegated": true,
          "topScorer": {
            "player": "Fabrizio Ravanelli",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Nottingham Forest",
          "played": 38,
          "won": 6,
          "drawn": 16,
          "lost": 16,
          "gf": 31,
          "ga": 59,
          "gd": -28,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1997-98",
      "startYear": 1997,
      "endYear": 1998,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 18,
      "goldenBootWinners": [
        {
          "player": "Dion Dublin",
          "clubs": [
            "Coventry City"
          ],
          "clubDisplay": "Coventry City",
          "goals": 18
        },
        {
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18
        },
        {
          "player": "Chris Sutton",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 18
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Dion Dublin",
          "clubs": [
            "Coventry City"
          ],
          "clubDisplay": "Coventry City",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Chris Sutton",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Dennis Bergkamp",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Kevin Gallacher",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Andy Cole",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "John Hartson",
          "clubs": [
            "West Ham United"
          ],
          "clubDisplay": "West Ham United",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Darren Huckerby",
          "clubs": [
            "Coventry City"
          ],
          "clubDisplay": "Coventry City",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Paulo Wanchope",
          "clubs": [
            "Derby County"
          ],
          "clubDisplay": "Derby County",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Arsenal",
          "played": 38,
          "won": 23,
          "drawn": 9,
          "lost": 6,
          "gf": 68,
          "ga": 33,
          "gd": 35,
          "points": 78,
          "rawPoints": 78,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dennis Bergkamp",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 38,
          "won": 23,
          "drawn": 8,
          "lost": 7,
          "gf": 73,
          "ga": 26,
          "gd": 47,
          "points": 77,
          "rawPoints": 77,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andy Cole",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 18,
          "drawn": 11,
          "lost": 9,
          "gf": 68,
          "ga": 42,
          "gd": 26,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 4,
          "team": "Chelsea",
          "played": 38,
          "won": 20,
          "drawn": 3,
          "lost": 15,
          "gf": 71,
          "ga": 43,
          "gd": 28,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gianluca Vialli / Tore André Flo",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Leeds United",
          "played": 38,
          "won": 17,
          "drawn": 8,
          "lost": 13,
          "gf": 57,
          "ga": 46,
          "gd": 11,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jimmy Floyd Hasselbaink",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 16,
          "drawn": 10,
          "lost": 12,
          "gf": 57,
          "ga": 52,
          "gd": 5,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Chris Sutton",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 7,
          "team": "Aston Villa",
          "played": 38,
          "won": 17,
          "drawn": 6,
          "lost": 15,
          "gf": 49,
          "ga": 48,
          "gd": 1,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "West Ham United",
          "played": 38,
          "won": 16,
          "drawn": 8,
          "lost": 14,
          "gf": 56,
          "ga": 57,
          "gd": -1,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "John Hartson",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Derby County",
          "played": 38,
          "won": 16,
          "drawn": 7,
          "lost": 15,
          "gf": 52,
          "ga": 49,
          "gd": 3,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Paulo Wanchope",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Leicester City",
          "played": 38,
          "won": 13,
          "drawn": 14,
          "lost": 11,
          "gf": 51,
          "ga": 41,
          "gd": 10,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Coventry City",
          "played": 38,
          "won": 12,
          "drawn": 16,
          "lost": 10,
          "gf": 46,
          "ga": 44,
          "gd": 2,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dion Dublin",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 12,
          "team": "Southampton",
          "played": 38,
          "won": 14,
          "drawn": 6,
          "lost": 18,
          "gf": 50,
          "ga": 55,
          "gd": -5,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 35,
          "ga": 44,
          "gd": -9,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 44,
          "ga": 56,
          "gd": -12,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Wimbledon",
          "played": 38,
          "won": 10,
          "drawn": 14,
          "lost": 14,
          "gf": 34,
          "ga": 46,
          "gd": -12,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Sheffield Wednesday",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 52,
          "ga": 67,
          "gd": -15,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Everton",
          "played": 38,
          "won": 9,
          "drawn": 13,
          "lost": 16,
          "gf": 41,
          "ga": 56,
          "gd": -15,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 9,
          "drawn": 13,
          "lost": 16,
          "gf": 41,
          "ga": 61,
          "gd": -20,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Barnsley",
          "played": 38,
          "won": 10,
          "drawn": 5,
          "lost": 23,
          "gf": 37,
          "ga": 82,
          "gd": -45,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Crystal Palace",
          "played": 38,
          "won": 8,
          "drawn": 9,
          "lost": 21,
          "gf": 37,
          "ga": 71,
          "gd": -34,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1998-99",
      "startYear": 1998,
      "endYear": 1999,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 18,
      "goldenBootWinners": [
        {
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 18
        },
        {
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18
        },
        {
          "player": "Dwight Yorke",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Dwight Yorke",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Nicolas Anelka",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Andy Cole",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Hámilton Ricard",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Dion Dublin",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Robbie Fowler",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Julian Joachim",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 22,
          "drawn": 13,
          "lost": 3,
          "gf": 80,
          "ga": 37,
          "gd": 43,
          "points": 79,
          "rawPoints": 79,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dwight Yorke",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 22,
          "drawn": 12,
          "lost": 4,
          "gf": 59,
          "ga": 17,
          "gd": 42,
          "points": 78,
          "rawPoints": 78,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Nicolas Anelka",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Chelsea",
          "played": 38,
          "won": 20,
          "drawn": 15,
          "lost": 3,
          "gf": 57,
          "ga": 30,
          "gd": 27,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gianfranco Zola",
            "goals": 13,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Leeds United",
          "played": 38,
          "won": 18,
          "drawn": 13,
          "lost": 7,
          "gf": 62,
          "ga": 34,
          "gd": 28,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jimmy Floyd Hasselbaink",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 5,
          "team": "West Ham United",
          "played": 38,
          "won": 16,
          "drawn": 9,
          "lost": 13,
          "gf": 46,
          "ga": 53,
          "gd": -7,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 15,
          "drawn": 10,
          "lost": 13,
          "gf": 51,
          "ga": 46,
          "gd": 5,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dion Dublin / Julian Joachim",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Liverpool",
          "played": 38,
          "won": 15,
          "drawn": 9,
          "lost": 14,
          "gf": 68,
          "ga": 49,
          "gd": 19,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 8,
          "team": "Derby County",
          "played": 38,
          "won": 13,
          "drawn": 13,
          "lost": 12,
          "gf": 40,
          "ga": 45,
          "gd": -5,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Middlesbrough",
          "played": 38,
          "won": 12,
          "drawn": 15,
          "lost": 11,
          "gf": 48,
          "ga": 54,
          "gd": -6,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Hámilton Ricard",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Leicester City",
          "played": 38,
          "won": 12,
          "drawn": 13,
          "lost": 13,
          "gf": 40,
          "ga": 46,
          "gd": -6,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 11,
          "drawn": 14,
          "lost": 13,
          "gf": 47,
          "ga": 50,
          "gd": -3,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Sheffield Wednesday",
          "played": 38,
          "won": 13,
          "drawn": 7,
          "lost": 18,
          "gf": 41,
          "ga": 42,
          "gd": -1,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 13,
          "lost": 14,
          "gf": 48,
          "ga": 54,
          "gd": -6,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Everton",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 42,
          "ga": 47,
          "gd": -5,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Coventry City",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 39,
          "ga": 51,
          "gd": -12,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Wimbledon",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 40,
          "ga": 63,
          "gd": -23,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Southampton",
          "played": 38,
          "won": 11,
          "drawn": 8,
          "lost": 19,
          "gf": 37,
          "ga": 64,
          "gd": -27,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 8,
          "drawn": 12,
          "lost": 18,
          "gf": 41,
          "ga": 56,
          "gd": -15,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 7,
          "drawn": 14,
          "lost": 17,
          "gf": 38,
          "ga": 52,
          "gd": -14,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Nottingham Forest",
          "played": 38,
          "won": 7,
          "drawn": 9,
          "lost": 22,
          "gf": 35,
          "ga": 69,
          "gd": -34,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "1999-00",
      "startYear": 1999,
      "endYear": 2000,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 30,
      "goldenBootWinners": [
        {
          "player": "Kevin Phillips",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 30
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Kevin Phillips",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 30,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Dwight Yorke",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Michael Bridges",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Andy Cole",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Paolo Di Canio",
          "clubs": [
            "West Ham United"
          ],
          "clubDisplay": "West Ham United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Chris Armstrong",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Steffen Iversen",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Niall Quinn",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 28,
          "drawn": 7,
          "lost": 3,
          "gf": 97,
          "ga": 45,
          "gd": 52,
          "points": 91,
          "rawPoints": 91,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dwight Yorke",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 22,
          "drawn": 7,
          "lost": 9,
          "gf": 73,
          "ga": 43,
          "gd": 30,
          "points": 73,
          "rawPoints": 73,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Leeds United",
          "played": 38,
          "won": 21,
          "drawn": 6,
          "lost": 11,
          "gf": 58,
          "ga": 43,
          "gd": 15,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Bridges",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 38,
          "won": 19,
          "drawn": 10,
          "lost": 9,
          "gf": 51,
          "ga": 30,
          "gd": 21,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Chelsea",
          "played": 38,
          "won": 18,
          "drawn": 11,
          "lost": 9,
          "gf": 53,
          "ga": 34,
          "gd": 19,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 15,
          "drawn": 13,
          "lost": 10,
          "gf": 46,
          "ga": 35,
          "gd": 11,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Sunderland",
          "played": 38,
          "won": 16,
          "drawn": 10,
          "lost": 12,
          "gf": 57,
          "ga": 56,
          "gd": 1,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Kevin Phillips",
            "goals": 30,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 8,
          "team": "Leicester City",
          "played": 38,
          "won": 16,
          "drawn": 7,
          "lost": 15,
          "gf": 55,
          "ga": 55,
          "gd": 0,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "West Ham United",
          "played": 38,
          "won": 15,
          "drawn": 10,
          "lost": 13,
          "gf": 52,
          "ga": 53,
          "gd": -1,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Paolo Di Canio",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 15,
          "drawn": 8,
          "lost": 15,
          "gf": 57,
          "ga": 49,
          "gd": 8,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Chris Armstrong / Steffen Iversen",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Newcastle United",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 63,
          "ga": 54,
          "gd": 9,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Middlesbrough",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 46,
          "ga": 52,
          "gd": -6,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Everton",
          "played": 38,
          "won": 12,
          "drawn": 14,
          "lost": 12,
          "gf": 59,
          "ga": 49,
          "gd": 10,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Coventry City",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 47,
          "ga": 54,
          "gd": -7,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Southampton",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 45,
          "ga": 62,
          "gd": -17,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Derby County",
          "played": 38,
          "won": 9,
          "drawn": 11,
          "lost": 18,
          "gf": 44,
          "ga": 57,
          "gd": -13,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Bradford City",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 38,
          "ga": 68,
          "gd": -30,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Wimbledon",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 46,
          "ga": 74,
          "gd": -28,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Sheffield Wednesday",
          "played": 38,
          "won": 8,
          "drawn": 7,
          "lost": 23,
          "gf": 38,
          "ga": 70,
          "gd": -32,
          "points": 31,
          "rawPoints": 31,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Watford",
          "played": 38,
          "won": 6,
          "drawn": 6,
          "lost": 26,
          "gf": 35,
          "ga": 77,
          "gd": -42,
          "points": 24,
          "rawPoints": 24,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2000-01",
      "startYear": 2000,
      "endYear": 2001,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 23,
      "goldenBootWinners": [
        {
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 23
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Marcus Stewart",
          "clubs": [
            "Ipswich Town"
          ],
          "clubDisplay": "Ipswich Town",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Mark Viduka",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Teddy Sheringham",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Emile Heskey",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Kevin Phillips",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Alen Bokšić",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Jonatan Johansson",
          "clubs": [
            "Charlton Athletic"
          ],
          "clubDisplay": "Charlton Athletic",
          "goals": 11,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 24,
          "drawn": 8,
          "lost": 6,
          "gf": 79,
          "ga": 31,
          "gd": 48,
          "points": 80,
          "rawPoints": 80,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Teddy Sheringham",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 20,
          "drawn": 10,
          "lost": 8,
          "gf": 63,
          "ga": 38,
          "gd": 25,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 20,
          "drawn": 9,
          "lost": 9,
          "gf": 71,
          "ga": 39,
          "gd": 32,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Leeds United",
          "played": 38,
          "won": 20,
          "drawn": 8,
          "lost": 10,
          "gf": 64,
          "ga": 43,
          "gd": 21,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mark Viduka",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Ipswich Town",
          "played": 38,
          "won": 20,
          "drawn": 6,
          "lost": 12,
          "gf": 57,
          "ga": 42,
          "gd": 15,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Marcus Stewart",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Chelsea",
          "played": 38,
          "won": 17,
          "drawn": 10,
          "lost": 11,
          "gf": 68,
          "ga": 45,
          "gd": 23,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jimmy Floyd Hasselbaink",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 7,
          "team": "Sunderland",
          "played": 38,
          "won": 15,
          "drawn": 12,
          "lost": 11,
          "gf": 46,
          "ga": 41,
          "gd": 5,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Kevin Phillips",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Aston Villa",
          "played": 38,
          "won": 13,
          "drawn": 15,
          "lost": 10,
          "gf": 46,
          "ga": 43,
          "gd": 3,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 50,
          "ga": 57,
          "gd": -7,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jonatan Johansson",
            "goals": 11,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Southampton",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 40,
          "ga": 48,
          "gd": -8,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Newcastle United",
          "played": 38,
          "won": 14,
          "drawn": 9,
          "lost": 15,
          "gf": 44,
          "ga": 50,
          "gd": -6,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 47,
          "ga": 54,
          "gd": -7,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Leicester City",
          "played": 38,
          "won": 14,
          "drawn": 6,
          "lost": 18,
          "gf": 39,
          "ga": 51,
          "gd": -12,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Middlesbrough",
          "played": 38,
          "won": 9,
          "drawn": 15,
          "lost": 14,
          "gf": 44,
          "ga": 44,
          "gd": 0,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alen Bokšić",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "West Ham United",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 45,
          "ga": 50,
          "gd": -5,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Everton",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 45,
          "ga": 59,
          "gd": -14,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Derby County",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 37,
          "ga": 59,
          "gd": -22,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Manchester City",
          "played": 38,
          "won": 8,
          "drawn": 10,
          "lost": 20,
          "gf": 41,
          "ga": 65,
          "gd": -24,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Coventry City",
          "played": 38,
          "won": 8,
          "drawn": 10,
          "lost": 20,
          "gf": 36,
          "ga": 63,
          "gd": -27,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Bradford City",
          "played": 38,
          "won": 5,
          "drawn": 11,
          "lost": 22,
          "gf": 30,
          "ga": 70,
          "gd": -40,
          "points": 26,
          "rawPoints": 26,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2001-02",
      "startYear": 2001,
      "endYear": 2002,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 24,
      "goldenBootWinners": [
        {
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 24
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Ruud van Nistelrooy",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Ole Gunnar Solskjær",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Robbie Fowler",
          "clubs": [
            "Liverpool",
            "Leeds United"
          ],
          "clubDisplay": "Liverpool / Leeds United",
          "goals": 15,
          "clubBreakdown": [
            {
              "club": "Liverpool",
              "goals": 3
            },
            {
              "club": "Leeds United",
              "goals": 12
            }
          ]
        },
        {
          "rank": 8,
          "player": "Eiður Guðjohnsen",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Marians Pahars",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Andy Cole",
          "clubs": [
            "Manchester United",
            "Blackburn Rovers"
          ],
          "clubDisplay": "Manchester United / Blackburn Rovers",
          "goals": 13,
          "clubBreakdown": [
            {
              "club": "Manchester United",
              "goals": 4
            },
            {
              "club": "Blackburn Rovers",
              "goals": 9
            }
          ]
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Arsenal",
          "played": 38,
          "won": 26,
          "drawn": 9,
          "lost": 3,
          "gf": 79,
          "ga": 36,
          "gd": 43,
          "points": 87,
          "rawPoints": 87,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Liverpool",
          "played": 38,
          "won": 24,
          "drawn": 8,
          "lost": 6,
          "gf": 67,
          "ga": 30,
          "gd": 37,
          "points": 80,
          "rawPoints": 80,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Manchester United",
          "played": 38,
          "won": 24,
          "drawn": 5,
          "lost": 9,
          "gf": 87,
          "ga": 45,
          "gd": 42,
          "points": 77,
          "rawPoints": 77,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ruud van Nistelrooy",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Newcastle United",
          "played": 38,
          "won": 21,
          "drawn": 8,
          "lost": 9,
          "gf": 74,
          "ga": 52,
          "gd": 22,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Leeds United",
          "played": 38,
          "won": 18,
          "drawn": 12,
          "lost": 8,
          "gf": 53,
          "ga": 37,
          "gd": 16,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robbie Fowler",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Chelsea",
          "played": 38,
          "won": 17,
          "drawn": 13,
          "lost": 8,
          "gf": 66,
          "ga": 38,
          "gd": 28,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jimmy Floyd Hasselbaink",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "West Ham United",
          "played": 38,
          "won": 15,
          "drawn": 8,
          "lost": 15,
          "gf": 48,
          "ga": 57,
          "gd": -9,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Aston Villa",
          "played": 38,
          "won": 12,
          "drawn": 14,
          "lost": 12,
          "gf": 46,
          "ga": 47,
          "gd": -1,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 14,
          "drawn": 8,
          "lost": 16,
          "gf": 49,
          "ga": 53,
          "gd": -4,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 55,
          "ga": 51,
          "gd": 4,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andy Cole",
            "goals": 9,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Southampton",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 46,
          "ga": 54,
          "gd": -8,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Marians Pahars",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Middlesbrough",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 35,
          "ga": 47,
          "gd": -12,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Fulham",
          "played": 38,
          "won": 10,
          "drawn": 14,
          "lost": 14,
          "gf": 36,
          "ga": 44,
          "gd": -8,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 10,
          "drawn": 14,
          "lost": 14,
          "gf": 38,
          "ga": 49,
          "gd": -11,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Everton",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 45,
          "ga": 57,
          "gd": -12,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 9,
          "drawn": 13,
          "lost": 16,
          "gf": 44,
          "ga": 62,
          "gd": -18,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Sunderland",
          "played": 38,
          "won": 10,
          "drawn": 10,
          "lost": 18,
          "gf": 29,
          "ga": 51,
          "gd": -22,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Ipswich Town",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 41,
          "ga": 64,
          "gd": -23,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Derby County",
          "played": 38,
          "won": 8,
          "drawn": 6,
          "lost": 24,
          "gf": 33,
          "ga": 63,
          "gd": -30,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Leicester City",
          "played": 38,
          "won": 5,
          "drawn": 13,
          "lost": 20,
          "gf": 30,
          "ga": 64,
          "gd": -34,
          "points": 28,
          "rawPoints": 28,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2002-03",
      "startYear": 2002,
      "endYear": 2003,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 25,
      "goldenBootWinners": [
        {
          "player": "Ruud van Nistelrooy",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 25
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Ruud van Nistelrooy",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "James Beattie",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Mark Viduka",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Nicolas Anelka",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Gianfranco Zola",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Robert Pires",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Harry Kewell",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Paul Scholes",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 25,
          "drawn": 8,
          "lost": 5,
          "gf": 74,
          "ga": 34,
          "gd": 40,
          "points": 83,
          "rawPoints": 83,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ruud van Nistelrooy",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 23,
          "drawn": 9,
          "lost": 6,
          "gf": 85,
          "ga": 42,
          "gd": 43,
          "points": 78,
          "rawPoints": 78,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Newcastle United",
          "played": 38,
          "won": 21,
          "drawn": 6,
          "lost": 11,
          "gf": 63,
          "ga": 48,
          "gd": 15,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Chelsea",
          "played": 38,
          "won": 19,
          "drawn": 10,
          "lost": 9,
          "gf": 68,
          "ga": 38,
          "gd": 30,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gianfranco Zola",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Liverpool",
          "played": 38,
          "won": 18,
          "drawn": 10,
          "lost": 10,
          "gf": 61,
          "ga": 41,
          "gd": 20,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 16,
          "drawn": 12,
          "lost": 10,
          "gf": 52,
          "ga": 43,
          "gd": 9,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Everton",
          "played": 38,
          "won": 17,
          "drawn": 8,
          "lost": 13,
          "gf": 48,
          "ga": 49,
          "gd": -1,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Southampton",
          "played": 38,
          "won": 13,
          "drawn": 13,
          "lost": 12,
          "gf": 43,
          "ga": 46,
          "gd": -3,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "James Beattie",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Manchester City",
          "played": 38,
          "won": 15,
          "drawn": 6,
          "lost": 17,
          "gf": 47,
          "ga": 54,
          "gd": -7,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Nicolas Anelka",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 14,
          "drawn": 8,
          "lost": 16,
          "gf": 51,
          "ga": 62,
          "gd": -11,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Middlesbrough",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 48,
          "ga": 44,
          "gd": 4,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 14,
          "drawn": 7,
          "lost": 17,
          "gf": 45,
          "ga": 56,
          "gd": -11,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Birmingham City",
          "played": 38,
          "won": 13,
          "drawn": 9,
          "lost": 16,
          "gf": 41,
          "ga": 49,
          "gd": -8,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Fulham",
          "played": 38,
          "won": 13,
          "drawn": 9,
          "lost": 16,
          "gf": 41,
          "ga": 50,
          "gd": -9,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Leeds United",
          "played": 38,
          "won": 14,
          "drawn": 5,
          "lost": 19,
          "gf": 58,
          "ga": 57,
          "gd": 1,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mark Viduka",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Aston Villa",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 42,
          "ga": 47,
          "gd": -5,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 10,
          "drawn": 14,
          "lost": 14,
          "gf": 41,
          "ga": 51,
          "gd": -10,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "West Ham United",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 42,
          "ga": 59,
          "gd": -17,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 6,
          "drawn": 8,
          "lost": 24,
          "gf": 29,
          "ga": 65,
          "gd": -36,
          "points": 26,
          "rawPoints": 26,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Sunderland",
          "played": 38,
          "won": 4,
          "drawn": 7,
          "lost": 27,
          "gf": 21,
          "ga": 65,
          "gd": -44,
          "points": 19,
          "rawPoints": 19,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2003-04",
      "startYear": 2003,
      "endYear": 2004,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 30,
      "goldenBootWinners": [
        {
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 30
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 30,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Alan Shearer",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Louis Saha",
          "clubs": [
            "Fulham",
            "Manchester United"
          ],
          "clubDisplay": "Fulham / Manchester United",
          "goals": 20,
          "clubBreakdown": [
            {
              "club": "Fulham",
              "goals": 13
            },
            {
              "club": "Manchester United",
              "goals": 7
            }
          ]
        },
        {
          "rank": 3,
          "player": "Ruud van Nistelrooy",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Mikael Forssell",
          "clubs": [
            "Birmingham City"
          ],
          "clubDisplay": "Birmingham City",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Nicolas Anelka",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Juan Pablo Ángel",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Michael Owen",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Yakubu",
          "clubs": [
            "Portsmouth"
          ],
          "clubDisplay": "Portsmouth",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "James Beattie",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Robbie Keane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Robert Pires",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Arsenal",
          "played": 38,
          "won": 26,
          "drawn": 12,
          "lost": 0,
          "gf": 73,
          "ga": 26,
          "gd": 47,
          "points": 90,
          "rawPoints": 90,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 30,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Chelsea",
          "played": 38,
          "won": 24,
          "drawn": 7,
          "lost": 7,
          "gf": 67,
          "ga": 30,
          "gd": 37,
          "points": 79,
          "rawPoints": 79,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jimmy Floyd Hasselbaink",
            "goals": 13,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Manchester United",
          "played": 38,
          "won": 23,
          "drawn": 6,
          "lost": 9,
          "gf": 64,
          "ga": 35,
          "gd": 29,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ruud van Nistelrooy",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 38,
          "won": 16,
          "drawn": 12,
          "lost": 10,
          "gf": 55,
          "ga": 37,
          "gd": 18,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michael Owen",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Newcastle United",
          "played": 38,
          "won": 13,
          "drawn": 17,
          "lost": 8,
          "gf": 52,
          "ga": 40,
          "gd": 12,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alan Shearer",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 15,
          "drawn": 11,
          "lost": 12,
          "gf": 48,
          "ga": 44,
          "gd": 4,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Juan Pablo Ángel",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 14,
          "drawn": 11,
          "lost": 13,
          "gf": 51,
          "ga": 51,
          "gd": 0,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 14,
          "drawn": 11,
          "lost": 13,
          "gf": 48,
          "ga": 56,
          "gd": -8,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Fulham",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 52,
          "ga": 46,
          "gd": 6,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Louis Saha",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Birmingham City",
          "played": 38,
          "won": 12,
          "drawn": 14,
          "lost": 12,
          "gf": 43,
          "ga": 48,
          "gd": -5,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mikael Forssell",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Middlesbrough",
          "played": 38,
          "won": 13,
          "drawn": 9,
          "lost": 16,
          "gf": 44,
          "ga": 52,
          "gd": -8,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Southampton",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 44,
          "ga": 45,
          "gd": -1,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "James Beattie",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Portsmouth",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 47,
          "ga": 54,
          "gd": -7,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Yakubu",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 13,
          "drawn": 6,
          "lost": 19,
          "gf": 47,
          "ga": 57,
          "gd": -10,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robbie Keane",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 51,
          "ga": 59,
          "gd": -8,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Manchester City",
          "played": 38,
          "won": 9,
          "drawn": 14,
          "lost": 15,
          "gf": 55,
          "ga": 54,
          "gd": 1,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Nicolas Anelka",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Everton",
          "played": 38,
          "won": 9,
          "drawn": 12,
          "lost": 17,
          "gf": 45,
          "ga": 57,
          "gd": -12,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Leicester City",
          "played": 38,
          "won": 6,
          "drawn": 15,
          "lost": 17,
          "gf": 48,
          "ga": 65,
          "gd": -17,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Leeds United",
          "played": 38,
          "won": 8,
          "drawn": 9,
          "lost": 21,
          "gf": 40,
          "ga": 79,
          "gd": -39,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 38,
          "ga": 77,
          "gd": -39,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2004-05",
      "startYear": 2004,
      "endYear": 2005,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 25,
      "goldenBootWinners": [
        {
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 25
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Andy Johnson",
          "clubs": [
            "Crystal Palace"
          ],
          "clubDisplay": "Crystal Palace",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Robert Pires",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Jermain Defoe",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Jimmy Floyd Hasselbaink",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Frank Lampard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Yakubu",
          "clubs": [
            "Portsmouth"
          ],
          "clubDisplay": "Portsmouth",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Andy Cole",
          "clubs": [
            "Fulham"
          ],
          "clubDisplay": "Fulham",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Peter Crouch",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Eiður Guðjohnsen",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Chelsea",
          "played": 38,
          "won": 29,
          "drawn": 8,
          "lost": 1,
          "gf": 72,
          "ga": 15,
          "gd": 57,
          "points": 95,
          "rawPoints": 95,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Frank Lampard",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 25,
          "drawn": 8,
          "lost": 5,
          "gf": 87,
          "ga": 36,
          "gd": 51,
          "points": 83,
          "rawPoints": 83,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Manchester United",
          "played": 38,
          "won": 22,
          "drawn": 11,
          "lost": 5,
          "gf": 58,
          "ga": 26,
          "gd": 32,
          "points": 77,
          "rawPoints": 77,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wayne Rooney",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Everton",
          "played": 38,
          "won": 18,
          "drawn": 7,
          "lost": 13,
          "gf": 45,
          "ga": 46,
          "gd": -1,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Tim Cahill",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Liverpool",
          "played": 38,
          "won": 17,
          "drawn": 7,
          "lost": 14,
          "gf": 52,
          "ga": 41,
          "gd": 11,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 16,
          "drawn": 10,
          "lost": 12,
          "gf": 49,
          "ga": 44,
          "gd": 5,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Middlesbrough",
          "played": 38,
          "won": 14,
          "drawn": 13,
          "lost": 11,
          "gf": 53,
          "ga": 46,
          "gd": 7,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jimmy Floyd Hasselbaink",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Manchester City",
          "played": 38,
          "won": 13,
          "drawn": 13,
          "lost": 12,
          "gf": 47,
          "ga": 39,
          "gd": 8,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 47,
          "ga": 41,
          "gd": 6,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jermain Defoe",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Aston Villa",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 45,
          "ga": 52,
          "gd": -7,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 42,
          "ga": 58,
          "gd": -16,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Birmingham City",
          "played": 38,
          "won": 11,
          "drawn": 12,
          "lost": 15,
          "gf": 40,
          "ga": 46,
          "gd": -6,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Fulham",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 52,
          "ga": 60,
          "gd": -8,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andy Cole",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Newcastle United",
          "played": 38,
          "won": 10,
          "drawn": 14,
          "lost": 14,
          "gf": 47,
          "ga": 57,
          "gd": -10,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 9,
          "drawn": 15,
          "lost": 14,
          "gf": 32,
          "ga": 43,
          "gd": -11,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Portsmouth",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 43,
          "ga": 59,
          "gd": -16,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Yakubu",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 6,
          "drawn": 16,
          "lost": 16,
          "gf": 36,
          "ga": 61,
          "gd": -25,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Crystal Palace",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 41,
          "ga": 62,
          "gd": -21,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Andy Johnson",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Norwich City",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 42,
          "ga": 77,
          "gd": -35,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Southampton",
          "played": 38,
          "won": 6,
          "drawn": 14,
          "lost": 18,
          "gf": 45,
          "ga": 66,
          "gd": -21,
          "points": 32,
          "rawPoints": 32,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Peter Crouch",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2005-06",
      "startYear": 2005,
      "endYear": 2006,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 27,
      "goldenBootWinners": [
        {
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 27
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Thierry Henry",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 27,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Ruud van Nistelrooy",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Darren Bent",
          "clubs": [
            "Charlton Athletic"
          ],
          "clubDisplay": "Charlton Athletic",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Robbie Keane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Frank Lampard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Marlon Harewood",
          "clubs": [
            "West Ham United"
          ],
          "clubDisplay": "West Ham United",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Craig Bellamy",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Yakubu",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Henri Camara",
          "clubs": [
            "Wigan Athletic"
          ],
          "clubDisplay": "Wigan Athletic",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Didier Drogba",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Chelsea",
          "played": 38,
          "won": 29,
          "drawn": 4,
          "lost": 5,
          "gf": 72,
          "ga": 22,
          "gd": 50,
          "points": 91,
          "rawPoints": 91,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Frank Lampard",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 38,
          "won": 25,
          "drawn": 8,
          "lost": 5,
          "gf": 72,
          "ga": 34,
          "gd": 38,
          "points": 83,
          "rawPoints": 83,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ruud van Nistelrooy",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 25,
          "drawn": 7,
          "lost": 6,
          "gf": 57,
          "ga": 25,
          "gd": 32,
          "points": 82,
          "rawPoints": 82,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Steven Gerrard",
            "goals": 10,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 38,
          "won": 20,
          "drawn": 7,
          "lost": 11,
          "gf": 68,
          "ga": 31,
          "gd": 37,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Thierry Henry",
            "goals": 27,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 5,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 18,
          "drawn": 11,
          "lost": 9,
          "gf": 53,
          "ga": 38,
          "gd": 15,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robbie Keane",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 19,
          "drawn": 6,
          "lost": 13,
          "gf": 51,
          "ga": 42,
          "gd": 9,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Craig Bellamy",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Newcastle United",
          "played": 38,
          "won": 17,
          "drawn": 7,
          "lost": 14,
          "gf": 47,
          "ga": 42,
          "gd": 5,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 15,
          "drawn": 11,
          "lost": 12,
          "gf": 49,
          "ga": 41,
          "gd": 8,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "West Ham United",
          "played": 38,
          "won": 16,
          "drawn": 7,
          "lost": 15,
          "gf": 52,
          "ga": 55,
          "gd": -3,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Marlon Harewood",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 15,
          "drawn": 6,
          "lost": 17,
          "gf": 45,
          "ga": 52,
          "gd": -7,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Henri Camara",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Everton",
          "played": 38,
          "won": 14,
          "drawn": 8,
          "lost": 16,
          "gf": 34,
          "ga": 49,
          "gd": -15,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Fulham",
          "played": 38,
          "won": 14,
          "drawn": 6,
          "lost": 18,
          "gf": 48,
          "ga": 58,
          "gd": -10,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 13,
          "drawn": 8,
          "lost": 17,
          "gf": 41,
          "ga": 55,
          "gd": -14,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Darren Bent",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Middlesbrough",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 48,
          "ga": 58,
          "gd": -10,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Yakubu",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Manchester City",
          "played": 38,
          "won": 13,
          "drawn": 4,
          "lost": 21,
          "gf": 43,
          "ga": 48,
          "gd": -5,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Aston Villa",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 42,
          "ga": 55,
          "gd": -13,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Portsmouth",
          "played": 38,
          "won": 10,
          "drawn": 8,
          "lost": 20,
          "gf": 37,
          "ga": 62,
          "gd": -25,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Birmingham City",
          "played": 38,
          "won": 8,
          "drawn": 10,
          "lost": 20,
          "gf": 28,
          "ga": 50,
          "gd": -22,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 7,
          "drawn": 9,
          "lost": 22,
          "gf": 31,
          "ga": 58,
          "gd": -27,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Sunderland",
          "played": 38,
          "won": 3,
          "drawn": 6,
          "lost": 29,
          "gf": 26,
          "ga": 69,
          "gd": -43,
          "points": 15,
          "rawPoints": 15,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2006-07",
      "startYear": 2006,
      "endYear": 2007,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 20,
      "goldenBootWinners": [
        {
          "player": "Didier Drogba",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 20
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Didier Drogba",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Benni McCarthy",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Cristiano Ronaldo",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Mark Viduka",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Darren Bent",
          "clubs": [
            "Charlton Athletic"
          ],
          "clubDisplay": "Charlton Athletic",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Kevin Doyle",
          "clubs": [
            "Reading"
          ],
          "clubDisplay": "Reading",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Dimitar Berbatov",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Dirk Kuyt",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Yakubu",
          "clubs": [
            "Middlesbrough"
          ],
          "clubDisplay": "Middlesbrough",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 28,
          "drawn": 5,
          "lost": 5,
          "gf": 83,
          "ga": 27,
          "gd": 56,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cristiano Ronaldo",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Chelsea",
          "played": 38,
          "won": 24,
          "drawn": 11,
          "lost": 3,
          "gf": 64,
          "ga": 24,
          "gd": 40,
          "points": 83,
          "rawPoints": 83,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Didier Drogba",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 20,
          "drawn": 8,
          "lost": 10,
          "gf": 57,
          "ga": 27,
          "gd": 30,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dirk Kuyt",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 38,
          "won": 19,
          "drawn": 11,
          "lost": 8,
          "gf": 63,
          "ga": 35,
          "gd": 28,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robin van Persie",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 17,
          "drawn": 9,
          "lost": 12,
          "gf": 57,
          "ga": 54,
          "gd": 3,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dimitar Berbatov",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Everton",
          "played": 38,
          "won": 15,
          "drawn": 13,
          "lost": 10,
          "gf": 52,
          "ga": 36,
          "gd": 16,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 16,
          "drawn": 8,
          "lost": 14,
          "gf": 47,
          "ga": 52,
          "gd": -5,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Reading",
          "played": 38,
          "won": 16,
          "drawn": 7,
          "lost": 15,
          "gf": 52,
          "ga": 47,
          "gd": 5,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Kevin Doyle",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Portsmouth",
          "played": 38,
          "won": 14,
          "drawn": 12,
          "lost": 12,
          "gf": 45,
          "ga": 42,
          "gd": 3,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 15,
          "drawn": 7,
          "lost": 16,
          "gf": 52,
          "ga": 54,
          "gd": -2,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Benni McCarthy",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Aston Villa",
          "played": 38,
          "won": 11,
          "drawn": 17,
          "lost": 10,
          "gf": 43,
          "ga": 41,
          "gd": 2,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Middlesbrough",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 44,
          "ga": 49,
          "gd": -5,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mark Viduka",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 38,
          "ga": 47,
          "gd": -9,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Manchester City",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 29,
          "ga": 44,
          "gd": -15,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "West Ham United",
          "played": 38,
          "won": 12,
          "drawn": 5,
          "lost": 21,
          "gf": 35,
          "ga": 59,
          "gd": -24,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Fulham",
          "played": 38,
          "won": 8,
          "drawn": 15,
          "lost": 15,
          "gf": 38,
          "ga": 60,
          "gd": -22,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 10,
          "drawn": 8,
          "lost": 20,
          "gf": 37,
          "ga": 59,
          "gd": -22,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Sheffield United",
          "played": 38,
          "won": 10,
          "drawn": 8,
          "lost": 20,
          "gf": 32,
          "ga": 55,
          "gd": -23,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Charlton Athletic",
          "played": 38,
          "won": 8,
          "drawn": 10,
          "lost": 20,
          "gf": 34,
          "ga": 60,
          "gd": -26,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Darren Bent",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Watford",
          "played": 38,
          "won": 5,
          "drawn": 13,
          "lost": 20,
          "gf": 29,
          "ga": 59,
          "gd": -30,
          "points": 28,
          "rawPoints": 28,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2007-08",
      "startYear": 2007,
      "endYear": 2008,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 31,
      "goldenBootWinners": [
        {
          "player": "Cristiano Ronaldo",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 31
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Cristiano Ronaldo",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 31,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Emmanuel Adebayor",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Fernando Torres",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Roque Santa Cruz",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Benjani",
          "clubs": [
            "Portsmouth",
            "Manchester City"
          ],
          "clubDisplay": "Portsmouth / Manchester City",
          "goals": 15,
          "clubBreakdown": [
            {
              "club": "Portsmouth",
              "goals": 12
            },
            {
              "club": "Manchester City",
              "goals": 3
            }
          ]
        },
        {
          "rank": 5,
          "player": "Dimitar Berbatov",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Robbie Keane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Yakubu",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Carlos Tevez",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "John Carew",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 27,
          "drawn": 6,
          "lost": 5,
          "gf": 80,
          "ga": 22,
          "gd": 58,
          "points": 87,
          "rawPoints": 87,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cristiano Ronaldo",
            "goals": 31,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Chelsea",
          "played": 38,
          "won": 25,
          "drawn": 10,
          "lost": 3,
          "gf": 65,
          "ga": 26,
          "gd": 39,
          "points": 85,
          "rawPoints": 85,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Frank Lampard",
            "goals": 10,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Arsenal",
          "played": 38,
          "won": 24,
          "drawn": 11,
          "lost": 3,
          "gf": 74,
          "ga": 31,
          "gd": 43,
          "points": 83,
          "rawPoints": 83,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Emmanuel Adebayor",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 38,
          "won": 21,
          "drawn": 13,
          "lost": 4,
          "gf": 67,
          "ga": 28,
          "gd": 39,
          "points": 76,
          "rawPoints": 76,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Fernando Torres",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Everton",
          "played": 38,
          "won": 19,
          "drawn": 8,
          "lost": 11,
          "gf": 55,
          "ga": 33,
          "gd": 22,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Yakubu",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 16,
          "drawn": 12,
          "lost": 10,
          "gf": 71,
          "ga": 51,
          "gd": 20,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "John Carew",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 15,
          "drawn": 13,
          "lost": 10,
          "gf": 50,
          "ga": 48,
          "gd": 2,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Roque Santa Cruz",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Portsmouth",
          "played": 38,
          "won": 16,
          "drawn": 9,
          "lost": 13,
          "gf": 48,
          "ga": 40,
          "gd": 8,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Benjani",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Manchester City",
          "played": 38,
          "won": 15,
          "drawn": 10,
          "lost": 13,
          "gf": 45,
          "ga": 53,
          "gd": -8,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Benjani",
            "goals": 3,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "West Ham United",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 42,
          "ga": 50,
          "gd": -8,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 11,
          "drawn": 13,
          "lost": 14,
          "gf": 66,
          "ga": 61,
          "gd": 5,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dimitar Berbatov / Robbie Keane",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 45,
          "ga": 65,
          "gd": -20,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Middlesbrough",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 43,
          "ga": 53,
          "gd": -10,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 10,
          "drawn": 10,
          "lost": 18,
          "gf": 34,
          "ga": 51,
          "gd": -17,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Sunderland",
          "played": 38,
          "won": 11,
          "drawn": 6,
          "lost": 21,
          "gf": 36,
          "ga": 59,
          "gd": -23,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 9,
          "drawn": 10,
          "lost": 19,
          "gf": 36,
          "ga": 54,
          "gd": -18,
          "points": 37,
          "rawPoints": 37,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Fulham",
          "played": 38,
          "won": 8,
          "drawn": 12,
          "lost": 18,
          "gf": 38,
          "ga": 60,
          "gd": -22,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Reading",
          "played": 38,
          "won": 10,
          "drawn": 6,
          "lost": 22,
          "gf": 41,
          "ga": 66,
          "gd": -25,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Birmingham City",
          "played": 38,
          "won": 8,
          "drawn": 11,
          "lost": 19,
          "gf": 46,
          "ga": 62,
          "gd": -16,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Derby County",
          "played": 38,
          "won": 1,
          "drawn": 8,
          "lost": 29,
          "gf": 20,
          "ga": 89,
          "gd": -69,
          "points": 11,
          "rawPoints": 11,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2008-09",
      "startYear": 2008,
      "endYear": 2009,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 19,
      "goldenBootWinners": [
        {
          "player": "Nicolas Anelka",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 19
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Nicolas Anelka",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Cristiano Ronaldo",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Steven Gerrard",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Robinho",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Fernando Torres",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Gabriel Agbonlahor",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Darren Bent",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Kevin Davies",
          "clubs": [
            "Bolton Wanderers"
          ],
          "clubDisplay": "Bolton Wanderers",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Dirk Kuyt",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Frank Lampard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 28,
          "drawn": 6,
          "lost": 4,
          "gf": 68,
          "ga": 24,
          "gd": 44,
          "points": 90,
          "rawPoints": 90,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cristiano Ronaldo",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Liverpool",
          "played": 38,
          "won": 25,
          "drawn": 11,
          "lost": 2,
          "gf": 77,
          "ga": 27,
          "gd": 50,
          "points": 86,
          "rawPoints": 86,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Steven Gerrard",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Chelsea",
          "played": 38,
          "won": 25,
          "drawn": 8,
          "lost": 5,
          "gf": 68,
          "ga": 24,
          "gd": 44,
          "points": 83,
          "rawPoints": 83,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Nicolas Anelka",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 38,
          "won": 20,
          "drawn": 12,
          "lost": 6,
          "gf": 68,
          "ga": 37,
          "gd": 31,
          "points": 72,
          "rawPoints": 72,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robin van Persie",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Everton",
          "played": 38,
          "won": 17,
          "drawn": 12,
          "lost": 9,
          "gf": 55,
          "ga": 37,
          "gd": 18,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 17,
          "drawn": 11,
          "lost": 10,
          "gf": 54,
          "ga": 48,
          "gd": 6,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gabriel Agbonlahor",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Fulham",
          "played": 38,
          "won": 14,
          "drawn": 11,
          "lost": 13,
          "gf": 39,
          "ga": 34,
          "gd": 5,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 14,
          "drawn": 9,
          "lost": 15,
          "gf": 45,
          "ga": 45,
          "gd": 0,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Darren Bent",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "West Ham United",
          "played": 38,
          "won": 14,
          "drawn": 9,
          "lost": 15,
          "gf": 42,
          "ga": 45,
          "gd": -3,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Manchester City",
          "played": 38,
          "won": 15,
          "drawn": 5,
          "lost": 18,
          "gf": 58,
          "ga": 50,
          "gd": 8,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robinho",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 34,
          "ga": 45,
          "gd": -11,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Stoke City",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 38,
          "ga": 55,
          "gd": -17,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 11,
          "drawn": 8,
          "lost": 19,
          "gf": 41,
          "ga": 53,
          "gd": -12,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Kevin Davies",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Portsmouth",
          "played": 38,
          "won": 10,
          "drawn": 11,
          "lost": 17,
          "gf": 38,
          "ga": 57,
          "gd": -19,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 10,
          "drawn": 11,
          "lost": 17,
          "gf": 40,
          "ga": 60,
          "gd": -20,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Sunderland",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 34,
          "ga": 54,
          "gd": -20,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Hull City",
          "played": 38,
          "won": 8,
          "drawn": 11,
          "lost": 19,
          "gf": 39,
          "ga": 64,
          "gd": -25,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Newcastle United",
          "played": 38,
          "won": 7,
          "drawn": 13,
          "lost": 18,
          "gf": 40,
          "ga": 59,
          "gd": -19,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Middlesbrough",
          "played": 38,
          "won": 7,
          "drawn": 11,
          "lost": 20,
          "gf": 28,
          "ga": 57,
          "gd": -29,
          "points": 32,
          "rawPoints": 32,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 8,
          "drawn": 8,
          "lost": 22,
          "gf": 36,
          "ga": 67,
          "gd": -31,
          "points": 32,
          "rawPoints": 32,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2009-10",
      "startYear": 2009,
      "endYear": 2010,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 29,
      "goldenBootWinners": [
        {
          "player": "Didier Drogba",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 29
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Didier Drogba",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 29,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 26,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Darren Bent",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Carlos Tevez",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Frank Lampard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Fernando Torres",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Jermain Defoe",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Cesc Fàbregas",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Emmanuel Adebayor",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Gabriel Agbonlahor",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Louis Saha",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Chelsea",
          "played": 38,
          "won": 27,
          "drawn": 5,
          "lost": 6,
          "gf": 103,
          "ga": 32,
          "gd": 71,
          "points": 86,
          "rawPoints": 86,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Didier Drogba",
            "goals": 29,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 38,
          "won": 27,
          "drawn": 4,
          "lost": 7,
          "gf": 86,
          "ga": 28,
          "gd": 58,
          "points": 85,
          "rawPoints": 85,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wayne Rooney",
            "goals": 26,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Arsenal",
          "played": 38,
          "won": 23,
          "drawn": 6,
          "lost": 9,
          "gf": 83,
          "ga": 41,
          "gd": 42,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cesc Fàbregas",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 21,
          "drawn": 7,
          "lost": 10,
          "gf": 67,
          "ga": 41,
          "gd": 26,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jermain Defoe",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Manchester City",
          "played": 38,
          "won": 18,
          "drawn": 13,
          "lost": 7,
          "gf": 73,
          "ga": 45,
          "gd": 28,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Carlos Tevez",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 17,
          "drawn": 13,
          "lost": 8,
          "gf": 52,
          "ga": 39,
          "gd": 13,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gabriel Agbonlahor",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Liverpool",
          "played": 38,
          "won": 18,
          "drawn": 9,
          "lost": 11,
          "gf": 61,
          "ga": 35,
          "gd": 26,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Fernando Torres",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Everton",
          "played": 38,
          "won": 16,
          "drawn": 13,
          "lost": 9,
          "gf": 60,
          "ga": 49,
          "gd": 11,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Louis Saha",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Birmingham City",
          "played": 38,
          "won": 13,
          "drawn": 11,
          "lost": 14,
          "gf": 38,
          "ga": 47,
          "gd": -9,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 13,
          "drawn": 11,
          "lost": 14,
          "gf": 41,
          "ga": 55,
          "gd": -14,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Stoke City",
          "played": 38,
          "won": 11,
          "drawn": 14,
          "lost": 13,
          "gf": 34,
          "ga": 48,
          "gd": -14,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Fulham",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 39,
          "ga": 46,
          "gd": -7,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Sunderland",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 48,
          "ga": 56,
          "gd": -8,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Darren Bent",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 42,
          "ga": 67,
          "gd": -25,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 9,
          "drawn": 11,
          "lost": 18,
          "gf": 32,
          "ga": 56,
          "gd": -24,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 37,
          "ga": 79,
          "gd": -42,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "West Ham United",
          "played": 38,
          "won": 8,
          "drawn": 11,
          "lost": 19,
          "gf": 47,
          "ga": 66,
          "gd": -19,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Burnley",
          "played": 38,
          "won": 8,
          "drawn": 6,
          "lost": 24,
          "gf": 42,
          "ga": 82,
          "gd": -40,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Hull City",
          "played": 38,
          "won": 6,
          "drawn": 12,
          "lost": 20,
          "gf": 34,
          "ga": 75,
          "gd": -41,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Portsmouth",
          "played": 38,
          "won": 7,
          "drawn": 7,
          "lost": 24,
          "gf": 34,
          "ga": 66,
          "gd": -32,
          "points": 19,
          "rawPoints": 28,
          "pointsDeducted": 9,
          "deductionReason": "Entered administration",
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2010-11",
      "startYear": 2010,
      "endYear": 2011,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 20,
      "goldenBootWinners": [
        {
          "player": "Dimitar Berbatov",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 20
        },
        {
          "player": "Carlos Tevez",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 20
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Dimitar Berbatov",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Carlos Tevez",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Robin van Persie",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Darren Bent",
          "clubs": [
            "Sunderland",
            "Aston Villa"
          ],
          "clubDisplay": "Sunderland / Aston Villa",
          "goals": 17,
          "clubBreakdown": [
            {
              "club": "Sunderland",
              "goals": 8
            },
            {
              "club": "Aston Villa",
              "goals": 9
            }
          ]
        },
        {
          "rank": 5,
          "player": "Peter Odemwingie",
          "clubs": [
            "West Bromwich Albion"
          ],
          "clubDisplay": "West Bromwich Albion",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "DJ Campbell",
          "clubs": [
            "Blackpool"
          ],
          "clubDisplay": "Blackpool",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Andy Carroll",
          "clubs": [
            "Newcastle United",
            "Liverpool"
          ],
          "clubDisplay": "Newcastle United / Liverpool",
          "goals": 13,
          "clubBreakdown": [
            {
              "club": "Newcastle United",
              "goals": 11
            },
            {
              "club": "Liverpool",
              "goals": 2
            }
          ]
        },
        {
          "rank": 6,
          "player": "Javier Hernández",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Dirk Kuyt",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Florent Malouda",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Rafael van der Vaart",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 23,
          "drawn": 11,
          "lost": 4,
          "gf": 78,
          "ga": 37,
          "gd": 41,
          "points": 80,
          "rawPoints": 80,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dimitar Berbatov",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Chelsea",
          "played": 38,
          "won": 21,
          "drawn": 8,
          "lost": 9,
          "gf": 69,
          "ga": 33,
          "gd": 36,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Florent Malouda",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Manchester City",
          "played": 38,
          "won": 21,
          "drawn": 8,
          "lost": 9,
          "gf": 60,
          "ga": 33,
          "gd": 27,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Carlos Tevez",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 38,
          "won": 19,
          "drawn": 11,
          "lost": 8,
          "gf": 72,
          "ga": 43,
          "gd": 29,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robin van Persie",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 16,
          "drawn": 14,
          "lost": 8,
          "gf": 55,
          "ga": 46,
          "gd": 9,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Rafael van der Vaart",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Liverpool",
          "played": 38,
          "won": 17,
          "drawn": 7,
          "lost": 14,
          "gf": 59,
          "ga": 44,
          "gd": 15,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dirk Kuyt",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Everton",
          "played": 38,
          "won": 13,
          "drawn": 15,
          "lost": 10,
          "gf": 51,
          "ga": 45,
          "gd": 6,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Fulham",
          "played": 38,
          "won": 11,
          "drawn": 16,
          "lost": 11,
          "gf": 49,
          "ga": 43,
          "gd": 6,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Aston Villa",
          "played": 38,
          "won": 12,
          "drawn": 12,
          "lost": 14,
          "gf": 48,
          "ga": 59,
          "gd": -11,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Darren Bent",
            "goals": 9,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Sunderland",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 45,
          "ga": 56,
          "gd": -11,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Darren Bent",
            "goals": 8,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 56,
          "ga": 71,
          "gd": -15,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Peter Odemwingie",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 13,
          "lost": 14,
          "gf": 56,
          "ga": 57,
          "gd": -1,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Andy Carroll",
            "goals": 11,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Stoke City",
          "played": 38,
          "won": 13,
          "drawn": 7,
          "lost": 18,
          "gf": 46,
          "ga": 48,
          "gd": -2,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 52,
          "ga": 56,
          "gd": -4,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 46,
          "ga": 59,
          "gd": -13,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 9,
          "drawn": 15,
          "lost": 14,
          "gf": 40,
          "ga": 61,
          "gd": -21,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 11,
          "drawn": 7,
          "lost": 20,
          "gf": 46,
          "ga": 66,
          "gd": -20,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Birmingham City",
          "played": 38,
          "won": 8,
          "drawn": 15,
          "lost": 15,
          "gf": 37,
          "ga": 58,
          "gd": -21,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Blackpool",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 55,
          "ga": 78,
          "gd": -23,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "DJ Campbell",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "West Ham United",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 43,
          "ga": 70,
          "gd": -27,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2011-12",
      "startYear": 2011,
      "endYear": 2012,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 30,
      "goldenBootWinners": [
        {
          "player": "Robin van Persie",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 30
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Robin van Persie",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 30,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 27,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Clint Dempsey",
          "clubs": [
            "Fulham"
          ],
          "clubDisplay": "Fulham",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Emmanuel Adebayor",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Yakubu",
          "clubs": [
            "Blackburn Rovers"
          ],
          "clubDisplay": "Blackburn Rovers",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Demba Ba",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Grant Holt",
          "clubs": [
            "Norwich City"
          ],
          "clubDisplay": "Norwich City",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Edin Džeko",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Mario Balotelli",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Papiss Cissé",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 28,
          "drawn": 5,
          "lost": 5,
          "gf": 93,
          "ga": 29,
          "gd": 64,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sergio Agüero",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 38,
          "won": 28,
          "drawn": 5,
          "lost": 5,
          "gf": 89,
          "ga": 33,
          "gd": 56,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wayne Rooney",
            "goals": 27,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Arsenal",
          "played": 38,
          "won": 21,
          "drawn": 7,
          "lost": 10,
          "gf": 74,
          "ga": 49,
          "gd": 25,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robin van Persie",
            "goals": 30,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 4,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 20,
          "drawn": 9,
          "lost": 9,
          "gf": 66,
          "ga": 41,
          "gd": 25,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Emmanuel Adebayor",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Newcastle United",
          "played": 38,
          "won": 19,
          "drawn": 8,
          "lost": 11,
          "gf": 56,
          "ga": 51,
          "gd": 5,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Demba Ba",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Chelsea",
          "played": 38,
          "won": 18,
          "drawn": 10,
          "lost": 10,
          "gf": 65,
          "ga": 46,
          "gd": 19,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Everton",
          "played": 38,
          "won": 15,
          "drawn": 11,
          "lost": 12,
          "gf": 50,
          "ga": 40,
          "gd": 10,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Liverpool",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 47,
          "ga": 40,
          "gd": 7,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Fulham",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 48,
          "ga": 51,
          "gd": -3,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Clint Dempsey",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 13,
          "drawn": 8,
          "lost": 17,
          "gf": 45,
          "ga": 52,
          "gd": -7,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Swansea City",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 44,
          "ga": 51,
          "gd": -7,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Norwich City",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 52,
          "ga": 66,
          "gd": -14,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Grant Holt",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Sunderland",
          "played": 38,
          "won": 11,
          "drawn": 12,
          "lost": 15,
          "gf": 45,
          "ga": 46,
          "gd": -1,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Stoke City",
          "played": 38,
          "won": 11,
          "drawn": 12,
          "lost": 15,
          "gf": 36,
          "ga": 53,
          "gd": -17,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 42,
          "ga": 62,
          "gd": -20,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Aston Villa",
          "played": 38,
          "won": 7,
          "drawn": 17,
          "lost": 14,
          "gf": 37,
          "ga": 53,
          "gd": -16,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Queens Park Rangers",
          "played": 38,
          "won": 10,
          "drawn": 7,
          "lost": 21,
          "gf": 43,
          "ga": 66,
          "gd": -23,
          "points": 37,
          "rawPoints": 37,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Bolton Wanderers",
          "played": 38,
          "won": 10,
          "drawn": 6,
          "lost": 22,
          "gf": 46,
          "ga": 77,
          "gd": -31,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Blackburn Rovers",
          "played": 38,
          "won": 8,
          "drawn": 7,
          "lost": 23,
          "gf": 48,
          "ga": 78,
          "gd": -30,
          "points": 31,
          "rawPoints": 31,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Yakubu",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 5,
          "drawn": 10,
          "lost": 23,
          "gf": 40,
          "ga": 82,
          "gd": -42,
          "points": 25,
          "rawPoints": 25,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2012-13",
      "startYear": 2012,
      "endYear": 2013,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 26,
      "goldenBootWinners": [
        {
          "player": "Robin van Persie",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 26
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Robin van Persie",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 26,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Luis Suárez",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Gareth Bale",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Christian Benteke",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Michu",
          "clubs": [
            "Swansea City"
          ],
          "clubDisplay": "Swansea City",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Romelu Lukaku",
          "clubs": [
            "West Bromwich Albion"
          ],
          "clubDisplay": "West Bromwich Albion",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Demba Ba",
          "clubs": [
            "Newcastle United",
            "Chelsea"
          ],
          "clubDisplay": "Newcastle United / Chelsea",
          "goals": 15,
          "clubBreakdown": [
            {
              "club": "Newcastle United",
              "goals": 13
            },
            {
              "club": "Chelsea",
              "goals": 2
            }
          ]
        },
        {
          "rank": 7,
          "player": "Dimitar Berbatov",
          "clubs": [
            "Fulham"
          ],
          "clubDisplay": "Fulham",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Rickie Lambert",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Frank Lampard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 15,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester United",
          "played": 38,
          "won": 28,
          "drawn": 5,
          "lost": 5,
          "gf": 86,
          "ga": 43,
          "gd": 43,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Robin van Persie",
            "goals": 26,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Manchester City",
          "played": 38,
          "won": 23,
          "drawn": 9,
          "lost": 6,
          "gf": 66,
          "ga": 34,
          "gd": 32,
          "points": 78,
          "rawPoints": 78,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Edin Džeko",
            "goals": 14,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Chelsea",
          "played": 38,
          "won": 22,
          "drawn": 9,
          "lost": 7,
          "gf": 75,
          "ga": 39,
          "gd": 36,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Frank Lampard",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 38,
          "won": 21,
          "drawn": 10,
          "lost": 7,
          "gf": 72,
          "ga": 37,
          "gd": 35,
          "points": 73,
          "rawPoints": 73,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Theo Walcott",
            "goals": 14,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 21,
          "drawn": 9,
          "lost": 8,
          "gf": 66,
          "ga": 46,
          "gd": 20,
          "points": 72,
          "rawPoints": 72,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gareth Bale",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Everton",
          "played": 38,
          "won": 16,
          "drawn": 15,
          "lost": 7,
          "gf": 55,
          "ga": 40,
          "gd": 15,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Liverpool",
          "played": 38,
          "won": 16,
          "drawn": 13,
          "lost": 9,
          "gf": 71,
          "ga": 43,
          "gd": 28,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Luis Suárez",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 14,
          "drawn": 7,
          "lost": 17,
          "gf": 53,
          "ga": 57,
          "gd": -4,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Romelu Lukaku",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Swansea City",
          "played": 38,
          "won": 11,
          "drawn": 13,
          "lost": 14,
          "gf": 47,
          "ga": 51,
          "gd": -4,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Michu",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "West Ham United",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 45,
          "ga": 53,
          "gd": -8,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Norwich City",
          "played": 38,
          "won": 10,
          "drawn": 14,
          "lost": 14,
          "gf": 41,
          "ga": 58,
          "gd": -17,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Fulham",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 50,
          "ga": 60,
          "gd": -10,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dimitar Berbatov",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Stoke City",
          "played": 38,
          "won": 9,
          "drawn": 15,
          "lost": 14,
          "gf": 34,
          "ga": 45,
          "gd": -11,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Southampton",
          "played": 38,
          "won": 9,
          "drawn": 14,
          "lost": 15,
          "gf": 49,
          "ga": 60,
          "gd": -11,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Rickie Lambert",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Aston Villa",
          "played": 38,
          "won": 10,
          "drawn": 11,
          "lost": 17,
          "gf": 47,
          "ga": 69,
          "gd": -22,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Christian Benteke",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 8,
          "lost": 19,
          "gf": 45,
          "ga": 68,
          "gd": -23,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Demba Ba",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Sunderland",
          "played": 38,
          "won": 9,
          "drawn": 12,
          "lost": 17,
          "gf": 41,
          "ga": 54,
          "gd": -13,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Wigan Athletic",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 47,
          "ga": 73,
          "gd": -26,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Reading",
          "played": 38,
          "won": 6,
          "drawn": 10,
          "lost": 22,
          "gf": 43,
          "ga": 73,
          "gd": -30,
          "points": 28,
          "rawPoints": 28,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Queens Park Rangers",
          "played": 38,
          "won": 4,
          "drawn": 13,
          "lost": 21,
          "gf": 30,
          "ga": 60,
          "gd": -30,
          "points": 25,
          "rawPoints": 25,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2013-14",
      "startYear": 2013,
      "endYear": 2014,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 31,
      "goldenBootWinners": [
        {
          "player": "Luis Suárez",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 31
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Luis Suárez",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 31,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Daniel Sturridge",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Yaya Touré",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Wilfried Bony",
          "clubs": [
            "Swansea City"
          ],
          "clubDisplay": "Swansea City",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Edin Džeko",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Olivier Giroud",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Romelu Lukaku",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Jay Rodriguez",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 15,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 27,
          "drawn": 5,
          "lost": 6,
          "gf": 102,
          "ga": 37,
          "gd": 65,
          "points": 86,
          "rawPoints": 86,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Yaya Touré",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Liverpool",
          "played": 38,
          "won": 26,
          "drawn": 6,
          "lost": 6,
          "gf": 101,
          "ga": 50,
          "gd": 51,
          "points": 84,
          "rawPoints": 84,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Luis Suárez",
            "goals": 31,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Chelsea",
          "played": 38,
          "won": 25,
          "drawn": 7,
          "lost": 6,
          "gf": 71,
          "ga": 27,
          "gd": 44,
          "points": 82,
          "rawPoints": 82,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Eden Hazard",
            "goals": 14,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Arsenal",
          "played": 38,
          "won": 24,
          "drawn": 7,
          "lost": 7,
          "gf": 68,
          "ga": 41,
          "gd": 27,
          "points": 79,
          "rawPoints": 79,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Olivier Giroud",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Everton",
          "played": 38,
          "won": 21,
          "drawn": 9,
          "lost": 8,
          "gf": 61,
          "ga": 39,
          "gd": 22,
          "points": 72,
          "rawPoints": 72,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Romelu Lukaku",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 21,
          "drawn": 6,
          "lost": 11,
          "gf": 55,
          "ga": 51,
          "gd": 4,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Manchester United",
          "played": 38,
          "won": 19,
          "drawn": 7,
          "lost": 12,
          "gf": 64,
          "ga": 43,
          "gd": 21,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wayne Rooney",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Southampton",
          "played": 38,
          "won": 15,
          "drawn": 11,
          "lost": 12,
          "gf": 54,
          "ga": 46,
          "gd": 8,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jay Rodriguez",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Stoke City",
          "played": 38,
          "won": 13,
          "drawn": 11,
          "lost": 14,
          "gf": 45,
          "ga": 52,
          "gd": -7,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Newcastle United",
          "played": 38,
          "won": 15,
          "drawn": 4,
          "lost": 19,
          "gf": 43,
          "ga": 59,
          "gd": -16,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Crystal Palace",
          "played": 38,
          "won": 13,
          "drawn": 6,
          "lost": 19,
          "gf": 33,
          "ga": 48,
          "gd": -15,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Swansea City",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 54,
          "ga": 54,
          "gd": 0,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wilfried Bony",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "West Ham United",
          "played": 38,
          "won": 11,
          "drawn": 7,
          "lost": 20,
          "gf": 40,
          "ga": 51,
          "gd": -11,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Sunderland",
          "played": 38,
          "won": 10,
          "drawn": 8,
          "lost": 20,
          "gf": 41,
          "ga": 60,
          "gd": -19,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Aston Villa",
          "played": 38,
          "won": 10,
          "drawn": 8,
          "lost": 20,
          "gf": 39,
          "ga": 61,
          "gd": -22,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Hull City",
          "played": 38,
          "won": 10,
          "drawn": 7,
          "lost": 21,
          "gf": 38,
          "ga": 53,
          "gd": -15,
          "points": 37,
          "rawPoints": 37,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 7,
          "drawn": 15,
          "lost": 16,
          "gf": 43,
          "ga": 59,
          "gd": -16,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Norwich City",
          "played": 38,
          "won": 8,
          "drawn": 9,
          "lost": 21,
          "gf": 28,
          "ga": 62,
          "gd": -34,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Fulham",
          "played": 38,
          "won": 9,
          "drawn": 5,
          "lost": 24,
          "gf": 40,
          "ga": 85,
          "gd": -45,
          "points": 32,
          "rawPoints": 32,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Cardiff City",
          "played": 38,
          "won": 7,
          "drawn": 9,
          "lost": 22,
          "gf": 32,
          "ga": 74,
          "gd": -42,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2014-15",
      "startYear": 2014,
      "endYear": 2015,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 26,
      "goldenBootWinners": [
        {
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 26
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 26,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Diego Costa",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Charlie Austin",
          "clubs": [
            "Queens Park Rangers"
          ],
          "clubDisplay": "Queens Park Rangers",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Alexis Sánchez",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Saido Berahino",
          "clubs": [
            "West Bromwich Albion"
          ],
          "clubDisplay": "West Bromwich Albion",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Olivier Giroud",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Eden Hazard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Christian Benteke",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Graziano Pellè",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Wayne Rooney",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "David Silva",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Chelsea",
          "played": 38,
          "won": 26,
          "drawn": 9,
          "lost": 3,
          "gf": 73,
          "ga": 32,
          "gd": 41,
          "points": 87,
          "rawPoints": 87,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Diego Costa",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester City",
          "played": 38,
          "won": 24,
          "drawn": 7,
          "lost": 7,
          "gf": 83,
          "ga": 38,
          "gd": 45,
          "points": 79,
          "rawPoints": 79,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sergio Agüero",
            "goals": 26,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Arsenal",
          "played": 38,
          "won": 22,
          "drawn": 9,
          "lost": 7,
          "gf": 71,
          "ga": 36,
          "gd": 35,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alexis Sánchez",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Manchester United",
          "played": 38,
          "won": 20,
          "drawn": 10,
          "lost": 8,
          "gf": 62,
          "ga": 37,
          "gd": 25,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wayne Rooney",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 19,
          "drawn": 7,
          "lost": 12,
          "gf": 58,
          "ga": 53,
          "gd": 5,
          "points": 64,
          "rawPoints": 64,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Liverpool",
          "played": 38,
          "won": 18,
          "drawn": 8,
          "lost": 12,
          "gf": 52,
          "ga": 48,
          "gd": 4,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Southampton",
          "played": 38,
          "won": 18,
          "drawn": 6,
          "lost": 14,
          "gf": 54,
          "ga": 33,
          "gd": 21,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Graziano Pellè",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Swansea City",
          "played": 38,
          "won": 16,
          "drawn": 8,
          "lost": 14,
          "gf": 46,
          "ga": 49,
          "gd": -3,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Stoke City",
          "played": 38,
          "won": 15,
          "drawn": 9,
          "lost": 14,
          "gf": 48,
          "ga": 45,
          "gd": 3,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Crystal Palace",
          "played": 38,
          "won": 13,
          "drawn": 9,
          "lost": 16,
          "gf": 47,
          "ga": 51,
          "gd": -4,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Everton",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 48,
          "ga": 50,
          "gd": -2,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "West Ham United",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 44,
          "ga": 47,
          "gd": -3,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 38,
          "ga": 51,
          "gd": -13,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Saido Berahino",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Leicester City",
          "played": 38,
          "won": 11,
          "drawn": 8,
          "lost": 19,
          "gf": 46,
          "ga": 55,
          "gd": -9,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Newcastle United",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 40,
          "ga": 63,
          "gd": -23,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Sunderland",
          "played": 38,
          "won": 7,
          "drawn": 17,
          "lost": 14,
          "gf": 31,
          "ga": 53,
          "gd": -22,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Aston Villa",
          "played": 38,
          "won": 10,
          "drawn": 8,
          "lost": 20,
          "gf": 31,
          "ga": 57,
          "gd": -26,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Christian Benteke",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Hull City",
          "played": 38,
          "won": 8,
          "drawn": 11,
          "lost": 19,
          "gf": 33,
          "ga": 51,
          "gd": -18,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Burnley",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 28,
          "ga": 53,
          "gd": -25,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Queens Park Rangers",
          "played": 38,
          "won": 8,
          "drawn": 6,
          "lost": 24,
          "gf": 42,
          "ga": 73,
          "gd": -31,
          "points": 30,
          "rawPoints": 30,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Charlie Austin",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2015-16",
      "startYear": 2015,
      "endYear": 2016,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 25,
      "goldenBootWinners": [
        {
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 25
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Romelu Lukaku",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Riyad Mahrez",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Olivier Giroud",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Jermain Defoe",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Odion Ighalo",
          "clubs": [
            "Watford"
          ],
          "clubDisplay": "Watford",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Troy Deeney",
          "clubs": [
            "Watford"
          ],
          "clubDisplay": "Watford",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Alexis Sánchez",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Leicester City",
          "played": 38,
          "won": 23,
          "drawn": 12,
          "lost": 3,
          "gf": 68,
          "ga": 36,
          "gd": 32,
          "points": 81,
          "rawPoints": 81,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jamie Vardy",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 20,
          "drawn": 11,
          "lost": 7,
          "gf": 65,
          "ga": 36,
          "gd": 29,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Olivier Giroud",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 19,
          "drawn": 13,
          "lost": 6,
          "gf": 69,
          "ga": 35,
          "gd": 34,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 4,
          "team": "Manchester City",
          "played": 38,
          "won": 19,
          "drawn": 9,
          "lost": 10,
          "gf": 71,
          "ga": 41,
          "gd": 30,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sergio Agüero",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Manchester United",
          "played": 38,
          "won": 19,
          "drawn": 9,
          "lost": 10,
          "gf": 49,
          "ga": 35,
          "gd": 14,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Southampton",
          "played": 38,
          "won": 18,
          "drawn": 9,
          "lost": 11,
          "gf": 59,
          "ga": 41,
          "gd": 18,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "West Ham United",
          "played": 38,
          "won": 16,
          "drawn": 14,
          "lost": 8,
          "gf": 65,
          "ga": 51,
          "gd": 14,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Liverpool",
          "played": 38,
          "won": 16,
          "drawn": 12,
          "lost": 10,
          "gf": 63,
          "ga": 50,
          "gd": 13,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Stoke City",
          "played": 38,
          "won": 14,
          "drawn": 9,
          "lost": 15,
          "gf": 41,
          "ga": 55,
          "gd": -14,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Chelsea",
          "played": 38,
          "won": 12,
          "drawn": 14,
          "lost": 12,
          "gf": 59,
          "ga": 53,
          "gd": 6,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Everton",
          "played": 38,
          "won": 11,
          "drawn": 14,
          "lost": 13,
          "gf": 59,
          "ga": 55,
          "gd": 4,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Romelu Lukaku",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Swansea City",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 42,
          "ga": 52,
          "gd": -10,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Watford",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 40,
          "ga": 50,
          "gd": -10,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Odion Ighalo",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 10,
          "drawn": 13,
          "lost": 15,
          "gf": 34,
          "ga": 48,
          "gd": -14,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Crystal Palace",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 39,
          "ga": 51,
          "gd": -12,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Bournemouth",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 45,
          "ga": 67,
          "gd": -22,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Sunderland",
          "played": 38,
          "won": 9,
          "drawn": 12,
          "lost": 17,
          "gf": 48,
          "ga": 62,
          "gd": -14,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jermain Defoe",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Newcastle United",
          "played": 38,
          "won": 9,
          "drawn": 10,
          "lost": 19,
          "gf": 44,
          "ga": 65,
          "gd": -21,
          "points": 37,
          "rawPoints": 37,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Norwich City",
          "played": 38,
          "won": 9,
          "drawn": 7,
          "lost": 22,
          "gf": 39,
          "ga": 67,
          "gd": -28,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Aston Villa",
          "played": 38,
          "won": 3,
          "drawn": 8,
          "lost": 27,
          "gf": 27,
          "ga": 76,
          "gd": -49,
          "points": 17,
          "rawPoints": 17,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2016-17",
      "startYear": 2016,
      "endYear": 2017,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 29,
      "goldenBootWinners": [
        {
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 29
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 29,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Romelu Lukaku",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 25,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Alexis Sánchez",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 24,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Diego Costa",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Dele Alli",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Zlatan Ibrahimović",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Eden Hazard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Joshua King",
          "clubs": [
            "Bournemouth"
          ],
          "clubDisplay": "Bournemouth",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Christian Benteke",
          "clubs": [
            "Crystal Palace"
          ],
          "clubDisplay": "Crystal Palace",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Jermain Defoe",
          "clubs": [
            "Sunderland"
          ],
          "clubDisplay": "Sunderland",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Fernando Llorente",
          "clubs": [
            "Swansea City"
          ],
          "clubDisplay": "Swansea City",
          "goals": 15,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Chelsea",
          "played": 38,
          "won": 30,
          "drawn": 3,
          "lost": 5,
          "gf": 85,
          "ga": 33,
          "gd": 52,
          "points": 93,
          "rawPoints": 93,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Diego Costa",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 26,
          "drawn": 8,
          "lost": 4,
          "gf": 86,
          "ga": 26,
          "gd": 60,
          "points": 86,
          "rawPoints": 86,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 29,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Manchester City",
          "played": 38,
          "won": 23,
          "drawn": 9,
          "lost": 6,
          "gf": 80,
          "ga": 39,
          "gd": 41,
          "points": 78,
          "rawPoints": 78,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sergio Agüero",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 38,
          "won": 22,
          "drawn": 10,
          "lost": 6,
          "gf": 78,
          "ga": 42,
          "gd": 36,
          "points": 76,
          "rawPoints": 76,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Philippe Coutinho / Sadio Mané",
            "goals": 13,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Arsenal",
          "played": 38,
          "won": 23,
          "drawn": 6,
          "lost": 9,
          "gf": 77,
          "ga": 44,
          "gd": 33,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alexis Sánchez",
            "goals": 24,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Manchester United",
          "played": 38,
          "won": 18,
          "drawn": 15,
          "lost": 5,
          "gf": 54,
          "ga": 29,
          "gd": 25,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Zlatan Ibrahimović",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Everton",
          "played": 38,
          "won": 17,
          "drawn": 10,
          "lost": 11,
          "gf": 62,
          "ga": 44,
          "gd": 18,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Romelu Lukaku",
            "goals": 25,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Southampton",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 41,
          "ga": 48,
          "gd": -7,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Bournemouth",
          "played": 38,
          "won": 12,
          "drawn": 10,
          "lost": 16,
          "gf": 55,
          "ga": 67,
          "gd": -12,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Joshua King",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 43,
          "ga": 51,
          "gd": -8,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "West Ham United",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 47,
          "ga": 64,
          "gd": -17,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Leicester City",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 48,
          "ga": 63,
          "gd": -15,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Stoke City",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 41,
          "ga": 56,
          "gd": -15,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Crystal Palace",
          "played": 38,
          "won": 12,
          "drawn": 5,
          "lost": 21,
          "gf": 50,
          "ga": 63,
          "gd": -13,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Christian Benteke",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Swansea City",
          "played": 38,
          "won": 12,
          "drawn": 5,
          "lost": 21,
          "gf": 45,
          "ga": 70,
          "gd": -25,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Fernando Llorente",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Burnley",
          "played": 38,
          "won": 11,
          "drawn": 7,
          "lost": 20,
          "gf": 39,
          "ga": 55,
          "gd": -16,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Watford",
          "played": 38,
          "won": 11,
          "drawn": 7,
          "lost": 20,
          "gf": 40,
          "ga": 68,
          "gd": -28,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Hull City",
          "played": 38,
          "won": 9,
          "drawn": 7,
          "lost": 22,
          "gf": 37,
          "ga": 80,
          "gd": -43,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Middlesbrough",
          "played": 38,
          "won": 5,
          "drawn": 13,
          "lost": 20,
          "gf": 27,
          "ga": 53,
          "gd": -26,
          "points": 28,
          "rawPoints": 28,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Sunderland",
          "played": 38,
          "won": 6,
          "drawn": 6,
          "lost": 26,
          "gf": 29,
          "ga": 69,
          "gd": -40,
          "points": 24,
          "rawPoints": 24,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": {
            "player": "Jermain Defoe",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2017-18",
      "startYear": 2017,
      "endYear": 2018,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 32,
      "goldenBootWinners": [
        {
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 32
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 32,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 30,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Raheem Sterling",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Romelu Lukaku",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Roberto Firmino",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Alexandre Lacazette",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Gabriel Jesus",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Eden Hazard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Riyad Mahrez",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Glenn Murray",
          "clubs": [
            "Brighton & Hove Albion"
          ],
          "clubDisplay": "Brighton & Hove Albion",
          "goals": 12,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Son Heung-min",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 12,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 32,
          "drawn": 4,
          "lost": 2,
          "gf": 106,
          "ga": 27,
          "gd": 79,
          "points": 100,
          "rawPoints": 100,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sergio Agüero",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 38,
          "won": 25,
          "drawn": 6,
          "lost": 7,
          "gf": 68,
          "ga": 28,
          "gd": 40,
          "points": 81,
          "rawPoints": 81,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Romelu Lukaku",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 23,
          "drawn": 8,
          "lost": 7,
          "gf": 74,
          "ga": 36,
          "gd": 38,
          "points": 77,
          "rawPoints": 77,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 30,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Liverpool",
          "played": 38,
          "won": 21,
          "drawn": 12,
          "lost": 5,
          "gf": 84,
          "ga": 38,
          "gd": 46,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 32,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 5,
          "team": "Chelsea",
          "played": 38,
          "won": 21,
          "drawn": 7,
          "lost": 10,
          "gf": 62,
          "ga": 38,
          "gd": 24,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Eden Hazard",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Arsenal",
          "played": 38,
          "won": 19,
          "drawn": 6,
          "lost": 13,
          "gf": 74,
          "ga": 51,
          "gd": 23,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alexandre Lacazette",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Burnley",
          "played": 38,
          "won": 14,
          "drawn": 12,
          "lost": 12,
          "gf": 36,
          "ga": 39,
          "gd": -3,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Everton",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 44,
          "ga": 58,
          "gd": -14,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Leicester City",
          "played": 38,
          "won": 12,
          "drawn": 11,
          "lost": 15,
          "gf": 56,
          "ga": 60,
          "gd": -4,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jamie Vardy",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Newcastle United",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 39,
          "ga": 47,
          "gd": -8,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Crystal Palace",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 45,
          "ga": 55,
          "gd": -10,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Bournemouth",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 45,
          "ga": 61,
          "gd": -16,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "West Ham United",
          "played": 38,
          "won": 10,
          "drawn": 12,
          "lost": 16,
          "gf": 48,
          "ga": 68,
          "gd": -20,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Watford",
          "played": 38,
          "won": 11,
          "drawn": 8,
          "lost": 19,
          "gf": 44,
          "ga": 64,
          "gd": -20,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 9,
          "drawn": 13,
          "lost": 16,
          "gf": 34,
          "ga": 54,
          "gd": -20,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Glenn Murray",
            "goals": 12,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Huddersfield Town",
          "played": 38,
          "won": 9,
          "drawn": 10,
          "lost": 19,
          "gf": 28,
          "ga": 58,
          "gd": -30,
          "points": 37,
          "rawPoints": 37,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Southampton",
          "played": 38,
          "won": 7,
          "drawn": 15,
          "lost": 16,
          "gf": 37,
          "ga": 56,
          "gd": -19,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Swansea City",
          "played": 38,
          "won": 8,
          "drawn": 9,
          "lost": 21,
          "gf": 28,
          "ga": 56,
          "gd": -28,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Stoke City",
          "played": 38,
          "won": 7,
          "drawn": 12,
          "lost": 19,
          "gf": 35,
          "ga": 68,
          "gd": -33,
          "points": 33,
          "rawPoints": 33,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 6,
          "drawn": 13,
          "lost": 19,
          "gf": 31,
          "ga": 56,
          "gd": -25,
          "points": 31,
          "rawPoints": 31,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2018-19",
      "startYear": 2018,
      "endYear": 2019,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 22,
      "goldenBootWinners": [
        {
          "player": "Pierre-Emerick Aubameyang",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 22
        },
        {
          "player": "Sadio Mané",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 22
        },
        {
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 22
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Pierre-Emerick Aubameyang",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Sadio Mané",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Sergio Agüero",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Raheem Sterling",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Eden Hazard",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Callum Wilson",
          "clubs": [
            "Bournemouth"
          ],
          "clubDisplay": "Bournemouth",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Raúl Jiménez",
          "clubs": [
            "Wolverhampton Wanderers"
          ],
          "clubDisplay": "Wolverhampton Wanderers",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Alexandre Lacazette",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Glenn Murray",
          "clubs": [
            "Brighton & Hove Albion"
          ],
          "clubDisplay": "Brighton & Hove Albion",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Paul Pogba",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Richarlison",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Gylfi Sigurðsson",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 32,
          "drawn": 2,
          "lost": 4,
          "gf": 95,
          "ga": 23,
          "gd": 72,
          "points": 98,
          "rawPoints": 98,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sergio Agüero",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Liverpool",
          "played": 38,
          "won": 30,
          "drawn": 7,
          "lost": 1,
          "gf": 89,
          "ga": 22,
          "gd": 67,
          "points": 97,
          "rawPoints": 97,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Sadio Mané / Mohamed Salah",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Chelsea",
          "played": 38,
          "won": 21,
          "drawn": 9,
          "lost": 8,
          "gf": 63,
          "ga": 39,
          "gd": 24,
          "points": 72,
          "rawPoints": 72,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Eden Hazard",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 23,
          "drawn": 2,
          "lost": 13,
          "gf": 67,
          "ga": 39,
          "gd": 28,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Arsenal",
          "played": 38,
          "won": 21,
          "drawn": 7,
          "lost": 10,
          "gf": 73,
          "ga": 51,
          "gd": 22,
          "points": 70,
          "rawPoints": 70,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Pierre-Emerick Aubameyang",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 6,
          "team": "Manchester United",
          "played": 38,
          "won": 19,
          "drawn": 9,
          "lost": 10,
          "gf": 65,
          "ga": 54,
          "gd": 11,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Paul Pogba",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 16,
          "drawn": 9,
          "lost": 13,
          "gf": 47,
          "ga": 46,
          "gd": 1,
          "points": 57,
          "rawPoints": 57,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Raúl Jiménez",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Everton",
          "played": 38,
          "won": 15,
          "drawn": 9,
          "lost": 14,
          "gf": 54,
          "ga": 46,
          "gd": 8,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Richarlison / Gylfi Sigurðsson",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Leicester City",
          "played": 38,
          "won": 15,
          "drawn": 7,
          "lost": 16,
          "gf": 51,
          "ga": 48,
          "gd": 3,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jamie Vardy",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "West Ham United",
          "played": 38,
          "won": 15,
          "drawn": 7,
          "lost": 16,
          "gf": 52,
          "ga": 55,
          "gd": -3,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Watford",
          "played": 38,
          "won": 14,
          "drawn": 8,
          "lost": 16,
          "gf": 52,
          "ga": 59,
          "gd": -7,
          "points": 50,
          "rawPoints": 50,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Crystal Palace",
          "played": 38,
          "won": 14,
          "drawn": 7,
          "lost": 17,
          "gf": 51,
          "ga": 53,
          "gd": -2,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Newcastle United",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 42,
          "ga": 48,
          "gd": -6,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Bournemouth",
          "played": 38,
          "won": 13,
          "drawn": 6,
          "lost": 19,
          "gf": 56,
          "ga": 70,
          "gd": -14,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Callum Wilson",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Burnley",
          "played": 38,
          "won": 11,
          "drawn": 7,
          "lost": 20,
          "gf": 45,
          "ga": 68,
          "gd": -23,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Southampton",
          "played": 38,
          "won": 9,
          "drawn": 12,
          "lost": 17,
          "gf": 45,
          "ga": 65,
          "gd": -20,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 35,
          "ga": 60,
          "gd": -25,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Glenn Murray",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Cardiff City",
          "played": 38,
          "won": 10,
          "drawn": 4,
          "lost": 24,
          "gf": 34,
          "ga": 69,
          "gd": -35,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Fulham",
          "played": 38,
          "won": 7,
          "drawn": 5,
          "lost": 26,
          "gf": 34,
          "ga": 81,
          "gd": -47,
          "points": 26,
          "rawPoints": 26,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Huddersfield Town",
          "played": 38,
          "won": 3,
          "drawn": 7,
          "lost": 28,
          "gf": 22,
          "ga": 76,
          "gd": -54,
          "points": 16,
          "rawPoints": 16,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2019-20",
      "startYear": 2019,
      "endYear": 2020,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 23,
      "goldenBootWinners": [
        {
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 23
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Pierre-Emerick Aubameyang",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Danny Ings",
          "clubs": [
            "Southampton"
          ],
          "clubDisplay": "Southampton",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Raheem Sterling",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Sadio Mané",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Raúl Jiménez",
          "clubs": [
            "Wolverhampton Wanderers"
          ],
          "clubDisplay": "Wolverhampton Wanderers",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Anthony Martial",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Marcus Rashford",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Liverpool",
          "played": 38,
          "won": 32,
          "drawn": 3,
          "lost": 3,
          "gf": 85,
          "ga": 33,
          "gd": 52,
          "points": 99,
          "rawPoints": 99,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester City",
          "played": 38,
          "won": 26,
          "drawn": 3,
          "lost": 9,
          "gf": 102,
          "ga": 35,
          "gd": 67,
          "points": 81,
          "rawPoints": 81,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Raheem Sterling",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Manchester United",
          "played": 38,
          "won": 18,
          "drawn": 12,
          "lost": 8,
          "gf": 66,
          "ga": 36,
          "gd": 30,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Anthony Martial / Marcus Rashford",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Chelsea",
          "played": 38,
          "won": 20,
          "drawn": 6,
          "lost": 12,
          "gf": 69,
          "ga": 54,
          "gd": 15,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Tammy Abraham",
            "goals": 15,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Leicester City",
          "played": 38,
          "won": 18,
          "drawn": 8,
          "lost": 12,
          "gf": 67,
          "ga": 41,
          "gd": 26,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jamie Vardy",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 6,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 16,
          "drawn": 11,
          "lost": 11,
          "gf": 61,
          "ga": 47,
          "gd": 14,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 15,
          "drawn": 14,
          "lost": 9,
          "gf": 51,
          "ga": 40,
          "gd": 11,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Raúl Jiménez",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Arsenal",
          "played": 38,
          "won": 14,
          "drawn": 14,
          "lost": 10,
          "gf": 56,
          "ga": 48,
          "gd": 8,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Pierre-Emerick Aubameyang",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Sheffield United",
          "played": 38,
          "won": 14,
          "drawn": 12,
          "lost": 12,
          "gf": 39,
          "ga": 39,
          "gd": 0,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Burnley",
          "played": 38,
          "won": 15,
          "drawn": 9,
          "lost": 14,
          "gf": 43,
          "ga": 50,
          "gd": -7,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Southampton",
          "played": 38,
          "won": 15,
          "drawn": 7,
          "lost": 16,
          "gf": 51,
          "ga": 60,
          "gd": -9,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Danny Ings",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Everton",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 44,
          "ga": 56,
          "gd": -12,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Newcastle United",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 38,
          "ga": 58,
          "gd": -20,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Crystal Palace",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 31,
          "ga": 50,
          "gd": -19,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 9,
          "drawn": 14,
          "lost": 15,
          "gf": 39,
          "ga": 54,
          "gd": -15,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "West Ham United",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 49,
          "ga": 62,
          "gd": -13,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Aston Villa",
          "played": 38,
          "won": 9,
          "drawn": 8,
          "lost": 21,
          "gf": 41,
          "ga": 67,
          "gd": -26,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Bournemouth",
          "played": 38,
          "won": 9,
          "drawn": 7,
          "lost": 22,
          "gf": 40,
          "ga": 65,
          "gd": -25,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Watford",
          "played": 38,
          "won": 8,
          "drawn": 10,
          "lost": 20,
          "gf": 36,
          "ga": 64,
          "gd": -28,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Norwich City",
          "played": 38,
          "won": 5,
          "drawn": 6,
          "lost": 27,
          "gf": 26,
          "ga": 75,
          "gd": -49,
          "points": 21,
          "rawPoints": 21,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2020-21",
      "startYear": 2020,
      "endYear": 2021,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 23,
      "goldenBootWinners": [
        {
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 23
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Bruno Fernandes",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Patrick Bamford",
          "clubs": [
            "Leeds United"
          ],
          "clubDisplay": "Leeds United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Son Heung-min",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Dominic Calvert-Lewin",
          "clubs": [
            "Everton"
          ],
          "clubDisplay": "Everton",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Ollie Watkins",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "İlkay Gündoğan",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 13,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Alexandre Lacazette",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 27,
          "drawn": 5,
          "lost": 6,
          "gf": 83,
          "ga": 32,
          "gd": 51,
          "points": 86,
          "rawPoints": 86,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "İlkay Gündoğan",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Manchester United",
          "played": 38,
          "won": 21,
          "drawn": 11,
          "lost": 6,
          "gf": 73,
          "ga": 44,
          "gd": 29,
          "points": 74,
          "rawPoints": 74,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Bruno Fernandes",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 20,
          "drawn": 9,
          "lost": 9,
          "gf": 68,
          "ga": 42,
          "gd": 26,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Chelsea",
          "played": 38,
          "won": 19,
          "drawn": 10,
          "lost": 9,
          "gf": 58,
          "ga": 36,
          "gd": 22,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jorginho",
            "goals": 7,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Leicester City",
          "played": 38,
          "won": 20,
          "drawn": 6,
          "lost": 12,
          "gf": 68,
          "ga": 50,
          "gd": 18,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jamie Vardy",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "West Ham United",
          "played": 38,
          "won": 19,
          "drawn": 8,
          "lost": 11,
          "gf": 62,
          "ga": 47,
          "gd": 15,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 18,
          "drawn": 8,
          "lost": 12,
          "gf": 68,
          "ga": 45,
          "gd": 23,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 8,
          "team": "Arsenal",
          "played": 38,
          "won": 18,
          "drawn": 7,
          "lost": 13,
          "gf": 55,
          "ga": 39,
          "gd": 16,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alexandre Lacazette",
            "goals": 13,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Leeds United",
          "played": 38,
          "won": 18,
          "drawn": 5,
          "lost": 15,
          "gf": 62,
          "ga": 54,
          "gd": 8,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Patrick Bamford",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Everton",
          "played": 38,
          "won": 17,
          "drawn": 8,
          "lost": 13,
          "gf": 47,
          "ga": 48,
          "gd": -1,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dominic Calvert-Lewin",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Aston Villa",
          "played": 38,
          "won": 16,
          "drawn": 7,
          "lost": 15,
          "gf": 55,
          "ga": 46,
          "gd": 9,
          "points": 55,
          "rawPoints": 55,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ollie Watkins",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Newcastle United",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 46,
          "ga": 62,
          "gd": -16,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 12,
          "drawn": 9,
          "lost": 17,
          "gf": 36,
          "ga": 52,
          "gd": -16,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Crystal Palace",
          "played": 38,
          "won": 12,
          "drawn": 8,
          "lost": 18,
          "gf": 41,
          "ga": 66,
          "gd": -25,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Southampton",
          "played": 38,
          "won": 12,
          "drawn": 7,
          "lost": 19,
          "gf": 47,
          "ga": 68,
          "gd": -21,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 9,
          "drawn": 14,
          "lost": 15,
          "gf": 40,
          "ga": 46,
          "gd": -6,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Burnley",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 33,
          "ga": 55,
          "gd": -22,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Fulham",
          "played": 38,
          "won": 5,
          "drawn": 13,
          "lost": 20,
          "gf": 27,
          "ga": 53,
          "gd": -26,
          "points": 28,
          "rawPoints": 28,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "West Bromwich Albion",
          "played": 38,
          "won": 5,
          "drawn": 11,
          "lost": 22,
          "gf": 35,
          "ga": 76,
          "gd": -41,
          "points": 26,
          "rawPoints": 26,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Sheffield United",
          "played": 38,
          "won": 7,
          "drawn": 2,
          "lost": 29,
          "gf": 20,
          "ga": 63,
          "gd": -43,
          "points": 23,
          "rawPoints": 23,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2021-22",
      "startYear": 2021,
      "endYear": 2022,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 23,
      "goldenBootWinners": [
        {
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 23
        },
        {
          "player": "Son Heung-min",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 23
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 1,
          "player": "Son Heung-min",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Cristiano Ronaldo",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Sadio Mané",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Kevin De Bruyne",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Diogo Jota",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Jamie Vardy",
          "clubs": [
            "Leicester City"
          ],
          "clubDisplay": "Leicester City",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Wilfried Zaha",
          "clubs": [
            "Crystal Palace"
          ],
          "clubDisplay": "Crystal Palace",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Raheem Sterling",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 13,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 29,
          "drawn": 6,
          "lost": 3,
          "gf": 99,
          "ga": 26,
          "gd": 73,
          "points": 93,
          "rawPoints": 93,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Kevin De Bruyne",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 2,
          "team": "Liverpool",
          "played": 38,
          "won": 28,
          "drawn": 8,
          "lost": 2,
          "gf": 94,
          "ga": 26,
          "gd": 68,
          "points": 92,
          "rawPoints": 92,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 3,
          "team": "Chelsea",
          "played": 38,
          "won": 21,
          "drawn": 11,
          "lost": 6,
          "gf": 76,
          "ga": 33,
          "gd": 43,
          "points": 74,
          "rawPoints": 74,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mason Mount",
            "goals": 11,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 22,
          "drawn": 5,
          "lost": 11,
          "gf": 69,
          "ga": 40,
          "gd": 29,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Son Heung-min",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 5,
          "team": "Arsenal",
          "played": 38,
          "won": 22,
          "drawn": 3,
          "lost": 13,
          "gf": 61,
          "ga": 48,
          "gd": 13,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Manchester United",
          "played": 38,
          "won": 16,
          "drawn": 10,
          "lost": 12,
          "gf": 57,
          "ga": 57,
          "gd": 0,
          "points": 58,
          "rawPoints": 58,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cristiano Ronaldo",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "West Ham United",
          "played": 38,
          "won": 16,
          "drawn": 8,
          "lost": 14,
          "gf": 60,
          "ga": 51,
          "gd": 9,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Leicester City",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 62,
          "ga": 59,
          "gd": 3,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jamie Vardy",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 12,
          "drawn": 15,
          "lost": 11,
          "gf": 42,
          "ga": 44,
          "gd": -2,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 15,
          "drawn": 6,
          "lost": 17,
          "gf": 38,
          "ga": 43,
          "gd": -5,
          "points": 51,
          "rawPoints": 51,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Newcastle United",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 44,
          "ga": 62,
          "gd": -18,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Crystal Palace",
          "played": 38,
          "won": 11,
          "drawn": 15,
          "lost": 12,
          "gf": 50,
          "ga": 46,
          "gd": 4,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Wilfried Zaha",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Brentford",
          "played": 38,
          "won": 13,
          "drawn": 7,
          "lost": 18,
          "gf": 48,
          "ga": 56,
          "gd": -8,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Aston Villa",
          "played": 38,
          "won": 13,
          "drawn": 6,
          "lost": 19,
          "gf": 52,
          "ga": 54,
          "gd": -2,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Southampton",
          "played": 38,
          "won": 9,
          "drawn": 13,
          "lost": 16,
          "gf": 43,
          "ga": 67,
          "gd": -24,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Everton",
          "played": 38,
          "won": 11,
          "drawn": 6,
          "lost": 21,
          "gf": 43,
          "ga": 66,
          "gd": -23,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Leeds United",
          "played": 38,
          "won": 9,
          "drawn": 11,
          "lost": 18,
          "gf": 42,
          "ga": 79,
          "gd": -37,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Burnley",
          "played": 38,
          "won": 7,
          "drawn": 14,
          "lost": 17,
          "gf": 34,
          "ga": 53,
          "gd": -19,
          "points": 35,
          "rawPoints": 35,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Watford",
          "played": 38,
          "won": 6,
          "drawn": 5,
          "lost": 27,
          "gf": 34,
          "ga": 77,
          "gd": -43,
          "points": 23,
          "rawPoints": 23,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Norwich City",
          "played": 38,
          "won": 5,
          "drawn": 7,
          "lost": 26,
          "gf": 23,
          "ga": 84,
          "gd": -61,
          "points": 22,
          "rawPoints": 22,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2022-23",
      "startYear": 2022,
      "endYear": 2023,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 36,
      "goldenBootWinners": [
        {
          "player": "Erling Haaland",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 36
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Erling Haaland",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 36,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Harry Kane",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 30,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Ivan Toney",
          "clubs": [
            "Brentford"
          ],
          "clubDisplay": "Brentford",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 5,
          "player": "Callum Wilson",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Marcus Rashford",
          "clubs": [
            "Manchester United"
          ],
          "clubDisplay": "Manchester United",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Gabriel Martinelli",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Martin Ødegaard",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Ollie Watkins",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Aleksandar Mitrović",
          "clubs": [
            "Fulham"
          ],
          "clubDisplay": "Fulham",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Bukayo Saka",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 28,
          "drawn": 5,
          "lost": 5,
          "gf": 94,
          "ga": 33,
          "gd": 61,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Erling Haaland",
            "goals": 36,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 26,
          "drawn": 6,
          "lost": 6,
          "gf": 88,
          "ga": 43,
          "gd": 45,
          "points": 84,
          "rawPoints": 84,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Gabriel Martinelli / Martin Ødegaard",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Manchester United",
          "played": 38,
          "won": 23,
          "drawn": 6,
          "lost": 9,
          "gf": 58,
          "ga": 43,
          "gd": 15,
          "points": 75,
          "rawPoints": 75,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Marcus Rashford",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Newcastle United",
          "played": 38,
          "won": 19,
          "drawn": 14,
          "lost": 5,
          "gf": 68,
          "ga": 33,
          "gd": 35,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Callum Wilson",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Liverpool",
          "played": 38,
          "won": 19,
          "drawn": 10,
          "lost": 9,
          "gf": 75,
          "ga": 47,
          "gd": 28,
          "points": 67,
          "rawPoints": 67,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 18,
          "drawn": 8,
          "lost": 12,
          "gf": 72,
          "ga": 53,
          "gd": 19,
          "points": 62,
          "rawPoints": 62,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Aston Villa",
          "played": 38,
          "won": 18,
          "drawn": 7,
          "lost": 13,
          "gf": 51,
          "ga": 46,
          "gd": 5,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ollie Watkins",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 18,
          "drawn": 6,
          "lost": 14,
          "gf": 70,
          "ga": 63,
          "gd": 7,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Harry Kane",
            "goals": 30,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Brentford",
          "played": 38,
          "won": 15,
          "drawn": 14,
          "lost": 9,
          "gf": 58,
          "ga": 46,
          "gd": 12,
          "points": 59,
          "rawPoints": 59,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ivan Toney",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Fulham",
          "played": 38,
          "won": 15,
          "drawn": 7,
          "lost": 16,
          "gf": 55,
          "ga": 53,
          "gd": 2,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Aleksandar Mitrović",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Crystal Palace",
          "played": 38,
          "won": 11,
          "drawn": 12,
          "lost": 15,
          "gf": 40,
          "ga": 49,
          "gd": -9,
          "points": 45,
          "rawPoints": 45,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Chelsea",
          "played": 38,
          "won": 11,
          "drawn": 11,
          "lost": 16,
          "gf": 38,
          "ga": 47,
          "gd": -9,
          "points": 44,
          "rawPoints": 44,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 11,
          "drawn": 8,
          "lost": 19,
          "gf": 31,
          "ga": 58,
          "gd": -27,
          "points": 41,
          "rawPoints": 41,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "West Ham United",
          "played": 38,
          "won": 11,
          "drawn": 7,
          "lost": 20,
          "gf": 42,
          "ga": 55,
          "gd": -13,
          "points": 40,
          "rawPoints": 40,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Bournemouth",
          "played": 38,
          "won": 11,
          "drawn": 6,
          "lost": 21,
          "gf": 37,
          "ga": 71,
          "gd": -34,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Nottingham Forest",
          "played": 38,
          "won": 9,
          "drawn": 11,
          "lost": 18,
          "gf": 38,
          "ga": 68,
          "gd": -30,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Everton",
          "played": 38,
          "won": 8,
          "drawn": 12,
          "lost": 18,
          "gf": 34,
          "ga": 57,
          "gd": -23,
          "points": 36,
          "rawPoints": 36,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Leicester City",
          "played": 38,
          "won": 9,
          "drawn": 7,
          "lost": 22,
          "gf": 51,
          "ga": 68,
          "gd": -17,
          "points": 34,
          "rawPoints": 34,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Leeds United",
          "played": 38,
          "won": 7,
          "drawn": 10,
          "lost": 21,
          "gf": 48,
          "ga": 78,
          "gd": -30,
          "points": 31,
          "rawPoints": 31,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Southampton",
          "played": 38,
          "won": 6,
          "drawn": 7,
          "lost": 25,
          "gf": 36,
          "ga": 73,
          "gd": -37,
          "points": 25,
          "rawPoints": 25,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2023-24",
      "startYear": 2023,
      "endYear": 2024,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 27,
      "goldenBootWinners": [
        {
          "player": "Erling Haaland",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 27
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Erling Haaland",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 27,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Cole Palmer",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Alexander Isak",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 21,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Phil Foden",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Dominic Solanke",
          "clubs": [
            "Bournemouth"
          ],
          "clubDisplay": "Bournemouth",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Ollie Watkins",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 18,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Son Heung-min",
          "clubs": [
            "Tottenham Hotspur"
          ],
          "clubDisplay": "Tottenham Hotspur",
          "goals": 17,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Jarrod Bowen",
          "clubs": [
            "West Ham United"
          ],
          "clubDisplay": "West Ham United",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Jean-Philippe Mateta",
          "clubs": [
            "Crystal Palace"
          ],
          "clubDisplay": "Crystal Palace",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 9,
          "player": "Bukayo Saka",
          "clubs": [
            "Arsenal"
          ],
          "clubDisplay": "Arsenal",
          "goals": 16,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Manchester City",
          "played": 38,
          "won": 28,
          "drawn": 7,
          "lost": 3,
          "gf": 96,
          "ga": 34,
          "gd": 62,
          "points": 91,
          "rawPoints": 91,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Erling Haaland",
            "goals": 27,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 28,
          "drawn": 5,
          "lost": 5,
          "gf": 91,
          "ga": 29,
          "gd": 62,
          "points": 89,
          "rawPoints": 89,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Bukayo Saka",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Liverpool",
          "played": 38,
          "won": 24,
          "drawn": 10,
          "lost": 4,
          "gf": 86,
          "ga": 41,
          "gd": 45,
          "points": 82,
          "rawPoints": 82,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 18,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Aston Villa",
          "played": 38,
          "won": 20,
          "drawn": 8,
          "lost": 10,
          "gf": 76,
          "ga": 61,
          "gd": 15,
          "points": 68,
          "rawPoints": 68,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ollie Watkins",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 20,
          "drawn": 6,
          "lost": 12,
          "gf": 74,
          "ga": 61,
          "gd": 13,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Son Heung-min",
            "goals": 17,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Chelsea",
          "played": 38,
          "won": 18,
          "drawn": 9,
          "lost": 11,
          "gf": 77,
          "ga": 63,
          "gd": 14,
          "points": 63,
          "rawPoints": 63,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cole Palmer",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Newcastle United",
          "played": 38,
          "won": 18,
          "drawn": 6,
          "lost": 14,
          "gf": 85,
          "ga": 62,
          "gd": 23,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alexander Isak",
            "goals": 21,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Manchester United",
          "played": 38,
          "won": 18,
          "drawn": 6,
          "lost": 14,
          "gf": 57,
          "ga": 58,
          "gd": -1,
          "points": 60,
          "rawPoints": 60,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "West Ham United",
          "played": 38,
          "won": 14,
          "drawn": 10,
          "lost": 14,
          "gf": 60,
          "ga": 74,
          "gd": -14,
          "points": 52,
          "rawPoints": 52,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jarrod Bowen",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Crystal Palace",
          "played": 38,
          "won": 13,
          "drawn": 10,
          "lost": 15,
          "gf": 57,
          "ga": 58,
          "gd": -1,
          "points": 49,
          "rawPoints": 49,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jean-Philippe Mateta",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 12,
          "drawn": 12,
          "lost": 14,
          "gf": 55,
          "ga": 62,
          "gd": -7,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Bournemouth",
          "played": 38,
          "won": 13,
          "drawn": 9,
          "lost": 16,
          "gf": 54,
          "ga": 67,
          "gd": -13,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Dominic Solanke",
            "goals": 19,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Fulham",
          "played": 38,
          "won": 13,
          "drawn": 8,
          "lost": 17,
          "gf": 55,
          "ga": 61,
          "gd": -6,
          "points": 47,
          "rawPoints": 47,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 13,
          "drawn": 7,
          "lost": 18,
          "gf": 50,
          "ga": 65,
          "gd": -15,
          "points": 46,
          "rawPoints": 46,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Everton",
          "played": 38,
          "won": 13,
          "drawn": 9,
          "lost": 16,
          "gf": 40,
          "ga": 51,
          "gd": -11,
          "points": 40,
          "rawPoints": 48,
          "pointsDeducted": 8,
          "deductionReason": "Profitability and Sustainability Rules (PSR) breaches (6 + 2 points)",
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Brentford",
          "played": 38,
          "won": 10,
          "drawn": 9,
          "lost": 19,
          "gf": 56,
          "ga": 65,
          "gd": -9,
          "points": 39,
          "rawPoints": 39,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Nottingham Forest",
          "played": 38,
          "won": 9,
          "drawn": 9,
          "lost": 20,
          "gf": 49,
          "ga": 67,
          "gd": -18,
          "points": 32,
          "rawPoints": 36,
          "pointsDeducted": 4,
          "deductionReason": "Profitability and Sustainability Rules (PSR) breach",
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Luton Town",
          "played": 38,
          "won": 6,
          "drawn": 8,
          "lost": 24,
          "gf": 52,
          "ga": 85,
          "gd": -33,
          "points": 26,
          "rawPoints": 26,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Burnley",
          "played": 38,
          "won": 5,
          "drawn": 9,
          "lost": 24,
          "gf": 41,
          "ga": 78,
          "gd": -37,
          "points": 24,
          "rawPoints": 24,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Sheffield United",
          "played": 38,
          "won": 3,
          "drawn": 7,
          "lost": 28,
          "gf": 35,
          "ga": 104,
          "gd": -69,
          "points": 16,
          "rawPoints": 16,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    },
    {
      "season": "2024-25",
      "startYear": 2024,
      "endYear": 2025,
      "teamCount": 20,
      "gamesPerTeam": 38,
      "relegationLinePos": 18,
      "survivalLinePos": 17,
      "goldenBootGoals": 29,
      "goldenBootWinners": [
        {
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 29
        }
      ],
      "topScorers": [
        {
          "rank": 1,
          "player": "Mohamed Salah",
          "clubs": [
            "Liverpool"
          ],
          "clubDisplay": "Liverpool",
          "goals": 29,
          "clubBreakdown": null
        },
        {
          "rank": 2,
          "player": "Alexander Isak",
          "clubs": [
            "Newcastle United"
          ],
          "clubDisplay": "Newcastle United",
          "goals": 23,
          "clubBreakdown": null
        },
        {
          "rank": 3,
          "player": "Erling Haaland",
          "clubs": [
            "Manchester City"
          ],
          "clubDisplay": "Manchester City",
          "goals": 22,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Bryan Mbeumo",
          "clubs": [
            "Brentford"
          ],
          "clubDisplay": "Brentford",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 4,
          "player": "Chris Wood",
          "clubs": [
            "Nottingham Forest"
          ],
          "clubDisplay": "Nottingham Forest",
          "goals": 20,
          "clubBreakdown": null
        },
        {
          "rank": 6,
          "player": "Yoane Wissa",
          "clubs": [
            "Brentford"
          ],
          "clubDisplay": "Brentford",
          "goals": 19,
          "clubBreakdown": null
        },
        {
          "rank": 7,
          "player": "Ollie Watkins",
          "clubs": [
            "Aston Villa"
          ],
          "clubDisplay": "Aston Villa",
          "goals": 16,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Matheus Cunha",
          "clubs": [
            "Wolverhampton Wanderers"
          ],
          "clubDisplay": "Wolverhampton Wanderers",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 8,
          "player": "Cole Palmer",
          "clubs": [
            "Chelsea"
          ],
          "clubDisplay": "Chelsea",
          "goals": 15,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Jørgen Strand Larsen",
          "clubs": [
            "Wolverhampton Wanderers"
          ],
          "clubDisplay": "Wolverhampton Wanderers",
          "goals": 14,
          "clubBreakdown": null
        },
        {
          "rank": 10,
          "player": "Jean-Philippe Mateta",
          "clubs": [
            "Crystal Palace"
          ],
          "clubDisplay": "Crystal Palace",
          "goals": 14,
          "clubBreakdown": null
        }
      ],
      "table": [
        {
          "pos": 1,
          "team": "Liverpool",
          "played": 38,
          "won": 25,
          "drawn": 9,
          "lost": 4,
          "gf": 86,
          "ga": 41,
          "gd": 45,
          "points": 84,
          "rawPoints": 84,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Mohamed Salah",
            "goals": 29,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": true
        },
        {
          "pos": 2,
          "team": "Arsenal",
          "played": 38,
          "won": 20,
          "drawn": 14,
          "lost": 4,
          "gf": 69,
          "ga": 34,
          "gd": 35,
          "points": 74,
          "rawPoints": 74,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Kai Havertz",
            "goals": 9,
            "inLeagueTop10": false
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 3,
          "team": "Manchester City",
          "played": 38,
          "won": 21,
          "drawn": 8,
          "lost": 9,
          "gf": 72,
          "ga": 44,
          "gd": 28,
          "points": 71,
          "rawPoints": 71,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Erling Haaland",
            "goals": 22,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 4,
          "team": "Chelsea",
          "played": 38,
          "won": 20,
          "drawn": 9,
          "lost": 9,
          "gf": 64,
          "ga": 43,
          "gd": 21,
          "points": 69,
          "rawPoints": 69,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Cole Palmer",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 5,
          "team": "Newcastle United",
          "played": 38,
          "won": 20,
          "drawn": 6,
          "lost": 12,
          "gf": 68,
          "ga": 47,
          "gd": 21,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Alexander Isak",
            "goals": 23,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 6,
          "team": "Aston Villa",
          "played": 38,
          "won": 19,
          "drawn": 9,
          "lost": 10,
          "gf": 58,
          "ga": 51,
          "gd": 7,
          "points": 66,
          "rawPoints": 66,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Ollie Watkins",
            "goals": 16,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 7,
          "team": "Nottingham Forest",
          "played": 38,
          "won": 19,
          "drawn": 8,
          "lost": 11,
          "gf": 58,
          "ga": 46,
          "gd": 12,
          "points": 65,
          "rawPoints": 65,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Chris Wood",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 8,
          "team": "Brighton & Hove Albion",
          "played": 38,
          "won": 16,
          "drawn": 13,
          "lost": 9,
          "gf": 66,
          "ga": 59,
          "gd": 7,
          "points": 61,
          "rawPoints": 61,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 9,
          "team": "Bournemouth",
          "played": 38,
          "won": 15,
          "drawn": 11,
          "lost": 12,
          "gf": 58,
          "ga": 46,
          "gd": 12,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 10,
          "team": "Brentford",
          "played": 38,
          "won": 16,
          "drawn": 8,
          "lost": 14,
          "gf": 66,
          "ga": 57,
          "gd": 9,
          "points": 56,
          "rawPoints": 56,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Bryan Mbeumo",
            "goals": 20,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 11,
          "team": "Fulham",
          "played": 38,
          "won": 15,
          "drawn": 9,
          "lost": 14,
          "gf": 54,
          "ga": 54,
          "gd": 0,
          "points": 54,
          "rawPoints": 54,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 12,
          "team": "Crystal Palace",
          "played": 38,
          "won": 13,
          "drawn": 14,
          "lost": 11,
          "gf": 51,
          "ga": 51,
          "gd": 0,
          "points": 53,
          "rawPoints": 53,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Jean-Philippe Mateta",
            "goals": 14,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 13,
          "team": "Everton",
          "played": 38,
          "won": 11,
          "drawn": 15,
          "lost": 12,
          "gf": 42,
          "ga": 44,
          "gd": -2,
          "points": 48,
          "rawPoints": 48,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 14,
          "team": "West Ham United",
          "played": 38,
          "won": 11,
          "drawn": 10,
          "lost": 17,
          "gf": 46,
          "ga": 62,
          "gd": -16,
          "points": 43,
          "rawPoints": 43,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 15,
          "team": "Manchester United",
          "played": 38,
          "won": 11,
          "drawn": 9,
          "lost": 18,
          "gf": 44,
          "ga": 54,
          "gd": -10,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 16,
          "team": "Wolverhampton Wanderers",
          "played": 38,
          "won": 12,
          "drawn": 6,
          "lost": 20,
          "gf": 54,
          "ga": 69,
          "gd": -15,
          "points": 42,
          "rawPoints": 42,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": {
            "player": "Matheus Cunha",
            "goals": 15,
            "inLeagueTop10": true
          },
          "hasGoldenBootWinner": false
        },
        {
          "pos": 17,
          "team": "Tottenham Hotspur",
          "played": 38,
          "won": 11,
          "drawn": 5,
          "lost": 22,
          "gf": 64,
          "ga": 65,
          "gd": -1,
          "points": 38,
          "rawPoints": 38,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": false,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 18,
          "team": "Leicester City",
          "played": 38,
          "won": 6,
          "drawn": 7,
          "lost": 25,
          "gf": 33,
          "ga": 80,
          "gd": -47,
          "points": 25,
          "rawPoints": 25,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 19,
          "team": "Ipswich Town",
          "played": 38,
          "won": 4,
          "drawn": 10,
          "lost": 24,
          "gf": 36,
          "ga": 82,
          "gd": -46,
          "points": 22,
          "rawPoints": 22,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        },
        {
          "pos": 20,
          "team": "Southampton",
          "played": 38,
          "won": 2,
          "drawn": 6,
          "lost": 30,
          "gf": 26,
          "ga": 86,
          "gd": -60,
          "points": 12,
          "rawPoints": 12,
          "pointsDeducted": 0,
          "deductionReason": null,
          "relegated": true,
          "topScorer": null,
          "hasGoldenBootWinner": false
        }
      ]
    }
  ]
};
