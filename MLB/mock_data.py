"""
mock_data.py
============
Fallback engine with structured mock data v4.0.
Contains:
  1. Full 15-Match Slate (30 teams) for Ultimate Slate-Wide Analysis
  2. Historical H-4 to H-1 Game Results (for 4-Day Calibration Engine)
  3. Sportsbook Line Shopping Odds (BetMGM, DraftKings, Caesars, FanDuel, ESPN Bet)
  4. Pitcher Stats (Season, L5, L3 trend, WHIP, HR/9, K/9)
  5. Team Offense (RPG, HR/Game, OPS Splits) & Bullpen Stats
  6. Batter H2H Stats (AB, Hits, BA vs SP, K%)
"""

from __future__ import annotations

# ==============================================================================
# MOCK: 15-MATCH FULL SLATE (30 MLB Teams)
# ==============================================================================
MOCK_GAMES: list[dict] = [
    # AL East vs AL East
    {
        "game_id": 9001, "home_team": "New York Yankees", "away_team": "Boston Red Sox",
        "home_team_id": 147, "away_team_id": 111, "venue": "Yankee Stadium",
        "game_datetime": "2026-08-07T23:05:00Z",
        "home_starter_id": 1001, "away_starter_id": 1002,
        "home_starter_name": "Gerrit Cole", "away_starter_name": "Brayan Bello",
    },
    {
        "game_id": 9002, "home_team": "Baltimore Orioles", "away_team": "Toronto Blue Jays",
        "home_team_id": 110, "away_team_id": 141, "venue": "Camden Yards",
        "game_datetime": "2026-08-07T23:05:00Z",
        "home_starter_id": 1024, "away_starter_id": 1013,
        "home_starter_name": "Dean Kremer", "away_starter_name": "Kevin Gausman",
    },
    {
        "game_id": 9003, "home_team": "Tampa Bay Rays", "away_team": "Washington Nationals",
        "home_team_id": 139, "away_team_id": 120, "venue": "Tropicana Field",
        "game_datetime": "2026-08-07T23:10:00Z",
        "home_starter_id": 1025, "away_starter_id": 1016,
        "home_starter_name": "Zach Eflin", "away_starter_name": "Patrick Corbin",
    },
    # NL East vs NL East
    {
        "game_id": 9004, "home_team": "Philadelphia Phillies", "away_team": "Miami Marlins",
        "home_team_id": 143, "away_team_id": 146, "venue": "Citizens Bank Park",
        "game_datetime": "2026-08-07T23:05:00Z",
        "home_starter_id": 1015, "away_starter_id": 1026,
        "home_starter_name": "Zack Wheeler", "away_starter_name": "Sandy Alcantara",
    },
    {
        "game_id": 9005, "home_team": "Atlanta Braves", "away_team": "New York Mets",
        "home_team_id": 144, "away_team_id": 121, "venue": "Truist Park",
        "game_datetime": "2026-08-07T23:20:00Z",
        "home_starter_id": 1007, "away_starter_id": 1008,
        "home_starter_name": "Spencer Strider", "away_starter_name": "Kodai Senga",
    },
    # AL Central vs AL Central
    {
        "game_id": 9006, "home_team": "Cleveland Guardians", "away_team": "Detroit Tigers",
        "home_team_id": 114, "away_team_id": 116, "venue": "Progressive Field",
        "game_datetime": "2026-08-07T23:10:00Z",
        "home_starter_id": 1011, "away_starter_id": 1012,
        "home_starter_name": "Shane Bieber", "away_starter_name": "Eduardo Rodriguez",
    },
    {
        "game_id": 9007, "home_team": "Minnesota Twins", "away_team": "Kansas City Royals",
        "home_team_id": 142, "away_team_id": 118, "venue": "Target Field",
        "game_datetime": "2026-08-07T23:10:00Z",
        "home_starter_id": 1014, "away_starter_id": 1023,
        "home_starter_name": "Pablo Lopez", "away_starter_name": "Cole Ragans",
    },
    {
        "game_id": 9008, "home_team": "Chicago White Sox", "away_team": "Colorado Rockies",
        "home_team_id": 145, "away_team_id": 115, "venue": "Guaranteed Rate Field",
        "game_datetime": "2026-08-08T00:10:00Z",
        "home_starter_id": 1027, "away_starter_id": 1009,
        "home_starter_name": "Garrett Crochet", "away_starter_name": "Kyle Freeland",
    },
    # NL Central vs NL Central
    {
        "game_id": 9009, "home_team": "Milwaukee Brewers", "away_team": "St. Louis Cardinals",
        "home_team_id": 158, "away_team_id": 138, "venue": "American Family Field",
        "game_datetime": "2026-08-08T00:10:00Z",
        "home_starter_id": 1017, "away_starter_id": 1018,
        "home_starter_name": "Freddy Peralta", "away_starter_name": "Miles Mikolas",
    },
    {
        "game_id": 9010, "home_team": "Chicago Cubs", "away_team": "Pittsburgh Pirates",
        "home_team_id": 112, "away_team_id": 134, "venue": "Wrigley Field",
        "game_datetime": "2026-08-08T00:05:00Z",
        "home_starter_id": 1010, "away_starter_id": 1028,
        "home_starter_name": "Justin Steele", "away_starter_name": "Mitch Keller",
    },
    # AL West vs AL West
    {
        "game_id": 9011, "home_team": "Houston Astros", "away_team": "Texas Rangers",
        "home_team_id": 117, "away_team_id": 140, "venue": "Minute Maid Park",
        "game_datetime": "2026-08-08T00:10:00Z",
        "home_starter_id": 1005, "away_starter_id": 1006,
        "home_starter_name": "Framber Valdez", "away_starter_name": "Nathan Eovaldi",
    },
    {
        "game_id": 9012, "home_team": "Seattle Mariners", "away_team": "Oakland Athletics",
        "home_team_id": 136, "away_team_id": 133, "venue": "T-Mobile Park",
        "game_datetime": "2026-08-08T02:10:00Z",
        "home_starter_id": 1019, "away_starter_id": 1020,
        "home_starter_name": "Luis Castillo", "away_starter_name": "Mason Miller",
    },
    {
        "game_id": 9013, "home_team": "Los Angeles Angels", "away_team": "Cincinnati Reds",
        "home_team_id": 108, "away_team_id": 113, "venue": "Angel Stadium",
        "game_datetime": "2026-08-08T01:38:00Z",
        "home_starter_id": 1029, "away_starter_id": 1030,
        "home_starter_name": "Tyler Anderson", "away_starter_name": "Hunter Greene",
    },
    # NL West vs NL West
    {
        "game_id": 9014, "home_team": "Los Angeles Dodgers", "away_team": "San Francisco Giants",
        "home_team_id": 119, "away_team_id": 137, "venue": "Dodger Stadium",
        "game_datetime": "2026-08-08T02:10:00Z",
        "home_starter_id": 1003, "away_starter_id": 1004,
        "home_starter_name": "Tyler Glasnow", "away_starter_name": "Logan Webb",
    },
    {
        "game_id": 9015, "home_team": "Arizona Diamondbacks", "away_team": "San Diego Padres",
        "home_team_id": 109, "away_team_id": 135, "venue": "Chase Field",
        "game_datetime": "2026-08-08T02:40:00Z",
        "home_starter_id": 1022, "away_starter_id": 1021,
        "home_starter_name": "Zac Gallen", "away_starter_name": "Yu Darvish",
    },
]

