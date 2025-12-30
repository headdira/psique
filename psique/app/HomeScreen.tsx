import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiService } from '../src/api/apiDates';

// Componente de Date Card atualizado
const DateCard = ({ date, onPress }: any) => {
  const statusColors: any = {
    accepted: Colors.green,
    pending: Colors.blue,
    rejected: Colors.red,
    not_submitted: Colors.gray
  };

  const statusIcons: any = {
    accepted: 'checkmark-circle',
    pending: 'time',
    rejected: 'close-circle',
    not_submitted: 'add-circle'
  };

  return (
    <TouchableOpacity style={tw.dateCard} onPress={onPress} activeOpacity={0.9}>
      <View style={tw.cardHeader}>
        <View style={tw.dateBadge}>
          <Text style={tw.dateDay}>{date.date}</Text>
          <Text style={tw.dateTime}>{date.time}</Text>
        </View>
        {date.userStatus !== 'not_submitted' && (
          <View style={[tw.userStatusBadge, { backgroundColor: `${statusColors[date.userStatus]}20` }]}>
            <Ionicons 
              name={statusIcons[date.userStatus]} 
              size={12} 
              color={statusColors[date.userStatus]} 
            />
            <Text style={[tw.userStatusText, { color: statusColors[date.userStatus] }]}>
              {date.userStatus === 'accepted' ? 'Aceito' :
               date.userStatus === 'pending' ? 'Pendente' :
               date.userStatus === 'rejected' ? 'Recusado' : ''}
            </Text>
          </View>
        )}
      </View>
      
      <View style={tw.imageContainer}>
        <Image source={{ uri: date.image }} style={tw.cardImage} />
        <View style={tw.typeBadge}>
          <Ionicons 
            name={getIconForType(date.type)} 
            size={12} 
            color={Colors.white} 
          />
          <Text style={tw.typeText}>
            {date.type === 'praia' ? 'Praia' :
             date.type === 'bar' ? 'Bar' :
             date.type === 'parque' ? 'Parque' :
             date.type === 'cafe' ? 'Café' :
             date.type === 'show' ? 'Show' :
             date.type === 'cinema' ? 'Cinema' :
             date.type === 'restaurante' ? 'Restaurante' : 'Outro'}
          </Text>
        </View>
      </View>
      
      <View style={tw.cardContent}>
        <View style={tw.locationRow}>
          <Ionicons name="location" size={14} color={Colors.gray} />
          <Text style={tw.locationText}>{date.city}</Text>
        </View>
        
        <Text style={tw.cardTitle}>{date.title}</Text>
        <Text style={tw.cardDescription} numberOfLines={2}>
          {date.description}
        </Text>
        
        <View style={tw.cardFooter}>
          <View style={tw.vibeBadge}>
            <Ionicons name="flash" size={12} color={Colors.gray} />
            <Text style={tw.vibeText}>
              {date.apiData?.tone === 'friendship' ? 'Amizade' :
               date.apiData?.tone === 'adventure' ? 'Aventura' :
               date.apiData?.tone === 'romantic' ? 'Romântico' : 'Casual'}
            </Text>
          </View>
          
          <View style={tw.participantInfo}>
            <Ionicons name="people" size={14} color={Colors.gray} />
            <Text style={tw.participantCount}>
              {date.attendees}/{date.maxAttendees}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Modal de Detalhes com todas as funcionalidades
const DateDetailsModal = ({ 
  visible, 
  date, 
  userStatus,
  onClose,
  loadDates
}: any) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    description: '',
    location: '',
    datetime: '',
    max_participants: 1,
    type: 'outro',
    payment: 'both',
    tone: 'friendship'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedUser, setAcceptedUser] = useState<any>(null);
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  
  useEffect(() => {
    if (visible && date && userStatus?.user_status === 'creator') {
      loadSubmissions();
    }
  }, [visible, date, userStatus]);
  
  useEffect(() => {
    if (date) {
      setEditData({
        description: date.description || '',
        location: date.location || '',
        datetime: date.apiData?.datetime || '',
        max_participants: date.maxAttendees || 1,
        type: date.apiData?.type || 'outro',
        payment: date.apiData?.payment || 'both',
        tone: date.apiData?.tone || 'friendship'
      });
      setMessage('');
      setAcceptedUser(null);
      setShowChatPrompt(false);
    }
  }, [date]);
  
  const loadSubmissions = async () => {
    if (!date?.id || !user?.id) return;
    
    setLoadingSubmissions(true);
    try {
      const response = await apiService.getDateSubmissions(date.id, user.id);
      if (response.ok) {
        setSubmissions(response.submissions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };
  
  // NOVA FUNÇÃO SIMPLES DE ACEITAR (baseada no botão de teste)
  const handleAcceptSubmission = async (submission: any) => {
    if (!user?.id || !date?.id) {
      Alert.alert('Erro', 'Usuário ou date não encontrado');
      return;
    }

    setIsResponding(true);
    
    try {
      const response = await apiService.respondToSubmission(
        date.id,
        {
          creator_user_id: user.id,
          requester_user_id: submission.user_id,
          accept: true,
          reason: 'Bem-vindo ao date!'
        }
      );
      
      if (response.ok) {
        Alert.alert(
          '✅ Sucesso!', 
          `${submission.user_name} foi aceito no date!`,
          [{ 
            text: 'OK', 
            onPress: () => {
              // Atualizar os dados
              loadSubmissions();
              loadDates();
              setAcceptedUser(submission);
              setShowChatPrompt(true);
            }
          }]
        );
      } else {
        Alert.alert('❌ Erro', response.error || 'Não foi possível aceitar o usuário');
      }
    } catch (error: any) {
      Alert.alert('❌ Erro de Conexão', error.message || 'Não foi possível conectar ao servidor');
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleStartChat = (submission: any) => {
    router.push({
      pathname: '/chat',
      params: {
        userId: submission.user_id,
        userName: submission.user_name,
        dateId: date.id,
        dateTitle: date.title
      }
    });
    onClose();
  };
  
  const handleSaveEdit = async () => {
    if (!user?.id || !date?.id) return;
    
    setSaving(true);
    try {
      const response = await apiService.updateDate({
        creator_user_id: user.id,
        date_id: date.id,
        updates: editData,
        creator_is_premium: false
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Date atualizado com sucesso!');
        setIsEditing(false);
        loadDates();
      } else {
        Alert.alert('Erro', response.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmitToDate = async () => {
    if (!user?.id || !date?.id || !message.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await apiService.submitToDate(
        date.id,
        user.id,
        message,
        user.nome,
        user.foto_perfil
      );
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Submissão enviada com sucesso!');
        setMessage('');
        loadDates();
        onClose();
      } else {
        Alert.alert('Erro', response.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancelSubmission = async () => {
    if (!user?.id || !date?.id) return;
    
    Alert.alert(
      'Cancelar submissão',
      'Tem certeza que deseja cancelar sua submissão?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.cancelSubmission(date.id, user.id);
              if (response.ok) {
                Alert.alert('Sucesso', response.message);
                loadDates();
                onClose();
              } else {
                Alert.alert('Erro', response.error);
              }
            } catch (error) {
              Alert.alert('Erro', 'Falha na conexão');
            }
          }
        }
      ]
    );
  };
  
  const renderSubmissionItem = (submission: any) => (
    <View key={submission.user_id} style={tw.submissionItem}>
      <View style={tw.submissionHeader}>
        <View style={tw.submissionUser}>
          {submission.user_photo ? (
            <Image source={{ uri: submission.user_photo }} style={tw.userAvatar} />
          ) : (
            <View style={tw.userAvatar}>
              <Text style={tw.userAvatarText}>
                {submission.user_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View>
            <Text style={tw.userName}>{submission.user_name}</Text>
            <Text style={tw.submissionDate}>
              {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <View style={[
          tw.statusBadge,
          submission.status === 'accepted' && tw.statusAccepted,
          submission.status === 'rejected' && tw.statusRejected,
          submission.status === 'pending' && tw.statusPending
        ]}>
          <Text style={tw.statusText}>
            {submission.status === 'accepted' ? 'Aceito' :
             submission.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
          </Text>
        </View>
      </View>
      
      {submission.message && (
        <Text style={tw.submissionMessage}>"{submission.message}"</Text>
      )}
      
      {submission.status === 'pending' && userStatus?.user_status === 'creator' && (
        <View style={tw.submissionActions}>
          <TouchableOpacity 
            style={[tw.actionButton, tw.acceptButton]}
            onPress={() => handleAcceptSubmission(submission)}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={Colors.white} />
                <Text style={tw.actionButtonText}>Aceitar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {submission.status === 'accepted' && userStatus?.user_status === 'creator' && (
        <TouchableOpacity 
          style={tw.chatButton}
          onPress={() => handleStartChat(submission)}
        >
          <Ionicons name="chatbubble" size={16} color={Colors.white} />
          <Text style={tw.chatButtonText}>Iniciar conversa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderEditForm = () => (
    <ScrollView style={tw.editForm} showsVerticalScrollIndicator={false}>
      <Text style={tw.sectionTitle}>Editar date</Text>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Descrição *</Text>
        <TextInput
          style={tw.input}
          value={editData.description}
          onChangeText={(text) => setEditData({...editData, description: text})}
          placeholder="Descreva seu date..."
          multiline
          numberOfLines={3}
          placeholderTextColor={Colors.gray}
        />
      </View>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Local *</Text>
        <TextInput
          style={tw.input}
          value={editData.location}
          onChangeText={(text) => setEditData({...editData, location: text})}
          placeholder="Onde vai ser?"
          placeholderTextColor={Colors.gray}
        />
      </View>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Data e hora *</Text>
        <TextInput
          style={tw.input}
          value={editData.datetime}
          onChangeText={(text) => setEditData({...editData, datetime: text})}
          placeholder="YYYY-MM-DDTHH:mm:ss"
          placeholderTextColor={Colors.gray}
        />
        <Text style={tw.hint}>Formato: 2024-12-31T20:00:00</Text>
      </View>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Número máximo de participantes</Text>
        <TextInput
          style={tw.input}
          value={editData.max_participants.toString()}
          onChangeText={(text) => setEditData({...editData, max_participants: parseInt(text) || 1})}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor={Colors.gray}
        />
      </View>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Tipo de date</Text>
        <View style={tw.optionsRow}>
          {['praia', 'bar', 'parque', 'cafe', 'show', 'cinema', 'restaurante', 'outro'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                tw.optionButton,
                editData.type === type && tw.optionButtonActive
              ]}
              onPress={() => setEditData({...editData, type})}
            >
              <Text style={[
                tw.optionText,
                editData.type === type && tw.optionTextActive
              ]}>
                {type === 'praia' ? 'Praia' :
                 type === 'bar' ? 'Bar' :
                 type === 'parque' ? 'Parque' :
                 type === 'cafe' ? 'Café' :
                 type === 'show' ? 'Show' :
                 type === 'cinema' ? 'Cinema' :
                 type === 'restaurante' ? 'Restaurante' : 'Outro'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Quem paga?</Text>
        <View style={tw.optionsRow}>
          {['both', 'creator', 'invitee'].map((payment) => (
            <TouchableOpacity
              key={payment}
              style={[
                tw.optionButton,
                editData.payment === payment && tw.optionButtonActive
              ]}
              onPress={() => setEditData({...editData, payment})}
            >
              <Text style={[
                tw.optionText,
                editData.payment === payment && tw.optionTextActive
              ]}>
                {payment === 'both' ? 'Cada um paga' :
                 payment === 'creator' ? 'Eu pago' : 'Convidado paga'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={tw.formGroup}>
        <Text style={tw.label}>Vibe do date</Text>
        <View style={tw.optionsRow}>
          {['friendship', 'adventure', 'romantic', 'casual'].map((tone) => (
            <TouchableOpacity
              key={tone}
              style={[
                tw.optionButton,
                editData.tone === tone && tw.optionButtonActive
              ]}
              onPress={() => setEditData({...editData, tone})}
            >
              <Text style={[
                tw.optionText,
                editData.tone === tone && tw.optionTextActive
              ]}>
                {tone === 'friendship' ? 'Amizade' :
                 tone === 'adventure' ? 'Aventura' :
                 tone === 'romantic' ? 'Romântico' : 'Casual'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={tw.editActions}>
        <TouchableOpacity 
          style={[tw.editButton, tw.cancelEditButton]}
          onPress={() => setIsEditing(false)}
        >
          <Text style={tw.cancelEditText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[tw.editButton, tw.saveButton]}
          onPress={handleSaveEdit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="save" size={18} color={Colors.white} />
              <Text style={tw.saveText}>Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  const renderDateInfo = () => (
    <ScrollView style={tw.dateInfo} showsVerticalScrollIndicator={false}>
      <View style={tw.dateHeader}>
        <View style={tw.dateTimeBadge}>
          <Text style={tw.dateText}>{date?.date}</Text>
          <Text style={tw.timeText}>{date?.time}</Text>
        </View>
        <View style={tw.locationInfo}>
          <Ionicons name="location" size={14} color={Colors.gray} />
          <Text style={tw.locationDetail}>{date?.location}</Text>
        </View>
      </View>
      
      <Text style={tw.detailTitle}>{date?.title}</Text>
      <Text style={tw.detailDescription}>{date?.description}</Text>
      
      <View style={tw.infoSection}>
        <Text style={tw.sectionTitle}>📋 Informações</Text>
        <View style={tw.infoGrid}>
          <View style={tw.infoItem}>
            <Ionicons name="people" size={18} color={Colors.gray} />
            <Text style={tw.infoLabel}>Participantes:</Text>
            <Text style={tw.infoValue}>
              {date?.attendees + 1}/{date?.maxAttendees}
            </Text>
          </View>
          <View style={tw.infoItem}>
            <Ionicons name="cash" size={18} color={Colors.gray} />
            <Text style={tw.infoLabel}>Pagamento:</Text>
            <Text style={tw.infoValue}>
              {date?.apiData?.payment === 'both' ? 'Cada um paga' :
               date?.apiData?.payment === 'creator' ? 'Anfitrião paga' : 'Convidado paga'}
            </Text>
          </View>
          <View style={tw.infoItem}>
            <Ionicons name="calendar" size={18} color={Colors.gray} />
            <Text style={tw.infoLabel}>Data completa:</Text>
            <Text style={tw.infoValue}>
              {new Date(date?.apiData?.datetime).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={tw.infoItem}>
            <Ionicons name="flash" size={18} color={Colors.gray} />
            <Text style={tw.infoLabel}>Vibe:</Text>
            <Text style={tw.infoValue}>
              {date?.apiData?.tone === 'friendship' ? 'Amizade' :
               date?.apiData?.tone === 'adventure' ? 'Aventura' :
               date?.apiData?.tone === 'romantic' ? 'Romântico' : 'Casual'}
            </Text>
          </View>
        </View>
      </View>
      
      {userStatus?.user_status === 'creator' && (
        <View style={tw.submissionsSection}>
          <View style={tw.sectionHeader}>
            <Text style={tw.sectionTitle}>👥 Submissões</Text>
            <Text style={tw.sectionSubtitle}>
              {submissions.filter(s => s.status === 'pending').length} pendente(s)
            </Text>
          </View>
          
          {loadingSubmissions ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : submissions.length > 0 ? (
            <View style={tw.submissionsList}>
              {submissions.map(renderSubmissionItem)}
            </View>
          ) : (
            <Text style={tw.emptySubmissions}>Nenhuma submissão ainda</Text>
          )}
        </View>
      )}
      
      {userStatus?.user_status !== 'creator' && (
        <View style={tw.participationSection}>
          <Text style={tw.sectionTitle}>Participar deste date</Text>
          
          {userStatus?.user_status === 'accepted' ? (
            <View style={tw.statusCardAccepted}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.green} />
              <View style={tw.statusContent}>
                <Text style={tw.statusTitleAccepted}>🎉 Você foi aceito!</Text>
                <Text style={tw.statusMessage}>
                  Parabéns! Sua submissão foi aceita. Você está confirmado para este date.
                  O organizador pode entrar em contato com mais detalhes.
                </Text>
                <TouchableOpacity 
                  style={tw.chatButton}
                  onPress={() => handleStartChat({ user_id: user?.id, user_name: user?.nome })}
                >
                  <Ionicons name="chatbubble" size={16} color={Colors.white} />
                  <Text style={tw.chatButtonText}>Conversar com o host</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : userStatus?.user_status === 'pending' ? (
            <View style={tw.statusCardPending}>
              <Ionicons name="time" size={24} color={Colors.blue} />
              <View style={tw.statusContent}>
                <Text style={tw.statusTitlePending}>⏳ Aguardando aprovação</Text>
                <Text style={tw.statusMessage}>
                  Sua submissão está pendente. O organizador do date irá analisar e você será notificado quando houver uma resposta.
                  Enquanto isso, você pode cancelar sua submissão se mudar de ideia.
                </Text>
                <TouchableOpacity 
                  style={tw.cancelSubmissionButton}
                  onPress={handleCancelSubmission}
                >
                  <Ionicons name="close" size={16} color={Colors.red} />
                  <Text style={tw.cancelSubmissionText}>Cancelar submissão</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : userStatus?.user_status === 'rejected' ? (
            <View style={tw.statusCardRejected}>
              <Ionicons name="close-circle" size={24} color={Colors.red} />
              <View style={tw.statusContent}>
                <Text style={tw.statusTitleRejected}>❌ Submissão rejeitada</Text>
                <Text style={tw.statusMessage}>
                  Infelizmente sua submissão foi rejeitada. Não desanime! 
                  Aproveite para explorar outros dates disponíveis.
                </Text>
              </View>
            </View>
          ) : (
            <View style={tw.submissionForm}>
              <Text style={tw.submissionHint}>
                Este date tem {date?.availableSlots} vaga{date?.availableSlots !== 1 ? 's' : ''} disponível{date?.availableSlots !== 1 ? 's' : ''}.
              </Text>
              
              <TextInput
                style={tw.messageInput}
                placeholder="Conte ao organizador porque você quer participar deste date..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                maxLength={300}
                placeholderTextColor={Colors.gray}
              />
              <Text style={tw.charCount}>{message.length}/300</Text>
              
              <TouchableOpacity 
                style={tw.submitButton}
                onPress={handleSubmitToDate}
                disabled={!message.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={Colors.white} />
                    <Text style={tw.submitButtonText}>Enviar submissão</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={tw.modalContainer}>
        <View style={tw.modalHeader}>
          <TouchableOpacity onPress={onClose} style={tw.closeButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={tw.modalTitle}>
            {isEditing ? 'Editar date' : 'Detalhes do date'}
          </Text>
          
          {userStatus?.user_status === 'creator' && !isEditing && (
            <TouchableOpacity 
              style={tw.editHeaderButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create" size={20} color={Colors.black} />
              <Text style={tw.editHeaderText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? renderEditForm() : renderDateInfo()}
        
        {showChatPrompt && acceptedUser && (
          <View style={tw.chatPrompt}>
            <View style={tw.chatPromptContent}>
              <Ionicons name="chatbubble-ellipses" size={24} color={Colors.black} />
              <View style={tw.chatPromptTextContainer}>
                <Text style={tw.chatPromptTitle}>🎉 {acceptedUser.user_name} aceito!</Text>
                <Text style={tw.chatPromptMessage}>
                  Inicie uma conversa para combinar os detalhes do date.
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={tw.chatPromptButton}
              onPress={() => handleStartChat(acceptedUser)}
            >
              <Ionicons name="chatbubble" size={18} color={Colors.white} />
              <Text style={tw.chatPromptButtonText}>Conversar agora</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// O resto do código permanece EXATAMENTE IGUAL...

// Componente principal
export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dates, setDates] = useState<any[]>([]);
  const [filteredDates, setFilteredDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [showDateDetails, setShowDateDetails] = useState(false);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'accepted'>('all');
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    showFilters: false
  });
  const [dateTypes] = useState([
    'praia', 'bar', 'parque', 'cafe', 'show', 'cinema', 'restaurante', 'outro'
  ]);
  
  const loadDates = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiService.getDates();
      if (response.ok && response.dates) {
        const datesWithStatus = await Promise.all(
          response.dates.map(async (apiDate: any, index: number) => {
            let userStatus = 'not_submitted';
            let mySubmission = null;
            
            if (user?.id) {
              try {
                const statusResponse = await apiService.getMySubmission(apiDate.id, user.id);
                if (statusResponse.ok) {
                  userStatus = statusResponse.user_status;
                  mySubmission = statusResponse.submission;
                }
              } catch (error) {
                console.error('Erro ao verificar status:', error);
              }
            }
            
            const city = apiDate.location?.split(',')[0]?.trim() || 'Local indefinido';
            const date = new Date(apiDate.datetime);
            
            return {
              id: apiDate.id || `temp-${index}`,
              title: apiDate.description?.split('.')[0]?.substring(0, 30) || apiDate.type || 'Date sem título',
              description: apiDate.description || '',
              image: getImageForType(apiDate.type),
              type: apiDate.type,
              date: formatDate(apiDate.datetime),
              time: date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              location: apiDate.location,
              city: city,
              attendees: countAcceptedSubmissions(apiDate.submisoes || {}),
              maxAttendees: apiDate.max_participants || 1,
              availableSlots: calculateAvailableSlots(apiDate),
              userStatus,
              mySubmission,
              apiData: apiDate,
            };
          })
        );
        
        setDates(datesWithStatus);
        filterDates(datesWithStatus, activeTab, filters);
      }
    } catch (error) {
      console.error('Erro ao carregar dates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user?.id]);
  
  const filterDates = useCallback((datesList: any[], tab: string, filterOptions: typeof filters) => {
    let filtered = [...datesList];
    
    // Aplicar filtro da aba
    if (tab === 'submitted') {
      filtered = filtered.filter(date => 
        date.userStatus === 'pending' || date.userStatus === 'accepted' || date.userStatus === 'rejected'
      );
    } else if (tab === 'accepted') {
      filtered = filtered.filter(date => date.userStatus === 'accepted');
    }
    
    // Aplicar filtros de cidade e tipo
    if (filterOptions.city) {
      filtered = filtered.filter(date => 
        date.city.toLowerCase().includes(filterOptions.city.toLowerCase())
      );
    }
    
    if (filterOptions.type) {
      filtered = filtered.filter(date => 
        date.type.toLowerCase().includes(filterOptions.type.toLowerCase())
      );
    }
    
    setFilteredDates(filtered);
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadDates();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    filterDates(dates, activeTab, filters);
  }, [activeTab, filters, dates]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDates();
  }, [loadDates]);
  
  const openDateDetails = useCallback(async (date: any) => {
    setSelectedDate(date);
    if (user?.id) {
      try {
        const response = await apiService.getMySubmission(date.id, user.id);
        if (response.ok) {
          setUserStatus(response);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }
    setShowDateDetails(true);
  }, [user]);
  
  const clearFilters = () => {
    setFilters({
      city: '',
      type: '',
      showFilters: false
    });
  };
  
  if (loading && !refreshing) {
    return (
      <View style={tw.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.black} />
        <Text style={tw.loadingText}>Carregando rolês...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={tw.container}>
      <View style={tw.header}>
        <Text style={tw.logo}>psique</Text>
        <TouchableOpacity 
          style={tw.profileButton}
          onPress={() => router.push('/profile')}
        >
          {user?.foto_perfil ? (
            <Image source={{ uri: user.foto_perfil }} style={tw.profileAvatarImage} />
          ) : (
            <View style={tw.profileAvatar}>
              <Text style={tw.profileInitial}>
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={tw.tabsContainer}>
        <TouchableOpacity 
          style={[tw.tab, activeTab === 'all' && tw.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[tw.tabText, activeTab === 'all' && tw.tabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[tw.tab, activeTab === 'submitted' && tw.tabActive]}
          onPress={() => setActiveTab('submitted')}
        >
          <Ionicons 
            name="paper-plane" 
            size={16} 
            color={activeTab === 'submitted' ? Colors.black : Colors.gray} 
          />
          <Text style={[tw.tabText, activeTab === 'submitted' && tw.tabTextActive]}>
            Submetidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[tw.tab, activeTab === 'accepted' && tw.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color={activeTab === 'accepted' ? Colors.black : Colors.gray} 
          />
          <Text style={[tw.tabText, activeTab === 'accepted' && tw.tabTextActive]}>
            Aceitos
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filtros */}
      <View style={tw.filterSection}>
        <TouchableOpacity 
          style={tw.filterToggle}
          onPress={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
        >
          <Ionicons name="filter" size={18} color={Colors.black} />
          <Text style={tw.filterToggleText}>
            {filters.showFilters ? 'Ocultar filtros' : 'Filtrar'}
          </Text>
        </TouchableOpacity>
        
        {(filters.city || filters.type) && (
          <TouchableOpacity style={tw.clearFilterButton} onPress={clearFilters}>
            <Text style={tw.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {filters.showFilters && (
        <View style={tw.filtersContainer}>
          <View style={tw.filterInputContainer}>
            <Ionicons name="location" size={18} color={Colors.gray} />
            <TextInput
              style={tw.filterInput}
              placeholder="Cidade..."
              value={filters.city}
              onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
              placeholderTextColor={Colors.gray}
            />
          </View>
          
          <View style={tw.filterInputContainer}>
            <Ionicons name="pricetag" size={18} color={Colors.gray} />
            <TextInput
              style={tw.filterInput}
              placeholder="Tipo (praia, bar, etc)..."
              value={filters.type}
              onChangeText={(text) => setFilters(prev => ({ ...prev, type: text }))}
              placeholderTextColor={Colors.gray}
            />
          </View>
          
          <View style={tw.typeChips}>
            {dateTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  tw.typeChip,
                  filters.type === type && tw.typeChipActive
                ]}
                onPress={() => setFilters(prev => ({ 
                  ...prev, 
                  type: prev.type === type ? '' : type 
                }))}
              >
                <Text style={[
                  tw.typeChipText,
                  filters.type === type && tw.typeChipTextActive
                ]}>
                  {type === 'praia' ? 'Praia' :
                   type === 'bar' ? 'Bar' :
                   type === 'parque' ? 'Parque' :
                   type === 'cafe' ? 'Café' :
                   type === 'show' ? 'Show' :
                   type === 'cinema' ? 'Cinema' :
                   type === 'restaurante' ? 'Restaurante' : 'Outro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <ScrollView
        style={tw.feed}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.black}
            colors={[Colors.black]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={tw.greeting}>
          <Text style={tw.greetingText}>Olá, {user?.nome?.split(' ')[0] || 'amigo'} 👋</Text>
          <Text style={tw.greetingSub}>Encontre rolês com vibe real</Text>
        </View>
        
        <View style={tw.quickActions}>
          <QuickAction 
            icon="add-circle" 
            label="Criar" 
            onPress={() => router.push('/create-date')} 
          />
          <QuickAction 
            icon="heart" 
            label="Conexões" 
            onPress={() => router.push('/connections')} 
          />
          <QuickAction 
            icon="calendar" 
            label="Meus dates" 
            onPress={() => router.push('/my-dates')} 
          />
        </View>
        
        <View style={tw.datesSection}>
          <View style={tw.sectionHeader}>
            <Text style={tw.sectionTitle}>
              {activeTab === 'all' && 'Rolês próximos'}
              {activeTab === 'submitted' && 'Meus submits'}
              {activeTab === 'accepted' && 'Dates confirmados'}
            </Text>
            <Text style={tw.sectionSubtitle}>
              {filteredDates.length} encontro{filteredDates.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {filteredDates.length > 0 ? (
            filteredDates.map((date) => (
              <DateCard 
                key={date.id} 
                date={date} 
                onPress={() => openDateDetails(date)} 
              />
            ))
          ) : (
            <View style={tw.emptyState}>
              <Ionicons 
                name={
                  activeTab === 'submitted' ? 'paper-plane-outline' :
                  activeTab === 'accepted' ? 'checkmark-circle-outline' :
                  'calendar-outline'
                } 
                size={60} 
                color={Colors.gray} 
              />
              <Text style={tw.emptyTitle}>
                {activeTab === 'submitted' ? 'Nenhum submit ainda' :
                 activeTab === 'accepted' ? 'Nenhum date aceito' :
                 'Nenhum rolê encontrado'}
              </Text>
              <Text style={tw.emptyText}>
                {activeTab === 'submitted' ? 'Encontre um rolê legal e manda ver!' :
                 activeTab === 'accepted' ? 'Suba em mais dates e aguarde as confirmações' :
                 'Seja o primeiro a criar um rolê na sua área!'}
              </Text>
              {activeTab === 'all' && (
                <TouchableOpacity 
                  style={tw.createButton}
                  onPress={() => router.push('/create-date')}
                >
                  <Text style={tw.createButtonText}>Criar meu rolê</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        <View style={tw.bottomSpacer} />
      </ScrollView>
      
      <View style={tw.bottomNav}>
        <NavItem icon="home" label="Início" active />
        <NavItem icon="compass" label="Explorar" onPress={() => router.push('/explore')} />
        <NavItem icon="chatbubble" label="Chat" onPress={() => router.push('/chat')} />
        <NavItem icon="person" label="Perfil" onPress={() => router.push('/profile')} />
      </View>
      
      <DateDetailsModal
        visible={showDateDetails}
        date={selectedDate}
        userStatus={userStatus}
        onClose={() => {
          setShowDateDetails(false);
          setSelectedDate(null);
          setUserStatus(null);
        }}
        loadDates={loadDates}
      />
    </SafeAreaView>
  );
}

// Componentes auxiliares
const QuickAction = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={tw.quickAction} onPress={onPress}>
    <View style={tw.quickIcon}>
      <Ionicons name={icon} size={24} color={Colors.white} />
    </View>
    <Text style={tw.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const NavItem = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={tw.navItem} onPress={onPress}>
    <View style={[tw.navIconContainer, active && tw.navIconContainerActive]}>
      <Ionicons 
        name={icon} 
        size={22} 
        color={active ? Colors.black : Colors.gray} 
      />
    </View>
    <Text style={[tw.navLabel, active && tw.navLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Funções auxiliares
const getImageForType = (type: string) => {
  const imageMap: Record<string, string> = {
    praia: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    bar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    parque: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    show: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    cinema: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13',
    restaurante: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    outro: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
  };
  return imageMap[type?.toLowerCase()] || imageMap.outro;
};

const getIconForType = (type: string) => {
  const iconMap: Record<string, string> = {
    praia: 'water',
    bar: 'wine',
    parque: 'leaf',
    cafe: 'cafe',
    show: 'musical-notes',
    cinema: 'film',
    restaurante: 'restaurant',
    outro: 'location',
  };
  return iconMap[type?.toLowerCase()] || iconMap.outro;
};

const formatDate = (datetime: string) => {
  if (!datetime) return 'EM BREVE';
  
  const date = new Date(datetime);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'HOJE';
  if (diffDays === 1) return 'AMANHÃ';
  if (diffDays <= 7) {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return days[date.getDay()];
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
};

const countAcceptedSubmissions = (submisoes: any) => {
  if (!submisoes || typeof submisoes !== 'object') return 0;
  return Object.values(submisoes).filter((s: any) => s?.status === 'accepted').length;
};

const calculateAvailableSlots = (date: any) => {
  if (!date || !date.apiData) return 0;
  
  const submisoes = date.apiData.submisoes || {};
  
  // Contar quantos estão aceitos
  const acceptedCount = Object.values(submisoes)
    .filter((s: any) => s?.status === 'accepted')
    .length;
  
  // O criador conta como 1 participante
  const totalOccupied = acceptedCount + 1;
  
  const maxParticipants = Number(date.apiData.max_participants) || 1;
  
  return Math.max(0, maxParticipants - totalOccupied);
};

// NOVA FUNÇÃO SIMPLES DE ACEITAR (com atualização automática)
const handleAcceptSubmission = async (submission: any) => {
  if (!user?.id || !date?.id) {
    Alert.alert('Erro', 'Usuário ou date não encontrado');
    return;
  }

  setIsResponding(true);
  
  try {
    const response = await apiService.respondToSubmission(
      date.id,
      {
        creator_user_id: user.id,
        requester_user_id: submission.user_id,
        accept: true,
        reason: 'Bem-vindo ao date!'
      }
    );
    
    console.log('Resposta da API:', response);
    
    if (response.ok) {
      // ATUALIZAÇÃO IMEDIATA DO ESTADO LOCAL
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.user_id === submission.user_id 
            ? { ...sub, status: 'accepted' } 
            : sub
        )
      );
      
      Alert.alert(
        '✅ Sucesso!', 
        `${submission.user_name} foi aceito no date!`,
        [{ 
          text: 'OK', 
          onPress: () => {
            // ATUALIZAR TUDO
            loadSubmissions(); // Recarrega do servidor
            loadDates(); // Atualiza lista principal
            setAcceptedUser(submission);
            setShowChatPrompt(true);
          }
        }]
      );
    } else {
      Alert.alert('❌ Erro', response.error || 'Não foi possível aceitar o usuário');
    }
  } catch (error: any) {
    Alert.alert('❌ Erro de Conexão', error.message || 'Não foi possível conectar ao servidor');
  } finally {
    setIsResponding(false);
  }
};
// Estilos atualizados conforme o manual
const tw = StyleSheet.create({
  // Layout principal
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    backgroundColor: Colors.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(95, 240, 169, 0.3)',
  },
  profileAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(95, 240, 169, 0.3)',
  },
  profileInitial: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: Colors.offWhite,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.black,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
    fontFamily: 'Inter-SemiBold',
  },
  tabTextActive: {
    color: Colors.black,
    fontWeight: '700',
  },
  
  // Filtros
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.offWhite,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  filterInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
    padding: 0,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  typeChipActive: {
    backgroundColor: Colors.black,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    fontFamily: 'Inter-Medium',
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  
  // Feed
  feed: {
    flex: 1,
  },
  greeting: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  
  // Dates Section
  datesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  
  // Date Card
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(43, 43, 43, 0.02)',
  },
  dateBadge: {
    alignItems: 'flex-start',
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.black,
    textTransform: 'uppercase',
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  dateTime: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  userStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: 'Inter-SemiBold',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  cardContent: {
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 15,
    color: Colors.gray,
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  vibeText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  navIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  navIconContainerActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  navLabel: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    marginTop: 6,
  },
  navLabelActive: {
    color: Colors.black,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
  },
  closeButton: {
    padding: 4,
  },
  editHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  editHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Date Info View
  dateInfo: {
    flex: 1,
    paddingBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  dateTimeBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
  },
  timeText: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginLeft: 12,
  },
  locationDetail: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    marginHorizontal: 20,
    marginVertical: 16,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5,
  },
  detailDescription: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  
  // Info Section
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 12,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.3,
  },
  infoGrid: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
    minWidth: 80,
    fontFamily: 'Inter-Medium',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  
  // Submissions Section
  submissionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.blue,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  submissionsList: {
    gap: 8,
  },
  submissionItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submissionUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
  },
  submissionDate: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusAccepted: {
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
  },
  statusRejected: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: 'Inter-SemiBold',
  },
  submissionMessage: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  submissionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: Colors.black,
  },
  rejectButton: {
    backgroundColor: Colors.red,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubmissions: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    fontFamily: 'Inter-Regular',
  },
  
  // Participation Section
  participationSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statusCardAccepted: {
    flexDirection: 'row',
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.green,
    gap: 12,
  },
  statusCardPending: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.blue,
    gap: 12,
  },
  statusCardRejected: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.red,
    gap: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitleAccepted: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.green,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statusTitlePending: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.blue,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statusTitleRejected: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.red,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statusMessage: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  cancelSubmissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
  },
  cancelSubmissionText: {
    fontSize: 14,
    color: Colors.red,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  
  // Submission Form
  submissionForm: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  submissionHint: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  messageInput: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.black,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  charCount: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'right',
    fontFamily: 'Inter-Regular',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Inter-Bold',
  },
  
  // Edit Form
  editForm: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
  },
  hint: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  optionButtonActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  optionText: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  optionTextActive: {
    color: Colors.white,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelEditButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cancelEditText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    backgroundColor: Colors.black,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Chat Prompt
  chatPrompt: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chatPromptContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  chatPromptTextContainer: {
    flex: 1,
  },
  chatPromptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  chatPromptMessage: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  chatPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  chatPromptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Inter-Bold',
  },
});