import { useEffect, useState } from 'react';
<<<<<<< HEAD
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
=======
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { chatApi, ChatPreview } from '../../src/api/apiChat';
import { styles } from './index.styles';
import { Colors } from '../../src/theme';

export default function MessagesListScreen() {
  const { user } = useAuth();
>>>>>>> psique.dev
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    const result = await chatApi.getConversations();
    if (result.success && result.data) {
=======
    if (user?.id) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user?.id) return;
    setLoading(true);
    const result = await chatApi.getConversations(user.id);
    if (result.success) {
>>>>>>> psique.dev
      setChats(result.data);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
<<<<<<< HEAD
      onPress={() => router.push(`/messages/${item.id}`)}
    >
      <Image 
        source={{ uri: item.user.foto || 'https://via.placeholder.com/150' }} 
=======
      onPress={() => router.push(`/messages/${item.id}?name=${item.user_name}`)}
    >
      <Image 
        source={{ uri: item.user_photo || 'https://via.placeholder.com/150' }} 
>>>>>>> psique.dev
        style={styles.avatar} 
      />
      <View style={styles.chatInfo}>
        <View style={styles.row}>
<<<<<<< HEAD
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
=======
          <Text style={styles.name}>{item.user_name}</Text>
          <Text style={styles.time}>{item.last_message_time}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.last_message || 'Toque para conversar'}
        </Text>
      </View>
>>>>>>> psique.dev
    </TouchableOpacity>
  );

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
=======
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
>>>>>>> psique.dev
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
<<<<<<< HEAD
              <Text style={styles.emptyText}>Nenhuma conversa ainda.</Text>
              <Text style={styles.emptySubText}>Encontre alguém nos Matches para conversar!</Text>
=======
              <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray} />
              <Text style={styles.emptyText}>Nenhuma conversa</Text>
              <Text style={styles.emptySub}>Dê match ou entre em um rolê!</Text>
>>>>>>> psique.dev
            </View>
          }
        />
      )}
<<<<<<< HEAD
    </SafeAreaView>
=======
    </View>
>>>>>>> psique.dev
  );
}