"""
NBA Analytics: value_engine.py
Responsible for classifying bets into BEST, SAFE, RISKY, and LOW value categories.
"""

def classify_value(probability, confidence, odds=None):
    """
    Classifies a bet based on probability and confidence.
    Placeholder for actual value calculation logic.
    """
    # Logic to be implemented:
    # BEST VALUE: High Odds + High Probability
    # SAFE VALUE: Low Odds + Very High Probability
    # RISKY VALUE: High Odds + Low Probability
    
    if probability > 0.75 and confidence == "HIGH":
        return "BEST VALUE"
    elif probability > 0.80:
        return "SAFE VALUE"
    elif probability < 0.50 and probability > 0.40:
        return "RISKY VALUE"
    else:
        return "HIGH VALUE"

def get_value_score(probability, confidence):
    """
    Calculates a numerical value score for ranking.
    """
    # Placeholder: Weight probability and confidence to create a rankable score
    conf_multiplier = {"HIGH": 1.2, "MEDIUM": 1.0, "LOW": 0.8}
    return (probability * 100) * conf_multiplier.get(confidence, 1.0)
