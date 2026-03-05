import type { LoginRequest, LoginResponse, AuthTokens } from '@fieldpay/core';
import type { HttpClient } from '../http';

export class AuthApi {
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials);
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>('/auth/refresh', { refreshToken });
  }

  logout(): Promise<void> {
    return this.http.post<void>('/auth/logout');
  }
}
