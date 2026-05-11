"""
Terminal UI Rendering Logic
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()

def render_match_prediction(match_data):
    """
    Renders the professional CLI output for a match prediction using real data.
    """
    home = match_data.get("home_team", "HOME")
    away = match_data.get("away_team", "AWAY")
    game_time = match_data.get("game_time", "TBD")
    status = match_data.get("status", "scheduled")
    series = match_data.get("series_summary", "")
    
    title = f"{home.upper()} vs {away.upper()}"
    if series:
        title += f" ({series})"

    # Status color mapping
    status_color = "yellow"
    if status == "live":
        status_color = "red"
    elif status == "final":
        status_color = "white"

    # Placeholder logic for predictions (to be implemented by user)
    prediction_content = Text()
    prediction_content.append(f"Time: {game_time} | Status: ", style="bold white")
    prediction_content.append(f"{status.upper()}\n", style=f"bold {status_color}")
    prediction_content.append("\n")
    
    prediction_content.append("Predicted Winner:\n", style="bold blue")
    prediction_content.append(f"{away}\n\n", style="white")
    
    prediction_content.append("Confidence:\n", style="bold green")
    prediction_content.append("71%\n\n", style="white")
    
    prediction_content.append("Best Market:\n", style="bold yellow")
    prediction_content.append("W2\n\n", style="white")
    
    prediction_content.append("Predicted Total:\n", style="bold cyan")
    prediction_content.append("224.5\n\n", style="white")
    
    prediction_content.append("Suggested Bet:\n", style="bold magenta")
    prediction_content.append("UNDER 228.5\n\n", style="white")
    
    prediction_content.append("Quarter Edge:\n", style="bold white")
    prediction_content.append(f"Q1 {away} Win\n\n", style="white")
    
    prediction_content.append("Value Bet:\n", style="bold red")
    prediction_content.append("YES", style="white")

    panel = Panel(
        prediction_content,
        title=f"[bold]{title}[/bold]",
        subtitle="NBA Betting Analytics Engine",
        expand=False,
        border_style="bright_blue"
    )
    
    console.print(panel)
    console.print("=" * 50)
