import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { 
  getUserId, 
  getUserData, 
  getUserEmail,
  clearSession,
  isLoggedIn,
  saveUserSession,
  clientesApi,
  UserData
} from '../api/api';

// Importar a API de chat para cache de nomes
import { chatApi } from '../api/apiChat';

// Garante que o navegador feche corretamente após o retorno
WebBrowser.maybeCompleteAuthSession();

export interface AuthContextData {
  isAuthenticated: boolean | null;
  user: UserData | null;
  loading: boolean;
  
  login: (email: string) => Promise<{ success: boolean; message?: string; user?: UserData }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signup: () => Promise<{ success: boolean; message?: string }>;
  
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Função auxiliar para decodificar JWT (Token do Google)
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Polyfill para 'atob' caso não exista no ambiente nativo
if (!global.atob) {
  global.atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  };
}

// Função para salvar sessão COM CACHE DE NOME
const saveUserSessionWithCache = async (
  userId: string, 
  userData: UserData, 
  email: string, 
  token?: string
): Promise<boolean> => {
  try {
    const pairs: [string, string][] = [
      ['@psique:user_id', userId],
      ['@psique:user_data', JSON.stringify(userData)],
      ['@psique:user_email', email],
    ];

    if (token) {
      pairs.push(['@psique:session_token', token]);
    }

    await AsyncStorage.multiSet(pairs);
    
    // SALVA O NOME NO CACHE DE USUÁRIOS PARA OS CHATS
    if (userData.nome && userData.nome !== 'Usuário') {
      try {
        await chatApi.cacheUserInfo(userId, userData.nome, userData.foto);
        console.log(`✅ Nome cacheado para chats: ${userData.nome} (ID: ${userId})`);
      } catch (cacheError) {
        console.error('Erro ao cachear nome do usuário:', cacheError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    return false;
  }
};

// Função para limpar sessão
const clearUserSession = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      '@psique:user_id',
      '@psique:user_data',
      '@psique:user_email',
      '@psique:session_token',
    ]);
    return true;
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
    return false;
  }
};

// Getters
const getStoredUserId = async (): Promise<string | null> => {
  return AsyncStorage.getItem('@psique:user_id');
};

const getStoredUserData = async (): Promise<UserData | null> => {
  const data = await AsyncStorage.getItem('@psique:user_data');
  return data ? JSON.parse(data) : null;
};

const getStoredUserEmail = async (): Promise<string | null> => {
  return AsyncStorage.getItem('@psique:user_email');
};

const checkUserLoggedIn = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('@psique:session_token');
  const userId = await getStoredUserId();
  return !!(token && userId);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Manipula o retorno do Navegador (Deep Link)
  const handleBrowserReturn = async (result: WebBrowser.WebBrowserAuthSessionResult) => {
    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      
      const gToken = queryParams?.['g_token'];
      
      // Caso 1: Login com Google bem-sucedido (Token presente)
      if (typeof gToken === 'string') {
        const decoded = decodeJwt(gToken);
        
        if (decoded && decoded.email) {
          const userData: UserData = {
            id: decoded.sub || decoded.id || 'temp_id',
            email: decoded.email,
            nome: decoded.name || decoded.nome || 'Usuário',
            type: 'user', 
            foto: decoded.picture || decoded.foto,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            gosto: {} 
          };
          
          await saveUserSessionWithCache(userData.id, userData, userData.email, gToken);
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true, message: 'Autenticado com sucesso' };
        }
      }
      
      // Caso 2: Login via email/senha bem-sucedido
      if (queryParams?.['login'] === 'success') {
         return { success: true, message: 'Sucesso! Agora faça login.' };
      }
    }
    return { success: false, message: 'Operação cancelada ou falhou' };
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const redirectUri = Linking.createURL('/'); 
      const authUrl = `https://borababy.netlify.app/?mode=google&redirect_uri=${encodeURIComponent(redirectUri)}`; 
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      return await handleBrowserReturn(result);
    } catch (error: any) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    try {
      setLoading(true);
      const redirectUri = Linking.createURL('/'); 
      const authUrl = `https://borababy.netlify.app/?mode=signup&redirect_uri=${encodeURIComponent(redirectUri)}`; 
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      return await handleBrowserReturn(result);
    } catch (error: any) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      setLoading(true);
      if (!email.trim()) return { success: false, message: 'Digite seu email' };

      const result = await clientesApi.getClienteByEmail(email);
      
      if (result.success && result.userId && result.userData) {
        // Usa a nova função com cache
        const saved = await saveUserSessionWithCache(
          result.userId, 
          result.userData, 
          result.userData.email
        );
        
        if (saved) {
          const userData = { ...result.userData, id: result.userId, email: result.userData.email };
          setUser(userData);
          setIsAuthenticated(true);
          return { 
            success: true, 
            message: 'Login realizado com sucesso', 
            user: userData 
          };
        }
      }
      return { success: false, message: result.message || 'Email não encontrado.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await clearUserSession();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Erro logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const loggedIn = await checkUserLoggedIn();
      if (loggedIn) {
        const userId = await getStoredUserId();
        const userData = await getStoredUserData();
        const userEmail = await getStoredUserEmail();
        
        if (userId && userData) {
          const userWithId = { ...userData, id: userId, email: userEmail || userData.email };
          setUser(userWithId);
          setIsAuthenticated(true);
          
          // Cacheia o nome do usuário logado para os chats
          if (userWithId.nome && userWithId.nome !== 'Usuário') {
            try {
              await chatApi.cacheUserInfo(userId, userWithId.nome, userWithId.foto);
            } catch (cacheError) {
              console.error('Erro ao cachear nome na verificação:', cacheError);
            }
          }
        } else {
          await logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<UserData>) => {
    if (user) {
      const updatedUser: UserData = { ...user, ...userData };
      
      setUser(updatedUser);
      
      const currentToken = await AsyncStorage.getItem('@psique:session_token') || undefined;
      
      // Usa a nova função com cache
      await saveUserSessionWithCache(
        user.id, 
        updatedUser, 
        updatedUser.email, 
        currentToken
      );
    }
  };

  const refreshUserData = async () => {
    if (user?.email) {
      const result = await clientesApi.getClienteByEmail(user.email);
      if (result.success && result.userData) {
        await updateUser(result.userData);
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      loginWithGoogle, 
      signup, 
      logout, 
      checkAuth, 
      updateUser, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};