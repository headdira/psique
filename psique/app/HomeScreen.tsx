import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContexts'; // CORRIGIDO: AuthContext, não AuthContexts
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../src/theme/index';

export default function HomeScreen() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  // Efeito para verificar autenticação
  useEffect(() => {
    console.log('🔍 [HomeScreen] useEffect - Verificando autenticação...');
    console.log('🔍 [HomeScreen] Estado inicial:', {
      isAuthenticated,
      loading,
      user: user ? `Sim (${user.nome})` : 'Não',
    });

    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        console.log('🔄 [HomeScreen] Chamando checkAuth...');
        await checkAuth();
      } catch (error) {
        console.error('❌ [HomeScreen] Erro ao verificar autenticação:', error);
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, []);

  // Efeito de segurança: Se deslogou, chuta para o login
  useEffect(() => {
    console.log('🔄 [HomeScreen] Monitorando autenticação:', {
      isAuthenticated,
      loading,
      isChecking,
    });

    if (!loading && !isChecking && isAuthenticated === false) {
      console.log('🚫 [HomeScreen] Usuário não autenticado, redirecionando...');
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
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            console.log('🔄 [HomeScreen] Iniciando logout...');
            await logout();
            console.log('✅ [HomeScreen] Logout concluído');
            router.replace('/');
          }
        ]
      );
    }
  };

  const handleJoinDate = (dateId: string) => {
    Alert.alert(
      'Confirmar presença',
      'Você quer confirmar sua presença neste rolê?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Implementar lógica de join
            Alert.alert('Sucesso!', 'Presença confirmada!');
          }
        }
      ]
    );
  };

  const renderDateItem = ({ item }: { item: typeof MOCK_DATES[0] }) => (
    <TouchableOpacity 
      style={styles.dateCard}
      onPress={() => Alert.alert(item.title, 'Detalhes do rolê em desenvolvimento')}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.dateImage}
        resizeMode="cover"
      />
      
      <View style={styles.dateContent}>
        <View style={styles.dateHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{item.date}</Text>
          </View>
          {item.isJoined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedBadgeText}>✅ Confirmado</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.dateTitle}>{item.title}</Text>
        <Text style={styles.dateDescription}>{item.description}</Text>
        
        <View style={styles.dateInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕒</Text>
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <Text style={styles.infoText}>{item.attendees} pessoas</Text>
          </View>
        </View>
        
        {!item.isJoined ? (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinDate(item.id)}
          >
            <Text style={styles.joinButtonText}>Entrar na vibe</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.joinedButton}
            onPress={() => Alert.alert('Detalhes', 'Você já confirmou presença!')}
          >
            <Text style={styles.joinedButtonText}>Ver detalhes</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Carregando sua vibe...</Text>
        {__DEV__ && (
          <Text style={styles.debugText}>
            Estado: {isAuthenticated === null ? 'Verificando...' : isAuthenticated ? 'Autenticado' : 'Não autenticado'}
          </Text>
        )}
      </View>
    );
  }

  // Se não estiver autenticado, mostra mensagem ou null
  if (!isAuthenticated || !user) {
    console.log('🚫 [HomeScreen] Renderizando null - não autenticado');
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
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          {user.foto ? (
            <Image 
              source={{ uri: user.foto }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {user.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs de navegação */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {[
            { id: 'discover', label: 'Descobrir', icon: '🔍' },
            { id: 'joined', label: 'Meus Rolês', icon: '🎉' },
            { id: 'upcoming', label: 'Próximos', icon: '📅' },
            { id: 'saved', label: 'Salvos', icon: '❤️' },
            { id: 'history', label: 'Histórico', icon: '📝' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed de Dates */}
      <FlatList
        data={MOCK_DATES}
        renderItem={renderDateItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.datesList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rolês perto de você</Text>
            <TouchableOpacity onPress={() => Alert.alert('Filtros', 'Funcionalidade em desenvolvimento')}>
              <Text style={styles.filterButton}>Filtrar</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      {/* Menu de Navegação Fixo */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => Alert.alert('Mensagens', 'Funcionalidade em desenvolvimento')}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Mensagens</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => Alert.alert('Criar', 'Funcionalidade em desenvolvimento')}
        >
          <View style={styles.createButton}>
            <Text style={styles.createButtonIcon}>+</Text>
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
        
        {/* Debug info (apenas desenvolvimento) */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>🔧 Debug Info</Text>
            <Text style={styles.debugText}>ID: {user.id}</Text>
            <Text style={styles.debugText}>Email: {user.email}</Text>
            <Text style={styles.debugText}>Nome: {user.nome}</Text>
            <Text style={styles.debugText}>Tipo: {user.type}</Text>
          </View>
        )}
        
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
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    opacity: 0.7,
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
  debugSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(43, 43, 43, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  debugTitle: {
    ...Typography.bodySmall,
    color: Colors.gray,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
    fontSize: 12,
  },
  spacer: {
    height: Spacing.xxl,
  },
});