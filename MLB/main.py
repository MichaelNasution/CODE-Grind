"""
main.py
=======
Entry point for the MLB Analytics CLI System v4.0.

10 Menu Options:
  1. 🚀 Ultimate Slate-Wide Moneyline Slip (Seluruh Matchday + 15-Leg Slip)
  2. 🏆 Strong Moneyline Recommendations & Parlays (3, 4, 5, 8, 10 + Lock)
  3. 🎯 Under 0.5 Home Run Parlays (Slips 3, 4, 5, 8, 10 Legs)
  4. ⚾ Under 1.5 Hits Screener (Single Bets vs 2-Team Parlays)
  5. 🔥 Alternate Team Total Over 1.5 Runs Screener
  6. 🎯 At-Bat Outcome "Out or Error" Targets ($100/day system)
  7. 📊 5-Factor Total Score Projection (Over/Under)
  8. 🔄 4-Day Historical Calibration Engine Log
  9. 💰 Bankroll Status & Line Shopping Prices
  10. 📅 Ganti Tanggal Analisis / Keluar
"""

from __future__ import annotations

import io
import logging
import sys
import traceback
from dataclasses import dataclass

if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except AttributeError:
        pass

logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

import analytics
import bankroll
import cli_ui
import data_fetcher
import mock_data


@dataclass
class AppState:
    analysis_date: str
    bankroll_state: bankroll.BankrollState
    is_live_data: bool = True
    calib_report: analytics.CalibrationReport | None = None


# ==============================================================================
# MENU ACTIONS
# ==============================================================================

