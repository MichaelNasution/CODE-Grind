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

def generate_dynamic_prediction(home_team, away_team):
    """
    Generates a unique prediction using an Ensemble approach.
    """
    # 1. Gather Data (Profiles & H2H)
    h_off = get_offensive_profile(home_team)
    a_off = get_offensive_profile(away_team)
    h_def = get_defensive_profile(home_team)
    a_def = get_defensive_profile(away_team)
    h2h_data = get_h2h_games(home_team, away_team, limit=4)
    h2h_analysis = analyze_h2h_quarters(h2h_data)
    
    # 2. RUN ENSEMBLE (Combining Baseline, DL, etc.)
    ensemble = get_ensemble_prediction(home_team, away_team, h_off, a_off, h_def, a_def)
    
    # 3. Calculate Meta-Data (Confidence & Pace)
    # Win probability logic based on Ensemble score gap
    gap = ensemble['home_score'] - ensemble['away_score']
    win_prob = min(max(0.5 + (gap / 25), 0.30), 0.90)
    confidence = calculate_dynamic_confidence(win_prob, h_off, a_off)
    pace = classify_pace(h_off, a_off)
    
    # 4. Quarter Projections (conditioned on Ensemble Totals)
    quarters = {}
    h2h_avgs = h2h_analysis['q_averages']
    
    for i in range(1, 5):
        # Base scores from H2H
        h_q = h2h_avgs['home'][i-1]
        a_q = h2h_avgs['away'][i-1]
        
        # Adjust based on Ensemble outcome (Weighting H2H averages towards Ensemble result)
        h_q = round(h_q * (ensemble['home_score'] / h_off['avg_pts']), 1)
        a_q = round(a_q * (ensemble['away_score'] / a_off['avg_pts']), 1)
        
        q_total = round(h_q + a_q, 1)
        q_winner = home_team if h_q > a_q else away_team
        threshold = round(q_total + (0.5 if i % 2 == 0 else -0.5), 1)
        
        quarters[f"q{i}"] = {
            "home": h_q, "away": a_q, "total": q_total, 
            "winner": q_winner, "line": threshold, "pred": "OVER" if q_total > threshold else "UNDER"
        }

    return {
        "predicted_winner": ensemble['winner'],
        "win_prob": round(win_prob * 100, 1),
        "confidence": confidence,
        "predicted_total": ensemble['total'],
        "pace": pace,
        "quarters": quarters,
        "h2h_summary": f"Ensemble analysis combines Baseline & Phase 5 DL logic for {home_team} @ {away_team}."
    }