# ==============================================================================
# MOCK: LINE SHOPPING DATA ACROSS SPORTSBOOKS
# ==============================================================================
MOCK_LINE_SHOPPING: dict[int, dict] = {
    9001: {
        "home_team": "New York Yankees", "away_team": "Boston Red Sox",
        "DraftKings": {"home_ml": -140, "away_ml": +120},
        "BetMGM":     {"home_ml": -145, "away_ml": +125},
        "Caesars":    {"home_ml": -138, "away_ml": +118},
        "FanDuel":    {"home_ml": -142, "away_ml": +122},
        "ESPN Bet":   {"home_ml": -140, "away_ml": +120},
    },
    9002: {
        "home_team": "Baltimore Orioles", "away_team": "Toronto Blue Jays",
        "DraftKings": {"home_ml": -115, "away_ml": -105},
        "BetMGM":     {"home_ml": -110, "away_ml": -110},
        "Caesars":    {"home_ml": -112, "away_ml": -108},
        "FanDuel":    {"home_ml": -115, "away_ml": -105},
        "ESPN Bet":   {"home_ml": -110, "away_ml": -110},
    },
    9003: {
        "home_team": "Tampa Bay Rays", "away_team": "Washington Nationals",
        "DraftKings": {"home_ml": -175, "away_ml": +150},
        "BetMGM":     {"home_ml": -180, "away_ml": +155},
        "Caesars":    {"home_ml": -170, "away_ml": +145},
        "FanDuel":    {"home_ml": -175, "away_ml": +150},
        "ESPN Bet":   {"home_ml": -178, "away_ml": +152},
    },
    9004: {
        "home_team": "Philadelphia Phillies", "away_team": "Miami Marlins",
        "DraftKings": {"home_ml": -195, "away_ml": +165},
        "BetMGM":     {"home_ml": -200, "away_ml": +170},
        "Caesars":    {"home_ml": -190, "away_ml": +160},
        "FanDuel":    {"home_ml": -195, "away_ml": +165},
        "ESPN Bet":   {"home_ml": -198, "away_ml": +168},
    },
    9005: {
        "home_team": "Atlanta Braves", "away_team": "New York Mets",
        "DraftKings": {"home_ml": -150, "away_ml": +130},
        "BetMGM":     {"home_ml": -155, "away_ml": +135},
        "Caesars":    {"home_ml": -148, "away_ml": +128},
        "FanDuel":    {"home_ml": -150, "away_ml": +130},
        "ESPN Bet":   {"home_ml": -152, "away_ml": +132},
    },
    9006: {
        "home_team": "Cleveland Guardians", "away_team": "Detroit Tigers",
        "DraftKings": {"home_ml": -130, "away_ml": +110},
        "BetMGM":     {"home_ml": -135, "away_ml": +115},
        "Caesars":    {"home_ml": -128, "away_ml": +108},
        "FanDuel":    {"home_ml": -130, "away_ml": +110},
        "ESPN Bet":   {"home_ml": -132, "away_ml": +112},
    },
    9007: {
        "home_team": "Minnesota Twins", "away_team": "Kansas City Royals",
        "DraftKings": {"home_ml": -125, "away_ml": +105},
        "BetMGM":     {"home_ml": -130, "away_ml": +110},
        "Caesars":    {"home_ml": -122, "away_ml": +102},
        "FanDuel":    {"home_ml": -125, "away_ml": +105},
        "ESPN Bet":   {"home_ml": -128, "away_ml": +108},
    },
    9008: {
        "home_team": "Chicago White Sox", "away_team": "Colorado Rockies",
        "DraftKings": {"home_ml": -145, "away_ml": +125},
        "BetMGM":     {"home_ml": -150, "away_ml": +130},
        "Caesars":    {"home_ml": -142, "away_ml": +122},
        "FanDuel":    {"home_ml": -145, "away_ml": +125},
        "ESPN Bet":   {"home_ml": -148, "away_ml": +128},
    },
    9009: {
        "home_team": "Milwaukee Brewers", "away_team": "St. Louis Cardinals",
        "DraftKings": {"home_ml": -135, "away_ml": +115},
        "BetMGM":     {"home_ml": -140, "away_ml": +120},
        "Caesars":    {"home_ml": -132, "away_ml": +112},
        "FanDuel":    {"home_ml": -135, "away_ml": +115},
        "ESPN Bet":   {"home_ml": -138, "away_ml": +118},
    },
    9010: {
        "home_team": "Chicago Cubs", "away_team": "Pittsburgh Pirates",
        "DraftKings": {"home_ml": -165, "away_ml": +140},
        "BetMGM":     {"home_ml": -170, "away_ml": +145},
        "Caesars":    {"home_ml": -160, "away_ml": +135},
        "FanDuel":    {"home_ml": -165, "away_ml": +140},
        "ESPN Bet":   {"home_ml": -168, "away_ml": +142},
    },
    9011: {
        "home_team": "Houston Astros", "away_team": "Texas Rangers",
        "DraftKings": {"home_ml": -135, "away_ml": +115},
        "BetMGM":     {"home_ml": -140, "away_ml": +120},
        "Caesars":    {"home_ml": -132, "away_ml": +112},
        "FanDuel":    {"home_ml": -135, "away_ml": +115},
        "ESPN Bet":   {"home_ml": -138, "away_ml": +118},
    },
    9012: {
        "home_team": "Seattle Mariners", "away_team": "Oakland Athletics",
        "DraftKings": {"home_ml": -110, "away_ml": -110},
        "BetMGM":     {"home_ml": -112, "away_ml": -108},
        "Caesars":    {"home_ml": -108, "away_ml": -112},
        "FanDuel":    {"home_ml": -110, "away_ml": -110},
        "ESPN Bet":   {"home_ml": -110, "away_ml": -110},
    },
    9013: {
        "home_team": "Los Angeles Angels", "away_team": "Cincinnati Reds",
        "DraftKings": {"home_ml": +105, "away_ml": -125},
        "BetMGM":     {"home_ml": +110, "away_ml": -130},
        "Caesars":    {"home_ml": +102, "away_ml": -122},
        "FanDuel":    {"home_ml": +105, "away_ml": -125},
        "ESPN Bet":   {"home_ml": +108, "away_ml": -128},
    },
    9014: {
        "home_team": "Los Angeles Dodgers", "away_team": "San Francisco Giants",
        "DraftKings": {"home_ml": -155, "away_ml": +135},
        "BetMGM":     {"home_ml": -160, "away_ml": +140},
        "Caesars":    {"home_ml": -150, "away_ml": +130},
        "FanDuel":    {"home_ml": -155, "away_ml": +135},
        "ESPN Bet":   {"home_ml": -158, "away_ml": +138},
    },
    9015: {
        "home_team": "Arizona Diamondbacks", "away_team": "San Diego Padres",
        "DraftKings": {"home_ml": -140, "away_ml": +120},
        "BetMGM":     {"home_ml": -145, "away_ml": +125},
        "Caesars":    {"home_ml": -138, "away_ml": +118},
        "FanDuel":    {"home_ml": -140, "away_ml": +120},
        "ESPN Bet":   {"home_ml": -142, "away_ml": +122},
    },
}

