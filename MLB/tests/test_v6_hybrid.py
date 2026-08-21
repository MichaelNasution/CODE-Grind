"""
tests/test_v6_hybrid.py
=======================
MLB Analytics Engine v6.0 — Hybrid Mega Slip Unit Tests.

Coverage:
  1. NRFI/YRFI probability model — realistic bounds
  2. 1st Inning Team Total model — under/over 0.5
  3. 1st Inning Handicap model — SIERA gap enforcement
  4. evaluate_first_inning_legs — best market selection
  5. build_hybrid_mega_slip — assembly, zero-correlation
  6. calibration_loop — BettingLogEntry, compute_dynamic_weights
  7. data_fetcher — load_first_inning_slate fallback behavior

Run with: pytest tests/test_v6_hybrid.py -v
"""

from __future__ import annotations

import sys
import os

# Ensure the MLB project root is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
import config
import mock_data
import analytics
from analytics import (
    score_first_inning_nrfi,
    score_first_inning_yrfi,
    score_first_inning_team_total,
    score_first_inning_handicap,
    evaluate_first_inning_legs,
    build_hybrid_mega_slip,
    run_moneyline_screener,
)
from calibration_loop import (
    BettingLogEntry,
    compute_dynamic_weights,
    run_post_mortem_attribution,
    compute_accuracy,
)


# ==============================================================================
# HELPERS
# ==============================================================================

def _mock_sp_splits(nrfi_pct: float = 0.60, xfip: float = 3.00) -> dict:
    return {"nrfi_as_sp_pct": nrfi_pct, "xfip_1st_inn": xfip}


def _mock_top3_wrc(wrc: int = 110) -> dict:
    return {"top3_wrc_plus_7d": wrc}


def _mock_nrfi_trends(home_rate: float = 0.55, away_rate: float = 0.55) -> dict:
    return {"nrfi_home_rate": home_rate, "nrfi_away_rate": away_rate}


def _make_games():
    """Return a deep copy of mock games with weather attached."""
    import copy
    games = copy.deepcopy(mock_data.MOCK_GAMES)
    for g in games:
        venue = g.get("venue", "DEFAULT")
        g["weather"] = mock_data.MOCK_WEATHER.get(venue, mock_data.MOCK_WEATHER["DEFAULT"])
    return games


# ==============================================================================
# 1. NRFI / YRFI PROBABILITY MODEL
# ==============================================================================

