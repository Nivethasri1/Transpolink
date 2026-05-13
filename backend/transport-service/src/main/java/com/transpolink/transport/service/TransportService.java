package com.transpolink.transport.service;

import com.transpolink.transport.dto.*;

import java.util.List;

public interface TransportService {
    RouteResponse createRoute(RouteRequest request);
    RouteResponse getRouteById(Long id);
    List<RouteResponse> getAllRoutes();
    ScheduleResponse createSchedule(ScheduleRequest request);
    List<ScheduleResponse> getSchedulesByRoute(Long routeId);
    List<ScheduleResponse> getAllSchedules();
    ScheduleResponse updateScheduleStatus(Long id, String status);
    FleetResponse addFleet(FleetRequest request);
    List<FleetResponse> getFleetByOperator(Long operatorId);
    List<FleetResponse> getAllFleet();
    List<FleetResponse> getAvailableFleet();
    List<FleetResponse> getAvailableFleetByVehicleType(String vehicleType);
    FleetResponse updateFleetStatus(Long id, String status);
    FleetResponse assignFleetToRoute(Long fleetId, Long routeId);
}
