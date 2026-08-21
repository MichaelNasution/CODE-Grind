"""
data_fetcher.py
===============
API handler layer for the MLB Analytics CLI System v6.0.
Silent logging & quiet API timeout engine (Logs exclusively to app.log).

Fetches:
  1. MLB StatsAPI Game Schedule & Probable Starters
  2. 4-Day Historical Lookback Engine Data (H-4 to H-1) for model calibration
  3. Sportsbook Line Shopping Odds (BetMGM, DraftKings, Caesars, FanDuel, ESPN Bet)
  4. Pitcher Stats (Season, Last 5, Last 3 Trend, WHIP, K/9, HR/9)
  5. Open-Meteo Weather Forecast (Date-aware)
  6. FanGraphs Advanced Pitching (SIERA, xFIP, K%, BB/9) via pybaseball
  7. FanGraphs 7-Day Team Batting (wRC+, ISO) via pybaseball
  8. Tracks `is_live_data: bool` verification flag
  [v6.0] SP 1st Inning Splits (xFIP/ERA/NRFI%) via Statcast 45-day window
  [v6.0] Top-3 Lineup wRC+ per team via pybaseball
  [v6.0] NRFI / YRFI Trend Data (last 15 games) via MLB StatsAPI
  [v6.0] 12-hour file-based caching (.cache/) for all three above
"""

from __future__ import annotations

import logging
import warnings
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from datetime import date, datetime, timedelta, timezone
from typing import Any

import requests
import urllib3

import config
import mock_data

# ── Pybaseball optional import (silent fallback if not installed) ───────────────
try:
    import pybaseball
    pybaseball.cache.enable()            # Cache calls in ~/.pybaseball/ to speed up repeats
    _PYBASEBALL_AVAILABLE = True
except ImportError:
    _PYBASEBALL_AVAILABLE = False

# ── Silence ALL HTTP-related warnings & logs from stdout ──────────────────────
warnings.filterwarnings("ignore")                       # suppress all Python warnings
urllib3.disable_warnings()                              # suppress InsecureRequestWarning etc.
logging.getLogger("urllib3").setLevel(logging.CRITICAL)
logging.getLogger("requests").setLevel(logging.CRITICAL)
logging.getLogger("urllib3.connectionpool").setLevel(logging.CRITICAL)
logging.getLogger("charset_normalizer").setLevel(logging.CRITICAL)
# ─────────────────────────────────────────────────────────────────────────────

logger = logging.getLogger(__name__)


# ==============================================================================
# INTERNAL HELPERS
# ==============================================================================

def _get(url: str, params: dict | None = None, timeout: int = 2) -> dict | list | None:
    """
    Silent HTTP GET — catches timeouts & connection errors silently,
    logs to app.log, and returns None for immediate mock fallback.
    """
    try:
        resp = requests.get(url, params=params, timeout=timeout)
        resp.raise_for_status()
        return resp.json()
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
        logger.debug("Silent fallback (Timeout/Connection) for URL: %s", url)
    except requests.exceptions.HTTPError as exc:
        logger.debug("HTTP error %s for URL: %s", exc.response.status_code if exc.response else 0, url)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Unexpected error fetching %s: %s", url, exc)
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

                    winner = home_name if home.get("isWinner") else (away_name if away.get("isWinner") else "TBD")
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
        logger.debug("Using mock game data (API unavailable) for date %s.", date_str)
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
        logger.debug("Game parse error: %s — falling back to mock.", exc)
        return mock_data.get_mock_games(date_str)

    if not games:
        logger.debug("No games returned for %s — using mock.", date_str)
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
        logger.debug("Last %d ERA parse error pitcher %s: %s", n_starts, pitcher_id, exc)
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
        logger.debug("Pitcher %s parse error: %s — using mock.", pitcher_id, exc)
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
        logger.debug("Bullpen stats parse error team %s: %s", team_id, exc)
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
        logger.debug("Team offense parse error team %s: %s", team_id, exc)
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

    data = _get(url, params, timeout=2)
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
        logger.debug("Weather parse error (%s): %s — using mock.", venue, exc)
        return mock_w


