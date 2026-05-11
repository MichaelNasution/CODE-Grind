"""
Command Handlers for NBA CLI
"""
from core.schedule_client import get_today_games, get_tomorrow_games
from cli.output_renderer import render_match_prediction
from rich.console import Console

console = Console()

def handle_today(args):
    """Handles 'python main.py today' using real ESPN data"""
    console.print("[bold cyan]Fetching REAL NBA matches for TODAY...[/bold cyan]")
    games = get_today_games()
    
    if not games:
        console.print("[yellow]No games found for today or API is unavailable.[/yellow]")
        return

    console.print(f"[green]Found {len(games)} matches.[/green]\n")
    console.print("========================================")
    console.print("TODAY NBA MATCHES")
    console.print("========================================\n")
    
    for game in games:
        # Pass real game data to renderer
        render_match_prediction(game)

def handle_tomorrow(args):
    """Handles 'python main.py tomorrow' using real ESPN data"""
    console.print("[bold cyan]Fetching REAL NBA matches for TOMORROW...[/bold cyan]")
    games = get_tomorrow_games()
    
    if not games:
        console.print("[yellow]No games found for tomorrow.[/yellow]")
        return

    console.print(f"[green]Found {len(games)} matches.[/green]\n")
    
    for game in games:
        render_match_prediction(game)

def handle_predict(args):
    """Handles 'python main.py predict Lakers Celtics'"""
    console.print(f"[bold]Analyzing Custom Matchup:[/bold] {args.home_team} vs {args.visitor_team}...")
    # Create mock data structure for custom prediction
    mock_game = {
        "home_team": args.home_team,
        "away_team": args.visitor_team,
        "game_time": "N/A",
        "status": "custom"
    }
    render_match_prediction(mock_game)

def handle_live(args):
    """Handles 'python main.py live'"""
    console.print("[bold red]Starting Live Momentum Analysis...[/bold red]")
    console.print("Fetching live games from ESPN Scoreboard...")
    all_games = get_today_games()
    live_games = [g for g in all_games if g['status'] == 'live']
    
    if not live_games:
        console.print("[yellow]No games are currently live.[/yellow]")
        return
        
    for game in live_games:
        render_match_prediction(game)
