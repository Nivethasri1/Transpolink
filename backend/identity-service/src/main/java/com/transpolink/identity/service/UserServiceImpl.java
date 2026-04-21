package com.transpolink.identity.service;

import com.transpolink.identity.dto.*;
import com.transpolink.identity.entity.AuditLog;
import com.transpolink.identity.entity.User;
import com.transpolink.identity.exception.UserAlreadyExistsException;
import com.transpolink.identity.exception.UserNotFoundException;
import com.transpolink.identity.config.JwtUtil;
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
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
                .name(request.getName())
                .role(request.getRole())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder().userId(user.getUserId()).action("REGISTER").resource("User").build());
        String token = jwtUtil.generateToken(user.getUserId().toString(), Map.of("role", user.getRole().name()));
        return new AuthResponse(token, user.getRole().name(), user.getUserId());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UserNotFoundException("Invalid credentials");
        }
        auditLogRepository.save(AuditLog.builder().userId(user.getUserId()).action("LOGIN").resource("User").build());
        String token = jwtUtil.generateToken(user.getUserId().toString(), Map.of("role", user.getRole().name()));
        return new AuthResponse(token, user.getRole().name(), user.getUserId());
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
    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        return mapToResponse(userRepository.save(user));
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
