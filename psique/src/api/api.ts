import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// === 1. CONFIGURAÇÃO DA API (EROS/AFRODITE) ===
const API_URL = 'https://borababy.netlify.app/api'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// === 2. CHAVES DE STORAGE ===
const STORAGE_KEYS = {
  USER_ID: '@psique:user_id',
  USER_DATA: '@psique:user_data',
  USER_EMAIL: '@psique:user_email',
  SESSION_TOKEN: '@psique:session_token', 
} as const;

// === 3. INTERFACE DO USUÁRIO (Atualizada) ===
export interface UserData {
  id: string;
  email: string;
  nome: string;
  foto?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  
  // Adicionado para suportar o perfil e gostos
  gosto?: { [key: string]: string | number | boolean }; 
  
  [key: string]: any;
}

// === 4. INTERCEPTOR DE PROTEÇÃO ===
// Injeta o Token em toda requisição automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debug
    // console.log(`📤 [API] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    console.error(`[API Error] ${error.config?.url}:`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// === 5. GERENCIAMENTO DE SESSÃO ===

// Agora aceita token opcional para salvar login do Google
export const saveUserSession = async (userId: string, userData: UserData, email: string, token?: string) => {
  try {
    const pairs: [string, string][] = [
      [STORAGE_KEYS.USER_ID, userId],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      [STORAGE_KEYS.USER_EMAIL, email],
    ];

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
  // Podemos verificar o userId também para garantir
  const userId = await getUserId();
  return !!(token && userId);
};

// === 6. MÉTODOS DA API ===

export const clientesApi = {
  // Busca dados do usuário pelo Token (Rota /me ou similar)
  getMe: async () => {
    try {
      const response = await api.get('/me'); 
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Erro ao buscar perfil' };
    }
  },

  // Busca cliente por email
  getClienteByEmail: async (email: string) => {
    try {
      // Endpoint otimizado para busca
      const response = await api.get(`/clientes?email=${email}`); 
      
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (data) {
        return { success: true, userId: data.id, userData: data };
      }
      return { success: false, message: 'Usuário não encontrado' };
    } catch (error: any) {
      return { success: false, message: 'Erro na conexão com API' };
    }
  },

  // Atualizar ou Criar Cliente
  createCliente: async (clienteData: any) => {
     try {
       // Se tiver ID, tenta atualizar, senão cria
       if (clienteData.id) {
          // Tenta PUT primeiro
          const response = await api.put(`/clientes/${clienteData.id}`, clienteData);
          return { success: true, data: response.data };
       } else {
          const response = await api.post('/register', clienteData);
          return { success: true, data: response.data };
       }
     } catch (error: any) {
       console.error('Erro createCliente:', error);
       return { success: false, message: error.message };
     }
  }
};

export default api;