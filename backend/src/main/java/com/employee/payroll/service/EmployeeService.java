package com.employee.payroll.service;

import com.employee.payroll.entity.Department;
import com.employee.payroll.entity.Employee;
import com.employee.payroll.exception.BadRequestException;
import com.employee.payroll.exception.ResourceNotFoundException;
import com.employee.payroll.repository.DepartmentRepository;
import com.employee.payroll.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public Page<Employee> getAllEmployees(String search, Long departmentId, String status, Pageable pageable) {
        return employeeRepository.searchEmployees(search, departmentId, status, pageable);
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public Employee createEmployee(Employee employee, MultipartFile photo) {
        if (employeeRepository.existsByEmployeeCode(employee.getEmployeeCode())) {
            throw new BadRequestException("Employee Code already exists");
        }
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        // Fetch department if specified
        if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(employee.getDepartment().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + employee.getDepartment().getId()));
            employee.setDepartment(dept);
        }

        // Handle photo upload
        if (photo != null && !photo.isEmpty()) {
            String photoPath = savePhoto(photo);
            employee.setPhotoPath(photoPath);
        }

        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee employeeDetails, MultipartFile photo) {
        Employee employee = getEmployeeById(id);

        if (!employee.getEmployeeCode().equals(employeeDetails.getEmployeeCode())
                && employeeRepository.existsByEmployeeCode(employeeDetails.getEmployeeCode())) {
            throw new BadRequestException("Employee Code already exists");
        }

        if (!employee.getEmail().equals(employeeDetails.getEmail())
                && employeeRepository.existsByEmail(employeeDetails.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        employee.setFirstName(employeeDetails.getFirstName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setGender(employeeDetails.getGender());
        employee.setDob(employeeDetails.getDob());
        employee.setEmail(employeeDetails.getEmail());
        employee.setPhone(employeeDetails.getPhone());
        employee.setAddress(employeeDetails.getAddress());
        employee.setDesignation(employeeDetails.getDesignation());
        employee.setJoiningDate(employeeDetails.getJoiningDate());
        employee.setBasicSalary(employeeDetails.getBasicSalary());
        employee.setStatus(employeeDetails.getStatus());

        if (employeeDetails.getDepartment() != null && employeeDetails.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(employeeDetails.getDepartment().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + employeeDetails.getDepartment().getId()));
            employee.setDepartment(dept);
        } else {
            employee.setDepartment(null);
        }

        // Handle updated photo
        if (photo != null && !photo.isEmpty()) {
            // Delete old photo if it exists
            deleteOldPhoto(employee.getPhotoPath());
            
            String photoPath = savePhoto(photo);
            employee.setPhotoPath(photoPath);
        }

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        deleteOldPhoto(employee.getPhotoPath());
        employeeRepository.delete(employee);
    }

    private String savePhoto(MultipartFile file) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetFile = root.resolve(filename);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new BadRequestException("Could not store photo: " + e.getMessage());
        }
    }

    private void deleteOldPhoto(String photoPath) {
        if (photoPath != null && photoPath.startsWith("/uploads/")) {
            try {
                String filename = photoPath.substring(9);
                Path file = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(file);
            } catch (IOException e) {
                // Log and ignore
            }
        }
    }
}
