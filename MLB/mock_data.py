"""
mock_data.py
============
Fallback engine with structured mock data v5.0.
8-matchup slate optimized for color-coded trust system demo.

Teams covered:
  HIGH TRUST   (>= 65%): BOS, PHI
  MEDIUM TRUST (58-64%): STL, MIL
  PASS/BORDER  (50-57%): TEX, NYY, CLE, PIT
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
# ==============================================================================
MOCK_PITCHER_STATS: dict[int, dict] = {
    # NYY — GERRIT COLE (solid, not dominant)
    1001: {
        "pitcher_id": 1001, "full_name": "Gerrit Cole",
        "team": "New York Yankees", "team_id": 147,
        "era": 2.85, "last5_era": 2.70, "last3_era": 2.60,
        "whip": 0.97, "hr_per9": 0.65, "k_per9": 11.2,
        "innings_pitched": 112.0, "throws": "R",
    },
    # BOS — BRAYAN BELLO (mediocre opp, BOS wins via dominance)
    1002: {
        "pitcher_id": 1002, "full_name": "Brayan Bello",
        "team": "Boston Red Sox", "team_id": 111,
        "era": 2.75, "last5_era": 2.55, "last3_era": 2.35,
        "whip": 0.95, "hr_per9": 0.60, "k_per9": 9.8,
        "innings_pitched": 105.0, "throws": "R",
    },
    # PHI — ZACK WHEELER (elite)
    1015: {
        "pitcher_id": 1015, "full_name": "Zack Wheeler",
        "team": "Philadelphia Phillies", "team_id": 143,
        "era": 2.95, "last5_era": 2.60, "last3_era": 2.30,
        "whip": 0.98, "hr_per9": 0.70, "k_per9": 10.4,
        "innings_pitched": 114.0, "throws": "R",
    },
    # MIA opp SP — Sandy Alcantara (declining)
    1026: {
        "pitcher_id": 1026, "full_name": "Sandy Alcantara",
        "team": "Miami Marlins", "team_id": 146,
        "era": 5.10, "last5_era": 5.40, "last3_era": 5.80,
        "whip": 1.55, "hr_per9": 1.45, "k_per9": 6.1,
        "innings_pitched": 88.0, "throws": "R",
    },
    # MIL — FREDDY PERALTA
    1017: {
        "pitcher_id": 1017, "full_name": "Freddy Peralta",
        "team": "Milwaukee Brewers", "team_id": 158,
        "era": 3.35, "last5_era": 3.15, "last3_era": 3.10,
        "whip": 1.08, "hr_per9": 0.80, "k_per9": 10.5,
        "innings_pitched": 106.0, "throws": "R",
    },
    # STL opp SP — Miles Mikolas (mediocre)
    1018: {
        "pitcher_id": 1018, "full_name": "Miles Mikolas",
        "team": "St. Louis Cardinals", "team_id": 138,
        "era": 4.70, "last5_era": 4.90, "last3_era": 5.10,
        "whip": 1.32, "hr_per9": 1.15, "k_per9": 6.8,
        "innings_pitched": 92.0, "throws": "R",
    },
    # HOU — FRAMBER VALDEZ
    1005: {
        "pitcher_id": 1005, "full_name": "Framber Valdez",
        "team": "Houston Astros", "team_id": 117,
        "era": 3.15, "last5_era": 2.90, "last3_era": 2.80,
        "whip": 1.14, "hr_per9": 0.62, "k_per9": 8.8,
        "innings_pitched": 118.0, "throws": "L",
    },
    # TEX opp SP — Nathan Eovaldi (wildcard)
    1006: {
        "pitcher_id": 1006, "full_name": "Nathan Eovaldi",
        "team": "Texas Rangers", "team_id": 140,
        "era": 3.85, "last5_era": 3.70, "last3_era": 3.50,
        "whip": 1.20, "hr_per9": 1.10, "k_per9": 8.4,
        "innings_pitched": 98.0, "throws": "R",
    },
    # CLE — SHANE BIEBER
    1011: {
        "pitcher_id": 1011, "full_name": "Shane Bieber",
        "team": "Cleveland Guardians", "team_id": 114,
        "era": 3.40, "last5_era": 3.20, "last3_era": 3.00,
        "whip": 1.05, "hr_per9": 0.75, "k_per9": 9.8,
        "innings_pitched": 108.0, "throws": "R",
    },
    # DET opp SP — Eduardo Rodriguez
    1012: {
        "pitcher_id": 1012, "full_name": "Eduardo Rodriguez",
        "team": "Detroit Tigers", "team_id": 116,
        "era": 4.55, "last5_era": 4.75, "last3_era": 4.95,
        "whip": 1.38, "hr_per9": 1.18, "k_per9": 7.5,
        "innings_pitched": 92.0, "throws": "L",
    },
    # CHC — JUSTIN STEELE
    1010: {
        "pitcher_id": 1010, "full_name": "Justin Steele",
        "team": "Chicago Cubs", "team_id": 112,
        "era": 3.10, "last5_era": 2.90, "last3_era": 2.70,
        "whip": 1.08, "hr_per9": 0.88, "k_per9": 9.2,
        "innings_pitched": 102.0, "throws": "L",
    },
    # PIT opp SP — Mitch Keller
    1028: {
        "pitcher_id": 1028, "full_name": "Mitch Keller",
        "team": "Pittsburgh Pirates", "team_id": 134,
        "era": 4.20, "last5_era": 4.45, "last3_era": 4.65,
        "whip": 1.30, "hr_per9": 1.20, "k_per9": 8.0,
        "innings_pitched": 95.0, "throws": "R",
    },
    # LAD — TYLER GLASNOW
    1003: {
        "pitcher_id": 1003, "full_name": "Tyler Glasnow",
        "team": "Los Angeles Dodgers", "team_id": 119,
        "era": 2.90, "last5_era": 2.65, "last3_era": 2.40,
        "whip": 0.98, "hr_per9": 0.72, "k_per9": 11.8,
        "innings_pitched": 105.0, "throws": "R",
    },
    # SD opp SP — Yu Darvish
    1021: {
        "pitcher_id": 1021, "full_name": "Yu Darvish",
        "team": "San Diego Padres", "team_id": 135,
        "era": 4.20, "last5_era": 4.40, "last3_era": 4.60,
        "whip": 1.22, "hr_per9": 1.05, "k_per9": 9.0,
        "innings_pitched": 97.0, "throws": "R",
    },
    # BAL — DEAN KREMER
    1024: {
        "pitcher_id": 1024, "full_name": "Dean Kremer",
        "team": "Baltimore Orioles", "team_id": 110,
        "era": 3.75, "last5_era": 3.80, "last3_era": 3.70,
        "whip": 1.20, "hr_per9": 0.88, "k_per9": 8.4,
        "innings_pitched": 97.0, "throws": "R",
    },
    # TOR opp SP — Kevin Gausman
    1013: {
        "pitcher_id": 1013, "full_name": "Kevin Gausman",
        "team": "Toronto Blue Jays", "team_id": 141,
        "era": 3.55, "last5_era": 3.45, "last3_era": 3.30,
        "whip": 1.12, "hr_per9": 0.90, "k_per9": 9.5,
        "innings_pitched": 100.0, "throws": "R",
    },
}

# ==============================================================================
# BULLPEN STATS
# ==============================================================================
MOCK_BULLPEN_STATS: dict[int, dict] = {
    147: {"team": "New York Yankees",       "bullpen_era": 3.40, "whip": 1.18},
    111: {"team": "Boston Red Sox",         "bullpen_era": 3.50, "whip": 1.15},
    143: {"team": "Philadelphia Phillies",  "bullpen_era": 3.25, "whip": 1.10},
    146: {"team": "Miami Marlins",          "bullpen_era": 4.60, "whip": 1.42},
    158: {"team": "Milwaukee Brewers",      "bullpen_era": 3.45, "whip": 1.14},
    138: {"team": "St. Louis Cardinals",    "bullpen_era": 4.20, "whip": 1.32},
    117: {"team": "Houston Astros",         "bullpen_era": 3.20, "whip": 1.10},
    140: {"team": "Texas Rangers",          "bullpen_era": 3.75, "whip": 1.22},
    114: {"team": "Cleveland Guardians",    "bullpen_era": 3.55, "whip": 1.15},
    116: {"team": "Detroit Tigers",         "bullpen_era": 4.30, "whip": 1.38},
    112: {"team": "Chicago Cubs",           "bullpen_era": 3.90, "whip": 1.22},
    134: {"team": "Pittsburgh Pirates",     "bullpen_era": 4.35, "whip": 1.38},
    119: {"team": "Los Angeles Dodgers",    "bullpen_era": 3.10, "whip": 1.08},
    135: {"team": "San Diego Padres",       "bullpen_era": 3.50, "whip": 1.15},
    110: {"team": "Baltimore Orioles",      "bullpen_era": 3.55, "whip": 1.16},
    141: {"team": "Toronto Blue Jays",      "bullpen_era": 3.70, "whip": 1.20},
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
