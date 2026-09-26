// Match FlipLeo.Core.DTOs.Auth

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string; // ISO date (UTC)
  user: UserProfile;
}
