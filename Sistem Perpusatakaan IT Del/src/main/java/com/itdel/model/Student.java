package com.itdel.model;

public class Student extends User {
    private String major;
    private int borrowedBooksCount;
    private double fines;

    public Student(String nim, String name, String password, String major) {
        super(nim, name, password); // nim acts as userId
        this.major = major;
        this.borrowedBooksCount = 0;
        this.fines = 0.0;
    }

    public String getMajor() {
        return major;
    }

    public int getBorrowedBooksCount() {
        return borrowedBooksCount;
    }

    public void incrementBorrowedBooksCount() {
        this.borrowedBooksCount++;
    }

    public void decrementBorrowedBooksCount() {
        if (this.borrowedBooksCount > 0) {
            this.borrowedBooksCount--;
        }
    }

    public double getFines() {
        return fines;
    }

    public void addFine(double amount) {
        if (amount > 0) {
            this.fines += amount;
        }
    }

    public void payFine(double amount) {
        if (amount > 0 && this.fines >= amount) {
            this.fines -= amount;
        } else if (amount > 0 && this.fines < amount) {
            this.fines = 0; // Bayar sesuai sisa denda
        }
    }

    // Polymorphism: Specific menu for Student
    @Override
    public void displayMenu() {
        System.out.println("\n--- Student Menu ---");
        System.out.println("1. Pinjam Buku");
        System.out.println("2. Kembalikan Buku");
        System.out.println("3. Reservasi Buku");
        System.out.println("4. Lihat Daftar Pinjaman Saya");
        System.out.println("5. Lihat Daftar Reservasi Saya");
        System.out.println("6. Bayar Denda (Current Fine: Rp " + String.format("%.2f", fines) + ")");
        System.out.println("0. Logout");
        System.out.print("Pilih opsi: ");
    }
}
