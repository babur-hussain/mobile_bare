import api from './api';

export interface SocialAccount {
  _id: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'x' | 'threads';
  accountName: string;
  profilePicture: string | null;
  isActive: boolean;
  createdAt: string;
}

export const socialService = {
  async getAccounts(): Promise<SocialAccount[]> {
    const response = await api.get('/api/v1/social-accounts');
    return response.data.data;
  },

  /**
   * Fetches the Meta OAuth authorization URL from the backend.
   * The backend endpoint is auth-protected, so the Axios interceptor
   * automatically attaches the Firebase Bearer token.
   */
  async getConnectUrl(
    platform: 'instagram' | 'facebook' | 'youtube' | 'x' | 'threads',
  ): Promise<string> {
    const response = await api.get(
      `/api/v1/social-accounts/${platform}/auth-url`,
    );
    // Backend wraps responses via TransformInterceptor: { success, data: { url }, timestamp }
    const url = response.data?.data?.url;
    if (!url || typeof url !== 'string') {
      throw new Error('Failed to get authorization URL from the server.');
    }
    return url;
  },

  async disconnectAccount(accountId: string): Promise<void> {
    await api.delete(`/api/v1/social-accounts/${accountId}`);
  },

  /**
   * Manually connect an account with a raw access token.
   * For X, requires accessSecret as well.
   */
  async connectWithToken(
    platform: 'instagram' | 'facebook' | 'youtube' | 'x' | 'threads',
    accessToken: string,
    accessSecret?: string,
  ): Promise<{platform: string; accountName: string}> {
    const response = await api.post('/api/v1/social-accounts/connect-token', {
      platform,
      accessToken,
      accessSecret,
    });
    return response.data?.data || response.data;
  },
};
