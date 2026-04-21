package com.transpolink.identity.service;

import com.transpolink.identity.dto.*;

import java.util.List;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, RegisterRequest request);
    void deleteUser(Long id);
}
