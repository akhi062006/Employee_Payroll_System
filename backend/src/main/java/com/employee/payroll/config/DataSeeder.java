package com.employee.payroll.config;

import com.employee.payroll.entity.Attendance;
import com.employee.payroll.entity.Department;
import com.employee.payroll.entity.Employee;
import com.employee.payroll.entity.User;
import com.employee.payroll.entity.Payroll;
import com.employee.payroll.repository.AttendanceRepository;
import com.employee.payroll.repository.DepartmentRepository;
import com.employee.payroll.repository.EmployeeRepository;
import com.employee.payroll.repository.PayrollRepository;
import com.employee.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Departments
        if (departmentRepository.count() == 0) {
            Department hr = Department.builder().departmentName("Human Resources").description("HR Department for employee management and recruitment").build();
            Department eng = Department.builder().departmentName("Engineering").description("Software engineering, QA and architecture").build();
            Department sales = Department.builder().departmentName("Sales").description("Global sales and client acquisitions").build();
            Department finance = Department.builder().departmentName("Finance & Accounts").description("Payroll management, financial reports and audit").build();

            departmentRepository.saveAll(List.of(hr, eng, sales, finance));
        }

        Department engineering = departmentRepository.findByDepartmentName("Engineering").orElse(null);
        Department hrDept = departmentRepository.findByDepartmentName("Human Resources").orElse(null);
        Department financeDept = departmentRepository.findByDepartmentName("Finance & Accounts").orElse(null);

        // 2. Seed Employees
        if (employeeRepository.count() == 0) {
            Employee emp1 = Employee.builder()
                    .employeeCode("EMP001")
                    .firstName("John")
                    .lastName("Doe")
                    .gender("Male")
                    .dob(LocalDate.of(1990, 5, 12))
                    .email("john.doe@vertex.com")
                    .phone("+91 9876543210")
                    .address("Apt 2B, Green Woods, Bangalore")
                    .department(engineering)
                    .designation("Senior Software Engineer")
                    .joiningDate(LocalDate.of(2021, 6, 1))
                    .basicSalary(85000.0)
                    .status("ACTIVE")
                    .build();

            Employee emp2 = Employee.builder()
                    .employeeCode("EMP002")
                    .firstName("Jane")
                    .lastName("Smith")
                    .gender("Female")
                    .dob(LocalDate.of(1993, 8, 24))
                    .email("jane.smith@vertex.com")
                    .phone("+91 9876543211")
                    .address("Rowhouse 7, Palm Grove, Bangalore")
                    .department(hrDept)
                    .designation("HR Lead")
                    .joiningDate(LocalDate.of(2022, 1, 15))
                    .basicSalary(60000.0)
                    .status("ACTIVE")
                    .build();

            Employee emp3 = Employee.builder()
                    .employeeCode("EMP003")
                    .firstName("Robert")
                    .lastName("Brown")
                    .gender("Male")
                    .dob(LocalDate.of(1988, 11, 3))
                    .email("robert.brown@vertex.com")
                    .phone("+91 9876543212")
                    .address("Flat 101, Lake View, Bangalore")
                    .department(financeDept)
                    .designation("Finance Controller")
                    .joiningDate(LocalDate.of(2020, 10, 10))
                    .basicSalary(75000.0)
                    .status("ACTIVE")
                    .build();

            Employee emp4 = Employee.builder()
                    .employeeCode("EMP004")
                    .firstName("Alice")
                    .lastName("Johnson")
                    .gender("Female")
                    .dob(LocalDate.of(1995, 3, 18))
                    .email("alice.j@vertex.com")
                    .phone("+91 9876543213")
                    .address("Tech Enclave, Electronic City, Bangalore")
                    .department(engineering)
                    .designation("QA Engineer")
                    .joiningDate(LocalDate.of(2023, 2, 1))
                    .basicSalary(42000.0)
                    .status("ACTIVE")
                    .build();

            employeeRepository.saveAll(List.of(emp1, emp2, emp3, emp4));
        }

        Employee john = employeeRepository.findByEmployeeCode("EMP001").orElse(null);
        Employee jane = employeeRepository.findByEmployeeCode("EMP002").orElse(null);
        Employee robert = employeeRepository.findByEmployeeCode("EMP003").orElse(null);
        Employee alice = employeeRepository.findByEmployeeCode("EMP004").orElse(null);

        // 3. Seed Users
        if (userRepository.count() == 0) {
            // Admin User
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .build();

            userRepository.save(admin);

            // Employee Users
            if (john != null) {
                User userJohn = User.builder()
                        .username("john")
                        .password(passwordEncoder.encode("john123"))
                        .role("EMPLOYEE")
                        .employeeId(john.getId())
                        .build();
                userRepository.save(userJohn);
            }

            if (jane != null) {
                User userJane = User.builder()
                        .username("jane")
                        .password(passwordEncoder.encode("jane123"))
                        .role("EMPLOYEE")
                        .employeeId(jane.getId())
                        .build();
                userRepository.save(userJane);
            }
        }

        // 4. Seed Payroll History (For the last 2 months to feed charts)
        if (payrollRepository.count() == 0 && john != null && jane != null && robert != null && alice != null) {
            LocalDate now = LocalDate.now();
            int month1 = now.minusMonths(1).getMonthValue();
            int year1 = now.minusMonths(1).getYear();
            int month2 = now.minusMonths(2).getMonthValue();
            int year2 = now.minusMonths(2).getYear();

            // Month 2 Payroll
            seedPayroll(john, month2, year2);
            seedPayroll(jane, month2, year2);
            seedPayroll(robert, month2, year2);
            seedPayroll(alice, month2, year2);

            // Month 1 Payroll
            seedPayroll(john, month1, year1);
            seedPayroll(jane, month1, year1);
            seedPayroll(robert, month1, year1);
            seedPayroll(alice, month1, year1);
        }

        // 5. Seed Attendance Logs
        if (attendanceRepository.count() == 0 && john != null) {
            LocalDate today = LocalDate.now();
            // Seed attendance for current week
            for (int i = 0; i < 5; i++) {
                LocalDate date = today.minusDays(i);
                attendanceRepository.save(Attendance.builder().employee(john).date(date).status("PRESENT").build());
                attendanceRepository.save(Attendance.builder().employee(jane).date(date).status("PRESENT").build());
                attendanceRepository.save(Attendance.builder().employee(robert).date(date).status("PRESENT").build());
                attendanceRepository.save(Attendance.builder().employee(alice).date(date).status("PRESENT").build());
            }
        }
    }

    private void seedPayroll(Employee emp, int month, int year) {
        double basic = emp.getBasicSalary();
        double hra = Math.round(basic * 0.40 * 100.0) / 100.0;
        double da = Math.round(basic * 0.20 * 100.0) / 100.0;
        double bonus = 2000.0;
        double overtime = 1500.0;
        double incentives = 3000.0;

        double pf = Math.round(basic * 0.12 * 100.0) / 100.0;
        double gross = basic + hra + da + bonus + overtime + incentives;
        
        double tax = 0.0;
        if (gross > 75000) {
            tax = Math.round(gross * 0.15 * 100.0) / 100.0;
        } else if (gross > 50000) {
            tax = Math.round(gross * 0.10 * 100.0) / 100.0;
        }
        
        double insurance = 1000.0;
        double net = gross - (pf + tax + insurance);

        payrollRepository.save(Payroll.builder()
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
                .build());
    }
}