# ==============================================================================
# MOCK: HISTORICAL 4-DAY LOOKBACK RESULTS (H-4 to H-1)
# Used by 4-Day Historical Calibration Engine
# ==============================================================================
MOCK_HISTORICAL_RESULTS: dict[str, list[dict]] = {
    "H-4": [
        {"game": "NYY @ BOS", "winner": "NYY", "score": "5-2", "bullpen_era": 2.10, "sp_whip": 0.95, "error_rate": 0.04},
        {"game": "LAD @ SF",  "winner": "LAD", "score": "6-1", "bullpen_era": 1.80, "sp_whip": 1.02, "error_rate": 0.03},
        {"game": "PHI @ WSH", "winner": "PHI", "score": "7-3", "bullpen_era": 3.00, "sp_whip": 1.10, "error_rate": 0.05},
    ],
    "H-3": [
        {"game": "ATL @ NYM", "winner": "ATL", "score": "4-2", "bullpen_era": 2.50, "sp_whip": 0.98, "error_rate": 0.04},
        {"game": "CHC @ MIL", "winner": "CHC", "score": "3-2", "bullpen_era": 3.20, "sp_whip": 1.12, "error_rate": 0.06},
        {"game": "HOU @ TEX", "winner": "HOU", "score": "5-4", "bullpen_era": 3.80, "sp_whip": 1.15, "error_rate": 0.07},
    ],
    "H-2": [
        {"game": "BAL @ TOR", "winner": "BAL", "score": "6-3", "bullpen_era": 2.90, "sp_whip": 1.05, "error_rate": 0.05},
        {"game": "CLE @ DET", "winner": "CLE", "score": "2-1", "bullpen_era": 1.90, "sp_whip": 0.92, "error_rate": 0.02},
        {"game": "MIN @ KC",  "winner": "MIN", "score": "4-1", "bullpen_era": 2.20, "sp_whip": 1.00, "error_rate": 0.03},
    ],
    "H-1": [
        {"game": "ARI @ SD",  "winner": "ARI", "score": "5-3", "bullpen_era": 3.10, "sp_whip": 1.08, "error_rate": 0.05},
        {"game": "SEA @ OAK", "winner": "OAK", "score": "11-0", "bullpen_era": 5.80, "sp_whip": 1.45, "error_rate": 0.18}, # Seattle Slump Game
        {"game": "CWS @ COL", "winner": "CWS", "score": "8-4", "bullpen_era": 4.10, "sp_whip": 1.25, "error_rate": 0.08},
    ],
}

