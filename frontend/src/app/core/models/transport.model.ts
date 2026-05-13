export type RouteType = 'BUS' | 'TRAIN';
export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type ScheduleStatus = 'SCHEDULED' | 'ON_TIME' | 'DELAYED' | 'CANCELLED';
export type FleetStatus = 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'RETIRED';

export interface RouteRequest {
  operatorId: number;
  type: RouteType;
  startPoint: string;
  endPoint: string;
}

export interface RouteResponse {
  routeId: number;
  operatorId: number;
  type: RouteType;
  startPoint: string;
  endPoint: string;
  status: RouteStatus;
}

export interface ScheduleRequest {
  routeId: number;
  departureTime: string;
  arrivalTime: string;
}

export interface ScheduleResponse {
  scheduleId: number;
  routeId: number;
  departureTime: string;
  arrivalTime: string;
  status: ScheduleStatus;
}

export interface FleetRequest {
  registrationNumber: string;
  vehicleType: string;
  capacity: number;
}

export interface FleetResponse {
  fleetId: number;
  registrationNumber: string;
  vehicleType: string;
  capacity: number;
  status: FleetStatus;
}
