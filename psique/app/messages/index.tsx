import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../src/theme';
import { chatApi, ChatPreview } from '../../src/api/chatApi';

// IMPORTANDO OS ESTILOS QUE SEPARAMOS
import { styles } from './index.styles';

export default function MessagesListScreen() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    const result = await chatApi.getConversations();
    if (result.success && result.data) {
      setChats(result.data);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => router.push(`/messages/${item.id}`)}
    >
      <Image 
        source={{ uri: item.user.foto || 'https://via.placeholder.com/150' }} 
        style={styles.avatar} 
      />
      <View style={styles.chatInfo}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.user.nome}</Text>
          <Text style={styles.time}>{item.lastMessageTime}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMessage || 'Toque para iniciar a conversa'}
        </Text>
      </View>
      {item.unreadCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
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
              <Text style={styles.emptyText}>Nenhuma conversa ainda.</Text>
              <Text style={styles.emptySubText}>Encontre alguém nos Matches para conversar!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}