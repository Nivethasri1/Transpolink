// Exact match with backend Role enum
export type Role = 'ADMIN' | 'CITIZEN' | 'TRAFFIC_OFFICER' | 'TRANSPORT_OPERATOR' | 'COMPLIANCE_OFFICER';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface LoginRequest {
  email: string;
  password: string;
}

// Self-registration — user picks their role, admin only approves/rejects
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

// Registration response — no JWT, account is PENDING
export interface RegisterResponse {
  userId: number;
  name: string;
  email: string;
  status: UserStatus;
  message: string;
}

// Login response — JWT only issued for ACTIVE users
export interface AuthResponse {
  token: string;
  role: Role;
  userId: number;
  name: string;
}

// Admin assigns role when approving
export interface ApprovalRequest {
  role: Role;
}

export interface UserResponse {
  userId: number;
  name: string;
  role: Role | null;   // null until admin approves
  email: string;
  phone: string;
  status: UserStatus;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  exp: number;
  iat: number;
}
