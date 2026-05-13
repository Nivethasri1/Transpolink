package com.transpolink.transport.dto;

import com.transpolink.transport.enums.FleetStatus;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class FleetResponse {
    private Long fleetId;
    private String registrationNumber;
    private String vehicleType;
    private Integer capacity;
    private FleetStatus status;
}
