package com.transpolink.incident.entity;

import com.transpolink.incident.enums.ResolutionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resolutions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Resolution {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resolutionId;

    private Long incidentId;
    private Long officerId;
    private String actions;

    @Builder.Default
    private LocalDateTime date = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ResolutionStatus status = ResolutionStatus.PENDING;
}
