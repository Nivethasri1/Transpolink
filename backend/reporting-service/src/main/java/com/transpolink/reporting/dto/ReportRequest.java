package com.transpolink.reporting.dto;

import com.transpolink.reporting.enums.ReportScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {
    @NotNull private ReportScope scope;
    @NotBlank private String metrics;
}
