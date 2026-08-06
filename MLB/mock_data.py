"""
mock_data.py
============
Fallback engine with structured mock data.
Automatically activates if any live API fails or is rate-limited.
All data is realistic and representative of a typical MLB slate.
"""

from __future__ import annotations

# ==============================================================================
# MOCK: TODAY'S SCHEDULED GAMES
# ==============================================================================
MOCK_GAMES: list[dict] = [
    {
        "game_id": 9001,
        "home_team": "New York Yankees",
        "away_team": "Boston Red Sox",
        "home_team_id": 147,
        "away_team_id": 111,
        "venue": "Yankee Stadium",
        "game_datetime": "2026-08-06T23:05:00Z",
        "home_starter_id": 1001,
        "away_starter_id": 1002,
        "home_starter_name": "Gerrit Cole",
        "away_starter_name": "Brayan Bello",
    },
    {
        "game_id": 9002,
        "home_team": "Los Angeles Dodgers",
        "away_team": "San Francisco Giants",
        "home_team_id": 119,
        "away_team_id": 137,
        "venue": "Dodger Stadium",
        "game_datetime": "2026-08-07T02:10:00Z",
        "home_starter_id": 1003,
        "away_starter_id": 1004,
        "home_starter_name": "Tyler Glasnow",
        "away_starter_name": "Logan Webb",
    },
    {
        "game_id": 9003,
        "home_team": "Houston Astros",
        "away_team": "Texas Rangers",
        "home_team_id": 117,
        "away_team_id": 140,
        "venue": "Minute Maid Park",
        "game_datetime": "2026-08-07T00:10:00Z",
        "home_starter_id": 1005,
        "away_starter_id": 1006,
        "home_starter_name": "Framber Valdez",
        "away_starter_name": "Nathan Eovaldi",
    },
    {
        "game_id": 9004,
        "home_team": "Atlanta Braves",
        "away_team": "New York Mets",
        "home_team_id": 144,
        "away_team_id": 121,
        "venue": "Truist Park",
        "game_datetime": "2026-08-06T23:20:00Z",
        "home_starter_id": 1007,
        "away_starter_id": 1008,
        "home_starter_name": "Spencer Strider",
        "away_starter_name": "Kodai Senga",
    },
    {
        "game_id": 9005,
        "home_team": "Colorado Rockies",
        "away_team": "Chicago Cubs",
        "home_team_id": 115,
        "away_team_id": 112,
        "venue": "Coors Field",
        "game_datetime": "2026-08-07T01:10:00Z",
        "home_starter_id": 1009,
        "away_starter_id": 1010,
        "home_starter_name": "Kyle Freeland",
        "away_starter_name": "Justin Steele",
    },
]