# ==============================================================================
# MOCK: PITCHER STATS
# ==============================================================================
MOCK_PITCHER_STATS: dict[int, dict] = {
    1001: {"pitcher_id": 1001, "full_name": "Gerrit Cole", "team": "New York Yankees", "team_id": 147, "era": 2.85, "last5_era": 2.40, "last3_era": 2.10, "whip": 0.97, "hr_per9": 0.65, "k_per9": 11.2, "strikeout_rate": 0.315, "innings_pitched": 112.0, "pitch_count_avg": 97, "fip": 2.71, "opponent_avg": 0.198, "throws": "R"},
    1002: {"pitcher_id": 1002, "full_name": "Brayan Bello", "team": "Boston Red Sox", "team_id": 111, "era": 4.10, "last5_era": 3.90, "last3_era": 4.20, "whip": 1.28, "hr_per9": 1.05, "k_per9": 7.8, "strikeout_rate": 0.235, "innings_pitched": 98.0, "pitch_count_avg": 88, "fip": 4.00, "opponent_avg": 0.248, "throws": "R"},
    1003: {"pitcher_id": 1003, "full_name": "Tyler Glasnow", "team": "Los Angeles Dodgers", "team_id": 119, "era": 2.90, "last5_era": 2.65, "last3_era": 2.40, "whip": 0.98, "hr_per9": 0.72, "k_per9": 11.8, "strikeout_rate": 0.342, "innings_pitched": 105.0, "pitch_count_avg": 95, "fip": 2.89, "opponent_avg": 0.204, "throws": "R"},
    1004: {"pitcher_id": 1004, "full_name": "Logan Webb", "team": "San Francisco Giants", "team_id": 137, "era": 3.25, "last5_era": 3.00, "last3_era": 3.10, "whip": 1.08, "hr_per9": 0.58, "k_per9": 7.5, "strikeout_rate": 0.228, "innings_pitched": 115.0, "pitch_count_avg": 99, "fip": 3.12, "opponent_avg": 0.236, "throws": "R"},
    1005: {"pitcher_id": 1005, "full_name": "Framber Valdez", "team": "Houston Astros", "team_id": 117, "era": 3.15, "last5_era": 2.80, "last3_era": 2.70, "whip": 1.14, "hr_per9": 0.62, "k_per9": 8.8, "strikeout_rate": 0.262, "innings_pitched": 118.0, "pitch_count_avg": 100, "fip": 3.05, "opponent_avg": 0.241, "throws": "L"},
    1006: {"pitcher_id": 1006, "full_name": "Nathan Eovaldi", "team": "Texas Rangers", "team_id": 140, "era": 4.45, "last5_era": 4.60, "last3_era": 4.80, "whip": 1.32, "hr_per9": 1.45, "k_per9": 8.2, "strikeout_rate": 0.248, "innings_pitched": 95.0, "pitch_count_avg": 91, "fip": 4.10, "opponent_avg": 0.252, "throws": "R"},
    1007: {"pitcher_id": 1007, "full_name": "Spencer Strider", "team": "Atlanta Braves", "team_id": 144, "era": 3.10, "last5_era": 2.75, "last3_era": 2.50, "whip": 1.00, "hr_per9": 0.78, "k_per9": 13.4, "strikeout_rate": 0.388, "innings_pitched": 109.0, "pitch_count_avg": 96, "fip": 2.80, "opponent_avg": 0.195, "throws": "R"},
    1008: {"pitcher_id": 1008, "full_name": "Kodai Senga", "team": "New York Mets", "team_id": 121, "era": 3.55, "last5_era": 3.20, "last3_era": 3.10, "whip": 1.10, "hr_per9": 0.75, "k_per9": 10.1, "strikeout_rate": 0.298, "innings_pitched": 88.0, "pitch_count_avg": 92, "fip": 3.20, "opponent_avg": 0.218, "throws": "R"},
    1009: {"pitcher_id": 1009, "full_name": "Kyle Freeland", "team": "Colorado Rockies", "team_id": 115, "era": 4.80, "last5_era": 5.20, "last3_era": 5.50, "whip": 1.45, "hr_per9": 1.50, "k_per9": 6.2, "strikeout_rate": 0.182, "innings_pitched": 85.0, "pitch_count_avg": 85, "fip": 5.10, "opponent_avg": 0.278, "throws": "L"},
    1010: {"pitcher_id": 1010, "full_name": "Justin Steele", "team": "Chicago Cubs", "team_id": 112, "era": 3.10, "last5_era": 2.80, "last3_era": 2.60, "whip": 1.08, "hr_per9": 0.88, "k_per9": 9.2, "strikeout_rate": 0.272, "innings_pitched": 102.0, "pitch_count_avg": 93, "fip": 3.15, "opponent_avg": 0.228, "throws": "L"},
    1011: {"pitcher_id": 1011, "full_name": "Shane Bieber", "team": "Cleveland Guardians", "team_id": 114, "era": 3.40, "last5_era": 3.20, "last3_era": 3.00, "whip": 1.05, "hr_per9": 0.75, "k_per9": 9.8, "strikeout_rate": 0.290, "innings_pitched": 108.0, "pitch_count_avg": 96, "fip": 3.22, "opponent_avg": 0.232, "throws": "R"},
    1012: {"pitcher_id": 1012, "full_name": "Eduardo Rodriguez", "team": "Detroit Tigers", "team_id": 116, "era": 4.20, "last5_era": 4.50, "last3_era": 4.70, "whip": 1.30, "hr_per9": 1.10, "k_per9": 8.0, "strikeout_rate": 0.245, "innings_pitched": 96.0, "pitch_count_avg": 90, "fip": 4.05, "opponent_avg": 0.255, "throws": "L"},
    1013: {"pitcher_id": 1013, "full_name": "Kevin Gausman", "team": "Toronto Blue Jays", "team_id": 141, "era": 3.55, "last5_era": 3.45, "last3_era": 3.30, "whip": 1.12, "hr_per9": 0.90, "k_per9": 9.5, "strikeout_rate": 0.278, "innings_pitched": 100.0, "pitch_count_avg": 94, "fip": 3.40, "opponent_avg": 0.236, "throws": "R"},
    1014: {"pitcher_id": 1014, "full_name": "Pablo Lopez", "team": "Minnesota Twins", "team_id": 142, "era": 3.60, "last5_era": 3.50, "last3_era": 3.40, "whip": 1.10, "hr_per9": 0.85, "k_per9": 9.1, "strikeout_rate": 0.268, "innings_pitched": 103.0, "pitch_count_avg": 94, "fip": 3.45, "opponent_avg": 0.234, "throws": "R"},
    1015: {"pitcher_id": 1015, "full_name": "Zack Wheeler", "team": "Philadelphia Phillies", "team_id": 143, "era": 2.95, "last5_era": 2.60, "last3_era": 2.30, "whip": 0.98, "hr_per9": 0.70, "k_per9": 10.4, "strikeout_rate": 0.305, "innings_pitched": 114.0, "pitch_count_avg": 98, "fip": 2.85, "opponent_avg": 0.208, "throws": "R"},
    1016: {"pitcher_id": 1016, "full_name": "Patrick Corbin", "team": "Washington Nationals", "team_id": 120, "era": 5.10, "last5_era": 5.40, "last3_era": 5.80, "whip": 1.55, "hr_per9": 1.45, "k_per9": 6.1, "strikeout_rate": 0.185, "innings_pitched": 88.0, "pitch_count_avg": 87, "fip": 5.25, "opponent_avg": 0.285, "throws": "L"},
    1017: {"pitcher_id": 1017, "full_name": "Freddy Peralta", "team": "Milwaukee Brewers", "team_id": 158, "era": 3.35, "last5_era": 3.15, "last3_era": 3.10, "whip": 1.08, "hr_per9": 0.80, "k_per9": 10.5, "strikeout_rate": 0.312, "innings_pitched": 106.0, "pitch_count_avg": 95, "fip": 3.18, "opponent_avg": 0.218, "throws": "R"},
    1018: {"pitcher_id": 1018, "full_name": "Miles Mikolas", "team": "St. Louis Cardinals", "team_id": 138, "era": 4.40, "last5_era": 4.60, "last3_era": 4.90, "whip": 1.25, "hr_per9": 1.05, "k_per9": 7.0, "strikeout_rate": 0.218, "innings_pitched": 95.0, "pitch_count_avg": 90, "fip": 4.30, "opponent_avg": 0.262, "throws": "R"},
    1019: {"pitcher_id": 1019, "full_name": "Luis Castillo", "team": "Seattle Mariners", "team_id": 136, "era": 3.20, "last5_era": 3.90, "last3_era": 4.85, "whip": 1.22, "hr_per9": 0.68, "k_per9": 9.7, "strikeout_rate": 0.288, "innings_pitched": 110.0, "pitch_count_avg": 97, "fip": 3.45, "opponent_avg": 0.238, "throws": "R"},
    1020: {"pitcher_id": 1020, "full_name": "Mason Miller", "team": "Oakland Athletics", "team_id": 133, "era": 4.80, "last5_era": 5.10, "last3_era": 5.20, "whip": 1.40, "hr_per9": 1.25, "k_per9": 9.0, "strikeout_rate": 0.265, "innings_pitched": 90.0, "pitch_count_avg": 89, "fip": 4.75, "opponent_avg": 0.268, "throws": "R"},
    1021: {"pitcher_id": 1021, "full_name": "Yu Darvish", "team": "San Diego Padres", "team_id": 135, "era": 4.10, "last5_era": 4.30, "last3_era": 4.50, "whip": 1.18, "hr_per9": 1.00, "k_per9": 9.2, "strikeout_rate": 0.278, "innings_pitched": 97.0, "pitch_count_avg": 93, "fip": 4.00, "opponent_avg": 0.248, "throws": "R"},
    1022: {"pitcher_id": 1022, "full_name": "Zac Gallen", "team": "Arizona Diamondbacks", "team_id": 109, "era": 3.05, "last5_era": 2.90, "last3_era": 2.80, "whip": 1.02, "hr_per9": 0.65, "k_per9": 9.3, "strikeout_rate": 0.280, "innings_pitched": 108.0, "pitch_count_avg": 96, "fip": 2.95, "opponent_avg": 0.222, "throws": "R"},
    1023: {"pitcher_id": 1023, "full_name": "Cole Ragans", "team": "Kansas City Royals", "team_id": 118, "era": 3.80, "last5_era": 3.65, "last3_era": 3.50, "whip": 1.18, "hr_per9": 0.92, "k_per9": 8.9, "strikeout_rate": 0.268, "innings_pitched": 98.0, "pitch_count_avg": 93, "fip": 3.68, "opponent_avg": 0.242, "throws": "L"},
    1024: {"pitcher_id": 1024, "full_name": "Dean Kremer", "team": "Baltimore Orioles", "team_id": 110, "era": 3.75, "last5_era": 3.80, "last3_era": 3.70, "whip": 1.20, "hr_per9": 0.88, "k_per9": 8.4, "strikeout_rate": 0.255, "innings_pitched": 97.0, "pitch_count_avg": 92, "fip": 3.70, "opponent_avg": 0.246, "throws": "R"},
    1025: {"pitcher_id": 1025, "full_name": "Zach Eflin", "team": "Tampa Bay Rays", "team_id": 139, "era": 3.35, "last5_era": 3.10, "last3_era": 3.00, "whip": 1.04, "hr_per9": 0.72, "k_per9": 8.5, "strikeout_rate": 0.260, "innings_pitched": 105.0, "pitch_count_avg": 94, "fip": 3.25, "opponent_avg": 0.225, "throws": "R"},
    1026: {"pitcher_id": 1026, "full_name": "Sandy Alcantara", "team": "Miami Marlins", "team_id": 146, "era": 4.50, "last5_era": 4.80, "last3_era": 5.10, "whip": 1.35, "hr_per9": 1.42, "k_per9": 7.5, "strikeout_rate": 0.220, "innings_pitched": 90.0, "pitch_count_avg": 88, "fip": 4.40, "opponent_avg": 0.260, "throws": "R"},
    1027: {"pitcher_id": 1027, "full_name": "Garrett Crochet", "team": "Chicago White Sox", "team_id": 145, "era": 3.20, "last5_era": 3.00, "last3_era": 2.90, "whip": 1.06, "hr_per9": 0.70, "k_per9": 11.5, "strikeout_rate": 0.330, "innings_pitched": 100.0, "pitch_count_avg": 95, "fip": 3.10, "opponent_avg": 0.210, "throws": "L"},
    1028: {"pitcher_id": 1028, "full_name": "Mitch Keller", "team": "Pittsburgh Pirates", "team_id": 134, "era": 4.10, "last5_era": 4.30, "last3_era": 4.50, "whip": 1.28, "hr_per9": 1.15, "k_per9": 8.2, "strikeout_rate": 0.240, "innings_pitched": 95.0, "pitch_count_avg": 91, "fip": 4.05, "opponent_avg": 0.250, "throws": "R"},
    1029: {"pitcher_id": 1029, "full_name": "Tyler Anderson", "team": "Los Angeles Angels", "team_id": 108, "era": 4.30, "last5_era": 4.50, "last3_era": 4.60, "whip": 1.32, "hr_per9": 1.20, "k_per9": 7.2, "strikeout_rate": 0.215, "innings_pitched": 92.0, "pitch_count_avg": 89, "fip": 4.25, "opponent_avg": 0.255, "throws": "L"},
    1030: {"pitcher_id": 1030, "full_name": "Hunter Greene", "team": "Cincinnati Reds", "team_id": 113, "era": 3.50, "last5_era": 3.30, "last3_era": 3.20, "whip": 1.12, "hr_per9": 0.85, "k_per9": 10.8, "strikeout_rate": 0.305, "innings_pitched": 98.0, "pitch_count_avg": 94, "fip": 3.40, "opponent_avg": 0.220, "throws": "R"},
}

