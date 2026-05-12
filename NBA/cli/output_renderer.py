"""
NBA CLI Output Renderer - Advanced Status-Aware Console
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
    """
    Creates a dynamic header based on the game status (LIVE, FINAL, SCHEDULED).
    """
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
        
    else: # Scheduled
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
    """
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    
    # 1. Generate unique prediction data
    dynamic_data = generate_dynamic_prediction(home, away)
    
    # 2. Map calculated results back to match_data
    match_data['predicted_winner'] = dynamic_data.get('predicted_winner', home)
    match_data['win_prob'] = dynamic_data.get('win_prob', 50.0)
    match_data['total_line'] = dynamic_data.get('predicted_total', 220.0)
    match_data['total_pred'] = "OVER" if match_data['total_line'] > 200 else "UNDER"
    match_data['pace'] = dynamic_data.get('pace', "MEDIUM")
    
    # 3. Dynamic Team Totals
    h_off_pts = dynamic_data.get('home_off', {}).get('avg_pts', 110.0)
    a_off_pts = dynamic_data.get('away_off', {}).get('avg_pts', 110.0)
    
    h_total_line = round(h_off_pts * 0.95, 1)
    a_total_line = round(a_off_pts * 0.95, 1)
    
    team_totals = [
        {"team": home, "pred": "OVER", "line": h_total_line, "prob": match_data['win_prob']},
        {"team": away, "pred": "UNDER", "line": a_total_line, "prob": round(100 - match_data['win_prob'], 1)}
    ]
    
    # 4. Value Bet Ranking
    best_bets = [
        {"market": f"{match_data['total_pred']} {match_data['total_line']}", "prob": 74, "value": "BEST"},
        {"market": f"{home} O{h_total_line}", "prob": match_data['win_prob'], "value": "SAFE"},
        {"market": f"Q1 {dynamic_data.get('quarters', {}).get('q1', {}).get('winner')} Win", "prob": 67, "value": "HIGH"}
    ]
    
    # 5. Build UI Components
    header_panel = create_status_aware_header(match_data)
    
    # Pass confidence to main table instead of win_prob for display
    display_data = {**match_data, 'win_prob': dynamic_data.get('confidence', 70.0)}
    main_table = create_main_table(display_data)
    
    team_table = create_team_total_table(team_totals)
    quarter_table = create_quarter_table(dynamic_data.get('quarters', {}))
    value_table = create_value_bet_table(best_bets)
    
    h2h_panel = Text.assemble(
        ("\nH2H: ", "bold magenta"),
        (match_data.get("h2h_summary", "Matchup analysis reveals unique team patterns."), "white")
    )

    # 6. Render Layout
    render_match_layout(
        console, 
        header_panel, 
        main_table, 
        team_table, 
        quarter_table, 
        value_table, 
        h2h_panel
    )
