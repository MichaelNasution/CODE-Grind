/*
 * ============================================================
 *   LOGIK RESTORAN — Business Logic Layer
 *   Semua fungsi yang bisa ditest secara independen
 *   dari Console/UI ada di sini (public static)
 * ============================================================
 */

using System;

// ─────────────────────────────────────────────────────────────
//  PUBLIC CLASS: Semua logik bisnis yang bisa diuji
// ─────────────────────────────────────────────────────────────
public class LogikRestoran
{
    // ── Konstanta aturan bisnis ──────────────────────────────
    public const int    BIAYA_PELAYANAN = 20000;
    public const double TARIF_PAJAK     = 0.10;
    public const double TARIF_DISKON    = 0.10;
    public const int    BATAS_DISKON    = 100000;
    public const int    BATAS_BOGO      = 50000;
    public const int    MAKS_MENU       = 4;

    // ════════════════════════════════════════════════════════
    //  INISIALISASI DATA MENU
    // ════════════════════════════════════════════════════════
    public static MenuItem[] InisialisasiMenu()
    {
        MenuItem[] daftarMenu = new MenuItem[16];

        // ── MAKANAN ─────────────────────────────────────────
        daftarMenu[0] = new MenuItem { Id = 1,  Nama = "Nasi Goreng Ayam / Biasa",        Kategori = "Makanan",  Harga = 15000, Deskripsi = "Nasi goreng dengan telur & suwiran ayam" };
        daftarMenu[1] = new MenuItem { Id = 2,  Nama = "Mie Goreng / Rebus (Telur)",      Kategori = "Makanan",  Harga = 13000, Deskripsi = "Mie kuning dengan sayuran dan telur" };
        daftarMenu[2] = new MenuItem { Id = 3,  Nama = "Ayam Goreng / Bakar + Nasi",      Kategori = "Makanan",  Harga = 22000, Deskripsi = "Paket nasi ayam + lalapan + sambal" };
        daftarMenu[3] = new MenuItem { Id = 4,  Nama = "Lele Goreng (Pecel Lele) + Nasi", Kategori = "Makanan",  Harga = 17000, Deskripsi = "Lele goreng garing + lalapan + sambal" };
        daftarMenu[4] = new MenuItem { Id = 5,  Nama = "Nasi Telur Dadar / Ceplok",       Kategori = "Makanan",  Harga = 10000, Deskripsi = "Nasi putih + telur + kecap/kuah" };
        daftarMenu[5] = new MenuItem { Id = 6,  Nama = "Capcay Goreng / Kuah",            Kategori = "Makanan",  Harga = 15000, Deskripsi = "Sayuran tumis + bakso/ayam" };
        daftarMenu[6] = new MenuItem { Id = 7,  Nama = "Soto Ayam + Nasi",                Kategori = "Makanan",  Harga = 16000, Deskripsi = "Soto ayam kuah bening + nasi putih" };
        daftarMenu[7] = new MenuItem { Id = 8,  Nama = "Fu Yung Hai",                     Kategori = "Makanan",  Harga = 20000, Deskripsi = "Telur dadar campur sayur + saus asam manis" };

        // ── MINUMAN ─────────────────────────────────────────
        daftarMenu[8]  = new MenuItem { Id = 9,  Nama = "Es Teh Manis / Teh Hangat",       Kategori = "Minuman", Harga = 4000,  Deskripsi = "Minuman klasik wajib ada" };
        daftarMenu[9]  = new MenuItem { Id = 10, Nama = "Es Jeruk / Jeruk Hangat",         Kategori = "Minuman", Harga = 7000,  Deskripsi = "Perasan jeruk asli + air gula" };
        daftarMenu[10] = new MenuItem { Id = 11, Nama = "Es Teh Tawar / Teh Tawar Hangat", Kategori = "Minuman", Harga = 2000,  Deskripsi = "Untuk yang kurangi gula" };
        daftarMenu[11] = new MenuItem { Id = 12, Nama = "Jus Alpukat",                     Kategori = "Minuman", Harga = 12000, Deskripsi = "Jus buah segar pilihan" };
        daftarMenu[12] = new MenuItem { Id = 13, Nama = "Es Milo / Milo Hangat",           Kategori = "Minuman", Harga = 8000,  Deskripsi = "Cokelat bubuk favorit semua" };
        daftarMenu[13] = new MenuItem { Id = 14, Nama = "Kopi Hitam / Kopi Susu",          Kategori = "Minuman", Harga = 6000,  Deskripsi = "Kopi robusta saset khas warung" };
        daftarMenu[14] = new MenuItem { Id = 15, Nama = "Soda Gembira",                    Kategori = "Minuman", Harga = 12000, Deskripsi = "Sirup merah + susu + soda" };
        daftarMenu[15] = new MenuItem { Id = 16, Nama = "Air Mineral (Botol 600ml)",       Kategori = "Minuman", Harga = 4000,  Deskripsi = "Air kemasan dingin / biasa" };

        return daftarMenu;
    }

