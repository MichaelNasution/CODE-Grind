"""
cli_ui.py
=========
Minimalist, responsive Rich UI layout v4.1.
Enforces strict column bounds (max 90 chars table width), `no_wrap=True`, `overflow="ellipsis"`,
and clear screen hierarchy.
"""

from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any

from rich import box
from rich.align import Align
from rich.console import Console
from rich.markup import escape
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.prompt import Prompt
from rich.rule import Rule
from rich.table import Table
from rich.text import Text
from rich.theme import Theme

import analytics
import bankroll

MLB_THEME = Theme({
    "header":       "bold bright_white on #0a1628",
    "accent":       "bold #00d4ff",
    "gold":         "bold #ffd700",
    "green_bright": "bold #00ff88",
    "red_bright":   "bold #ff4444",
    "orange":       "bold #ff8c00",
    "dim_text":     "dim #aaaaaa",
    "panel_border": "#1a4a8a",
    "table_header": "bold #00d4ff on #0f1e35",
})

console = Console(theme=MLB_THEME, highlight=False)


def clear_screen() -> None:
    """Clear terminal screen for clean layout rendering."""
    console.clear()


def print_banner() -> None:
    console.print(Align.center(Text("⚾  MLB QUANTITATIVE ANALYTICS ENGINE  |  v4.1", style="bold #00d4ff")))
    console.print(Align.center(Text("Capped 68% Moneyline · 4-Day Calibration · Line Shopping · 5-Props Suite", style="dim #6699cc")))
    console.print()


def display_analysis_header(date_str: str, is_live_data: bool = True) -> None:
    dt_obj = date.fromisoformat(date_str)
    day_name = dt_obj.strftime("%A")

    header_text = Text()
    header_text.append("📅 Date: ", style="bold dim_text")
    header_text.append(f"{day_name[:3]}, {date_str}", style="bold gold")

    if is_live_data:
        header_text.append("  |  [LIVE VERIFIED]", style="bold green_bright")
    else:
        header_text.append("  |  [MOCK / UNVERIFIED]", style="bold orange")

    console.print(Align.center(Panel(header_text, border_style="panel_border" if is_live_data else "orange", padding=(0, 2))))
    console.print()


def print_rule(title: str = "") -> None:
    console.print(Rule(title, style="#1a4a8a", characters="─"))


def make_progress() -> Progress:
    return Progress(
        SpinnerColumn(spinner_name="dots", style="accent"),
        TextColumn("[accent]{task.description}"),
        BarColumn(bar_width=25, style="#1a4a8a", complete_style="#00d4ff"),
        TimeElapsedColumn(),
        console=console,
        transient=True,
    )


def with_spinner(description: str, fn, *args, **kwargs):
    with make_progress() as progress:
        progress.add_task(description, total=None)
        result = fn(*args, **kwargs)
    return result


def prompt_date_selection() -> str:
    clear_screen()
    print_banner()

    today_dt = date.today()
    tomorrow_dt = today_dt + timedelta(days=1)
    today_str = today_dt.strftime("%Y-%m-%d")
    tomorrow_str = tomorrow_dt.strftime("%Y-%m-%d")

    menu_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    menu_table.add_column("Key", style="gold", width=4)
    menu_table.add_column("Option", style="bold white")
    menu_table.add_column("Date", style="accent")

    menu_table.add_row("A", "Hari Ini (Today)", today_str)
    menu_table.add_row("B", "Besok (Tomorrow)", tomorrow_str)
    menu_table.add_row("C", "Custom Date", "Format: YYYY-MM-DD")

    console.print(Panel(menu_table, title="[gold]📅  SELECT ANALYSIS DATE[/]", border_style="panel_border", padding=(1, 2)))

    choice = Prompt.ask("\n[accent]Select option[/]", choices=["A", "a", "B", "b", "C", "c"], default="A").upper()

    if choice == "A":
        return today_str
    elif choice == "B":
        return tomorrow_str
    else:
        while True:
            custom_input = Prompt.ask("[gold]Enter date (YYYY-MM-DD)[/]")
            if re.match(r"^\d{4}-\d{2}-\d{2}$", custom_input):
                try:
                    date.fromisoformat(custom_input)
                    return custom_input
                except ValueError:
                    console.print("[red_bright]Invalid calendar date.[/]")
            else:
                console.print("[red_bright]Use format YYYY-MM-DD.[/]")


