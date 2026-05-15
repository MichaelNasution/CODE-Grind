"""
NBA Analytics: variance_engine.py
Estimates scoring volatility and variance for teams and matchups.
"""
import random

class VarianceEngine:
    def __init__(self):
        pass

    def estimate_variance(self, team_name, pace_rating, consistency_score=0.8):
        """
        Estimates variance based on pace and historical consistency.
        High pace = High variance potential.
        """
        # Base variance for NBA scoring (std dev approx 8-12 points)
        base_variance = 10.0
        
        # Pace multiplier: Fast pace games have more possessions, thus higher score variance
        pace_multiplier = 1.0
        if pace_rating == "FAST":
            pace_multiplier = 1.25
        elif pace_rating == "SLOW":
            pace_multiplier = 0.85
            
        # Consistency: lower consistency means higher volatility
        volatility_factor = (1.0 - consistency_score) * 20.0
        
        calculated_variance = (base_variance * pace_multiplier) + volatility_factor
        
        # Add some matchup-aware randomness
        seed = sum(ord(c) for c in team_name)
        random.seed(seed)
        calculated_variance *= random.uniform(0.9, 1.1)
        
        return round(calculated_variance, 2)

    def get_matchup_variance(self, home_variance, away_variance):
        """
        Calculates the combined variance for a matchup (Total variance).
        """
        # Sum of variances (assuming independent, though they aren't fully)
        return round((home_variance**2 + away_variance**2)**0.5, 2)

variance_engine = VarianceEngine()
