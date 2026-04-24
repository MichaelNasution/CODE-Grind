package com.itdel;

import com.itdel.model.*;
import com.itdel.service.Library;
import java.time.LocalDate;
import java.util.Scanner;

public class MainApp {
    private Library library;
    private Scanner scanner;
    private User currentUser;

    public MainApp() {
        this.library = new Library();
        this.scanner = new Scanner(System.in);
    }

    public void run() {
        System.out.println("Selamat Datang di Sistem Perpustakaan IT Del!");
        while (true) {
            if (currentUser == null) {
                login();
            } else {
                displayMainMenu();
            }
        }
    }

    private void login() {
        System.out.print("\nMasukkan ID Pengguna: ");
        String userId = scanner.nextLine();
        System.out.print("Masukkan Password: ");
        String password = scanner.nextLine();

        currentUser = library.authenticateUser(userId, password);
        if (currentUser != null) {
            System.out.println("\nLogin berhasil sebagai: " + 
                (currentUser instanceof Student ? "Mahasiswa" : "Pustakawan") + 
                " (" + currentUser.getUserId() + " - " + currentUser.getName() + ")");
        } else {
            System.out.println("ID Pengguna atau Password salah.");
        }
    }

    private void displayMainMenu() {
        currentUser.displayMenu();
        String choice = scanner.nextLine();
        if (currentUser instanceof Student) {
            handleStudentMenu(choice);
        } else if (currentUser instanceof Librarian) {
            handleLibrarianMenu(choice);
        }
    }

    private void handleStudentMenu(String choice) {
        Student student = (Student) currentUser;
        switch (choice) {
            case "1": processBorrowBook(student); break;
            case "2": processReturnBook(student); break;
            case "3": processReserveBook(student); break;
            case "4": displayStudentLoans(student); break;
            case "5": displayStudentReservations(student); break;
            case "6": processPayFine(student); break;
            case "0": logout(); break;
            default: System.out.println("Pilihan tidak valid.");
        }
    }

    private void handleLibrarianMenu(String choice) {
        switch (choice) {
            case "1": processAddBook(); break;
            case "2": processUpdateBook(); break;
            case "3": processDeleteBook(); break;
            case "4": library.displayAllBooks(); break;
            case "5": library.displayAllLoans(); break;
            case "6": displayAllReservations(); break;
            case "7": processRegisterUser(); break;
            case "0": logout(); break;
            default: System.out.println("Pilihan tidak valid.");
        }
    }

    private void logout() {
        currentUser = null;
        System.out.println("Anda telah logout. Terima kasih!");
    }

    // Student Operations
    private void processBorrowBook(Student student) {
        library.displayAllBooks();
        System.out.print("Masukkan ID Buku yang ingin dipinjam: ");
        String bookId = scanner.nextLine();
        Book book = library.findBookById(bookId);
        if (book != null) {
            if (library.borrowBook(student, book)) {
                System.out.println("Buku '" + book.getTitle() + "' berhasil dipinjam.");
            }
        } else {
            System.out.println("Buku tidak ditemukan.");
        }
    }

    private void processReturnBook(Student student) {
        displayStudentLoans(student);
        System.out.print("Masukkan ID Pinjaman yang ingin dikembalikan: ");
        String loanId = scanner.nextLine();
        Loan loan = library.returnBook(loanId, LocalDate.now());
        if (loan != null) {
            System.out.println("Buku '" + loan.getBook().getTitle() + "' berhasil dikembalikan.");
            if (loan.getFineAmount() > 0) {
                System.out.println("Denda yang dikenakan: Rp " + String.format("%.2f", loan.getFineAmount()));
            }
        } else {
            System.out.println("ID Pinjaman tidak ditemukan atau sudah dikembalikan.");
        }
    }

    private void processReserveBook(Student student) {
        library.displayAllBooks();
        System.out.print("Masukkan ID Buku yang ingin direservasi: ");
        String bookId = scanner.nextLine();
        Book book = library.findBookById(bookId);
        if (book != null) {
            if (library.reserveBook(student, book)) {
                System.out.println("Buku '" + book.getTitle() + "' berhasil direservasi.");
            }
        } else {
            System.out.println("Buku tidak ditemukan.");
        }
    }

