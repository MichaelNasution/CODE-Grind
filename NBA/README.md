# 🏀 NBA CLI Betting Engine

**NBA CLI Betting Engine** adalah platform analitik berbasis terminal untuk prediksi pertandingan NBA real-time. Engine ini mengintegrasikan data jadwal langsung dari ESPN untuk memberikan estimasi pemenang, total poin, dan deteksi taruhan bernilai (*value bets*).

---

## 🚀 Fitur Utama
- **Real-Time Data**: Mengambil jadwal pertandingan riil (Today/Tomorrow/Live) via ESPN API.
- **Predictive Analytics**: Estimasi pemenang, total skor, dan keunggulan per kuarter.
- **Betting Edge**: Deteksi *Value Bet* dan rekomendasi market terbaik (W1/W2, Over/Under).
- **Pro Interface**: Output terminal yang bersih dan profesional menggunakan `rich`.

---

## 🛠️ Langkah Instalasi (Step-by-Step)

Ikuti urutan ini untuk menjalankan engine dari nol:

### 1. Setup Virtual Environment
Mencegah konflik library di sistem Anda.
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

### 3. Konfigurasi (Opsional untuk Ingestion)
Salin `.env.example` menjadi `.env` jika Anda memerlukan integrasi API berbayar di masa depan.

---

## 🖥️ Cara Menggunakan (CLI)
Setelah venv aktif, gunakan perintah berikut:

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
2. **Analyze**: Memproses statistik tim dan tren performa.
3. **Predict**: Menghasilkan probabilitas kemenangan dan estimasi skor.
4. **Render**: Menampilkan hasil secara visual di terminal.

---

## 🏗️ Arsitektur Project
- `core/`: Client API & Pipeline Data.
- `analytics/`: Logika statistik & efisiensi.
- `predictors/`: Model prediksi & engine kepercayaan.
- `cli/`: Parser perintah & perender output terminal.

---
*Built for Speed, Scalability, and Professional Betting Analytics.*
