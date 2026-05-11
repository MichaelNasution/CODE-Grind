# 🏀 NBA CLI-Based Betting Prediction Engine

A high-performance, modular, and scalable CLI tool for NBA game analysis, betting edge detection, and match predictions. This project is built for professional bettors and data enthusiasts who prefer a terminal-first workflow.

---

## 📂 Project Structure

```text
NBA/
├── core/               # Infrastructure & External Connections
│   ├── api_client.py   # Base HTTP client
│   ├── odds_client.py  # Sportsbook Odds API integration (The Odds API, etc.)
│   ├── nba_client.py   # NBA Stats/Games API client
│   ├── scheduler.py    # Background task management
│   └── cache_manager.py# Data caching (Redis/File)
├── analytics/          # Domain Logic & Statistical Processing
│   ├── team_analysis.py# Team-level efficiency metrics
│   ├── pace_analysis.py# Pace & Transition analytics
│   ├── momentum_analysis.py # Momentum & Trend detection
│   ├── quarter_analysis.py  # Specific Q1-Q4 breakdown
│   ├── totals_analysis.py   # Over/Under historical data
│   ├── winner_analysis.py   # Win probability logic
│   └── value_bet_analysis.py# Edge detection logic
├── predictors/         # Prediction Engines
│   ├── predict_today.py     # Batch today's predictions
│   ├── predict_tomorrow.py  # Batch tomorrow's predictions
│   ├── winner_predictor.py  # ML/Stat Winner model
│   ├── total_predictor.py   # ML/Stat Total model
│   ├── quarter_predictor.py # Quarter-specific outcomes
│   └── confidence_engine.py # Prediction certainty scoring
├── cli/                # Command Line Interface
│   ├── commands.py      # Command handlers
│   ├── parser.py        # Argument parsing logic
│   ├── formatter.py     # Text formatting helpers
│   └── output_renderer.py # Rich terminal rendering
├── data/               # Multi-tiered Data Storage
├── models/             # ML Assets & Feature Engineering
├── utils/              # Shared Utilities (Logger, Helpers)
├── tests/              # Unit & Integration Tests
├── main.py             # CLI Entry Point
└── config.py           # Global Configuration
```

---

## 🛠️ Installation & Setup

### 1. Initialize Environment
```bash
python -m venv venv
.\venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API Keys
1. Copy `.env.example` to `.env`.
2. Add your `BALL_DONT_LIE_API_KEY` and any `ODDS_API_KEY`.

---

## 🖥️ CLI Usage Guide

The engine is operated using simple commands.

### 1. Predict Today's Games
```bash
python main.py today
```

### 2. Predict Tomorrow's Games
```bash
python main.py tomorrow
```

### 3. Predict Specific Matchup
```bash
python main.py predict "Lakers" "Celtics"
```

### 4. Real-time Live Analysis
```bash
python main.py live
```

---

## 📊 Sample Output
```text
====================================
LAKERS vs CELTICS
=================

Predicted Winner:
Boston Celtics

Confidence:
68%

Best Market:
W2 (Moneyline)

Predicted Total:
228.5

Suggested Bet:
OVER 223.5

Quarter Edge:
Q1 OVER
Q3 Celtics Win

Value Bet:
YES (Edge found in Odds comparison)
====================================
```

---

## 🚀 Roadmap
- [ ] Implement robust `APIClient` for BallDontLie v1.
- [ ] Integrate `The Odds API` for real-time betting markets.
- [ ] Develop Advanced Pace and Momentum metrics.
- [ ] Implement Live Momentum Analyzer (real-time prediction shifts).
- [ ] Build Value Bet alerting system (CLI notifications).

---

## 🏗️ Architecture Explanation
- **Modular Design**: Every component (API, Analytics, Prediction) is isolated for easy testing and updates.
- **CLI-First**: Optimized for terminal output using `rich` for professional visualization.
- **Scalable**: Ready to integrate with scikit-learn or deep learning models in the `models/` folder.
