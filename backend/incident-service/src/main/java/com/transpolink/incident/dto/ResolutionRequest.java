package com.transpolink.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResolutionRequest {
    @NotNull private Long incidentId;
    @NotNull private Long officerId;
    @NotBlank private String actions;
}
