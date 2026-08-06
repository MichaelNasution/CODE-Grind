"""
mock_data.py
============
Fallback engine with structured mock data.
Automatically activates if any live API fails or is rate-limited.
Covers all four strategies: Moneyline, Under HR, Score Projection, Props.
Extended to 12 games to support 10-leg parlay generation.

Date-aware accessors (get_mock_games, get_mock_odds_for_date) return the
same fixed dataset for any requested date so the program runs cleanly in
offline / mock mode regardless of which analysis date the user selects.
"""

from __future__ import annotations

# ==============================================================================
# MOCK: TODAY'S SCHEDULED GAMES (12-game slate)
# ==============================================================================
MOCK_GAMES: list[dict] = [
    # ── American League East ───────────────────────────────────────────────
    {
        "game_id": 9001, "home_team": "New York Yankees", "away_team": "Boston Red Sox",
        "home_team_id": 147, "away_team_id": 111, "venue": "Yankee Stadium",
        "game_datetime": "2026-08-06T23:05:00Z",
        "home_starter_id": 1001, "away_starter_id": 1002,
        "home_starter_name": "Gerrit Cole", "away_starter_name": "Brayan Bello",
    },
    {
        "game_id": 9008, "home_team": "Philadelphia Phillies", "away_team": "Washington Nationals",
        "home_team_id": 143, "away_team_id": 120, "venue": "Citizens Bank Park",
        "game_datetime": "2026-08-06T23:05:00Z",
        "home_starter_id": 1015, "away_starter_id": 1016,
        "home_starter_name": "Zack Wheeler", "away_starter_name": "Patrick Corbin",
    },
    {
        "game_id": 9012, "home_team": "Baltimore Orioles", "away_team": "Kansas City Royals",
        "home_team_id": 110, "away_team_id": 118, "venue": "Camden Yards",
        "game_datetime": "2026-08-06T23:05:00Z",
        "home_starter_id": 1024, "away_starter_id": 1023,
        "home_starter_name": "Dean Kremer", "away_starter_name": "Cole Ragans",
    },
    # ── American League Central ────────────────────────────────────────────
    {
        "game_id": 9006, "home_team": "Cleveland Guardians", "away_team": "Detroit Tigers",
        "home_team_id": 114, "away_team_id": 116, "venue": "Progressive Field",
        "game_datetime": "2026-08-06T23:10:00Z",
        "home_starter_id": 1011, "away_starter_id": 1012,
        "home_starter_name": "Shane Bieber", "away_starter_name": "Eduardo Rodriguez",
    },
    {
        "game_id": 9007, "home_team": "Toronto Blue Jays", "away_team": "Minnesota Twins",
        "home_team_id": 141, "away_team_id": 142, "venue": "Rogers Centre",
        "game_datetime": "2026-08-06T23:07:00Z",
        "home_starter_id": 1013, "away_starter_id": 1014,
        "home_starter_name": "Kevin Gausman", "away_starter_name": "Pablo Lopez",
    },
    # ── American League West ───────────────────────────────────────────────
    {
        "game_id": 9003, "home_team": "Houston Astros", "away_team": "Texas Rangers",
        "home_team_id": 117, "away_team_id": 140, "venue": "Minute Maid Park",
        "game_datetime": "2026-08-07T00:10:00Z",
        "home_starter_id": 1005, "away_starter_id": 1006,
        "home_starter_name": "Framber Valdez", "away_starter_name": "Nathan Eovaldi",
    },
    {
        "game_id": 9010, "home_team": "Seattle Mariners", "away_team": "Oakland Athletics",
        "home_team_id": 136, "away_team_id": 133, "venue": "T-Mobile Park",
        "game_datetime": "2026-08-07T02:10:00Z",
        "home_starter_id": 1019, "away_starter_id": 1020,
        "home_starter_name": "Luis Castillo", "away_starter_name": "Mason Miller",
    },
    # ── National League East ───────────────────────────────────────────────
    {
        "game_id": 9004, "home_team": "Atlanta Braves", "away_team": "New York Mets",
        "home_team_id": 144, "away_team_id": 121, "venue": "Truist Park",
        "game_datetime": "2026-08-06T23:20:00Z",
        "home_starter_id": 1007, "away_starter_id": 1008,
        "home_starter_name": "Spencer Strider", "away_starter_name": "Kodai Senga",
    },
    # ── National League Central ────────────────────────────────────────────
    {
        "game_id": 9005, "home_team": "Colorado Rockies", "away_team": "Chicago Cubs",
        "home_team_id": 115, "away_team_id": 112, "venue": "Coors Field",
        "game_datetime": "2026-08-07T01:10:00Z",
        "home_starter_id": 1009, "away_starter_id": 1010,
        "home_starter_name": "Kyle Freeland", "away_starter_name": "Justin Steele",
    },
    {
        "game_id": 9009, "home_team": "Milwaukee Brewers", "away_team": "St. Louis Cardinals",
        "home_team_id": 158, "away_team_id": 138, "venue": "American Family Field",
        "game_datetime": "2026-08-07T00:10:00Z",
        "home_starter_id": 1017, "away_starter_id": 1018,
        "home_starter_name": "Freddy Peralta", "away_starter_name": "Miles Mikolas",
    },
    # ── National League West ───────────────────────────────────────────────
    {
        "game_id": 9002, "home_team": "Los Angeles Dodgers", "away_team": "San Francisco Giants",
        "home_team_id": 119, "away_team_id": 137, "venue": "Dodger Stadium",
        "game_datetime": "2026-08-07T02:10:00Z",
        "home_starter_id": 1003, "away_starter_id": 1004,
        "home_starter_name": "Tyler Glasnow", "away_starter_name": "Logan Webb",
    },
    {
        "game_id": 9011, "home_team": "Arizona Diamondbacks", "away_team": "San Diego Padres",
        "home_team_id": 109, "away_team_id": 135, "venue": "Chase Field",
        "game_datetime": "2026-08-07T02:40:00Z",
        "home_starter_id": 1022, "away_starter_id": 1021,
        "home_starter_name": "Zac Gallen", "away_starter_name": "Yu Darvish",
    },
]

