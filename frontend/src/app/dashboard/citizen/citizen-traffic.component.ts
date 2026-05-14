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
        <div class="ct-header-left">
          <div class="ct-header-icon"><mat-icon>traffic</mat-icon></div>
          <div>
            <h2>Traffic Updates</h2>
            <p>Live road segment status across the city</p>
          </div>
        </div>
        <div class="live-badge"><div class="live-dot"></div> Live Updates</div>
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
    .ct-page { display:flex; flex-direction:column; gap:24px; }

    /* Header */
    .ct-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:linear-gradient(135deg,#0B2A35,#0D3D4A,#0F4D5C); border-radius:20px; padding:28px 34px; box-shadow:0 8px 32px rgba(13,148,136,0.25); position:relative; overflow:hidden; }
    .ct-header::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 85% 50%,rgba(13,148,136,0.18) 0%,transparent 55%); }
    .ct-header::after  { content:''; position:absolute; right:-50px; top:-50px; width:240px; height:240px; border-radius:50%; border:2px solid rgba(13,148,136,0.12); pointer-events:none; }
    .ct-header-left { display:flex; align-items:center; gap:18px; position:relative; }
    .ct-header-icon { width:60px; height:60px; border-radius:18px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.2); }
    .ct-header-icon mat-icon { font-size:32px; width:32px; height:32px; color:var(--color-primary); }
    .ct-header h2 { font-size:22px; font-weight:800; color:white; margin:0 0 5px; }
    .ct-header p  { font-size:13px; color:rgba(255,255,255,0.6); margin:0; }
    .live-badge { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:9px 18px; font-size:13px; font-weight:600; color:white; position:relative; }
    .live-dot { width:8px; height:8px; border-radius:50%; background:var(--color-success); box-shadow:0 0 6px var(--color-success); animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    /* Mini stats */
    .mini-stats { display:flex; gap:12px; flex-wrap:wrap; }
    .mini-stat { display:flex; align-items:center; gap:10px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; border:1.5px solid var(--border-subtle); background:var(--bg-surface); color:var(--text-secondary); box-shadow:var(--shadow-sm); }
    .mini-stat:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); border-color:var(--color-primary); }
    .mini-stat mat-icon { font-size:20px; width:20px; height:20px; }
    .mini-stat.total mat-icon { color:var(--color-primary); }
    .mini-stat.open { color:var(--color-success); } .mini-stat.open mat-icon { color:var(--color-success); }
    .mini-stat.congested { color:var(--color-danger); } .mini-stat.congested mat-icon { color:var(--color-danger); }
    .mini-stat.closed { color:var(--text-muted); } .mini-stat.closed mat-icon { color:var(--text-muted); }
    .mini-stat.maintenance { color:var(--color-secondary-dark); } .mini-stat.maintenance mat-icon { color:var(--color-secondary); }
    .mini-stat.active-filter { border-color:var(--color-primary) !important; background:var(--color-primary-light); box-shadow:0 4px 14px var(--color-primary-glow); transform:translateY(-2px); }

    /* Search */
    .search-bar { display:flex; align-items:center; gap:10px; background:var(--bg-muted); border:1.5px solid var(--border-color); border-radius:10px; padding:10px 14px; transition:border-color 0.2s, box-shadow 0.2s; }
    .search-bar:focus-within { border-color:var(--color-primary); box-shadow:0 0 0 3px var(--color-primary-glow); }
    .search-bar mat-icon { color:var(--color-primary); }
    .search-bar input { flex:1; border:none; background:none; outline:none; font-size:14px; color:var(--text-primary); }
    .search-bar input::placeholder { color:var(--text-muted); }
    .search-bar button { background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; }

    /* Segment list */
    .segment-list { display:flex; flex-direction:column; gap:10px; }
    .segment-card { display:flex; align-items:center; justify-content:space-between; background:var(--bg-surface); border-radius:14px; padding:16px 20px; border:1px solid var(--border-subtle); border-left:4px solid var(--border-color); box-shadow:var(--shadow-sm); transition:all 0.2s; }
    .segment-card:hover { box-shadow:var(--shadow-md); transform:translateX(3px); }
    .segment-card.border-open { border-left-color:var(--color-success); }
    .segment-card.border-congested { border-left-color:var(--color-danger); }
    .segment-card.border-closed { border-left-color:var(--text-muted); }
    .segment-card.border-under_maintenance { border-left-color:var(--color-secondary); }
    .seg-left { display:flex; align-items:center; gap:14px; }
    .seg-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
    .seg-dot.open { background:var(--color-success); box-shadow:0 0 8px rgba(16,185,129,0.5); }
    .seg-dot.congested { background:var(--color-danger); box-shadow:0 0 8px rgba(239,68,68,0.4); }
    .seg-dot.closed { background:var(--text-muted); }
    .seg-dot.under_maintenance { background:var(--color-secondary); box-shadow:0 0 8px rgba(245,158,11,0.4); }
    .seg-name { font-size:14px; font-weight:600; color:var(--text-primary); }
    .seg-len { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-muted); margin-top:3px; }
    .seg-len mat-icon { font-size:13px; width:13px; height:13px; }

    /* Status pills */
    .status-pill { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; white-space:nowrap; letter-spacing:0.3px; }
    .status-pill.open { background:rgba(16,185,129,0.15); color:var(--color-success); }
    .status-pill.congested { background:rgba(239,68,68,0.15); color:var(--color-danger); }
    .status-pill.closed { background:var(--bg-muted); color:var(--text-muted); border:1px solid var(--border-subtle); }
    .status-pill.under_maintenance { background:rgba(245,158,11,0.15); color:var(--color-secondary-dark); }

    /* Empty state */
    .empty-state { display:flex; flex-direction:column; align-items:center; gap:14px; padding:56px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:56px; width:56px; height:56px; color:var(--color-primary); opacity:0.3; }
    .empty-state p { font-size:15px; color:var(--text-muted); margin:0; font-weight:500; }
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
