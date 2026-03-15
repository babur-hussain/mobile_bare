import api from './api';

export interface SocialAccount {
  _id: string;
  platform: 'instagram' | 'facebook' | 'youtube';
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
  async getConnectUrl(platform: 'instagram' | 'facebook' | 'youtube'): Promise<string> {
    const response = await api.get(`/api/v1/social-accounts/${platform}/auth-url`);
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
   * Manually connect an Instagram account with a raw access token.
   * For Meta app review testing — bypasses the OAuth flow.
   */
  async connectWithToken(
    platform: 'instagram' | 'facebook' | 'youtube',
    accessToken: string,
  ): Promise<{ platform: string; accountName: string }> {
    const response = await api.post('/api/v1/social-accounts/connect-token', {
      platform,
      accessToken,
    });
    return response.data?.data || response.data;
  },
};
