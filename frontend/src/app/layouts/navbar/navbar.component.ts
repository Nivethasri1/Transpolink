import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, MatBadgeModule, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();
  userName = this.auth.getName();
  roleLabel = this.auth.getRole()?.replace(/_/g, ' ') ?? '';
  unreadCount = 0;

  constructor(
    private auth: AuthService,
    private notifService: NotificationService,
    public theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.notifService.unreadCount$.subscribe(count => this.unreadCount = count);
    const userId = this.auth.getUserId();
    if (userId) this.notifService.refreshUnreadCount(userId);
  }

  logout(): void { this.auth.logout(); }
}
