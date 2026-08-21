"""
config.py
=========
Central configuration hub for the MLB Analytics CLI System v6.0 Production Grade.
Advanced Sabermetrics (xFIP, SIERA, wRC+) 4-Pillar Weighting Engine +
1st Inning Micro-Market Engine + Self-Correction Calibration Loop.
"""

# ==============================================================================
# API KEYS
# ==============================================================================
API_KEYS = {
    "the_odds_api": "YOUR_ODDS_API_KEY_HERE",   # Replace with actual API key
    "open_meteo": None,                          # No key needed
}

# ==============================================================================
# MLB STATS API & REQUEST TIMEOUTS (Quiet 2-second timeout)
# ==============================================================================
MLB_API_BASE     = "https://statsapi.mlb.com/api/v1"
MLB_API_TIMEOUT  = 2  # Max 2 seconds timeout for fast silent fallback
ODDS_API_TIMEOUT = 2  # Max 2 seconds timeout for fast silent fallback

# ==============================================================================
# LEAGUE CONSTANTS
# ==============================================================================
LEAGUE_AVG_RPG          = 4.4    # League average Runs Per Game
DEFAULT_STARTER_INNINGS = 5.5
DEFAULT_BULLPEN_INNINGS = 3.5
OVER_UNDER_EDGE_THRESHOLD = 0.75

# ==============================================================================
# DATE & LOOKBACK ENGINE
# ==============================================================================
DATE_FORMAT   = "%Y-%m-%d"
LOOKBACK_DAYS = 4   # 4-day historical lookback engine (H-4 to H-1)

# ==============================================================================
# STRATEGY A — MONEYLINE & REALISTIC PROBABILITY THRESHOLDS
# ==============================================================================
MAX_WIN_CONFIDENCE_CAP        = 0.680  # 68.0% max confidence cap (MLB high variance)
MIN_WIN_CONFIDENCE_CAP        = 0.500  # 50.0% min confidence cap
BALANCED_ODDS_CONFIDENCE_CAP  = 0.580  # 58.0% cap for pick'em (-115 to +115)

MIN_ML_WIN_CONFIDENCE         = 0.580  # Minimum to qualify in screener table
LOCK_OF_DAY_MIN_CONFIDENCE     = 0.620  # Minimum for Lock of the Day

STRONG_PICK_MIN_ERA_ADV       = 1.25   # Starter ERA advantage >= +1.25
STRONG_PICK_MAX_WHIP          = 1.18   # Starter WHIP <= 1.18
STRONG_PICK_MAX_L3_ERA        = 3.20   # Last 3 Starts ERA <= 3.20
STRONG_PICK_MAX_ML_AMERICAN   = -140   # Moneyline <= -140 (Decimal <= 1.71)

LAST3_ERA_PENALTY_THRESHOLD   = 4.50   # L3 ERA > 4.50 incurs heavy trend penalty

# ==============================================================================
# 4-PILLAR SABERMETRICS WEIGHTING SYSTEM
# ==============================================================================
# --- Pillar 1: Starting Pitcher True Skill (35%) ---
PILLAR_WEIGHT_SP              = 0.35
SIERA_STRONG_THRESHOLD        = 3.50   # SIERA <= 3.50 -> Strong SP
XFIP_STRONG_THRESHOLD         = 3.50   # xFIP  <= 3.50 -> Strong SP
K_PCT_STRONG_THRESHOLD        = 0.25   # K%    >= 25%  -> Swing-and-miss ace
BB9_PENALTY_THRESHOLD         = 4.00   # BB/9  >= 4.0  -> Control penalty applied
BB9_PENALTY_AMOUNT            = -0.08  # Subtract 0.08 from Pillar 1 score for high walk rate

# --- Pillar 2: Recent Offensive Form — 7-Day wRC+ (30%) ---
PILLAR_WEIGHT_OFFENSE         = 0.30
WRC_PLUS_7D_SLUMP_THRESHOLD   = 85     # wRC+ < 85 -> Team is in offensive slump
WRC_PLUS_7D_ELITE_THRESHOLD   = 115    # wRC+ >= 115 -> Historically hot offense
WRC_PLUS_7D_FATAL_PENALTY     = -0.15  # Fatal penalty subtracted from final Win_Conf
WRC_PLUS_LEAGUE_AVG           = 100    # League average wRC+ is always 100

