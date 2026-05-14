# Transpolink — Transportation & Traffic Management System

A full-stack enterprise application built with **Angular 17** frontend and **Spring Boot microservices** backend, secured with **JWT authentication** and **Role-Based Access Control (RBAC)**.

---

## Architecture Overview

```
Angular Frontend (4200)
        │
        ▼
API Gateway (8099)  ←── JWT validation + routing
        │
        ├── identity-service    (9090)  ← Auth, Users
        ├── traffic-service     (8083)  ← Road Segments, Traffic Flows
        ├── transport-service   (8084)  ← Routes, Schedules, Fleet
        ├── incident-service    (8011)  ← Incidents, Resolutions
        ├── compliance-service  (8085)  ← Compliance Records, Audits
        ├── reporting-service   (8086)  ← Reports
        └── notification-service(8087)  ← Notifications

Service Registry / Eureka (8761)  ← Service discovery
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17, Angular Material, TypeScript |
| Backend | Spring Boot 3.2, Spring Security, Spring Cloud |
| Auth | JWT (jjwt 0.11.5), RBAC |
| Database | MySQL 8 |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway |

---

## Roles & Access

| Role | Dashboard | Capabilities |
|---|---|---|
| **ADMIN** | `/admin` | Full access, user enrollment, all modules |
| **TRAFFIC_OFFICER** | `/traffic` | Road segments, traffic flows, incidents |
| **TRANSPORT_OPERATOR** | `/fleet` | Routes, schedules, fleet vehicles |
| **COMPLIANCE_OFFICER** | `/compliance` | Compliance records, audits, reports |
| **CITIZEN** | `/citizen` | Public traffic info, incident reporting |

---

## Prerequisites

- Java 21
- Maven 3.9+
- MySQL 8
- Node.js 18+ and npm
- IntelliJ IDEA (recommended)

---

## Step 1 — Environment Variable

All services require `JWT_SECRET`. Set it as a system environment variable:

**Windows (Command Prompt as Administrator):**
```cmd
setx JWT_SECRET "transpolink-super-secret-key-minimum-32-characters-long" /M
```

**Or set in IntelliJ Run Configuration:**
- Run → Edit Configurations → Environment Variables
- Add: `JWT_SECRET=transpolink-super-secret-key-minimum-32-characters-long`
- Apply to ALL 8 service run configurations

---

## Step 2 — MySQL Setup

Open MySQL Workbench or any MySQL client and run:

```sql
CREATE DATABASE IF NOT EXISTS transpolink_identity;
CREATE DATABASE IF NOT EXISTS transpolink_traffic;
CREATE DATABASE IF NOT EXISTS transpolink_transport;
CREATE DATABASE IF NOT EXISTS transpolink_incident;
CREATE DATABASE IF NOT EXISTS transpolink_compliance;
CREATE DATABASE IF NOT EXISTS transpolink_reporting;
CREATE DATABASE IF NOT EXISTS transpolink_notification;
```

Or run the provided script:
```
backend/setup-databases.sql
```

All services use:
- Host: `localhost:3306`
- Username: `${username}`
- Password: `${password}`

Update `application.properties` in each service if your credentials differ.

---

## Step 3 — Fix service-registry (ClassNotFoundException)

The service-registry needs to be compiled before running:

**Option A — IntelliJ Maven Panel:**
1. Open Maven panel (right side of IntelliJ)
2. Expand `service-registry` → `Lifecycle`
3. Double-click `clean` then `compile`

**Option B — IntelliJ Build Menu:**
1. Select `service-registry` module in Project panel
2. Build → Build Module 'service-registry'

**Option C — Terminal (if Maven is on PATH):**
```cmd
cd backend\service-registry
mvn clean compile
```

**Option D — Fix Run Configuration:**
1. Run → Edit Configurations → ServiceRegistryApplication
2. Under "Use classpath of module" → select `service-registry`
3. Apply → OK → Run

---

## Step 4 — Start Backend Services (IN ORDER)

Start each service in IntelliJ. **Order matters** — Eureka must be first.

| Order | Service | Main Class | Port |
|---|---|---|---|
| 1 | service-registry | `ServiceRegistryApplication` | 8761 |
| 2 | identity-service | `IdentityServiceApplication` | 9090 |
| 3 | traffic-service | `TrafficServiceApplication` | 8083 |
| 4 | transport-service | `TransportServiceApplication` | 8084 |
| 5 | incident-service | `IncidentServiceApplication` | 8011 |
| 6 | compliance-service | `ComplianceServiceApplication` | 8085 |
| 7 | reporting-service | `ReportingServiceApplication` | 8086 |
| 8 | notification-service | `NotificationServiceApplication` | 8087 |
| 9 | api-gateway | `ApiGatewayApplication` | 8099 |

**Verify Eureka:** Open http://localhost:8761 — all services should appear as registered.

---

## Step 5 — Start Frontend

```cmd
cd frontend
npm install
npm start
```

Open: http://localhost:4200

---

## Step 6 — Login

The `identity-service` seeds these users on first startup (dev profile):

| Email | Password | Role |
|---|---|---|
| admin@transpolink.com | Admin@123 | ADMIN |
| officer@transpolink.com | Officer@123 | TRAFFIC_OFFICER |
| operator@transpolink.com | Operator@123 | TRANSPORT_OPERATOR |
| compliance@transpolink.com | Compliance@123 | COMPLIANCE_OFFICER |
| citizen@transpolink.com | Citizen@123 | CITIZEN |

---

## API Endpoints Reference

### Identity Service (via Gateway: /api/auth/**, /api/users/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/register | Public* | Enroll user |
| GET | /api/users | ADMIN | Get all users |
| GET | /api/users/{id} | ADMIN/Self | Get user |
| DELETE | /api/users/{id} | ADMIN | Delete user |

*Register endpoint is public at API level but protected by `adminOnlyGuard` in Angular frontend.

### Traffic Service (via Gateway: /api/road-segments/**, /api/traffic-flows/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/road-segments | TRAFFIC_OFFICER, ADMIN | Create segment |
| GET | /api/road-segments | All | Get all segments |
| PATCH | /api/road-segments/{id}/status | TRAFFIC_OFFICER, ADMIN | Update status |
| POST | /api/traffic-flows | TRAFFIC_OFFICER, ADMIN | Record flow |
| GET | /api/traffic-flows/segment/{id} | All | Get flows by segment |

### Transport Service (via Gateway: /api/routes/**, /api/schedules/**, /api/fleets/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/routes | TRANSPORT_OPERATOR, ADMIN | Create route |
| GET | /api/routes | All | Get all routes |
| POST | /api/schedules | TRANSPORT_OPERATOR, ADMIN | Create schedule |
| GET | /api/schedules/route/{id} | All | Get schedules by route |
| PATCH | /api/schedules/{id}/status | TRANSPORT_OPERATOR, ADMIN | Update schedule status |
| POST | /api/fleets | TRANSPORT_OPERATOR, ADMIN | Add fleet vehicle |
| GET | /api/fleets/operator/{id} | All | Get fleet by operator |
| PATCH | /api/fleets/{id}/status | TRANSPORT_OPERATOR, ADMIN | Update fleet status |

### Incident Service (via Gateway: /api/incidents/**, /api/resolutions/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/incidents | CITIZEN, TRAFFIC_OFFICER, ADMIN | Report incident |
| GET | /api/incidents | All | Get all incidents |
| PATCH | /api/incidents/{id}/status | TRAFFIC_OFFICER, ADMIN | Update status |
| POST | /api/resolutions | TRAFFIC_OFFICER, ADMIN | Add resolution |
| GET | /api/resolutions/incident/{id} | All | Get resolutions |

### Compliance Service (via Gateway: /api/compliance/**, /api/audits/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/compliance | COMPLIANCE_OFFICER, ADMIN | Create record |
| GET | /api/compliance | COMPLIANCE_OFFICER, ADMIN | Get all records |
| POST | /api/audits | COMPLIANCE_OFFICER, ADMIN | Create audit |
| GET | /api/audits | COMPLIANCE_OFFICER, ADMIN | Get all audits |
| PATCH | /api/audits/{id}/status | COMPLIANCE_OFFICER, ADMIN | Update audit status |

### Reporting Service (via Gateway: /api/reports/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/reports | ADMIN, COMPLIANCE_OFFICER | Generate report |
| GET | /api/reports | All | Get all reports |
| GET | /api/reports/scope/{scope} | All | Filter by scope |

### Notification Service (via Gateway: /api/notifications/**)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/notifications | ADMIN, Officers | Send notification |
| GET | /api/notifications/user/{id} | All | Get user notifications |
| GET | /api/notifications/user/{id}/unread | All | Get unread |
| PATCH | /api/notifications/{id}/read | All | Mark as read |

---

## Frontend Pages

| Route | Component | Roles |
|---|---|---|
| /login | LoginComponent | Public |
| /register | RegisterComponent | ADMIN only |
| /admin | AdminDashboardComponent | ADMIN |
| /traffic | TrafficDashboardComponent | TRAFFIC_OFFICER, ADMIN |
| /fleet | FleetDashboardComponent | TRANSPORT_OPERATOR, ADMIN |
| /compliance | ComplianceDashboardComponent | COMPLIANCE_OFFICER, ADMIN |
| /citizen | CitizenDashboardComponent | CITIZEN, ADMIN |
| /incidents | IncidentDashboardComponent | CITIZEN, TRAFFIC_OFFICER, ADMIN |
| /notifications | NotificationsComponent | All roles |
| /reports | ReportsComponent | All roles (generate: ADMIN, COMPLIANCE_OFFICER) |
| /unauthorized | UnauthorizedComponent | Public |

---

## Frontend Security (RBAC)

```
Request → authGuard → roleGuard → Component renders
              │              │
              ▼              ▼
          /login      /unauthorized
