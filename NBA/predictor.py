import pandas as pd
from typing import Dict, Any

def predict_total(df: pd.DataFrame, home_team: str, visitor_team: str) -> float:
    """
    Predicts the total points of a match based on historical averages.
    Uses home scoring average for home team and away scoring average for visitor team.
    """
    home_avg = df[df['home_team'] == home_team]['home_team_score'].mean()
    visitor_avg = df[df['visitor_team'] == visitor_team]['visitor_team_score'].mean()
    
    # Simple logic: sum of average scores
    # If no data, return a default NBA average (~220)
    if pd.isna(home_avg) or pd.isna(visitor_avg):
        return 220.0
        
    return round(home_avg + visitor_avg, 2)

def predict_winner(df: pd.DataFrame, home_team: str, visitor_team: str) -> str:
    """
    Predicts the winner based on historical win rates in their respective roles (home/away).
    """
    home_win_rate = (df[df['home_team'] == home_team]['winner'] == 'home').mean()
    visitor_win_rate = (df[df['visitor_team'] == visitor_team]['winner'] == 'visitor').mean()
    
    # Handle NaN cases if a team hasn't played in that role yet
    home_win_rate = home_win_rate if not pd.isna(home_win_rate) else 0.5
    visitor_win_rate = visitor_win_rate if not pd.isna(visitor_win_rate) else 0.5
    
    if home_win_rate >= visitor_win_rate:
        return home_team
    else:
        return visitor_team

def detect_value_bet(predicted_probability: float, bookmaker_odds: float) -> bool:
    """
    Detects if a bet has value.
    Value exists if (Probability * Odds) > 1.
    This is the core logic for professional betting analytics.
    """
    return (predicted_probability * bookmaker_odds) > 1.0
