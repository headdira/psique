import AsyncStorage from '@react-native-async-storage/async-storage';

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
  chat_data?: any;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

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

export interface ChatApiResponse {
  success: boolean;
  data?: { [chatId: string]: ChatItem };
  error?: string;
}

// Cache de usuários em memória
const userCache: Record<string, {name: string, photo?: string, timestamp: number}> = {};

export const chatApi = {
  // 1. Buscar conversas
  getConversations: async (userId: string): Promise<ChatApiResponse> => {
    try {
      console.log('🔍 Buscando conversas para o ID:', userId);
      const response = await fetch(`${API_BASE_URL}/chats?user_id=${userId}`);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `Erro HTTP: ${response.status}` 
        };
      }
      
      const data = await response.json();
      
      // console.log('✅ Resposta da API de conversas:', data);
      
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
      console.error('❌ Erro getConversations:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede' 
      };
    }
  },

  // 2. Buscar mensagens
  getMessages: async (chatId: string, myUserId: string) => {
    try {
      console.log('🔍 Buscando mensagens para chat:', chatId);
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `Erro HTTP: ${response.status}`,
          data: [] 
        };
      }
      
      const data = await response.json();
      
      let messagesArray: Message[] = [];
      
      if (data && data.success) {
        if (data.messages && Array.isArray(data.messages)) {
          messagesArray = data.messages.map((msg: any) => ({
            id: msg.id || '',
            sender_id: msg.sender_id || '',
            content: msg.content || '',
            created_at: msg.timestamp || msg.created_at || '',
            is_mine: msg.sender_id === myUserId
          }));
        } else if (data.messages && typeof data.messages === 'object') {
          messagesArray = Object.entries(data.messages).map(([msgId, msg]: [string, any]) => ({
            id: msgId,
            sender_id: msg.sender_id || '',
            content: msg.content || '',
            created_at: msg.timestamp || msg.created_at || '',
            is_mine: msg.sender_id === myUserId
          }));
        }
        
        messagesArray.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        return { 
          success: true, 
          data: messagesArray,
          chat_data: data 
        };
      } else if (Array.isArray(data)) {
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
      console.error('❌ Erro getMessages:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede',
        data: [] 
      };
    }
  },

  // 3. Enviar mensagem
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
      
      return { 
        success: response.ok, 
        data: data,
        status: response.status
      };
    } catch (error: any) {
      console.error('❌ Erro sendMessage:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de rede' 
      };
    }
  },

  // 4. Cache de usuários
  cacheUserInfo: async (userId: string, name: string, photo?: string): Promise<void> => {
    try {
      const userInfo = {
        name,
        photo,
        timestamp: Date.now()
      };
      
      userCache[userId] = userInfo;
      await AsyncStorage.setItem(`@user_cache_${userId}`, JSON.stringify(userInfo));
    } catch (error) {
      console.error('❌ Erro ao cachear usuário:', error);
    }
  },

  // 5. Buscar do cache
  getCachedUserInfo: async (userId: string): Promise<{name: string, photo?: string} | null> => {
    try {
      if (userCache[userId]) {
        return userCache[userId];
      }
      
      const cached = await AsyncStorage.getItem(`@user_cache_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        userCache[userId] = parsed;
        return parsed;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  // 6. BUSCAR INFORMAÇÕES REAIS DO USUÁRIO (API Fallback adicionado)
  fetchRealUserInfo: async (userId: string): Promise<{name: string, photo?: string} | null> => {
    try {
      // 1. Tenta cache
      const cached = await chatApi.getCachedUserInfo(userId);
      if (cached) return cached;
      
      // 2. Tenta AsyncStorage locais
      const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        if (profiles[userId]) {
          await chatApi.cacheUserInfo(userId, profiles[userId].nome, profiles[userId].foto);
          return { name: profiles[userId].nome, photo: profiles[userId].foto };
        }
      }

      // 3. === NOVO: TENTA BUSCAR NA API SE NÃO ACHAR NO CACHE ===
      console.log(`🌐 Buscando user ${userId} na API externa...`);
      try {
        const response = await fetch(`${API_BASE_URL}/clientes/${userId}`);
        
        if (response.ok) {
            const data = await response.json();
            const name = data.nome || data.name || data.user_name;
            const photo = data.foto || data.photo || data.user_photo;
            
            if (name) {
                console.log(`✅ User encontrado na API: ${name}`);
                await chatApi.cacheUserInfo(userId, name, photo);
                return { name, photo };
            }
        }
      } catch (apiError) {
        console.log('⚠️ Falha ao buscar user na API:', apiError);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro geral fetchRealUserInfo:', error);
      return null;
    }
  },

  // 7. Formatador de chat (Atualizado)
  formatChatForPreview: async (chatData: ChatItem, currentUserId: string): Promise<ChatPreview> => {
    let otherUserId = '';
    
    // Identifica o ID do outro usuário
    if (Array.isArray(chatData.participants)) {
      otherUserId = chatData.participants.find(p => p !== currentUserId) || '';
    } else if (chatData.participants?.user1 && chatData.participants?.user2) {
      const { user1, user2 } = chatData.participants;
      otherUserId = currentUserId === user1 ? user2 : user1;
    }
    
    let otherUserName = chatData.other_user_name || '';
    let otherUserPhoto = chatData.other_user_photo;
    
    // Verifica se o nome é genérico ou está vazio
    const isGenericName = !otherUserName || 
      otherUserName.includes('User') || 
      otherUserName.includes('Usuário') ||
      otherUserName === 'Host' ||
      otherUserName.match(/^Usuário \d+$/);
    
    // Se o nome for genérico e tivermos o ID, tenta buscar o nome real
    if (isGenericName && otherUserId) {
      const realUserInfo = await chatApi.fetchRealUserInfo(otherUserId);
      if (realUserInfo) {
        otherUserName = realUserInfo.name;
        otherUserPhoto = realUserInfo.photo || otherUserPhoto;
      } else {
          // Último recurso: extrair do chat_id se possível, senão mantém genérico
          if (!otherUserName) otherUserName = `Usuário ${otherUserId.slice(0, 4)}`;
      }
    }
    
    return {
      id: chatData.chat_id,
      user_name: otherUserName,
      user_photo: otherUserPhoto,
      last_message: chatData.last_message?.content || '',
      last_message_time: chatData.last_message?.timestamp || chatData.updated_at,
      unread_count: chatData.unread_count || 0,
      other_user_id: otherUserId,
      chat_data: chatData
    };
  },

  // 8. Criar chat
  createChat: async (participants: string[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};