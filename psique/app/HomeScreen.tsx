import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
// CORREÇÃO: Usando a biblioteca certa para Safe Area
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// CORREÇÃO: Caminho apontando para src
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../src/theme/index';

export default function HomeScreen() {
  const { isAuthenticated, user, loading, logout, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

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

  useEffect(() => {
    if (!loading && !isChecking && isAuthenticated === false) {
      console.log('🚫 [HomeScreen] Não autenticado -> Redirecionando para Login');
      router.replace('/');
    }
  }, [isAuthenticated, loading, isChecking]);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
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

  if (!isAuthenticated || !user) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.offWhite,
  },
  logo: {
    ...Typography.h2,
    color: Colors.black,
    letterSpacing: -1,
    fontFamily: 'Montserrat-Bold',
  },
  logoutButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    ...Typography.caption,
    color: '#FF6B6B',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.subtle,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.lg,
    backgroundColor: Colors.lightGray,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.black,
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.h3,
    color: Colors.black,
    marginBottom: Spacing.xs,
    fontFamily: 'Inter-SemiBold',
  },
  userEmail: {
    ...Typography.body,
    color: Colors.gray,
    marginBottom: Spacing.sm,
    fontSize: 14,
  },
  userType: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  userTypeText: {
    ...Typography.caption,
    color: Colors.green,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  userIdContainer: {
    backgroundColor: 'rgba(43, 43, 43, 0.05)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  userIdLabel: {
    ...Typography.caption,
    color: Colors.gray,
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  userId: {
    ...Typography.bodySmall,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.black,
    marginBottom: Spacing.md,
    fontFamily: 'Inter-SemiBold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  infoCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.subtle,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.gray,
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  infoValue: {
    ...Typography.bodySmall,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.green,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  preferencesGrid: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  preferenceKey: {
    ...Typography.bodySmall,
    color: Colors.gray,
    flex: 1,
    fontSize: 14,
  },
  preferenceValue: {
    ...Typography.bodySmall,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    flex: 2,
    textAlign: 'right',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    fontSize: 14,
  },
  welcomeSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(95, 240, 169, 0.2)',
  },
  welcomeTitle: {
    ...Typography.h3,
    color: Colors.black,
    marginBottom: Spacing.sm,
    fontFamily: 'Inter-SemiBold',
  },
  welcomeText: {
    ...Typography.body,
    color: Colors.gray,
    lineHeight: 22,
    fontSize: 15,
  },
  spacer: {
    height: Spacing.xxl,
  },
});