package com.transpolink.identity.dto;

import com.transpolink.identity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    private String phone;
    @NotBlank private String password;
    @NotNull private Role role;
}
