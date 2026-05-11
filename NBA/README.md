# NBA Analytics & Prediction System

Professional sports analytics platform for NBA game data, statistical analysis, and predictive modeling.

## 🚀 Features
- **Automated Data Ingestion:** Connects to BallDontLie API to fetch live and historical game results.
- **Advanced Team Analytics:** Calculate average scores, win rates (Home/Away splits), and track recent form.
- **Predictive Engine:** Statistical algorithms to predict match winners and over/under point totals.
- **Interactive Dashboard:** Modern Streamlit interface for exploring data and generating match insights.
- **Scalable Architecture:** Modular code structure ready for integration with scikit-learn ML models.

---

## 🛠️ Installation & Setup

### 1. Initialize Environment
It is recommended to use a virtual environment to manage dependencies.

```bash
# Create venv
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate

# Activate venv (macOS/Linux)
source venv/bin/activate
```

### 2. Install Requirements
```bash
pip install -r requirements.txt
```

### 3. API Configuration
1. Open `config.py`.
2. Ensure the `API_KEY` is set. (A default key is provided, but you can get your own at [balldontlie.io](https://docs.balldontlie.io/)).

---

## 📈 Usage

### Step 1: Data Ingestion
Populate the local database (`data/processed_games.csv`) by running:
```bash
python main.py
```

### Step 2: Launch the Analytics Dashboard
Visualize the data and run predictions:
```bash
streamlit run dashboard.py
```

---

## 📂 Project Structure
```text
NBA/
├── data/           # Processed datasets (CSV/JSON)
├── models/         # Future machine learning models (.joblib/.pkl)
├── utils/          # Shared utility functions
├── app/            # Source code for Streamlit components
├── notebooks/      # Jupyter notebooks for R&D
├── main.py         # Entry point for data fetching
├── analyze.py      # Core logic for statistical processing
├── predictor.py    # Prediction algorithms and betting logic
├── dashboard.py    # Streamlit UI implementation
├── config.py       # Global configuration & API keys
├── requirements.txt# Project dependencies
└── README.md       # Project documentation
```

## 📝 Coding Style
- **Clean Architecture:** Modular separation of concerns.
- **Typing:** Uses Python type hinting for better developer experience.
- **Production Ready:** Scalable structure suitable for large-scale data science projects.

---
Built with ❤️ for NBA Fans and Data Enthusiasts.
