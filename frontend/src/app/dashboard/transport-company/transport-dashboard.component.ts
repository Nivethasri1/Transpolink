import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TransportService } from '../../core/services/transport.service';
import { RouteResponse, FleetResponse, ScheduleResponse } from '../../core/models/transport.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transport-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="dashboard">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-left">
          <div class="hero-icon"><mat-icon>directions_bus</mat-icon></div>
          <div>
            <h1>Transport Operator Dashboard</h1>
            <p>Manage routes, fleet vehicles and schedules</p>
          </div>
        </div>
        <div class="hero-badge"><mat-icon>local_shipping</mat-icon> Transport Operator</div>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi-card teal">
          <div class="kpi-icon"><mat-icon>route</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{routes.length}}</div>
            <div class="kpi-label">Total Routes</div>
          </div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon"><mat-icon>check_circle</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{activeRoutes}}</div>
            <div class="kpi-label">Active Routes</div>
          </div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-icon"><mat-icon>directions_bus</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{fleets.length}}</div>
            <div class="kpi-label">Fleet Vehicles</div>
          </div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-icon"><mat-icon>local_parking</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{availableFleet}}</div>
            <div class="kpi-label">Available</div>
          </div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-icon"><mat-icon>schedule</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-value">{{schedules.length}}</div>
            <div class="kpi-label">Schedules</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Fleet Status Donut -->
        <div class="chart-card">
          <div class="chart-title"><mat-icon>donut_large</mat-icon> Fleet Status</div>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-muted)" stroke-width="18"/>
              <ng-container *ngFor="let seg of fleetDonut">
                <circle cx="60" cy="60" r="50" fill="none"
                  [attr.stroke]="seg.color" stroke-width="18"
                  [attr.stroke-dasharray]="seg.dash + ' ' + seg.gap"
                  [attr.stroke-dashoffset]="seg.offset"
                  stroke-linecap="butt"/>
              </ng-container>
              <text x="60" y="55" text-anchor="middle" class="donut-center-val">{{fleets.length}}</text>
              <text x="60" y="70" text-anchor="middle" class="donut-center-lbl">Vehicles</text>
            </svg>
            <div class="donut-legend">
              <div class="legend-item" *ngFor="let seg of fleetDonut">
                <span class="legend-dot" [style.background]="seg.color"></span>
                <span class="legend-label">{{seg.label}}</span>
                <span class="legend-val">{{seg.count}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Route Type + Status Bars -->
        <div class="chart-card">
          <div class="chart-title"><mat-icon>bar_chart</mat-icon> Route Breakdown</div>
          <div class="bar-section-label">By Type</div>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let b of routeTypeBars">
              <div class="bar-label">{{b.label}}</div>
              <div class="bar-track"><div class="bar-fill" [style.width]="b.pct + '%'" [style.background]="b.color"></div></div>
              <div class="bar-count">{{b.count}}</div>
            </div>
          </div>
          <div class="bar-section-label" style="margin-top:16px">By Status</div>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let b of routeStatusBars">
              <div class="bar-label">{{b.label}}</div>
              <div class="bar-track"><div class="bar-fill" [style.width]="b.pct + '%'" [style.background]="b.color"></div></div>
              <div class="bar-count">{{b.count}}</div>
            </div>
          </div>
          <p class="no-data" *ngIf="routes.length === 0">No routes yet</p>
        </div>

        <!-- Schedule Status Stacked -->
        <div class="chart-card">
          <div class="chart-title"><mat-icon>schedule</mat-icon> Schedule Status</div>
          <div class="schedule-bars">
            <div class="sched-item" *ngFor="let s of scheduleBars">
              <div class="sched-header">
                <span class="sched-label">{{s.label}}</span>
                <span class="sched-count" [style.color]="s.color">{{s.count}}</span>
              </div>
              <div class="sched-track">
                <div class="sched-fill" [style.width]="s.pct + '%'" [style.background]="s.color"></div>
              </div>
            </div>
            <p class="no-data" *ngIf="schedules.length === 0">No schedules yet</p>
          </div>
          <!-- Capacity gauge -->
          <div class="gauge-section" *ngIf="fleets.length > 0">
            <div class="gauge-label">Fleet Utilisation</div>
            <div class="gauge-track">
              <div class="gauge-fill" [style.width]="utilisationPct + '%'"></div>
            </div>
            <div class="gauge-pct">{{utilisationPct}}%</div>
          </div>
        </div>
      </div>

      <!-- Nav Grid -->
      <div class="nav-grid">
        <a routerLink="/transport/routes" class="nav-card routes">
          <div class="card-top">
            <div class="card-icon"><mat-icon>route</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Routes</div>
          <div class="card-desc">Manage transport routes &amp; schedules</div>
          <div class="card-tag">Operations</div>
        </a>
        <a routerLink="/transport/fleet" class="nav-card fleet">
          <div class="card-top">
            <div class="card-icon"><mat-icon>directions_bus</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Fleet</div>
          <div class="card-desc">Manage vehicles &amp; track their status</div>
          <div class="card-tag">Vehicles</div>
        </a>
        <a routerLink="/incidents" class="nav-card incident">
          <div class="card-top">
            <div class="card-icon"><mat-icon>report_problem</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Incidents</div>
          <div class="card-desc">Report and track road incidents</div>
          <div class="card-tag">Response</div>
        </a>
        <a routerLink="/notifications" class="nav-card notif">
          <div class="card-top">
            <div class="card-icon"><mat-icon>notifications</mat-icon></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </div>
          <div class="card-label">Notifications</div>
          <div class="card-desc">Stay updated with latest alerts &amp; messages</div>
          <div class="card-tag">Alerts</div>
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./transport-dashboard.component.css']
})
export class TransportDashboardComponent implements OnInit {
  routes: RouteResponse[] = [];
  fleets: FleetResponse[] = [];
  schedules: ScheduleResponse[] = [];

