import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TransportService } from '../../core/services/transport.service';
import { RouteResponse, ScheduleResponse } from '../../core/models/transport.model';

@Component({
  selector: 'app-citizen-routes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="cr-page">
      <div class="cr-header">
        <div class="cr-header-icon"><mat-icon>directions_bus</mat-icon></div>
        <div>
          <h2>Transport Routes</h2>
          <p>Available bus and train routes with schedules</p>
        </div>
      </div>

      <div class="mini-stats">
        <div class="mini-stat total" [class.active-filter]="activeFilter==='ALL'" (click)="setFilter('ALL')"><mat-icon>route</mat-icon><span>All {{routes.length}}</span></div>
        <div class="mini-stat active" [class.active-filter]="activeFilter==='ACTIVE'" (click)="setFilter('ACTIVE')"><mat-icon>check_circle</mat-icon><span>Active {{activeCount}}</span></div>
        <div class="mini-stat bus" [class.active-filter]="activeFilter==='BUS'" (click)="setFilter('BUS')"><mat-icon>directions_bus</mat-icon><span>Bus {{busCount}}</span></div>
        <div class="mini-stat train" [class.active-filter]="activeFilter==='TRAIN'" (click)="setFilter('TRAIN')"><mat-icon>train</mat-icon><span>Train {{trainCount}}</span></div>
      </div>

      <div class="search-bar">
        <mat-icon>search</mat-icon>
        <input [(ngModel)]="search" placeholder="Search by origin, destination or type..." />
        <button *ngIf="search" (click)="search=''"><mat-icon>close</mat-icon></button>
      </div>

      <div class="route-grid" *ngIf="filtered.length > 0">
        <div class="route-card" *ngFor="let r of filtered">
          <div class="route-card-header">
            <div class="route-type-badge" [ngClass]="r.type.toLowerCase()">
              <mat-icon>{{ r.type === 'BUS' ? 'directions_bus' : 'train' }}</mat-icon>
              {{ r.type }}
            </div>
            <span class="status-pill" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
          </div>

          <div class="route-path">
            <span class="route-point from"><mat-icon>trip_origin</mat-icon>{{ r.startPoint }}</span>
            <div class="route-arrow"><mat-icon>arrow_forward</mat-icon></div>
            <span class="route-point to"><mat-icon>place</mat-icon>{{ r.endPoint }}</span>
          </div>

          <div class="schedules-section">
            <div class="schedules-title"><mat-icon>schedule</mat-icon> Schedules</div>
            <div class="schedule-list" *ngIf="getSchedules(r.routeId).length > 0">
              <div class="schedule-row" *ngFor="let s of getSchedules(r.routeId)">
                <div class="time-block">
                  <span class="time-label">Departure</span>
                  <span class="time-value">{{ s.departureTime | date:'h:mm a' }}</span>
                  <span class="date-value">{{ s.departureTime | date:'MMM d' }}</span>
                </div>
                <div class="time-divider"><mat-icon>arrow_forward</mat-icon></div>
                <div class="time-block">
                  <span class="time-label">Arrival</span>
                  <span class="time-value">{{ s.arrivalTime | date:'h:mm a' }}</span>
                  <span class="date-value">{{ s.arrivalTime | date:'MMM d' }}</span>
                </div>
                <span class="sched-status" [ngClass]="s.status.toLowerCase()">{{ s.status.replace('_',' ') }}</span>
              </div>
            </div>
            <div class="no-schedule" *ngIf="getSchedules(r.routeId).length === 0">
              <mat-icon>info</mat-icon> No schedules available
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="filtered.length === 0">
        <mat-icon>directions_bus</mat-icon><p>No routes found</p>
      </div>
    </div>
  `,
  styles: [`
    .cr-page{display:flex;flex-direction:column;gap:20px}
    .cr-header{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#40513B,#609966);border-radius:16px;padding:24px 28px;box-shadow:0 4px 20px rgba(64,81,59,0.3)}
    .cr-header-icon{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center}
    .cr-header-icon mat-icon{font-size:28px;width:28px;height:28px;color:white}
    .cr-header h2{font-size:22px;font-weight:700;color:white;margin:0 0 4px}
    .cr-header p{font-size:13px;color:rgba(255,255,255,0.75);margin:0}
    .mini-stats{display:flex;gap:12px;flex-wrap:wrap}
    .mini-stat{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;border:2px solid transparent}
    .mini-stat:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(64,81,59,0.15)}
    .mini-stat mat-icon{font-size:18px;width:18px;height:18px}
    .mini-stat.active{background:#EDF1D6;color:#40513B}
    .mini-stat.bus{background:#e8f5e9;color:#2e7d32}
    .mini-stat.train{background:#e3f2fd;color:#1565c0}
    .mini-stat.total{background:#f5f5f5;color:#555}
    .mini-stat.active-filter{border-color:#40513B;box-shadow:0 4px 12px rgba(64,81,59,0.25);transform:translateY(-2px)}
    .search-bar{display:flex;align-items:center;gap:10px;background:#f8faf5;border:2px solid #EDF1D6;border-radius:10px;padding:10px 14px}
    .search-bar:focus-within{border-color:#9DC08B}
    .search-bar mat-icon{color:#9DC08B}
    .search-bar input{flex:1;border:none;background:none;outline:none;font-size:14px}
    .search-bar button{background:none;border:none;cursor:pointer;color:#999;display:flex;align-items:center}
    .route-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
    .route-card{background:white;border-radius:14px;padding:18px;border:1px solid #EDF1D6;box-shadow:0 2px 10px rgba(64,81,59,0.07);display:flex;flex-direction:column;gap:14px;transition:box-shadow 0.2s,transform 0.2s}
    .route-card:hover{box-shadow:0 6px 20px rgba(64,81,59,0.13);transform:translateY(-2px)}
    .route-card-header{display:flex;align-items:center;justify-content:space-between}
    .route-type-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700}
    .route-type-badge mat-icon{font-size:16px;width:16px;height:16px}
    .route-type-badge.bus{background:#EDF1D6;color:#40513B}
    .route-type-badge.train{background:#e3f2fd;color:#1565c0}
    .route-path{display:flex;align-items:center;gap:8px;background:#f8faf5;border-radius:10px;padding:12px}
    .route-point{display:flex;align-items:center;gap:4px;font-size:13px;color:#444;font-weight:600;flex:1}
    .route-point mat-icon{font-size:14px;width:14px;height:14px}
    .route-point.from mat-icon{color:#40513B}
    .route-point.to mat-icon{color:#609966}
    .route-arrow{color:#9DC08B;display:flex;align-items:center}
    .route-arrow mat-icon{font-size:18px;width:18px;height:18px}
    .schedules-section{border-top:1px solid #EDF1D6;padding-top:12px;display:flex;flex-direction:column;gap:8px}
    .schedules-title{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#40513B;text-transform:uppercase;letter-spacing:0.5px}
    .schedules-title mat-icon{font-size:16px;width:16px;height:16px;color:#9DC08B}
    .schedule-list{display:flex;flex-direction:column;gap:6px}
    .schedule-row{display:flex;align-items:center;gap:8px;background:#f8faf5;border-radius:8px;padding:10px 12px;border:1px solid #EDF1D6}
    .time-block{display:flex;flex-direction:column;align-items:center;flex:1}
    .time-label{font-size:10px;color:#9DC08B;text-transform:uppercase;letter-spacing:0.5px;font-weight:600}
    .time-value{font-size:15px;font-weight:700;color:#40513B}
    .date-value{font-size:11px;color:#999}
    .time-divider{color:#9DC08B;display:flex;align-items:center}
    .time-divider mat-icon{font-size:16px;width:16px;height:16px}
    .sched-status{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;text-transform:uppercase;white-space:nowrap}
    .sched-status.scheduled{background:#EDF1D6;color:#40513B}
    .sched-status.on_time{background:#e8f5e9;color:#2e7d32}
    .sched-status.delayed{background:#fff3e0;color:#e65100}
    .sched-status.cancelled{background:#ffebee;color:#c62828}
    .no-schedule{display:flex;align-items:center;gap:6px;font-size:12px;color:#bbb;padding:6px 0}
    .no-schedule mat-icon{font-size:16px;width:16px;height:16px}
    .status-pill{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;white-space:nowrap}
    .status-pill.active{background:#EDF1D6;color:#40513B}
    .status-pill.inactive{background:#f5f5f5;color:#757575}
    .status-pill.suspended{background:#ffebee;color:#c62828}
    .empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px;color:#9DC08B}
    .empty-state mat-icon{font-size:52px;width:52px;height:52px;opacity:0.5}
    .empty-state p{font-size:15px;color:#aaa;margin:0}
  `]
})
export class CitizenRoutesComponent implements OnInit {
  routes: RouteResponse[] = [];
  schedules: ScheduleResponse[] = [];
  search = '';
  activeFilter = 'ALL';

  constructor(private transportService: TransportService) {}

  ngOnInit(): void {
    this.transportService.getAllRoutes().subscribe(d => this.routes = d);
    this.transportService.getAllSchedules().subscribe(d => this.schedules = d);
  }

  setFilter(f: string): void { this.activeFilter = f; }

  getSchedules(routeId: number): ScheduleResponse[] {
    return this.schedules.filter(s => s.routeId === routeId);
  }

  get filtered(): RouteResponse[] {
    let list = this.routes;
    if (this.activeFilter === 'ACTIVE')   list = list.filter(r => r.status === 'ACTIVE');
    else if (this.activeFilter === 'BUS')  list = list.filter(r => r.type === 'BUS');
    else if (this.activeFilter === 'TRAIN') list = list.filter(r => r.type === 'TRAIN');
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(r =>
        r.startPoint.toLowerCase().includes(q) ||
        r.endPoint.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get activeCount() { return this.routes.filter(r => r.status === 'ACTIVE').length; }
  get busCount()    { return this.routes.filter(r => r.type === 'BUS').length; }
  get trainCount()  { return this.routes.filter(r => r.type === 'TRAIN').length; }
}
