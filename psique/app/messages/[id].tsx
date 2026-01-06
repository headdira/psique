import { useEffect, useState, useRef } from 'react';
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
  const { id, name } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id;
  const chatName = Array.isArray(name) ? name[0] : name;
  
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    // Opcional: Adicionar um polling (setInterval) aqui para buscar mensagens novas a cada X segundos
  }, [chatId]);

  const loadMessages = async () => {
    if (!user?.id || !chatId) return;
    try {
      const result = await chatApi.getMessages(chatId, user.id);
      if (result.success && result.data) {
        // Inverte a ordem para o FlatList (mais recentes embaixo)
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
      // 1. Envia para API
      const result = await chatApi.sendMessage(chatId, user.id, newMessage);
      
      if (result.success) {
        setNewMessage('');
        // 2. Recarrega mensagens para garantir sincronia
        await loadMessages(); 
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setSending(false);
    }
  };

  // Função para formatar a hora da mensagem
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    // === LÓGICA DE ALINHAMENTO ===
    // Se is_mine for true, usa estilos da direita. Se false, da esquerda.
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={BrandColors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chatName || 'Chat'}</Text>
          <View style={{ width: 28 }} /> {/* Espaço para equilibrar o header */}
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
            inverted={true} // Mensagens novas aparecem embaixo
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
  
  // === ESTILOS DAS MENSAGENS ===
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    width: '100%',
  },
  // Alinha minhas mensagens à direita
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  // Alinha mensagens dos outros à esquerda
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  // Estilo do balão verde (meu)
  myMessageBubble: {
    backgroundColor: BrandColors.green,
    borderBottomRightRadius: 4, // Dá um efeito visual no canto
  },
  // Estilo do balão branco (outro)
  theirMessageBubble: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
    borderBottomLeftRadius: 4, // Dá um efeito visual no canto oposto
  },
  
  messageText: {
    fontSize: 16,
  },
  // Texto branco no balão verde
  myMessageText: {
    color: BrandColors.white,
  },
  // Texto preto no balão branco
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

  // === ESTILOS DO INPUT ===
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