package com.transpolink.incident.dto;

import com.transpolink.incident.enums.ResolutionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ResolutionResponse {
    private Long resolutionId;
    private Long incidentId;
    private Long officerId;
    private String actions;
    private LocalDateTime date;
    private ResolutionStatus status;
}
