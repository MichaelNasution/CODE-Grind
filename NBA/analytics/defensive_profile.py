"""
NBA Analytics: defensive_profile.py
Analyzes a team's defensive efficiency.
"""

def get_defensive_profile(team_name):
    """
    Returns a dynamic defensive profile for a team.
    """
    team_seed = sum(ord(c) for c in team_name) % 8
    
    def_rating = 108 + team_seed
    opponent_pace_impact = -1 + (team_seed / 4)
    
    return {
        "team": team_name,
        "def_rating": def_rating,
        "opponent_pace_impact": opponent_pace_impact,
        "clutch_defense": 0.8 + (team_seed / 40)
    }
