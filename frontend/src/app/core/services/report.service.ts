import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ReportRequest, ReportResponse, ReportScope } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generate(req: ReportRequest) {
    return this.http.post<ReportResponse>(`${this.base}/reports`, req);
  }

  getAll() {
    return this.http.get<ReportResponse[]>(`${this.base}/reports`);
  }

  getById(id: number) {
    return this.http.get<ReportResponse>(`${this.base}/reports/${id}`);
  }

  getByScope(scope: ReportScope) {
    return this.http.get<ReportResponse[]>(`${this.base}/reports/scope/${scope}`);
  }

  downloadPdf(scope: ReportScope, description: string = '') {
    const url = description
      ? `${this.base}/reports/${scope}/pdf?description=${description}`
      : `${this.base}/reports/${scope}/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
