import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { AuthService } from '../../core/services/auth.service';
import { UserResponse, Role } from '../../core/models/auth.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatTabsModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule, MatBadgeModule, MatTooltipModule,
    StatCardComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  pendingUsers: UserResponse[] = [];
  activeUsers: UserResponse[] = [];
  allUsers: UserResponse[] = [];
  lastRefreshed = new Date();
  private refreshSub!: Subscription;

  pendingCols = ['userId', 'name', 'email', 'phone', 'actions'];
  activeCols = ['userId', 'name', 'email', 'role', 'status', 'actions'];

  roles: { value: Role; label: string }[] = [
    { value: 'CITIZEN',            label: 'Citizen' },
    { value: 'TRAFFIC_OFFICER',    label: 'Traffic Officer' },
    { value: 'TRANSPORT_OPERATOR', label: 'Transport Operator' },
    { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
    { value: 'ADMIN',              label: 'Admin' }
  ];

  selectedRoles: Record<number, Role> = {};
  userSearch = '';
  userStatusFilter = 'ALL';

  get filteredUsers() {
    let list = this.allUsers;
    if (this.userStatusFilter !== 'ALL') list = list.filter(u => u.status === this.userStatusFilter);
    if (this.userSearch.trim()) {
      const q = this.userSearch.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }

  constructor(private auth: AuthService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.loadAll();
    // Auto-refresh every 30 seconds to stay in sync with DB
    this.refreshSub = interval(30000).pipe(
      switchMap(() => this.auth.getAllUsers())
    ).subscribe(users => this.applyUsers(users));
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadAll(): void {
    this.auth.getAllUsers().subscribe(users => this.applyUsers(users));
  }

  private applyUsers(users: UserResponse[]): void {
    this.allUsers = users;
    this.pendingUsers = users.filter(u => u.status === 'PENDING');
    this.activeUsers = users.filter(u => u.status !== 'PENDING');
    this.lastRefreshed = new Date();
  }

  approve(user: UserResponse): void {
    const role = user.role;
    if (!role) {
      this.snack.open('User has no role assigned', 'OK', { duration: 3000 });
      return;
    }
    this.auth.approveUser(user.userId, { role }).subscribe({
      next: () => { this.loadAll(); this.snack.open(`${user.name} approved as ${role}`, 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Approval failed', 'OK', { duration: 3000 })
    });
  }

  reject(user: UserResponse): void {
    if (!confirm(`Reject ${user.name}'s registration?`)) return;
    this.auth.rejectUser(user.userId).subscribe({
      next: () => { this.loadAll(); this.snack.open(`${user.name} rejected`, 'OK', { duration: 3000 }); }
    });
  }

  suspend(user: UserResponse): void {
    if (!confirm(`Suspend ${user.name}?`)) return;
    this.auth.suspendUser(user.userId).subscribe({
      next: () => { this.loadAll(); this.snack.open(`${user.name} suspended`, 'OK', { duration: 3000 }); }
    });
  }

  updateRole(user: UserResponse, role: Role): void {
    this.auth.updateRole(user.userId, { role }).subscribe({
      next: () => { this.loadAll(); this.snack.open(`Role updated to ${role}`, 'OK', { duration: 2000 }); }
    });
  }

  deleteUser(user: UserResponse): void {
    if (!confirm(`Permanently delete ${user.name}?`)) return;
    this.auth.deleteUser(user.userId).subscribe({
      next: () => { this.loadAll(); this.snack.open(`${user.name} deleted`, 'OK', { duration: 3000 }); }
    });
  }

  get rejectedCount() { return this.allUsers.filter(u => u.status === 'REJECTED').length; }
  get suspendedCount() { return this.allUsers.filter(u => u.status === 'SUSPENDED').length; }

  get roleBreakdown() {
    const total = this.allUsers.length || 1;
    const roles = [
      { key: 'ADMIN',               label: 'Admin',               icon: 'admin_panel_settings', color: 'var(--color-primary)' },
      { key: 'TRAFFIC_OFFICER',     label: 'Traffic Officer',     icon: 'traffic',              color: 'var(--color-secondary)' },
      { key: 'TRANSPORT_OPERATOR',  label: 'Transport Operator',  icon: 'directions_bus',       color: '#2563eb' },
      { key: 'COMPLIANCE_OFFICER',  label: 'Compliance Officer',  icon: 'fact_check',           color: '#7c3aed' },
      { key: 'CITIZEN',             label: 'Citizen',             icon: 'person',               color: 'var(--color-success)' },
    ];
    return roles.map(r => ({
      ...r,
      count: this.allUsers.filter(u => u.role === r.key).length,
      pct: Math.round((this.allUsers.filter(u => u.role === r.key).length / total) * 100)
    }));
  }
}
