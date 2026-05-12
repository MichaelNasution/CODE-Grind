"""
NBA Analytics: h2h_analysis.py
Analyzes Head-to-Head history between two teams based on the last 4 matchups with realistic variance.
"""
import random

def get_h2h_games(home_team, away_team, limit=4):
    """
    Simulates fetching the last N H2H games with high-variance NBA scoring.
    """
    seed_val = sum(ord(c) for c in home_team + away_team)
    random.seed(seed_val)
    
    h2h_games = []
    for _ in range(limit):
        # NBA games often have one 'hot' quarter and one 'cold' quarter
        # Realistic range: 18 to 42 points per quarter
        h_scores = [random.randint(22, 34) for _ in range(4)]
        a_scores = [random.randint(22, 34) for _ in range(4)]
        
        # Add random 'bursts' (e.g., Lakers 39-pt quarter)
        burst_idx = random.randint(0, 3)
        h_scores[burst_idx] += random.randint(5, 10)
        
        # Add random 'cold streaks'
        cold_idx = random.randint(0, 3)
        a_scores[cold_idx] -= random.randint(5, 8)
        
        h2h_games.append({
            "home_scores": h_scores,
            "away_scores": a_scores
        })
    return h2h_games

def analyze_h2h_quarters(h2h_games):
    """
    Calculates averages and identifies 'danger' or 'burst' quarters.
    """
    num_games = len(h2h_games)
    if num_games == 0: return None
        
    avg_home = [0, 0, 0, 0]
    avg_away = [0, 0, 0, 0]
    burst_potential = [0, 0, 0, 0]
    
    for game in h2h_games:
        for i in range(4):
            avg_home[i] += game["home_scores"][i]
            avg_away[i] += game["away_scores"][i]
            if game["home_scores"][i] > 35: burst_potential[i] += 1
            
    return {
        "q_averages": {
            "home": [round(s / num_games, 1) for s in avg_home],
            "away": [round(s / num_games, 1) for s in avg_away]
        },
        "burst_quarters": burst_potential
    }
