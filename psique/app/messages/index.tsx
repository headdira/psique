import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { chatApi, ChatPreview } from '../../src/api/apiChat';
import { styles } from './index.styles';
import { Colors } from '../../src/theme';

export default function MessagesListScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega as conversas
  const loadChats = useCallback(async () => {
    if (!user?.id) return;
    
    // Se não estiver dando refresh, mostra loading full screen
    if (!refreshing) setLoading(true);

    try {
      const result = await chatApi.getConversations(user.id);
      if (result.success && result.data) {
        setChats(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);

  useEffect(() => {
    loadChats();
  }, [user]); // Carrega ao montar e quando tiver user

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => router.push(`/messages/${item.id}?name=${item.user_name}`)}
    >
      <Image 
        source={{ uri: item.user_photo || 'https://via.placeholder.com/150' }} 
        style={styles.avatar} 
      />
      <View style={styles.chatInfo}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{item.user_name || 'Usuário'}</Text>
          <Text style={styles.time}>{item.last_message_time || ''}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.last_message || 'Toque para iniciar a conversa'}
        </Text>
      </View>
      
      {/* Badge de não lidas (Opcional) */}
      {item.unread_count && item.unread_count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.green} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.green]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray} />
              <Text style={styles.emptyText}>Nenhuma conversa</Text>
              <Text style={styles.emptySub}>Seus matches e rolês aceitos aparecerão aqui.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}