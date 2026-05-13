package com.transpolink.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private Long userId;
    private String name;
    private String email;
    private String status;
    private String message;
}
