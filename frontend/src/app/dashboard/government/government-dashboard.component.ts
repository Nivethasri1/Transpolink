import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-government-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
  <div class="dashboard">
    <div class="welcome">
      <h2>Compliance Officer Portal</h2>
      <p>Monitor compliance records, manage audits, review reports and stay updated</p>
    </div>
    <div class="nav-grid">
      <a routerLink="/compliance/records" class="nav-card records">
        <div class="card-icon"><mat-icon>fact_check</mat-icon></div>
        <div class="card-label">Compliance Records</div>
        <div class="card-desc">Create and review compliance inspection results</div>
        <mat-icon class="arrow">arrow_forward</mat-icon>
      </a>
      <a routerLink="/compliance/audits" class="nav-card audits">
        <div class="card-icon"><mat-icon>manage_search</mat-icon></div>
        <div class="card-label">Audits</div>
        <div class="card-desc">Initiate and track regulatory audits</div>
        <mat-icon class="arrow">arrow_forward</mat-icon>
      </a>
      <a routerLink="/reports" class="nav-card reports">
        <div class="card-icon"><mat-icon>bar_chart</mat-icon></div>
        <div class="card-label">Reports</div>
        <div class="card-desc">View system-wide reports and analytics</div>
        <mat-icon class="arrow">arrow_forward</mat-icon>
      </a>
      <a routerLink="/notifications" class="nav-card notif">
        <div class="card-icon"><mat-icon>notifications</mat-icon></div>
        <div class="card-label">Notifications</div>
        <div class="card-desc">Stay updated with latest alerts and messages</div>
        <mat-icon class="arrow">arrow_forward</mat-icon>
      </a>
    </div>
  </div>
  `,
  styles: [`
    .dashboard { display:flex; flex-direction:column; gap:20px; }
    .welcome { background:linear-gradient(135deg,#40513B,#609966); border-radius:14px; padding:20px 28px; box-shadow:0 4px 20px rgba(64,81,59,0.3); }
    .welcome h2 { font-size:20px; font-weight:700; color:white; margin:0 0 4px; }
    .welcome p { font-size:13px; color:rgba(255,255,255,0.75); margin:0; }
    .nav-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
    .nav-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:32px 20px; border-radius:16px; text-decoration:none; cursor:pointer; transition:all 0.25s; position:relative; border:2px solid transparent; }
    .nav-card:hover { transform:translateY(-6px); box-shadow:0 16px 40px rgba(0,0,0,0.15); }
    .card-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all 0.25s; box-shadow:0 4px 12px rgba(0,0,0,0.12); }
    .card-icon mat-icon { font-size:28px; width:28px; height:28px; color:white; }
    .card-label { font-size:15px; font-weight:700; text-align:center; transition:color 0.25s; }
    .card-desc { font-size:12px; text-align:center; line-height:1.4; transition:color 0.25s; max-width:200px; }
    .arrow { font-size:20px; width:20px; height:20px; opacity:0; transform:translateX(-8px); transition:all 0.25s; color:white; }
    .nav-card:hover .arrow { opacity:1; transform:translateX(0); }
    .nav-card:hover .card-icon { background:rgba(255,255,255,0.2) !important; }
    .nav-card:hover .card-label, .nav-card:hover .card-desc { color:white; }

    .nav-card.records { background:linear-gradient(135deg,#EDF1D6,#d4e6b5); border-color:#9DC08B; }
    .nav-card.records:hover { background:linear-gradient(135deg,#40513B,#609966); border-color:#40513B; }
    .nav-card.records .card-icon { background:#609966; }
    .nav-card.records .card-label { color:#40513B; }
    .nav-card.records .card-desc { color:#609966; }

    .nav-card.audits { background:linear-gradient(135deg,#e0f2f1,#b2dfdb); border-color:#80cbc4; }
    .nav-card.audits:hover { background:linear-gradient(135deg,#004d40,#00695c); border-color:#004d40; }
    .nav-card.audits .card-icon { background:#009688; }
    .nav-card.audits .card-label { color:#004d40; }
    .nav-card.audits .card-desc { color:#00796b; }

    .nav-card.reports { background:linear-gradient(135deg,#e8f5e9,#c8e6c9); border-color:#a5d6a7; }
    .nav-card.reports:hover { background:linear-gradient(135deg,#2e7d32,#388e3c); border-color:#2e7d32; }
    .nav-card.reports .card-icon { background:#4caf50; }
    .nav-card.reports .card-label { color:#2e7d32; }
    .nav-card.reports .card-desc { color:#558b2f; }

    .nav-card.notif { background:linear-gradient(135deg,#e3f2fd,#bbdefb); border-color:#90caf9; }
    .nav-card.notif:hover { background:linear-gradient(135deg,#1565c0,#1976d2); border-color:#1565c0; }
    .nav-card.notif .card-icon { background:#1976d2; }
    .nav-card.notif .card-label { color:#1565c0; }
    .nav-card.notif .card-desc { color:#42a5f5; }
  `]
})
export class GovernmentDashboardComponent {}
