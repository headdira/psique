import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApi } from '../api/apiChat';

export const userProfileUtils = {
  // Busca TODOS os usuários da API e salva localmente
  async fetchAllUserProfilesFromAPI() {
    try {
      console.log('🔄 Buscando TODOS os perfis da API...');
      
      // URL da sua API (ajuste conforme necessário)
      const API_URL = 'https://borababy.netlify.app/api';
      
      // Tenta diferentes endpoints
      const endpoints = [
        `${API_URL}/clientes`,
        `${API_URL}/users`,
        `${API_URL}/usuarios`
      ];
      
      let allUsers: any[] = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              allUsers = [...allUsers, ...data];
              console.log(`✅ Encontrou ${data.length} usuários em ${endpoint}`);
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Falha no endpoint ${endpoint}:`, error);
        }
      }
      
      if (allUsers.length === 0) {
        console.log('⚠️ Não encontrou usuários em nenhum endpoint');
        return false;
      }
      
      // Processa e salva os perfis
      const profiles: Record<string, any> = {};
      
      allUsers.forEach(user => {
        if (user.id && user.nome && user.nome !== 'Usuário' && !user.nome.includes('User')) {
          profiles[user.id] = {
            nome: user.nome,
            foto: user.foto || user.photo || user.user_photo,
            email: user.email,
            updated_at: new Date().toISOString()
          };
          
          // Também salva no cache da API de chat
          chatApi.cacheUserInfo(user.id, user.nome, user.foto || user.photo)
            .catch(err => console.error(`Erro ao cachear ${user.id}:`, err));
        }
      });
      
      // Salva no AsyncStorage
      await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(profiles));
      console.log(`✅ ${Object.keys(profiles).length} perfis salvos localmente!`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao buscar todos os perfis:', error);
      return false;
    }
  },
  
  // Busca informações de um usuário específico
  async fetchUserProfile(userId: string) {
    try {
      console.log(`🔍 Buscando perfil do usuário: ${userId}`);
      
      // Tenta várias fontes
      const sources = [
        // 1. Cache local
        async () => {
          const saved = await AsyncStorage.getItem('@saved_user_profiles');
          if (saved) {
            const profiles = JSON.parse(saved);
            return profiles[userId];
          }
          return null;
        },
        
        // 2. API de clientes
        async () => {
          try {
            const response = await fetch(`https://borababy.netlify.app/api/clientes/${userId}`);
            if (response.ok) {
              const userData = await response.json();
              return userData;
            }
          } catch (error) {
            return null;
          }
        },
        
        // 3. API de chat
        async () => {
          const userInfo = await chatApi.fetchRealUserInfo(userId);
          return userInfo ? { nome: userInfo.name, foto: userInfo.photo } : null;
        }
      ];
      
      for (const source of sources) {
        try {
          const result = await source();
          if (result && result.nome && result.nome !== 'Usuário') {
            console.log(`✅ Nome encontrado: ${result.nome}`);
            
            // Atualiza o cache
            const saved = await AsyncStorage.getItem('@saved_user_profiles');
            const profiles = saved ? JSON.parse(saved) : {};
            profiles[userId] = {
              nome: result.nome,
              foto: result.foto || result.photo,
              email: result.email,
              updated_at: new Date().toISOString()
            };
            await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(profiles));
            
            await chatApi.cacheUserInfo(userId, result.nome, result.foto || result.photo);
            
            return result.nome;
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar perfil de ${userId}:`, error);
      return null;
    }
  },
  
  // Limpa e recarrega todos os perfis
  async refreshAllProfiles() {
    await AsyncStorage.removeItem('@saved_user_profiles');
    return await this.fetchAllUserProfilesFromAPI();
  }
};