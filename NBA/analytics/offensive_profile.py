"""
NBA Analytics: offensive_profile.py
Analyzes a team's offensive efficiency and scoring patterns.
"""

def get_offensive_profile(team_name):
    """
    Returns a dynamic offensive profile for a team.
    """
    # Simple hash-based mock to ensure unique data per team name
    # In production, this would fetch from a database or API
    team_seed = sum(ord(c) for c in team_name) % 10
    
    base_pts = 110 + team_seed
    consistency = 0.75 + (team_seed / 50)
    pace_pref = 98 + (team_seed / 2)
    
    return {
        "team": team_name,
        "avg_pts": base_pts,
        "consistency": consistency,
        "pace_preference": pace_pref,
        "q_averages": [base_pts/4 + (i*0.5) for i in range(4)]
    }
