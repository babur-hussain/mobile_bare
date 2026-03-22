import api from './api';

export const facebookService = {
  async getComments(accountId: string, postId: string) {
    const response = await api.get(`/api/v1/facebook/comments/${accountId}/${postId}`);
    return response.data;
  },

  async replyToComment(accountId: string, targetId: string, message: string) {
    const response = await api.post(`/api/v1/facebook/reply/${accountId}`, { targetId, message });
    return response.data;
  },
};
