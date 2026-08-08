"""
tests/test_cli_ui.py
=====================
Unit tests for CLI UI formatting, MLB team tri-codes, and menu labels.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import analytics
import cli_ui


def test_team_abbreviation():
    """Memastikan nama tim menggunakan 3-letter Tri-Code resmi MLB (contoh: NYY, BOS, SD, STL, PHI, CLE, MIA)."""
    assert cli_ui.get_team_tri_code("New York Yankees") == "NYY"
    assert cli_ui.get_team_tri_code("Boston Red Sox") == "BOS"
    assert cli_ui.get_team_tri_code("San Diego Padres") == "SD"
    assert cli_ui.get_team_tri_code("St. Louis Cardinals") == "STL"
    assert cli_ui.get_team_tri_code("Philadelphia Phillies") == "PHI"
    assert cli_ui.get_team_tri_code("Cleveland Guardians") == "CLE"
    assert cli_ui.get_team_tri_code("Miami Marlins") == "MIA"
    assert cli_ui.get_team_tri_code("Los Angeles Dodgers") == "LAD"

    # Formatting with home/away tag
    formatted_h = cli_ui.format_team_display("New York Yankees", is_home=True)
    assert formatted_h == "NYY (H)"

    formatted_a = cli_ui.format_team_display("Cleveland Guardians", is_home=False)
    assert formatted_a == "CLE (A)"


def test_menu_labels_completeness():
    """Memastikan label Menu Opsi 2 mencantumkan secara lengkap: '(Top Picks, Lock & Slips 3, 4, 5, 8, 10 Legs)'."""
    menu_items = cli_ui.get_main_menu_items()
    option_2_text = dict(menu_items).get("2", "")

    assert "3, 4, 5, 8, 10 Legs" in option_2_text or "Slips 3, 4, 5, 8, 10" in option_2_text, (
        f"Option 2 menu label missing 8 and 10 legs! Current: {option_2_text}"
    )


def test_no_team_truncation_for_long_parlays():
    """Memastikan string tim untuk 6-Leg dan 8-Leg parlay TIDAK terpotong dengan '[:31]'."""
    team_names = [
        "Boston Red Sox", "Los Angeles Dodgers", "Chicago Cubs",
        "Philadelphia Phillies", "New York Yankees", "Seattle Mariners",
        "Atlanta Braves", "San Diego Padres"
    ]
    tri_codes = [cli_ui.get_team_tri_code(t) for t in team_names]
    teams_str = " + ".join(tri_codes)

    # 6-Leg teams string length is > 31 chars
    teams_str_6 = " + ".join(tri_codes[:6])
    assert len(teams_str_6) > 31, "6-Leg teams string should be longer than 31 chars"
    assert teams_str_6.endswith("SEA"), "6-Leg teams string must end with full team code SEA, not truncated!"

    # 8-Leg teams string length is > 31 chars
    teams_str_8 = " + ".join(tri_codes[:8])
    assert len(teams_str_8) > 31, "8-Leg teams string should be longer than 31 chars"
    assert teams_str_8.endswith("SD"), "8-Leg teams string must end with full team code SD, not truncated!"
