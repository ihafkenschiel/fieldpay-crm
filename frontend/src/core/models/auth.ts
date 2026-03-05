export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
  expiresAt: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
