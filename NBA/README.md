# 🏀 NBA CLI Betting Engine

**NBA CLI Betting Engine** adalah platform analitik terminal profesional untuk prediksi NBA. Dirancang dengan tampilan *Sportsbook Console*, engine ini menggunakan pendekatan **Ensemble Modeling** (Multi-Engine) yang terinspirasi oleh standar industri.

---

## 🚀 Fitur Unggulan (Advanced ML)
- **Ensemble Predictor**: Menggabungkan hasil dari berbagai engine (Baseline, Linear, Tree, dan Deep Learning).
- **Hierarchical Architecture**: Terinspirasi oleh *Phase 5 NBA AI*, menganalisis dari level Player (L1), Synergy (L2), hingga Team (L3).
- **Real-Time Scoreboard**: Status-aware header untuk game **LIVE**, **FINAL**, dan **SCHEDULED**.
- **Quarter Score Projections**: Prediksi skor individu (Home-Away) dan total poin per kuarter (Q1-Q4).

---

## 🛠️ Langkah Instalasi
1. **Setup Environment**:
   ```bash
   python -m venv venv
   # Aktifkan (Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   *(Sudah termasuk: PyTorch, Scikit-learn, XGBoost, Optuna)*

---

## 🖥️ Cara Menggunakan (CLI)

| Perintah | Fungsi |
| :--- | :--- |
| `python main.py today` | Analisis pertandingan hari ini (Ensemble Engine) |
| `python main.py tomorrow` | Jadwal & Prediksi pertandingan besok |
| `python main.py live` | Pantau skor real-time & clock |

---

## 📂 Alur Kerja (Ensemble Workflow)
`Schedule` ➔ `Team Profiles` ➔ `Ensemble Analysis (DL/XGB/Linear)` ➔ `Averaging` ➔ `Value Engine` ➔ `CLI Renderer`.

---

## 🏗️ Arsitektur Predictor
- `predictors/engines/`: Berisi berbagai engine prediksi (Baseline, DL, Linear, Tree).
- `predictors/ensemble_predictor.py`: Orkestrator yang menggabungkan seluruh hasil engine.
- `analytics/advanced/`: Modul untuk Player Ability (L1) dan Synergy (L2).
