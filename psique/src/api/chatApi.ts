import { UserData } from './api';

// URL da API
const API_BASE_URL = 'https://afrodite-v1.netlify.app/api'; 

export interface ChatPreview {
  id: string; // chat_id no formato "user1_user2"
  user_name: string;
  user_photo?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  other_user_id: string;
  chat_data?: any; // Dados completos opcionais
}

// Interface da Mensagem (com export para usar no outro arquivo)
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

// Interface da resposta da API (nova estrutura)
export interface ChatItem {
  chat_id: string;
  participants: {
    user1: string;
    user2: string;
  } | string[];
  other_user_id: string;
  other_user_name: string;
  other_user_photo?: string;
  last_message: {
    id: string;
    sender_id: string;
    content: string;
    timestamp: string;
  } | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  messages?: {
    [messageId: string]: {
      sender_id: string;
      content: string;
      timestamp: string;
    }
  };
}

// Interface para resposta da API de conversas
export interface ChatApiResponse {
  success: boolean;
  data?: { [chatId: string]: ChatItem };
  error?: string;
}

// Interface para resposta de mensagens
export interface MessagesApiResponse {
  success: boolean;
  chat_id: string;
  participants: {
    user1: string;
    user2: string;
  };
  messages: Message[];
  last_message: ChatItem['last_message'];
  created_at: string;
  updated_at: string;
}

export const chatApi = {
  // 1. Busca todas as conversas do usuário para a lista
  getConversations: async (userId: string): Promise<ChatApiResponse> => {
    try {
      console.log('Buscando conversas para o ID:', userId);
      const response = await fetch(`${API_BASE_URL}/chats?user_id=${userId}`);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `Erro HTTP: ${response.status}` 
        };
      }
      
      const data = await response.json();
      
      console.log('Resposta da API de conversas:', data);
      
      // Verifica se a resposta tem a estrutura esperada
      if (typeof data === 'object' && data !== null) {
        return { 
          success: true, 
          data: data 
        };
      } else {
        return { 
          success: true, 
          data: {} 
        };
      }
    } catch (error: any) {
      console.error('Erro getConversations:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede' 
      };
    }
  },

  // 2. Busca mensagens de um chat específico
  getMessages: async (chatId: string, myUserId: string) => {
    try {
      console.log('Buscando mensagens para chat:', chatId);
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `Erro HTTP: ${response.status}`,
          data: [] 
        };
      }
      
      const data = await response.json();
      
      console.log('Resposta de mensagens:', data);
      
      let messagesArray: Message[] = [];
      
      if (data && data.success) {
        // Novo formato com sucesso no response
        if (data.messages && Array.isArray(data.messages)) {
          messagesArray = data.messages.map((msg: any) => ({
            id: msg.id || '',
            sender_id: msg.sender_id || '',
            content: msg.content || '',
            created_at: msg.timestamp || msg.created_at || '',
            is_mine: msg.sender_id === myUserId
          }));
        } else if (data.messages && typeof data.messages === 'object') {
          // messages é um objeto, converte para array
          messagesArray = Object.entries(data.messages).map(([msgId, msg]: [string, any]) => ({
            id: msgId,
            sender_id: msg.sender_id || '',
            content: msg.content || '',
            created_at: msg.timestamp || msg.created_at || '',
            is_mine: msg.sender_id === myUserId
          }));
        }
        
        // Ordena por data
        messagesArray.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        return { 
          success: true, 
          data: messagesArray,
          chat_data: data 
        };
      } else if (Array.isArray(data)) {
        // Formato antigo direto (array)
        const formatted = data.map((msg: any) => ({
          id: msg.id || '',
          sender_id: msg.sender_id || '',
          content: msg.content || '',
          created_at: msg.timestamp || msg.created_at || '',
          is_mine: msg.sender_id === myUserId
        }));
        
        formatted.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        return { success: true, data: formatted };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('Erro getMessages:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede',
        data: [] 
      };
    }
  },

  // 3. Envia mensagem
  sendMessage: async (chatId: string, senderId: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: senderId,
          content: content,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      console.log('Resposta ao enviar mensagem:', data);
      
      return { 
        success: response.ok, 
        data: data,
        status: response.status
      };
    } catch (error: any) {
      console.error('Erro sendMessage:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede' 
      };
    }
  },

  // 4. Criar ou buscar chat entre dois usuários
  getOrCreateChat: async (user1: string, user2: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user1,
          user2
        })
      });
      
      const data = await response.json();
      console.log('Resposta getOrCreateChat:', data);
      
      return { 
        success: response.ok, 
        data: data,
        status: response.status
      };
    } catch (error: any) {
      console.error('Erro getOrCreateChat:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede' 
      };
    }
  },

  // 5. Buscar chat específico entre dois usuários
  findChatBetweenUsers: async (user1: string, user2: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chats/find?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`
      );
      
      const data = await response.json();
      console.log('Resposta findChatBetweenUsers:', data);
      
      return { 
        success: response.ok, 
        data: data,
        status: response.status
      };
    } catch (error: any) {
      console.error('Erro findChatBetweenUsers:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede' 
      };
    }
  },

  // 6. Migrar estrutura antiga (opcional)
  migrateChats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/migrate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data 
      };
    } catch (error: any) {
      console.error('Erro migrateChats:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // 7. Formatar chat para preview (usado na tela de lista)
  formatChatForPreview: (chatData: ChatItem, currentUserId: string): ChatPreview => {
    // Determina o outro usuário
    let otherUserId = '';
    let otherUserName = '';
    
    if (Array.isArray(chatData.participants)) {
      otherUserId = chatData.participants.find(p => p !== currentUserId) || '';
      otherUserName = chatData.other_user_name || `User ${otherUserId.slice(0,4)}`;
    } else if (chatData.participants?.user1 && chatData.participants?.user2) {
      const { user1, user2 } = chatData.participants;
      otherUserId = currentUserId === user1 ? user2 : user1;
      otherUserName = chatData.other_user_name || `User ${otherUserId.slice(0,4)}`;
    }
    
    return {
      id: chatData.chat_id,
      user_name: otherUserName,
      user_photo: chatData.other_user_photo,
      last_message: chatData.last_message?.content || '',
      last_message_time: chatData.last_message?.timestamp || chatData.updated_at,
      unread_count: chatData.unread_count || 0,
      other_user_id: otherUserId,
      chat_data: chatData
    };
  }
};