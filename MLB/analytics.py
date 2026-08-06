"""
analytics.py
============
Core mathematical analytics engine for the MLB Handicapping System.

Contains four strategy engines:
  A. Under Home Run Parlay Engine      (Strategy A)
  B. 5-Factor Score Projection         (Strategy B)
  C. Pitcher Props & Anchor System     (Strategy C)
  D. Moneyline Strong Recommendation   (Strategy D) ← NEW
"""

from __future__ import annotations

import itertools
import logging
from dataclasses import dataclass

import config

logger = logging.getLogger(__name__)


# ==============================================================================
# DATA MODELS — STRATEGY A (Under HR)
# ==============================================================================

@dataclass
class BatterCandidate:
    """A batter who passes all Under HR parlay filters."""
    batter_id: int
    batter_name: str
    team: str
    pitcher_id: int
    pitcher_name: str
    career_pa_vs_pitcher: int
    career_hr_vs_pitcher: int
    season_hr: int
    season_pa: int
    prev_season_hr: int
    prev_season_pa: int
    true_no_hr_prob: float


@dataclass
class ParlaySlip:
    """A generated Under HR parlay slip with its legs and math metrics."""
    legs: list[BatterCandidate]
    n_legs: int
    combined_probability: float
    fair_implied_odds: float
    fair_american_odds: int


# ==============================================================================
# DATA MODELS — STRATEGY B (Score Projection)
# ==============================================================================

@dataclass
class GameProjection:
    """Result of the 5-Factor Score Projection for one game."""
    game_id: object
    matchup: str
    venue: str
    home_team: str
    away_team: str
    ou_line: float | None
    home_starter_expected_runs: float
    away_starter_expected_runs: float
    home_bullpen_expected_runs: float
    away_bullpen_expected_runs: float
    home_team_expected_score: float
    away_team_expected_score: float
    park_factor: float
    raw_total: float
    weather_adjustment: float
    projected_total: float
    temp_f: float
    wind_speed_mph: float
    wind_direction: str
    conditions: str
    edge: float | None
    recommendation: str


# ==============================================================================
# DATA MODELS — STRATEGY C (Props)
# ==============================================================================

@dataclass
class PitcherPropRecommendation:
    pitcher_name: str
    team: str
    k_per9: float
    avg_pitch_count: int
    goblin_line: float
    full_prop_line: float
    prop_label: str


@dataclass
class AnchorSlip:
    pitcher_prop: PitcherPropRecommendation
    batter_name: str
    batter_team: str
    batter_prop_label: str
    opponent_pitcher_opp_avg: float
    pair_confidence: str


# ==============================================================================
# DATA MODELS — STRATEGY D (Moneyline Screener) ← NEW
# ==============================================================================

@dataclass
class MoneylineCandidate:
    """
    A team that qualifies as a strong Moneyline recommendation.
    Evaluated across 4 quantitative factors.
    """
    # Identity
    team_id: int
    team_name: str
    is_home: bool
    game_id: object
    pitcher_name: str
    opponent_team: str
    opponent_pitcher: str

    # Sportsbook odds
    moneyline_american: int
    moneyline_decimal: float

    # Raw advantage metrics
    era_advantage: float        # opp_ERA - our_ERA (positive = we're favored)
    whip_advantage: float       # opp_WHIP - our_WHIP (positive = we're favored)
    last10_win_rate: float      # 0.0 – 1.0
    ops_advantage_pct: float    # relative OPS matchup advantage

    # Component scores (0.0 – 1.0 each)
    score_era: float
    score_whip: float
    score_form: float
    score_ops: float

    # Final composite score
    win_confidence: float       # 0.0 – 1.0 | threshold >= MIN_ML_WIN_CONFIDENCE


@dataclass
class MoneylineSlip:
    """A generated Moneyline parlay slip."""
    legs: list[MoneylineCandidate]
    n_legs: int
    combined_confidence: float      # Product of all win_confidence values
    combined_decimal_odds: float    # Product of all decimal ML odds (payout)
    combined_american_odds: int     # American format combined payout
    implied_probability: float      # 1 / combined_decimal_odds (book's view)
    ev_edge: float                  # combined_confidence - implied_probability


