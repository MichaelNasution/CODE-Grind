"""
Terminal UI Rendering Logic - Compact Professional Betting Analytics
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table

console = Console()

def render_compact_prediction(match_data, h2h_trend_text):
    """
    Renders a compact and highly readable professional betting analysis.
    """
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    game_time = match_data.get("game_time", "00:00")
    status = match_data.get("status", "SCHEDULED")
    
    # 1. Header Section
    header = Text()
    header.append(f"==================================================\n", style="dim")
    header.append(f"{home.upper()} @ {away.upper()}\n", style="bold white")
    header.append(f"{status.upper()} | {game_time}\n", style="cyan")
    header.append(f"============\n", style="dim")
    
    # 2. Main Outcomes
    outcomes = Text()
    outcomes.append("\nWINNER:\n", style="bold blue")
    outcomes.append(f"{match_data['predicted_winner']} ({match_data['win_prob']}%)\n", style="white")
    
    outcomes.append("\nTOTAL:\n", style="bold yellow")
    outcomes.append(f"{match_data['total_pred']} {match_data['total_line']} ({match_data['total_prob']}%)\n", style="white")
    
    # 3. Team Totals
    team_totals = Text()
    team_totals.append("\nTEAM TOTALS:\n", style="bold cyan")
    for tt in match_data['team_totals']:
        team_totals.append(f"{tt['team']} {tt['pred']} {tt['line']} ({tt['prob']}%)\n", style="white")
    
    # 4. Quarters Section
    quarters = Text()
    quarters.append("\nQUARTERS:\n", style="bold magenta")
    for q_key, q_val in match_data['quarters'].items():
        quarters.append(f"{q_key.upper()} -> {q_val['winner']:<12} | {q_val['total_pred']} {q_val['total_line']}\n", style="white")
    
    # 5. Best Value
    best_value = Text()
    best_value.append("\nBEST VALUE:\n", style="bold green")
    for i, val in enumerate(match_data['best_value_bets'], 1):
        best_value.append(f"{i}. {val}\n", style="white")
        
    # 6. Pace & H2H Trend
    footer = Text()
    footer.append("\nPACE:\n", style="bold white")
    footer.append(f"{match_data['pace']}\n", style="yellow")
    
    footer.append("\nH2H TREND:\n", style="bold white")
    footer.append(f"{h2h_trend_text}\n", style="magenta")
    footer.append(f"==================================================\n", style="dim")

    # Combine everything into a single render
    final_render = Text.assemble(header, outcomes, team_totals, quarters, best_value, footer)
    console.print(final_render)

def render_match_prediction(match_data):
    """
    Adapter for the compact renderer with full H2H and Quarter data.
    """
    # Simulate the expanded data structure from H2H and Team Total analysis
    expanded_data = {
        "home_team": match_data.get("home_team", "Cavaliers"),
        "away_team": match_data.get("away_team", "Pistons"),
        "game_time": match_data.get("game_time", "00:00"),
        "status": match_data.get("status", "LIVE"),
        "predicted_winner": "Cavaliers",
        "win_prob": 71,
        "total_pred": "UNDER",
        "total_line": 224.5,
        "total_prob": 74,
        "team_totals": [
            {"team": "Cavaliers", "pred": "OVER", "line": 111.5, "prob": 71},
            {"team": "Pistons", "pred": "UNDER", "line": 108.5, "prob": 68}
        ],
        "quarters": {
            "q1": {"winner": "Cavaliers", "total_pred": "OVER", "total_line": 54.5},
            "q2": {"winner": "Pistons", "total_pred": "UNDER", "total_line": 52.5},
            "q3": {"winner": "Cavaliers", "total_pred": "OVER", "total_line": 56.5},
            "q4": {"winner": "Cavaliers", "total_pred": "UNDER", "total_line": 51.5}
        },
        "best_value_bets": [
            "UNDER 224.5",
            "Cavaliers OVER 111.5",
            "Q1 Cavaliers Win"
        ],
        "pace": "FAST"
    }
    
    h2h_trend = "Cavaliers dominated Q3 in 3/4 last H2H"
    
    render_compact_prediction(expanded_data, h2h_trend)
