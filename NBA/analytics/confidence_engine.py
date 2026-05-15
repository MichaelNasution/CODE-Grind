"""
NBA Analytics: confidence_engine.py
Calculates hit probability and classifies betting confidence tiers.
"""
import math

class ConfidenceEngine:
    def __init__(self):
        pass

    def calculate_hit_probability(self, projected_value, target_line, variance, is_over=True):
        """
        Uses a simplified normal distribution (CDF) to estimate probability.
        """
        if variance <= 0:
            return 50.0
            
        # Z-score: (target - mean) / std_dev
        z_score = (target_line - projected_value) / variance
        
        # Simplified Error Function (ERF) approximation for CDF
        # Standard Normal CDF = 0.5 * (1 + erf(z / sqrt(2)))
        # We'll use a standard approximation for the normal distribution
        prob = 0.5 * (1.0 + math.erf(-z_score / math.sqrt(2.0)))
        
        if not is_over:
            prob = 1.0 - prob
            
        return round(prob * 100, 1)

    def classify_tier(self, probability):
        """
        Classifies the confidence tier based on hit probability.
        """
        if probability >= 80:
            return "VERY SAFE", "SAFEST"
        elif probability >= 70:
            return "SAFE", "SAFE"
        elif probability >= 60:
            return "BALANCED", "VALUE"
        elif probability >= 50:
            return "AGGRESSIVE", "AGGRESSIVE"
        else:
            return "HIGH RISK", "LONG SHOT"

confidence_engine = ConfidenceEngine()
