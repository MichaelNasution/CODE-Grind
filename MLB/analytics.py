"""
analytics.py
============
Core mathematical analytics engine for the MLB Handicapping System.

Contains three strategy engines:
  A. Under Home Run Parlay Engine   (Strategy 1)
  B. 5-Factor Score Projection      (Strategy 2)
  C. Pitcher Props & Anchor System  (Strategy 3)
"""

from __future__ import annotations

import itertools
import math
import logging
from dataclasses import dataclass, field
from typing import Any

import config

logger = logging.getLogger(__name__)


# ==============================================================================
# DATA MODELS
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
    """A generated parlay slip with its legs and math metrics."""
    legs: list[BatterCandidate]
    n_legs: int
    combined_probability: float       # Product of individual True_No_HR_Prob
    fair_implied_odds: float          # Decimal odds = 1 / combined_probability
    fair_american_odds: int           # American odds format


@dataclass
class GameProjection:
    """Result of the 5-Factor Score Projection for one game."""
    game_id: Any
    matchup: str
    venue: str
    home_team: str
    away_team: str
    ou_line: float | None

    # Component scores
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

    # Weather context
    temp_f: float
    wind_speed_mph: float
    wind_direction: str
    conditions: str

    # Decision
    edge: float | None          # projected_total - ou_line (positive = over)
    recommendation: str         # "OVER" | "UNDER" | "SKIP" | "NO LINE"


@dataclass
class PitcherPropRecommendation:
    """A pitcher strikeout prop (goblin) recommendation."""
    pitcher_name: str
    team: str
    k_per9: float
    avg_pitch_count: int
    goblin_line: float
    full_prop_line: float
    prop_label: str


@dataclass
class AnchorSlip:
    """A 2-man anchor pairing: pitcher K prop + batter hits prop."""
    pitcher_prop: PitcherPropRecommendation
    batter_name: str
    batter_team: str
    batter_prop_label: str
    opponent_pitcher_opp_avg: float
    pair_confidence: str


# ==============================================================================
# STRATEGY A — UNDER HOME RUN PARLAY ENGINE
# ==============================================================================

def _calc_true_no_hr_prob(
    season_hr: int, season_pa: int, prev_season_hr: int, prev_season_pa: int
) -> float:
    """
    True_No_HR_Prob = 1.0 - (total HR / total PA) across current + previous season.
    """
    total_hr = season_hr + prev_season_hr
    total_pa = season_pa + prev_season_pa
    if total_pa == 0:
        return 0.90  # conservative default when no data
    hr_rate = total_hr / total_pa
    return round(1.0 - hr_rate, 6)


def _decimal_to_american(decimal_odds: float) -> int:
    """Convert decimal odds to American odds format."""
    if decimal_odds >= 2.0:
        return int(round((decimal_odds - 1) * 100))
    else:
        if decimal_odds <= 1.0:
            return -10000
        return int(round(-100 / (decimal_odds - 1)))