# --- Pillar 3: Bullpen Fatigue & Strength (20%) ---
PILLAR_WEIGHT_BULLPEN         = 0.20
BULLPEN_ELITE_ERA             = 3.20   # ERA <= 3.20 -> Elite bullpen
BULLPEN_SOLID_ERA             = 3.80   # ERA <= 3.80 -> Solid bullpen
BULLPEN_WEAK_ERA              = 4.50   # ERA <= 4.50 -> Weak bullpen
BULLPEN_BOTTOM10_ERA          = 4.50   # ERA >= 4.50 -> Bottom-10 league penalty
BULLPEN_FATIGUE_PENALTY       = -0.06  # Penalty if overused (high recent IP)

# --- Pillar 4: Situational & Schedule Edge (15%) ---
PILLAR_WEIGHT_SITUATIONAL     = 0.15
HOME_ADVANTAGE_EDGE           = 0.03   # +3% for home team
TRAVEL_FATIGUE_PENALTY        = -0.04  # -4% for teams on travel day

# ==============================================================================
# PYBASEBALL / FANGRAPHS REAL-TIME DATA
# ==============================================================================
PYBASEBALL_TIMEOUT            = 10     # Max seconds to wait for pybaseball calls
FANGRAPHS_7D_LOOKBACK         = 7      # Days lookback for team batting wRC+

# ==============================================================================
# STRATEGY B1 — UNDER 0.5 HOME RUN PARLAY THRESHOLDS
# ==============================================================================
MAX_HR9_FOR_TOP_PITCHER      = 0.80   # HR/9 ceiling
MIN_PLATE_APPEARANCES_H2H    = 3      # Minimum career PA vs pitcher
MIN_TRUE_NO_HR_PROBABILITY   = 0.94  # 94% threshold

# ==============================================================================
# STRATEGY B2 — UNDER 1.5 HITS SCREENER THRESHOLDS
# ==============================================================================
UNDER_HITS_MAX_BA            = 0.200  # Max BA vs SP
UNDER_HITS_MIN_AB            = 10     # Min At-Bats vs SP
UNDER_HITS_MIN_PROB          = 0.70   # Min 70% seasonal Under 1.5 Hits prob
UNDER_HITS_SINGLE_ODDS_MIN   = -330   # Odds >= -330 -> Single Bet
UNDER_HITS_PARLAY_PROB_MIN   = 0.80   # Odds -500 to -700 -> 2-Team Parlay (Prob >= 80%)

# ==============================================================================
# STRATEGY B3 — ALTERNATE TEAM TOTAL OVER 1.5 RUNS THRESHOLDS
# ==============================================================================
ALT_TT_MIN_RPG               = 4.60   # Top 10 Runs Per Game
ALT_TT_MIN_HRPG              = 1.20   # Top 10 Home Runs Per Game
ALT_TT_OPP_SP_ERA_MIN        = 4.00   # Opponent Starter ERA >= 4.0
ALT_TT_OPP_SP_HR9_MIN        = 1.40   # Opponent Starter HR/9 >= 1.4
ALT_TT_OPP_BP_ERA_MIN        = 4.20   # Opponent Bullpen ERA >= 4.20 (Bottom 10)
ALT_TT_MIN_PARK_FACTOR       = 1.00   # Park Factor >= 1.00

# ==============================================================================
# STRATEGY B4 — AT-BAT OUTCOME "OUT OR ERROR" TARGETS ($100/DAY SYSTEM)
# ==============================================================================
OUT_OR_ERROR_MAX_BA          = 0.500  # Eliminate opposing batters with BA > .500 vs SP (min 10 AB)
OUT_OR_ERROR_MAX_K_PCT       = 0.250  # Eliminate batters in Top 25 K% (> 25%)
OUT_OR_ERROR_TARGET_COUNT    = 5      # Output 5 remaining batter targets

