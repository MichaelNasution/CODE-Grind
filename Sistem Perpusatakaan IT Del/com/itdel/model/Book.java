package com.itdel.model;

import java.util.Objects;

public class Book {
    private String bookId;
    private String title;
    private String author;
    private String publisher;
    private int year;
    private int totalCopies;
    private int availableCopies;

    public Book(String bookId, String title, String author, String publisher, int year, int totalCopies) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.publisher = publisher;
        this.year = year;
        this.totalCopies = totalCopies;
        this.availableCopies = totalCopies;
    }

    // Getters
    public String getBookId() {
        return bookId;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getPublisher() {
        return publisher;
    }

    public int getYear() {
        return year;
    }

    public int getTotalCopies() {
        return totalCopies;
    }

    public int getAvailableCopies() {
        return availableCopies;
    }

    // Setters
    public void setTitle(String title) {
        this.title = title;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public void setTotalCopies(int totalCopies) {
        int diff = totalCopies - this.totalCopies;
        this.totalCopies = totalCopies;
        this.availableCopies += diff;
        if (this.availableCopies < 0) this.availableCopies = 0;
        if (this.availableCopies > this.totalCopies) this.availableCopies = this.totalCopies;
    }

    // Methods for managing copies
    public boolean borrowCopy() {
        if (availableCopies > 0) {
            availableCopies--;
            return true;
        }
        return false;
    }

    public void returnCopy() {
        if (availableCopies < totalCopies) {
            availableCopies++;
        }
    }

    public void addCopies(int count) {
        if (count > 0) {
            this.totalCopies += count;
            this.availableCopies += count;
        }
    }

    public boolean removeCopies(int count) {
        if (count > 0 && (this.totalCopies - count) >= (this.totalCopies - this.availableCopies)) { 
            this.totalCopies -= count;
            this.availableCopies -= count;
            return true;
        }
        return false;
    }

    @Override
    public String toString() {
        return String.format("ID: %s, Judul: %s, Penulis: %s, Tersedia: %d/%d",
                bookId, title, author, availableCopies, totalCopies);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(bookId, book.bookId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookId);
    }
}
