import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
  Modal,
  TextInput,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiService } from '../src/api/apiDates';

// Filtros disponíveis
const FILTER_CATEGORIES = [
  {
    id: 'vibe',
    title: 'Vibe',
    options: [
      { id: 'chill', label: 'Chill', icon: '☕️' },
      { id: 'social', label: 'Social', icon: '👥' },
      { id: 'adventure', label: 'Aventura', icon: '🧗' },
      { id: 'creative', label: 'Criativo', icon: '🎨' },
      { id: 'foodie', label: 'Foodie', icon: '🍴' },
      { id: 'music', label: 'Música', icon: '🎵' },
      { id: 'night', label: 'Noite', icon: '🌙' },
      { id: 'sports', label: 'Esportes', icon: '⚽️' },
    ],
  },
  {
    id: 'location',
    title: 'Local',
    options: [
      { id: 'nearby', label: 'Perto de você', icon: '📍' },
      { id: 'center', label: 'Centro', icon: '🏙️' },
      { id: 'beach', label: 'Praia', icon: '🏖️' },
      { id: 'park', label: 'Parque', icon: '🌳' },
      { id: 'indoors', label: 'Lugar fechado', icon: '🏠' },
      { id: 'outdoors', label: 'Ar livre', icon: '🌞' },
    ],
  },
  {
    id: 'time',
    title: 'Horário',
    options: [
      { id: 'morning', label: 'Manhã', icon: '🌅' },
      { id: 'afternoon', label: 'Tarde', icon: '☀️' },
      { id: 'evening', label: 'Pôr do sol', icon: '🌇' },
      { id: 'night', label: 'Noite', icon: '🌃' },
      { id: 'weekend', label: 'Fim de semana', icon: '🎉' },
      { id: 'weekday', label: 'Dia de semana', icon: '📅' },
    ],
  },
];

// Função para mapear dados da API para o formato do frontend
const mapApiDateToCard = (apiDate: any, index: number) => {
  // Proteção contra dados nulos (Evita Tela Branca)
  if (!apiDate) return null;

  // Mapear tipo para imagem
  const imageMap: Record<string, string> = {
    parque: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    praia: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    bar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    restaurante: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    cinema: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13',
    show: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    outro: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
  };

  const type = apiDate.type ? apiDate.type.toLowerCase() : 'outro';
  const tone = apiDate.tone || 'casual';

  // Mapear tone para interesses
  const toneToInterests: Record<string, string[]> = {
    friendship: ['chill', 'social'],
    adventure: ['adventure', 'nature'],
    romantic: ['chill', 'music'],
    networking: ['social', 'business'],
    casual: ['chill', 'food'],
  };

  // Mapear tone para vibe
  const toneToVibe: Record<string, string> = {
    friendship: 'chill',
    adventure: 'adventure',
    romantic: 'romantic',
    networking: 'social',
    casual: 'casual',
  };

  let dateLabel = 'EM BREVE';
  let timeLabel = '';

  if (apiDate.datetime) {
    try {
        const date = new Date(apiDate.datetime);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            dateLabel = 'HOJE';
        } else if (diffDays === 1) {
            dateLabel = 'AMANHÃ';
        } else if (diffDays <= 7) {
            const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            dateLabel = days[date.getDay()];
        } else {
            dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
        }
        timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.log("Erro ao formatar data", e);
    }
  }

  // Extrair cidade da localização (BLINDADO contra null)
  const rawLocation = apiDate.location || 'Local a definir';
  const locationParts = rawLocation.split(',');
  const city = locationParts.length > 1 ? locationParts[0].trim() : rawLocation;

  return {
    id: apiDate.id || `temp-${index}`,
    title: apiDate.description ? (apiDate.description.split('.')[0] || type) : 'Sem título',
    description: apiDate.description || 'Sem descrição.',
    image: imageMap[type] || imageMap['outro'],
    date: dateLabel,
    time: timeLabel,
    location: rawLocation,
    city: city,
    distance: `${Math.floor(Math.random() * 10) + 1} km`,
    attendees: 0,
    maxAttendees: apiDate.max_participants || 2,
    interests: toneToInterests[tone] || ['chill', 'social'],
    vibe: toneToVibe[tone] || 'chill',
    creator: {
      name: 'Host',
      age: 28,
      sharedInterests: Math.floor(Math.random() * 3) + 1,
    },
    apiData: apiDate,
  };
};