# ==============================================================================
# STRATEGY C — SCORE PROJECTION WEATHER ADJUSTMENTS
# ==============================================================================
WEATHER_RULES = {
    "wind_out_threshold_mph": 10,
    "wind_out_adjustment":    +0.5,
    "wind_in_threshold_mph":  10,
    "wind_in_adjustment":     -0.5,
    "temp_hot_threshold_f":   85,
    "temp_hot_adjustment":    +0.25,
    "temp_cold_threshold_f":  50,
    "temp_cold_adjustment":   -0.25,
}

# ==============================================================================
# BANKROLL MANAGEMENT
# ==============================================================================
BANKROLL_DAILY_RISK_PCT = 0.10    # Max 10% of bankroll per day
UNIT_SIZE_PCT           = 0.02    # 1 Unit = 2% of bankroll
DEFAULT_BANKROLL        = 1000.00
BANKROLL_FILE           = "bankroll.json"

PARLAY_UNIT_ALLOCATION: dict[int, float] = {
    3:  1.00,
    4:  0.75,
    5:  0.50,
    8:  0.25,
    10: 0.25,
    15: 0.25,  # Ultimate Slate-Wide Slip
}
SINGLE_PICK_UNIT_ALLOCATION = 1.00

# ==============================================================================
# THE ODDS API & LINE SHOPPING
# ==============================================================================
ODDS_SPORT_KEY       = "baseball_mlb"
ODDS_REGIONS         = "us"
ODDS_MARKETS         = "h2h,totals"
ODDS_FORMAT          = "american"
ODDS_API_BASE        = "https://api.the-odds-api.com/v4"
SUPPORTED_SPORTSBOOKS = ["BetMGM", "DraftKings", "Caesars", "FanDuel", "ESPN Bet"]

# ==============================================================================
# PARK FACTORS
# ==============================================================================
PARK_FACTORS: dict[str, float] = {
    "Fenway Park":            1.05,
    "Yankee Stadium":         1.07,
    "Camden Yards":           1.04,
    "Guaranteed Rate Field":  1.03,
    "Progressive Field":      0.97,
    "Comerica Park":          0.96,
    "Kauffman Stadium":       0.98,
    "Target Field":           0.98,
    "Tropicana Field":        0.95,
    "Rogers Centre":          1.06,
    "Minute Maid Park":       1.02,
    "Angel Stadium":          0.97,
    "Oakland Coliseum":       0.94,
    "T-Mobile Park":          0.93,
    "Globe Life Field":       1.03,
    "Truist Park":            1.01,
    "Wrigley Field":          1.04,
    "Great American Ball Park": 1.10,
    "Coors Field":            1.20,
    "Dodger Stadium":         0.97,
    "Chase Field":            1.07,
    "Oracle Park":            0.90,
    "Petco Park":             0.93,
    "loanDepot park":         0.95,
    "Nationals Park":         1.01,
    "Citi Field":             0.96,
    "Citizens Bank Park":     1.08,
    "PNC Park":               0.97,
    "Busch Stadium":          0.96,
    "American Family Field":  1.01,
    "DEFAULT":                1.00,
}

