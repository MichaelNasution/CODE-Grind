"""
mock_data.py
============
Fallback engine with structured mock data v5.0 (Advanced Sabermetrics).
8-matchup slate optimized for color-coded trust system demo.
New fields: siera, xfip, k_pct, bb_per9 (pitchers); wrc_plus_7d, iso_7d (team batting 7d); bullpen_xfip, bullpen_status.

Teams covered:
  HIGH TRUST   (>= 65%): PHI, LAD
  MEDIUM TRUST (58-64%): MIL, CHC
  PASS/BORDER  (50-57%): NYY, CLE, HOU, BAL
  SLUMP DEMO   (<wRC+ 85): MIA, PIT (offensive slump, fatal penalty active)
"""

from __future__ import annotations

# ==============================================================================
# MOCK: 8-MATCH SLATE  (16 teams, 8 games)
# ==============================================================================
MOCK_GAMES: list[dict] = [
    {
        "game_id": 9001,
        "home_team": "New York Yankees", "away_team": "Boston Red Sox",
        "home_team_id": 147, "away_team_id": 111,
        "venue": "Yankee Stadium",
        "game_datetime": "2026-08-08T23:05:00Z",
        "home_starter_id": 1001, "away_starter_id": 1002,
        "home_starter_name": "Gerrit Cole", "away_starter_name": "Brayan Bello",
    },
    {
        "game_id": 9002,
        "home_team": "Philadelphia Phillies", "away_team": "Miami Marlins",
        "home_team_id": 143, "away_team_id": 146,
        "venue": "Citizens Bank Park",
        "game_datetime": "2026-08-08T23:05:00Z",
        "home_starter_id": 1015, "away_starter_id": 1026,
        "home_starter_name": "Zack Wheeler", "away_starter_name": "Sandy Alcantara",
    },
    {
        "game_id": 9003,
        "home_team": "Milwaukee Brewers", "away_team": "St. Louis Cardinals",
        "home_team_id": 158, "away_team_id": 138,
        "venue": "American Family Field",
        "game_datetime": "2026-08-09T00:10:00Z",
        "home_starter_id": 1017, "away_starter_id": 1018,
        "home_starter_name": "Freddy Peralta", "away_starter_name": "Miles Mikolas",
    },
    {
        "game_id": 9004,
        "home_team": "Houston Astros", "away_team": "Texas Rangers",
        "home_team_id": 117, "away_team_id": 140,
        "venue": "Minute Maid Park",
        "game_datetime": "2026-08-09T00:10:00Z",
        "home_starter_id": 1005, "away_starter_id": 1006,
        "home_starter_name": "Framber Valdez", "away_starter_name": "Nathan Eovaldi",
    },
    {
        "game_id": 9005,
        "home_team": "Cleveland Guardians", "away_team": "Detroit Tigers",
        "home_team_id": 114, "away_team_id": 116,
        "venue": "Progressive Field",
        "game_datetime": "2026-08-08T23:10:00Z",
        "home_starter_id": 1011, "away_starter_id": 1012,
        "home_starter_name": "Shane Bieber", "away_starter_name": "Eduardo Rodriguez",
    },
    {
        "game_id": 9006,
        "home_team": "Chicago Cubs", "away_team": "Pittsburgh Pirates",
        "home_team_id": 112, "away_team_id": 134,
        "venue": "Wrigley Field",
        "game_datetime": "2026-08-09T00:05:00Z",
        "home_starter_id": 1010, "away_starter_id": 1028,
        "home_starter_name": "Justin Steele", "away_starter_name": "Mitch Keller",
    },
    {
        "game_id": 9007,
        "home_team": "Los Angeles Dodgers", "away_team": "San Diego Padres",
        "home_team_id": 119, "away_team_id": 135,
        "venue": "Dodger Stadium",
        "game_datetime": "2026-08-09T02:10:00Z",
        "home_starter_id": 1003, "away_starter_id": 1021,
        "home_starter_name": "Tyler Glasnow", "away_starter_name": "Yu Darvish",
    },
    {
        "game_id": 9008,
        "home_team": "Baltimore Orioles", "away_team": "Toronto Blue Jays",
        "home_team_id": 110, "away_team_id": 141,
        "venue": "Camden Yards",
        "game_datetime": "2026-08-08T23:05:00Z",
        "home_starter_id": 1024, "away_starter_id": 1013,
        "home_starter_name": "Dean Kremer", "away_starter_name": "Kevin Gausman",
    },
]

# ==============================================================================
# LINE SHOPPING DATA
# ==============================================================================
MOCK_LINE_SHOPPING: dict[int, dict] = {
    9001: {
        "DraftKings": {"home_ml": -140, "away_ml": +120},
        "BetMGM":     {"home_ml": -145, "away_ml": +125},
        "Caesars":    {"home_ml": -138, "away_ml": +118},
        "FanDuel":    {"home_ml": -142, "away_ml": +122},
        "ESPN Bet":   {"home_ml": -140, "away_ml": +120},
    },
    9002: {
        "DraftKings": {"home_ml": -215, "away_ml": +180},
        "BetMGM":     {"home_ml": -220, "away_ml": +185},
        "Caesars":    {"home_ml": -210, "away_ml": +175},
        "FanDuel":    {"home_ml": -215, "away_ml": +180},
        "ESPN Bet":   {"home_ml": -218, "away_ml": +182},
    },
    9003: {
        "DraftKings": {"home_ml": -162, "away_ml": +138},
        "BetMGM":     {"home_ml": -165, "away_ml": +140},
        "Caesars":    {"home_ml": -160, "away_ml": +135},
        "FanDuel":    {"home_ml": -162, "away_ml": +138},
        "ESPN Bet":   {"home_ml": -163, "away_ml": +139},
    },
    9004: {
        "DraftKings": {"home_ml": -145, "away_ml": +125},
        "BetMGM":     {"home_ml": -148, "away_ml": +128},
        "Caesars":    {"home_ml": -142, "away_ml": +122},
        "FanDuel":    {"home_ml": -145, "away_ml": +125},
        "ESPN Bet":   {"home_ml": -147, "away_ml": +127},
    },
    9005: {
        "DraftKings": {"home_ml": -138, "away_ml": +118},
        "BetMGM":     {"home_ml": -140, "away_ml": +120},
        "Caesars":    {"home_ml": -135, "away_ml": +115},
        "FanDuel":    {"home_ml": -138, "away_ml": +118},
        "ESPN Bet":   {"home_ml": -139, "away_ml": +119},
    },
    9006: {
        "DraftKings": {"home_ml": -178, "away_ml": +150},
        "BetMGM":     {"home_ml": -180, "away_ml": +155},
        "Caesars":    {"home_ml": -175, "away_ml": +148},
        "FanDuel":    {"home_ml": -178, "away_ml": +150},
        "ESPN Bet":   {"home_ml": -177, "away_ml": +151},
    },
    9007: {
        "DraftKings": {"home_ml": -170, "away_ml": +145},
        "BetMGM":     {"home_ml": -175, "away_ml": +150},
        "Caesars":    {"home_ml": -168, "away_ml": +142},
        "FanDuel":    {"home_ml": -170, "away_ml": +145},
        "ESPN Bet":   {"home_ml": -172, "away_ml": +147},
    },
    9008: {
        "DraftKings": {"home_ml": -115, "away_ml": -105},
        "BetMGM":     {"home_ml": -118, "away_ml": -102},
        "Caesars":    {"home_ml": -112, "away_ml": -108},
        "FanDuel":    {"home_ml": -115, "away_ml": -105},
        "ESPN Bet":   {"home_ml": -115, "away_ml": -105},
    },
}

