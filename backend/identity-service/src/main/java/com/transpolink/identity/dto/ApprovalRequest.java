package com.transpolink.identity.dto;

import com.transpolink.identity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalRequest {
    @NotNull private Role role;
}
