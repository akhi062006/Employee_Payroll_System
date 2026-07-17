package com.employee.payroll.controller;

import com.employee.payroll.dto.PayrollRequest;
import com.employee.payroll.entity.Payroll;
import com.employee.payroll.entity.User;
import com.employee.payroll.exception.BadRequestException;
import com.employee.payroll.exception.ResourceNotFoundException;
import com.employee.payroll.repository.UserRepository;
import com.employee.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payroll>> generatePayroll(
            @RequestParam("month") Integer month,
            @RequestParam("year") Integer year) {
        return ResponseEntity.ok(payrollService.generatePayroll(month, year));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payroll> savePayroll(@Valid @RequestBody PayrollRequest request) {
        return ResponseEntity.ok(payrollService.saveManualPayroll(request));
    }

    @GetMapping
    public ResponseEntity<List<Payroll>> getAllPayrolls(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {
            if (user.getEmployeeId() == null) {
                throw new BadRequestException("Employee profile not associated with this user account");
            }
            return ResponseEntity.ok(payrollService.getPayrollByEmployeeId(user.getEmployeeId()));
        }

        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getPayrollByEmployeeId(@PathVariable Long employeeId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {
            if (!employeeId.equals(user.getEmployeeId())) {
                return ResponseEntity.status(403).build(); // Block unauthorized employee request
            }
        }

        return ResponseEntity.ok(payrollService.getPayrollByEmployeeId(employeeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id, Principal principal) {
        Payroll payroll = payrollService.getPayrollById(id);
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {
            if (!payroll.getEmployee().getId().equals(user.getEmployeeId())) {
                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(payroll);
    }

    @GetMapping(value = "/slip/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> downloadSalarySlip(@PathVariable Long id, Principal principal) {
        Payroll payroll = payrollService.getPayrollById(id);
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {
            if (!payroll.getEmployee().getId().equals(user.getEmployeeId())) {
                return ResponseEntity.status(403).build();
            }
        }

        ByteArrayInputStream bis = payrollService.generateSalarySlipPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=salary_slip_" + payroll.getMonth() + "_" + payroll.getYear() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deletePayroll(@PathVariable Long id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.ok(Map.of("message", "Payroll record deleted successfully"));
    }
}
