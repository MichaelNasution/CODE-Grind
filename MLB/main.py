"""
main.py
=======
Entry point for the MLB Analytics CLI System.

Menu structure (v2 — Moneyline-first, Bankroll removed):
  1. Moneyline Strong Recommendations  (Strategy D)
  2. Under Home Run Parlay Screener    (Strategy A)
  3. 5-Factor Score Projection         (Strategy B + C)
  4. Exit
"""

from __future__ import annotations

import io
import logging
import sys
import traceback

# Force UTF-8 output on Windows to prevent codec errors with rich's Unicode symbols
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except AttributeError:
        pass  # In some environments stdout has no .buffer; ignore gracefully

# ---------------------------------------------------------------------------
# Configure logging BEFORE importing local modules
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Local module imports
# ---------------------------------------------------------------------------
import analytics
import cli_ui
import data_fetcher
import mock_data  # direct import for Moneyline-specific lookups


# ==============================================================================
# STRATEGY D — ACTION: Moneyline Strong Recommendations
# ==============================================================================

def action_moneyline_screener() -> None:
    """
    Strategy D: Moneyline Strong Recommendation Screener.

    Data pipeline:
      1. Load today's game slate (via data_fetcher → mock fallback).
      2. Load moneyline-specific datasets directly from mock_data.
         (In production these would be fetched via additional API calls.)
      3. Enrich games with pitcher stats.
      4. Run the Moneyline Screener analytics engine.
      5. Generate 3/4/5/8/10-leg parlay combinations.
      6. Display results via cli_ui.
    """
    cli_ui.console.print("\n[accent]Loading today's game slate + Moneyline data...[/]")

    try:
        # --- Step 1: Game slate + enriched pitcher data -------------------------
        games: list[dict] = cli_ui.with_spinner(
            "Fetching game slate...",
            data_fetcher.load_full_game_slate,
        )

        # --- Step 2: Load Moneyline-specific datasets ---------------------------
        # These are sourced from mock_data for now.
        # In live production mode these would be fetched from a Moneyline odds API.
        team_form       = mock_data.MOCK_TEAM_FORM
        team_ops_splits = mock_data.MOCK_TEAM_OPS_SPLITS
        ml_odds         = mock_data.MOCK_MONEYLINE_ODDS
        pitcher_stats   = mock_data.MOCK_PITCHER_STATS

        # --- Step 3: Run Moneyline screener ------------------------------------
        candidates = cli_ui.with_spinner(
            "Evaluating Win Confidence scores...",
            analytics.run_moneyline_screener,
            games, team_form, team_ops_splits, ml_odds, pitcher_stats,
        )

        # --- Step 4: Generate parlay slips -------------------------------------
        slips_by_legs = cli_ui.with_spinner(
            "Generating parlay combinations...",
            analytics.generate_moneyline_parlays,
            candidates,
        )

        # --- Step 5: Display ---------------------------------------------------
        cli_ui.display_moneyline_results(candidates, slips_by_legs)

    except Exception as exc:
        logger.exception("Moneyline screener error: %s", exc)
        cli_ui.display_error(
            f"An error occurred in the Moneyline Screener:\n{exc}\n\n"
            "Check the log for full traceback."
        )

    cli_ui.press_enter_to_continue()


# ==============================================================================
# STRATEGY A — ACTION: Under Home Run Parlay Screener
# ==============================================================================

def action_under_hr_screener() -> None:
    """
    Strategy A: Under Home Run Parlay Screener.

    Data pipeline:
      1. Load H2H records and pitcher stats.
      2. Run the Under HR parlay engine.
      3. Display results.
    """
    cli_ui.console.print("\n[accent]Loading H2H records and pitcher profiles...[/]")

    try:
        h2h_records: list[dict] = cli_ui.with_spinner(
            "Fetching batter H2H data...",
            data_fetcher.load_batter_h2h_records,
        )
        pitcher_stats_raw: list[dict] = cli_ui.with_spinner(
            "Fetching pitcher stats...",
            data_fetcher.load_pitcher_stats,
        )
        pitcher_stats: dict[int, dict] = {
            p["pitcher_id"]: p for p in pitcher_stats_raw if "pitcher_id" in p
        }

        slips_by_legs = cli_ui.with_spinner(
            "Running Under HR engine...",
            analytics.run_under_hr_engine,
            h2h_records, pitcher_stats,
        )

        cli_ui.display_under_hr_results(slips_by_legs)

    except Exception as exc:
        logger.exception("Under HR screener error: %s", exc)
        cli_ui.display_error(f"An error occurred:\n{exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# STRATEGY B+C — ACTION: 5-Factor Score Projection + Props
# ==============================================================================

def action_score_projection() -> None:
    """
    Strategy B: 5-Factor Score Projection (Over/Under).
    Strategy C: Pitcher Props Goblin + Anchor System.

    Data pipeline:
      1. Load enriched game slate.
      2. Project all games.
      3. Load and run Pitcher Props engine.
      4. Run Anchor Slip engine.
      5. Display results.
    """
    cli_ui.console.print("\n[accent]Loading game data for score projection...[/]")

    try:
        games: list[dict] = cli_ui.with_spinner(
            "Fetching game slate (pitchers + weather + lines)...",
            data_fetcher.load_full_game_slate,
        )
        projections: list[analytics.GameProjection] = cli_ui.with_spinner(
            "Running 5-Factor Score Projection...",
            analytics.project_all_games,
            games,
        )
        pitcher_props_raw: list[dict] = cli_ui.with_spinner(
            "Loading pitcher props...",
            data_fetcher.load_pitcher_props,
        )
        batter_anchor_raw: list[dict] = cli_ui.with_spinner(
            "Loading batter anchor props...",
            data_fetcher.load_batter_anchor_props,
        )
        pitcher_props = analytics.run_pitcher_props_engine(pitcher_props_raw)
        anchor_slips  = analytics.run_anchor_system_engine(batter_anchor_raw, pitcher_props)

        cli_ui.display_score_projections(projections)
        cli_ui.display_pitcher_props(pitcher_props, anchor_slips)

    except Exception as exc:
        logger.exception("Score projection error: %s", exc)
        cli_ui.display_error(f"An error occurred:\n{exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# MENU ROUTING
# ==============================================================================

MENU_ACTIONS: dict[str, object] = {
    "1": action_moneyline_screener,
    "2": action_under_hr_screener,
    "3": action_score_projection,
    "4": None,   # Exit
}


# ==============================================================================
# MAIN LOOP
# ==============================================================================

def main() -> None:
    cli_ui.print_banner()

    while True:
        try:
            cli_ui.print_main_menu()
            choice = cli_ui.get_menu_choice()

            if choice == "4":
                cli_ui.display_exit_message()
                sys.exit(0)

            action = MENU_ACTIONS.get(choice)
            if callable(action):
                cli_ui.console.clear()
                cli_ui.print_banner()
                action()
            else:
                cli_ui.display_error(f"Unrecognised choice: {choice}")

        except KeyboardInterrupt:
            cli_ui.console.print("\n[dim_text]Interrupted by user.[/]")
            cli_ui.display_exit_message()
            sys.exit(0)
        except Exception as exc:
            cli_ui.display_error(f"Unexpected error: {exc}")
            logger.critical("Unhandled exception in main loop: %s", traceback.format_exc())


if __name__ == "__main__":
    main()
