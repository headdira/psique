// MessagesListScreen.js - Versão simplificada
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

import { useAuth } from '../../src/contexts/AuthContext'; 
import { chatApi } from '../../src/api/apiChat';

export default function MessagesListScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = async () => {
    if (!user?.id) {
      console.log('Usuário não autenticado');
      setLoading(false);
      return;
    }
    
    console.log('Carregando chats para usuário:', user.id);
    
    try {
      const result = await chatApi.getConversations(user.id);
      console.log('Resultado da API:', result);
      
      if (result.success && result.data) {
        // Converte objeto para array usando a função de formatação
        const chatsArray = Object.values(result.data)
          .map(chatData => chatApi.formatChatForPreview(chatData, user.id))
          .sort((a, b) => {
            const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
            const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
            return timeB - timeA;
          });
        
        console.log('Chats formatados:', chatsArray);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => {
        router.push({
          pathname: `/messages/${item.id}`,
          params: { 
            name: item.user_name,
            other_user_id: item.other_user_id,
            chat_data: JSON.stringify(item.chat_data || {})
          }
        });
      }}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.user_photo ? (
          <Image source={{ uri: item.user_photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Informações do chat */}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user_name}
          </Text>
          <Text style={styles.time}>
            {formatMessageTime(item.last_message_time)}
          </Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Nova conversa'}
        </Text>
      </View>

      {/* Badge de mensagens não lidas */}
      {item.unread_count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.unread_count > 99 ? '99+' : item.unread_count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5FF0A9" />
        <Text style={styles.loadingText}>Carregando conversas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        <TouchableOpacity onPress={loadChats} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#5FF0A9" />
        </TouchableOpacity>
      </View>

      {/* Lista de chats */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5FF0A9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6C757D',
  },
  badge: {
    backgroundColor: '#5FF0A9',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
});