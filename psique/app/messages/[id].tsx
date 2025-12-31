import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { chatApi, Message } from '../../src/api/apiChat';
import { styles } from './chat.styles';
import { Colors } from '../../src/theme';

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const chatId = Array.isArray(id) ? id[0] : id;

  // Carrega mensagens e configura atualização automática (Polling)
  useEffect(() => {
    if (!user?.id || !chatId) return;

    const fetchMessages = async () => {
      const result = await chatApi.getMessages(chatId, user.id);
      if (result.success) {
        setMessages(result.data);
      }
      setLoading(false);
    };

    fetchMessages(); // Primeira carga

    // Atualiza a cada 5 segundos
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId, user?.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id || !chatId) return;

    // Adiciona visualmente antes de enviar (Optimistic UI)
    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      content: inputText,
      created_at: new Date().toISOString(),
      is_mine: true
    };

    setMessages(prev => [...prev, tempMsg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    // Envia para API
    await chatApi.sendMessage(chatId, user.id, tempMsg.content);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.is_mine ? styles.myBubble : styles.otherBubble]}>
      <Text style={item.is_mine ? styles.textMine : styles.textOther}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Conversa'}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.green} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={Colors.gray}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}