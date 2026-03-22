import api from './api';

export const instagramService = {
  async getComments(accountId: string, mediaId: string) {
    const response = await api.get(`/api/v1/instagram/comments/${accountId}/${mediaId}`);
    return response.data;
  },

  async replyToComment(accountId: string, targetId: string, message: string) {
    const response = await api.post(`/api/v1/instagram/reply/${accountId}`, { targetId, message });
    return response.data;
  },
};