# ==============================================================================
# MOCK: PITCHER STATISTICS (Season + Recent + Handedness)
# 'throws': "R" = right-handed, "L" = left-handed
# ==============================================================================
MOCK_PITCHER_STATS: dict[int, dict] = {
    # ── Original 10 pitchers (updated with 'throws' + adjusted ERA) ────────
    1001: {
        "pitcher_id": 1001, "full_name": "Gerrit Cole", "team": "New York Yankees",
        "era": 2.85, "last5_era": 2.40, "hr_per9": 0.65, "strikeout_rate": 0.315,
        "innings_pitched": 112.0, "pitch_count_avg": 97, "whip": 0.97,
        "fip": 2.71, "opponent_avg": 0.198, "throws": "R",
    },
    1002: {
        "pitcher_id": 1002, "full_name": "Brayan Bello", "team": "Boston Red Sox",
        "era": 4.10, "last5_era": 3.90, "hr_per9": 1.05, "strikeout_rate": 0.235,
        "innings_pitched": 98.0, "pitch_count_avg": 88, "whip": 1.28,
        "fip": 4.00, "opponent_avg": 0.248, "throws": "R",
    },
    1003: {
        "pitcher_id": 1003, "full_name": "Tyler Glasnow", "team": "Los Angeles Dodgers",
        "era": 2.90,  # adjusted (was 3.05) for stronger LAD pitcher advantage
        "last5_era": 2.65, "hr_per9": 0.72, "strikeout_rate": 0.342,
        "innings_pitched": 105.0, "pitch_count_avg": 95, "whip": 0.98,
        "fip": 2.89, "opponent_avg": 0.204, "throws": "R",
    },
    1004: {
        "pitcher_id": 1004, "full_name": "Logan Webb", "team": "San Francisco Giants",
        "era": 3.25, "last5_era": 3.00, "hr_per9": 0.58, "strikeout_rate": 0.228,
        "innings_pitched": 115.0, "pitch_count_avg": 99, "whip": 1.08,
        "fip": 3.12, "opponent_avg": 0.236, "throws": "R",
    },
    1005: {
        "pitcher_id": 1005, "full_name": "Framber Valdez", "team": "Houston Astros",
        "era": 3.15, "last5_era": 2.80, "hr_per9": 0.62, "strikeout_rate": 0.262,
        "innings_pitched": 118.0, "pitch_count_avg": 100, "whip": 1.14,
        "fip": 3.05, "opponent_avg": 0.241, "throws": "L",  # sinker lefty
    },
    1006: {
        "pitcher_id": 1006, "full_name": "Nathan Eovaldi", "team": "Texas Rangers",
        "era": 4.25,  # adjusted upward for clearer HOU ERA advantage
        "last5_era": 4.50, "hr_per9": 0.98, "strikeout_rate": 0.248,
        "innings_pitched": 95.0, "pitch_count_avg": 91, "whip": 1.30,
        "fip": 4.10, "opponent_avg": 0.252, "throws": "R",
    },
    1007: {
        "pitcher_id": 1007, "full_name": "Spencer Strider", "team": "Atlanta Braves",
        "era": 3.10, "last5_era": 2.75, "hr_per9": 0.78, "strikeout_rate": 0.388,
        "innings_pitched": 109.0, "pitch_count_avg": 96, "whip": 1.00,
        "fip": 2.80, "opponent_avg": 0.195, "throws": "R",
    },
    1008: {
        "pitcher_id": 1008, "full_name": "Kodai Senga", "team": "New York Mets",
        "era": 3.55, "last5_era": 3.20, "hr_per9": 0.75, "strikeout_rate": 0.298,
        "innings_pitched": 88.0, "pitch_count_avg": 92, "whip": 1.10,
        "fip": 3.20, "opponent_avg": 0.218, "throws": "R",
    },
    1009: {
        "pitcher_id": 1009, "full_name": "Kyle Freeland", "team": "Colorado Rockies",
        "era": 4.80, "last5_era": 5.20, "hr_per9": 1.30, "strikeout_rate": 0.182,
        "innings_pitched": 85.0, "pitch_count_avg": 85, "whip": 1.45,
        "fip": 5.10, "opponent_avg": 0.278, "throws": "L",
    },
    1010: {
        "pitcher_id": 1010, "full_name": "Justin Steele", "team": "Chicago Cubs",
        "era": 3.65, "last5_era": 3.50, "hr_per9": 0.88, "strikeout_rate": 0.272,
        "innings_pitched": 102.0, "pitch_count_avg": 93, "whip": 1.16,
        "fip": 3.55, "opponent_avg": 0.238, "throws": "L",
    },
    # ── 14 new pitchers for 7 additional games ──────────────────────────────
    1011: {
        "pitcher_id": 1011, "full_name": "Shane Bieber", "team": "Cleveland Guardians",
        "era": 3.40, "last5_era": 3.20, "hr_per9": 0.75, "strikeout_rate": 0.290,
        "innings_pitched": 108.0, "pitch_count_avg": 96, "whip": 1.05,
        "fip": 3.22, "opponent_avg": 0.232, "throws": "R",
    },
    1012: {
        "pitcher_id": 1012, "full_name": "Eduardo Rodriguez", "team": "Detroit Tigers",
        "era": 4.20, "last5_era": 4.50, "hr_per9": 1.10, "strikeout_rate": 0.245,
        "innings_pitched": 96.0, "pitch_count_avg": 90, "whip": 1.30,
        "fip": 4.05, "opponent_avg": 0.255, "throws": "L",
    },
    1013: {
        "pitcher_id": 1013, "full_name": "Kevin Gausman", "team": "Toronto Blue Jays",
        "era": 3.55, "last5_era": 3.45, "hr_per9": 0.90, "strikeout_rate": 0.278,
        "innings_pitched": 100.0, "pitch_count_avg": 94, "whip": 1.12,
        "fip": 3.40, "opponent_avg": 0.236, "throws": "R",
    },
    1014: {
        "pitcher_id": 1014, "full_name": "Pablo Lopez", "team": "Minnesota Twins",
        "era": 3.60, "last5_era": 3.50, "hr_per9": 0.85, "strikeout_rate": 0.268,
        "innings_pitched": 103.0, "pitch_count_avg": 94, "whip": 1.10,
        "fip": 3.45, "opponent_avg": 0.234, "throws": "R",
    },
    1015: {
        "pitcher_id": 1015, "full_name": "Zack Wheeler", "team": "Philadelphia Phillies",
        "era": 3.00, "last5_era": 2.75, "hr_per9": 0.70, "strikeout_rate": 0.305,
        "innings_pitched": 114.0, "pitch_count_avg": 98, "whip": 1.00,
        "fip": 2.90, "opponent_avg": 0.212, "throws": "R",
    },
    1016: {
        "pitcher_id": 1016, "full_name": "Patrick Corbin", "team": "Washington Nationals",
        "era": 5.10, "last5_era": 5.40, "hr_per9": 1.40, "strikeout_rate": 0.185,
        "innings_pitched": 88.0, "pitch_count_avg": 87, "whip": 1.55,
        "fip": 5.25, "opponent_avg": 0.285, "throws": "L",
    },
    1017: {
        "pitcher_id": 1017, "full_name": "Freddy Peralta", "team": "Milwaukee Brewers",
        "era": 3.35, "last5_era": 3.15, "hr_per9": 0.80, "strikeout_rate": 0.312,
        "innings_pitched": 106.0, "pitch_count_avg": 95, "whip": 1.08,
        "fip": 3.18, "opponent_avg": 0.218, "throws": "R",
    },
    1018: {
        "pitcher_id": 1018, "full_name": "Miles Mikolas", "team": "St. Louis Cardinals",
        "era": 4.40, "last5_era": 4.60, "hr_per9": 1.05, "strikeout_rate": 0.218,
        "innings_pitched": 95.0, "pitch_count_avg": 90, "whip": 1.25,
        "fip": 4.30, "opponent_avg": 0.262, "throws": "R",
    },
    1019: {
        "pitcher_id": 1019, "full_name": "Luis Castillo", "team": "Seattle Mariners",
        "era": 3.20, "last5_era": 2.95, "hr_per9": 0.68, "strikeout_rate": 0.288,
        "innings_pitched": 110.0, "pitch_count_avg": 97, "whip": 1.05,
        "fip": 3.05, "opponent_avg": 0.228, "throws": "R",
    },
    1020: {
        "pitcher_id": 1020, "full_name": "Mason Miller", "team": "Oakland Athletics",
        "era": 4.80, "last5_era": 5.10, "hr_per9": 1.25, "strikeout_rate": 0.265,
        "innings_pitched": 90.0, "pitch_count_avg": 89, "whip": 1.40,
        "fip": 4.75, "opponent_avg": 0.268, "throws": "R",
    },
    1021: {
        "pitcher_id": 1021, "full_name": "Yu Darvish", "team": "San Diego Padres",
        "era": 4.10, "last5_era": 4.30, "hr_per9": 1.00, "strikeout_rate": 0.278,
        "innings_pitched": 97.0, "pitch_count_avg": 93, "whip": 1.18,
        "fip": 4.00, "opponent_avg": 0.248, "throws": "R",
    },
    1022: {
        "pitcher_id": 1022, "full_name": "Zac Gallen", "team": "Arizona Diamondbacks",
        "era": 3.05, "last5_era": 2.90, "hr_per9": 0.65, "strikeout_rate": 0.280,
        "innings_pitched": 108.0, "pitch_count_avg": 96, "whip": 1.02,
        "fip": 2.95, "opponent_avg": 0.222, "throws": "R",
    },
    1023: {
        "pitcher_id": 1023, "full_name": "Cole Ragans", "team": "Kansas City Royals",
        "era": 3.80, "last5_era": 3.65, "hr_per9": 0.92, "strikeout_rate": 0.268,
        "innings_pitched": 98.0, "pitch_count_avg": 93, "whip": 1.18,
        "fip": 3.68, "opponent_avg": 0.242, "throws": "L",
    },
    1024: {
        "pitcher_id": 1024, "full_name": "Dean Kremer", "team": "Baltimore Orioles",
        "era": 3.75, "last5_era": 3.80, "hr_per9": 0.88, "strikeout_rate": 0.255,
        "innings_pitched": 97.0, "pitch_count_avg": 92, "whip": 1.20,
        "fip": 3.70, "opponent_avg": 0.246, "throws": "R",
    },
}