# ==============================================================================
# PITCHER STATS — Curated for proper WIN CONF distribution
# Includes Advanced Sabermetrics: siera, xfip, k_pct, bb_per9
# ==============================================================================
MOCK_PITCHER_STATS: dict[int, dict] = {
    # NYY — GERRIT COLE (solid, not dominant)
    1001: {
        "pitcher_id": 1001, "full_name": "Gerrit Cole",
        "team": "New York Yankees", "team_id": 147,
        "era": 2.85, "last5_era": 2.70, "last3_era": 2.60,
        "whip": 0.97, "hr_per9": 0.65, "k_per9": 11.2,
        "innings_pitched": 112.0, "throws": "R",
        # Advanced Sabermetrics
        "siera": 3.10, "xfip": 2.95, "k_pct": 0.310, "bb_per9": 2.1,
    },
    # BOS — BRAYAN BELLO
    1002: {
        "pitcher_id": 1002, "full_name": "Brayan Bello",
        "team": "Boston Red Sox", "team_id": 111,
        "era": 2.75, "last5_era": 2.55, "last3_era": 2.35,
        "whip": 0.95, "hr_per9": 0.60, "k_per9": 9.8,
        "innings_pitched": 105.0, "throws": "R",
        "siera": 3.25, "xfip": 3.10, "k_pct": 0.272, "bb_per9": 2.5,
    },
    # PHI — ZACK WHEELER (elite)
    1015: {
        "pitcher_id": 1015, "full_name": "Zack Wheeler",
        "team": "Philadelphia Phillies", "team_id": 143,
        "era": 2.95, "last5_era": 2.60, "last3_era": 2.30,
        "whip": 0.98, "hr_per9": 0.70, "k_per9": 10.4,
        "innings_pitched": 114.0, "throws": "R",
        "siera": 2.92, "xfip": 2.85, "k_pct": 0.290, "bb_per9": 2.2,
    },
    # MIA opp SP — Sandy Alcantara (declining)
    1026: {
        "pitcher_id": 1026, "full_name": "Sandy Alcantara",
        "team": "Miami Marlins", "team_id": 146,
        "era": 5.10, "last5_era": 5.40, "last3_era": 5.80,
        "whip": 1.55, "hr_per9": 1.45, "k_per9": 6.1,
        "innings_pitched": 88.0, "throws": "R",
        "siera": 5.20, "xfip": 5.05, "k_pct": 0.170, "bb_per9": 4.2,  # high walks
    },
    # MIL — FREDDY PERALTA
    1017: {
        "pitcher_id": 1017, "full_name": "Freddy Peralta",
        "team": "Milwaukee Brewers", "team_id": 158,
        "era": 3.35, "last5_era": 3.15, "last3_era": 3.10,
        "whip": 1.08, "hr_per9": 0.80, "k_per9": 10.5,
        "innings_pitched": 106.0, "throws": "R",
        "siera": 3.22, "xfip": 3.18, "k_pct": 0.292, "bb_per9": 3.1,
    },
    # STL opp SP — Miles Mikolas (mediocre)
    1018: {
        "pitcher_id": 1018, "full_name": "Miles Mikolas",
        "team": "St. Louis Cardinals", "team_id": 138,
        "era": 4.70, "last5_era": 4.90, "last3_era": 5.10,
        "whip": 1.32, "hr_per9": 1.15, "k_per9": 6.8,
        "innings_pitched": 92.0, "throws": "R",
        "siera": 4.60, "xfip": 4.55, "k_pct": 0.190, "bb_per9": 2.8,
    },
    # HOU — FRAMBER VALDEZ
    1005: {
        "pitcher_id": 1005, "full_name": "Framber Valdez",
        "team": "Houston Astros", "team_id": 117,
        "era": 3.15, "last5_era": 2.90, "last3_era": 2.80,
        "whip": 1.14, "hr_per9": 0.62, "k_per9": 8.8,
        "innings_pitched": 118.0, "throws": "L",
        "siera": 3.08, "xfip": 3.02, "k_pct": 0.244, "bb_per9": 3.4,
    },
    # TEX opp SP — Nathan Eovaldi (wildcard)
    1006: {
        "pitcher_id": 1006, "full_name": "Nathan Eovaldi",
        "team": "Texas Rangers", "team_id": 140,
        "era": 3.85, "last5_era": 3.70, "last3_era": 3.50,
        "whip": 1.20, "hr_per9": 1.10, "k_per9": 8.4,
        "innings_pitched": 98.0, "throws": "R",
        "siera": 3.90, "xfip": 3.78, "k_pct": 0.234, "bb_per9": 2.8,
    },
    # CLE — SHANE BIEBER
    1011: {
        "pitcher_id": 1011, "full_name": "Shane Bieber",
        "team": "Cleveland Guardians", "team_id": 114,
        "era": 3.40, "last5_era": 3.20, "last3_era": 3.00,
        "whip": 1.05, "hr_per9": 0.75, "k_per9": 9.8,
        "innings_pitched": 108.0, "throws": "R",
        "siera": 3.28, "xfip": 3.22, "k_pct": 0.272, "bb_per9": 1.8,
    },
    # DET opp SP — Eduardo Rodriguez
    1012: {
        "pitcher_id": 1012, "full_name": "Eduardo Rodriguez",
        "team": "Detroit Tigers", "team_id": 116,
        "era": 4.55, "last5_era": 4.75, "last3_era": 4.95,
        "whip": 1.38, "hr_per9": 1.18, "k_per9": 7.5,
        "innings_pitched": 92.0, "throws": "L",
        "siera": 4.48, "xfip": 4.40, "k_pct": 0.208, "bb_per9": 3.8,
    },
    # CHC — JUSTIN STEELE
    1010: {
        "pitcher_id": 1010, "full_name": "Justin Steele",
        "team": "Chicago Cubs", "team_id": 112,
        "era": 3.10, "last5_era": 2.90, "last3_era": 2.70,
        "whip": 1.08, "hr_per9": 0.88, "k_per9": 9.2,
        "innings_pitched": 102.0, "throws": "L",
        "siera": 3.05, "xfip": 2.98, "k_pct": 0.256, "bb_per9": 2.9,
    },
    # PIT opp SP — Mitch Keller
    1028: {
        "pitcher_id": 1028, "full_name": "Mitch Keller",
        "team": "Pittsburgh Pirates", "team_id": 134,
        "era": 4.20, "last5_era": 4.45, "last3_era": 4.65,
        "whip": 1.30, "hr_per9": 1.20, "k_per9": 8.0,
        "innings_pitched": 95.0, "throws": "R",
        "siera": 4.10, "xfip": 4.05, "k_pct": 0.222, "bb_per9": 3.5,
    },
    # LAD — TYLER GLASNOW
    1003: {
        "pitcher_id": 1003, "full_name": "Tyler Glasnow",
        "team": "Los Angeles Dodgers", "team_id": 119,
        "era": 2.90, "last5_era": 2.65, "last3_era": 2.40,
        "whip": 0.98, "hr_per9": 0.72, "k_per9": 11.8,
        "innings_pitched": 105.0, "throws": "R",
        "siera": 2.80, "xfip": 2.75, "k_pct": 0.328, "bb_per9": 2.4,
    },
    # SD opp SP — Yu Darvish
    1021: {
        "pitcher_id": 1021, "full_name": "Yu Darvish",
        "team": "San Diego Padres", "team_id": 135,
        "era": 4.20, "last5_era": 4.40, "last3_era": 4.60,
        "whip": 1.22, "hr_per9": 1.05, "k_per9": 9.0,
        "innings_pitched": 97.0, "throws": "R",
        "siera": 4.05, "xfip": 4.00, "k_pct": 0.250, "bb_per9": 2.5,
    },
    # BAL — DEAN KREMER
    1024: {
        "pitcher_id": 1024, "full_name": "Dean Kremer",
        "team": "Baltimore Orioles", "team_id": 110,
        "era": 3.75, "last5_era": 3.80, "last3_era": 3.70,
        "whip": 1.20, "hr_per9": 0.88, "k_per9": 8.4,
        "innings_pitched": 97.0, "throws": "R",
        "siera": 3.72, "xfip": 3.68, "k_pct": 0.234, "bb_per9": 2.9,
    },
    # TOR opp SP — Kevin Gausman
    1013: {
        "pitcher_id": 1013, "full_name": "Kevin Gausman",
        "team": "Toronto Blue Jays", "team_id": 141,
        "era": 3.55, "last5_era": 3.45, "last3_era": 3.30,
        "whip": 1.12, "hr_per9": 0.90, "k_per9": 9.5,
        "innings_pitched": 100.0, "throws": "R",
        "siera": 3.42, "xfip": 3.38, "k_pct": 0.264, "bb_per9": 2.0,
    },
}

