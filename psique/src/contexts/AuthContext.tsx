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
  
  // NOVAS FUNÇÕES ADICIONADAS
  fetchUserInfo: (userId: string) => Promise<string | null>;
  fetchAllUserProfiles: () => Promise<boolean>;
  getUserProfileFromLocal: (userId: string) => Promise<any>;
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

// Função para salvar perfil localmente (para referência futura)
const saveUserProfileLocally = async (userId: string, userData: any) => {
  try {
    const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
    const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
    
    profiles[userId] = {
      nome: userData.nome || userData.name || 'Usuário',
      foto: userData.foto || userData.photo || userData.picture,
      email: userData.email || '',
      updated_at: new Date().toISOString()
    };
    
    await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(profiles));
    console.log(`✅ Perfil salvo localmente: ${profiles[userId].nome} (ID: ${userId})`);
    
    // Também salva no cache da API de chat
    await chatApi.cacheUserInfo(userId, profiles[userId].nome, profiles[userId].foto);
    
    return profiles[userId].nome;
  } catch (error) {
    console.error('Erro ao salvar perfil localmente:', error);
    return null;
  }
};

// Função para buscar perfil localmente
const getUserProfileFromLocal = async (userId: string): Promise<any> => {
  try {
    const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      return profiles[userId] || null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil local:', error);
    return null;
  }
};

// Função para buscar TODOS os perfis da API
const fetchAllUserProfilesFromAPI = async (): Promise<boolean> => {
  try {
    console.log('🔄 Buscando TODOS os perfis da API...');
    
    // URL da sua API
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
        console.log(`Tentando endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            allUsers = [...allUsers, ...data];
            console.log(`✅ Encontrou ${data.length} usuários em ${endpoint}`);
            break;
          } else if (typeof data === 'object' && data !== null) {
            // Se a API retornar um objeto com um array dentro
            if (data.users && Array.isArray(data.users)) {
              allUsers = [...allUsers, ...data.users];
              console.log(`✅ Encontrou ${data.users.length} usuários em ${endpoint}`);
              break;
            } else if (data.clientes && Array.isArray(data.clientes)) {
              allUsers = [...allUsers, ...data.clientes];
              console.log(`✅ Encontrou ${data.clientes.length} usuários em ${endpoint}`);
              break;
            }
          }
        }
      } catch (error) {
        console.log(`❌ Falha no endpoint ${endpoint}:`, error);
      }
    }
    
    if (allUsers.length === 0) {
      console.log('⚠️ Não encontrou usuários em nenhum endpoint, tentando endpoint único...');
      // Tenta buscar usuários individualmente (mais lento)
      return false;
    }
    
    // Processa e salva os perfis
    const profiles: Record<string, any> = {};
    let savedCount = 0;
    
    for (const user of allUsers) {
      const userId = user.id || user.user_id || user._id;
      const userName = user.nome || user.name || user.user_name;
      
      if (userId && userName && userName !== 'Usuário' && !userName.includes('User')) {
        profiles[userId] = {
          nome: userName,
          foto: user.foto || user.photo || user.user_photo || user.picture,
          email: user.email || '',
          updated_at: new Date().toISOString()
        };
        
        savedCount++;
        
        // Salva no cache da API de chat
        chatApi.cacheUserInfo(userId, userName, user.foto || user.photo || user.user_photo)
          .catch(err => console.error(`Erro ao cachear ${userId}:`, err));
      }
    }
    
    // Salva no AsyncStorage
    await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(profiles));
    console.log(`✅ ${savedCount} perfis salvos localmente!`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao buscar todos os perfis:', error);
    return false;
  }
};

// Função para buscar informações de outro usuário
const fetchAndSaveOtherUserInfo = async (userId: string): Promise<string | null> => {
  try {
    console.log(`🔍 Buscando informações do usuário: ${userId}`);
    
    // Primeiro tenta buscar do cache local
    const localProfile = await getUserProfileFromLocal(userId);
    if (localProfile && localProfile.nome && !localProfile.nome.includes('User')) {
      console.log(`✅ Já tem no cache local: ${localProfile.nome}`);
      return localProfile.nome;
    }
    
    // Tenta buscar da API de clientes
    try {
      console.log(`Tentando API de clientes para ${userId}...`);
      const response = await fetch(`https://borababy.netlify.app/api/clientes/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.nome && userData.nome !== 'Usuário') {
          console.log(`✅ Encontrado na API de clientes: ${userData.nome}`);
          await saveUserProfileLocally(userId, userData);
          return userData.nome;
        }
      }
    } catch (apiError) {
      console.log(`⚠️ Não encontrou na API de clientes, tentando alternativa...`);
    }
    
    // Tenta buscar da API geral
    try {
      console.log(`Tentando API geral para ${userId}...`);
      const response = await fetch(`https://borababy.netlify.app/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.name && userData.name !== 'Usuário') {
          console.log(`✅ Encontrado na API geral: ${userData.name}`);
          await saveUserProfileLocally(userId, userData);
          return userData.name;
        }
      }
    } catch (generalApiError) {
      console.log(`⚠️ Também não encontrou na API geral`);
    }
    
    // Tenta buscar da API de chat
    try {
      console.log(`Tentando API de chat para ${userId}...`);
      const userInfo = await chatApi.fetchRealUserInfo(userId);
      if (userInfo && userInfo.name && !userInfo.name.includes('User')) {
        console.log(`✅ Encontrado na API de chat: ${userInfo.name}`);
        await saveUserProfileLocally(userId, { nome: userInfo.name, foto: userInfo.photo });
        return userInfo.name;
      }
    } catch (chatApiError) {
      console.log(`⚠️ Também não encontrou na API de chat`);
    }
    
    console.log(`❌ Não encontrou informações para o usuário ${userId}`);
    return null;
  } catch (error) {
    console.error(`❌ Erro ao buscar info do usuário ${userId}:`, error);
    return null;
  }
};

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
        
        // SALVA TAMBÉM LOCALMENTE PARA REFERÊNCIA FUTURA
        await saveUserProfileLocally(userId, userData);
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
              await saveUserProfileLocally(userId, userWithId);
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

  // NOVAS FUNÇÕES
  const fetchUserInfo = async (userId: string): Promise<string | null> => {
    return await fetchAndSaveOtherUserInfo(userId);
  };

  const fetchAllUserProfiles = async (): Promise<boolean> => {
    return await fetchAllUserProfilesFromAPI();
  };

  const getUserProfileFromLocalContext = async (userId: string): Promise<any> => {
    return await getUserProfileFromLocal(userId);
  };

  useEffect(() => {
    checkAuth();
    
    // Quando o app inicia, tenta buscar todos os perfis (em background)
    const loadProfiles = async () => {
      try {
        const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
        if (!savedProfiles) {
          // Aguarda um pouco para não travar o login
          setTimeout(async () => {
            await fetchAllUserProfilesFromAPI();
          }, 3000);
        }
      } catch (error) {
        console.error('Erro ao carregar perfis no startup:', error);
      }
    };
    
    loadProfiles();
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
      refreshUserData,
      fetchUserInfo,
      fetchAllUserProfiles,
      getUserProfileFromLocal: getUserProfileFromLocalContext
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