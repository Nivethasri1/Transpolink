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
          <div class="stat-icon-wrap" [style.background]="color + '18'">
            <mat-icon [style.color]="color">{{ icon }}</mat-icon>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stat-card {
      border-left: 4px solid;
      border-radius: 12px !important;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md) !important;
    }
    .stat-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .stat-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon-wrap mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = 'info';
  @Input() color = 'var(--color-primary)';
}
