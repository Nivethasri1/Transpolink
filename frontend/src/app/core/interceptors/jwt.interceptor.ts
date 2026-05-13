/**
 * JWT INTERCEPTOR — Concept
 * --------------------------
 * An HTTP Interceptor is middleware that sits between Angular's HttpClient
 * and every outgoing HTTP request. It intercepts the request, modifies it,
 * and passes it along — without the calling component knowing.
 *
 * Purpose:
 *   1. Automatically attach the JWT Bearer token to every API request.
 *   2. Handle 401 Unauthorized responses by logging the user out.
 *
 * How it works:
 *   Every time Angular makes an HTTP call (GET, POST, PATCH, DELETE):
 *
 *   OUTGOING REQUEST:
 *   1. Interceptor reads the JWT from sessionStorage via AuthService.
 *   2. If token exists, it clones the request and adds the header:
 *        Authorization: Bearer <token>
 *   3. The cloned request (with header) is sent to the backend.
 *   4. If no token (e.g. login/register calls), request goes unchanged.
 *
 *   INCOMING RESPONSE:
 *   5. If the backend returns 401 (token expired or invalid):
 *        → Clear sessionStorage (logout)
 *        → Redirect to /login
 *   6. All other responses pass through normally.
 *
 * Why clone the request?
 *   HttpRequest objects are immutable in Angular. You cannot modify them
 *   directly — you must clone and return the modified copy.
 *
 * Why use a functional interceptor (HttpInterceptorFn)?
 *   Angular 17 uses standalone functional interceptors registered in
 *   provideHttpClient(withInterceptors([...])) — no class needed.
 *
 * Registered in:
 *   app.config.ts → provideHttpClient(withInterceptors([jwtInterceptor]))
 *
 * Flow:
 *   Component calls this.http.get('/api/road-segments')
 *     → jwtInterceptor intercepts
 *       → Adds: Authorization: Bearer eyJhbGci...
 *         → Request reaches API Gateway
 *           → Gateway validates JWT
 *             → 200 OK → data returned to component
 *             → 401    → interceptor logs user out → redirect /login
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Skip attaching token for login and register endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expired or rejected by backend — force logout
      if (error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
