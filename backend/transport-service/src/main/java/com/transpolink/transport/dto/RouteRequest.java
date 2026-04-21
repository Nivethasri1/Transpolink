package com.transpolink.transport.dto;

import com.transpolink.transport.enums.RouteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RouteRequest {
    @NotNull private Long operatorId;
    @NotNull private RouteType type;
    @NotBlank private String startPoint;
    @NotBlank private String endPoint;
}
