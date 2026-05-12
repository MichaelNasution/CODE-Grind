"""
NBA Analytics: market_ranker.py
Ranks available betting markets to find the most profitable suggestions.
"""

def rank_best_bets(suggestions, top_n=3):
    """
    Sorts a list of betting suggestions based on their value score and probability.
    Returns the top N suggestions.
    """
    # suggestions is a list of dicts: 
    # {'market': str, 'probability': float, 'confidence': str, 'value_classification': str, 'score': float}
    
    ranked = sorted(suggestions, key=lambda x: x.get('score', 0), reverse=True)
    return ranked[:top_n]

def filter_by_risk(suggestions, risk_level="MEDIUM"):
    """
    Filters suggestions based on user risk preference.
    """
    if risk_level == "SAFE":
        return [s for s in suggestions if s['value_classification'] == "SAFE VALUE"]
    return suggestions
