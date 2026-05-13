import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-traffic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="dashboard">
      <div class="welcome">
        <h2>Traffic Officer Dashboard</h2>
        <p>Manage road segments, monitor traffic flows, handle incidents and notifications</p>
      </div>
      <div class="nav-grid">
        <a routerLink="/traffic/roads" class="nav-card roads">
          <div class="card-icon"><mat-icon>map</mat-icon></div>
          <div class="card-label">Road Segments</div>
          <div class="card-desc">View and update road segment statuses</div>
          <mat-icon class="arrow">arrow_forward</mat-icon>
        </a>
        <a routerLink="/traffic/flows" class="nav-card flows">
          <div class="card-icon"><mat-icon>show_chart</mat-icon></div>
          <div class="card-label">Traffic Flows</div>
          <div class="card-desc">Record and monitor traffic flow data</div>
          <mat-icon class="arrow">arrow_forward</mat-icon>
        </a>
        <a routerLink="/incidents" class="nav-card incident">
          <div class="card-icon"><mat-icon>report_problem</mat-icon></div>
          <div class="card-label">Incidents</div>
          <div class="card-desc">Manage and resolve road incidents</div>
          <mat-icon class="arrow">arrow_forward</mat-icon>
        </a>
        <a routerLink="/notifications" class="nav-card notif">
          <div class="card-icon"><mat-icon>notifications</mat-icon></div>
          <div class="card-label">Notifications</div>
          <div class="card-desc">Stay updated with latest alerts</div>
          <mat-icon class="arrow">arrow_forward</mat-icon>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display:flex; flex-direction:column; gap:20px; }
    .welcome { background:linear-gradient(135deg,#40513B,#609966); border-radius:14px; padding:20px 28px; box-shadow:0 4px 20px rgba(64,81,59,0.3); }
    .welcome h2 { font-size:20px; font-weight:700; color:white; margin:0 0 4px; }
    .welcome p  { font-size:13px; color:rgba(255,255,255,0.75); margin:0; }
    .nav-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
    .nav-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:28px 20px; border-radius:16px; text-decoration:none; cursor:pointer; transition:all 0.25s ease; position:relative; border:2px solid transparent; }
    .nav-card:hover { transform:translateY(-6px); box-shadow:0 16px 40px rgba(0,0,0,0.15); }
    .card-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all 0.25s; box-shadow:0 4px 12px rgba(0,0,0,0.12); }
    .card-icon mat-icon { font-size:28px; width:28px; height:28px; color:white; }
    .card-label { font-size:15px; font-weight:700; text-align:center; transition:color 0.25s; }
    .card-desc  { font-size:12px; text-align:center; line-height:1.4; transition:color 0.25s; max-width:180px; }
    .arrow { font-size:20px; width:20px; height:20px; opacity:0; transform:translateX(-8px); transition:all 0.25s; color:white; }
    .nav-card:hover .arrow { opacity:1; transform:translateX(0); }

    .nav-card.roads { background:linear-gradient(135deg,#EDF1D6,#d4e6b5); border-color:#9DC08B; }
    .nav-card.roads:hover { background:linear-gradient(135deg,#40513B,#609966); border-color:#40513B; }
    .nav-card.roads .card-icon { background:#609966; }
    .nav-card.roads .card-label { color:#40513B; }
    .nav-card.roads .card-desc  { color:#609966; }
    .nav-card.roads:hover .card-label, .nav-card.roads:hover .card-desc { color:white; }
    .nav-card.roads:hover .card-icon { background:rgba(255,255,255,0.2); }

    .nav-card.flows { background:linear-gradient(135deg,#e3f2fd,#bbdefb); border-color:#90caf9; }
    .nav-card.flows:hover { background:linear-gradient(135deg,#1565c0,#1976d2); border-color:#1565c0; }
    .nav-card.flows .card-icon { background:#1976d2; }
    .nav-card.flows .card-label { color:#1565c0; }
    .nav-card.flows .card-desc  { color:#42a5f5; }
    .nav-card.flows:hover .card-label, .nav-card.flows:hover .card-desc { color:white; }
    .nav-card.flows:hover .card-icon { background:rgba(255,255,255,0.2); }

    .nav-card.incident { background:linear-gradient(135deg,#ffebee,#ffcdd2); border-color:#ef9a9a; }
    .nav-card.incident:hover { background:linear-gradient(135deg,#c62828,#e53935); border-color:#c62828; }
    .nav-card.incident .card-icon { background:#f44336; }
    .nav-card.incident .card-label { color:#c62828; }
    .nav-card.incident .card-desc  { color:#e57373; }
    .nav-card.incident:hover .card-label, .nav-card.incident:hover .card-desc { color:white; }
    .nav-card.incident:hover .card-icon { background:rgba(255,255,255,0.2); }

    .nav-card.notif { background:linear-gradient(135deg,#fff3e0,#ffe0b2); border-color:#ffcc80; }
    .nav-card.notif:hover { background:linear-gradient(135deg,#e65100,#f57c00); border-color:#e65100; }
    .nav-card.notif .card-icon { background:#ff9800; }
    .nav-card.notif .card-label { color:#e65100; }
    .nav-card.notif .card-desc  { color:#ffa726; }
    .nav-card.notif:hover .card-label, .nav-card.notif:hover .card-desc { color:white; }
    .nav-card.notif:hover .card-icon { background:rgba(255,255,255,0.2); }
  `]
})
export class TrafficDashboardComponent {}
