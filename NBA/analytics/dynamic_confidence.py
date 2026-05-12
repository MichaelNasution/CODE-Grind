"""
NBA Analytics: dynamic_confidence.py
Calculates confidence based on statistical edge and consistency.
"""

def calculate_dynamic_confidence(win_prob, home_profile, away_profile):
    """
    Calculates a unique confidence percentage for each matchup.
    """
    # 1. Start with win probability edge
    edge = abs(win_prob - 0.5) * 2 # 0.0 to 1.0
    
    # 2. Factor in consistency (reliability)
    consistency_factor = (home_profile['consistency'] + away_profile['consistency']) / 2
    
    # 3. Final calculation
    # Range should be roughly 55% to 95%
    confidence = 50 + (edge * 30) + (consistency_factor * 10)
    
    return round(min(max(confidence, 55.0), 95.0), 1)