# ==============================================================================
# BULLPEN STATS (Added: bullpen_xfip, bullpen_status)
# ==============================================================================
MOCK_BULLPEN_STATS: dict[int, dict] = {
    147: {"team": "New York Yankees",       "bullpen_era": 3.40, "whip": 1.18, "bullpen_xfip": 3.45, "bullpen_status": "SOLID"},
    111: {"team": "Boston Red Sox",         "bullpen_era": 3.50, "whip": 1.15, "bullpen_xfip": 3.55, "bullpen_status": "SOLID"},
    143: {"team": "Philadelphia Phillies",  "bullpen_era": 3.25, "whip": 1.10, "bullpen_xfip": 3.20, "bullpen_status": "ELITE"},
    146: {"team": "Miami Marlins",          "bullpen_era": 4.60, "whip": 1.42, "bullpen_xfip": 4.70, "bullpen_status": "BOTTOM-10"},
    158: {"team": "Milwaukee Brewers",      "bullpen_era": 3.45, "whip": 1.14, "bullpen_xfip": 3.48, "bullpen_status": "SOLID"},
    138: {"team": "St. Louis Cardinals",    "bullpen_era": 4.20, "whip": 1.32, "bullpen_xfip": 4.25, "bullpen_status": "WEAK"},
    117: {"team": "Houston Astros",         "bullpen_era": 3.20, "whip": 1.10, "bullpen_xfip": 3.18, "bullpen_status": "ELITE"},
    140: {"team": "Texas Rangers",          "bullpen_era": 3.75, "whip": 1.22, "bullpen_xfip": 3.80, "bullpen_status": "SOLID"},
    114: {"team": "Cleveland Guardians",    "bullpen_era": 3.55, "whip": 1.15, "bullpen_xfip": 3.58, "bullpen_status": "SOLID"},
    116: {"team": "Detroit Tigers",         "bullpen_era": 4.30, "whip": 1.38, "bullpen_xfip": 4.35, "bullpen_status": "WEAK"},
    112: {"team": "Chicago Cubs",           "bullpen_era": 3.90, "whip": 1.22, "bullpen_xfip": 3.95, "bullpen_status": "SOLID"},
    134: {"team": "Pittsburgh Pirates",     "bullpen_era": 4.35, "whip": 1.38, "bullpen_xfip": 4.40, "bullpen_status": "WEAK"},
    119: {"team": "Los Angeles Dodgers",    "bullpen_era": 3.10, "whip": 1.08, "bullpen_xfip": 3.08, "bullpen_status": "ELITE"},
    135: {"team": "San Diego Padres",       "bullpen_era": 3.50, "whip": 1.15, "bullpen_xfip": 3.52, "bullpen_status": "SOLID"},
    110: {"team": "Baltimore Orioles",      "bullpen_era": 3.55, "whip": 1.16, "bullpen_xfip": 3.58, "bullpen_status": "SOLID"},
    141: {"team": "Toronto Blue Jays",      "bullpen_era": 3.70, "whip": 1.20, "bullpen_xfip": 3.75, "bullpen_status": "SOLID"},
}

