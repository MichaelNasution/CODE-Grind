package com.itdel.model;

public class Librarian extends User {
    private String department;

    public Librarian(String nip, String name, String password, String department) {
        super(nip, name, password); // nip acts as userId
        this.department = department;
    }

    public String getDepartment() {
        return department;
    }

    // Polymorphism: Specific menu for Librarian
    @Override
    public void displayMenu() {
        System.out.println("\n--- Librarian Menu ---");
        System.out.println("1. Tambah Buku");
        System.out.println("2. Edit Informasi Buku");
        System.out.println("3. Hapus Buku");
        System.out.println("4. Lihat Semua Buku");
        System.out.println("5. Lihat Semua Pinjaman Aktif");
        System.out.println("6. Lihat Semua Reservasi");
        System.out.println("7. Register User Baru");
        System.out.println("0. Logout");
        System.out.print("Pilih opsi: ");
    }
}
