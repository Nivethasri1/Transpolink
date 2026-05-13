import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RoadSegmentRequest, RoadSegmentResponse, TrafficFlowRequest, TrafficFlowResponse } from '../models/traffic.model';

@Injectable({ providedIn: 'root' })
export class TrafficService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSegment(req: RoadSegmentRequest) {
    return this.http.post<RoadSegmentResponse>(`${this.base}/road-segments`, req);
  }

  getAllSegments() {
    return this.http.get<RoadSegmentResponse[]>(`${this.base}/road-segments`);
  }

  getSegment(id: number) {
    return this.http.get<RoadSegmentResponse>(`${this.base}/road-segments/${id}`);
  }

  updateSegmentStatus(id: number, status: string) {
    return this.http.patch<RoadSegmentResponse>(`${this.base}/road-segments/${id}/status?status=${status}`, {});
  }

  recordFlow(req: TrafficFlowRequest) {
    return this.http.post<TrafficFlowResponse>(`${this.base}/traffic-flows`, req);
  }

  getAllFlows() {
    return this.http.get<TrafficFlowResponse[]>(`${this.base}/traffic-flows`);
  }

  getFlowsBySegment(segmentId: number) {
    return this.http.get<TrafficFlowResponse[]>(`${this.base}/traffic-flows/segment/${segmentId}`);
  }
}