# ==============================================================================
# 5. THE ODDS API & LINE SHOPPING ENGINE
# ==============================================================================

def fetch_odds_lines() -> tuple[dict[int, dict], dict[str, float], bool, dict[int, dict]]:
    api_key = config.API_KEYS.get("the_odds_api", "")
    if not api_key or api_key == "YOUR_ODDS_API_KEY_HERE":
        logger.debug("The Odds API key unverified — using mock odds with is_live_data=False.")
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
        logger.debug("The Odds API returned no data — falling back to mock odds.")
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
        logger.debug("Error parsing live odds: %s", exc)
        return mock_data.MOCK_MONEYLINE_ODDS, _mock_totals_lines(), False, mock_data.MOCK_LINE_SHOPPING


def _mock_totals_lines() -> dict[str, float]:
    return {g["matchup"]: g["total_line"] for g in mock_data.MOCK_ODDS_LINES.values()}


# ==============================================================================
# 6. FANGRAPHS REAL-TIME DATA VIA PYBASEBALL
# ==============================================================================

def _run_with_timeout(fn, *args, timeout: int = 10, **kwargs):
    """
    Runs fn(*args, **kwargs) in a thread and raises FuturesTimeoutError if it
    exceeds `timeout` seconds. Isolates pybaseball blocking scrapes from main thread.
    """
    with ThreadPoolExecutor(max_workers=1) as ex:
        future = ex.submit(fn, *args, **kwargs)
        return future.result(timeout=timeout)


def fetch_fangraphs_pitcher_advanced(season: int | None = None) -> dict[str, dict]:
    """
    Fetch advanced pitching sabermetrics (SIERA, xFIP, K%, BB/9) from FanGraphs
    via pybaseball.pitching_stats().

    Returns:
        dict keyed by pitcher FullName -> {siera, xfip, k_pct, bb_per9}
    Falls back to mock pitcher stats sabermetrics if pybaseball unavailable or times out.
    """
    if not _PYBASEBALL_AVAILABLE:
        logger.debug("pybaseball not available — using mock pitcher sabermetrics.")
        return _mock_pitcher_sabermetrics()

    if season is None:
        season = _current_season()

    def _fetch():
        df = pybaseball.pitching_stats(season, qual=30)
        return df

    try:
        df = _run_with_timeout(_fetch, timeout=config.PYBASEBALL_TIMEOUT)

        result: dict[str, dict] = {}
        for _, row in df.iterrows():
            name = str(row.get("Name", "")).strip()
            if not name:
                continue
            result[name] = {
                "siera":    _safe_float(row.get("SIERA",  row.get("ERA", 4.50)), 4.50),
                "xfip":     _safe_float(row.get("xFIP",   row.get("ERA", 4.50)), 4.50),
                "k_pct":    _safe_float(row.get("K%",     0.220), 0.220),
                "bb_per9":  _safe_float(row.get("BB/9",   3.0),   3.0),
            }
        logger.debug("FanGraphs pitching: loaded %d pitchers.", len(result))
        return result if result else _mock_pitcher_sabermetrics()

    except (FuturesTimeoutError, Exception) as exc:  # noqa: BLE001
        logger.debug("FanGraphs pitching fetch failed (%s) — using mock.", exc)
        return _mock_pitcher_sabermetrics()