  constructor(private transportService: TransportService) {}

  ngOnInit(): void {
    forkJoin({
      routes: this.transportService.getAllRoutes(),
      fleets: this.transportService.getAllFleet(),
      schedules: this.transportService.getAllSchedules(),
    }).subscribe(({ routes, fleets, schedules }) => {
      this.routes = routes;
      this.fleets = fleets;
      this.schedules = schedules;
    });
  }

  get activeRoutes()    { return this.routes.filter(r => r.status === 'ACTIVE').length; }
  get availableFleet()  { return this.fleets.filter(f => f.status === 'AVAILABLE').length; }
  get utilisationPct()  {
    const inService = this.fleets.filter(f => f.status === 'IN_SERVICE').length;
    return this.fleets.length ? Math.round((inService / this.fleets.length) * 100) : 0;
  }

  get fleetDonut() {
    const total = this.fleets.length || 1;
    const circumference = 2 * Math.PI * 50;
    const items = [
      { label: 'Available',   count: this.fleets.filter(f => f.status === 'AVAILABLE').length,   color: '#10b981' },
      { label: 'In Service',  count: this.fleets.filter(f => f.status === 'IN_SERVICE').length,  color: '#f59e0b' },
      { label: 'Maintenance', count: this.fleets.filter(f => f.status === 'MAINTENANCE').length, color: '#6366f1' },
      { label: 'Retired',     count: this.fleets.filter(f => f.status === 'RETIRED').length,     color: '#6b7280' },
    ];
    let offset = 0;
    return items.map(item => {
      const dash = (item.count / total) * circumference;
      const seg = { ...item, dash, gap: circumference - dash, offset: -offset };
      offset += dash;
      return seg;
    });
  }

  get routeTypeBars() {
    const total = this.routes.length || 1;
    return [
      { label: 'Bus',   count: this.routes.filter(r => r.type === 'BUS').length,   color: '#0d9488', pct: 0 },
      { label: 'Train', count: this.routes.filter(r => r.type === 'TRAIN').length, color: '#6366f1', pct: 0 },
    ].map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }));
  }

  get routeStatusBars() {
    const total = this.routes.length || 1;
    return [
      { label: 'Active',    count: this.routes.filter(r => r.status === 'ACTIVE').length,    color: '#10b981', pct: 0 },
      { label: 'Inactive',  count: this.routes.filter(r => r.status === 'INACTIVE').length,  color: '#6b7280', pct: 0 },
      { label: 'Suspended', count: this.routes.filter(r => r.status === 'SUSPENDED').length, color: '#ef4444', pct: 0 },
    ].map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }));
  }

  get scheduleBars() {
    const total = this.schedules.length || 1;
    return [
      { label: 'Scheduled', count: this.schedules.filter(s => s.status === 'SCHEDULED').length, color: '#0d9488', pct: 0 },
      { label: 'On Time',   count: this.schedules.filter(s => s.status === 'ON_TIME').length,   color: '#10b981', pct: 0 },
      { label: 'Delayed',   count: this.schedules.filter(s => s.status === 'DELAYED').length,   color: '#f59e0b', pct: 0 },
      { label: 'Cancelled', count: this.schedules.filter(s => s.status === 'CANCELLED').length, color: '#ef4444', pct: 0 },
    ].map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }));
  }
}