# ==============================================================================
# TEAM OFFENSE DATA
# ==============================================================================
MOCK_TEAM_OFFENSE: dict[int, dict] = {
    147: {"team": "New York Yankees",       "runs_per_game": 5.05, "hr_per_game": 1.45, "ops": 0.785},
    111: {"team": "Boston Red Sox",         "runs_per_game": 4.80, "hr_per_game": 1.30, "ops": 0.762},
    143: {"team": "Philadelphia Phillies",  "runs_per_game": 5.00, "hr_per_game": 1.35, "ops": 0.792},
    146: {"team": "Miami Marlins",          "runs_per_game": 3.85, "hr_per_game": 0.80, "ops": 0.695},
    158: {"team": "Milwaukee Brewers",      "runs_per_game": 4.55, "hr_per_game": 1.18, "ops": 0.748},
    138: {"team": "St. Louis Cardinals",    "runs_per_game": 4.30, "hr_per_game": 1.02, "ops": 0.728},
    117: {"team": "Houston Astros",         "runs_per_game": 4.55, "hr_per_game": 1.20, "ops": 0.740},
    140: {"team": "Texas Rangers",          "runs_per_game": 4.85, "hr_per_game": 1.32, "ops": 0.768},
    114: {"team": "Cleveland Guardians",    "runs_per_game": 4.60, "hr_per_game": 1.05, "ops": 0.742},
    116: {"team": "Detroit Tigers",         "runs_per_game": 4.10, "hr_per_game": 0.95, "ops": 0.710},
    112: {"team": "Chicago Cubs",           "runs_per_game": 4.50, "hr_per_game": 1.15, "ops": 0.738},
    134: {"team": "Pittsburgh Pirates",     "runs_per_game": 4.05, "hr_per_game": 0.90, "ops": 0.712},
    119: {"team": "Los Angeles Dodgers",    "runs_per_game": 5.25, "hr_per_game": 1.55, "ops": 0.802},
    135: {"team": "San Diego Padres",       "runs_per_game": 4.35, "hr_per_game": 1.10, "ops": 0.730},
    110: {"team": "Baltimore Orioles",      "runs_per_game": 4.80, "hr_per_game": 1.30, "ops": 0.762},
    141: {"team": "Toronto Blue Jays",      "runs_per_game": 4.70, "hr_per_game": 1.22, "ops": 0.755},
}

MOCK_TEAM_FORM: dict[int, dict] = {
    147: {"team": "New York Yankees",       "last_10_wins": 6, "last_10_losses": 4},
    111: {"team": "Boston Red Sox",         "last_10_wins": 8, "last_10_losses": 2},  # Hot streak
    143: {"team": "Philadelphia Phillies",  "last_10_wins": 8, "last_10_losses": 2},  # Hot streak
    146: {"team": "Miami Marlins",          "last_10_wins": 3, "last_10_losses": 7},
    158: {"team": "Milwaukee Brewers",      "last_10_wins": 7, "last_10_losses": 3},
    138: {"team": "St. Louis Cardinals",    "last_10_wins": 7, "last_10_losses": 3},
    117: {"team": "Houston Astros",         "last_10_wins": 6, "last_10_losses": 4},
    140: {"team": "Texas Rangers",          "last_10_wins": 6, "last_10_losses": 4},
    114: {"team": "Cleveland Guardians",    "last_10_wins": 6, "last_10_losses": 4},
    116: {"team": "Detroit Tigers",         "last_10_wins": 4, "last_10_losses": 6},
    112: {"team": "Chicago Cubs",           "last_10_wins": 6, "last_10_losses": 4},
    134: {"team": "Pittsburgh Pirates",     "last_10_wins": 4, "last_10_losses": 6},
    119: {"team": "Los Angeles Dodgers",    "last_10_wins": 7, "last_10_losses": 3},
    135: {"team": "San Diego Padres",       "last_10_wins": 5, "last_10_losses": 5},
    110: {"team": "Baltimore Orioles",      "last_10_wins": 6, "last_10_losses": 4},
    141: {"team": "Toronto Blue Jays",      "last_10_wins": 6, "last_10_losses": 4},
}

MOCK_TEAM_OPS_SPLITS: dict[int, dict] = {
    tid: {
        "ops_vs_rhp": round(data["ops"] + 0.018, 3),
        "ops_vs_lhp": round(data["ops"] - 0.018, 3),
    }
    for tid, data in MOCK_TEAM_OFFENSE.items()
}

MOCK_MONEYLINE_ODDS: dict[int, dict] = {
    g["game_id"]: MOCK_LINE_SHOPPING.get(g["game_id"], {}).get("DraftKings", {"home_ml": -110, "away_ml": -110})
    for g in MOCK_GAMES
}

