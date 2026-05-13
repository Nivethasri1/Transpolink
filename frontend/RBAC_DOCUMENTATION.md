# Role-Based Access Control (RBAC) — Complete Documentation

## Overview

Transpolink implements a **3-layer RBAC system** to secure the application:

1. **Authentication Layer** — `authGuard` — Verifies JWT token exists and is not expired
2. **Authorization Layer** — `roleGuard` — Verifies user role matches route requirements
3. **HTTP Security Layer** — `jwtInterceptor` — Attaches JWT to requests, handles 401 auto-logout

---

## Roles in the System

| Role | Access |
|---|---|
| **ADMIN** | Full system access — all modules, user enrollment, user deletion |
| **TRAFFIC_OFFICER** | Traffic monitoring, road segments, traffic flows, incidents |
| **TRANSPORT_OPERATOR** | Fleet management, routes, schedules, vehicle allocation |
| **COMPLIANCE_OFFICER** | Compliance records, audits, regulatory checks |
| **CITIZEN** | Public traffic info, route search, incident reporting |

---

## User Enrollment Flow

### Public Users CANNOT Self-Register
- The `/register` route is **NOT public**.
- It is protected by `adminOnlyGuard` — only logged-in ADMINs can access it.
- The login page has **no "Create Account" link**.

### Admin Enrollment Process
1. ADMIN logs in → navigates to `/admin` dashboard.
2. Clicks **"Enroll New User"** button → routed to `/register`.
3. Fills form: name, email, phone, **role** (including ADMIN), password.
4. Submits → `POST /api/auth/register` → backend creates user.
5. ADMIN session is **NOT overwritten** (uses `enrollUser()` not `login()`).
6. New user can now log in with their credentials.

---

## Guards — How They Work

### 1. `authGuard` (Authentication)

**File:** `core/guards/auth.guard.ts`

**Purpose:** Block ALL unauthenticated users from protected routes.

**Logic:**
```typescript
if (auth.isLoggedIn()) {
  return true;  // Token valid → allow
}
inject(Router).navigate(['/login']);
return false;  // No token → redirect to login
```

**Applied to:** Root `ShellComponent` route — all child routes inherit this check.

**Flow:**
```
User → /admin
  → authGuard checks token
    → No token → redirect /login
    → Token OK → proceed to roleGuard
```

---

### 2. `roleGuard` (Authorization)

**File:** `core/guards/role.guard.ts`

**Purpose:** Ensure authenticated users only access routes their role permits.

**Logic:**
```typescript
export const roleGuard = (allowedRoles: Role[]): CanActivateFn => () => {
  const role = auth.getRole();
  if (role && allowedRoles.includes(role)) {
    return true;  // Role matches → allow
  }
  inject(Router).navigate(['/unauthorized']);
  return false;  // Wrong role → 403 page
};
```

**Applied to:** Each child route individually:
```typescript
{ path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard(['ADMIN'])] }
{ path: 'traffic', component: TrafficDashboardComponent, canActivate: [roleGuard(['TRAFFIC_OFFICER', 'ADMIN'])] }
```

**Flow:**
```
CITIZEN → /admin
  → authGuard → token OK
    → roleGuard(['ADMIN']) → role = CITIZEN
      → NOT in allowedRoles → redirect /unauthorized
```

---

### 3. `adminOnlyGuard` (Enrollment Protection)

**File:** `core/guards/admin-only.guard.ts`

**Purpose:** Protect `/register` route — only logged-in ADMINs can enroll users.

**Logic:**
```typescript
if (!auth.isLoggedIn()) {
  router.navigate(['/login']);  // Not logged in → login
  return false;
}
if (auth.getRole() !== 'ADMIN') {
  router.navigate(['/unauthorized']);  // Not admin → 403
  return false;
}
return true;  // Logged in as ADMIN → allow
```

**Applied to:** `/register` route only.

**Flow:**
```
Public user → /register
  → adminOnlyGuard → not logged in → redirect /login

CITIZEN → /register
  → adminOnlyGuard → logged in but role = CITIZEN → redirect /unauthorized

ADMIN → /register
  → adminOnlyGuard → logged in AND role = ADMIN → render enrollment form
```

---

## Interceptor — HTTP Security

### `jwtInterceptor`

**File:** `core/interceptors/jwt.interceptor.ts`

**Purpose:**
1. Automatically attach JWT Bearer token to every API request.
2. Auto-logout on 401 Unauthorized (token expired/invalid).

**Logic:**

**Outgoing Request:**
```typescript
const token = auth.getToken();
if (token && !isAuthEndpoint) {
  req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
return next(req);
```

**Incoming Response:**
```typescript
.pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      auth.logout();  // Clear session, redirect /login
    }
    return throwError(() => error);
  })
);
```

**Flow:**
```
Component → this.http.get('/api/road-segments')
  → jwtInterceptor intercepts
    → Adds: Authorization: Bearer eyJhbGci...
      → Request sent to API Gateway
        → Gateway validates JWT
          → 200 OK → data returned
          → 401 Unauthorized → interceptor logs user out → redirect /login
```

---

## Session Storage

### Keys Stored
| Key | Value | Source |
|---|---|---|
| `tl_token` | JWT Bearer token | `AuthResponse.token` |
| `tl_role` | User role | `AuthResponse.role` |
| `tl_userId` | User ID | `AuthResponse.userId` |

### Why sessionStorage over localStorage?
- **sessionStorage** is cleared when the browser tab closes → automatic session termination.
- **localStorage** persists indefinitely → security risk for sensitive systems.

---

## Route Protection Matrix