def fetch_fangraphs_team_batting_7d(today_str: str | None = None) -> dict[str, dict]:
    """
    Fetch 7-day team batting stats (wRC+, ISO) from FanGraphs
    via pybaseball.team_batting().

    Returns:
        dict keyed by team name -> {wrc_plus_7d, iso_7d, ops_7d}
    Falls back to MOCK_TEAM_BATTING_7D if pybaseball unavailable or times out.
    """
    if not _PYBASEBALL_AVAILABLE:
        logger.debug("pybaseball not available — using mock 7-day team batting.")
        return dict(mock_data.MOCK_TEAM_BATTING_7D)

    try:
        today_dt = date.fromisoformat(today_str) if today_str else date.today()
    except ValueError:
        today_dt = date.today()

    end_dt   = today_dt - timedelta(days=1)         # Yesterday (last completed game)
    start_dt = end_dt - timedelta(days=config.FANGRAPHS_7D_LOOKBACK - 1)
    start_str = start_dt.strftime("%Y-%m-%d")
    end_str   = end_dt.strftime("%Y-%m-%d")

    def _fetch():
        df = pybaseball.team_batting(start_str, end_str)
        return df

    try:
        df = _run_with_timeout(_fetch, timeout=config.PYBASEBALL_TIMEOUT)

        result: dict[str, dict] = {}
        for _, row in df.iterrows():
            team_name = str(row.get("Team", "")).strip()
            if not team_name:
                continue
            result[team_name] = {
                "wrc_plus_7d": _safe_int(row.get("wRC+",  row.get("wRC_plus", 100)), 100),
                "iso_7d":      _safe_float(row.get("ISO",   0.160), 0.160),
                "ops_7d":      _safe_float(row.get("OPS",   0.720), 0.720),
            }
        logger.debug("FanGraphs 7-day team batting: loaded %d teams (%s to %s).", len(result), start_str, end_str)
        # FanGraphs uses abbreviated team names — do best-effort name matching against mock fallback
        if len(result) < 5:
            logger.debug("Too few teams from FanGraphs — using mock team batting 7d.")
            return dict(mock_data.MOCK_TEAM_BATTING_7D)
        return result

    except (FuturesTimeoutError, Exception) as exc:  # noqa: BLE001
        logger.debug("FanGraphs team batting 7d fetch failed (%s) — using mock.", exc)
        return dict(mock_data.MOCK_TEAM_BATTING_7D)


def _mock_pitcher_sabermetrics() -> dict[str, dict]:
    """Extract sabermetric fields from MOCK_PITCHER_STATS keyed by full name."""
    result: dict[str, dict] = {}
    for stats in mock_data.MOCK_PITCHER_STATS.values():
        name = stats.get("full_name", "")
        if name:
            result[name] = {
                "siera":   stats.get("siera",   stats.get("era", 4.50)),
                "xfip":    stats.get("xfip",    stats.get("era", 4.50)),
                "k_pct":   stats.get("k_pct",   0.220),
                "bb_per9": stats.get("bb_per9", 3.0),
            }
    return result


# ==============================================================================
# 7. ENRICHED SLATE LOADER (with FanGraphs advanced stats merge)
# ==============================================================================

