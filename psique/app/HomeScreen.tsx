import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
<<<<<<< HEAD
  StyleSheet,
  Modal,
  TextInput,
  Switch,
=======
  Platform
>>>>>>> 2d054c06882229e3cacbad051fbdac8879615ace
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
<<<<<<< HEAD
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';

// Dados mock
const MOCK_DATES = [
  {
    id: '1',
    title: 'Pôr do sol na Praia',
    description: 'Vibe tranquila com música boa e drinks.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    date: 'HOJE',
    time: '17:00',
    location: 'Copacabana',
    city: 'Rio de Janeiro',
    distance: '2 km',
    attendees: 8,
    maxAttendees: 12,
    interests: ['chill', 'nature', 'music'],
    vibe: 'chill',
    creator: {
      name: 'Carla',
      age: 29,
      sharedInterests: 3,
    },
  },
  {
    id: '2',
    title: 'Noite Indie & Craft Beer',
    description: 'Bandas novas e cerveja artesanal.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    date: 'AMANHÃ',
    time: '21:00',
    location: 'Vila Madalena',
    city: 'São Paulo',
    distance: '3.5 km',
    attendees: 6,
    maxAttendees: 15,
    interests: ['music', 'nightlife', 'food'],
    vibe: 'social',
    creator: {
      name: 'Lucas',
      age: 26,
      sharedInterests: 2,
    },
  },
  {
    id: '3',
    title: 'Piquenique no Parque',
    description: 'Jogos de tabuleiro e música ao ar livre.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    date: 'SÁB',
    time: '14:00',
    location: 'Ibirapuera',
    city: 'São Paulo',
    distance: '1.2 km',
    attendees: 12,
    maxAttendees: 20,
    interests: ['nature', 'chill', 'games'],
    vibe: 'casual',
    creator: {
      name: 'Ana',
      age: 31,
      sharedInterests: 4,
    },
  },
];

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

