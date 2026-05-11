# NBA Analytics & Prediction Engine

A professional, scalable architecture for NBA sports analytics, betting edge detection, and predictive modeling.

## 📂 Project Structure

- **`app/`**: Streamlit dashboard and multi-page application.
  - `dashboard.py`: Main entry point for the UI.
  - `pages/`: Individual analytical views (Live Games, Predictions, etc.).
- **`core/`**: Critical infrastructure components.
  - `api_client.py`: Handles external data requests.
  - `data_pipeline.py`: Manages ETL processes.
  - `scheduler.py`: Handles background jobs.
  - `cache_manager.py`: Optimizes performance.
- **`analytics/`**: Domain-specific analysis logic.
  - `analyze.py`: General stats processing.
  - `pace_analysis.py`: Efficiency and pace metrics.
  - `offensive_rating.py` / `defensive_rating.py`: Rating calculations.
  - `form_analysis.py`: Trend and momentum detection.
  - `betting_analysis.py`: Odds and market efficiency.
- **`predictors/`**: Predictive engines and confidence scoring.
  - `predictor.py`: Base predictor interface.
  - `winner_predictor.py` / `total_predictor.py`: Outcome-specific models.
  - `live_predictor.py`: In-game prediction adjustments.
- **`models/`**: Machine Learning assets and feature engineering.
- **`data/`**: Multi-tiered data storage (Raw, Processed, Historical, Live).
- **`utils/`**: Shared utilities, logging, and constants.
- **`tests/`**: Comprehensive test suite using `pytest`.

## 🔄 Project Workflow

1.  **Ingestion**: `core/api_client.py` fetches data which is stored in `data/raw/`.
2.  **Pipeline**: `core/data_pipeline.py` transforms raw data into `data/processed/`.
3.  **Analysis**: `analytics/` modules process the data to extract deep insights.
4.  **Prediction**: `predictors/` use analytical features to generate match forecasts.
5.  **Visualization**: `app/dashboard.py` presents findings through an interactive dashboard.

## 🚀 Roadmap

- [ ] Implement robust `APIClient` for BallDontLie v1.
- [ ] Build automated ETL pipeline for historical game data.
- [ ] Develop Advanced Pace and Efficiency metrics.
- [ ] Integrate scikit-learn for Winner/Total ML models.
- [ ] Implement Live Momentum Analyzer for real-time betting edges.

## 🛠️ Setup

1.  **Environment**: Create a `.env` file from `.env.example`.
2.  **Dependencies**: `pip install -r requirements.txt`.
3.  **Run Dashboard**: `streamlit run app/dashboard.py`.
