/*
 * ============================================================
 *   TEST RUNNER — UTS_YUDHA Test Suite
 *   Dapoer Djoeragan Khawnan | Pemrograman Prosedural
 * ============================================================
 *
 *  CARA MENJALANKAN:
 *      dotnet run --project UTS_YUDHA.csproj -- --test
 *
 *  Mencakup test untuk semua fungsi bisnis:
 *    - FormatRupiah
 *    - InisialisasiMenu
 *    - CariMenuById
 *    - HitungSubtotalItem
 *    - HitungTotal (diskon, BOGO, pajak, pelayanan)
 *    - DeteksiGender
 *    - AmbilPesanTerimakasih
 *    - ParseInputPesanan
 *    - TengahkanStruk
 * ============================================================
 */

using System;

public class TestRunner
{
    // ── Counter hasil test ──────────────────────────────────
    static int totalTest  = 0;
    static int lulusTest  = 0;
    static int gagalTest  = 0;

    // ════════════════════════════════════════════════════════
    //  HELPER: Assert & Report
    // ════════════════════════════════════════════════════════
    static void Assert(string namaTest, bool kondisi, string keterangan = "")
    {
        totalTest++;
        if (kondisi)
        {
            lulusTest++;
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"  [PASS] {namaTest}");
        }
        else
        {
            gagalTest++;
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  [FAIL] {namaTest}");
            if (!string.IsNullOrEmpty(keterangan))
            {
                Console.ForegroundColor = ConsoleColor.DarkRed;
                Console.WriteLine($"         >> {keterangan}");
            }
        }
        Console.ResetColor();
    }

    static void AssertEqual(string namaTest, object expected, object actual)
    {
        bool sama = (expected == null && actual == null) ||
                    (expected != null && expected.Equals(actual));
        string ket = sama ? "" : $"Expected: [{expected}] | Actual: [{actual}]";
        Assert(namaTest, sama, ket);
    }

    static void PrintHeader(string bagian)
    {
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"  ┌─────────────────────────────────────────┐");
        Console.WriteLine($"  │  {bagian,-40} │");
        Console.WriteLine($"  └─────────────────────────────────────────┘");
        Console.ResetColor();
    }

    // ════════════════════════════════════════════════════════
    //  TEST: FormatRupiah
    // ════════════════════════════════════════════════════════
    static void TestFormatRupiah()
    {
        PrintHeader("FormatRupiah");

        // POSITIF
        AssertEqual("Format 15000 → Rp 15.000",
            "Rp 15.000", LogikRestoran.FormatRupiah(15000));

        AssertEqual("Format 100000 → Rp 100.000",
            "Rp 100.000", LogikRestoran.FormatRupiah(100000));

        AssertEqual("Format 0 → Rp 0",
            "Rp 0", LogikRestoran.FormatRupiah(0));

        AssertEqual("Format 20000 → Rp 20.000",
            "Rp 20.000", LogikRestoran.FormatRupiah(20000));

        AssertEqual("Format 4000 → Rp 4.000",
            "Rp 4.000", LogikRestoran.FormatRupiah(4000));

        // Format harus diawali "Rp "
        Assert("Harus diawali 'Rp '",
            LogikRestoran.FormatRupiah(50000).StartsWith("Rp "));

        // NEGATIF / EDGE CASE
        AssertEqual("Format angka besar 1000000 → Rp 1.000.000",
            "Rp 1.000.000", LogikRestoran.FormatRupiah(1000000));
    }

    // ════════════════════════════════════════════════════════
    //  TEST: InisialisasiMenu
    // ════════════════════════════════════════════════════════
    static void TestInisialisasiMenu()
    {
        PrintHeader("InisialisasiMenu");

        MenuItem[] menu = LogikRestoran.InisialisasiMenu();

        // POSITIF
        AssertEqual("Total menu harus 16",
            16, menu.Length);

        AssertEqual("Menu ke-1 ID harus 1",
            1, menu[0].Id);

        AssertEqual("Menu ke-1 harus Makanan",
            "Makanan", menu[0].Kategori);

        AssertEqual("Menu ke-9 (index 8) harus Minuman",
            "Minuman", menu[8].Kategori);

        AssertEqual("Menu ke-16 ID harus 16",
            16, menu[15].Id);

        Assert("Semua harga > 0",
            TiapHargaPositif(menu));

        Assert("Semua nama tidak kosong",
            TiapNamaTerisi(menu));

        Assert("Semua ID unik",
            SemualIdUnik(menu));

        // Makanan harus berjumlah 8
        int jumlahMakanan = 0;
        int jumlahMinuman = 0;
        for (int i = 0; i < menu.Length; i++)
        {
            if (menu[i].Kategori == "Makanan") jumlahMakanan++;
            if (menu[i].Kategori == "Minuman") jumlahMinuman++;
        }
        AssertEqual("Jumlah makanan harus 8", 8, jumlahMakanan);
        AssertEqual("Jumlah minuman harus 8", 8, jumlahMinuman);

        // NEGATIF
        Assert("Tidak ada kategori selain Makanan/Minuman",
            TiapKategoriValid(menu));
    }

    static bool TiapHargaPositif(MenuItem[] menu) {
        for (int i = 0; i < menu.Length; i++) if (menu[i].Harga <= 0) return false;
        return true;
    }
    static bool TiapNamaTerisi(MenuItem[] menu) {
        for (int i = 0; i < menu.Length; i++) if (string.IsNullOrWhiteSpace(menu[i].Nama)) return false;
        return true;
    }
    static bool SemualIdUnik(MenuItem[] menu) {
        for (int i = 0; i < menu.Length; i++)
            for (int j = i + 1; j < menu.Length; j++)
                if (menu[i].Id == menu[j].Id) return false;
        return true;
    }
    static bool TiapKategoriValid(MenuItem[] menu) {
        for (int i = 0; i < menu.Length; i++)
            if (menu[i].Kategori != "Makanan" && menu[i].Kategori != "Minuman") return false;
        return true;
    }

    // ════════════════════════════════════════════════════════
    //  TEST: CariMenuById
    // ════════════════════════════════════════════════════════
    static void TestCariMenuById()
    {
        PrintHeader("CariMenuById");

        MenuItem[] menu = LogikRestoran.InisialisasiMenu();

        // POSITIF
        MenuItem hasil1 = LogikRestoran.CariMenuById(menu, 1);
        AssertEqual("Cari ID 1 → nama benar",
            "Nasi Goreng Ayam / Biasa", hasil1.Nama);

        MenuItem hasil3 = LogikRestoran.CariMenuById(menu, 3);
        AssertEqual("Cari ID 3 → harga 22000",
            22000, hasil3.Harga);

        MenuItem hasil9 = LogikRestoran.CariMenuById(menu, 9);
        AssertEqual("Cari ID 9 → kategori Minuman",
            "Minuman", hasil9.Kategori);

        MenuItem hasil16 = LogikRestoran.CariMenuById(menu, 16);
        AssertEqual("Cari ID 16 → nama benar",
            "Air Mineral (Botol 600ml)", hasil16.Nama);

        // NEGATIF: ID tidak ada → kembalikan MenuItem kosong (Id=0)
        MenuItem hasilTidakAda = LogikRestoran.CariMenuById(menu, 99);
        AssertEqual("Cari ID 99 → Id 0 (tidak ditemukan)",
            0, hasilTidakAda.Id);

        MenuItem hasilNol = LogikRestoran.CariMenuById(menu, 0);
        AssertEqual("Cari ID 0 → Id 0 (tidak ditemukan)",
            0, hasilNol.Id);
    }

    // ════════════════════════════════════════════════════════
    //  TEST: HitungSubtotalItem
    // ════════════════════════════════════════════════════════
    static void TestHitungSubtotalItem()
    {
        PrintHeader("HitungSubtotalItem");

        // POSITIF
        AssertEqual("15000 x 2 = 30000", 30000, LogikRestoran.HitungSubtotalItem(15000, 2));
        AssertEqual("22000 x 1 = 22000", 22000, LogikRestoran.HitungSubtotalItem(22000, 1));
        AssertEqual("4000 x 3 = 12000",  12000, LogikRestoran.HitungSubtotalItem(4000, 3));
        AssertEqual("10000 x 0 = 0",     0,     LogikRestoran.HitungSubtotalItem(10000, 0));

        // EDGE CASE
        AssertEqual("0 x 5 = 0", 0, LogikRestoran.HitungSubtotalItem(0, 5));
    }

    // ════════════════════════════════════════════════════════
    //  TEST: HitungTotal
    // ════════════════════════════════════════════════════════
    static void TestHitungTotal()
    {
        PrintHeader("HitungTotal");

        MenuItem[] menu = LogikRestoran.InisialisasiMenu();

        // ── SKENARIO 1: Subtotal < 50000 → tidak ada diskon & BOGO ──
        OrderItem[] pesanan1 = new OrderItem[] {
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 5), Jumlah = 1 }, // Nasi Telur 10000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 9), Jumlah = 1 }  // Es Teh 4000
        }; // subtotal = 14000

        LogikRestoran.HitungTotal(pesanan1,
            out int sub1, out int disk1, out int bogo1,
            out int pajak1, out int total1, out bool aDisk1, out bool aBogo1, out string _);

        AssertEqual("Skenario <50k: subtotal = 14000", 14000, sub1);
        Assert("Skenario <50k: tidak ada diskon", !aDisk1);
        Assert("Skenario <50k: tidak ada BOGO",   !aBogo1);
        AssertEqual("Skenario <50k: diskon = 0", 0, disk1);
        AssertEqual("Skenario <50k: BOGO = 0",   0, bogo1);
        AssertEqual("Skenario <50k: pajak = 1400",  1400, pajak1);
        AssertEqual("Skenario <50k: total = 35400", 35400, total1); // 14000+1400+20000

        // ── SKENARIO 2: Subtotal >50000 & <=100000 → BOGO berlaku ──
        OrderItem[] pesanan2 = new OrderItem[] {
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 3), Jumlah = 2 }, // Ayam 22000x2=44000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 7), Jumlah = 1 }, // Soto 16000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 9), Jumlah = 1 }  // EsTeh 4000
        }; // subtotal = 64000

        LogikRestoran.HitungTotal(pesanan2,
            out int sub2, out int disk2, out int bogo2,
            out int pajak2, out int total2, out bool aDisk2, out bool aBogo2, out string namaB2);

        AssertEqual("Skenario BOGO: subtotal = 64000", 64000, sub2);
        Assert("Skenario BOGO: tidak ada diskon", !aDisk2);
        Assert("Skenario BOGO: ada BOGO", aBogo2);
        AssertEqual("Skenario BOGO: potongan BOGO = 4000 (Es Teh termurah)", 4000, bogo2);
        AssertEqual("Skenario BOGO: nama menu BOGO benar",
            "Es Teh Manis / Teh Hangat", namaB2);
        // setelahDiskon=64000, setelahBOGO=60000, pajak=6000, total=60000+6000+20000=86000
        AssertEqual("Skenario BOGO: pajak = 6000", 6000, pajak2);
        AssertEqual("Skenario BOGO: total = 86000", 86000, total2);

        // ── SKENARIO 3: Subtotal >100000 → diskon 10% + BOGO ──
        OrderItem[] pesanan3 = new OrderItem[] {
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 3), Jumlah = 3 }, // Ayam 22000x3=66000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 8), Jumlah = 2 }, // FuYung 20000x2=40000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 9), Jumlah = 1 }, // EsTeh 4000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 13), Jumlah = 1 } // Milo 8000
        }; // subtotal = 118000

        LogikRestoran.HitungTotal(pesanan3,
            out int sub3, out int disk3, out int bogo3,
            out int pajak3, out int total3, out bool aDisk3, out bool aBogo3, out string namaB3);

        AssertEqual("Skenario >100k: subtotal = 118000", 118000, sub3);
        Assert("Skenario >100k: ada diskon 10%", aDisk3);
        Assert("Skenario >100k: ada BOGO", aBogo3);
        AssertEqual("Skenario >100k: diskon = 11800", 11800, disk3);
        // BOGO = minuman termurah dari yg dipesan = EsTeh 4000
        AssertEqual("Skenario >100k: BOGO = 4000 (Es Teh)", 4000, bogo3);
        // setelahDiskon=118000-11800=106200, setelahBOGO=106200-4000=102200
        // pajak=10220, total=102200+10220+20000=132420
        AssertEqual("Skenario >100k: pajak = 10220", 10220, pajak3);
        AssertEqual("Skenario >100k: total = 132420", 132420, total3);

        // ── SKENARIO 4: Tidak ada minuman → BOGO tidak berlaku meski >50k ──
        OrderItem[] pesanan4 = new OrderItem[] {
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 3), Jumlah = 2 }, // Ayam 44000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 8), Jumlah = 1 }  // FuYung 20000
        }; // subtotal = 64000, tidak ada minuman

        LogikRestoran.HitungTotal(pesanan4,
            out int sub4, out int disk4, out int bogo4,
            out int pajak4, out int total4, out bool aDisk4, out bool aBogo4, out string _4);

        Assert("Skenario no-minuman: BOGO tidak berlaku meski >50k", !aBogo4);
        AssertEqual("Skenario no-minuman: BOGO = 0", 0, bogo4);

        // ── SKENARIO 5: BOGO pilih minuman termurah saat ada beberapa minuman ──
        OrderItem[] pesanan5 = new OrderItem[] {
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 3), Jumlah = 2 },  // Ayam 44000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 12), Jumlah = 1 }, // JusAlpukat 12000
            new OrderItem { Menu = LogikRestoran.CariMenuById(menu, 11), Jumlah = 1 }  // TehTawar 2000 (TERMURAH)
        }; // subtotal = 58000

        LogikRestoran.HitungTotal(pesanan5,
            out int sub5, out int disk5, out int bogo5,
            out int pajak5, out int total5, out bool aDisk5, out bool aBogo5, out string namaB5);

        Assert("BOGO pilih termurah: ada BOGO", aBogo5);
        AssertEqual("BOGO pilih termurah: nama = Es Teh Tawar",
            "Es Teh Tawar / Teh Tawar Hangat", namaB5);
        AssertEqual("BOGO pilih termurah: potongan = 2000", 2000, bogo5);

        // ── SKENARIO 6: Pesanan kosong → subtotal = 0 ──
        OrderItem[] pesananKosong = new OrderItem[0];
        LogikRestoran.HitungTotal(pesananKosong,
            out int subK, out int diskK, out int bogoK,
            out int pajakK, out int totalK, out bool aDiskK, out bool aBogoK, out string _K);

        AssertEqual("Pesanan kosong: subtotal = 0", 0, subK);
        Assert("Pesanan kosong: tidak ada diskon", !aDiskK);
        Assert("Pesanan kosong: tidak ada BOGO", !aBogoK);
        // total = 0 + 0 (pajak 10% dari 0) + 20000 = 20000
        AssertEqual("Pesanan kosong: total = 20000 (hanya biaya pelayanan)", 20000, totalK);
    }

    // ════════════════════════════════════════════════════════
    //  TEST: DeteksiGender
    // ════════════════════════════════════════════════════════
    static void TestDeteksiGender()
    {
        PrintHeader("DeteksiGender");

        // POSITIF: nama perempuan dari daftar
        AssertEqual("Lisa → P",  "P", LogikRestoran.DeteksiGender("Lisa"));
        AssertEqual("Dewi → P",  "P", LogikRestoran.DeteksiGender("Dewi"));
        AssertEqual("Sari → P",  "P", LogikRestoran.DeteksiGender("Sari"));
        AssertEqual("Nadia → P", "P", LogikRestoran.DeteksiGender("Nadia"));
        AssertEqual("Ayu → P",   "P", LogikRestoran.DeteksiGender("Ayu"));
        AssertEqual("Nurul → P", "P", LogikRestoran.DeteksiGender("Nurul"));

        // POSITIF: nama laki dari daftar
        AssertEqual("Yudha → L",   "L", LogikRestoran.DeteksiGender("Yudha"));
        AssertEqual("Budi → L",    "L", LogikRestoran.DeteksiGender("Budi"));
        AssertEqual("Fajar → L",   "L", LogikRestoran.DeteksiGender("Fajar"));
        AssertEqual("Ahmad → L",   "L", LogikRestoran.DeteksiGender("Ahmad"));
        AssertEqual("Sultan → L",  "L", LogikRestoran.DeteksiGender("Sultan"));
        AssertEqual("Aditya → L",  "L", LogikRestoran.DeteksiGender("Aditya"));

        // CASE INSENSITIVE
        AssertEqual("LISA (uppercase) → P",   "P", LogikRestoran.DeteksiGender("LISA"));
        AssertEqual("yudha (lowercase) → L",  "L", LogikRestoran.DeteksiGender("yudha"));
        AssertEqual("DeWi (mixed) → P",        "P", LogikRestoran.DeteksiGender("DeWi"));

        // HEURISTIK AKHIRAN: nama berakhir -a → P
        AssertEqual("Tara (berakhir -a) → P", "P", LogikRestoran.DeteksiGender("Tara"));
        // nama berakhir -i → L
        AssertEqual("Romi (berakhir -i) → L", "L", LogikRestoran.DeteksiGender("Romi"));

        // NETRAL / tidak dikenal
        AssertEqual("XYZ → N",        "N", LogikRestoran.DeteksiGender("XYZ"));
        AssertEqual("Kosong → N",     "N", LogikRestoran.DeteksiGender(""));
        AssertEqual("Spasi → N",      "N", LogikRestoran.DeteksiGender("   "));

        // NAMA LEBIH DARI 1 KATA → hanya ambil nama depan
        AssertEqual("Lisa Kusuma → P (nama depan Lisa)", "P", LogikRestoran.DeteksiGender("Lisa Kusuma"));
        AssertEqual("Yudha Pratama → L (nama depan Yudha)", "L", LogikRestoran.DeteksiGender("Yudha Pratama"));
    }

    // ════════════════════════════════════════════════════════
    //  TEST: AmbilPesanTerimakasih
    // ════════════════════════════════════════════════════════
    static void TestAmbilPesanTerimakasih()
    {
        PrintHeader("AmbilPesanTerimakasih");

        // POSITIF: gender P → hasil tidak kosong
        string[] pesanP = LogikRestoran.AmbilPesanTerimakasih("Lisa", "P", 0);
        Assert("Gender P: array tidak null",      pesanP != null);
        Assert("Gender P: array tidak kosong",    pesanP.Length > 0);
        Assert("Gender P: baris pertama ada nama",
            pesanP[0].Contains("Lisa"));

        // Gender L → hasil tidak kosong
        string[] pesanL = LogikRestoran.AmbilPesanTerimakasih("Yudha", "L", 0);
        Assert("Gender L: array tidak null",      pesanL != null);
        Assert("Gender L: array tidak kosong",    pesanL.Length > 0);
        Assert("Gender L: baris pertama ada nama",
            pesanL[0].Contains("Yudha"));

        // Gender N → hasil tidak kosong
        string[] pesanN = LogikRestoran.AmbilPesanTerimakasih("Robot", "N", 0);
        Assert("Gender N: array tidak null",      pesanN != null);
        Assert("Gender N: array tidak kosong",    pesanN.Length > 0);
        Assert("Gender N: baris pertama ada nama",
            pesanN[0].Contains("Robot"));

        // Tiap pesan harus punya 4 baris
        Assert("Gender P: punya 4 baris", pesanP.Length == 4);
        Assert("Gender L: punya 4 baris", pesanL.Length == 4);
        Assert("Gender N: punya 4 baris", pesanN.Length == 4);

        // Baris tidak boleh kosong
        bool adaBarisKosong = false;
        for (int i = 0; i < pesanP.Length; i++)
            if (string.IsNullOrWhiteSpace(pesanP[i])) adaBarisKosong = true;
        Assert("Gender P: tidak ada baris kosong", !adaBarisKosong);

        // VARIASI: index berbeda → teks berbeda (randomness)
        string[] pesanP0 = LogikRestoran.AmbilPesanTerimakasih("Sari", "P", 0);
        string[] pesanP1 = LogikRestoran.AmbilPesanTerimakasih("Sari", "P", 1);
        Assert("Gender P: template berbeda untuk index berbeda",
            pesanP0[0] != pesanP1[0]);

        // Gender tidak valid → fallback ke netral
        string[] pesanInvalid = LogikRestoran.AmbilPesanTerimakasih("Test", "X", 0);
        Assert("Gender tidak valid → netral tidak null", pesanInvalid != null);
        Assert("Gender tidak valid → netral tidak kosong", pesanInvalid.Length > 0);
    }

    // ════════════════════════════════════════════════════════
    //  TEST: ParseInputPesanan
    // ════════════════════════════════════════════════════════
    static void TestParseInputPesanan()
    {
        PrintHeader("ParseInputPesanan");

        // POSITIF: format benar
        bool ok1 = LogikRestoran.ParseInputPesanan(
            "3 = 2", 0, 16, 4, out int nm1, out int q1, out string err1);
        Assert("'3 = 2' → valid", ok1);
        AssertEqual("'3 = 2' → nomor = 3", 3, nm1);
        AssertEqual("'3 = 2' → qty = 2", 2, q1);

        bool ok2 = LogikRestoran.ParseInputPesanan(
            "16=1", 0, 16, 4, out int nm2, out int q2, out string err2);
        Assert("'16=1' (tanpa spasi) → valid", ok2);
        AssertEqual("'16=1' → nomor = 16", 16, nm2);

        bool ok3 = LogikRestoran.ParseInputPesanan(
            "  9  =  3  ", 0, 16, 4, out int nm3, out int q3, out string err3);
        Assert("Input dengan banyak spasi → valid", ok3);
        AssertEqual("Spasi banyak → nomor = 9", 9, nm3);
        AssertEqual("Spasi banyak → qty = 3", 3, q3);

        // NEGATIF: format salah (tidak ada =)
        bool fail1 = LogikRestoran.ParseInputPesanan(
            "3 2", 0, 16, 4, out int _, out int __, out string errF1);
        Assert("'3 2' (tidak ada =) → invalid", !fail1);
        Assert("Pesan error tidak kosong", !string.IsNullOrEmpty(errF1));

        // NEGATIF: nomor menu di luar range
        bool fail2 = LogikRestoran.ParseInputPesanan(
            "99 = 1", 0, 16, 4, out int _, out int __, out string errF2);
        Assert("'99 = 1' (nomor tidak ada) → invalid", !fail2);

        bool fail3 = LogikRestoran.ParseInputPesanan(
            "0 = 1", 0, 16, 4, out int _, out int __, out string errF3);
        Assert("'0 = 1' (nomor 0) → invalid", !fail3);

        // NEGATIF: jumlah < 1
        bool fail4 = LogikRestoran.ParseInputPesanan(
            "3 = 0", 0, 16, 4, out int _, out int __, out string errF4);
        Assert("'3 = 0' (qty 0) → invalid", !fail4);

        bool fail5 = LogikRestoran.ParseInputPesanan(
            "3 = -1", 0, 16, 4, out int _, out int __, out string errF5);
        Assert("'3 = -1' (qty negatif) → invalid", !fail5);

        // NEGATIF: bukan angka
        bool fail6 = LogikRestoran.ParseInputPesanan(
            "abc = 2", 0, 16, 4, out int _, out int __, out string errF6);
        Assert("'abc = 2' (bukan angka) → invalid", !fail6);

        bool fail7 = LogikRestoran.ParseInputPesanan(
            "3 = abc", 0, 16, 4, out int _, out int __, out string errF7);
        Assert("'3 = abc' (qty bukan angka) → invalid", !fail7);

        // NEGATIF: input kosong
        bool fail8 = LogikRestoran.ParseInputPesanan(
            "", 0, 16, 4, out int _, out int __, out string errF8);
        Assert("String kosong → invalid (INPUT_KOSONG)", !fail8);
        AssertEqual("Kode error kosong = INPUT_KOSONG", "INPUT_KOSONG", errF8);

        // NEGATIF: sudah mencapai maks menu
        bool fail9 = LogikRestoran.ParseInputPesanan(
            "1 = 1", 4, 16, 4, out int _, out int __, out string errF9);
        Assert("Sudah 4 menu → invalid (batas maks)", !fail9);
    }

    // ════════════════════════════════════════════════════════
    //  TEST: TengahkanStruk
    // ════════════════════════════════════════════════════════
    static void TestTengahkanStruk()
    {
        PrintHeader("TengahkanStruk");

        // POSITIF: output harus diawali "  ║ "
        string hasil1 = LogikRestoran.TengahkanStruk("TEST", 20);
        Assert("Output diawali '  ║ '", hasil1.StartsWith("  ║ "));
        Assert("Output diakhiri ' ║'", hasil1.EndsWith(" ║"));

        // Panjang output konsisten dengan totalLebar
        string hasil2 = LogikRestoran.TengahkanStruk("HELLO", 51);
        // totalLebar = 51, format = "  ║ " + (51-4) chars + " ║"
        // = 2 + 1 + 1 + 47 + 1 + 1 = ??? let's just check format
        Assert("Output 51 lebar: diawali '  ║ '", hasil2.StartsWith("  ║ "));

        // EDGE CASE: teks lebih panjang dari ruang tersedia
        string panjang = "TEKS SANGAT PANJANG SEKALI MELEWATI BATAS YANG DITENTUKAN";
        string hasil3 = LogikRestoran.TengahkanStruk(panjang, 30);
        Assert("Teks panjang tidak crash", hasil3 != null);
        Assert("Teks panjang diawali '  ║ '", hasil3.StartsWith("  ║ "));

        // Teks kosong harus tetap terbentuk
        string hasil4 = LogikRestoran.TengahkanStruk("", 20);
        Assert("Teks kosong tidak crash", hasil4 != null);
        Assert("Teks kosong diawali '  ║ '", hasil4.StartsWith("  ║ "));
    }

    // ════════════════════════════════════════════════════════
    //  ENTRY POINT TEST
    // ════════════════════════════════════════════════════════
    public static void JalankanSemuaTest()
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.Clear();

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine();
        Console.WriteLine("  ╔═══════════════════════════════════════════════════╗");
        Console.WriteLine("  ║         TEST SUITE — DAPOER DJOERAGAN            ║");
        Console.WriteLine("  ║       Unit Test Pemrograman Prosedural C#        ║");
        Console.WriteLine("  ╚═══════════════════════════════════════════════════╝");
        Console.ResetColor();

        // Jalankan semua test
        TestFormatRupiah();
        TestInisialisasiMenu();
        TestCariMenuById();
        TestHitungSubtotalItem();
        TestHitungTotal();
        TestDeteksiGender();
        TestAmbilPesanTerimakasih();
        TestParseInputPesanan();
        TestTengahkanStruk();

        // ── Ringkasan hasil ──────────────────────────────────
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("  ╔═══════════════════════════════════════════════════╗");
        Console.WriteLine("  ║                 HASIL TEST                       ║");
        Console.WriteLine("  ╠═══════════════════════════════════════════════════╣");

        Console.ForegroundColor = ConsoleColor.White;
        Console.WriteLine($"  ║  Total  : {totalTest,-39}║");

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"  ║  PASS   : {lulusTest,-39}║");

        if (gagalTest > 0)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  ║  FAIL   : {gagalTest,-39}║");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  ╠═══════════════════════════════════════════════════╣");
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("  ║  [!!] Ada test yang GAGAL! Periksa log di atas.  ║");
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("  ╠═══════════════════════════════════════════════════╣");
            Console.WriteLine("  ║  [OK] SEMUA TEST LULUS! Kode siap digunakan~     ║");
        }

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("  ╚═══════════════════════════════════════════════════╝");
        Console.ResetColor();
        Console.WriteLine();
    }
}
