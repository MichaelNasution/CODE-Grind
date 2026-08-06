"""
data_fetcher.py
===============
API handler layer for the MLB Analytics CLI System v3.
All top-level fetch functions accept a `date_str` parameter (YYYY-MM-DD).
Falls back to mock_data.py on any API failure — completely transparent.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any

import requests

import config
import mock_data

logger = logging.getLogger(__name__)


# ==============================================================================
# INTERNAL HELPERS
# ==============================================================================

def _get(url: str, params: dict | None = None, timeout: int = 15) -> dict | list | None:
    """Generic HTTP GET — returns parsed JSON or None on any failure."""
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
    return kmh * 0.621371


def _celsius_to_f(celsius: float) -> float:
    return (celsius * 9 / 5) + 32


def _safe_float(val: Any, default: float = 0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _safe_int(val: Any, default: int = 0) -> int:
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


def _current_season() -> int:
    return datetime.now(tz=timezone.utc).year


# ==============================================================================
# 1. MLB STATS API — GAMES FOR A SPECIFIC DATE
# ==============================================================================

def fetch_games_for_date(date_str: str) -> list[dict]:
    """
    Fetch MLB schedule for the given date (YYYY-MM-DD).
    Falls back to MOCK_GAMES on any failure.
    """
    url = f"{config.MLB_API_BASE}/schedule"
    params = {
        "sportId": 1,
        "date": date_str,
        "hydrate": "team,linescore,probablePitcher(note),venue(location)",
    }
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        logger.info("Using mock game data (API unavailable) for date %s.", date_str)
        return mock_data.get_mock_games(date_str)

    games: list[dict] = []
    try:
        for date_block in data.get("dates", []):
            for game in date_block.get("games", []):
                teams    = game.get("teams", {})
                home     = teams.get("home", {})
                away     = teams.get("away", {})
                home_pp  = home.get("probablePitcher", {})
                away_pp  = away.get("probablePitcher", {})
                venue_nm = game.get("venue", {}).get("name", "DEFAULT")
                games.append({
                    "game_id":            game.get("gamePk"),
                    "home_team":          home.get("team", {}).get("name", ""),
                    "away_team":          away.get("team", {}).get("name", ""),
                    "home_team_id":       home.get("team", {}).get("id"),
                    "away_team_id":       away.get("team", {}).get("id"),
                    "venue":              venue_nm,
                    "game_datetime":      game.get("gameDate", ""),
                    "home_starter_id":    home_pp.get("id"),
                    "away_starter_id":    away_pp.get("id"),
                    "home_starter_name":  home_pp.get("fullName", "TBD"),
                    "away_starter_name":  away_pp.get("fullName", "TBD"),
                })
    except (KeyError, TypeError, AttributeError) as exc:
        logger.warning("Game parse error: %s — falling back to mock.", exc)
        return mock_data.get_mock_games(date_str)

    if not games:
        logger.info("No games returned for %s — using mock.", date_str)
        return mock_data.get_mock_games(date_str)

    return games


# Compatibility alias
def fetch_todays_games() -> list[dict]:
    return fetch_games_for_date(date.today().strftime(config.DATE_FORMAT))


# ==============================================================================
# 2. MLB STATS API — PITCHER STATS
# ==============================================================================

def fetch_pitcher_stats(pitcher_id: int, season: int | None = None) -> dict | None:
    if season is None:
        season = _current_season()

    url = f"{config.MLB_API_BASE}/people/{pitcher_id}"
    params = {"hydrate": f"stats(group=[pitching],type=[season],season={season})"}
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)

    try:
        people = data.get("people", [])
        if not people:
            return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)
        person = people[0]
        full_name  = person.get("fullName", "Unknown")
        stats_list = person.get("stats", [])
        if not stats_list:
            return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)
        splits = stats_list[0].get("splits", [])
        if not splits:
            return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)
        s   = splits[0].get("stat", {})
        era = _safe_float(s.get("era"), 4.50)
        return {
            "pitcher_id":      pitcher_id,
            "full_name":       full_name,
            "team":            "",
            "era":             era,
            "last5_era":       era,
            "hr_per9":         _safe_float(s.get("homeRunsPer9Inn"), 1.20),
            "strikeout_rate":  _safe_float(s.get("strikeoutsPer9Inn"), 8.0) / 9.0,
            "innings_pitched": _safe_float(s.get("inningsPitched"), 0.0),
            "pitch_count_avg": 90,
            "whip":            _safe_float(s.get("whip"), 1.30),
            "fip":             era,
            "opponent_avg":    _safe_float(s.get("avg"), 0.250),
            "throws":          mock_data.MOCK_PITCHER_STATS.get(
                                   pitcher_id, {}).get("throws", "R"),
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Pitcher %s parse error: %s — using mock.", pitcher_id, exc)
        return mock_data.MOCK_PITCHER_STATS.get(pitcher_id)


def fetch_all_pitcher_stats(pitcher_ids: list[int]) -> dict[int, dict]:
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
    season = _current_season()
    url    = f"{config.MLB_API_BASE}/people/{pitcher_id}/stats"
    params = {"stats": "gameLog", "group": "pitching", "season": season, "limit": 5}
    data   = _get(url, params, timeout=config.MLB_API_TIMEOUT)
    if not data:
        return None
    try:
        splits   = data.get("stats", [{}])[0].get("splits", [])
        total_er = total_ip = 0.0
        for game in splits[:5]:
            st = game.get("stat", {})
            try:
                total_er += float(st.get("earnedRuns", 0))
            except (ValueError, TypeError):
                pass
            try:
                ip_str = str(st.get("inningsPitched", "0.0"))
                parts  = ip_str.split(".")
                full   = int(parts[0]) if parts[0] else 0
                thirds = int(parts[1]) if len(parts) > 1 and parts[1] else 0
                total_ip += full + (thirds / 3.0)
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
    if season is None:
        season = _current_season()
    mock_bp = mock_data.MOCK_BULLPEN_STATS.get(team_id)
    url     = f"{config.MLB_API_BASE}/teams/{team_id}/stats"
    params  = {"stats": "season", "group": "pitching", "season": season, "playerPool": "All"}
    data    = _get(url, params, timeout=config.MLB_API_TIMEOUT)
    if not data:
        return mock_bp
    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return mock_bp
        s = splits[0].get("stat", {})
        return {
            "team_id":    team_id,
            "bullpen_era": _safe_float(s.get("era"), mock_bp["bullpen_era"] if mock_bp else 4.00),
            "whip":        _safe_float(s.get("whip"), mock_bp["whip"]       if mock_bp else 1.30),
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Bullpen stats parse error team %s: %s", team_id, exc)
        return mock_bp


# ==============================================================================
# 5. MLB STATS API — TEAM OFFENSE
# ==============================================================================

def fetch_team_offense(team_id: int, season: int | None = None) -> dict | None:
    if season is None:
        season = _current_season()
    mock_off = mock_data.MOCK_TEAM_OFFENSE.get(team_id)
    url      = f"{config.MLB_API_BASE}/teams/{team_id}/stats"
    params   = {"stats": "season", "group": "hitting", "season": season}
    data     = _get(url, params, timeout=config.MLB_API_TIMEOUT)
    if not data:
        return mock_off
    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return mock_off
        s   = splits[0].get("stat", {})
        gp  = _safe_float(s.get("gamesPlayed", 0), 1)
        rpg = _safe_float(s.get("runs", 0), 0) / gp if gp > 0 else 4.40
        ops = _safe_float(s.get("ops"),  mock_off["ops"] if mock_off else 0.720)
        return {"team_id": team_id, "runs_per_game": round(rpg, 2), "ops": ops}
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Team offense parse error team %s: %s", team_id, exc)
        return mock_off


# ==============================================================================
# 6. MLB STATS API — HEAD-TO-HEAD DATA
# ==============================================================================

def fetch_batter_h2h_vs_pitcher(batter_id: int, pitcher_id: int) -> dict | None:
    url    = f"{config.MLB_API_BASE}/people/{batter_id}/stats"
    params = {"stats": "vsPlayer", "opposingPlayerId": pitcher_id, "group": "hitting", "sportId": 1}
    data   = _get(url, params, timeout=config.MLB_API_TIMEOUT)
    mock_h2h = next(
        (r for r in mock_data.MOCK_BATTER_H2H
         if r["batter_id"] == batter_id and r["pitcher_id"] == pitcher_id),
        None,
    )
    if not data:
        return mock_h2h
    try:
        splits = data.get("stats", [{}])[0].get("splits", [])
        if not splits:
            return mock_h2h
        s = splits[0].get("stat", {})
        return {
            "batter_id":           batter_id,
            "pitcher_id":          pitcher_id,
            "career_pa_vs_pitcher": _safe_int(s.get("plateAppearances", 0)),
            "career_hr_vs_pitcher": _safe_int(s.get("homeRuns", 0)),
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("H2H parse error batter %s vs pitcher %s: %s", batter_id, pitcher_id, exc)
        return mock_h2h


# ==============================================================================
# 7. OPEN-METEO — WEATHER (date-aware for forecast)
# ==============================================================================

def fetch_weather(venue: str, date_str: str | None = None) -> dict:
    """
    Fetch weather for a venue on the given date.
    Uses Open-Meteo hourly forecast for future dates; current for today.
    Falls back to mock on any failure.
    """
    coords = config.STADIUM_COORDINATES.get(venue) or config.STADIUM_COORDINATES["DEFAULT"]
    lat    = coords["lat"]
    lon    = coords["lon"]

    mock_w = mock_data.MOCK_WEATHER.get(venue, {
        "temp_f": 72.0, "wind_speed_mph": 5.0,
        "wind_direction": "none", "conditions": "Unknown",
    })

    # Domed/retractable stadiums — weather irrelevant
    dome_venues = {"Rogers Centre", "Minute Maid Park", "Chase Field", "Tropicana Field",
                   "American Family Field", "Globe Life Field", "loanDepot park"}
    if venue in dome_venues:
        return {
            "temp_f": 72.0, "wind_speed_mph": 0.0,
            "wind_direction": "none", "conditions": "Retractable Roof / Dome",
        }

    today_str = date.today().strftime(config.DATE_FORMAT)
    target = date_str or today_str

    url = "https://api.open-meteo.com/v1/forecast"
    params: dict = {
        "latitude": lat, "longitude": lon,
        "temperature_unit": "fahrenheit",
        "wind_speed_unit":  "mph",
        "forecast_days":    2,
        "timezone":         "auto",
    }
    if target == today_str:
        params["current"] = "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code"
    else:
        params["hourly"] = "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code"

    data = _get(url, params, timeout=10)
    if not data:
        logger.info("Weather API failed for %s — using mock.", venue)
        return mock_w

    try:
        if "current" in data:
            cur      = data["current"]
            temp_f   = _safe_float(cur.get("temperature_2m"),     mock_w["temp_f"])
            wind_mph = _safe_float(cur.get("wind_speed_10m"),     mock_w["wind_speed_mph"])
            wind_deg = _safe_float(cur.get("wind_direction_10m"), 180)
            wcode    = _safe_int(  cur.get("weather_code"),        0)
        else:
            # Hourly — pick 7 PM local slot (index 19)
            h       = data.get("hourly", {})
            idx     = min(19, len(h.get("temperature_2m", [0])) - 1)
            temp_f  = _safe_float(h.get("temperature_2m",     [mock_w["temp_f"]])[idx],  mock_w["temp_f"])
            wind_mph = _safe_float(h.get("wind_speed_10m",    [mock_w["wind_speed_mph"]])[idx], mock_w["wind_speed_mph"])
            wind_deg = _safe_float(h.get("wind_direction_10m",[180])[idx], 180)
            wcode    = _safe_int(  h.get("weather_code",       [0])[idx],  0)

        direction = (
            "crosswind" if 45  <= wind_deg < 135 else
            "in"        if 135 <= wind_deg < 225 else
            "crosswind" if 225 <= wind_deg < 315 else
            "out"
        )

        conditions_map: list[tuple[range, str]] = [
            (range(0, 2),   "Clear"),
            (range(2, 4),   "Partly Cloudy"),
            (range(4, 50),  "Overcast / Foggy"),
            (range(50, 70), "Drizzle"),
            (range(70, 80), "Snow"),
            (range(80, 100),"Rain / Thunderstorms"),
        ]
        conditions = "Unknown"
        for rng, label in conditions_map:
            if wcode in rng:
                conditions = label
                break

        return {
            "temp_f":          round(float(temp_f),   1),
            "wind_speed_mph":  round(float(wind_mph), 1),
            "wind_direction":  direction,
            "conditions":      conditions,
        }
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        logger.warning("Weather parse error (%s): %s — using mock.", venue, exc)
        return mock_w


# ==============================================================================
# 8. THE ODDS API — SPORTSBOOK LINES
# ==============================================================================

def fetch_odds_lines() -> dict[str, float]:
    """Fetch MLB O/U lines. Falls back to mock on failure or missing key."""
    api_key = config.API_KEYS.get("the_odds_api", "")
    if not api_key or api_key == "YOUR_ODDS_API_KEY_HERE":
        return _mock_odds_lines_keyed()

    url    = f"{config.ODDS_API_BASE}/sports/{config.ODDS_SPORT_KEY}/odds"
    params = {
        "apiKey": api_key,
        "regions": config.ODDS_REGIONS,
        "markets": config.ODDS_MARKETS,
        "oddsFormat": config.ODDS_FORMAT,
    }
    data = _get(url, params, timeout=config.ODDS_API_TIMEOUT)
    if not data:
        return _mock_odds_lines_keyed()

    lines: dict[str, float] = {}
    try:
        for event in data:
            home = event.get("home_team", "")
            away = event.get("away_team", "")
            key  = f"{home} vs {away}"
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
                break
    except (KeyError, TypeError) as exc:
        logger.warning("Odds API parse error: %s", exc)
        return _mock_odds_lines_keyed()

    return lines or _mock_odds_lines_keyed()


def _mock_odds_lines_keyed() -> dict[str, float]:
    return {g["matchup"]: g["total_line"] for g in mock_data.MOCK_ODDS_LINES.values()}


def fetch_odds_line_for_game(game: dict, all_lines: dict[str, float]) -> float | None:
    home = game.get("home_team", "")
    away = game.get("away_team", "")
    for key in (f"{home} vs {away}", f"{away} vs {home}", f"{home} vs. {away}"):
        if key in all_lines:
            return all_lines[key]
    for key, val in all_lines.items():
        kl = key.lower()
        if (any(w in kl for w in home.lower().split()[-2:]) and
                any(w in kl for w in away.lower().split()[-2:])):
            return val
    mock_entry = mock_data.MOCK_ODDS_LINES.get(game.get("game_id"))
    return mock_entry["total_line"] if mock_entry else None


# ==============================================================================
# 9. FULL ENRICHED GAME SLATE (date-parameterized)
# ==============================================================================

def load_full_game_slate(date_str: str | None = None) -> list[dict]:
    """
    Primary function called by analytics actions.
    Returns list of fully enriched game dicts for the given date.
    """
    if date_str is None:
        date_str = date.today().strftime(config.DATE_FORMAT)

    games    = fetch_games_for_date(date_str)
    all_odds = fetch_odds_lines()

    enriched: list[dict] = []
    for game in games:
        venue      = game.get("venue", "DEFAULT")
        home_sp_id = game.get("home_starter_id")
        away_sp_id = game.get("away_starter_id")

        home_sp = fetch_pitcher_stats(home_sp_id) if home_sp_id else None
        away_sp = fetch_pitcher_stats(away_sp_id) if away_sp_id else None

        if home_sp and home_sp_id:
            l5 = fetch_last5_era(home_sp_id)
            if l5:
                home_sp = dict(home_sp, last5_era=l5)

        if away_sp and away_sp_id:
            l5 = fetch_last5_era(away_sp_id)
            if l5:
                away_sp = dict(away_sp, last5_era=l5)

        enriched.append({
            **game,
            "home_sp":      home_sp,
            "away_sp":      away_sp,
            "home_bullpen": fetch_bullpen_stats(game.get("home_team_id")),
            "away_bullpen": fetch_bullpen_stats(game.get("away_team_id")),
            "home_offense": fetch_team_offense(game.get("home_team_id")),
            "away_offense": fetch_team_offense(game.get("away_team_id")),
            "weather":      fetch_weather(venue, date_str),
            "ou_line":      fetch_odds_line_for_game(game, all_odds),
        })
    return enriched


# ==============================================================================
# 10. H2H CANDIDATES (for Under HR strategy)
# ==============================================================================

def load_batter_h2h_records(date_str: str | None = None) -> list[dict]:
    """
    Return batter H2H records for today's starting pitchers.
    Filters mock MOCK_BATTER_H2H to pitchers scheduled on date_str.
    """
    if date_str is None:
        date_str = date.today().strftime(config.DATE_FORMAT)

    games = fetch_games_for_date(date_str)
    pitcher_ids_today: set[int] = set()
    for g in games:
        if g.get("home_starter_id"):
            pitcher_ids_today.add(g["home_starter_id"])
        if g.get("away_starter_id"):
            pitcher_ids_today.add(g["away_starter_id"])

    return [r for r in mock_data.MOCK_BATTER_H2H if r.get("pitcher_id") in pitcher_ids_today]


def load_pitcher_stats(date_str: str | None = None) -> list[dict]:
    """Return pitcher stats list (all mock pitchers for today's date)."""
    _ = date_str  # reserved for future live roster lookup
    return list(mock_data.MOCK_PITCHER_STATS.values())


def load_pitcher_props(date_str: str | None = None) -> list[dict]:
    """Return pitcher prop candidates."""
    _ = date_str
    return mock_data.MOCK_PITCHER_PROPS


def load_batter_anchor_props(date_str: str | None = None) -> list[dict]:
    """Return batter anchor prop candidates."""
    _ = date_str
    return mock_data.MOCK_BATTER_ANCHOR_PROPS
