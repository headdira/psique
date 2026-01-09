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
      // Tenta buscar do cache
      const cached = await chatApi.getCachedUserInfo(userId);
      if (cached) {
        setUserName(cached.name);
        setUserPhoto(cached.photo);
        return;
      }
      
      // Se não tem cache, busca da API
      const userInfo = await chatApi.getUserInfo(userId);
      setUserName(userInfo.name);
      if (userInfo.photo) {
        setUserPhoto(userInfo.photo);
      }
      
    } catch (error) {
      console.error('Erro ao carregar informações do usuário:', error);
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