# ==============================================================================
# STRATEGY D CONSTANTS
# ==============================================================================

# Weight allocation across 4 factors (must sum to 1.0)
_WEIGHT_ERA   = 0.35
_WEIGHT_FORM  = 0.30
_WEIGHT_OPS   = 0.25
_WEIGHT_WHIP  = 0.10

# Minimum win confidence to qualify (65%)
MIN_ML_WIN_CONFIDENCE = 0.65

# Maximum parlay combo iterations (performance cap)
_MAX_ML_COMBOS = 50


# ==============================================================================
# STRATEGY D — SCORING HELPERS
# ==============================================================================

def _score_era(era_diff: float) -> float:
    """
    ERA Advantage score (0.0 → 1.0).
    era_diff = opponent_ERA - our_ERA  (positive = our pitcher is better)
    Spec threshold for full credit: >= 1.25.
    """
    if era_diff >= 1.25:
        return 1.00   # Spec: dominant ERA advantage
    elif era_diff >= 0.75:
        return 0.75   # Strong advantage
    elif era_diff >= 0.25:
        return 0.50   # Moderate advantage
    elif era_diff >= 0.00:
        return 0.20   # Slight advantage
    else:
        # Penalise unfavourable matchup gradually
        return max(0.0, 0.20 + era_diff * 0.16)


def _score_whip(whip_diff: float) -> float:
    """
    WHIP Advantage score (0.0 → 1.0).
    whip_diff = opp_WHIP - our_WHIP  (positive = our pitcher cleaner)
    """
    if whip_diff >= 0.20:
        return 1.00
    elif whip_diff >= 0.10:
        return 0.75
    elif whip_diff >= 0.00:
        return 0.50
    else:
        return max(0.0, 0.50 + whip_diff * 2.5)


def _score_form(win_rate: float) -> float:
    """
    Recent form score = Last 10 win rate (linear, 0.0 → 1.0).
    Spec threshold for positive signal: >= 60%.
    """
    return min(1.0, max(0.0, win_rate))


def _score_ops(ops_advantage: float) -> float:
    """
    OPS Matchup Advantage score (0.0 → 1.0).
    ops_advantage = (our_team_OPS_vs_opp_type - their_team_OPS_vs_our_type)
                    / their_team_OPS_vs_our_type
    Spec threshold for positive signal: >= 10% (0.10).
    """
    if ops_advantage >= 0.10:
        return 1.00   # Spec: dominant offensive matchup
    elif ops_advantage >= 0.05:
        return 0.60   # Good matchup
    elif ops_advantage >= 0.00:
        return 0.30   # Slight advantage
    else:
        return max(0.0, 0.30 + ops_advantage * 3.0)


# ==============================================================================
# STRATEGY D — TEAM EVALUATOR
# ==============================================================================

def _american_to_decimal(american: int) -> float:
    """Convert American moneyline odds to decimal odds."""
    if american > 0:
        return 1.0 + american / 100.0
    else:
        return 1.0 + 100.0 / abs(american)


def _decimal_to_american(decimal: float) -> int:
    """Convert decimal odds to American odds."""
    if decimal >= 2.0:
        return int(round((decimal - 1.0) * 100))
    else:
        if decimal <= 1.0:
            return -10000
        return int(round(-100.0 / (decimal - 1.0)))


