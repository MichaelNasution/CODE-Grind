"""
NBA Analytics: probability_engine.py
Calculates win probabilities for various betting markets.
"""

def calculate_market_probability(market_type, match_data):
    """
    Calculates probability for a specific market type.
    Supported: ML, SPREAD, TOTALS, TEAM_TOTALS, QUARTERS, PERFORMANCE, MOMENTUM
    """
    # Placeholder data structure for different market win rates
    market_prob_logic = {
        "ML": 0.71,           # Moneyline
        "SPREAD": 0.65,       # Handicap
        "TOTALS": 0.74,       # Over/Under Game
        "TEAM_TOTALS": 0.71,  # Over/Under Team
        "QUARTERS": 0.67,     # Q1-Q4 Specific
        "PERFORMANCE": 0.62,  # Team to score 100+, etc.
        "MOMENTUM": 0.58      # Pace/Trend bets
    }
    
    return market_prob_logic.get(market_type, 0.50)

def estimate_hit_rate(probability, historical_accuracy):
    """
    Combines calculated probability with model accuracy to estimate real hit rate.
    """
    return round(probability * historical_accuracy, 2)
