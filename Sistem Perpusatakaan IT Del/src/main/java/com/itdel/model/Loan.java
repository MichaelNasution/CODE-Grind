package com.itdel.model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public class Loan {
    private String loanId;
    private Book book;
    private Student student;
    private LocalDate loanDate;
    private LocalDate returnDate; // Null if not yet returned
    private LocalDate dueDate;
    private boolean isReturned;
    private double fineAmount;

    public Loan(String loanId, Book book, Student student, LocalDate loanDate, LocalDate dueDate) {
        this.loanId = loanId;
        this.book = book;
        this.student = student;
        this.loanDate = loanDate;
        this.dueDate = dueDate;
        this.isReturned = false;
        this.fineAmount = 0.0;
    }

    // Getters
    public String getLoanId() {
        return loanId;
    }

    public Book getBook() {
        return book;
    }

    public Student getStudent() {
        return student;
    }

    public LocalDate getLoanDate() {
        return loanDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public boolean isReturned() {
        return isReturned;
    }

    public double getFineAmount() {
        return fineAmount;
    }

    // Setters
    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public void setReturned(boolean returned) {
        isReturned = returned;
    }

    public void setFineAmount(double fineAmount) {
        this.fineAmount = fineAmount;
    }

    // Method to calculate fine
    public double calculateFine(double finePerDay) {
        if (isReturned && returnDate != null && returnDate.isAfter(dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
            this.fineAmount = daysLate * finePerDay;
            return this.fineAmount;
        }
        return 0.0;
    }
    
    public boolean isOverdue(LocalDate currentDate) {
        return !isReturned && currentDate.isAfter(dueDate);
    }

    @Override
    public String toString() {
        return String.format("ID Pinjam: %s, Buku: %s, Mahasiswa: %s, Pinjam: %s, Kembali: %s, Jatuh Tempo: %s, Status: %s, Denda: Rp %.2f",
                loanId, book.getTitle(), student.getName(), loanDate, 
                (returnDate != null ? returnDate : "Belum Kembali"), 
                dueDate, (isReturned ? "Kembali" : "Dipinjam"), fineAmount);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Loan loan = (Loan) o;
        return Objects.equals(loanId, loan.loanId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(loanId);
    }
}
