package com.employee.payroll.controller;

import com.employee.payroll.entity.Department;
import com.employee.payroll.entity.Employee;
import com.employee.payroll.entity.Payroll;
import com.employee.payroll.repository.DepartmentRepository;
import com.employee.payroll.repository.EmployeeRepository;
import com.employee.payroll.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus("ACTIVE");
        long totalDepartments = departmentRepository.count();

        Double totalSalaryPaid = payrollRepository.sumTotalNetSalaryPaid();
        if (totalSalaryPaid == null) totalSalaryPaid = 0.0;

        LocalDate now = LocalDate.now();
        Double currentMonthPayroll = payrollRepository.sumNetSalaryByMonthAndYear(now.getMonthValue(), now.getYear());
        if (currentMonthPayroll == null) {
            // Check previous month if current month hasn't been generated yet
            LocalDate prev = now.minusMonths(1);
            currentMonthPayroll = payrollRepository.sumNetSalaryByMonthAndYear(prev.getMonthValue(), prev.getYear());
        }
        if (currentMonthPayroll == null) currentMonthPayroll = 0.0;

        stats.put("totalEmployees", totalEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("totalDepartments", totalDepartments);
        stats.put("totalSalaryPaid", totalSalaryPaid);
        stats.put("monthlyPayroll", currentMonthPayroll);

        // 1. Department-wise Employee Distribution
        List<Map<String, Object>> deptDistribution = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            long count = employeeRepository.searchEmployees(null, dept.getId(), null, Pageable.unpaged()).getTotalElements();
            Map<String, Object> item = new HashMap<>();
            item.put("name", dept.getDepartmentName());
            item.put("count", count);
            deptDistribution.add(item);
        }
        stats.put("departmentWiseEmployees", deptDistribution);

        // 2. Salary Distribution Brackets
        Map<String, Integer> salaryDist = new LinkedHashMap<>();
        int bracket1 = 0; // < 30,000
        int bracket2 = 0; // 30,000 - 50,000
        int bracket3 = 0; // 50,000 - 75,000
        int bracket4 = 0; // 75,000+
        
        List<Employee> allEmployees = employeeRepository.findAll();
        for (Employee emp : allEmployees) {
            double sal = emp.getBasicSalary() != null ? emp.getBasicSalary() : 0.0;
            if (sal < 30000) {
                bracket1++;
            } else if (sal <= 50000) {
                bracket2++;
            } else if (sal <= 75000) {
                bracket3++;
            } else {
                bracket4++;
            }
        }
        salaryDist.put("< 30K", bracket1);
        salaryDist.put("30K - 50K", bracket2);
        salaryDist.put("50K - 75K", bracket3);
        salaryDist.put("> 75K", bracket4);
        stats.put("salaryDistribution", salaryDist);

        // 3. Monthly Payroll Expenses (Last 6 months)
        List<Map<String, Object>> payrollTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            int m = date.getMonthValue();
            int y = date.getYear();
            Double sum = payrollRepository.sumNetSalaryByMonthAndYear(m, y);
            if (sum == null) sum = 0.0;
            
            Map<String, Object> trendItem = new HashMap<>();
            trendItem.put("month", date.getMonth().name().substring(0, 3) + " " + y);
            trendItem.put("expense", sum);
            payrollTrend.add(trendItem);
        }
        stats.put("monthlyPayrollTrend", payrollTrend);

        return ResponseEntity.ok(stats);
    }
}
