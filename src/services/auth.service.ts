import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: string;
  avatarUrl: string | null;
  createdAt: string;
}

export const authService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/api/v1/auth/profile');
    return response.data;
  },

  async updateProfile(data: { name?: string }): Promise<UserProfile> {
    const response = await api.patch('/api/v1/auth/profile', data);
    return response.data;
  },
};