export default function HomeScreen() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dates, setDates] = useState<any[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (!authLoading && !isChecking && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, isChecking]);

  useEffect(() => {
    if (isAuthenticated && !isChecking) {
      loadDates();
    }
  }, [isAuthenticated, isChecking]);

  const loadDates = async () => {
    try {
      setLoadingDates(true);
      const response = await apiService.getDates();
      
      if (response.ok && response.dates) {
        // CORREÇÃO: map((date: any, index: number)
        const mappedDates = response.dates
            .map((date: any, index: number) => mapApiDateToCard(date, index))
            .filter((item: any) => item !== null); // Remove nulos caso ocorra erro no map

        setDates(mappedDates);
      } else {
        // Não alerta erro se apenas não tiver dates, pode ser lista vazia
        console.log('Nenhum date carregado ou erro:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar dates:', error);
      Alert.alert('Erro', 'Falha na conexão com o servidor');
    } finally {
      setLoadingDates(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDates();
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  const handleJoinDate = async (dateId: string) => {
    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para participar');
      return;
    }

    Alert.alert(
      'Confirmar interesse',
      'Quer entrar nesse rolê?',
      [
        { text: 'Não agora', style: 'cancel' },
        { 
          text: 'Bora!', 
          onPress: async () => {
            try {
              const res = await apiService.submitToDate(dateId, user.id, "Tenho interesse!", user.nome);
              if(res.ok) {
                  Alert.alert('Show!', 'Seu interesse foi registrado.');
              } else {
                  Alert.alert('Ops', res.error || 'Erro ao registrar');
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível registrar seu interesse');
            }
          },
        },
      ]
    );
  };

  const getInterestEmoji = (interest: string) => {
    const emojiMap: Record<string, string> = {
      chill: '🕊️',
      music: '🎵',
      nature: '🌿',
      nightlife: '🌙',
      food: '🍴',
      games: '🎮',
      social: '👥',
      adventure: '🧗',
      romantic: '💝',
      business: '💼',
    };
    return emojiMap[interest] || '✨';
  };

  const renderDateCard = (date: any) => (
    <TouchableOpacity 
      key={date.id}
      style={styles.dateCard}
      onPress={() => {
          // Se tiver uma tela de detalhes específica, use aqui
          // Por enquanto, vamos reutilizar a HomeScreen de messages que tem o modal
          router.push('/messages/HomeScreen'); 
      }}
      activeOpacity={0.95}
    >
      {/* Header com data e local */}
      <View style={styles.dateHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{date.date}</Text>
          <Text style={styles.dateTime}>{date.time}</Text>
        </View>
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={12} color={Colors.gray} />
          <Text style={styles.locationText}>{date.distance} • {date.city}</Text>
        </View>
      </View>

      {/* Imagem */}
      <Image 
        source={{ uri: date.image }} 
        style={styles.dateImage}
        resizeMode="cover"
      />

      {/* Conteúdo */}
      <View style={styles.dateContent}>
        <Text style={styles.dateTitle}>{date.title}</Text>
        <Text style={styles.dateDescription} numberOfLines={2}>{date.description}</Text>

        {/* Interesses */}
        <View style={styles.interestsRow}>
          {date.interests.map((interest: string, index: number) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestEmoji}>{getInterestEmoji(interest)}</Text>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Criador e participantes */}
        <View style={styles.peopleSection}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitial}>{date.creator.name.charAt(0)}</Text>
            </View>
            <View style={styles.creatorDetails}>
              <Text style={styles.creatorName}>{date.creator.name}</Text>
              <Text style={styles.sharedInterests}>
                {date.creator.sharedInterests} interesses em comum
              </Text>
            </View>
          </View>
          
          <View style={styles.attendeesInfo}>
            <View style={styles.attendeesCount}>
              <Ionicons name="people" size={14} color={Colors.gray} />
              <Text style={styles.attendeesText}>
                {date.attendees}/{date.maxAttendees}
              </Text>
            </View>
            <Text style={styles.attendeesLabel}>participantes</Text>
          </View>
        </View>

        {/* Botão de ação */}
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => handleJoinDate(date.id)}
        >
          <Text style={styles.joinButtonText}>Quero ir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filtrar rolês</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFilters(false)}
          >
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Busca */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={Colors.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar rolês..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          {/* Filtros por categoria */}
          {FILTER_CATEGORIES.map(category => (
            <View key={category.id} style={styles.filterCategory}>
              <Text style={styles.filterCategoryTitle}>{category.title}</Text>
              <View style={styles.filterOptions}>
                {category.options.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      activeFilters.includes(option.id) && styles.filterOptionActive
                    ]}
                    onPress={() => toggleFilter(option.id)}
                  >
                    <Text style={styles.filterOptionIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.filterOptionLabel,
                      activeFilters.includes(option.id) && styles.filterOptionLabelActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer do modal */}
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearButtonText}>Limpar tudo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>
              Ver {dates.length} rolês
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (authLoading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>psique</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
            <Ionicons name="filter" size={22} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de busca */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="search" size={18} color={Colors.gray} />
        <Text style={styles.searchPlaceholder}>
          Buscar experiências...
        </Text>
      </TouchableOpacity>

      {/* Feed */}
      <ScrollView 
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.green]}
            tintColor={Colors.green}
          />
        }
      >
        {/* Saudação */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            Olá, {user?.nome?.split(' ')[0] || 'pessoa'}.
          </Text>
          <Text style={styles.subGreeting}>
            Rolês reais perto de você.
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/create-date')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add" size={24} color={Colors.black} />
            </View>
            <Text style={styles.quickActionText}>Criar rolê</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/messages/HomeScreen')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="calendar" size={20} color={Colors.black} />
            </View>
            <Text style={styles.quickActionText}>Meus Rolês</Text>
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View style={styles.datesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rolês próximos</Text>
            <Text style={styles.sectionSubtitle}>
              {dates.length} encontros disponíveis
            </Text>
          </View>

          <View style={styles.datesList}>
            {loadingDates && !refreshing ? (
                 <ActivityIndicator size="large" color={Colors.green} style={{marginTop: 20}} />
            ) : dates.length > 0 ? (
              dates.map(date => renderDateCard(date))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={60} color={Colors.gray} />
                <Text style={styles.emptyStateTitle}>Nenhum rolê encontrado</Text>
                <Text style={styles.emptyStateText}>
                  Seja o primeiro a criar um rolê na sua área!
                </Text>
                <TouchableOpacity 
                  style={styles.createFirstButton}
                  onPress={() => router.push('/create-date')}
                >
                  <Text style={styles.createFirstButtonText}>Criar meu primeiro rolê</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {}}
        >
          <Ionicons name="home" size={22} color={Colors.black} />
          <Text style={styles.navLabelActive}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/explore')}
        >
          <Ionicons name="compass" size={22} color={Colors.gray} />
          <Text style={styles.navLabel}>Explorar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/create-date')}
        >
          <View style={styles.createButton}>
            <Ionicons name="add" size={28} color={Colors.white} />
          </View>
          <Text style={styles.navLabel}>Criar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/messages')}
        >
          <Ionicons name="chatbubble" size={20} color={Colors.gray} />
          <Text style={styles.navLabel}>Chats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person" size={22} color={Colors.gray} />
          <Text style={styles.navLabel}>Perfil</Text>
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
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  filterButton: {
    position: 'relative',
    padding: Spacing.xs,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.green,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: Colors.offWhite,
  },
  filterBadgeText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  profileButton: {
    padding: Spacing.xs,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: Colors.offWhite,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },

  // Active Filters
  activeFiltersContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  activeFiltersContent: {
    gap: Spacing.xs,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.xs,
  },
  clearAllText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.green,
    gap: Spacing.xs,
  },
  activeFilterText: {
    fontSize: 13,
    color: Colors.green,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  moreFilters: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  moreFiltersText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },

  // Feed Container
  feedContainer: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 100,
  },

  // Greeting
  greetingSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Spacing.xs,
  },
  subGreeting: {
    fontSize: 17,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(95, 240, 169, 0.3)',
  },
  quickActionText: {
    fontSize: 13,
    color: Colors.black,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },

  // Dates Section
  datesSection: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  datesList: {
    gap: Spacing.lg,
  },
  dateItem: {
    marginBottom: Spacing.lg,
  },

  // Date Card
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: Spacing.lg
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(43, 43, 43, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dateBadge: {
    alignItems: 'flex-start',
  },
  dateBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  dateTime: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  dateImage: {
    width: '100%',
    height: 200,
  },
  dateContent: {
    padding: Spacing.lg,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Spacing.xs,
  },
  dateDescription: {
    fontSize: 15,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 43, 43, 0.05)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  interestEmoji: {
    fontSize: 14,
  },
  interestText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  peopleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorInitial: {
    color: Colors.offWhite,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sharedInterests: {
    fontSize: 13,
    color: Colors.green,
    fontFamily: 'Inter-Medium',
  },
  attendeesInfo: {
    alignItems: 'flex-end',
  },
  attendeesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  attendeesText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  attendeesLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  joinButton: {
    backgroundColor: Colors.black,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  joinButtonText: {
    color: Colors.offWhite,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    position: 'relative',
  },
  createButton: {
    position: 'absolute',
    top: -25,
    backgroundColor: Colors.black,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navLabel: {
    fontSize: 11,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
    marginTop: 24,
  },
  navLabelActive: {
    fontSize: 11,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },

  // Modal de Filtros
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  searchSection: {
    marginBottom: Spacing.xl,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
  },
  filterCategory: {
    marginBottom: Spacing.xl,
  },
  filterCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  filterOptionActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  filterOptionIcon: {
    fontSize: 16,
  },
  filterOptionLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },
  filterOptionLabelActive: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  distanceOption: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  distanceOptionActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  distanceOptionText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },
  distanceOptionTextActive: {
    color: Colors.offWhite,
    fontFamily: 'Inter-SemiBold',
  },
  dateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dateOption: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  dateOptionActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  dateOptionText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },
  dateOptionTextActive: {
    color: Colors.offWhite,
    fontFamily: 'Inter-SemiBold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    gap: Spacing.md,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  clearButtonText: {
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-SemiBold',
  },
  applyButton: {
    flex: 2,
    backgroundColor: Colors.black,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: Colors.offWhite,
    fontFamily: 'Inter-Bold',
  },

  // Footer
  footerSpacer: {
    height: Spacing.xxl,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  createFirstButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});