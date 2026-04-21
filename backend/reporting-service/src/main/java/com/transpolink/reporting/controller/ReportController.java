package com.transpolink.reporting.controller;

import com.transpolink.reporting.dto.ReportRequest;
import com.transpolink.reporting.dto.ReportResponse;
import com.transpolink.reporting.service.ReportingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReportController {

    private final ReportingService reportingService;

    @PostMapping("/api/reports")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPLIANCE_OFFICER')")
    public ResponseEntity<ReportResponse> generate(@Valid @RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportingService.generateReport(request));
    }

    @GetMapping("/api/reports/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<ReportResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reportingService.getReportById(id));
    }

    @GetMapping("/api/reports")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<ReportResponse>> getAll() {
        return ResponseEntity.ok(reportingService.getAllReports());
    }

    @GetMapping("/api/reports/scope/{scope}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('COMPLIANCE_OFFICER') or hasRole('CITIZEN')")
    public ResponseEntity<List<ReportResponse>> getByScope(@PathVariable String scope) {
        return ResponseEntity.ok(reportingService.getReportsByScope(scope));
    }
}
