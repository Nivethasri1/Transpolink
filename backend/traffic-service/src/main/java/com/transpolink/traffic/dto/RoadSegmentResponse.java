package com.transpolink.traffic.dto;

import com.transpolink.traffic.enums.SegmentStatus;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class RoadSegmentResponse {
    private Long segmentId;
    private String location;
    private Double length;
    private SegmentStatus status;
}
