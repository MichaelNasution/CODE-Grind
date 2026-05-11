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

## 🛠️ Installation & Setup

Ikuti langkah-langkah berikut untuk menyiapkan lingkungan pengembangan:

### 1. Persiapan Virtual Environment
Disarankan menggunakan virtual environment agar dependensi antar project tidak bentrok.
```bash
# Buat venv
python -m venv venv

# Aktivasi venv (Windows)
.\venv\Scripts\activate

# Aktivasi venv (macOS/Linux)
source venv/bin/activate
```

### 2. Instalasi Dependensi
```bash
pip install -r requirements.txt
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` dan masukkan API Key Anda.
```bash
cp .env.example .env
```
Buka file `.env` dan isi `BALL_DONT_LIE_API_KEY` dengan key dari [balldontlie.io](https://docs.balldontlie.io/).

---

## 🖥️ Panduan Penggunaan CLI (Command Line Interface)

Project ini dirancang untuk dapat dioperasikan sepenuhnya melalui terminal. Berikut adalah langkah detail untuk melihat hasil prediksi:

### 1. Ingest Data (Wajib)
Sebelum melakukan prediksi, Anda harus menarik data terbaru dari API:
```bash
python main.py
```

### 2. Melihat Prediksi Pemenang (Winner Prediction)
Untuk menampilkan hasil prediksi pemenang pertandingan hari ini di terminal:
```bash
python -m predictors.winner_predictor
```
*Output yang diharapkan (setelah implementasi logic):*
```text
Matchup: Lakers vs Celtics
Win Probability: Lakers (58%) | Celtics (42%)
Predicted Winner: Los Angeles Lakers
```

### 3. Melihat Prediksi Over/Under (Total Prediction)
Untuk menampilkan estimasi total poin:
```bash
c
```
*Output yang diharapkan:*
```text
Matchup: Lakers vs Celtics
Predicted Total Points: 228.5
Recommendation: OVER 225.0
```

### 4. Menjalankan Pipeline Lengkap
Anda bisa membuat script orchestrator di `main.py` untuk menjalankan semua analisis sekaligus:
```bash
python main.py --predict-all
```

### 5. Menjalankan Unit Testing
Pastikan semua logika berjalan dengan benar:
```bash
pytest
```

---

## 📊 Menjalankan Dashboard (GUI)

Jika Anda ingin melihat visualisasi data yang lebih interaktif:
```bash
streamlit run app/dashboard.py
```

---

## 🔄 Project Workflow

1.  **Ingestion**: `core/api_client.py` mengambil data mentah -> `data/raw/`.
2.  **Pipeline**: `core/data_pipeline.py` membersihkan data -> `data/processed/`.
3.  **Analysis**: Modul `analytics/` menghitung metrik statistik mendalam.
4.  **Prediction**: `predictors/` menghasilkan probabilitas kemenangan dan estimasi skor.
5.  **Visualization**: `app/dashboard.py` menampilkan hasil akhir ke user.
