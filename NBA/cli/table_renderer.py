"""
CLI Table Rendering Helpers - Quant Analytics Style
"""
from rich.table import Table
from rich import box

def create_bet_tiers_table(bet_tiers):
    """Creates the BET TIERS section showing Safest to Aggressive lines."""
    table = Table(title="[bold green]BET TIERS[/bold green]", show_header=True, box=box.ROUNDED, border_style="green", expand=True)
    table.add_column("TIER", justify="left", style="bold white")
    table.add_column("INTERNAL LINE", justify="center", style="yellow")
    table.add_column("HIT PROB", justify="right")
    
    for bt in bet_tiers:
        prob = bt['probability']
        color = "green" if prob >= 80 else "cyan" if prob >= 70 else "yellow" if prob >= 60 else "red"
        
        table.add_row(
            bt['tier'],
            f"OVER {bt['line']}",
            f"[{color}]{prob}%[/{color}]"
        )
    return table

def create_team_totals_table(team_totals, home_team, away_team):
    """Creates the TEAM TOTALS section."""
    table = Table(title="[bold cyan]TEAM TOTALS[/bold cyan]", show_header=True, box=box.ROUNDED, border_style="cyan", expand=True)
    table.add_column("TEAM", justify="left", style="bold white")
    table.add_column("SAFE", justify="center")
    table.add_column("VALUE", justify="center")
    table.add_column("AGGRESSIVE", justify="center")
    
    # Extract lines for each team
    h_tiers = team_totals['home']
    a_tiers = team_totals['away']
    
    table.add_row(
        home_team,
        f"O {h_tiers['SAFE']}",
        f"O {h_tiers['VALUE']}",
        f"O {h_tiers['AGGRESSIVE']}"
    )
    table.add_row(
        away_team,
        f"O {a_tiers['SAFE']}",
        f"O {a_tiers['VALUE']}",
        f"O {a_tiers['AGGRESSIVE']}"
    )
    
    return table

def create_quarter_projections_table(quarters):
    """
    Creates the advanced Q1-Q4 prediction table with score and total projections.
    """
    table = Table(
        title="[bold magenta]QUARTERS[/bold magenta]", 
        show_header=True, 
        box=box.ROUNDED, 
        border_style="magenta", 
        header_style="bold magenta",
        expand=True
    )
    table.add_column("Q", justify="center", width=2)
    table.add_column("PROJECTED SCORE", justify="center")
    table.add_column("TOTAL", justify="center")
    table.add_column("INTERNAL LINE", justify="center")
    table.add_column("CONFIDENCE", justify="left")
    
    for q in quarters:
        score_text = f"{q['away']} - {q['home']}" # away @ home
        prob = q['probability']
        color = "green" if prob >= 75 else "cyan" if prob >= 65 else "yellow"
        
        table.add_row(
            f"Q{q['period']}",
            f"[white]{score_text}[/white]",
            f"[yellow]{round(q['total'], 1)}[/yellow]",
            f"O {q['safe_line']}",
            f"[{color}]{q['tier']} ({prob}%)[/{color}]"
        )

    return table
