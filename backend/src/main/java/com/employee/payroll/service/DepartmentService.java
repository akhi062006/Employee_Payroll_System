package com.employee.payroll.service;

import com.employee.payroll.entity.Department;
import com.employee.payroll.exception.BadRequestException;
import com.employee.payroll.exception.ResourceNotFoundException;
import com.employee.payroll.repository.DepartmentRepository;
import com.employee.payroll.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.existsByDepartmentName(department.getDepartmentName())) {
            throw new BadRequestException("Department name already exists");
        }
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department departmentDetails) {
        Department department = getDepartmentById(id);
        
        // If changing name, ensure uniqueness
        if (!department.getDepartmentName().equalsIgnoreCase(departmentDetails.getDepartmentName())
                && departmentRepository.existsByDepartmentName(departmentDetails.getDepartmentName())) {
            throw new BadRequestException("Department name already exists");
        }

        department.setDepartmentName(departmentDetails.getDepartmentName());
        department.setDescription(departmentDetails.getDescription());

        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);
        
        // Prevent deletion if employees belong to this department
        // We'll perform a quick count by creating an empty search using our repository method
        Page<com.employee.payroll.entity.Employee> employees = employeeRepository.searchEmployees(null, id, null, Pageable.unpaged());
        if (employees.getTotalElements() > 0) {
            throw new BadRequestException("Cannot delete department because there are employees assigned to it.");
        }

        departmentRepository.delete(department);
    }
}