# ==============================================================================
# MOCK: BULLPEN STATISTICS (per team)
# ==============================================================================
MOCK_BULLPEN_STATS: dict[int, dict] = {
    # Original 10 teams
    147: {"team": "New York Yankees",        "bullpen_era": 3.40, "whip": 1.18},
    111: {"team": "Boston Red Sox",          "bullpen_era": 4.10, "whip": 1.32},
    119: {"team": "Los Angeles Dodgers",     "bullpen_era": 3.10, "whip": 1.08},
    137: {"team": "San Francisco Giants",    "bullpen_era": 3.85, "whip": 1.25},
    117: {"team": "Houston Astros",          "bullpen_era": 3.20, "whip": 1.10},
    140: {"team": "Texas Rangers",           "bullpen_era": 3.75, "whip": 1.20},
    144: {"team": "Atlanta Braves",          "bullpen_era": 3.30, "whip": 1.12},
    121: {"team": "New York Mets",           "bullpen_era": 3.95, "whip": 1.28},
    115: {"team": "Colorado Rockies",        "bullpen_era": 5.20, "whip": 1.55},
    112: {"team": "Chicago Cubs",            "bullpen_era": 3.90, "whip": 1.22},
    # New 14 teams
    114: {"team": "Cleveland Guardians",     "bullpen_era": 3.55, "whip": 1.15},
    116: {"team": "Detroit Tigers",          "bullpen_era": 4.30, "whip": 1.35},
    141: {"team": "Toronto Blue Jays",       "bullpen_era": 3.70, "whip": 1.20},
    142: {"team": "Minnesota Twins",         "bullpen_era": 3.65, "whip": 1.18},
    143: {"team": "Philadelphia Phillies",   "bullpen_era": 3.25, "whip": 1.10},
    120: {"team": "Washington Nationals",    "bullpen_era": 4.80, "whip": 1.48},
    158: {"team": "Milwaukee Brewers",       "bullpen_era": 3.45, "whip": 1.14},
    138: {"team": "St. Louis Cardinals",     "bullpen_era": 4.10, "whip": 1.30},
    136: {"team": "Seattle Mariners",        "bullpen_era": 3.30, "whip": 1.10},
    133: {"team": "Oakland Athletics",       "bullpen_era": 4.90, "whip": 1.50},
    135: {"team": "San Diego Padres",        "bullpen_era": 3.50, "whip": 1.15},
    109: {"team": "Arizona Diamondbacks",    "bullpen_era": 3.60, "whip": 1.18},
    118: {"team": "Kansas City Royals",      "bullpen_era": 3.90, "whip": 1.25},
    110: {"team": "Baltimore Orioles",       "bullpen_era": 3.55, "whip": 1.16},
}