def _evaluate_team_moneyline(
    *,
    team_id: int,
    team_name: str,
    is_home: bool,
    game_id: object,
    our_sp: dict,
    opp_sp: dict,
    our_form: dict,
    our_ops_splits: dict,
    opp_ops_splits: dict,
    ml_american: int,
    opp_team_name: str,
    opp_pitcher_name: str,
) -> MoneylineCandidate:
    """
    Evaluate a single team in a single game for Moneyline strength.
    Returns a MoneylineCandidate with all components scored.
    """
    our_era  = our_sp.get("era",  4.50)
    opp_era  = opp_sp.get("era",  4.50)
    our_whip = our_sp.get("whip", 1.30)
    opp_whip = opp_sp.get("whip", 1.30)

    era_diff  = round(opp_era  - our_era,  3)   # positive = our pitcher better
    whip_diff = round(opp_whip - our_whip, 3)   # positive = our pitcher cleaner

    # Recent form
    wins   = our_form.get("last_10_wins",   5)
    losses = our_form.get("last_10_losses", 5)
    total  = wins + losses
    last10_win_rate = (wins / total) if total > 0 else 0.5

    # OPS matchup — compare each team's offense vs the specific pitcher handedness they face
    opp_throws = opp_sp.get("throws", "R")   # what we bat against
    our_throws  = our_sp.get("throws",  "R") # what they bat against
    ops_key_ours  = f"ops_vs_{'r' if opp_throws == 'R' else 'l'}hp"
    ops_key_theirs = f"ops_vs_{'r' if our_throws  == 'R' else 'l'}hp"

    our_ops   = our_ops_splits.get(ops_key_ours,   0.720)
    their_ops = opp_ops_splits.get(ops_key_theirs, 0.720)
    ops_advantage = (our_ops - their_ops) / their_ops if their_ops > 0 else 0.0

    # Compute component scores
    sc_era  = _score_era(era_diff)
    sc_whip = _score_whip(whip_diff)
    sc_form = _score_form(last10_win_rate)
    sc_ops  = _score_ops(ops_advantage)

    win_confidence = round(
        _WEIGHT_ERA  * sc_era  +
        _WEIGHT_FORM * sc_form +
        _WEIGHT_OPS  * sc_ops  +
        _WEIGHT_WHIP * sc_whip,
        4,
    )

    return MoneylineCandidate(
        team_id=team_id,
        team_name=team_name,
        is_home=is_home,
        game_id=game_id,
        pitcher_name=our_sp.get("full_name", "TBD"),
        opponent_team=opp_team_name,
        opponent_pitcher=opp_pitcher_name,
        moneyline_american=ml_american,
        moneyline_decimal=round(_american_to_decimal(ml_american), 4),
        era_advantage=era_diff,
        whip_advantage=whip_diff,
        last10_win_rate=round(last10_win_rate, 3),
        ops_advantage_pct=round(ops_advantage, 4),
        score_era=round(sc_era, 4),
        score_whip=round(sc_whip, 4),
        score_form=round(sc_form, 4),
        score_ops=round(sc_ops, 4),
        win_confidence=win_confidence,
    )


# ==============================================================================
# STRATEGY D — MAIN SCREENER
# ==============================================================================

def run_moneyline_screener(
    games: list[dict],
    team_form: dict[int, dict],
    team_ops_splits: dict[int, dict],
    ml_odds: dict[int, dict],
    pitcher_stats: dict[int, dict],
) -> list[MoneylineCandidate]:
    """
    Strategy D — Moneyline Strong Recommendation Screener.

    For each game:
      1. Evaluate both home and away teams across 4 quantitative factors.
      2. Pick the single stronger-qualifying team per game (avoids same-game correlation).
      3. Filter: win_confidence >= MIN_ML_WIN_CONFIDENCE (65%).
      4. Sort by win_confidence descending.

    Returns a list of qualified MoneylineCandidate objects.
    """
    candidates: list[MoneylineCandidate] = []

    for game in games:
        game_id    = game.get("game_id")
        home_id    = game.get("home_team_id")
        away_id    = game.get("away_team_id")
        home_name  = game.get("home_team", "Home")
        away_name  = game.get("away_team", "Away")
        home_sp    = game.get("home_sp") or {}
        away_sp    = game.get("away_sp") or {}
        ml         = ml_odds.get(game_id, {})

        # Enrich SP dicts with pitcher_stats if available
        if home_sp.get("pitcher_id") and home_sp["pitcher_id"] in pitcher_stats:
            home_sp = pitcher_stats[home_sp["pitcher_id"]]
        if away_sp.get("pitcher_id") and away_sp["pitcher_id"] in pitcher_stats:
            away_sp = pitcher_stats[away_sp["pitcher_id"]]

        # Also try looking up by home/away starter IDs from game dict
        if not home_sp and game.get("home_starter_id"):
            home_sp = pitcher_stats.get(game["home_starter_id"], {})
        if not away_sp and game.get("away_starter_id"):
            away_sp = pitcher_stats.get(game["away_starter_id"], {})

        home_form = team_form.get(home_id, {})
        away_form = team_form.get(away_id, {})
        home_ops  = team_ops_splits.get(home_id, {})
        away_ops  = team_ops_splits.get(away_id, {})

        home_ml = ml.get("home_ml", -110)
        away_ml = ml.get("away_ml", +110)

        # Evaluate home team
        home_cand = _evaluate_team_moneyline(
            team_id=home_id or 0,
            team_name=home_name,
            is_home=True,
            game_id=game_id,
            our_sp=home_sp,
            opp_sp=away_sp,
            our_form=home_form,
            our_ops_splits=home_ops,
            opp_ops_splits=away_ops,
            ml_american=home_ml,
            opp_team_name=away_name,
            opp_pitcher_name=away_sp.get("full_name", game.get("away_starter_name", "TBD")),
        )

        # Evaluate away team
        away_cand = _evaluate_team_moneyline(
            team_id=away_id or 0,
            team_name=away_name,
            is_home=False,
            game_id=game_id,
            our_sp=away_sp,
            opp_sp=home_sp,
            our_form=away_form,
            our_ops_splits=away_ops,
            opp_ops_splits=home_ops,
            ml_american=away_ml,
            opp_team_name=home_name,
            opp_pitcher_name=home_sp.get("full_name", game.get("home_starter_name", "TBD")),
        )

        # Pick the single stronger qualifying team per game
        best: MoneylineCandidate | None = None
        for cand in (home_cand, away_cand):
            if cand.win_confidence >= MIN_ML_WIN_CONFIDENCE:
                if best is None or cand.win_confidence > best.win_confidence:
                    best = cand

        if best:
            candidates.append(best)

    # Sort by win_confidence descending
    candidates.sort(key=lambda c: c.win_confidence, reverse=True)
    return candidates


