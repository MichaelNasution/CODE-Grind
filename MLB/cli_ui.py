"""
cli_ui.py
=========
Modern, aesthetic CLI interface using the `rich` library.

Renders:
  - Animated header banner
  - 4-option interactive main menu (Moneyline / Under HR / Score Projection / Exit)
  - Strategy D: Moneyline Strong Recommendation tables + parlay slips
  - Strategy A: Under HR Parlay slip tables
  - Strategy B: 5-Factor Score Projection tables
  - Strategy C: Pitcher Props & Anchor slip panels
  - Progress spinners for data fetching
"""

from __future__ import annotations

from rich import box
from rich.align import Align
from rich.columns import Columns
from rich.console import Console
from rich.markup import escape
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.prompt import Confirm, FloatPrompt, Prompt
from rich.rule import Rule
from rich.table import Table
from rich.text import Text
from rich.theme import Theme

import analytics

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

BANNER_TEXT = r"""
  ███╗   ███╗██╗     ██████╗      █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗████████╗██╗ ██████╗███████╗
  ████╗ ████║██║     ██╔══██╗    ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝╚══██╔══╝██║██╔════╝██╔════╝
  ██╔████╔██║██║     ██████╔╝    ███████║██╔██╗ ██║███████║██║   ╚████╔╝    ██║   ██║██║     ███████╗
  ██║╚██╔╝██║██║     ██╔══██╗    ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝     ██║   ██║██║     ╚════██║
  ██║ ╚═╝ ██║███████╗██████╔╝    ██║  ██║██║ ╚████║██║  ██║███████╗██║      ██║   ██║╚██████╗███████║
  ╚═╝     ╚═╝╚══════╝╚═════╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝      ╚═╝   ╚═╝ ╚═════╝╚══════╝
"""


