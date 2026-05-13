import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stat-card" [style.border-left-color]="color">
      <mat-card-content>
        <div class="stat-body">
          <div>
            <div class="stat-value">{{ value }}</div>
            <div class="stat-label">{{ label }}</div>
          </div>
          <mat-icon [style.color]="color" class="stat-icon">{{ icon }}</mat-icon>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stat-card { border-left: 4px solid; border-radius: 8px; }
    .stat-body { display: flex; justify-content: space-between; align-items: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a237e; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .stat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.7; }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = 'info';
  @Input() color = '#3f51b5';
}
