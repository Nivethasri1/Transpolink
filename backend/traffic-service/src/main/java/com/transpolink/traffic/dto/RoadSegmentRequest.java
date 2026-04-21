package com.transpolink.traffic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoadSegmentRequest {
    @NotBlank private String location;
    @NotNull private Double length;
}