# ==============================================================================
# MOCK: TEAM OFFENSIVE STATS
# ==============================================================================
MOCK_TEAM_OFFENSE: dict[int, dict] = {
    # Original 10 teams
    147: {"team": "New York Yankees",        "runs_per_game": 5.05, "ops": 0.785},
    111: {"team": "Boston Red Sox",          "runs_per_game": 4.70, "ops": 0.748},
    119: {"team": "Los Angeles Dodgers",     "runs_per_game": 5.25, "ops": 0.802},
    137: {"team": "San Francisco Giants",    "runs_per_game": 4.20, "ops": 0.715},
    117: {"team": "Houston Astros",          "runs_per_game": 4.55, "ops": 0.740},
    140: {"team": "Texas Rangers",           "runs_per_game": 4.85, "ops": 0.768},
    144: {"team": "Atlanta Braves",          "runs_per_game": 5.10, "ops": 0.796},
    121: {"team": "New York Mets",           "runs_per_game": 4.40, "ops": 0.732},
    115: {"team": "Colorado Rockies",        "runs_per_game": 4.65, "ops": 0.745},
    112: {"team": "Chicago Cubs",            "runs_per_game": 4.50, "ops": 0.738},
    # New 14 teams
    114: {"team": "Cleveland Guardians",     "runs_per_game": 4.60, "ops": 0.742},
    116: {"team": "Detroit Tigers",          "runs_per_game": 4.10, "ops": 0.710},
    141: {"team": "Toronto Blue Jays",       "runs_per_game": 4.70, "ops": 0.755},
    142: {"team": "Minnesota Twins",         "runs_per_game": 4.65, "ops": 0.750},
    143: {"team": "Philadelphia Phillies",   "runs_per_game": 5.00, "ops": 0.792},
    120: {"team": "Washington Nationals",    "runs_per_game": 3.90, "ops": 0.700},
    158: {"team": "Milwaukee Brewers",       "runs_per_game": 4.55, "ops": 0.748},
    138: {"team": "St. Louis Cardinals",     "runs_per_game": 4.30, "ops": 0.728},
    136: {"team": "Seattle Mariners",        "runs_per_game": 4.45, "ops": 0.738},
    133: {"team": "Oakland Athletics",       "runs_per_game": 3.80, "ops": 0.692},
    135: {"team": "San Diego Padres",        "runs_per_game": 4.35, "ops": 0.730},
    109: {"team": "Arizona Diamondbacks",    "runs_per_game": 4.70, "ops": 0.758},
    118: {"team": "Kansas City Royals",      "runs_per_game": 4.40, "ops": 0.728},
    110: {"team": "Baltimore Orioles",       "runs_per_game": 4.80, "ops": 0.762},
}