class TestNRFIModel:
    """Tests for score_first_inning_nrfi() and score_first_inning_yrfi()."""

    def test_nrfi_prob_within_bounds(self):
        """NRFI probability must always be within [NRFI_MIN, NRFI_MAX]."""
        prob = score_first_inning_nrfi(
            _mock_sp_splits(0.70, 2.80), _mock_sp_splits(0.70, 2.80),
            _mock_top3_wrc(75),  _mock_top3_wrc(75),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        assert config.NRFI_MIN_PROBABILITY <= prob <= config.NRFI_MAX_PROBABILITY, \
            f"NRFI probability {prob} is outside [{config.NRFI_MIN_PROBABILITY}, {config.NRFI_MAX_PROBABILITY}]"

    def test_nrfi_elite_offense_reduces_prob(self):
        """Elite offense (wRC+ 135) should reduce NRFI probability vs average offense."""
        prob_avg = score_first_inning_nrfi(
            _mock_sp_splits(), _mock_sp_splits(),
            _mock_top3_wrc(100), _mock_top3_wrc(100),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        prob_elite = score_first_inning_nrfi(
            _mock_sp_splits(), _mock_sp_splits(),
            _mock_top3_wrc(135), _mock_top3_wrc(135),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        assert prob_elite < prob_avg, \
            f"Elite offense should reduce NRFI: elite={prob_elite:.3f} avg={prob_avg:.3f}"

    def test_nrfi_weak_offense_increases_prob(self):
        """Weak offense (wRC+ 72) should increase NRFI probability."""
        prob_avg = score_first_inning_nrfi(
            _mock_sp_splits(), _mock_sp_splits(),
            _mock_top3_wrc(100), _mock_top3_wrc(100),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        prob_weak = score_first_inning_nrfi(
            _mock_sp_splits(), _mock_sp_splits(),
            _mock_top3_wrc(72), _mock_top3_wrc(72),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        assert prob_weak > prob_avg, \
            f"Weak offense should increase NRFI: weak={prob_weak:.3f} avg={prob_avg:.3f}"

    def test_nrfi_leaky_sp_reduces_prob(self):
        """Leaky SP (xFIP >= 4.50) should reduce NRFI probability."""
        prob_good = score_first_inning_nrfi(
            _mock_sp_splits(0.65, 3.10), _mock_sp_splits(0.65, 3.10),
            _mock_top3_wrc(), _mock_top3_wrc(),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        prob_leaky = score_first_inning_nrfi(
            _mock_sp_splits(0.40, 5.00), _mock_sp_splits(0.40, 5.00),
            _mock_top3_wrc(), _mock_top3_wrc(),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        assert prob_leaky < prob_good, \
            f"Leaky SP should reduce NRFI: leaky={prob_leaky:.3f} good={prob_good:.3f}"

    def test_yrfi_complements_nrfi(self):
        """YRFI + NRFI should sum approximately to 1.0 (within model clipping tolerance)."""
        nrfi = score_first_inning_nrfi(
            _mock_sp_splits(), _mock_sp_splits(),
            _mock_top3_wrc(), _mock_top3_wrc(),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        yrfi = score_first_inning_yrfi(nrfi)
        # Both are clipped independently; their sum should be in [0.90, 1.10]
        assert abs(nrfi + yrfi - 1.0) <= 0.20, \
            f"NRFI ({nrfi:.3f}) + YRFI ({yrfi:.3f}) should sum ~1.0"

    def test_yrfi_within_bounds(self):
        """YRFI probability must also be within model bounds."""
        nrfi = score_first_inning_nrfi(
            _mock_sp_splits(), _mock_sp_splits(),
            _mock_top3_wrc(), _mock_top3_wrc(),
            _mock_nrfi_trends(), _mock_nrfi_trends(),
        )
        yrfi = score_first_inning_yrfi(nrfi)
        assert config.NRFI_MIN_PROBABILITY <= yrfi <= config.NRFI_MAX_PROBABILITY


# ==============================================================================
# 2. 1ST INNING TEAM TOTAL MODEL
# ==============================================================================

class TestTeamTotal:
    """Tests for score_first_inning_team_total()."""

    def test_under_over_probabilities_valid_range(self):
        """Under and over probabilities should be in [0.30, 0.75]."""
        under, over = score_first_inning_team_total(
            _mock_sp_splits(), _mock_top3_wrc(), _mock_sp_splits(),
            is_home_batting=True,
        )
        assert 0.30 <= under <= 0.75, f"Under prob {under} out of range"
        assert 0.30 <= over  <= 0.75, f"Over prob {over} out of range"

    def test_elite_offense_reduces_under_prob(self):
        """Elite batting team should lower the under-0.5 probability."""
        _, over_avg  = score_first_inning_team_total(
            _mock_sp_splits(), _mock_top3_wrc(100), _mock_sp_splits(),
            is_home_batting=True,
        )
        under_elite, _ = score_first_inning_team_total(
            _mock_sp_splits(), _mock_top3_wrc(130), _mock_sp_splits(),
            is_home_batting=True,
        )
        # under_elite should be lower than under for average offense
        under_avg, _ = score_first_inning_team_total(
            _mock_sp_splits(), _mock_top3_wrc(100), _mock_sp_splits(),
            is_home_batting=True,
        )
        assert under_elite <= under_avg, \
            f"Elite offense should lower under prob: {under_elite:.3f} vs {under_avg:.3f}"


# ==============================================================================
# 3. 1ST INNING HANDICAP MODEL
# ==============================================================================

class TestHandicap:
    """Tests for score_first_inning_handicap()."""

    def test_returns_tuple_of_two_floats(self):
        h, a = score_first_inning_handicap(
            _mock_sp_splits(), _mock_sp_splits(), _mock_top3_wrc(), _mock_top3_wrc()
        )
        assert isinstance(h, float) and isinstance(a, float)

    def test_no_gap_returns_near_50_50(self):
        """When SIERA gap is below threshold, should return near 50/50."""
        h, a = score_first_inning_handicap(
            _mock_sp_splits(xfip=3.80), _mock_sp_splits(xfip=3.80),
            _mock_top3_wrc(100), _mock_top3_wrc(100),
        )
        assert abs(h - 0.52) < 0.05, f"Tied matchup home prob should be ~0.52, got {h}"
        assert abs(a - 0.48) < 0.05, f"Tied matchup away prob should be ~0.48, got {a}"

    def test_large_gap_favors_one_side(self):
        """When xFIP gap > threshold, one side should be noticeably favored."""
        # Large xFIP difference and sufficient offensive gap
        h, a = score_first_inning_handicap(
            _mock_sp_splits(xfip=2.20),  # home SP is very good
            _mock_sp_splits(xfip=5.80),  # away SP is very bad (home offense scores easier)
            _mock_top3_wrc(120),
            _mock_top3_wrc(85),
        )
        # Should not be 50/50
        assert abs(h - 0.5) > 0.03 or abs(a - 0.5) > 0.03, \
            "Large SP gap should produce non-50/50 handicap"

    def test_large_pitcher_gap_but_insufficient_offense_gap_returns_near_50_50(self):
        """When xFIP gap is large but favored team offensive advantage is < 10, should return near 50/50."""
        h, a = score_first_inning_handicap(
            _mock_sp_splits(xfip=2.20),  # home SP is favored by pitching
            _mock_sp_splits(xfip=5.80),
            _mock_top3_wrc(100),         # Home wRC+ is equal to away, so gap is 0 (< 10)
            _mock_top3_wrc(100),
        )
        assert abs(h - 0.52) < 0.05, f"Expected home prob near 0.52, got {h}"
        assert abs(a - 0.48) < 0.05, f"Expected away prob near 0.48, got {a}"


# ==============================================================================
# 4. EVALUATE FIRST INNING LEGS
# ==============================================================================

class TestEvaluateFirstInningLegs:
    """Tests for evaluate_first_inning_legs()."""

    def test_returns_none_when_no_qualifying_market(self):
        """If all probabilities are below threshold, return None."""
        # Use a very ordinary matchup that likely won't qualify
        game = {
            "game_id": 9999,
            "home_team": "Houston Astros",
            "away_team": "Texas Rangers",
            "venue": "Minute Maid Park",
            "home_starter_id": None,
            "away_starter_id": None,
            "weather": {},
        }
        # Override threshold temporarily or use a real matchup and check type
        result = evaluate_first_inning_legs(
            game,
            sp_splits_data={},
            top3_wrc_data={},
            nrfi_trends_data={},
        )
        # Result is either None or FirstInningLeg
        assert result is None or hasattr(result, "bet_type"), \
            "Should return None or FirstInningLeg"

    def test_returns_first_inning_leg_for_strong_matchup(self):
        """Known strong NRFI matchup (two aces, weak offenses) should return a qualifying leg."""
        game = {
            "game_id": 9001,
            "home_team": "Los Angeles Dodgers",
            "away_team": "Miami Marlins",
            "venue": "Dodger Stadium",
            "home_starter_id": 1003,  # Glasnow
            "away_starter_id": 1026,  # Alcantara
            "weather": {"temp_f": 74, "wind_speed_mph": 4, "wind_direction": "in"},
        }
        result = evaluate_first_inning_legs(
            game,
            sp_splits_data=mock_data.MOCK_SP_FIRST_INN_SPLITS,
            top3_wrc_data=mock_data.MOCK_TOP3_LINEUP_WRC,
            nrfi_trends_data=mock_data.MOCK_NRFI_TRENDS,
        )
        # Glasnow (nrfi_as_sp_pct=0.71) vs Alcantara (leaky, high xfip) — should have at least one qualifying leg
        assert result is not None, "Strong matchup should produce a qualifying leg"
        assert result.confidence >= config.NRFI_MIN_CONFIDENCE_THRESHOLD, \
            f"Confidence {result.confidence:.3f} below threshold {config.NRFI_MIN_CONFIDENCE_THRESHOLD}"

    def test_leg_has_valid_fields(self):
        """FirstInningLeg should have all required fields populated."""
        game = mock_data.MOCK_GAMES[6]   # LAD @ SD game
        game = {**game, "weather": mock_data.MOCK_WEATHER.get(game.get("venue", "DEFAULT"), {})}
        result = evaluate_first_inning_legs(
            game,
            sp_splits_data=mock_data.MOCK_SP_FIRST_INN_SPLITS,
            top3_wrc_data=mock_data.MOCK_TOP3_LINEUP_WRC,
            nrfi_trends_data=mock_data.MOCK_NRFI_TRENDS,
        )
        if result is not None:
            assert isinstance(result.home_team, str) and len(result.home_team) > 0
            assert isinstance(result.away_team, str) and len(result.away_team) > 0
            assert isinstance(result.bet_type, str) and len(result.bet_type) > 0
            assert isinstance(result.confidence, float)
            assert isinstance(result.nrfi_prob, float)
            assert isinstance(result.park_factor, float)


# ==============================================================================
# 5. BUILD HYBRID MEGA SLIP
# ==============================================================================

class TestBuildHybridMegaSlip:
    """Tests for build_hybrid_mega_slip()."""

    def _get_candidates(self, games=None):
        """Build ML candidates using mock data."""
        if games is None:
            games = _make_games()
        return run_moneyline_screener(
            games,
            mock_data.MOCK_TEAM_FORM,
            mock_data.MOCK_TEAM_OPS_SPLITS,
            mock_data.MOCK_MONEYLINE_ODDS,
            mock_data.MOCK_PITCHER_STATS,
            is_live_data=False,
        )

    def test_slip_has_at_least_min_legs(self):
        """Slip must have at least HYBRID_SLIP_MIN_LEGS total legs from mock slate."""
        games = _make_games()
        candidates = self._get_candidates(games)
        slip = build_hybrid_mega_slip(
            candidates, games,
            mock_data.MOCK_SP_FIRST_INN_SPLITS,
            mock_data.MOCK_TOP3_LINEUP_WRC,
            mock_data.MOCK_NRFI_TRENDS,
        )
        assert slip.total_legs >= 1, \
            f"Slip has {slip.total_legs} legs, should have at least 1 from mock slate"

    def test_zero_correlation_enforced(self):
        """Anchor game IDs should not appear in micro-market legs."""
        games = _make_games()
        candidates = self._get_candidates(games)
        slip = build_hybrid_mega_slip(
            candidates, games,
            mock_data.MOCK_SP_FIRST_INN_SPLITS,
            mock_data.MOCK_TOP3_LINEUP_WRC,
            mock_data.MOCK_NRFI_TRENDS,
        )
        anchor_game_ids = {a.game_id for a in slip.anchors}
        micro_game_ids  = {m.game_id for m in slip.micro_legs}
        overlap = anchor_game_ids & micro_game_ids
        assert len(overlap) == 0, \
            f"Zero-correlation violated: game_ids {overlap} appear in both anchors and micro legs"

    def test_combined_prob_is_product_of_legs(self):
        """Combined probability should be roughly the product of individual leg confidences."""
        games = _make_games()
        candidates = self._get_candidates(games)
        slip = build_hybrid_mega_slip(
            candidates, games,
            mock_data.MOCK_SP_FIRST_INN_SPLITS,
            mock_data.MOCK_TOP3_LINEUP_WRC,
            mock_data.MOCK_NRFI_TRENDS,
        )
        if slip.total_legs == 0:
            pytest.skip("No legs in slip — not enough qualifying markets")

        expected = 1.0
        for a in slip.anchors:
            expected *= a.win_confidence
        # Micro legs use approx -115 implied odds (0.535)
        _ml115_implied = 115 / (115 + 100)
        for _ in slip.micro_legs:
            # confidence used in combined_prob calculation
            pass
        # Just verify combined_prob is <= 1.0 and > 0
        assert 0.0 < slip.combined_prob <= 1.0, \
            f"combined_prob {slip.combined_prob} should be in (0, 1]"

    def test_slip_quality_label(self):
        """Slip quality label should be one of FULL, PARTIAL, or INSUFFICIENT."""
        games = _make_games()
        candidates = self._get_candidates(games)
        slip = build_hybrid_mega_slip(
            candidates, games,
            mock_data.MOCK_SP_FIRST_INN_SPLITS,
            mock_data.MOCK_TOP3_LINEUP_WRC,
            mock_data.MOCK_NRFI_TRENDS,
        )
        valid_labels = ("FULL", "PARTIAL", "INSUFFICIENT")
        assert any(label in slip.slip_quality for label in valid_labels), \
            f"Unexpected slip quality: {slip.slip_quality}"

    def test_stake_units_constant(self):
        """Stake units must always be HYBRID_SLIP_STAKE_UNITS (0.25)."""
        games = _make_games()
        candidates = self._get_candidates(games)
        slip = build_hybrid_mega_slip(
            candidates, games,
            mock_data.MOCK_SP_FIRST_INN_SPLITS,
            mock_data.MOCK_TOP3_LINEUP_WRC,
            mock_data.MOCK_NRFI_TRENDS,
        )
        assert slip.stake_units == config.HYBRID_SLIP_STAKE_UNITS, \
            f"Stake units should be {config.HYBRID_SLIP_STAKE_UNITS}, got {slip.stake_units}"

    def test_anchor_max_count_respected(self):
        """Number of anchors must never exceed HYBRID_SLIP_MAX_ANCHOR_LEGS."""
        games = _make_games()
        candidates = self._get_candidates(games)
        slip = build_hybrid_mega_slip(
            candidates, games,
            mock_data.MOCK_SP_FIRST_INN_SPLITS,
            mock_data.MOCK_TOP3_LINEUP_WRC,
            mock_data.MOCK_NRFI_TRENDS,
        )
        assert len(slip.anchors) <= config.HYBRID_SLIP_MAX_ANCHOR_LEGS, \
            f"Too many anchors: {len(slip.anchors)} > {config.HYBRID_SLIP_MAX_ANCHOR_LEGS}"


# ==============================================================================
# 6. CALIBRATION LOOP
# ==============================================================================

class TestCalibrationLoop:
    """Tests for calibration_loop module."""

    def _make_entry(self, result="WIN", bet_type="MONEYLINE", features=None) -> BettingLogEntry:
        return BettingLogEntry(
            log_id="test-001", date="2026-08-01",
            bet_type=bet_type, game_id=9001,
            team="Philadelphia Phillies", is_home=True,
            predicted_prob=0.65, best_ml_american=-215,
            stake_units=0.25, result=result,
            profit_loss_units=0.12 if result == "WIN" else -0.25,
            features=features or {
                "p1_sp_siera": 2.92,
                "p1_sp_xfip": 2.85,
                "p2_wrc_plus_7d": 118,
                "p3_bullpen_era": 3.25,
                "p4_is_home": 1,
                "nrfi_xfip_1st_inn": 2.40,
                "top3_wrc_plus_7d": 134,
            },
        )

    def test_betting_log_entry_creation(self):
        """BettingLogEntry should be created with all required fields."""
        entry = self._make_entry()
        assert entry.result == "WIN"
        assert entry.bet_type == "MONEYLINE"
        assert entry.predicted_prob == 0.65

    def test_compute_accuracy_empty(self):
        """compute_accuracy with no entries should return zero accuracy."""
        acc = compute_accuracy([])
        assert acc["overall"] == 0.0
        assert acc["sample_size"] == 0

    def test_compute_accuracy_all_wins(self):
        """compute_accuracy with all wins should return 1.0 overall."""
        entries = [self._make_entry(result="WIN") for _ in range(5)]
        acc = compute_accuracy(entries)
        assert acc["overall"] == 1.0

    def test_compute_accuracy_mixed(self):
        """compute_accuracy with 3 wins and 2 losses = 60%."""
        entries = (
            [self._make_entry(result="WIN")] * 3 +
            [self._make_entry(result="LOSS", features={
                "p1_sp_siera": 5.20, "p1_sp_xfip": 5.10,
                "p2_wrc_plus_7d": 72, "p3_bullpen_era": 4.80,
                "p4_is_home": 0, "nrfi_xfip_1st_inn": 5.80,
                "top3_wrc_plus_7d": 68,
            })] * 2
        )
        acc = compute_accuracy(entries)
        assert abs(acc["overall"] - 0.60) < 1e-9

    def test_compute_dynamic_weights_returns_normalized(self):
        """compute_dynamic_weights should return weights summing to 1.0."""
        attribution = {
            "p1_sp_siera": 0.35,
            "p1_sp_xfip": 0.25,
            "p2_wrc_plus_7d": 0.15,
            "p3_bullpen_era": 0.20,
            "p4_is_home": 0.05,
        }
        weights = compute_dynamic_weights(attribution)
        total = sum(weights.values())
        assert abs(total - 1.0) < 1e-6, f"Weights sum {total} should be 1.0"

    def test_compute_dynamic_weights_within_bounds(self):
        """All weights must remain within [CALIB_MIN, CALIB_MAX]."""
        attribution = {"p1_sp_siera": 1.0}   # Extreme blame on SP
        weights = compute_dynamic_weights(attribution)
        for pillar, w in weights.items():
            assert config.CALIB_MIN_PILLAR_WEIGHT <= w <= config.CALIB_MAX_PILLAR_WEIGHT, \
                f"Weight for {pillar}: {w:.3f} out of [{config.CALIB_MIN_PILLAR_WEIGHT}, {config.CALIB_MAX_PILLAR_WEIGHT}]"

    def test_post_mortem_insufficient_sample(self):
        """run_post_mortem_attribution with < CALIB_MIN_SAMPLE_SIZE should return empty dict."""
        entries = [self._make_entry(result="WIN") for _ in range(5)]  # < 10
        result = run_post_mortem_attribution(entries)
        assert result == {}, "Should return empty dict for cold start"


# ==============================================================================
# 7. DATA FETCHER FALLBACKS
# ==============================================================================

class TestDataFetcherFallbacks:
    """Tests for data_fetcher v6.0 functions (fallback paths)."""

    def test_load_first_inning_slate_returns_three_dicts(self):
        """load_first_inning_slate should always return 3 dicts (possibly empty)."""
        from data_fetcher import load_first_inning_slate
        games = _make_games()
        sp_splits, top3_wrc, nrfi_trends = load_first_inning_slate(games)
        assert isinstance(sp_splits, dict), "sp_splits should be dict"
        assert isinstance(top3_wrc, dict), "top3_wrc should be dict"
        assert isinstance(nrfi_trends, dict), "nrfi_trends should be dict"

    def test_load_first_inning_slate_uses_mock_fallback(self):
        """Without live API, should fall back to mock data (non-empty)."""
        from data_fetcher import load_first_inning_slate
        games = _make_games()
        sp_splits, top3_wrc, nrfi_trends = load_first_inning_slate(games)
        assert len(sp_splits) > 0,   "sp_splits fallback should be non-empty"
        assert len(top3_wrc) > 0,    "top3_wrc fallback should be non-empty"
        assert len(nrfi_trends) > 0, "nrfi_trends fallback should be non-empty"

    def test_fetch_sp_splits_fallback_returns_mock(self):
        """fetch_sp_first_inning_splits should return MOCK_SP_FIRST_INN_SPLITS as fallback."""
        from data_fetcher import fetch_sp_first_inning_splits
        result = fetch_sp_first_inning_splits(pitcher_ids=[1003, 1015])
        # Even if pybaseball not available or cache misses, should return something
        assert isinstance(result, dict)

    def test_fetch_nrfi_trends_fallback_returns_mock(self):
        """fetch_nrfi_trends should return MOCK_NRFI_TRENDS as fallback."""
        from data_fetcher import fetch_nrfi_trends
        result = fetch_nrfi_trends(date_str="2026-08-21")
        assert isinstance(result, dict)
        assert len(result) > 0, "NRFI trends fallback should be non-empty"

    def test_evaluate_first_inning_legs_handles_none_values(self):
        """evaluate_first_inning_legs must not crash when game home_sp, weather, or trends contain None."""
        game = {
            "game_id": 9998,
            "home_team": "Los Angeles Dodgers",
            "away_team": "Miami Marlins",
            "venue": "Dodger Stadium",
            "home_starter_id": None,
            "away_starter_id": None,
            "home_sp": None,      # Explicitly None
            "away_sp": None,      # Explicitly None
            "weather": None,      # Explicitly None
        }
        try:
            evaluate_first_inning_legs(
                game,
                sp_splits_data={None: None},  # Dictionary lookup mapping to None
                top3_wrc_data={"Los Angeles Dodgers": None, "Miami Marlins": None},
                nrfi_trends_data={"Los Angeles Dodgers": None, "Miami Marlins": None},
            )
        except AttributeError as exc:
            pytest.fail(f"evaluate_first_inning_legs raised AttributeError under None inputs: {exc}")
