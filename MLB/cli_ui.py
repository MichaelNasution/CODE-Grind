"""
cli_ui.py
=========
Modern, aesthetic CLI interface using the `rich` library v3.

Renders:
  - Animated header banner & active date indicator
  - 7-option interactive main menu
  - Interactive Date Selector (Today, Tomorrow, Custom Date)
  - Strategy A: Moneyline Strong Recommendations + LOCK OF THE DAY panel + Parlays
  - Strategy B: Under HR Parlay slip tables + stake allocations
  - Strategy C: 5-Factor Score Projection (O/U) breakdown
  - Strategy D: Pitcher Props Goblin & 2-Man Anchor System
  - Bankroll Manager Dashboard & Stake Allocator Grid
"""

from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any

from rich import box
from rich.align import Align
from rich.columns import Columns
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
    "lock_title":   "bold white on #b30000",
})

console = Console(theme=MLB_THEME, highlight=False)


# ==============================================================================
# BANNER & HEADER
# ==============================================================================

BANNER_TEXT = r"""
  ███╗   ███╗██╗     ██████╗      █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗████████╗██╗ ██████╗███████╗
  ████╗ ████║██║     ██╔══██╗    ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝╚══██╔══╝██║██╔════╝██╔════╝
  ██╔████╔██║██║     ██████╔╝    ███████║██╔██╗ ██║███████║██║   ╚████╔╝    ██║   ██║██║     ███████╗
  ██║╚██╔╝██║██║     ██╔══██║    ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝     ██║   ██║██║     ╚════██║
  ██║ ╚═╝ ██║███████╗██████╔╝    ██║  ██║██║ ╚████║██║  ██║███████╗██║      ██║   ██║╚██████╗███████║
  ╚═╝     ╚═╝╚══════╝╚═════╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝      ╚═╝   ╚═╝ ╚═════╝╚══════╝
"""


def print_banner() -> None:
    console.print()
    console.print(Align.center(Text(BANNER_TEXT, style="bold #00d4ff")))
    console.print(Align.center(Text(
        "⚾  Quantitative MLB Handicapping System  |  v3.0.0 Production",
        style="bold #ffd700",
    )))
    console.print(Align.center(Text(
        "Powered by MLB StatsAPI  ·  Open-Meteo  ·  The Odds API",
        style="dim #6699cc",
    )))
    console.print()


def display_analysis_header(date_str: str) -> None:
    """Display persistent bar with active analysis date."""
    dt_obj = date.fromisoformat(date_str)
    day_name = dt_obj.strftime("%A")
    formatted_date = f"{day_name}, {date_str}"
    
    header_text = Text()
    header_text.append("📅 Active Analysis Date: ", style="bold dim_text")
    header_text.append(formatted_date, style="bold gold")
    
    console.print(Align.center(Panel(
        header_text,
        border_style="panel_border",
        padding=(0, 4),
    )))
    console.print()


def print_rule(title: str = "") -> None:
    console.print(Rule(title, style="#1a4a8a", characters="─"))


# ==============================================================================
# PROGRESS SPINNER
# ==============================================================================

