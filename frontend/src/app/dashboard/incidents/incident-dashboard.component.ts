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
import { IncidentService } from '../../core/services/incident.service';
import { IncidentResponse, ResolutionResponse, IncidentType, IncidentStatus } from '../../core/models/incident.model';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-incident-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatTabsModule, StatCardComponent
  ],
  templateUrl: './incident-dashboard.component.html',
  styleUrls: ['./incident-dashboard.component.css']
})
export class IncidentDashboardComponent implements OnInit {
  incidents: IncidentResponse[] = [];
  resolutions: ResolutionResponse[] = [];
  selectedIncidentId: number | null = null;
  resolutionCols = ['resolutionId', 'incidentId', 'actions', 'status', 'date'];

  isOfficer = false;
  isCitizen = false;
  showReportForm = false;
  showResolutionForm = false;
  userId: number | null = null;
  activeFilter = 'ALL';

  get filteredIncidents(): IncidentResponse[] {
    if (this.activeFilter === 'ALL') return this.incidents;
    if (this.activeFilter === 'RESOLVED') return this.incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED');
    return this.incidents.filter(i => i.status === this.activeFilter);
  }

  setFilter(f: string): void { this.activeFilter = f; }

  incidentTypes: IncidentType[] = ['ACCIDENT', 'BREAKDOWN', 'ROADBLOCK'];
  incidentStatuses: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED'];

  reportForm = this.fb.group({
    type: ['' as IncidentType, Validators.required],
    location: ['', Validators.required]
  });

  resolutionForm = this.fb.group({
    incidentId: [null as number | null, Validators.required],
    actions: ['', Validators.required]
  });

  constructor(
    private incidentService: IncidentService,
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.isOfficer = role === 'TRAFFIC_OFFICER' || role === 'ADMIN';
    this.isCitizen = role === 'CITIZEN';
    this.userId = this.auth.getUserId();
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.incidentService.getAllIncidents().subscribe(data => {
      this.incidents = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  loadResolutions(incidentId: number): void {
    if (this.selectedIncidentId === incidentId) {
      this.selectedIncidentId = null;
      this.resolutions = [];
      return;
    }
    this.selectedIncidentId = incidentId;
    this.incidentService.getResolutionsByIncident(incidentId).subscribe(data => this.resolutions = data);
  }

  reportIncident(): void {
    if (this.reportForm.invalid) return;
    const { type, location } = this.reportForm.value;
    this.incidentService.createIncident({ type: type!, location: location! }).subscribe({
      next: () => { this.loadIncidents(); this.reportForm.reset(); this.showReportForm = false; this.snack.open('Incident reported', 'OK', { duration: 3000 }); },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? `Error ${err?.status}: ${err?.statusText}`;
        this.snack.open(msg, 'OK', { duration: 6000 });
      }
    });
  }

  addResolution(): void {
    if (this.resolutionForm.invalid) return;
    const { incidentId, actions } = this.resolutionForm.value;
    this.incidentService.addResolution({ incidentId: incidentId!, officerId: this.userId!, actions: actions! }).subscribe({
      next: () => {
        this.loadIncidents();
        this.resolutionForm.reset();
        this.showResolutionForm = false;
        this.snack.open('Resolution added — Incident is now In Progress', 'OK', { duration: 3000 });
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? `Error ${err?.status}: ${err?.statusText}`;
        this.snack.open(msg, 'OK', { duration: 6000 });
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.incidentService.updateIncidentStatus(id, status).subscribe({
      next: () => { this.loadIncidents(); this.snack.open('Status updated', 'OK', { duration: 2000 }); }
    });
  }

  markResolutionCompleted(resolutionId: number): void {
    this.incidentService.updateResolutionStatus(resolutionId, 'COMPLETED').subscribe({
      next: () => {
        this.loadIncidents();
        if (this.selectedIncidentId) {
          this.incidentService.getResolutionsByIncident(this.selectedIncidentId).subscribe(d => this.resolutions = d);
        }
        this.snack.open('Resolution completed — Incident marked as Resolved', 'OK', { duration: 3000 });
      }
    });
  }

  get reportedCount()   { return this.incidents.filter(i => i.status === 'REPORTED').length; }
  get inProgressCount() { return this.incidents.filter(i => i.status === 'IN_PROGRESS').length; }
  get resolvedCount()   { return this.incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length; }
}