# ==============================================================================
# MOCK: PITCHER STATISTICS (Season + Recent)
# ==============================================================================
MOCK_PITCHER_STATS: dict[int, dict] = {
    # Gerrit Cole — Elite, low HR/9
    1001: {
        "pitcher_id": 1001,
        "full_name": "Gerrit Cole",
        "team": "New York Yankees",
        "era": 2.85,
        "last5_era": 2.40,
        "hr_per9": 0.65,
        "strikeout_rate": 0.315,   # K%
        "innings_pitched": 112.0,
        "pitch_count_avg": 97,
        "whip": 0.97,
        "fip": 2.71,
        "opponent_avg": 0.198,
    },
    # Brayan Bello
    1002: {
        "pitcher_id": 1002,
        "full_name": "Brayan Bello",
        "team": "Boston Red Sox",
        "era": 4.10,
        "last5_era": 3.90,
        "hr_per9": 1.05,
        "strikeout_rate": 0.235,
        "innings_pitched": 98.0,
        "pitch_count_avg": 88,
        "whip": 1.28,
        "fip": 4.00,
        "opponent_avg": 0.248,
    },
    # Tyler Glasnow — Elite, low HR/9
    1003: {
        "pitcher_id": 1003,
        "full_name": "Tyler Glasnow",
        "team": "Los Angeles Dodgers",
        "era": 3.05,
        "last5_era": 2.65,
        "hr_per9": 0.72,
        "strikeout_rate": 0.342,
        "innings_pitched": 105.0,
        "pitch_count_avg": 95,
        "whip": 1.02,
        "fip": 2.89,
        "opponent_avg": 0.204,
    },
    # Logan Webb — Ground ball, very low HR/9
    1004: {
        "pitcher_id": 1004,
        "full_name": "Logan Webb",
        "team": "San Francisco Giants",
        "era": 3.25,
        "last5_era": 3.00,
        "hr_per9": 0.58,
        "strikeout_rate": 0.228,
        "innings_pitched": 115.0,
        "pitch_count_avg": 99,
        "whip": 1.08,
        "fip": 3.12,
        "opponent_avg": 0.236,
    },
    # Framber Valdez — Sinker, low HR/9
    1005: {
        "pitcher_id": 1005,
        "full_name": "Framber Valdez",
        "team": "Houston Astros",
        "era": 3.15,
        "last5_era": 2.80,
        "hr_per9": 0.62,
        "strikeout_rate": 0.262,
        "innings_pitched": 118.0,
        "pitch_count_avg": 100,
        "whip": 1.14,
        "fip": 3.05,
        "opponent_avg": 0.241,
    },
    # Nathan Eovaldi
    1006: {
        "pitcher_id": 1006,
        "full_name": "Nathan Eovaldi",
        "team": "Texas Rangers",
        "era": 3.80,
        "last5_era": 4.10,
        "hr_per9": 0.95,
        "strikeout_rate": 0.248,
        "innings_pitched": 95.0,
        "pitch_count_avg": 91,
        "whip": 1.21,
        "fip": 3.75,
        "opponent_avg": 0.245,
    },
    # Spencer Strider — Elite strikeouts, decent HR/9
    1007: {
        "pitcher_id": 1007,
        "full_name": "Spencer Strider",
        "team": "Atlanta Braves",
        "era": 3.10,
        "last5_era": 2.75,
        "hr_per9": 0.78,
        "strikeout_rate": 0.388,
        "innings_pitched": 109.0,
        "pitch_count_avg": 96,
        "whip": 1.00,
        "fip": 2.80,
        "opponent_avg": 0.195,
    },
    # Kodai Senga
    1008: {
        "pitcher_id": 1008,
        "full_name": "Kodai Senga",
        "team": "New York Mets",
        "era": 3.55,
        "last5_era": 3.20,
        "hr_per9": 0.75,
        "strikeout_rate": 0.298,
        "innings_pitched": 88.0,
        "pitch_count_avg": 92,
        "whip": 1.10,
        "fip": 3.20,
        "opponent_avg": 0.218,
    },
    # Kyle Freeland — Extreme park effect pitcher
    1009: {
        "pitcher_id": 1009,
        "full_name": "Kyle Freeland",
        "team": "Colorado Rockies",
        "era": 4.80,
        "last5_era": 5.20,
        "hr_per9": 1.30,
        "strikeout_rate": 0.182,
        "innings_pitched": 85.0,
        "pitch_count_avg": 85,
        "whip": 1.45,
        "fip": 5.10,
        "opponent_avg": 0.278,
    },
    # Justin Steele — Solid lefty
    1010: {
        "pitcher_id": 1010,
        "full_name": "Justin Steele",
        "team": "Chicago Cubs",
        "era": 3.65,
        "last5_era": 3.50,
        "hr_per9": 0.88,
        "strikeout_rate": 0.272,
        "innings_pitched": 102.0,
        "pitch_count_avg": 93,
        "whip": 1.16,
        "fip": 3.55,
        "opponent_avg": 0.238,
    },
}

# ==============================================================================
# MOCK: BULLPEN STATISTICS (per team)
# ==============================================================================
MOCK_BULLPEN_STATS: dict[int, dict] = {
    147: {"team": "New York Yankees",      "bullpen_era": 3.40, "whip": 1.18},
    111: {"team": "Boston Red Sox",        "bullpen_era": 4.10, "whip": 1.32},
    119: {"team": "Los Angeles Dodgers",   "bullpen_era": 3.10, "whip": 1.08},
    137: {"team": "San Francisco Giants",  "bullpen_era": 3.85, "whip": 1.25},
    117: {"team": "Houston Astros",        "bullpen_era": 3.20, "whip": 1.10},
    140: {"team": "Texas Rangers",         "bullpen_era": 3.75, "whip": 1.20},
    144: {"team": "Atlanta Braves",        "bullpen_era": 3.30, "whip": 1.12},
    121: {"team": "New York Mets",         "bullpen_era": 3.95, "whip": 1.28},
    115: {"team": "Colorado Rockies",      "bullpen_era": 5.20, "whip": 1.55},
    112: {"team": "Chicago Cubs",          "bullpen_era": 3.90, "whip": 1.22},
}

