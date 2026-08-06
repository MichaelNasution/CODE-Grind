"""
data_fetcher.py
===============
API handler layer for the MLB Analytics CLI System.
Manages all external data sources:
  - MLB StatsAPI (official, free)
  - Open-Meteo (weather, free, no key)
  - The Odds API (sportsbook lines)

All functions gracefully fall back to mock_data on any failure.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any

import requests

import config
import mock_data

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)


# ==============================================================================
# INTERNAL HELPERS
# ==============================================================================

def _get(url: str, params: dict | None = None, timeout: int = 15) -> dict | list | None:
    """
    Generic HTTP GET with timeout and error handling.
    Returns parsed JSON or None on failure.
    """
    try:
        resp = requests.get(url, params=params, timeout=timeout)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.Timeout:
        logger.warning("Request timed out: %s", url)
    except requests.exceptions.ConnectionError:
        logger.warning("Connection error: %s", url)
    except requests.exceptions.HTTPError as exc:
        logger.warning("HTTP error %s: %s", exc.response.status_code, url)
    except requests.exceptions.RequestException as exc:
        logger.warning("Request exception: %s | URL: %s", exc, url)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Unexpected error fetching %s: %s", url, exc)
    return None


def _mph_from_kmh(kmh: float) -> float:
    """Convert kilometres per hour to miles per hour."""
    return kmh * 0.621371


def _celsius_to_f(celsius: float) -> float:
    """Convert Celsius to Fahrenheit."""
    return (celsius * 9 / 5) + 32


def _today_str() -> str:
    """Return today's date as YYYY-MM-DD (UTC)."""
    return date.today().strftime("%Y-%m-%d")


# ==============================================================================
# 1. MLB STATS API — GAMES
# ==============================================================================

def fetch_todays_games() -> list[dict]:
    """
    Fetch today's MLB schedule from the official Stats API.
    Returns list of game dicts; falls back to mock data on failure.
    """
    url = f"{config.MLB_API_BASE}/schedule"
    params = {
        "sportId": 1,
        "date": _today_str(),
        "hydrate": "team,linescore,probablePitcher(note),venue(location)",
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        logger.info("Using mock game data (API unavailable).")
        return mock_data.MOCK_GAMES

    games: list[dict] = []
    try:
        for date_block in data.get("dates", []):
            for game in date_block.get("games", []):
                teams = game.get("teams", {})
                home = teams.get("home", {})
                away = teams.get("away", {})
                home_pp = home.get("probablePitcher", {})
                away_pp = away.get("probablePitcher", {})
                venue_name = game.get("venue", {}).get("name", "DEFAULT")
                game_dt = game.get("gameDate", "")

                games.append({
                    "game_id": game.get("gamePk"),
                    "home_team": home.get("team", {}).get("name", ""),
                    "away_team": away.get("team", {}).get("name", ""),
                    "home_team_id": home.get("team", {}).get("id"),
                    "away_team_id": away.get("team", {}).get("id"),
                    "venue": venue_name,
                    "game_datetime": game_dt,
                    "home_starter_id": home_pp.get("id"),
                    "away_starter_id": away_pp.get("id"),
                    "home_starter_name": home_pp.get("fullName", "TBD"),
                    "away_starter_name": away_pp.get("fullName", "TBD"),
                })
    except (KeyError, TypeError, AttributeError) as exc:
        logger.warning("Game parse error: %s — falling back to mock.", exc)
        return mock_data.MOCK_GAMES

    if not games:
        logger.info("No games returned from API — using mock.")
        return mock_data.MOCK_GAMES

    return games


# ==============================================================================
# 2. MLB STATS API — PITCHER STATS
# ==============================================================================

def fetch_pitcher_stats(pitcher_id: int, season: int | None = None) -> dict | None:
    """
    Fetch season pitching statistics for a given pitcher ID.
    Returns stat dict or None; falls back to mock data on failure.
    """
    if season is None:
        season = datetime.now(tz=timezone.utc).year

    url = f"{config.MLB_API_BASE}/people/{pitcher_id}"
    params = {
        "hydrate": f"stats(group=[pitching],type=[season],season={season})",
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    # Try mock fallback if ID is in mock
    if not data:
        logger.info("Pitcher %s: API failed — checking mock data.", pitcher_id)
        return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)

    try:
        people = data.get("people", [])
        if not people:
            return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)

        person = people[0]
        full_name = person.get("fullName", "Unknown")
        stats_list = person.get("stats", [])
        if not stats_list:
            return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)

        splits = stats_list[0].get("splits", [])
        if not splits:
            return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)

        s = splits[0].get("stat", {})
        hr_per9_raw = s.get("homeRunsPer9Inn", None)
        era_raw = s.get("era", None)

        def _safe_float(val: Any, default: float = 0.0) -> float:
            try:
                return float(val)
            except (TypeError, ValueError):
                return default

        return {
            "pitcher_id": pitcher_id,
            "full_name": full_name,
            "team": "",
            "era": _safe_float(era_raw, 4.50),
            "last5_era": _safe_float(era_raw, 4.50),   # API doesn't split easily; use season ERA
            "hr_per9": _safe_float(hr_per9_raw, 1.20),
            "strikeout_rate": _safe_float(s.get("strikeoutsPer9Inn"), 8.0) / 9.0,
            "innings_pitched": _safe_float(s.get("inningsPitched"), 0.0),
            "pitch_count_avg": 90,
            "whip": _safe_float(s.get("whip"), 1.30),
            "fip": _safe_float(era_raw, 4.50),        # FIP not in StatsAPI, use ERA proxy
            "opponent_avg": _safe_float(s.get("avg"), 0.250),
        }

    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Pitcher %s parse error: %s — using mock.", pitcher_id, exc)
        return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)


