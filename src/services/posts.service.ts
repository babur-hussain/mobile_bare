import api from './api';

export interface CreatePostData {
  mediaUrls?: string[];
  caption?: string;
  platforms: ('instagram' | 'facebook')[];
  scheduledAt?: string;
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
  scheduledAt: string | null;
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
    scheduledAt?: string;
  }) {
    const payload = {
      caption: data.caption,
      platforms: data.platforms,
      mediaUrl: data.mediaUrls.length > 0 ? data.mediaUrls[0] : undefined,
      scheduledTime: data.scheduledAt,
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
};