# ==============================================================================
# MOCK: TEAM OFFENSIVE STATS
# ==============================================================================
MOCK_TEAM_OFFENSE: dict[int, dict] = {
    147: {"team": "New York Yankees",      "runs_per_game": 5.05, "ops": 0.785},
    111: {"team": "Boston Red Sox",        "runs_per_game": 4.70, "ops": 0.748},
    119: {"team": "Los Angeles Dodgers",   "runs_per_game": 5.25, "ops": 0.802},
    137: {"team": "San Francisco Giants",  "runs_per_game": 4.20, "ops": 0.715},
    117: {"team": "Houston Astros",        "runs_per_game": 4.55, "ops": 0.740},
    140: {"team": "Texas Rangers",         "runs_per_game": 4.85, "ops": 0.768},
    144: {"team": "Atlanta Braves",        "runs_per_game": 5.10, "ops": 0.796},
    121: {"team": "New York Mets",         "runs_per_game": 4.40, "ops": 0.732},
    115: {"team": "Colorado Rockies",      "runs_per_game": 4.65, "ops": 0.745},
    112: {"team": "Chicago Cubs",          "runs_per_game": 4.50, "ops": 0.738},
}

# ==============================================================================
# MOCK: BATTER STATS & HEAD-TO-HEAD DATA
# ==============================================================================
MOCK_BATTER_H2H: list[dict] = [
    # Gerrit Cole (1001) opponents
    {
        "batter_id": 2001, "batter_name": "Rafael Devers",
        "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 18, "career_hr_vs_pitcher": 0,
        "season_pa": 420, "season_hr": 12,
        "prev_season_pa": 580, "prev_season_hr": 18,
        "batting_avg": 0.278, "ops": 0.855,
    },
    {
        "batter_id": 2002, "batter_name": "Trevor Story",
        "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 9, "career_hr_vs_pitcher": 0,
        "season_pa": 280, "season_hr": 4,
        "prev_season_pa": 390, "prev_season_hr": 8,
        "batting_avg": 0.241, "ops": 0.712,
    },
    {
        "batter_id": 2003, "batter_name": "Masataka Yoshida",
        "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 6, "career_hr_vs_pitcher": 0,
        "season_pa": 380, "season_hr": 9,
        "prev_season_pa": 490, "prev_season_hr": 15,
        "batting_avg": 0.310, "ops": 0.862,
    },
    {
        "batter_id": 2004, "batter_name": "Rob Refsnyder",
        "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 220, "season_hr": 2,
        "prev_season_pa": 310, "prev_season_hr": 5,
        "batting_avg": 0.262, "ops": 0.730,
    },
    # Logan Webb (1004) opponents
    {
        "batter_id": 2010, "batter_name": "J.D. Martinez",
        "team": "Los Angeles Dodgers", "team_id": 119,
        "pitcher_id": 1004, "pitcher_name": "Logan Webb",
        "career_pa_vs_pitcher": 14, "career_hr_vs_pitcher": 0,
        "season_pa": 390, "season_hr": 14,
        "prev_season_pa": 530, "prev_season_hr": 22,
        "batting_avg": 0.264, "ops": 0.818,
    },
    {
        "batter_id": 2011, "batter_name": "Enrique Hernandez",
        "team": "Los Angeles Dodgers", "team_id": 119,
        "pitcher_id": 1004, "pitcher_name": "Logan Webb",
        "career_pa_vs_pitcher": 10, "career_hr_vs_pitcher": 0,
        "season_pa": 290, "season_hr": 3,
        "prev_season_pa": 410, "prev_season_hr": 8,
        "batting_avg": 0.235, "ops": 0.688,
    },
    {
        "batter_id": 2012, "batter_name": "Max Muncy",
        "team": "Los Angeles Dodgers", "team_id": 119,
        "pitcher_id": 1004, "pitcher_name": "Logan Webb",
        "career_pa_vs_pitcher": 8, "career_hr_vs_pitcher": 0,
        "season_pa": 360, "season_hr": 18,
        "prev_season_pa": 440, "prev_season_hr": 21,
        "batting_avg": 0.218, "ops": 0.798,
    },
    # Framber Valdez (1005) opponents
    {
        "batter_id": 2020, "batter_name": "Marcus Semien",
        "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 22, "career_hr_vs_pitcher": 0,
        "season_pa": 430, "season_hr": 10,
        "prev_season_pa": 570, "prev_season_hr": 26,
        "batting_avg": 0.262, "ops": 0.772,
    },
    {
        "batter_id": 2021, "batter_name": "Leody Taveras",
        "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 7, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 5,
        "prev_season_pa": 420, "prev_season_hr": 8,
        "batting_avg": 0.255, "ops": 0.710,
    },
    {
        "batter_id": 2022, "batter_name": "Jonah Heim",
        "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 340, "season_hr": 12,
        "prev_season_pa": 410, "prev_season_hr": 16,
        "batting_avg": 0.248, "ops": 0.742,
    },
    {
        "batter_id": 2023, "batter_name": "Travis Jankowski",
        "team": "Texas Rangers", "team_id": 140,
        "pitcher_id": 1005, "pitcher_name": "Framber Valdez",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 180, "season_hr": 1,
        "prev_season_pa": 240, "prev_season_hr": 2,
        "batting_avg": 0.238, "ops": 0.645,
    },
    # Spencer Strider (1007) opponents
    {
        "batter_id": 2030, "batter_name": "Jose Iglesias",
        "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 6, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 4,
        "prev_season_pa": 420, "prev_season_hr": 7,
        "batting_avg": 0.288, "ops": 0.722,
    },
    {
        "batter_id": 2031, "batter_name": "Jeff McNeil",
        "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 12, "career_hr_vs_pitcher": 0,
        "season_pa": 380, "season_hr": 6,
        "prev_season_pa": 490, "prev_season_hr": 9,
        "batting_avg": 0.275, "ops": 0.745,
    },
    {
        "batter_id": 2032, "batter_name": "Brandon Nimmo",
        "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 9, "career_hr_vs_pitcher": 0,
        "season_pa": 400, "season_hr": 13,
        "prev_season_pa": 510, "prev_season_hr": 18,
        "batting_avg": 0.264, "ops": 0.793,
    },
    {
        "batter_id": 2033, "batter_name": "Mark Vientos",
        "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 290, "season_hr": 8,
        "prev_season_pa": 350, "prev_season_hr": 10,
        "batting_avg": 0.241, "ops": 0.748,
    },
    # Tyler Glasnow (1003) opponents — Giants
    {
        "batter_id": 2040, "batter_name": "Mike Yastrzemski",
        "team": "San Francisco Giants", "team_id": 137,
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow",
        "career_pa_vs_pitcher": 7, "career_hr_vs_pitcher": 0,
        "season_pa": 350, "season_hr": 10,
        "prev_season_pa": 440, "prev_season_hr": 12,
        "batting_avg": 0.242, "ops": 0.745,
    },
    {
        "batter_id": 2041, "batter_name": "Wilmer Flores",
        "team": "San Francisco Giants", "team_id": 137,
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow",
        "career_pa_vs_pitcher": 5, "career_hr_vs_pitcher": 0,
        "season_pa": 290, "season_hr": 8,
        "prev_season_pa": 380, "prev_season_hr": 11,
        "batting_avg": 0.258, "ops": 0.752,
    },
    {
        "batter_id": 2042, "batter_name": "LaMonte Wade Jr.",
        "team": "San Francisco Giants", "team_id": 137,
        "pitcher_id": 1003, "pitcher_name": "Tyler Glasnow",
        "career_pa_vs_pitcher": 4, "career_hr_vs_pitcher": 0,
        "season_pa": 310, "season_hr": 7,
        "prev_season_pa": 400, "prev_season_hr": 9,
        "batting_avg": 0.252, "ops": 0.730,
    },
]

