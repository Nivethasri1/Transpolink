package com.transpolink.traffic.entity;

import com.transpolink.traffic.enums.FlowStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "traffic_flows")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TrafficFlow {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long flowId;

    private Long segmentId;
    private Integer volume;
    private Double speed;

    @Builder.Default
    private LocalDateTime date = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FlowStatus status = FlowStatus.NORMAL;
}
