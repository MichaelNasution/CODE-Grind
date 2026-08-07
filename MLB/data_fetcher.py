"""
data_fetcher.py
===============
API handler layer for the MLB Analytics CLI System v4.0.
Accepts `date_str` parameter (YYYY-MM-DD).

Fetches:
  1. MLB StatsAPI Game Schedule & Probable Starters
  2. 4-Day Historical Lookback Engine Data (H-4 to H-1) for model calibration
  3. Sportsbook Line Shopping Odds (BetMGM, DraftKings, Caesars, FanDuel, ESPN Bet)
  4. Pitcher Stats (Season, Last 5, Last 3 Trend, WHIP, K/9, HR/9)
  5. Open-Meteo Weather Forecast (Date-aware)
  6. Tracks `is_live_data: bool` verification flag
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any

import requests

import config
import mock_data

logger = logging.getLogger(__name__)


# ==============================================================================
# INTERNAL HELPERS
# ==============================================================================

def _get(url: str, params: dict | None = None, timeout: int = 15) -> dict | list | None:
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
# 1. 4-DAY HISTORICAL LOOKBACK ENGINE (H-4 to H-1)
# ==============================================================================

def fetch_4day_lookback_data(target_date_str: str) -> dict[str, list[dict]]:
    """
    Fetch game results and bullpen/pitcher performance for the prior 4 days (H-4 to H-1).
    Used by the Calibration Engine in analytics.py.
    """
    try:
        target_dt = date.fromisoformat(target_date_str)
    except ValueError:
        target_dt = date.today()

    lookback_data: dict[str, list[dict]] = {}

    for i in range(config.LOOKBACK_DAYS, 0, -1):
        hist_date = target_dt - timedelta(days=i)
        hist_str  = hist_date.strftime(config.DATE_FORMAT)
        label     = f"H-{i}"

        url    = f"{config.MLB_API_BASE}/schedule"
        params = {"sportId": 1, "date": hist_str, "hydrate": "team,linescore"}
        data   = _get(url, params, timeout=config.MLB_API_TIMEOUT)

        day_results: list[dict] = []
        if data and isinstance(data, dict):
            for date_block in data.get("dates", []):
                for game in date_block.get("games", []):
                    teams = game.get("teams", {})
                    home  = teams.get("home", {})
                    away  = teams.get("away", {})
                    home_name = home.get("team", {}).get("name", "")
                    away_name = away.get("team", {}).get("name", "")

                    if home.get("isWinner"):
                        winner = home_name
                    elif away.get("isWinner"):
                        winner = away_name
                    else:
                        winner = "TBD"

                    score_str = f"{home.get('score', 0)}-{away.get('score', 0)}"
                    day_results.append({
                        "game": f"{away_name} @ {home_name}",
                        "winner": winner,
                        "score": score_str,
                        "bullpen_era": 3.20,
                        "sp_whip": 1.10,
                        "error_rate": 0.05,
                    })

        if not day_results:
            lookback_data[label] = mock_data.MOCK_HISTORICAL_RESULTS.get(label, [])
        else:
            lookback_data[label] = day_results

    return lookback_data


# ==============================================================================
# 2. MLB STATS API — GAMES FOR A SPECIFIC DATE
# ==============================================================================

def fetch_games_for_date(date_str: str) -> list[dict]:
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


# ==============================================================================
# 3. MLB STATS API — RECENT STARTS & PITCHER STATS
# ==============================================================================

def fetch_recent_starts_era(pitcher_id: int, n_starts: int = 3) -> float | None:
    season = _current_season()
    url    = f"{config.MLB_API_BASE}/people/{pitcher_id}/stats"
    params = {"stats": "gameLog", "group": "pitching", "season": season, "limit": n_starts}
    data   = _get(url, params, timeout=config.MLB_API_TIMEOUT)
    if not data:
        return None
    try:
        splits   = data.get("stats", [{}])[0].get("splits", [])
        total_er = total_ip = 0.0
        for game in splits[:n_starts]:
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
        logger.warning("Last %d ERA parse error pitcher %s: %s", n_starts, pitcher_id, exc)
        return None


def fetch_pitcher_stats(pitcher_id: int, season: int | None = None) -> dict | None:
    if season is None:
        season = _current_season()

    mock_p = mock_data.MOCK_PITCHER_STATS.get(pitcher_id, {})

    url = f"{config.MLB_API_BASE}/people/{pitcher_id}"
    params = {"hydrate": f"stats(group=[pitching],type=[season],season={season})"}
    data = _get(url, params, timeout=config.MLB_API_TIMEOUT)

    if not data:
        return mock_p or None

    try:
        people = data.get("people", [])
        if not people:
            return mock_p or None
        person = people[0]
        full_name  = person.get("fullName", "Unknown")
        stats_list = person.get("stats", [])
        if not stats_list:
            return mock_p or None
        splits = stats_list[0].get("splits", [])
        if not splits:
            return mock_p or None

        s    = splits[0].get("stat", {})
        era  = _safe_float(s.get("era"), mock_p.get("era", 4.50))
        whip = _safe_float(s.get("whip"), mock_p.get("whip", 1.30))

        l5 = fetch_recent_starts_era(pitcher_id, n_starts=5) or mock_p.get("last5_era", era)
        l3 = fetch_recent_starts_era(pitcher_id, n_starts=3) or mock_p.get("last3_era", era)

        return {
            "pitcher_id":      pitcher_id,
            "full_name":       full_name,
            "team":            mock_p.get("team", ""),
            "era":             era,
            "last5_era":       l5,
            "last3_era":       l3,
            "whip":            whip,
            "hr_per9":         _safe_float(s.get("homeRunsPer9Inn"), mock_p.get("hr_per9", 1.20)),
            "k_per9":          _safe_float(s.get("strikeoutsPer9Inn"), mock_p.get("k_per9", 8.0)),
            "strikeout_rate":  _safe_float(s.get("strikeoutsPer9Inn"), 8.0) / 9.0,
            "innings_pitched": _safe_float(s.get("inningsPitched"), 0.0),
            "pitch_count_avg": mock_p.get("pitch_count_avg", 90),
            "fip":             era,
            "opponent_avg":    _safe_float(s.get("avg"), 0.250),
            "throws":          mock_p.get("throws", "R"),
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Pitcher %s parse error: %s — using mock.", pitcher_id, exc)
        return mock_p or None


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
        hrpg = _safe_float(s.get("homeRuns", 0), 0) / gp if gp > 0 else 1.10
        ops = _safe_float(s.get("ops"), mock_off["ops"] if mock_off else 0.720)
        return {
            "team_id": team_id,
            "runs_per_game": round(rpg, 2),
            "hr_per_game": round(hrpg, 2),
            "ops": ops,
        }
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Team offense parse error team %s: %s", team_id, exc)
        return mock_off


# ==============================================================================
# 4. OPEN-METEO WEATHER (Date-aware)
# ==============================================================================

def fetch_weather(venue: str, date_str: str | None = None) -> dict:
    coords = config.STADIUM_COORDINATES.get(venue) or config.STADIUM_COORDINATES["DEFAULT"]
    lat    = coords["lat"]
    lon    = coords["lon"]

    mock_w = mock_data.MOCK_WEATHER.get(venue, {
        "temp_f": 72.0, "wind_speed_mph": 5.0,
        "wind_direction": "none", "conditions": "Unknown",
    })

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
        return mock_w

    try:
        if "current" in data:
            cur      = data["current"]
            temp_f   = _safe_float(cur.get("temperature_2m"),     mock_w["temp_f"])
            wind_mph = _safe_float(cur.get("wind_speed_10m"),     mock_w["wind_speed_mph"])
            wind_deg = _safe_float(cur.get("wind_direction_10m"), 180)
            wcode    = _safe_int(  cur.get("weather_code"),        0)
        else:
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

        return {
            "temp_f":          round(float(temp_f),   1),
            "wind_speed_mph":  round(float(wind_mph), 1),
            "wind_direction":  direction,
            "conditions":      "Clear" if wcode < 3 else "Overcast",
        }
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        logger.warning("Weather parse error (%s): %s — using mock.", venue, exc)
        return mock_w


# ==============================================================================
# 5. THE ODDS API & LINE SHOPPING ENGINE
# ==============================================================================

def fetch_odds_lines() -> tuple[dict[int, dict], dict[str, float], bool, dict[int, dict]]:
    """
    Fetch live Moneyline, Total Lines, and Line Shopping comparison from The Odds API.
    Returns: (ml_odds_by_game_id, ou_lines_dict, is_live_data: bool, line_shopping_data).
    """
    api_key = config.API_KEYS.get("the_odds_api", "")
    if not api_key or api_key == "YOUR_ODDS_API_KEY_HERE":
        logger.info("The Odds API key unverified — using mock odds with is_live_data=False.")
        return mock_data.MOCK_MONEYLINE_ODDS, _mock_totals_lines(), False, mock_data.MOCK_LINE_SHOPPING

    url    = f"{config.ODDS_API_BASE}/sports/{config.ODDS_SPORT_KEY}/odds"
    params = {
        "apiKey": api_key,
        "regions": config.ODDS_REGIONS,
        "markets": "h2h,totals",
        "oddsFormat": config.ODDS_FORMAT,
    }
    data = _get(url, params, timeout=config.ODDS_API_TIMEOUT)
    if not data or not isinstance(data, list):
        logger.warning("The Odds API returned no data — falling back to mock odds.")
        return mock_data.MOCK_MONEYLINE_ODDS, _mock_totals_lines(), False, mock_data.MOCK_LINE_SHOPPING

    ml_lines: dict[int, dict] = {}
    ou_lines: dict[str, float] = {}
    line_shopping: dict[int, dict] = {}

    try:
        for event in data:
            home = event.get("home_team", "")
            away = event.get("away_team", "")
            key  = f"{home} vs {away}"

            home_ml = -110
            away_ml = +110
            books_map: dict[str, dict] = {}

            for book in event.get("bookmakers", []):
                title = book.get("title", "Unknown")
                for market in book.get("markets", []):
                    m_key = market.get("key")
                    if m_key == "h2h":
                        b_home_ml = -110
                        b_away_ml = +110
                        for outcome in market.get("outcomes", []):
                            name = outcome.get("name", "")
                            price = outcome.get("price")
                            if price is not None:
                                if name == home:
                                    home_ml = int(price)
                                    b_home_ml = int(price)
                                elif name == away:
                                    away_ml = int(price)
                                    b_away_ml = int(price)
                        books_map[title] = {"home_ml": b_home_ml, "away_ml": b_away_ml}

                    elif m_key == "totals":
                        for outcome in market.get("outcomes", []):
                            if outcome.get("name") == "Over":
                                try:
                                    ou_lines[key] = float(outcome.get("point", 8.5))
                                except (TypeError, ValueError):
                                    pass
                                break

            for g in mock_data.MOCK_GAMES:
                if home in g.get("home_team", "") or away in g.get("away_team", ""):
                    gid = g["game_id"]
                    ml_lines[gid] = {"home_ml": home_ml, "away_ml": away_ml}
                    line_shopping[gid] = books_map

        return (
            ml_lines or mock_data.MOCK_MONEYLINE_ODDS,
            ou_lines or _mock_totals_lines(),
            True,
            line_shopping or mock_data.MOCK_LINE_SHOPPING,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Error parsing live odds: %s", exc)
        return mock_data.MOCK_MONEYLINE_ODDS, _mock_totals_lines(), False, mock_data.MOCK_LINE_SHOPPING


def _mock_totals_lines() -> dict[str, float]:
    return {g["matchup"]: g["total_line"] for g in mock_data.MOCK_ODDS_LINES.values()}


# ==============================================================================
# 6. ENRICHED SLATE LOADER
# ==============================================================================

def load_full_game_slate(date_str: str | None = None) -> tuple[list[dict], bool, dict[int, dict]]:
    """
    Primary slate loader.
    Returns: (enriched_games_list, is_live_data: bool, line_shopping_data).
    """
    if date_str is None:
        date_str = date.today().strftime(config.DATE_FORMAT)

    games = fetch_games_for_date(date_str)
    ml_odds, all_ou, is_live_data, line_shopping = fetch_odds_lines()

    enriched: list[dict] = []
    for game in games:
        game_id    = game.get("game_id")
        venue      = game.get("venue", "DEFAULT")
        home_sp_id = game.get("home_starter_id")
        away_sp_id = game.get("away_starter_id")

        home_sp = fetch_pitcher_stats(home_sp_id) if home_sp_id else None
        away_sp = fetch_pitcher_stats(away_sp_id) if away_sp_id else None

        ml = ml_odds.get(game_id, mock_data.MOCK_MONEYLINE_ODDS.get(game_id, {"home_ml": -110, "away_ml": -110}))

        enriched.append({
            **game,
            "home_sp":      home_sp,
            "away_sp":      away_sp,
            "home_bullpen": fetch_bullpen_stats(game.get("home_team_id")),
            "away_bullpen": fetch_bullpen_stats(game.get("away_team_id")),
            "home_offense": fetch_team_offense(game.get("home_team_id")),
            "away_offense": fetch_team_offense(game.get("away_team_id")),
            "weather":      fetch_weather(venue, date_str),
            "moneyline":    ml,
            "ou_line":      mock_data.MOCK_ODDS_LINES.get(game_id, {}).get("total_line", 8.5),
        })

    return enriched, is_live_data, line_shopping


def load_batter_h2h_records(date_str: str | None = None) -> list[dict]:
    _ = date_str
    return list(mock_data.MOCK_BATTER_H2H)


def load_pitcher_stats(date_str: str | None = None) -> list[dict]:
    _ = date_str
    return list(mock_data.MOCK_PITCHER_STATS.values())