export default function HomeScreen() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!loading && !isChecking && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, isChecking]);

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

  const handleJoinDate = (dateId: string) => {
    Alert.alert(
      'Confirmar interesse',
      'Quer entrar nesse rolê?',
      [
        { text: 'Não agora', style: 'cancel' },
        { 
          text: 'Bora!', 
          onPress: () => {
            Alert.alert('Show!', 'Seu interesse foi registrado.');
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
    };
    return emojiMap[interest] || '✨';
  };

  const renderDateCard = (date: typeof MOCK_DATES[0]) => (
    <TouchableOpacity 
      style={styles.dateCard}
      onPress={() => router.push(`/date/${date.id}`)}
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
          <Text style={styles.locationText}>{date.distance} • {date.location}</Text>
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
        <Text style={styles.dateDescription}>{date.description}</Text>

        {/* Interesses */}
        <View style={styles.interestsRow}>
          {date.interests.map((interest, index) => (
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
              <Text style={styles.creatorName}>{date.creator.name}, {date.creator.age}</Text>
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

          {/* Filtro de distância */}
          <View style={styles.filterCategory}>
            <Text style={styles.filterCategoryTitle}>Distância máxima</Text>
            <View style={styles.distanceOptions}>
              {['1 km', '5 km', '10 km', '20 km', '50 km'].map(distance => (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceOption,
                    activeFilters.includes(`dist_${distance}`) && styles.distanceOptionActive
                  ]}
                  onPress={() => toggleFilter(`dist_${distance}`)}
                >
                  <Text style={[
                    styles.distanceOptionText,
                    activeFilters.includes(`dist_${distance}`) && styles.distanceOptionTextActive
                  ]}>
                    {distance}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro de data */}
          <View style={styles.filterCategory}>
            <Text style={styles.filterCategoryTitle}>Quando</Text>
            <View style={styles.dateOptions}>
              {[
                { id: 'today', label: 'Hoje' },
                { id: 'tomorrow', label: 'Amanhã' },
                { id: 'week', label: 'Esta semana' },
                { id: 'weekend', label: 'Fim de semana' },
                { id: 'any', label: 'Qualquer data' },
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dateOption,
                    activeFilters.includes(option.id) && styles.dateOptionActive
                  ]}
                  onPress={() => toggleFilter(option.id)}
                >
                  <Text style={[
                    styles.dateOptionText,
                    activeFilters.includes(option.id) && styles.dateOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
              Ver {MOCK_DATES.length} rolês
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Conectando...</Text>
=======
import { Colors } from '../src/theme/index';
import { styles } from './HomeScreen.styles';

export default function HomeScreen() {
  const { isAuthenticated, user, loading, logout, checkAuth } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Verifica autenticação ao entrar
  useEffect(() => {
    checkAuth();
  }, []);

  // Monitora se o usuário foi deslogado para redirecionar
  useEffect(() => {
    if (!loading && isAuthenticated === false) {
      router.replace('/');
    }
  }, [isAuthenticated, loading]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Tem certeza que deseja sair?");
      if (confirm) performLogout();
    } else {
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

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  if (loading || isLoggingOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Carregando...</Text>
>>>>>>> 2d054c06882229e3cacbad051fbdac8879615ace
      </View>
    );
  }

<<<<<<< HEAD
  if (!isAuthenticated) {
=======
  if (!user) {
>>>>>>> 2d054c06882229e3cacbad051fbdac8879615ace
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>psique</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
=======
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>psique</Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
>>>>>>> 2d054c06882229e3cacbad051fbdac8879615ace
          >
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
            <Ionicons name="filter" size={22} color={Colors.black} />
          </TouchableOpacity>
<<<<<<< HEAD
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
          Buscar rolês por interesse, local, vibe...
        </Text>
      </TouchableOpacity>

      {/* Filtros ativos */}
      {activeFilters.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
          contentContainerStyle={styles.activeFiltersContent}
        >
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={clearFilters}
          >
            <Ionicons name="close" size={14} color={Colors.gray} />
            <Text style={styles.clearAllText}>Limpar</Text>
          </TouchableOpacity>
          {activeFilters.slice(0, 5).map(filter => (
            <View key={filter} style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>{filter}</Text>
              <TouchableOpacity onPress={() => toggleFilter(filter)}>
                <Ionicons name="close" size={14} color={Colors.gray} />
              </TouchableOpacity>
            </View>
          ))}
          {activeFilters.length > 5 && (
            <View style={styles.moreFilters}>
              <Text style={styles.moreFiltersText}>+{activeFilters.length - 5}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Feed */}
      <ScrollView 
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
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
            onPress={() => router.push('/connections')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="heart" size={20} color={Colors.black} />
            </View>
            <Text style={styles.quickActionText}>Conexões</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/saved')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="bookmark" size={20} color={Colors.black} />
            </View>
            <Text style={styles.quickActionText}>Salvos</Text>
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View style={styles.datesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rolês próximos</Text>
            <Text style={styles.sectionSubtitle}>
              {MOCK_DATES.length} encontros disponíveis
            </Text>
          </View>

          <View style={styles.datesList}>
            {MOCK_DATES.map(date => (
              <View key={date.id} style={styles.dateItem}>
                {renderDateCard(date)}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footerSpacer} />
=======
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
              {/* CORREÇÃO AQUI: || '' */}
              <Text style={styles.infoValue}>{formatDate(user.created_at || '')}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Atualizada em</Text>
              {/* CORREÇÃO AQUI: || '' */}
              <Text style={styles.infoValue}>{formatDate(user.updated_at || '')}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Ativa</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Preferências */}
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
        
        <View style={styles.spacer} />
        
>>>>>>> 2d054c06882229e3cacbad051fbdac8879615ace
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/home')}
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
          onPress={() => router.push('/messages')}
        >
          <View style={styles.messageBadge}>
            <Text style={styles.messageBadgeText}>3</Text>
          </View>
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

      {renderFilterModal()}
    </SafeAreaView>
  );
<<<<<<< HEAD
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
    paddingBottom: 80,
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
  messageBadge: {
    position: 'absolute',
    top: -8,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  messageBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  navLabel: {
    fontSize: 11,
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  navLabelActive: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
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
});
=======
}
>>>>>>> 2d054c06882229e3cacbad051fbdac8879615ace
