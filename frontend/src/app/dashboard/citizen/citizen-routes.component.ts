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
        <div class="cr-header-left">
          <div class="cr-header-icon"><mat-icon>directions_bus</mat-icon></div>
          <div>
            <h2>Transport Routes</h2>
            <p>Available bus and train routes with schedules</p>
          </div>
        </div>
        <div class="route-count-badge"><mat-icon>route</mat-icon> {{ routes.length }} Routes</div>
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
    .cr-page{display:flex;flex-direction:column;gap:24px}

    /* Header */
    .cr-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;background:linear-gradient(135deg,#0B2A35,#0D3D4A,#0F4D5C);border-radius:20px;padding:28px 34px;box-shadow:0 8px 32px rgba(13,148,136,0.25);position:relative;overflow:hidden}
    .cr-header::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 50%,rgba(13,148,136,0.18) 0%,transparent 55%)}
    .cr-header::after{content:'';position:absolute;right:-50px;top:-50px;width:240px;height:240px;border-radius:50%;border:2px solid rgba(13,148,136,0.12);pointer-events:none}
    .cr-header-left{display:flex;align-items:center;gap:18px;position:relative}
    .cr-header-icon{width:60px;height:60px;border-radius:18px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
    .cr-header-icon mat-icon{font-size:32px;width:32px;height:32px;color:var(--color-primary)}
    .cr-header h2{font-size:22px;font-weight:800;color:white;margin:0 0 5px}
    .cr-header p{font-size:13px;color:rgba(255,255,255,0.6);margin:0}
    .route-count-badge{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:9px 18px;font-size:13px;font-weight:600;color:white;position:relative}
    .route-count-badge mat-icon{font-size:16px;width:16px;height:16px;color:var(--color-primary)}

    /* Mini stats */
    .mini-stats{display:flex;gap:12px;flex-wrap:wrap}
    .mini-stat{display:flex;align-items:center;gap:10px;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;border:1.5px solid var(--border-subtle);background:var(--bg-surface);color:var(--text-secondary);box-shadow:var(--shadow-sm)}
    .mini-stat:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:var(--color-primary)}
    .mini-stat mat-icon{font-size:20px;width:20px;height:20px}
    .mini-stat.total mat-icon{color:var(--color-primary)}
    .mini-stat.active{color:var(--color-success)} .mini-stat.active mat-icon{color:var(--color-success)}
    .mini-stat.bus{color:var(--color-primary-dark)} .mini-stat.bus mat-icon{color:var(--color-primary)}
    .mini-stat.train{color:#2563eb} .mini-stat.train mat-icon{color:#2563eb}
    .mini-stat.active-filter{border-color:var(--color-primary) !important;background:var(--color-primary-light);box-shadow:0 4px 14px var(--color-primary-glow);transform:translateY(-2px)}

    /* Search */
    .search-bar{display:flex;align-items:center;gap:10px;background:var(--bg-muted);border:1.5px solid var(--border-color);border-radius:10px;padding:10px 14px;transition:border-color 0.2s,box-shadow 0.2s}
    .search-bar:focus-within{border-color:var(--color-primary);box-shadow:0 0 0 3px var(--color-primary-glow)}
    .search-bar mat-icon{color:var(--color-primary)}
    .search-bar input{flex:1;border:none;background:none;outline:none;font-size:14px;color:var(--text-primary)}
    .search-bar input::placeholder{color:var(--text-muted)}
    .search-bar button{background:none;border:none;cursor:pointer;color:var(--text-muted);display:flex;align-items:center}

    /* Route grid */
    .route-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
    .route-card{background:var(--bg-surface);border-radius:16px;padding:20px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:16px;transition:all 0.2s}
    .route-card:hover{box-shadow:var(--shadow-md);transform:translateY(-3px);border-color:var(--color-primary)}
    .route-card-header{display:flex;align-items:center;justify-content:space-between}
    .route-type-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}
    .route-type-badge mat-icon{font-size:16px;width:16px;height:16px}
    .route-type-badge.bus{background:var(--color-primary-light);color:var(--color-primary-dark)}
    .route-type-badge.train{background:rgba(37,99,235,0.12);color:#2563eb}

    /* Route path */
    .route-path{display:flex;align-items:center;gap:8px;background:var(--bg-muted);border-radius:12px;padding:14px 16px;border:1px solid var(--border-subtle)}
    .route-point{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--text-primary);font-weight:600;flex:1;min-width:0}
    .route-point span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .route-point mat-icon{font-size:15px;width:15px;height:15px;flex-shrink:0}
    .route-point.from mat-icon{color:var(--color-primary)}
    .route-point.to mat-icon{color:var(--color-secondary)}
    .route-arrow{color:var(--text-muted);display:flex;align-items:center;flex-shrink:0}
    .route-arrow mat-icon{font-size:18px;width:18px;height:18px}

    /* Schedules */
    .schedules-section{border-top:1px solid var(--border-subtle);padding-top:14px;display:flex;flex-direction:column;gap:10px}
    .schedules-title{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.8px}
    .schedules-title mat-icon{font-size:16px;width:16px;height:16px}
    .schedule-list{display:flex;flex-direction:column;gap:8px}
    .schedule-row{display:flex;align-items:center;gap:8px;background:var(--bg-muted);border-radius:10px;padding:12px 14px;border:1px solid var(--border-subtle);transition:background 0.15s}
    .schedule-row:hover{background:var(--bg-hover)}
    .time-block{display:flex;flex-direction:column;align-items:center;flex:1}
    .time-label{font-size:10px;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
    .time-value{font-size:16px;font-weight:800;color:var(--text-primary)}
    .date-value{font-size:11px;color:var(--text-muted)}
    .time-divider{color:var(--color-primary);display:flex;align-items:center;flex-shrink:0}
    .time-divider mat-icon{font-size:18px;width:18px;height:18px}
    .sched-status{padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;white-space:nowrap;letter-spacing:0.3px}
    .sched-status.scheduled{background:var(--color-primary-light);color:var(--color-primary-dark)}
    .sched-status.on_time{background:rgba(16,185,129,0.15);color:var(--color-success)}
    .sched-status.delayed{background:rgba(245,158,11,0.15);color:var(--color-secondary-dark)}
    .sched-status.cancelled{background:rgba(239,68,68,0.15);color:var(--color-danger)}
    .no-schedule{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);padding:6px 0}
    .no-schedule mat-icon{font-size:16px;width:16px;height:16px}

    /* Status pills */
    .status-pill{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;white-space:nowrap;letter-spacing:0.3px}
    .status-pill.active{background:rgba(16,185,129,0.15);color:var(--color-success)}
    .status-pill.inactive{background:var(--bg-muted);color:var(--text-muted);border:1px solid var(--border-subtle)}
    .status-pill.suspended{background:rgba(239,68,68,0.15);color:var(--color-danger)}

    /* Empty state */
    .empty-state{display:flex;flex-direction:column;align-items:center;gap:14px;padding:56px;color:var(--text-muted)}
    .empty-state mat-icon{font-size:56px;width:56px;height:56px;color:var(--color-primary);opacity:0.3}
    .empty-state p{font-size:15px;color:var(--text-muted);margin:0;font-weight:500}
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
