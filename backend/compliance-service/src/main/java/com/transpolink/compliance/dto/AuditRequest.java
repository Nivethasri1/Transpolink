package com.transpolink.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuditRequest {
    @NotNull private Long officerId;
    @NotBlank private String scope;
    private String findings;
}