# ==============================================================================
# MOCK: TEAM RECENT FORM (Last 10 Games)
# Strategy D — Moneyline Screener input
# ==============================================================================
MOCK_TEAM_FORM: dict[int, dict] = {
    147: {"team": "New York Yankees",        "last_10_wins": 7, "last_10_losses": 3},   # 70%
    111: {"team": "Boston Red Sox",          "last_10_wins": 5, "last_10_losses": 5},   # 50%
    119: {"team": "Los Angeles Dodgers",     "last_10_wins": 8, "last_10_losses": 2},   # 80%
    137: {"team": "San Francisco Giants",    "last_10_wins": 4, "last_10_losses": 6},   # 40%
    117: {"team": "Houston Astros",          "last_10_wins": 7, "last_10_losses": 3},   # 70%
    140: {"team": "Texas Rangers",           "last_10_wins": 5, "last_10_losses": 5},   # 50%
    144: {"team": "Atlanta Braves",          "last_10_wins": 8, "last_10_losses": 2},   # 80%
    121: {"team": "New York Mets",           "last_10_wins": 5, "last_10_losses": 5},   # 50%
    115: {"team": "Colorado Rockies",        "last_10_wins": 3, "last_10_losses": 7},   # 30%
    112: {"team": "Chicago Cubs",            "last_10_wins": 7, "last_10_losses": 3},   # 70%
    114: {"team": "Cleveland Guardians",     "last_10_wins": 6, "last_10_losses": 4},   # 60%
    116: {"team": "Detroit Tigers",          "last_10_wins": 4, "last_10_losses": 6},   # 40%
    141: {"team": "Toronto Blue Jays",       "last_10_wins": 5, "last_10_losses": 5},   # 50%
    142: {"team": "Minnesota Twins",         "last_10_wins": 5, "last_10_losses": 5},   # 50%
    143: {"team": "Philadelphia Phillies",   "last_10_wins": 7, "last_10_losses": 3},   # 70%
    120: {"team": "Washington Nationals",    "last_10_wins": 3, "last_10_losses": 7},   # 30%
    158: {"team": "Milwaukee Brewers",       "last_10_wins": 6, "last_10_losses": 4},   # 60%
    138: {"team": "St. Louis Cardinals",     "last_10_wins": 5, "last_10_losses": 5},   # 50%
    136: {"team": "Seattle Mariners",        "last_10_wins": 6, "last_10_losses": 4},   # 60%
    133: {"team": "Oakland Athletics",       "last_10_wins": 3, "last_10_losses": 7},   # 30%
    135: {"team": "San Diego Padres",        "last_10_wins": 5, "last_10_losses": 5},   # 50%
    109: {"team": "Arizona Diamondbacks",    "last_10_wins": 6, "last_10_losses": 4},   # 60%
    118: {"team": "Kansas City Royals",      "last_10_wins": 5, "last_10_losses": 5},   # 50%
    110: {"team": "Baltimore Orioles",       "last_10_wins": 5, "last_10_losses": 5},   # 50%
}

# ==============================================================================
# MOCK: TEAM OPS SPLITS (vs Right-Handed vs Left-Handed Pitchers)
# Strategy D — Moneyline Screener input
# ==============================================================================
MOCK_TEAM_OPS_SPLITS: dict[int, dict] = {
    # Format: ops_vs_rhp, ops_vs_lhp
    147: {"ops_vs_rhp": 0.800, "ops_vs_lhp": 0.768},   # NYY
    111: {"ops_vs_rhp": 0.730, "ops_vs_lhp": 0.718},   # BOS
    119: {"ops_vs_rhp": 0.825, "ops_vs_lhp": 0.798},   # LAD
    137: {"ops_vs_rhp": 0.710, "ops_vs_lhp": 0.698},   # SF
    117: {"ops_vs_rhp": 0.765, "ops_vs_lhp": 0.748},   # HOU
    140: {"ops_vs_rhp": 0.758, "ops_vs_lhp": 0.680},   # TEX — weaker vs LHP
    144: {"ops_vs_rhp": 0.802, "ops_vs_lhp": 0.788},   # ATL
    121: {"ops_vs_rhp": 0.720, "ops_vs_lhp": 0.712},   # NYM
    115: {"ops_vs_rhp": 0.742, "ops_vs_lhp": 0.695},   # COL — weaker vs LHP
    112: {"ops_vs_rhp": 0.748, "ops_vs_lhp": 0.775},   # CHC — stronger vs LHP
    114: {"ops_vs_rhp": 0.752, "ops_vs_lhp": 0.778},   # CLE — stronger vs LHP
    116: {"ops_vs_rhp": 0.695, "ops_vs_lhp": 0.688},   # DET
    141: {"ops_vs_rhp": 0.770, "ops_vs_lhp": 0.758},   # TOR
    142: {"ops_vs_rhp": 0.762, "ops_vs_lhp": 0.748},   # MIN
    143: {"ops_vs_rhp": 0.798, "ops_vs_lhp": 0.830},   # PHI — much stronger vs LHP
    120: {"ops_vs_rhp": 0.715, "ops_vs_lhp": 0.700},   # WSH
    158: {"ops_vs_rhp": 0.762, "ops_vs_lhp": 0.748},   # MIL
    138: {"ops_vs_rhp": 0.708, "ops_vs_lhp": 0.695},   # STL
    136: {"ops_vs_rhp": 0.775, "ops_vs_lhp": 0.758},   # SEA
    133: {"ops_vs_rhp": 0.685, "ops_vs_lhp": 0.670},   # OAK
    135: {"ops_vs_rhp": 0.735, "ops_vs_lhp": 0.722},   # SD
    109: {"ops_vs_rhp": 0.785, "ops_vs_lhp": 0.748},   # ARI — strong vs RHP
    118: {"ops_vs_rhp": 0.728, "ops_vs_lhp": 0.715},   # KC
    110: {"ops_vs_rhp": 0.748, "ops_vs_lhp": 0.732},   # BAL
}

# ==============================================================================
# MOCK: MONEYLINE ODDS (American format, per game)
# Strategy D — Moneyline Screener input
# Positive = underdog (+145), Negative = favorite (-165)
# ==============================================================================
MOCK_MONEYLINE_ODDS: dict[int, dict] = {
    9001: {"home_ml": -165, "away_ml": +145},   # NYY fav vs BOS
    9002: {"home_ml": -145, "away_ml": +125},   # LAD fav vs SF
    9003: {"home_ml": -148, "away_ml": +128},   # HOU fav vs TEX
    9004: {"home_ml": -145, "away_ml": +125},   # ATL fav vs NYM
    9005: {"home_ml": +165, "away_ml": -185},   # COL dog, CHC fav (road)
    9006: {"home_ml": -140, "away_ml": +120},   # CLE fav vs DET
    9007: {"home_ml": -110, "away_ml": -110},   # TOR/MIN near pick'em
    9008: {"home_ml": -195, "away_ml": +165},   # PHI heavy fav vs WSH
    9009: {"home_ml": -145, "away_ml": +125},   # MIL fav vs STL
    9010: {"home_ml": -168, "away_ml": +145},   # SEA fav vs OAK
    9011: {"home_ml": -145, "away_ml": +125},   # ARI fav vs SD
    9012: {"home_ml": -112, "away_ml": -108},   # BAL/KC near pick'em
}

