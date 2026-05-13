import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TransportService } from '../../core/services/transport.service';
import { RouteResponse, FleetResponse, ScheduleResponse, RouteType } from '../../core/models/transport.model';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatTabsModule, StatCardComponent
  ],
  templateUrl: './fleet-dashboard.component.html',
  styleUrls: ['./fleet-dashboard.component.css']
})
export class FleetDashboardComponent implements OnInit {
  routes: RouteResponse[] = [];
  fleets: FleetResponse[] = [];
  schedules: ScheduleResponse[] = [];
  routeCols = ['routeId', 'type', 'startPoint', 'endPoint', 'status', 'actions'];
  fleetCols = ['fleetId', 'registrationNumber', 'vehicleType', 'capacity', 'status', 'actions'];
  scheduleCols = ['scheduleId', 'routeId', 'departureTime', 'arrivalTime', 'status', 'actions'];

  isOperator = false;
  showRouteForm = false;
  showFleetForm = false;
  showScheduleForm = false;
  operatorId: number | null = null;

  routeTypes: RouteType[] = ['BUS', 'TRAIN'];
  scheduleStatuses = ['SCHEDULED', 'ON_TIME', 'DELAYED', 'CANCELLED'];
  fleetStatuses = ['AVAILABLE', 'IN_SERVICE', 'MAINTENANCE', 'RETIRED'];

  routeForm = this.fb.group({
    type: ['' as RouteType, Validators.required],
    startPoint: ['', Validators.required],
    endPoint: ['', Validators.required]
  });

  availableFleets: FleetResponse[] = [];

  fleetForm = this.fb.group({
    registrationNumber: ['', Validators.required],
    vehicleType: ['', Validators.required],
    capacity: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  scheduleForm = this.fb.group({
    routeId: [null as number | null, Validators.required],
    departureTime: ['', Validators.required],
    arrivalTime: ['', Validators.required]
  });

  constructor(
    private transportService: TransportService,
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.isOperator = role === 'TRANSPORT_OPERATOR' || role === 'ADMIN';
    this.operatorId = this.auth.getUserId();
    this.loadRoutes();
    if (this.operatorId) this.loadFleet();
    this.transportService.getAvailableFleet().subscribe(d => this.availableFleets = d);
  }

  loadRoutes(): void {
    this.transportService.getAllRoutes().subscribe(data => this.routes = data);
  }

  loadFleet(): void {
    this.transportService.getAllFleet().subscribe(data => this.fleets = data);
  }

  loadSchedules(routeId: number): void {
    this.transportService.getSchedulesByRoute(routeId).subscribe(data => this.schedules = data);
  }

  addRoute(): void {
    if (this.routeForm.invalid) return;
    const { type, startPoint, endPoint } = this.routeForm.value;
    this.transportService.createRoute({ operatorId: this.operatorId!, type: type!, startPoint: startPoint!, endPoint: endPoint! }).subscribe({
      next: () => { this.loadRoutes(); this.routeForm.reset(); this.showRouteForm = false; this.snack.open('Route created', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed to create route', 'OK', { duration: 3000 })
    });
  }

  onRegistrationSelect(regNum: string): void {
    const fleet = this.availableFleets.find(f => f.registrationNumber === regNum);
    if (fleet) this.fleetForm.patchValue({ vehicleType: fleet.vehicleType, capacity: fleet.capacity });
  }

  addFleet(): void {
    if (this.fleetForm.invalid) return;
    const { registrationNumber, vehicleType, capacity } = this.fleetForm.value;
    this.transportService.addFleet({ registrationNumber: registrationNumber!, vehicleType: vehicleType!, capacity: capacity! }).subscribe({
      next: () => { this.loadFleet(); this.fleetForm.reset(); this.showFleetForm = false; this.snack.open('Fleet added', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed to add fleet', 'OK', { duration: 3000 })
    });
  }

  addSchedule(): void {
    if (this.scheduleForm.invalid) return;
    const { routeId, departureTime, arrivalTime } = this.scheduleForm.value;
    this.transportService.createSchedule({ routeId: routeId!, departureTime: departureTime!, arrivalTime: arrivalTime! }).subscribe({
      next: () => { this.scheduleForm.reset(); this.showScheduleForm = false; this.snack.open('Schedule created', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Failed to create schedule', 'OK', { duration: 3000 })
    });
  }

  updateFleetStatus(id: number, status: string): void {
    this.transportService.updateFleetStatus(id, status).subscribe({
      next: () => { this.loadFleet(); this.snack.open('Fleet status updated', 'OK', { duration: 2000 }); }
    });
  }

  updateScheduleStatus(id: number, status: string): void {
    this.transportService.updateScheduleStatus(id, status).subscribe({
      next: () => this.snack.open('Schedule status updated', 'OK', { duration: 2000 })
    });
  }

  get activeRoutes() { return this.routes.filter(r => r.status === 'ACTIVE').length; }
  get availableFleet() { return this.fleets.filter(f => f.status === 'AVAILABLE').length; }
}
