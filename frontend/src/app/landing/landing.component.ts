import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  private enteredAsDark = false;

  constructor(public theme: ThemeService) {}

  ngOnInit(): void {
    this.enteredAsDark = this.theme.isDark();
    if (this.theme.isDark()) this.theme.toggle(); // force light on landing
  }

  ngOnDestroy(): void {
    // restore dark if user had it before visiting landing
    if (this.enteredAsDark && !this.theme.isDark()) this.theme.toggle();
  }

  platformStats = [
    { value: '7',      label: 'Microservices',    color: '#0d9488' },
    { value: '5',      label: 'User Roles',        color: '#d97706' },
    { value: 'JWT',    label: 'Authentication',    color: '#6366f1' },
    { value: 'RBAC',   label: 'Access Control',    color: '#10b981' },
    { value: 'MySQL',  label: 'Database',          color: '#ef4444' },
    { value: 'Eureka', label: 'Service Discovery', color: '#0d9488' },
  ];

  features = [
    {
      icon: 'map', iconBg: 'rgba(13,148,136,0.1)', iconColor: '#0d9488',
      title: 'Traffic Monitoring',
      desc: 'Monitor road segments in real-time, record traffic flows, and update segment statuses instantly.',
      tags: ['Road Segments', 'Traffic Flows', 'Status Updates']
    },
    {
      icon: 'report_problem', iconBg: 'rgba(239,68,68,0.1)', iconColor: '#ef4444',
      title: 'Incident Management',
      desc: 'Report, track and resolve road incidents with full resolution history and status workflows.',
      tags: ['Incident Reporting', 'Resolutions', 'Status Tracking']
    },
    {
      icon: 'directions_bus', iconBg: 'rgba(217,119,6,0.1)', iconColor: '#d97706',
      title: 'Fleet & Transport',
      desc: 'Manage bus and train routes, schedules, and fleet vehicles with real-time status tracking.',
      tags: ['Routes', 'Schedules', 'Fleet Vehicles']
    },
    {
      icon: 'manage_search', iconBg: 'rgba(99,102,241,0.1)', iconColor: '#6366f1',
      title: 'Compliance & Audits',
      desc: 'Create compliance records, initiate audits, and maintain a full regulatory audit trail.',
      tags: ['Compliance Records', 'Audits', 'Regulatory']
    },
    {
      icon: 'bar_chart', iconBg: 'rgba(16,185,129,0.1)', iconColor: '#10b981',
      title: 'Reporting',
      desc: 'Generate scoped reports across all modules for data-driven decision making.',
      tags: ['Reports', 'Analytics', 'Export']
    },
    {
      icon: 'notifications', iconBg: 'rgba(37,99,235,0.1)', iconColor: '#2563eb',
      title: 'Notifications',
      desc: 'Role-aware notification system with unread tracking and mark-as-read functionality.',
      tags: ['Alerts', 'Unread Tracking', 'Real-time']
    },
    {
      icon: 'admin_panel_settings', iconBg: 'rgba(124,58,237,0.1)', iconColor: '#7c3aed',
      title: 'User Management',
      desc: 'Admin-controlled user enrollment, role assignment, approval workflows and account management.',
      tags: ['Enrollment', 'Role Assignment', 'Approval']
    },
    {
      icon: 'public', iconBg: 'rgba(13,148,136,0.1)', iconColor: '#0d9488',
      title: 'Citizen Portal',
      desc: 'Public-facing portal for citizens to view live traffic conditions and report incidents.',
      tags: ['Public Access', 'Traffic Info', 'Incident Reports']
    },
  ];

  roles = [
    {
      icon: 'admin_panel_settings', iconBg: 'rgba(124,58,237,0.1)', color: '#7c3aed',
      badgeBg: 'rgba(124,58,237,0.1)', badge: 'ADMIN',
      title: 'Administrator',
      desc: 'Full system access with user management, approval workflows, and all module access.',
      perms: ['Manage all users', 'Approve / reject accounts', 'Access all dashboards', 'Generate reports'],
      route: '/admin'
    },
    {
      icon: 'traffic', iconBg: 'rgba(13,148,136,0.1)', color: '#0d9488',
      badgeBg: 'rgba(13,148,136,0.1)', badge: 'TRAFFIC_OFFICER',
      title: 'Traffic Officer',
      desc: 'Monitor and manage road segments, record traffic flows, and handle incidents.',
      perms: ['Manage road segments', 'Record traffic flows', 'Update incident status', 'Add resolutions'],
      route: '/traffic'
    },
    {
      icon: 'directions_bus', iconBg: 'rgba(217,119,6,0.1)', color: '#d97706',
      badgeBg: 'rgba(217,119,6,0.1)', badge: 'TRANSPORT_OPERATOR',
      title: 'Transport Operator',
      desc: 'Manage transport routes, schedules, and fleet vehicles for bus and train services.',
      perms: ['Create & manage routes', 'Schedule management', 'Fleet vehicle tracking', 'Status updates'],
      route: '/transport'
    },
    {
      icon: 'manage_search', iconBg: 'rgba(99,102,241,0.1)', color: '#6366f1',
      badgeBg: 'rgba(99,102,241,0.1)', badge: 'COMPLIANCE_OFFICER',
      title: 'Compliance Officer',
      desc: 'Oversee regulatory compliance records, initiate audits, and generate compliance reports.',
      perms: ['Compliance records', 'Audit management', 'Regulatory reporting', 'Status tracking'],
      route: '/government'
    },
    {
      icon: 'person', iconBg: 'rgba(16,185,129,0.1)', color: '#10b981',
      badgeBg: 'rgba(16,185,129,0.1)', badge: 'CITIZEN',
      title: 'Citizen',
      desc: 'Access live traffic information, view public transport routes, and report incidents.',
      perms: ['View traffic conditions', 'Browse routes', 'Report incidents', 'Receive notifications'],
      route: '/citizen'
    },
  ];

  services = [
    { icon: 'person',         name: 'Identity',     port: ':9090' },
    { icon: 'traffic',        name: 'Traffic',      port: ':8083' },
    { icon: 'directions_bus', name: 'Transport',    port: ':8084' },
    { icon: 'report_problem', name: 'Incident',     port: ':8011' },
    { icon: 'manage_search',  name: 'Compliance',   port: ':8085' },
    { icon: 'bar_chart',      name: 'Reporting',    port: ':8086' },
    { icon: 'notifications',  name: 'Notification', port: ':8087' },
  ];

  techStack = [
    { icon: 'web',           name: 'Angular 17',       desc: 'Frontend SPA',         bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
    { icon: 'code',          name: 'Spring Boot 3',    desc: 'Backend Services',     bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
    { icon: 'verified_user', name: 'JWT + RBAC',       desc: 'Authentication',       bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
    { icon: 'storage',       name: 'MySQL 8',          desc: 'Relational Database',  bg: 'rgba(37,99,235,0.1)',  color: '#2563eb' },
    { icon: 'hub',           name: 'Spring Cloud',     desc: 'Gateway + Eureka',     bg: 'rgba(13,148,136,0.1)', color: '#0d9488' },
    { icon: 'style',         name: 'Angular Material', desc: 'UI Component Library', bg: 'rgba(217,119,6,0.1)',  color: '#d97706' },
  ];
}