# ==============================================================================
# 7-DAY TEAM BATTING (wRC+, ISO) — FanGraphs Fallback Mock Data
# MIA and PIT are set to slump (wRC+ < 85) for visual slump-warning demo.
# ==============================================================================
MOCK_TEAM_BATTING_7D: dict[str, dict] = {
    "New York Yankees":       {"wrc_plus_7d": 108, "iso_7d": 0.188, "ops_7d": 0.762},
    "Boston Red Sox":         {"wrc_plus_7d": 121, "iso_7d": 0.205, "ops_7d": 0.811},
    "Philadelphia Phillies":  {"wrc_plus_7d": 118, "iso_7d": 0.215, "ops_7d": 0.822},
    "Miami Marlins":          {"wrc_plus_7d":  72, "iso_7d": 0.095, "ops_7d": 0.618},  # SLUMP
    "Milwaukee Brewers":      {"wrc_plus_7d": 105, "iso_7d": 0.172, "ops_7d": 0.744},
    "St. Louis Cardinals":    {"wrc_plus_7d":  92, "iso_7d": 0.148, "ops_7d": 0.712},
    "Houston Astros":         {"wrc_plus_7d": 112, "iso_7d": 0.190, "ops_7d": 0.770},
    "Texas Rangers":          {"wrc_plus_7d": 103, "iso_7d": 0.175, "ops_7d": 0.748},
    "Cleveland Guardians":    {"wrc_plus_7d":  96, "iso_7d": 0.155, "ops_7d": 0.726},
    "Detroit Tigers":         {"wrc_plus_7d":  88, "iso_7d": 0.138, "ops_7d": 0.700},
    "Chicago Cubs":           {"wrc_plus_7d": 102, "iso_7d": 0.168, "ops_7d": 0.738},
    "Pittsburgh Pirates":     {"wrc_plus_7d":  78, "iso_7d": 0.112, "ops_7d": 0.652},  # SLUMP
    "Los Angeles Dodgers":    {"wrc_plus_7d": 127, "iso_7d": 0.228, "ops_7d": 0.842},
    "San Diego Padres":       {"wrc_plus_7d":  98, "iso_7d": 0.162, "ops_7d": 0.730},
    "Baltimore Orioles":      {"wrc_plus_7d": 106, "iso_7d": 0.180, "ops_7d": 0.755},
    "Toronto Blue Jays":      {"wrc_plus_7d":  95, "iso_7d": 0.158, "ops_7d": 0.720},
}

# ==============================================================================
# HISTORICAL 4-DAY LOOKBACK RESULTS
# ==============================================================================
MOCK_HISTORICAL_RESULTS: dict[str, list[dict]] = {
    "H-4": [
        {"game": "NYY @ BOS", "winner": "BOS", "score": "5-2", "bullpen_era": 2.10, "sp_whip": 0.95, "error_rate": 0.04},
        {"game": "PHI @ MIA", "winner": "PHI", "score": "7-3", "bullpen_era": 3.00, "sp_whip": 1.10, "error_rate": 0.05},
        {"game": "MIL @ STL", "winner": "MIL", "score": "3-2", "bullpen_era": 3.20, "sp_whip": 1.12, "error_rate": 0.06},
    ],
    "H-3": [
        {"game": "HOU @ TEX", "winner": "HOU", "score": "5-4", "bullpen_era": 3.80, "sp_whip": 1.15, "error_rate": 0.07},
        {"game": "CLE @ DET", "winner": "CLE", "score": "2-1", "bullpen_era": 1.90, "sp_whip": 0.92, "error_rate": 0.02},
        {"game": "CHC @ PIT", "winner": "CHC", "score": "6-2", "bullpen_era": 2.80, "sp_whip": 1.05, "error_rate": 0.04},
    ],
    "H-2": [
        {"game": "LAD @ SD",  "winner": "LAD", "score": "6-1", "bullpen_era": 1.80, "sp_whip": 1.02, "error_rate": 0.03},
        {"game": "BAL @ TOR", "winner": "BAL", "score": "6-3", "bullpen_era": 2.90, "sp_whip": 1.05, "error_rate": 0.05},
        {"game": "NYY @ BOS", "winner": "BOS", "score": "4-3", "bullpen_era": 3.10, "sp_whip": 1.08, "error_rate": 0.05},
    ],
    "H-1": [
        {"game": "PHI @ MIA", "winner": "PHI", "score": "8-1", "bullpen_era": 2.60, "sp_whip": 1.00, "error_rate": 0.03},
        {"game": "HOU @ TEX", "winner": "HOU", "score": "5-3", "bullpen_era": 3.20, "sp_whip": 1.10, "error_rate": 0.05},
        {"game": "MIL @ STL", "winner": "STL", "score": "4-2", "bullpen_era": 3.50, "sp_whip": 1.18, "error_rate": 0.07},
    ],
}

# ==============================================================================
# BATTER H2H STATS
# ==============================================================================
MOCK_BATTER_H2H: list[dict] = [
    {
        "batter_id": 2001, "batter_name": "J.T. Realmuto", "team": "Philadelphia Phillies", "team_id": 143,
        "pitcher_id": 1026, "pitcher_name": "Sandy Alcantara",
        "career_pa_vs_pitcher": 14, "career_ab_vs_pitcher": 12, "career_hits_vs_pitcher": 1,
        "batting_avg_vs_pitcher": 0.083, "career_hr_vs_pitcher": 0,
        "season_pa": 410, "season_hr": 18, "prev_season_pa": 500, "prev_season_hr": 22,
        "batting_avg": 0.268, "strikeout_pct": 0.195, "under_1_5_hits_seasonal_prob": 0.80,
        "is_dfs_top_pitcher_matchup": True,
    },
    {
        "batter_id": 2002, "batter_name": "Kyle Schwarber", "team": "Philadelphia Phillies", "team_id": 143,
        "pitcher_id": 1026, "pitcher_name": "Sandy Alcantara",
        "career_pa_vs_pitcher": 12, "career_ab_vs_pitcher": 10, "career_hits_vs_pitcher": 1,
        "batting_avg_vs_pitcher": 0.100, "career_hr_vs_pitcher": 0,
        "season_pa": 440, "season_hr": 30, "prev_season_pa": 560, "prev_season_hr": 47,
        "batting_avg": 0.245, "strikeout_pct": 0.285, "under_1_5_hits_seasonal_prob": 0.76,
        "is_dfs_top_pitcher_matchup": True,
    },
    {
        "batter_id": 2003, "batter_name": "Rafael Devers", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 18, "career_ab_vs_pitcher": 15, "career_hits_vs_pitcher": 2,
        "batting_avg_vs_pitcher": 0.133, "career_hr_vs_pitcher": 0,
        "season_pa": 420, "season_hr": 12, "prev_season_pa": 580, "prev_season_hr": 18,
        "batting_avg": 0.278, "strikeout_pct": 0.220, "under_1_5_hits_seasonal_prob": 0.72,
        "is_dfs_top_pitcher_matchup": False,
    },
]