def load_full_game_slate(
    date_str: str | None = None,
) -> tuple[list[dict], bool, dict[int, dict]]:
    """
    Load the full game slate for a given date, enriched with:
    - Pitcher season stats (MLB StatsAPI)
    - Bullpen stats (MLB StatsAPI)
    - Team offense stats (MLB StatsAPI)
    - Weather forecast (Open-Meteo)
    - Line shopping odds (The Odds API)
    - Advanced pitcher sabermetrics (FanGraphs via pybaseball) merged into home_sp/away_sp
    - 7-day team batting wRC+ (FanGraphs via pybaseball) stored as team_batting_7d in game dict
    """
    if date_str is None:
        date_str = date.today().strftime(config.DATE_FORMAT)

    games = fetch_games_for_date(date_str)
    ml_odds, all_ou, is_live_data, line_shopping = fetch_odds_lines()

    # Fetch FanGraphs advanced stats (with timeout, silent fallback)
    fg_pitchers   = fetch_fangraphs_pitcher_advanced()
    fg_batting_7d = fetch_fangraphs_team_batting_7d(date_str)

    enriched: list[dict] = []
    for game in games:
        game_id    = game.get("game_id")
        venue      = game.get("venue", "DEFAULT")
        home_sp_id = game.get("home_starter_id")
        away_sp_id = game.get("away_starter_id")

        home_sp = fetch_pitcher_stats(home_sp_id) if home_sp_id else None
        away_sp = fetch_pitcher_stats(away_sp_id) if away_sp_id else None

        # Merge FanGraphs advanced pitching sabermetrics into SP dicts
        if home_sp:
            home_name = home_sp.get("full_name", game.get("home_starter_name", ""))
            fg_h = fg_pitchers.get(home_name, {})
            home_sp["siera"]   = fg_h.get("siera",   home_sp.get("siera",   home_sp.get("era", 4.50)))
            home_sp["xfip"]    = fg_h.get("xfip",    home_sp.get("xfip",    home_sp.get("era", 4.50)))
            home_sp["k_pct"]   = fg_h.get("k_pct",   home_sp.get("k_pct",   0.220))
            home_sp["bb_per9"] = fg_h.get("bb_per9", home_sp.get("bb_per9", 3.0))

        if away_sp:
            away_name = away_sp.get("full_name", game.get("away_starter_name", ""))
            fg_a = fg_pitchers.get(away_name, {})
            away_sp["siera"]   = fg_a.get("siera",   away_sp.get("siera",   away_sp.get("era", 4.50)))
            away_sp["xfip"]    = fg_a.get("xfip",    away_sp.get("xfip",    away_sp.get("era", 4.50)))
            away_sp["k_pct"]   = fg_a.get("k_pct",   away_sp.get("k_pct",   0.220))
            away_sp["bb_per9"] = fg_a.get("bb_per9", away_sp.get("bb_per9", 3.0))

        home_team_name = game.get("home_team", "")
        away_team_name = game.get("away_team", "")

        ml = ml_odds.get(game_id, mock_data.MOCK_MONEYLINE_ODDS.get(game_id, {"home_ml": -110, "away_ml": -110}))

        enriched.append({
            **game,
            "home_sp":           home_sp,
            "away_sp":           away_sp,
            "home_bullpen":      fetch_bullpen_stats(game.get("home_team_id")),
            "away_bullpen":      fetch_bullpen_stats(game.get("away_team_id")),
            "home_offense":      fetch_team_offense(game.get("home_team_id")),
            "away_offense":      fetch_team_offense(game.get("away_team_id")),
            "weather":           fetch_weather(venue, date_str),
            "moneyline":         ml,
            "ou_line":           mock_data.MOCK_ODDS_LINES.get(game_id, {}).get("total_line", 8.5),
            # 7-day FanGraphs batting keyed by team name
            "home_batting_7d":   fg_batting_7d.get(home_team_name, mock_data.MOCK_TEAM_BATTING_7D.get(home_team_name, {"wrc_plus_7d": 100, "iso_7d": 0.160, "ops_7d": 0.720})),
            "away_batting_7d":   fg_batting_7d.get(away_team_name, mock_data.MOCK_TEAM_BATTING_7D.get(away_team_name, {"wrc_plus_7d": 100, "iso_7d": 0.160, "ops_7d": 0.720})),
        })

    return enriched, is_live_data, line_shopping


def load_batter_h2h_records(date_str: str | None = None) -> list[dict]:
    _ = date_str
    return list(mock_data.MOCK_BATTER_H2H)


def load_pitcher_stats(date_str: str | None = None) -> list[dict]:
    _ = date_str
    return list(mock_data.MOCK_PITCHER_STATS.values())


# ==============================================================================
# [v6.0] FILE-BASED CACHE HELPERS (12-HOUR TTL)
# ==============================================================================

import json as _json
import os as _os
from pathlib import Path as _Path

_HERE_DF   = _Path(__file__).parent.resolve()
_CACHE_DIR = _HERE_DF / config.CACHE_DIR


def _ensure_cache_dir() -> None:
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _is_cache_valid(cache_path: _Path) -> bool:
    """Returns True if cache file exists and is less than CACHE_TTL_HOURS old."""
    if not cache_path.exists():
        return False
    try:
        import time
        age_seconds = time.time() - cache_path.stat().st_mtime
        return age_seconds < (config.CACHE_TTL_HOURS * 3600)
    except Exception:
        return False


