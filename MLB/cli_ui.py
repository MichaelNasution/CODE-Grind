"""
cli_ui.py
=========
Minimalist, elegant CLI interface using the `rich` library v4.0.

Provides rendering for:
  1. Ultimate Slate-Wide Moneyline (Seluruh Matchday + 15-Leg Test Luck Slip)
  2. Strong Moneyline Recommendations, Line Shopping & Parlay Slips
  3. Under 0.5 Home Run Parlays (3, 4, 5, 8, 10 Legs)
  4. Under 1.5 Hits Screener (Single Bets vs 2-Team Parlays)
  5. Alternate Team Total Over 1.5 Runs Screener
  6. At-Bat Outcome "Out or Error" Targets ($100/day system)
  7. 5-Factor Score Projection Engine (Over/Under)
  8. 4-Day Historical Calibration Engine Log
  9. Bankroll Status & Line Shopping Prices
  10. Active Date Selection & Clean Header
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

# ==============================================================================
# CONSOLE THEME
# ==============================================================================
MLB_THEME = Theme({
    "header":       "bold bright_white on #0a1628",
    "accent":       "bold #00d4ff",
    "gold":         "bold #ffd700",
    "green_bright": "bold #00ff88",
    "red_bright":   "bold #ff4444",
    "orange":       "bold #ff8c00",
    "dim_text":     "dim #aaaaaa",
    "over":         "bold green on #0d2614",
    "under":        "bold red on #260d0d",
    "skip":         "dim #888888",
    "high_prob":    "bold #00ff88",
    "med_prob":     "bold #ffd700",
    "low_prob":     "bold #ff8c00",
    "panel_border": "#1a4a8a",
    "table_header": "bold #00d4ff on #0f1e35",
    "ev_pos":       "bold bright_green",
    "ev_neg":       "bold #ff6666",
})

console = Console(theme=MLB_THEME, highlight=False)


# ==============================================================================
# BANNER & HEADER
# ==============================================================================

def print_banner() -> None:
    console.print()
    console.print(Align.center(Text(
        "⚾  MLB QUANTITATIVE ANALYTICS ENGINE  |  v4.0 Production Grade",
        style="bold #00d4ff",
    )))
    console.print(Align.center(Text(
        "4-Day Calibration Engine  ·  Line Shopping  ·  5-Props Suite  ·  Capped 68% Moneyline",
        style="dim #6699cc",
    )))
    console.print()


def display_analysis_header(date_str: str, is_live_data: bool = True) -> None:
    dt_obj = date.fromisoformat(date_str)
    day_name = dt_obj.strftime("%A")

    header_text = Text()
    header_text.append("📅 Active Date: ", style="bold dim_text")
    header_text.append(f"{day_name}, {date_str}", style="bold gold")

    if is_live_data:
        header_text.append("  |  [LIVE ODDS VERIFIED]", style="bold green_bright")
    else:
        header_text.append("  |  [DATA UNVERIFIED / MOCK]", style="bold orange")

    console.print(Align.center(Panel(
        header_text,
        border_style="panel_border" if is_live_data else "orange",
        padding=(0, 2),
    )))
    console.print()


def print_rule(title: str = "") -> None:
    console.print(Rule(title, style="#1a4a8a", characters="─"))


def make_progress() -> Progress:
    return Progress(
        SpinnerColumn(spinner_name="dots", style="accent"),
        TextColumn("[accent]{task.description}"),
        BarColumn(bar_width=30, style="#1a4a8a", complete_style="#00d4ff"),
        TimeElapsedColumn(),
        console=console,
        transient=True,
    )


def with_spinner(description: str, fn, *args, **kwargs):
    with make_progress() as progress:
        progress.add_task(description, total=None)
        result = fn(*args, **kwargs)
    return result


# ==============================================================================
# DATE SELECTION PROMPT
# ==============================================================================

def prompt_date_selection() -> str:
    today_dt = date.today()
    tomorrow_dt = today_dt + timedelta(days=1)

    today_str = today_dt.strftime("%Y-%m-%d")
    tomorrow_str = tomorrow_dt.strftime("%Y-%m-%d")

    menu_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    menu_table.add_column("Key", style="gold", width=5)
    menu_table.add_column("Option", style="bold white")
    menu_table.add_column("Date", style="accent")

    menu_table.add_row("A", "Hari Ini (Today)", today_str)
    menu_table.add_row("B", "Besok (Tomorrow)", tomorrow_str)
    menu_table.add_row("C", "Custom Date", "Format: YYYY-MM-DD")

    console.print(Panel(
        menu_table,
        title="[gold]📅  SELECT ANALYSIS DATE[/]",
        border_style="panel_border",
        padding=(1, 2),
    ))

    choice = Prompt.ask(
        "\n[accent]Select option[/]",
        choices=["A", "a", "B", "b", "C", "c"],
        default="A",
    ).upper()

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


# ==============================================================================
# MAIN MENU (10 Options)
# ==============================================================================

def print_main_menu() -> None:
    table = Table(show_header=False, box=box.SIMPLE, padding=(0, 1))
    table.add_column("Num", style="gold", width=4)
    table.add_column("Strategy / Option", style="bold white")

    items = [
        ("1", "🚀  Ultimate Slate-Wide Moneyline Slip  (Full Matchday + 15-Leg Slip)"),
        ("2", "🏆  Strong Moneyline Recommendations & Parlays  (Slips 3, 4, 5, 8, 10 + Lock)"),
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

    console.print(Panel(
        table,
        title="[gold]⚾  MAIN MENU — MLB ANALYTICS V4.0[/]",
        border_style="panel_border",
        padding=(1, 2),
    ))


def get_menu_choice() -> str:
    return Prompt.ask(
        "\n[accent]Select option[/]",
        choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        show_choices=True,
    )


# ==============================================================================
# MENU 1: ULTIMATE SLATE-WIDE MONEYLINE SLIP
# ==============================================================================

def display_ultimate_slate_slip(slip: analytics.MoneylineSlip | None, bankroll_summary: bankroll.BankrollSummary | None) -> None:
    print_rule("🚀  ULTIMATE SLATE-WIDE MONEYLINE SLIP (15-LEG TEST LUCK SLIP)")
    console.print()

    if not slip:
        console.print("[red_bright]Not enough candidate games to build full slate slip.[/]")
        return

    alloc = bankroll_summary.allocations.get(15) if bankroll_summary else None
    stake_str = f"Stake: 0.25 Unit (${alloc.dollar_stake:.2f})" if alloc else "Stake: 0.25 Unit (High Var / Test Luck)"

    table = Table(
        title=f"[gold]Ultimate Matchday Slate Slip — {slip.n_legs} Matches Total[/]  [dim_text]({stake_str})[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    table.add_column("#", justify="center", width=4)
    table.add_column("Pick (Team)", style="white", min_width=22)
    table.add_column("Matchup", style="dim_text", min_width=20)
    table.add_column("Best Odds", justify="center", min_width=10)
    table.add_column("Sportsbook", justify="center", style="accent", min_width=12)
    table.add_column("Win Conf", justify="center", min_width=10)

    for idx, leg in enumerate(slip.legs, start=1):
        loc = "H" if leg.is_home else "A"
        ml_str = analytics.format_american_odds(leg.best_line_american)
        table.add_row(
            str(idx),
            f"[bold white]{escape(leg.team_name)}[/] [dim_text]({loc})[/]",
            f"vs {escape(leg.opponent_team[:16])}",
            f"[gold]{ml_str}[/]",
            escape(leg.best_sportsbook),
            f"[green_bright]{leg.win_confidence * 100:.1f}%[/]",
        )

    console.print(table)
    console.print()

    payout_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    payout_table.add_column("Metric", style="bold white")
    payout_table.add_column("Value", style="gold")

    payout_table.add_row("Combined Decimal Odds", f"{slip.combined_decimal_odds:,.2f}x")
    payout_table.add_row("Combined American Odds", analytics.format_american_odds(slip.combined_american_odds))
    payout_table.add_row("Combined Win Probability", f"{slip.combined_confidence * 100:.6f}%")
    payout_table.add_row("Book Implied Probability", f"{slip.implied_probability * 100:.6f}%")

    console.print(Panel(
        payout_table,
        title="[gold]🎰  Ultimate Mega Parlay Odds Summary[/]",
        border_style="panel_border", padding=(1, 2),
    ))
    console.print()


# ==============================================================================
# MENU 2: STRONG MONEYLINE RECOMMENDATIONS
# ==============================================================================

def display_moneyline_results(
    candidates: list[analytics.MoneylineCandidate],
    slips_by_legs: dict[int, list[analytics.MoneylineSlip]],
    lock_of_day: analytics.LockOfDay | None,
    bankroll_summary: bankroll.BankrollSummary | None,
    is_live_data: bool = True,
) -> None:
    print_rule("🏆  STRONG MONEYLINE RECOMMENDATIONS & PARLAY SLIPS")
    console.print()

    if lock_of_day and is_live_data:
        cand = lock_of_day.candidate
        ml_str = analytics.format_american_odds(cand.best_line_american)
        unit_val = bankroll_summary.unit_value if bankroll_summary else 20.00
        console.print(Panel(
            f"[bold green_bright]Lock Pick: {escape(cand.team_name)} ({ml_str} @ {cand.best_sportsbook})[/]\n"
            f"Starter: [accent]{escape(cand.pitcher_name)}[/] (WHIP: {cand.our_whip:.2f} | L3 ERA: {cand.last3_era:.2f})\n"
            f"Win Conf: [bold green_bright]{cand.win_confidence * 100:.1f}%[/] | Recommended Stake: [gold]1.00 Unit (${unit_val:.2f})[/]\n"
            f"[dim_text]Rationale: {escape(lock_of_day.rationale)}[/]",
            title="[bold white on #b30000] 🔒 LOCK OF THE DAY / MUST-WIN SLIP [/]",
            border_style="green_bright", padding=(1, 2),
        ))
        console.print()

    cand_table = Table(
        title="[gold]🎯 Evaluated Moneyline Picks (Win Confidence Capped 50% - 68%)[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    cand_table.add_column("#", justify="center", width=4)
    cand_table.add_column("Team", style="white", min_width=20)
    cand_table.add_column("Starter", style="accent", min_width=16)
    cand_table.add_column("Best Line", justify="center", min_width=10)
    cand_table.add_column("Book", justify="center", style="gold", min_width=10)
    cand_table.add_column("ERA Adv", justify="center", min_width=8)
    cand_table.add_column("WHIP", justify="center", min_width=7)
    cand_table.add_column("L3 ERA", justify="center", min_width=8)
    cand_table.add_column("Win Conf", justify="center", min_width=10)
    cand_table.add_column("Signal", justify="center", min_width=14)

    for idx, cand in enumerate(candidates, start=1):
        loc = "H" if cand.is_home else "A"
        era_sign = "+" if cand.era_advantage >= 0 else ""
        ml_str   = analytics.format_american_odds(cand.best_line_american)
        conf_str = f"{cand.win_confidence * 100:.1f}%"

        l3_style = "red_bright" if cand.last3_era > 4.50 else ("green_bright" if cand.last3_era <= 3.20 else "white")
        signal_str = "[bold green_bright]STRONG PICK[/]" if cand.is_strong_recommendation else "[dim_text]NEUTRAL[/]"

        cand_table.add_row(
            str(idx),
            f"{escape(cand.team_name)} ({loc})",
            escape(cand.pitcher_name[:16]),
            f"[gold]{ml_str}[/]",
            escape(cand.best_sportsbook),
            f"[accent]{era_sign}{cand.era_advantage:.2f}[/]",
            f"{cand.our_whip:.2f}",
            f"[{l3_style}]{cand.last3_era:.2f}[/]",
            f"[green_bright]{conf_str}[/]" if cand.win_confidence >= 0.60 else f"{conf_str}",
            signal_str,
        )

    console.print(cand_table)
    console.print()


# ==============================================================================
# MENU 3: UNDER 0.5 HOME RUN PARLAYS
# ==============================================================================

def display_under_hr_results(slips_by_legs: dict[int, list[analytics.UnderHRParlaySlip]], bankroll_summary: bankroll.BankrollSummary | None) -> None:
    print_rule("🎯  UNDER 0.5 HOME RUN PARLAY SCREENER (WIN RATE 90%)")
    console.print()

    if not slips_by_legs:
        console.print("[dim_text]No qualifying candidates for today's slate.[/]")
        return

    for n_legs in sorted(slips_by_legs.keys()):
        slips = slips_by_legs[n_legs]
        if not slips:
            continue

        alloc = bankroll_summary.allocations.get(n_legs) if bankroll_summary else None
        stake_info = f"Stake: {alloc.unit_multiplier:.2f} Unit (${alloc.dollar_stake:.2f})" if alloc else ""

        table = Table(
            title=f"[gold]{n_legs}-LEG UNDER HR PARLAY SLIPS[/]  [dim_text]({stake_info})[/]",
            box=box.ROUNDED, border_style="panel_border",
            header_style="table_header", show_lines=True, padding=(0, 1),
        )
        table.add_column("#", style="dim_text", width=4, justify="center")
        table.add_column("Legs (Batter → Pitcher · True Prob)", min_width=50, no_wrap=False)
        table.add_column("Comb Prob", justify="center", min_width=12)
        table.add_column("Fair Odds", justify="center", min_width=12)

        for idx, slip in enumerate(slips[:3], start=1):
            parts = []
            for leg in slip.legs:
                pct = analytics.format_prob_pct(leg.true_no_hr_prob)
                parts.append(f"[green_bright]{escape(leg.batter_name)}[/] vs [accent]{escape(leg.pitcher_name)}[/] ({pct})")
            legs_str = "\n".join(parts)
            table.add_row(
                str(idx), legs_str,
                f"[med_prob]{slip.combined_probability*100:.1f}%[/]",
                f"[gold]{analytics.format_american_odds(slip.fair_american_odds)}[/]",
            )
        console.print(table)
        console.print()


# ==============================================================================
# MENU 4: UNDER 1.5 HITS SCREENER
# ==============================================================================

def display_under_1_5_hits(recs: list[analytics.Under15HitsRecommendation]) -> None:
    print_rule("⚾  UNDER 1.5 HITS SCREENER (WIN RATE 70%+)")
    console.print()

    if not recs:
        console.print("[dim_text]No qualifying batters found for Under 1.5 Hits today.[/]")
        return

    table = Table(
        title="[gold]Under 1.5 Hits Recommendations (BA vs SP <= .200, Min 10 AB)[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    table.add_column("#", justify="center", width=4)
    table.add_column("Batter", style="white", min_width=20)
    table.add_column("Opp Pitcher", style="accent", min_width=18)
    table.add_column("H2H BA", justify="center", min_width=10)
    table.add_column("Seasonal Under 1.5 Prob", justify="center", min_width=20)
    table.add_column("Odds", justify="center", style="gold", min_width=10)
    table.add_column("Recommendation", justify="center", style="green_bright", min_width=18)

    for idx, r in enumerate(recs, start=1):
        table.add_row(
            str(idx),
            f"{escape(r.batter_name)} ({escape(r.team)})",
            escape(r.opponent_pitcher),
            f".{int(r.batting_avg_vs_sp * 1000):03d} ({r.at_bats_vs_sp} AB)",
            f"{r.seasonal_prob * 100:.1f}%",
            f"{r.odds_american:+d}",
            f"[green_bright]{r.bet_type}[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 5: ALTERNATE TEAM TOTAL OVER 1.5 RUNS
# ==============================================================================

def display_alternate_team_total(cands: list[analytics.AlternateTeamTotalCandidate]) -> None:
    print_rule("🔥  ALTERNATE TEAM TOTAL OVER 1.5 RUNS SCREENER (WIN RATE 90%)")
    console.print()

    if not cands:
        console.print("[dim_text]No teams cleared all 4 strict criteria for Over 1.5 Team Total today.[/]")
        return

    table = Table(
        title="[gold]Over 1.5 Runs Candidates (Top 10 RPG/HR vs SP ERA >= 4.0 & HR/9 >= 1.4 & Weak BP)[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    table.add_column("Team", style="bold white", min_width=20)
    table.add_column("RPG / HRPG", justify="center", min_width=14)
    table.add_column("Opponent SP", style="accent", min_width=18)
    table.add_column("SP ERA / HR9", justify="center", min_width=14)
    table.add_column("Opp BP ERA", justify="center", min_width=12)
    table.add_column("Park Factor", justify="center", min_width=12)
    table.add_column("Recommendation", justify="center", style="green_bright", min_width=18)

    for c in cands:
        table.add_row(
            escape(c.team_name),
            f"{c.runs_per_game:.2f} / {c.hr_per_game:.2f}",
            escape(c.opp_starter_name),
            f"{c.opp_starter_era:.2f} / {c.opp_starter_hr9:.2f}",
            f"{c.opp_bullpen_era:.2f}",
            f"{c.park_factor:.2f}",
            "[bold green_bright]OVER 1.5 RUNS[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 6: AT-BAT OUTCOME "OUT OR ERROR" TARGETS
# ==============================================================================

def display_at_bat_outcome_targets(targets: list[analytics.AtBatOutcomeTarget]) -> None:
    print_rule("🎯  AT-BAT OUTCOME 'OUT OR ERROR' TARGETS ($100/DAY SYSTEM)")
    console.print()

    if not targets:
        console.print("[dim_text]No qualifying DFS matchup targets today.[/]")
        return

    table = Table(
        title="[gold]Top 5 Target Batters for Flat Stake 'Out or Error' (+115 to +130 Odds)[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    table.add_column("#", justify="center", width=4)
    table.add_column("Target Batter", style="white", min_width=20)
    table.add_column("Opp DFS SP", style="accent", min_width=18)
    table.add_column("H2H BA", justify="center", min_width=10)
    table.add_column("K Rate", justify="center", min_width=10)
    table.add_column("Bet Recommendation", style="green_bright", min_width=28)

    for idx, t in enumerate(targets, start=1):
        table.add_row(
            str(idx),
            f"{escape(t.batter_name)} ({escape(t.team)})",
            escape(t.opponent_pitcher),
            f".{int(t.batting_avg_vs_sp * 1000):03d}",
            f"{t.strikeout_pct * 100:.1f}%",
            "[green_bright]Out or Error (+115 to +130)[/]",
        )

    console.print(table)
    console.print("[dim_text]Strategy Note: Flat Stake bet; Re-bet 2nd half if Starting Pitcher has not been replaced.[/]")
    console.print()


# ==============================================================================
# MENU 7: 5-FACTOR SCORE PROJECTION
# ==============================================================================

def display_score_projections(projections: list[analytics.GameProjection]) -> None:
    print_rule("📊  5-FACTOR SCORE PROJECTION ENGINE (OVER/UNDER)")
    console.print()

    table = Table(
        title="[gold]Game Totals — 5-Factor Projection Engine[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    table.add_column("Matchup", style="white", min_width=28)
    table.add_column("Book Line", justify="center", min_width=10)
    table.add_column("Projection", justify="center", min_width=12)
    table.add_column("Edge", justify="center", min_width=8)
    table.add_column("Recommendation", justify="center", min_width=14)

    for proj in projections:
        book_line = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
        edge_str  = f"{proj.edge:+.2f}" if proj.edge is not None else "N/A"
        rec_st    = {"OVER": "over", "UNDER": "under", "SKIP": "skip"}.get(proj.recommendation, "white")

        table.add_row(
            escape(proj.matchup),
            book_line,
            f"[accent]{proj.projected_total:.2f}[/]",
            edge_str,
            f"[{rec_st}]{proj.recommendation}[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 8: 4-DAY HISTORICAL CALIBRATION ENGINE LOG
# ==============================================================================

def display_calibration_log(report: analytics.CalibrationReport) -> None:
    print_rule("🔄  4-DAY HISTORICAL CALIBRATION ENGINE LOG")
    console.print()

    summary_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    summary_table.add_column("Metric", style="bold white")
    summary_table.add_column("Value", style="gold")

    summary_table.add_row("Lookback Window", f"{report.lookback_days} Days (H-4 to H-1)")
    summary_table.add_row("Total Games Analyzed", f"{report.total_games_analyzed} Matches")
    summary_table.add_row("Historical Error Rate", f"{report.avg_error_rate * 100:.1f}%")
    summary_table.add_row("Bullpen Volatility Score", f"{report.bullpen_volatility_score:.2f} ERA")
    summary_table.add_row("Calibrated Pitcher Weight", f"{report.calibrated_pitcher_weight:.2f}")
    summary_table.add_row("Calibrated Form Weight", f"{report.calibrated_form_weight:.2f}")
    summary_table.add_row("Calibrated OPS Weight", f"{report.calibrated_ops_weight:.2f}")

    console.print(Panel(
        summary_table,
        title="[gold]⚙️ Model Calibration Status[/]",
        border_style="panel_border", padding=(1, 2),
    ))
    console.print()

    log_table = Table(title="[gold]Historical Performance Logs[/]", box=box.ROUNDED, border_style="panel_border")
    log_table.add_column("Log Entry", style="dim_text")
    for entry in report.calibration_log:
        log_table.add_row(entry)

    console.print(log_table)
    console.print()


# ==============================================================================
# MENU 9: BANKROLL DASHBOARD & LINE SHOPPING
# ==============================================================================

def display_bankroll_dashboard(summary: bankroll.BankrollSummary) -> None:
    print_rule("💰  BANKROLL DASHBOARD & LINE SHOPPING PRICES")
    console.print()

    table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    table.add_column("Metric", style="bold white")
    table.add_column("Value", style="gold", justify="right")

    table.add_row("Total Bankroll Balance", f"${summary.balance:,.2f}")
    table.add_row("1 Unit Size (2.0%)", f"${summary.unit_value:,.2f}")
    table.add_row("Max Daily Risk Limit (10.0%)", f"${summary.max_daily_risk:,.2f}")
    table.add_row("Daily Budget Risked Today", f"${summary.daily_budget_used:,.2f}")
    table.add_row("Remaining Daily Budget", f"${summary.remaining_daily_budget:,.2f}")

    console.print(Panel(table, title="[gold]🏦 Bankroll Status[/]", border_style="panel_border", padding=(1, 2)))
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