# ==============================================================================
# STADIUM GPS COORDINATES
# ==============================================================================
STADIUM_COORDINATES: dict[str, dict[str, float]] = {
    "Fenway Park":               {"lat": 42.3467, "lon": -71.0972},
    "Yankee Stadium":            {"lat": 40.8296, "lon": -73.9262},
    "Camden Yards":              {"lat": 39.2838, "lon": -76.6218},
    "Guaranteed Rate Field":     {"lat": 41.8300, "lon": -87.6339},
    "Progressive Field":         {"lat": 41.4955, "lon": -81.6852},
    "Comerica Park":             {"lat": 42.3390, "lon": -83.0485},
    "Kauffman Stadium":          {"lat": 39.0517, "lon": -94.4803},
    "Target Field":              {"lat": 44.9817, "lon": -93.2781},
    "Tropicana Field":           {"lat": 27.7683, "lon": -82.6534},
    "Rogers Centre":             {"lat": 43.6414, "lon": -79.3894},
    "Minute Maid Park":          {"lat": 29.7572, "lon": -95.3555},
    "Angel Stadium":             {"lat": 33.8003, "lon": -117.8827},
    "Oakland Coliseum":          {"lat": 37.7516, "lon": -122.2005},
    "T-Mobile Park":             {"lat": 47.5914, "lon": -122.3325},
    "Globe Life Field":          {"lat": 32.7473, "lon": -97.0822},
    "Truist Park":               {"lat": 33.8908, "lon": -84.4678},
    "Wrigley Field":             {"lat": 41.9484, "lon": -87.6553},
    "Great American Ball Park":  {"lat": 39.0979, "lon": -84.5082},
    "Coors Field":               {"lat": 39.7560, "lon": -104.9942},
    "Dodger Stadium":            {"lat": 34.0739, "lon": -118.2400},
    "Chase Field":               {"lat": 33.4455, "lon": -112.0667},
    "Oracle Park":               {"lat": 37.7786, "lon": -122.3893},
    "Petco Park":                {"lat": 32.7076, "lon": -117.1570},
    "loanDepot park":            {"lat": 25.7781, "lon": -80.2197},
    "Nationals Park":            {"lat": 38.8730, "lon": -77.0074},
    "Citi Field":                {"lat": 40.7571, "lon": -73.8458},
    "Citizens Bank Park":        {"lat": 39.9061, "lon": -75.1665},
    "PNC Park":                  {"lat": 40.4469, "lon": -80.0058},
    "Busch Stadium":             {"lat": 38.6226, "lon": -90.1928},
    "American Family Field":     {"lat": 43.0280, "lon": -87.9712},
    "DEFAULT":                   {"lat": 39.0500, "lon": -94.4800},
}

# ==============================================================================
# V6.0 — 1ST INNING MICRO-MARKET ENGINE
# ==============================================================================

# Statcast rolling window: Pull only last N days (not full season)
STATCAST_ROLLING_DAYS           = 45    # 45-day rolling window for SP 1st inning splits
STATCAST_MIN_STARTS             = 8     # Minimum starts in sample for reliable 1st inn stats
SP_1ST_INN_ERA_MULTIPLIER       = 1.18  # Empirical: pitchers avg 18% higher ERA in inning 1
                                        # Used as fallback when no Statcast sample

# NRFI / YRFI Model Probability Caps
NRFI_MIN_PROBABILITY            = 0.35  # Floor — minimum realistic NRFI probability
NRFI_MAX_PROBABILITY            = 0.72  # Ceiling — epistemic humility cap
NRFI_MIN_CONFIDENCE_THRESHOLD   = 0.58  # Minimum to include as micro-market leg
YRFI_MIN_CONFIDENCE_THRESHOLD   = 0.58  # Same threshold for YRFI legs
TEAM_INN1_TOTAL_MIN_CONFIDENCE  = 0.58  # Team 1st Inning Total O/U 0.5
HANDICAP_1ST_INN_MIN_CONFIDENCE = 0.58  # 1st Inning Handicap 0 (Tie No Bet)

# NRFI Model Adjustment Knobs
NRFI_BOTH_ACES_XFIP_THRESHOLD   = 3.20  # Both SP xFIP_1st <= 3.20 → +0.04
NRFI_LEAKY_SP_XFIP_THRESHOLD    = 4.50  # Either SP xFIP_1st >= 4.50 → -0.06
NRFI_ELITE_OFFENSE_THRESHOLD    = 1.20  # (top3_wrc_home + top3_wrc_away)/200 >= 1.20 → -0.06
NRFI_WEAK_OFFENSE_THRESHOLD     = 0.80  # (top3_wrc_home + top3_wrc_away)/200 <= 0.80 → +0.05
NRFI_WIND_OUT_SPEED_MPH         = 15    # Wind blowing out >= 15mph → -0.04
NRFI_COLD_TEMP_F                = 50    # Temp <= 50°F → +0.03
NRFI_TREND_SAMPLE_GAMES         = 15    # Last N games to compute per-team NRFI trend rate

