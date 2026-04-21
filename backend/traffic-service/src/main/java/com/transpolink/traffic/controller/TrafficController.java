package com.transpolink.traffic.controller;

import com.transpolink.traffic.dto.*;
import com.transpolink.traffic.service.TrafficService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TrafficController {

    private final TrafficService trafficService;

    @PostMapping("/api/road-segments")
    @PreAuthorize("hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<RoadSegmentResponse> createSegment(@Valid @RequestBody RoadSegmentRequest request) {
        return ResponseEntity.ok(trafficService.createSegment(request));
    }

    @GetMapping("/api/road-segments/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<RoadSegmentResponse> getSegment(@PathVariable Long id) {
        return ResponseEntity.ok(trafficService.getSegmentById(id));
    }

    @GetMapping("/api/road-segments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<RoadSegmentResponse>> getAllSegments() {
        return ResponseEntity.ok(trafficService.getAllSegments());
    }

    @PatchMapping("/api/road-segments/{id}/status")
    @PreAuthorize("hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<RoadSegmentResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(trafficService.updateSegmentStatus(id, status));
    }

    @PostMapping("/api/traffic-flows")
    @PreAuthorize("hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<TrafficFlowResponse> recordFlow(@Valid @RequestBody TrafficFlowRequest request) {
        return ResponseEntity.ok(trafficService.recordFlow(request));
    }

    @GetMapping("/api/traffic-flows/segment/{segmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<TrafficFlowResponse>> getFlows(@PathVariable Long segmentId) {
        return ResponseEntity.ok(trafficService.getFlowsBySegment(segmentId));
    }
}
