import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserResponse, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get<UserResponse[]>(`${this.base}/users`);
  }

  getUser(id: number) {
    return this.http.get<UserResponse>(`${this.base}/users/${id}`);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }
}
