import { apiClient, tokenStorage } from './client';
import type { AuthUser, LoginResponse } from '@/types';

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    tokenStorage.set(data.accessToken);
    return data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>('/auth/me');
    return data;
  },

  logout() {
    tokenStorage.clear();
  },
};