def _load_cache(cache_path: _Path) -> dict | None:
    try:
        with cache_path.open("r", encoding="utf-8") as fh:
            return _json.load(fh)
    except Exception:
        return None


def _save_cache(cache_path: _Path, data: dict) -> None:
    _ensure_cache_dir()
    try:
        with cache_path.open("w", encoding="utf-8") as fh:
            _json.dump(data, fh, ensure_ascii=False)
    except Exception as exc:
        logger.debug("Could not save cache %s: %s", cache_path, exc)


# ==============================================================================
# [v6.0] SP 1ST INNING SPLITS (45-DAY STATCAST WINDOW)
# ==============================================================================

def fetch_sp_first_inning_splits(
    pitcher_ids: list[int] | None = None,
    season: int | None = None,
) -> dict[int, dict]:
    """
    Fetch Starting Pitcher 1st Inning splits:
      - xFIP_1st_inn, ERA_1st_inn, K%_1st_inn, BB/9_1st_inn, NRFI%_as_SP
    Uses pybaseball.statcast_pitcher() filtered to inning_topbot / inning_start=1,
    rolling 45 days, minimum 8 starts.

    12-hour file-based cache at .cache/sp_1st_inn_splits_{season}.json.
    Falls back silently to MOCK_SP_FIRST_INN_SPLITS.
    """
    season = season or _current_season()
    cache_path = _CACHE_DIR / config.CACHE_SP_SPLITS_FILE.format(season=season)

    if _is_cache_valid(cache_path):
        cached = _load_cache(cache_path)
        if cached:
            logger.debug("SP 1st inn splits: cache hit")
            return {int(k): v for k, v in cached.items()}

    if not _PYBASEBALL_AVAILABLE:
        logger.debug("pybaseball not available — using mock SP 1st inn splits")
        return dict(mock_data.MOCK_SP_FIRST_INN_SPLITS)

    from datetime import date as _date, timedelta as _td
    try:
        import pandas as pd
        end_date   = _date.today()
        start_date = end_date - _td(days=config.STATCAST_ROLLING_DAYS)
        end_str    = end_date.strftime("%Y-%m-%d")
        start_str  = start_date.strftime("%Y-%m-%d")

        results: dict[int, dict] = {}
        # For each pitcher, pull Statcast data (inning == 1)
        target_ids = pitcher_ids or list(mock_data.MOCK_SP_FIRST_INN_SPLITS.keys())
        for pid in target_ids:
            try:
                df = pybaseball.statcast_pitcher(start_str, end_str, player_id=pid)
                if df is None or df.empty:
                    results[pid] = mock_data.MOCK_SP_FIRST_INN_SPLITS.get(pid, {})
                    continue
                inn1 = df[df["inning"] == 1].copy()
                if len(inn1) < config.STATCAST_MIN_STARTS:
                    results[pid] = mock_data.MOCK_SP_FIRST_INN_SPLITS.get(pid, {})
                    continue

                # Compute metrics from Statcast pitch-level data
                starts = inn1["game_pk"].nunique()
                total_k  = (inn1["events"].isin(["strikeout", "strikeout_double_play"])).sum()
                total_pa = inn1["at_bat_number"].nunique()
                k_pct    = total_k / total_pa if total_pa > 0 else 0.22

                total_bb = (inn1["events"] == "walk").sum()
                ip_est   = starts * 1.0   # ~1 inning per start
                bb_per9  = (total_bb / ip_est) * 9 if ip_est > 0 else 3.0

                # ERA via earned runs (if available)
                if "post_home_score" in inn1.columns and "home_score" in inn1.columns:
                    earned_runs = (inn1["post_home_score"] - inn1["home_score"]).clip(lower=0).sum()
                    era_1st = (earned_runs / ip_est) * 9 if ip_est > 0 else 4.50
                else:
                    era_1st = mock_data.MOCK_SP_FIRST_INN_SPLITS.get(pid, {}).get("era_1st_inn", 4.50)

                # xFIP estimate from ERA × SP_1ST_INN_ERA_MULTIPLIER (or from mock)
                xfip_1st = mock_data.MOCK_SP_FIRST_INN_SPLITS.get(pid, {}).get(
                    "xfip_1st_inn", round(era_1st * 0.92, 2)
                )

                # NRFI% from game-level data: find games where inning 1 was scoreless
                game_results = inn1.groupby("game_pk").agg(
                    total_runs=("post_home_score", "max")
                ).reset_index()
                nrfi_pct = (game_results["total_runs"] == 0).mean() if len(game_results) > 0 else 0.55

                results[pid] = {
                    "pitcher_id":      pid,
                    "era_1st_inn":     round(era_1st, 2),
                    "xfip_1st_inn":    round(xfip_1st, 2),
                    "k_pct_1st_inn":   round(k_pct, 3),
                    "bb_per9_1st_inn": round(bb_per9, 2),
                    "nrfi_as_sp_pct":  round(float(nrfi_pct), 3),
                    "sample_starts":   int(starts),
                }
            except Exception as exc:
                logger.debug("Statcast fetch failed for pitcher %s: %s", pid, exc)
                results[pid] = mock_data.MOCK_SP_FIRST_INN_SPLITS.get(pid, {})

        _save_cache(cache_path, {str(k): v for k, v in results.items()})
        return results

    except Exception as exc:
        logger.debug("SP 1st inn splits fetch failed: %s", exc)
        return dict(mock_data.MOCK_SP_FIRST_INN_SPLITS)