    // ════════════════════════════════════════════════════════
    //  CARI MENU BERDASARKAN ID
    // ════════════════════════════════════════════════════════
    public static MenuItem CariMenuById(MenuItem[] daftarMenu, int id)
    {
        for (int i = 0; i < daftarMenu.Length; i++)
        {
            if (daftarMenu[i].Id == id)
                return daftarMenu[i];
        }
        // Kembalikan MenuItem kosong (Id = 0) jika tidak ditemukan
        return new MenuItem();
    }

    // ════════════════════════════════════════════════════════
    //  FORMAT RUPIAH
    // ════════════════════════════════════════════════════════
    public static string FormatRupiah(int jumlah)
    {
        return "Rp " + jumlah.ToString("N0").Replace(",", ".");
    }

    // ════════════════════════════════════════════════════════
    //  HITUNG TOTAL (Diskon, BOGO, Pajak, Pelayanan)
    // ════════════════════════════════════════════════════════
    public static void HitungTotal(
        OrderItem[] pesanan,
        out int    subtotal,
        out int    potonganDiskon,
        out int    potonganBogo,
        out int    nilaiPajak,
        out int    totalAkhir,
        out bool   adaDiskon,
        out bool   adaBogo,
        out string namaMenuBogo)
    {
        // ── 1. Hitung subtotal ───────────────────────────────
        subtotal = 0;
        for (int i = 0; i < pesanan.Length; i++)
            subtotal += pesanan[i].Menu.Harga * pesanan[i].Jumlah;

        // ── 2. Cek & hitung diskon 10% ───────────────────────
        adaDiskon      = subtotal > BATAS_DISKON;
        potonganDiskon = adaDiskon ? (int)Math.Round(subtotal * TARIF_DISKON) : 0;

        int subtotalSetelahDiskon = subtotal - potonganDiskon;

        // ── 3. Cek & hitung BOGO minuman ─────────────────────
        adaBogo      = false;
        potonganBogo = 0;
        namaMenuBogo = "";

        if (subtotal > BATAS_BOGO)
        {
            int hargaBogoTermurah = int.MaxValue;
            int indexBogo         = -1;

            for (int i = 0; i < pesanan.Length; i++)
            {
                if (pesanan[i].Menu.Kategori == "Minuman" &&
                    pesanan[i].Menu.Harga < hargaBogoTermurah)
                {
                    hargaBogoTermurah = pesanan[i].Menu.Harga;
                    indexBogo         = i;
                }
            }

            if (indexBogo >= 0)
            {
                adaBogo      = true;
                potonganBogo = hargaBogoTermurah;
                namaMenuBogo = pesanan[indexBogo].Menu.Nama;
                pesanan[indexBogo].AdaBogo = true;
            }
        }

        int subtotalSetelahBogoDiskon = subtotalSetelahDiskon - potonganBogo;

        // ── 4. Pajak 10% ─────────────────────────────────────
        nilaiPajak = (int)Math.Round(subtotalSetelahBogoDiskon * TARIF_PAJAK);

        // ── 5. Total akhir ───────────────────────────────────
        totalAkhir = subtotalSetelahBogoDiskon + nilaiPajak + BIAYA_PELAYANAN;
    }

