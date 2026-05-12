"""
NBA Predictors: matchup_predictor.py
Orchestrates dynamic matchup-specific analysis.
"""
from analytics.offensive_profile import get_offensive_profile
from analytics.defensive_profile import get_defensive_profile
from analytics.pace_classifier import classify_pace
from analytics.dynamic_confidence import calculate_dynamic_confidence

def generate_dynamic_prediction(home_team, away_team):
    """
    Generates a truly unique prediction for each specific matchup.
    """
    h_off = get_offensive_profile(home_team)
    a_off = get_offensive_profile(away_team)
    h_def = get_defensive_profile(home_team)
    a_def = get_defensive_profile(away_team)
    
    # 1. Calculate Edge and Win Probability
    # (Offensive Strength vs Opponent Defensive Strength)
    h_edge = (h_off['avg_pts'] - a_def['def_rating'])
    a_edge = (a_off['avg_pts'] - h_def['def_rating'])
    
    prob_diff = (h_edge - a_edge) / 15 # Scaling factor
    win_prob = 0.5 + prob_diff
    win_prob = min(max(win_prob, 0.35), 0.85) # Caps
    
    winner = home_team if win_prob >= 0.5 else away_team
    
    # 2. Dynamic Total Points
    # Base is sum of offensive averages adjusted by defensive impact
    base_total = (h_off['avg_pts'] + a_off['avg_pts'])
    def_adj = (h_def['def_rating'] + a_def['def_rating']) / 2
    predicted_total = round((base_total + def_adj) / 2, 1)
    
    # 3. Dynamic Confidence
    confidence = calculate_dynamic_confidence(win_prob, h_off, a_off)
    
    # 4. Pace Classification
    pace = classify_pace(h_off, a_off)
    
    # 5. Quarter Projections (Unique per matchup)
    # Simplified quarter scores based on team offensive averages
    quarters = {}
    for i in range(1, 5):
        h_q = round(h_off['q_averages'][i-1] - (a_def['def_rating']/50), 1)
        a_q = round(a_off['q_averages'][i-1] - (h_def['def_rating']/50), 1)
        total_q = round(h_q + a_q, 1)
        winner_q = home_team if h_q > a_q else away_team
        
        quarters[f"q{i}"] = {
            "home": h_q, "away": a_q, "total": total_q, 
            "winner": winner_q, "line": round(total_q + 0.5, 1), "pred": "UNDER"
        }

    return {
        "predicted_winner": winner,
        "win_prob": round(win_prob * 100, 1),
        "confidence": confidence,
        "predicted_total": predicted_total,
        "pace": pace,
        "quarters": quarters,
        "home_off": h_off,
        "away_off": a_off,
        "away_def": a_def
    }