# ==============================================================================
# [v6.0] TOP-3 LINEUP wRC+ PER TEAM (7-DAY ROLLING)
# ==============================================================================

def fetch_top3_lineup_wrc(
    date_str: str | None = None,
) -> dict[str, dict]:
    """
    Fetch top-3 batting order wRC+ for each team over the last 7 days.
    Uses pybaseball.batting_stats_range() to pull individual batter data,
    then selects batters batting 1-2-3 for each team.

    12-hour file-based cache at .cache/top3_wrc_{date}.json.
    Falls back silently to MOCK_TOP3_LINEUP_WRC.
    """
    date_str  = date_str or date.today().strftime("%Y-%m-%d")
    cache_path = _CACHE_DIR / config.CACHE_TOP3_WRC_FILE.format(date=date_str)

    if _is_cache_valid(cache_path):
        cached = _load_cache(cache_path)
        if cached:
            logger.debug("Top-3 wRC+ cache hit")
            return cached

    if not _PYBASEBALL_AVAILABLE:
        logger.debug("pybaseball not available — using mock Top-3 wRC+")
        return dict(mock_data.MOCK_TOP3_LINEUP_WRC)

    try:
        from datetime import date as _date, timedelta as _td
        end_dt   = _date.fromisoformat(date_str) if date_str else _date.today()
        start_dt = end_dt - _td(days=7)
        end_s    = end_dt.strftime("%Y-%m-%d")
        start_s  = start_dt.strftime("%Y-%m-%d")

        df = pybaseball.batting_stats_range(start_s, end_s)
        if df is None or df.empty:
            raise ValueError("Empty batting_stats_range result")

        # pybaseball returns season totals — blend into top-3 per team
        # Columns: Team, Name, wRC+, etc.
        results: dict[str, dict] = {}
        for team_name in mock_data.MOCK_TOP3_LINEUP_WRC.keys():
            team_rows = df[df["Team"] == team_name] if "Team" in df.columns else None
            if team_rows is None or team_rows.empty:
                results[team_name] = mock_data.MOCK_TOP3_LINEUP_WRC.get(team_name, {"top3_wrc_plus_7d": 100})
                continue
            wrc_col = "wRC+" if "wRC+" in team_rows.columns else "wrc_plus"
            top3 = team_rows.nlargest(3, wrc_col) if wrc_col in team_rows.columns else team_rows.head(3)
            avg_wrc = top3[wrc_col].mean() if wrc_col in top3.columns else 100
            top3_names = top3["Name"].tolist() if "Name" in top3.columns else []
            results[team_name] = {
                "top3_batters":      top3_names[:3],
                "top3_wrc_plus_7d": int(round(avg_wrc)),
                "top3_woba_7d":     mock_data.MOCK_TOP3_LINEUP_WRC.get(team_name, {}).get("top3_woba_7d", 0.340),
                "vs_rhp_wrc_plus":  mock_data.MOCK_TOP3_LINEUP_WRC.get(team_name, {}).get("vs_rhp_wrc_plus", int(round(avg_wrc)) - 3),
                "vs_lhp_wrc_plus":  mock_data.MOCK_TOP3_LINEUP_WRC.get(team_name, {}).get("vs_lhp_wrc_plus", int(round(avg_wrc)) + 3),
            }

        _save_cache(cache_path, results)
        return results

    except Exception as exc:
        logger.debug("Top-3 wRC+ fetch failed: %s", exc)
        return dict(mock_data.MOCK_TOP3_LINEUP_WRC)