# ==============================================================================
# OVER/UNDER LINES
# ==============================================================================
MOCK_ODDS_LINES: dict[int, dict] = {
    g["game_id"]: {
        "game_id": g["game_id"],
        "matchup": f"{g['away_team']} @ {g['home_team']}",
        "total_line": 8.5,
        "book": "DraftKings",
    }
    for g in MOCK_GAMES
}

# ==============================================================================
# WEATHER DATA
# ==============================================================================
MOCK_WEATHER: dict[str, dict] = {
    "Yankee Stadium":       {"temp_f": 79.0, "wind_speed_mph": 6.0,  "wind_direction": "out",  "conditions": "Partly Cloudy"},
    "Citizens Bank Park":   {"temp_f": 83.0, "wind_speed_mph": 7.0,  "wind_direction": "out",  "conditions": "Mostly Clear"},
    "American Family Field":{"temp_f": 76.0, "wind_speed_mph": 9.0,  "wind_direction": "in",   "conditions": "Partly Cloudy"},
    "Minute Maid Park":     {"temp_f": 92.0, "wind_speed_mph": 0.0,  "wind_direction": "none", "conditions": "Retractable Roof"},
    "Progressive Field":    {"temp_f": 78.0, "wind_speed_mph": 5.0,  "wind_direction": "in",   "conditions": "Partly Cloudy"},
    "Wrigley Field":        {"temp_f": 78.0, "wind_speed_mph": 10.0, "wind_direction": "out",  "conditions": "Partly Cloudy"},
    "Dodger Stadium":       {"temp_f": 74.0, "wind_speed_mph": 4.0,  "wind_direction": "in",   "conditions": "Clear"},
    "Camden Yards":         {"temp_f": 80.0, "wind_speed_mph": 6.0,  "wind_direction": "out",  "conditions": "Clear"},
    "DEFAULT":              {"temp_f": 72.0, "wind_speed_mph": 5.0,  "wind_direction": "none", "conditions": "Clear"},
}


# ==============================================================================
# ACCESSORS
# ==============================================================================

def get_mock_games(date_str: str) -> list[dict]:
    return list(MOCK_GAMES)


def get_mock_odds_for_date(date_str: str) -> dict:
    return dict(MOCK_ODDS_LINES)


# ==============================================================================
# V6.0 — MOCK: SP 1ST INNING SPLITS
# Keyed by pitcher_id. era_1st_inn / xfip_1st_inn derived from Statcast inning==1.
# nrfi_as_sp_pct = % of SP's starts where inning 1 was scoreless (for that team).
# ==============================================================================
MOCK_SP_FIRST_INN_SPLITS: dict[int, dict] = {
    # NYY — Gerrit Cole (fast starter, dominant in inning 1)
    1001: {"pitcher_id": 1001, "full_name": "Gerrit Cole",
           "era_1st_inn": 2.60, "xfip_1st_inn": 2.55, "k_pct_1st_inn": 0.330, "bb_per9_1st_inn": 1.8,
           "nrfi_as_sp_pct": 0.66, "sample_starts": 18},
    # BOS — Brayan Bello (inconsistent in inning 1)
    1002: {"pitcher_id": 1002, "full_name": "Brayan Bello",
           "era_1st_inn": 3.95, "xfip_1st_inn": 3.80, "k_pct_1st_inn": 0.250, "bb_per9_1st_inn": 3.2,
           "nrfi_as_sp_pct": 0.52, "sample_starts": 15},
    # PHI — Zack Wheeler (elite, dominates early innings)
    1015: {"pitcher_id": 1015, "full_name": "Zack Wheeler",
           "era_1st_inn": 2.40, "xfip_1st_inn": 2.30, "k_pct_1st_inn": 0.310, "bb_per9_1st_inn": 1.9,
           "nrfi_as_sp_pct": 0.68, "sample_starts": 20},
    # MIA — Sandy Alcantara (very leaky in inning 1)
    1026: {"pitcher_id": 1026, "full_name": "Sandy Alcantara",
           "era_1st_inn": 6.20, "xfip_1st_inn": 5.80, "k_pct_1st_inn": 0.160, "bb_per9_1st_inn": 5.1,
           "nrfi_as_sp_pct": 0.36, "sample_starts": 14},
    # MIL — Freddy Peralta
    1017: {"pitcher_id": 1017, "full_name": "Freddy Peralta",
           "era_1st_inn": 3.40, "xfip_1st_inn": 3.25, "k_pct_1st_inn": 0.305, "bb_per9_1st_inn": 3.5,
           "nrfi_as_sp_pct": 0.60, "sample_starts": 16},
    # STL — Miles Mikolas (mediocre early)
    1018: {"pitcher_id": 1018, "full_name": "Miles Mikolas",
           "era_1st_inn": 5.10, "xfip_1st_inn": 4.90, "k_pct_1st_inn": 0.175, "bb_per9_1st_inn": 3.0,
           "nrfi_as_sp_pct": 0.42, "sample_starts": 14},
    # HOU — Framber Valdez (strong sinker = NRFI friendly)
    1005: {"pitcher_id": 1005, "full_name": "Framber Valdez",
           "era_1st_inn": 2.90, "xfip_1st_inn": 2.80, "k_pct_1st_inn": 0.255, "bb_per9_1st_inn": 3.8,
           "nrfi_as_sp_pct": 0.63, "sample_starts": 19},
    # TEX — Nathan Eovaldi
    1006: {"pitcher_id": 1006, "full_name": "Nathan Eovaldi",
           "era_1st_inn": 3.80, "xfip_1st_inn": 3.65, "k_pct_1st_inn": 0.240, "bb_per9_1st_inn": 2.7,
           "nrfi_as_sp_pct": 0.55, "sample_starts": 15},
    # CLE — Shane Bieber (elite control, low 1st inn ERA)
    1011: {"pitcher_id": 1011, "full_name": "Shane Bieber",
           "era_1st_inn": 2.80, "xfip_1st_inn": 2.70, "k_pct_1st_inn": 0.285, "bb_per9_1st_inn": 1.6,
           "nrfi_as_sp_pct": 0.65, "sample_starts": 17},
    # DET — Eduardo Rodriguez
    1012: {"pitcher_id": 1012, "full_name": "Eduardo Rodriguez",
           "era_1st_inn": 4.80, "xfip_1st_inn": 4.60, "k_pct_1st_inn": 0.195, "bb_per9_1st_inn": 4.1,
           "nrfi_as_sp_pct": 0.44, "sample_starts": 14},
    # CHC — Justin Steele
    1010: {"pitcher_id": 1010, "full_name": "Justin Steele",
           "era_1st_inn": 3.10, "xfip_1st_inn": 2.95, "k_pct_1st_inn": 0.268, "bb_per9_1st_inn": 3.0,
           "nrfi_as_sp_pct": 0.62, "sample_starts": 16},
    # PIT — Mitch Keller (high 1st inn ERA)
    1028: {"pitcher_id": 1028, "full_name": "Mitch Keller",
           "era_1st_inn": 4.60, "xfip_1st_inn": 4.40, "k_pct_1st_inn": 0.215, "bb_per9_1st_inn": 3.8,
           "nrfi_as_sp_pct": 0.46, "sample_starts": 14},
    # LAD — Tyler Glasnow (elite swing-and-miss from pitch 1)
    1003: {"pitcher_id": 1003, "full_name": "Tyler Glasnow",
           "era_1st_inn": 2.20, "xfip_1st_inn": 2.10, "k_pct_1st_inn": 0.355, "bb_per9_1st_inn": 2.5,
           "nrfi_as_sp_pct": 0.71, "sample_starts": 17},
    # SD — Yu Darvish (streaky in inning 1)
    1021: {"pitcher_id": 1021, "full_name": "Yu Darvish",
           "era_1st_inn": 4.30, "xfip_1st_inn": 4.10, "k_pct_1st_inn": 0.258, "bb_per9_1st_inn": 2.6,
           "nrfi_as_sp_pct": 0.48, "sample_starts": 15},
    # BAL — Dean Kremer
    1024: {"pitcher_id": 1024, "full_name": "Dean Kremer",
           "era_1st_inn": 3.90, "xfip_1st_inn": 3.78, "k_pct_1st_inn": 0.240, "bb_per9_1st_inn": 3.0,
           "nrfi_as_sp_pct": 0.54, "sample_starts": 15},
    # TOR — Kevin Gausman (solid early)
    1013: {"pitcher_id": 1013, "full_name": "Kevin Gausman",
           "era_1st_inn": 3.20, "xfip_1st_inn": 3.10, "k_pct_1st_inn": 0.278, "bb_per9_1st_inn": 1.9,
           "nrfi_as_sp_pct": 0.62, "sample_starts": 16},
}


