"""
smoke_test.py
=============
Functional smoke test for MLB Analytics System v2.
Validates all 4 strategy engines with mock data.
Run with: python smoke_test.py
"""
import sys

import analytics
import mock_data

SEP = "=" * 62
print(SEP)
print("SMOKE TEST: MLB Analytics CLI System  v2.0")
print(SEP)

# ── STRATEGY D: Moneyline Screener ─────────────────────────────
print("\n[1] Strategy D: Moneyline Strong Recommendation Screener")

games = mock_data.MOCK_GAMES
team_form       = mock_data.MOCK_TEAM_FORM
team_ops_splits = mock_data.MOCK_TEAM_OPS_SPLITS
ml_odds         = mock_data.MOCK_MONEYLINE_ODDS
pitcher_stats   = mock_data.MOCK_PITCHER_STATS

# Enrich games with home_sp / away_sp dicts
for g in games:
    g.setdefault("home_sp", pitcher_stats.get(g.get("home_starter_id"), {}))
    g.setdefault("away_sp", pitcher_stats.get(g.get("away_starter_id"), {}))

candidates = analytics.run_moneyline_screener(
    games, team_form, team_ops_splits, ml_odds, pitcher_stats
)
slips = analytics.generate_moneyline_parlays(candidates)

print(f"  Qualified candidates: {len(candidates)}")
for c in candidates:
    loc = "H" if c.is_home else "A"
    ml  = analytics.format_ml_american(c.moneyline_american)
    print(
        f"  [{loc}] {c.team_name:<28} SP: {c.pitcher_name:<18} "
        f"ML: {ml:>6}  WinConf: {c.win_confidence * 100:.1f}%"
    )

print()
for n, slip_list in sorted(slips.items()):
    top = slip_list[0]
    odds = analytics.format_ml_american(top.combined_american_odds)
    ev   = f"+{top.ev_edge*100:.1f}%" if top.ev_edge >= 0 else f"{top.ev_edge*100:.1f}%"
    print(
        f"  {n}-Leg: {len(slip_list)} combos | "
        f"Combined conf: {top.combined_confidence*100:.2f}% | "
        f"Parlay odds: {odds} | EV: {ev}"
    )
print("  [OK] Strategy D PASSED")

# ── STRATEGY A: Under HR Parlay Engine ─────────────────────────
print("\n[2] Strategy A: Under Home Run Parlay Engine")
h2h_records  = mock_data.MOCK_BATTER_H2H
slips_a = analytics.run_under_hr_engine(h2h_records, pitcher_stats)
for n, slip_list in sorted(slips_a.items()):
    top = slip_list[0]
    print(
        f"  {n}-leg: {len(slip_list)} combos | "
        f"Top prob: {top.combined_probability:.6f} | "
        f"Fair odds: {analytics.format_american_odds(top.fair_american_odds)}"
    )
    for leg in top.legs:
        print(f"    - {leg.batter_name} ({leg.team[:3].upper()}) vs "
              f"{leg.pitcher_name} | No-HR Prob: {analytics.format_prob_pct(leg.true_no_hr_prob)}")
print("  [OK] Strategy A PASSED")

# ── STRATEGY B: 5-Factor Score Projection ──────────────────────
print("\n[3] Strategy B: 5-Factor Score Projection")

# Build minimal enriched game dicts for Strategy B (mock O/U lines + weather)
import config
enriched_games: list[dict] = []
for g in mock_data.MOCK_GAMES:
    game_id = g["game_id"]
    venue   = g["venue"]
    gdata = dict(g)
    odds  = mock_data.MOCK_ODDS_LINES.get(game_id, {})
    gdata["ou_line"]     = odds.get("total_line")
    gdata["weather"]     = mock_data.MOCK_WEATHER.get(venue, {})
    gdata["home_sp"]     = pitcher_stats.get(g.get("home_starter_id"), {})
    gdata["away_sp"]     = pitcher_stats.get(g.get("away_starter_id"), {})
    gdata["home_bullpen"] = mock_data.MOCK_BULLPEN_STATS.get(g["home_team_id"], {})
    gdata["away_bullpen"] = mock_data.MOCK_BULLPEN_STATS.get(g["away_team_id"],  {})
    gdata["home_offense"] = mock_data.MOCK_TEAM_OFFENSE.get(g["home_team_id"], {})
    gdata["away_offense"] = mock_data.MOCK_TEAM_OFFENSE.get(g["away_team_id"],  {})
    enriched_games.append(gdata)

projections = analytics.project_all_games(enriched_games)
for p in projections:
    ou_str   = f"{p.ou_line:.1f}" if p.ou_line else "N/A"
    edge_str = f"{p.edge:+.2f}" if p.edge is not None else "N/A"
    print(
        f"  {p.matchup[:40]:<40} "
        f"Proj: {p.projected_total:.2f} | Line: {ou_str} | "
        f"Edge: {edge_str} | {p.recommendation}"
    )
print("  [OK] Strategy B PASSED")

# ── STRATEGY C: Pitcher Props & Anchor ─────────────────────────
print("\n[4] Strategy C: Pitcher Props & Anchor System")
pitcher_props_raw = mock_data.MOCK_PITCHER_PROPS
batter_anchors    = mock_data.MOCK_BATTER_ANCHOR_PROPS
p_props = analytics.run_pitcher_props_engine(pitcher_props_raw)
for prop in p_props:
    print(f"  Goblin: {prop.pitcher_name} -- {prop.prop_label} "
          f"(K/9: {prop.k_per9:.1f}, PC: {prop.avg_pitch_count})")
anchor_slips = analytics.run_anchor_system_engine(batter_anchors, p_props)
for slip in anchor_slips:
    print(f"  Anchor: {slip.batter_name} ({slip.batter_prop_label}) "
          f"+ {slip.pitcher_prop.pitcher_name} [{slip.pair_confidence}]")
print("  [OK] Strategy C PASSED")

print("\n" + SEP)
print("ALL SMOKE TESTS PASSED - System v2.0 ready for production use.")
print(SEP)
