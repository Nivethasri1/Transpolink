import { Routes } from '@angular/router';
import { authGuard }      from './core/guards/auth.guard';
import { roleGuard }      from './core/guards/role.guard';
import { adminOnlyGuard } from './core/guards/admin-only.guard';

import { LoginComponent }              from './auth/login.component';
import { RegisterComponent }           from './auth/register.component';
import { ShellComponent }              from './layouts/shell.component';
import { UnauthorizedComponent }       from './shared/components/unauthorized/unauthorized.component';

import { AdminDashboardComponent }     from './dashboard/admin/admin-dashboard.component';
import { TrafficDashboardComponent }   from './dashboard/traffic/traffic-dashboard.component';
import { TrafficRoadsComponent }       from './dashboard/traffic/traffic-roads.component';
import { TrafficFlowsComponent }       from './dashboard/traffic/traffic-flows.component';
import { GovernmentDashboardComponent } from './dashboard/government/government-dashboard.component';
import { ComplianceRecordsComponent }   from './dashboard/compliance/compliance-records.component';
import { ComplianceAuditsComponent }    from './dashboard/compliance/compliance-audits.component';
import { TransportDashboardComponent } from './dashboard/transport-company/transport-dashboard.component';
import { TransportRoutesComponent }   from './dashboard/transport-company/transport-routes.component';
import { TransportFleetComponent }    from './dashboard/transport-company/transport-fleet.component';
import { CitizenDashboardComponent }   from './dashboard/citizen/citizen-dashboard.component';
import { CitizenTrafficComponent }     from './dashboard/citizen/citizen-traffic.component';
import { CitizenRoutesComponent }      from './dashboard/citizen/citizen-routes.component';
import { IncidentDashboardComponent }  from './dashboard/incidents/incident-dashboard.component';
import { NotificationsComponent }      from './dashboard/notifications/notifications.component';
import { ReportsComponent }            from './dashboard/reports/reports.component';

export const routes: Routes = [
  // Public
  { path: '',             redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',        component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Public self-registration — account starts as PENDING, no JWT issued
  { path: 'register',     component: RegisterComponent },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // ADMIN — full access + approval panel
      { path: 'admin',      component: AdminDashboardComponent,      canActivate: [roleGuard(['ADMIN'])] },

      // TRAFFIC_OFFICER — road segments, traffic flows, incidents
      { path: 'traffic',        component: TrafficDashboardComponent,    canActivate: [roleGuard(['TRAFFIC_OFFICER', 'ADMIN'])] },
      { path: 'traffic/roads',   component: TrafficRoadsComponent,        canActivate: [roleGuard(['TRAFFIC_OFFICER', 'ADMIN'])] },
      { path: 'traffic/flows',   component: TrafficFlowsComponent,        canActivate: [roleGuard(['TRAFFIC_OFFICER', 'ADMIN'])] },

      // COMPLIANCE_OFFICER — compliance, audits, reports
      { path: 'government',           component: GovernmentDashboardComponent, canActivate: [roleGuard(['COMPLIANCE_OFFICER', 'ADMIN'])] },
      { path: 'compliance/records',   component: ComplianceRecordsComponent,   canActivate: [roleGuard(['COMPLIANCE_OFFICER', 'ADMIN'])] },
      { path: 'compliance/audits',    component: ComplianceAuditsComponent,    canActivate: [roleGuard(['COMPLIANCE_OFFICER', 'ADMIN'])] },

      // TRANSPORT_OPERATOR — routes, schedules, fleet
      { path: 'transport',         component: TransportDashboardComponent, canActivate: [roleGuard(['TRANSPORT_OPERATOR', 'ADMIN'])] },
      { path: 'transport/routes',  component: TransportRoutesComponent,    canActivate: [roleGuard(['TRANSPORT_OPERATOR', 'ADMIN'])] },
      { path: 'transport/fleet',   component: TransportFleetComponent,     canActivate: [roleGuard(['TRANSPORT_OPERATOR', 'ADMIN'])] },

      // CITIZEN — public traffic info, incident reporting
      { path: 'citizen',         component: CitizenDashboardComponent,    canActivate: [roleGuard(['CITIZEN', 'ADMIN'])] },
      { path: 'citizen/traffic',  component: CitizenTrafficComponent,      canActivate: [roleGuard(['CITIZEN', 'ADMIN'])] },
      { path: 'citizen/routes',   component: CitizenRoutesComponent,       canActivate: [roleGuard(['CITIZEN', 'ADMIN'])] },

      // Incidents — CITIZEN + TRAFFIC_OFFICER + ADMIN
      { path: 'incidents',  component: IncidentDashboardComponent,   canActivate: [roleGuard(['CITIZEN', 'TRAFFIC_OFFICER', 'ADMIN'])] },

      // Notifications — all authenticated roles
      { path: 'notifications', component: NotificationsComponent,   canActivate: [roleGuard(['ADMIN', 'CITIZEN', 'TRAFFIC_OFFICER', 'TRANSPORT_OPERATOR', 'COMPLIANCE_OFFICER'])] },

      // Reports — all authenticated roles
      { path: 'reports',    component: ReportsComponent,             canActivate: [roleGuard(['ADMIN', 'CITIZEN', 'TRAFFIC_OFFICER', 'TRANSPORT_OPERATOR', 'COMPLIANCE_OFFICER'])] },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
