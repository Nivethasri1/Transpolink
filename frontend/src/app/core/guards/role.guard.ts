/**
 * ROLE GUARD — Concept
 * --------------------
 * This is the second layer of the RBAC system, applied AFTER authGuard.
 *
 * Purpose:
 *   Ensures that even authenticated users can only access routes
 *   that their role is permitted to see. A CITIZEN cannot visit /admin,
 *   a TRAFFIC_OFFICER cannot visit /fleet, etc.
 *
 * How it works:
 *   roleGuard is a factory function — it takes an array of allowed roles
 *   and returns a CanActivateFn. This makes it reusable per route:
 *
 *     canActivate: [roleGuard(['ADMIN'])]
 *     canActivate: [roleGuard(['TRAFFIC_OFFICER', 'ADMIN'])]
 *
 *   At runtime:
 *   1. Reads the role stored in sessionStorage (set during login).
 *   2. Checks if that role is in the allowedRoles array.
 *   3. If YES → returns true → route renders.
 *   4. If NO  → redirects to /unauthorized (403 page).
 *
 * Role → Route mapping:
 *   ADMIN               → /admin, /traffic, /fleet, /compliance, /incidents
 *   TRAFFIC_OFFICER     → /traffic, /incidents
 *   TRANSPORT_OPERATOR  → /fleet
 *   COMPLIANCE_OFFICER  → /compliance
 *   CITIZEN             → /citizen, /incidents
 *
 * Why store role in sessionStorage instead of decoding JWT each time?
 *   The backend returns role directly in AuthResponse. Storing it
 *   separately avoids repeated JWT decoding on every guard check,
 *   and sessionStorage is cleared when the browser tab closes
 *   (more secure than localStorage).
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const role = auth.getRole();

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  // Authenticated but wrong role — send to 403 page
  inject(Router).navigate(['/unauthorized']);
  return false;
};
