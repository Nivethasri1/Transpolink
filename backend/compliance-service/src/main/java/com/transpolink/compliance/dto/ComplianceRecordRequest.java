package com.transpolink.compliance.dto;

import com.transpolink.compliance.enums.ComplianceResult;
import com.transpolink.compliance.enums.ComplianceType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplianceRecordRequest {
    @NotNull private Long entityId;
    @NotNull private ComplianceType type;
    @NotNull private ComplianceResult result;
    private String notes;
}
