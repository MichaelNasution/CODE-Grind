"""
cli_ui.py
=========
Modern, aesthetic CLI interface using the `rich` library.

Renders:
  - Animated header banner
  - Interactive main menu
  - Strategy 1: Under HR Parlay slip tables
  - Strategy 2: 5-Factor Score Projection tables
  - Strategy 3: Pitcher Props & Anchor slip panels
  - Bankroll Manager dashboard
  - Progress spinners for data fetching
"""

from __future__ import annotations

import time
from typing import Any

from rich import box
from rich.align import Align
from rich.columns import Columns
from rich.console import Console
from rich.live import Live
from rich.markup import escape
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.prompt import Confirm, FloatPrompt, IntPrompt, Prompt
from rich.rule import Rule
from rich.spinner import Spinner
from rich.table import Table
from rich.text import Text
from rich.theme import Theme

import analytics
import bankroll
import config

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
    "bankroll_pos": "bold bright_green",
    "bankroll_neg": "bold bright_red",
})

console = Console(theme=MLB_THEME, highlight=False)


# ==============================================================================
# BANNER & HEADER
# ==============================================================================

BANNER_TEXT = r"""
  ███╗   ███╗██╗     ██████╗      █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗████████╗██╗ ██████╗███████╗
  ████╗ ████║██║     ██╔══██╗    ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝╚══██╔══╝██║██╔════╝██╔════╝
  ██╔████╔██║██║     ██████╔╝    ███████║██╔██╗ ██║███████║██║   ╚████╔╝    ██║   ██║██║     ███████╗
  ██║╚██╔╝██║██║     ██╔══██╗    ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝     ██║   ██║██║     ╚════██║
  ██║ ╚═╝ ██║███████╗██████╔╝    ██║  ██║██║ ╚████║██║  ██║███████╗██║      ██║   ██║╚██████╗███████║
  ╚═╝     ╚═╝╚══════╝╚═════╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝      ╚═╝   ╚═╝ ╚═════╝╚══════╝
"""


def print_banner() -> None:
    """Print the animated application banner."""
    console.print()
    banner = Text(BANNER_TEXT, style="bold #00d4ff")
    console.print(Align.center(banner))
    console.print(
        Align.center(
            Text(
                "⚾  Quantitative MLB Handicapping System  |  v1.0.0  |  Production Grade",
                style="bold #ffd700",
            )
        )
    )
    console.print(
        Align.center(
            Text(
                "Powered by MLB StatsAPI  ·  Open-Meteo  ·  The Odds API",
                style="dim #6699cc",
            )
        )
    )
    console.print()


def print_rule(title: str = "") -> None:
    """Print a styled section divider."""
    console.print(Rule(title, style="#1a4a8a", characters="─"))


# ==============================================================================
# PROGRESS SPINNER
# ==============================================================================

def make_progress() -> Progress:
    """Create a styled progress bar for data fetching operations."""
    return Progress(
        SpinnerColumn(spinner_name="dots", style="accent"),
        TextColumn("[accent]{task.description}"),
        BarColumn(bar_width=40, style="#1a4a8a", complete_style="#00d4ff"),
        TimeElapsedColumn(),
        console=console,
        transient=True,
    )


def with_spinner(description: str, fn, *args, **kwargs):
    """
    Execute fn(*args, **kwargs) while showing a spinner.
    Returns the function's result.
    """
    with make_progress() as progress:
        task = progress.add_task(description, total=None)
        result = fn(*args, **kwargs)
        progress.update(task, completed=True)
    return result


# ==============================================================================
# MAIN MENU
# ==============================================================================

def print_main_menu() -> None:
    """Print the interactive main menu panel."""
    br_state = bankroll.load_state()
    unit_val = bankroll.calc_unit_value(br_state.balance)
    remaining = bankroll.calc_remaining_daily_budget(br_state)
    used_pct = bankroll.get_budget_utilization_pct(br_state)
    used_bar = "█" * int(used_pct * 20) + "░" * (20 - int(used_pct * 20))

    menu_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    menu_table.add_column("Num", style="gold", width=5)
    menu_table.add_column("Option", style="bold white")
    menu_table.add_column("Desc", style="dim_text")

    menu_items = [
        ("1", "🎯  Under Home Run Parlay Screener",
         "Slips: 3 / 4 / 5 / 8 / 10 legs"),
        ("2", "📊  5-Factor Score Projection (O/U)",
         "Today's full game slate"),
        ("3", "⚡  Pitcher Props & Anchor System",
         "Goblin props + 2-man anchor slips"),
        ("4", "💰  Bankroll Manager",
         "View / Edit balance & stake sizes"),
        ("5", "🚪  Exit",
         ""),
    ]
    for num, opt, desc in menu_items:
        menu_table.add_row(num, opt, desc)

    br_info = (
        f"  💵 Balance: [green_bright]${br_state.balance:,.2f}[/]  "
        f"| 1 Unit: [accent]${unit_val:.2f}[/]  "
        f"| Daily Budget Left: [gold]${remaining:.2f}[/]  "
        f"| [{used_bar}] {used_pct:.0%}"
    )

    console.print(
        Panel(
            menu_table,
            title="[gold]⚾  MAIN MENU[/]",
            subtitle=br_info,
            border_style="panel_border",
            padding=(1, 3),
        )
    )


