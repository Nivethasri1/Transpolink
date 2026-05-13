import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  RouteRequest, RouteResponse,
  ScheduleRequest, ScheduleResponse,
  FleetRequest, FleetResponse
} from '../models/transport.model';

@Injectable({ providedIn: 'root' })
export class TransportService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRoute(req: RouteRequest) {
    return this.http.post<RouteResponse>(`${this.base}/routes`, req);
  }

  getAllRoutes() {
    return this.http.get<RouteResponse[]>(`${this.base}/routes`);
  }

  getRoute(id: number) {
    return this.http.get<RouteResponse>(`${this.base}/routes/${id}`);
  }

  createSchedule(req: ScheduleRequest) {
    const body = {
      ...req,
      departureTime: req.departureTime.length === 16 ? req.departureTime + ':00' : req.departureTime,
      arrivalTime:   req.arrivalTime.length === 16   ? req.arrivalTime   + ':00' : req.arrivalTime
    };
    return this.http.post<ScheduleResponse>(`${this.base}/schedules`, body);
  }

  getAllSchedules() {
    return this.http.get<ScheduleResponse[]>(`${this.base}/schedules`);
  }

  getSchedulesByRoute(routeId: number) {
    return this.http.get<ScheduleResponse[]>(`${this.base}/schedules/route/${routeId}`);
  }

  updateScheduleStatus(id: number, status: string) {
    return this.http.patch<ScheduleResponse>(`${this.base}/schedules/${id}/status?status=${status}`, {});
  }

  addFleet(req: FleetRequest) {
    return this.http.post<FleetResponse>(`${this.base}/fleets`, req);
  }

  getFleetByOperator(operatorId: number) {
    return this.http.get<FleetResponse[]>(`${this.base}/fleets/operator/${operatorId}`);
  }

  getAllFleet() {
    return this.http.get<FleetResponse[]>(`${this.base}/fleets`);
  }

  getAvailableFleet() {
    return this.http.get<FleetResponse[]>(`${this.base}/fleets/available`);
  }

  getAvailableFleetByVehicleType(vehicleType: string) {
    return this.http.get<FleetResponse[]>(`${this.base}/fleets/available/by-type?vehicleType=${encodeURIComponent(vehicleType)}`);
  }

  assignFleetToRoute(fleetId: number, routeId: number) {
    return this.http.patch<FleetResponse>(`${this.base}/fleets/${fleetId}/assign/${routeId}`, {});
  }

  updateFleetStatus(id: number, status: string) {
    return this.http.patch<FleetResponse>(`${this.base}/fleets/${id}/status?status=${status}`, {});
  }
}
