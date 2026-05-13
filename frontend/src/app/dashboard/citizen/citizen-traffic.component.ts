import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TrafficService } from '../../core/services/traffic.service';
import { RoadSegmentResponse } from '../../core/models/traffic.model';

@Component({
  selector: 'app-citizen-traffic',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="ct-page">
      <div class="ct-header">
        <div class="ct-header-icon"><mat-icon>traffic</mat-icon></div>
        <div>
          <h2>Traffic Updates</h2>
          <p>Live road segment status across the city</p>
        </div>
      </div>

      <div class="mini-stats">
        <div class="mini-stat total" [class.active-filter]="activeFilter==='ALL'" (click)="setFilter('ALL')"><mat-icon>map</mat-icon><span>All {{segments.length}}</span></div>
        <div class="mini-stat open" [class.active-filter]="activeFilter==='OPEN'" (click)="setFilter('OPEN')"><mat-icon>check_circle</mat-icon><span>Open {{openCount}}</span></div>
        <div class="mini-stat congested" [class.active-filter]="activeFilter==='CONGESTED'" (click)="setFilter('CONGESTED')"><mat-icon>warning</mat-icon><span>Congested {{congestedCount}}</span></div>
        <div class="mini-stat closed" [class.active-filter]="activeFilter==='CLOSED'" (click)="setFilter('CLOSED')"><mat-icon>block</mat-icon><span>Closed {{closedCount}}</span></div>
        <div class="mini-stat maintenance" [class.active-filter]="activeFilter==='MAINTENANCE'" (click)="setFilter('MAINTENANCE')"><mat-icon>construction</mat-icon><span>Maintenance {{maintenanceCount}}</span></div>
      </div>

      <div class="search-bar">
        <mat-icon>search</mat-icon>
        <input [(ngModel)]="search" placeholder="Search road segments..." />
        <button *ngIf="search" (click)="search=''"><mat-icon>close</mat-icon></button>
      </div>

      <div class="segment-list" *ngIf="filtered.length > 0">
        <div class="segment-card" *ngFor="let s of filtered" [ngClass]="'border-'+s.status.toLowerCase()">
          <div class="seg-left">
            <div class="seg-dot" [ngClass]="s.status.toLowerCase()"></div>
            <div>
              <div class="seg-name">{{ s.location }}</div>
              <div class="seg-len"><mat-icon>straighten</mat-icon>{{ s.length }} km</div>
            </div>
          </div>
          <span class="status-pill" [ngClass]="s.status.toLowerCase()">{{ s.status.replace('_',' ') }}</span>
        </div>
      </div>
      <div class="empty-state" *ngIf="filtered.length === 0">
        <mat-icon>map</mat-icon><p>No road segments found</p>
      </div>
    </div>
  `,
  styles: [`
    .ct-page { display:flex; flex-direction:column; gap:20px; }
    .ct-header { display:flex; align-items:center; gap:16px; background:linear-gradient(135deg,#40513B,#609966); border-radius:16px; padding:24px 28px; box-shadow:0 4px 20px rgba(64,81,59,0.3); }
    .ct-header-icon { width:52px; height:52px; border-radius:14px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; }
    .ct-header-icon mat-icon { font-size:28px; width:28px; height:28px; color:white; }
    .ct-header h2 { font-size:22px; font-weight:700; color:white; margin:0 0 4px; }
    .ct-header p  { font-size:13px; color:rgba(255,255,255,0.75); margin:0; }
    .mini-stats { display:flex; gap:12px; flex-wrap:wrap; }
    .mini-stat { display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; border:2px solid transparent; }
    .mini-stat:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .mini-stat mat-icon { font-size:18px; width:18px; height:18px; }
    .mini-stat.open { background:#e8f5e9; color:#2e7d32; }
    .mini-stat.congested { background:#fff3e0; color:#e65100; }
    .mini-stat.closed { background:#ffebee; color:#c62828; }
    .mini-stat.maintenance { background:#fce4ec; color:#880e4f; }
    .mini-stat.total { background:#EDF1D6; color:#40513B; }
    .mini-stat.active-filter { border-color:#40513B; box-shadow:0 4px 12px rgba(64,81,59,0.25); transform:translateY(-2px); }
    .search-bar { display:flex; align-items:center; gap:10px; background:#f8faf5; border:2px solid #EDF1D6; border-radius:10px; padding:10px 14px; }
    .search-bar:focus-within { border-color:#9DC08B; }
    .search-bar mat-icon { color:#9DC08B; }
    .search-bar input { flex:1; border:none; background:none; outline:none; font-size:14px; }
    .search-bar button { background:none; border:none; cursor:pointer; color:#999; display:flex; align-items:center; }
    .segment-list { display:flex; flex-direction:column; gap:8px; }
    .segment-card { display:flex; align-items:center; justify-content:space-between; background:white; border-radius:10px; padding:14px 16px; border:1px solid #EDF1D6; border-left:4px solid #9DC08B; transition:box-shadow 0.2s; }
    .segment-card:hover { box-shadow:0 2px 12px rgba(64,81,59,0.1); }
    .segment-card.border-open { border-left-color:#4caf50; }
    .segment-card.border-congested { border-left-color:#f44336; }
    .segment-card.border-closed { border-left-color:#9e9e9e; }
    .segment-card.border-under_maintenance { border-left-color:#ff9800; }
    .seg-left { display:flex; align-items:center; gap:12px; }
    .seg-dot { width:10px; height:10px; border-radius:50%; }
    .seg-dot.open { background:#4caf50; box-shadow:0 0 6px rgba(76,175,80,0.5); }
    .seg-dot.congested { background:#f44336; }
    .seg-dot.closed { background:#9e9e9e; }
    .seg-dot.under_maintenance { background:#ff9800; }
    .seg-name { font-size:14px; font-weight:500; color:#333; }
    .seg-len { display:flex; align-items:center; gap:4px; font-size:12px; color:#999; margin-top:2px; }
    .seg-len mat-icon { font-size:13px; width:13px; height:13px; }
    .status-pill { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; white-space:nowrap; }
    .status-pill.open { background:#e8f5e9; color:#2e7d32; }
    .status-pill.congested { background:#ffebee; color:#c62828; }
    .status-pill.closed { background:#f5f5f5; color:#757575; }
    .status-pill.under_maintenance { background:#fff3e0; color:#e65100; }
    .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px; color:#9DC08B; }
    .empty-state mat-icon { font-size:52px; width:52px; height:52px; opacity:0.5; }
    .empty-state p { font-size:15px; color:#aaa; margin:0; }
  `]
})
export class CitizenTrafficComponent implements OnInit {
  segments: RoadSegmentResponse[] = [];
  search = '';
  activeFilter = 'ALL';

  constructor(private trafficService: TrafficService) {}

  ngOnInit(): void {
    this.trafficService.getAllSegments().subscribe(d => this.segments = d);
  }

  setFilter(f: string): void { this.activeFilter = f; }

  get filtered(): RoadSegmentResponse[] {
    let list = this.segments;
    if (this.activeFilter === 'OPEN')               list = list.filter(s => s.status === 'OPEN');
    else if (this.activeFilter === 'CONGESTED')      list = list.filter(s => s.status === 'CONGESTED');
    else if (this.activeFilter === 'CLOSED')         list = list.filter(s => s.status === 'CLOSED');
    else if (this.activeFilter === 'MAINTENANCE')    list = list.filter(s => s.status === 'UNDER_MAINTENANCE');
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(s => s.location.toLowerCase().includes(q) || s.status.toLowerCase().includes(q));
    }
    return list;
  }

  get openCount()      { return this.segments.filter(s => s.status === 'OPEN').length; }
  get congestedCount() { return this.segments.filter(s => s.status === 'CONGESTED').length; }
  get closedCount()    { return this.segments.filter(s => s.status === 'CLOSED').length; }
  get maintenanceCount() { return this.segments.filter(s => s.status === 'UNDER_MAINTENANCE').length; }
}
