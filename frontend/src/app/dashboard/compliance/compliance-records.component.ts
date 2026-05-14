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
import { ComplianceRecordResponse, ComplianceType, ComplianceResult } from '../../core/models/compliance.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-compliance-records',
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
        <div class="header-icon"><mat-icon>fact_check</mat-icon></div>
        <div>
          <h2>Compliance Records</h2>
          <p>Create and manage compliance inspection results</p>
        </div>
      </div>
      <button class="action-btn" (click)="showForm=!showForm">
        <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
        {{ showForm ? 'Cancel' : 'New Record' }}
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-chip compliant">   <mat-icon>check_circle</mat-icon>    Compliant {{ compliantCount }}</div>
      <div class="stat-chip noncompliant"><mat-icon>cancel</mat-icon>           Non-Compliant {{ nonCompliantCount }}</div>
      <div class="stat-chip review">      <mat-icon>hourglass_empty</mat-icon> Under Review {{ underReviewCount }}</div>
    </div>

    <!-- New Record Form -->
    <div class="form-panel" *ngIf="showForm">
      <div class="form-header"><mat-icon>fact_check</mat-icon><h3>New Compliance Record</h3></div>
      <form [formGroup]="recordForm" (ngSubmit)="addRecord()" class="form-body">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option *ngFor="let t of complianceTypes" [value]="t">{{ t }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="field">
          <mat-label>Result</mat-label>
          <mat-select formControlName="result">
            <mat-option *ngFor="let r of complianceResults" [value]="r">{{ r.replace('_',' ') }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="field wide">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="Inspection notes..."></textarea>
        </mat-form-field>
        <div class="form-actions">
          <button type="submit" class="save-btn" [disabled]="recordForm.invalid"><mat-icon>save</mat-icon> Save</button>
          <button type="button" class="cancel-btn" (click)="showForm=false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Filter Chips -->
    <div class="filter-chips">
      <div class="chip"              [class.active]="filter==='ALL'"           (click)="filter='ALL'">All ({{ records.length }})</div>
      <div class="chip pass-chip"    [class.active]="filter==='COMPLIANT'"     (click)="filter='COMPLIANT'">Compliant</div>
      <div class="chip fail-chip"    [class.active]="filter==='NON_COMPLIANT'" (click)="filter='NON_COMPLIANT'">Non-Compliant</div>
      <div class="chip review-chip"  [class.active]="filter==='UNDER_REVIEW'"  (click)="filter='UNDER_REVIEW'">Under Review</div>
    </div>

    <!-- Records List -->
    <div class="section-card">
      <div class="item-list" *ngIf="filteredRecords.length > 0">
        <div class="item-row" *ngFor="let r of filteredRecords">
          <div class="item-icon" [ngClass]="r.result.toLowerCase()">
            <mat-icon>{{ r.result==='COMPLIANT' ? 'check_circle' : r.result==='NON_COMPLIANT' ? 'cancel' : 'hourglass_empty' }}</mat-icon>
          </div>
          <div class="item-info">
            <span class="item-title">{{ r.type }} — {{ r.result.replace('_',' ') }}</span>
            <span class="item-sub">{{ r.notes }}</span>
            <span class="item-meta"><mat-icon>calendar_today</mat-icon>{{ r.date | date:'mediumDate' }}</span>
          </div>
          <span class="pill" [ngClass]="r.result.toLowerCase()">{{ r.result.replace('_',' ') }}</span>
        </div>
      </div>
      <div class="empty-state" *ngIf="filteredRecords.length === 0">
        <mat-icon>fact_check</mat-icon><p>No compliance records yet</p>
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
    .stat-chip.compliant    { color:var(--color-success); } .stat-chip.compliant mat-icon { color:var(--color-success); }
    .stat-chip.noncompliant { color:var(--color-danger); }  .stat-chip.noncompliant mat-icon { color:var(--color-danger); }
    .stat-chip.review       { color:#7c3aed; }              .stat-chip.review mat-icon { color:#7c3aed; }

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
    .chip.pass-chip.active   { background:var(--color-success); border-color:var(--color-success); }
    .chip.fail-chip.active   { background:var(--color-danger); border-color:var(--color-danger); }
    .chip.review-chip.active { background:#7c3aed; border-color:#7c3aed; }

    .section-card { background:var(--bg-surface); border-radius:14px; border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm); overflow:hidden; }
    .item-list { display:flex; flex-direction:column; }
    .item-row { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--border-subtle); transition:background 0.15s; }
    .item-row:last-child { border-bottom:none; }
    .item-row:hover { background:var(--bg-muted); }
    .item-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .item-icon mat-icon { font-size:22px; width:22px; height:22px; color:white; }
    .item-icon.compliant     { background:linear-gradient(135deg,#065f46,var(--color-success)); }
    .item-icon.non_compliant { background:linear-gradient(135deg,#7f1d1d,var(--color-danger)); }
    .item-icon.under_review  { background:linear-gradient(135deg,#5b21b6,#7c3aed); }
    .item-info { display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
    .item-title { font-size:14px; font-weight:700; color:var(--text-primary); }
    .item-sub { font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:500px; }
    .item-meta { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--color-primary); font-weight:500; }
    .item-meta mat-icon { font-size:13px; width:13px; height:13px; }
    .pill { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; flex-shrink:0; }
    .pill.compliant     { background:rgba(16,185,129,0.12); color:var(--color-success); }
    .pill.non_compliant { background:rgba(239,68,68,0.12); color:var(--color-danger); }
    .pill.under_review  { background:rgba(124,58,237,0.12); color:#7c3aed; }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:56px; }
    .empty-state mat-icon { font-size:56px; width:56px; height:56px; color:var(--color-primary); opacity:0.35; }
    .empty-state p { font-size:15px; color:var(--text-muted); margin:0; }
  `]
})
export class ComplianceRecordsComponent implements OnInit {
  records: ComplianceRecordResponse[] = [];
  filter = 'ALL';
  showForm = false;

  complianceTypes: ComplianceType[] = ['INCIDENT', 'TRANSPORT'];
  complianceResults: ComplianceResult[] = ['COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW'];

  recordForm = this.fb.group({
    type:   ['' as ComplianceType, Validators.required],
    result: ['' as ComplianceResult, Validators.required],
    notes:  ['', Validators.required]
  });

  constructor(private complianceService: ComplianceService, private auth: AuthService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.complianceService.getAllRecords().subscribe({ next: d => this.records = d });
  }

  get filteredRecords() { return this.filter === 'ALL' ? this.records : this.records.filter(r => r.result === this.filter); }
  get compliantCount()    { return this.records.filter(r => r.result === 'COMPLIANT').length; }
  get nonCompliantCount() { return this.records.filter(r => r.result === 'NON_COMPLIANT').length; }
  get underReviewCount()  { return this.records.filter(r => r.result === 'UNDER_REVIEW').length; }

  addRecord(): void {
    if (this.recordForm.invalid) return;
    const { type, result, notes } = this.recordForm.value;
    this.complianceService.createRecord({ entityId: 0, type: type!, result: result!, notes: notes! }).subscribe({
      next: () => { this.complianceService.getAllRecords().subscribe(d => this.records = d); this.recordForm.reset(); this.showForm = false; this.snack.open('Record created', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed', 'OK', { duration: 3000 })
    });
  }
}