# Top-of-Order (Batters 1-3) wRC+ Thresholds
TOP3_WRC_ELITE_THRESHOLD        = 120   # Top-3 avg wRC+ >= 120 → strong YRFI pressure
TOP3_WRC_WEAK_THRESHOLD         = 85    # Top-3 avg wRC+ <= 85  → NRFI favorable

# 1st Inning Handicap Model
HANDICAP_1ST_INN_MIN_SIERA_GAP  = 0.60  # Min SIERA gap between SPs to qualify

# ==============================================================================
# V6.0 — FILE-BASED CACHE (12-HOUR TTL)
# ==============================================================================
CACHE_DIR                       = ".cache"          # Relative to script directory
CACHE_TTL_HOURS                 = 12                # Re-fetch if older than 12 hours
CACHE_SP_SPLITS_FILE            = "sp_1st_inn_splits_{season}.json"
CACHE_TOP3_WRC_FILE             = "top3_wrc_{date}.json"
CACHE_NRFI_TRENDS_FILE          = "nrfi_trends_{date}.json"
CACHE_FG_PITCHING_FILE          = "fg_pitching_{season}.json"
CACHE_FG_BATTING_FILE           = "fg_batting_{date}.json"

# ==============================================================================
# V6.0 — HYBRID MEGA SLIP ASSEMBLY
# ==============================================================================
HYBRID_SLIP_TARGET_LEGS         = 8     # Default target (1-2 ML anchors + 6-7 micro legs)
HYBRID_SLIP_MIN_LEGS            = 6     # Minimum acceptable slip size
HYBRID_SLIP_MAX_ANCHOR_LEGS     = 2     # Max Moneyline anchor legs
HYBRID_SLIP_ANCHOR_MIN_CONF     = 0.65  # ML anchor must have Win Confidence >= 65%
HYBRID_SLIP_ANCHOR_FALLBACK_CONF= 0.58  # Fallback threshold if no HIGH trust candidates
HYBRID_SLIP_STAKE_UNITS         = 0.25  # Always 0.25 unit for Mega Slips
HYBRID_SLIP_ZERO_CORRELATION    = True  # Enforce: anchor game cannot also be a micro leg

# Micro-market type labels (for CLI display and log)
MICRO_MARKET_NRFI               = "NRFI"           # Neither Run in First Inning
MICRO_MARKET_YRFI               = "YRFI"           # Yes Run in First Inning
MICRO_MARKET_TEAM_UNDER         = "TEAM_U0.5"      # Team 1st Inning Total Under 0.5
MICRO_MARKET_TEAM_OVER          = "TEAM_O0.5"      # Team 1st Inning Total Over 0.5
MICRO_MARKET_HANDICAP           = "HCP_0"          # 1st Inning Handicap 0 (Tie No Bet)

# ==============================================================================
# V6.0 — SELF-CORRECTION CALIBRATION LOOP
# ==============================================================================
DATA_DIR                        = "data"            # Relative to script directory
BETTING_LOG_FILE                = "betting_log.json"
WEIGHTS_OVERRIDE_FILE           = "weights_override.json"

CALIB_MIN_SAMPLE_SIZE           = 10    # Min resolved bets before activating dynamic weights
CALIB_LOOKBACK_BETS             = 20    # Rolling window for weight computation
CALIB_LEARNING_RATE             = 0.05  # Gradient descent step size
CALIB_MAX_WEIGHT_DELTA          = 0.03  # Max weight change per pillar per day
CALIB_MIN_PILLAR_WEIGHT         = 0.10  # Floor: no pillar drops below 10%
CALIB_MAX_PILLAR_WEIGHT         = 0.50  # Ceiling: no pillar exceeds 50%

# Parlay unit allocations — extended for v6.0 hybrid slip
PARLAY_UNIT_ALLOCATION_V6: dict[int, float] = {
    3:  1.00,
    4:  0.75,
    5:  0.50,
    6:  0.25,
    7:  0.25,
    8:  0.25,
    10: 0.25,
    15: 0.25,
}
