package com.transpolink.compliance.controller;

import com.transpolink.compliance.dto.*;
import com.transpolink.compliance.service.ComplianceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceService complianceService;

    @PostMapping("/api/compliance")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<ComplianceRecordResponse> createRecord(@Valid @RequestBody ComplianceRecordRequest request) {
        return ResponseEntity.ok(complianceService.createRecord(request));
    }

    @GetMapping("/api/compliance")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<List<ComplianceRecordResponse>> getAllRecords() {
        return ResponseEntity.ok(complianceService.getAllRecords());
    }

    @GetMapping("/api/compliance/entity/{entityId}")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<List<ComplianceRecordResponse>> getByEntity(@PathVariable Long entityId) {
        return ResponseEntity.ok(complianceService.getRecordsByEntity(entityId));
    }

    @PostMapping("/api/audits")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<AuditResponse> createAudit(@Valid @RequestBody AuditRequest request) {
        return ResponseEntity.ok(complianceService.createAudit(request));
    }

    @GetMapping("/api/audits/{id}")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<AuditResponse> getAudit(@PathVariable Long id) {
        return ResponseEntity.ok(complianceService.getAuditById(id));
    }

    @GetMapping("/api/audits")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<List<AuditResponse>> getAllAudits() {
        return ResponseEntity.ok(complianceService.getAllAudits());
    }

    @PatchMapping("/api/audits/{id}/status")
    @PreAuthorize("hasRole('COMPLIANCE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<AuditResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(complianceService.updateAuditStatus(id, status));
    }
}
