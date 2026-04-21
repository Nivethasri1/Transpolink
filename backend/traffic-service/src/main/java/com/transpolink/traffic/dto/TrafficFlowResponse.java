package com.transpolink.traffic.dto;

import com.transpolink.traffic.enums.FlowStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class TrafficFlowResponse {
    private Long flowId;
    private Long segmentId;
    private Integer volume;
    private Double speed;
    private LocalDateTime date;
    private FlowStatus status;
}
