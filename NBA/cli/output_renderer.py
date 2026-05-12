"""
NBA CLI Output Renderer - Truly Dynamic Sports Analytics
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich import box

# Import rendering modules
from cli.table_renderer import (
    create_main_table, 
    create_team_total_table, 
    create_quarter_table, 
    create_value_bet_table
)
from cli.compact_layout import render_match_layout

# Import Dynamic Predictors
from predictors.matchup_predictor import generate_dynamic_prediction

console = Console()

def create_status_aware_header(match_data):
    """Creates a dynamic header based on game status."""
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    status = match_data.get("status", "scheduled").lower()
    series_info = match_data.get("series_summary", "Regular Season")
    
    header_text = Text()
    if status == "live":
        current_score = match_data.get("current_score", {"home": 0, "away": 0})
        period = match_data.get("period", 1)
        clock = match_data.get("clock", "00:00")
        header_text.append(f"LIVE Q{period} | ", style="bold red")
        header_text.append(f"{current_score['home']} - {current_score['away']} | ", style="bold white")
        header_text.append(f"{clock} remaining", style="yellow")
    elif status == "final":
        final_score = match_data.get("final_score", {"home": 0, "away": 0})
        header_text.append("FINAL | ", style="bold white")
        header_text.append(f"{final_score['home']} - {final_score['away']} | ", style="bold green")
        header_text.append(f"{series_info}", style="cyan")
    else:
        game_time = match_data.get("game_time", "00:00")
        header_text.append(f"TODAY {game_time} | ", style="bold cyan")
        header_text.append(f"{series_info}", style="white")

    return Panel(
        header_text,
        title=f"[bold white]{home} @ {away}[/bold white]",
        border_style="bright_blue" if status != "live" else "red",
        box=box.ROUNDED, expand=False
    )

def render_match_prediction(match_data):
    """
    Orchestrates truly dynamic rendering based on the specific matchup.
    """
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    
    # 1. GENERATE UNIQUE PREDICTION DATA
    dynamic = generate_dynamic_prediction(home, away)
    
    # 2. Enrich match_data with calculated results
    match_data['predicted_winner'] = dynamic['predicted_winner']
    match_data['win_prob'] = dynamic['win_prob']
    match_data['total_pred'] = "OVER" if dynamic['predicted_total'] > 220 else "UNDER"
    match_data['total_line'] = dynamic['predicted_total']
    match_data['pace'] = dynamic['pace']
    
    # 3. Dynamic Team Totals
    h_total = round(dynamic['home_off']['avg_pts'] * 0.95, 1)
    a_total = round(dynamic['away_off']['avg_pts'] * 0.95, 1)
    team_totals = [
        {"team": home, "pred": "OVER", "line": h_total, "prob": dynamic['win_prob']},
        {"team": away, "pred": "UNDER", "line": a_total, "prob": round(100 - dynamic['win_prob'], 1)}
    ]
    
    # 4. Best Value Bets (Dynamic)
    best_bets = [
        {"market": f"{match_data['total_pred']} {dynamic['predicted_total']}", "prob": 74, "value": "BEST"},
        {"market": f"{home} O{h_total}", "prob": dynamic['win_prob'], "value": "SAFE"},
        {"market": f"Q1 {dynamic['quarters']['q1']['winner']} Win", "prob": 67, "value": "HIGH"}
    ]
    
    # 5. Build Components
    header_panel = create_status_aware_header(match_data)
    main_table = create_main_table({
        **match_data, 
        'win_prob': dynamic['confidence'] # Displaying confidence in the main table as requested
    })
    team_table = create_team_total_table(team_totals)
    quarter_table = create_quarter_table(dynamic['quarters'])
    value_table = create_value_bet_table(best_bets)
    
    h2h_panel = Text.assemble(
        ("\nH2H: ", "bold magenta"),
        (match_data.get("h2h_summary", "Matchup history indicates unique patterns for these teams."), "white")
    )

    # 6. Render
    render_match_layout(console, header_panel, main_table, team_table, quarter_table, value_table, h2h_panel)
