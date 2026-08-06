"""
config.py
=========
Central configuration hub for the MLB Analytics CLI System.
Contains: Park Factors, Stadium GPS Coordinates, League Constants, API Keys.
"""

# ==============================================================================
# API KEYS — Replace with your actual keys.
# Open-Meteo is free and requires no key.
# The Odds API: https://the-odds-api.com (free tier available)
# ==============================================================================
API_KEYS = {
    "the_odds_api": "YOUR_ODDS_API_KEY_HERE",  # replace with actual key
    "open_meteo": None,  # open-meteo.com — no API key needed
}

# ==============================================================================
# MLB STATS API (Official, Free — no key required)
# ==============================================================================
MLB_API_BASE = "https://statsapi.mlb.com/api/v1"
MLB_API_TIMEOUT = 15  # seconds

# ==============================================================================
# LEAGUE CONSTANTS
# ==============================================================================
LEAGUE_AVG_RPG = 4.4          # League average Runs Per Game (MLB 2024)
DEFAULT_STARTER_INNINGS = 5.5  # Expected starter innings per start
DEFAULT_BULLPEN_INNINGS = 3.5  # Expected bullpen innings per start

# Edge thresholds for Over/Under decisions
OVER_UNDER_EDGE_THRESHOLD = 0.75  # Minimum proj vs line gap to recommend

# ==============================================================================
# STRATEGY 1 — UNDER HOME RUN PARLAY THRESHOLDS
# ==============================================================================
MAX_HR9_FOR_TOP_PITCHER = 0.80      # Max HR/9 to qualify as "Top Pitcher"
MIN_PLATE_APPEARANCES_H2H = 3       # Min H2H PA to count H2H data
MIN_TRUE_NO_HR_PROBABILITY = 0.94   # Min True No-HR Prob to qualify batter

# ==============================================================================
# PARK FACTORS (run-scoring environment multiplier)
# Source: Statcast/Baseball Reference — 2023/2024 multi-year averages
# Values > 1.00 = hitter-friendly; < 1.00 = pitcher-friendly
# ==============================================================================
PARK_FACTORS: dict[str, float] = {
    # American League
    "Fenway Park": 1.05,
    "Yankee Stadium": 1.07,
    "Camden Yards": 1.04,
    "Guaranteed Rate Field": 1.03,
    "Progressive Field": 0.97,
    "Comerica Park": 0.96,
    "Kauffman Stadium": 0.98,
    "Target Field": 0.98,
    "Tropicana Field": 0.95,
    "Rogers Centre": 1.06,
    "Minute Maid Park": 1.02,
    "Angel Stadium": 0.97,
    "Oakland Coliseum": 0.94,
    "T-Mobile Park": 0.93,
    "Globe Life Field": 1.03,
    # National League
    "Truist Park": 1.01,
    "Wrigley Field": 1.04,
    "Great American Ball Park": 1.10,
    "Coors Field": 1.20,        # Extreme hitter park (altitude)
    "Dodger Stadium": 0.97,
    "Chase Field": 1.07,
    "Oracle Park": 0.90,        # Extreme pitcher park (wind/cold)
    "Petco Park": 0.93,
    "loanDepot park": 0.95,
    "Nationals Park": 1.01,
    "Citi Field": 0.96,
    "Citizens Bank Park": 1.08,
    "PNC Park": 0.97,
    "Busch Stadium": 0.96,
    "American Family Field": 1.01,
    # Default fallback
    "DEFAULT": 1.00,
}

