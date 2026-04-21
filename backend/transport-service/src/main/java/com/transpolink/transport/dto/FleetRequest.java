package com.transpolink.transport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FleetRequest {
    @NotNull private Long operatorId;
    @NotBlank private String vehicleType;
    @NotNull private Integer capacity;
}
