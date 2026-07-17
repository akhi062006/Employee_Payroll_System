package com.employee.payroll.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String status; // PRESENT, ABSENT, LEAVE, HALF_DAY

    public Attendance() {
    }

    public Attendance(Long id, Employee employee, LocalDate date, String status) {
        this.id = id;
        this.employee = employee;
        this.date = date;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static AttendanceBuilder builder() {
        return new AttendanceBuilder();
    }

    public static class AttendanceBuilder {
        private Long id;
        private Employee employee;
        private LocalDate date;
        private String status;

        public AttendanceBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AttendanceBuilder employee(Employee employee) {
            this.employee = employee;
            return this;
        }

        public AttendanceBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public AttendanceBuilder status(String status) {
            this.status = status;
            return this;
        }

        public Attendance build() {
            return new Attendance(id, employee, date, status);
        }
    }
}
