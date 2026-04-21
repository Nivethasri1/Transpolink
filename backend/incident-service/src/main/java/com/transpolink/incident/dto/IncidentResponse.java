package com.transpolink.incident.dto;

import com.transpolink.incident.enums.IncidentStatus;
import com.transpolink.incident.enums.IncidentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class IncidentResponse {
    private Long incidentId;
    private Long reporterId;
    private IncidentType type;
    private String location;
    private LocalDateTime date;
    private IncidentStatus status;
}
