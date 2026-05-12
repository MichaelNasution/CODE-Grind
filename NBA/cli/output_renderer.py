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
    status_str = match_data.get("status", "scheduled").lower()
    series_info = match_data.get("series_summary", "Regular Season")
    
    header_text = Text()
    
    if status_str == "live":
        current_score = match_data.get("current_score", {"home": 0, "away": 0})
        period = match_data.get("period", 1)
        clock_val = match_data.get("clock", "00:00")
        
        header_text.append(f"LIVE Q{period} | ", style="bold red")
        header_text.append(f"{current_score['home']} - {current_score['away']} | ", style="bold white")
        header_text.append(f"{clock_val} remaining", style="yellow")
        
    elif status_str == "final":
        final_score = match_data.get("final_score", {"home": 0, "away": 0})
        header_text.append("FINAL | ", style="bold white")
        header_text.append(f"{final_score['home']} - {final_score['away']} | ", style="bold green")
        header_text.append(f"{series_info}", style="cyan")
        
    else: # Scheduled
        game_time_str = match_data.get("game_time", "00:00")
        header_text.append(f"TODAY {game_time_str} | ", style="bold cyan")
        header_text.append(f"{series_info}", style="white")

    return Panel(
        header_text,
        title=f"[bold white]{home} @ {away}[/bold white]",
        border_style="bright_blue" if status_str != "live" else "red",
        box=box.ROUNDED,
        expand=False
    )

def render_match_prediction(match_data):
    """
    Main entry point for rendering professional betting analysis.
    """
    # 1. Pastikan data dasar tersedia
    home_name = match_data.get("home_team", "HOME")
    away_name = match_data.get("away_team", "AWAY")
    
    # 2. Generate unique prediction data
    dynamic_data = generate_dynamic_prediction(home_name, away_name)
    
    # 3. Sinkronisasi data prediksi ke match_data
    match_data['predicted_winner'] = dynamic_data.get('predicted_winner', home_name)
    match_data['win_prob'] = dynamic_data.get('win_prob', 50.0)
    match_data['total_line'] = dynamic_data.get('predicted_total', 220.0)
    match_data['total_pred'] = "OVER" if match_data['total_line'] > 200 else "UNDER"
    match_data['pace'] = dynamic_data.get('pace', "MEDIUM")
    
    # 4. Analisis Tim (L1-L3 style)
    h_profile = dynamic_data.get('home_off', {})
    a_profile = dynamic_data.get('away_off', {})
    
    h_pts_avg = h_profile.get('avg_pts', 110.0)
    a_pts_avg = a_profile.get('avg_pts', 110.0)
    
    h_total_line = round(h_pts_avg * 0.95, 1)
    a_total_line = round(a_pts_avg * 0.95, 1)
    
    team_totals_list = [
        {"team": home_name, "pred": "OVER", "line": h_total_line, "prob": match_data['win_prob']},
        {"team": away_name, "pred": "UNDER", "line": a_total_line, "prob": round(100 - match_data['win_prob'], 1)}
    ]
    
    # 5. Best Value Bets Ranking
    best_bets_list = [
        {"market": f"{match_data['total_pred']} {match_data['total_line']}", "prob": 74, "value": "BEST"},
        {"market": f"{home_name} O{h_total_line}", "prob": match_data['win_prob'], "value": "SAFE"},
        {"market": f"Q1 {dynamic_data.get('quarters', {}).get('q1', {}).get('winner')} Win", "prob": 67, "value": "HIGH"}
    ]
    
    # 6. Komponen UI Rich
    header_panel = create_status_aware_header(match_data)
    
    # Confidence display
    meta_data = {**match_data, 'win_prob': dynamic_data.get('confidence', 70.0)}
    main_table_ui = create_main_table(meta_data)
    
    team_table_ui = create_team_total_table(team_totals_list)
    quarter_table_ui = create_quarter_table(dynamic_data.get('quarters', {}))
    value_table_ui = create_value_bet_table(best_bets_list)
    
    h2h_text = Text.assemble(
        ("\nH2H: ", "bold magenta"),
        (match_data.get("h2h_summary", "Matchup analysis reveals unique team patterns."), "white")
    )

    # 7. Final Render via Layout
    render_match_layout(
        console, 
        header_panel, 
        main_table_ui, 
        team_table_ui, 
        quarter_table_ui, 
        value_table_ui, 
        h2h_text
    )
