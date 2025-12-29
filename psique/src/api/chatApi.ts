import api from './api';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  created_at: string;
  isMine?: boolean;
}

export interface ChatPreview {
  id: string;
  user: {
    id: string;
    nome: string;
    foto?: string;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export const chatApi = {
  getConversations: async () => {
    try {
      const response = await api.get('/chats');
      return { success: true, data: response.data as ChatPreview[] };
    } catch (error: any) {
      // Retorna lista vazia se der erro (mock para não quebrar o app enquanto não tem backend)
      console.log('API Chat erro ou offline, retornando vazio');
      return { success: false, data: [] };
    }
  },

  getMessages: async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      return { success: true, data: response.data as Message[] };
    } catch (error: any) {
      return { success: false, message: 'Erro ao carregar mensagens.' };
    }
  },

  sendMessage: async (chatId: string, text: string) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, { text });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erro ao enviar mensagem.' };
    }
  },

  createChat: async (targetUserId: string) => {
    try {
      const response = await api.post('/chats', { targetUserId });
      return { success: true, data: response.data }; 
    } catch (error: any) {
      return { success: false, message: 'Erro ao iniciar conversa.' };
    }
  }
};