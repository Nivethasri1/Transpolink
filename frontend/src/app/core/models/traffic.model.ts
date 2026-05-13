export type SegmentStatus = 'OPEN' | 'CLOSED' | 'UNDER_MAINTENANCE' | 'CONGESTED';
export type FlowStatus = 'NORMAL' | 'SLOW' | 'HEAVY' | 'STANDSTILL';

export interface RoadSegmentRequest {
  location: string;
  length: number;
}

export interface RoadSegmentResponse {
  segmentId: number;
  location: string;
  length: number;
  status: SegmentStatus;
}

export interface TrafficFlowRequest {
  segmentId: number;
  volume: number;
  speed: number;
}

export interface TrafficFlowResponse {
  flowId: number;
  segmentId: number;
  volume: number;
  speed: number;
  date: string;
  status: FlowStatus;
}
