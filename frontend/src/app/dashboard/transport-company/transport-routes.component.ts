import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransportService } from '../../core/services/transport.service';
import { RouteResponse, RouteType, ScheduleResponse, FleetResponse } from '../../core/models/transport.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-transport-routes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
  <div class="routes-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon"><mat-icon>route</mat-icon></div>
        <div>
          <h2>Routes</h2>
          <p>Manage transport routes and their schedules</p>
        </div>
      </div>
      <button class="action-btn" (click)="showRouteForm = !showRouteForm">
        <mat-icon>add</mat-icon> Add Route
      </button>
    </div>

    <!-- Stats / Filter chips -->
    <div class="mini-stats">
      <div class="mini-stat all" [class.active-filter]="statusFilter==='ALL'" (click)="statusFilter='ALL'">
        <mat-icon>route</mat-icon><span>All {{ routes.length }}</span>
      </div>
      <div class="mini-stat active" [class.active-filter]="statusFilter==='ACTIVE'" (click)="statusFilter='ACTIVE'">
        <mat-icon>check_circle</mat-icon><span>Active {{ countByStatus('ACTIVE') }}</span>
      </div>
      <div class="mini-stat inactive" [class.active-filter]="statusFilter==='INACTIVE'" (click)="statusFilter='INACTIVE'">
        <mat-icon>cancel</mat-icon><span>Inactive {{ countByStatus('INACTIVE') }}</span>
      </div>
      <div class="mini-stat suspended" [class.active-filter]="statusFilter==='SUSPENDED'" (click)="statusFilter='SUSPENDED'">
        <mat-icon>pause_circle</mat-icon><span>Suspended {{ countByStatus('SUSPENDED') }}</span>
      </div>
    </div>

    <!-- Add Route Form -->
    <div class="form-panel" *ngIf="showRouteForm">
      <div class="form-panel-header">
        <mat-icon>route</mat-icon>
        <h3>New Route</h3>
        <button class="close-btn" (click)="showRouteForm=false"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="routeForm" (ngSubmit)="addRoute()" class="panel-form">
        <mat-form-field appearance="outline" class="panel-field">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option *ngFor="let t of routeTypes" [value]="t">{{ t }}</mat-option>
          </mat-select>
          <mat-icon matSuffix>commute</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="panel-field">
          <mat-label>Start Point</mat-label>
          <input matInput formControlName="startPoint" placeholder="e.g. Central Station" />
          <mat-icon matSuffix>trip_origin</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="panel-field">
          <mat-label>End Point</mat-label>
          <input matInput formControlName="endPoint" placeholder="e.g. Airport Terminal" />
          <mat-icon matSuffix>place</mat-icon>
        </mat-form-field>
        <div class="panel-actions">
          <button type="submit" class="submit-btn" [disabled]="routeForm.invalid"><mat-icon>save</mat-icon> Save</button>
          <button type="button" class="cancel-btn" (click)="showRouteForm=false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Main layout: table + side drawer -->
    <div class="content-layout" [class.drawer-open]="!!selectedRoute">

      <!-- Routes Table -->
      <div class="section-card">
        <div class="section-header">
          <h3><mat-icon>list</mat-icon> Routes ({{ filteredRoutes.length }})</h3>
        </div>
        <div class="route-list" *ngIf="filteredRoutes.length > 0">
          <div class="route-row" *ngFor="let r of filteredRoutes"
            [class.selected]="selectedRoute?.routeId === r.routeId"
            (click)="toggleSchedules(r)">
            <div class="route-row-left">
              <div class="type-icon" [ngClass]="r.type.toLowerCase()">
                <mat-icon>{{ r.type === 'BUS' ? 'directions_bus' : 'train' }}</mat-icon>
              </div>
              <div class="route-info">
                <span class="route-name">{{ r.startPoint }} → {{ r.endPoint }}</span>
                <div class="route-meta">
                  <span class="type-pill" [ngClass]="r.type.toLowerCase()">{{ r.type }}</span>
                  <span class="status-pill" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
                </div>
              </div>
            </div>
            <div class="route-row-right">
              <span class="schedule-hint" *ngIf="selectedRoute?.routeId !== r.routeId">
                <mat-icon>schedule</mat-icon> View Schedules
              </span>
              <span class="schedule-hint active" *ngIf="selectedRoute?.routeId === r.routeId">
                <mat-icon>close</mat-icon> Close
              </span>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="filteredRoutes.length === 0">
          <mat-icon>route</mat-icon><p>No routes found</p>
        </div>
      </div>

      <!-- Schedule Side Drawer -->
      <div class="schedule-drawer" *ngIf="selectedRoute">
        <div class="drawer-header">
          <div class="drawer-title">
            <div class="type-icon" [ngClass]="selectedRoute.type.toLowerCase()">
              <mat-icon>{{ selectedRoute.type === 'BUS' ? 'directions_bus' : 'train' }}</mat-icon>
            </div>
            <div>
              <h3>{{ selectedRoute.startPoint }} → {{ selectedRoute.endPoint }}</h3>
              <span class="type-pill" [ngClass]="selectedRoute.type.toLowerCase()">{{ selectedRoute.type }}</span>
            </div>
          </div>
          <button class="action-btn small" (click)="showScheduleForm=!showScheduleForm">
            <mat-icon>add</mat-icon> Add
          </button>
        </div>

        <!-- Add Schedule Form -->
        <div class="drawer-form" *ngIf="showScheduleForm">
          <form [formGroup]="scheduleForm" (ngSubmit)="addSchedule()" class="panel-form">
            <mat-form-field appearance="outline" class="panel-field">
              <mat-label>Vehicle Type</mat-label>
              <mat-select formControlName="vehicleType" (selectionChange)="onVehicleTypeChange($event.value)">
                <mat-option *ngFor="let t of vehicleTypes" [value]="t">{{ t }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="panel-field" *ngIf="filteredAvailableFleets.length > 0">
              <mat-label>Registration Number</mat-label>
              <mat-select formControlName="fleetId">
                <mat-option *ngFor="let f of filteredAvailableFleets" [value]="f.fleetId">{{ f.registrationNumber }} ({{ f.capacity }} seats)</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="panel-field">
              <mat-label>Departure</mat-label>
              <input matInput type="datetime-local" formControlName="departureTime" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="panel-field">
              <mat-label>Arrival</mat-label>
              <input matInput type="datetime-local" formControlName="arrivalTime" />
            </mat-form-field>
            <div class="panel-actions">
              <button type="submit" class="submit-btn" [disabled]="scheduleForm.invalid"><mat-icon>save</mat-icon> Save</button>
              <button type="button" class="cancel-btn" (click)="showScheduleForm=false">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Schedule Cards -->
        <div class="schedule-list" *ngIf="schedules.length > 0">
          <div class="schedule-card" *ngFor="let s of schedules">
            <div class="schedule-times">
              <div class="time-block">
                <span class="time-label">Departure</span>
                <span class="time-value">{{ s.departureTime | date:'h:mm a' }}</span>
                <span class="time-date">{{ s.departureTime | date:'MMM d' }}</span>
              </div>
              <div class="time-arrow"><mat-icon>arrow_forward</mat-icon></div>
              <div class="time-block">
                <span class="time-label">Arrival</span>
                <span class="time-value">{{ s.arrivalTime | date:'h:mm a' }}</span>
                <span class="time-date">{{ s.arrivalTime | date:'MMM d' }}</span>
              </div>
            </div>
            <div class="schedule-footer">
              <span class="sched-status" [ngClass]="s.status.toLowerCase()">{{ s.status.replace('_',' ') }}</span>
              <mat-select class="status-select" placeholder="Update" (selectionChange)="updateScheduleStatus(s.scheduleId, $event.value)">
                <mat-option *ngFor="let st of scheduleStatuses" [value]="st">{{ st }}</mat-option>
              </mat-select>
            </div>
          </div>
        </div>
        <div class="empty-state small" *ngIf="schedules.length === 0 && !showScheduleForm">
          <mat-icon>schedule</mat-icon><p>No schedules yet</p>
        </div>
      </div>

    </div>
  </div>
  `,
  styles: [`
    .routes-page { display:flex; flex-direction:column; gap:20px; }

    /* Header */
    .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:linear-gradient(135deg,#40513B,#609966); border-radius:16px; padding:24px 28px; box-shadow:0 4px 20px rgba(64,81,59,0.3); }
    .header-left { display:flex; align-items:center; gap:16px; }
    .header-icon { width:52px; height:52px; border-radius:14px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; }
    .header-icon mat-icon { font-size:28px; width:28px; height:28px; color:white; }
    h2 { font-size:22px; font-weight:700; color:white; margin:0 0 4px; }
    p { font-size:13px; color:rgba(255,255,255,0.75); margin:0; }
    .action-btn { display:flex; align-items:center; gap:8px; background:white; color:#40513B; border:none; border-radius:10px; padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
    .action-btn:hover { background:#EDF1D6; transform:translateY(-1px); }
    .action-btn mat-icon { font-size:20px; width:20px; height:20px; }
    .action-btn.small { padding:8px 14px; font-size:13px; }

    /* Stats */
    .mini-stats { display:flex; gap:12px; flex-wrap:wrap; }
    .mini-stat { display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; border:2px solid transparent; }
    .mini-stat mat-icon { font-size:18px; width:18px; height:18px; }
    .mini-stat:hover { transform:translateY(-1px); }
    .mini-stat.all { background:#EDF1D6; color:#40513B; }
    .mini-stat.active { background:#e8f5e9; color:#2e7d32; }
    .mini-stat.inactive { background:#ffebee; color:#c62828; }
    .mini-stat.suspended { background:#fff8e1; color:#f57f17; }
    .mini-stat.active-filter { border-color:#40513B; box-shadow:0 4px 12px rgba(64,81,59,0.25); transform:translateY(-2px); }

    /* Form panel */
    .form-panel { background:white; border-radius:14px; border:2px solid #EDF1D6; box-shadow:0 4px 20px rgba(64,81,59,0.1); overflow:hidden; }
    .form-panel-header { display:flex; align-items:center; gap:12px; padding:16px 20px; background:linear-gradient(135deg,#40513B,#609966); color:white; }
    .form-panel-header mat-icon { color:rgba(255,255,255,0.9); }
    .form-panel-header h3 { margin:0; font-size:16px; font-weight:600; flex:1; }
    .close-btn { background:rgba(255,255,255,0.15); border:none; border-radius:8px; color:white; cursor:pointer; padding:4px; display:flex; align-items:center; }
    .close-btn:hover { background:rgba(255,255,255,0.25); }
    .panel-form { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-start; padding:20px; }
    .panel-field { min-width:180px; flex:1; }
    .panel-actions { display:flex; gap:10px; align-items:center; padding-top:4px; }
    .submit-btn { display:flex; align-items:center; gap:8px; background:#40513B; color:white; border:none; border-radius:10px; padding:12px 24px; font-size:14px; font-weight:600; cursor:pointer; }
    .submit-btn:hover:not(:disabled) { background:#609966; }
    .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .cancel-btn { background:none; border:1.5px solid #EDF1D6; border-radius:10px; padding:12px 20px; font-size:14px; color:#666; cursor:pointer; }
    .cancel-btn:hover { background:#f5f5f5; }

    /* Content layout */
    .content-layout { display:grid; grid-template-columns:1fr; gap:16px; transition:grid-template-columns 0.3s ease; }
    .content-layout.drawer-open { grid-template-columns:1fr 380px; }

    /* Section card */
    .section-card { background:white; border-radius:14px; border:1px solid #EDF1D6; box-shadow:0 2px 12px rgba(64,81,59,0.08); overflow:hidden; }
    .section-header { display:flex; align-items:center; padding:16px 20px; border-bottom:1px solid #EDF1D6; background:#f8faf5; }
    .section-header h3 { display:flex; align-items:center; gap:8px; margin:0; font-size:15px; font-weight:600; color:#40513B; }
    .section-header h3 mat-icon { font-size:20px; width:20px; height:20px; color:#9DC08B; }

    /* Route rows */
    .route-list { display:flex; flex-direction:column; }
    .route-row { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:14px 20px; border-bottom:1px solid #f0f0f0; cursor:pointer; transition:background 0.15s; }
    .route-row:last-child { border-bottom:none; }
    .route-row:hover { background:#f8faf5; }
    .route-row.selected { background:#EDF1D6; border-left:3px solid #40513B; }
    .route-row-left { display:flex; align-items:center; gap:14px; flex:1; }
    .type-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .type-icon mat-icon { font-size:22px; width:22px; height:22px; color:white; }
    .type-icon.bus { background:linear-gradient(135deg,#40513B,#609966); }
    .type-icon.train { background:linear-gradient(135deg,#6a1b9a,#9c27b0); }
    .route-info { display:flex; flex-direction:column; gap:5px; }
    .route-name { font-size:14px; font-weight:600; color:#333; }
    .route-meta { display:flex; gap:8px; flex-wrap:wrap; }
    .route-row-right { flex-shrink:0; }
    .schedule-hint { display:flex; align-items:center; gap:4px; font-size:12px; color:#9DC08B; font-weight:500; }
    .schedule-hint mat-icon { font-size:16px; width:16px; height:16px; }
    .schedule-hint.active { color:#c62828; }

    /* Pills */
    .type-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .type-pill.bus { background:#EDF1D6; color:#40513B; }
    .type-pill.train { background:#f3e5f5; color:#6a1b9a; }
    .status-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .status-pill.active { background:#e8f5e9; color:#2e7d32; }
    .status-pill.inactive { background:#f5f5f5; color:#757575; }
    .status-pill.suspended { background:#ffebee; color:#c62828; }

    /* Schedule Drawer */
    .schedule-drawer { background:white; border-radius:14px; border:1px solid #EDF1D6; box-shadow:0 2px 12px rgba(64,81,59,0.08); overflow:hidden; display:flex; flex-direction:column; max-height:600px; }
    .drawer-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 20px; background:linear-gradient(135deg,#40513B,#609966); flex-shrink:0; }
    .drawer-title { display:flex; align-items:center; gap:12px; }
    .drawer-title h3 { margin:0 0 4px; font-size:14px; font-weight:700; color:white; }
    .drawer-form { padding:16px; background:#f8faf5; border-bottom:1px solid #EDF1D6; flex-shrink:0; }
    .drawer-form .panel-form { padding:0; }
    .schedule-list { display:flex; flex-direction:column; gap:0; overflow-y:auto; flex:1; }
    .schedule-card { padding:14px 20px; border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
    .schedule-card:last-child { border-bottom:none; }
    .schedule-card:hover { background:#f8faf5; }
    .schedule-times { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
    .time-block { display:flex; flex-direction:column; align-items:center; flex:1; }
    .time-label { font-size:10px; color:#9DC08B; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
    .time-value { font-size:16px; font-weight:700; color:#40513B; }
    .time-date { font-size:11px; color:#999; }
    .time-arrow { color:#9DC08B; display:flex; align-items:center; }
    .time-arrow mat-icon { font-size:18px; width:18px; height:18px; }
    .schedule-footer { display:flex; align-items:center; justify-content:space-between; }
    .sched-status { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .sched-status.scheduled { background:#EDF1D6; color:#40513B; }
    .sched-status.on_time { background:#e8f5e9; color:#2e7d32; }
    .sched-status.delayed { background:#fff3e0; color:#e65100; }
    .sched-status.cancelled { background:#ffebee; color:#c62828; }
    .status-select { font-size:12px; width:120px; }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px; }
    .empty-state.small { padding:24px; }
    .empty-state mat-icon { font-size:52px; width:52px; height:52px; color:#9DC08B; opacity:0.5; }
    .empty-state p { font-size:15px; color:#aaa; margin:0; }
  `]
})
export class TransportRoutesComponent implements OnInit {
  routes: RouteResponse[] = [];
  schedules: ScheduleResponse[] = [];
  filteredAvailableFleets: FleetResponse[] = [];
  selectedRoute: RouteResponse | null = null;
  showRouteForm = false;
  showScheduleForm = false;
  statusFilter = 'ALL';
  operatorId: number | null = null;

  routeTypes: RouteType[] = ['BUS', 'TRAIN'];
  vehicleTypes: string[] = [];
  scheduleStatuses = ['SCHEDULED', 'ON_TIME', 'DELAYED', 'CANCELLED'];

  get filteredRoutes(): RouteResponse[] {
    return this.statusFilter === 'ALL' ? this.routes : this.routes.filter(r => r.status === this.statusFilter);
  }

  routeForm = this.fb.group({
    type:       ['' as RouteType, Validators.required],
    startPoint: ['', Validators.required],
    endPoint:   ['', Validators.required]
  });

  scheduleForm = this.fb.group({
    vehicleType:   ['', Validators.required],
    fleetId:       [null as number | null, Validators.required],
    departureTime: ['', Validators.required],
    arrivalTime:   ['', Validators.required]
  });

  constructor(private transportService: TransportService, private auth: AuthService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.operatorId = this.auth.getUserId();
    this.transportService.getAllRoutes().subscribe({ next: d => this.routes = d, error: () => this.snack.open('Failed to load routes', 'OK', { duration: 3000 }) });
    this.transportService.getAvailableFleet().subscribe({ next: d => {
      this.vehicleTypes = [...new Set(d.map(f => f.vehicleType))];
    }});
  }

  countByStatus(s: string): number { return this.routes.filter(r => r.status === s).length; }

  onVehicleTypeChange(type: string): void {
    this.filteredAvailableFleets = [];
    this.scheduleForm.patchValue({ fleetId: null });
    this.transportService.getAvailableFleetByVehicleType(type).subscribe({ next: d => this.filteredAvailableFleets = d });
  }

  toggleSchedules(route: RouteResponse): void {
    if (this.selectedRoute?.routeId === route.routeId) {
      this.selectedRoute = null; this.schedules = []; this.showScheduleForm = false;
    } else {
      this.selectedRoute = route; this.showScheduleForm = false;
      this.scheduleForm.reset();
      this.filteredAvailableFleets = [];
      this.transportService.getSchedulesByRoute(route.routeId).subscribe({ next: d => this.schedules = d, error: () => this.schedules = [] });
      this.transportService.getAvailableFleet().subscribe({ next: d => this.vehicleTypes = [...new Set(d.map(f => f.vehicleType))] });
    }
  }

  addRoute(): void {
    if (this.routeForm.invalid) return;
    const { type, startPoint, endPoint } = this.routeForm.value;
    this.transportService.createRoute({ operatorId: this.operatorId!, type: type!, startPoint: startPoint!, endPoint: endPoint! }).subscribe({
      next: () => { this.transportService.getAllRoutes().subscribe(d => this.routes = d); this.routeForm.reset(); this.showRouteForm = false; this.snack.open('Route created', 'OK', { duration: 3000 }); }
    });
  }

  addSchedule(): void {
    if (this.scheduleForm.invalid || !this.selectedRoute) return;
    const { fleetId, departureTime, arrivalTime } = this.scheduleForm.value;
    this.transportService.createSchedule({
      routeId: this.selectedRoute.routeId,
      departureTime: departureTime!,
      arrivalTime: arrivalTime!
    }).subscribe({
      next: () => {
        // Assign fleet to route → sets fleet status to IN_SERVICE
        if (fleetId) {
          this.transportService.assignFleetToRoute(fleetId, this.selectedRoute!.routeId).subscribe({
            next: () => {
              this.filteredAvailableFleets = this.filteredAvailableFleets.filter(f => f.fleetId !== fleetId);
            }
          });
        }
        this.transportService.getSchedulesByRoute(this.selectedRoute!.routeId).subscribe(d => this.schedules = d);
        this.scheduleForm.reset();
        this.filteredAvailableFleets = [];
        this.showScheduleForm = false;
        this.snack.open('Schedule added & fleet assigned', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Failed to add schedule', 'OK', { duration: 3000 })
    });
  }

  updateScheduleStatus(id: number, status: string): void {
    this.transportService.updateScheduleStatus(id, status).subscribe({
      next: () => { if (this.selectedRoute) this.transportService.getSchedulesByRoute(this.selectedRoute.routeId).subscribe(d => this.schedules = d); this.snack.open('Updated', 'OK', { duration: 2000 }); }
    });
  }
}
