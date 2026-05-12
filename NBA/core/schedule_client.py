"""
ESPN Scoreboard API Client for NBA Schedules
"""
import requests
from datetime import datetime, timedelta

ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"

def get_today_games():
    """Fetches NBA games for today."""
    try:
        response = requests.get(ESPN_URL)
        response.raise_for_status()
        return parse_games(response.json())
    except Exception as e:
        print(f"Error fetching today's games: {e}")
        return []

def get_tomorrow_games():
    """Fetches NBA games for tomorrow."""
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
    """Parses ESPN API response with real-time score and status support."""
    games = []
    events = data.get("events", [])
    
    for event in events:
        competition = event.get("competitions", [{}])[0]
        teams = competition.get("competitors", [])
        
        home_team = ""
        away_team = ""
        current_score = {"home": 0, "away": 0}
        
        for team in teams:
            team_name = team.get("team", {}).get("shortDisplayName", "TBD")
            score_val = team.get("score", 0)
            score = int(score_val) if score_val else 0
            
            if team.get("homeAway") == "home":
                home_team = team_name
                current_score["home"] = score
            else:
                away_team = team_name
                current_score["away"] = score
        
        raw_status = event.get("status", {})
        status_info = raw_status.get("type", {})
        status_name = status_info.get("name", "STATUS_UNKNOWN")
        
        if "FINAL" in status_name:
            game_status = "final"
        elif "IN_PROGRESS" in status_name or "LIVE" in status_name:
            game_status = "live"
        else:
            game_status = "scheduled"
            
        game_time_str = event.get("date", "")
        game_time = "00:00"
        
        if game_time_str:
            try:
                dt = datetime.strptime(game_time_str, "%Y-%m-%dT%H:%MZ")
                game_time = dt.strftime("%H:%M")
            except Exception:
                game_time = "00:00"

        games.append({
            "home_team": home_team,
            "away_team": away_team,
            "game_time": game_time,
            "status": game_status,
            "current_score": current_score,
            "final_score": current_score if game_status == "final" else None,
            "period": raw_status.get("period", 1),
            "clock": raw_status.get("displayClock", "00:00"),
            "is_playoff": event.get("season", {}).get("type") == 3,
            "series_summary": competition.get("series", {}).get("summary", "")
        })
        
    return games
