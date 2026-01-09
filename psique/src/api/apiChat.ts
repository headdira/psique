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
      
      console.log('✅ Resposta da API de conversas:', data);
      
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
      
      console.log('✅ Resposta de mensagens:', data);
      
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
      console.log('✅ Resposta ao enviar mensagem:', data);
      
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
      
      // Cache em memória
      userCache[userId] = userInfo;
      
      // Cache no AsyncStorage
      await AsyncStorage.setItem(`@user_cache_${userId}`, JSON.stringify(userInfo));
      
      console.log(`✅ Usuário ${userId} cacheado: ${name}`);
    } catch (error) {
      console.error('❌ Erro ao cachear usuário:', error);
    }
  },

  // 5. Buscar do cache
  getCachedUserInfo: async (userId: string): Promise<{name: string, photo?: string} | null> => {
    try {
      // Primeiro verifica cache em memória
      if (userCache[userId]) {
        const cacheAge = Date.now() - userCache[userId].timestamp;
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
        
        if (cacheAge < CACHE_DURATION) {
          return userCache[userId];
        }
      }
      
      // Se não tem em memória ou expirou, busca no AsyncStorage
      const cached = await AsyncStorage.getItem(`@user_cache_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - parsed.timestamp;
        const CACHE_DURATION = 24 * 60 * 60 * 1000;
        
        if (cacheAge < CACHE_DURATION) {
          // Atualiza cache em memória
          userCache[userId] = parsed;
          return parsed;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar cache de usuário:', error);
      return null;
    }
  },

  // 6. BUSCAR INFORMAÇÕES REAIS DO USUÁRIO
  fetchRealUserInfo: async (userId: string): Promise<{name: string, photo?: string} | null> => {
    try {
      console.log(`🔍 Buscando informações reais do usuário ${userId}...`);
      
      // 1. Primeiro tenta buscar do cache
      const cached = await chatApi.getCachedUserInfo(userId);
      if (cached) {
        return cached;
      }
      
      // 2. Busca no AsyncStorage de perfis salvos
      try {
        const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles);
          if (profiles[userId]) {
            const userInfo = {
              name: profiles[userId].nome,
              photo: profiles[userId].foto
            };
            // Cacheia para próxima vez
            await chatApi.cacheUserInfo(userId, userInfo.name, userInfo.photo);
            return userInfo;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar perfis salvos:', error);
      }
      
      // 3. Busca no AsyncStorage de usuários conhecidos
      try {
        const knownUsers = await AsyncStorage.getItem('@known_users');
        if (knownUsers) {
          const users = JSON.parse(knownUsers);
          if (users[userId]) {
            const userInfo = {
              name: users[userId].name,
              photo: users[userId].photo
            };
            // Cacheia para próxima vez
            await chatApi.cacheUserInfo(userId, userInfo.name, userInfo.photo);
            return userInfo;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuários conhecidos:', error);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar informações do usuário:', error);
      return null;
    }
  },

  // 7. ADICIONAR USUÁRIO CONHECIDO (chamado quando salva perfil)
  addKnownUser: async (userId: string, name: string, photo?: string): Promise<void> => {
    try {
      console.log(`➕ Adicionando usuário conhecido: ${name} (${userId})`);
      
      // 1. Cache imediato
      await chatApi.cacheUserInfo(userId, name, photo);
      
      // 2. Adicionar à lista de usuários conhecidos
      const knownUsersStr = await AsyncStorage.getItem('@known_users');
      const knownUsers = knownUsersStr ? JSON.parse(knownUsersStr) : {};
      
      knownUsers[userId] = {
        name,
        photo,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem('@known_users', JSON.stringify(knownUsers));
      
      // 3. Também salvar como perfil
      const savedProfilesStr = await AsyncStorage.getItem('@saved_user_profiles');
      const savedProfiles = savedProfilesStr ? JSON.parse(savedProfilesStr) : {};
      
      savedProfiles[userId] = {
        nome: name,
        foto: photo,
        updated_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(savedProfiles));
      
      console.log(`✅ Usuário ${name} salvo para aparecer nos chats`);
    } catch (error) {
      console.error('❌ Erro ao adicionar usuário conhecido:', error);
    }
  },

  // 8. Formatador de chat MELHORADO com busca de nomes reais
  formatChatForPreview: async (chatData: ChatItem, currentUserId: string): Promise<ChatPreview> => {
    let otherUserId = '';
    
    // Determina o ID do outro usuário
    if (Array.isArray(chatData.participants)) {
      otherUserId = chatData.participants.find(p => p !== currentUserId) || '';
    } else if (chatData.participants?.user1 && chatData.participants?.user2) {
      const { user1, user2 } = chatData.participants;
      otherUserId = currentUserId === user1 ? user2 : user1;
    }
    
    let otherUserName = chatData.other_user_name || '';
    let otherUserPhoto = chatData.other_user_photo;
    
    // Verifica se o nome é genérico
    const isGenericName = !otherUserName || 
      otherUserName.includes('User') || 
      otherUserName.includes('Usuário') ||
      otherUserName === 'Host' ||
      otherUserName === 'Organizador' ||
      otherUserName.match(/^Usuário \d+$/);
    
    // Se o nome é genérico, BUSCA NOME REAL
    if (isGenericName && otherUserId) {
      const realUserInfo = await chatApi.fetchRealUserInfo(otherUserId);
      if (realUserInfo) {
        otherUserName = realUserInfo.name;
        otherUserPhoto = realUserInfo.photo;
        console.log(`✅ Nome real encontrado para ${otherUserId}: ${realUserInfo.name}`);
      } else {
        // Se não encontrou, tenta extrair do chat_id
        if (chatData.chat_id.includes('_')) {
          const ids = chatData.chat_id.split('_');
          if (ids.length === 2) {
            const targetId = ids[0] === currentUserId ? ids[1] : ids[0];
            if (targetId !== otherUserId) {
              const alternativeInfo = await chatApi.fetchRealUserInfo(targetId);
              if (alternativeInfo) {
                otherUserName = alternativeInfo.name;
                otherUserPhoto = alternativeInfo.photo;
              }
            }
          }
        }
        
        // Último fallback
        if (!otherUserName || otherUserName.includes('Usuário')) {
          otherUserName = `Usuário ${otherUserId.slice(-4)}`;
        }
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

  // 9. Criar ou buscar chat
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

  // 10. Migrar chats
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
  }
};