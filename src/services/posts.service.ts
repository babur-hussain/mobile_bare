import api from './api';

export interface CreatePostData {
  mediaUrls?: string[];
  caption?: string;
  platforms: ('instagram' | 'facebook')[];
  scheduledTime?: string;
  location?: { name: string; lat: number; lng: number };
}

export interface PostItem {
  _id: string;
  mediaUrls: string[];
  caption: string;
  platforms: string[];
  status:
  | 'draft'
  | 'queued'
  | 'publishing'
  | 'published'
  | 'partially_published'
  | 'failed';
  scheduledTime: string | null;
  publishResults: Array<{
    platform: string;
    success: boolean;
    platformPostId?: string;
    error?: string;
    publishedAt?: string;
  }>;
  createdAt: string;
}

export interface PostsResponse {
  posts: PostItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const postsService = {
  async create(data: {
    mediaUrls: string[];
    caption: string;
    platforms: ('facebook' | 'instagram')[];
    scheduledTime?: string;
    location?: { name: string; lat: number; lng: number };
  }) {
    const payload = {
      caption: data.caption,
      platforms: data.platforms,
      mediaUrls: data.mediaUrls,
      scheduledTime: data.scheduledTime,
      location: data.location,
    };
    const response = await api.post('/api/v1/posts', payload);
    return response.data.data;
  },

  async getAll(page = 1, limit = 20): Promise<PostsResponse> {
    const response = await api.get('/api/v1/posts', { params: { page, limit } });
    return response.data.data;
  },

  async getById(postId: string): Promise<PostItem> {
    const response = await api.get(`/api/v1/posts/${postId}`);
    return response.data.data;
  },

  async getPostAnalytics(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/posts/${postId}/analytics`);
    return response.data.data || response.data; // Depending on interceptor structure
  },

  async update(
    postId: string,
    data: Partial<CreatePostData>,
  ): Promise<PostItem> {
    const response = await api.patch(`/api/v1/posts/${postId}`, data);
    return response.data.data;
  },

  async delete(postId: string): Promise<void> {
    await api.delete(`/api/v1/posts/${postId}`);
  },

  async deleteFacebook(postId: string): Promise<void> {
    await api.delete(`/api/v1/posts/${postId}/facebook`);
  },

  async deleteInstagram(postId: string): Promise<void> {
    await api.delete(`/api/v1/posts/${postId}/instagram`);
  },

  async getFacebookAnalytics(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/posts/${postId}/analytics/facebook`);
    return response.data.data || response.data;
  },

  async getInstagramAnalytics(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/posts/${postId}/analytics/instagram`);
    return response.data.data || response.data;
  },

  async getThreadsAnalytics(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/posts/${postId}/analytics/threads`);
    return response.data.data || response.data;
  },
};
