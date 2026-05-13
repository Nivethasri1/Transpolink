export type ComplianceType = 'INCIDENT' | 'TRANSPORT';
export type ComplianceResult = 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
export type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ComplianceRecordRequest {
  entityId: number;
  type: ComplianceType;
  result: ComplianceResult;
  notes: string;
}

export interface ComplianceRecordResponse {
  complianceId: number;
  entityId: number;
  type: ComplianceType;
  result: ComplianceResult;
  date: string;
  notes: string;
}

export interface AuditRequest {
  officerId: number;
  scope: string;
  findings: string;
}

export interface AuditResponse {
  auditId: number;
  officerId: number;
  scope: string;
  findings: string;
  date: string;
  status: AuditStatus;
}