def fetch_all_pitcher_stats(pitcher_ids: list[int]) -> dict[int, dict]:
    """
    Fetch stats for a list of pitcher IDs.
    Returns mapping pitcher_id -> stat_dict.
    """
    results: dict[int, dict] = {}
    for pid in pitcher_ids:
        stat = fetch_pitcher_stats(pid)
        if stat:
            results[pid] = stat
    return results


# ==============================================================================
# 3. MLB STATS API — LAST 5 STARTS ERA
# ==============================================================================

def fetch_last5_era(pitcher_id: int) -> float | None:
    """
    Fetch ERA over the last 5 starts via the gameLog endpoint.
    Returns computed ERA or None on failure.
    """
    season = datetime.now(tz=timezone.utc).year
    url = f"{config.MLB_API_BASE}/people/{pitcher_id}/stats"
    params = {
        "stats": "gameLog",
        "group": "pitching",
        "season": season,
        "limit": 5,
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        return None

    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return None

        total_er = 0.0
        total_ip = 0.0
        for game in splits[:5]:
            stat = game.get("stat", {})
            er_str = stat.get("earnedRuns", "0")
            ip_str = stat.get("inningsPitched", "0.0")
            try:
                total_er += float(er_str)
            except (ValueError, TypeError):
                pass
            try:
                ip_val = str(ip_str)
                parts = ip_val.split(".")
                full_inn = int(parts[0]) if parts[0] else 0
                thirds = int(parts[1]) if len(parts) > 1 and parts[1] else 0
                total_ip += full_inn + (thirds / 3.0)
            except (ValueError, TypeError, IndexError):
                pass

        if total_ip == 0:
            return None
        return round((total_er / total_ip) * 9, 2)

    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Last5 ERA parse error pitcher %s: %s", pitcher_id, exc)
        return None


# ==============================================================================
# 4. MLB STATS API — BULLPEN STATS
# ==============================================================================

def fetch_bullpen_stats(team_id: int, season: int | None = None) -> dict | None:
    """
    Fetch team bullpen ERA from team pitching stats.
    Returns dict with bullpen_era or None; falls back to mock.
    """
    if season is None:
        season = datetime.now(tz=timezone.utc).year

    mock_bp = mock_data.MOCK_BULLPEN_STATS.get(team_id)

    url = f"{config.MLB_API_BASE}/teams/{team_id}/stats"
    params = {
        "stats": "season",
        "group": "pitching",
        "season": season,
        "playerPool": "All",
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        return mock_bp

    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return mock_bp

        s = splits[0].get("stat", {})
        era_raw = s.get("era", None)
        whip_raw = s.get("whip", None)

        def _sf(v: Any, d: float) -> float:
            try:
                return float(v)
            except (TypeError, ValueError):
                return d

        return {
            "team_id": team_id,
            "bullpen_era": _sf(era_raw, mock_bp["bullpen_era"] if mock_bp else 4.00),
            "whip": _sf(whip_raw, mock_bp["whip"] if mock_bp else 1.30),
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Bullpen stats parse error team %s: %s", team_id, exc)
        return mock_bp


# ==============================================================================
# 5. MLB STATS API — TEAM OFFENSE
# ==============================================================================

def fetch_team_offense(team_id: int, season: int | None = None) -> dict | None:
    """
    Fetch team offensive stats (runs per game).
    Falls back to mock data on failure.
    """
    if season is None:
        season = datetime.now(tz=timezone.utc).year

    mock_off = mock_data.MOCK_TEAM_OFFENSE.get(team_id)

    url = f"{config.MLB_API_BASE}/teams/{team_id}/stats"
    params = {
        "stats": "season",
        "group": "hitting",
        "season": season,
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        return mock_off

    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return mock_off

        s = splits[0].get("stat", {})

        def _sf(v: Any, d: float) -> float:
            try:
                return float(v)
            except (TypeError, ValueError):
                return d

        games_played = _sf(s.get("gamesPlayed", 0), 1)
        total_runs = _sf(s.get("runs", 0), 0)
        rpg = total_runs / games_played if games_played > 0 else 4.40
        ops = _sf(s.get("ops", None), mock_off["ops"] if mock_off else 0.720)

        return {
            "team_id": team_id,
            "runs_per_game": round(rpg, 2),
            "ops": ops,
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Team offense parse error team %s: %s", team_id, exc)
        return mock_off


# ==============================================================================
# 6. MLB STATS API — HEAD-TO-HEAD (CAREER) DATA
# ==============================================================================

def fetch_batter_h2h_vs_pitcher(batter_id: int, pitcher_id: int) -> dict | None:
    """
    Fetch career head-to-head batting stats for a batter vs specific pitcher.
    Returns dict with career_pa, career_hr, etc., or None.
    Falls back to mock data.
    """
    url = f"{config.MLB_API_BASE}/people/{batter_id}/stats"
    params = {
        "stats": "vsPlayer",
        "opposingPlayerId": pitcher_id,
        "group": "hitting",
        "sportId": 1,
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    # Check mock data as well
    mock_h2h = next(
        (
            r for r in mock_data.MOCK_BATTER_H2H
            if r["batter_id"] == batter_id and r["pitcher_id"] == pitcher_id
        ),
        None,
    )

    if not data:
        return mock_h2h

    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return mock_h2h

        s = splits[0].get("stat", {})

        def _si(v: Any, d: int = 0) -> int:
            try:
                return int(v)
            except (TypeError, ValueError):
                return d

        return {
            "batter_id": batter_id,
            "pitcher_id": pitcher_id,
            "career_pa_vs_pitcher": _si(s.get("plateAppearances", 0)),
            "career_hr_vs_pitcher": _si(s.get("homeRuns", 0)),
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("H2H parse error batter %s vs pitcher %s: %s", batter_id, pitcher_id, exc)
        return mock_h2h


def fetch_team_roster_hitting_stats(team_id: int, season: int | None = None) -> list[dict]:
    """
    Fetch hitting stats for all players on a team's active roster.
    Falls back to mock batter H2H data for batters on that team.
    """
    if season is None:
        season = datetime.now(tz=timezone.utc).year

    url = f"{config.MLB_API_BASE}/teams/{team_id}/roster"
    params = {"rosterType": "active"}
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        return [r for r in mock_data.MOCK_BATTER_H2H if r.get("team_id") == team_id]

    roster: list[dict] = []
    try:
        for player in data.get("roster", []):
            person = player.get("person", {})
            pid = person.get("id")
            pname = person.get("fullName", "Unknown")
            pos = player.get("position", {}).get("abbreviation", "")
            if pos not in ("C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"):
                continue  # pitchers only as position players
            roster.append({"batter_id": pid, "batter_name": pname, "team_id": team_id})
    except (KeyError, TypeError) as exc:
        logger.warning("Roster parse error team %s: %s", team_id, exc)

    return roster


# ==============================================================================
# 7. OPEN-METEO — WEATHER
# ==============================================================================

def fetch_weather(venue: str) -> dict:
    """
    Fetch current/forecast weather for the given venue name.
    Uses Open-Meteo free API (no key required).
    Falls back to mock data on failure.
    """
    coords = config.STADIUM_COORDINATES.get(venue) or config.STADIUM_COORDINATES["DEFAULT"]
    lat = coords["lat"]
    lon = coords["lon"]

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code",
        "temperature_unit": "fahrenheit",
        "wind_speed_unit": "mph",
        "forecast_days": 1,
        "timezone": "auto",
    }
    data = _get(url, params, timeout=10)

    mock_w = mock_data.MOCK_WEATHER.get(venue, {
        "temp_f": 72.0,
        "wind_speed_mph": 5.0,
        "wind_direction": "none",
        "conditions": "Unknown",
    })

    if not data:
        logger.info("Weather API failed for %s — using mock.", venue)
        return mock_w

    try:
        current = data.get("current", {})
        temp_f = current.get("temperature_2m", mock_w["temp_f"])
        wind_mph = current.get("wind_speed_10m", mock_w["wind_speed_mph"])
        wind_deg = current.get("wind_direction_10m", 180)
        wcode = current.get("weather_code", 0)

        # Determine wind direction relative to ballpark (simplified heuristic).
        # In real deployment, each stadium's orientation should be stored;
        # here we map cardinal direction into "in" / "out" / "crosswind".
        if 45 <= wind_deg < 135:
            direction = "crosswind"
        elif 135 <= wind_deg < 225:
            direction = "in"
        elif 225 <= wind_deg < 315:
            direction = "crosswind"
        else:
            direction = "out"

        # Map WMO weather codes to human readable
        conditions_map = {
            range(0, 2): "Clear",
            range(2, 4): "Partly Cloudy",
            range(4, 50): "Overcast / Foggy",
            range(50, 70): "Drizzle",
            range(70, 80): "Snow",
            range(80, 100): "Rain / Thunderstorms",
        }
        conditions = "Unknown"
        for r, label in conditions_map.items():
            if wcode in r:
                conditions = label
                break

        return {
            "temp_f": round(float(temp_f), 1),
            "wind_speed_mph": round(float(wind_mph), 1),
            "wind_direction": direction,
            "conditions": conditions,
        }
    except (KeyError, TypeError, ValueError) as exc:
        logger.warning("Weather parse error (%s): %s — using mock.", venue, exc)
        return mock_w


# ==============================================================================
# 8. THE ODDS API — SPORTSBOOK OVER/UNDER LINES
# ==============================================================================

def fetch_odds_lines() -> dict[str, float]:
    """
    Fetch current MLB Over/Under lines from The Odds API.
    Returns mapping of "HomeTeam vs AwayTeam" -> total line (float).
    Falls back to mock data if API key not set or request fails.
    """
    api_key = config.API_KEYS.get("the_odds_api", "")
    if not api_key or api_key == "YOUR_ODDS_API_KEY_HERE":
        logger.info("No Odds API key configured — using mock O/U lines.")
        return _mock_odds_lines_by_game_id()

    url = f"{config.ODDS_API_BASE}/sports/{config.ODDS_SPORT_KEY}/odds"
    params = {
        "apiKey": api_key,
        "regions": config.ODDS_REGIONS,
        "markets": config.ODDS_MARKETS,
        "oddsFormat": config.ODDS_FORMAT,
    }
    data = _get(url, params, timeout=config.ODDS_API_TIMEOUT)

    if not data:
        logger.info("Odds API request failed — using mock O/U lines.")
        return _mock_odds_lines_by_game_id()

    lines: dict[str, float] = {}
    try:
        for event in data:
            home = event.get("home_team", "")
            away = event.get("away_team", "")
            key = f"{home} vs {away}"
            for book in event.get("bookmakers", []):
                for market in book.get("markets", []):
                    if market.get("key") == "totals":
                        for outcome in market.get("outcomes", []):
                            if outcome.get("name") == "Over":
                                try:
                                    lines[key] = float(outcome.get("point", 8.5))
                                except (TypeError, ValueError):
                                    pass
                                break
                        break
                break  # Use only the first bookmaker
    except (KeyError, TypeError) as exc:
        logger.warning("Odds API parse error: %s", exc)
        return _mock_odds_lines_by_game_id()

    if not lines:
        return _mock_odds_lines_by_game_id()

    return lines


def _mock_odds_lines_by_game_id() -> dict[str, float]:
    """Convert mock odds data to matchup-string keyed dict."""
    return {
        f"{g['matchup']}": g["total_line"]
        for g in mock_data.MOCK_ODDS_LINES.values()
    }


def fetch_odds_line_for_game(game: dict, all_lines: dict[str, float]) -> float | None:
    """
    Resolve the O/U line for a specific game dict from the pre-fetched lines dict.
    Tries several key formats. Returns None if not found.
    """
    home = game.get("home_team", "")
    away = game.get("away_team", "")

    # Try exact match formats
    candidates = [
        f"{home} vs {away}",
        f"{away} vs {home}",
        f"{home} vs. {away}",
        f"{away} vs. {home}",
        f"NYY vs BOS",     # Abbreviated — only hits for mock
    ]
    for c in candidates:
        if c in all_lines:
            return all_lines[c]

    # Fallback: try abbreviation matching
    for key, val in all_lines.items():
        key_lower = key.lower()
        if (
            any(word in key_lower for word in home.lower().split()[-2:])
            and any(word in key_lower for word in away.lower().split()[-2:])
        ):
            return val

    # Last resort: match mock by game_id
    game_id = game.get("game_id")
    mock_line_entry = mock_data.MOCK_ODDS_LINES.get(game_id)
    if mock_line_entry:
        return mock_line_entry["total_line"]

    return None


# ==============================================================================
# 9. AGGREGATED DATA LOADER — ALL GAMES WITH FULL CONTEXT
# ==============================================================================

def load_full_game_slate() -> list[dict]:
    """
    Loads today's games enriched with pitcher, bullpen, offense, and weather data.
    This is the primary function called by analytics.py.
    Returns a list of fully enriched game dicts.
    """
    games = fetch_todays_games()
    all_odds = fetch_odds_lines()

    enriched_games: list[dict] = []
    for game in games:
        game_id = game.get("game_id")
        venue = game.get("venue", "DEFAULT")

        # Pitchers
        home_sp_id = game.get("home_starter_id")
        away_sp_id = game.get("away_starter_id")
        home_sp = fetch_pitcher_stats(home_sp_id) if home_sp_id else None
        away_sp = fetch_pitcher_stats(away_sp_id) if away_sp_id else None

        # Enrich last5 ERA if available (best-effort, may remain same as season)
        if home_sp:
            l5 = fetch_last5_era(home_sp_id)
            if l5:
                home_sp = dict(home_sp, last5_era=l5)

        if away_sp:
            l5 = fetch_last5_era(away_sp_id)
            if l5:
                away_sp = dict(away_sp, last5_era=l5)

        # Bullpens
        home_bp = fetch_bullpen_stats(game.get("home_team_id"))
        away_bp = fetch_bullpen_stats(game.get("away_team_id"))

        # Offense
        home_off = fetch_team_offense(game.get("home_team_id"))
        away_off = fetch_team_offense(game.get("away_team_id"))

        # Weather
        weather = fetch_weather(venue)

        # O/U line
        ou_line = fetch_odds_line_for_game(game, all_odds)

        enriched_games.append({
            **game,
            "home_sp": home_sp,
            "away_sp": away_sp,
            "home_bullpen": home_bp,
            "away_bullpen": away_bp,
            "home_offense": home_off,
            "away_offense": away_off,
            "weather": weather,
            "ou_line": ou_line,
        })

    return enriched_games


# ==============================================================================
# 10. BATTER H2H — BULK LOADER (FOR STRATEGY 1)
# ==============================================================================

def load_all_h2h_candidates(games: list[dict]) -> list[dict]:
    """
    Load all available head-to-head batter/pitcher records for today's games.
    Directly uses mock data as primary source for H2H (MLB API H2H is complex
    to bulk-query without individual IDs). Live enrichment per batter/pitcher
    pair happens when specific batter IDs are available.

    Returns the full MOCK_BATTER_H2H list filtered to pitchers in today's games.
    """
    pitcher_ids_today: set[int] = set()
    for game in games:
        if game.get("home_starter_id"):
            pitcher_ids_today.add(game["home_starter_id"])
        if game.get("away_starter_id"):
            pitcher_ids_today.add(game["away_starter_id"])

    # Return mock H2H records for today's pitchers
    candidates = [
        r for r in mock_data.MOCK_BATTER_H2H
        if r.get("pitcher_id") in pitcher_ids_today
    ]

    # Attempt to enrich with live season stats per batter if not already in mock
    for record in candidates:
        if "season_pa" not in record or "season_hr" not in record:
            # We don't have individual batter career stats endpoint in free tier easily;
            # retain mock values.
            pass

    return candidates


def load_pitcher_props() -> list[dict]:
    """Return pitcher prop candidates (mock data as primary source)."""
    return mock_data.MOCK_PITCHER_PROPS


def load_batter_anchor_props() -> list[dict]:
    """Return batter anchor prop candidates (mock data as primary source)."""
    return mock_data.MOCK_BATTER_ANCHOR_PROPS