    // ════════════════════════════════════════════════════════
    //  DETEKSI GENDER DARI NAMA (heuristik nama Indonesia)
    // ════════════════════════════════════════════════════════
    public static string DeteksiGender(string nama)
    {
        if (string.IsNullOrWhiteSpace(nama)) return "N";

        string[] bagianNama = nama.Trim().Split(' ');
        string namaDepan = bagianNama[0].ToLower();

        string[] indikasiPerempuan = {
            "sari", "dewi", "ayu", "putri", "rina", "nina", "dian",
            "sri", "wati", "lestari", "indah", "fitri", "nita", "yuni",
            "ani", "siti", "mira", "lisa", "dina", "eka", "novi",
            "rini", "evi", "intan", "mega", "riska", "desi", "nurul",
            "maya", "yuliana", "lia", "nisa", "suci", "tari", "ratna",
            "lastri", "lilis", "winda", "febri", "silvi", "rahma",
            "nadya", "nadia", "salsa", "bella", "anggi", "cindy",
            "risma", "elsa", "rena", "tiara", "khairun", "nur"
        };

        string[] indikasiLaki = {
            "ahmad", "budi", "deni", "rudi", "agus", "andi", "eko",
            "hendra", "joko", "bambang", "surya", "arif", "rizal",
            "fajar", "doni", "edo", "wahyu", "tommy", "reza", "ivan",
            "dimas", "bagas", "rendy", "kevin", "alvin", "arya", "bima",
            "putra", "yudha", "gilang", "nanda", "ferry", "galih",
            "angga", "satria", "bagus", "aditya", "raihan", "farel",
            "dafa", "rafli", "zidan", "sultan", "hafiz", "rafi"
        };

        for (int i = 0; i < indikasiPerempuan.Length; i++)
        {
            if (namaDepan == indikasiPerempuan[i] ||
                namaDepan.StartsWith(indikasiPerempuan[i]))
                return "P";
        }

        for (int i = 0; i < indikasiLaki.Length; i++)
        {
            if (namaDepan == indikasiLaki[i] ||
                namaDepan.StartsWith(indikasiLaki[i]))
                return "L";
        }

        if (namaDepan.EndsWith("i") || namaDepan.EndsWith("u"))
            return "L";
        if (namaDepan.EndsWith("a") || namaDepan.EndsWith("ah"))
            return "P";

        return "N";
    }

    // ════════════════════════════════════════════════════════
    //  PESAN TERIMA KASIH RANDOM (gender-aware)
    // ════════════════════════════════════════════════════════
    public static string[] AmbilPesanTerimakasih(string nama, string gender, int? forcePilihan = null)
    {
        Random rng = new Random();

        string[][] templatePerempuan = {
            new string[] { $"Kyaa~ makasih banyak kak {nama}!", "Udah mau mampir ke sini uwu", "Kak cantik banget sih, matanya", "lebih bersinar dari lampu LED~ ><" },
            new string[] { $"Arigatou, kak {nama}~! (๑•̀ᗜ•́)", "Makanannya udah siap ya kak!", "Eh btw... senyum kak tadi bikin", "kasirnya susah fokus hehe~ >///< " },
            new string[] { $"Terima kasih kak {nama}! (*´∧`*)", "Selamat menikmati pesanannya~", "Kata orang, orang baik suka makan enak", "dan kak keliatan banget orangnya baik! :3" },
            new string[] { $"Makasih kak {nama} udah mampir~", "Jangan lupa balik lagi ya kak!", "Soalnya kita bakal kangen kalau", "pelanggan secantik kak jarang ke sini~ ♥" },
            new string[] { $"Wahhh kak {nama}~ makasih ya!", "Semoga makanannya seenak senyumnya kak", "eh maksudnya... semoga enak ya kak~", "(kasirnya salah ngomong maaf xD)" }
        };

        string[][] templateLaki = {
            new string[] { $"Makasih bro {nama}! Udah mampir~", "Makanannya cocok buat yang kerja keras!", "Eh btw, mas ganteng-ganteng kok makan", "di sini aja sih? Kurang kerjaan? :D" },
            new string[] { $"Arigatou mas {nama}~! (≧▽≦)", "Selamat menikmati pesanannya!", "Kata orang, cowok yang sering makan enak", "adalah cowok yang hidupnya berkualitas ✨" },
            new string[] { $"Siap mas {nama}! Makasih pesanannya~", "Semoga kenyang dan semangat terus ya!", "Kalau udah kenyang jangan lupa senyum,", "soalnya senyum mas keren banget sih~ >w<" },
            new string[] { $"Makasih kak {nama} udah dateng~!", "Pesanannya udah kami siapkan nih!", "FYI: orang setampan kak kalau dateng", "bikin kasirnya deg-degan beneran lho~ //" },
            new string[] { $"Thanks mas {nama}! Seneng banget~", "Udah milih makan di sini hari ini!", "Semoga makanannya bikin mas makin", "semangat dan makin cakep~ hehe :p" }
        };

        string[][] templateNetral = {
            new string[] { $"Kyaa~ makasih kak {nama}! (*^_^*)", "Seneng banget kak udah mampir~", "Semoga makanannya bikin harimu", "jadi jauh lebih menyenangkan! ♥" },
            new string[] { $"Arigatou kak {nama}~ uwu", "Pesanannya udah siap, selamat menikmati!", "Kalau ada yang kurang, jangan segan", "bilang ke kasirnya ya~ kami suka feedback :3" },
            new string[] { $"Makasih kak {nama}! Hehe~ (///><///)", "Jangan lupa balik lagi ya kak!", "Soalnya sepi rasanya kalau kak", "nggak ada di sini~ pinky promise! ♥" },
            new string[] { $"Thanks kak {nama}, udah mampir~!", "Semoga makanannya enak dan bikin", "mood kak hari ini jadi 100/100!", "Kami tunggu kedatangannya lagi ya~ :D" }
        };

        string[][] templateDipilih;
        if (gender == "P")       templateDipilih = templatePerempuan;
        else if (gender == "L")  templateDipilih = templateLaki;
        else                     templateDipilih = templateNetral;

        int pilihan = forcePilihan.HasValue
            ? forcePilihan.Value % templateDipilih.Length
            : rng.Next(0, templateDipilih.Length);

        return templateDipilih[pilihan];
    }