# ==============================================================================
# STRATEGY D — PARLAY GENERATOR
# ==============================================================================

def generate_moneyline_parlays(
    candidates: list[MoneylineCandidate],
) -> dict[int, list[MoneylineSlip]]:
    """
    Generate Moneyline parlay slips for 3, 4, 5, 8, and 10 legs.

    Combines qualifying candidates (already sorted by win_confidence desc).
    Each combination's metrics:
      - combined_confidence: product of win_confidence (our probability estimate)
      - combined_decimal_odds: product of decimal ML odds (sportsbook payout)
      - ev_edge: combined_confidence - implied_probability (positive = +EV)

    Returns: dict mapping leg_count -> list[MoneylineSlip] (sorted by combined_confidence desc)
    """
    target_legs = [3, 4, 5, 8, 10]
    slips_by_legs: dict[int, list[MoneylineSlip]] = {}

    for n_legs in target_legs:
        if len(candidates) < n_legs:
            logger.info(
                "Only %d qualifying teams — skipping %d-leg parlay.",
                len(candidates), n_legs,
            )
            continue

        slip_list: list[MoneylineSlip] = []
        for combo in itertools.islice(
            itertools.combinations(candidates, n_legs), _MAX_ML_COMBOS
        ):
            comb_conf = 1.0
            comb_decimal = 1.0
            for leg in combo:
                comb_conf    *= leg.win_confidence
                comb_decimal *= leg.moneyline_decimal

            comb_conf    = round(comb_conf,    6)
            comb_decimal = round(comb_decimal, 4)
            implied_prob = round(1.0 / comb_decimal, 6) if comb_decimal > 0 else 0.0
            ev_edge      = round(comb_conf - implied_prob, 4)
            comb_american = _decimal_to_american(comb_decimal)

            slip_list.append(
                MoneylineSlip(
                    legs=list(combo),
                    n_legs=n_legs,
                    combined_confidence=comb_conf,
                    combined_decimal_odds=comb_decimal,
                    combined_american_odds=comb_american,
                    implied_probability=implied_prob,
                    ev_edge=ev_edge,
                )
            )

        slip_list.sort(key=lambda s: s.combined_confidence, reverse=True)
        slips_by_legs[n_legs] = slip_list

    return slips_by_legs


# ==============================================================================
# STRATEGY A — UNDER HOME RUN PARLAY ENGINE
# ==============================================================================