def action_ultimate_slate(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Loading full 15-match slate for {state.analysis_date}...[/]")
    try:
        games, is_live, line_shopping = cli_ui.with_spinner(
            "Fetching game slate & line shopping...",
            data_fetcher.load_full_game_slate,
            state.analysis_date,
        )
        state.is_live_data = is_live

        candidates = analytics.run_moneyline_screener(
            games, mock_data.MOCK_TEAM_FORM, mock_data.MOCK_TEAM_OPS_SPLITS,
            mock_data.MOCK_MONEYLINE_ODDS, mock_data.MOCK_PITCHER_STATS,
            is_live, line_shopping, state.calib_report,
        )
        ultimate_slip = analytics.generate_ultimate_slate_slip(candidates)
        summary = bankroll.build_summary(state.bankroll_state)

        cli_ui.display_ultimate_slate_slip(ultimate_slip, summary)
    except Exception as exc:
        logger.exception("Ultimate slate error: %s", exc)
        cli_ui.display_error(f"Error generating ultimate slate:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_moneyline_screener(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Evaluating Moneyline picks for {state.analysis_date}...[/]")
    try:
        games, is_live, line_shopping = cli_ui.with_spinner(
            "Fetching games & odds...",
            data_fetcher.load_full_game_slate,
            state.analysis_date,
        )
        state.is_live_data = is_live

        candidates = analytics.run_moneyline_screener(
            games, mock_data.MOCK_TEAM_FORM, mock_data.MOCK_TEAM_OPS_SPLITS,
            mock_data.MOCK_MONEYLINE_ODDS, mock_data.MOCK_PITCHER_STATS,
            is_live, line_shopping, state.calib_report,
        )
        slips_by_legs = analytics.generate_moneyline_parlays(candidates)
        lock_of_day = analytics.pick_lock_of_day(candidates)
        summary = bankroll.build_summary(state.bankroll_state)

        cli_ui.display_moneyline_results(candidates, slips_by_legs, lock_of_day, summary, is_live)
    except Exception as exc:
        logger.exception("Moneyline error: %s", exc)
        cli_ui.display_error(f"Error in Moneyline screener:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_under_hr_screener(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Running Under 0.5 HR Screener for {state.analysis_date}...[/]")
    try:
        h2h_records = data_fetcher.load_batter_h2h_records(state.analysis_date)
        pitcher_stats = {p["pitcher_id"]: p for p in data_fetcher.load_pitcher_stats(state.analysis_date)}
        slips_by_legs = analytics.run_under_hr_engine(h2h_records, pitcher_stats)
        summary = bankroll.build_summary(state.bankroll_state)

        cli_ui.display_under_hr_results(slips_by_legs, summary)
    except Exception as exc:
        logger.exception("Under HR error: %s", exc)
        cli_ui.display_error(f"Error:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_under_1_5_hits(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Running Under 1.5 Hits Screener...[/]")
    try:
        h2h_records = data_fetcher.load_batter_h2h_records(state.analysis_date)
        recs = analytics.run_under_1_5_hits_screener(h2h_records)

        cli_ui.display_under_1_5_hits(recs)
    except Exception as exc:
        logger.exception("Under 1.5 Hits error: %s", exc)
        cli_ui.display_error(f"Error:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_alternate_team_total(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Running Alternate Team Total Over 1.5 Runs Screener...[/]")
    try:
        games, is_live, _ = data_fetcher.load_full_game_slate(state.analysis_date)
        cands = analytics.run_alternate_team_total_screener(games)

        cli_ui.display_alternate_team_total(cands)
    except Exception as exc:
        logger.exception("Alternate Team Total error: %s", exc)
        cli_ui.display_error(f"Error:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_at_bat_outcome(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Evaluating At-Bat Outcome 'Out or Error' Targets...[/]")
    try:
        h2h_records = data_fetcher.load_batter_h2h_records(state.analysis_date)
        targets = analytics.run_at_bat_outcome_screener(h2h_records)

        cli_ui.display_at_bat_outcome_targets(targets)
    except Exception as exc:
        logger.exception("At-Bat Outcome error: %s", exc)
        cli_ui.display_error(f"Error:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_score_projection(state: AppState) -> None:
    cli_ui.console.print(f"\n[accent]Running 5-Factor Score Projection...[/]")
    try:
        games, is_live, _ = data_fetcher.load_full_game_slate(state.analysis_date)
        projections = analytics.project_all_games(games)

        cli_ui.display_score_projections(projections)
    except Exception as exc:
        logger.exception("Score projection error: %s", exc)
        cli_ui.display_error(f"Error:\n{exc}")
    cli_ui.press_enter_to_continue()


def action_calibration_log(state: AppState) -> None:
    if state.calib_report:
        cli_ui.display_calibration_log(state.calib_report)
    else:
        cli_ui.display_error("No 4-day historical calibration report available.")
    cli_ui.press_enter_to_continue()


def action_bankroll_manager(state: AppState) -> None:
    summary = bankroll.build_summary(state.bankroll_state)
    cli_ui.display_bankroll_dashboard(summary)
    cli_ui.press_enter_to_continue()


def action_change_date(state: AppState) -> None:
    new_date = cli_ui.prompt_date_selection()
    state.analysis_date = new_date

    lookback_data = data_fetcher.fetch_4day_lookback_data(new_date)
    state.calib_report = analytics.calibrate_model_weights(lookback_data)

    cli_ui.console.print(f"[green_bright]Analysis date updated to {state.analysis_date}[/]")
    cli_ui.press_enter_to_continue()


# ==============================================================================
# MAIN LOOP
# ==============================================================================

def main() -> None:
    cli_ui.print_banner()

    initial_date = cli_ui.prompt_date_selection()
    b_state = bankroll.load_state()

    # Run 4-Day Historical Calibration Engine upon initialization
    lookback_data = data_fetcher.fetch_4day_lookback_data(initial_date)
    calib_report  = analytics.calibrate_model_weights(lookback_data)

    app_state = AppState(
        analysis_date=initial_date,
        bankroll_state=b_state,
        calib_report=calib_report,
    )

    while True:
        try:
            cli_ui.console.clear()
            cli_ui.print_banner()
            cli_ui.display_analysis_header(app_state.analysis_date, app_state.is_live_data)
            cli_ui.print_main_menu()

            choice = cli_ui.get_menu_choice()

            if choice == "1":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_ultimate_slate(app_state)
            elif choice == "2":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_moneyline_screener(app_state)
            elif choice == "3":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_under_hr_screener(app_state)
            elif choice == "4":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_under_1_5_hits(app_state)
            elif choice == "5":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_alternate_team_total(app_state)
            elif choice == "6":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_at_bat_outcome(app_state)
            elif choice == "7":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_score_projection(app_state)
            elif choice == "8":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_calibration_log(app_state)
            elif choice == "9":
                cli_ui.console.clear()
                cli_ui.print_banner()
                action_bankroll_manager(app_state)
            elif choice == "10":
                cli_ui.display_exit_message()
                sys.exit(0)

        except KeyboardInterrupt:
            cli_ui.display_exit_message()
            sys.exit(0)
        except Exception as exc:
            cli_ui.display_error(f"Unexpected error: {exc}")
            logger.critical("Unhandled exception: %s", traceback.format_exc())


if __name__ == "__main__":
    main()