# ==============================================================================
# V6.0 — MOCK: TOP-3 ORDER wRC+ PER TEAM
# wrc_plus_top3: weighted avg wRC+ of leadoff/2-hole/3-hole batters (7-day)
# Used to estimate offensive pressure in 1st inning specifically.
# ==============================================================================
MOCK_TOP3_LINEUP_WRC: dict[str, dict] = {
    "New York Yankees":       {"top3_batters": ["Juan Soto", "Aaron Judge", "Giancarlo Stanton"],
                               "top3_wrc_plus_7d": 131, "top3_woba_7d": 0.388,
                               "vs_rhp_wrc_plus": 128, "vs_lhp_wrc_plus": 135},
    "Boston Red Sox":         {"top3_batters": ["Jarren Duran", "Rafael Devers", "Masataka Yoshida"],
                               "top3_wrc_plus_7d": 118, "top3_woba_7d": 0.368,
                               "vs_rhp_wrc_plus": 115, "vs_lhp_wrc_plus": 122},
    "Philadelphia Phillies":  {"top3_batters": ["Kyle Schwarber", "Trea Turner", "Bryce Harper"],
                               "top3_wrc_plus_7d": 134, "top3_woba_7d": 0.398,
                               "vs_rhp_wrc_plus": 131, "vs_lhp_wrc_plus": 138},
    "Miami Marlins":          {"top3_batters": ["Luis Arraez", "Jazz Chisholm Jr.", "Jake Burger"],
                               "top3_wrc_plus_7d":  68, "top3_woba_7d": 0.295,
                               "vs_rhp_wrc_plus":  65, "vs_lhp_wrc_plus":  72},  # SLUMP
    "Milwaukee Brewers":      {"top3_batters": ["Christian Yelich", "William Contreras", "Rhys Hoskins"],
                               "top3_wrc_plus_7d": 108, "top3_woba_7d": 0.352,
                               "vs_rhp_wrc_plus": 105, "vs_lhp_wrc_plus": 112},
    "St. Louis Cardinals":    {"top3_batters": ["Lars Nootbaar", "Paul Goldschmidt", "Nolan Arenado"],
                               "top3_wrc_plus_7d":  90, "top3_woba_7d": 0.328,
                               "vs_rhp_wrc_plus":  88, "vs_lhp_wrc_plus":  93},
    "Houston Astros":         {"top3_batters": ["Jose Altuve", "Alex Bregman", "Yordan Alvarez"],
                               "top3_wrc_plus_7d": 122, "top3_woba_7d": 0.378,
                               "vs_rhp_wrc_plus": 119, "vs_lhp_wrc_plus": 126},
    "Texas Rangers":          {"top3_batters": ["Leody Taveras", "Marcus Semien", "Corey Seager"],
                               "top3_wrc_plus_7d": 110, "top3_woba_7d": 0.360,
                               "vs_rhp_wrc_plus": 107, "vs_lhp_wrc_plus": 114},
    "Cleveland Guardians":    {"top3_batters": ["Steven Kwan", "Amed Rosario", "Jose Ramirez"],
                               "top3_wrc_plus_7d":  98, "top3_woba_7d": 0.338,
                               "vs_rhp_wrc_plus":  96, "vs_lhp_wrc_plus": 101},
    "Detroit Tigers":         {"top3_batters": ["Riley Greene", "Spencer Torkelson", "Matt Vierling"],
                               "top3_wrc_plus_7d":  82, "top3_woba_7d": 0.312,
                               "vs_rhp_wrc_plus":  80, "vs_lhp_wrc_plus":  85},
    "Chicago Cubs":           {"top3_batters": ["Nico Hoerner", "Ian Happ", "Dansby Swanson"],
                               "top3_wrc_plus_7d": 104, "top3_woba_7d": 0.345,
                               "vs_rhp_wrc_plus": 101, "vs_lhp_wrc_plus": 108},
    "Pittsburgh Pirates":     {"top3_batters": ["Bryan Reynolds", "Andrew McCutchen", "Ke'Bryan Hayes"],
                               "top3_wrc_plus_7d":  74, "top3_woba_7d": 0.300,
                               "vs_rhp_wrc_plus":  72, "vs_lhp_wrc_plus":  77},  # SLUMP
    "Los Angeles Dodgers":    {"top3_batters": ["Shohei Ohtani", "Mookie Betts", "Freddie Freeman"],
                               "top3_wrc_plus_7d": 142, "top3_woba_7d": 0.415,
                               "vs_rhp_wrc_plus": 138, "vs_lhp_wrc_plus": 147},
    "San Diego Padres":       {"top3_batters": ["Fernando Tatis Jr.", "Manny Machado", "Xander Bogaerts"],
                               "top3_wrc_plus_7d":  96, "top3_woba_7d": 0.335,
                               "vs_rhp_wrc_plus":  93, "vs_lhp_wrc_plus":  99},
    "Baltimore Orioles":      {"top3_batters": ["Gunnar Henderson", "Adley Rutschman", "Ryan Mountcastle"],
                               "top3_wrc_plus_7d": 112, "top3_woba_7d": 0.362,
                               "vs_rhp_wrc_plus": 109, "vs_lhp_wrc_plus": 116},
    "Toronto Blue Jays":      {"top3_batters": ["George Springer", "Bo Bichette", "Vladimir Guerrero Jr."],
                               "top3_wrc_plus_7d":  97, "top3_woba_7d": 0.336,
                               "vs_rhp_wrc_plus":  94, "vs_lhp_wrc_plus": 101},
}


