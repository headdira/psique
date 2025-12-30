import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurações da API
const CLIENTES_API_URL = 'https://narciso-v1.netlify.app/clientes';
const X_API_KEY = 'bb_live_9f8e3c7a2d1b4e6f0a9c5b8d7e4a1c6b2f0d9e8a7c4b3a2d1e6f5c8b9';

const api = axios.create({
  baseURL: CLIENTES_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': X_API_KEY,
  },
});

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  USER_ID: '@psique:user_id',
  USER_DATA: '@psique:user_data',
  USER_EMAIL: '@psique:user_email',
  SESSION_TOKEN: '@psique:session_token',
} as const;

// === AQUI ESTAVA O ERRO: Adicionado 'export' ===
export interface UserData {
  id: string;
  email: string;
  nome: string;
  foto?: string;
  type: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// Funções para gerenciar sessão
export const saveUserSession = async (userId: string, userData: any, email: string) => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_ID, userId],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      [STORAGE_KEYS.USER_EMAIL, email],
      [STORAGE_KEYS.SESSION_TOKEN, Date.now().toString()],
    ]);
    return true;
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    return false;
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  } catch (error) {
    console.error('Erro ao obter user_id:', error);
    return null;
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao obter user_data:', error);
    return null;
  }
};

export const getUserEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
  } catch (error) {
    console.error('Erro ao obter email:', error);
    return null;
  }
};

export const getSessionToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.error('Erro ao obter session token:', error);
    return null;
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

export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const sessionToken = await getSessionToken();
    return !!(userId && sessionToken);
  } catch (error) {
    console.error('Erro ao verificar login:', error);
    return false;
  }
};

// Funções da API de Clientes
export const clientesApi = {
  // Busca todos os clientes
  getAllClientes: async () => {
    try {
      const response = await api.get('');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  // Busca cliente por email
  getClienteByEmail: async (email: string) => {
    try {
      const response = await api.get('');
      const data = response.data;
      
      if (data.success && data.data) {
        // Procura o cliente pelo email
        for (const [userId, userData] of Object.entries(data.data)) {
          const cliente = userData as any;
          if (cliente.email.toLowerCase() === email.toLowerCase()) {
            return {
              success: true,
              userId: userId,
              userData: cliente
            };
          }
        }
      }
      
      return {
        success: false,
        message: 'Cliente não encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      throw error;
    }
  },

  // Cria novo cliente (se necessário)
  createCliente: async (clienteData: any) => {
    try {
      const response = await api.post('', clienteData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },
};

// Interceptor para logs (opcional)
api.interceptors.request.use(config => {
  console.log('📤 Enviando requisição:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
  });
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('✅ Resposta recebida:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('❌ Erro na requisição:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export default api;