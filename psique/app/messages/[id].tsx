import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
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
    };

    setMessages(prev => [...prev, tempMsg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

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
    </View>
  );

  return (
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
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
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
  );
}