package com.transpolink.identity.controller;

import com.transpolink.identity.dto.*;
import com.transpolink.identity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // Public — anyone can self-register, account starts as PENDING
    @PostMapping("/api/auth/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    // Public — login only works for ACTIVE users
    @PostMapping("/api/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // Get active users by role — for sending broadcast notifications
    @GetMapping("/api/users/role/{role}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Admin — get all users
    @GetMapping("/api/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Admin — get users by status (PENDING, ACTIVE, REJECTED, SUSPENDED)
    @GetMapping("/api/users/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(userService.getUsersByStatus(status));
    }

    // Admin — get single user
    @GetMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id.toString() == authentication.principal")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Admin — approve user and assign role
    @PatchMapping("/api/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> approveUser(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request) {
        return ResponseEntity.ok(userService.approveUser(id, request));
    }

    // Admin — reject user
    @PatchMapping("/api/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }

    // Admin — suspend active user
    @PatchMapping("/api/users/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> suspendUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.suspendUser(id));
    }

    // Admin — update role of existing user
    @PatchMapping("/api/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Admin — delete user
    @DeleteMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
