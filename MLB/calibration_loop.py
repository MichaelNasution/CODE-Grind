"""
calibration_loop.py
====================
MLB Analytics Engine v6.0 — Self-Correction & Evaluation Loop.

Manages:
  1. BettingLogEntry — structured storage of each bet prediction + outcome
  2. load_betting_log() / save_betting_log() — persistent JSON storage
  3. resolve_pending_bets() — auto-resolve via MLB StatsAPI
  4. run_post_mortem_attribution() — z-score based feature blame scoring
  5. compute_dynamic_weights() — constrained gradient descent weight adjuster
  6. get_calibration_status() — CalibrationStatus for CLI status bar display
"""

from __future__ import annotations

import json
import logging
import statistics
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional

import config

logger = logging.getLogger(__name__)

# ── Data directory setup ───────────────────────────────────────────────────────
_HERE     = Path(__file__).parent.resolve()
_DATA_DIR = _HERE / config.DATA_DIR
_LOG_FILE = _DATA_DIR / config.BETTING_LOG_FILE
_WTS_FILE = _DATA_DIR / config.WEIGHTS_OVERRIDE_FILE


def _ensure_data_dir() -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)


# ==============================================================================
# DATA STRUCTURES
# ==============================================================================

@dataclass
class BettingLogEntry:
    """One resolved (or pending) bet record stored in betting_log.json."""
    log_id:            str
    date:              str
    bet_type:          str             # MONEYLINE | NRFI | YRFI | TEAM_U0.5 | TEAM_O0.5 | HCP_0
    game_id:           object
    team:              str
    is_home:           bool
    predicted_prob:    float
    best_ml_american:  int
    stake_units:       float
    result:            str             # WIN | LOSS | PUSH | PENDING
    profit_loss_units: float
    features:          dict = field(default_factory=dict)
    pillar_weights_used: dict = field(default_factory=dict)


@dataclass
class CalibrationStatus:
    """Calibration state summary for the CLI status bar."""
    is_cold_start:       bool
    sample_size:         int
    min_sample:          int
    active_weights:      dict
    accuracy_last_20:    dict
    attribution_summary: dict
    generated_at:        str


@dataclass
class WeightsOverride:
    """Saved to data/weights_override.json."""
    generated_at:        str
    sample_size:         int
    weights:             dict
    attribution_summary: dict
    accuracy_last_20:    dict


# ==============================================================================
# BETTING LOG: LOAD / SAVE
# ==============================================================================

def load_betting_log() -> list[BettingLogEntry]:
    """Load all bet records from betting_log.json. Returns empty list if not found."""
    _ensure_data_dir()
    if not _LOG_FILE.exists():
        return []
    try:
        with _LOG_FILE.open("r", encoding="utf-8") as fh:
            raw = json.load(fh)
        return [BettingLogEntry(**rec) for rec in raw]
    except Exception as exc:
        logger.warning("Could not load betting log: %s", exc)
        return []


