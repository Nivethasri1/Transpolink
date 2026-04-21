package com.transpolink.incident.entity;

import com.transpolink.incident.enums.IncidentStatus;
import com.transpolink.incident.enums.IncidentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incidentId;

    private Long reporterId;

    @Enumerated(EnumType.STRING)
    private IncidentType type;

    private String location;

    @Builder.Default
    private LocalDateTime date = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.REPORTED;
}
