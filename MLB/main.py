"""
main.py
=======
Entry point for the MLB Analytics CLI System v3.

Menu structure (7 Options):
  1. Moneyline Strong Recommendations & Parlays (3, 4, 5, 8, 10 Legs + Lock of Day)
  2. Under Home Run Parlay Screener (3, 4, 5, 8, 10 Legs)
  3. 5-Factor Score Projection (Over/Under Total Runs)
  4. Pitcher Props & Anchor / Goblin Systems
  5. Bankroll Manager & Daily Risk Status
  6. Ganti Tanggal Analisis (Change Date)
  7. Exit
"""

from __future__ import annotations

import io
import logging
import sys
import traceback
from dataclasses import dataclass

# Force UTF-8 output on Windows to prevent codec errors with rich Unicode symbols
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except AttributeError:
        pass

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Local module imports
import analytics
import bankroll
import cli_ui
import data_fetcher
import mock_data


@dataclass
class AppState:
    """Global application state."""
    analysis_date: str
    bankroll_state: bankroll.BankrollState


# ==============================================================================
# ACTION 1: MONEYLINE STRONG RECOMMENDATIONS & LOCK OF THE DAY
# ==============================================================================

def action_moneyline_screener(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Loading slate & Moneyline data for {state.analysis_date}...[/]")

    try:
        games: list[dict] = cli_ui.with_spinner(
            f"Fetching game slate for {state.analysis_date}...",
            data_fetcher.load_full_game_slate,
            state.analysis_date,
        )

        team_form       = mock_data.MOCK_TEAM_FORM
        team_ops_splits = mock_data.MOCK_TEAM_OPS_SPLITS
        ml_odds         = mock_data.MOCK_MONEYLINE_ODDS
        pitcher_stats   = mock_data.MOCK_PITCHER_STATS

        candidates = cli_ui.with_spinner(
            "Evaluating Win Confidence scores...",
            analytics.run_moneyline_screener,
            games, team_form, team_ops_splits, ml_odds, pitcher_stats,
        )

        slips_by_legs = cli_ui.with_spinner(
            "Generating Moneyline parlay combinations...",
            analytics.generate_moneyline_parlays,
            candidates,
        )

        lock_of_day = analytics.pick_lock_of_day(candidates)
        summary = bankroll.build_summary(state.bankroll_state)

        cli_ui.display_moneyline_results(candidates, slips_by_legs, lock_of_day, summary)

    except Exception as exc:
        logger.exception("Moneyline screener error: %s", exc)
        cli_ui.display_error(f"An error occurred in the Moneyline Screener:\n{exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# ACTION 2: UNDER HOME RUN PARLAY SCREENER
# ==============================================================================

def action_under_hr_screener(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Loading H2H records & pitchers for {state.analysis_date}...[/]")

    try:
        h2h_records: list[dict] = cli_ui.with_spinner(
            "Fetching batter H2H records...",
            data_fetcher.load_batter_h2h_records,
            state.analysis_date,
        )
        pitcher_stats_raw: list[dict] = cli_ui.with_spinner(
            "Fetching pitcher stats...",
            data_fetcher.load_pitcher_stats,
            state.analysis_date,
        )
        pitcher_stats: dict[int, dict] = {
            p["pitcher_id"]: p for p in pitcher_stats_raw if "pitcher_id" in p
        }

        slips_by_legs = cli_ui.with_spinner(
            "Running Under HR engine...",
            analytics.run_under_hr_engine,
            h2h_records, pitcher_stats,
        )

        summary = bankroll.build_summary(state.bankroll_state)
        cli_ui.display_under_hr_results(slips_by_legs, summary)

    except Exception as exc:
        logger.exception("Under HR screener error: %s", exc)
        cli_ui.display_error(f"An error occurred:\n{exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# ACTION 3: 5-FACTOR SCORE PROJECTION (O/U)
# ==============================================================================

def action_score_projection(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Loading game data & weather for {state.analysis_date}...[/]")

    try:
        games: list[dict] = cli_ui.with_spinner(
            f"Fetching game slate for {state.analysis_date}...",
            data_fetcher.load_full_game_slate,
            state.analysis_date,
        )
        projections: list[analytics.GameProjection] = cli_ui.with_spinner(
            "Running 5-Factor Score Projection...",
            analytics.project_all_games,
            games,
        )

        cli_ui.display_score_projections(projections)

    except Exception as exc:
        logger.exception("Score projection error: %s", exc)
        cli_ui.display_error(f"An error occurred:\n{exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# ACTION 4: PITCHER PROPS & SYSTEM ANCHOR
# ==============================================================================

def action_pitcher_props(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Loading pitcher props & batter anchors...[/]")

    try:
        pitcher_props_raw: list[dict] = cli_ui.with_spinner(
            "Loading pitcher props...",
            data_fetcher.load_pitcher_props,
            state.analysis_date,
        )
        batter_anchor_raw: list[dict] = cli_ui.with_spinner(
            "Loading batter anchor props...",
            data_fetcher.load_batter_anchor_props,
            state.analysis_date,
        )
        pitcher_props = analytics.run_pitcher_props_engine(pitcher_props_raw)
        anchor_slips  = analytics.run_anchor_system_engine(batter_anchor_raw, pitcher_props)

        summary = bankroll.build_summary(state.bankroll_state)
        cli_ui.display_pitcher_props(pitcher_props, anchor_slips, summary)

    except Exception as exc:
        logger.exception("Props error: %s", exc)
        cli_ui.display_error(f"An error occurred:\n{exc}")

    cli_ui.press_enter_to_continue()


# ==============================================================================
# ACTION 5: BANKROLL MANAGER
# ==============================================================================

def action_bankroll_manager(state: AppState) -> None:
    summary = bankroll.build_summary(state.bankroll_state)
    cli_ui.display_bankroll_dashboard(summary)
    state.bankroll_state = cli_ui.bankroll_edit_menu(state.bankroll_state)
    cli_ui.press_enter_to_continue()


# ==============================================================================
# ACTION 6: CHANGE ANALYSIS DATE
# ==============================================================================

def action_change_date(state: AppState) -> None:
    new_date = cli_ui.prompt_date_selection()
    state.analysis_date = new_date
    cli_ui.console.print(f"[green_bright]Analysis date updated to {state.analysis_date}[/]")
    cli_ui.press_enter_to_continue()


# ==============================================================================
# MAIN LOOP
# ==============================================================================

def main() -> None:
    cli_ui.print_banner()

    # Initial Date Selection Prompt
    initial_date = cli_ui.prompt_date_selection()
    b_state = bankroll.load_state()

    app_state = AppState(analysis_date=initial_date, bankroll_state=b_state)

    while True:
        try:
            cli_ui.console.clear()
            cli_ui.print_banner()
            cli_ui.display_analysis_header(app_state.analysis_date)
            cli_ui.print_main_menu()

            choice = cli_ui.get_menu_choice()

            if choice == "1":
                cli_ui.console.clear()
                cli_ui.print_banner()
                cli_ui.display_analysis_header(app_state.analysis_date)
                action_moneyline_screener(app_state)
            elif choice == "2":
                cli_ui.console.clear()
                cli_ui.print_banner()
                cli_ui.display_analysis_header(app_state.analysis_date)
                action_under_hr_screener(app_state)
            elif choice == "3":
                cli_ui.console.clear()
                cli_ui.print_banner()
                cli_ui.display_analysis_header(app_state.analysis_date)
                action_score_projection(app_state)
            elif choice == "4":
                cli_ui.console.clear()
                cli_ui.print_banner()
                cli_ui.display_analysis_header(app_state.analysis_date)
                action_pitcher_props(app_state)
            elif choice == "5":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_bankroll_manager(app_state)
            elif choice == "6":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_change_date(app_state)
            elif choice == "7":
                cli_ui.display_exit_message()
                sys.exit(0)

        except KeyboardInterrupt:
            cli_ui.console.print("\n[dim_text]Interrupted by user.[/]")
            cli_ui.display_exit_message()
            sys.exit(0)
        except Exception as exc:
            cli_ui.display_error(f"Unexpected error: {exc}")
            logger.critical("Unhandled exception in main loop: %s", traceback.format_exc())


if __name__ == "__main__":
    main()
