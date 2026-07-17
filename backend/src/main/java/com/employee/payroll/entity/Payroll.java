package com.employee.payroll.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "payroll")
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "basic_salary")
    private Double basicSalary;

    private Double hra; // House Rent Allowance
    private Double da;  // Dearness Allowance
    private Double bonus;
    private Double overtime;
    private Double incentives;

    private Double pf; // Provident Fund
    private Double tax; // Income Tax / Professional Tax
    private Double insurance;

    @Column(name = "gross_salary")
    private Double grossSalary;

    @Column(name = "net_salary")
    private Double netSalary;

    public Payroll() {
    }

    public Payroll(Long id, Employee employee, Integer month, Integer year, Double basicSalary, Double hra, Double da, Double bonus, Double overtime, Double incentives, Double pf, Double tax, Double insurance, Double grossSalary, Double netSalary) {
        this.id = id;
        this.employee = employee;
        this.month = month;
        this.year = year;
        this.basicSalary = basicSalary;
        this.hra = hra;
        this.da = da;
        this.bonus = bonus;
        this.overtime = overtime;
        this.incentives = incentives;
        this.pf = pf;
        this.tax = tax;
        this.insurance = insurance;
        this.grossSalary = grossSalary;
        this.netSalary = netSalary;
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

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Double getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(Double basicSalary) {
        this.basicSalary = basicSalary;
    }

    public Double getHra() {
        return hra;
    }

    public void setHra(Double hra) {
        this.hra = hra;
    }

    public Double getDa() {
        return da;
    }

    public void setDa(Double da) {
        this.da = da;
    }

    public Double getBonus() {
        return bonus;
    }

    public void setBonus(Double bonus) {
        this.bonus = bonus;
    }

    public Double getOvertime() {
        return overtime;
    }

    public void setOvertime(Double overtime) {
        this.overtime = overtime;
    }

    public Double getIncentives() {
        return incentives;
    }

    public void setIncentives(Double incentives) {
        this.incentives = incentives;
    }

    public Double getPf() {
        return pf;
    }

    public void setPf(Double pf) {
        this.pf = pf;
    }

    public Double getTax() {
        return tax;
    }

    public void setTax(Double tax) {
        this.tax = tax;
    }

    public Double getInsurance() {
        return insurance;
    }

    public void setInsurance(Double insurance) {
        this.insurance = insurance;
    }

    public Double getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(Double grossSalary) {
        this.grossSalary = grossSalary;
    }

    public Double getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(Double netSalary) {
        this.netSalary = netSalary;
    }

    public static PayrollBuilder builder() {
        return new PayrollBuilder();
    }

    public static class PayrollBuilder {
        private Long id;
        private Employee employee;
        private Integer month;
        private Integer year;
        private Double basicSalary;
        private Double hra;
        private Double da;
        private Double bonus;
        private Double overtime;
        private Double incentives;
        private Double pf;
        private Double tax;
        private Double insurance;
        private Double grossSalary;
        private Double netSalary;

        public PayrollBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PayrollBuilder employee(Employee employee) {
            this.employee = employee;
            return this;
        }

        public PayrollBuilder month(Integer month) {
            this.month = month;
            return this;
        }

        public PayrollBuilder year(Integer year) {
            this.year = year;
            return this;
        }

        public PayrollBuilder basicSalary(Double basicSalary) {
            this.basicSalary = basicSalary;
            return this;
        }

        public PayrollBuilder hra(Double hra) {
            this.hra = hra;
            return this;
        }

        public PayrollBuilder da(Double da) {
            this.da = da;
            return this;
        }

        public PayrollBuilder bonus(Double bonus) {
            this.bonus = bonus;
            return this;
        }

        public PayrollBuilder overtime(Double overtime) {
            this.overtime = overtime;
            return this;
        }

        public PayrollBuilder incentives(Double incentives) {
            this.incentives = incentives;
            return this;
        }

        public PayrollBuilder pf(Double pf) {
            this.pf = pf;
            return this;
        }

        public PayrollBuilder tax(Double tax) {
            this.tax = tax;
            return this;
        }

        public PayrollBuilder insurance(Double insurance) {
            this.insurance = insurance;
            return this;
        }

        public PayrollBuilder grossSalary(Double grossSalary) {
            this.grossSalary = grossSalary;
            return this;
        }

        public PayrollBuilder netSalary(Double netSalary) {
            this.netSalary = netSalary;
            return this;
        }

        public Payroll build() {
            return new Payroll(id, employee, month, year, basicSalary, hra, da, bonus, overtime, incentives, pf, tax, insurance, grossSalary, netSalary);
        }
    }
}
