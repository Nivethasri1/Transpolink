package com.transpolink.compliance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.transpolink.compliance.enums.ComplianceResult;
import com.transpolink.compliance.enums.ComplianceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data @Builder
public class ComplianceRecordResponse {
    private Long complianceId;
    private Long entityId;
    private ComplianceType type;
    private ComplianceResult result;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String notes;
}
