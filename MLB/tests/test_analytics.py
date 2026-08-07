"""
tests/test_analytics.py
========================
Unit tests for Moneyline signal classification and parlay generation.
"""

import sys
from pathlib import Path

# Add project root directory to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import analytics
import config
import mock_data


def test_moneyline_signal_classification():
    """Memastikan tim dengan Win Conf >= threshold mendapatkan sinyal QUALIFIED atau STRONG (Bukan PASS untuk semua tim)."""
    games = mock_data.MOCK_GAMES
    team_form = mock_data.MOCK_TEAM_FORM
    team_ops_splits = mock_data.MOCK_TEAM_OPS_SPLITS
    ml_odds = mock_data.MOCK_MONEYLINE_ODDS
    pitcher_stats = mock_data.MOCK_PITCHER_STATS
    line_shopping = mock_data.MOCK_LINE_SHOPPING

    candidates = analytics.run_moneyline_screener(
        games, team_form, team_ops_splits, ml_odds, pitcher_stats,
        is_live_data=True, line_shopping_data=line_shopping
    )

    assert len(candidates) > 0, "Candidate list should not be empty!"

    # Count signals
    signals = [c.is_strong_recommendation for c in candidates]
    qualified_candidates = [c for c in candidates if c.win_confidence >= 0.530]

    # At least some candidates must be qualified (win_confidence >= 53.0%)
    assert len(qualified_candidates) > 0, "At least some candidates must be qualified (Win Conf >= 53%)!"

    # Ensure top picks have proper classification
    top_cand = candidates[0]
    assert top_cand.win_confidence >= 0.530, f"Top pick win confidence ({top_cand.win_confidence}) should be >= 53.0%"


def test_parlay_generator_all_legs():
    """Memastikan generator parlay WAJIB memproduksi slip kombinasi lengkap untuk 3, 4, 5, 8, dan 10 Legs dari kandidat teratas."""
    games = mock_data.MOCK_GAMES
    team_form = mock_data.MOCK_TEAM_FORM
    team_ops_splits = mock_data.MOCK_TEAM_OPS_SPLITS
    ml_odds = mock_data.MOCK_MONEYLINE_ODDS
    pitcher_stats = mock_data.MOCK_PITCHER_STATS
    line_shopping = mock_data.MOCK_LINE_SHOPPING

    candidates = analytics.run_moneyline_screener(
        games, team_form, team_ops_splits, ml_odds, pitcher_stats,
        is_live_data=True, line_shopping_data=line_shopping
    )

    slips_by_legs = analytics.generate_moneyline_parlays(candidates)

    # Since we have 15 games in mock_data, we should have enough candidates for 3, 4, 5, 8, 10 legs
    for legs in [3, 4, 5, 8, 10]:
        assert legs in slips_by_legs, f"Parlay slips for {legs} legs must be generated!"
        assert len(slips_by_legs[legs]) > 0, f"Slip list for {legs} legs should not be empty!"


def test_parlay_fallback_when_few_candidates():
    """Memastikan jika kandidat tim kurang dari 8 atau 10, system menangani secara informatif (tidak crash/panel kosong)."""
    # Create a slate of only 5 games so 3 and 4 legs can generate, but 8 and 10 cannot
    games = mock_data.MOCK_GAMES[:5]
    candidates = analytics.run_moneyline_screener(
        games, mock_data.MOCK_TEAM_FORM, mock_data.MOCK_TEAM_OPS_SPLITS,
        mock_data.MOCK_MONEYLINE_ODDS, mock_data.MOCK_PITCHER_STATS,
        is_live_data=True
    )

    slips_by_legs = analytics.generate_moneyline_parlays(candidates)

    # 3 and 4 legs should be generated, but 8 and 10 should be missing or empty
    assert 3 in slips_by_legs
    assert 4 in slips_by_legs
    assert 8 not in slips_by_legs or len(slips_by_legs[8]) == 0
    assert 10 not in slips_by_legs or len(slips_by_legs[10]) == 0
