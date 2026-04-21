package com.transpolink.transport.service;

import com.transpolink.transport.dto.*;
import com.transpolink.transport.entity.Fleet;
import com.transpolink.transport.entity.Schedule;
import com.transpolink.transport.entity.TransportRoute;
import com.transpolink.transport.enums.*;
import com.transpolink.transport.exception.ResourceNotFoundException;
import com.transpolink.transport.repository.FleetRepository;
import com.transpolink.transport.repository.ScheduleRepository;
import com.transpolink.transport.repository.TransportRouteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransportServiceImplTest {

    @Mock TransportRouteRepository routeRepository;
    @Mock ScheduleRepository scheduleRepository;
    @Mock FleetRepository fleetRepository;

    @InjectMocks TransportServiceImpl transportService;

    private TransportRoute route;
    private Schedule schedule;
    private Fleet fleet;

    @BeforeEach
    void setUp() {
        route = TransportRoute.builder()
                .routeId(1L).operatorId(2L).type(RouteType.BUS)
                .startPoint("A").endPoint("B").status(RouteStatus.ACTIVE).build();

        schedule = Schedule.builder()
                .scheduleId(1L).routeId(1L)
                .departureTime(LocalDateTime.now()).arrivalTime(LocalDateTime.now().plusHours(1))
                .status(ScheduleStatus.SCHEDULED).build();

        fleet = Fleet.builder()
                .fleetId(1L).operatorId(2L).vehicleType("Bus")
                .capacity(50).status(FleetStatus.AVAILABLE).build();
    }

    @Test
    void createRoute_success() {
        RouteRequest req = new RouteRequest();
        req.setOperatorId(2L); req.setType(RouteType.BUS);
        req.setStartPoint("A"); req.setEndPoint("B");

        when(routeRepository.save(any(TransportRoute.class))).thenReturn(route);

        RouteResponse response = transportService.createRoute(req);

        assertThat(response.getRouteId()).isEqualTo(1L);
        assertThat(response.getType()).isEqualTo(RouteType.BUS);
        assertThat(response.getStartPoint()).isEqualTo("A");
    }

    @Test
    void getRouteById_success() {
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        RouteResponse response = transportService.getRouteById(1L);

        assertThat(response.getRouteId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(RouteStatus.ACTIVE);
    }

    @Test
    void getRouteById_throwsWhenNotFound() {
        when(routeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transportService.getRouteById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllRoutes_returnsList() {
        when(routeRepository.findAll()).thenReturn(List.of(route));

        List<RouteResponse> result = transportService.getAllRoutes();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEndPoint()).isEqualTo("B");
    }

    @Test
    void createSchedule_success() {
        ScheduleRequest req = new ScheduleRequest();
        req.setRouteId(1L);
        req.setDepartureTime(LocalDateTime.now());
        req.setArrivalTime(LocalDateTime.now().plusHours(1));

        when(routeRepository.existsById(1L)).thenReturn(true);
        when(scheduleRepository.save(any(Schedule.class))).thenReturn(schedule);

        ScheduleResponse response = transportService.createSchedule(req);

        assertThat(response.getScheduleId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(ScheduleStatus.SCHEDULED);
    }

    @Test
    void createSchedule_throwsWhenRouteNotFound() {
        ScheduleRequest req = new ScheduleRequest();
        req.setRouteId(99L);
        when(routeRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> transportService.createSchedule(req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getSchedulesByRoute_returnsList() {
        when(scheduleRepository.findByRouteId(1L)).thenReturn(List.of(schedule));

        List<ScheduleResponse> result = transportService.getSchedulesByRoute(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRouteId()).isEqualTo(1L);
    }

    @Test
    void updateScheduleStatus_success() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(scheduleRepository.save(any(Schedule.class))).thenReturn(schedule);

        ScheduleResponse response = transportService.updateScheduleStatus(1L, "DELAYED");

        verify(scheduleRepository).save(schedule);
        assertThat(response).isNotNull();
    }

    @Test
    void updateScheduleStatus_throwsWhenNotFound() {
        when(scheduleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transportService.updateScheduleStatus(99L, "DELAYED"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addFleet_success() {
        FleetRequest req = new FleetRequest();
        req.setOperatorId(2L); req.setVehicleType("Bus"); req.setCapacity(50);

        when(fleetRepository.save(any(Fleet.class))).thenReturn(fleet);

        FleetResponse response = transportService.addFleet(req);

        assertThat(response.getFleetId()).isEqualTo(1L);
        assertThat(response.getVehicleType()).isEqualTo("Bus");
        assertThat(response.getCapacity()).isEqualTo(50);
    }

    @Test
    void getFleetByOperator_returnsList() {
        when(fleetRepository.findByOperatorId(2L)).thenReturn(List.of(fleet));

        List<FleetResponse> result = transportService.getFleetByOperator(2L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(FleetStatus.AVAILABLE);
    }

    @Test
    void updateFleetStatus_success() {
        when(fleetRepository.findById(1L)).thenReturn(Optional.of(fleet));
        when(fleetRepository.save(any(Fleet.class))).thenReturn(fleet);

        FleetResponse response = transportService.updateFleetStatus(1L, "IN_SERVICE");

        verify(fleetRepository).save(fleet);
        assertThat(response).isNotNull();
    }

    @Test
    void updateFleetStatus_throwsWhenNotFound() {
        when(fleetRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transportService.updateFleetStatus(99L, "IN_SERVICE"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
