package com.employee.payroll.repository;

import com.employee.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeId(Long employeeId);
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    List<Payroll> findByMonthAndYear(Integer month, Integer year);

    @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.month = :month AND p.year = :year")
    Double sumNetSalaryByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);

    @Query("SELECT SUM(p.netSalary) FROM Payroll p")
    Double sumTotalNetSalaryPaid();
}
