package com.transpolink.identity.dto;

import com.transpolink.identity.enums.Role;
import com.transpolink.identity.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long userId;
    private String name;
    private Role role;
    private String email;
    private String phone;
    private UserStatus status;
}
