"""
NBA CLI Output Renderer - Advanced Status-Aware Console
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich import box

# Import new rendering modules
from cli.table_renderer import (
    create_main_table, 
    create_team_total_table, 
    create_quarter_table, 
    create_value_bet_table
)
from cli.compact_layout import render_match_layout

console = Console()

def create_status_aware_header(match_data):
    """
    Creates a dynamic header based on the game status (LIVE, FINAL, SCHEDULED).
    """
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    status = match_data.get("status", "scheduled").lower()
    series_info = match_data.get("series_summary", "Regular Season")
    
    header_text = Text()
    
    if status == "live":
        # Example: LIVE Q3 | 88 - 82 | 04:22 remaining
        current_score = match_data.get("current_score", {"home": 0, "away": 0})
        period = match_data.get("period", 1)
        clock = match_data.get("clock", "00:00")
        
        header_text.append(f"LIVE Q{period} | ", style="bold red")
        header_text.append(f"{current_score['home']} - {current_score['away']} | ", style="bold white")
        header_text.append(f"{clock} remaining", style="yellow")
        
    elif status == "final":
        # Example: FINAL | 131 - 108 | OKC wins series 4-0
        final_score = match_data.get("final_score", {"home": 0, "away": 0})
        header_text.append("FINAL | ", style="bold white")
        header_text.append(f"{final_score['home']} - {final_score['away']} | ", style="bold green")
        header_text.append(f"{series_info}", style="cyan")
        
    else: # Scheduled
        # Example: TODAY 09:30 | OKC leads series 3-0
        game_time = match_data.get("game_time", "00:00")
        header_text.append(f"TODAY {game_time} | ", style="bold cyan")
        header_text.append(f"{series_info}", style="white")

    return Panel(
        header_text,
        title=f"[bold white]{home} @ {away}[/bold white]",
        border_style="bright_blue" if status != "live" else "red",
        box=box.ROUNDED,
        expand=False
    )

def render_match_prediction(match_data):
    """
    Main entry point for rendering professional betting analysis.
    Status-aware and horizontally compact.
    """
    # 1. Prepare Data
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    
    # Simulate/Default Data for display
    match_data['predicted_winner'] = match_data.get('predicted_winner', home)
    match_data['win_prob'] = match_data.get('win_prob', 71)
    match_data['total_pred'] = match_data.get('total_pred', "UNDER")
    match_data['total_line'] = match_data.get('total_line', 224.5)
    match_data['pace'] = match_data.get('pace', "FAST")
    
    team_totals = [
        {"team": home, "pred": "OVER", "line": 111.5, "prob": 71},
        {"team": away, "pred": "UNDER", "line": 108.5, "prob": 68}
    ]
    
    # Advanced Quarter Predictions with score projections
    quarters = {
        "q1": {"home": 29, "away": 25, "total": 54, "winner": home, "line": 54.5, "pred": "OVER"},
        "q2": {"home": 24, "away": 27, "total": 51, "winner": away, "line": 52.5, "pred": "UNDER"},
        "q3": {"home": 31, "away": 25, "total": 56, "winner": home, "line": 56.5, "pred": "OVER"},
        "q4": {"home": 28, "away": 23, "total": 51, "winner": home, "line": 51.5, "pred": "UNDER"}
    }
    
    best_bets = [
        {"market": f"{match_data['total_pred']} {match_data['total_line']}", "prob": 74, "value": "BEST"},
        {"market": f"{home} O111.5", "prob": 71, "value": "SAFE"},
        {"market": f"Q1 {home} Win", "prob": 67, "value": "HIGH"}
    ]
    
    h2h_trend = match_data.get("h2h_summary", "Historical trends favor strong Q1 starts.")

    # 2. Build UI Components
    header_panel = create_status_aware_header(match_data)
    main_table = create_main_table(match_data)
    team_table = create_team_total_table(team_totals)
    quarter_table = create_quarter_table(quarters)
    value_table = create_value_bet_table(best_bets)
    
    h2h_panel = Text.assemble(
        ("\nH2H: ", "bold magenta"),
        (h2h_trend, "white")
    )

    # 3. Render Layout
    render_match_layout(
        console, 
        header_panel, 
        main_table, 
        team_table, 
        quarter_table, 
        value_table, 
        h2h_panel
    )
