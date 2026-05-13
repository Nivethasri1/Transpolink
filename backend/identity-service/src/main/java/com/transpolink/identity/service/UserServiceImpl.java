package com.transpolink.identity.service;

import com.transpolink.identity.config.JwtUtil;
import com.transpolink.identity.dto.*;
import com.transpolink.identity.entity.AuditLog;
import com.transpolink.identity.entity.User;
import com.transpolink.identity.enums.Role;
import com.transpolink.identity.enums.UserStatus;
import com.transpolink.identity.exception.UserAlreadyExistsException;
import com.transpolink.identity.exception.UserNotFoundException;
import com.transpolink.identity.repository.AuditLogRepository;
import com.transpolink.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }
        // Only allowed self-registration roles
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Role not available for self-registration.");
        }
        // Citizens are auto-approved; all other roles require admin approval
        UserStatus initialStatus = request.getRole() == Role.CITIZEN ? UserStatus.ACTIVE : UserStatus.PENDING;
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(initialStatus)
                .build();
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .userId(user.getUserId()).action("REGISTER").resource("User").build());
        String message = initialStatus == UserStatus.ACTIVE
                ? "Registration successful. You can now log in."
                : "Registration successful. Your account is pending admin approval.";
        return new RegisterResponse(
                user.getUserId(), user.getName(), user.getEmail(),
                user.getStatus().name(), message
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UserNotFoundException("Invalid credentials");
        }

        // Block login based on status
        switch (user.getStatus()) {
            case PENDING -> throw new UserNotFoundException(
                    "Your account is pending admin approval. Please wait.");
            case REJECTED -> throw new UserNotFoundException(
                    "Your account has been rejected. Please contact the administrator.");
            case SUSPENDED -> throw new UserNotFoundException(
                    "Your account has been suspended. Please contact the administrator.");
            default -> {}
        }

        auditLogRepository.save(AuditLog.builder()
                .userId(user.getUserId()).action("LOGIN").resource("User").build());
        String token = jwtUtil.generateToken(
                user.getUserId().toString(), Map.of("role", user.getRole().name()));
        return new AuthResponse(token, user.getRole().name(), user.getUserId(), user.getName());
    }

    @Override
    public UserResponse approveUser(Long id, ApprovalRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .userId(user.getUserId()).action("APPROVE").resource("User").build());
        return mapToResponse(user);
    }

    @Override
    public UserResponse rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setStatus(UserStatus.REJECTED);
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .userId(user.getUserId()).action("REJECT").resource("User").build());
        return mapToResponse(user);
    }

    @Override
    public UserResponse suspendUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setStatus(UserStatus.SUSPENDED);
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .userId(user.getUserId()).action("SUSPEND").resource("User").build());
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, ApprovalRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setRole(request.getRole());
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getUserById(Long id) {
        return mapToResponse(userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id)));
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getUsersByStatus(String status) {
        UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
        return userRepository.findByStatus(userStatus).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getUsersByRole(String role) {
        Role userRole = Role.valueOf(role.toUpperCase());
        return userRepository.findByRoleAndStatus(userRole, UserStatus.ACTIVE).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new UserNotFoundException("User not found: " + id);
        userRepository.deleteById(id);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .role(user.getRole())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .build();
    }
}
