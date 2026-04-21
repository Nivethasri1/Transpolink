package com.transpolink.compliance.service;

import com.transpolink.compliance.dto.*;
import com.transpolink.compliance.entity.Audit;
import com.transpolink.compliance.entity.ComplianceRecord;
import com.transpolink.compliance.enums.AuditStatus;
import com.transpolink.compliance.enums.ComplianceResult;
import com.transpolink.compliance.enums.ComplianceType;
import com.transpolink.compliance.exception.ResourceNotFoundException;
import com.transpolink.compliance.repository.AuditRepository;
import com.transpolink.compliance.repository.ComplianceRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplianceServiceImplTest {

    @Mock ComplianceRecordRepository recordRepository;
    @Mock AuditRepository auditRepository;

    @InjectMocks ComplianceServiceImpl complianceService;

    private ComplianceRecord record;
    private Audit audit;

    @BeforeEach
    void setUp() {
        record = ComplianceRecord.builder()
                .complianceId(1L).entityId(10L).type(ComplianceType.INCIDENT)
                .result(ComplianceResult.COMPLIANT).date(LocalDate.now()).notes("All good").build();

        audit = Audit.builder()
                .auditId(1L).officerId(5L).scope("Transport").findings("No issues")
                .date(LocalDate.now()).status(AuditStatus.PLANNED).build();
    }

    @Test
    void createRecord_success() {
        ComplianceRecordRequest req = new ComplianceRecordRequest();
        req.setEntityId(10L); req.setType(ComplianceType.INCIDENT);
        req.setResult(ComplianceResult.COMPLIANT); req.setNotes("All good");

        when(recordRepository.save(any(ComplianceRecord.class))).thenReturn(record);

        ComplianceRecordResponse response = complianceService.createRecord(req);

        assertThat(response.getComplianceId()).isEqualTo(1L);
        assertThat(response.getResult()).isEqualTo(ComplianceResult.COMPLIANT);
        assertThat(response.getNotes()).isEqualTo("All good");
    }

    @Test
    void getAllRecords_returnsList() {
        when(recordRepository.findAll()).thenReturn(List.of(record));

        List<ComplianceRecordResponse> result = complianceService.getAllRecords();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(ComplianceType.INCIDENT);
    }

    @Test
    void getRecordsByEntity_returnsList() {
        when(recordRepository.findByEntityId(10L)).thenReturn(List.of(record));

        List<ComplianceRecordResponse> result = complianceService.getRecordsByEntity(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEntityId()).isEqualTo(10L);
    }

    @Test
    void createAudit_success() {
        AuditRequest req = new AuditRequest();
        req.setOfficerId(5L); req.setScope("Transport"); req.setFindings("No issues");

        when(auditRepository.save(any(Audit.class))).thenReturn(audit);

        AuditResponse response = complianceService.createAudit(req);

        assertThat(response.getAuditId()).isEqualTo(1L);
        assertThat(response.getScope()).isEqualTo("Transport");
        assertThat(response.getStatus()).isEqualTo(AuditStatus.PLANNED);
    }

    @Test
    void getAuditById_success() {
        when(auditRepository.findById(1L)).thenReturn(Optional.of(audit));

        AuditResponse response = complianceService.getAuditById(1L);

        assertThat(response.getAuditId()).isEqualTo(1L);
        assertThat(response.getOfficerId()).isEqualTo(5L);
    }

    @Test
    void getAuditById_throwsWhenNotFound() {
        when(auditRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> complianceService.getAuditById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllAudits_returnsList() {
        when(auditRepository.findAll()).thenReturn(List.of(audit));

        List<AuditResponse> result = complianceService.getAllAudits();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFindings()).isEqualTo("No issues");
    }

    @Test
    void updateAuditStatus_success() {
        when(auditRepository.findById(1L)).thenReturn(Optional.of(audit));
        when(auditRepository.save(any(Audit.class))).thenReturn(audit);

        AuditResponse response = complianceService.updateAuditStatus(1L, "COMPLETED");

        verify(auditRepository).save(audit);
        assertThat(response).isNotNull();
    }

    @Test
    void updateAuditStatus_throwsWhenNotFound() {
        when(auditRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> complianceService.updateAuditStatus(99L, "COMPLETED"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
