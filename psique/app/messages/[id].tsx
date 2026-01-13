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
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { chatApi, Message } from '../../src/api/apiChat';
import { useUserName } from '../../src/hooks/useUserName';

// Importar estilos separados
import { styles, BrandColors } from './chat.styles';

export default function ChatScreen() {
  const { id, name, other_user_id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id;
  const initialName = Array.isArray(name) ? name[0] : name;
  const otherUserId = Array.isArray(other_user_id) ? other_user_id[0] : other_user_id;
  
  const { user } = useAuth();
  const { userName: otherUserName, userPhoto: otherUserPhoto, loading: loadingName } = useUserName(otherUserId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Função para obter o nome correto
  const getDisplayName = () => {
    // Se o hook retornou um nome real (não genérico)
    if (otherUserName && otherUserName !== 'Usuário' && !otherUserName.includes('User')) {
      return otherUserName;
    }
    
    // Se veio um nome inicial (provavelmente do chat preview)
    if (initialName && initialName !== 'Usuário' && !initialName.includes('User')) {
      return initialName;
    }
    
    // Último recurso: mostrar ID formatado
    return otherUserId ? `Usuário ${otherUserId.slice(-4)}` : 'Usuário';
  };

  const displayName = getDisplayName();

  // Função para cachear as informações do usuário logado
  const cacheCurrentUserInfo = useCallback(async () => {
    if (user?.id && user.nome) {
      try {
        await chatApi.cacheUserInfo(user.id, user.nome, user.foto);
        console.log(`✅ Cache do usuário logado: ${user.nome} (ID: ${user.id})`);
      } catch (error) {
        console.error('❌ Erro ao cachear usuário logado:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
    cacheCurrentUserInfo();
  }, [chatId, otherUserId]);

  const loadMessages = async () => {
    if (!user?.id || !chatId) return;
    try {
      setLoading(true);
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
          
          {loadingName ? (
            <ActivityIndicator size="small" color={BrandColors.green} />
          ) : (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {displayName}
            </Text>
          )}
          
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