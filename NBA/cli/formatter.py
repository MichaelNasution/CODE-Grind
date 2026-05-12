"""
CLI Text Formatting Helpers
"""

def format_currency(value):
    return f"${value:,.2f}"

def format_percentage(value):
    return f"{value:.1f}%"

def color_by_value(value, thresholds):
    """Returns a rich color string based on value thresholds."""
    if value >= thresholds.get('high', 80):
        return "bold green"
    if value >= thresholds.get('medium', 50):
        return "yellow"
    return "red"
