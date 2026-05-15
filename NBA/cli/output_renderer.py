"""
NBA CLI Output Renderer - Advanced Status-Aware Console
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich import box
from datetime import datetime, timedelta

# Import rendering modules
from cli.table_renderer import (
    create_bet_tiers_table,
    create_team_totals_table,
    create_quarter_projections_table
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
        game_date_str = match_data.get("game_date", "")
        
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        if game_date_str == today:
            label = "TODAY"
        elif game_date_str == tomorrow:
            label = "TOMORROW"
        else:
            label = game_date_str if game_date_str else "SCHEDULED"
            
        header_text.append(f"{label} {game_time_str} | ", style="bold cyan")
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
    Main entry point for rendering professional Quant-Style betting analysis.
    """
    # 1. Pastikan data dasar tersedia
    home_name = match_data.get("home_team", "HOME")
    away_name = match_data.get("away_team", "AWAY")
    
    # 2. Generate Quant Analytics
    dynamic_data = generate_dynamic_prediction(home_name, away_name)
    analysis = dynamic_data['analysis']
    
    # 3. Create UI Components
    header_panel = create_status_aware_header(match_data)
    
    # Summary Section
    summary_table = Table(show_header=False, box=box.ROUNDED, border_style="bright_blue", padding=(0, 1), expand=True)
    summary_table.add_row(
        "[bold white]PROJECTED FINAL SCORE[/bold white]", 
        f"[bold green]{away_name} {round(analysis['projected_score']['away'], 1)} - {round(analysis['projected_score']['home'], 1)} {home_name}[/bold green]"
    )

    summary_table.add_row("[bold white]PROJECTED TOTAL[/bold white]", f"[bold yellow]{analysis['projected_total']}[/bold yellow]")
    summary_table.add_row("[bold white]PACE[/bold white]", f"[bold cyan]{analysis['pace']}[/bold cyan]")
    
    # Market Tables
    bet_tiers_ui = create_bet_tiers_table(analysis['bet_tiers'])
    team_totals_ui = create_team_totals_table(analysis['team_totals'], home_name, away_name)
    quarter_ui = create_quarter_projections_table(analysis['quarters'])
    
    h2h_text = Text.assemble(
        ("\nANALYSIS: ", "bold magenta"),
        (f"Quant engine detected {analysis['pace']} pace with internal variance modeling for this matchup.", "white")
    )

    # 4. Final Render via Layout
    render_match_layout(
        console, 
        header_panel, 
        summary_table, 
        bet_tiers_ui, 
        team_totals_ui, 
        quarter_ui, 
        h2h_text
    )