# ==============================================================================
# MOCK: BULLPEN STATS
# ==============================================================================
MOCK_BULLPEN_STATS: dict[int, dict] = {
    147: {"team": "New York Yankees",        "bullpen_era": 3.40, "whip": 1.18},
    111: {"team": "Boston Red Sox",          "bullpen_era": 4.10, "whip": 1.32},
    110: {"team": "Baltimore Orioles",       "bullpen_era": 3.55, "whip": 1.16},
    141: {"team": "Toronto Blue Jays",       "bullpen_era": 3.70, "whip": 1.20},
    139: {"team": "Tampa Bay Rays",          "bullpen_era": 3.30, "whip": 1.12},
    120: {"team": "Washington Nationals",    "bullpen_era": 4.80, "whip": 1.48}, # Bottom 10 Bullpen
    143: {"team": "Philadelphia Phillies",   "bullpen_era": 3.25, "whip": 1.10},
    146: {"team": "Miami Marlins",            "bullpen_era": 4.60, "whip": 1.42}, # Bottom 10 Bullpen
    144: {"team": "Atlanta Braves",          "bullpen_era": 3.30, "whip": 1.12},
    121: {"team": "New York Mets",           "bullpen_era": 3.95, "whip": 1.28},
    114: {"team": "Cleveland Guardians",     "bullpen_era": 3.55, "whip": 1.15},
    116: {"team": "Detroit Tigers",          "bullpen_era": 4.30, "whip": 1.35},
    142: {"team": "Minnesota Twins",         "bullpen_era": 3.65, "whip": 1.18},
    118: {"team": "Kansas City Royals",      "bullpen_era": 3.90, "whip": 1.25},
    145: {"team": "Chicago White Sox",       "bullpen_era": 4.40, "whip": 1.38},
    115: {"team": "Colorado Rockies",        "bullpen_era": 5.20, "whip": 1.55}, # Bottom 10 Bullpen
    158: {"team": "Milwaukee Brewers",       "bullpen_era": 3.45, "whip": 1.14},
    138: {"team": "St. Louis Cardinals",     "bullpen_era": 4.10, "whip": 1.30},
    112: {"team": "Chicago Cubs",            "bullpen_era": 3.90, "whip": 1.22},
    134: {"team": "Pittsburgh Pirates",      "bullpen_era": 4.35, "whip": 1.36},
    117: {"team": "Houston Astros",          "bullpen_era": 3.20, "whip": 1.10},
    140: {"team": "Texas Rangers",           "bullpen_era": 3.75, "whip": 1.20},
    136: {"team": "Seattle Mariners",        "bullpen_era": 3.30, "whip": 1.10},
    133: {"team": "Oakland Athletics",       "bullpen_era": 4.90, "whip": 1.50}, # Bottom 10 Bullpen
    108: {"team": "Los Angeles Angels",      "bullpen_era": 4.50, "whip": 1.40},
    113: {"team": "Cincinnati Reds",         "bullpen_era": 4.25, "whip": 1.32},
    119: {"team": "Los Angeles Dodgers",     "bullpen_era": 3.10, "whip": 1.08},
    137: {"team": "San Francisco Giants",    "bullpen_era": 3.85, "whip": 1.25},
    109: {"team": "Arizona Diamondbacks",    "bullpen_era": 3.60, "whip": 1.18},
    135: {"team": "San Diego Padres",        "bullpen_era": 3.50, "whip": 1.15},
}

