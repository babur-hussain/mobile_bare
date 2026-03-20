import api from './api';

export const threadsService = {
  async getMentions() {
    const response = await api.get('/api/v1/threads/mentions');
    return response.data;
  },

  async searchThreads(query: string) {
    const response = await api.get('/api/v1/threads/search', { params: { query } });
    return response.data;
  },

  async discoverProfile(username: string) {
    const response = await api.get('/api/v1/threads/profile-discovery', { params: { username } });
    return response.data;
  },

  async getReplies(postId: string) {
    const response = await api.get(`/api/v1/threads/posts/${postId}/replies`);
    return response.data;
  },

  async replyToPost(postId: string, text: string) {
    const response = await api.post(`/api/v1/threads/posts/${postId}/reply`, { text });
    return response.data;
  },

  async hideReply(replyId: string, hide: boolean) {
    const response = await api.post(`/api/v1/threads/replies/${replyId}/hide`, { hide });
    return response.data;
  },
};
