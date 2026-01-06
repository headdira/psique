import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  StyleSheet
} from 'react-native';
import { router, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';

// === CAMINHOS CORRIGIDOS (Baseado no seu print) ===
import { useAuth } from '../../src/contexts/AuthContext'; 
import { chatApi, ChatPreview } from '../../src/api/apiChat';
import { Colors } from '../../src/theme'; 

export default function MessagesListScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função que busca as conversas na API
  const loadChats = async () => {
    if (!user?.id) return;
    
    try {
      const result = await chatApi.getConversations(user.id);
      
      if (result.success && result.data) {
        setChats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarrega a lista SEMPRE que você entra na tela (clica no ícone do chat)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadChats();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => {
        // Navega para a conversa individual, passando ID e Nome
        router.push({
          pathname: `/messages/${item.id}`,
          params: { name: item.user_name }
        });
      }}
    >
      {/* Foto do usuário ou Ícone Padrão */}
      {item.user_photo ? (
        <Image source={{ uri: item.user_photo }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderCenter]}>
          <Ionicons name="person" size={24} color="#888" />
        </View>
      )}

      <View style={styles.chatInfo}>
        <View style={styles.topRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user_name || 'Usuário Desconhecido'}
          </Text>
          <Text style={styles.time}>
            {item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </Text>
        </View>
        
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.last_message || 'Toque para iniciar a conversa'}
        </Text>
      </View>
      
      {/* Bolinha de não lidas (se tiver) */}
      {item.unread_count && item.unread_count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0E0E0E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversas</Text>
      </View>

      {/* Lista */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#5FF0A9" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5FF0A9" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
              <Text style={styles.emptySubText}>
                As conversas aparecerão aqui quando você der match em um rolê.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E0E0E',
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  placeholderCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E0E0E',
    maxWidth: '70%',
  },
  time: {
    fontSize: 12,
    color: '#888888',
  },
  lastMsg: {
    fontSize: 14,
    color: '#666666',
  },
  badge: {
    backgroundColor: '#5FF0A9',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#0E0E0E',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  }
});