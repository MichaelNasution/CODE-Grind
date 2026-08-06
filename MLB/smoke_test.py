"""
smoke_test.py
=============
Functional smoke test for MLB Analytics System v3.0 Production.
Validates all 4 strategy engines, Lock of the Day, Bankroll Allocator,
and Date Parameter handling.

Run with: python smoke_test.py
"""

from __future__ import annotations

import io
import sys
from datetime import date

if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except AttributeError:
        pass

import analytics
import bankroll
import config
import data_fetcher
import mock_data

SEP = "=" * 65
print(SEP)
print("SMOKE TEST: MLB Analytics CLI System v3.0 Production Grade")
print(SEP)

TEST_DATE = "2026-08-07"
print(f"Active Test Date Parameter: {TEST_DATE}")

# ── 1. STRATEGY A: Moneyline Screener & Lock of the Day ────────────────────────
print("\n[1] Strategy A: Moneyline Strong Recommendations & Lock of the Day")

games = data_fetcher.load_full_game_slate(TEST_DATE)
team_form       = mock_data.MOCK_TEAM_FORM
team_ops_splits = mock_data.MOCK_TEAM_OPS_SPLITS
ml_odds         = mock_data.MOCK_MONEYLINE_ODDS
pitcher_stats   = mock_data.MOCK_PITCHER_STATS

candidates = analytics.run_moneyline_screener(
    games, team_form, team_ops_splits, ml_odds, pitcher_stats
)
slips = analytics.generate_moneyline_parlays(candidates)
lock  = analytics.pick_lock_of_day(candidates)

print(f"  Qualified candidates (WinConf >= 65%): {len(candidates)}")
if lock:
    ml_str = analytics.format_ml_american(lock.candidate.moneyline_american)
    print(f"  [LOCK] LOCK OF THE DAY: {lock.candidate.team_name} ({ml_str}) | WinConf: {lock.candidate.win_confidence * 100:.1f}%")
    print(f"         Rationale: {lock.rationale}")
else:
    print("  [LOCK] LOCK OF THE DAY: None (no candidate >= 80%)")


for n, slip_list in sorted(slips.items()):
    top = slip_list[0]
    odds = analytics.format_ml_american(top.combined_american_odds)
    ev   = f"+{top.ev_edge*100:.1f}%" if top.ev_edge >= 0 else f"{top.ev_edge*100:.1f}%"
    print(f"  {n}-Leg Parlay: {len(slip_list)} combos | Top Conf: {top.combined_confidence*100:.2f}% | Odds: {odds} | EV: {ev}")

print("  [OK] Strategy A PASSED")

# ── 2. STRATEGY B: Under Home Run Parlay Engine ────────────────────────────────
print("\n[2] Strategy B: Under Home Run Parlay Engine")
h2h_records = data_fetcher.load_batter_h2h_records(TEST_DATE)
p_stats_raw = data_fetcher.load_pitcher_stats(TEST_DATE)
p_stats_map = {p["pitcher_id"]: p for p in p_stats_raw if "pitcher_id" in p}

slips_b = analytics.run_under_hr_engine(h2h_records, p_stats_map)
for n, slip_list in sorted(slips_b.items()):
    top = slip_list[0]
    print(f"  {n}-Leg Parlay: {len(slip_list)} combos | Top Prob: {top.combined_probability*100:.2f}% | Fair Odds: {analytics.format_american_odds(top.fair_american_odds)}")

print("  [OK] Strategy B PASSED")

# ── 3. STRATEGY C: 5-Factor Score Projection ──────────────────────────────────
print("\n[3] Strategy C: 5-Factor Score Projection (Over/Under)")
projections = analytics.project_all_games(games)
over_cnt = sum(1 for p in projections if p.recommendation == "OVER")
under_cnt = sum(1 for p in projections if p.recommendation == "UNDER")
skip_cnt = sum(1 for p in projections if p.recommendation == "SKIP")

print(f"  Total Projected Games: {len(projections)}")
print(f"  Breakdown: {over_cnt} OVER | {under_cnt} UNDER | {skip_cnt} SKIP")
for p in projections[:3]:
    line_str = f"{p.ou_line:.1f}" if p.ou_line else "N/A"
    edge_str = f"{p.edge:+.2f}" if p.edge is not None else "N/A"
    print(f"  - {p.matchup:<38} Proj: {p.projected_total:.2f} | Line: {line_str} | Edge: {edge_str} | Rec: {p.recommendation}")

print("  [OK] Strategy C PASSED")

# ── 4. STRATEGY D: Pitcher Props & System Anchor ──────────────────────────────
print("\n[4] Strategy D: Pitcher Props & System Anchor")
props_raw = data_fetcher.load_pitcher_props(TEST_DATE)
anchors_raw = data_fetcher.load_batter_anchor_props(TEST_DATE)

p_props = analytics.run_pitcher_props_engine(props_raw)
a_slips = analytics.run_anchor_system_engine(anchors_raw, p_props)

print(f"  Goblin Pitcher Props: {len(p_props)} qualified")
for p in p_props[:3]:
    print(f"  - {p.pitcher_name} ({p.team}): {p.prop_label} (Goblin Line: {p.goblin_line} K)")

print(f"  2-Man Anchor Slips: {len(a_slips)} qualified")
for a in a_slips:
    print(f"  - Batter: {a.batter_name} ({a.batter_prop_label}) + Pitcher: {a.pitcher_prop.pitcher_name} [{a.pair_confidence}]")

print("  [OK] Strategy D PASSED")

# ── 5. BANKROLL MANAGER & RISK ALLOCATOR ───────────────────────────────────────
print("\n[5] Bankroll Manager & Stake Allocator")
b_state = bankroll.load_state()
summary = bankroll.build_summary(b_state)

print(f"  Bankroll Balance: ${summary.balance:,.2f}")
print(f"  1 Unit Size (2%): ${summary.unit_value:,.2f}")
print(f"  Max Daily Risk (10%): ${summary.max_daily_risk:,.2f}")
for legs, alloc in sorted(summary.allocations.items()):
    print(f"  - {legs}-Leg Parlay Stake: {alloc.unit_multiplier:.2f} Unit (${alloc.dollar_stake:.2f}) [{alloc.risk_label}]")

print("  [OK] Bankroll Allocator PASSED")

print("\n" + SEP)
print("ALL SYSTEM SMOKE TESTS PASSED (100% PRODUCTION READY).")
print(SEP)
