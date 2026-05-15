"""
NBA Analytics: line_generator.py
Generates internal betting lines based on projections and variance.
"""

class LineGenerator:
    def __init__(self):
        pass

    def generate_tiered_lines(self, projected_value, variance, pace_rating):
        """
        Generates SAFEST, SAFE, VALUE, AGGRESSIVE lines.
        Distance between lines depends on pace and variance.
        """
        # Dynamic distance multiplier based on pace
        if pace_rating == "FAST":
            dist_multiplier = 1.2  # Lines are further apart in high pace games
        elif pace_rating == "SLOW":
            dist_multiplier = 0.8  # Lines are closer in low pace games
        else:
            dist_multiplier = 1.0
            
        # Base step is related to variance (std dev)
        # Typically 0.5 to 1.0 standard deviations
        step = (variance * 0.4) * dist_multiplier
        
        # Round to nearest .5 for betting lines
        def round_line(val):
            return round(val * 2) / 2
            
        lines = {
            "SAFEST": round_line(projected_value - (step * 2)),
            "SAFE": round_line(projected_value - step),
            "VALUE": round_line(projected_value),
            "AGGRESSIVE": round_line(projected_value + step)
        }
        
        return lines

line_generator = LineGenerator()
