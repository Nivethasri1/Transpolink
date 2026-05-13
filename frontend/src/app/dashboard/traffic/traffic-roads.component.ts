import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrafficService } from '../../core/services/traffic.service';
import { RoadSegmentResponse, SegmentStatus } from '../../core/models/traffic.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-traffic-roads',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './traffic-roads.component.html',
  styleUrls: ['./traffic-roads.component.css']
})
export class TrafficRoadsComponent implements OnInit {
  segments: RoadSegmentResponse[] = [];
  cols = ['segmentId', 'location', 'length', 'status', 'actions'];
  isOfficer = false;
  showForm = false;
  search = '';
  statusFilter = 'ALL';
  statusOptions: SegmentStatus[] = ['OPEN', 'CLOSED', 'UNDER_MAINTENANCE', 'CONGESTED'];

  segmentForm = this.fb.group({
    location: ['', Validators.required],
    length: [null as number | null, [Validators.required, Validators.min(0.1)]]
  });

  constructor(
    private trafficService: TrafficService,
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.isOfficer = role === 'TRAFFIC_OFFICER' || role === 'ADMIN';
    this.load();
  }

  load(): void {
    this.trafficService.getAllSegments().subscribe(d => this.segments = d);
  }

  get filtered(): RoadSegmentResponse[] {
    let list = this.segments;
    if (this.statusFilter !== 'ALL') list = list.filter(s => s.status === this.statusFilter);
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(s => s.location.toLowerCase().includes(q));
    }
    return list;
  }

  addSegment(): void {
    if (this.segmentForm.invalid) return;
    const { location, length } = this.segmentForm.value;
    this.trafficService.createSegment({ location: location!, length: length! }).subscribe({
      next: () => { this.load(); this.segmentForm.reset(); this.showForm = false; this.snack.open('Segment added', 'OK', { duration: 3000 }); },
      error: (err) => this.snack.open(err?.error?.message ?? 'Failed', 'OK', { duration: 3000 })
    });
  }

  updateStatus(id: number, status: string): void {
    this.trafficService.updateSegmentStatus(id, status).subscribe({
      next: () => { this.load(); this.snack.open('Status updated', 'OK', { duration: 2000 }); }
    });
  }

  get openCount()       { return this.segments.filter(s => s.status === 'OPEN').length; }
  get congestedCount()  { return this.segments.filter(s => s.status === 'CONGESTED').length; }
  get closedCount()     { return this.segments.filter(s => s.status === 'CLOSED').length; }
  get maintenanceCount(){ return this.segments.filter(s => s.status === 'UNDER_MAINTENANCE').length; }
}
