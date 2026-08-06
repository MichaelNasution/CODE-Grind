"""
test_moneyline.py
=================
Unit tests for the MLB Moneyline Predictor using pytest.
Follows Test-Driven Development (TDD) principles.
"""

import pytest
from moneyline import (
    PitcherData,
    TeamData,
    WeatherData,
    calculate_pitcher_runs,
    calculate_bullpen_runs,
    calculate_tbr,
    calculate_offensive_multiplier,
    calculate_weather_adjustment,
    calculate_team_score,
    predict_moneyline_winner,
)


# ==============================================================================
# UNIT TESTS FOR INDIVIDUAL COMPONENT FUNCTIONS
# ==============================================================================

def test_calculate_pitcher_runs():
    """Test Pitcher Runs (PR) calculation: PR = ((Season + Last5)/2 / 9) * Innings."""
    # Adjusted ERA = (3.0 + 2.0) / 2 = 2.5
    # PR = (2.5 / 9) * 6.0 = 1.67
    pr = calculate_pitcher_runs(season_era=3.0, last_5_era=2.0, expected_innings=6.0)
    assert pr == pytest.approx(1.67, abs=0.01)


def test_calculate_bullpen_runs():
    """Test Bullpen Runs (BR) calculation: BR = (Bullpen_ERA / 9) * Innings."""
    # BR = (3.6 / 9) * 3.5 = 1.40
    br = calculate_bullpen_runs(bullpen_era=3.6, expected_innings=3.5)
    assert br == pytest.approx(1.40, abs=0.01)


def test_calculate_tbr():
    """Test Total Base Runs Allowed (TBR): TBR = PR + BR."""
    tbr = calculate_tbr(pitcher_runs=1.67, bullpen_runs=1.40)
    assert tbr == pytest.approx(3.07, abs=0.01)


def test_calculate_offensive_multiplier():
    """Test Offensive Multiplier (OM): OM = Runs_Per_Game / 4.4."""
    # OM = 5.5 / 4.4 = 1.25
    om = calculate_offensive_multiplier(runs_per_game=5.5)
    assert om == pytest.approx(1.25, abs=0.01)


def test_calculate_weather_adjustment():
    """Test Weather Adjustment rules (+0.5 for wind out > 10, +0.25 for temp > 85)."""
    # Wind 15mph out (+0.5), Temp 90F (+0.25) -> Total +0.75
    w_adj = calculate_weather_adjustment(
        wind_speed_mph=15.0, wind_direction="out", temp_f=90.0
    )
    assert w_adj == pytest.approx(0.75, abs=0.01)

    # Wind 12mph in (-0.5), Temp 45F (-0.25) -> Total -0.75
    w_adj_cold = calculate_weather_adjustment(
        wind_speed_mph=12.0, wind_direction="in", temp_f=45.0
    )
    assert w_adj_cold == pytest.approx(-0.75, abs=0.01)


# ==============================================================================
# INTEGRATION & BUSINESS LOGIC TEST CASES
# ==============================================================================

def test_predict_moneyline_strong_pick_margin_gte_1():
    """
    Test Case 1: Dominant team advantage (Margin >= 1.0 run).
    Should return '[Team Name] - STRONG PICK'.
    """
    dodgers = TeamData(
        name="Los Angeles Dodgers",
        runs_per_game=5.5,
        starter=PitcherData(season_era=3.0, last_5_era=2.0, expected_innings=6.0),
        bullpen_era=3.0,
        expected_bullpen_innings=3.0,
    )
    rockies = TeamData(
        name="Colorado Rockies",
        runs_per_game=4.0,
        starter=PitcherData(season_era=5.0, last_5_era=5.0, expected_innings=5.0),
        bullpen_era=5.0,
        expected_bullpen_innings=4.0,
    )

    result = predict_moneyline_winner(home_team=dodgers, away_team=rockies)

    assert result["recommendation"] == "Los Angeles Dodgers - STRONG PICK"
    assert result["margin"] >= 1.0
    assert isinstance(result["home_score"], float)
    assert isinstance(result["away_score"], float)


def test_predict_moneyline_no_pick_margin_lt_1():
    """
    Test Case 2: Even matchup (Margin < 1.0 run).
    Should return 'NO PICK'.
    """
    yankees = TeamData(
        name="New York Yankees",
        runs_per_game=4.4,
        starter=PitcherData(season_era=3.5, last_5_era=3.5, expected_innings=5.5),
        bullpen_era=3.5,
        expected_bullpen_innings=3.5,
    )
    red_sox = TeamData(
        name="Boston Red Sox",
        runs_per_game=4.4,
        starter=PitcherData(season_era=3.8, last_5_era=3.8, expected_innings=5.5),
        bullpen_era=3.5,
        expected_bullpen_innings=3.5,
    )

    result = predict_moneyline_winner(home_team=yankees, away_team=red_sox)

    assert result["recommendation"] == "NO PICK"
    assert result["margin"] < 1.0


def test_predict_moneyline_with_park_and_weather_adjustments():
    """
    Test Case 3: Matchup with Park Factor (1.20) and Weather Adjustments.
    Verifies that park factor and weather adjust final scores properly.
    """
    braves = TeamData(
        name="Atlanta Braves",
        runs_per_game=5.0,
        starter=PitcherData(season_era=3.0, last_5_era=3.0, expected_innings=6.0),
        bullpen_era=3.0,
        expected_bullpen_innings=3.0,
    )
    mets = TeamData(
        name="New York Mets",
        runs_per_game=4.4,
        starter=PitcherData(season_era=4.0, last_5_era=4.0, expected_innings=5.5),
        bullpen_era=4.0,
        expected_bullpen_innings=3.5,
    )
    weather = WeatherData(wind_speed_mph=15.0, wind_direction="out", temp_f=90.0)

    result = predict_moneyline_winner(
        home_team=braves,
        away_team=mets,
        park_factor=1.20,
        weather=weather,
    )

    # Braves score should be boosted by park factor and weather
    assert result["recommendation"] == "Atlanta Braves - STRONG PICK"
    assert result["margin"] >= 1.0