def _calc_true_no_hr_prob(
    season_hr: int, season_pa: int, prev_season_hr: int, prev_season_pa: int
) -> float:
    total_hr = season_hr + prev_season_hr
    total_pa = season_pa + prev_season_pa
    if total_pa == 0:
        return 0.90
    return round(1.0 - total_hr / total_pa, 6)


def _hr_decimal_to_american(decimal: float) -> int:
    if decimal >= 2.0:
        return int(round((decimal - 1) * 100))
    if decimal <= 1.0:
        return -10000
    return int(round(-100 / (decimal - 1)))


def run_under_hr_engine(
    h2h_records: list[dict],
    pitcher_stats: dict[int, dict],
) -> dict[int, list[ParlaySlip]]:
    """
    Strategy A: Under Home Run Parlay Engine.

    Steps:
      1. Filter pitchers: HR/9 <= config threshold (0.80).
      2. Filter H2H: 0 career HR vs that pitcher, min PA threshold.
      3. Compute True No-HR Probability.
      4. Filter: prob >= config threshold (94%).
      5. Generate parlay combinations 3/4/5/8/10 legs.
    """
    elite_ids: set[int] = {
        pid
        for pid, s in pitcher_stats.items()
        if s.get("hr_per9", 99.0) <= config.MAX_HR9_FOR_TOP_PITCHER
    }

    if not elite_ids:
        logger.warning("No elite pitchers found (HR/9 <= %.2f).", config.MAX_HR9_FOR_TOP_PITCHER)
        return {}

    qualified: list[BatterCandidate] = []
    for record in h2h_records:
        pitcher_id = record.get("pitcher_id")
        if pitcher_id not in elite_ids:
            continue
        career_pa = record.get("career_pa_vs_pitcher", 0)
        career_hr = record.get("career_hr_vs_pitcher", 0)
        if career_pa < config.MIN_PLATE_APPEARANCES_H2H or career_hr != 0:
            continue

        prob = _calc_true_no_hr_prob(
            record.get("season_hr", 0), record.get("season_pa", 0),
            record.get("prev_season_hr", 0), record.get("prev_season_pa", 0),
        )
        if prob < config.MIN_TRUE_NO_HR_PROBABILITY:
            continue

        p_stats = pitcher_stats.get(pitcher_id, {})
        qualified.append(
            BatterCandidate(
                batter_id=record.get("batter_id", 0),
                batter_name=record.get("batter_name", "Unknown"),
                team=record.get("team", ""),
                pitcher_id=pitcher_id,
                pitcher_name=p_stats.get("full_name", record.get("pitcher_name", "Unknown")),
                career_pa_vs_pitcher=career_pa,
                career_hr_vs_pitcher=career_hr,
                season_hr=record.get("season_hr", 0),
                season_pa=record.get("season_pa", 0),
                prev_season_hr=record.get("prev_season_hr", 0),
                prev_season_pa=record.get("prev_season_pa", 0),
                true_no_hr_prob=prob,
            )
        )

    if not qualified:
        return {}

    qualified.sort(key=lambda b: b.true_no_hr_prob, reverse=True)

    slips_by_legs: dict[int, list[ParlaySlip]] = {}
    for n_legs in [3, 4, 5, 8, 10]:
        if len(qualified) < n_legs:
            continue
        max_combos = 50 if n_legs >= 8 else 100
        slip_list: list[ParlaySlip] = []
        for combo in itertools.islice(itertools.combinations(qualified, n_legs), max_combos):
            combined = 1.0
            for c in combo:
                combined *= c.true_no_hr_prob
            combined = round(combined, 6)
            dec_odds = round(1.0 / combined, 4) if combined > 0 else 99999.0
            slip_list.append(
                ParlaySlip(
                    legs=list(combo),
                    n_legs=n_legs,
                    combined_probability=combined,
                    fair_implied_odds=dec_odds,
                    fair_american_odds=_hr_decimal_to_american(dec_odds),
                )
            )
        slip_list.sort(key=lambda s: s.combined_probability, reverse=True)
        slips_by_legs[n_legs] = slip_list

    return slips_by_legs


# ==============================================================================
# STRATEGY B — 5-FACTOR SCORE PROJECTION ENGINE
# ==============================================================================

