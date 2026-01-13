import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApi } from '../api/apiChat';

export const useUserName = (userId?: string) => {
  const [userName, setUserName] = useState<string>('Usuário');
  const [userPhoto, setUserPhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const loadUserInfo = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Buscando informações do usuário: ${userId}`);
      
      // 1. Tenta buscar do cache primeiro
      const cached = await chatApi.getCachedUserInfo(userId);
      if (cached && cached.name && !cached.name.includes('User')) {
        console.log(`✅ Nome encontrado no cache: ${cached.name}`);
        setUserName(cached.name);
        setUserPhoto(cached.photo);
        setLoading(false);
        return;
      }
      
      // 2. Tenta buscar informações reais da API
      const realInfo = await chatApi.fetchRealUserInfo(userId);
      
      if (realInfo && realInfo.name && !realInfo.name.includes('User')) {
        console.log(`✅ Nome encontrado na API: ${realInfo.name}`);
        setUserName(realInfo.name);
        if (realInfo.photo) {
          setUserPhoto(realInfo.photo);
        }
        
        // Salva no cache para futuras buscas
        await chatApi.cacheUserInfo(userId, realInfo.name, realInfo.photo);
      } else {
        // Se não encontrou, verifica se tem nome salvo localmente
        const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles);
          if (profiles[userId]?.nome && !profiles[userId].nome.includes('User')) {
            setUserName(profiles[userId].nome);
            setUserPhoto(profiles[userId].foto);
            await chatApi.cacheUserInfo(userId, profiles[userId].nome, profiles[userId].foto);
          } else {
            // Último recurso: mostrar ID formatado
            setUserName(`Usuário ${userId.slice(-4)}`);
          }
        } else {
          // Último recurso: mostrar ID formatado
          setUserName(`Usuário ${userId.slice(-4)}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar informações do usuário:', error);
      setUserName(`Usuário ${userId.slice(-4)}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const updateUserInfo = async (id: string, name: string, photo?: string) => {
    try {
      await chatApi.cacheUserInfo(id, name, photo);
      if (id === userId) {
        setUserName(name);
        if (photo) setUserPhoto(photo);
      }
    } catch (error) {
      console.error('Erro ao atualizar informações do usuário:', error);
    }
  };

  return { 
    userName, 
    userPhoto, 
    loading, 
    updateUserInfo,
    refresh: loadUserInfo
  };
};