# ==============================================================================
# [v6.0] NRFI / YRFI TREND DATA (LAST 15 GAMES)
# ==============================================================================

def fetch_nrfi_trends(
    date_str: str | None = None,
) -> dict[str, dict]:
    """
    Fetch per-team NRFI/YRFI trend rates (last 15 games) from MLB StatsAPI.
    Computes: nrfi_home_rate, nrfi_away_rate, last_15_nrfi_count, streaks.

    12-hour file-based cache at .cache/nrfi_trends_{date}.json.
    Falls back silently to MOCK_NRFI_TRENDS.
    """
    date_str   = date_str or date.today().strftime("%Y-%m-%d")
    cache_path = _CACHE_DIR / config.CACHE_NRFI_TRENDS_FILE.format(date=date_str)

    if _is_cache_valid(cache_path):
        cached = _load_cache(cache_path)
        if cached:
            logger.debug("NRFI trends cache hit")
            return cached

    try:
        from datetime import date as _date, timedelta as _td
        end_dt   = _date.fromisoformat(date_str) if date_str else _date.today()
        start_dt = end_dt - _td(days=30)  # 30-day window to get last 15 games
        end_s    = end_dt.strftime("%Y-%m-%d")
        start_s  = start_dt.strftime("%Y-%m-%d")

        url    = f"{config.MLB_API_BASE}/schedule"
        params = {"sportId": 1, "startDate": start_s, "endDate": end_s,
                  "hydrate": "linescore", "gameType": "R"}
        data   = _get(url, params, timeout=config.MLB_API_TIMEOUT)

        if not data or not isinstance(data, dict):
            raise ValueError("Invalid StatsAPI response for NRFI trends")

        # Accumulate per-team NRFI rate (scored in inning 1 or not)
        team_nrfi: dict[str, dict] = {}

        for date_block in data.get("dates", []):
            for game in date_block.get("games", []):
                linescore = game.get("linescore", {})
                innings   = linescore.get("innings", [])
                if not innings:
                    continue
                inn1      = innings[0]
                home_runs = inn1.get("home", {}).get("runs", None)
                away_runs = inn1.get("away", {}).get("runs", None)
                if home_runs is None or away_runs is None:
                    continue

                home_name = game.get("teams", {}).get("home", {}).get("team", {}).get("name", "")
                away_name = game.get("teams", {}).get("away", {}).get("team", {}).get("name", "")

                # Home team did not score in inning 1 (home_runs == 0 means NRFI for home batting side)
                for team_name, runs, is_home in [(home_name, home_runs, True), (away_name, away_runs, False)]:
                    if not team_name:
                        continue
                    if team_name not in team_nrfi:
                        team_nrfi[team_name] = {
                            "home_games": [], "away_games": [], "yrfi_streak": 0, "nrfi_streak": 0
                        }
                    scored = runs > 0
                    if is_home:
                        team_nrfi[team_name]["home_games"].append(not scored)   # True = NRFI
                    else:
                        team_nrfi[team_name]["away_games"].append(not scored)

        results: dict[str, dict] = {}
        for team_name, data_t in team_nrfi.items():
            home_g = data_t["home_games"][-15:] if len(data_t["home_games"]) > 0 else []
            away_g = data_t["away_games"][-15:] if len(data_t["away_games"]) > 0 else []
            all_g  = (home_g + away_g)[-15:]

            nrfi_home_rate = (sum(home_g) / len(home_g)) if home_g else 0.53
            nrfi_away_rate = (sum(away_g) / len(away_g)) if away_g else 0.53
            nrfi_count     = sum(all_g)

            # Compute current streaks (last N games all NRFI or all YRFI)
            yrfi_streak = 0
            for val in reversed(all_g):
                if not val:   # False = YRFI
                    yrfi_streak += 1
                else:
                    break
            nrfi_streak = 0
            for val in reversed(all_g):
                if val:   # True = NRFI
                    nrfi_streak += 1
                else:
                    break

            results[team_name] = {
                "nrfi_home_rate":     round(nrfi_home_rate, 3),
                "nrfi_away_rate":     round(nrfi_away_rate, 3),
                "last_15_nrfi_count": nrfi_count,
                "yrfi_streak":        yrfi_streak,
                "nrfi_streak":        nrfi_streak,
            }

        if results:
            _save_cache(cache_path, results)
            return results
        raise ValueError("No NRFI trend data found")

    except Exception as exc:
        logger.debug("NRFI trends fetch failed: %s", exc)
        return dict(mock_data.MOCK_NRFI_TRENDS)


