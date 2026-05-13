export type ReportScope = 'INCIDENT' | 'TRANSPORT' | 'TRAFFIC' | 'COMPLIANCE';

export interface ReportRequest {
  scope: ReportScope;
  metrics: string;
}

export interface ReportResponse {
  reportId: number;
  scope: ReportScope;
  metrics: string;
  generatedDate: string;
}
