"""
ESPN Scoreboard API Client for NBA Schedules
"""
import requests
from datetime import datetime, timedelta

ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"

def get_today_games():
    """
    Fetches NBA games for today.
    """
    try:
        response = requests.get(ESPN_URL)
        response.raise_for_status()
        return parse_games(response.json())
    except Exception as e:
        print(f"Error fetching today's games: {e}")
        return []

def get_tomorrow_games():
    """
    Fetches NBA games for tomorrow.
    Uses the date parameter in YYYYMMDD format.
    """
    tomorrow = datetime.now() + timedelta(days=1)
    date_str = tomorrow.strftime("%Y%m%d")
    url = f"{ESPN_URL}?dates={date_str}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return parse_games(response.json())
    except Exception as e:
        print(f"Error fetching tomorrow's games: {e}")
        return []

def parse_games(data):
    """
    Parses the ESPN API response into a clean list of matchups.
    """
    games = []
    events = data.get("events", [])
    
    for event in events:
        competition = event.get("competitions", [{}])[0]
        teams = competition.get("competitors", [])
        
        home_team = ""
        away_team = ""
        for team in teams:
            if team.get("homeAway") == "home":
                home_team = team.get("team", {}).get("shortDisplayName", "TBD")
            else:
                away_team = team.get("team", {}).get("shortDisplayName", "TBD")
        
        status = event.get("status", {}).get("type", {}).get("name", "STATUS_UNKNOWN")
        # Map ESPN status names to project standard
        # STATUS_SCHEDULED, STATUS_IN_PROGRESS, STATUS_FINAL
        if "FINAL" in status:
            game_status = "final"
        elif "IN_PROGRESS" in status or "LIVE" in status:
            game_status = "live"
        else:
            game_status = "scheduled"
            
        game_time = event.get("date", "") # ISO format
        if game_time:
            # Simple slice for HH:MM from 2024-05-11T23:30Z
            try:
                dt = datetime.strptime(game_time, "%Y-%m-%dT%H:%MZ")
                game_time = dt.strftime("%H:%M")
            except:
                pass

        games.append({
            "home_team": home_team,
            "away_team": away_team,
            "game_time": game_time,
            "status": game_status,
            "full_status": status, # raw status for detail
            "is_playoff": event.get("season", {}).get("type") == 3,
            "series_summary": competition.get("series", {}).get("summary", "")
        })
        
    return games
