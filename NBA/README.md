# 🏀 NBA CLI Betting Engine

**NBA CLI Betting Engine** adalah platform analitik terminal canggih untuk prediksi NBA. Engine ini menggunakan data historis **H2H (Head-to-Head)** dan pola per kuarter untuk memberikan analisis taruhan yang sangat granular.

---

## 🚀 Fitur Unggulan (Advanced)
- **H2H Engine**: Analisis otomatis 4 pertemuan terakhir untuk mendeteksi tren kemenangan dan skor.
- **Quarter-by-Quarter Prediction**: Prediksi pemenang dan Over/Under untuk Q1, Q2, Q3, dan Q4.
- **Dual Team Totals**: Rekomendasi taruhan khusus untuk poin total masing-masing tim.
- **Compact Professional CLI**: Tampilan terminal baru yang lebih ringkas, padat informasi, dan mudah dibaca.

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

## 💰 Betting Analytics System

### 1. H2H & Quarter Analysis
Engine memproses data 4 pertandingan H2H terakhir untuk menghitung:
- **Scoring Patterns**: Mengidentifikasi kuarter mana yang cenderung menghasilkan skor tinggi/rendah.
- **Dominance Trends**: Tim mana yang secara historis menguasai kuarter tertentu.

### 2. Team Total Analysis
Analisis mendalam untuk poin individu tim (Home vs Visitor). Suggested bets hanya ditampilkan jika memenuhi syarat probabilitas (>65%) dan memiliki *value* yang layak.

### 3. Klasifikasi Value
- **BEST VALUE**: Odds menguntungkan + Probabilitas tinggi.
- **SAFE VALUE**: Probabilitas menang sangat tinggi (>80%).
- **RISKY VALUE**: Potensi profit tinggi dengan probabilitas menengah.

---

## 🖥️ Cara Menggunakan (CLI)

| Perintah | Fungsi |
| :--- | :--- |
| `python main.py today` | Analisis & Prediksi pertandingan hari ini (Real-time) |
| `python main.py tomorrow` | Jadwal & Prediksi pertandingan besok |
| `python main.py predict "Home" "Away"` | Analisis kustom matchup spesifik |

---

## 📂 Alur Kerja (Workflow)
`Schedule` ➔ `H2H Analysis` ➔ `Quarter Pattern Analysis` ➔ `Totals Analysis` ➔ `Value Engine` ➔ `Compact Renderer`.

---

## 🏗️ Arsitektur Project
- `core/`: Client API (ESPN) & Data Pipeline.
- `analytics/`: H2H Analysis, Quarter Patterns, Team Totals, & Value Engine.
- `predictors/`: Quarter Winner/Totals & Team Performance.
- `cli/`: Compact Renderer & CLI Logic.