def _get_park_factor(venue: str) -> float:
    return config.PARK_FACTORS.get(venue, config.PARK_FACTORS["DEFAULT"])


def _calc_weather_adjustment(weather: dict) -> tuple[float, str]:
    rules = config.WEATHER_RULES
    adjustment = 0.0
    notes: list[str] = []
    wind_speed = weather.get("wind_speed_mph", 0.0)
    wind_dir   = weather.get("wind_direction", "none")
    temp_f     = weather.get("temp_f", 70.0)

    if wind_dir == "out" and wind_speed >= rules["wind_out_threshold_mph"]:
        adjustment += rules["wind_out_adjustment"]
        notes.append(f"Wind out {wind_speed:.1f}mph (+{rules['wind_out_adjustment']})")
    if wind_dir == "in" and wind_speed >= rules["wind_in_threshold_mph"]:
        adjustment += rules["wind_in_adjustment"]
        notes.append(f"Wind in {wind_speed:.1f}mph ({rules['wind_in_adjustment']})")
    if temp_f > rules["temp_hot_threshold_f"]:
        adjustment += rules["temp_hot_adjustment"]
        notes.append(f"Hot {temp_f:.0f}F (+{rules['temp_hot_adjustment']})")
    if temp_f < rules["temp_cold_threshold_f"]:
        adjustment += rules["temp_cold_adjustment"]
        notes.append(f"Cold {temp_f:.0f}F ({rules['temp_cold_adjustment']})")

    return round(adjustment, 2), "; ".join(notes) if notes else "No effect"


def project_game_total(game: dict) -> GameProjection:
    """5-Factor Score Projection for a single enriched game dict."""
    home_team = game.get("home_team", "Home")
    away_team = game.get("away_team", "Away")
    venue     = game.get("venue", "DEFAULT")
    game_id   = game.get("game_id")
    weather   = game.get("weather", {})
    ou_line   = game.get("ou_line")
    home_sp: dict  = game.get("home_sp")   or {}
    away_sp: dict  = game.get("away_sp")   or {}
    home_bp: dict  = game.get("home_bullpen") or {}
    away_bp: dict  = game.get("away_bullpen") or {}
    home_off: dict = game.get("home_offense") or {}
    away_off: dict = game.get("away_offense") or {}

    def _starter_runs(sp: dict) -> float:
        era = sp.get("era", 4.50)
        l5  = sp.get("last5_era", era)
        adj_era = (era + l5) / 2.0
        return round((adj_era / 9.0) * config.DEFAULT_STARTER_INNINGS, 4)

    def _bullpen_runs(bp: dict) -> float:
        return round((bp.get("bullpen_era", 4.00) / 9.0) * config.DEFAULT_BULLPEN_INNINGS, 4)

    home_sp_r = _starter_runs(home_sp)
    away_sp_r = _starter_runs(away_sp)
    home_bp_r = _bullpen_runs(home_bp)
    away_bp_r = _bullpen_runs(away_bp)

    home_rpg = home_off.get("runs_per_game", config.LEAGUE_AVG_RPG)
    away_rpg = away_off.get("runs_per_game", config.LEAGUE_AVG_RPG)

    home_expected = round((home_sp_r + home_bp_r) * (away_rpg / config.LEAGUE_AVG_RPG), 4)
    away_expected = round((away_sp_r + away_bp_r) * (home_rpg / config.LEAGUE_AVG_RPG), 4)

    park_factor = _get_park_factor(venue)
    raw_total   = round((home_expected + away_expected) * park_factor, 4)

    weather_adj, _ = _calc_weather_adjustment(weather)
    projected_total = round(raw_total + weather_adj, 2)

    temp_f    = weather.get("temp_f", 72.0)
    wind_mph  = weather.get("wind_speed_mph", 0.0)
    wind_dir  = weather.get("wind_direction", "none")
    cond      = weather.get("conditions", "Unknown")

    if ou_line is None:
        edge = None
        recommendation = "NO LINE"
    else:
        edge = round(projected_total - ou_line, 2)
        thr  = config.OVER_UNDER_EDGE_THRESHOLD
        if edge >= thr:
            recommendation = "OVER"
        elif edge <= -thr:
            recommendation = "UNDER"
        else:
            recommendation = "SKIP"

    return GameProjection(
        game_id=game_id,
        matchup=f"{away_team} @ {home_team}",
        venue=venue,
        home_team=home_team,
        away_team=away_team,
        ou_line=ou_line,
        home_starter_expected_runs=home_sp_r,
        away_starter_expected_runs=away_sp_r,
        home_bullpen_expected_runs=home_bp_r,
        away_bullpen_expected_runs=away_bp_r,
        home_team_expected_score=home_expected,
        away_team_expected_score=away_expected,
        park_factor=park_factor,
        raw_total=raw_total,
        weather_adjustment=weather_adj,
        projected_total=projected_total,
        temp_f=temp_f,
        wind_speed_mph=wind_mph,
        wind_direction=wind_dir,
        conditions=cond,
        edge=edge,
        recommendation=recommendation,
    )


