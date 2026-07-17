package com.employee.payroll.service;

import com.employee.payroll.dto.PayrollRequest;
import com.employee.payroll.entity.Employee;
import com.employee.payroll.entity.Payroll;
import com.employee.payroll.exception.BadRequestException;
import com.employee.payroll.exception.ResourceNotFoundException;
import com.employee.payroll.repository.EmployeeRepository;
import com.employee.payroll.repository.PayrollRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Payroll> generatePayroll(Integer month, Integer year) {
        if (month < 1 || month > 12) {
            throw new BadRequestException("Invalid month: " + month);
        }
        int currentYear = LocalDate.now().getYear();
        if (year < 2000 || year > currentYear + 2) {
            throw new BadRequestException("Invalid year: " + year);
        }

        // Fetch all active employees
        List<Employee> activeEmployees = employeeRepository.searchEmployees(null, null, "ACTIVE", Pageable.unpaged()).getContent();
        List<Payroll> generatedPayrolls = new ArrayList<>();

        for (Employee emp : activeEmployees) {
            // Delete existing payroll for the same month/year to recalculate
            payrollRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), month, year)
                    .ifPresent(existing -> payrollRepository.delete(existing));

            // Default calculations
            double basic = emp.getBasicSalary() != null ? emp.getBasicSalary() : 0.0;
            double hra = Math.round(basic * 0.40 * 100.0) / 100.0; // 40% HRA
            double da = Math.round(basic * 0.20 * 100.0) / 100.0;  // 20% DA
            double bonus = 0.0;
            double overtime = 0.0;
            double incentives = 0.0;

            double pf = Math.round(basic * 0.12 * 100.0) / 100.0;  // 12% PF

            double gross = basic + hra + da + bonus + overtime + incentives;
            
            // Tax slab calculations
            double tax = 0.0;
            if (gross > 75000) {
                tax = Math.round(gross * 0.15 * 100.0) / 100.0;
            } else if (gross > 50000) {
                tax = Math.round(gross * 0.10 * 100.0) / 100.0;
            } else if (gross > 30000) {
                tax = Math.round(gross * 0.05 * 100.0) / 100.0;
            }
            
            double insurance = 1000.0; // Flat insurance deduction
            double net = gross - (pf + tax + insurance);

            Payroll payroll = Payroll.builder()
                    .employee(emp)
                    .month(month)
                    .year(year)
                    .basicSalary(basic)
                    .hra(hra)
                    .da(da)
                    .bonus(bonus)
                    .overtime(overtime)
                    .incentives(incentives)
                    .pf(pf)
                    .tax(tax)
                    .insurance(insurance)
                    .grossSalary(gross)
                    .netSalary(net)
                    .build();

            generatedPayrolls.add(payrollRepository.save(payroll));
        }

        return generatedPayrolls;
    }

    public Payroll saveManualPayroll(PayrollRequest request) {
        Employee emp = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Delete existing payroll for same period
        payrollRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), request.getMonth(), request.getYear())
                .ifPresent(existing -> payrollRepository.delete(existing));

        double basic = request.getBasicSalary() != null ? request.getBasicSalary() : emp.getBasicSalary();
        double hra = request.getHra() != null ? request.getHra() : 0.0;
        double da = request.getDa() != null ? request.getDa() : 0.0;
        double bonus = request.getBonus() != null ? request.getBonus() : 0.0;
        double overtime = request.getOvertime() != null ? request.getOvertime() : 0.0;
        double incentives = request.getIncentives() != null ? request.getIncentives() : 0.0;

        double pf = request.getPf() != null ? request.getPf() : 0.0;
        double tax = request.getTax() != null ? request.getTax() : 0.0;
        double insurance = request.getInsurance() != null ? request.getInsurance() : 0.0;

        double gross = basic + hra + da + bonus + overtime + incentives;
        double net = gross - (pf + tax + insurance);

        Payroll payroll = Payroll.builder()
                .employee(emp)
                .month(request.getMonth())
                .year(request.getYear())
                .basicSalary(basic)
                .hra(hra)
                .da(da)
                .bonus(bonus)
                .overtime(overtime)
                .incentives(incentives)
                .pf(pf)
                .tax(tax)
                .insurance(insurance)
                .grossSalary(gross)
                .netSalary(net)
                .build();

        return payrollRepository.save(payroll);
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public List<Payroll> getPayrollByEmployeeId(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    public Payroll getPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with id: " + id));
    }

    public void deletePayroll(Long id) {
        Payroll payroll = getPayrollById(id);
        payrollRepository.delete(payroll);
    }

    public ByteArrayInputStream generateSalarySlipPdf(Long payrollId) {
        Payroll payroll = getPayrollById(payrollId);
        Employee emp = payroll.getEmployee();

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Styling Colors
            Color primaryColor = new Color(30, 41, 59);   // Slate 800
            Color accentColor = new Color(13, 148, 136); // Teal 600
            Color headerColor = new Color(241, 245, 249); // Slate 100

            // Header Section
            Font companyFont = new Font(Font.HELVETICA, 20, Font.BOLD, primaryColor);
            Paragraph companyName = new Paragraph("VERTEX ENTERPRISES PVT. LTD.", companyFont);
            companyName.setAlignment(Element.ALIGN_CENTER);
            document.add(companyName);

            Font subFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Paragraph address = new Paragraph("Sector 62, Tech City, Bangalore - 560001\nPhone: +91 80 12345678 | Email: contact@vertex.com", subFont);
            address.setAlignment(Element.ALIGN_CENTER);
            address.setSpacingAfter(20);
            document.add(address);

            // Divider Line
            Paragraph line = new Paragraph("----------------------------------------------------------------------------------------------------------------------------------", subFont);
            line.setSpacingAfter(15);
            document.add(line);

            // Slip Subject
            String monthName = LocalDate.of(payroll.getYear(), payroll.getMonth(), 1)
                    .getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            Font slipTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD, accentColor);
            Paragraph slipTitle = new Paragraph("SALARY SLIP FOR " + monthName.toUpperCase() + " " + payroll.getYear(), slipTitleFont);
            slipTitle.setAlignment(Element.ALIGN_CENTER);
            slipTitle.setSpacingAfter(20);
            document.add(slipTitle);

            // Employee Details Table
            PdfPTable empTable = new PdfPTable(2);
            empTable.setWidthPercentage(100);
            empTable.setSpacingAfter(20);

            Font boldDetails = new Font(Font.HELVETICA, 10, Font.BOLD, primaryColor);
            Font normalDetails = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);

            empTable.addCell(new PdfPCell(new Phrase("Employee ID: " + emp.getEmployeeCode(), boldDetails)) {{ setBorder(Rectangle.NO_BORDER); }});
            empTable.addCell(new PdfPCell(new Phrase("Designation: " + emp.getDesignation(), normalDetails)) {{ setBorder(Rectangle.NO_BORDER); }});
            empTable.addCell(new PdfPCell(new Phrase("Name: " + emp.getFirstName() + " " + emp.getLastName(), boldDetails)) {{ setBorder(Rectangle.NO_BORDER); }});
            empTable.addCell(new PdfPCell(new Phrase("Department: " + (emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A"), normalDetails)) {{ setBorder(Rectangle.NO_BORDER); }});
            empTable.addCell(new PdfPCell(new Phrase("Email: " + emp.getEmail(), normalDetails)) {{ setBorder(Rectangle.NO_BORDER); }});
            empTable.addCell(new PdfPCell(new Phrase("Joining Date: " + (emp.getJoiningDate() != null ? emp.getJoiningDate().toString() : "N/A"), normalDetails)) {{ setBorder(Rectangle.NO_BORDER); }});

            document.add(empTable);

            // Earnings & Deductions Table
            PdfPTable salaryTable = new PdfPTable(4);
            salaryTable.setWidthPercentage(100);
            salaryTable.setWidths(new float[]{30, 20, 30, 20});
            salaryTable.setSpacingAfter(30);

            Font thFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            
            // Header Row
            PdfPCell h1 = new PdfPCell(new Phrase("Earnings", thFont));
            h1.setBackgroundColor(accentColor);
            h1.setPadding(8);
            salaryTable.addCell(h1);

            PdfPCell h2 = new PdfPCell(new Phrase("Amount", thFont));
            h2.setBackgroundColor(accentColor);
            h2.setPadding(8);
            salaryTable.addCell(h2);

            PdfPCell h3 = new PdfPCell(new Phrase("Deductions", thFont));
            h3.setBackgroundColor(primaryColor);
            h3.setPadding(8);
            salaryTable.addCell(h3);

            PdfPCell h4 = new PdfPCell(new Phrase("Amount", thFont));
            h4.setBackgroundColor(primaryColor);
            h4.setPadding(8);
            salaryTable.addCell(h4);

            // Row 1: Basic & PF
            salaryTable.addCell(new PdfPCell(new Phrase("Basic Salary", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getBasicSalary()), normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("Provident Fund (PF)", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getPf()), normalDetails)) {{ setPadding(6); }});

            // Row 2: HRA & Tax
            salaryTable.addCell(new PdfPCell(new Phrase("House Rent Allowance (HRA)", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getHra()), normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("Income Tax", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getTax()), normalDetails)) {{ setPadding(6); }});

            // Row 3: DA & Insurance
            salaryTable.addCell(new PdfPCell(new Phrase("Dearness Allowance (DA)", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getDa()), normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("Insurance", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getInsurance()), normalDetails)) {{ setPadding(6); }});

            // Row 4: Bonus & Empty Deduction
            salaryTable.addCell(new PdfPCell(new Phrase("Bonus", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getBonus()), normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("-", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("0.00", normalDetails)) {{ setPadding(6); }});

            // Row 5: Overtime & Empty
            salaryTable.addCell(new PdfPCell(new Phrase("Overtime Pay", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getOvertime()), normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("-", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("0.00", normalDetails)) {{ setPadding(6); }});

            // Row 6: Incentives & Empty
            salaryTable.addCell(new PdfPCell(new Phrase("Incentives", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getIncentives()), normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("-", normalDetails)) {{ setPadding(6); }});
            salaryTable.addCell(new PdfPCell(new Phrase("0.00", normalDetails)) {{ setPadding(6); }});

            // Summary Totals
            double totalDeductions = payroll.getPf() + payroll.getTax() + payroll.getInsurance();
            Font totalFont = new Font(Font.HELVETICA, 10, Font.BOLD, primaryColor);

            salaryTable.addCell(new PdfPCell(new Phrase("Gross Salary", totalFont)) {{ setPadding(8); setBackgroundColor(headerColor); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", payroll.getGrossSalary()), totalFont)) {{ setPadding(8); setBackgroundColor(headerColor); }});
            salaryTable.addCell(new PdfPCell(new Phrase("Total Deductions", totalFont)) {{ setPadding(8); setBackgroundColor(headerColor); }});
            salaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", totalDeductions), totalFont)) {{ setPadding(8); setBackgroundColor(headerColor); }});

            document.add(salaryTable);

            // Net Salary Banner
            Font netSalaryFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE);
            PdfPTable netTable = new PdfPTable(1);
            netTable.setWidthPercentage(100);
            
            PdfPCell netCell = new PdfPCell(new Phrase("NET SALARY: Rs. " + String.format("%.2f", payroll.getNetSalary()), netSalaryFont));
            netCell.setBackgroundColor(accentColor);
            netCell.setPadding(12);
            netCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            netTable.addCell(netCell);

            document.add(netTable);

            // Signatures Section
            Paragraph signatureLines = new Paragraph("\n\n\n\n");
            document.add(signatureLines);

            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            
            PdfPCell sigEmp = new PdfPCell(new Phrase("___________________________\nEmployee Signature", normalDetails));
            sigEmp.setBorder(Rectangle.NO_BORDER);
            sigEmp.setHorizontalAlignment(Element.ALIGN_LEFT);
            sigTable.addCell(sigEmp);

            PdfPCell sigAdmin = new PdfPCell(new Phrase("___________________________\nHR Manager / Authorized Signatory", normalDetails));
            sigAdmin.setBorder(Rectangle.NO_BORDER);
            sigAdmin.setHorizontalAlignment(Element.ALIGN_RIGHT);
            sigTable.addCell(sigAdmin);

            document.add(sigTable);

            document.close();

        } catch (DocumentException ex) {
            // handle error
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
