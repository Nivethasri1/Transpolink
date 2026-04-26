package com.transpolink.incident.controller;

import com.transpolink.incident.dto.*;
import com.transpolink.incident.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

//    @PostMapping("/api/incidents")
//    @PreAuthorize("hasRole('CITIZEN') or hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
//    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody IncidentRequest request) {
//        return ResponseEntity.ok(incidentService.createIncident(request));
//    }
@PostMapping("/api/incidents")
@PreAuthorize("hasRole('CITIZEN') or hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
public ResponseEntity<IncidentResponse> create(@Valid @RequestBody IncidentRequest request,
                                               Authentication authentication) {
    String reporterIdStr = (String) authentication.getPrincipal();
    Long reporterId = Long.valueOf(reporterIdStr);

    return ResponseEntity.ok(incidentService.createIncident(request, reporterId));
}

    @GetMapping("/api/incidents/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<IncidentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/api/incidents")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<IncidentResponse>> getAll() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @PatchMapping("/api/incidents/{id}/status")
    @PreAuthorize("hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<IncidentResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(incidentService.updateStatus(id, status));
    }

    @PostMapping("/api/resolutions")
    @PreAuthorize("hasRole('TRAFFIC_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<ResolutionResponse> addResolution(@Valid @RequestBody ResolutionRequest request) {
        return ResponseEntity.ok(incidentService.addResolution(request));
    }

    @GetMapping("/api/resolutions/incident/{incidentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<ResolutionResponse>> getResolutions(@PathVariable Long incidentId) {
        return ResponseEntity.ok(incidentService.getResolutionsByIncident(incidentId));
    }
}
