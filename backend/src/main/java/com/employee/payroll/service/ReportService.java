package com.employee.payroll.service;

import com.employee.payroll.entity.Employee;
import com.employee.payroll.entity.Payroll;
import com.employee.payroll.repository.EmployeeRepository;
import com.employee.payroll.repository.PayrollRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    public ByteArrayInputStream exportEmployeesExcel() {
        List<Employee> employees = employeeRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Employees");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row 0: Headers
            String[] columns = {"ID", "Code", "First Name", "Last Name", "Gender", "Email", "Phone", "Department", "Designation", "Joining Date", "Basic Salary", "Status"};
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Employee emp : employees) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(emp.getId());
                row.createCell(1).setCellValue(emp.getEmployeeCode());
                row.createCell(2).setCellValue(emp.getFirstName());
                row.createCell(3).setCellValue(emp.getLastName());
                row.createCell(4).setCellValue(emp.getGender());
                row.createCell(5).setCellValue(emp.getEmail());
                row.createCell(6).setCellValue(emp.getPhone());
                row.createCell(7).setCellValue(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A");
                row.createCell(8).setCellValue(emp.getDesignation());
                row.createCell(9).setCellValue(emp.getJoiningDate() != null ? emp.getJoiningDate().toString() : "N/A");
                row.createCell(10).setCellValue(emp.getBasicSalary() != null ? emp.getBasicSalary() : 0.0);
                row.createCell(11).setCellValue(emp.getStatus());
            }

            // Auto-size columns
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportEmployeesCsv() {
        List<Employee> employees = employeeRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            // Header Row
            writer.println("ID,Code,First Name,Last Name,Gender,Email,Phone,Department,Designation,Joining Date,Basic Salary,Status");

            for (Employee emp : employees) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%.2f,%s\n",
                        emp.getId(),
                        escapeCsv(emp.getEmployeeCode()),
                        escapeCsv(emp.getFirstName()),
                        escapeCsv(emp.getLastName()),
                        escapeCsv(emp.getGender()),
                        escapeCsv(emp.getEmail()),
                        escapeCsv(emp.getPhone()),
                        escapeCsv(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A"),
                        escapeCsv(emp.getDesignation()),
                        emp.getJoiningDate() != null ? emp.getJoiningDate().toString() : "N/A",
                        emp.getBasicSalary() != null ? emp.getBasicSalary() : 0.0,
                        escapeCsv(emp.getStatus())
                );
            }
            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream exportPayrollExcel() {
        List<Payroll> payrollList = payrollRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payroll");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {"ID", "Employee Code", "Employee Name", "Month", "Year", "Basic Salary", "HRA", "DA", "Bonus", "Overtime", "Incentives", "PF", "Tax", "Insurance", "Gross Salary", "Net Salary"};
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Payroll pay : payrollList) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(pay.getId());
                row.createCell(1).setCellValue(pay.getEmployee().getEmployeeCode());
                row.createCell(2).setCellValue(pay.getEmployee().getFirstName() + " " + pay.getEmployee().getLastName());
                row.createCell(3).setCellValue(pay.getMonth());
                row.createCell(4).setCellValue(pay.getYear());
                row.createCell(5).setCellValue(pay.getBasicSalary());
                row.createCell(6).setCellValue(pay.getHra());
                row.createCell(7).setCellValue(pay.getDa());
                row.createCell(8).setCellValue(pay.getBonus());
                row.createCell(9).setCellValue(pay.getOvertime());
                row.createCell(10).setCellValue(pay.getIncentives());
                row.createCell(11).setCellValue(pay.getPf());
                row.createCell(12).setCellValue(pay.getTax());
                row.createCell(13).setCellValue(pay.getInsurance());
                row.createCell(14).setCellValue(pay.getGrossSalary());
                row.createCell(15).setCellValue(pay.getNetSalary());
            }

            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Fail to import payroll data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportPayrollCsv() {
        List<Payroll> payrollList = payrollRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("ID,Employee Code,Employee Name,Month,Year,Basic,HRA,DA,Bonus,Overtime,Incentives,PF,Tax,Insurance,Gross,Net");

            for (Payroll pay : payrollList) {
                writer.printf("%d,%s,%s,%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f\n",
                        pay.getId(),
                        escapeCsv(pay.getEmployee().getEmployeeCode()),
                        escapeCsv(pay.getEmployee().getFirstName() + " " + pay.getEmployee().getLastName()),
                        pay.getMonth(),
                        pay.getYear(),
                        pay.getBasicSalary(),
                        pay.getHra(),
                        pay.getDa(),
                        pay.getBonus(),
                        pay.getOvertime(),
                        pay.getIncentives(),
                        pay.getPf(),
                        pay.getTax(),
                        pay.getInsurance(),
                        pay.getGrossSalary(),
                        pay.getNetSalary()
                );
            }
            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private String escapeCsv(String val) {
        if (val == null) {
            return "";
        }
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            val = val.replace("\"", "\"\"");
            return "\"" + val + "\"";
        }
        return val;
    }
}