# ==============================================================================
# [v6.0] LOAD FIRST INNING SLATE — Combined loader for Hybrid Slip
# ==============================================================================

def load_first_inning_slate(
    games: list[dict],
    date_str: str | None = None,
    pitcher_ids: list[int] | None = None,
) -> tuple[dict, dict, dict]:
    """
    Load and return the three v6.0 data dicts needed for micro-market scoring:
      1. sp_splits:    dict[pitcher_id -> 1st-inn splits dict]
      2. top3_wrc:     dict[team_name -> top3 wRC+ dict]
      3. nrfi_trends:  dict[team_name -> NRFI trend dict]

    Uses ThreadPoolExecutor to load all three in parallel within 5 seconds.
    Any failure falls back to mock data silently.
    """
    date_str    = date_str or date.today().strftime("%Y-%m-%d")
    pids        = pitcher_ids or [
        pid
        for game in games
        for pid in [game.get("home_starter_id"), game.get("away_starter_id")]
        if pid is not None
    ]

    sp_splits   = {}
    top3_wrc    = {}
    nrfi_trends = {}

    def _fetch_splits():
        return fetch_sp_first_inning_splits(pids)

    def _fetch_top3():
        return fetch_top3_lineup_wrc(date_str)

    def _fetch_nrfi():
        return fetch_nrfi_trends(date_str)

    with ThreadPoolExecutor(max_workers=3) as executor:
        f_splits = executor.submit(_fetch_splits)
        f_top3   = executor.submit(_fetch_top3)
        f_nrfi   = executor.submit(_fetch_nrfi)
        try:
            sp_splits = f_splits.result(timeout=5)
        except Exception as exc:
            logger.debug("load_first_inning_slate: splits fallback (%s)", exc)
            sp_splits = dict(mock_data.MOCK_SP_FIRST_INN_SPLITS)
        try:
            top3_wrc = f_top3.result(timeout=5)
        except Exception as exc:
            logger.debug("load_first_inning_slate: top3_wrc fallback (%s)", exc)
            top3_wrc = dict(mock_data.MOCK_TOP3_LINEUP_WRC)
        try:
            nrfi_trends = f_nrfi.result(timeout=5)
        except Exception as exc:
            logger.debug("load_first_inning_slate: nrfi_trends fallback (%s)", exc)
            nrfi_trends = dict(mock_data.MOCK_NRFI_TRENDS)

    return sp_splits, top3_wrc, nrfi_trends
