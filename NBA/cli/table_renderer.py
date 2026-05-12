"""
CLI Table Rendering Helpers - Advanced Sportsbook Style
"""
from rich.table import Table
from rich import box

def create_main_table(match_data):
    """Creates the primary prediction table (Winner, Confidence, Total, Pace)."""
    table = Table(show_header=False, box=box.ROUNDED, border_style="bright_blue", padding=(0, 1))
    
    win_color = "bold green" if match_data['win_prob'] > 65 else "yellow"
    
    table.add_row("[bold white]Winner[/bold white]", f"[{win_color}]{match_data['predicted_winner']}[/{win_color}]")
    table.add_row("[bold white]Confidence[/bold white]", f"{match_data['win_prob']}%")
    table.add_row("[bold white]Total[/bold white]", f"[bold yellow]{match_data['total_pred']} {match_data['total_line']}[/bold yellow]")
    table.add_row("[bold white]Pace[/bold white]", f"[bold cyan]{match_data['pace']}[/bold cyan]")
    
    return table

def create_team_total_table(team_totals):
    """Creates the Team Totals section."""
    table = Table(title="[bold cyan]TEAM TOTALS[/bold cyan]", show_header=False, box=box.ROUNDED, border_style="cyan", width=40)
    for tt in team_totals:
        table.add_row(f"{tt['team']} {tt['pred']} {tt['line']}", f"[bold white]{tt['prob']}%[/bold white]")
    return table

def create_quarter_table(quarters):
    """
    Creates the advanced Q1-Q4 prediction table with score and total projections.
    Structure: Q | Winner | Score Predict | Total | Prediction
    """
    table = Table(
        title="[bold magenta]QUARTERS[/bold magenta]", 
        show_header=True, 
        box=box.ROUNDED, 
        border_style="magenta", 
        header_style="bold magenta"
    )
    table.add_column("Q", justify="center", width=2)
    table.add_column("Winner", justify="left")
    table.add_column("Score Predict", justify="center")
    table.add_column("Total", justify="center")
    table.add_column("Prediction", justify="left")
    
    for q_id, q_data in quarters.items():
        score_text = f"{q_data['home']} - {q_data['away']}"
        table.add_row(
            q_id.upper(),
            f"[white]{q_data['winner']}[/white]",
            f"[cyan]{score_text}[/cyan]",
            f"[yellow]{q_data['total']}[/yellow]",
            f"[bold white]{q_data['pred']} {q_data['line']}[/bold white]"
        )
    return table

def create_value_bet_table(best_bets):
    """Creates the ranked Value Bet table."""
    table = Table(title="[bold green]BEST VALUE BETS[/bold green]", show_header=True, box=box.ROUNDED, border_style="green")
    table.add_column("#", justify="center")
    table.add_column("Suggested Bet", justify="left")
    table.add_column("Prob", justify="right")
    table.add_column("Value", justify="center")
    
    for i, bet in enumerate(best_bets, 1):
        val_color = "bold green" if bet['value'] == "BEST" else "bold cyan"
        if bet['value'] == "HIGH": val_color = "bold yellow"
        
        table.add_row(
            str(i),
            bet['market'],
            f"{bet['prob']}%",
            f"[{val_color}]{bet['value']}[/{val_color}]"
        )
    return table
