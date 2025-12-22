import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { 
  getUserId, 
  getUserData, 
  getUserEmail,
  getSessionToken,
  clearSession,
  isLoggedIn,
  saveUserSession,
  clientesApi,
  UserData
} from '../api/api';

// Configura o WebBrowser para fechar corretamente após o login
WebBrowser.maybeCompleteAuthSession();

interface AuthContextData {
  isAuthenticated: boolean | null;
  user: UserData | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; message?: string; user?: UserData }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Função auxiliar simples para decodificar JWT sem bibliotecas externas
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

// Polyfill básico para atob no React Native caso não exista
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

  // === LOGIN COM GOOGLE (NOVO) ===
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      // 1. Define a URL de redirecionamento do App (Deep Link)
      const redirectUri = Linking.createURL('/'); 
      
      // 2. Monta a URL para abrir o seu Eros Auth
      // AVISO: Certifique-se que o VITE_APP_URL no Netlify do Borababy 
      // esteja apontando para este redirectUri ou que você trate isso lá.
      // Por enquanto, abriremos a home e o usuário loga.
      const authUrl = 'https://borababy.netlify.app'; 

      console.log('🌐 Abrindo navegador para:', authUrl);

      // 3. Abre o navegador interno
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      // 4. Verifica se voltou com sucesso e com Token
      if (result.type === 'success' && result.url) {
        // Extrai o g_token da URL de retorno
        const { queryParams } = Linking.parse(result.url);
        const gToken = queryParams?.['g_token'];

        if (typeof gToken === 'string') {
          console.log('🔑 Token recebido do Google!');
          
          // Decodifica o token para pegar o email
          const decoded = decodeJwt(gToken);
          if (decoded && decoded.email) {
            console.log('📧 Email recuperado do token:', decoded.email);
            
            // Reutiliza a função de login existente usando o email validado pelo Google
            return await login(decoded.email);
          }
        }
      }

      return { success: false, message: 'Login cancelado ou falhou' };

    } catch (error: any) {
      console.error('❌ Erro no Login Google:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // === LOGIN PADRÃO (MANTIDO) ===
  const login = async (email: string) => {
    try {
      setLoading(true);
      
      console.log('🔍 Iniciando login para email:', email);
      
      if (!email.trim()) {
        return { success: false, message: 'Digite seu email' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Digite um email válido' };
      }

      // Busca o cliente na API
      const result = await clientesApi.getClienteByEmail(email);
      
      if (result.success && result.userId && result.userData) {
        console.log('✅ Cliente encontrado:', {
          userId: result.userId,
          nome: result.userData.nome,
          email: result.userData.email,
        });
        
        // Salva a sessão do usuário
        const saved = await saveUserSession(
          result.userId,
          result.userData,
          result.userData.email
        );
        
        if (saved) {
          console.log('💾 Sessão salva com sucesso');
          
          setUser({
            ...result.userData,
            id: result.userId,
            email: result.userData.email,
          });
          setIsAuthenticated(true);
          
          return { 
            success: true, 
            message: 'Login realizado com sucesso',
            user: {
              ...result.userData,
              id: result.userId,
              email: result.userData.email,
            }
          };
        } else {
          return { success: false, message: 'Erro ao salvar sessão' };
        }
      } else {
        return { 
          success: false, 
          message: result.message || 'Email não encontrado. Deseja criar uma conta?' 
        };
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao conectar com o servidor' 
      };
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
      console.log('👋 Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
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
          setUser({
            ...userData,
            id: userId,
            email: userEmail || userData.email,
          });
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado:', userData.nome);
        } else {
          await clearSession();
          setIsAuthenticated(false);
          setUser(null);
          console.log('⚠️ Dados de sessão inconsistentes, limpando...');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('🚫 Nenhum usuário autenticado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<UserData>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        
        await saveUserSession(
          user.id,
          updatedUser,
          updatedUser.email
        );
        
        console.log('📝 Dados do usuário atualizados:', updatedUser);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      if (user?.email) {
        const result = await clientesApi.getClienteByEmail(user.email);
        
        if (result.success && result.userId && result.userData) {
          const updatedUser = {
            ...result.userData,
            id: result.userId,
            email: result.userData.email,
          };
          
          setUser(updatedUser);
          await saveUserSession(
            result.userId,
            result.userData,
            result.userData.email
          );
          
          console.log('🔄 Dados do usuário atualizados da API:', updatedUser);
          return updatedUser;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados da API:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
    
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth();
      }
    }, 5 * 60 * 1000); 
    
    return () => clearInterval(interval);
  }, []);

  const contextValue: AuthContextData = {
    isAuthenticated,
    user,
    loading,
    login,
    loginWithGoogle, // Exportando a nova função
    logout,
    checkAuth,
    updateUser,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};