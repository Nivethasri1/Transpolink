import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TrafficService } from '../../core/services/traffic.service';
import { RoadSegmentResponse, TrafficFlowResponse } from '../../core/models/traffic.model';

@Component({
  selector: 'app-traffic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="dashboard">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-left">
          <div class="hero-icon"><mat-icon>traffic</mat-icon></div>
          <div>
            <h1>Traffic Officer Dashboard</h1>
            <p>Monitor roads, record flows, manage incidents</p>
          </div>
        </div>
        <div class="hero-badge"><mat-icon>verified_user</mat-icon> Traffic Officer</div>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card teal">
          <div class="kpi-icon"><mat-icon>map</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{segments.length}}</div>
            <div class="kpi-label">Total Segments</div>
          </div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon"><mat-icon>check_circle</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{openCount}}</div>
            <div class="kpi-label">Open</div>
          </div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-icon"><mat-icon>warning</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{congestedCount}}</div>
            <div class="kpi-label">Congested</div>
          </div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-icon"><mat-icon>construction</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{closedCount + maintenanceCount}}</div>
            <div class="kpi-label">Closed / Maintenance</div>
          </div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-icon"><mat-icon>show_chart</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{flows.length}}</div>
            <div class="kpi-label">Flow Records</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Donut: Segment Status -->
        <div class="chart-card">
          <div class="chart-title"><mat-icon>donut_large</mat-icon> Segment Status Breakdown</div>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-muted)" stroke-width="18"/>
              <ng-container *ngFor="let seg of donutSegments">
                <circle cx="60" cy="60" r="50" fill="none"
                  [attr.stroke]="seg.color" stroke-width="18"
                  [attr.stroke-dasharray]="seg.dash + ' ' + seg.gap"
                  [attr.stroke-dashoffset]="seg.offset"
                  stroke-linecap="butt"/>
              </ng-container>
              <text x="60" y="55" text-anchor="middle" class="donut-center-val">{{segments.length}}</text>
              <text x="60" y="70" text-anchor="middle" class="donut-center-lbl">Segments</text>
            </svg>
            <div class="donut-legend">
              <div class="legend-item" *ngFor="let seg of donutSegments">
                <span class="legend-dot" [style.background]="seg.color"></span>
                <span class="legend-label">{{seg.label}}</span>
                <span class="legend-val">{{seg.count}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bar: Traffic Flow Status -->
        <div class="chart-card">
          <div class="chart-title"><mat-icon>bar_chart</mat-icon> Traffic Flow Conditions</div>
          <div class="bar-chart">
            <ng-container *ngFor="let bar of flowBars">
              <div class="bar-row">
                <div class="bar-label">{{bar.label}}</div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width]="bar.pct + '%'" [style.background]="bar.color"></div>
                </div>
                <div class="bar-count">{{bar.count}}</div>
              </div>
            </ng-container>
            <p class="no-data" *ngIf="flows.length === 0">No flow data yet</p>
          </div>
        </div>

        <!-- Sparkline: Top congested segments -->
        <div class="chart-card">
          <div class="chart-title"><mat-icon>location_on</mat-icon> Segment Health</div>
          <div class="health-list">
            <div class="health-item" *ngFor="let s of topSegments">
              <div class="health-name">{{s.location}}</div>
              <div class="health-bar-wrap">
                <div class="health-bar" [style.width]="s.pct + '%'" [style.background]="s.color"></div>
              </div>
              <span class="health-pill" [style.background]="s.bg" [style.color]="s.color">{{s.status}}</span>
            </div>
            <p class="no-data" *ngIf="segments.length === 0">No segments yet</p>
          </div>
        </div>
      </div>

      <!-- Nav Grid -->
      <div class="nav-grid">
        <a routerLink="/traffic/roads" class="nav-card roads">
          <div class="card-top">
            <div class="card-icon"><mat-icon>map</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Road Segments</div>
          <div class="card-desc">View and update road segment statuses</div>
          <div class="card-tag">Monitoring</div>
        </a>
        <a routerLink="/traffic/flows" class="nav-card flows">
          <div class="card-top">
            <div class="card-icon"><mat-icon>show_chart</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Traffic Flows</div>
          <div class="card-desc">Record and monitor traffic flow data</div>
          <div class="card-tag">Analytics</div>
        </a>
        <a routerLink="/incidents" class="nav-card incident">
          <div class="card-top">
            <div class="card-icon"><mat-icon>report_problem</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Incidents</div>
          <div class="card-desc">Manage and resolve road incidents</div>
          <div class="card-tag">Response</div>
        </a>
        <a routerLink="/notifications" class="nav-card notif">
          <div class="card-top">
            <div class="card-icon"><mat-icon>notifications</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Notifications</div>
          <div class="card-desc">Stay updated with latest alerts</div>
          <div class="card-tag">Alerts</div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display:flex; flex-direction:column; gap:24px; }

    /* Hero */
    .hero { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:linear-gradient(135deg,#0B2A35,#0D3D4A,#0F4D5C); border-radius:20px; padding:28px 34px; box-shadow:0 8px 32px rgba(13,148,136,0.25); position:relative; overflow:hidden; }
    .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 85% 50%,rgba(13,148,136,0.18) 0%,transparent 55%); }
    .hero-left { display:flex; align-items:center; gap:18px; position:relative; }
    .hero-icon { width:60px; height:60px; border-radius:18px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; }
    .hero-icon mat-icon { font-size:32px; width:32px; height:32px; color:var(--color-primary); }
    h1 { font-size:22px; font-weight:800; color:white; margin:0 0 5px; position:relative; }
    p  { font-size:13px; color:rgba(255,255,255,0.6); margin:0; position:relative; }
    .hero-badge { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:9px 18px; font-size:13px; font-weight:600; color:white; position:relative; }
    .hero-badge mat-icon { font-size:16px; width:16px; height:16px; color:var(--color-primary); }

    /* KPI Row */
    .kpi-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; }
    .kpi-card { display:flex; align-items:center; gap:14px; padding:18px 20px; border-radius:16px; background:var(--bg-surface); border:1.5px solid var(--border-subtle); box-shadow:var(--shadow-sm); transition:all 0.2s; }
    .kpi-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
    .kpi-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .kpi-icon mat-icon { font-size:24px; width:24px; height:24px; }
    .kpi-value { font-size:26px; font-weight:800; line-height:1; }
    .kpi-label { font-size:11px; color:var(--text-muted); font-weight:600; margin-top:3px; text-transform:uppercase; letter-spacing:0.5px; }
    .kpi-card.teal .kpi-icon { background:rgba(13,148,136,0.12); } .kpi-card.teal .kpi-icon mat-icon { color:var(--color-primary); } .kpi-card.teal .kpi-value { color:var(--color-primary); }
    .kpi-card.green .kpi-icon { background:rgba(16,185,129,0.12); } .kpi-card.green .kpi-icon mat-icon { color:var(--color-success); } .kpi-card.green .kpi-value { color:var(--color-success); }
    .kpi-card.amber .kpi-icon { background:rgba(245,158,11,0.12); } .kpi-card.amber .kpi-icon mat-icon { color:var(--color-secondary); } .kpi-card.amber .kpi-value { color:var(--color-secondary-dark); }
    .kpi-card.red .kpi-icon { background:rgba(239,68,68,0.12); } .kpi-card.red .kpi-icon mat-icon { color:var(--color-danger); } .kpi-card.red .kpi-value { color:var(--color-danger); }
    .kpi-card.blue .kpi-icon { background:rgba(37,99,235,0.12); } .kpi-card.blue .kpi-icon mat-icon { color:#2563eb; } .kpi-card.blue .kpi-value { color:#2563eb; }

    /* Charts Row */
    .charts-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
    @media(max-width:900px) { .charts-row { grid-template-columns:1fr; } }
    .chart-card { background:var(--bg-surface); border:1.5px solid var(--border-subtle); border-radius:16px; padding:20px; box-shadow:var(--shadow-sm); }
    .chart-title { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:18px; text-transform:uppercase; letter-spacing:0.5px; }
    .chart-title mat-icon { font-size:18px; width:18px; height:18px; color:var(--color-primary); }

    /* Donut */
    .donut-wrap { display:flex; align-items:center; gap:20px; }
    .donut-svg { width:110px; height:110px; flex-shrink:0; transform:rotate(-90deg); }
    .donut-center-val { font-size:18px; font-weight:800; fill:var(--text-primary); transform:rotate(90deg); transform-origin:60px 60px; }
    .donut-center-lbl { font-size:8px; fill:var(--text-muted); transform:rotate(90deg); transform-origin:60px 60px; }
    .donut-legend { display:flex; flex-direction:column; gap:8px; flex:1; }
    .legend-item { display:flex; align-items:center; gap:8px; font-size:12px; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .legend-label { flex:1; color:var(--text-secondary); }
    .legend-val { font-weight:700; color:var(--text-primary); }

    /* Bar chart */
    .bar-chart { display:flex; flex-direction:column; gap:14px; }
    .bar-row { display:flex; align-items:center; gap:10px; }
    .bar-label { width:80px; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; flex-shrink:0; }
    .bar-track { flex:1; height:10px; background:var(--bg-muted); border-radius:6px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:6px; transition:width 0.6s ease; }
    .bar-count { width:28px; text-align:right; font-size:12px; font-weight:700; color:var(--text-primary); }

    /* Health list */
    .health-list { display:flex; flex-direction:column; gap:12px; }
    .health-item { display:flex; align-items:center; gap:10px; }
    .health-name { width:90px; font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:0; }
    .health-bar-wrap { flex:1; height:8px; background:var(--bg-muted); border-radius:4px; overflow:hidden; }
    .health-bar { height:100%; border-radius:4px; transition:width 0.6s ease; }
    .health-pill { font-size:9px; font-weight:700; padding:2px 8px; border-radius:10px; text-transform:uppercase; white-space:nowrap; flex-shrink:0; }

    /* Nav Grid */
    .nav-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
    .nav-card { display:flex; flex-direction:column; gap:10px; padding:22px 22px 18px; border-radius:18px; text-decoration:none; cursor:pointer; transition:all 0.25s ease; background:var(--bg-surface); border:1.5px solid var(--border-subtle); box-shadow:var(--shadow-sm); position:relative; overflow:hidden; }
    .nav-card::before { content:''; position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; opacity:0.06; transition:opacity 0.25s; }
    .nav-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); }
    .nav-card:hover::before { opacity:0.12; }
    .card-top { display:flex; align-items:center; justify-content:space-between; }
    .card-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; transition:all 0.25s; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .card-icon mat-icon { font-size:26px; width:26px; height:26px; transition:color 0.25s; }
    .arrow { font-size:20px; width:20px; height:20px; opacity:0; transform:translateX(-6px); transition:all 0.25s; }
    .nav-card:hover .arrow { opacity:1; transform:translateX(0); }
    .card-label { font-size:16px; font-weight:700; transition:color 0.25s; }
    .card-desc  { font-size:12px; line-height:1.5; transition:color 0.25s; color:var(--text-muted); }
    .card-tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; width:fit-content; transition:all 0.25s; }
    .nav-card:hover .card-label, .nav-card:hover .card-desc { color:white; }
    .nav-card:hover .card-icon { background:rgba(255,255,255,0.18) !important; box-shadow:none; }
    .nav-card:hover .card-icon mat-icon { color:white !important; }
    .nav-card:hover .card-tag { background:rgba(255,255,255,0.2); color:white; }
    .nav-card:hover .arrow { color:white; }

    .nav-card.roads { border-color:rgba(13,148,136,0.2); }
    .nav-card.roads::before { background:var(--color-primary); }
    .nav-card.roads .card-icon { background:rgba(13,148,136,0.12); }
    .nav-card.roads .card-icon mat-icon { color:var(--color-primary); }
    .nav-card.roads .card-label { color:var(--color-primary); }
    .nav-card.roads .card-tag { background:rgba(13,148,136,0.1); color:var(--color-primary); }
    .nav-card.roads .arrow { color:var(--color-primary); }
    .nav-card.roads:hover { background:linear-gradient(135deg,#0B2A35,var(--color-primary)); border-color:var(--color-primary); }

    .nav-card.flows { border-color:rgba(245,158,11,0.2); }
    .nav-card.flows::before { background:var(--color-secondary); }
    .nav-card.flows .card-icon { background:rgba(245,158,11,0.12); }
    .nav-card.flows .card-icon mat-icon { color:var(--color-secondary); }
    .nav-card.flows .card-label { color:var(--color-secondary-dark); }
    .nav-card.flows .card-tag { background:rgba(245,158,11,0.1); color:var(--color-secondary-dark); }
    .nav-card.flows .arrow { color:var(--color-secondary); }
    .nav-card.flows:hover { background:linear-gradient(135deg,#451a03,var(--color-secondary-dark)); border-color:var(--color-secondary-dark); }

    .nav-card.incident { border-color:rgba(239,68,68,0.2); }
    .nav-card.incident::before { background:var(--color-danger); }
    .nav-card.incident .card-icon { background:rgba(239,68,68,0.1); }
    .nav-card.incident .card-icon mat-icon { color:var(--color-danger); }
    .nav-card.incident .card-label { color:var(--color-danger); }
    .nav-card.incident .card-tag { background:rgba(239,68,68,0.1); color:var(--color-danger); }
    .nav-card.incident .arrow { color:var(--color-danger); }
    .nav-card.incident:hover { background:linear-gradient(135deg,#7f1d1d,var(--color-danger)); border-color:var(--color-danger); }

    .nav-card.notif { border-color:rgba(37,99,235,0.2); }
    .nav-card.notif::before { background:#2563eb; }
    .nav-card.notif .card-icon { background:rgba(37,99,235,0.1); }
    .nav-card.notif .card-icon mat-icon { color:#2563eb; }
    .nav-card.notif .card-label { color:#2563eb; }
    .nav-card.notif .card-tag { background:rgba(37,99,235,0.1); color:#2563eb; }
    .nav-card.notif .arrow { color:#2563eb; }
    .nav-card.notif:hover { background:linear-gradient(135deg,#1e3a5f,#2563eb); border-color:#2563eb; }

    .no-data { color:var(--text-muted); font-size:13px; text-align:center; padding:20px 0; }
  `]
})
export class TrafficDashboardComponent implements OnInit {
  segments: RoadSegmentResponse[] = [];
  flows: TrafficFlowResponse[] = [];

  constructor(private trafficService: TrafficService) {}

  ngOnInit(): void {
    this.trafficService.getAllSegments().subscribe(d => this.segments = d);
    this.trafficService.getAllFlows().subscribe(d => this.flows = d);
  }

  get openCount()        { return this.segments.filter(s => s.status === 'OPEN').length; }
  get congestedCount()   { return this.segments.filter(s => s.status === 'CONGESTED').length; }
  get closedCount()      { return this.segments.filter(s => s.status === 'CLOSED').length; }
  get maintenanceCount() { return this.segments.filter(s => s.status === 'UNDER_MAINTENANCE').length; }

  get donutSegments() {
    const total = this.segments.length || 1;
    const circumference = 2 * Math.PI * 50; // r=50
    const items = [
      { label: 'Open',        count: this.openCount,        color: '#10b981' },
      { label: 'Congested',   count: this.congestedCount,   color: '#f59e0b' },
      { label: 'Closed',      count: this.closedCount,      color: '#ef4444' },
      { label: 'Maintenance', count: this.maintenanceCount, color: '#6366f1' },
    ];
    let offset = 0;
    return items.map(item => {
      const dash = (item.count / total) * circumference;
      const seg = { ...item, dash, gap: circumference - dash, offset: -offset };
      offset += dash;
      return seg;
    });
  }

  get flowBars() {
    const total = this.flows.length || 1;
    return [
      { label: 'Normal',     count: this.flows.filter(f => f.status === 'NORMAL').length,     color: '#10b981' },
      { label: 'Slow',       count: this.flows.filter(f => f.status === 'SLOW').length,       color: '#f59e0b' },
      { label: 'Heavy',      count: this.flows.filter(f => f.status === 'HEAVY').length,      color: '#f97316' },
      { label: 'Standstill', count: this.flows.filter(f => f.status === 'STANDSTILL').length, color: '#ef4444' },
    ].map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }));
  }

  get topSegments() {
    const colorMap: Record<string, { color: string; bg: string }> = {
      OPEN:              { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      CONGESTED:         { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      CLOSED:            { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      UNDER_MAINTENANCE: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    };
    const pctMap: Record<string, number> = { OPEN: 100, CONGESTED: 60, CLOSED: 20, UNDER_MAINTENANCE: 40 };
    return this.segments.slice(0, 6).map(s => ({
      location: s.location,
      status: s.status.replace('_', ' '),
      pct: pctMap[s.status] ?? 50,
      color: colorMap[s.status]?.color ?? '#6b7280',
      bg: colorMap[s.status]?.bg ?? 'rgba(107,114,128,0.12)',
    }));
  }
}