    private void displayStudentLoans(Student student) {
        System.out.println("\n--- Daftar Pinjaman Saya ---");
        for (Loan l : library.getLoansByStudent(student)) {
            System.out.println(l);
        }
    }

    private void displayStudentReservations(Student student) {
        System.out.println("\n--- Daftar Reservasi Saya ---");
        for (Reservation r : library.getReservationsByStudent(student)) {
            System.out.println(r);
        }
    }

    private void processPayFine(Student student) {
        System.out.println("Total Denda Anda: Rp " + String.format("%.2f", student.getFines()));
        if (student.getFines() > 0) {
            System.out.print("Masukkan jumlah pembayaran: ");
            try {
                double amount = Double.parseDouble(scanner.nextLine());
                library.payFine(student, amount);
                System.out.println("Pembayaran berhasil. Sisa denda: Rp " + String.format("%.2f", student.getFines()));
            } catch (NumberFormatException e) {
                System.out.println("Input tidak valid.");
            }
        } else {
            System.out.println("Anda tidak memiliki denda.");
        }
    }

    // Librarian Operations
    private void processAddBook() {
        System.out.print("Masukkan ID Buku: ");
        String id = scanner.nextLine();
        System.out.print("Masukkan Judul: ");
        String title = scanner.nextLine();
        System.out.print("Masukkan Penulis: ");
        String author = scanner.nextLine();
        System.out.print("Masukkan Penerbit: ");
        String publisher = scanner.nextLine();
        System.out.print("Masukkan Tahun Terbit: ");
        int year = Integer.parseInt(scanner.nextLine());
        System.out.print("Masukkan Jumlah Salinan: ");
        int copies = Integer.parseInt(scanner.nextLine());

        library.addBook(new Book(id, title, author, publisher, year, copies));
        System.out.println("Buku berhasil ditambahkan.");
    }

    private void processUpdateBook() {
        System.out.print("Masukkan ID Buku yang akan diedit: ");
        String id = scanner.nextLine();
        Book book = library.findBookById(id);
        if (book != null) {
            System.out.print("Masukkan Judul baru (" + book.getTitle() + "): ");
            String title = scanner.nextLine();
            System.out.print("Masukkan Penulis baru (" + book.getAuthor() + "): ");
            String author = scanner.nextLine();
            System.out.print("Masukkan Penerbit baru (" + book.getPublisher() + "): ");
            String publisher = scanner.nextLine();
            System.out.print("Masukkan Tahun baru (" + book.getYear() + "): ");
            int year = Integer.parseInt(scanner.nextLine());
            
            library.updateBook(id, title, author, publisher, year);
            System.out.println("Informasi buku berhasil diperbarui.");
        } else {
            System.out.println("Buku tidak ditemukan.");
        }
    }

    private void processDeleteBook() {
        System.out.print("Masukkan ID Buku yang ingin dihapus: ");
        String id = scanner.nextLine();
        library.deleteBook(id);
        System.out.println("Buku berhasil dihapus.");
    }

    private void displayAllReservations() {
        System.out.println("\n--- Daftar Semua Reservasi ---");
        for (Reservation r : library.getAllReservations()) {
            System.out.println(r);
        }
    }

    private void processRegisterUser() {
        System.out.println("Pilih tipe user (1. Student, 2. Librarian): ");
        String type = scanner.nextLine();
        System.out.print("ID: ");
        String id = scanner.nextLine();
        System.out.print("Nama: ");
        String name = scanner.nextLine();
        System.out.print("Password: ");
        String pass = scanner.nextLine();

        if (type.equals("1")) {
            System.out.print("Prodi: ");
            String major = scanner.nextLine();
            library.registerUser(new Student(id, name, pass, major));
        } else {
            System.out.print("Departemen: ");
            String dept = scanner.nextLine();
            library.registerUser(new Librarian(id, name, pass, dept));
        }
        System.out.println("User berhasil didaftarkan.");
    }

    public static void main(String[] args) {
        MainApp app = new MainApp();
        app.run();
    }
}