def project_all_games(games: list[dict]) -> list[GameProjection]:
    return [project_game_total(g) for g in games]


# ==============================================================================
# STRATEGY C — PITCHER PROPS & ANCHOR SYSTEM
# ==============================================================================

_MIN_PITCH_COUNT_FOR_ELITE = 90
_MIN_K_RATE_FOR_GOBLIN     = 0.25   # K/9 >= ~7.5
_MIN_OPP_AVG_FOR_ANCHOR    = 0.270


def run_pitcher_props_engine(pitcher_props_raw: list[dict]) -> list[PitcherPropRecommendation]:
    recommendations: list[PitcherPropRecommendation] = []
    for prop in pitcher_props_raw:
        avg_pc = prop.get("avg_pitch_count", 0)
        k_per9 = prop.get("k_per9", 0.0)
        if avg_pc < _MIN_PITCH_COUNT_FOR_ELITE or (k_per9 / 27.0) < _MIN_K_RATE_FOR_GOBLIN:
            continue
        recommendations.append(
            PitcherPropRecommendation(
                pitcher_name=prop.get("pitcher_name", "Unknown"),
                team=prop.get("team", ""),
                k_per9=k_per9,
                avg_pitch_count=avg_pc,
                goblin_line=prop.get("goblin_line", 0.0),
                full_prop_line=prop.get("strikeout_prop_line", 0.0),
                prop_label=prop.get("prop_recommendation", ""),
            )
        )
    recommendations.sort(key=lambda p: p.k_per9, reverse=True)
    return recommendations


def run_anchor_system_engine(
    batter_anchor_raw: list[dict],
    pitcher_props: list[PitcherPropRecommendation],
) -> list[AnchorSlip]:
    pitcher_prop_map: dict[str, PitcherPropRecommendation] = {
        p.pitcher_name: p for p in pitcher_props
    }
    slips: list[AnchorSlip] = []
    for anchor in batter_anchor_raw:
        paired_with = anchor.get("paired_with", "")
        matched: PitcherPropRecommendation | None = None
        for pname, pprop in pitcher_prop_map.items():
            if pname in paired_with or paired_with.startswith(pname):
                matched = pprop
                break
        if matched is None:
            matched = PitcherPropRecommendation(
                pitcher_name=paired_with.split(" Over ")[0].strip(),
                team="", k_per9=0.0, avg_pitch_count=0,
                goblin_line=0.0, full_prop_line=0.0, prop_label=paired_with,
            )
        slips.append(
            AnchorSlip(
                pitcher_prop=matched,
                batter_name=anchor.get("batter_name", "Unknown"),
                batter_team=anchor.get("team", ""),
                batter_prop_label=anchor.get("anchor_recommendation", ""),
                opponent_pitcher_opp_avg=anchor.get("opp_pitcher_opponent_avg", 0.0),
                pair_confidence=anchor.get("pair_confidence", "Medium"),
            )
        )
    return slips


# ==============================================================================
# UTILITY: Formatting helpers
# ==============================================================================

def format_prob_pct(prob: float) -> str:
    return f"{prob * 100:.2f}%"


def format_american_odds(american: int) -> str:
    return f"+{american}" if american >= 0 else str(american)


def combined_prob_to_str(prob: float) -> str:
    return f"{prob * 100:.4f}%"


def format_ml_american(american: int) -> str:
    return f"+{american}" if american >= 0 else str(american)
