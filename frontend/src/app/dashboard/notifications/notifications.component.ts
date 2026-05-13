import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse, NotificationCategory } from '../../core/models/notification.model';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin } from 'rxjs';
import { Role } from '../../core/models/auth.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationResponse[] = [];
  canSend = false;
  showForm = false;
  isCitizen = false;
  userId: number | null = null;
  notifSearch = '';
  notifStatusFilter = 'ALL';
  notifCategoryFilter = 'ALL';

  get filteredNotifications() {
    let list = this.notifications;
    // Citizens only see INCIDENT and TRANSPORT notifications
    if (this.isCitizen) list = list.filter(n => n.category === 'INCIDENT' || n.category === 'TRANSPORT');
    if (this.notifStatusFilter !== 'ALL') list = list.filter(n => n.status === this.notifStatusFilter);
    if (this.notifCategoryFilter !== 'ALL') list = list.filter(n => n.category === this.notifCategoryFilter);
    if (this.notifSearch.trim()) {
      const q = this.notifSearch.toLowerCase();
      list = list.filter(n => n.message.toLowerCase().includes(q));
    }
    return list;
  }

  get visibleCategories(): NotificationCategory[] {
    return this.isCitizen ? ['INCIDENT', 'TRANSPORT'] : this.categories;
  }

  categories: NotificationCategory[] = ['INCIDENT', 'TRANSPORT', 'COMPLIANCE'];

  sendForm = this.fb.group({
    targetRole: ['' as string, Validators.required],
    category:   ['' as NotificationCategory, Validators.required],
    message:    ['', Validators.required]
  });

  targetRoles: { value: string; label: string }[] = [
    { value: 'CITIZEN',            label: 'All Citizens' },
    { value: 'TRAFFIC_OFFICER',    label: 'All Traffic Officers' },
    { value: 'TRANSPORT_OPERATOR', label: 'All Transport Operators' },
    { value: 'COMPLIANCE_OFFICER', label: 'All Compliance Officers' },
    { value: 'ADMIN',              label: 'All Admins' }
  ];

  constructor(
    private notifService: NotificationService,
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.canSend = role === 'ADMIN' || role === 'TRAFFIC_OFFICER' || role === 'TRANSPORT_OPERATOR' || role === 'COMPLIANCE_OFFICER';
    this.isCitizen = role === 'CITIZEN';
    this.userId = this.auth.getUserId();
    this.loadNotifications();
  }

  loadNotifications(): void {
    const role = this.auth.getRole();
    if (role === 'ADMIN') {
      this.notifService.getAll().subscribe(data => this.notifications = data);
    } else if (this.userId) {
      this.notifService.getByUser(this.userId).subscribe(data => this.notifications = data);
    }
  }

  send(): void {
    if (this.sendForm.invalid) return;
    const { targetRole, category, message } = this.sendForm.value;
    this.auth.getUsersByRole(targetRole!).subscribe({
      next: (users) => {
        const activeUsers = users.filter(u => u.status === 'ACTIVE');
        if (activeUsers.length === 0) {
          this.snack.open(`No active ${targetRole} users found`, 'OK', { duration: 3000 });
          return;
        }
        const sends = activeUsers.map(u =>
          this.notifService.send({ userId: u.userId, message: message!, category: category! })
        );
        forkJoin(sends).subscribe({
          next: () => {
            this.loadNotifications();
            this.sendForm.reset();
            this.showForm = false;
            this.snack.open(`Sent to ${activeUsers.length} ${targetRole?.replace('_',' ')} user(s)`, 'OK', { duration: 3000 });
          },
          error: () => this.snack.open('Failed to send some notifications', 'OK', { duration: 3000 })
        });
      },
      error: (err) => this.snack.open(`Failed to fetch users: ${err?.status}`, 'OK', { duration: 4000 })
    });
  }

  markRead(id: number): void {
    this.notifService.markAsRead(id).subscribe({
      next: () => {
        this.loadNotifications();
        this.snack.open('Marked as read', 'OK', { duration: 2000 });
      }
    });
  }

  get unreadCount() { return this.filteredNotifications.filter(n => n.status === 'UNREAD').length; }
  get readCount()   { return this.filteredNotifications.filter(n => n.status === 'READ').length; }
}
