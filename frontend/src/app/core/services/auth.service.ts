import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AuthResponse, JwtPayload, LoginRequest,
  RegisterRequest, RegisterResponse,
  ApprovalRequest, UserResponse, Role
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'tl_token';
  private readonly ROLE_KEY  = 'tl_role';
  private readonly UID_KEY   = 'tl_userId';
  private readonly NAME_KEY  = 'tl_name';

  constructor(private http: HttpClient, private router: Router) {}

  // Public self-registration — returns PENDING confirmation, no JWT
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, data);
  }

  // Login — only ACTIVE users get a JWT
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return sessionStorage.getItem(this.TOKEN_KEY); }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const p = this.decodeToken(token);
    return p ? p.exp * 1000 > Date.now() : false;
  }

  getRole(): Role | null { return sessionStorage.getItem(this.ROLE_KEY) as Role | null; }

  getName(): string { return sessionStorage.getItem(this.NAME_KEY) ?? ''; }

  getUserId(): number | null {
    const id = sessionStorage.getItem(this.UID_KEY);
    return id ? Number(id) : null;
  }

  redirectToDashboard(): void {
    const role = this.getRole();
    const map: Record<Role, string> = {
      ADMIN:               '/admin',
      CITIZEN:             '/citizen',
      TRAFFIC_OFFICER:     '/traffic',
      TRANSPORT_OPERATOR:  '/transport',
      COMPLIANCE_OFFICER:  '/government'
    };
    this.router.navigate([role ? map[role] : '/login']);
  }

  // ── Admin user-management methods ──────────────────────────────────────────

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}/users`);
  }

  getUsersByRole(role: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}/users/role/${role}`);
  }

  getUsersByStatus(status: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}/users/status/${status}`);
  }

  approveUser(id: number, req: ApprovalRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${environment.apiUrl}/users/${id}/approve`, req);
  }

  rejectUser(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${environment.apiUrl}/users/${id}/reject`, {});
  }

  suspendUser(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${environment.apiUrl}/users/${id}/suspend`, {});
  }

  updateRole(id: number, req: ApprovalRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${environment.apiUrl}/users/${id}/role`, req);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  private storeSession(res: AuthResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, res.token);
    sessionStorage.setItem(this.ROLE_KEY,  res.role);
    sessionStorage.setItem(this.UID_KEY,   res.userId.toString());
    sessionStorage.setItem(this.NAME_KEY,  res.name);
  }

  private decodeToken(token: string): JwtPayload | null {
    try { return JSON.parse(atob(token.split('.')[1])) as JwtPayload; }
    catch { return null; }
  }
}