# ==============================================================================
# V6.0 — MOCK: NRFI / YRFI TREND DATA (Last 15 games)
# nrfi_home_rate: % of home games where team did NOT score in inning 1 (as batting team)
# nrfi_away_rate: % of away games where team did NOT score in inning 1 (as batting team)
# nrfi_as_home_sp_rate: % of home games where SP held opponent scoreless in inning 1
# ==============================================================================
MOCK_NRFI_TRENDS: dict[str, dict] = {
    "New York Yankees":       {"nrfi_home_rate": 0.60, "nrfi_away_rate": 0.55, "last_15_nrfi_count": 9,
                               "yrfi_streak": 1, "nrfi_streak": 0},
    "Boston Red Sox":         {"nrfi_home_rate": 0.47, "nrfi_away_rate": 0.50, "last_15_nrfi_count": 7,
                               "yrfi_streak": 2, "nrfi_streak": 0},
    "Philadelphia Phillies":  {"nrfi_home_rate": 0.53, "nrfi_away_rate": 0.60, "last_15_nrfi_count": 9,
                               "yrfi_streak": 0, "nrfi_streak": 2},
    "Miami Marlins":          {"nrfi_home_rate": 0.67, "nrfi_away_rate": 0.60, "last_15_nrfi_count": 10,
                               "yrfi_streak": 0, "nrfi_streak": 3},  # Weak offense → NRFI trend
    "Milwaukee Brewers":      {"nrfi_home_rate": 0.53, "nrfi_away_rate": 0.47, "last_15_nrfi_count": 8,
                               "yrfi_streak": 1, "nrfi_streak": 0},
    "St. Louis Cardinals":    {"nrfi_home_rate": 0.60, "nrfi_away_rate": 0.53, "last_15_nrfi_count": 9,
                               "yrfi_streak": 0, "nrfi_streak": 1},
    "Houston Astros":         {"nrfi_home_rate": 0.47, "nrfi_away_rate": 0.47, "last_15_nrfi_count": 7,
                               "yrfi_streak": 2, "nrfi_streak": 0},  # Strong offense
    "Texas Rangers":          {"nrfi_home_rate": 0.53, "nrfi_away_rate": 0.53, "last_15_nrfi_count": 8,
                               "yrfi_streak": 0, "nrfi_streak": 0},
    "Cleveland Guardians":    {"nrfi_home_rate": 0.60, "nrfi_away_rate": 0.60, "last_15_nrfi_count": 9,
                               "yrfi_streak": 0, "nrfi_streak": 1},
    "Detroit Tigers":         {"nrfi_home_rate": 0.67, "nrfi_away_rate": 0.60, "last_15_nrfi_count": 10,
                               "yrfi_streak": 0, "nrfi_streak": 2},  # Weak offense → NRFI trend
    "Chicago Cubs":           {"nrfi_home_rate": 0.47, "nrfi_away_rate": 0.53, "last_15_nrfi_count": 8,
                               "yrfi_streak": 1, "nrfi_streak": 0},
    "Pittsburgh Pirates":     {"nrfi_home_rate": 0.67, "nrfi_away_rate": 0.60, "last_15_nrfi_count": 10,
                               "yrfi_streak": 0, "nrfi_streak": 3},  # Slump → NRFI
    "Los Angeles Dodgers":    {"nrfi_home_rate": 0.40, "nrfi_away_rate": 0.43, "last_15_nrfi_count": 6,
                               "yrfi_streak": 3, "nrfi_streak": 0},  # Elite offense → YRFI trend
    "San Diego Padres":       {"nrfi_home_rate": 0.53, "nrfi_away_rate": 0.57, "last_15_nrfi_count": 8,
                               "yrfi_streak": 0, "nrfi_streak": 1},
    "Baltimore Orioles":      {"nrfi_home_rate": 0.53, "nrfi_away_rate": 0.47, "last_15_nrfi_count": 8,
                               "yrfi_streak": 1, "nrfi_streak": 0},
    "Toronto Blue Jays":      {"nrfi_home_rate": 0.60, "nrfi_away_rate": 0.53, "last_15_nrfi_count": 9,
                               "yrfi_streak": 0, "nrfi_streak": 1},
}
