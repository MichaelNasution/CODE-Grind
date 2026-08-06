"""
main.py
=======
Entry point for the MLB Analytics CLI System.

Responsibilities:
  - Centralised application lifecycle management
  - Main menu routing loop
  - Top-level exception handling
  - Graceful degradation on API failures
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
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler("mlb_analytics.log", encoding="utf-8"),
        # Deliberately NOT adding StreamHandler — rich handles console output
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Local module imports
# ---------------------------------------------------------------------------
import analytics
import bankroll
import cli_ui
import data_fetcher


# ==============================================================================
# MENU ACTION HANDLERS
# ==============================================================================

def action_under_hr_parlay() -> None:
    """
    Menu Option 1 — Under Home Run Parlay Screener.
    Fetches live data, runs Strategy A engine, displays results.
    """
    cli_ui.console.print()
    cli_ui.display_info("Fetching today's game slate and pitcher data…")

    try:
        # Load enriched game slate (with mock fallback)
        games = cli_ui.with_spinner(
            "Loading game slate & pitcher stats…",
            data_fetcher.load_full_game_slate,
        )

        # Load head-to-head batter records
        h2h_records = cli_ui.with_spinner(
            "Loading batter H2H records…",
            data_fetcher.load_all_h2h_candidates,
            games,
        )

        # Collect all pitcher stats referenced in H2H records
        pitcher_ids = list({r["pitcher_id"] for r in h2h_records if "pitcher_id" in r})
        pitcher_stats = cli_ui.with_spinner(
            "Fetching pitcher statistics…",
            data_fetcher.fetch_all_pitcher_stats,
            pitcher_ids,
        )

        # Also include pitchers from game slate but not in H2H
        for game in games:
            for key in ("home_sp", "away_sp"):
                sp = game.get(key)
                if sp and sp.get("pitcher_id") and sp["pitcher_id"] not in pitcher_stats:
                    pitcher_stats[sp["pitcher_id"]] = sp

        # Run Under HR engine
        slips_by_legs = analytics.run_under_hr_engine(h2h_records, pitcher_stats)

        # Load bankroll state for stake display
        br_state = bankroll.load_state()

        # Display results
        cli_ui.display_under_hr_results(slips_by_legs, br_state)

    except KeyboardInterrupt:
        cli_ui.console.print("\n[dim_text]Cancelled by user.[/]")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled error in Under HR engine.")
        cli_ui.display_error(f"Unexpected error: {exc}")

    cli_ui.press_enter_to_continue()


def action_score_projection() -> None:
    """
    Menu Option 2 — 5-Factor Score Projection.
    Fetches full enriched game data, runs Strategy B engine, displays table.
    """
    cli_ui.console.print()
    cli_ui.display_info("Fetching live game slate, pitcher, bullpen, and weather data…")

    try:
        games = cli_ui.with_spinner(
            "Loading full game slate with weather & odds…",
            data_fetcher.load_full_game_slate,
        )

        projections = cli_ui.with_spinner(
            "Running 5-Factor projection engine…",
            analytics.project_all_games,
            games,
        )

        cli_ui.display_score_projections(projections)

    except KeyboardInterrupt:
        cli_ui.console.print("\n[dim_text]Cancelled by user.[/]")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled error in Score Projection engine.")
        cli_ui.display_error(f"Unexpected error: {exc}")

    cli_ui.press_enter_to_continue()


def action_pitcher_props() -> None:
    """
    Menu Option 3 — Pitcher Props & Anchor System.
    Runs Strategy C engine, displays goblin props and anchor slips.
    """
    cli_ui.console.print()
    cli_ui.display_info("Loading pitcher prop and anchor system data…")

    try:
        raw_props = cli_ui.with_spinner(
            "Loading pitcher prop candidates…",
            data_fetcher.load_pitcher_props,
        )
        raw_anchors = cli_ui.with_spinner(
            "Loading batter anchor candidates…",
            data_fetcher.load_batter_anchor_props,
        )

        pitcher_props = analytics.run_pitcher_props_engine(raw_props)
        anchor_slips = analytics.run_anchor_system_engine(raw_anchors, pitcher_props)

        cli_ui.display_pitcher_props(pitcher_props, anchor_slips)

    except KeyboardInterrupt:
        cli_ui.console.print("\n[dim_text]Cancelled by user.[/]")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled error in Pitcher Props engine.")
        cli_ui.display_error(f"Unexpected error: {exc}")

    cli_ui.press_enter_to_continue()


def action_bankroll_manager() -> None:
    """
    Menu Option 4 — Bankroll Manager.
    Displays dashboard and routes to edit sub-menu.
    """
    cli_ui.console.print()
    try:
        cli_ui.display_bankroll_dashboard()
    except KeyboardInterrupt:
        cli_ui.console.print("\n[dim_text]Cancelled by user.[/]")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled error in Bankroll Manager.")
        cli_ui.display_error(f"Unexpected error: {exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# MAIN APPLICATION LOOP
# ==============================================================================

MENU_ACTIONS = {
    "1": action_under_hr_parlay,
    "2": action_score_projection,
    "3": action_pitcher_props,
    "4": action_bankroll_manager,
}


def run() -> None:
    """Main application entry point. Runs the interactive menu loop."""
    # Clear terminal for a clean start
    cli_ui.console.clear()

    # Print the animated banner
    cli_ui.print_banner()

    cli_ui.console.print(
        "[dim_text]  ⚠  For educational and entertainment purposes only."
        " Always gamble responsibly.[/]"
    )
    cli_ui.console.print()

    # Main menu loop
    while True:
        cli_ui.console.clear()
        cli_ui.print_banner()
        cli_ui.print_main_menu()

        try:
            choice = cli_ui.get_menu_choice()
        except KeyboardInterrupt:
            choice = "5"

        if choice == "5":
            cli_ui.display_exit_message()
            sys.exit(0)

        action = MENU_ACTIONS.get(choice)
        if action:
            cli_ui.console.clear()
            try:
                action()
            except SystemExit:
                raise
            except KeyboardInterrupt:
                cli_ui.console.print("\n[dim_text]Returning to main menu…[/]")
            except Exception as exc:  # noqa: BLE001
                logger.exception("Unhandled top-level error for choice=%s", choice)
                cli_ui.display_error(
                    f"A critical error occurred: {exc}\n"
                    "Check mlb_analytics.log for details."
                )
                cli_ui.press_enter_to_continue()


# ==============================================================================
# ENTRY POINT
# ==============================================================================

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        cli_ui.console.print("\n[dim_text]Exiting. Goodbye![/]\n")
        sys.exit(0)
    except Exception as fatal:  # noqa: BLE001
        # Last-resort fallback — show error without rich if it hasn't been imported
        print(f"\n[FATAL] Unhandled exception at startup:\n{traceback.format_exc()}")
        sys.exit(1)
