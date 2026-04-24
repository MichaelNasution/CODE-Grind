package com.itdel.model;

import java.time.LocalDate;
import java.util.Objects;

public class Reservation {
    private String reservationId;
    private Book book;
    private Student student;
    private LocalDate reservationDate;
    private String status; // ACTIVE, COMPLETED, CANCELLED

    public Reservation(String reservationId, Book book, Student student, LocalDate reservationDate) {
        this.reservationId = reservationId;
        this.book = book;
        this.student = student;
        this.reservationDate = reservationDate;
        this.status = "ACTIVE";
    }

    public String getReservationId() {
        return reservationId;
    }

    public Book getBook() {
        return book;
    }

    public Student getStudent() {
        return student;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return String.format("ID Reservasi: %s, Buku: %s, Mahasiswa: %s, Tanggal: %s, Status: %s",
                reservationId, book.getTitle(), student.getName(), reservationDate, status);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Reservation that = (Reservation) o;
        return Objects.equals(reservationId, that.reservationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reservationId);
    }
}