# ==============================================================================
# MOCK: OVER/UNDER SPORTSBOOK LINES (from The Odds API equivalent)
# ==============================================================================
MOCK_ODDS_LINES: dict[int, dict] = {
    9001: {"game_id": 9001, "matchup": "NYY vs BOS", "total_line": 8.5,  "book": "DraftKings"},
    9002: {"game_id": 9002, "matchup": "LAD vs SF",  "total_line": 7.5,  "book": "FanDuel"},
    9003: {"game_id": 9003, "matchup": "HOU vs TEX", "total_line": 8.0,  "book": "BetMGM"},
    9004: {"game_id": 9004, "matchup": "ATL vs NYM", "total_line": 8.0,  "book": "Caesars"},
    9005: {"game_id": 9005, "matchup": "COL vs CHC", "total_line": 10.5, "book": "DraftKings"},
}

# ==============================================================================
# MOCK: WEATHER DATA (per venue) — approximated for today's date
# ==============================================================================
MOCK_WEATHER: dict[str, dict] = {
    "Yankee Stadium": {
        "temp_f": 79.0,
        "wind_speed_mph": 6.0,
        "wind_direction": "out",   # relative to home plate
        "conditions": "Partly Cloudy",
    },
    "Dodger Stadium": {
        "temp_f": 74.0,
        "wind_speed_mph": 4.0,
        "wind_direction": "in",
        "conditions": "Clear",
    },
    "Minute Maid Park": {
        "temp_f": 92.0,            # indoor — roof closed most games
        "wind_speed_mph": 0.0,
        "wind_direction": "none",
        "conditions": "Retractable Roof",
    },
    "Truist Park": {
        "temp_f": 82.0,
        "wind_speed_mph": 8.0,
        "wind_direction": "in",
        "conditions": "Mostly Clear",
    },
    "Coors Field": {
        "temp_f": 88.0,
        "wind_speed_mph": 12.0,
        "wind_direction": "out",   # typical Denver afternoon wind
        "conditions": "Sunny",
    },
}

