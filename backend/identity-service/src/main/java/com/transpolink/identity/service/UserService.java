package com.transpolink.identity.service;

import com.transpolink.identity.dto.*;

import java.util.List;

public interface UserService {
    RegisterResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
    List<UserResponse> getUsersByStatus(String status);
    List<UserResponse> getUsersByRole(String role);
    UserResponse approveUser(Long id, ApprovalRequest request);
    UserResponse rejectUser(Long id);
    UserResponse suspendUser(Long id);
    UserResponse updateUser(Long id, ApprovalRequest request);
    void deleteUser(Long id);
}
