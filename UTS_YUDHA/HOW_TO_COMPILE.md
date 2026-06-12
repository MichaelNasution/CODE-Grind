# 🍽️ HOW TO COMPILE — Warung Makan Barokah CLI

> Program ini ditulis dalam **C#** dan dijalankan menggunakan **.NET SDK**.
> Berikut panduan lengkap dari instalasi dependensi hingga menjalankan program.

---

## 📦 Dependencies

| Kebutuhan         | Versi Minimum | Keterangan                        |
|-------------------|--------------|-----------------------------------|
| .NET SDK          | 8.0          | Compiler & runtime untuk C#       |
| OS                | Windows 10+  | (juga support Linux/macOS)        |

---

## 🔧 Install Dependencies

### 1. Install .NET SDK 8 (pilih salah satu cara)

**Via winget (Windows Package Manager) — Rekomendasi:**
```powershell:
                winget install Microsoft.DotNet.SDK.8
```

**Via website resmi (manual download):**
```
https://dotnet.microsoft.com/en-us/download/dotnet/8.0
```

### 2. Verifikasi instalasi berhasil
```powershell
dotnet --version
```
Output yang diharapkan: `8.x.xxx`

---

## 🏗️ Compile Program

```powershell
cd d:\CODE\CODE-Grind\UTS_YUDHA
dotnet build UTS_YUDHA.csproj
```

Output sukses:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

---

## ▶️ Jalankan Program

```powershell
dotnet run --project UTS_YUDHA.csproj
```

Atau jika sudah di-build, jalankan langsung executable-nya:
```powershell
.\bin\Debug\net8.0\UTS_YUDHA.exe
```

---

## 🛠️ Menggunakan Makefile (opsional)

Jika `make` tersedia (via Git Bash, MSYS2, atau WSL):

```bash
# Compile
make build

# Compile sekaligus jalankan
make run

# Bersihkan hasil build
make clean
```

---

## 📂 Struktur File

```
UTS_YUDHA/
├── Program.cs          ← Source code utama (semua logic di sini)
├── UTS_YUDHA.csproj    ← Project file C#
├── Makefile            ← Shortcut build & run
├── HOW_TO_COMPILE.md  ← File ini
└── readme.md           ← Soal tugas
```

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---|---|
| `dotnet: command not found` | Install .NET SDK dulu (lihat bagian Install di atas) |
| `Build failed` | Pastikan file `Program.cs` dan `UTS_YUDHA.csproj` ada di folder yang sama |
| Karakter tabel rusak/kotak | Pastikan terminal mendukung UTF-8 (Windows Terminal / PowerShell 7 direkomendasikan) |

---

> **Catatan:** Untuk tampilan tabel yang optimal (karakter box-drawing `╔ ╗ ║` tampil benar),
> gunakan **Windows Terminal** atau **PowerShell 7**, bukan Command Prompt lama (cmd.exe).
