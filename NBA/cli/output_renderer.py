"""
Terminal UI Rendering Logic - Advanced Betting Analytics
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich.columns import Columns

console = Console()

def render_advanced_prediction(match_data, best_bets, momentum):
    """
    Renders professional and information-rich betting analysis.
    """
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    game_time = match_data.get("game_time", "TBD")
    status = match_data.get("status", "scheduled")
    
    # 1. Header Information
    title_text = Text()
    title_text.append(f"{home.upper()} vs {away.upper()}\n", style="bold white on blue")
    
    header = Panel(
        Text.assemble(
            ("Predicted Winner: ", "bold white"), (f"{match_data['predicted_winner']}\n", "bold green"),
            ("Win Probability: ", "bold white"), (f"{match_data['win_prob']}%\n", "bold cyan"),
            ("Predicted Total: ", "bold white"), (f"{match_data['predicted_total']}", "bold yellow")
        ),
        title=f"{home} @ {away}",
        subtitle=f"Time: {game_time} | Status: {status.upper()}",
        border_style="bright_blue"
    )

    # 2. Best Value Bets Table
    bets_table = Table(title="BEST VALUE BETS", show_header=True, header_style="bold magenta", expand=True)
    bets_table.add_column("#", style="dim", width=2)
    bets_table.add_column("Suggested Bet", style="white")
    bets_table.add_column("Prob.", justify="right", style="cyan")
    bets_table.add_column("Conf.", justify="center")
    bets_table.add_column("Value Classification", justify="right")

    for i, bet in enumerate(best_bets, 1):
        # Color coding for value
        val_style = "bold green" if "BEST" in bet['value'] else "bold yellow"
        if "SAFE" in bet['value']: val_style = "bold cyan"
        if "RISKY" in bet['value']: val_style = "bold red"
        
        conf_style = "bold green" if bet['confidence'] == "HIGH" else "yellow"

        bets_table.add_row(
            str(i),
            bet['market'],
            f"{bet['probability']}%",
            Text(bet['confidence'], style=conf_style),
            Text(bet['value'], style=val_style)
        )

    # 3. Pace & Momentum Analysis
    pace_panel = Panel(
        Text.assemble(
            ("Expected Pace: ", "bold white"), (f"{momentum['expected_pace']}\n", "yellow"),
            ("First Half Projection: ", "bold white"), (f"{momentum['first_half_projection']}\n", "cyan"),
            ("Quarter Trend: ", "bold white"), (f"{momentum['quarter_trend']}", "magenta")
        ),
        title="PACE ANALYSIS",
        border_style="yellow"
    )

    # Rendering everything
    console.print("\n")
    console.print(header)
    console.print(bets_table)
    console.print(pace_panel)
    console.print("=" * 60)

def render_match_prediction(match_data):
    """
    Fallback for simpler rendering or orchestrator for advanced rendering.
    """
    # Mock data generation for advanced display demonstration
    best_bets = [
        {"market": f"UNDER {match_data.get('predicted_total', 220) + 4}.5", "probability": 74, "confidence": "HIGH", "value": "BEST VALUE"},
        {"market": "Q1 Pistons Win", "probability": 67, "confidence": "MEDIUM", "value": "HIGH VALUE"},
        {"market": f"{match_data['home_team']} Team Total OVER 109.5", "probability": 71, "confidence": "HIGH", "value": "SAFE VALUE"}
    ]
    
    momentum = {
        "expected_pace": "FAST",
        "first_half_projection": "HIGH SCORING",
        "quarter_trend": f"FAVORS {match_data['home_team'].upper()}"
    }
    
    # Enrich match data with mock results for display
    match_data['predicted_winner'] = match_data['home_team']
    match_data['win_prob'] = 71
    match_data['predicted_total'] = 224.5
    
    render_advanced_prediction(match_data, best_bets, momentum)
