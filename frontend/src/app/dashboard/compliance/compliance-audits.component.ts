import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComplianceService } from '../../core/services/compliance.service';
import { AuditResponse, AuditStatus } from '../../core/models/compliance.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-compliance-audits',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule
  ],
  template: `
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <a routerLink="/government" class="back-btn"><mat-icon>arrow_back</mat-icon></a>
        <div class="header-icon"><mat-icon>manage_search</mat-icon></div>
        <div>
          <h2>Audits</h2>
          <p>Initiate and track regulatory compliance audits</p>
        </div>
      </div>
      <button class="action-btn" (click)="showForm=!showForm">
        <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
        {{ showForm ? 'Cancel' : 'New Audit' }}
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-chip planned">    <mat-icon>event</mat-icon>       Planned {{ countBy('PLANNED') }}</div>
      <div class="stat-chip progress">   <mat-icon>pending</mat-icon>      In Progress {{ countBy('IN_PROGRESS') }}</div>
      <div class="stat-chip completed">  <mat-icon>verified</mat-icon>     Completed {{ countBy('COMPLETED') }}</div>
      <div class="stat-chip cancelled">  <mat-icon>block</mat-icon>        Cancelled {{ countBy('CANCELLED') }}</div>
    </div>

    <!-- New Audit Form -->
    <div class="form-panel" *ngIf="showForm">
      <div class="form-header"><mat-icon>manage_search</mat-icon><h3>New Audit</h3></div>
      <form [formGroup]="auditForm" (ngSubmit)="addAudit()" class="form-body">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Scope</mat-label>
          <input matInput formControlName="scope" placeholder="e.g. Fleet Safety Q1" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="field wide">
          <mat-label>Findings</mat-label>
          <textarea matInput formControlName="findings" rows="2" placeholder="Describe findings..."></textarea>
        </mat-form-field>
        <div class="form-actions">
          <button type="submit" class="save-btn" [disabled]="auditForm.invalid"><mat-icon>save</mat-icon> Save</button>
          <button type="button" class="cancel-btn" (click)="showForm=false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Filter Chips -->
    <div class="filter-chips">
      <div class="chip"               [class.active]="filter==='ALL'"         (click)="filter='ALL'">All ({{ audits.length }})</div>
      <div class="chip planned-chip"  [class.active]="filter==='PLANNED'"     (click)="filter='PLANNED'">Planned</div>
      <div class="chip progress-chip" [class.active]="filter==='IN_PROGRESS'" (click)="filter='IN_PROGRESS'">In Progress</div>
      <div class="chip done-chip"     [class.active]="filter==='COMPLETED'"   (click)="filter='COMPLETED'">Completed</div>
      <div class="chip cancel-chip"   [class.active]="filter==='CANCELLED'"   (click)="filter='CANCELLED'">Cancelled</div>
    </div>

    <!-- Audits List -->
    <div class="section-card">
      <div class="item-list" *ngIf="filteredAudits.length > 0">
        <div class="item-row" *ngFor="let a of filteredAudits">
          <div class="item-icon" [ngClass]="a.status.toLowerCase()">
            <mat-icon>{{ a.status==='PLANNED' ? 'event' : a.status==='IN_PROGRESS' ? 'pending' : a.status==='COMPLETED' ? 'verified' : 'block' }}</mat-icon>
          </div>
          <div class="item-info">
            <span class="item-title">{{ a.scope }}</span>
            <span class="item-sub">{{ a.findings || 'No findings recorded' }}</span>
            <span class="item-meta">
              <mat-icon>person</mat-icon>Officer #{{ a.officerId }}
              <mat-icon>calendar_today</mat-icon>{{ a.date | date:'mediumDate' }}
            </span>
          </div>
          <div class="item-right">
            <span class="status-pill" [ngClass]="a.status.toLowerCase()">{{ a.status.replace('_',' ') }}</span>
            <mat-select class="status-select" placeholder="Update" (selectionChange)="updateStatus(a.auditId, $event.value)">
              <mat-option *ngFor="let s of auditStatuses" [value]="s">{{ s.replace('_',' ') }}</mat-option>
            </mat-select>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="filteredAudits.length === 0">
        <mat-icon>manage_search</mat-icon><p>No audits found</p>
      </div>
    </div>

  </div>
  `,
  styles: [`
    .page { display:flex; flex-direction:column; gap:20px; }

    .page { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:linear-gradient(135deg,#0B2A35,#0D3D4A,#0F4D5C); border-radius:16px; padding:24px 28px; box-shadow:0 4px 24px rgba(13,148,136,0.18); }
    .header-left { display:flex; align-items:center; gap:14px; }
    .back-btn { background:rgba(255,255,255,0.12); border:none; border-radius:10px; color:white; cursor:pointer; padding:8px; display:flex; align-items:center; text-decoration:none; transition:background 0.2s; }
    .back-btn:hover { background:rgba(255,255,255,0.22); }
    .header-icon { width:48px; height:48px; border-radius:13px; background:rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1); }
    .header-icon mat-icon { font-size:26px; width:26px; height:26px; color:var(--color-primary); }
    h2 { font-size:20px; font-weight:700; color:white; margin:0 0 3px; }
    p { font-size:13px; color:rgba(255,255,255,0.65); margin:0; }
    .action-btn { display:flex; align-items:center; gap:8px; background:white; color:#0B2A35; border:none; border-radius:10px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
    .action-btn:hover { background:var(--color-primary-light); transform:translateY(-1px); }
    .action-btn mat-icon { font-size:18px; width:18px; height:18px; }

    .stats-row { display:flex; gap:12px; flex-wrap:wrap; }
    .stat-chip { display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; background:var(--bg-surface); border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm); }
    .stat-chip mat-icon { font-size:18px; width:18px; height:18px; }
    .stat-chip.planned   { color:var(--color-primary); }        .stat-chip.planned mat-icon   { color:var(--color-primary); }
    .stat-chip.progress  { color:var(--color-secondary-dark); } .stat-chip.progress mat-icon  { color:var(--color-secondary); }
    .stat-chip.completed { color:var(--color-success); }        .stat-chip.completed mat-icon { color:var(--color-success); }
    .stat-chip.cancelled { color:var(--text-muted); }           .stat-chip.cancelled mat-icon { color:var(--text-muted); }

    .form-panel { background:var(--bg-surface); border-radius:14px; border:1px solid var(--border-color); box-shadow:var(--shadow-md); overflow:hidden; }
    .form-header { display:flex; align-items:center; gap:12px; padding:16px 20px; background:linear-gradient(135deg,#0B2A35,#0D3D4A); color:white; }
    .form-header mat-icon { color:var(--color-primary); }
    .form-header h3 { margin:0; font-size:16px; font-weight:600; color:white; }
    .form-body { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-start; padding:20px; background:var(--bg-surface); }
    .field { min-width:180px; flex:1; }
    .field.wide { min-width:300px; flex:2; }
    .form-actions { display:flex; gap:10px; align-items:center; padding-top:4px; }
    .save-btn { display:flex; align-items:center; gap:8px; background:var(--color-primary); color:white; border:none; border-radius:10px; padding:12px 22px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 12px var(--color-primary-glow); }
    .save-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
    .save-btn:disabled { opacity:0.45; cursor:not-allowed; }
    .cancel-btn { background:none; border:1.5px solid var(--border-color); border-radius:10px; padding:12px 18px; font-size:14px; color:var(--text-muted); cursor:pointer; transition:all 0.2s; }
    .cancel-btn:hover { background:var(--bg-muted); color:var(--text-primary); }

    .filter-chips { display:flex; gap:10px; flex-wrap:wrap; }
    .chip { padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; background:var(--bg-surface); color:var(--text-muted); border:1.5px solid var(--border-color); }
    .chip:hover { border-color:var(--color-primary); color:var(--color-primary); }
    .chip.active { background:var(--color-primary); color:white; border-color:var(--color-primary); }
    .chip.planned-chip.active  { background:var(--color-primary-dark); border-color:var(--color-primary-dark); }
    .chip.progress-chip.active { background:var(--color-secondary-dark); border-color:var(--color-secondary-dark); }
    .chip.done-chip.active     { background:var(--color-success); border-color:var(--color-success); }
    .chip.cancel-chip.active   { background:var(--text-muted); border-color:var(--text-muted); }

    .section-card { background:var(--bg-surface); border-radius:14px; border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm); overflow:hidden; }
    .item-list { display:flex; flex-direction:column; }
    .item-row { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--border-subtle); transition:background 0.15s; }
    .item-row:last-child { border-bottom:none; }
    .item-row:hover { background:var(--bg-muted); }
    .item-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .item-icon mat-icon { font-size:22px; width:22px; height:22px; color:white; }
    .item-icon.planned     { background:linear-gradient(135deg,#0B2A35,var(--color-primary)); }
    .item-icon.in_progress { background:linear-gradient(135deg,#451a03,var(--color-secondary-dark)); }
    .item-icon.completed   { background:linear-gradient(135deg,#065f46,var(--color-success)); }
    .item-icon.cancelled   { background:linear-gradient(135deg,#374151,#6b7280); }
    .item-info { display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
    .item-title { font-size:14px; font-weight:700; color:var(--text-primary); }
    .item-sub { font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:500px; }
    .item-meta { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--color-primary); font-weight:500; }
    .item-meta mat-icon { font-size:13px; width:13px; height:13px; }
    .item-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
    .status-pill { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; white-space:nowrap; }
    .status-pill.planned     { background:var(--color-primary-light); color:var(--color-primary-dark); }
    .status-pill.in_progress { background:rgba(245,158,11,0.12); color:var(--color-secondary-dark); }
    .status-pill.completed   { background:rgba(16,185,129,0.12); color:var(--color-success); }
    .status-pill.cancelled   { background:var(--bg-muted); color:var(--text-muted); }
    .status-select { font-size:12px; width:130px; }

    ::ng-deep .mat-mdc-select-value,
    ::ng-deep .mat-mdc-select-placeholder,
    ::ng-deep .mat-mdc-select-arrow { color: var(--text-primary) !important; }
    ::ng-deep .mat-mdc-select-panel { background: var(--bg-surface) !important; border: 1px solid var(--border-color) !important; }
    ::ng-deep .mat-mdc-option .mdc-list-item__primary-text { color: var(--text-primary) !important; }
    ::ng-deep .mat-mdc-option:hover:not(.mdc-list-item--disabled) { background: var(--bg-muted) !important; }
    ::ng-deep .mat-mdc-option.mdc-list-item--selected .mdc-list-item__primary-text { color: var(--color-primary) !important; }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:56px; }
    .empty-state mat-icon { font-size:56px; width:56px; height:56px; color:var(--color-primary); opacity:0.35; }
    .empty-state p { font-size:15px; color:var(--text-muted); margin:0; }
  `]
})
export class ComplianceAuditsComponent implements OnInit {
  audits: AuditResponse[] = [];
  filter = 'ALL';
  showForm = false;
  userId: number | null = null;
  auditStatuses: AuditStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  auditForm = this.fb.group({
    scope:    ['', Validators.required],
    findings: ['', Validators.required]
  });

  constructor(private complianceService: ComplianceService, private auth: AuthService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.load();
  }

  load(): void {
    this.complianceService.getAllAudits().subscribe({ next: d => this.audits = d });
  }

  get filteredAudits() {
    return this.filter === 'ALL' ? this.audits : this.audits.filter(a => a.status === this.filter);
  }

  countBy(status: string): number { return this.audits.filter(a => a.status === status).length; }

  addAudit(): void {
    if (this.auditForm.invalid) return;
    const { scope, findings } = this.auditForm.value;
    this.complianceService.createAudit({ officerId: this.userId!, scope: scope!, findings: findings! }).subscribe({
      next: () => { this.load(); this.auditForm.reset(); this.showForm = false; this.snack.open('Audit created', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed', 'OK', { duration: 3000 })
    });
  }

  updateStatus(id: number, status: string): void {
    this.complianceService.updateAuditStatus(id, status).subscribe({ next: () => this.load() });
  }
}