# ==============================================================================
# MOCK: TEAM OFFENSE DATA (Top 10 RPG & Top 10 HR/Game)
# ==============================================================================
MOCK_TEAM_OFFENSE: dict[int, dict] = {
    147: {"team": "New York Yankees",        "runs_per_game": 5.05, "hr_per_game": 1.45, "ops": 0.785}, # Top 10 Offense
    111: {"team": "Boston Red Sox",          "runs_per_game": 4.70, "hr_per_game": 1.25, "ops": 0.748}, # Top 10 Offense
    110: {"team": "Baltimore Orioles",       "runs_per_game": 4.80, "hr_per_game": 1.30, "ops": 0.762}, # Top 10 Offense
    141: {"team": "Toronto Blue Jays",       "runs_per_game": 4.70, "hr_per_game": 1.22, "ops": 0.755},
    139: {"team": "Tampa Bay Rays",          "runs_per_game": 4.45, "hr_per_game": 1.10, "ops": 0.735},
    120: {"team": "Washington Nationals",    "runs_per_game": 3.90, "hr_per_game": 0.85, "ops": 0.700},
    143: {"team": "Philadelphia Phillies",   "runs_per_game": 5.00, "hr_per_game": 1.35, "ops": 0.792}, # Top 10 Offense
    146: {"team": "Miami Marlins",            "runs_per_game": 3.85, "hr_per_game": 0.80, "ops": 0.695},
    144: {"team": "Atlanta Braves",          "runs_per_game": 5.10, "hr_per_game": 1.50, "ops": 0.796}, # Top 10 Offense
    121: {"team": "New York Mets",           "runs_per_game": 4.40, "hr_per_game": 1.12, "ops": 0.732},
    114: {"team": "Cleveland Guardians",     "runs_per_game": 4.60, "hr_per_game": 1.05, "ops": 0.742},
    116: {"team": "Detroit Tigers",          "runs_per_game": 4.10, "hr_per_game": 0.95, "ops": 0.710},
    142: {"team": "Minnesota Twins",         "runs_per_game": 4.65, "hr_per_game": 1.25, "ops": 0.750}, # Top 10 Offense
    118: {"team": "Kansas City Royals",      "runs_per_game": 4.40, "hr_per_game": 1.00, "ops": 0.728},
    145: {"team": "Chicago White Sox",       "runs_per_game": 3.75, "hr_per_game": 0.82, "ops": 0.688},
    115: {"team": "Colorado Rockies",        "runs_per_game": 4.65, "hr_per_game": 1.15, "ops": 0.745},
    158: {"team": "Milwaukee Brewers",       "runs_per_game": 4.55, "hr_per_game": 1.18, "ops": 0.748},
    138: {"team": "St. Louis Cardinals",     "runs_per_game": 4.30, "hr_per_game": 1.02, "ops": 0.728},
    112: {"team": "Chicago Cubs",            "runs_per_game": 4.50, "hr_per_game": 1.15, "ops": 0.738},
    134: {"team": "Pittsburgh Pirates",      "runs_per_game": 4.05, "hr_per_game": 0.90, "ops": 0.712},
    117: {"team": "Houston Astros",          "runs_per_game": 4.55, "hr_per_game": 1.20, "ops": 0.740},
    140: {"team": "Texas Rangers",           "runs_per_game": 4.85, "hr_per_game": 1.32, "ops": 0.768}, # Top 10 Offense
    136: {"team": "Seattle Mariners",        "runs_per_game": 4.45, "hr_per_game": 1.10, "ops": 0.738},
    133: {"team": "Oakland Athletics",       "runs_per_game": 3.80, "hr_per_game": 0.88, "ops": 0.692},
    108: {"team": "Los Angeles Angels",      "runs_per_game": 4.25, "hr_per_game": 1.08, "ops": 0.725},
    113: {"team": "Cincinnati Reds",         "runs_per_game": 4.40, "hr_per_game": 1.12, "ops": 0.730},
    119: {"team": "Los Angeles Dodgers",     "runs_per_game": 5.25, "hr_per_game": 1.55, "ops": 0.802}, # Top 10 Offense
    137: {"team": "San Francisco Giants",    "runs_per_game": 4.20, "hr_per_game": 1.02, "ops": 0.715},
    109: {"team": "Arizona Diamondbacks",    "runs_per_game": 4.70, "hr_per_game": 1.28, "ops": 0.758}, # Top 10 Offense
    135: {"team": "San Diego Padres",        "runs_per_game": 4.35, "hr_per_game": 1.10, "ops": 0.730},
}

