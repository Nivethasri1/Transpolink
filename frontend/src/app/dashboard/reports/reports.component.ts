import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportingService } from '../../core/services/report.service';
import { ReportResponse, ReportScope } from '../../core/models/report.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: ReportResponse[] = [];
  allReports: ReportResponse[] = [];
  canGenerate = false;
  showForm = false;
  scopes: ReportScope[] = ['INCIDENT', 'TRANSPORT', 'TRAFFIC', 'COMPLIANCE'];
  selectedScope: ReportScope | null = null;
  reportSearch = '';

  form = this.fb.group({
    scope:   ['' as ReportScope, Validators.required],
    metrics: ['', Validators.required]
  });

  get filteredReports(): ReportResponse[] {
    let list = this.reports;
    if (this.reportSearch.trim()) {
      const q = this.reportSearch.toLowerCase();
      list = list.filter(r => r.metrics.toLowerCase().includes(q) || r.scope.toLowerCase().includes(q));
    }
    return list;
  }

  constructor(
    private reportingService: ReportingService,
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.canGenerate = role === 'ADMIN' || role === 'COMPLIANCE_OFFICER';
    this.loadAll();
  }

  loadAll(): void {
    this.reportingService.getAll().subscribe({ next: d => { this.allReports = d; this.reports = d; this.selectedScope = null; } });
  }

  filterByScope(scope: ReportScope): void {
    this.selectedScope = scope;
    this.reports = this.allReports.filter(r => r.scope === scope);
  }

  clearFilter(): void {
    this.selectedScope = null;
    this.reports = this.allReports;
  }

  generate(): void {
    if (this.form.invalid) return;
    const { scope, metrics } = this.form.value;
    this.reportingService.generate({ scope: scope!, metrics: metrics! }).subscribe({
      next: () => { this.loadAll(); this.form.reset(); this.showForm = false; this.snack.open('Report saved', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed to generate report', 'OK', { duration: 3000 })
    });
  }

  parseMetrics(metrics: string): { key: string; value: string }[] {
    try {
      const obj = JSON.parse(metrics);
      return Object.entries(obj).map(([k, v]) => ({
        key: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
        value: String(v)
      }));
    } catch { return [{ key: 'Metrics', value: metrics }]; }
  }

  scopeDesc(scope: ReportScope): string {
    const map: Record<ReportScope, string> = {
      INCIDENT:   'All incidents & resolutions',
      TRAFFIC:    'Road segments & traffic flows',
      TRANSPORT:  'Routes, fleet & schedules',
      COMPLIANCE: 'Records & audits'
    };
    return map[scope];
  }

  downloadPdf(scope: ReportScope): void {
    this.snack.open(`Generating ${scope} PDF...`, '', { duration: 2000 });
    this.reportingService.downloadPdf(scope).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scope.toLowerCase()}-report.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.snack.open(`${scope} report downloaded`, 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Failed to download PDF', 'OK', { duration: 3000 })
    });
  }

  get incidentCount()   { return this.allReports.filter(r => r.scope === 'INCIDENT').length; }
  get trafficCount()    { return this.allReports.filter(r => r.scope === 'TRAFFIC').length; }
  get transportCount()  { return this.allReports.filter(r => r.scope === 'TRANSPORT').length; }
  get complianceCount() { return this.allReports.filter(r => r.scope === 'COMPLIANCE').length; }
}