def save_betting_log(entries: list[BettingLogEntry]) -> None:
    """Persist the full betting log to betting_log.json."""
    _ensure_data_dir()
    try:
        with _LOG_FILE.open("w", encoding="utf-8") as fh:
            json.dump([asdict(e) for e in entries], fh, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.warning("Could not save betting log: %s", exc)


def append_bet(entry: BettingLogEntry) -> None:
    """Append a single new bet to the log."""
    entries = load_betting_log()
    if not entry.log_id:
        entry.log_id = f"{date.today().strftime('%Y%m%d')}-{len(entries)+1:03d}"
    entries.append(entry)
    save_betting_log(entries)


# ==============================================================================
# AUTO-RESOLVE PENDING BETS via MLB STATS API
# ==============================================================================

def resolve_pending_bets(entries: list[BettingLogEntry]) -> list[BettingLogEntry]:
    """
    Attempt to auto-resolve any PENDING bets by querying MLB StatsAPI game feed.
    Silent failures are logged to app.log only.
    """
    import requests

    pending = [e for e in entries if e.result == "PENDING"]
    if not pending:
        return entries

    idx_map = {e.log_id: i for i, e in enumerate(entries)}

    for bet in pending:
        try:
            url  = f"{config.MLB_API_BASE}/game/{bet.game_id}/feed/live"
            resp = requests.get(url, timeout=config.MLB_API_TIMEOUT)
            if resp.status_code != 200:
                continue
            data  = resp.json()
            state = data.get("gameData", {}).get("status", {}).get("detailedState", "")
            if state != "Final":
                continue

            live      = data.get("liveData", {})
            linescore = live.get("linescore", {})
            innings   = linescore.get("innings", [])

            if bet.bet_type == "MONEYLINE":
                teams = linescore.get("teams", {})
                home_r = teams.get("home", {}).get("runs", 0)
                away_r = teams.get("away", {}).get("runs", 0)
                won_home = home_r > away_r
                team_won = won_home if bet.is_home else not won_home
                _finalize(entries, idx_map, bet, won=team_won)

            elif bet.bet_type in ("NRFI", "YRFI"):
                if not innings:
                    continue
                inn1     = innings[0]
                home_1st = inn1.get("home", {}).get("runs", 0)
                away_1st = inn1.get("away", {}).get("runs", 0)
                nrfi_actual = (home_1st == 0 and away_1st == 0)
                won = nrfi_actual if bet.bet_type == "NRFI" else not nrfi_actual
                _finalize(entries, idx_map, bet, won=won)

            elif bet.bet_type in ("TEAM_U0.5", "TEAM_O0.5"):
                if not innings:
                    continue
                inn1 = innings[0]
                runs = inn1.get("home" if bet.is_home else "away", {}).get("runs", 0)
                won  = (runs == 0) if bet.bet_type == "TEAM_U0.5" else (runs >= 1)
                _finalize(entries, idx_map, bet, won=won)

            elif bet.bet_type == "HCP_0":
                if not innings:
                    continue
                inn1      = innings[0]
                home_runs = inn1.get("home", {}).get("runs", 0)
                away_runs = inn1.get("away", {}).get("runs", 0)
                t_runs    = home_runs if bet.is_home else away_runs
                o_runs    = away_runs if bet.is_home else home_runs
                if t_runs > o_runs:
                    _finalize(entries, idx_map, bet, won=True)
                elif t_runs < o_runs:
                    _finalize(entries, idx_map, bet, won=False)
                else:
                    entries[idx_map[bet.log_id]].result = "PUSH"
                    entries[idx_map[bet.log_id]].profit_loss_units = 0.0

        except Exception as exc:
            logger.debug("Could not resolve bet %s: %s", bet.log_id, exc)

    return entries


def _finalize(
    entries: list[BettingLogEntry],
    idx_map: dict[str, int],
    bet: BettingLogEntry,
    won: bool,
) -> None:
    i = idx_map[bet.log_id]
    entries[i].result = "WIN" if won else "LOSS"
    if won:
        ml = bet.best_ml_american
        entries[i].profit_loss_units = (
            bet.stake_units * (100 / abs(ml)) if ml < 0
            else bet.stake_units * (ml / 100)
        )
    else:
        entries[i].profit_loss_units = -bet.stake_units


# ==============================================================================
# POST-MORTEM ATTRIBUTION — z-score based blame scoring
# ==============================================================================

_TRACKED_FEATURES = [
    "p1_sp_siera",
    "p1_sp_xfip",
    "p2_wrc_plus_7d",
    "p3_bullpen_era",
    "p4_is_home",
    "nrfi_xfip_1st_inn",
    "top3_wrc_plus_7d",
]

_LOWER_IS_BETTER = {
    "p1_sp_siera":       True,
    "p1_sp_xfip":        True,
    "p2_wrc_plus_7d":    False,
    "p3_bullpen_era":    True,
    "p4_is_home":        False,
    "nrfi_xfip_1st_inn": True,
    "top3_wrc_plus_7d":  False,
}


def run_post_mortem_attribution(entries: list[BettingLogEntry]) -> dict[str, float]:
    """
    Compute feature blame shares using z-score deviation analysis.
    Returns dict mapping feature_name -> blame_share (0.0–1.0).
    Returns empty dict if insufficient data.
    """
    resolved = [e for e in entries if e.result in ("WIN", "LOSS")]
    if len(resolved) < config.CALIB_MIN_SAMPLE_SIZE:
        return {}

    window = resolved[-config.CALIB_LOOKBACK_BETS:]
    wins   = [e for e in window if e.result == "WIN"]
    losses = [e for e in window if e.result == "LOSS"]

    if not wins or not losses:
        return {}

    win_vals: dict[str, list[float]] = {f: [] for f in _TRACKED_FEATURES}
    for e in wins:
        for feat in _TRACKED_FEATURES:
            val = e.features.get(feat)
            if val is not None and isinstance(val, (int, float)):
                win_vals[feat].append(float(val))

    blame_scores: dict[str, float] = {}

    for feat in _TRACKED_FEATURES:
        wv = win_vals[feat]
        if len(wv) < 3:
            blame_scores[feat] = 0.0
            continue
        try:
            win_mean = statistics.mean(wv)
            win_std  = statistics.stdev(wv) if len(wv) >= 2 else 1.0
            if win_std < 1e-6:
                win_std = 1e-6

            total_blame = 0.0
            for e in losses:
                val = e.features.get(feat)
                if val is None or not isinstance(val, (int, float)):
                    continue
                z            = (float(val) - win_mean) / win_std
                lower_better = _LOWER_IS_BETTER.get(feat, True)
                blame        = max(0.0, z) if lower_better else max(0.0, -z)
                total_blame += blame

            blame_scores[feat] = total_blame
        except Exception:
            blame_scores[feat] = 0.0

    total = sum(blame_scores.values())
    if total < 1e-9:
        return {}
    return {f: v / total for f, v in blame_scores.items()}


# ==============================================================================
# DYNAMIC WEIGHT ADJUSTMENT — Constrained Gradient Descent
# ==============================================================================

_FEATURE_TO_PILLAR = {
    "p1_sp_siera":       "sp",
    "p1_sp_xfip":        "sp",
    "p2_wrc_plus_7d":    "offense",
    "p3_bullpen_era":    "bullpen",
    "p4_is_home":        "situational",
    "nrfi_xfip_1st_inn": "sp",
    "top3_wrc_plus_7d":  "offense",
}


def compute_dynamic_weights(
    attribution: dict[str, float],
    current_weights: Optional[dict[str, float]] = None,
) -> dict[str, float]:
    """
    Compute updated pillar weights via constrained gradient descent.
    Max ±CALIB_MAX_WEIGHT_DELTA per pillar. Weights normalized to sum=1.00.
    """
    if current_weights is None:
        current_weights = {
            "sp":          config.PILLAR_WEIGHT_SP,
            "offense":     config.PILLAR_WEIGHT_OFFENSE,
            "bullpen":     config.PILLAR_WEIGHT_BULLPEN,
            "situational": config.PILLAR_WEIGHT_SITUATIONAL,
        }
    if not attribution:
        return dict(current_weights)

    pillar_blame: dict[str, float] = {
        "sp": 0.0, "offense": 0.0, "bullpen": 0.0, "situational": 0.0
    }
    for feat, share in attribution.items():
        p = _FEATURE_TO_PILLAR.get(feat)
        if p:
            pillar_blame[p] += share

    lr    = config.CALIB_LEARNING_RATE
    delta = config.CALIB_MAX_WEIGHT_DELTA
    lo    = config.CALIB_MIN_PILLAR_WEIGHT
    hi    = config.CALIB_MAX_PILLAR_WEIGHT

    new_weights: dict[str, float] = {}
    for pillar, cur in current_weights.items():
        blame  = pillar_blame.get(pillar, 0.0)
        adjust = max(-delta, min(delta, -lr * blame))
        new_weights[pillar] = max(lo, min(hi, cur + adjust))

    total = sum(new_weights.values())
    if total > 1e-9:
        new_weights = {k: v / total for k, v in new_weights.items()}
    return new_weights


# ==============================================================================
# ACCURACY REPORTING
# ==============================================================================

def compute_accuracy(entries: list[BettingLogEntry]) -> dict:
    """Compute win-rate metrics over the last CALIB_LOOKBACK_BETS resolved bets."""
    resolved = [e for e in entries if e.result in ("WIN", "LOSS")]
    window   = resolved[-config.CALIB_LOOKBACK_BETS:]

    def _acc(subset: list) -> float:
        if not subset:
            return 0.0
        return sum(1 for e in subset if e.result == "WIN") / len(subset)

    return {
        "overall":     _acc(window),
        "moneyline":   _acc([e for e in window if e.bet_type == "MONEYLINE"]),
        "nrfi":        _acc([e for e in window if e.bet_type == "NRFI"]),
        "yrfi":        _acc([e for e in window if e.bet_type == "YRFI"]),
        "1st_inning":  _acc([e for e in window if e.bet_type in ("TEAM_U0.5", "TEAM_O0.5", "HCP_0")]),
        "sample_size": len(window),
    }


# ==============================================================================
# WEIGHTS OVERRIDE: LOAD / SAVE
# ==============================================================================

def load_weights_override() -> Optional[WeightsOverride]:
    _ensure_data_dir()
    if not _WTS_FILE.exists():
        return None
    try:
        with _WTS_FILE.open("r", encoding="utf-8") as fh:
            return WeightsOverride(**json.load(fh))
    except Exception as exc:
        logger.warning("Could not load weights override: %s", exc)
        return None


def save_weights_override(override: WeightsOverride) -> None:
    _ensure_data_dir()
    try:
        with _WTS_FILE.open("w", encoding="utf-8") as fh:
            json.dump(asdict(override), fh, indent=2)
    except Exception as exc:
        logger.warning("Could not save weights override: %s", exc)


# ==============================================================================
# MAIN ENTRY POINT: run_calibration_cycle()
# ==============================================================================

def run_calibration_cycle() -> CalibrationStatus:
    """
    Full calibration cycle called at startup in main.py:
      1. Load betting log
      2. Auto-resolve PENDING bets via StatsAPI (silent failures)
      3. Run post-mortem attribution
      4. Compute and save new dynamic weights (if sample >= CALIB_MIN_SAMPLE_SIZE)
      5. Return CalibrationStatus for CLI status bar display
    """
    entries = load_betting_log()

    try:
        entries = resolve_pending_bets(entries)
        save_betting_log(entries)
    except Exception as exc:
        logger.warning("Pending bet resolution failed: %s", exc)

    resolved    = [e for e in entries if e.result in ("WIN", "LOSS")]
    sample_size = len(resolved)
    is_cold     = sample_size < config.CALIB_MIN_SAMPLE_SIZE

    accuracy    = compute_accuracy(entries)
    attribution = run_post_mortem_attribution(entries)

    override = load_weights_override()
    if is_cold or not attribution:
        active_weights = {
            "sp":          config.PILLAR_WEIGHT_SP,
            "offense":     config.PILLAR_WEIGHT_OFFENSE,
            "bullpen":     config.PILLAR_WEIGHT_BULLPEN,
            "situational": config.PILLAR_WEIGHT_SITUATIONAL,
        }
    else:
        current     = override.weights if override else None
        new_weights = compute_dynamic_weights(attribution, current)
        active_weights = new_weights
        save_weights_override(WeightsOverride(
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            sample_size=sample_size,
            weights=new_weights,
            attribution_summary=attribution,
            accuracy_last_20=accuracy,
        ))
        logger.info(
            "Dynamic weights updated: SP=%.2f OFF=%.2f BP=%.2f SIT=%.2f",
            new_weights["sp"], new_weights["offense"],
            new_weights["bullpen"], new_weights["situational"],
        )

    return CalibrationStatus(
        is_cold_start=is_cold,
        sample_size=sample_size,
        min_sample=config.CALIB_MIN_SAMPLE_SIZE,
        active_weights=active_weights,
        accuracy_last_20=accuracy,
        attribution_summary=attribution,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
