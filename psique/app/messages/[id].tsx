import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
<<<<<<< HEAD
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../src/theme';
import { chatApi, Message } from '../../src/api/chatApi';
import { useAuth } from '../../src/contexts/AuthContext';

// IMPORTANDO OS ESTILOS QUE SEPARAMOS
import { styles } from './chat.styles';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams(); 
  const { user } = useAuth(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) loadMessages();
  }, [id]);

  const loadMessages = async () => {
    const chatId = Array.isArray(id) ? id[0] : id; 
    if (!chatId) return;

    const result = await chatApi.getMessages(chatId);
    if (result.success && result.data) {
      const formatted = result.data.map(msg => ({
        ...msg,
        isMine: msg.senderId === user?.id
      }));
      setMessages(formatted);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const tempId = Date.now().toString();
    const tempMsg: Message = {
      id: tempId,
      senderId: user?.id || '',
      text: inputText,
      created_at: new Date().toISOString(),
      isMine: true
=======
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
>>>>>>> psique.dev
    };

    setMessages(prev => [...prev, tempMsg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

<<<<<<< HEAD
    const chatId = Array.isArray(id) ? id[0] : id;
    if (chatId) {
      await chatApi.sendMessage(chatId, tempMsg.text);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.msgBubble, 
      item.isMine ? styles.msgMine : styles.msgOther
    ]}>
      <Text style={styles.msgText}>{item.text}</Text>
=======
    // Envia para API
    await chatApi.sendMessage(chatId, user.id, tempMsg.content);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.is_mine ? styles.myBubble : styles.otherBubble]}>
      <Text style={item.is_mine ? styles.textMine : styles.textOther}>
        {item.content}
      </Text>
>>>>>>> psique.dev
    </View>
  );

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Conversa</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
=======
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
>>>>>>> psique.dev
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
<<<<<<< HEAD
            placeholder="Digite uma mensagem..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor={Colors.gray}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
=======
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
>>>>>>> psique.dev
  );
}