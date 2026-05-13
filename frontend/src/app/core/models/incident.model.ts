export type IncidentType = 'ACCIDENT' | 'BREAKDOWN' | 'ROADBLOCK';
export type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ResolutionStatus = 'PENDING' | 'COMPLETED';

export interface IncidentRequest {
  type: IncidentType;
  location: string;
}

export interface IncidentResponse {
  incidentId: number;
  reporterId: number;
  type: IncidentType;
  location: string;
  date: string;
  status: IncidentStatus;
}

export interface ResolutionRequest {
  incidentId: number;
  officerId: number;
  actions: string;
}

export interface ResolutionResponse {
  resolutionId: number;
  incidentId: number;
  officerId: number;
  actions: string;
  date: string;
  status: ResolutionStatus;
}