def print_banner() -> None:
    console.print()
    console.print(Align.center(Text(BANNER_TEXT, style="bold #00d4ff")))
    console.print(Align.center(Text(
        "⚾  Quantitative MLB Handicapping System  |  v2.0.0  |  Production Grade",
        style="bold #ffd700",
    )))
    console.print(Align.center(Text(
        "Powered by MLB StatsAPI  ·  Open-Meteo  ·  The Odds API",
        style="dim #6699cc",
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
# MAIN MENU (4 options — no Bankroll Manager)
# ==============================================================================

def print_main_menu() -> None:
    menu_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    menu_table.add_column("Num", style="gold", width=5)
    menu_table.add_column("Option", style="bold white")
    menu_table.add_column("Desc", style="dim_text")

    menu_items = [
        ("1", "🏆  Moneyline Strong Recommendations",
         "Win Confidence Picks | Slips: 3 / 4 / 5 / 8 / 10 legs"),
        ("2", "🎯  Under Home Run Parlay Screener",
         "True No-HR Prob | Slips: 3 / 4 / 5 / 8 / 10 legs"),
        ("3", "📊  5-Factor Score Projection (O/U)",
         "Today's full game slate | OVER / UNDER / SKIP"),
        ("4", "🚪  Exit", ""),
    ]
    for num, opt, desc in menu_items:
        menu_table.add_row(num, opt, desc)

    console.print(Panel(
        menu_table,
        title="[gold]⚾  MAIN MENU[/]",
        subtitle="[dim_text]Select a strategy to analyze today's MLB slate[/]",
        border_style="panel_border",
        padding=(1, 3),
    ))


def get_menu_choice() -> str:
    return Prompt.ask(
        "\n[accent]Select option[/]",
        choices=["1", "2", "3", "4"],
        show_choices=True,
    )


# ==============================================================================
# STRATEGY D: MONEYLINE STRONG RECOMMENDATION DISPLAY
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


def display_moneyline_results(
    candidates: list[analytics.MoneylineCandidate],
    slips_by_legs: dict[int, list[analytics.MoneylineSlip]],
) -> None:
    """Display the full Moneyline Screener results: candidates table + all parlay slips."""
    print_rule("🏆  MONEYLINE STRONG RECOMMENDATION SCREENER — RESULTS")
    console.print()

    if not candidates:
        console.print(Panel(
            "[red_bright]No qualifying teams found for today's slate.[/]\n"
            "[dim_text]No team clears the Win Confidence threshold (>= 65%).[/]",
            border_style="red", padding=(1, 3),
        ))
        return

    # ── Qualified Candidates Table ──────────────────────────────────────────
    cand_table = Table(
        title="[gold]🎯 Qualified Moneyline Picks — Sorted by Win Confidence[/]",
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
        matchup_str = (
            f"vs {escape(cand.opponent_team[:18])}\n"
            f"[dim_text]opp: {escape(cand.opponent_pitcher[:16])}[/]"
        )
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

    # ── Factor Key (legend) ────────────────────────────────────────────────
    legend = (
        "[dim_text]  Weights → ERA Advantage:[/] [accent]35%[/]"
        " [dim_text]| Recent Form:[/] [accent]30%[/]"
        " [dim_text]| OPS Matchup:[/] [accent]25%[/]"
        " [dim_text]| WHIP Advantage:[/] [accent]10%[/]"
        f"  |  [dim_text]Threshold:[/] [gold]>= {analytics.MIN_ML_WIN_CONFIDENCE:.0%}[/]"
    )
    console.print(legend)
    console.print()

    if not slips_by_legs:
        console.print("[dim_text]Not enough qualified teams to generate parlay slips.[/]")
        return

    # ── Parlay Slip Tables ─────────────────────────────────────────────────
    print_rule("🎰  Moneyline Parlay Slips")
    console.print()

    for n_legs in sorted(slips_by_legs.keys()):
        slip_list = slips_by_legs[n_legs]
        if not slip_list:
            continue
        _display_ml_slip_table(slip_list, n_legs)
        console.print()


def _display_ml_slip_table(
    slips: list[analytics.MoneylineSlip],
    n_legs: int,
) -> None:
    """Render a parlay slip table for a given leg count."""
    table = Table(
        title=f"[gold]{n_legs}-LEG MONEYLINE PARLAY SLIPS[/]",
        box=box.ROUNDED,
        border_style="panel_border",
        header_style="table_header",
        show_lines=True,
        padding=(0, 1),
    )
    table.add_column("#",             justify="center", width=4)
    table.add_column("Legs  (Team · ML · Confidence)", min_width=55, no_wrap=False)
    table.add_column("Combined\nConf %", justify="center", min_width=12)
    table.add_column("Parlay Odds\n(American)", justify="center", min_width=14)
    table.add_column("Book Implied\nProb %",  justify="center", min_width=13)
    table.add_column("EV Edge",       justify="center", min_width=10)

    display_slips = slips[:5]

    for idx, slip in enumerate(display_slips, start=1):
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
        conf_st        = _conf_style(slip.combined_confidence + 0.2)  # shift for parlay display

        table.add_row(
            str(idx),
            legs_str,
            f"[{conf_st}]{comb_conf_str}[/]",
            f"[gold]{odds_str}[/]",
            f"[dim_text]{implied_str}[/]",
            f"[{ev_st}]{ev_str}[/]",
        )

    if len(slips) > 5:
        table.add_row(
            "...",
            f"[dim_text]+ {len(slips) - 5} more combinations available[/]",
            "", "", "", "",
        )

    console.print(table)


# ==============================================================================
# STRATEGY A: UNDER HOME RUN PARLAY DISPLAY
# ==============================================================================

def _prob_style(prob: float) -> str:
    if prob >= 0.97:
        return "high_prob"
    elif prob >= 0.95:
        return "med_prob"
    return "low_prob"


def display_under_hr_results(
    slips_by_legs: dict[int, list[analytics.ParlaySlip]],
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

    # Summary header
    total_candidates: set[int] = set()
    for slips in slips_by_legs.values():
        for slip in slips:
            for leg in slip.legs:
                total_candidates.add(leg.batter_id)

    import config
    console.print(Panel(
        f"[dim_text]Qualified Batters:[/] [green_bright]{len(total_candidates)}[/]  "
        f"[dim_text]| HR/9 Threshold:[/] [accent]<= {config.MAX_HR9_FOR_TOP_PITCHER}[/]  "
        f"[dim_text]| Min True No-HR Prob:[/] [accent]>= {config.MIN_TRUE_NO_HR_PROBABILITY:.0%}[/]  "
        f"[dim_text]| Min H2H PA:[/] [accent]{config.MIN_PLATE_APPEARANCES_H2H}[/]",
        title="[gold]Screening Summary[/]", border_style="panel_border", padding=(0, 2),
    ))
    console.print()

    for n_legs in sorted(slips_by_legs.keys()):
        slips = slips_by_legs[n_legs]
        if not slips:
            continue

        table = Table(
            title=(
                f"[gold]{n_legs}-LEG UNDER HR PARLAY SLIPS[/]"
            ),
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
# STRATEGY B: 5-FACTOR SCORE PROJECTION DISPLAY
# ==============================================================================

def _rec_style(rec: str) -> str:
    return {"OVER": "over", "UNDER": "under", "SKIP": "skip", "NO LINE": "dim_text"}.get(rec, "white")


def _rec_icon(rec: str) -> str:
    return {"OVER": "OVER", "UNDER": "UNDER", "SKIP": "SKIP", "NO LINE": "NO LINE"}.get(rec, rec)


def display_score_projections(projections: list[analytics.GameProjection]) -> None:
    print_rule("SCORE PROJECTION  5-FACTOR ENGINE")
    console.print()

    if not projections:
        console.print("[red_bright]No game data available.[/]")
        return

    main_table = Table(
        title="[gold]Game Totals — 5-Factor Projection Engine[/]",
        box=box.DOUBLE_EDGE, border_style="panel_border",
        header_style="table_header", show_lines=True, padding=(0, 1),
    )
    main_table.add_column("Matchup",          style="white",    min_width=30)
    main_table.add_column("Venue",            style="dim_text", min_width=20)
    main_table.add_column("Book Line",        justify="center", min_width=10)
    main_table.add_column("Projection",       justify="center", min_width=12)
    main_table.add_column("Edge",             justify="center", min_width=8)
    main_table.add_column("Weather",          min_width=20)
    main_table.add_column("Recommendation",   justify="center", min_width=14)

    over_count = under_count = skip_count = 0

    for proj in projections:
        if proj.recommendation == "OVER":   over_count  += 1
        elif proj.recommendation == "UNDER": under_count += 1
        else:                                skip_count  += 1

        book_line = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
        proj_str  = f"[accent]{proj.projected_total:.2f}[/]"
        edge_str  = "N/A"
        if proj.edge is not None:
            sign  = "+" if proj.edge >= 0 else ""
            est   = "green_bright" if proj.edge >= 0.75 else ("red_bright" if proj.edge <= -0.75 else "dim_text")
            edge_str = f"[{est}]{sign}{proj.edge:.2f}[/]"

        w_icon = {"out": ">", "in": "<", "none": "~", "crosswind": "x"}.get(proj.wind_direction, "")
        weather_str = (
            f"{w_icon}{proj.wind_speed_mph:.0f}mph  {proj.temp_f:.0f}F\n"
            f"[dim_text]{proj.conditions[:18]}[/]"
        )
        if proj.weather_adjustment != 0:
            sign = "+" if proj.weather_adjustment > 0 else ""
            weather_str += f"\n[accent]{sign}{proj.weather_adjustment:.2f} adj[/]"

        rec_st  = _rec_style(proj.recommendation)
        rec_str = f"[{rec_st}]{_rec_icon(proj.recommendation)}[/]"

        main_table.add_row(
            escape(proj.matchup),
            escape(proj.venue[:20]),
            book_line,
            proj_str,
            edge_str,
            weather_str,
            rec_str,
        )

    console.print(main_table)
    console.print()

    summary_parts = [
        Panel(f"[over]  {over_count} OVER  [/]", border_style="green", padding=(0, 3)),
        Panel(f"[under]  {under_count} UNDER  [/]", border_style="red",   padding=(0, 3)),
        Panel(f"[skip]  {skip_count} SKIP  [/]", border_style="dim",   padding=(0, 3)),
    ]
    console.print(Columns(summary_parts, align="center"))
    console.print()

    actionable = [p for p in projections if p.recommendation in ("OVER", "UNDER")]
    if actionable:
        print_rule("Detailed Breakdown — Actionable Games")
        console.print()
        for proj in actionable:
            _display_game_detail(proj)


def _display_game_detail(proj: analytics.GameProjection) -> None:
    rec_st = _rec_style(proj.recommendation)
    detail = Table(box=box.SIMPLE, show_header=False, padding=(0, 2))
    detail.add_column("Factor", style="dim_text", min_width=32)
    detail.add_column("Value",  style="accent",   justify="right")
    detail.add_row("Home Starter Expected Runs", f"{proj.home_starter_expected_runs:.3f}")
    detail.add_row("Away Starter Expected Runs", f"{proj.away_starter_expected_runs:.3f}")
    detail.add_row("Home Bullpen Expected Runs", f"{proj.home_bullpen_expected_runs:.3f}")
    detail.add_row("Away Bullpen Expected Runs", f"{proj.away_bullpen_expected_runs:.3f}")
    detail.add_row(Rule(style="dim"), "")
    detail.add_row("Home Expected Score", f"{proj.home_team_expected_score:.3f}")
    detail.add_row("Away Expected Score", f"{proj.away_team_expected_score:.3f}")
    detail.add_row(f"Park Factor ({escape(proj.venue[:18])})", f"x {proj.park_factor:.2f}")
    detail.add_row("Raw Total (pre-weather)", f"{proj.raw_total:.3f}")
    sign = "+" if proj.weather_adjustment >= 0 else ""
    detail.add_row("Weather Adjustment", f"{sign}{proj.weather_adjustment:.2f}")
    detail.add_row(Rule(style="dim"), "")
    detail.add_row("[bold white]Projected Total[/]", f"[bold accent]{proj.projected_total:.2f}[/]")
    detail.add_row("Book Line", f"{proj.ou_line:.1f}" if proj.ou_line else "N/A")
    es = "+" if (proj.edge or 0) >= 0 else ""
    detail.add_row("Edge", f"{es}{proj.edge:.2f}" if proj.edge is not None else "N/A")

    console.print(Panel(
        detail,
        title=f"[bold white]{escape(proj.matchup)}[/]  [{rec_st}]{_rec_icon(proj.recommendation)}[/]",
        border_style=rec_st if proj.recommendation != "SKIP" else "dim",
        padding=(0, 2),
    ))
    console.print()


# ==============================================================================
# STRATEGY C: PITCHER PROPS & ANCHOR DISPLAY
# ==============================================================================

def display_pitcher_props(
    pitcher_props: list[analytics.PitcherPropRecommendation],
    anchor_slips: list[analytics.AnchorSlip],
) -> None:
    print_rule("PITCHER PROPS  AND  ANCHOR SYSTEM")
    console.print()

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
    goblin_tbl.add_column("Full Prop Line",  justify="center", min_width=14)
    goblin_tbl.add_column("Recommendation",  style="green_bright", min_width=24)

    for prop in pitcher_props:
        goblin_tbl.add_row(
            escape(prop.pitcher_name), escape(prop.team),
            f"[accent]{prop.k_per9:.1f}[/]", str(prop.avg_pitch_count),
            f"[gold]{prop.goblin_line:.1f} K[/]", f"{prop.full_prop_line:.1f} K",
            f"[green_bright]{escape(prop.prop_label)}[/]",
        )
    if not pitcher_props:
        goblin_tbl.add_row("[dim_text]No qualifying pitchers today[/]", "", "", "", "", "", "")

    console.print(goblin_tbl)
    console.print()

    anchor_tbl = Table(
        title="[gold]2-Man Anchor Slips (Pitcher K + Batter Hits)[/]",
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
            f"[accent]{escape(slip.pitcher_prop.pitcher_name)}[/]\n"
            f"[dim_text]{escape(slip.pitcher_prop.prop_label or slip.pitcher_prop.pitcher_name)}[/]",
            f"[gold]{escape(slip.batter_name)}[/]\n"
            f"[dim_text]{escape(slip.batter_prop_label)}[/]",
            f"[{conf_st}]{slip.pair_confidence}[/]",
        )
    if not anchor_slips:
        anchor_tbl.add_row("[dim_text]No qualifying slips today[/]", "", "", "")

    console.print(anchor_tbl)
    console.print()


# ==============================================================================
# GENERIC UTILITY
# ==============================================================================

def display_error(message: str) -> None:
    console.print(Panel(
        f"[red_bright]{escape(message)}[/]",
        border_style="red", padding=(0, 2),
    ))


def display_info(message: str) -> None:
    console.print(f"[dim_text]{escape(message)}[/]")


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
