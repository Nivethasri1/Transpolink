/**
 * AUTH GUARD — Concept
 * --------------------
 * This is the first line of defence in the RBAC system.
 *
 * Purpose:
 *   Prevents ANY unauthenticated user from accessing protected routes.
 *   It does NOT care about roles — it only checks whether a valid,
 *   non-expired JWT token exists in sessionStorage.
 *
 * How it works:
 *   1. Angular Router evaluates canActivate before rendering a route.
 *   2. authGuard calls AuthService.isLoggedIn() which:
 *        a. Reads the JWT from sessionStorage.
 *        b. Base64-decodes the payload section (middle part of token).
 *        c. Checks the `exp` (expiry) claim against current time.
 *   3. If token is valid  → returns true  → route renders.
 *   4. If token is missing or expired → redirects to /login.
 *
 * Applied to:
 *   The root ShellComponent route, which wraps ALL protected pages.
 *   This means every child route (admin, traffic, fleet, etc.)
 *   automatically inherits this check.
 *
 * Flow:
 *   Browser → /admin
 *     → authGuard checks token
 *       → No token  → redirect /login
 *       → Token OK  → roleGuard checks role
 *                       → Wrong role → redirect /unauthorized
 *                       → Correct role → render page
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Token missing or expired — send to login
  inject(Router).navigate(['/login']);
  return false;
};
