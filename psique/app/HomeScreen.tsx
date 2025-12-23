import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContexts';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../src/theme/index';

// Dados mockados de dates (você substituirá pela API real)
const MOCK_DATES = [
  {
    id: '1',
    title: 'Rolê na Praia',
    description: 'Pôr do sol com música ao vivo',
    date: 'SAB, 15 OUT',
    time: '17:00',
    location: 'Praia de Ipanema',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    attendees: 12,
    isJoined: true,
  },
  {
    id: '2',
    title: 'Festa Indie',
    description: 'Bandas locais e drinks especiais',
    date: 'SEX, 21 OUT',
    time: '21:00',
    location: 'Lapa',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w-400',
    attendees: 24,
    isJoined: false,
  },
  {
    id: '3',
    title: 'Piquenique no Parque',
    description: 'Comida, jogos e boa conversa',
    date: 'DOM, 23 OUT',
    time: '14:00',
    location: 'Parque do Flamengo',
    image: 'https://images.unsplash.com/photo-1523293915678-d126868e96f1?w=400',
    attendees: 8,
    isJoined: true,
  },
  {
    id: '4',
    title: 'Workshop de Fotografia',
    description: 'Aprenda com profissionais',
    date: 'QUI, 27 OUT',
    time: '10:00',
    location: 'Botafogo',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400',
    attendees: 15,
    isJoined: false,
  },
];

export default function HomeScreen() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  // Efeito para verificar autenticação
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        // Aguarda um momento para garantir que o estado seja verificado
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, []);

  // Efeito para redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !isChecking && isAuthenticated === false) {
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

  // Loading state
  if (loading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Carregando seus rolês...</Text>
      </View>
    );
  }

  // Se não estiver autenticado
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Redirecionando para login...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user.nome?.split(' ')[0] || 'amigo'} 👋</Text>
          <Text style={styles.subGreeting}>Pronto pra curtir?</Text>
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
          <Text style={styles.navLabel}>Criar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={handleLogout}
        >
          <Text style={styles.navIcon}>👋</Text>
          <Text style={styles.navLabel}>Sair</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.offWhite,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.black,
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.black,
  },
  tabsContainer: {
    backgroundColor: Colors.offWhite,
    paddingVertical: Spacing.sm,
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  tabButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray,
  },
  tabLabelActive: {
    color: Colors.black,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.black,
  },
  filterButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.green,
    textDecorationLine: 'underline',
  },
  datesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.subtle,
  },
  dateImage: {
    width: '100%',
    height: 180,
  },
  dateContent: {
    padding: Spacing.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  dateBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  joinedBadge: {
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  joinedBadgeText: {
    color: Colors.green,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  dateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  dateDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  dateInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoIcon: {
    fontSize: 14,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.black,
  },
  joinButton: {
    backgroundColor: Colors.green,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
  },
  joinedButton: {
    backgroundColor: Colors.lightGray,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  joinedButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray,
  },
  listFooter: {
    height: Spacing.xxl,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  navButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.gray,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 4,
    ...Shadows.medium,
  },
  createButtonIcon: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.black,
  },
});