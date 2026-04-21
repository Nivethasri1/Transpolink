package com.transpolink.compliance.service;

import com.transpolink.compliance.dto.*;

import java.util.List;

public interface ComplianceService {
    ComplianceRecordResponse createRecord(ComplianceRecordRequest request);
    List<ComplianceRecordResponse> getAllRecords();
    List<ComplianceRecordResponse> getRecordsByEntity(Long entityId);
    AuditResponse createAudit(AuditRequest request);
    AuditResponse getAuditById(Long id);
    List<AuditResponse> getAllAudits();
    AuditResponse updateAuditStatus(Long id, String status);
}
