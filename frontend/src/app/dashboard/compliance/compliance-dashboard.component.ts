import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComplianceService } from '../../core/services/compliance.service';
import { ComplianceRecordResponse, AuditResponse, ComplianceType, ComplianceResult, AuditStatus } from '../../core/models/compliance.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-compliance-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './compliance-dashboard.component.html',
  styleUrls: ['./compliance-dashboard.component.css']
})
export class ComplianceDashboardComponent implements OnInit {
  records: ComplianceRecordResponse[] = [];
  audits: AuditResponse[] = [];

  activeTab: 'overview' | 'records' | 'audits' = 'overview';
  showRecordForm = false;
  showAuditForm = false;
  recordFilter = 'ALL';
  auditFilter = 'ALL';
  userId: number | null = null;

  complianceTypes: ComplianceType[] = ['INCIDENT', 'TRANSPORT'];
  complianceResults: ComplianceResult[] = ['COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW'];
  auditStatuses: AuditStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  recordForm = this.fb.group({
    entityId: [null as number | null, Validators.required],
    type:     ['' as ComplianceType, Validators.required],
    result:   ['' as ComplianceResult, Validators.required],
    notes:    ['', Validators.required]
  });

  auditForm = this.fb.group({
    scope:    ['', Validators.required],
    findings: ['', Validators.required]
  });

  constructor(
    private complianceService: ComplianceService,
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.loadRecords();
    this.loadAudits();
  }

  loadRecords(): void {
    this.complianceService.getAllRecords().subscribe({ next: d => this.records = d, error: () => {} });
  }

  loadAudits(): void {
    this.complianceService.getAllAudits().subscribe({ next: d => this.audits = d, error: () => {} });
  }

  get filteredRecords(): ComplianceRecordResponse[] {
    return this.recordFilter === 'ALL' ? this.records : this.records.filter(r => r.result === this.recordFilter);
  }

  get filteredAudits(): AuditResponse[] {
    return this.auditFilter === 'ALL' ? this.audits : this.audits.filter(a => a.status === this.auditFilter);
  }

  get passCount()       { return this.records.filter(r => r.result === 'COMPLIANT').length; }
  get failCount()       { return this.records.filter(r => r.result === 'NON_COMPLIANT').length; }
  get pendingCount()    { return this.records.filter(r => r.result === 'UNDER_REVIEW').length; }
  get completedAudits() { return this.audits.filter(a => a.status === 'COMPLETED').length; }
  get activeAudits()    { return this.audits.filter(a => a.status === 'IN_PROGRESS').length; }

  addRecord(): void {
    if (this.recordForm.invalid) return;
    const { entityId, type, result, notes } = this.recordForm.value;
    this.complianceService.createRecord({ entityId: entityId!, type: type!, result: result!, notes: notes! }).subscribe({
      next: () => { this.loadRecords(); this.recordForm.reset(); this.showRecordForm = false; this.snack.open('Record created', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed to create record', 'OK', { duration: 3000 })
    });
  }

  addAudit(): void {
    if (this.auditForm.invalid) return;
    const { scope, findings } = this.auditForm.value;
    this.complianceService.createAudit({ officerId: this.userId!, scope: scope!, findings: findings! }).subscribe({
      next: () => { this.loadAudits(); this.auditForm.reset(); this.showAuditForm = false; this.snack.open('Audit created', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed to create audit', 'OK', { duration: 3000 })
    });
  }

  updateAuditStatus(id: number, status: string): void {
    this.complianceService.updateAuditStatus(id, status).subscribe({
      next: () => { this.loadAudits(); this.snack.open('Status updated', 'OK', { duration: 2000 }); }
    });
  }

  resultIcon(result: string): string {
    return result === 'PASS' ? 'check_circle' : result === 'FAIL' ? 'cancel' : 'hourglass_empty';
  }

  auditIcon(status: string): string {
    const map: Record<string, string> = { PLANNED: 'event', IN_PROGRESS: 'pending', COMPLETED: 'verified', CANCELLED: 'block' };
    return map[status] ?? 'help';
  }
}
