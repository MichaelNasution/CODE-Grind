"""
NBA Predictors: matchup_predictor.py
Dynamic matchup analysis powered by an Ensemble of multiple engines.
Inspired by NBA AI (Phase 5 Hierarchical Architecture)
"""
from analytics.offensive_profile import get_offensive_profile
from analytics.defensive_profile import get_defensive_profile
from analytics.pace_classifier import classify_pace
from analytics.dynamic_confidence import calculate_dynamic_confidence
from analytics.h2h_analysis import get_h2h_games, analyze_h2h_quarters
from predictors.ensemble_predictor import get_ensemble_prediction

from analytics.synthetic_market_generator import market_generator

def generate_dynamic_prediction(home_team, away_team):
    """
    Generates a unique prediction using the new Quant-Style Analytics Engine.
    Flow: Matchup -> Profile -> Pace -> Variance -> Projection -> Line Generation -> Confidence.
    """
    # Use the new market generator which implements the full requested flow
    analysis = market_generator.generate_full_analysis(home_team, away_team)
    
    # Map the analysis back to the format expected by the renderer (for now)
    # or better, update the renderer to use the analysis directly.
    # We will update the renderer in the next step.
    
    return {
        "analysis": analysis,
        # Legacy fields for backward compatibility during transition
        "predicted_winner": home_team if analysis['projected_score']['home'] > analysis['projected_score']['away'] else away_team,
        "win_prob": 70.0, # Will be calculated properly in the new renderer
        "predicted_total": analysis['projected_total'],
        "pace": analysis['pace'],
        "quarters": analysis['quarters']
    }

