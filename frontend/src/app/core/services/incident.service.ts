import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IncidentRequest, IncidentResponse, ResolutionRequest, ResolutionResponse } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createIncident(req: IncidentRequest) {
    return this.http.post<IncidentResponse>(`${this.base}/incidents`, req);
  }

  getAllIncidents() {
    return this.http.get<IncidentResponse[]>(`${this.base}/incidents`);
  }

  getIncident(id: number) {
    return this.http.get<IncidentResponse>(`${this.base}/incidents/${id}`);
  }

  updateIncidentStatus(id: number, status: string) {
    return this.http.patch<IncidentResponse>(`${this.base}/incidents/${id}/status?status=${status}`, {});
  }

  addResolution(req: ResolutionRequest) {
    return this.http.post<ResolutionResponse>(`${this.base}/resolutions`, req);
  }

  updateResolutionStatus(id: number, status: string) {
    return this.http.patch<ResolutionResponse>(`${this.base}/resolutions/${id}/status?status=${status}`, {});
  }

  getResolutionsByIncident(incidentId: number) {
    return this.http.get<ResolutionResponse[]>(`${this.base}/resolutions/incident/${incidentId}`);
  }
}
