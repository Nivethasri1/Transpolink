import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page">

      <!-- Background decoration -->
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>

      <div class="card">

        <!-- Icon -->
        <div class="icon-wrap">
          <div class="icon-ring"></div>
          <mat-icon class="lock-icon">lock</mat-icon>
        </div>

        <!-- Code -->
        <div class="code">403</div>

        <!-- Text -->
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.<br>Please contact your administrator if you believe this is a mistake.</p>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Actions -->
        <div class="actions">
          <button class="btn-primary" (click)="goBack()">
            <mat-icon>dashboard</mat-icon>
            Go to My Dashboard
          </button>
          <button class="btn-secondary" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Sign Out
          </button>
        </div>

        <!-- Footer note -->
        <div class="footer-note">
          <mat-icon>info</mat-icon>
          <span>Transpolink — Role-Based Access Control</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-base);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    /* Background glows */
    .bg-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .bg-glow-1 {
      width: 500px; height: 500px;
      top: -150px; left: -150px;
      background: radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%);
    }
    .bg-glow-2 {
      width: 400px; height: 400px;
      bottom: -100px; right: -100px;
      background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%);
    }

    /* Card */
    .card {
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    /* Icon */
    .icon-wrap {
      position: relative;
      width: 96px; height: 96px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
    }
    .icon-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(239,68,68,0.25);
      animation: ring-pulse 2.5s ease-in-out infinite;
    }
    @keyframes ring-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.12); opacity: 0.5; }
    }
    .lock-icon {
      font-size: 52px; width: 52px; height: 52px;
      color: var(--color-danger);
      background: rgba(239,68,68,0.1);
      border-radius: 50%;
      padding: 20px;
      box-sizing: content-box;
      filter: drop-shadow(0 4px 12px rgba(239,68,68,0.3));
    }

    /* 403 code */
    .code {
      font-size: 72px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 12px;
      background: linear-gradient(135deg, var(--color-danger), #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -2px;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 12px;
    }

    p {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.7;
      margin: 0 0 28px;
    }

    .divider {
      width: 100%;
      height: 1px;
      background: var(--border-subtle);
      margin-bottom: 28px;
    }

    /* Actions */
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      margin-bottom: 24px;
    }

    .btn-primary {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 14px 24px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: white; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px var(--color-primary-glow);
      transition: all 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--color-primary-glow);
    }
    .btn-primary mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .btn-secondary {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 13px 24px;
      background: none;
      color: var(--text-muted);
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      border-color: var(--color-danger);
      color: var(--color-danger);
      background: rgba(239,68,68,0.05);
    }
    .btn-secondary mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Footer note */
    .footer-note {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-muted);
      opacity: 0.7;
    }
    .footer-note mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--color-primary); }
  `]
})
export class UnauthorizedComponent {
  constructor(private auth: AuthService) {}
  goBack(): void  { this.auth.redirectToDashboard(); }
  logout(): void  { this.auth.logout(); }
}
