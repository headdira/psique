import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Substitua pela URL correta da sua API
const API_BASE_URL = 'https://borababy.netlify.app/api'; // ou 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Funções para gerenciar tokens
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('@dating-app:token', token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('@dating-app:token');
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@dating-app:token');
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
};

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;