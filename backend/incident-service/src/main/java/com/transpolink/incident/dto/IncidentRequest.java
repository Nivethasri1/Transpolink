package com.transpolink.incident.dto;

import com.transpolink.incident.enums.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentRequest {
    @NotNull private Long reporterId;
    @NotNull private IncidentType type;
    @NotBlank private String location;
}
