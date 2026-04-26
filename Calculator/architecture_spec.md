# NEO-FX: Advanced Mathematical System Architecture
**The Evolution of fx-991EX ClassWiz**

## 1. System Core (Modular Library)

### Spreadsheet Engine (The Grid)
*   **Architecture**: Reactive Cell Model. Setiap sel ($A1, B2$) adalah object dengan property `value`, `formula`, dan `dependencies`. Menggunakan Directed Acyclic Graph (DAG) untuk mencegah circular reference.
*   **UI Interaction**: Grid 10x100 dengan "Formula Bar" di atas. Support drag-to-fill dan absolute/relative referencing ($A1$ vs $\$A\$1$).
*   **Engineering Case**: Perhitungan distribusi momen pada struktur portal statis tak tentu (Iteration Method). Pengguna memasukkan koefisien distribusi dan melakukan iterasi antar sel secara visual.

### Solver Engine (The Root-Finder)
*   **Architecture**: Modular Solver. Menggunakan metode Newton-Raphson untuk konvergensi cepat dan Bisection sebagai fallback jika derivatif mendekati nol.
*   **UI Interaction**: Panel "Variable Entry". User memasukkan persamaan (misal: $x^2 + \sin(x) = 10$), sistem secara otomatis mendeteksi variabel dan meminta "Initial Guess".
*   **Engineering Case**: Mencari titik kerja (Operating Point) transistor di rangkaian nonlinear. Memecahkan persamaan arus Shockley dengan variabel tegangan $V_{be}$.

### Matrix Engine (The Array)
*   **Architecture**: High-dimensional Storage. Menggunakan array 2D typed-array (Float64Array) untuk performansi. Support operasi: Inversion, Determinant, Transpose, dan LU Decomposition.
*   **UI Interaction**: Virtual Grid $4 \times 4$ (Standard) hingga $N \times N$ (Advanced). Input cepat menggunakan numpad dengan auto-tabbing.
*   **Engineering Case**: Analisis Jaringan Listrik (Mesh Analysis). Menyusun matriks impedansi $Z$ dan vektor tegangan $V$ untuk mencari arus cabang $I = Z^{-1}V$.

---

## 2. Program Simulation Engine (No-Code Logic)

### Multi-statement Execution
*   **Syntax**: `:` (Colon) sebagai separator. Misal: `A+1→B : B^2→C : C/2`.
*   **Logic**: Sequential buffer execution. Hasil dari statement terakhir disimpan di `Ans`.

### CALC-like Evaluation Engine
*   **Dynamic Variable System**: Memory bank A–Z + $x, y, z$. 
*   **Reusable Formula Templates**: User dapat menyimpan "Snippet" (misal: Hukum Bernoulli) dan memanggilnya dengan tombol `CALC`. Sistem akan mem-prompt: `Value for P1?`, `Value for v1?`.

### Pseudo-loop Simulation
*   **Manual Iteration**: Tombol `CALC` + `Enter` berulang akan mengeksekusi pipeline yang sama dengan nilai `Ans` yang diperbarui.
*   **Automated Step**: Fitur "Iterate N times" yang mensimulasikan looping tanpa menulis `for(i=0; i<10; i++)`.

**Case Newton-Raphson**:
1. Formula: `x - f(x)/f'(x) → x`
2. Input `x` awal.
3. Tekan `Enter` berulang hingga nilai `x` tidak berubah (konvergensi).

---

## 3. Visualization Engine (QR 2.0)

### Flow: Input → Compute → Visualize
1. **Input**: Persamaan atau Tabel Data.
2. **Compute**: Engine menghitung koordinat titik (100-500 pts).
3. **Visualize**: Render via HTML5 Canvas/WebGPU secara real-time di sidebar.

### UI Design
*   **Graph Panel**: Overlay transparan di sisi kanan.
*   **Parameter Slider**: Jika variabel $k$ ada dalam persamaan $y = kx^2$, slider akan muncul otomatis untuk visualisasi dinamika fungsi (Sensitivity Analysis).
*   **Export**: Satu klik untuk menyalin link interaktif atau merender QR untuk transfer ke mobile device.

---

## 4. Emulator & Cross-Platform

| Platform | Mode | Feature Highlight |
| :--- | :--- | :--- |
| **Desktop** | Professional | Window modular, multi-calc, export ke Excel/CSV. |
| **Web** | Collaborative | Cloud sync, shareable URL, WebGPU Acceleration. |
| **Mobile** | Field Tool | Touch-optimized, AR Graphing (menggunakan kamera untuk scan soal). |

### Modes
*   **Exam Mode**: Mematikan Visualization Engine dan Advanced Matrix. Reset total via kombinasi tombol fisik/virtual. Compliance dengan aturan ujian internasional.
*   **Advanced Mode**: Unlock semua modul, support skrip sederhana, dan visualisasi 3D.

---

## 5. System Limitation & Design Trade-off

### Why NOT a full programming language?
*   **Simplicity**: Menghindari sintaks kompleks (bracket, semicolon, types).
*   **Speed-to-Result**: Fokus pada "Input and Go". Tidak ada fase "Compile" atau "Debug environment".

### Comparisons
*   **vs Python**: Python menang di library ($NumPy/Pandas$), tetapi kalah di "Setup Time". NEO-FX siap pakai dalam 1 detik.
*   **vs MATLAB**: MATLAB untuk simulasi heavy-duty. NEO-FX untuk "Back-of-the-envelope engineering" di lapangan atau kelas.

---

## 6. Advanced User Strategy (The Engineering Abuse)

### Workflow "Calculator as System"
1. **Memory Pre-loading**: Simpan konstanta spesifik proyek (misal: modulus elastisitas beton) ke variabel `E`.
2. **Formula Chaining**: Jangan hitung parsial. Masukkan seluruh formula panjang ke pipeline. Kurangi error pembulatan dan typo.
3. **The Ans Loop**: Gunakan `Ans` untuk metode numerik. Jangan tulis ulang angka hasil sebelumnya.
4. **Shortcut Strategi Ujian**:
    *   Gunakan `Table Mode` untuk "Brute Force" mencari akar jika Solver gagal.
    *   Gunakan `Spreadsheet` untuk verifikasi data statistik massal secara cepat.
    *   Simpan rumus rumit di variabel `f(x)` untuk substitusi nilai cepat.

**Filosofi**: Anggap kalkulator sebagai *state-machine*, bukan sekadar *arithmetic tool*. Optimalkan alur data dari Input → Memory → Pipeline → Output.
