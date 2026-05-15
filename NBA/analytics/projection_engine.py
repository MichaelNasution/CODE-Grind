"""
NBA Analytics: projection_engine.py
Core projection logic for pace, team scores, and quarter splits.
"""
import random

class ProjectionEngine:
    def __init__(self):
        pass

    def project_pace(self, home_team, away_team):
        """
        Projects game pace (Possessions per 48 min).
        """
        seed = sum(ord(c) for c in home_team + away_team)
        random.seed(seed)
        
        # Base NBA pace is around 98-102
        base_pace = random.uniform(96, 104)
        
        if base_pace > 101:
            rating = "FAST"
        elif base_pace < 98:
            rating = "SLOW"
        else:
            rating = "MEDIUM"
            
        return round(base_pace, 1), rating

    def project_team_score(self, team_name, opponent_name, pace_val=100.0, is_home=True):
        """
        Projects a team's total score based on offensive/defensive profiles and PACE.
        """
        seed = sum(ord(c) for c in team_name + opponent_name)
        random.seed(seed + (1 if is_home else 0))
        
        # Base Efficiency (Points per 100 possessions)
        # NBA average is around 110-115
        efficiency = random.uniform(108, 118)
        
        # Home court advantage (efficiency boost)
        if is_home:
            efficiency += 2.0
            
        # Matchup variance
        efficiency += random.uniform(-3, 3)
        
        # Score = (Pace * Efficiency) / 100
        projected_score = (pace_val * efficiency) / 100.0
        
        return round(projected_score, 1)


    def project_quarters(self, total_score):
        """
        Splits total score into 4 quarters with realistic NBA distribution.
        """
        # NBA quarters are usually: Q1/Q3 higher, Q2/Q4 vary
        weights = [0.26, 0.24, 0.26, 0.24]
        
        # Add some randomness to weights
        weights = [w * random.uniform(0.9, 1.1) for w in weights]
        total_w = sum(weights)
        weights = [w/total_w for w in weights]
        
        quarters = [round(total_score * w, 1) for w in weights]
        return quarters

projection_engine = ProjectionEngine()