def get_menu_choice() -> str:
    """Prompt user for a main menu selection."""
    return Prompt.ask(
        "\n[accent]Select option[/]",
        choices=["1", "2", "3", "4", "5"],
        show_choices=True,
    )


# ==============================================================================
# STRATEGY 1: UNDER HOME RUN PARLAY DISPLAY
# ==============================================================================

def _prob_style(prob: float) -> str:
    """Return color style based on probability value."""
    if prob >= 0.97:
        return "high_prob"
    elif prob >= 0.95:
        return "med_prob"
    else:
        return "low_prob"


def _build_parlay_slip_table(
    slips: list[analytics.ParlaySlip],
    n_legs: int,
    allocations: dict[int, bankroll.StakeAllocation],
) -> Table:
    """Build a rich Table for a list of parlay slips of the same leg count."""
    alloc = allocations.get(n_legs)
    dollar_stake = f"${alloc.dollar_stake:.2f}" if alloc else "N/A"
    unit_str = f"{alloc.unit_multiplier:.2f}u" if alloc else "N/A"
    risk_label = alloc.risk_label if alloc else ""

    title = (
        f"[gold]🎰 {n_legs}-LEG PARLAY SLIPS[/]  "
        f"[dim_text]Stake: [/][accent]{unit_str}[/][dim_text] = [/][green_bright]{dollar_stake}[/]  "
        f"[dim_text]({risk_label})[/]"
    )

    table = Table(
        title=title,
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    table.add_column("#", style="dim_text", width=4, justify="center")
    table.add_column("Legs (Batter → Pitcher)", style="white", min_width=45, no_wrap=False)
    table.add_column("Combined Prob", justify="center", min_width=14)
    table.add_column("Fair Odds (US)", justify="center", min_width=14)
    table.add_column("Stake ($)", justify="right", min_width=10)

    # Show top 5 slips only (to avoid overwhelming output)
    display_slips = slips[:5]

    for idx, slip in enumerate(display_slips, start=1):
        legs_str_parts = []
        for leg in slip.legs:
            individual_prob = analytics.format_prob_pct(leg.true_no_hr_prob)
            style = _prob_style(leg.true_no_hr_prob)
            legs_str_parts.append(
                f"[{style}]{escape(leg.batter_name)}[/] [{escape(leg.team[:3].upper())}]"
                f" vs [accent]{escape(leg.pitcher_name)}[/] ({individual_prob})"
            )
        legs_str = "\n".join(legs_str_parts)

        comb_prob_str = analytics.combined_prob_to_str(slip.combined_probability)
        odds_str = analytics.format_american_odds(slip.fair_american_odds)
        prob_style = _prob_style(slip.combined_probability * 3)  # scale for combined

        table.add_row(
            str(idx),
            legs_str,
            f"[{prob_style}]{comb_prob_str}[/]",
            f"[gold]{odds_str}[/]",
            f"[green_bright]{dollar_stake}[/]",
        )

    if len(slips) > 5:
        table.add_row(
            "…",
            f"[dim_text]+ {len(slips) - 5} more combinations available[/]",
            "", "", "",
        )

    return table


def display_under_hr_results(
    slips_by_legs: dict[int, list[analytics.ParlaySlip]],
    br_state: bankroll.BankrollState,
) -> None:
    """Display Under HR parlay results for all leg counts."""
    print_rule("🎯  UNDER HOME RUN PARLAY SCREENER — RESULTS")
    console.print()

    if not slips_by_legs:
        console.print(
            Panel(
                "[red_bright]⚠  No qualifying candidates found for today's slate.[/]\n"
                "[dim_text]Try again after lineups are confirmed (~3 hours before first pitch).[/]",
                border_style="red",
                padding=(1, 3),
            )
        )
        return

    allocations = bankroll.calc_stake_allocations(br_state)

    # Summary header
    total_candidates: set[int] = set()
    for slips in slips_by_legs.values():
        for slip in slips:
            for leg in slip.legs:
                total_candidates.add(leg.batter_id)

    summary_panel = Panel(
        f"[dim_text]Qualified Batters:[/] [green_bright]{len(total_candidates)}[/]  "
        f"[dim_text]| HR/9 Threshold:[/] [accent]≤ {config.MAX_HR9_FOR_TOP_PITCHER}[/]  "
        f"[dim_text]| Min True No-HR Prob:[/] [accent]≥ {config.MIN_TRUE_NO_HR_PROBABILITY:.0%}[/]  "
        f"[dim_text]| Min H2H PA:[/] [accent]{config.MIN_PLATE_APPEARANCES_H2H}[/]",
        title="[gold]📋 Screening Summary[/]",
        border_style="panel_border",
        padding=(0, 2),
    )
    console.print(summary_panel)
    console.print()

    for n_legs in sorted(slips_by_legs.keys()):
        slips = slips_by_legs[n_legs]
        if not slips:
            continue
        table = _build_parlay_slip_table(slips, n_legs, allocations)
        console.print(table)
        console.print()


# ==============================================================================
# STRATEGY 2: 5-FACTOR SCORE PROJECTION DISPLAY
# ==============================================================================

def _rec_style(recommendation: str) -> str:
    """Return style string for a game recommendation."""
    mapping = {"OVER": "over", "UNDER": "under", "SKIP": "skip", "NO LINE": "dim_text"}
    return mapping.get(recommendation, "white")


def _rec_icon(recommendation: str) -> str:
    mapping = {
        "OVER": "🔺 OVER",
        "UNDER": "🔻 UNDER",
        "SKIP": "⏭  SKIP",
        "NO LINE": "❓ NO LINE",
    }
    return mapping.get(recommendation, recommendation)


def display_score_projections(projections: list[analytics.GameProjection]) -> None:
    """Display the 5-Factor Score Projection table for all games."""
    print_rule("📊  5-FACTOR SCORE PROJECTION — TODAY'S SLATE")
    console.print()

    if not projections:
        console.print("[red_bright]No game data available.[/]")
        return

    # Main projection table
    main_table = Table(
        title="[gold]Game Totals — 5-Factor Projection Engine[/]",
        box=box.DOUBLE_EDGE,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    main_table.add_column("Matchup", style="white", min_width=30)
    main_table.add_column("Venue", style="dim_text", min_width=22)
    main_table.add_column("Book Line", justify="center", min_width=10)
    main_table.add_column("📐 Projection", justify="center", min_width=12)
    main_table.add_column("Edge", justify="center", min_width=8)
    main_table.add_column("Weather", min_width=20)
    main_table.add_column("Recommendation", justify="center", min_width=14)

    over_count = under_count = skip_count = 0

    for proj in projections:
        if proj.recommendation == "OVER":
            over_count += 1
        elif proj.recommendation == "UNDER":
            under_count += 1
        else:
            skip_count += 1

        book_line = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
        proj_str = f"[accent]{proj.projected_total:.2f}[/]"
        edge_str = "N/A"
        if proj.edge is not None:
            sign = "+" if proj.edge >= 0 else ""
            edge_style = "green_bright" if proj.edge >= 0.75 else ("red_bright" if proj.edge <= -0.75 else "dim_text")
            edge_str = f"[{edge_style}]{sign}{proj.edge:.2f}[/]"

        wind_icon = {"out": "💨→", "in": "←💨", "none": "🏟", "crosswind": "↕💨"}.get(
            proj.wind_direction, ""
        )
        weather_str = (
            f"{wind_icon}{proj.wind_speed_mph:.0f}mph · {proj.temp_f:.0f}°F\n"
            f"[dim_text]{proj.conditions}[/]"
        )
        if proj.weather_adjustment != 0:
            adj_sign = "+" if proj.weather_adjustment > 0 else ""
            weather_str += f"\n[accent]Adj: {adj_sign}{proj.weather_adjustment:.2f}[/]"

        rec_style = _rec_style(proj.recommendation)
        rec_str = f"[{rec_style}]{_rec_icon(proj.recommendation)}[/]"

        main_table.add_row(
            escape(proj.matchup),
            escape(proj.venue[:22]),
            book_line,
            proj_str,
            edge_str,
            weather_str,
            rec_str,
        )

    console.print(main_table)
    console.print()

    # Summary badges
    summary_parts = [
        Panel(f"[over]{over_count} OVER[/]", border_style="green", padding=(0, 3)),
        Panel(f"[under]{under_count} UNDER[/]", border_style="red", padding=(0, 3)),
        Panel(f"[skip]{skip_count} SKIP[/]", border_style="dim", padding=(0, 3)),
    ]
    console.print(Columns(summary_parts, align="center"))
    console.print()

    # Detailed breakdown for actionable games
    actionable = [p for p in projections if p.recommendation in ("OVER", "UNDER")]
    if actionable:
        print_rule("Detailed Factor Breakdown — Actionable Games")
        console.print()
        for proj in actionable:
            _display_game_detail(proj)


def _display_game_detail(proj: analytics.GameProjection) -> None:
    """Display detailed factor breakdown for a single game projection."""
    rec_style = _rec_style(proj.recommendation)
    rec_icon = _rec_icon(proj.recommendation)

    detail_table = Table(
        box=box.SIMPLE,
        show_header=False,
        padding=(0, 2),
    )
    detail_table.add_column("Factor", style="dim_text", min_width=32)
    detail_table.add_column("Value", style="accent", justify="right")

    detail_table.add_row("Home Starter Expected Runs", f"{proj.home_starter_expected_runs:.3f}")
    detail_table.add_row("Away Starter Expected Runs", f"{proj.away_starter_expected_runs:.3f}")
    detail_table.add_row("Home Bullpen Expected Runs", f"{proj.home_bullpen_expected_runs:.3f}")
    detail_table.add_row("Away Bullpen Expected Runs", f"{proj.away_bullpen_expected_runs:.3f}")
    detail_table.add_row(Rule(style="dim"), "")
    detail_table.add_row("Home Team Expected Score", f"{proj.home_team_expected_score:.3f}")
    detail_table.add_row("Away Team Expected Score", f"{proj.away_team_expected_score:.3f}")
    detail_table.add_row(f"Park Factor  ({escape(proj.venue[:20])})", f"× {proj.park_factor:.2f}")
    detail_table.add_row("Raw Total (pre-weather)", f"{proj.raw_total:.3f}")
    adj_sign = "+" if proj.weather_adjustment >= 0 else ""
    detail_table.add_row("Weather Adjustment", f"{adj_sign}{proj.weather_adjustment:.2f}")
    detail_table.add_row(Rule(style="dim"), "")
    detail_table.add_row(
        "[bold white]Projected Total[/]",
        f"[bold accent]{proj.projected_total:.2f}[/]",
    )
    detail_table.add_row("Book Line", f"{proj.ou_line:.1f}" if proj.ou_line else "N/A")
    edge_sign = "+" if (proj.edge or 0) >= 0 else ""
    detail_table.add_row("Edge", f"{edge_sign}{proj.edge:.2f}" if proj.edge is not None else "N/A")

    console.print(
        Panel(
            detail_table,
            title=f"[bold white]{escape(proj.matchup)}[/]  [{rec_style}]{rec_icon}[/]",
            border_style=rec_style if proj.recommendation != "SKIP" else "dim",
            padding=(0, 2),
        )
    )
    console.print()


# ==============================================================================
# STRATEGY 3: PITCHER PROPS & ANCHOR SYSTEM DISPLAY
# ==============================================================================

def display_pitcher_props(
    pitcher_props: list[analytics.PitcherPropRecommendation],
    anchor_slips: list[analytics.AnchorSlip],
) -> None:
    """Display pitcher goblin props and 2-man anchor slips."""
    print_rule("⚡  PITCHER PROPS & ANCHOR SYSTEM")
    console.print()

    # ---- Goblin Props Table ----
    goblin_table = Table(
        title="[gold]🎲 Elite Pitcher Goblin Strikeout Props[/]",
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    goblin_table.add_column("Pitcher", style="white", min_width=22)
    goblin_table.add_column("Team", style="dim_text", min_width=14)
    goblin_table.add_column("K/9", justify="center", min_width=8)
    goblin_table.add_column("Avg PC", justify="center", min_width=8)
    goblin_table.add_column("Goblin Line", justify="center", min_width=12)
    goblin_table.add_column("Full Prop Line", justify="center", min_width=14)
    goblin_table.add_column("Recommendation", style="green_bright", min_width=24)

    for prop in pitcher_props:
        goblin_table.add_row(
            escape(prop.pitcher_name),
            escape(prop.team),
            f"[accent]{prop.k_per9:.1f}[/]",
            str(prop.avg_pitch_count),
            f"[gold]{prop.goblin_line:.1f} K[/]",
            f"{prop.full_prop_line:.1f} K",
            f"[green_bright]{escape(prop.prop_label)}[/]",
        )

    if not pitcher_props:
        goblin_table.add_row("[dim_text]No qualifying pitchers today.[/]", "", "", "", "", "", "")

    console.print(goblin_table)
    console.print()

    # ---- Anchor Slip Table ----
    anchor_table = Table(
        title="[gold]🔗 2-Man Anchor Slips (Pitcher K + Batter Hits)[/]",
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    anchor_table.add_column("#", style="dim_text", width=4, justify="center")
    anchor_table.add_column("Pitcher Prop (Leg 1)", style="white", min_width=30)
    anchor_table.add_column("Batter Prop (Leg 2)", style="white", min_width=28)
    anchor_table.add_column("Confidence", justify="center", min_width=12)

    for idx, slip in enumerate(anchor_slips, start=1):
        conf_style = {
            "High": "green_bright",
            "Medium": "gold",
            "Low": "red_bright",
        }.get(slip.pair_confidence, "white")

        anchor_table.add_row(
            str(idx),
            f"[accent]{escape(slip.pitcher_prop.pitcher_name)}[/]\n"
            f"[dim_text]{escape(slip.pitcher_prop.prop_label or slip.pitcher_prop.pitcher_name)}[/]",
            f"[gold]{escape(slip.batter_name)}[/]  [{escape(slip.batter_team[:3].upper())}]\n"
            f"[dim_text]{escape(slip.batter_prop_label)}[/]",
            f"[{conf_style}]{slip.pair_confidence}[/]",
        )

    if not anchor_slips:
        anchor_table.add_row("[dim_text]No qualifying anchor slips today.[/]", "", "", "")

    console.print(anchor_table)
    console.print()


# ==============================================================================
# BANKROLL MANAGER DISPLAY
# ==============================================================================

def display_bankroll_dashboard() -> None:
    """Display the full bankroll management dashboard and prompt for edits."""
    print_rule("💰  BANKROLL MANAGER")
    console.print()

    br_state = bankroll.load_state()
    summary = bankroll.build_summary(br_state)

    # Status panel
    used_pct = bankroll.get_budget_utilization_pct(br_state)
    bar_len = 30
    filled = int(used_pct * bar_len)
    bar = "[green_bright]" + "█" * filled + "[/]" + "[dim_text]░" * (bar_len - filled) + "[/]"

    status_lines = (
        f"[dim_text]Balance:[/]             [bold white]${summary.balance:>10,.2f}[/]\n"
        f"[dim_text]1 Unit Value:[/]        [accent]${summary.unit_value:>10,.2f}[/]\n"
        f"[dim_text]Max Daily Risk (10%):[/] [gold]${summary.max_daily_risk:>10,.2f}[/]\n"
        f"[dim_text]Used Today:[/]          [orange]${summary.daily_budget_used:>10,.2f}[/]\n"
        f"[dim_text]Remaining Budget:[/]    [green_bright]${summary.remaining_daily_budget:>10,.2f}[/]\n"
        f"[dim_text]Daily Budget:[/]        {bar}  [dim_text]{used_pct:.1%}[/]\n"
        f"[dim_text]Last Updated:[/]        [dim_text]{summary.last_updated}[/]"
    )

    console.print(
        Panel(
            status_lines,
            title="[gold]💼 Current Bankroll State[/]",
            border_style="panel_border",
            padding=(1, 4),
        )
    )
    console.print()

    # Stake allocations table
    alloc_table = Table(
        title="[gold]🎰 Recommended Stake Allocations[/]",
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        padding=(0, 2),
    )
    alloc_table.add_column("Parlay Size", style="white", justify="center", min_width=14)
    alloc_table.add_column("Units", style="accent", justify="center", min_width=8)
    alloc_table.add_column("Dollar Stake ($)", style="green_bright", justify="right", min_width=16)
    alloc_table.add_column("Risk Level", justify="center", min_width=12)

    risk_colors = {
        "Standard": "green_bright",
        "Moderate": "gold",
        "Reduced": "orange",
        "Lottery": "red_bright",
    }

    for n_legs in sorted(summary.allocations.keys()):
        alloc = summary.allocations[n_legs]
        color = risk_colors.get(alloc.risk_label, "white")
        alloc_table.add_row(
            f"{n_legs}-Leg Parlay",
            f"{alloc.unit_multiplier:.2f}u",
            f"${alloc.dollar_stake:.2f}",
            f"[{color}]{alloc.risk_label}[/]",
        )

    console.print(alloc_table)
    console.print()

    # Edit menu
    _bankroll_edit_menu(br_state)


def _bankroll_edit_menu(br_state: bankroll.BankrollState) -> None:
    """Interactive sub-menu for bankroll editing."""
    edit_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    edit_table.add_column("Key", style="gold", width=5)
    edit_table.add_column("Action", style="white")

    edit_items = [
        ("A", "Set balance to new amount"),
        ("B", "Deposit / top-up funds"),
        ("C", "Record a losing bet (deduct stake)"),
        ("D", "Record a winning bet (add profit)"),
        ("R", "Reset bankroll to $1,000 default"),
        ("Q", "Back to Main Menu"),
    ]
    for k, v in edit_items:
        edit_table.add_row(k, v)

    console.print(
        Panel(
            edit_table,
            title="[gold]✏  Edit Options[/]",
            border_style="panel_border",
            padding=(0, 2),
        )
    )

    choice = Prompt.ask(
        "[accent]Select action[/]",
        choices=["A", "B", "C", "D", "R", "Q", "a", "b", "c", "d", "r", "q"],
        show_choices=False,
    ).upper()

    try:
        if choice == "A":
            amount = FloatPrompt.ask("[gold]Enter new balance ($)[/]")
            new_state = bankroll.set_balance(amount)
            console.print(f"\n[green_bright]✔  Balance set to ${new_state.balance:,.2f}[/]\n")

        elif choice == "B":
            amount = FloatPrompt.ask("[gold]Deposit amount ($)[/]")
            new_state = bankroll.add_to_balance(amount)
            console.print(f"\n[green_bright]✔  Deposited ${amount:.2f}. New balance: ${new_state.balance:,.2f}[/]\n")

        elif choice == "C":
            amount = FloatPrompt.ask("[red_bright]Bet stake to deduct ($)[/]")
            new_state = bankroll.record_loss(amount)
            new_state = bankroll.record_bet(amount)
            console.print(f"\n[orange]↓  Stake ${amount:.2f} deducted. Balance: ${new_state.balance:,.2f}[/]\n")

        elif choice == "D":
            profit = FloatPrompt.ask("[green_bright]Net profit to add ($)[/]")
            new_state = bankroll.record_win(profit)
            console.print(f"\n[green_bright]↑  Profit ${profit:.2f} added. Balance: ${new_state.balance:,.2f}[/]\n")

        elif choice == "R":
            confirm = Confirm.ask("[red_bright]Reset bankroll to $1,000?[/]")
            if confirm:
                new_state = bankroll.reset_bankroll()
                console.print(f"\n[orange]⚠  Bankroll reset to ${new_state.balance:,.2f}[/]\n")

        elif choice == "Q":
            pass

    except (ValueError, KeyboardInterrupt) as exc:
        console.print(f"\n[red_bright]Error: {escape(str(exc))}[/]\n")


# ==============================================================================
# GENERIC UTILITY DISPLAYS
# ==============================================================================

def display_error(message: str) -> None:
    """Display a styled error message."""
    console.print(
        Panel(
            f"[red_bright]⚠  {escape(message)}[/]",
            border_style="red",
            padding=(0, 2),
        )
    )


def display_success(message: str) -> None:
    """Display a styled success message."""
    console.print(f"\n[green_bright]✔  {escape(message)}[/]\n")


def display_info(message: str) -> None:
    """Display a styled informational message."""
    console.print(f"[dim_text]ℹ  {escape(message)}[/]")


def press_enter_to_continue() -> None:
    """Pause and wait for user to press Enter."""
    console.print("\n[dim_text]Press [Enter] to return to the main menu…[/]")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        pass


def display_exit_message() -> None:
    """Display a styled goodbye message."""
    console.print()
    console.print(
        Align.center(
            Panel(
                "[gold]⚾  Thank you for using MLB Analytics System.[/]\n"
                "[dim_text]Bet responsibly. Always track your edge.[/]",
                border_style="panel_border",
                padding=(1, 6),
            )
        )
    )
    console.print()
