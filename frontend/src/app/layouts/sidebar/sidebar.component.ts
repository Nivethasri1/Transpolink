import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';

interface NavItem { label: string; icon: string; route: string; }

const NAV_CONFIG: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard',          icon: 'dashboard',       route: '/admin' },
    { label: 'Traffic Monitoring', icon: 'traffic',         route: '/traffic' },
    { label: 'Transport Ops',      icon: 'directions_bus',  route: '/transport' },
    { label: 'Compliance / Audit', icon: 'fact_check',      route: '/government' },
    { label: 'Incidents',          icon: 'report_problem',  route: '/incidents' },
    { label: 'Notifications',      icon: 'notifications',   route: '/notifications' },
    { label: 'Reports',            icon: 'bar_chart',       route: '/reports' }
  ],
  CITIZEN: [
    { label: 'Dashboard',          icon: 'dashboard',       route: '/citizen' },
    { label: 'Traffic Updates',    icon: 'traffic',         route: '/citizen/traffic' },
    { label: 'Transport Routes',   icon: 'directions_bus',  route: '/citizen/routes' },
    { label: 'Report Incident',    icon: 'report_problem',  route: '/incidents' },
    { label: 'Notifications',      icon: 'notifications',   route: '/notifications' }
  ],
  TRAFFIC_OFFICER: [
    { label: 'Dashboard',      icon: 'dashboard',      route: '/traffic' },
    { label: 'Road Segments',  icon: 'map',            route: '/traffic/roads' },
    { label: 'Traffic Flows',  icon: 'show_chart',     route: '/traffic/flows' },
    { label: 'Incidents',      icon: 'report_problem', route: '/incidents' },
    { label: 'Notifications',  icon: 'notifications',  route: '/notifications' }
  ],
  TRANSPORT_OPERATOR: [
    { label: 'Dashboard',     icon: 'dashboard',      route: '/transport' },
    { label: 'Routes',        icon: 'route',          route: '/transport/routes' },
    { label: 'Fleet',         icon: 'directions_bus', route: '/transport/fleet' },
    { label: 'Incidents',     icon: 'report_problem', route: '/incidents' },
    { label: 'Notifications', icon: 'notifications',  route: '/notifications' }
  ],
  COMPLIANCE_OFFICER: [
    { label: 'Dashboard',          icon: 'dashboard',      route: '/government' },
    { label: 'Records',            icon: 'fact_check',     route: '/compliance/records' },
    { label: 'Audits',             icon: 'manage_search',  route: '/compliance/audits' },
    { label: 'Reports',            icon: 'bar_chart',      route: '/reports' },
    { label: 'Notifications',      icon: 'notifications',  route: '/notifications' }
  ]
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN:               'Administrator',
  CITIZEN:             'Citizen',
  TRAFFIC_OFFICER:     'Traffic Officer',
  TRANSPORT_OPERATOR:  'Transport Operator',
  COMPLIANCE_OFFICER:  'Compliance Officer'
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();
  navItems: NavItem[] = [];
  userName = '';
  userId = '';
  role = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.navItems = role ? NAV_CONFIG[role] : [];
    this.userName  = this.auth.getName();
    this.userId    = this.auth.getUserId()?.toString() ?? '';
    this.role      = role ? ROLE_LABELS[role] : '';
  }

  logout(): void { this.auth.logout(); }
}
