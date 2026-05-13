import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TrafficService } from '../../core/services/traffic.service';
import { RoadSegmentResponse, TrafficFlowResponse } from '../../core/models/traffic.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-traffic-flows',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './traffic-flows.component.html',
  styleUrls: ['./traffic-flows.component.css']
})
export class TrafficFlowsComponent implements OnInit {
  segments: RoadSegmentResponse[] = [];
  flows: TrafficFlowResponse[] = [];
  cols = ['flowId', 'segmentId', 'volume', 'speed', 'status', 'date'];
  isOfficer = false;
  showForm = false;
  selectedSegmentId: number | null = null;
  activeFilter = 'ALL';
  search = '';

  get filteredFlows(): TrafficFlowResponse[] {
    let list = this.flows;
    if (this.activeFilter !== 'ALL') list = list.filter(f => f.status === this.activeFilter);
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(f => this.getSegmentName(f.segmentId).toLowerCase().includes(q));
    }
    return list;
  }

  flowForm = this.fb.group({
    segmentId: [null as number | null, Validators.required],
    volume: [null as number | null, [Validators.required, Validators.min(0)]],
    speed: [null as number | null, [Validators.required, Validators.min(0)]]
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
    this.trafficService.getAllSegments().subscribe(d => this.segments = d);
    this.trafficService.getAllFlows().subscribe(d => this.flows = d);
  }

  loadFlows(segmentId: number): void {
    this.selectedSegmentId = segmentId;
    this.trafficService.getFlowsBySegment(segmentId).subscribe(d => this.flows = d);
  }

  recordFlow(): void {
    if (this.flowForm.invalid) return;
    const { segmentId, volume, speed } = this.flowForm.value;
    this.trafficService.recordFlow({ segmentId: segmentId!, volume: volume!, speed: speed! }).subscribe({
      next: () => {
        this.trafficService.getAllFlows().subscribe(d => this.flows = d);
        this.flowForm.reset();
        this.showForm = false;
        this.snack.open('Flow recorded', 'OK', { duration: 3000 });
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Failed', 'OK', { duration: 3000 })
    });
  }

  getSegmentName(id: number): string {
    return this.segments.find(s => s.segmentId === id)?.location ?? `Segment #${id}`;
  }

  get normalCount()     { return this.flows.filter(f => f.status === 'NORMAL').length; }
  get slowCount()       { return this.flows.filter(f => f.status === 'SLOW').length; }
  get heavyCount()      { return this.flows.filter(f => f.status === 'HEAVY').length; }
  get standstillCount() { return this.flows.filter(f => f.status === 'STANDSTILL').length; }
}
