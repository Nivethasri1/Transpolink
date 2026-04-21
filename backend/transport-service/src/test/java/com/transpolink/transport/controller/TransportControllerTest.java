package com.transpolink.transport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.transport.config.SecurityConfig;
import com.transpolink.transport.dto.*;
import com.transpolink.transport.enums.*;
import com.transpolink.transport.service.TransportService;
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

@WebMvcTest(TransportController.class)
@Import(SecurityConfig.class)
class TransportControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean TransportService transportService;
    @MockBean com.transpolink.transport.config.JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(roles = "TRANSPORT_OPERATOR")
    void createRoute_returns200() throws Exception {
        RouteRequest req = new RouteRequest();
        req.setOperatorId(2L); req.setType(RouteType.BUS);
        req.setStartPoint("A"); req.setEndPoint("B");

        RouteResponse resp = RouteResponse.builder()
                .routeId(1L).operatorId(2L).type(RouteType.BUS)
                .startPoint("A").endPoint("B").status(RouteStatus.ACTIVE).build();

        when(transportService.createRoute(any())).thenReturn(resp);

        mockMvc.perform(post("/api/routes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routeId").value(1))
                .andExpect(jsonPath("$.type").value("BUS"));
    }

    @Test
    @WithMockUser
    void getRouteById_returns200() throws Exception {
        RouteResponse resp = RouteResponse.builder()
                .routeId(1L).operatorId(2L).type(RouteType.BUS)
                .startPoint("A").endPoint("B").status(RouteStatus.ACTIVE).build();

        when(transportService.getRouteById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/routes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startPoint").value("A"));
    }

    @Test
    @WithMockUser
    void getAllRoutes_returns200() throws Exception {
        RouteResponse resp = RouteResponse.builder()
                .routeId(1L).operatorId(2L).type(RouteType.BUS)
                .startPoint("A").endPoint("B").status(RouteStatus.ACTIVE).build();

        when(transportService.getAllRoutes()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/routes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].routeId").value(1));
    }

    @Test
    @WithMockUser(roles = "TRANSPORT_OPERATOR")
    void createSchedule_returns200() throws Exception {
        ScheduleRequest req = new ScheduleRequest();
        req.setRouteId(1L);
        req.setDepartureTime(LocalDateTime.now());
        req.setArrivalTime(LocalDateTime.now().plusHours(1));

        ScheduleResponse resp = ScheduleResponse.builder()
                .scheduleId(1L).routeId(1L)
                .departureTime(LocalDateTime.now()).arrivalTime(LocalDateTime.now().plusHours(1))
                .status(ScheduleStatus.SCHEDULED).build();

        when(transportService.createSchedule(any())).thenReturn(resp);

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduleId").value(1));
    }

    @Test
    @WithMockUser
    void getSchedulesByRoute_returns200() throws Exception {
        ScheduleResponse resp = ScheduleResponse.builder()
                .scheduleId(1L).routeId(1L)
                .departureTime(LocalDateTime.now()).arrivalTime(LocalDateTime.now().plusHours(1))
                .status(ScheduleStatus.SCHEDULED).build();

        when(transportService.getSchedulesByRoute(1L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/schedules/route/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].scheduleId").value(1));
    }

    @Test
    @WithMockUser(roles = "TRANSPORT_OPERATOR")
    void addFleet_returns200() throws Exception {
        FleetRequest req = new FleetRequest();
        req.setOperatorId(2L); req.setVehicleType("Bus"); req.setCapacity(50);

        FleetResponse resp = FleetResponse.builder()
                .fleetId(1L).operatorId(2L).vehicleType("Bus")
                .capacity(50).status(FleetStatus.AVAILABLE).build();

        when(transportService.addFleet(any())).thenReturn(resp);

        mockMvc.perform(post("/api/fleets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleType").value("Bus"))
                .andExpect(jsonPath("$.capacity").value(50));
    }

    @Test
    @WithMockUser
    void getFleetByOperator_returns200() throws Exception {
        FleetResponse resp = FleetResponse.builder()
                .fleetId(1L).operatorId(2L).vehicleType("Bus")
                .capacity(50).status(FleetStatus.AVAILABLE).build();

        when(transportService.getFleetByOperator(2L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/fleets/operator/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fleetId").value(1));
    }

    @Test
    @WithMockUser(roles = "TRANSPORT_OPERATOR")
    void updateFleetStatus_returns200() throws Exception {
        FleetResponse resp = FleetResponse.builder()
                .fleetId(1L).operatorId(2L).vehicleType("Bus")
                .capacity(50).status(FleetStatus.IN_SERVICE).build();

        when(transportService.updateFleetStatus(eq(1L), eq("IN_SERVICE"))).thenReturn(resp);

        mockMvc.perform(patch("/api/fleets/1/status").param("status", "IN_SERVICE"))
                .andExpect(status().isOk());
    }
}
