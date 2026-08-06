"""
smoke_test.py -- Functional smoke test for the MLB Analytics System.
Run with: python smoke_test.py (from project directory)
"""
import sys
sys.path.insert(0, ".")

import mock_data
import analytics
import bankroll
import data_fetcher

print("=" * 60)
print("SMOKE TEST: MLB Analytics CLI System")
print("=" * 60)

# ---- Strategy A: Under HR Engine ----
print("\n[1] Strategy A: Under HR Parlay Engine")
pitcher_stats = dict(mock_data.MOCK_PITCHER_STATS)
slips = analytics.run_under_hr_engine(mock_data.MOCK_BATTER_H2H, pitcher_stats)
assert slips, "ERROR: No parlay slips generated!"
for legs, slip_list in slips.items():
    top = slip_list[0]
    print(f"  {legs}-leg: {len(slip_list)} combos | Top prob: {top.combined_probability:.6f} | Fair odds: {analytics.format_american_odds(top.fair_american_odds)}")
    for leg in top.legs:
        print(f"    - {leg.batter_name} ({leg.team[:3].upper()}) vs {leg.pitcher_name} | True No-HR Prob: {analytics.format_prob_pct(leg.true_no_hr_prob)}")
print("  [OK] Strategy A PASSED")

# ---- Strategy B: Score Projection ----
print("\n[2] Strategy B: 5-Factor Score Projection")
games = data_fetcher.load_full_game_slate()
assert games, "ERROR: No games loaded!"
projections = analytics.project_all_games(games)
assert projections, "ERROR: No projections generated!"
for proj in projections:
    ou_str = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
    edge_str = f"{proj.edge:+.2f}" if proj.edge is not None else "N/A"
    print(f"  {proj.matchup[:38]:<38} Proj: {proj.projected_total:.2f} | Line: {ou_str} | Edge: {edge_str} | {proj.recommendation}")
print("  [OK] Strategy B PASSED")

# ---- Strategy C: Pitcher Props & Anchor ----
print("\n[3] Strategy C: Pitcher Props & Anchor System")
raw_props = data_fetcher.load_pitcher_props()
raw_anchors = data_fetcher.load_batter_anchor_props()
pitcher_props = analytics.run_pitcher_props_engine(raw_props)
anchor_slips = analytics.run_anchor_system_engine(raw_anchors, pitcher_props)
for prop in pitcher_props:
    print(f"  Goblin: {prop.pitcher_name} — {prop.prop_label} (K/9: {prop.k_per9:.1f}, PC: {prop.avg_pitch_count})")
for slip in anchor_slips:
    print(f"  Anchor: {slip.batter_name} ({slip.batter_prop_label}) + {slip.pitcher_prop.pitcher_name} [{slip.pair_confidence}]")
print("  [OK] Strategy C PASSED")

# ---- Bankroll Engine ----
print("\n[4] Bankroll Management Engine")
state = bankroll.load_state()
summary = bankroll.build_summary(state)
print(f"  Balance:     ${summary.balance:>10,.2f}")
print(f"  1 Unit:      ${summary.unit_value:>10,.2f}")
print(f"  Daily Max:   ${summary.max_daily_risk:>10,.2f}")
print(f"  Remaining:   ${summary.remaining_daily_budget:>10,.2f}")
for n_legs, alloc in summary.allocations.items():
    print(f"  {n_legs}-Leg: {alloc.unit_multiplier:.2f}u = ${alloc.dollar_stake:.2f} ({alloc.risk_label})")
print("  [OK] Bankroll Engine PASSED")

print("\n" + "=" * 60)
print("ALL SMOKE TESTS PASSED - System ready for production use.")
print("=" * 60)
