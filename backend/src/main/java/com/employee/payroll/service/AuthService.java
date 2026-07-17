package com.employee.payroll.service;

import com.employee.payroll.dto.ChangePasswordRequest;
import com.employee.payroll.dto.LoginRequest;
import com.employee.payroll.dto.LoginResponse;
import com.employee.payroll.dto.RegisterRequest;
import com.employee.payroll.entity.Employee;
import com.employee.payroll.entity.User;
import com.employee.payroll.exception.BadRequestException;
import com.employee.payroll.exception.ResourceNotFoundException;
import com.employee.payroll.repository.EmployeeRepository;
import com.employee.payroll.repository.UserRepository;
import com.employee.payroll.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = tokenProvider.generateToken(authentication, user.getRole(), user.getEmployeeId());

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .employeeId(user.getEmployeeId())
                .build();
    }

    public User register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        Long employeeId = null;
        if ("EMPLOYEE".equalsIgnoreCase(registerRequest.getRole())) {
            if (registerRequest.getEmployeeCode() == null || registerRequest.getEmployeeCode().isBlank()) {
                throw new BadRequestException("Employee Code is required for registering an employee role");
            }
            Employee employee = employeeRepository.findByEmployeeCode(registerRequest.getEmployeeCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found with code: " + registerRequest.getEmployeeCode()));
            
            // Check if user account already exists for this employee
            if (userRepository.findByEmployeeId(employee.getId()).isPresent()) {
                throw new BadRequestException("A user account already exists for this employee");
            }
            employeeId = employee.getId();
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole().toUpperCase())
                .employeeId(employeeId)
                .build();

        return userRepository.save(user);
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
