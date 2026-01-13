import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../src/contexts/AuthContext';
import { apiService } from '../src/api/apiDates';
import { Colors, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CreateDateScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [type, setType] = useState('parque');
  const [tone, setTone] = useState('friendship');
  const [maxParticipants, setMaxParticipants] = useState('2');
  const [payment, setPayment] = useState<'host_pays' | 'each_pays' | 'both'>('both');

  const typeOptions = [
    { id: 'parque', label: 'Parque', emoji: '🌳' },
    { id: 'praia', label: 'Praia', emoji: '🏖️' },
    { id: 'bar', label: 'Bar', emoji: '🍻' },
    { id: 'restaurante', label: 'Restaurante', emoji: '🍴' },
    { id: 'cinema', label: 'Cinema', emoji: '🎬' },
    { id: 'show', label: 'Show', emoji: '🎵' },
    { id: 'cafe', label: 'Café', emoji: '☕' },
    { id: 'outro', label: 'Outro', emoji: '📍' },
  ];

  const toneOptions = [
    { id: 'friendship', label: 'Amizade', emoji: '👥' },
    { id: 'adventure', label: 'Aventura', emoji: '🧗' },
    { id: 'romantic', label: 'Romântico', emoji: '💝' },
    { id: 'networking', label: 'Networking', emoji: '💼' },
    { id: 'casual', label: 'Casual', emoji: '😌' },
  ];

  const paymentOptions = [
    { id: 'host_pays', label: 'Quem convida paga', emoji: '🎁' },
    { id: 'each_pays', label: 'Cada um paga o seu', emoji: '💸' },
    { id: 'both', label: 'Tanto faz', emoji: '🔄' },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const combineDateTime = () => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    return combined.toISOString();
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para criar um date');
      return;
    }

    if (!description.trim() || !location.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    const datetime = combineDateTime();
    const maxParticipantsNum = parseInt(maxParticipants) || 2;

    if (maxParticipantsNum < 2 || maxParticipantsNum > 50) {
      Alert.alert('Atenção', 'Número de participantes deve ser entre 2 e 50');
      return;
    }

    setLoading(true);
    try {
      const dateData = {
        creator_user_id: user.id,
        location,
        datetime,
        type,
        payment,
        max_participants: maxParticipantsNum,
        tone,
        description,
        premium: false,
        creator_is_premium: false
      };

      console.log('Enviando dados:', dateData);
      
      // "as any" corrige o erro de tipagem no TypeScript
      const response = await apiService.createDate(dateData as any);
      
      if (response.ok) {
        setShowSuccess(true);
        
        // Mostrar sucesso por 2 segundos e depois navegar
        setTimeout(() => {
          setShowSuccess(false);
          // router.dismissAll(); // Comentado para evitar erro se não houver pilha
          router.replace('/HomeScreen'); // Navega para a HomeScreen
        }, 2500);
      } else {
        throw new Error(response.error || 'Erro na criação');
      }
    } catch (error: any) {
      console.error('Erro ao criar date:', error);
      Alert.alert('Erro', error.message || 'Não foi possível criar o date');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setLocation('');
    setDate(new Date());
    setTime(new Date());
    setType('parque');
    setTone('friendship');
    setMaxParticipants('2');
    setPayment('both');
  };

  // Renderiza tela de sucesso
  const renderSuccessScreen = () => (
    <View style={styles.successContainer}>
      <View style={styles.successContent}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={120} color={Colors.green} />
        </View>
        
        <Text style={styles.successTitle}>🎉 date criado com sucesso!</Text>
        
        <Text style={styles.successMessage}>
          Seu date já está disponível para outras pessoas encontrarem. 
          Em breve você receberá notificações de interessados!
        </Text>

        <View style={styles.successTips}>
          <View style={styles.tipItem}>
            <Ionicons name="notifications" size={24} color={Colors.green} />
            <Text style={styles.tipText}>Fique de olho nas notificações</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="chatbubble" size={24} color={Colors.green} />
            <Text style={styles.tipText}>Responda os interessados no chat</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="people" size={24} color={Colors.green} />
            <Text style={styles.tipText}>Aproveite para conhecer pessoas novas</Text>
          </View>
        </View>

        <View style={styles.successButtons}>
          <TouchableOpacity 
            style={styles.backToHomeButton}
            onPress={() => {
              setShowSuccess(false);
              router.replace('/HomeScreen');
            }}
          >
            <Text style={styles.backToHomeButtonText}>Voltar para o início</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.createAnotherButton}
            onPress={() => {
              setShowSuccess(false);
              resetForm();
            }}
          >
            <Text style={styles.createAnotherButtonText}>Criar outro date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (showSuccess) {
    return renderSuccessScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Criar novo date</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Descrição */}
            <View style={styles.field}>
              <Text style={styles.label}>O que vamos fazer? *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Piquenique no parque, drinks no bar..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                placeholderTextColor={Colors.gray}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            {/* Localização */}
            <View style={styles.field}>
              <Text style={styles.label}>Onde? *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Parque Ibirapuera, próximo ao lago"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={Colors.gray}
              />
            </View>

            {/* Data e Hora */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Data</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={Colors.gray} />
                  <Text style={styles.dateButtonText}>
                    {date.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Hora</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color={Colors.gray} />
                  <Text style={styles.dateButtonText}>
                    {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            {/* Tipo */}
            <View style={styles.field}>
              <Text style={styles.label}>Tipo de date</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}
                contentContainerStyle={styles.optionsContainer}
              >
                {typeOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      type === option.id && styles.optionButtonActive
                    ]}
                    onPress={() => setType(option.id)}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionLabel,
                      type === option.id && styles.optionLabelActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Vibe/Tone */}
            <View style={styles.field}>
              <Text style={styles.label}>Vibe do date</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}
                contentContainerStyle={styles.optionsContainer}
              >
                {toneOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      tone === option.id && styles.optionButtonActive
                    ]}
                    onPress={() => setTone(option.id)}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionLabel,
                      tone === option.id && styles.optionLabelActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Participantes */}
            <View style={styles.field}>
              <Text style={styles.label}>Máximo de participantes</Text>
              <View style={styles.participantsContainer}>
                <TouchableOpacity 
                  style={styles.participantButton}
                  onPress={() => {
                    const current = parseInt(maxParticipants) || 2;
                    if (current > 2) setMaxParticipants((current - 1).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color={Colors.black} />
                </TouchableOpacity>
                
                <View style={styles.participantCount}>
                  <Text style={styles.participantCountText}>{maxParticipants}</Text>
                  <Text style={styles.participantLabel}>pessoas</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.participantButton}
                  onPress={() => {
                    const current = parseInt(maxParticipants) || 2;
                    if (current < 50) setMaxParticipants((current + 1).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color={Colors.black} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Pagamento */}
            <View style={styles.field}>
              <Text style={styles.label}>Como será o pagamento?</Text>
              <View style={styles.paymentOptions}>
                {paymentOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.paymentButton,
                      payment === option.id && styles.paymentButtonActive
                    ]}
                    onPress={() => setPayment(option.id as any)}
                  >
                    <Text style={styles.paymentEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.paymentLabel,
                      payment === option.id && styles.paymentLabelActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botão de criar */}
            <TouchableOpacity 
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="rocket" size={20} color={Colors.white} />
                  <Text style={styles.submitButtonText}>Lançar date</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
  },
  form: {
    padding: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 50, // Corrigido para input normal, multiline sobrescreve
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
    marginLeft: Spacing.sm,
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionsContainer: {
    paddingRight: Spacing.lg,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    minWidth: 80,
  },
  optionButtonActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  optionLabelActive: {
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  participantButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantCount: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  participantCountText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
  },
  participantLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: 4,
  },
  paymentButtonActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  paymentEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  paymentLabelActive: {
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl, // Requer Spacing.xxl no theme/index.ts
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.sm,
  },
  // Estilos para a tela de sucesso
  successContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  successTips: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.md,
    flex: 1,
  },
  successButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  backToHomeButton: {
    backgroundColor: Colors.black,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  backToHomeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  createAnotherButton: {
    backgroundColor: Colors.offWhite,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  createAnotherButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});