import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApi } from '../api/apiChat';

export const profileUpdater = {
  // Busca e atualiza um perfil específico
  async updateUserProfile(userId: string): Promise<boolean> {
    try {
      console.log(`🔄 Atualizando perfil do usuário: ${userId}`);
      
      // Tenta buscar de múltiplas fontes
      const sources = [
        // Fonte 1: API principal de clientes
        async () => {
          const response = await fetch(`https://borababy.netlify.app/api/clientes/${userId}`);
          if (response.ok) {
            const data = await response.json();
            return data;
          }
          throw new Error('API de clientes falhou');
        },
        
        // Fonte 2: API de usuários geral
        async () => {
          const response = await fetch(`https://borababy.netlify.app/api/users/${userId}`);
          if (response.ok) {
            const data = await response.json();
            return data;
          }
          throw new Error('API de usuários falhou');
        },
        
        // Fonte 3: Da própria API de chat (se tiver)
        async () => {
          const userInfo = await chatApi.fetchRealUserInfo(userId);
          if (userInfo) {
            return { nome: userInfo.name, foto: userInfo.photo };
          }
          throw new Error('API de chat falhou');
        }
      ];
      
      let userData = null;
      
      for (const source of sources) {
        try {
          userData = await source();
          if (userData && (userData.nome || userData.name)) {
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!userData || (!userData.nome && !userData.name)) {
        console.log(`❌ Não foi possível encontrar dados para o usuário ${userId}`);
        return false;
      }
      
      const nome = userData.nome || userData.name;
      const foto = userData.foto || userData.photo || userData.picture;
      
      if (!nome || nome === 'Usuário' || nome.includes('User')) {
        console.log(`⚠️ Nome inválido ou genérico para ${userId}: ${nome}`);
        return false;
      }
      
      // Salva no AsyncStorage
      const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
      const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
      
      profiles[userId] = {
        nome,
        foto,
        email: userData.email || '',
        updated_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(profiles));
      
      // Salva no cache da API de chat
      await chatApi.cacheUserInfo(userId, nome, foto);
      
      console.log(`✅ Perfil atualizado: ${nome} (ID: ${userId})`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erro ao atualizar perfil de ${userId}:`, error);
      return false;
    }
  },
  
  // Atualiza múltiplos perfis de uma vez
  async updateMultipleProfiles(userIds: string[]): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    
    for (const userId of userIds) {
      const success = await this.updateUserProfile(userId);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
      
      // Aguarda um pouco entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`📊 Resultado: ${results.success} sucessos, ${results.failed} falhas`);
    return results;
  },
  
  // Verifica perfis antigos e tenta atualizá-los
  async refreshOldProfiles(): Promise<void> {
    try {
      const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
      if (!savedProfiles) return;
      
      const profiles = JSON.parse(savedProfiles);
      const userIds = Object.keys(profiles);
      const profilesToUpdate: string[] = [];
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      for (const userId of userIds) {
        const profile = profiles[userId];
        if (profile.updated_at) {
          const lastUpdate = new Date(profile.updated_at);
          if (lastUpdate < oneWeekAgo) {
            profilesToUpdate.push(userId);
          }
        } else {
          profilesToUpdate.push(userId);
        }
      }
      
      if (profilesToUpdate.length > 0) {
        console.log(`🔄 Atualizando ${profilesToUpdate.length} perfis antigos...`);
        await this.updateMultipleProfiles(profilesToUpdate);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfis antigos:', error);
    }
  }
};