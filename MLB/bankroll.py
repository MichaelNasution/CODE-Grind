"""
bankroll.py
===========
Bankroll Management Engine for the MLB Analytics CLI System.

Handles:
  - Persistent bankroll storage (JSON file)
  - Daily risk budget calculation
  - Unit size computation
  - Per-slip stake allocation (in $ and units)
  - Risk classification display data
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, asdict
from datetime import date
from pathlib import Path
from typing import Any

import config

logger = logging.getLogger(__name__)

BANKROLL_FILE = Path(config.BANKROLL_FILE)


# ==============================================================================
# DATA MODEL
# ==============================================================================

@dataclass
class BankrollState:
    """Snapshot of the current bankroll state."""
    balance: float
    last_updated: str           # ISO date string
    daily_budget_used: float    # Amount already risked today
    budget_date: str            # Date for which daily_budget_used applies


@dataclass
class StakeAllocation:
    """Stake recommendation for a single parlay slip."""
    n_legs: int
    unit_multiplier: float      # e.g. 0.75 for 4-leg
    units_staked: float         # fractional units (same as unit_multiplier here)
    dollar_stake: float         # units_staked * unit_dollar_value
    unit_dollar_value: float    # value of 1 unit in $
    risk_label: str             # "Standard" / "Reduced" / "Lottery"


@dataclass
class BankrollSummary:
    """Full bankroll summary for display."""
    balance: float
    max_daily_risk: float
    remaining_daily_budget: float
    unit_value: float
    allocations: dict[int, StakeAllocation]  # leg_count -> allocation
    last_updated: str
    daily_budget_used: float


# ==============================================================================
# PERSISTENCE
# ==============================================================================

def _load_raw() -> dict:
    """Load raw JSON bankroll data from disk. Returns defaults on missing/corrupt file."""
    if not BANKROLL_FILE.exists():
        return _default_raw()
    try:
        with BANKROLL_FILE.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        # Validate required keys
        required = {"balance", "last_updated", "daily_budget_used", "budget_date"}
        if not required.issubset(data.keys()):
            logger.warning("Bankroll file missing keys — resetting to defaults.")
            return _default_raw()
        return data
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to load bankroll file: %s — using defaults.", exc)
        return _default_raw()


def _default_raw() -> dict:
    """Return a fresh default bankroll state dict."""
    today = date.today().isoformat()
    return {
        "balance": config.DEFAULT_BANKROLL,
        "last_updated": today,
        "daily_budget_used": 0.0,
        "budget_date": today,
    }


def _save_raw(data: dict) -> None:
    """Persist bankroll state to JSON file."""
    try:
        with BANKROLL_FILE.open("w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)
    except OSError as exc:
        logger.error("Failed to save bankroll: %s", exc)


def load_state() -> BankrollState:
    """Load bankroll state, resetting daily_budget_used if new day."""
    raw = _load_raw()
    today_str = date.today().isoformat()

    # Reset daily budget if it's a new day
    if raw.get("budget_date", "") != today_str:
        raw["daily_budget_used"] = 0.0
        raw["budget_date"] = today_str
        _save_raw(raw)

    return BankrollState(
        balance=float(raw.get("balance", config.DEFAULT_BANKROLL)),
        last_updated=str(raw.get("last_updated", today_str)),
        daily_budget_used=float(raw.get("daily_budget_used", 0.0)),
        budget_date=str(raw.get("budget_date", today_str)),
    )


def save_state(state: BankrollState) -> None:
    """Persist a BankrollState object to disk."""
    raw = {
        "balance": state.balance,
        "last_updated": state.last_updated,
        "daily_budget_used": state.daily_budget_used,
        "budget_date": state.budget_date,
    }
    _save_raw(raw)


# ==============================================================================
# CALCULATIONS
# ==============================================================================

def calc_unit_value(balance: float) -> float:
    """1 Unit = 2% of current bankroll."""
    return round(balance * config.UNIT_SIZE_PCT, 2)


def calc_max_daily_risk(balance: float) -> float:
    """Maximum daily risk = 10% of bankroll."""
    return round(balance * config.BANKROLL_DAILY_RISK_PCT, 2)


def calc_remaining_daily_budget(state: BankrollState) -> float:
    """Remaining daily budget = max_daily_risk - daily_budget_used."""
    max_risk = calc_max_daily_risk(state.balance)
    remaining = max_risk - state.daily_budget_used
    return round(max(0.0, remaining), 2)


def _risk_label(n_legs: int) -> str:
    """Human-readable risk classification for a parlay size."""
    labels = {
        3: "Standard",
        4: "Moderate",
        5: "Reduced",
        8: "Lottery",
        10: "Lottery",
    }
    return labels.get(n_legs, "Custom")


def calc_stake_allocations(state: BankrollState) -> dict[int, StakeAllocation]:
    """
    Calculate dollar stake recommendations for each supported parlay size.
    Returns mapping of leg_count -> StakeAllocation.
    """
    unit_val = calc_unit_value(state.balance)
    remaining = calc_remaining_daily_budget(state)
    allocations: dict[int, StakeAllocation] = {}

    for n_legs, unit_mult in config.PARLAY_UNIT_ALLOCATION.items():
        raw_stake = round(unit_mult * unit_val, 2)
        # Cap stake at remaining daily budget (prorated)
        # If remaining budget is less than this allocation, flag it
        dollar_stake = min(raw_stake, remaining) if remaining > 0 else 0.0

        allocations[n_legs] = StakeAllocation(
            n_legs=n_legs,
            unit_multiplier=unit_mult,
            units_staked=unit_mult,
            dollar_stake=dollar_stake,
            unit_dollar_value=unit_val,
            risk_label=_risk_label(n_legs),
        )

    return allocations


def build_summary(state: BankrollState) -> BankrollSummary:
    """Build a complete BankrollSummary from the current state."""
    max_daily = calc_max_daily_risk(state.balance)
    remaining = calc_remaining_daily_budget(state)
    unit_val = calc_unit_value(state.balance)
    allocations = calc_stake_allocations(state)

    return BankrollSummary(
        balance=state.balance,
        max_daily_risk=max_daily,
        remaining_daily_budget=remaining,
        unit_value=unit_val,
        allocations=allocations,
        last_updated=state.last_updated,
        daily_budget_used=state.daily_budget_used,
    )


# ==============================================================================
# MUTATION OPERATIONS
# ==============================================================================

def set_balance(new_balance: float) -> BankrollState:
    """
    Update the bankroll balance to a new value.
    Persists the change to disk.
    Returns the updated BankrollState.
    """
    if new_balance < 0:
        raise ValueError(f"Bankroll cannot be negative. Received: {new_balance}")

    state = load_state()
    state.balance = round(new_balance, 2)
    state.last_updated = date.today().isoformat()
    save_state(state)
    logger.info("Bankroll updated to $%.2f", state.balance)
    return state


def record_bet(amount: float) -> BankrollState:
    """
    Record a placed bet by adding the amount to daily_budget_used.
    Returns the updated state.
    """
    if amount < 0:
        raise ValueError("Bet amount cannot be negative.")

    state = load_state()
    state.daily_budget_used = round(state.daily_budget_used + amount, 2)
    save_state(state)
    return state


def record_win(net_profit: float) -> BankrollState:
    """
    Record a winning bet by adding net_profit to balance.
    Returns the updated state.
    """
    state = load_state()
    state.balance = round(state.balance + net_profit, 2)
    state.last_updated = date.today().isoformat()
    save_state(state)
    return state


def record_loss(amount: float) -> BankrollState:
    """
    Record a losing bet by subtracting the stake from balance.
    Returns the updated state.
    """
    state = load_state()
    state.balance = round(max(0.0, state.balance - amount), 2)
    state.last_updated = date.today().isoformat()
    save_state(state)
    return state


def reset_bankroll() -> BankrollState:
    """
    Reset bankroll to factory default ($1,000).
    Returns the fresh state.
    """
    if BANKROLL_FILE.exists():
        BANKROLL_FILE.unlink()
    return load_state()


def add_to_balance(amount: float) -> BankrollState:
    """
    Deposit an amount into the bankroll (top-up / reload).
    Returns the updated state.
    """
    if amount <= 0:
        raise ValueError("Deposit amount must be positive.")
    state = load_state()
    state.balance = round(state.balance + amount, 2)
    state.last_updated = date.today().isoformat()
    save_state(state)
    return state


def get_budget_utilization_pct(state: BankrollState) -> float:
    """Return how much of today's daily budget has been used (0.0 – 1.0)."""
    max_risk = calc_max_daily_risk(state.balance)
    if max_risk == 0:
        return 0.0
    return min(1.0, state.daily_budget_used / max_risk)
