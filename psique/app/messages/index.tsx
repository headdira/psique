import { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { router, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext'; 
import { chatApi } from '../../src/api/apiChat';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar estilos separados
import { styles, BrandColors } from './index.styles';

interface ChatItemType {
  id: string;
  user_name: string;
  user_photo?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  other_user_id: string;
  chat_data?: any;
}

// Interface para usuário da API
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

export default function MessagesListScreen() {
  const { user, fetchUserInfo } = useAuth();
  const [chats, setChats] = useState<ChatItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingNames, setUpdatingNames] = useState(false);

  // Função para buscar nomes dos usuários da API
  const fetchUserNames = async (chatItems: ChatItemType[]) => {
    if (!chatItems.length) return chatItems;
    
    setUpdatingNames(true);
    
    const updatedChats = [...chatItems];
    const userIds = chatItems.map(chat => chat.other_user_id).filter(id => id);
    
    console.log(`🔄 Buscando nomes para ${userIds.length} usuários...`);
    
    for (let i = 0; i < updatedChats.length; i++) {
      const chat = updatedChats[i];
      const otherUserId = chat.other_user_id;
      
      if (!otherUserId) continue;
      
      // Verifica se o nome atual é genérico
      const currentName = chat.user_name;
      const isGenericName = !currentName || 
        currentName.includes('User') || 
        currentName.includes('Usuário') ||
        currentName === 'Host' ||
        currentName.match(/^Usuário \d+$/);
      
      if (isGenericName) {
        try {
          // Tenta buscar do AsyncStorage primeiro
          const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
          if (savedProfiles) {
            const profiles = JSON.parse(savedProfiles);
            if (profiles[otherUserId]?.nome && !profiles[otherUserId].nome.includes('User')) {
              console.log(`✅ Nome encontrado no storage: ${profiles[otherUserId].nome}`);
              updatedChats[i] = {
                ...chat,
                user_name: profiles[otherUserId].nome,
                user_photo: profiles[otherUserId].foto || chat.user_photo
              };
              continue;
            }
          }
          
          // Se não encontrou, usa a função do AuthContext para buscar
          if (fetchUserInfo) {
            const realName = await fetchUserInfo(otherUserId);
            if (realName) {
              console.log(`✅ Nome encontrado via API: ${realName}`);
              updatedChats[i] = {
                ...chat,
                user_name: realName
              };
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar nome para ${otherUserId}:`, error);
        }
      }
    }
    
    setUpdatingNames(false);
    return updatedChats;
  };

  // Função para buscar TODOS os perfis da API (backup)
  const fetchAllUserProfiles = async () => {
    try {
      console.log('🔍 Buscando todos os perfis da API...');
      
      // Tenta buscar da sua API de clientes
      const response = await fetch('https://borababy.netlify.app/api/clientes');
      if (response.ok) {
        const allUsers = await response.json();
        
        if (Array.isArray(allUsers)) {
          const profiles: Record<string, any> = {};
          
          (allUsers as ApiUser[]).forEach((userItem: ApiUser) => {
            const userId = userItem.id || userItem.user_id || userItem._id;
            const userName = userItem.nome || userItem.name || userItem.user_name;
            
            if (userId && userName && userName !== 'Usuário') {
              profiles[userId] = {
                nome: userName,
                foto: userItem.foto || userItem.photo || userItem.user_photo || userItem.picture || '',
                email: userItem.email || '',
                updated_at: new Date().toISOString()
              };
            }
          });
          
          await AsyncStorage.setItem('@saved_user_profiles', JSON.stringify(profiles));
          console.log(`✅ ${Object.keys(profiles).length} perfis salvos localmente`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar todos os perfis:', error);
    }
  };

  const loadChats = async () => {
    if (!user?.id) {
      console.log('Usuário não autenticado');
      setLoading(false);
      return;
    }
    
    console.log('Carregando chats para usuário:', user.id);
    
    try {
      const result = await chatApi.getConversations(user.id);
      console.log('Resultado da API de conversas:', result);
      
      if (result.success && result.data) {
        // Primeiro, tenta buscar todos os perfis (só na primeira vez ou quando não tem muitos)
        const savedProfiles = await AsyncStorage.getItem('@saved_user_profiles');
        if (!savedProfiles || Object.keys(JSON.parse(savedProfiles || '{}')).length < 10) {
          await fetchAllUserProfiles();
        }
        
        // Converte objeto para array usando a função de formatação ASSÍNCRONA
        const chatsPromises = Object.values(result.data).map(async (chatData: any) => {
          return await chatApi.formatChatForPreview(chatData, user.id!);
        });
        
        let chatsArray = await Promise.all(chatsPromises);
        
        // Agora busca nomes reais para os chats
        chatsArray = await fetchUserNames(chatsArray);
        
        // Ordena por data
        chatsArray.sort((a, b) => {
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          return timeB - timeA;
        });
        
        console.log('Chats formatados com nomes reais:', chatsArray);
        setChats(chatsArray);
      } else {
        console.log('Nenhum chat encontrado ou erro na API');
        setChats([]);
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Tela de conversas focada');
      setLoading(true);
      loadChats();
      
      // Recarrega a cada 30 segundos quando a tela está em foco
      const interval = setInterval(() => {
        loadChats();
      }, 30000);
      
      return () => clearInterval(interval);
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Força buscar todos os perfis novamente
    await fetchAllUserProfiles();
    await loadChats();
  };

  const formatMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins < 1 ? 'Agora' : `${diffMins}min`;
      } else if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffHours < 48) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
      }
    } catch (error) {
      return '';
    }
  };

  // Função para navegar de volta para Home
  const goBackToHome = () => {
    router.replace('/HomeScreen');
  };

  // Função para forçar atualização de nomes
  const forceUpdateNames = async () => {
    setUpdatingNames(true);
    const updatedChats = await fetchUserNames(chats);
    setChats(updatedChats);
    setUpdatingNames(false);
  };

  const renderItem = ({ item }: { item: ChatItemType }) => {
    // Verifica se o nome ainda é genérico
    const isGenericName = item.user_name && (
      item.user_name.includes('User') || 
      item.user_name.includes('Usuário') ||
      item.user_name === 'Host' ||
      item.user_name.match(/^Usuário \d+$/)
    );
    
    const displayName = isGenericName && item.other_user_id 
      ? `Usuário ${item.other_user_id.slice(-4)}`
      : item.user_name;

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => {
          router.push({
            pathname: `/messages/${item.id}`,
            params: { 
              name: displayName,
              other_user_id: item.other_user_id,
              chat_data: JSON.stringify(item.chat_data || {})
            }
          });
        }}
        onLongPress={forceUpdateNames}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.user_photo ? (
            <Image source={{ uri: item.user_photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Indicador de nome genérico */}
          {isGenericName && (
            <View style={styles.genericIndicator}>
              <Ionicons name="refresh" size={10} color={BrandColors.white} />
            </View>
          )}
        </View>

        {/* Informações do chat */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              {isGenericName && (
                <TouchableOpacity 
                  onPress={() => fetchUserInfo && fetchUserInfo(item.other_user_id).then(loadChats)}
                  style={styles.refreshNameButton}
                >
                  <Ionicons name="refresh" size={14} color={BrandColors.green} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.time}>
              {formatMessageTime(item.last_message_time)}
            </Text>
          </View>
          
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message || 'Nova conversa'}
          </Text>
        </View>

        {/* Badge de mensagens não lidas */}
        {item.unread_count && item.unread_count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#5FF0A9" />
        <Text style={styles.loadingText}>Carregando conversas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header personalizado com botão de voltar igual ao Profile */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={goBackToHome} 
          style={styles.backButtonContainer}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonContent}>
            <Ionicons name="chevron-back" size={28} color="#0E0E0E" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Conversas</Text>
          {updatingNames && (
            <ActivityIndicator size="small" color={BrandColors.green} style={styles.updatingIndicator} />
          )}
        </View>
        
        <View style={styles.headerRightButtons}>
          <TouchableOpacity 
            onPress={forceUpdateNames} 
            style={styles.updateButtonContainer}
            activeOpacity={0.7}
          >
            <View style={styles.updateButtonContent}>
              <Ionicons name="sync" size={20} color={BrandColors.green} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onRefresh} 
            style={styles.refreshButtonContainer}
            activeOpacity={0.7}
          >
            <View style={styles.refreshButtonContent}>
              <Ionicons name="refresh" size={24} color={BrandColors.green} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de chats */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[BrandColors.green]}
            tintColor={BrandColors.green}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#DDD" />
            <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
            <Text style={styles.emptyText}>
              Quando você der match com alguém, as conversas aparecerão aqui
            </Text>
          </View>
        }
        ListHeaderComponent={
          updatingNames ? (
            <View style={styles.updatingNamesHeader}>
              <ActivityIndicator size="small" color={BrandColors.green} />
              <Text style={styles.updatingNamesText}>Atualizando nomes...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}