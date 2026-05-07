package com.transpolink.incident.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.incident.config.SecurityConfig;
import com.transpolink.incident.dto.*;
import com.transpolink.incident.enums.IncidentStatus;
import com.transpolink.incident.enums.IncidentType;
import com.transpolink.incident.enums.ResolutionStatus;
import com.transpolink.incident.service.IncidentService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidentController.class)
@Import(SecurityConfig.class)
class IncidentControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean IncidentService incidentService;
    @MockBean com.transpolink.incident.config.JwtAuthFilter jwtAuthFilter;

    private IncidentResponse buildIncidentResponse() {
        return IncidentResponse.builder()
                .incidentId(1L).reporterId(10L).type(IncidentType.ACCIDENT)
                .location("Main St").date(LocalDateTime.now()).status(IncidentStatus.REPORTED).build();
    }

    @Test
    @WithMockUser(authorities = "ROLE_CITIZEN")
    void createIncident_returns200() throws Exception {
        IncidentRequest req = new IncidentRequest();
        req.setType(IncidentType.ACCIDENT);
        req.setLocation("Main St");

        when(incidentService.createIncident(any(IncidentRequest.class), any(Long.class)))
                .thenReturn(buildIncidentResponse());

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getIncidentById_returns200() throws Exception {
        when(incidentService.getIncidentById(1L)).thenReturn(buildIncidentResponse());

        mockMvc.perform(get("/api/incidents/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void getAllIncidents_returns200() throws Exception {
        when(incidentService.getAllIncidents()).thenReturn(List.of(buildIncidentResponse()));

        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "TRAFFIC_OFFICER")
    void updateStatus_returns200() throws Exception {
        when(incidentService.updateStatus(eq(1L), eq("IN_PROGRESS"))).thenReturn(buildIncidentResponse());

        mockMvc.perform(patch("/api/incidents/1/status").param("status", "IN_PROGRESS"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "TRAFFIC_OFFICER")
    void addResolution_returns200() throws Exception {
        ResolutionRequest req = new ResolutionRequest();
        req.setIncidentId(1L);
        req.setOfficerId(5L);
        req.setActions("Cleared road");

        ResolutionResponse resp = ResolutionResponse.builder()
                .resolutionId(1L).incidentId(1L).officerId(5L)
                .actions("Cleared road").date(LocalDateTime.now())
                .status(ResolutionStatus.PENDING).build();

        when(incidentService.addResolution(any(ResolutionRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/resolutions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void getResolutionsByIncident_returns200() throws Exception {
        ResolutionResponse resp = ResolutionResponse.builder()
                .resolutionId(1L).incidentId(1L).officerId(5L)
                .actions("Cleared road").date(LocalDateTime.now())
                .status(ResolutionStatus.PENDING).build();

        when(incidentService.getResolutionsByIncident(1L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/resolutions/incident/1"))
                .andExpect(status().isOk());
    }
}
