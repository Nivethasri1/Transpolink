package com.transpolink.reporting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.reporting.config.SecurityConfig;
import com.transpolink.reporting.dto.ReportRequest;
import com.transpolink.reporting.dto.ReportResponse;
import com.transpolink.reporting.enums.ReportScope;
import com.transpolink.reporting.service.ReportingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReportController.class)
@Import(SecurityConfig.class)
class ReportControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean ReportingService reportingService;
    @MockBean com.transpolink.reporting.config.JwtAuthFilter jwtAuthFilter;

    private ReportResponse buildResponse() {
        return ReportResponse.builder()
                .reportId(1L).scope(ReportScope.INCIDENT)
                .metrics("{\"total\":10}").generatedDate(LocalDateTime.now()).build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void generateReport_returns200() throws Exception {
        ReportRequest req = new ReportRequest();
        req.setScope(ReportScope.INCIDENT); req.setMetrics("{\"total\":10}");

        when(reportingService.generateReport(any())).thenReturn(buildResponse());

        mockMvc.perform(post("/api/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportId").value(1))
                .andExpect(jsonPath("$.scope").value("INCIDENT"));
    }

    @Test
    @WithMockUser
    void getReportById_returns200() throws Exception {
        when(reportingService.getReportById(1L)).thenReturn(buildResponse());

        mockMvc.perform(get("/api/reports/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metrics").value("{\"total\":10}"));
    }

    @Test
    @WithMockUser
    void getAllReports_returns200() throws Exception {
        when(reportingService.getAllReports()).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reportId").value(1));
    }

    @Test
    @WithMockUser
    void getReportsByScope_returns200() throws Exception {
        when(reportingService.getReportsByScope("INCIDENT")).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/reports/scope/INCIDENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].scope").value("INCIDENT"));
    }
}