MOCK_TEAM_FORM: dict[int, dict] = {
    tid: {"team": data["team"], "last_10_wins": 7 if data["runs_per_game"] >= 4.70 else 5, "last_10_losses": 3 if data["runs_per_game"] >= 4.70 else 5}
    for tid, data in MOCK_TEAM_OFFENSE.items()
}

MOCK_TEAM_OPS_SPLITS: dict[int, dict] = {
    tid: {"ops_vs_rhp": round(data["ops"] + 0.015, 3), "ops_vs_lhp": round(data["ops"] - 0.015, 3)}
    for tid, data in MOCK_TEAM_OFFENSE.items()
}

# ==============================================================================
# MOCK: BATTER H2H & STATS (For Under 1.5 Hits, Out or Error, and Under HR)
# ==============================================================================
MOCK_BATTER_H2H: list[dict] = [
    # Batter vs Patrick Corbin (1016) — Washington Nationals
    {
        "batter_id": 2001, "batter_name": "Brandon Lowe", "team": "Tampa Bay Rays", "team_id": 139,
        "pitcher_id": 1016, "pitcher_name": "Patrick Corbin",
        "career_pa_vs_pitcher": 12, "career_ab_vs_pitcher": 10, "career_hits_vs_pitcher": 1, "batting_avg_vs_pitcher": 0.100,
        "career_hr_vs_pitcher": 0, "season_pa": 380, "season_hr": 14, "prev_season_pa": 490, "prev_season_hr": 18,
        "batting_avg": 0.235, "strikeout_pct": 0.220, "under_1_5_hits_seasonal_prob": 0.78, "is_dfs_top_pitcher_matchup": True,
    },
    {
        "batter_id": 2002, "batter_name": "Yandy Diaz", "team": "Tampa Bay Rays", "team_id": 139,
        "pitcher_id": 1016, "pitcher_name": "Patrick Corbin",
        "career_pa_vs_pitcher": 15, "career_ab_vs_pitcher": 12, "career_hits_vs_pitcher": 2, "batting_avg_vs_pitcher": 0.167,
        "career_hr_vs_pitcher": 0, "season_pa": 420, "season_hr": 10, "prev_season_pa": 520, "prev_season_hr": 12,
        "batting_avg": 0.285, "strikeout_pct": 0.120, "under_1_5_hits_seasonal_prob": 0.74, "is_dfs_top_pitcher_matchup": True,
    },
    {
        "batter_id": 2003, "batter_name": "Jose Siri", "team": "Tampa Bay Rays", "team_id": 139,
        "pitcher_id": 1016, "pitcher_name": "Patrick Corbin",
        "career_pa_vs_pitcher": 11, "career_ab_vs_pitcher": 10, "career_hits_vs_pitcher": 1, "batting_avg_vs_pitcher": 0.100,
        "career_hr_vs_pitcher": 0, "season_pa": 310, "season_hr": 16, "prev_season_pa": 390, "prev_season_hr": 20,
        "batting_avg": 0.210, "strikeout_pct": 0.340, "under_1_5_hits_seasonal_prob": 0.82, "is_dfs_top_pitcher_matchup": True, # High K% eliminated from Out or Error
    },
    {
        "batter_id": 2004, "batter_name": "Josh Lowe", "team": "Tampa Bay Rays", "team_id": 139,
        "pitcher_id": 1016, "pitcher_name": "Patrick Corbin",
        "career_pa_vs_pitcher": 12, "career_ab_vs_pitcher": 10, "career_hits_vs_pitcher": 1, "batting_avg_vs_pitcher": 0.100,
        "career_hr_vs_pitcher": 0, "season_pa": 330, "season_hr": 11, "prev_season_pa": 410, "prev_season_hr": 15,
        "batting_avg": 0.245, "strikeout_pct": 0.210, "under_1_5_hits_seasonal_prob": 0.76, "is_dfs_top_pitcher_matchup": True,
    },
    {
        "batter_id": 2005, "batter_name": "Richie Palacios", "team": "Tampa Bay Rays", "team_id": 139,
        "pitcher_id": 1016, "pitcher_name": "Patrick Corbin",
        "career_pa_vs_pitcher": 10, "career_ab_vs_pitcher": 10, "career_hits_vs_pitcher": 0, "batting_avg_vs_pitcher": 0.000,
        "career_hr_vs_pitcher": 0, "season_pa": 260, "season_hr": 5, "prev_season_pa": 320, "prev_season_hr": 7,
        "batting_avg": 0.230, "strikeout_pct": 0.190, "under_1_5_hits_seasonal_prob": 0.84, "is_dfs_top_pitcher_matchup": True,
    },
    # Batter vs Gerrit Cole (1001)
    {
        "batter_id": 2010, "batter_name": "Rafael Devers", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 18, "career_ab_vs_pitcher": 15, "career_hits_vs_pitcher": 2, "batting_avg_vs_pitcher": 0.133,
        "career_hr_vs_pitcher": 0, "season_pa": 420, "season_hr": 12, "prev_season_pa": 580, "prev_season_hr": 18,
        "batting_avg": 0.278, "strikeout_pct": 0.220, "under_1_5_hits_seasonal_prob": 0.72, "is_dfs_top_pitcher_matchup": False,
    },
    {
        "batter_id": 2011, "batter_name": "Trevor Story", "team": "Boston Red Sox", "team_id": 111,
        "pitcher_id": 1001, "pitcher_name": "Gerrit Cole",
        "career_pa_vs_pitcher": 12, "career_ab_vs_pitcher": 10, "career_hits_vs_pitcher": 1, "batting_avg_vs_pitcher": 0.100,
        "career_hr_vs_pitcher": 0, "season_pa": 280, "season_hr": 4, "prev_season_pa": 390, "prev_season_hr": 8,
        "batting_avg": 0.241, "strikeout_pct": 0.280, "under_1_5_hits_seasonal_prob": 0.80, "is_dfs_top_pitcher_matchup": False,
    },
    # Batter vs Spencer Strider (1007)
    {
        "batter_id": 2020, "batter_name": "Jeff McNeil", "team": "New York Mets", "team_id": 121,
        "pitcher_id": 1007, "pitcher_name": "Spencer Strider",
        "career_pa_vs_pitcher": 14, "career_ab_vs_pitcher": 12, "career_hits_vs_pitcher": 2, "batting_avg_vs_pitcher": 0.167,
        "career_hr_vs_pitcher": 0, "season_pa": 380, "season_hr": 6, "prev_season_pa": 490, "prev_season_hr": 9,
        "batting_avg": 0.275, "strikeout_pct": 0.110, "under_1_5_hits_seasonal_prob": 0.75, "is_dfs_top_pitcher_matchup": False,
    },
]

