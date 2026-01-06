// URL da API
const API_BASE_URL = 'https://afrodite-v1.netlify.app/api'; 

export interface ChatPreview {
  id: string;
  user_name: string;
  user_photo?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  other_user_id: string;
}

// === CORREÇÃO 1: Adicionado 'export' aqui para o import funcionar ===
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

export const chatApi = {
  getConversations: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats?user_id=${userId}`);
      const data = await response.json();
      return { success: response.ok, data: Array.isArray(data) ? data : [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // === CORREÇÃO 2: Adicionado 'myUserId' nos parâmetros ===
  getMessages: async (chatId: string, myUserId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Agora podemos usar 'myUserId' para calcular o 'is_mine'
        const formatted = data.map((msg: any) => ({
          ...msg,
          is_mine: msg.sender_id === myUserId,
          created_at: msg.timestamp || msg.created_at
        }));
        return { success: true, data: formatted };
      }
      return { success: false, data: [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  sendMessage: async (chatId: string, senderId: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: senderId,
          content: content,
          timestamp: new Date().toISOString()
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};