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
