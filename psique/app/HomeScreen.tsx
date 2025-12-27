import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform // <--- Importante para detectar se é Web ou Celular
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme/index';

import { styles } from './HomeScreen.styles';

export default function HomeScreen() {
  const { isAuthenticated, user, loading, logout, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Efeito para verificar autenticação
  useEffect(() => {
    console.log('🔍 [HomeScreen] Verificando autenticação...');
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        await checkAuth();
      } catch (error) {
        console.error('❌ [HomeScreen] Erro:', error);
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, []);

  // Efeito de segurança: Se deslogou, chuta para o login
  useEffect(() => {
    // Se terminou de carregar e não está autenticado
    if (!loading && !isChecking && isAuthenticated === false) {
      console.log('👋 [HomeScreen] Deslogado -> Indo para Login');
      router.replace('/');
    }
  }, [isAuthenticated, loading, isChecking]);

  // === LÓGICA DE LOGOUT CORRIGIDA ===
  const performLogout = async () => {
    console.log('🚪 Executando Logout...');
    try {
      await logout(); // Limpa o contexto/storage
      console.log('✅ Logout concluído. Redirecionando...');
      router.replace('/'); // Força a ida para a raiz
    } catch (error) {
      console.error('❌ Erro ao sair:', error);
    }
  };

  const handleLogout = () => {
    // Se for WEB, usa o confirm do navegador (mais confiável no localhost)
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Tem certeza que deseja desconectar?');
      if (confirm) {
        performLogout();
      }
    } 
    // Se for CELULAR (iOS/Android), usa o Alert nativo bonitinho
    else {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja desconectar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair', 
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Carregando sua vibe...</Text>
      </View>
    );
  }

  // Fallback de segurança se o user for null
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>psique</Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>sair</Text>
          </TouchableOpacity>
        </View>
        
        {/* Perfil do usuário */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user.foto ? (
              <Image 
                source={{ uri: user.foto }} 
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.nome?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.nome || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userType}>
                <Text style={styles.userTypeText}>{user.type || 'free'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.userIdContainer}>
            <Text style={styles.userIdLabel}>ID da conta:</Text>
            <Text style={styles.userId}>{user.id}</Text>
          </View>
        </View>
        
        {/* Informações da conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Sua conta</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Criada em</Text>
              <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Atualizada em</Text>
              <Text style={styles.infoValue}>{formatDate(user.updated_at)}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Ativa</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Preferências (se existirem) */}
        {user.gosto && Object.keys(user.gosto).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎭 Suas preferências</Text>
            
            <View style={styles.preferencesGrid}>
              {Object.entries(user.gosto).map(([key, value]) => (
                <View key={key} style={styles.preferenceItem}>
                  <Text style={styles.preferenceKey}>{key}:</Text>
                  <Text style={styles.preferenceValue}>
                    {typeof value === 'object' 
                      ? JSON.stringify(value) 
                      : String(value)
                    }
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ações rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.actionEmoji}>👤</Text>
              <Text style={styles.actionText}>Perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text style={styles.actionEmoji}>❤️</Text>
              <Text style={styles.actionText}>Matches</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text style={styles.actionEmoji}>🔍</Text>
              <Text style={styles.actionText}>Descobrir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text style={styles.actionEmoji}>⚙️</Text>
              <Text style={styles.actionText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Mensagem de boas-vindas */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Bem-vindo de volta! 🎉</Text>
          <Text style={styles.welcomeText}>
            Sua vibe está carregada. Hora de encontrar rolês incríveis{'\n'}
            e conexões reais. A vida offline te espera!
          </Text>
        </View>
        
        {/* Espaço no final */}
        <View style={styles.spacer} />
        
      </ScrollView>
    </SafeAreaView>
  );
}