    // ════════════════════════════════════════════════════════
    //  TENGAHKAN TEKS DALAM BORDER STRUK
    // ════════════════════════════════════════════════════════
    public static string TengahkanStruk(string teks, int totalLebar)
    {
        int lebarIsi  = totalLebar - 4;
        int sisaSpasi = lebarIsi - teks.Length;
        if (sisaSpasi < 0) sisaSpasi = 0;
        int kiri      = sisaSpasi / 2;
        string diformat = teks.PadLeft(teks.Length + kiri).PadRight(lebarIsi);
        return $"  ║ {diformat} ║";
    }

    // ════════════════════════════════════════════════════════
    //  HITUNG SUBTOTAL ITEM (helper murni)
    // ════════════════════════════════════════════════════════
    public static int HitungSubtotalItem(int harga, int jumlah)
    {
        return harga * jumlah;
    }

    // ════════════════════════════════════════════════════════
    //  VALIDASI INPUT PESANAN (parse "nomor = jumlah")
    //  return true jika valid, out nomorMenu & qty
    // ════════════════════════════════════════════════════════
    public static bool ParseInputPesanan(string input, int jumlahMenu,
        int totalMenu, int maxMenu,
        out int nomorMenu, out int qty, out string pesanError)
    {
        nomorMenu  = 0;
        qty        = 0;
        pesanError = "";

        if (string.IsNullOrWhiteSpace(input))
        {
            pesanError = "INPUT_KOSONG";
            return false;
        }

        string[] bagian = input.Split('=');
        if (bagian.Length != 2)
        {
            pesanError = "Format salah! Gunakan: [Nomor] = [Jumlah]  (contoh: 3 = 2)";
            return false;
        }

        bool nomorValid  = int.TryParse(bagian[0].Trim(), out nomorMenu);
        bool jumlahValid = int.TryParse(bagian[1].Trim(), out qty);

        if (!nomorValid || !jumlahValid)
        {
            pesanError = "Nomor dan jumlah harus berupa angka!";
            return false;
        }

        if (nomorMenu < 1 || nomorMenu > totalMenu)
        {
            pesanError = $"Nomor menu tidak ada! Pilih antara 1 - {totalMenu}.";
            return false;
        }

        if (qty < 1)
        {
            pesanError = "Jumlah minimal 1. Masukkan angka yang benar ya!";
            return false;
        }

        if (jumlahMenu >= maxMenu)
        {
            pesanError = $"Pesanan sudah mencapai batas maksimal {maxMenu} menu.";
            return false;
        }

        return true;
    }
}