```

| Guard | File | Purpose |
|---|---|---|
| `authGuard` | core/guards/auth.guard.ts | Block unauthenticated users |
| `roleGuard` | core/guards/role.guard.ts | Block wrong-role users |
| `adminOnlyGuard` | core/guards/admin-only.guard.ts | Protect /register |
| `jwtInterceptor` | core/interceptors/jwt.interceptor.ts | Attach JWT + handle 401 |

---

## Project Structure

```
Transpolink/
├── backend/
│   ├── service-registry/      ← Eureka Server (8761)
│   ├── api-gateway/           ← Spring Cloud Gateway (8099)
│   ├── identity-service/      ← Auth + Users (9090)
│   ├── traffic-service/       ← Traffic (8083)
│   ├── transport-service/     ← Transport (8084)
│   ├── incident-service/      ← Incidents (8011)
│   ├── compliance-service/    ← Compliance (8085)
│   ├── reporting-service/     ← Reports (8086)
│   ├── notification-service/  ← Notifications (8087)
│   └── setup-databases.sql    ← MySQL setup script
│
└── frontend/
    └── src/app/
        ├── auth/              ← Login, Register
        ├── core/
        │   ├── guards/        ← authGuard, roleGuard, adminOnlyGuard
        │   ├── interceptors/  ← jwtInterceptor
        │   ├── models/        ← All TypeScript interfaces
        │   └── services/      ← All API services
        ├── dashboard/
        │   ├── admin/         ← Admin dashboard
        │   ├── traffic/       ← Traffic monitoring
        │   ├── fleet/         ← Fleet management
        │   ├── compliance/    ← Compliance
        │   ├── citizen/       ← Citizen + Incidents
        │   ├── notifications/ ← Notifications
        │   └── reports/       ← Reports
        ├── layouts/           ← Shell, Sidebar, Navbar
        └── shared/            ← StatCard, Unauthorized
```

---

## Troubleshooting

### ClassNotFoundException: ServiceRegistryApplication
The service-registry was not compiled. See Step 3 above.

### 401 Unauthorized on all API calls
JWT_SECRET environment variable is not set. See Step 1 above.

### Services not appearing in Eureka
Start service-registry first and wait 30 seconds before starting other services.

### CORS errors in browser
The API Gateway has CORS configured for `http://localhost:4200`. If you're running Angular on a different port, update `application.properties` in api-gateway.

### MySQL connection refused
Ensure MySQL is running on port 3306 with username `root` / password `root`, or update `application.properties` in each service.

### npm install fails
Ensure Node.js 18+ is installed: `node --version`

---

## Database Schema (auto-created by Hibernate)

Each service creates its own tables on startup (`spring.jpa.hibernate.ddl-auto=update`):

| Database | Tables |
|---|---|
| transpolink_identity | users, audit_logs |
| transpolink_traffic | road_segments, traffic_flows |
| transpolink_transport | transport_routes, schedules, fleets |
| transpolink_incident | incidents, resolutions |
| transpolink_compliance | compliance_records, audits |
| transpolink_reporting | reports |
| transpolink_notification | notifications |
