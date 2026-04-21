package com.transpolink.traffic.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.traffic.config.SecurityConfig;
import com.transpolink.traffic.dto.*;
import com.transpolink.traffic.enums.FlowStatus;
import com.transpolink.traffic.enums.SegmentStatus;
import com.transpolink.traffic.service.TrafficService;
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

@WebMvcTest(TrafficController.class)
@Import(SecurityConfig.class)
class TrafficControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean TrafficService trafficService;
    @MockBean com.transpolink.traffic.config.JwtAuthFilter jwtAuthFilter;

    private RoadSegmentResponse buildSegmentResponse() {
        return RoadSegmentResponse.builder()
                .segmentId(1L).location("Highway 1").length(5.0).status(SegmentStatus.OPEN).build();
    }

    private TrafficFlowResponse buildFlowResponse() {
        return TrafficFlowResponse.builder()
                .flowId(1L).segmentId(1L).volume(200).speed(60.0)
                .date(LocalDateTime.now()).status(FlowStatus.NORMAL).build();
    }

    @Test
    @WithMockUser(roles = "TRAFFIC_OFFICER")
    void createSegment_returns200() throws Exception {
        RoadSegmentRequest req = new RoadSegmentRequest();
        req.setLocation("Highway 1"); req.setLength(5.0);

        when(trafficService.createSegment(any())).thenReturn(buildSegmentResponse());

        mockMvc.perform(post("/api/road-segments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.segmentId").value(1))
                .andExpect(jsonPath("$.location").value("Highway 1"));
    }

    @Test
    @WithMockUser
    void getSegmentById_returns200() throws Exception {
        when(trafficService.getSegmentById(1L)).thenReturn(buildSegmentResponse());

        mockMvc.perform(get("/api/road-segments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @WithMockUser
    void getAllSegments_returns200() throws Exception {
        when(trafficService.getAllSegments()).thenReturn(List.of(buildSegmentResponse()));

        mockMvc.perform(get("/api/road-segments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].segmentId").value(1));
    }

    @Test
    @WithMockUser(roles = "TRAFFIC_OFFICER")
    void updateSegmentStatus_returns200() throws Exception {
        when(trafficService.updateSegmentStatus(eq(1L), eq("CLOSED"))).thenReturn(buildSegmentResponse());

        mockMvc.perform(patch("/api/road-segments/1/status").param("status", "CLOSED"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "TRAFFIC_OFFICER")
    void recordFlow_returns200() throws Exception {
        TrafficFlowRequest req = new TrafficFlowRequest();
        req.setSegmentId(1L); req.setVolume(200); req.setSpeed(60.0);

        when(trafficService.recordFlow(any())).thenReturn(buildFlowResponse());

        mockMvc.perform(post("/api/traffic-flows")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.volume").value(200));
    }

    @Test
    @WithMockUser
    void getFlowsBySegment_returns200() throws Exception {
        when(trafficService.getFlowsBySegment(1L)).thenReturn(List.of(buildFlowResponse()));

        mockMvc.perform(get("/api/traffic-flows/segment/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].flowId").value(1));
    }
}