# ==============================================================================
# MOCK: PITCHER PROPS CANDIDATES (Goblin Props / Anchor Props)
# ==============================================================================
MOCK_PITCHER_PROPS: list[dict] = [
    {
        "pitcher_id": 1001,
        "pitcher_name": "Gerrit Cole",
        "team": "New York Yankees",
        "k_per9": 11.2,
        "avg_pitch_count": 97,
        "strikeout_prop_line": 6.5,   # Alt line (Goblin: Over 5.5 K)
        "goblin_line": 5.5,
        "prop_recommendation": "Over 5.5 K (Goblin)",
    },
    {
        "pitcher_id": 1007,
        "pitcher_name": "Spencer Strider",
        "team": "Atlanta Braves",
        "k_per9": 13.4,
        "avg_pitch_count": 96,
        "strikeout_prop_line": 7.5,
        "goblin_line": 6.5,
        "prop_recommendation": "Over 6.5 K (Goblin)",
    },
    {
        "pitcher_id": 1003,
        "pitcher_name": "Tyler Glasnow",
        "team": "Los Angeles Dodgers",
        "k_per9": 11.8,
        "avg_pitch_count": 95,
        "strikeout_prop_line": 7.0,
        "goblin_line": 6.0,
        "prop_recommendation": "Over 6.0 K (Goblin)",
    },
    {
        "pitcher_id": 1004,
        "pitcher_name": "Logan Webb",
        "team": "San Francisco Giants",
        "k_per9": 7.5,
        "avg_pitch_count": 99,
        "strikeout_prop_line": 5.5,
        "goblin_line": 4.5,
        "prop_recommendation": "Over 4.5 K (Goblin)",
    },
    {
        "pitcher_id": 1005,
        "pitcher_name": "Framber Valdez",
        "team": "Houston Astros",
        "k_per9": 8.8,
        "avg_pitch_count": 100,
        "strikeout_prop_line": 5.5,
        "goblin_line": 5.0,
        "prop_recommendation": "Over 5.0 K (Goblin)",
    },
]

# ==============================================================================
# MOCK: BATTER ANCHOR PROPS
# ==============================================================================
MOCK_BATTER_ANCHOR_PROPS: list[dict] = [
    {
        "batter_id": 2003,
        "batter_name": "Masataka Yoshida",
        "team": "Boston Red Sox",
        "opponent_pitcher": "Gerrit Cole",
        "opp_pitcher_opponent_avg": 0.198,
        "hits_prop_line": 0.5,          # Anchor: Over 0.5 hits
        "tb_prop_line": 1.5,
        "anchor_recommendation": "Over 0.5 Hits",
        "paired_with": "Gerrit Cole Over 5.5 K",
        "pair_confidence": "High",
    },
    {
        "batter_id": 2030,
        "batter_name": "Jose Iglesias",
        "team": "New York Mets",
        "opponent_pitcher": "Spencer Strider",
        "opp_pitcher_opponent_avg": 0.195,
        "hits_prop_line": 0.5,
        "tb_prop_line": 1.5,
        "anchor_recommendation": "Over 0.5 Hits",
        "paired_with": "Spencer Strider Over 6.5 K",
        "pair_confidence": "High",
    },
    {
        "batter_id": 2011,
        "batter_name": "Enrique Hernandez",
        "team": "Los Angeles Dodgers",
        "opponent_pitcher": "Logan Webb",
        "opp_pitcher_opponent_avg": 0.236,
        "hits_prop_line": 0.5,
        "tb_prop_line": 1.5,
        "anchor_recommendation": "Over 0.5 Hits",
        "paired_with": "Logan Webb Over 4.5 K",
        "pair_confidence": "Medium",
    },
]
