import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
// ADICIONEI ESTE IMPORT QUE FALTAVA:
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBrowserReturn = async (result: WebBrowser.WebBrowserAuthSessionResult) => {
    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      
      const gToken = queryParams?.['g_token'];
      if (typeof gToken === 'string') {
        const decoded = decodeJwt(gToken);
        
        if (decoded && decoded.email) {
          const userData: UserData = {
            id: decoded.sub || decoded.id || 'temp_id',
            email: decoded.email,
            nome: decoded.name || decoded.nome || 'Usuário',
            type: 'user', 
            foto: decoded.picture || decoded.foto
          };
          
          await saveUserSession(userData.id, userData, userData.email, gToken);
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true, message: 'Autenticado com sucesso' };
        }
      }
      
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
      const authUrl = 'https://borababy.netlify.app/?mode=google'; 
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
      const authUrl = 'https://borababy.netlify.app/?mode=signup'; 
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
        const saved = await saveUserSession(result.userId, result.userData, result.userData.email);
        
        if (saved) {
          setUser({ ...result.userData, id: result.userId, email: result.userData.email });
          setIsAuthenticated(true);
          return { 
            success: true, 
            message: 'Login realizado com sucesso', 
            user: { ...result.userData, id: result.userId, email: result.userData.email } 
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
      await clearSession();
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
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        const userId = await getUserId();
        const userData = await getUserData();
        const userEmail = await getUserEmail();
        
        if (userId && userData) {
          setUser({ ...userData, id: userId, email: userEmail || userData.email });
          setIsAuthenticated(true);
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
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // AGORA O ASYNC STORAGE EXISTE NO IMPORT
      const currentToken = await AsyncStorage.getItem('@psique:session_token') || undefined;
      await saveUserSession(user.id, updatedUser, updatedUser.email, currentToken);
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
      isAuthenticated, user, loading, login, loginWithGoogle, signup, logout, checkAuth, updateUser, refreshUserData 
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