def make_progress() -> Progress:
    return Progress(
        SpinnerColumn(spinner_name="dots", style="accent"),
        TextColumn("[accent]{task.description}"),
        BarColumn(bar_width=40, style="#1a4a8a", complete_style="#00d4ff"),
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
    """
    Display Date Selection prompt (Today, Tomorrow, Custom Date).
    Returns validated ISO date string (YYYY-MM-DD).
    """
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
    menu_table.add_row("C", "Custom Date", "Input Format: YYYY-MM-DD")

    console.print(Panel(
        menu_table,
        title="[gold]📅  PILIH TANGGAL PERTANDINGAN / ANALYSIS DATE[/]",
        subtitle="[dim_text]Select slate date to analyze[/]",
        border_style="panel_border",
        padding=(1, 3),
    ))

    choice = Prompt.ask(
        "\n[accent]Select date option[/]",
        choices=["A", "a", "B", "b", "C", "c"],
        default="A",
    ).upper()

    if choice == "A":
        return today_str
    elif choice == "B":
        return tomorrow_str
    else: # Custom Date
        while True:
            custom_input = Prompt.ask("[gold]Enter custom date (YYYY-MM-DD)[/]")
            if re.match(r"^\d{4}-\d{2}-\d{2}$", custom_input):
                try:
                    date.fromisoformat(custom_input)
                    return custom_input
                except ValueError:
                    console.print("[red_bright]Invalid calendar date. Please enter a valid date.[/]")
            else:
                console.print("[red_bright]Invalid format. Use YYYY-MM-DD (e.g. 2026-08-10).[/]")


# ==============================================================================
# MAIN MENU (7 Options)
# ==============================================================================

def print_main_menu() -> None:
    menu_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    menu_table.add_column("Num", style="gold", width=5)
    menu_table.add_column("Option", style="bold white")
    menu_table.add_column("Desc", style="dim_text")

    menu_items = [
        ("1", "🏆  Moneyline Strong Recommendations & Parlays",
         "Win Conf Picks | Slips: 3/4/5/8/10 legs + LOCK OF THE DAY"),
        ("2", "🎯  Under Home Run Parlay Screener",
         "True No-HR Prob | Slips: 3/4/5/8/10 legs"),
        ("3", "📊  5-Factor Score Projection (O/U)",
         "Full game total projections | OVER / UNDER / SKIP"),
        ("4", "⚡  Pitcher Props & Anchor / Goblin Systems",
         "Goblin K-Props & 2-Man Anchor Slips"),
        ("5", "💰  Bankroll Manager & Daily Risk Status",
         "View Bankroll balance, daily risk limits & stake allocations"),
        ("6", "📅  Ganti Tanggal Analisis (Change Date)",
         "Switch active date slate (Today / Tomorrow / Custom)"),
        ("7", "🚪  Exit", "Close application"),
    ]
    for num, opt, desc in menu_items:
        menu_table.add_row(num, opt, desc)

    console.print(Panel(
        menu_table,
        title="[gold]⚾  MAIN MENU[/]",
        subtitle="[dim_text]Select strategy or settings[/]",
        border_style="panel_border",
        padding=(1, 3),
    ))


def get_menu_choice() -> str:
    return Prompt.ask(
        "\n[accent]Select option[/]",
        choices=["1", "2", "3", "4", "5", "6", "7"],
        show_choices=True,
    )


# ==============================================================================
# STRATEGY A: MONEYLINE STRONG RECOMMENDATION & LOCK OF THE DAY
# ==============================================================================

def _conf_style(conf: float) -> str:
    if conf >= 0.85:
        return "high_prob"
    elif conf >= 0.75:
        return "med_prob"
    else:
        return "low_prob"


def _ev_style(ev: float) -> str:
    return "ev_pos" if ev >= 0 else "ev_neg"


def _ev_label(ev: float) -> str:
    sign = "+" if ev >= 0 else ""
    return f"{sign}{ev * 100:.1f}%"


def display_lock_of_day(lock: analytics.LockOfDay | None, unit_val: float) -> None:
    """Display prominent Lock of the Day panel if available."""
    if not lock:
        console.print(Panel(
            "[dim_text]No pick reached the strict 80% Win Confidence threshold today for Lock of the Day.[/]",
            title="[gold]🔒  LOCK OF THE DAY / MUST-WIN SLIP[/]",
            border_style="dim",
            padding=(0, 2),
        ))
        console.print()
        return

    cand = lock.candidate
    loc = "Home" if cand.is_home else "Away"
    ml_str = analytics.format_ml_american(cand.moneyline_american)
    dollar_stake = round(unit_val * 1.00, 2)

    content = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    content.add_column("Key", style="gold", min_width=20)
    content.add_column("Value", style="bold white")

    content.add_row("Lock Pick", f"[bold green_bright]{escape(cand.team_name)}[/] ({loc})")
    content.add_row("Matchup", f"vs {escape(cand.opponent_team)}")
    content.add_row("Starter Pitcher", f"{escape(cand.pitcher_name)} (vs {escape(cand.opponent_pitcher)})")
    content.add_row("Moneyline Odds", f"[gold]{ml_str}[/] (Decimal: {cand.moneyline_decimal:.2f})")
    content.add_row("Win Confidence", f"[bold high_prob]{cand.win_confidence * 100:.1f}%[/]")
    content.add_row("Recommended Stake", f"[bold accent]1.00 Unit (${dollar_stake:.2f})[/]")
    content.add_row("Quantitative Rationale", f"[dim_text]{escape(lock.rationale)}[/]")

    console.print(Panel(
        content,
        title="[bold white on #b30000] 🔒 LOCK OF THE DAY / MUST-WIN SLIP (SINGLE PICK) [/]",
        border_style="red_bright",
        padding=(1, 2),
    ))
    console.print()


def display_moneyline_results(
    candidates: list[analytics.MoneylineCandidate],
    slips_by_legs: dict[int, list[analytics.MoneylineSlip]],
    lock_of_day: analytics.LockOfDay | None,
    bankroll_summary: bankroll.BankrollSummary | None,
) -> None:
    print_rule("🏆  MONEYLINE STRONG RECOMMENDATIONS & PARLAY SLIPS")
    console.print()

    unit_val = bankroll_summary.unit_value if bankroll_summary else 20.00

    # Render Lock of the Day Panel first
    display_lock_of_day(lock_of_day, unit_val)

    if not candidates:
        console.print(Panel(
            "[red_bright]No qualifying teams found for today's slate.[/]\n"
            "[dim_text]No team clears the Win Confidence threshold (>= 65%).[/]",
            border_style="red", padding=(1, 3),
        ))
        return

    # Qualified Candidates Table
    cand_table = Table(
        title="[gold]🎯 Qualified Moneyline Picks (Sorted by Win Confidence)[/]",
        box=box.DOUBLE_EDGE,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    cand_table.add_column("#",              justify="center", width=4)
    cand_table.add_column("Team",           style="white",   min_width=24)
    cand_table.add_column("Matchup",        style="dim_text", min_width=22)
    cand_table.add_column("Our Starter",    style="accent",   min_width=18)
    cand_table.add_column("ML Odds",        justify="center", min_width=10)
    cand_table.add_column("ERA Adv",        justify="center", min_width=9)
    cand_table.add_column("Form L10",       justify="center", min_width=10)
    cand_table.add_column("OPS Adv",        justify="center", min_width=9)
    cand_table.add_column("Win Conf",       justify="center", min_width=10)

    for idx, cand in enumerate(candidates, start=1):
        loc = "H" if cand.is_home else "A"
        matchup_str = f"vs {escape(cand.opponent_team[:18])}\n[dim_text]opp: {escape(cand.opponent_pitcher[:16])}[/]"
        era_sign  = "+" if cand.era_advantage >= 0 else ""
        ops_sign  = "+" if cand.ops_advantage_pct >= 0 else ""
        conf_st   = _conf_style(cand.win_confidence)
        ml_str    = analytics.format_ml_american(cand.moneyline_american)
        form_str  = f"{int(cand.last10_win_rate * 10)}-{10 - int(cand.last10_win_rate * 10)}"
        conf_str  = f"{cand.win_confidence * 100:.1f}%"

        cand_table.add_row(
            f"[dim_text]{idx}[/]",
            f"[bold white]{escape(cand.team_name)}[/] [dim_text]({loc})[/]",
            matchup_str,
            escape(cand.pitcher_name[:18]),
            f"[gold]{ml_str}[/]",
            f"[accent]{era_sign}{cand.era_advantage:.2f}[/]",
            f"[dim_text]{form_str}[/]",
            f"[accent]{ops_sign}{cand.ops_advantage_pct * 100:.1f}%[/]",
            f"[{conf_st}]{conf_str}[/]",
        )

    console.print(cand_table)
    console.print()

    if not slips_by_legs:
        console.print("[dim_text]Not enough qualified teams to generate parlay slips.[/]")
        return

    print_rule("🎰  Moneyline Parlay Slips with Stake Allocations")
    console.print()

    for n_legs in sorted(slips_by_legs.keys()):
        slip_list = slips_by_legs[n_legs]
        if not slip_list:
            continue
        _display_ml_slip_table(slip_list, n_legs, bankroll_summary)
        console.print()


def _display_ml_slip_table(
    slips: list[analytics.MoneylineSlip],
    n_legs: int,
    bankroll_summary: bankroll.BankrollSummary | None,
) -> None:
    alloc = bankroll_summary.allocations.get(n_legs) if bankroll_summary else None
    stake_info = f"Stake: {alloc.unit_multiplier:.2f} Unit (${alloc.dollar_stake:.2f})" if alloc else ""

    table = Table(
        title=f"[gold]{n_legs}-LEG MONEYLINE PARLAY SLIPS[/]  [dim_text]({stake_info})[/]",
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    table.add_column("#",             justify="center", width=4)
    table.add_column("Legs  (Team · ML · Confidence)", min_width=50, no_wrap=False)
    table.add_column("Combined\nConf %", justify="center", min_width=11)
    table.add_column("Parlay Odds\n(American)", justify="center", min_width=13)
    table.add_column("Book Implied\nProb %",  justify="center", min_width=13)
    table.add_column("EV Edge",       justify="center", min_width=10)

    for idx, slip in enumerate(slips[:5], start=1):
        legs_parts: list[str] = []
        for leg in slip.legs:
            ml_str  = analytics.format_ml_american(leg.moneyline_american)
            conf_st = _conf_style(leg.win_confidence)
            legs_parts.append(
                f"[{conf_st}]{escape(leg.team_name)}[/] "
                f"[gold]({ml_str})[/] "
                f"[dim_text]{leg.win_confidence * 100:.1f}%[/]"
            )
        legs_str = "\n".join(legs_parts)

        comb_conf_str  = f"{slip.combined_confidence * 100:.2f}%"
        implied_str    = f"{slip.implied_probability * 100:.2f}%"
        odds_str       = analytics.format_ml_american(slip.combined_american_odds)
        ev_st          = _ev_style(slip.ev_edge)
        ev_str         = _ev_label(slip.ev_edge)
        conf_st        = _conf_style(slip.combined_confidence + 0.2)

        table.add_row(
            str(idx),
            legs_str,
            f"[{conf_st}]{comb_conf_str}[/]",
            f"[gold]{odds_str}[/]",
            f"[dim_text]{implied_str}[/]",
            f"[{ev_st}]{ev_str}[/]",
        )

    if len(slips) > 5:
        table.add_row("...", f"[dim_text]+ {len(slips) - 5} more combinations available[/]", "", "", "", "")

    console.print(table)


# ==============================================================================
# STRATEGY B: UNDER HOME RUN PARLAY DISPLAY
# ==============================================================================

def _prob_style(prob: float) -> str:
    if prob >= 0.97:
        return "high_prob"
    elif prob >= 0.95:
        return "med_prob"
    return "low_prob"


def display_under_hr_results(
    slips_by_legs: dict[int, list[analytics.ParlaySlip]],
    bankroll_summary: bankroll.BankrollSummary | None,
) -> None:
    print_rule("🎯  UNDER HOME RUN PARLAY SCREENER — RESULTS")
    console.print()

    if not slips_by_legs:
        console.print(Panel(
            "[red_bright]No qualifying candidates for today's slate.[/]\n"
            "[dim_text]Try again after lineups are confirmed (~3 hrs before first pitch).[/]",
            border_style="red", padding=(1, 3),
        ))
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
        table.add_column("Legs  (Batter → Pitcher · True Prob)", min_width=52, no_wrap=False)
        table.add_column("Combined\nProb", justify="center", min_width=13)
        table.add_column("Fair Odds\n(US)", justify="center", min_width=12)

        for idx, slip in enumerate(slips[:5], start=1):
            parts = []
            for leg in slip.legs:
                pct = analytics.format_prob_pct(leg.true_no_hr_prob)
                st  = _prob_style(leg.true_no_hr_prob)
                parts.append(
                    f"[{st}]{escape(leg.batter_name)}[/] [{escape(leg.team[:3].upper())}] "
                    f"vs [accent]{escape(leg.pitcher_name)}[/] ({pct})"
                )
            legs_str = "\n".join(parts)
            comb_str = analytics.combined_prob_to_str(slip.combined_probability)
            odds_str = analytics.format_american_odds(slip.fair_american_odds)
            table.add_row(str(idx), legs_str, f"[med_prob]{comb_str}[/]", f"[gold]{odds_str}[/]")

        if len(slips) > 5:
            table.add_row("...", f"[dim_text]+ {len(slips) - 5} more combinations[/]", "", "")

        console.print(table)
        console.print()


# ==============================================================================
# STRATEGY C: 5-FACTOR SCORE PROJECTION DISPLAY
# ==============================================================================

def _rec_style(rec: str) -> str:
    return {"OVER": "over", "UNDER": "under", "SKIP": "skip", "NO LINE": "dim_text"}.get(rec, "white")


def display_score_projections(projections: list[analytics.GameProjection]) -> None:
    print_rule("📊  5-FACTOR SCORE PROJECTION ENGINE (OVER/UNDER)")
    console.print()

    if not projections:
        console.print("[red_bright]No game data available.[/]")
        return

    main_table = Table(
        title="[gold]Game Totals — 5-Factor Projection Engine[/]",
        box=box.DOUBLE_EDGE, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    main_table.add_column("Matchup",          style="white",    min_width=28)
    main_table.add_column("Venue",            style="dim_text", min_width=18)
    main_table.add_column("Book Line",        justify="center", min_width=10)
    main_table.add_column("Projection",       justify="center", min_width=12)
    main_table.add_column("Edge",             justify="center", min_width=8)
    main_table.add_column("Weather",          min_width=20)
    main_table.add_column("Recommendation",   justify="center", min_width=14)

    for proj in projections:
        book_line = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
        proj_str  = f"[accent]{proj.projected_total:.2f}[/]"
        edge_str  = "N/A"
        if proj.edge is not None:
            sign  = "+" if proj.edge >= 0 else ""
            est   = "green_bright" if proj.edge >= 0.75 else ("red_bright" if proj.edge <= -0.75 else "dim_text")
            edge_str = f"[{est}]{sign}{proj.edge:.2f}[/]"

        w_icon = {"out": ">", "in": "<", "none": "~", "crosswind": "x"}.get(proj.wind_direction, "")
        weather_str = f"{w_icon}{proj.wind_speed_mph:.0f}mph {proj.temp_f:.0f}F\n[dim_text]{proj.conditions[:18]}[/]"
        if proj.weather_adjustment != 0:
            sign = "+" if proj.weather_adjustment > 0 else ""
            weather_str += f"\n[accent]{sign}{proj.weather_adjustment:.2f} adj[/]"

        rec_st  = _rec_style(proj.recommendation)
        rec_str = f"[{rec_st}]{proj.recommendation}[/]"

        main_table.add_row(
            escape(proj.matchup),
            escape(proj.venue[:18]),
            book_line,
            proj_str,
            edge_str,
            weather_str,
            rec_str,
        )

    console.print(main_table)
    console.print()


# ==============================================================================
# STRATEGY D: PITCHER PROPS & ANCHOR SYSTEM DISPLAY
# ==============================================================================

def display_pitcher_props(
    pitcher_props: list[analytics.PitcherPropRecommendation],
    anchor_slips: list[analytics.AnchorSlip],
    bankroll_summary: bankroll.BankrollSummary | None,
) -> None:
    print_rule("⚡  PITCHER PROPS & ANCHOR / GOBLIN SYSTEMS")
    console.print()

    unit_val = bankroll_summary.unit_value if bankroll_summary else 20.0
    anchor_stake_str = f"Recommended Stake per 2-Man Slip: 1.00 Unit (${unit_val:.2f})"

    goblin_tbl = Table(
        title="[gold]Elite Pitcher Goblin Strikeout Props[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    goblin_tbl.add_column("Pitcher",         style="white",    min_width=22)
    goblin_tbl.add_column("Team",            style="dim_text", min_width=14)
    goblin_tbl.add_column("K/9",             justify="center", min_width=7)
    goblin_tbl.add_column("Avg PC",          justify="center", min_width=8)
    goblin_tbl.add_column("Goblin Line",     justify="center", min_width=13)
    goblin_tbl.add_column("Recommendation",  style="green_bright", min_width=24)

    for prop in pitcher_props:
        goblin_tbl.add_row(
            escape(prop.pitcher_name), escape(prop.team),
            f"[accent]{prop.k_per9:.1f}[/]", str(prop.avg_pitch_count),
            f"[gold]{prop.goblin_line:.1f} K[/]",
            f"[green_bright]{escape(prop.prop_label)}[/]",
        )
    console.print(goblin_tbl)
    console.print()

    anchor_tbl = Table(
        title=f"[gold]2-Man Anchor Slips (Pitcher K + Batter Hits)[/]  [dim_text]({anchor_stake_str})[/]",
        box=box.ROUNDED, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    anchor_tbl.add_column("#",               style="dim_text", width=4, justify="center")
    anchor_tbl.add_column("Pitcher Prop",    style="white",    min_width=30)
    anchor_tbl.add_column("Batter Prop",     style="white",    min_width=28)
    anchor_tbl.add_column("Confidence",      justify="center", min_width=12)

    for idx, slip in enumerate(anchor_slips, start=1):
        conf_st = {"High": "green_bright", "Medium": "gold", "Low": "red_bright"}.get(
            slip.pair_confidence, "white"
        )
        anchor_tbl.add_row(
            str(idx),
            f"[accent]{escape(slip.pitcher_prop.pitcher_name)}[/]\n[dim_text]{escape(slip.pitcher_prop.prop_label or slip.pitcher_prop.pitcher_name)}[/]",
            f"[gold]{escape(slip.batter_name)}[/]\n[dim_text]{escape(slip.batter_prop_label)}[/]",
            f"[{conf_st}]{slip.pair_confidence}[/]",
        )
    console.print(anchor_tbl)
    console.print()


# ==============================================================================
# BANKROLL MANAGER DISPLAY
# ==============================================================================

def display_bankroll_dashboard(summary: bankroll.BankrollSummary) -> None:
    print_rule("💰  BANKROLL MANAGER & RISK ALLOCATOR DASHBOARD")
    console.print()

    budget_util_pct = (summary.daily_budget_used / summary.max_daily_risk) if summary.max_daily_risk > 0 else 0.0
    util_color = "green_bright" if budget_util_pct < 0.70 else ("orange" if budget_util_pct < 1.0 else "red_bright")

    overview_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    overview_table.add_column("Metric", style="bold white", min_width=25)
    overview_table.add_column("Value", style="gold", justify="right", min_width=15)

    overview_table.add_row("Total Bankroll Balance", f"${summary.balance:,.2f}")
    overview_table.add_row("1 Unit Size (2.0%)", f"${summary.unit_value:,.2f}")
    overview_table.add_row("Max Daily Risk Limit (10.0%)", f"${summary.max_daily_risk:,.2f}")
    overview_table.add_row("Daily Budget Risked Today", f"[{util_color}]${summary.daily_budget_used:,.2f} ({budget_util_pct * 100:.1f}%)[/]")
    overview_table.add_row("Remaining Daily Budget", f"[bold green_bright]${summary.remaining_daily_budget:,.2f}[/]")

    console.print(Panel(
        overview_table,
        title="[gold]🏦  Current Bankroll Status[/]",
        border_style="panel_border",
        padding=(1, 3),
    ))
    console.print()

    # Stake Allocation Matrix
    alloc_table = Table(
        title="[gold]📋 Automated Stake Allocation Grid per Slip Type[/]",
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    alloc_table.add_column("Slip Type", style="white", min_width=24)
    alloc_table.add_column("Risk Category", justify="center", min_width=15)
    alloc_table.add_column("Unit Mult", justify="center", min_width=10)
    alloc_table.add_column("Dollar Stake", justify="center", style="gold", min_width=14)

    # Single pick entry
    single_dollar = round(summary.unit_value * 1.00, 2)
    alloc_table.add_row(
        "Single / Lock of Day / 2-Man Anchor",
        "[green_bright]Dominant / Low Var[/]",
        "1.00 Unit",
        f"${single_dollar:,.2f}",
    )

    for legs, alloc in sorted(summary.allocations.items()):
        cat_style = "green_bright" if alloc.n_legs == 3 else ("gold" if alloc.n_legs in (4, 5) else "red_bright")
        alloc_table.add_row(
            f"{legs}-Leg Parlay Slip",
            f"[{cat_style}]{alloc.risk_label}[/]",
            f"{alloc.unit_multiplier:.2f} Unit",
            f"${alloc.dollar_stake:,.2f}",
        )

    console.print(alloc_table)
    console.print()


def bankroll_edit_menu(state: bankroll.BankrollState) -> bankroll.BankrollState:
    """Sub-menu for editing bankroll balance."""
    console.print("\n[gold]Bankroll Actions:[/]")
    console.print("  [accent]1.[/] Set New Bankroll Balance")
    console.print("  [accent]2.[/] Add Deposit / Top-up")
    console.print("  [accent]3.[/] Reset Bankroll to Default ($1,000)")
    console.print("  [accent]4.[/] Return to Main Menu")

    choice = Prompt.ask("\n[accent]Select action[/]", choices=["1", "2", "3", "4"], default="4")

    if choice == "1":
        new_val_str = Prompt.ask("[gold]Enter new balance ($)[/]")
        try:
            val = float(new_val_str)
            state = bankroll.set_balance(val)
            console.print(f"[green_bright]Bankroll balance updated to ${state.balance:,.2f}[/]")
        except ValueError:
            console.print("[red_bright]Invalid number entered.[/]")
    elif choice == "2":
        dep_str = Prompt.ask("[gold]Enter deposit amount ($)[/]")
        try:
            val = float(dep_str)
            state = bankroll.add_to_balance(val)
            console.print(f"[green_bright]Added ${val:,.2f}. New balance: ${state.balance:,.2f}[/]")
        except ValueError:
            console.print("[red_bright]Invalid number entered.[/]")
    elif choice == "3":
        state = bankroll.reset_bankroll()
        console.print("[green_bright]Bankroll reset to default $1,000.00[/]")

    return state


# ==============================================================================
# GENERIC UTILITIES
# ==============================================================================

def display_error(message: str) -> None:
    console.print(Panel(
        f"[red_bright]{escape(message)}[/]",
        border_style="red", padding=(0, 2),
    ))


def press_enter_to_continue() -> None:
    console.print("\n[dim_text]Press Enter to return to the main menu...[/]")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        pass


def display_exit_message() -> None:
    console.print()
    console.print(Align.center(Panel(
        "[gold]Thank you for using MLB Analytics System.[/]\n"
        "[dim_text]Bet responsibly. Always track your edge.[/]",
        border_style="panel_border", padding=(1, 6),
    )))
    console.print()