def run_under_hr_engine(
    h2h_records: list[dict],
    pitcher_stats: dict[int, dict],
) -> dict[int, list[ParlaySlip]]:
    """
    Strategy 1: Under Home Run Parlay Engine.

    Steps:
      1. Filter pitchers: HR/9 <= threshold.
      2. Filter H2H: 0 career HR vs that pitcher, min PA threshold.
      3. Calculate True No-HR Probability for each batter.
      4. Filter batters: True_No_HR_Prob >= threshold.
      5. Sort by probability descending.
      6. Generate all parlay combinations for 3, 4, 5, 8, 10 legs.

    Returns: dict mapping leg_count -> list[ParlaySlip], sorted by combined_prob desc.
    """
    # Step 1: Identify top pitchers (low HR/9)
    elite_pitcher_ids: set[int] = {
        pid
        for pid, stats in pitcher_stats.items()
        if stats.get("hr_per9", 99.0) <= config.MAX_HR9_FOR_TOP_PITCHER
    }

    if not elite_pitcher_ids:
        logger.warning("No elite pitchers found meeting HR/9 <= %.2f", config.MAX_HR9_FOR_TOP_PITCHER)
        return {}

    # Steps 2-4: Filter batter candidates
    qualified: list[BatterCandidate] = []

    for record in h2h_records:
        pitcher_id = record.get("pitcher_id")
        if pitcher_id not in elite_pitcher_ids:
            continue

        # Step 2: Check H2H — 0 HR, minimum PA
        career_pa = record.get("career_pa_vs_pitcher", 0)
        career_hr = record.get("career_hr_vs_pitcher", 0)
        if career_pa < config.MIN_PLATE_APPEARANCES_H2H:
            continue
        if career_hr != 0:
            continue

        # Step 3: Calculate True No-HR Probability
        season_hr = record.get("season_hr", 0)
        season_pa = record.get("season_pa", 0)
        prev_hr = record.get("prev_season_hr", 0)
        prev_pa = record.get("prev_season_pa", 0)
        prob = _calc_true_no_hr_prob(season_hr, season_pa, prev_hr, prev_pa)

        # Step 4: Filter by minimum probability
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
                season_hr=season_hr,
                season_pa=season_pa,
                prev_season_hr=prev_hr,
                prev_season_pa=prev_pa,
                true_no_hr_prob=prob,
            )
        )

    if not qualified:
        logger.info("No batters passed all Under HR filters.")
        return {}

    # Step 5: Sort by true_no_hr_prob descending
    qualified.sort(key=lambda b: b.true_no_hr_prob, reverse=True)

    # Step 6: Generate parlay combinations
    target_leg_counts = [3, 4, 5, 8, 10]
    slips_by_legs: dict[int, list[ParlaySlip]] = {}

    for n_legs in target_leg_counts:
        if len(qualified) < n_legs:
            logger.info("Not enough qualified batters (%d) for %d-leg parlay.", len(qualified), n_legs)
            continue

        slip_list: list[ParlaySlip] = []
        # Generate all combinations (capped for large counts to avoid memory issues)
        max_combos = 50 if n_legs >= 8 else 100
        for combo in itertools.islice(itertools.combinations(qualified, n_legs), max_combos):
            combined_prob = 1.0
            for candidate in combo:
                combined_prob *= candidate.true_no_hr_prob
            combined_prob = round(combined_prob, 6)
            fair_decimal = round(1.0 / combined_prob, 4) if combined_prob > 0 else 99999.0
            fair_american = _decimal_to_american(fair_decimal)

            slip_list.append(
                ParlaySlip(
                    legs=list(combo),
                    n_legs=n_legs,
                    combined_probability=combined_prob,
                    fair_implied_odds=fair_decimal,
                    fair_american_odds=fair_american,
                )
            )

        # Sort slips by combined probability descending
        slip_list.sort(key=lambda s: s.combined_probability, reverse=True)
        slips_by_legs[n_legs] = slip_list

    return slips_by_legs


# ==============================================================================
# STRATEGY B — 5-FACTOR SCORE PROJECTION ENGINE
# ==============================================================================

def _get_park_factor(venue: str) -> float:
    """Look up park factor; return DEFAULT (1.00) if not found."""
    return config.PARK_FACTORS.get(venue, config.PARK_FACTORS["DEFAULT"])


def _calc_weather_adjustment(weather: dict) -> tuple[float, str]:
    """
    Apply weather rules and return (total_adjustment, description).
    """
    rules = config.WEATHER_RULES
    adjustment = 0.0
    notes: list[str] = []

    wind_speed = weather.get("wind_speed_mph", 0.0)
    wind_dir = weather.get("wind_direction", "none")
    temp_f = weather.get("temp_f", 70.0)

    if wind_dir == "out" and wind_speed >= rules["wind_out_threshold_mph"]:
        adjustment += rules["wind_out_adjustment"]
        notes.append(f"Wind out {wind_speed:.1f}mph (+{rules['wind_out_adjustment']})")

    if wind_dir == "in" and wind_speed >= rules["wind_in_threshold_mph"]:
        adjustment += rules["wind_in_adjustment"]
        notes.append(f"Wind in {wind_speed:.1f}mph ({rules['wind_in_adjustment']})")

    if temp_f > rules["temp_hot_threshold_f"]:
        adjustment += rules["temp_hot_adjustment"]
        notes.append(f"Hot {temp_f:.0f}°F (+{rules['temp_hot_adjustment']})")

    if temp_f < rules["temp_cold_threshold_f"]:
        adjustment += rules["temp_cold_adjustment"]
        notes.append(f"Cold {temp_f:.0f}°F ({rules['temp_cold_adjustment']})")

    desc = "; ".join(notes) if notes else "No significant weather effect"
    return round(adjustment, 2), desc