# ==============================================================================
# MOCK: BATTER HEAD-TO-HEAD DATA (unchanged — Strategy A)
# ==============================================================================
MOCK_BATTER_H2H: list[dict] = [
    # Gerrit Cole (1001) opponents
    {
        "batter_id": 2001, "batter_name": "Rafael Devers", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 18, "career_hr_vs_pitcher": 0,
        "season_pa": 420, "season_hr": 12, "prev_season_pa": 580, "prev_season_hr": 18,
        "batting_avg": 0.278, "ops": 0.855,
    },
    {
        "batter_id": 2002, "batter_name": "Trevor Story", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 9, "career_hr_vs_pitcher": 0,
        "season_pa": 280, "season_hr": 4, "prev_season_pa": 390, "prev_season_hr": 8,
        "batting_avg": 0.241, "ops": 0.712,
    },
    {
        "batter_id": 2003, "batter_name": "Masataka Yoshida", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 6, "career_hr_vs_pitcher": 0,
        "season_pa": 380, "season_hr": 9, "prev_season_pa": 490, "prev_season_hr": 15,
        "batting_avg": 0.310, "ops": 0.862,
    },
    {
        "batter_id": 2004, "batter_name": "Rob Refsnyder", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 220, "season_hr": 2, "prev_season_pa": 310, "prev_season_hr": 5,
        "batting_avg": 0.262, "ops": 0.730,
    },
    # Logan Webb (1004) opponents
    {
        "batter_id": 2010, "batter_name": "J.D. Martinez", "team": "Los Angeles Dodgers", "team_id": 119,
        "pitcher_id": 1004, "pitcher_name": "Logan Webb",
        "career_pa_vs_pitcher": 14, "career_hr_vs_pitcher": 0,
        "season_pa": 390, "season_hr": 14, "prev_season_pa": 530, "prev_season_hr": 22,
        "batting_avg": 0.264, "ops": 0.818,
    },
    {
        "batter_id": 2011, "batter_name": "Enrique Hernandez", "team": "Los Angeles Dodgers", "team_id": 119,
        "pitcher_id": 1004, "pitcher_name": "Logan Webb",
        "career_pa_vs_pitcher": 10, "career_hr_vs_pitcher": 0,
        "season_pa": 290, "season_hr": 3, "prev_season_pa": 410, "prev_season_hr": 8,
        "batting_avg": 0.235, "ops": 0.688,
    },
    {
        "batter_id": 2012, "batter_name": "Max Muncy", "team": "Los Angeles Dodgers", "team_id": 119,
        "pitcher_id": 1004, "pitcher_name": "Logan Webb",
        "career_pa_vs_pitcher": 8, "career_hr_vs_pitcher": 0,
        "season_pa": 360, "season_hr": 18, "prev_season_pa": 440, "prev_season_hr": 21,
        "batting_avg": 0.218, "ops": 0.798,
    },
    # Framber Valdez (1005) opponents
    {
        "batter_id": 2020, "batter_name": "Marcus Semien", "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 22, "career_hr_vs_pitcher": 0,
        "season_pa": 430, "season_hr": 10, "prev_season_pa": 570, "prev_season_hr": 26,
        "batting_avg": 0.262, "ops": 0.772,
    },
    {
        "batter_id": 2021, "batter_name": "Leody Taveras", "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 7, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 5, "prev_season_pa": 420, "prev_season_hr": 8,
        "batting_avg": 0.255, "ops": 0.710,
    },
    {
        "batter_id": 2022, "batter_name": "Jonah Heim", "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 340, "season_hr": 12, "prev_season_pa": 410, "prev_season_hr": 16,
        "batting_avg": 0.248, "ops": 0.742,
    },
    {
        "batter_id": 2023, "batter_name": "Travis Jankowski", "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 180, "season_hr": 1, "prev_season_pa": 240, "prev_season_hr": 2,
        "batting_avg": 0.238, "ops": 0.645,
    },
    # Spencer Strider (1007) opponents
    {
        "batter_id": 2030, "batter_name": "Jose Iglesias", "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 6, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 4, "prev_season_pa": 420, "prev_season_hr": 7,
        "batting_avg": 0.288, "ops": 0.722,
    },
    {
        "batter_id": 2031, "batter_name": "Jeff McNeil", "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 12, "career_hr_vs_pitcher": 0,
        "season_pa": 380, "season_hr": 6, "prev_season_pa": 490, "prev_season_hr": 9,
        "batting_avg": 0.275, "ops": 0.745,
    },
    {
        "batter_id": 2032, "batter_name": "Brandon Nimmo", "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 9, "career_hr_vs_pitcher": 0,
        "season_pa": 400, "season_hr": 13, "prev_season_pa": 510, "prev_season_hr": 18,
        "batting_avg": 0.264, "ops": 0.793,
    },
    {
        "batter_id": 2033, "batter_name": "Mark Vientos", "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 290, "season_hr": 8, "prev_season_pa": 350, "prev_season_hr": 10,
        "batting_avg": 0.241, "ops": 0.748,
    },
    # Tyler Glasnow (1003) opponents
    {
        "batter_id": 2040, "batter_name": "Mike Yastrzemski", "team": "San Francisco Giants", "team_id": 137,
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow",
        "career_pa_vs_pitcher": 7, "career_hr_vs_pitcher": 0,
        "season_pa": 350, "season_hr": 10, "prev_season_pa": 440, "prev_season_hr": 12,
        "batting_avg": 0.242, "ops": 0.745,
    },
    {
        "batter_id": 2041, "batter_name": "Wilmer Flores", "team": "San Francisco Giants", "team_id": 137,
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 290, "season_hr": 8, "prev_season_pa": 380, "prev_season_hr": 11,
        "batting_avg": 0.258, "ops": 0.752,
    },
    {
        "batter_id": 2042, "batter_name": "LaMonte Wade Jr.", "team": "San Francisco Giants", "team_id": 137,
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 7, "prev_season_pa": 400, "prev_season_hr": 9,
        "batting_avg": 0.252, "ops": 0.730,
    },
    # Shane Bieber (1011) — new pitcher's opponents
    {
        "batter_id": 2050, "batter_name": "Riley Greene", "team": "Detroit Tigers", "team_id": 116,
        "pitcher_id": 1011, "pitcher_name": "Shane Bieber",
        "career_pa_vs_pitcher": 6, "career_hr_vs_pitcher": 0,
        "season_pa": 360, "season_hr": 8, "prev_season_pa": 440, "prev_season_hr": 10,
        "batting_avg": 0.268, "ops": 0.752,
    },
    {
        "batter_id": 2051, "batter_name": "Javier Baez", "team": "Detroit Tigers", "team_id": 116,
        "pitcher_id": 1011, "pitcher_name": "Shane Bieber",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 320, "season_hr": 5, "prev_season_pa": 400, "prev_season_hr": 8,
        "batting_avg": 0.235, "ops": 0.688,
    },
    # Luis Castillo (1019) — new pitcher's opponents
    {
        "batter_id": 2060, "batter_name": "Brent Rooker", "team": "Oakland Athletics", "team_id": 133,
        "pitcher_id": 1019, "pitcher_name": "Luis Castillo",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 350, "season_hr": 16, "prev_season_pa": 430, "prev_season_hr": 22,
        "batting_avg": 0.242, "ops": 0.792,
    },
    {
        "batter_id": 2061, "batter_name": "Zack Gelof", "team": "Oakland Athletics", "team_id": 133,
        "pitcher_id": 1019, "pitcher_name": "Luis Castillo",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 10, "prev_season_pa": 390, "prev_season_hr": 15,
        "batting_avg": 0.248, "ops": 0.755,
    },
    # Zack Wheeler (1015) opponents
    {
        "batter_id": 2070, "batter_name": "CJ Abrams", "team": "Washington Nationals", "team_id": 120,
        "pitcher_id": 1015, "pitcher_name": "Zack Wheeler",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 390, "season_hr": 7, "prev_season_pa": 480, "prev_season_hr": 11,
        "batting_avg": 0.275, "ops": 0.745,
    },
    {
        "batter_id": 2071, "batter_name": "Luis Garcia Jr.", "team": "Washington Nationals", "team_id": 120,
        "pitcher_id": 1015, "pitcher_name": "Zack Wheeler",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 350, "season_hr": 6, "prev_season_pa": 430, "prev_season_hr": 9,
        "batting_avg": 0.258, "ops": 0.720,
    },
    # Zac Gallen (1022) opponents
    {
        "batter_id": 2080, "batter_name": "Trent Grisham", "team": "San Diego Padres", "team_id": 135,
        "pitcher_id": 1022, "pitcher_name": "Zac Gallen",
        "career_pa_vs_pitcher": 6, "career_hr_vs_pitcher": 0,
        "season_pa": 320, "season_hr": 5, "prev_season_pa": 410, "prev_season_hr": 8,
        "batting_avg": 0.240, "ops": 0.698,
    },
    {
        "batter_id": 2081, "batter_name": "Ha-Seong Kim", "team": "San Diego Padres", "team_id": 135,
        "pitcher_id": 1022, "pitcher_name": "Zac Gallen",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 370, "season_hr": 9, "prev_season_pa": 450, "prev_season_hr": 12,
        "batting_avg": 0.256, "ops": 0.732,
    },
]

