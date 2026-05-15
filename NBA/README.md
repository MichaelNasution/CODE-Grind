# 🏀 NBA CLI Betting Analytics Engine (Quant-Style)

**NBA CLI Betting Analytics Engine** adalah platform analitik terminal profesional yang berfokus pada **Pure Analytics & Synthetic Market Generation**. Engine ini tidak lagi bergantung pada Odds API eksternal, melainkan menghasilkan *internal betting lines* sendiri menggunakan pemodelan statistik tingkat lanjut.

---

## 🚀 Quant-Style Analytics Architecture

Engine telah bertransisi ke sistem **Pure Analytics & Prediction Core**. Alur kerja baru memastikan setiap prediksi unik, dinamis, dan sadar akan varians.

### 🧠 Analytics Pipeline
1.  **Schedule & Matchup Analysis**: Konteks awal pertandingan.
2.  **Offensive & Defensive Profiles**: Pemodelan statistik profil tim.
3.  **Pace Analysis**: Proyeksi total kepemilikan bola (Possessions per 48 min).
4.  **Variance Engine**: Mengestimasi volatilitas skor berdasarkan pace dan konsistensi.
5.  **Projection Engine**: Menghasilkan proyeksi skor tim dan total poin.
6.  **Line Generator**: Menciptakan *synthetic betting lines* (Safest, Safe, Value, Aggressive) dengan *dynamic distancing*.
7.  **Confidence Engine**: Kalkulasi probabilitas hit menggunakan permodelan distribusi normal.

---

## ✨ Fitur Unggulan

-   **Internal Line Generation**: Engine menghasilkan garis taruhan sendiri, bukan sekadar mengambil dari bandar.
-   **Bet Tiers System**: Rekomendasi taruhan berdasarkan tingkat risiko (Safest hingga Aggressive).
-   **Dynamic Line Distancing**: Jarak antar line disesuaikan secara otomatis berdasarkan pace pertandingan (High pace = Jarak lebar, Slow pace = Jarak sempit).
-   **Quarter-by-Quarter Projections**: Analisis mendalam per kuarter dengan model varians internal.
-   **Variance-Aware Modeling**: Engine mendeteksi tim yang tidak stabil dan menyesuaikan tingkat kepercayaan secara dinamis.

---

## 🖥️ Cara Menggunakan (CLI)

| Perintah | Fungsi |
| :--- | :--- |
| `python main.py today` | Analisis pertandingan hari ini (Quant Engine) |
| `python main.py tomorrow` | Jadwal & Prediksi pertandingan besok |
| `python main.py live` | Pantau skor real-time & proyeksi dinamis |

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

## 📂 Struktur Analytics Baru
- `analytics/variance_engine.py`: Estimasi volatilitas skor.
- `analytics/confidence_engine.py`: Kalkulasi probabilitas hit & tiering.
- `analytics/line_generator.py`: Pembuatan internal betting lines.
- `analytics/synthetic_market_generator.py`: Orkestrator pasar taruhan internal.
- `analytics/projection_engine.py`: Model proyeksi skor & pace.
