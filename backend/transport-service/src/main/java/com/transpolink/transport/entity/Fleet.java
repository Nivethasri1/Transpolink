package com.transpolink.transport.entity;

import com.transpolink.transport.enums.FleetStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fleets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Fleet {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fleetId;

    private String registrationNumber;
    private String vehicleType;
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FleetStatus status = FleetStatus.AVAILABLE;
}