def print_main_menu() -> None:
    table = Table(show_header=False, box=box.SIMPLE, padding=(0, 1))
    table.add_column("Num", style="gold", width=3)
    table.add_column("Strategy / Option", style="bold white")

    items = [
        ("1", "🚀  Ultimate Slate-Wide Moneyline Slip  (Full Matchday + 15-Leg Slip)"),
        ("2", "🏆  Strong Moneyline & Parlays  (Top Picks, Lock & Slips 3, 4, 5)"),
        ("3", "🎯  Under 0.5 Home Run Parlays  (Win Rate 90% | Slips 3, 4, 5, 8, 10 Legs)"),
        ("4", "⚾  Under 1.5 Hits Screener  (Win Rate 70%+ | Single Bets vs 2-Team Parlays)"),
        ("5", "🔥  Alternate Team Total Over 1.5 Runs Screener  (Win Rate 90%)"),
        ("6", "🎯  At-Bat Outcome 'Out or Error' Targets  ($100/Day Flat Stake System)"),
        ("7", "📊  5-Factor Total Score Projection  (Over / Under Total Runs)"),
        ("8", "🔄  4-Day Historical Calibration Engine Log  (H-4 to H-1 Performance)"),
        ("9", "💰  Bankroll Status & Sportsbook Line Shopping Prices"),
        ("10", "📅  Ganti Tanggal Analisis / Keluar  (Change Date / Exit)"),
    ]
    for num, opt in items:
        table.add_row(num, opt)

    console.print(Panel(table, title="[gold]⚾  MAIN MENU — MLB ANALYTICS V4.1[/]", border_style="panel_border", padding=(0, 2)))


def get_menu_choice() -> str:
    return Prompt.ask("\n[accent]Select option[/]", choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], show_choices=True)


# ==============================================================================
# MENU 1: ULTIMATE SLATE-WIDE MONEYLINE SLIP
# ==============================================================================

