package com.transpolink.transport.dto;

import com.transpolink.transport.enums.RouteStatus;
import com.transpolink.transport.enums.RouteType;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class RouteResponse {
    private Long routeId;
    private Long operatorId;
    private RouteType type;
    private String startPoint;
    private String endPoint;
    private RouteStatus status;
}
