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

    .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:linear-gradient(135deg,#40513B,#609966); border-radius:16px; padding:24px 28px; box-shadow:0 4px 20px rgba(64,81,59,0.3); }
    .header-left { display:flex; align-items:center; gap:14px; }
    .back-btn { background:rgba(255,255,255,0.15); border:none; border-radius:10px; color:white; cursor:pointer; padding:8px; display:flex; align-items:center; text-decoration:none; transition:background 0.2s; }
    .back-btn:hover { background:rgba(255,255,255,0.25); }
    .header-icon { width:48px; height:48px; border-radius:13px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; }
    .header-icon mat-icon { font-size:26px; width:26px; height:26px; color:white; }
    h2 { font-size:20px; font-weight:700; color:white; margin:0 0 3px; }
    p { font-size:13px; color:rgba(255,255,255,0.75); margin:0; }
    .action-btn { display:flex; align-items:center; gap:8px; background:white; color:#40513B; border:none; border-radius:10px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
    .action-btn:hover { background:#EDF1D6; transform:translateY(-1px); }
    .action-btn mat-icon { font-size:18px; width:18px; height:18px; }

    .stats-row { display:flex; gap:12px; flex-wrap:wrap; }
    .stat-chip { display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; }
    .stat-chip mat-icon { font-size:18px; width:18px; height:18px; }
    .stat-chip.compliant    { background:#e8f5e9; color:#2e7d32; }
    .stat-chip.noncompliant { background:#ffebee; color:#c62828; }
    .stat-chip.review       { background:#f3e5f5; color:#6a1b9a; }

    .form-panel { background:white; border-radius:14px; border:2px solid #EDF1D6; box-shadow:0 4px 20px rgba(64,81,59,0.1); overflow:hidden; }
    .form-header { display:flex; align-items:center; gap:12px; padding:16px 20px; background:linear-gradient(135deg,#40513B,#609966); color:white; }
    .form-header mat-icon { color:rgba(255,255,255,0.9); }
    .form-header h3 { margin:0; font-size:16px; font-weight:600; }
    .form-body { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-start; padding:20px; }
    .field { min-width:180px; flex:1; }
    .field.wide { min-width:300px; flex:2; }
    .form-actions { display:flex; gap:10px; align-items:center; padding-top:4px; }
    .save-btn { display:flex; align-items:center; gap:8px; background:#40513B; color:white; border:none; border-radius:10px; padding:12px 22px; font-size:14px; font-weight:600; cursor:pointer; transition:background 0.2s; }
    .save-btn:hover:not(:disabled) { background:#609966; }
    .save-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .cancel-btn { background:none; border:1.5px solid #EDF1D6; border-radius:10px; padding:12px 18px; font-size:14px; color:#666; cursor:pointer; }
    .cancel-btn:hover { background:#f5f5f5; }

    .filter-chips { display:flex; gap:10px; flex-wrap:wrap; }
    .chip { padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; background:#f5f5f5; color:#666; border:2px solid transparent; }
    .chip:hover { background:#EDF1D6; color:#40513B; border-color:#9DC08B; }
    .chip.active { background:#40513B; color:white; border-color:#40513B; }
    .chip.pass-chip.active   { background:#2e7d32; border-color:#2e7d32; }
    .chip.fail-chip.active   { background:#c62828; border-color:#c62828; }
    .chip.review-chip.active { background:#6a1b9a; border-color:#6a1b9a; }

    .section-card { background:white; border-radius:14px; border:1px solid #EDF1D6; box-shadow:0 2px 12px rgba(64,81,59,0.08); overflow:hidden; }
    .item-list { display:flex; flex-direction:column; }
    .item-row { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
    .item-row:last-child { border-bottom:none; }
    .item-row:hover { background:#f8faf5; }
    .item-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .item-icon mat-icon { font-size:22px; width:22px; height:22px; color:white; }
    .item-icon.compliant     { background:linear-gradient(135deg,#2e7d32,#4caf50); }
    .item-icon.non_compliant { background:linear-gradient(135deg,#c62828,#f44336); }
    .item-icon.under_review  { background:linear-gradient(135deg,#6a1b9a,#9c27b0); }
    .item-info { display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
    .item-title { font-size:14px; font-weight:700; color:#333; }
    .item-sub { font-size:12px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:500px; }
    .item-meta { display:flex; align-items:center; gap:4px; font-size:11px; color:#9DC08B; font-weight:500; }
    .item-meta mat-icon { font-size:13px; width:13px; height:13px; }
    .pill { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; flex-shrink:0; }
    .pill.compliant     { background:#e8f5e9; color:#2e7d32; }
    .pill.non_compliant { background:#ffebee; color:#c62828; }
    .pill.under_review  { background:#f3e5f5; color:#6a1b9a; }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:56px; }
    .empty-state mat-icon { font-size:56px; width:56px; height:56px; color:#9DC08B; opacity:0.4; }
    .empty-state p { font-size:15px; color:#aaa; margin:0; }
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
