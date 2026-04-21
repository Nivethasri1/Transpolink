package com.transpolink.transport.entity;

import com.transpolink.transport.enums.RouteStatus;
import com.transpolink.transport.enums.RouteType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transport_routes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TransportRoute {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long routeId;

    private Long operatorId;

    @Enumerated(EnumType.STRING)
    private RouteType type;

    private String startPoint;
    private String endPoint;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RouteStatus status = RouteStatus.ACTIVE;
}
