package com.transpolink.traffic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrafficFlowRequest {
    @NotNull private Long segmentId;
    @NotNull private Integer volume;
    @NotNull private Double speed;
}