# ==============================================================================
# MOCK: OVER/UNDER SPORTSBOOK LINES (Strategy B — 12 games)
# ==============================================================================
MOCK_ODDS_LINES: dict[int, dict] = {
    9001: {"game_id": 9001, "matchup": "NYY vs BOS", "total_line": 8.5,  "book": "DraftKings"},
    9002: {"game_id": 9002, "matchup": "LAD vs SF",  "total_line": 7.5,  "book": "FanDuel"},
    9003: {"game_id": 9003, "matchup": "HOU vs TEX", "total_line": 8.0,  "book": "BetMGM"},
    9004: {"game_id": 9004, "matchup": "ATL vs NYM", "total_line": 8.0,  "book": "Caesars"},
    9005: {"game_id": 9005, "matchup": "COL vs CHC", "total_line": 10.5, "book": "DraftKings"},
    9006: {"game_id": 9006, "matchup": "CLE vs DET", "total_line": 8.0,  "book": "FanDuel"},
    9007: {"game_id": 9007, "matchup": "TOR vs MIN", "total_line": 8.5,  "book": "BetMGM"},
    9008: {"game_id": 9008, "matchup": "PHI vs WSH", "total_line": 9.0,  "book": "DraftKings"},
    9009: {"game_id": 9009, "matchup": "MIL vs STL", "total_line": 8.0,  "book": "Caesars"},
    9010: {"game_id": 9010, "matchup": "SEA vs OAK", "total_line": 8.5,  "book": "FanDuel"},
    9011: {"game_id": 9011, "matchup": "ARI vs SD",  "total_line": 8.0,  "book": "BetMGM"},
    9012: {"game_id": 9012, "matchup": "BAL vs KC",  "total_line": 8.5,  "book": "DraftKings"},
}

