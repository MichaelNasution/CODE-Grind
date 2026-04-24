package com.itdel.service;

import com.itdel.model.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Library {
    private Map<String, Book> books;
    private Map<String, User> users;
    private ArrayList<Loan> loans;
    private ArrayList<Reservation> reservations;

    private final int MAX_BORROW_COUNT = 3;
    private final int LOAN_PERIOD_DAYS = 14;
    private final double FINE_PER_DAY = 2000.0;

    public Library() {
        this.books = new HashMap<>();
        this.users = new HashMap<>();
        this.loans = new ArrayList<>();
        this.reservations = new ArrayList<>();
        initializeDummyData();
    }

    private void initializeDummyData() {
        // Dummy Books
        addBook(new Book("B001", "Dasar Pemrograman Java", "John Doe", "Informatika", 2022, 5));
        addBook(new Book("B002", "Struktur Data dan Algoritma", "Jane Smith", "Teknos", 2021, 3));
        addBook(new Book("B003", "Database Design", "David Lee", "DataPress", 2023, 1));

        // Dummy Users
        registerUser(new Student("12S21001", "Budi Santoso", "password123", "Informatika"));
        registerUser(new Librarian("L001", "Ani Yanti", "admin", "Pustaka Pusat"));
    }

    public User authenticateUser(String userId, String password) {
        User user = users.get(userId);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    public Book findBookById(String bookId) {
        return books.get(bookId);
    }

    public Student findStudentById(String studentId) {
        User user = users.get(studentId);
        if (user instanceof Student) {
            return (Student) user;
        }
        return null;
    }

    public boolean borrowBook(Student student, Book book) {
        if (book.getAvailableCopies() <= 0) {
            System.out.println("Buku sedang tidak tersedia.");
            return false;
        }
        if (student.getBorrowedBooksCount() >= MAX_BORROW_COUNT) {
            System.out.println("Batas peminjaman terlampaui.");
            return false;
        }

        String loanId = "L" + (loans.size() + 1);
        LocalDate now = LocalDate.now();
        LocalDate dueDate = now.plusDays(LOAN_PERIOD_DAYS);

        Loan loan = new Loan(loanId, book, student, now, dueDate);
        loans.add(loan);
        book.borrowCopy();
        student.incrementBorrowedBooksCount();
        return true;
    }

    public Loan returnBook(String loanId, LocalDate returnDate) {
        for (Loan loan : loans) {
            if (loan.getLoanId().equals(loanId) && !loan.isReturned()) {
                loan.setReturnDate(returnDate);
                loan.setReturned(true);
                double fine = loan.calculateFine(FINE_PER_DAY);
                if (fine > 0) {
                    loan.getStudent().addFine(fine);
                }
                loan.getBook().returnCopy();
                loan.getStudent().decrementBorrowedBooksCount();
                checkAndNotifyReservations(loan.getBook());
                return loan;
            }
        }
        return null;
    }

    public boolean reserveBook(Student student, Book book) {
        if (book.getAvailableCopies() > 0) {
            System.out.println("Buku tersedia, tidak perlu reservasi.");
            return false;
        }
        
        // Check if already reserved
        for (Reservation r : reservations) {
            if (r.getBook().equals(book) && r.getStudent().equals(student) && r.getStatus().equals("ACTIVE")) {
                System.out.println("Anda sudah memiliki reservasi aktif untuk buku ini.");
                return false;
            }
        }

        String resId = "R" + (reservations.size() + 1);
        Reservation res = new Reservation(resId, book, student, LocalDate.now());
        reservations.add(res);
        return true;
    }

    public void cancelReservation(String reservationId) {
        for (Reservation r : reservations) {
            if (r.getReservationId().equals(reservationId)) {
                r.setStatus("CANCELLED");
                break;
            }
        }
    }

    public void addBook(Book book) {
        books.put(book.getBookId(), book);
    }

    public void updateBook(String bookId, String title, String author, String publisher, int year) {
        Book book = books.get(bookId);
        if (book != null) {
            book.setTitle(title);
            book.setAuthor(author);
            book.setPublisher(publisher);
            book.setYear(year);
        }
    }

    public void deleteBook(String bookId) {
        books.remove(bookId);
    }

    public void registerUser(User user) {
        users.put(user.getUserId(), user);
    }

    public ArrayList<Loan> getLoansByStudent(Student student) {
        ArrayList<Loan> studentLoans = new ArrayList<>();
        for (Loan l : loans) {
            if (l.getStudent().equals(student)) {
                studentLoans.add(l);
            }
        }
        return studentLoans;
    }

    public ArrayList<Reservation> getReservationsByStudent(Student student) {
        ArrayList<Reservation> studentRes = new ArrayList<>();
        for (Reservation r : reservations) {
            if (r.getStudent().equals(student)) {
                studentRes.add(r);
            }
        }
        return studentRes;
    }

    private void checkAndNotifyReservations(Book book) {
        for (Reservation r : reservations) {
            if (r.getBook().equals(book) && r.getStatus().equals("ACTIVE")) {
                System.out.println("\n[NOTIFIKASI] Buku '" + book.getTitle() + "' sekarang tersedia untuk " + r.getStudent().getName());
                // In a real system, we might mark it as COMPLETED or notify via email
                break; 
            }
        }
    }

    public void displayAllBooks() {
        System.out.println("\n--- Daftar Semua Buku ---");
        for (Book b : books.values()) {
            System.out.println(b);
        }
    }

    public void displayAllLoans() {
        System.out.println("\n--- Daftar Semua Pinjaman Aktif ---");
        for (Loan l : loans) {
            if (!l.isReturned()) {
                System.out.println(l);
            }
        }
    }

    public void displayAllUsers() {
        System.out.println("\n--- Daftar Semua Pengguna ---");
        for (User u : users.values()) {
            System.out.println("ID: " + u.getUserId() + ", Nama: " + u.getName() + " (" + u.getClass().getSimpleName() + ")");
        }
    }
    
    public ArrayList<Reservation> getAllReservations() {
        return reservations;
    }
    
    public void payFine(Student student, double amount) {
        student.payFine(amount);
    }
}
