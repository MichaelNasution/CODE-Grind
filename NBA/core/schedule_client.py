"""
ESPN Scoreboard API Client for NBA Schedules
"""
import requests
from datetime import datetime, timedelta

# Konfigurasi Endpoint
ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"

def get_today_games():
    """Fetches NBA games for today."""
    try:
        response = requests.get(ESPN_URL, timeout=10)
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
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return parse_games(response.json())
    except Exception as e:
        print(f"Error fetching tomorrow's games: {e}")
        return []

def parse_games(data):
    """Parses ESPN API response with robust error handling and real-time support."""
    games = []
    events = data.get("events", [])
    
    for event in events:
        # Inisialisasi variabel untuk menghindari error scope
        competition = event.get("competitions", [{}])[0]
        teams = competition.get("competitors", [])
        raw_status = event.get("status", {})
        
        home_team = "TBD"
        away_team = "TBD"
        current_score = {"home": 0, "away": 0}
        
        for team_data in teams:
            team_name = team_data.get("team", {}).get("shortDisplayName", "TBD")
            score_str = team_data.get("score", "0")
            score_val = int(score_str) if score_str else 0
            
            if team_data.get("homeAway") == "home":
                home_team = team_name
                current_score["home"] = score_val
            else:
                away_team = team_name
                current_score["away"] = score_val
        
        status_info = raw_status.get("type", {})
        status_name = status_info.get("name", "STATUS_UNKNOWN")
        
        # Penentuan status internal
        if "FINAL" in status_name:
            game_status = "final"
        elif any(s in status_name for s in ["IN_PROGRESS", "LIVE", "HALFTIME"]):
            game_status = "live"
        else:
            game_status = "scheduled"
            
        # Parsing waktu
        game_time_raw = event.get("date", "")
        game_time_formatted = "00:00"
        
        if game_time_raw:
            try:
                # ESPN API returns time in UTC (ends with Z)
                dt_obj = datetime.strptime(game_time_raw, "%Y-%m-%dT%H:%MZ")
                # Convert to WIB (UTC+7)
                wib_time = dt_obj + timedelta(hours=7)
                game_time_formatted = wib_time.strftime("%H:%M")
                game_date_formatted = wib_time.strftime("%Y-%m-%d")
            except (ValueError, TypeError):
                game_time_formatted = "00:00"
                game_date_formatted = datetime.now().strftime("%Y-%m-%d")



        # Construct game object
        games.append({
            "home_team": home_team,
            "away_team": away_team,
            "game_time": game_time_formatted,
            "game_date": game_date_formatted,
            "status": game_status,

            "current_score": current_score,
            "final_score": current_score if game_status == "final" else None,
            "period": raw_status.get("period", 1),
            "clock": raw_status.get("displayClock", "00:00"),
            "is_playoff": event.get("season", {}).get("type") == 3,
            "series_summary": competition.get("series", {}).get("summary", "")
        })
        
    return games
