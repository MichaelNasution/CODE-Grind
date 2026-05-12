"""
CLI Compact Layout Manager - Arranges tables and panels
"""
from rich.console import Console
from rich.panel import Panel
from rich.layout import Layout
from rich.columns import Columns

def render_match_layout(console, header_panel, main_table, team_table, quarter_table, value_table, h2h_panel):
    """
    Orchestrates the rendering of all components into a professional console layout.
    Ensures horizontal density and vertical compactness.
    """
    # 1. Print Header
    console.print(header_panel)
    
    # 2. Print Main Prediction and Team Totals side-by-side or stacked compactly
    # We use Columns for side-by-side layout if width permits
    console.print(Columns([main_table, team_table], equal=False, expand=False))
    
    # 3. Print Quarters and Value Bets
    console.print(Columns([quarter_table, value_table], equal=False, expand=False))
    
    # 4. Print H2H Footer
    console.print(h2h_panel)
    console.print("[dim]" + "=" * 60 + "[/dim]\n")
