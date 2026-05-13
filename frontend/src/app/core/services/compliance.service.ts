import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ComplianceRecordRequest, ComplianceRecordResponse, AuditRequest, AuditResponse } from '../models/compliance.model';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRecord(req: ComplianceRecordRequest) {
    return this.http.post<ComplianceRecordResponse>(`${this.base}/compliance`, req);
  }

  getAllRecords() {
    return this.http.get<ComplianceRecordResponse[]>(`${this.base}/compliance`);
  }

  getRecordsByEntity(entityId: number) {
    return this.http.get<ComplianceRecordResponse[]>(`${this.base}/compliance/entity/${entityId}`);
  }

  createAudit(req: AuditRequest) {
    return this.http.post<AuditResponse>(`${this.base}/audits`, req);
  }

  getAllAudits() {
    return this.http.get<AuditResponse[]>(`${this.base}/audits`);
  }

  getAudit(id: number) {
    return this.http.get<AuditResponse>(`${this.base}/audits/${id}`);
  }

  updateAuditStatus(id: number, status: string) {
    return this.http.patch<AuditResponse>(`${this.base}/audits/${id}/status?status=${status}`, {});
  }
}
