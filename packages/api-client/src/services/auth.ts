import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  username?: string; // 支持 username 字段
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  password: string;
}

export interface AuthResponse {
  token: string; // 后端返回的是 token，不是 access_token
  user: {
    id: string;
    email: string;
    username?: string;
    role: string;
  };
}

export class AuthService {
  constructor(private client: ApiClient) {}

  async login(data: LoginDto): Promise<AuthResponse> {
    return this.client.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    return this.client.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  }

  async getProfile(): Promise<any> {
    return this.client.get(API_ENDPOINTS.auth.profile);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    return this.client.post('/auth/reset-password', data);
  }
}
