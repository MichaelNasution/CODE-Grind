# 🏀 NBA CLI Betting Engine

**NBA CLI Betting Engine** adalah platform analitik terminal profesional untuk prediksi NBA. Dirancang dengan tampilan *Sportsbook Console*, engine ini memberikan analisis mendalam secara instan, akurat, dan granular.

---

## 🚀 Fitur Unggulan (Advanced)
- **Real-Time Scoreboard**: Status-aware header untuk game **LIVE**, **FINAL**, dan **SCHEDULED**.
- **Quarter Score Projections**: Prediksi skor individu (Home-Away) dan total poin per kuarter (Q1-Q4).
- **H2H Analysis Engine**: Analisis otomatis 4 pertemuan terakhir untuk mendeteksi tren kemenangan dan skor.
- **Value Bet Ranking**: Daftar taruhan paling menguntungkan yang diurutkan berdasarkan probabilitas.

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

---

## 🖥️ Cara Menggunakan (CLI)

| Perintah | Fungsi |
| :--- | :--- |
| `python main.py today` | Analisis pertandingan hari ini (Real-time ESPN) |
| `python main.py tomorrow` | Jadwal & Prediksi pertandingan besok |
| `python main.py live` | Pantau pertandingan yang sedang berlangsung (Score & Clock) |
| `python main.py predict "Home" "Away"` | Analisis kustom matchup spesifik |

---

## 📊 Advanced Quarter Table
Output terminal menyertakan matriks kuarter yang kaya informasi:
- **Score Predict**: Proyeksi skor individu kedua tim.
- **Total**: Estimasi total poin dalam satu kuarter.
- **Prediction**: Rekomendasi taruhan (OVER/UNDER) spesifik per periode.

---

## 🏗️ Arsitektur Project
- `core/`: Client API (ESPN) dengan dukungan skor real-time & clock.
- `analytics/`: H2H Analysis, Quarter Score Projections, & Value Engine.
- `predictors/`: Quarter Score & Winner Predictors.
- `cli/`: Status-aware Renderer & Sportsbook-style Layout.
