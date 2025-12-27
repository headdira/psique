import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// === CONFIGURAÇÃO DA API ===
// Ajuste a URL base conforme o seu backend Eros
const API_URL = 'https://borababy.netlify.app/api'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// === CHAVES DE STORAGE ===
const STORAGE_KEYS = {
  USER_ID: '@psique:user_id',
  USER_DATA: '@psique:user_data',
  USER_EMAIL: '@psique:user_email',
  SESSION_TOKEN: '@psique:session_token',
} as const;

// === INTERFACE DO USUÁRIO (Corrigida para incluir 'gosto') ===
export interface UserData {
  id: string;
  email: string;
  nome: string;
  foto?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  
  // Adicionado para parar o erro no HomeScreen
  gosto?: { [key: string]: string | number | boolean }; 
  
  [key: string]: any;
}

// === INTERCEPTOR DE PROTEÇÃO ===
// Injeta o Token em toda requisição automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    // Log de erro para debug
    console.error(`[API Error] ${error.config?.url}:`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// === GERENCIAMENTO DE SESSÃO ===

export const saveUserSession = async (userId: string, userData: UserData, email: string, token?: string) => {
  try {
    const pairs: [string, string][] = [
      [STORAGE_KEYS.USER_ID, userId],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      [STORAGE_KEYS.USER_EMAIL, email],
    ];

    // Salva o token se ele for fornecido (Auth Google / Cadastro)
    if (token) {
      pairs.push([STORAGE_KEYS.SESSION_TOKEN, token]);
    }

    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    return false;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_EMAIL,
      STORAGE_KEYS.SESSION_TOKEN,
    ]);
    return true;
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
    return false;
  }
};

// Getters
export const getUserId = async () => AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
export const getUserData = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};
export const getUserEmail = async () => AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
export const getSessionToken = async () => AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getSessionToken();
  const userId = await getUserId();
  return !!(token && userId);
};

// === MÉTODOS DA API ===

export const clientesApi = {
  // Busca dados do usuário pelo Token (Rota /me)
  getMe: async () => {
    try {
      const response = await api.get('/me'); 
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Erro ao buscar perfil' };
    }
  },

  // Busca cliente por email (Fallback para login sem token direto)
  getClienteByEmail: async (email: string) => {
    try {
      // Ajuste a rota conforme seu backend real
      const response = await api.get(`/clientes?email=${email}`); 
      
      // Lógica para lidar se retornar array ou objeto único
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (data) {
        return { success: true, userId: data.id, userData: data };
      }
      return { success: false, message: 'Usuário não encontrado' };
    } catch (error: any) {
      return { success: false, message: 'Erro na conexão com API' };
    }
  },

  // Atualizar dados do cliente
  updateCliente: async (userId: string, data: Partial<UserData>) => {
     try {
       const response = await api.put(`/clientes/${userId}`, data);
       return { success: true, data: response.data };
     } catch (error: any) {
       return { success: false, message: error.message };
     }
  }
};

export default api;