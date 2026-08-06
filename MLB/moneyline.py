"""
moneyline.py
============
MLB Moneyline Predictor Engine using pure quantitative functions.

Calculates:
  1. Pitcher Runs (PR)
  2. Bullpen Runs (BR)
  3. Total Base Runs Allowed (TBR)
  4. Offensive Multiplier (OM)
  5. Adjusted Team Score (Park & Weather Factor)
  6. Moneyline Recommendation (STRONG PICK vs NO PICK)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TypedDict


# ==============================================================================
# DATA MODELS
# ==============================================================================

@dataclass(frozen=True)
class PitcherData:
    """Starter pitcher metrics."""
    season_era: float
    last_5_era: float
    expected_innings: float = 5.5


@dataclass(frozen=True)
class TeamData:
    """Team offensive and pitching metrics."""
    name: str
    runs_per_game: float
    starter: PitcherData
    bullpen_era: float
    expected_bullpen_innings: float = 3.5


@dataclass(frozen=True)
class WeatherData:
    """Environmental weather metrics."""
    wind_speed_mph: float = 0.0
    wind_direction: str = "none"   # "out", "in", or "none"
    temp_f: float = 70.0


class MoneylineResult(TypedDict):
    """Result payload for moneyline prediction."""
    home_score: float
    away_score: float
    margin: float
    recommendation: str


# ==============================================================================
# PURE CALCULATION FUNCTIONS
# ==============================================================================

def calculate_pitcher_runs(
    season_era: float,
    last_5_era: float,
    expected_innings: float = 5.5,
) -> float:
    """
    Calculate Pitcher Runs (PR) allowed.
    Formula:
      Adjusted_ERA = (Season_ERA + Last_5_Starts_ERA) / 2
      PR = (Adjusted_ERA / 9) * Expected_Starter_Innings
    """
    adjusted_era = (season_era + last_5_era) / 2.0
    pr = (adjusted_era / 9.0) * expected_innings
    return round(pr, 4)


def calculate_bullpen_runs(
    bullpen_era: float,
    expected_innings: float = 3.5,
) -> float:
    """
    Calculate Bullpen Runs (BR) allowed.
    Formula: BR = (Bullpen_ERA / 9) * Expected_Bullpen_Innings
    """
    br = (bullpen_era / 9.0) * expected_innings
    return round(br, 4)


def calculate_tbr(pitcher_runs: float, bullpen_runs: float) -> float:
    """
    Calculate Total Base Runs Allowed (TBR).
    Formula: TBR = PR + BR
    """
    return round(pitcher_runs + bullpen_runs, 4)


def calculate_offensive_multiplier(runs_per_game: float) -> float:
    """
    Calculate Offensive Multiplier (OM) relative to MLB league average (4.4).
    Formula: OM = Team_Runs_Per_Game / 4.4
    """
    return round(runs_per_game / 4.4, 4)


def calculate_weather_adjustment(
    wind_speed_mph: float = 0.0,
    wind_direction: str = "none",
    temp_f: float = 70.0,
) -> float:
    """
    Calculate run score adjustment based on weather.
    Rules:
      - Wind > 10 mph out (+0.5), in (-0.5)
      - Temp > 85F (+0.25), < 50F (-0.25)
    """
    adj = 0.0
    wind_dir = wind_direction.lower()

    if wind_speed_mph > 10.0:
        if wind_dir == "out":
            adj += 0.5
        elif wind_dir == "in":
            adj -= 0.5

    if temp_f > 85.0:
        adj += 0.25
    elif temp_f < 50.0:
        adj -= 0.25

    return round(adj, 2)


def calculate_team_score(
    team: TeamData,
    opponent: TeamData,
    park_factor: float = 1.0,
    weather: WeatherData | None = None,
) -> float:
    """
    Calculate expected final score for a team facing an opponent.
    Steps:
      1. Calculate opponent TBR (Expected runs allowed by opponent pitching)
      2. Calculate team OM (Offensive Multiplier)
      3. Raw Score = Opponent_TBR * Team_OM
      4. Apply Park Factor: Score * Park_Factor
      5. Apply Weather Adjustment: Score + Weather_Adj
    """
    opp_pr = calculate_pitcher_runs(
        opponent.starter.season_era,
        opponent.starter.last_5_era,
        opponent.starter.expected_innings,
    )
    opp_br = calculate_bullpen_runs(
        opponent.bullpen_era,
        opponent.expected_bullpen_innings,
    )
    opp_tbr = calculate_tbr(opp_pr, opp_br)

    team_om = calculate_offensive_multiplier(team.runs_per_game)
    raw_score = opp_tbr * team_om

    park_adjusted_score = raw_score * park_factor

    weather_adj = 0.0
    if weather is not None:
        weather_adj = calculate_weather_adjustment(
            weather.wind_speed_mph,
            weather.wind_direction,
            weather.temp_f,
        )

    final_score = park_adjusted_score + weather_adj
    return round(final_score, 2)


# ==============================================================================
# MAIN PREDICTOR ENTRY POINT
# ==============================================================================

def predict_moneyline_winner(
    home_team: TeamData,
    away_team: TeamData,
    park_factor: float = 1.0,
    weather: WeatherData | None = None,
) -> MoneylineResult:
    """
    Predict MLB Moneyline Winner and determine if there is a strong pick.

    Decision Rules:
      - Margin = |Home_Score - Away_Score|
      - If Margin >= 1.0 run: return "[Team Name] - STRONG PICK"
      - If Margin < 1.0 run: return "NO PICK"
    """
    home_score = calculate_team_score(home_team, away_team, park_factor, weather)
    away_score = calculate_team_score(away_team, home_team, park_factor, weather)

    margin = round(abs(home_score - away_score), 2)

    if margin >= 1.0:
        winning_team = home_team.name if home_score > away_score else away_team.name
        recommendation = f"{winning_team} - STRONG PICK"
    else:
        recommendation = "NO PICK"

    return {
        "home_score": home_score,
        "away_score": away_score,
        "margin": margin,
        "recommendation": recommendation,
    }
