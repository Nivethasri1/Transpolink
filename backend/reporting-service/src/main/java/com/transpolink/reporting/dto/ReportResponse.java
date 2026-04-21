package com.transpolink.reporting.dto;

import com.transpolink.reporting.enums.ReportScope;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ReportResponse {
    private Long reportId;
    private ReportScope scope;
    private String metrics;
    private LocalDateTime generatedDate;
}
