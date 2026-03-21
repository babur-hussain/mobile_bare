import api from './api';

export type PlatformType = 'all' | 'threads' | 'instagram' | 'facebook';

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

export interface Conversation {
  id: string;
  platform: PlatformType;
  accountId: string; // Needed for routing the requests easily
  recipientId?: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  messages?: Message[]; // Optionally loaded
}

export const messagesService = {
  getConversations: async (platform: PlatformType): Promise<Conversation[]> => {
    // If requesting threads, the backend won't return anything. 
    // We pass it to filter exactly if needed.
    const params: any = {};
    if (platform !== 'all') {
      params.platform = platform;
    }
    
    const response = await api.get('/api/v1/messages/conversations', { params });
    return response.data?.data || [];
  },

  getConversationById: async (platform: PlatformType, accountId: string, conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/api/v1/messages/conversations/${platform}/${accountId}/${conversationId}`);
    return response.data?.data || [];
  },

  sendMessage: async (platform: PlatformType, accountId: string, conversationId: string, recipientId: string, text: string): Promise<Message> => {
    const response = await api.post(`/api/v1/messages/conversations/${platform}/${accountId}/${conversationId}/send`, {
      text,
      recipientId
    });
    return response.data?.data;
  }
};