# ==============================================================================
# STADIUM GPS COORDINATES (latitude, longitude)
# Used to fetch real-time weather data from Open-Meteo API
# ==============================================================================
STADIUM_COORDINATES: dict[str, dict[str, float]] = {
    # American League
    "Fenway Park":              {"lat": 42.3467, "lon": -71.0972},
    "Yankee Stadium":           {"lat": 40.8296, "lon": -73.9262},
    "Camden Yards":             {"lat": 39.2838, "lon": -76.6218},
    "Guaranteed Rate Field":    {"lat": 41.8300, "lon": -87.6339},
    "Progressive Field":        {"lat": 41.4955, "lon": -81.6852},
    "Comerica Park":            {"lat": 42.3390, "lon": -83.0485},
    "Kauffman Stadium":         {"lat": 39.0517, "lon": -94.4803},
    "Target Field":             {"lat": 44.9817, "lon": -93.2781},
    "Tropicana Field":          {"lat": 27.7683, "lon": -82.6534},
    "Rogers Centre":            {"lat": 43.6414, "lon": -79.3894},
    "Minute Maid Park":         {"lat": 29.7572, "lon": -95.3555},
    "Angel Stadium":            {"lat": 33.8003, "lon": -117.8827},
    "Oakland Coliseum":         {"lat": 37.7516, "lon": -122.2005},
    "T-Mobile Park":            {"lat": 47.5914, "lon": -122.3325},
    "Globe Life Field":         {"lat": 32.7473, "lon": -97.0822},
    # National League
    "Truist Park":              {"lat": 33.8908, "lon": -84.4678},
    "Wrigley Field":            {"lat": 41.9484, "lon": -87.6553},
    "Great American Ball Park": {"lat": 39.0979, "lon": -84.5082},
    "Coors Field":              {"lat": 39.7560, "lon": -104.9942},
    "Dodger Stadium":           {"lat": 34.0739, "lon": -118.2400},
    "Chase Field":              {"lat": 33.4455, "lon": -112.0667},
    "Oracle Park":              {"lat": 37.7786, "lon": -122.3893},
    "Petco Park":               {"lat": 32.7076, "lon": -117.1570},
    "loanDepot park":           {"lat": 25.7781, "lon": -80.2197},
    "Nationals Park":           {"lat": 38.8730, "lon": -77.0074},
    "Citi Field":               {"lat": 40.7571, "lon": -73.8458},
    "Citizens Bank Park":       {"lat": 39.9061, "lon": -75.1665},
    "PNC Park":                 {"lat": 40.4469, "lon": -80.0058},
    "Busch Stadium":            {"lat": 38.6226, "lon": -90.1928},
    "American Family Field":    {"lat": 43.0280, "lon": -87.9712},
    # Default coordinates (Kansas City — central US)
    "DEFAULT":                  {"lat": 39.0500, "lon": -94.4800},
}

# ==============================================================================
# WEATHER ADJUSTMENT RULES
# ==============================================================================
WEATHER_RULES = {
    "wind_out_threshold_mph": 10,
    "wind_out_adjustment": +0.5,
    "wind_in_threshold_mph": 10,
    "wind_in_adjustment": -0.5,
    "temp_hot_threshold_f": 85,
    "temp_hot_adjustment": +0.25,
    "temp_cold_threshold_f": 50,
    "temp_cold_adjustment": -0.25,
}

# ==============================================================================
# BANKROLL MANAGEMENT CONSTANTS
# ==============================================================================
BANKROLL_DAILY_RISK_PCT = 0.10    # Max 10% of bankroll per day
UNIT_SIZE_PCT = 0.02              # 1 Unit = 2% of bankroll

# Stake allocation by parlay leg count (in units)
PARLAY_UNIT_ALLOCATION: dict[int, float] = {
    3:  1.00,
    4:  0.75,
    5:  0.50,
    8:  0.25,
    10: 0.25,
}

# Default bankroll if user has not set one
DEFAULT_BANKROLL = 1000.00

# Bankroll persistence file
BANKROLL_FILE = "bankroll.json"

# ==============================================================================
# THE ODDS API — SPORT KEY
# ==============================================================================
ODDS_SPORT_KEY = "baseball_mlb"
ODDS_REGIONS = "us"
ODDS_MARKETS = "totals"  # totals = over/under
ODDS_FORMAT = "american"
ODDS_API_BASE = "https://api.the-odds-api.com/v4"
ODDS_API_TIMEOUT = 10
