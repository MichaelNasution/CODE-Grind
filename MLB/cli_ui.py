"""
cli_ui.py
=========
Rich UI v5.0 — Color-coded Win Confidence Trust Table + Full Bet Slip Suite Panel.

Color trust indicators:
  🟢 HIGH   (>= 65.0%) — bold green
  🟡 MEDIUM (58.0-64.9%) — bold yellow
  🟠 PASS   (50.0-57.9%) — bold orange

Bet Slip Suite rendered per Menu 2:
  Anchor 2-Leg, 3-Leg, 4-Leg, 3-of-5 Combo, 5-Leg, 6-Leg, 8-Leg Ultimate.
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
# THEME
# ==============================================================================
MLB_THEME = Theme({
    "header":       "bold bright_white on #0a1628",
    "accent":       "bold #00d4ff",
    "gold":         "bold #ffd700",
    "green_bright": "bold #00ff88",
    "red_bright":   "bold #ff4444",
    "orange":       "bold #ff8c00",
    "yellow_bold":  "bold #ffe066",
    "dim_text":     "dim #aaaaaa",
    "panel_border": "#1a4a8a",
    "table_header": "bold #00d4ff on #0f1e35",
    # Trust colours
    "trust_high":   "bold #00ff88",      # GREEN
    "trust_medium": "bold #ffe066",      # YELLOW
    "trust_pass":   "bold #ff8c00",      # ORANGE
})

console = Console(theme=MLB_THEME, highlight=False, width=100)


# ==============================================================================
# MLB TEAM TRI-CODES MAPPING
# ==============================================================================

MLB_TRI_CODES: dict[str, str] = {
    "New York Yankees":      "NYY",
    "Boston Red Sox":        "BOS",
    "Baltimore Orioles":     "BAL",
    "Toronto Blue Jays":     "TOR",
    "Tampa Bay Rays":        "TB",
    "Philadelphia Phillies": "PHI",
    "Atlanta Braves":        "ATL",
    "New York Mets":         "NYM",
    "Miami Marlins":         "MIA",
    "Washington Nationals":  "WSH",
    "Cleveland Guardians":   "CLE",
    "Detroit Tigers":        "DET",
    "Minnesota Twins":       "MIN",
    "Kansas City Royals":    "KC",
    "Chicago White Sox":     "CWS",
    "Milwaukee Brewers":     "MIL",
    "St. Louis Cardinals":   "STL",
    "Chicago Cubs":          "CHC",
    "Pittsburgh Pirates":    "PIT",
    "Cincinnati Reds":       "CIN",
    "Houston Astros":        "HOU",
    "Texas Rangers":         "TEX",
    "Seattle Mariners":      "SEA",
    "Oakland Athletics":     "OAK",
    "Los Angeles Angels":    "LAA",
    "Los Angeles Dodgers":   "LAD",
    "San Francisco Giants":  "SF",
    "Arizona Diamondbacks":  "ARI",
    "San Diego Padres":      "SD",
    "Colorado Rockies":      "COL",
}

# Trust level display mapping
_TRUST_ICON: dict[str, str] = {
    "HIGH":   "🟢",
    "MEDIUM": "🟡",
    "PASS":   "🟠",
}
_TRUST_STYLE: dict[str, str] = {
    "HIGH":   "trust_high",
    "MEDIUM": "trust_medium",
    "PASS":   "trust_pass",
}
_TRUST_LABEL: dict[str, str] = {
    "HIGH":   "LOCK",
    "MEDIUM": "QUALIFIED",
    "PASS":   "BORDERLINE",
}


def get_team_tri_code(full_name: str) -> str:
    if full_name in MLB_TRI_CODES:
        return MLB_TRI_CODES[full_name]
    parts = full_name.split()
    if len(parts) >= 2:
        return "".join(p[0] for p in parts)[:3].upper()
    return full_name[:3].upper()


def format_team_display(full_name: str, is_home: bool) -> str:
    code = get_team_tri_code(full_name)
    loc  = "H" if is_home else "A"
    return f"{code} ({loc})"


# ==============================================================================
# BANNER & HEADER
# ==============================================================================

def clear_screen() -> None:
    console.clear()


def print_banner() -> None:
    console.print(Align.center(Text(
        "⚾  MLB QUANTITATIVE ANALYTICS ENGINE  |  v5.0",
        style="bold #00d4ff",
    )))
    console.print(Align.center(Text(
        "Color-Coded Trust · 7-Type Slip Suite · 4-Day Calibration · 5-Props",
        style="dim #6699cc",
    )))
    console.print()


def display_analysis_header(date_str: str, is_live_data: bool = True) -> None:
    dt_obj   = date.fromisoformat(date_str)
    day_name = dt_obj.strftime("%A")

    header_text = Text()
    header_text.append("📅 Date: ", style="bold dim_text")
    header_text.append(f"{day_name[:3]}, {date_str}", style="bold gold")

    if is_live_data:
        header_text.append("  |  [LIVE VERIFIED]", style="bold green_bright")
    else:
        header_text.append("  |  [MOCK / UNVERIFIED]", style="bold orange")

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

    today_dt    = date.today()
    tomorrow_dt = today_dt + timedelta(days=1)
    today_str   = today_dt.strftime("%Y-%m-%d")
    tomorrow_str = tomorrow_dt.strftime("%Y-%m-%d")

    menu_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    menu_table.add_column("Key",    style="gold", width=4)
    menu_table.add_column("Option", style="bold white")
    menu_table.add_column("Date",   style="accent")

    menu_table.add_row("A", "Hari Ini (Today)",    today_str)
    menu_table.add_row("B", "Besok (Tomorrow)",    tomorrow_str)
    menu_table.add_row("C", "Custom Date",         "Format: YYYY-MM-DD")

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
# MAIN MENU
# ==============================================================================

def get_main_menu_items() -> list[tuple[str, str]]:
    return [
        ("1",  "🚀  Ultimate Slate-Wide Moneyline Slip  (Full Matchday Mega Slip)"),
        ("2",  "🏆  Moneyline Trust Screener + Full Slip Suite  (2,3,4,3-5,5,6,8 Legs)"),
        ("3",  "🎯  Under 0.5 Home Run Parlays  (Win Rate 90% | Slips 3,4,5,8,10 Legs)"),
        ("4",  "⚾  Under 1.5 Hits Screener  (Win Rate 70%+ | Single vs 2-Team Parlay)"),
        ("5",  "🔥  Alternate Team Total Over 1.5 Runs  (Win Rate 90%)"),
        ("6",  "🎯  At-Bat Outcome 'Out or Error' Targets  ($100/Day Flat Stake)"),
        ("7",  "📊  5-Factor Total Score Projection  (Over / Under Total Runs)"),
        ("8",  "🔄  4-Day Historical Calibration Engine Log  (H-4 to H-1)"),
        ("9",  "💰  Bankroll Status & Sportsbook Line Shopping"),
        ("10", "📅  Ganti Tanggal / Keluar"),
    ]


def print_main_menu() -> None:
    table = Table(show_header=False, box=box.SIMPLE, padding=(0, 1))
    table.add_column("Num",             style="gold", width=3)
    table.add_column("Strategy / Option", style="bold white")

    for num, opt in get_main_menu_items():
        table.add_row(num, opt)

    console.print(Panel(
        table,
        title="[gold]⚾  MAIN MENU — MLB ANALYTICS V5.0[/]",
        border_style="panel_border",
        padding=(0, 2),
    ))


def get_menu_choice() -> str:
    return Prompt.ask(
        "\n[accent]Select option[/]",
        choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        show_choices=True,
    )


# ==============================================================================
# MENU 1: ULTIMATE SLATE-WIDE SLIP
# ==============================================================================

def display_ultimate_slate_slip(
    slip: analytics.MoneylineSlip | None,
    bankroll_summary: bankroll.BankrollSummary | None,
) -> None:
    clear_screen()
    print_banner()
    print_rule("🚀  ULTIMATE SLATE-WIDE MONEYLINE SLIP (ALL GAMES MEGA SLIP)")

    if not slip:
        console.print("[red_bright]Not enough candidate games to build full slate slip.[/]")
        return

    alloc     = bankroll_summary.allocations.get(15) if bankroll_summary else None
    stake_str = f"Stake: 0.25 Unit (${alloc.dollar_stake:.2f})" if alloc else "Stake: 0.25 Unit"

    summary_panel = (
        f"[gold]{slip.n_legs}-Match Slate Slip Summary[/]  [dim_text]({stake_str})[/]\n"
        f"Combined Decimal Odds: [bold gold]{slip.combined_decimal_odds:,.2f}x[/]  "
        f"({analytics.format_american_odds(slip.combined_american_odds)})\n"
        f"Combined Win Prob: [accent]{slip.combined_confidence * 100:.6f}%[/]  "
        f"|  Book Implied: [dim_text]{slip.implied_probability * 100:.6f}%[/]"
    )
    console.print(Panel(summary_panel, border_style="panel_border", padding=(0, 2)))

    table = Table(
        title="[gold]Matchday Picks (Best Team Per Game)[/]",
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False, width=95,
    )
    table.add_column("#",       justify="center", width=3,  no_wrap=True)
    table.add_column("Pick",    style="bold white", width=9, no_wrap=True)
    table.add_column("vs",      style="dim_text", width=5,  no_wrap=True)
    table.add_column("ML Odds", justify="center", width=8,  no_wrap=True)
    table.add_column("Book",    justify="center", style="accent", width=10, no_wrap=True)
    table.add_column("Win%",    justify="center", width=7,  no_wrap=True)
    table.add_column("Trust",   justify="center", width=11, no_wrap=True)

    for idx, leg in enumerate(slip.legs, start=1):
        team_display = format_team_display(leg.team_name, leg.is_home)
        opp_tri  = get_team_tri_code(leg.opponent_team)
        ml_str   = analytics.format_american_odds(leg.best_line_american)
        trust_st = _TRUST_STYLE.get(leg.trust_level, "dim_text")
        icon     = _TRUST_ICON.get(leg.trust_level, "⚪")
        label    = _TRUST_LABEL.get(leg.trust_level, leg.trust_level)
        table.add_row(
            str(idx),
            f"[bold white]{team_display}[/]",
            opp_tri,
            f"[gold]{ml_str}[/]",
            escape(leg.best_sportsbook[:9]),
            f"[{trust_st}]{leg.win_confidence * 100:.1f}%[/]",
            f"[{trust_st}]{icon} {label}[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 2: MONEYLINE TRUST SCREENER + FULL BET SLIP SUITE
# ==============================================================================

def display_moneyline_results(
    candidates: list[analytics.MoneylineCandidate],
    slip_suite: analytics.BetSlipSuite,
    lock_of_day: analytics.LockOfDay | None,
    bankroll_summary: bankroll.BankrollSummary | None,
    is_live_data: bool = True,
) -> None:
    clear_screen()
    print_banner()
    print_rule("🏆  MONEYLINE TRUST SCREENER + FULL BET SLIP SUITE")

    # ── A. LOCK OF THE DAY ────────────────────────────────────────────────────
    if lock_of_day and is_live_data:
        cand      = lock_of_day.candidate
        ml_str    = analytics.format_american_odds(cand.best_line_american)
        unit_val  = bankroll_summary.unit_value if bankroll_summary else 20.00
        team_disp = format_team_display(cand.team_name, cand.is_home)
        console.print(Panel(
            f"🔒 [bold green_bright]LOCK OF THE DAY: {escape(cand.team_name)} ({team_disp})[/] "
            f"([gold]{ml_str}[/] @ [accent]{cand.best_sportsbook}[/])\n"
            f"Starter: {escape(cand.pitcher_name[:18])} (WHIP: {cand.our_whip:.2f} | L3 ERA: {cand.last3_era:.2f})"
            f"  |  Win Conf: [bold green_bright]{cand.win_confidence * 100:.1f}%[/]\n"
            f"Recommended Stake: [gold]1.00 Unit (${unit_val:.2f})[/]",
            border_style="green_bright",
            padding=(0, 2),
        ))
        console.print()

    # ── B. COLOR-CODED TRUST TABLE ────────────────────────────────────────────
    top_picks = candidates[:8]
    cand_table = Table(
        title="[gold]Top Moneyline Picks — Color-Coded Win Confidence Ranking[/]",
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False, width=95,
    )
    cand_table.add_column("Rank",    justify="center", width=4,  no_wrap=True)
    cand_table.add_column("Trust",   justify="center", width=12, no_wrap=True)
    cand_table.add_column("Team",    style="bold white", width=8, no_wrap=True)
    cand_table.add_column("SP",      style="accent", width=14, no_wrap=True, overflow="ellipsis")
    cand_table.add_column("ML Odds", justify="center", width=8,  no_wrap=True)
    cand_table.add_column("Dec",     justify="center", width=6,  no_wrap=True)
    cand_table.add_column("WHIP",    justify="center", width=6,  no_wrap=True)
    cand_table.add_column("Win%",    justify="center", width=8,  no_wrap=True)

    for idx, cand in enumerate(top_picks, start=1):
        tri_code = get_team_tri_code(cand.team_name)
        ml_str   = analytics.format_american_odds(cand.best_line_american)
        trust_st = _TRUST_STYLE.get(cand.trust_level, "dim_text")
        icon     = _TRUST_ICON.get(cand.trust_level, "⚪")
        label    = _TRUST_LABEL.get(cand.trust_level, cand.trust_level)
        conf_str = f"{cand.win_confidence * 100:.1f}%"

        cand_table.add_row(
            str(idx),
            f"[{trust_st}]{icon} {label}[/]",
            tri_code,
            escape(cand.pitcher_name[:12]),
            f"[gold]{ml_str}[/]",
            f"{cand.moneyline_decimal:.3f}",
            f"{cand.our_whip:.2f}",
            f"[{trust_st}]{conf_str}[/]",
        )

    console.print(cand_table)
    console.print()

    # ── C. LEGEND ─────────────────────────────────────────────────────────────
    legend = Text()
    legend.append("LEGEND  ", style="bold dim_text")
    legend.append("🟢 HIGH / LOCK", style="trust_high")
    legend.append(" ≥65.0%   ", style="dim_text")
    legend.append("🟡 MEDIUM / QUALIFIED", style="trust_medium")
    legend.append(" 58.0–64.9%   ", style="dim_text")
    legend.append("🟠 PASS / BORDERLINE", style="trust_pass")
    legend.append(" 50.0–57.9%", style="dim_text")
    console.print(Align.center(legend))
    console.print()

    # ── D. BET SLIP SUITE TABLE ───────────────────────────────────────────────
    _display_bet_slip_suite(slip_suite, candidates)

    # ── E. PANDUAN EKSEKUSI PANEL ─────────────────────────────────────────────
    _display_panduan_eksekusi(slip_suite, candidates)


def _display_bet_slip_suite(
    suite: analytics.BetSlipSuite,
    candidates: list[analytics.MoneylineCandidate],
) -> None:
    """Render the Bet Slip Suite summary table (7 slip types)."""
    print_rule("🎯  REKOMENDASI BET SLIP SUITE (7 TIPE)")

    slip_table = Table(
        title="[gold]Complete Bet Slip Suite — Berdasarkan Urutan Win Confidence[/]",
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=True, width=95,
    )
    slip_table.add_column("Slip Type",      style="bold white", width=18, no_wrap=True)
    slip_table.add_column("Teams",          style="accent", width=32, no_wrap=True, overflow="ellipsis")
    slip_table.add_column("Dec Odds",       justify="center", width=9,  no_wrap=True)
    slip_table.add_column("Am Odds",        justify="center", style="gold", width=8, no_wrap=True)
    slip_table.add_column("Comb Conf%",     justify="center", width=10, no_wrap=True)
    slip_table.add_column("Alokasi",        justify="center", width=10, no_wrap=True)

    def _slip_row(label: str, slip: analytics.MoneylineSlip | None, alokasi: str, style: str = "white") -> None:
        if slip is None:
            slip_table.add_row(
                f"[{style}]{label}[/]",
                "[dim_text]Tidak cukup kandidat[/]",
                "—", "—", "—", alokasi,
            )
            return
        teams_str = " + ".join(get_team_tri_code(l.team_name) for l in slip.legs)
        am_str    = analytics.format_american_odds(slip.combined_american_odds)
        conf_pct  = f"{slip.combined_confidence * 100:.2f}%"
        slip_table.add_row(
            f"[{style}]{label}[/]",
            teams_str[:30],
            f"{slip.combined_decimal_odds:.2f}x",
            f"[gold]{am_str}[/]",
            f"[accent]{conf_pct}[/]",
            alokasi,
        )

    _slip_row("🎯 2-Leg Anchor",      suite.anchor_2leg,   "1.00 Unit", "trust_high")
    _slip_row("🎯 3-Leg Parlay",      suite.parlay_3leg,   "0.75 Unit", "trust_medium")
    _slip_row("🎯 4-Leg Parlay",      suite.parlay_4leg,   "0.50 Unit", "trust_medium")

    # 3-of-5 Combo — show best combo only
    if suite.combo_3of5:
        best_combo = suite.combo_3of5[0]
        _slip_row("🎯 3-of-5 Combo",  best_combo,          "0.50 Unit", "trust_medium")
    else:
        _slip_row("🎯 3-of-5 Combo",  None,                "0.50 Unit")

    _slip_row("🎯 5-Leg Parlay",      suite.parlay_5leg,   "0.50 Unit", "trust_medium")
    _slip_row("🎯 6-Leg Parlay",      suite.parlay_6leg,   "0.25 Unit", "trust_pass")
    _slip_row("🚀 8-Leg Ultimate",    suite.ultimate_8leg, "0.25 Unit", "trust_pass")

    console.print(slip_table)
    console.print()

    # 3-of-5 All Combos mini-table
    if len(suite.combo_3of5) > 1:
        combo_table = Table(
            title="[gold]3-of-5 Combination — Semua Opsi (C(5,3) = maks 10 combo)[/]",
            box=box.SIMPLE, border_style="panel_border", header_style="table_header",
            padding=(0, 1), show_lines=False, width=95,
        )
        combo_table.add_column("#",         justify="center", width=3, no_wrap=True)
        combo_table.add_column("Teams",     style="accent", width=30, no_wrap=True)
        combo_table.add_column("Dec Odds",  justify="center", width=9, no_wrap=True)
        combo_table.add_column("Am Odds",   justify="center", style="gold", width=8, no_wrap=True)
        combo_table.add_column("Comb Conf", justify="center", width=10, no_wrap=True)

        for i, c in enumerate(suite.combo_3of5, start=1):
            teams_str = " + ".join(get_team_tri_code(l.team_name) for l in c.legs)
            combo_table.add_row(
                str(i),
                teams_str,
                f"{c.combined_decimal_odds:.2f}x",
                analytics.format_american_odds(c.combined_american_odds),
                f"{c.combined_confidence * 100:.2f}%",
            )

        console.print(combo_table)
        console.print()


def _display_panduan_eksekusi(
    suite: analytics.BetSlipSuite,
    candidates: list[analytics.MoneylineCandidate],
) -> None:
    """Render the golden 'Panduan Eksekusi Slip Taruhan' panel."""
    if not candidates:
        return

    # Gather team info for the guide
    r1 = candidates[0] if len(candidates) > 0 else None
    r2 = candidates[1] if len(candidates) > 1 else None
    r3 = candidates[2] if len(candidates) > 2 else None
    r4 = candidates[3] if len(candidates) > 3 else None
    r5 = candidates[4] if len(candidates) > 4 else None

    def _fmt(c: analytics.MoneylineCandidate | None) -> str:
        if c is None:
            return "—"
        tri = get_team_tri_code(c.team_name)
        return f"{tri} {c.moneyline_decimal:.3f}"

    guide = Text()
    guide.append("💡 Panduan Eksekusi Slip Taruhan (Berdasarkan Win Conf Rules)\n\n", style="bold gold")

    # 1. Anchor
    r1_fmt = _fmt(r1)
    r2_fmt = _fmt(r2)
    guide.append("1. ", style="bold gold")
    guide.append("Single Bet / 2-Leg Anchor Slip", style="bold trust_high")
    guide.append(" (High Confidence / Low Variance):\n", style="gold")
    guide.append(f"   Pasang Rank 1 ({r1_fmt}) dan Rank 2 ({r2_fmt}). "
                 "Tim favorit terkuat dengan statistik paling bersih.\n", style="white")
    guide.append("   Alokasi: ", style="dim_text")
    guide.append("1.00 Unit\n\n", style="bold green_bright")

    # 2. 3 / 3-5 / 5 Leg
    r3_fmt = _fmt(r3)
    r4_fmt = _fmt(r4)
    r5_fmt = _fmt(r5)
    guide.append("2. ", style="bold gold")
    guide.append("3-Leg / 3-of-5 Combo / 5-Leg Parlay Slip", style="bold trust_medium")
    guide.append(":\n", style="gold")
    guide.append(f"   ▸ Gabungkan Rank 1–3 ({r1_fmt}, {r2_fmt}, {r3_fmt}) untuk [bold]3-Leg Slip[/bold].\n"
                 f"   ▸ Pilih 3 kombinasi terbaik dari Top-5 untuk [bold]3-of-5 Combo[/bold] "
                 f"(mitigasi risiko varians).\n"
                 f"   ▸ Tambahkan Rank 4 ({r4_fmt}) & Rank 5 ({r5_fmt}) untuk [bold]5-Leg Slip[/bold].\n",
                 style="white")
    guide.append("   Alokasi: ", style="dim_text")
    guide.append("0.50 – 0.75 Unit\n\n", style="bold yellow_bold")

    # 3. 6-Leg & 8-Leg Ultimate
    guide.append("3. ", style="bold gold")
    guide.append("6-Leg & 8-Leg Ultimate Test Luck Slip", style="bold trust_pass")
    guide.append(":\n", style="gold")
    guide.append("   Gabungkan seluruh Top 6 atau Top 8 tim di atas ke dalam 1 slip parlay.\n"
                 "   Wajib alokasi [bold]0.25 Unit[/bold] (Lottery/Test Luck) untuk "
                 "mengantisipasi varians tinggi MLB.\n",
                 style="white")

    # Add combined odds info
    if suite.ultimate_8leg:
        ul = suite.ultimate_8leg
        guide.append(f"\n   8-Leg Odds: [bold gold]{ul.combined_decimal_odds:.2f}x[/bold gold] "
                     f"({analytics.format_american_odds(ul.combined_american_odds)})  |  "
                     f"Combined Conf: [accent]{ul.combined_confidence * 100:.3f}%[/accent]\n",
                     style="white")

    console.print(Panel(
        guide,
        title="[gold]💡 PANDUAN EKSEKUSI SLIP TARUHAN[/]",
        border_style="gold",
        padding=(0, 2),
        width=95,
    ))
    console.print()


# ==============================================================================
# MENU 3: UNDER 0.5 HOME RUN PARLAYS
# ==============================================================================

def display_under_hr_results(
    slips_by_legs: dict[int, list[analytics.UnderHRParlaySlip]],
    bankroll_summary: bankroll.BankrollSummary | None,
) -> None:
    clear_screen()
    print_banner()
    print_rule("🎯  UNDER 0.5 HOME RUN PARLAY SCREENER (WIN RATE 90%)")

    if not slips_by_legs:
        console.print("[dim_text]No qualifying candidates clearing strict HR criteria today.[/]")
        return

    for n_legs in [3, 4, 5, 8, 10]:
        slips = slips_by_legs.get(n_legs, [])
        if not slips:
            continue

        alloc      = bankroll_summary.allocations.get(n_legs) if bankroll_summary else None
        stake_info = f"Stake: {alloc.unit_multiplier:.2f} Unit (${alloc.dollar_stake:.2f})" if alloc else ""

        table = Table(
            title=f"[gold]{n_legs}-Leg Under HR Slips[/]  [dim_text]({stake_info})[/]",
            box=box.ROUNDED, border_style="panel_border", header_style="table_header",
            padding=(0, 1), show_lines=False, width=90,
        )
        table.add_column("#",         justify="center", width=3,  no_wrap=True)
        table.add_column("Batter",    style="bold white", width=18, no_wrap=True, overflow="ellipsis")
        table.add_column("Pitcher",   style="accent", width=16, no_wrap=True, overflow="ellipsis")
        table.add_column("Prob%",     justify="center", width=8,  no_wrap=True)
        table.add_column("Fair Odds", justify="center", style="gold", width=10, no_wrap=True)

        for idx, slip in enumerate(slips[:2], start=1):
            for leg in slip.legs:
                table.add_row(
                    str(idx),
                    escape(leg.batter_name[:16]),
                    escape(leg.pitcher_name[:14]),
                    f"{leg.true_no_hr_prob*100:.1f}%",
                    analytics.format_american_odds(slip.fair_american_odds),
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
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False, width=90,
    )
    table.add_column("#",                  justify="center", width=3,  no_wrap=True)
    table.add_column("Batter",             style="bold white", width=18, no_wrap=True, overflow="ellipsis")
    table.add_column("Opp Pitcher",        style="accent", width=16, no_wrap=True, overflow="ellipsis")
    table.add_column("BA vs SP",           justify="center", width=10, no_wrap=True)
    table.add_column("Prob%",              justify="center", width=8,  no_wrap=True)
    table.add_column("Bet Recommendation", justify="center", style="green_bright", width=16, no_wrap=True)

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
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False, width=90,
    )
    table.add_column("Team",           style="bold white", width=8,  no_wrap=True)
    table.add_column("RPG / HR/G",     justify="center", width=12, no_wrap=True)
    table.add_column("Opp SP",         style="accent", width=14, no_wrap=True, overflow="ellipsis")
    table.add_column("SP ERA / HR9",   justify="center", width=12, no_wrap=True)
    table.add_column("Recommendation", justify="center", style="green_bright", width=14, no_wrap=True)

    for c in cands[:8]:
        team_code = get_team_tri_code(c.team_name)
        table.add_row(
            team_code,
            f"{c.runs_per_game:.1f} / {c.hr_per_game:.1f}",
            escape(c.opp_starter_name[:12]),
            f"{c.opp_starter_era:.2f} / {c.opp_starter_hr9:.1f}",
            "[bold green_bright]OVER 1.5 RUNS[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 6: AT-BAT OUTCOME "OUT OR ERROR"
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
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False, width=90,
    )
    table.add_column("#",              justify="center", width=3,  no_wrap=True)
    table.add_column("Batter",         style="bold white", width=18, no_wrap=True, overflow="ellipsis")
    table.add_column("Opp DFS SP",     style="accent", width=16, no_wrap=True, overflow="ellipsis")
    table.add_column("H2H BA",         justify="center", width=8,  no_wrap=True)
    table.add_column("K%",             justify="center", width=6,  no_wrap=True)
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
# MENU 7: SCORE PROJECTION
# ==============================================================================

def display_score_projections(projections: list[analytics.GameProjection]) -> None:
    clear_screen()
    print_banner()
    print_rule("📊  5-FACTOR SCORE PROJECTION ENGINE (OVER/UNDER)")

    table = Table(
        title="[gold]Game Totals Projections (Max 8 Rows)[/]",
        box=box.ROUNDED, border_style="panel_border", header_style="table_header",
        padding=(0, 1), show_lines=False, width=90,
    )
    table.add_column("Matchup", style="bold white", width=16, no_wrap=True)
    table.add_column("Line",    justify="center", width=6,  no_wrap=True)
    table.add_column("Proj",    justify="center", style="accent", width=7, no_wrap=True)
    table.add_column("Edge",    justify="center", width=8,  no_wrap=True)
    table.add_column("Rec",     justify="center", width=10, no_wrap=True)

    for proj in projections[:8]:
        book_line   = f"{proj.ou_line:.1f}" if proj.ou_line else "N/A"
        edge_str    = f"{proj.edge:+.2f}" if proj.edge is not None else "N/A"
        rec_st      = {"OVER": "green_bright", "UNDER": "red_bright", "SKIP": "dim_text"}.get(
            proj.recommendation, "white"
        )
        matchup_tri = f"{get_team_tri_code(proj.away_team)} @ {get_team_tri_code(proj.home_team)}"

        table.add_row(
            matchup_tri,
            book_line,
            f"{proj.projected_total:.2f}",
            edge_str,
            f"[{rec_st}]{proj.recommendation}[/]",
        )

    console.print(table)
    console.print()


# ==============================================================================
# MENU 8: CALIBRATION LOG
# ==============================================================================

def display_calibration_log(report: analytics.CalibrationReport) -> None:
    clear_screen()
    print_banner()
    print_rule("🔄  4-DAY HISTORICAL CALIBRATION ENGINE LOG")

    summary_panel = (
        f"[gold]Model Calibration Status (H-4 to H-1)[/]\n"
        f"Analyzed: [bold white]{report.total_games_analyzed} Matches[/]  "
        f"|  Error Rate: [accent]{report.avg_error_rate * 100:.1f}%[/]\n"
        f"Calibrated Weights -> Pitcher: [gold]{report.calibrated_pitcher_weight:.2f}[/] "
        f"| Form: {report.calibrated_form_weight:.2f} | OPS: {report.calibrated_ops_weight:.2f}"
    )
    console.print(Panel(summary_panel, border_style="panel_border", padding=(0, 2)))

    table = Table(
        title="[gold]Historical Logs[/]",
        box=box.ROUNDED, border_style="panel_border", padding=(0, 1), width=90,
    )
    table.add_column("Log Entry", style="dim_text", width=80, no_wrap=True)
    for entry in report.calibration_log:
        table.add_row(entry[:78])

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
    table.add_column("Metric", style="bold white", width=26)
    table.add_column("Value",  style="gold", justify="right", width=14)

    table.add_row("Total Bankroll Balance",  f"${summary.balance:,.2f}")
    table.add_row("1 Unit Size (2.0%)",      f"${summary.unit_value:,.2f}")
    table.add_row("Max Daily Risk (10.0%)",  f"${summary.max_daily_risk:,.2f}")
    table.add_row("Daily Budget Risked",     f"${summary.daily_budget_used:,.2f}")
    table.add_row("Remaining Daily Budget",  f"${summary.remaining_daily_budget:,.2f}")

    console.print(Panel(table, title="[gold]🏦 Bankroll Status[/]", border_style="panel_border", padding=(0, 2)))
    console.print()


# ==============================================================================
# SHARED UTILITIES
# ==============================================================================

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
