import { apiService } from './apiDates'; // Reutilizando sua configuração base

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_mine?: boolean; // Vamos calcular isso no frontend
}

export interface ChatPreview {
  id: string; // ID da conversa ou do usuário alvo
  user_name: string;
  user_photo?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export const chatApi = {
  // 1. Listar todas as conversas
  getConversations: async (userId: string) => {
    // Endpoint sugerido: GET /chats?user_id=...
    const result = await apiService.makeRequest(`/chats?user_id=${userId}`, 'GET');
    
    if (result.ok && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [] };
  },

  // 2. Pegar mensagens de uma conversa específica
  getMessages: async (chatId: string, currentUserId: string) => {
    // Endpoint sugerido: GET /chats/:chatId/messages
    const result = await apiService.makeRequest(`/chats/${chatId}/messages`, 'GET');
    
    if (result.ok && result.data) {
      // Processa para marcar quais são minhas
      const messages = Array.isArray(result.data) ? result.data : [];
      const formatted = messages.map((msg: any) => ({
        ...msg,
        is_mine: msg.sender_id === currentUserId
      }));
      return { success: true, data: formatted };
    }
    return { success: false, data: [] };
  },

  // 3. Enviar mensagem
  sendMessage: async (chatId: string, senderId: string, content: string) => {
    const payload = {
      sender_id: senderId,
      content: content,
      timestamp: new Date().toISOString()
    };

    const result = await apiService.makeRequest(`/chats/${chatId}/messages`, 'POST', payload);
    return { success: result.ok, data: result.data };
  },

  // 4. Criar ou Obter ID de conversa com um usuário
  startChat: async (myUserId: string, targetUserId: string) => {
    const payload = {
      participants: [myUserId, targetUserId]
    };
    const result = await apiService.makeRequest('/chats', 'POST', payload);
    return { success: result.ok, chatId: result.data?.id };
  }
};