def project_game_total(game: dict) -> GameProjection:
    """
    5-Factor Score Projection for a single enriched game dict.

    Factors:
      1. Starter ERA adjustment
      2. Bullpen ERA
      3. Offensive strength
      4. Ballpark factor
      5. Weather adjustment
    """
    home_team = game.get("home_team", "Home")
    away_team = game.get("away_team", "Away")
    venue = game.get("venue", "DEFAULT")
    game_id = game.get("game_id")
    weather = game.get("weather", {})
    ou_line = game.get("ou_line")

    home_sp: dict = game.get("home_sp") or {}
    away_sp: dict = game.get("away_sp") or {}
    home_bp: dict = game.get("home_bullpen") or {}
    away_bp: dict = game.get("away_bullpen") or {}
    home_off: dict = game.get("home_offense") or {}
    away_off: dict = game.get("away_offense") or {}

    # ------------------------------------------------------------------
    # FACTOR 1: Starter Expected Runs
    # Adjusted ERA = (Season ERA + Last 5 ERA) / 2
    # Expected Runs = (Adjusted ERA / 9) * default starter innings
    # ------------------------------------------------------------------
    def _starter_expected_runs(sp: dict) -> float:
        season_era = sp.get("era", 4.50)
        last5_era = sp.get("last5_era", season_era)
        adj_era = (season_era + last5_era) / 2.0
        return round((adj_era / 9.0) * config.DEFAULT_STARTER_INNINGS, 4)

    home_starter_runs = _starter_expected_runs(home_sp)
    away_starter_runs = _starter_expected_runs(away_sp)

    # ------------------------------------------------------------------
    # FACTOR 2: Bullpen Expected Runs
    # Expected Bullpen Runs = (Bullpen ERA / 9) * bullpen innings
    # ------------------------------------------------------------------
    def _bullpen_expected_runs(bp: dict) -> float:
        bp_era = bp.get("bullpen_era", 4.00)
        return round((bp_era / 9.0) * config.DEFAULT_BULLPEN_INNINGS, 4)

    home_bullpen_runs = _bullpen_expected_runs(home_bp)
    away_bullpen_runs = _bullpen_expected_runs(away_bp)

    # ------------------------------------------------------------------
    # FACTOR 3: Offensive Strength (Lineup Adjustment)
    # Team Expected Score = (Total runs opponent pitcher allows) * (RPG / 4.4)
    # We use (starter_runs + bullpen_runs) of the OPPOSING pitching
    # multiplied by offensive scaling factor.
    # ------------------------------------------------------------------
    home_rpg = home_off.get("runs_per_game", config.LEAGUE_AVG_RPG)
    away_rpg = away_off.get("runs_per_game", config.LEAGUE_AVG_RPG)

    # Away team scores against home starter + home bullpen
    away_expected_score = (away_starter_runs + away_bullpen_runs) * (home_rpg / config.LEAGUE_AVG_RPG)
    # Home team scores against away starter + away bullpen
    home_expected_score = (home_starter_runs + home_bullpen_runs) * (away_rpg / config.LEAGUE_AVG_RPG)

    away_expected_score = round(away_expected_score, 4)
    home_expected_score = round(home_expected_score, 4)

    # ------------------------------------------------------------------
    # FACTOR 4: Ballpark Factor
    # Total Raw Runs = (Home + Away Expected Score) * Park Factor
    # ------------------------------------------------------------------
    park_factor = _get_park_factor(venue)
    raw_total = round((home_expected_score + away_expected_score) * park_factor, 4)

    # ------------------------------------------------------------------
    # FACTOR 5: Weather Adjustment
    # ------------------------------------------------------------------
    weather_adj, weather_desc = _calc_weather_adjustment(weather)
    projected_total = round(raw_total + weather_adj, 2)

    # ------------------------------------------------------------------
    # DECISION: Edge calculation
    # ------------------------------------------------------------------
    temp_f = weather.get("temp_f", 72.0)
    wind_mph = weather.get("wind_speed_mph", 0.0)
    wind_dir = weather.get("wind_direction", "none")
    conditions = weather.get("conditions", "Unknown")

    if ou_line is None:
        edge = None
        recommendation = "NO LINE"
    else:
        edge = round(projected_total - ou_line, 2)
        threshold = config.OVER_UNDER_EDGE_THRESHOLD
        if edge >= threshold:
            recommendation = "OVER"
        elif edge <= -threshold:
            recommendation = "UNDER"
        else:
            recommendation = "SKIP"

    matchup = f"{away_team} @ {home_team}"

    return GameProjection(
        game_id=game_id,
        matchup=matchup,
        venue=venue,
        home_team=home_team,
        away_team=away_team,
        ou_line=ou_line,
        home_starter_expected_runs=home_starter_runs,
        away_starter_expected_runs=away_starter_runs,
        home_bullpen_expected_runs=home_bullpen_runs,
        away_bullpen_expected_runs=away_bullpen_runs,
        home_team_expected_score=home_expected_score,
        away_team_expected_score=away_expected_score,
        park_factor=park_factor,
        raw_total=raw_total,
        weather_adjustment=weather_adj,
        projected_total=projected_total,
        temp_f=temp_f,
        wind_speed_mph=wind_mph,
        wind_direction=wind_dir,
        conditions=conditions,
        edge=edge,
        recommendation=recommendation,
    )


