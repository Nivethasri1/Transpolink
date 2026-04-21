package com.transpolink.compliance.dto;

import com.transpolink.compliance.enums.AuditStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data @Builder
public class AuditResponse {
    private Long auditId;
    private Long officerId;
    private String scope;
    private String findings;
    private LocalDate date;
    private AuditStatus status;
}
