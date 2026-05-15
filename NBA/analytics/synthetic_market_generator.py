"""
NBA Analytics: synthetic_market_generator.py
Orchestrates the generation of all internal betting markets.
"""
from analytics.projection_engine import projection_engine
from analytics.variance_engine import variance_engine
from analytics.line_generator import line_generator
from analytics.confidence_engine import confidence_engine

class SyntheticMarketGenerator:
    def __init__(self):
        pass

    def generate_full_analysis(self, home_team, away_team):
        """
        Runs the full pipeline to generate a comprehensive analysis.
        """
        # 1. Pace Analysis
        pace_val, pace_rating = projection_engine.project_pace(home_team, away_team)
        
        # 2. Score Projections
        home_score = projection_engine.project_team_score(home_team, away_team, is_home=True)
        away_score = projection_engine.project_team_score(away_team, home_team, is_home=False)
        total_projected = home_score + away_score
        
        # 3. Variance Analysis
        home_var = variance_engine.estimate_variance(home_team, pace_rating)
        away_var = variance_engine.estimate_variance(away_team, pace_rating)
        total_var = variance_engine.get_matchup_variance(home_var, away_var)
        
        # 4. Generate Totals Market
        total_tiers = line_generator.generate_tiered_lines(total_projected, total_var, pace_rating)
        total_market = []
        for tier_name, line in total_tiers.items():
            prob = confidence_engine.calculate_hit_probability(total_projected, line, total_var, is_over=True)
            total_market.append({
                "tier": tier_name,
                "line": line,
                "probability": prob
            })
            
        # 5. Team Totals
        home_tiers = line_generator.generate_tiered_lines(home_score, home_var, pace_rating)
        away_tiers = line_generator.generate_tiered_lines(away_score, away_var, pace_rating)
        
        # 6. Quarter Projections
        home_qs = projection_engine.project_quarters(home_score)
        away_qs = projection_engine.project_quarters(away_score)
        
        quarter_data = []
        for i in range(4):
            q_total = home_qs[i] + away_qs[i]
            q_var = total_var * 0.4  # Simplified quarter variance
            q_line = round((q_total - 2) * 2) / 2 # Example SAFE line
            q_prob = confidence_engine.calculate_hit_probability(q_total, q_line, q_var, is_over=True)
            
            quarter_data.append({
                "period": i + 1,
                "home": home_qs[i],
                "away": away_qs[i],
                "total": q_total,
                "safe_line": q_line,
                "probability": q_prob,
                "tier": "SAFE" if q_prob > 70 else "VALUE"
            })

        return {
            "matchup": f"{away_team} @ {home_team}",
            "projected_score": {"home": home_score, "away": away_score},
            "projected_total": total_projected,
            "pace": pace_rating,
            "bet_tiers": total_market,
            "team_totals": {
                "home": home_tiers,
                "away": away_tiers
            },
            "quarters": quarter_data
        }

market_generator = SyntheticMarketGenerator()
