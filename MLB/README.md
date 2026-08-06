# ⚾ Quantitative MLB Handicapping & Betting Analytics CLI System

![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![Build Status](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Sebuah sistem CLI berbasis Python kuantitatif, otomatis, dan berstandar produksi (*production-grade*) untuk menganalisis data Major League Baseball (MLB). Program ini dirancang untuk menemukan nilai *Positive Expected Value* (+EV) serta *edge* matematika terhadap garis taruhan sportsbook (*moneyline*, *parlay slips*, *over/under*, dan *pitcher props*) dengan disiplin manajemen risiko *bankroll* yang ketat.

---

## ⚡ Cara Menjalankan Program (Quickstart)

### 1. Jalankan Aplikasi Utama (CLI Interface)
Buka terminal / PowerShell di direktori proyek dan jalankan perintah berikut:

```bash
python main.py
```

### 2. Jalankan Pengujian Kuantitatif & Test Suite (Unit & System Tests)

- **Jalankan Unit Test Moneyline Engine (TDD dengan pytest):**
  ```bash
  python -m pytest test_moneyline.py -v
  ```

- **Jalankan System Smoke Test (Validasi 4 Strategi + Bankroll):**
  ```bash
  python smoke_test.py
  ```

---

## ⚙️ Persyaratan Sistem & Instalasi

1. **Python**: Versi 3.10 atau lebih baru.
2. **Instalasi Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   *(Pustaka utama meliputi: `rich`, `requests`, `pytest`)*

---

## 🎯 4 Strategi Utama & Fitur Sistem

### 🏆 1. Moneyline Strong Recommendations & Lock of the Day
- **Penilaian Kuantitatif (Win Confidence Score $\ge 65\%$ - $75\%$):**
  - **Pitcher Advantage**: Starter Pitcher memiliki selisih ERA $\ge 1.25$ dan WHIP lebih rendah dari pitcher lawan.
  - **Forma Tim (Last 10 Games)**: Win Rate 10 pertandingan terakhir $\ge 60\%$.
  - **Offensive Matchup**: OPS tim vs tipe lemparan pitcher lawan (RHP / LHP) lebih unggul minimal $10\%$.
- **Parlay Slip Generator**: Menyusun kombinasi parlay **3, 4, 5, 8, dan 10 Legs** yang dilengkapi hitungan *Combined Implied Odds* dan *EV Edge*.
- **🔒 LOCK OF THE DAY**: Memilih 1 matchup paling dominan (Win Confidence $\ge 80\%$) dengan varians terendah untuk dijadikan rekomendasi *Single Pick*.

### 🎯 2. Under Home Run Parlay Screener
- **Filter Pitcher Top 15**: Starter Pitcher aktif dengan statistik HR/9 $\le 0.80$.
- **H2H Bersejarah**: Batter lawan dengan karir **0 Home Run** vs pitcher tersebut (min 3 PA).
- **True Probability**: 
  $$\text{True\_No\_HR\_Prob} = 1.0 - \left(\frac{\text{Total HR (Musim Ini + Lalu)}}{\text{Total PA (Musim Ini + Lalu)}}\right)$$
- **Penyaringan Probabilitas**: Hanya batter dengan probabilitas $\ge 94\%$ yang disusun ke dalam slip parlay **3, 4, 5, 8, dan 10 Legs**.

### 📊 3. Proyeksi Total Skor 5-Faktor (Over/Under)
- **Starter Pitchers**: $\text{Adjusted ERA} = (\text{Season ERA} + \text{Last 5 Starts ERA}) / 2$.
- **Bullpen Strength**: Ekspektasi kebobolan bullpen berdasarkan ERA Bullpen.
- **Offensive Multiplier**: Perbandingan *Runs Per Game* tim terhadap rata-rata liga ($4.4$).
- **Ballpark Factor**: Faktor stadion (misal Coors Field = $1.20$, Oracle Park = $0.90$).
- **Weather Adjustments (Open-Meteo API)**:
  - Angin berembus keluar $\ge 10\text{ mph}$ ($+0.5\text{ run}$), ke dalam ($-0.5\text{ run}$).
  - Suhu $> 85^\circ\text{F}$ ($+0.25\text{ run}$), $< 50^\circ\text{F}$ ($-0.25\text{ run}$).
- **Aturan Margin (Edge Rules)**: Edge $\ge 0.75 \to \text{OVER/UNDER}$; Edge $< 0.75 \to \text{SKIP}$.

### ⚡ 4. Pitcher Props & System Anchor (2-Man Slips)
- **Goblin K-Props**: Menyaring Strikeouts pitcher Ace (Pitch count $\ge 90$, K/9 $\ge 7.5$) dengan garis statistik aman (*Goblin line*).
- **2-Man Anchor Slip**: Memasangkan 1 Prop Strikeouts Pitcher dengan 1 Hitter Prop aman (misal $\ge 0.5$ Hits).

### 💰 5. Bankroll Manager & Stake Risk Allocator
- **Daily Risk Budget**: Maksimal **10%** dari total Bankroll per hari.
- **Ukuran 1 Unit**: **2%** dari total Bankroll.
- **Stake Allocator Otomatis**:
  - Single Pick / Lock of the Day / 2-Man Anchor: **1.00 Unit**
  - 3-Leg Parlay Slip: **1.00 Unit**
  - 4-Leg Parlay Slip: **0.75 Unit**
  - 5-Leg Parlay Slip: **0.50 Unit**
  - 8 & 10-Leg Parlay Slip: **0.25 Unit** (High Variance / Lottery)

### 📅 6. Seleksi Tanggal Analisis Dinamis
- **Option A**: Hari Ini (Auto-detect tanggal sistem `YYYY-MM-DD`).
- **Option B**: Besok (`YYYY-MM-DD + 1 hari`).
- **Option C**: Custom Date (`YYYY-MM-DD`).

---

## 📁 Struktur Berkas Proyek

```text
MLB/
├── main.py              # Entry point utama aplikasi CLI & menu router (7 pilihan)
├── analytics.py         # Mesin kalkulasi kuantitatif 4 strategi & Lock of the Day
├── data_fetcher.py      # Layer integrasi API (MLB StatsAPI, Open-Meteo, The Odds API)
├── bankroll.py          # Mesin pengelola risiko bankroll & alokasi stake (persisten JSON)
├── cli_ui.py            # Antarmuka CLI modern berbasis pustaka `rich`
├── mock_data.py         # Dataset fallback offline (12 pertandingan & 24 pitcher)
├── moneyline.py         # Standalone Moneyline Predictor engine (TDD module)
├── test_moneyline.py    # Suite pengujian unit TDD menggunakan pytest
├── smoke_test.py        # Functional system smoke test suite
├── config.py            # Konfigurasi parameter, park factors, & API keys
├── requirements.txt     # Daftar dependensi Python
└── README.md            # Dokumentasi proyek
```

---

## 🔑 Konfigurasi API (Opsional)

Aplikasi berjalan secara penuh dalam **Offline / Fallback Mode** menggunakan data sintetis dari `mock_data.py`. Untuk mengaktifkan data *live sportsbook lines*:

1. Buka file [`config.py`](file:///d:/[college]/CODE/CODE-Grind/MLB/config.py).
2. Masukkan API Key Anda pada variabel `API_KEYS`:
   ```python
   API_KEYS = {
       "the_odds_api": "YOUR_ACTUAL_ODDS_API_KEY",
       "open_meteo": None, # Gratis tanpa API Key
   }
   ```

---

## ⚠️ Penolakan Tanggung Jawab (Disclaimer)

Program ini dibuat semata-mata untuk tujuan **analisis statistik kuantitatif dan edukasi**. Taruhan olahraga mengandung risiko finansial. Selalu gunakan manajemen risiko (*Bankroll Management*) secara bijak dan bertanggung jawab.
