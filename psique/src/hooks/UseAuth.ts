import { useState, useEffect } from 'react';
import { 
  isLoggedIn, 
  getUserData, 
  getUserId,
  clearSession 
} from '../api/api';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const loggedIn = await isLoggedIn();
      
      if (loggedIn) {
        const userData = await getUserData();
        const userId = await getUserId();
        
        if (userData && userId) {
          setUser({ ...userData, id: userId });
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await clearSession();
    setAuthenticated(false);
    setUser(null);
  };

  return {
    authenticated,
    user,
    loading,
    logout,
    checkAuth,
  };
};