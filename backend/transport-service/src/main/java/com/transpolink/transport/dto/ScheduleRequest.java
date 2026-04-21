package com.transpolink.transport.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ScheduleRequest {
    @NotNull private Long routeId;
    @NotNull private LocalDateTime departureTime;
    @NotNull private LocalDateTime arrivalTime;
}
