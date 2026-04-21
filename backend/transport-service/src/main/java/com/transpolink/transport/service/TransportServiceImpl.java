package com.transpolink.transport.service;

import com.transpolink.transport.dto.*;
import com.transpolink.transport.entity.*;
import com.transpolink.transport.enums.*;
import com.transpolink.transport.exception.ResourceNotFoundException;
import com.transpolink.transport.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransportServiceImpl implements TransportService {

    private final TransportRouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final FleetRepository fleetRepository;

    @Override
    public RouteResponse createRoute(RouteRequest request) {
        TransportRoute route = TransportRoute.builder()
                .operatorId(request.getOperatorId()).type(request.getType())
                .startPoint(request.getStartPoint()).endPoint(request.getEndPoint()).build();
        return mapRoute(routeRepository.save(route));
    }

    @Override
    public RouteResponse getRouteById(Long id) {
        return mapRoute(routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id)));
    }

    @Override
    public List<RouteResponse> getAllRoutes() {
        return routeRepository.findAll().stream().map(this::mapRoute).collect(Collectors.toList());
    }

    @Override
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        if (!routeRepository.existsById(request.getRouteId())) {
            throw new ResourceNotFoundException("Route not found: " + request.getRouteId());
        }
        Schedule schedule = Schedule.builder()
                .routeId(request.getRouteId())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime()).build();
        return mapSchedule(scheduleRepository.save(schedule));
    }

    @Override
    public List<ScheduleResponse> getSchedulesByRoute(Long routeId) {
        return scheduleRepository.findByRouteId(routeId).stream().map(this::mapSchedule).collect(Collectors.toList());
    }

    @Override
    public ScheduleResponse updateScheduleStatus(Long id, String status) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found: " + id));
        schedule.setStatus(ScheduleStatus.valueOf(status));
        return mapSchedule(scheduleRepository.save(schedule));
    }

    @Override
    public FleetResponse addFleet(FleetRequest request) {
        Fleet fleet = Fleet.builder()
                .operatorId(request.getOperatorId())
                .vehicleType(request.getVehicleType())
                .capacity(request.getCapacity()).build();
        return mapFleet(fleetRepository.save(fleet));
    }

    @Override
    public List<FleetResponse> getFleetByOperator(Long operatorId) {
        return fleetRepository.findByOperatorId(operatorId).stream().map(this::mapFleet).collect(Collectors.toList());
    }

    @Override
    public FleetResponse updateFleetStatus(Long id, String status) {
        Fleet fleet = fleetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fleet not found: " + id));
        fleet.setStatus(FleetStatus.valueOf(status));
        return mapFleet(fleetRepository.save(fleet));
    }

    private RouteResponse mapRoute(TransportRoute r) {
        return RouteResponse.builder().routeId(r.getRouteId()).operatorId(r.getOperatorId())
                .type(r.getType()).startPoint(r.getStartPoint()).endPoint(r.getEndPoint()).status(r.getStatus()).build();
    }

    private ScheduleResponse mapSchedule(Schedule s) {
        return ScheduleResponse.builder().scheduleId(s.getScheduleId()).routeId(s.getRouteId())
                .departureTime(s.getDepartureTime()).arrivalTime(s.getArrivalTime()).status(s.getStatus()).build();
    }

    private FleetResponse mapFleet(Fleet f) {
        return FleetResponse.builder().fleetId(f.getFleetId()).operatorId(f.getOperatorId())
                .vehicleType(f.getVehicleType()).capacity(f.getCapacity()).status(f.getStatus()).build();
    }
}
