"""
NBA Engine: baseline_engine.py
Level: Baseline (Team PPG and Opponent PPG Averages)
"""

def predict_baseline(home_off, away_off, home_def, away_def):
    """
    Standard formula-based predictor using PPG.
    """
    h_proj = (home_off['avg_pts'] + away_def['def_rating']) / 2
    a_proj = (away_off['avg_pts'] + home_def['def_rating']) / 2
    
    return {"home": h_proj, "away": a_proj}