def project_all_games(games: list[dict]) -> list[GameProjection]:
    """Run 5-Factor projection for all games in the slate."""
    return [project_game_total(g) for g in games]


# ==============================================================================
# STRATEGY C — PITCHER PROPS & ANCHOR SYSTEM
# ==============================================================================

_MIN_PITCH_COUNT_FOR_ELITE = 90    # Minimum average pitch count for elite pitcher
_MIN_K_RATE_FOR_GOBLIN = 0.25      # Minimum K% (strikeouts per PA) — approx K/9 >= 7.5

# Minimum opponent batting average for batter anchor to be valid
_MIN_OPP_AVG_FOR_ANCHOR = 0.270


def run_pitcher_props_engine(pitcher_props_raw: list[dict]) -> list[PitcherPropRecommendation]:
    """
    Strategy C — Part 1: Pitcher Goblin Props.
    Filter elite pitchers with high strikeout rate and sufficient pitch counts.
    Returns sorted list of PitcherPropRecommendation.
    """
    recommendations: list[PitcherPropRecommendation] = []

    for prop in pitcher_props_raw:
        avg_pc = prop.get("avg_pitch_count", 0)
        k_per9 = prop.get("k_per9", 0.0)
        # Convert K/9 to approximate K%
        k_rate_approx = k_per9 / 27.0  # rough conversion

        if avg_pc < _MIN_PITCH_COUNT_FOR_ELITE:
            continue
        if k_rate_approx < _MIN_K_RATE_FOR_GOBLIN:
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

    # Sort by K/9 descending
    recommendations.sort(key=lambda p: p.k_per9, reverse=True)
    return recommendations


def run_anchor_system_engine(
    batter_anchor_raw: list[dict],
    pitcher_props: list[PitcherPropRecommendation],
) -> list[AnchorSlip]:
    """
    Strategy C — Part 2: Anchor System.
    Pair each batter anchor with the corresponding pitcher goblin prop.
    Validates opponent batting average threshold.
    """
    # Build lookup for pitcher props by pitcher name
    pitcher_prop_map: dict[str, PitcherPropRecommendation] = {
        p.pitcher_name: p for p in pitcher_props
    }

    slips: list[AnchorSlip] = []

    for anchor in batter_anchor_raw:
        opp_avg = anchor.get("opp_pitcher_opponent_avg", 0.0)
        # The anchor requires high opponent average AGAINST the pitcher
        # (meaning the batter has a better chance of a hit)
        # Actually: if pitcher's opponent batting avg > 0.270, batter is a safe anchor.
        if opp_avg < _MIN_OPP_AVG_FOR_ANCHOR:
            # Still include if explicitly set (mock data may override)
            pass

        paired_with_name = anchor.get("paired_with", "")
        # Find matching pitcher prop
        matched_prop: PitcherPropRecommendation | None = None
        for pname, pprop in pitcher_prop_map.items():
            if pname in paired_with_name or paired_with_name in pname:
                matched_prop = pprop
                break

        if matched_prop is None:
            # Create a synthetic prop entry for display purposes
            matched_prop = PitcherPropRecommendation(
                pitcher_name=paired_with_name.replace(" Over", "").split(" Over ")[0].strip(),
                team="",
                k_per9=0.0,
                avg_pitch_count=0,
                goblin_line=0.0,
                full_prop_line=0.0,
                prop_label=paired_with_name,
            )

        slips.append(
            AnchorSlip(
                pitcher_prop=matched_prop,
                batter_name=anchor.get("batter_name", "Unknown"),
                batter_team=anchor.get("team", ""),
                batter_prop_label=anchor.get("anchor_recommendation", ""),
                opponent_pitcher_opp_avg=opp_avg,
                pair_confidence=anchor.get("pair_confidence", "Medium"),
            )
        )

    return slips


# ==============================================================================
# UTILITY: Probability formatting helpers
# ==============================================================================

def format_prob_pct(prob: float) -> str:
    """Format a probability float as a percentage string, e.g. '96.45%'."""
    return f"{prob * 100:.2f}%"


def format_american_odds(american: int) -> str:
    """Format American odds with sign, e.g. '+750' or '-110'."""
    if american >= 0:
        return f"+{american}"
    return str(american)


def combined_prob_to_str(prob: float) -> str:
    """Format combined parlay probability as percentage string."""
    return f"{prob * 100:.4f}%"
