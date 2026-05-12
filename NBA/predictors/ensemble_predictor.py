"""
NBA Predictors: ensemble_predictor.py
Ensemble Engine: Combines Baseline, Linear, Tree, and DL models.
Inspired by NBA AI (github.com/NBA-Betting/NBA_AI)
"""
from predictors.engines.baseline_engine import predict_baseline
from predictors.engines.dl_engine import predict_deep_learning

def get_ensemble_prediction(home_team, away_team, h_off, a_off, h_def, a_def):
    """
    Equal-weight combination of multiple prediction engines.
    """
    # 1. Baseline (Formula)
    b_res = predict_baseline(h_off, a_off, h_def, a_def)
    
    # 2. DL (Phase 5 Style)
    dl_res = predict_deep_learning(
        {"team": home_team, "offensive_profile": h_off},
        {"team": away_team, "offensive_profile": a_off}
    )
    
    # 3. Simulate Ensemble Average (Averages spreads and probabilities)
    final_home = (b_res['home'] + dl_res['home']) / 2
    final_away = (b_res['away'] + dl_res['away']) / 2
    
    return {
        "home_score": round(final_home, 1),
        "away_score": round(final_away, 1),
        "total": round(final_home + final_away, 1),
        "winner": home_team if final_home > final_away else away_team
    }
