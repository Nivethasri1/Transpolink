package com.transpolink.transport.controller;

import com.transpolink.transport.dto.*;
import com.transpolink.transport.service.TransportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    @PostMapping("/api/routes")
    @PreAuthorize("hasRole('TRANSPORT_OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<RouteResponse> createRoute(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(transportService.createRoute(request));
    }

    @GetMapping("/api/routes/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<RouteResponse> getRoute(@PathVariable Long id) {
        return ResponseEntity.ok(transportService.getRouteById(id));
    }

    @GetMapping("/api/routes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<RouteResponse>> getAllRoutes() {
        return ResponseEntity.ok(transportService.getAllRoutes());
    }

    @PostMapping("/api/schedules")
    @PreAuthorize("hasRole('TRANSPORT_OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(transportService.createSchedule(request));
    }

    @GetMapping("/api/schedules/route/{routeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<ScheduleResponse>> getSchedules(@PathVariable Long routeId) {
        return ResponseEntity.ok(transportService.getSchedulesByRoute(routeId));
    }

    @PatchMapping("/api/schedules/{id}/status")
    @PreAuthorize("hasRole('TRANSPORT_OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ScheduleResponse> updateScheduleStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(transportService.updateScheduleStatus(id, status));
    }

    @PostMapping("/api/fleets")
    @PreAuthorize("hasRole('TRANSPORT_OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<FleetResponse> addFleet(@Valid @RequestBody FleetRequest request) {
        return ResponseEntity.ok(transportService.addFleet(request));
    }

    @GetMapping("/api/fleets/operator/{operatorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<FleetResponse>> getFleet(@PathVariable Long operatorId) {
        return ResponseEntity.ok(transportService.getFleetByOperator(operatorId));
    }

    @PatchMapping("/api/fleets/{id}/status")
    @PreAuthorize("hasRole('TRANSPORT_OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<FleetResponse> updateFleetStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(transportService.updateFleetStatus(id, status));
    }
}
