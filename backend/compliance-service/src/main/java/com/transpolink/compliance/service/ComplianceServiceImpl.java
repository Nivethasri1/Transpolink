package com.transpolink.compliance.service;

import com.transpolink.compliance.dto.*;
import com.transpolink.compliance.entity.Audit;
import com.transpolink.compliance.entity.ComplianceRecord;
import com.transpolink.compliance.enums.AuditStatus;
import com.transpolink.compliance.exception.ResourceNotFoundException;
import com.transpolink.compliance.repository.AuditRepository;
import com.transpolink.compliance.repository.ComplianceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplianceServiceImpl implements ComplianceService {

    private final ComplianceRecordRepository recordRepository;
    private final AuditRepository auditRepository;

    @Override
    public ComplianceRecordResponse createRecord(ComplianceRecordRequest request) {
        ComplianceRecord record = ComplianceRecord.builder()
                .entityId(request.getEntityId()).type(request.getType())
                .result(request.getResult()).notes(request.getNotes()).build();
        return mapRecord(recordRepository.save(record));
    }

    @Override
    public List<ComplianceRecordResponse> getAllRecords() {
        return recordRepository.findAll().stream().map(this::mapRecord).collect(Collectors.toList());
    }

    @Override
    public List<ComplianceRecordResponse> getRecordsByEntity(Long entityId) {
        return recordRepository.findByEntityId(entityId).stream().map(this::mapRecord).collect(Collectors.toList());
    }

    @Override
    public AuditResponse createAudit(AuditRequest request) {
        Audit audit = Audit.builder()
                .officerId(request.getOfficerId()).scope(request.getScope()).findings(request.getFindings()).build();
        return mapAudit(auditRepository.save(audit));
    }

    @Override
    public AuditResponse getAuditById(Long id) {
        return mapAudit(auditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found: " + id)));
    }

    @Override
    public List<AuditResponse> getAllAudits() {
        return auditRepository.findAll().stream().map(this::mapAudit).collect(Collectors.toList());
    }

    @Override
    public AuditResponse updateAuditStatus(Long id, String status) {
        Audit audit = auditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found: " + id));
        audit.setStatus(AuditStatus.valueOf(status));
        return mapAudit(auditRepository.save(audit));
    }

    private ComplianceRecordResponse mapRecord(ComplianceRecord r) {
        return ComplianceRecordResponse.builder()
                .complianceId(r.getComplianceId()).entityId(r.getEntityId())
                .type(r.getType()).result(r.getResult()).date(r.getDate()).notes(r.getNotes()).build();
    }

    private AuditResponse mapAudit(Audit a) {
        return AuditResponse.builder()
                .auditId(a.getAuditId()).officerId(a.getOfficerId())
                .scope(a.getScope()).findings(a.getFindings()).date(a.getDate()).status(a.getStatus()).build();
    }
}
