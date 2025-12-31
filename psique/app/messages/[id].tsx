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
  // Parâmetros da URL (ID da conversa/usuário e Nome)
  const { id, name } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Garante que o ID é string (Expo router pode retornar array)
  const chatId = Array.isArray(id) ? id[0] : id;

  // 1. Efeito para carregar mensagens e ativar Polling
  useEffect(() => {
    if (!user?.id || !chatId) return;

    const fetchMessages = async () => {
      try {
        const result = await chatApi.getMessages(chatId, user.id);
        if (result.success && result.data) {
          // Comparação simples para evitar re-render desnecessário se não mudou nada
          // (Num app real, usaríamos IDs, aqui atualizamos sempre para garantir)
          setMessages(result.data);
        }
      } catch (error: any) {
        console.log('Erro polling mensagens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages(); // Carga inicial imediata

    // Polling: Atualiza a cada 3 segundos
    const interval = setInterval(fetchMessages, 3000);

    // Limpa o intervalo ao sair da tela
    return () => clearInterval(interval);
  }, [chatId, user?.id]);

  // 2. Enviar Mensagem
  const handleSend = async () => {
    if (!inputText.trim() || !user?.id || !chatId) return;

    const contentToSend = inputText.trim();
    setInputText(''); // Limpa input imediatamente

    // Optimistic UI: Mostra a mensagem antes de confirmar com o servidor
    const tempMsg: Message = {
      id: Date.now().toString(), // ID temporário
      sender_id: user.id,
      content: contentToSend,
      created_at: new Date().toISOString(),
      is_mine: true
    };

    setMessages(prev => [...prev, tempMsg]);
    
    // Rola para o final
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Envia para API
      await chatApi.sendMessage(chatId, user.id, contentToSend);
      // O Polling vai trazer a mensagem real e substituir a temporária em breve
    } catch (error: any) {
      console.error('Erro ao enviar:', error);
      // Aqui você poderia mostrar um ícone de erro na mensagem
    }
  };

  // Renderiza cada balão
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.is_mine ? styles.myBubble : styles.otherBubble]}>
      <Text style={item.is_mine ? styles.textMine : styles.textOther}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name || 'Conversa'}
        </Text>
      </View>

      {/* Lista de Mensagens */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.green} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })} // Rola ao abrir
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
              <Text>Nenhuma mensagem ainda.</Text>
              <Text>Diga "Oi" para começar! 👋</Text>
            </View>
          }
        />
      )}

      {/* Input de Texto */}
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
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend} 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}