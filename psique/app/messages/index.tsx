import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user?.id) return;
    setLoading(true);
    const result = await chatApi.getConversations(user.id);
    if (result.success) {
      setChats(result.data);
    }
    setLoading(false);
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
          <Text style={styles.name}>{item.user_name}</Text>
          <Text style={styles.time}>{item.last_message_time}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.last_message || 'Toque para conversar'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.green} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray} />
              <Text style={styles.emptyText}>Nenhuma conversa</Text>
              <Text style={styles.emptySub}>Dê match ou entre em um rolê!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}