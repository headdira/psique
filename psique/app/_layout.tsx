import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, Text } from 'react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme';

// Interface para tipagem
interface ApiUser {
  id?: string;
  user_id?: string;
  _id?: string;
  nome?: string;
  name?: string;
  user_name?: string;
  foto?: string;
  photo?: string;
  user_photo?: string;
  picture?: string;
  email?: string;
}

interface UserProfile {
  nome: string;
  foto: string;
  email: string;
  updated_at: string;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
    // 'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'), // ARQUIVO FALTANDO
    // 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),     // ARQUIVO FALTANDO
  });

  // Log de erro de fonte se houver
  useEffect(() => {
    if (fontError) {
      console.error("Erro ao carregar fontes:", fontError);
    }
  }, [fontError]);

  // Inicialização do app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando app Psique...');
        
        // Verifica se é a primeira execução
        const firstRun = await AsyncStorage.getItem('@psique:first_run');
        if (!firstRun) {
          console.log('📝 Primeira execução do app');
          await AsyncStorage.setItem('@psique:first_run', 'true');
          
          // Configurações iniciais
          await AsyncStorage.setItem('@psique:notifications_enabled', 'true');
          await AsyncStorage.setItem('@psique:dark_mode', 'false');
        }
        
        // Verifica e atualiza cache de perfis se necessário
        const lastProfileUpdate = await AsyncStorage.getItem('@psique:last_profile_update');
        const today = new Date().toISOString().split('T')[0];
        
        if (!lastProfileUpdate || lastProfileUpdate !== today) {
          console.log('🔄 Atualizando cache de perfis...');
          
          // Esta atualização acontece em background
          setTimeout(async () => {
            try {
              // Tenta buscar perfis da API principal
              const endpoints = [
                'https://borababy.netlify.app/api/clientes',
                'https://afrodite-v1.netlify.app/api/users',
                'https://afrodite-v1.netlify.app/api/usuarios'
              ];
              
              let users: ApiUser[] = [];
              
              for (const endpoint of endpoints) {
                try {
                  console.log(`Tentando endpoint: ${endpoint}`);
                  const response = await fetch(endpoint);
                  if (response.ok) {
                    const data = await response.json();
                    
                    if (Array.isArray(data)) {
                      users = data as any[];
                      console.log(`✅ Encontrou ${data.length} usuários em ${endpoint}`);
                      break;
                    } else if (data && typeof data === 'object') {
                      // Tenta extrair array de objetos
                      if (data.users && Array.isArray(data.users)) {
                        users = data.users as any[];
                        console.log(`✅ Encontrou ${data.users.length} usuários em ${endpoint}`);
                        break;
                      } else if (data.clientes && Array.isArray(data.clientes)) {
                        users = data.clientes as any[];
                        console.log(`✅ Encontrou ${data.clientes.length} usuários em ${endpoint}`);
                        break;
                      } else if (Array.isArray(data.data)) {
                        users = data.data as any[];
                        console.log(`✅ Encontrou ${data.data.length} usuários em ${endpoint}`);
                        break;
                      }
                    }
                  }
                } catch (error: any) {
                  console.log(`❌ Falha no endpoint ${endpoint}:`, error.message);
                }
              }
              
              if (users.length > 0) {
                const profiles: { [key: string]: UserProfile } = {};
                let savedCount = 0;
                
                for (const user of users) {
                  const userId = user.id || user.user_id || user._id;
                  const userName = user.nome || user.name || user.user_name;
                  
                  if (userId && userName && userName !== 'Usuário' && !userName.includes('User')) {
                    profiles[userId] = {
                      nome: userName,
                      foto: user.foto || user.photo || user.user_photo || user.picture || '',
                      email: user.email || '',
                      updated_at: new Date().toISOString()
                    };
                    savedCount++;
                  }
                }
                
                // Salva os perfis no AsyncStorage
                const existingProfiles = await AsyncStorage.getItem('@saved_user_profiles');
                const existing = existingProfiles ? JSON.parse(existingProfiles) : {};
                
                // Merge dos perfis (mantém os existentes, atualiza com os novos)
                const mergedProfiles = { ...existing, ...profiles };
                
                await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(mergedProfiles));
                console.log(`✅ ${savedCount} novos perfis salvos. Total: ${Object.keys(mergedProfiles).length} perfis no cache`);
                
                // Agora também salva no cache individual para cada usuário
                const { chatApi } = require('../src/api/apiChat');
                
                for (const [userId, profile] of Object.entries(profiles)) {
                  try {
                    if (chatApi && chatApi.cacheUserInfo) {
                        await chatApi.cacheUserInfo(userId, profile.nome, profile.foto);
                    }
                  } catch (cacheError: any) {
                    console.error(`Erro ao cachear ${userId}:`, cacheError.message);
                  }
                }
              } else {
                console.log('⚠️ Não encontrou usuários em nenhum endpoint');
              }
            } catch (error: any) {
              console.error('❌ Erro ao atualizar cache de perfis:', error.message);
            } finally {
              await AsyncStorage.setItem('@psique:last_profile_update', today);
            }
          }, 5000); // Aguarda 5 segundos para não travar o carregamento inicial
        } else {
          console.log('✅ Cache de perfis já atualizado hoje');
        }
        
      } catch (error: any) {
        console.error('❌ Erro na inicialização do app:', error.message);
      }
    };
    
    initializeApp();
    
  }, []);

  // Se as fontes não carregaram e não deu erro, mostra loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.offWhite 
      }}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={{ marginTop: 16, color: Colors.gray }}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={Colors.offWhite} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.offWhite,
          },
          headerTintColor: Colors.black,
          headerTitleStyle: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.offWhite,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            animation: 'fade'
          }} 
        />
        <Stack.Screen 
          name="HomeScreen" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade'
          }} 
        />
        <Stack.Screen 
          name="home" 
          options={{ 
            title: 'psique',
            headerBackVisible: false,
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Perfil',
            headerShown: false,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="messages/index" 
          options={{ 
            title: 'Conversas',
            headerShown: false,
            presentation: 'card'
          }} 
        />
        <Stack.Screen 
          name="messages/[id]" 
          options={{ 
            title: 'Chat',
            headerShown: false,
            presentation: 'card'
          }} 
        />
        <Stack.Screen 
          name="create-date" 
          options={{ 
            title: 'Criar Date',
            headerShown: false,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
        />
      </Stack>
    </AuthProvider>
  );
}