"""
Terminal UI Rendering Logic
"""
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

def render_match_prediction(home, visitor):
    """
    Renders the professional CLI output for a match prediction.
    """
    title = f"{home.upper()} vs {visitor.upper()}"
    
    # Placeholder for predicted values
    prediction_text = (
        f"[bold blue]Predicted Winner:[/bold blue]\nBoston Celtics\n\n"
        f"[bold green]Confidence:[/bold green]\n68%\n\n"
        f"[bold yellow]Best Market:[/bold yellow]\nW2\n\n"
        f"[bold cyan]Predicted Total:[/bold cyan]\n228.5\n\n"
        f"[bold magenta]Suggested Bet:[/bold magenta]\nOVER 223.5\n\n"
        f"[bold white]Quarter Edge:[/bold white]\nQ1 OVER\nQ3 Celtics Win\n\n"
        f"[bold red]Value Bet:[/bold red]\nYES"
    )

    panel = Panel(
        prediction_text,
        title=title,
        subtitle="NBA Betting Analytics",
        expand=False,
        border_style="bright_blue"
    )
    
    console.print("\n")
    console.print(panel)
    console.print("=" * 40)
