package com.transpolink.compliance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.compliance.config.SecurityConfig;
import com.transpolink.compliance.dto.*;
import com.transpolink.compliance.enums.AuditStatus;
import com.transpolink.compliance.enums.ComplianceResult;
import com.transpolink.compliance.enums.ComplianceType;
import com.transpolink.compliance.service.ComplianceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ComplianceController.class)
@Import(SecurityConfig.class)
class ComplianceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean ComplianceService complianceService;
    @MockBean com.transpolink.compliance.config.JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void createRecord_returns200() throws Exception {
        ComplianceRecordRequest req = new ComplianceRecordRequest();
        req.setEntityId(10L); req.setType(ComplianceType.INCIDENT);
        req.setResult(ComplianceResult.COMPLIANT); req.setNotes("All good");

        ComplianceRecordResponse resp = ComplianceRecordResponse.builder()
                .complianceId(1L).entityId(10L).type(ComplianceType.INCIDENT)
                .result(ComplianceResult.COMPLIANT).date(LocalDate.now()).notes("All good").build();

        when(complianceService.createRecord(any())).thenReturn(resp);

        mockMvc.perform(post("/api/compliance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complianceId").value(1))
                .andExpect(jsonPath("$.result").value("COMPLIANT"));
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void getAllRecords_returns200() throws Exception {
        ComplianceRecordResponse resp = ComplianceRecordResponse.builder()
                .complianceId(1L).entityId(10L).type(ComplianceType.INCIDENT)
                .result(ComplianceResult.COMPLIANT).date(LocalDate.now()).notes("All good").build();

        when(complianceService.getAllRecords()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/compliance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].complianceId").value(1));
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void getRecordsByEntity_returns200() throws Exception {
        ComplianceRecordResponse resp = ComplianceRecordResponse.builder()
                .complianceId(1L).entityId(10L).type(ComplianceType.INCIDENT)
                .result(ComplianceResult.COMPLIANT).date(LocalDate.now()).notes("All good").build();

        when(complianceService.getRecordsByEntity(10L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/compliance/entity/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].entityId").value(10));
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void createAudit_returns200() throws Exception {
        AuditRequest req = new AuditRequest();
        req.setOfficerId(5L); req.setScope("Transport"); req.setFindings("No issues");

        AuditResponse resp = AuditResponse.builder()
                .auditId(1L).officerId(5L).scope("Transport")
                .findings("No issues").date(LocalDate.now()).status(AuditStatus.PLANNED).build();

        when(complianceService.createAudit(any())).thenReturn(resp);

        mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.auditId").value(1))
                .andExpect(jsonPath("$.scope").value("Transport"));
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void getAuditById_returns200() throws Exception {
        AuditResponse resp = AuditResponse.builder()
                .auditId(1L).officerId(5L).scope("Transport")
                .findings("No issues").date(LocalDate.now()).status(AuditStatus.PLANNED).build();

        when(complianceService.getAuditById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/audits/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.officerId").value(5));
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void getAllAudits_returns200() throws Exception {
        AuditResponse resp = AuditResponse.builder()
                .auditId(1L).officerId(5L).scope("Transport")
                .findings("No issues").date(LocalDate.now()).status(AuditStatus.PLANNED).build();

        when(complianceService.getAllAudits()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/audits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].auditId").value(1));
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void updateAuditStatus_returns200() throws Exception {
        AuditResponse resp = AuditResponse.builder()
                .auditId(1L).officerId(5L).scope("Transport")
                .findings("No issues").date(LocalDate.now()).status(AuditStatus.COMPLETED).build();

        when(complianceService.updateAuditStatus(eq(1L), eq("COMPLETED"))).thenReturn(resp);

        mockMvc.perform(patch("/api/audits/1/status").param("status", "COMPLETED"))
                .andExpect(status().isOk());
    }
}