| Route | Public | Roles Allowed | Guards Applied |
|---|---|---|---|
| `/login` | ✅ Yes | All | None |
| `/unauthorized` | ✅ Yes | All | None |
| `/register` | ❌ No | ADMIN only | `adminOnlyGuard` |
| `/admin` | ❌ No | ADMIN | `authGuard` + `roleGuard(['ADMIN'])` |
| `/traffic` | ❌ No | TRAFFIC_OFFICER, ADMIN | `authGuard` + `roleGuard(['TRAFFIC_OFFICER', 'ADMIN'])` |
| `/fleet` | ❌ No | TRANSPORT_OPERATOR, ADMIN | `authGuard` + `roleGuard(['TRANSPORT_OPERATOR', 'ADMIN'])` |
| `/compliance` | ❌ No | COMPLIANCE_OFFICER, ADMIN | `authGuard` + `roleGuard(['COMPLIANCE_OFFICER', 'ADMIN'])` |
| `/citizen` | ❌ No | CITIZEN, ADMIN | `authGuard` + `roleGuard(['CITIZEN', 'ADMIN'])` |
| `/incidents` | ❌ No | CITIZEN, TRAFFIC_OFFICER, ADMIN | `authGuard` + `roleGuard(['CITIZEN', 'TRAFFIC_OFFICER', 'ADMIN'])` |

---

## Authentication Flow

### Login
```
1. User enters email + password
2. Frontend → POST /api/auth/login { email, password }
3. Backend validates credentials
4. Backend generates JWT with { sub: userId, role: role, exp: timestamp }
5. Backend returns { token, role, userId }
6. Frontend stores in sessionStorage
7. Frontend redirects to role-specific dashboard
```

### Enrollment (Admin Only)
```
1. ADMIN clicks "Enroll New User"
2. ADMIN fills form (name, email, phone, role, password)
3. Frontend → POST /api/auth/register { name, email, phone, role, password }
4. Backend creates user in database
5. Backend returns { token, role, userId } (for the NEW user, not used by frontend)
6. Frontend shows success message
7. ADMIN session remains intact
8. New user can now log in
```

### Logout
```
1. User clicks "Logout"
2. Frontend clears sessionStorage
3. Frontend redirects to /login
4. All guards now fail → user cannot access protected routes
```

---

## JWT Token Structure

### Payload (decoded from token)
```json
{
  "sub": "5",           // userId as string
  "role": "ADMIN",      // user role
  "iat": 1704067200,    // issued at (Unix timestamp)
  "exp": 1704153600     // expires at (Unix timestamp)
}
```

### Token Validation
- **Frontend:** Decodes JWT, checks `exp` claim against `Date.now()`.
- **Backend:** Validates signature using `jwt.secret`, checks expiry.
- **API Gateway:** Extracts `role` and `userId`, forwards as headers to microservices.

---

## Security Best Practices Implemented

✅ **No public self-registration** — only ADMIN can enroll users  
✅ **JWT auto-expiry** — tokens expire after 24 hours (configurable)  
✅ **Auto-logout on 401** — interceptor clears session if token rejected  
✅ **sessionStorage** — cleared on tab close, not persistent  
✅ **Role-based route guards** — unauthorized access blocked at router level  
✅ **Bearer token in headers** — not in URL params (prevents logging)  
✅ **Password confirmation** — enrollment form validates password match  
✅ **Email validation** — enforced at form level  

---

## Testing the RBAC System

### Test Case 1: Public User Tries to Access Protected Route
```
1. Open browser in incognito mode
2. Navigate to http://localhost:4200/admin
3. Expected: Redirected to /login (authGuard blocks)
```

### Test Case 2: CITIZEN Tries to Access ADMIN Route
```
1. Login as CITIZEN
2. Manually navigate to /admin
3. Expected: Redirected to /unauthorized (roleGuard blocks)
```

### Test Case 3: CITIZEN Tries to Self-Register
```
1. Login as CITIZEN
2. Manually navigate to /register
3. Expected: Redirected to /unauthorized (adminOnlyGuard blocks)
```

### Test Case 4: ADMIN Enrolls New User
```
1. Login as ADMIN
2. Click "Enroll New User"
3. Fill form, assign role = TRAFFIC_OFFICER
4. Submit
5. Expected: Success message, ADMIN session intact
6. Logout, login as new user
7. Expected: Redirected to /traffic dashboard
```

### Test Case 5: Token Expiry
```
1. Login as any user
2. Wait 24 hours (or modify jwt.expiration in backend to 1 minute for testing)
3. Make any API call
4. Expected: 401 response → interceptor logs user out → redirect /login
```

---

## File Structure

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts          ← Authentication check
│   │   ├── role.guard.ts          ← Authorization check
│   │   └── admin-only.guard.ts    ← Enrollment protection
│   ├── interceptors/
│   │   └── jwt.interceptor.ts     ← JWT attachment + 401 handling
│   ├── services/
│   │   └── auth.service.ts        ← login(), enrollUser(), logout()
│   └── models/
│       └── auth.model.ts          ← Role type, DTOs
├── auth/
│   ├── login.component.*          ← Public login page
│   └── register.component.*       ← Admin-only enrollment page
└── app.routes.ts                  ← Route definitions + guard assignments
```

---

## Summary

This RBAC system ensures:
- **Only authenticated users** can access protected routes (authGuard).
- **Only authorized roles** can access specific modules (roleGuard).
- **Only ADMINs** can enroll new users (adminOnlyGuard).
- **JWT tokens** are automatically attached to API requests (jwtInterceptor).
- **Expired tokens** trigger automatic logout (jwtInterceptor).
- **Session data** is cleared on tab close (sessionStorage).

The system is **secure, scalable, and maintainable** — following Angular best practices and enterprise-level RBAC patterns.
