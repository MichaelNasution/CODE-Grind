"""
NBA Predictors: matchup_predictor.py
Orchestrates dynamic matchup-specific analysis using high-variance H2H data.
"""
from analytics.offensive_profile import get_offensive_profile
from analytics.defensive_profile import get_defensive_profile
from analytics.pace_classifier import classify_pace
from analytics.dynamic_confidence import calculate_dynamic_confidence
from analytics.h2h_analysis import get_h2h_games, analyze_h2h_quarters

def generate_dynamic_prediction(home_team, away_team):
    """
    Generates a unique prediction using high-variance H2H historical data.
    """
    # 1. Fetch and Analyze H2H History (Last 4 Games)
    h2h_data = get_h2h_games(home_team, away_team, limit=4)
    h2h_analysis = analyze_h2h_quarters(h2h_data)
    
    # 2. Get Team Profiles
    h_off = get_offensive_profile(home_team)
    a_off = get_offensive_profile(away_team)
    h_def = get_defensive_profile(home_team)
    a_def = get_defensive_profile(away_team)
    
    # 3. Calculate Winner Probability
    h_edge = (h_off['avg_pts'] - a_def['def_rating'])
    a_edge = (a_off['avg_pts'] - h_def['def_rating'])
    prob_diff = (h_edge - a_edge) / 12 # Increased sensitivity
    win_prob = min(max(0.5 + prob_diff, 0.30), 0.90)
    
    winner = home_team if win_prob >= 0.5 else away_team
    
    # 4. Confidence & Pace
    confidence = calculate_dynamic_confidence(win_prob, h_off, a_off)
    pace = classify_pace(h_off, a_off)
    
    # 5. DYNAMIC QUARTER PREDICTIONS (High Variance)
    quarters = {}
    h2h_avgs = h2h_analysis['q_averages']
    
    for i in range(1, 5):
        h_score = h2h_avgs['home'][i-1]
        a_score = h2h_avgs['away'][i-1]
        
        # Apply momentum based on profiles
        h_score = round(h_score * h_off['consistency'] * 1.1, 1)
        a_score = round(a_score * a_off['consistency'] * 1.1, 1)
        
        q_total = round(h_score + a_score, 1)
        q_winner = home_team if h_score > a_score else away_team
        
        # Determine Prediction (Dynamic Over/Under threshold)
        threshold = round(q_total + (0.5 if i % 2 == 0 else -0.5), 1)
        pred = "OVER" if q_total > threshold else "UNDER"
        
        quarters[f"q{i}"] = {
            "home": h_score, "away": a_score, "total": q_total, 
            "winner": q_winner, "line": threshold, "pred": pred
        }

    # 6. Final Predicted Total
    predicted_total = sum(q['total'] for q in quarters.values())

    return {
        "predicted_winner": winner,
        "win_prob": round(win_prob * 100, 1),
        "confidence": confidence,
        "predicted_total": round(predicted_total, 1),
        "pace": pace,
        "quarters": quarters,
        "h2h_summary": f"Last 4 H2H showed burst potential in Q{h2h_analysis['burst_quarters'].index(max(h2h_analysis['burst_quarters']))+1}."
    }
