"""
NBA Analytics: pace_classifier.py
Classifies game pace based on team profiles.
"""

def classify_pace(home_profile, away_profile):
    """
    Dynamically classifies pace as FAST, MEDIUM, or SLOW.
    """
    combined_pace = (home_profile['pace_preference'] + away_profile['pace_preference']) / 2
    
    if combined_pace > 102:
        return "FAST"
    elif combined_pace > 99.5:
        return "MEDIUM"
    else:
        return "SLOW"

def estimate_possessions(home_profile, away_profile):
    """Calculates estimated total possessions for the game."""
    return (home_profile['pace_preference'] + away_profile['pace_preference']) / 2