# ==============================================================================
# MOCK: WEATHER DATA (per venue) — Strategy B
# ==============================================================================
MOCK_WEATHER: dict[str, dict] = {
    "Yankee Stadium":       {"temp_f": 79.0, "wind_speed_mph": 6.0,  "wind_direction": "out",       "conditions": "Partly Cloudy"},
    "Dodger Stadium":       {"temp_f": 74.0, "wind_speed_mph": 4.0,  "wind_direction": "in",        "conditions": "Clear"},
    "Minute Maid Park":     {"temp_f": 92.0, "wind_speed_mph": 0.0,  "wind_direction": "none",      "conditions": "Retractable Roof"},
    "Truist Park":          {"temp_f": 82.0, "wind_speed_mph": 8.0,  "wind_direction": "in",        "conditions": "Mostly Clear"},
    "Coors Field":          {"temp_f": 88.0, "wind_speed_mph": 12.0, "wind_direction": "out",       "conditions": "Sunny"},
    "Progressive Field":    {"temp_f": 78.0, "wind_speed_mph": 5.0,  "wind_direction": "in",        "conditions": "Partly Cloudy"},
    "Rogers Centre":        {"temp_f": 72.0, "wind_speed_mph": 0.0,  "wind_direction": "none",      "conditions": "Dome"},
    "Citizens Bank Park":   {"temp_f": 83.0, "wind_speed_mph": 7.0,  "wind_direction": "out",       "conditions": "Mostly Clear"},
    "American Family Field":{"temp_f": 76.0, "wind_speed_mph": 9.0,  "wind_direction": "in",        "conditions": "Partly Cloudy"},
    "T-Mobile Park":        {"temp_f": 67.0, "wind_speed_mph": 5.0,  "wind_direction": "crosswind", "conditions": "Overcast"},
    "Chase Field":          {"temp_f": 92.0, "wind_speed_mph": 0.0,  "wind_direction": "none",      "conditions": "Retractable Roof"},
    "Camden Yards":         {"temp_f": 80.0, "wind_speed_mph": 6.0,  "wind_direction": "out",       "conditions": "Clear"},
}

# ==============================================================================
# MOCK: PITCHER PROPS CANDIDATES (Strategy C — Goblin Props)
# ==============================================================================
MOCK_PITCHER_PROPS: list[dict] = [
    {
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole", "team": "New York Yankees",
        "k_per9": 11.2, "avg_pitch_count": 97, "strikeout_prop_line": 6.5,
        "goblin_line": 5.5, "prop_recommendation": "Over 5.5 K (Goblin)",
    },
    {
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider", "team": "Atlanta Braves",
        "k_per9": 13.4, "avg_pitch_count": 96, "strikeout_prop_line": 7.5,
        "goblin_line": 6.5, "prop_recommendation": "Over 6.5 K (Goblin)",
    },
    {
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow", "team": "Los Angeles Dodgers",
        "k_per9": 11.8, "avg_pitch_count": 95, "strikeout_prop_line": 7.0,
        "goblin_line": 6.0, "prop_recommendation": "Over 6.0 K (Goblin)",
    },
    {
        "pitcher_id": 1004, "pitcher_name": "Logan Webb", "team": "San Francisco Giants",
        "k_per9": 7.5, "avg_pitch_count": 99, "strikeout_prop_line": 5.5,
        "goblin_line": 4.5, "prop_recommendation": "Over 4.5 K (Goblin)",
    },
    {
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez", "team": "Houston Astros",
        "k_per9": 8.8, "avg_pitch_count": 100, "strikeout_prop_line": 5.5,
        "goblin_line": 5.0, "prop_recommendation": "Over 5.0 K (Goblin)",
    },
    {
        "pitcher_id": 1015, "pitcher_name": "Zack Wheeler", "team": "Philadelphia Phillies",
        "k_per9": 10.4, "avg_pitch_count": 98, "strikeout_prop_line": 6.5,
        "goblin_line": 5.5, "prop_recommendation": "Over 5.5 K (Goblin)",
    },
    {
        "pitcher_id": 1019, "pitcher_name": "Luis Castillo", "team": "Seattle Mariners",
        "k_per9": 9.8, "avg_pitch_count": 97, "strikeout_prop_line": 6.0,
        "goblin_line": 5.0, "prop_recommendation": "Over 5.0 K (Goblin)",
    },
]

# ==============================================================================
# MOCK: BATTER ANCHOR PROPS (Strategy C)
# ==============================================================================
MOCK_BATTER_ANCHOR_PROPS: list[dict] = [
    {
        "batter_id": 2003, "batter_name": "Masataka Yoshida", "team": "Boston Red Sox",
        "opponent_pitcher": "Gerrit Cole", "opp_pitcher_opponent_avg": 0.198,
        "hits_prop_line": 0.5, "tb_prop_line": 1.5,
        "anchor_recommendation": "Over 0.5 Hits", "paired_with": "Gerrit Cole Over 5.5 K",
        "pair_confidence": "High",
    },
    {
        "batter_id": 2030, "batter_name": "Jose Iglesias", "team": "New York Mets",
        "opponent_pitcher": "Spencer Strider", "opp_pitcher_opponent_avg": 0.195,
        "hits_prop_line": 0.5, "tb_prop_line": 1.5,
        "anchor_recommendation": "Over 0.5 Hits", "paired_with": "Spencer Strider Over 6.5 K",
        "pair_confidence": "High",
    },
    {
        "batter_id": 2011, "batter_name": "Enrique Hernandez", "team": "Los Angeles Dodgers",
        "opponent_pitcher": "Logan Webb", "opp_pitcher_opponent_avg": 0.236,
        "hits_prop_line": 0.5, "tb_prop_line": 1.5,
        "anchor_recommendation": "Over 0.5 Hits", "paired_with": "Logan Webb Over 4.5 K",
        "pair_confidence": "Medium",
    },
]


# ==============================================================================
# DATE-AWARE ACCESSORS (for data_fetcher compatibility)
# ==============================================================================

def get_mock_games(date_str: str) -> list[dict]:
    """
    Return the mock game slate for any requested date.
    In offline / mock mode the same 12-game slate is used regardless of date.
    """
    import logging as _logging
    _logging.getLogger(__name__).info(
        "Mock data serving %d games for date %s.", len(MOCK_GAMES), date_str
    )
    return list(MOCK_GAMES)


def get_mock_odds_for_date(date_str: str) -> dict:
    """Return mock O/U odds lines for any requested date."""
    return dict(MOCK_ODDS_LINES)

 
