package com.transpolink.traffic.entity;

import com.transpolink.traffic.enums.SegmentStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "road_segments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadSegment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long segmentId;

    private String location;
    private Double length;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SegmentStatus status = SegmentStatus.OPEN;
}