# ==============================================================================
# MOCK: OVER/UNDER LINES
# ==============================================================================
MOCK_ODDS_LINES: dict[int, dict] = {
    g["game_id"]: {
        "game_id": g["game_id"],
        "matchup": f"{g['away_team']} @ {g['home_team']}",
        "total_line": 8.5 if "Coors" not in g["venue"] else 10.5,
        "book": "DraftKings",
    }
    for g in MOCK_GAMES
}

MOCK_MONEYLINE_ODDS: dict[int, dict] = {
    g["game_id"]: MOCK_LINE_SHOPPING.get(g["game_id"], {}).get("DraftKings", {"home_ml": -110, "away_ml": -110})
    for g in MOCK_GAMES
}

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
    "Target Field":         {"temp_f": 75.0, "wind_speed_mph": 8.0,  "wind_direction": "in",        "conditions": "Clear"},
    "Guaranteed Rate Field":{"temp_f": 79.0, "wind_speed_mph": 11.0, "wind_direction": "out",       "conditions": "Partly Cloudy"},
    "Tropicana Field":      {"temp_f": 72.0, "wind_speed_mph": 0.0,  "wind_direction": "none",      "conditions": "Dome"},
}


# ==============================================================================
# ACCESSORS
# ==============================================================================

def get_mock_games(date_str: str) -> list[dict]:
    return list(MOCK_GAMES)


def get_mock_odds_for_date(date_str: str) -> dict:
    return dict(MOCK_ODDS_LINES)