def display_ultimate_slate_slip(slip: analytics.MoneylineSlip | None, bankroll_summary: bankroll.BankrollSummary | None) -> None:
    clear_screen()
    print_banner()
    print_rule("🚀  ULTIMATE SLATE-WIDE MONEYLINE SLIP (15-LEG TEST LUCK)")

    if not slip:
        console.print("[red_bright]Not enough candidate games to build full slate slip.[/]")
        return

    alloc = bankroll_summary.allocations.get(15) if bankroll_summary else None
    stake_str = f"Stake: 0.25 Unit (${alloc.dollar_stake:.2f})" if alloc else "Stake: 0.25 Unit"

    summary_panel = (
        f"[gold]15-Match Slate Slip Summary[/]  [dim_text]({stake_str})[/]\n"
        f"Combined Decimal Odds: [bold gold]{slip.combined_decimal_odds:,.2f}x[/]  ({analytics.format_american_odds(slip.combined_american_odds)})\n"
        f"Combined Win Prob: [accent]{slip.combined_confidence * 100:.6f}%[/]  |  Book Implied: [dim_text]{slip.implied_probability * 100:.6f}%[/]"
    )
    console.print(Panel(summary_panel, border_style="panel_border", padding=(0, 2)))

    table = Table(
        title="[gold]Matchday Picks (1 Per Match)[/]",
        box=box.SIMPLE, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False,
    )
    table.add_column("#", justify="center", width=3, no_wrap=True)
    table.add_column("Pick", style="bold white", width=18, no_wrap=True, overflow="ellipsis")
    table.add_column("Matchup", style="dim_text", width=18, no_wrap=True, overflow="ellipsis")
    table.add_column("ML Odds", justify="center", width=8, no_wrap=True)
    table.add_column("Book", justify="center", style="accent", width=11, no_wrap=True)
    table.add_column("Win%", justify="center", width=8, no_wrap=True)

    for idx, leg in enumerate(slip.legs, start=1):
        loc = "H" if leg.is_home else "A"
        ml_str = analytics.format_american_odds(leg.best_line_american)
        table.add_row(
            str(idx),
            f"{escape(leg.team_name[:14])} ({loc})",
            f"vs {escape(leg.opponent_team[:12])}",
            f"[gold]{ml_str}[/]",
            escape(leg.best_sportsbook[:10]),
            f"[green_bright]{leg.win_confidence * 100:.1f}%[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 2: MONEYLINE PICKS & COMPACT PARLAYS
# ==============================================================================

def display_moneyline_results(
    candidates: list[analytics.MoneylineCandidate],
    slips_by_legs: dict[int, list[analytics.MoneylineSlip]],
    lock_of_day: analytics.LockOfDay | None,
    bankroll_summary: bankroll.BankrollSummary | None,
    is_live_data: bool = True,
) -> None:
    clear_screen()
    print_banner()
    print_rule("🏆  STRONG MONEYLINE RECOMMENDATIONS & PARLAYS")

    # A. LOCK OF THE DAY PANEL
    if lock_of_day and is_live_data:
        cand = lock_of_day.candidate
        ml_str = analytics.format_american_odds(cand.best_line_american)
        unit_val = bankroll_summary.unit_value if bankroll_summary else 20.00
        console.print(Panel(
            f"🔒 [bold green_bright]LOCK OF THE DAY: {escape(cand.team_name)}[/] ([gold]{ml_str}[/] @ [accent]{cand.best_sportsbook}[/])\n"
            f"Starter: {escape(cand.pitcher_name[:16])} (WHIP: {cand.our_whip:.2f} | L3 ERA: {cand.last3_era:.2f})  |  Win Conf: [bold green_bright]{cand.win_confidence * 100:.1f}%[/]\n"
            f"Recommended Stake: [gold]1.00 Unit (${unit_val:.2f})[/]",
            border_style="green_bright", padding=(0, 2),
        ))
        console.print()

    # B. COMPACT MONEYLINE TABLE (TOP 5-7 PICKS)
    top_picks = candidates[:7]
    cand_table = Table(
        title="[gold]Top Moneyline Picks (Ranked by Win Conf %)[/]",
        box=box.SIMPLE, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False,
    )
    cand_table.add_column("Rank", justify="center", width=4, no_wrap=True)
    cand_table.add_column("Team", style="bold white", width=18, no_wrap=True, overflow="ellipsis")
    cand_table.add_column("SP", style="accent", width=16, no_wrap=True, overflow="ellipsis")
    cand_table.add_column("ML Odds", justify="center", width=8, no_wrap=True)
    cand_table.add_column("WHIP", justify="center", width=6, no_wrap=True)
    cand_table.add_column("Win%", justify="center", width=7, no_wrap=True)
    cand_table.add_column("Signal", justify="center", width=12, no_wrap=True)

    for idx, cand in enumerate(top_picks, start=1):
        loc = "H" if cand.is_home else "A"
        ml_str   = analytics.format_american_odds(cand.best_line_american)
        conf_str = f"{cand.win_confidence * 100:.1f}%"
        signal_str = "[bold green_bright]STRONG[/]" if cand.is_strong_recommendation else "[dim_text]PASS[/]"

        cand_table.add_row(
            str(idx),
            f"{escape(cand.team_name[:14])} ({loc})",
            escape(cand.pitcher_name[:14]),
            f"[gold]{ml_str}[/]",
            f"{cand.our_whip:.2f}",
            f"[green_bright]{conf_str}[/]" if cand.win_confidence >= 0.60 else f"{conf_str}",
            signal_str,
        )

    console.print(cand_table)
    console.print()

    # C. COMPACT PARLAY SLIPS PANEL
    parlay_text = Text()
    parlay_text.append("🎯 RECOMMENDED PARLAY SLIPS SUMMARY\n", style="bold gold")

    for legs_cnt in [3, 4, 5]:
        slips = slips_by_legs.get(legs_cnt, [])
        if slips:
            top_s = slips[0]
            leg_teams = " + ".join([escape(l.team_name[:10]) for l in top_s.legs])
            odds_str  = analytics.format_american_odds(top_s.combined_american_odds)
            parlay_text.append(f"• {legs_cnt}-Leg Slip ({odds_str}): ", style="bold accent")
            parlay_text.append(f"{leg_teams} ", style="white")
            parlay_text.append(f"[{top_s.combined_confidence * 100:.1f}% Conf]\n", style="green_bright")

    console.print(Panel(parlay_text, border_style="panel_border", padding=(0, 2)))
    console.print()


# ==============================================================================
# MENU 3: UNDER 0.5 HOME RUN PARLAYS
# ==============================================================================

def display_under_hr_results(slips_by_legs: dict[int, list[analytics.UnderHRParlaySlip]], bankroll_summary: bankroll.BankrollSummary | None) -> None:
    clear_screen()
    print_banner()
    print_rule("🎯  UNDER 0.5 HOME RUN PARLAY SCREENER (WIN RATE 90%)")

    if not slips_by_legs:
        console.print("[dim_text]No qualifying candidates clearing strict HR criteria today.[/]")
        return

    for n_legs in [3, 4, 5]:
        slips = slips_by_legs.get(n_legs, [])
        if not slips:
            continue

        alloc = bankroll_summary.allocations.get(n_legs) if bankroll_summary else None
        stake_info = f"Stake: {alloc.unit_multiplier:.2f} Unit (${alloc.dollar_stake:.2f})" if alloc else ""

        table = Table(
            title=f"[gold]{n_legs}-Leg Under HR Slips[/]  [dim_text]({stake_info})[/]",
            box=box.SIMPLE, border_style="panel_border", header_style="table_header",
            padding=(0, 1), show_lines=False,
        )
        table.add_column("#", justify="center", width=3, no_wrap=True)
        table.add_column("Batter", style="bold white", width=18, no_wrap=True, overflow="ellipsis")
        table.add_column("Pitcher", style="accent", width=16, no_wrap=True, overflow="ellipsis")
        table.add_column("Prob%", justify="center", width=8, no_wrap=True)
        table.add_column("Fair Odds", justify="center", style="gold", width=10, no_wrap=True)

        for idx, slip in enumerate(slips[:2], start=1):
            for leg in slip.legs:
                table.add_row(
                    str(idx),
                    escape(leg.batter_name[:16]),
                    escape(leg.pitcher_name[:14]),
                    f"{leg.true_no_hr_prob*100:.1f}%",
                    f"{analytics.format_american_odds(slip.fair_american_odds)}",
                )
        console.print(table)
        console.print()


# ==============================================================================
# MENU 4: UNDER 1.5 HITS SCREENER
# ==============================================================================

def display_under_1_5_hits(recs: list[analytics.Under15HitsRecommendation]) -> None:
    clear_screen()
    print_banner()
    print_rule("⚾  UNDER 1.5 HITS SCREENER (WIN RATE 70%+)")

    if not recs:
        console.print("[dim_text]No qualifying batters found for Under 1.5 Hits today.[/]")
        return

    table = Table(
        title="[gold]Top Qualified Batters (Max 8 Rows)[/]",
        box=box.SIMPLE, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False,
    )
    table.add_column("#", justify="center", width=3, no_wrap=True)
    table.add_column("Batter", style="bold white", width=18, no_wrap=True, overflow="ellipsis")
    table.add_column("Opp Pitcher", style="accent", width=16, no_wrap=True, overflow="ellipsis")
    table.add_column("BA vs SP", justify="center", width=10, no_wrap=True)
    table.add_column("Prob%", justify="center", width=8, no_wrap=True)
    table.add_column("Bet Recommendation", justify="center", style="green_bright", width=18, no_wrap=True)

    for idx, r in enumerate(recs[:8], start=1):
        table.add_row(
            str(idx),
            escape(r.batter_name[:16]),
            escape(r.opponent_pitcher[:14]),
            f".{int(r.batting_avg_vs_sp * 1000):03d} ({r.at_bats_vs_sp}AB)",
            f"{r.seasonal_prob * 100:.0f}%",
            f"[green_bright]{r.bet_type}[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 5: ALTERNATE TEAM TOTAL OVER 1.5 RUNS
# ==============================================================================

def display_alternate_team_total(cands: list[analytics.AlternateTeamTotalCandidate]) -> None:
    clear_screen()
    print_banner()
    print_rule("🔥  ALTERNATE TEAM TOTAL OVER 1.5 RUNS (WIN RATE 90%)")

    if not cands:
        console.print("[dim_text]No teams cleared all 4 strict criteria for Over 1.5 Team Total today.[/]")
        return

    table = Table(
        title="[gold]Qualified Teams (Max 8 Rows)[/]",
        box=box.SIMPLE, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False,
    )
    table.add_column("Team", style="bold white", width=16, no_wrap=True, overflow="ellipsis")
    table.add_column("RPG / HR/G", justify="center", width=12, no_wrap=True)
    table.add_column("Opp SP", style="accent", width=14, no_wrap=True, overflow="ellipsis")
    table.add_column("SP ERA / HR9", justify="center", width=12, no_wrap=True)
    table.add_column("Recommendation", justify="center", style="green_bright", width=16, no_wrap=True)

    for c in cands[:8]:
        table.add_row(
            escape(c.team_name[:14]),
            f"{c.runs_per_game:.1f} / {c.hr_per_game:.1f}",
            escape(c.opp_starter_name[:12]),
            f"{c.opp_starter_era:.2f} / {c.opp_starter_hr9:.1f}",
            "[bold green_bright]OVER 1.5 RUNS[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 6: AT-BAT OUTCOME "OUT OR ERROR" TARGETS
# ==============================================================================

def display_at_bat_outcome_targets(targets: list[analytics.AtBatOutcomeTarget]) -> None:
    clear_screen()
    print_banner()
    print_rule("🎯  AT-BAT OUTCOME 'OUT OR ERROR' TARGETS ($100/DAY SYSTEM)")

    if not targets:
        console.print("[dim_text]No qualifying DFS matchup targets today.[/]")
        return

    table = Table(
        title="[gold]Top Target Batters (Flat Stake +115 to +130 Odds)[/]",
        box=box.SIMPLE, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False,
    )
    table.add_column("#", justify="center", width=3, no_wrap=True)
    table.add_column("Batter", style="bold white", width=18, no_wrap=True, overflow="ellipsis")
    table.add_column("Opp DFS SP", style="accent", width=16, no_wrap=True, overflow="ellipsis")
    table.add_column("H2H BA", justify="center", width=8, no_wrap=True)
    table.add_column("K%", justify="center", width=6, no_wrap=True)
    table.add_column("Recommendation", style="green_bright", width=22, no_wrap=True)

    for idx, t in enumerate(targets[:5], start=1):
        table.add_row(
            str(idx),
            escape(t.batter_name[:16]),
            escape(t.opponent_pitcher[:14]),
            f".{int(t.batting_avg_vs_sp * 1000):03d}",
            f"{t.strikeout_pct * 100:.0f}%",
            "[green_bright]Out or Error (+115 to +130)[/]",
        )

    console.print(table)
    console.print("[dim_text]Note: Flat Stake bet; Re-bet 2nd half if SP remains.[/]")
    console.print()


# ==============================================================================
# MENU 7: 5-FACTOR SCORE PROJECTION
# ==============================================================================

def display_score_projections(projections: list[analytics.GameProjection]) -> None:
    clear_screen()
    print_banner()
    print_rule("📊  5-FACTOR SCORE PROJECTION ENGINE (OVER/UNDER)")

    table = Table(
        title="[gold]Game Totals Projections (Max 8 Rows)[/]",
        box=box.SIMPLE, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False,
    )
    table.add_column("Matchup", style="bold white", width=24, no_wrap=True, overflow="ellipsis")
    table.add_column("Line", justify="center", width=6, no_wrap=True)
    table.add_column("Proj", justify="center", style="accent", width=7, no_wrap=True)
    table.add_column("Edge", justify="center", width=8, no_wrap=True)
    table.add_column("Rec", justify="center", width=10, no_wrap=True)

    for proj in projections[:8]:
        book_line = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
        edge_str  = f"{proj.edge:+.2f}" if proj.edge is not None else "N/A"
        rec_st    = {"OVER": "over", "UNDER": "under", "SKIP": "skip"}.get(proj.recommendation, "white")

        table.add_row(
            escape(proj.matchup[:22]),
            book_line,
            f"{proj.projected_total:.2f}",
            edge_str,
            f"[{rec_st}]{proj.recommendation}[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 8: 4-DAY HISTORICAL CALIBRATION LOG
# ==============================================================================

def display_calibration_log(report: analytics.CalibrationReport) -> None:
    clear_screen()
    print_banner()
    print_rule("🔄  4-DAY HISTORICAL CALIBRATION ENGINE LOG")

    summary_panel = (
        f"[gold]Model Calibration Status (H-4 to H-1)[/]\n"
        f"Analyzed: [bold white]{report.total_games_analyzed} Matches[/]  |  Error Rate: [accent]{report.avg_error_rate * 100:.1f}%[/]\n"
        f"Calibrated Weights -> Pitcher: [gold]{report.calibrated_pitcher_weight:.2f}[/] | Form: {report.calibrated_form_weight:.2f} | OPS: {report.calibrated_ops_weight:.2f}"
    )
    console.print(Panel(summary_panel, border_style="panel_border", padding=(0, 2)))

    table = Table(title="[gold]Historical Logs[/]", box=box.SIMPLE, border_style="panel_border", padding=(0, 1))
    table.add_column("Log Entry", style="dim_text", width=70, no_wrap=True)
    for entry in report.calibration_log:
        table.add_row(entry[:68])

    console.print(table)
    console.print()


# ==============================================================================
# MENU 9: BANKROLL DASHBOARD
# ==============================================================================

def display_bankroll_dashboard(summary: bankroll.BankrollSummary) -> None:
    clear_screen()
    print_banner()
    print_rule("💰  BANKROLL STATUS & LINE SHOPPING PRICES")

    table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    table.add_column("Metric", style="bold white", width=24)
    table.add_column("Value", style="gold", justify="right", width=14)

    table.add_row("Total Bankroll Balance", f"${summary.balance:,.2f}")
    table.add_row("1 Unit Size (2.0%)", f"${summary.unit_value:,.2f}")
    table.add_row("Max Daily Risk (10.0%)", f"${summary.max_daily_risk:,.2f}")
    table.add_row("Daily Budget Risked", f"${summary.daily_budget_used:,.2f}")
    table.add_row("Remaining Daily Budget", f"${summary.remaining_daily_budget:,.2f}")

    console.print(Panel(table, title="[gold]🏦 Bankroll Status[/]", border_style="panel_border", padding=(0, 2)))
    console.print()


def display_error(message: str) -> None:
    console.print(Panel(f"[red_bright]{escape(message)}[/]", border_style="red", padding=(0, 2)))


def press_enter_to_continue() -> None:
    console.print("\n[dim_text]Press Enter to return to main menu...[/]")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        pass


def display_exit_message() -> None:
    console.print("\n[gold]Thank you for using MLB Analytics System. Bet responsibly.[/]\n")
