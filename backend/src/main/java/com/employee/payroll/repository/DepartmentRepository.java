package com.employee.payroll.repository;

import com.employee.payroll.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByDepartmentName(String name);
    boolean existsByDepartmentName(String name);
}
