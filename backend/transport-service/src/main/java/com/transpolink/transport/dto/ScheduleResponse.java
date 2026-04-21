package com.transpolink.transport.dto;

import com.transpolink.transport.enums.ScheduleStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ScheduleResponse {
    private Long scheduleId;
    private Long routeId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private ScheduleStatus status;
}
