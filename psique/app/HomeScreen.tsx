import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
  Animated,
  Easing,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiService } from '../src/api/apiDates';

// Importando Estilos e Cores do arquivo separado
import { styles, BrandColors } from './HomeScreen.styles';

// Componente de Date Card
const DateCard = ({ date, onPress }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const statusColors: any = {
    accepted: BrandColors.green,
    pending: BrandColors.blue,
    rejected: BrandColors.coral,
    not_submitted: BrandColors.gray
  };

  const statusIcons: any = {
    accepted: 'checkmark-circle',
    pending: 'time',
    rejected: 'close-circle',
    not_submitted: 'add-circle'
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.dateCard}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        delayPressIn={0}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{date?.date || 'EM BREVE'}</Text>
            <Text style={styles.dateTime}>{date?.time || ''}</Text>
          </View>
          {date?.userStatus && date.userStatus !== 'not_submitted' && (
            <View style={[styles.userStatusBadge, { backgroundColor: `${statusColors[date.userStatus]}20` }]}>
              <Ionicons 
                name={statusIcons[date.userStatus] as any} 
                size={12} 
                color={statusColors[date.userStatus]} 
              />
              <Text style={[styles.userStatusText, { color: statusColors[date.userStatus] }]}>
                {date.userStatus === 'accepted' ? 'Aceito' :
                 date.userStatus === 'pending' ? 'Pendente' :
                 date.userStatus === 'rejected' ? 'Recusado' : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={BrandColors.gray} />
            <Text style={styles.locationText}>{date?.city || 'Local'}</Text>
          </View>
          
          <Text style={styles.cardTitle}>{date?.title || 'Date sem nome'}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {date?.description || 'Vibe real, conexão de verdade.'}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.vibeBadge}>
              <Ionicons name="flash" size={12} color={BrandColors.lilac} />
              <Text style={styles.vibeText}>
                {getToneLabel(date?.apiData?.tone)}
              </Text>
            </View>
            
            <View style={styles.participantInfo}>
              <Ionicons name="people" size={14} color={BrandColors.gray} />
              <Text style={styles.participantCount}>
                {date?.attendees || 0}/{date?.maxAttendees || 1}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modal de Detalhes
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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  const [creatorName, setCreatorName] = useState('Organizador');
  
  useEffect(() => {
    if (visible && date && userStatus?.user_status === 'creator') {
      loadSubmissions();
    }
    
    if (visible && date) {
      // Configurar nome do criador
      if (date.creator_name) {
        setCreatorName(date.creator_name);
      } else {
        setCreatorName('Organizador');
      }
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 12
        })
      ]).start();
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
          reason: 'Vibe combinou!'
        }
      );
      
      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => 
            sub.user_id === submission.user_id 
              ? { ...sub, status: 'accepted' } 
              : sub
          )
        );
        
        setTimeout(() => {
          setAcceptedUser(submission);
          setShowChatPrompt(true);
          loadDates();
        }, 800);
        
      } else {
        Alert.alert('❌ Não rolou', response.error || 'Deu ruim ao aceitar');
      }
    } catch (error: any) {
      Alert.alert('❌ Sem conexão', error.message || 'Servidor offline');
    } finally {
      setIsResponding(false);
    }
  };
  
  // Função CORRIGIDA para iniciar chat
  const handleStartChat = (submission: any, isHost = false) => {
    if (!user?.id) return;
    
    // Determinar IDs dos participantes
    let user1, user2, otherUserName;
    
    if (isHost) {
      // Conversar com o host (criador do date)
      user1 = user.id;
      user2 = date?.creator_user_id;
      otherUserName = creatorName;
    } else {
      // Conversar com um participante aceito
      user1 = user.id;
      user2 = submission.user_id;
      otherUserName = submission.user_name;
    }
    
    if (!user2) {
      Alert.alert('Erro', 'Não foi possível identificar o outro usuário');
      return;
    }
    
    // Gerar chat_id no formato correto (IDs ordenados)
    const ids = [user1, user2].sort();
    const chatId = `${ids[0]}_${ids[1]}`;
    
    console.log('Navegando para chat:', {
      chatId,
      with: otherUserName,
      isHost,
      user1,
      user2
    });
    
    onClose();
    
    // Navegar para a tela de chat
    router.push({
      pathname: `/messages`,
      params: { 
        name: otherUserName,
        other_user_id: user2,
        is_host_chat: isHost ? 'true' : 'false'
      }
    });
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
        Alert.alert('✅ Feito!', 'Date atualizado!');
        setIsEditing(false);
        loadDates();
      } else {
        Alert.alert('❌ Erro', response.error);
      }
    } catch (error: any) {
      Alert.alert('❌ Erro', 'Sem conexão');
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
        Alert.alert('✅ Mandou bem!', 'Inscrição enviada!');
        setMessage('');
        loadDates();
        onClose();
      } else {
        Alert.alert('❌ Erro', response.error);
      }
    } catch (error: any) {
      Alert.alert('❌ Erro', 'Sem conexão');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancelSubmission = async () => {
    if (!user?.id || !date?.id) return;
    
    Alert.alert(
      'Cancelar inscrição',
      'Certeza que quer pular desse Date?',
      [
        { text: 'Fica', style: 'cancel' },
        {
          text: 'Vazou',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.cancelSubmission(date.id, user.id);
              if (response.ok) {
                Alert.alert('✅ Feito!', response.message);
                loadDates();
                onClose();
              } else {
                Alert.alert('❌ Erro', response.error);
              }
            } catch (error: any) {
              Alert.alert('❌ Erro', 'Sem conexão');
            }
          }
        }
      ]
    );
  };
  
  const renderSubmissionItem = (submission: any, index: number) => (
    <Animated.View 
      key={submission.user_id}
      style={[
        styles.submissionItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, index * 10]
              })
            }
          ]
        }
      ]}
    >
      <View style={styles.submissionHeader}>
        <View style={styles.submissionUser}>
          {submission.user_photo ? (
            <Image source={{ uri: submission.user_photo }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {submission.user_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{submission.user_name || 'Usuário'}</Text>
            <Text style={styles.submissionDate}>
              {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          submission.status === 'accepted' && styles.statusAccepted,
          submission.status === 'rejected' && styles.statusRejected,
          submission.status === 'pending' && styles.statusPending
        ]}>
          <Text style={styles.statusText}>
            {getStatusLabel(submission.status)}
          </Text>
        </View>
      </View>
      
      {submission.message && (
        <Text style={styles.submissionMessage}>"{submission.message}"</Text>
      )}
      
      {submission.status === 'pending' && userStatus?.user_status === 'creator' && (
        <View style={styles.submissionActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptSubmission(submission)}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Aceitar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {submission.status === 'accepted' && userStatus?.user_status === 'creator' && (
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => handleStartChat(submission, false)}
        >
          <Ionicons name="chatbubble" size={16} color={Colors.white} />
          <Text style={styles.chatButtonText}>Conversar</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
  
  const renderEditForm = () => (
    <Animated.ScrollView 
      style={[styles.editForm, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Editar Date</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={editData.description}
          onChangeText={(text) => setEditData({...editData, description: text})}
          placeholder="Qual a vibe do Date?"
          multiline
          numberOfLines={3}
          placeholderTextColor={BrandColors.gray}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Local</Text>
        <TextInput
          style={styles.input}
          value={editData.location}
          onChangeText={(text) => setEditData({...editData, location: text})}
          placeholder="Onde vai rolar?"
          placeholderTextColor={BrandColors.gray}
        />
      </View>
      
      <View style={styles.editActions}>
        <TouchableOpacity 
          style={[styles.editButton, styles.cancelEditButton]}
          onPress={() => setIsEditing(false)}
        >
          <Text style={styles.cancelEditText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.editButton, styles.saveButton]}
          onPress={handleSaveEdit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="save" size={18} color={Colors.white} />
              <Text style={styles.saveText}>Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.ScrollView>
  );
  
  const renderDateInfo = () => (
    <Animated.ScrollView 
      style={[styles.dateInfo, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dateHeader}>
        <View style={styles.dateTimeBadge}>
          <Text style={styles.dateText}>{date?.date || 'EM BREVE'}</Text>
          <Text style={styles.timeText}>{date?.time || ''}</Text>
        </View>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={14} color={BrandColors.gray} />
          <Text style={styles.locationDetail}>{date?.location || 'Local a definir'}</Text>
        </View>
      </View>
      
      <Text style={styles.detailTitle}>{date?.title || 'Date sem nome'}</Text>
      <Text style={styles.detailDescription}>{date?.description || 'Vibe real, conexão de verdade.'}</Text>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>📋 Info</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={18} color={BrandColors.lilac} />
            <Text style={styles.infoLabel}>Vagas:</Text>
            <Text style={styles.infoValue}>
              {date?.attendees || 0}/{date?.maxAttendees || 1}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="flash" size={18} color={BrandColors.lilac} />
            <Text style={styles.infoLabel}>Vibe:</Text>
            <Text style={styles.infoValue}>
              {getToneLabel(date?.apiData?.tone)}
            </Text>
          </View>
        </View>
      </View>
      
      {userStatus?.user_status === 'creator' && (
        <View style={styles.submissionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Inscrições</Text>
            <Text style={styles.sectionSubtitle}>
              {submissions.filter(s => s.status === 'pending').length} pendente(s)
            </Text>
          </View>
          
          {loadingSubmissions ? (
            <ActivityIndicator size="small" color={BrandColors.black} />
          ) : submissions.length > 0 ? (
            <View style={styles.submissionsList}>
              {submissions.map((sub, index) => renderSubmissionItem(sub, index))}
            </View>
          ) : (
            <Text style={styles.emptySubmissions}>Ninguém se inscreveu ainda</Text>
          )}
        </View>
      )}
      
      {userStatus?.user_status !== 'creator' && (
        <View style={styles.participationSection}>
          <Text style={styles.sectionTitle}>Participar</Text>
          
          {userStatus?.user_status === 'accepted' ? (
            <Animated.View 
              style={[styles.statusCardAccepted, {
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  })
                }]
              }]}
            >
              <Ionicons name="checkmark-circle" size={24} color={BrandColors.green} />
              <View style={styles.statusContent}>
                <Text style={styles.statusTitleAccepted}>🎉 Aceito!</Text>
                <Text style={styles.statusMessage}>
                  Sua vibe foi aprovada! Você tá confirmado nesse Date.
                </Text>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => handleStartChat(null, true)}
                >
                  <Ionicons name="chatbubble" size={16} color={Colors.white} />
                  <Text style={styles.chatButtonText}>Conversar com o host</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : userStatus?.user_status === 'pending' ? (
            <View style={styles.statusCardPending}>
              <Ionicons name="time" size={24} color={BrandColors.blue} />
              <View style={styles.statusContent}>
                <Text style={styles.statusTitlePending}>⏳ Aguardando</Text>
                <Text style={styles.statusMessage}>
                  Sua inscrição tá pendente. O organizador vai analisar e você recebe uma resposta.
                </Text>
                <TouchableOpacity 
                  style={styles.cancelSubmissionButton}
                  onPress={handleCancelSubmission}
                >
                  <Ionicons name="close" size={16} color={BrandColors.coral} />
                  <Text style={styles.cancelSubmissionText}>Cancelar inscrição</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Animated.View 
              style={[styles.submissionForm, {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20]
                  })
                }]
              }]}
            >
              <Text style={styles.submissionHint}>
                {date?.availableSlots || 0} vaga{date?.availableSlots !== 1 ? 's' : ''} disponível{date?.availableSlots !== 1 ? 's' : ''}.
              </Text>
              
              <TextInput
                style={styles.messageInput}
                placeholder="Fala pro organizador porque você quer entrar nesse Date..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                maxLength={300}
                placeholderTextColor={BrandColors.gray}
              />
              <Text style={styles.charCount}>{message.length}/300</Text>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitToDate}
                disabled={!message.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={Colors.white} />
                    <Text style={styles.submitButtonText}>Enviar</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
    </Animated.ScrollView>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={BrandColors.black} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar Date' : 'Detalhes'}
          </Text>
          
          {userStatus?.user_status === 'creator' && !isEditing && (
            <TouchableOpacity 
              style={styles.editHeaderButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create" size={20} color={BrandColors.black} />
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? renderEditForm() : renderDateInfo()}
        
        {showChatPrompt && acceptedUser && (
          <Animated.View 
            style={[styles.chatPrompt, {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })
              }]
            }]}
          >
            <View style={styles.chatPromptContent}>
              <Ionicons name="chatbubble-ellipses" size={24} color={BrandColors.lilac} />
              <View style={styles.chatPromptTextContainer}>
                <Text style={styles.chatPromptTitle}>✅ {acceptedUser.user_name} aceito!</Text>
                <Text style={styles.chatPromptMessage}>
                  Chama pra conversar e combinar os detalhes.
                </Text>
              </View>
            </View>
            <TouchableOpacity 
  style={styles.chatPromptButton}
  onPress={() => router.push('/messages')}
>
              <Ionicons name="chatbubble" size={18} color={Colors.white} />
              <Text style={styles.chatPromptButtonText}>Conversar agora</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

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
  const [fadeAnim] = useState(new Animated.Value(0));
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
            if (!apiDate || typeof apiDate !== 'object') {
              return null;
            }
            
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
            
            if (activeTab === 'submitted' && userStatus === 'accepted') {
              return null;
            }
            
            if (activeTab === 'accepted' && userStatus !== 'accepted') {
              return null;
            }
            
            const city = apiDate.location?.split(',')[0]?.trim() || 'Local indefinido';
            const date = new Date(apiDate.datetime);
            
            return {
              id: apiDate.id || `temp-${index}`,
              title: apiDate.description?.split('.')[0]?.substring(0, 30) || apiDate.type || 'Date sem nome',
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
              creator_user_id: apiDate.creator_user_id,
              creator_name: apiDate.creator_name || 'Organizador',
            };
          })
        );
        
        const validDates = datesWithStatus.filter(date => date !== null);
        setDates(validDates);
        filterDates(validDates, filters);
      }
    } catch (error) {
      console.error('Erro ao carregar dates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start();
    }
  }, [isAuthenticated, user?.id, activeTab]);
  
  const filterDates = useCallback((datesList: any[], filterOptions: typeof filters) => {
    let filtered = [...datesList];
    
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
  }, [isAuthenticated, activeTab]);
  
  useEffect(() => {
    filterDates(dates, filters);
  }, [filters, dates]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDates();
  }, [loadDates]);
  
  const openDateDetails = useCallback(async (date: any) => {
    setSelectedDate(date);
    if (user?.id && date?.id) {
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
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={BrandColors.green} />
        <Text style={styles.loadingText}>Carregando Dates...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.logo}>psique</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          {user?.foto_perfil ? (
            <Image source={{ uri: user.foto_perfil }} style={styles.profileAvatarImage} />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {/* Tabs */}
      <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'submitted' && styles.tabActive]}
          onPress={() => setActiveTab('submitted')}
        >
          <Ionicons 
            name="paper-plane" 
            size={16} 
            color={activeTab === 'submitted' ? BrandColors.green : BrandColors.gray} 
          />
          <Text style={[styles.tabText, activeTab === 'submitted' && styles.tabTextActive]}>
            Submetidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color={activeTab === 'accepted' ? BrandColors.green : BrandColors.gray} 
          />
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.tabTextActive]}>
            Aceitos
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Filtros */}
      <Animated.View style={[styles.filterSection, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
        >
          <Ionicons name="filter" size={18} color={BrandColors.green} />
          <Text style={styles.filterToggleText}>
            {filters.showFilters ? 'Ocultar' : 'Filtrar'}
          </Text>
        </TouchableOpacity>
        
        {(filters.city || filters.type) && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {filters.showFilters && (
        <Animated.View 
          style={[styles.filtersContainer, { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }]
          }]}
        >
          <View style={styles.filterInputContainer}>
            <Ionicons name="location" size={18} color={BrandColors.lilac} />
            <TextInput
              style={styles.filterInput}
              placeholder="Cidade..."
              value={filters.city}
              onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
              placeholderTextColor={BrandColors.gray}
            />
          </View>
          
          <View style={styles.filterInputContainer}>
            <Ionicons name="pricetag" size={18} color={BrandColors.lilac} />
            <TextInput
              style={styles.filterInput}
              placeholder="Tipo (praia, bar, etc)..."
              value={filters.type}
              onChangeText={(text) => setFilters(prev => ({ ...prev, type: text }))}
              placeholderTextColor={BrandColors.gray}
            />
          </View>
          
          <View style={styles.typeChips}>
            {dateTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  filters.type === type && styles.typeChipActive
                ]}
                onPress={() => setFilters(prev => ({ 
                  ...prev, 
                  type: prev.type === type ? '' : type 
                }))}
              >
                <Text style={[
                  styles.typeChipText,
                  filters.type === type && styles.typeChipTextActive
                ]}>
                  {getTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
      
      <Animated.ScrollView
        style={[styles.feed, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={BrandColors.green}
            colors={[BrandColors.green]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Oi, {user?.nome?.split(' ')[0] || 'amigo'} 👋</Text>
          <Text style={styles.greetingSub}>Precisando de um date?</Text>
        </View>
        
        <View style={styles.quickActions}>
          <QuickAction 
            icon="add-circle" 
            label="Criar" 
            color={BrandColors.green}
            onPress={() => router.push('/create-date')} 
          />
          <QuickAction 
            icon="chatbubble" 
            label="Chat" 
            color={BrandColors.peach}
            onPress={() => router.push('/messages')} 
          />
          <QuickAction 
            icon="calendar" 
            label="Meus" 
            color={BrandColors.lilac}
            onPress={() => setActiveTab('submitted')} 
          />
        </View>
        
        <View style={styles.datesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'all' && 'Dates próximos'}
              {activeTab === 'submitted' && 'Submetidos'}
              {activeTab === 'accepted' && 'Confirmados'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredDates.length} encontro{filteredDates.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {filteredDates.length > 0 ? (
            filteredDates.map((date, index) => (
              <DateCard 
                key={date.id} 
                date={date} 
                onPress={() => openDateDetails(date)} 
              />
            ))
          ) : (
            <Animated.View 
              style={[styles.emptyState, { opacity: fadeAnim }]}
            >
              <Ionicons 
                name={
                  activeTab === 'submitted' ? 'paper-plane-outline' :
                  activeTab === 'accepted' ? 'checkmark-circle-outline' :
                  'calendar-outline'
                } 
                size={60} 
                color={BrandColors.lilac} 
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'submitted' ? 'Nenhum submit ainda' :
                 activeTab === 'accepted' ? 'Nenhum Date aceito' :
                 'Sem Dates por aqui'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'submitted' ? 'Encontre um Date legal e manda ver!' :
                 activeTab === 'accepted' ? 'Suba em mais Dates e aguarde as confirmações' :
                 'Cria o primeiro Date na sua área!'}
              </Text>
              {activeTab === 'all' && (
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => router.push('/create-date')}
                >
                  <Text style={styles.createButtonText}>Criar meu Date</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
      
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Início" active color={BrandColors.green} />
        <NavItem icon="chatbubble" label="Chat" onPress={() => router.push('/messages')} color={BrandColors.peach} />
        <NavItem icon="person" label="Perfil" onPress={() => router.push('/profile')} color={BrandColors.blue} />
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
const QuickAction = ({ icon, label, color, onPress }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.quickAction} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View 
        style={[
          styles.quickIcon, 
          { 
            backgroundColor: color || BrandColors.green,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Ionicons name={icon} size={24} color={Colors.white} />
      </Animated.View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const NavItem = ({ icon, label, active, color, onPress }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      })
    ]).start();
    
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity style={styles.navItem} onPress={handlePress}>
      <Animated.View 
        style={[
          styles.navIconContainer, 
          active && styles.navIconContainerActive,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Ionicons 
          name={icon} 
          size={22} 
          color={active ? (color || BrandColors.green) : BrandColors.gray} 
        />
      </Animated.View>
      <Text style={[
        styles.navLabel, 
        active && styles.navLabelActive,
        active && { color: color || BrandColors.green }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Funções auxiliares
const getImageForType = (type?: string) => {
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
  return imageMap[type?.toLowerCase() || 'outro'] || imageMap.outro;
};

const getIconForType = (type?: string) => {
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
  return iconMap[type?.toLowerCase() || 'outro'] || iconMap.outro;
};

const getTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    praia: 'Praia',
    bar: 'Bar',
    parque: 'Parque',
    cafe: 'Café',
    show: 'Show',
    cinema: 'Cinema',
    restaurante: 'Restaurante',
    outro: 'Outro'
  };
  return map[type || ''] || 'Outro';
};

const getToneLabel = (tone?: string) => {
  const map: Record<string, string> = {
    friendship: 'Amizade',
    adventure: 'Aventura',
    romantic: 'Romântico',
    casual: 'Casual'
  };
  return map[tone || ''] || 'Casual';
};

const getPaymentLabel = (payment?: string) => {
  const map: Record<string, string> = {
    both: 'Cada um paga',
    creator: 'Anfitrião paga',
    invitee: 'Convidado paga'
  };
  return map[payment || ''] || 'Cada um paga';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    accepted: 'Aceito',
    rejected: 'Rejeitado',
    pending: 'Pendente'
  };
  return map[status] || 'Pendente';
};

const formatDate = (datetime?: string) => {
  if (!datetime) return 'EM BREVE';
  
  try {
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
  } catch {
    return 'EM BREVE';
  }
};

const formatFullDate = (datetime?: string) => {
  if (!datetime) return 'A definir';
  
  try {
    const date = new Date(datetime);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'A definir';
  }
};

const countAcceptedSubmissions = (submisoes: any) => {
  if (!submisoes || typeof submisoes !== 'object') return 0;
  return Object.values(submisoes).filter((s: any) => s?.status === 'accepted').length;
};

const calculateAvailableSlots = (date: any) => {
  if (!date || !date.apiData) return 0;
  
  const submisoes = date.apiData.submisoes || {};
  
  const acceptedCount = Object.values(submisoes)
    .filter((s: any) => s?.status === 'accepted')
    .length;
  
  const totalOccupied = acceptedCount + 1;
  const maxParticipants = Number(date.apiData.max_participants) || 1;
  
  return Math.max(0, maxParticipants - totalOccupied);
};