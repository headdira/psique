import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { chatApi, Message } from '../../src/api/apiChat';
import { useUserName } from '../../src/hooks/useUserName';

// Cores do projeto
const BrandColors = {
  green: '#5FF0A9',
  offWhite: '#F5F4F2',
  white: '#FFFFFF',
  black: '#0E0E0E',
  gray: '#888888',
  lightGray: '#E5E5E5',
};

export default function ChatScreen() {
  const { id, name, other_user_id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id;
  const initialName = Array.isArray(name) ? name[0] : name;
  const otherUserId = Array.isArray(other_user_id) ? other_user_id[0] : other_user_id;
  
  const { user } = useAuth();
  const { userName: otherUserName, userPhoto: otherUserPhoto } = useUserName(otherUserId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Use o nome real do hook ou o inicial
  const displayName = otherUserName !== 'Usuário' ? otherUserName : initialName;

  useEffect(() => {
    loadMessages();
    
    // Atualiza o título da conversa
    if (user?.id && otherUserId) {
      // Cache do nome atual do usuário
      if (user.nome && user.nome !== 'Usuário') {
        chatApi.cacheUserInfo(user.id, user.nome, user.foto);
      }
    }
  }, [chatId, otherUserId]);

  const loadMessages = async () => {
    if (!user?.id || !chatId) return;
    try {
      const result = await chatApi.getMessages(chatId, user.id);
      if (result.success && result.data) {
        setMessages([...result.data].reverse());
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() === '' || !user?.id || !chatId || sending) return;

    setSending(true);
    try {
      const result = await chatApi.sendMessage(chatId, user.id, newMessage);
      
      if (result.success) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const containerStyle = item.is_mine ? styles.myMessageContainer : styles.theirMessageContainer;
    const bubbleStyle = item.is_mine ? styles.myMessageBubble : styles.theirMessageBubble;
    const textStyle = item.is_mine ? styles.myMessageText : styles.theirMessageText;
    const timeStyle = item.is_mine ? styles.myMessageTime : styles.theirMessageTime;

    return (
      <View style={[styles.messageRow, containerStyle]}>
        <View style={[styles.messageBubble, bubbleStyle]}>
          <Text style={[styles.messageText, textStyle]}>{item.content}</Text>
          <Text style={[styles.timeText, timeStyle]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header com nome real */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={BrandColors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayName || 'Chat'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Lista de Mensagens */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.green} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            inverted={true}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input de Envio */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={BrandColors.gray}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: !newMessage.trim() ? 0.5 : 1 }]} 
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={BrandColors.white} />
            ) : (
              <Ionicons name="send" size={20} color={BrandColors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  container: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightGray,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    width: '100%',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: BrandColors.green,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: BrandColors.white,
  },
  theirMessageText: {
    color: BrandColors.black,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: BrandColors.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.lightGray,
  },
  input: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: BrandColors.black,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
});