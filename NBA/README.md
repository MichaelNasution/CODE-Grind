# 🏀 NBA CLI Betting Engine

**NBA CLI Betting Engine** adalah platform analitik berbasis terminal untuk prediksi pertandingan NBA real-time. Engine ini mengintegrasikan data jadwal langsung dari ESPN untuk memberikan estimasi pemenang, total poin, dan deteksi taruhan bernilai (*value bets*).

---

## 🛠️ Langkah Instalasi (Step-by-Step)

Ikuti urutan ini untuk menjalankan engine dari nol:

### 1. Setup Virtual Environment
```bash
# Buat venv
python -m venv venv

# Aktifkan venv (Windows)
.\venv\Scripts\activate

# Aktifkan venv (macOS/Linux)
source venv/bin/activate

# Berhentikan venv (Deactivate)
deactivate
```

### 2. Instalasi Library
```bash
pip install -r requirements.txt
```

---

## 💰 Betting Analytics System

Engine ini menggunakan sistem klasifikasi dan ranking untuk membantu pengambilan keputusan:

### 1. Klasifikasi Value
- **BEST VALUE**: Peluang tinggi dengan odds menguntungkan.
- **SAFE VALUE**: Probabilitas menang sangat tinggi (>80%).
- **RISKY VALUE**: Peluang menang rendah dengan potensi pembayaran tinggi.
- **HIGH VALUE**: Kombinasi seimbang antara kepercayaan model dan data historis.

### 2. Probability Engine
Probabilitas dihitung spesifik untuk berbagai market: Moneyline, Spread, Totals, dan Quarter Markets.

---

## 🖥️ Cara Menggunakan (CLI)

Gunakan perintah sederhana berikut di terminal:

| Perintah | Fungsi |
| :--- | :--- |
| `python main.py today` | Prediksi semua pertandingan hari ini (Real Data) |
| `python main.py tomorrow` | Prediksi pertandingan besok |
| `python main.py live` | Pantau pertandingan yang sedang berlangsung |
| `python main.py predict "Home" "Away"` | Prediksi matchup tim kustom |

---

## 📂 Alur Kerja Engine
1. **Fetch**: Mengambil jadwal riil dari ESPN Scoreboard.
2. **Analyze**: Menghitung metrik statistik dan tren momentum.
3. **Betting Logic**: `analytics/value_engine.py` mendeteksi peluang terbaik.
4. **Render**: Menampilkan hasil profesional dengan detail klasifikasi value.

---

## 🏗️ Arsitektur Project
- `core/`: Client API & Pipeline Data.
- `analytics/`: Logika statistik, efisiensi, dan value engine.
- `predictors/`: Model prediksi, market engine, dan kepercayaan.
- `cli/`: Parser perintah & perender output terminal (Advanced).
