import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-icon class="lock-icon">lock</mat-icon>
      <h1>403 - Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <button mat-raised-button color="primary" (click)="goBack()">Go to My Dashboard</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; gap: 16px;
      background: #f5f5f5; text-align: center;
    }
    .lock-icon { font-size: 80px; width: 80px; height: 80px; color: #f44336; }
    h1 { font-size: 28px; color: #1a237e; margin: 0; }
    p { color: #666; margin: 0; }
  `]
})
export class UnauthorizedComponent {
  constructor(private auth: AuthService) {}
  goBack(): void { this.auth.redirectToDashboard(); }
}
