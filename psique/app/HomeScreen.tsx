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
  Platform,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiService } from '../src/api/apiDates';

// Paleta de cores expandida da marca
const BrandColors = {
  black: '#0E0E0E',
  gray: '#2B2B2B',
  offWhite: '#F5F4F2',
  green: '#5FF0A9',
  peach: '#FFB994',
  lilac: '#C7B5FF',
  blue: '#6E8AFF',
  coral: '#FF6B8B',
  teal: '#2EE6CA'
};

// Componente de Date Card com animações fluidas
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
        style={s.dateCard}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        delayPressIn={0}
      >
        <View style={s.cardHeader}>
          <View style={s.dateBadge}>
            <Text style={s.dateDay}>{date?.date || 'EM BREVE'}</Text>
            <Text style={s.dateTime}>{date?.time || ''}</Text>
          </View>
          {date?.userStatus && date.userStatus !== 'not_submitted' && (
            <View style={[s.userStatusBadge, { backgroundColor: `${statusColors[date.userStatus]}20` }]}>
              <Ionicons 
                name={statusIcons[date.userStatus]} 
                size={12} 
                color={statusColors[date.userStatus]} 
              />
              <Text style={[s.userStatusText, { color: statusColors[date.userStatus] }]}>
                {date.userStatus === 'accepted' ? 'Aceito' :
                 date.userStatus === 'pending' ? 'Pendente' :
                 date.userStatus === 'rejected' ? 'Recusado' : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={s.imageContainer}>
          <Image source={{ uri: date?.image || getImageForType('outro') }} style={s.cardImage} />
          <View style={s.typeBadge}>
            <Ionicons 
              name={getIconForType(date?.type)} 
              size={12} 
              color={Colors.white} 
            />
            <Text style={s.typeText}>
              {getTypeLabel(date?.type)}
            </Text>
          </View>
        </View>
        
        <View style={s.cardContent}>
          <View style={s.locationRow}>
            <Ionicons name="location" size={14} color={BrandColors.gray} />
            <Text style={s.locationText}>{date?.city || 'Local'}</Text>
          </View>
          
          <Text style={s.cardTitle}>{date?.title || 'date sem nome'}</Text>
          <Text style={s.cardDescription} numberOfLines={2}>
            {date?.description || 'Vibe real, conexão de verdade.'}
          </Text>
          
          <View style={s.cardFooter}>
            <View style={s.vibeBadge}>
              <Ionicons name="flash" size={12} color={BrandColors.lilac} />
              <Text style={s.vibeText}>
                {getToneLabel(date?.apiData?.tone)}
              </Text>
            </View>
            
            <View style={s.participantInfo}>
              <Ionicons name="people" size={14} color={BrandColors.gray} />
              <Text style={s.participantCount}>
                {date?.attendees || 0}/{date?.maxAttendees || 1}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modal de Detalhes com animações fluidas
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
  
  useEffect(() => {
    if (visible && date && userStatus?.user_status === 'creator') {
      loadSubmissions();
    }
    
    if (visible) {
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
        // Atualiza o estado local
        setSubmissions(prev => 
          prev.map(sub => 
            sub.user_id === submission.user_id 
              ? { ...sub, status: 'accepted' } 
              : sub
          )
        );
        
        // Animação de confetti (simplificada)
        setTimeout(() => {
          setAcceptedUser(submission);
          setShowChatPrompt(true);
          
          // Atualiza a lista principal
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
        Alert.alert('✅ Feito!', 'date atualizado!');
        setIsEditing(false);
        loadDates();
      } else {
        Alert.alert('❌ Erro', response.error);
      }
    } catch (error) {
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
    } catch (error) {
      Alert.alert('❌ Erro', 'Sem conexão');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancelSubmission = async () => {
    if (!user?.id || !date?.id) return;
    
    Alert.alert(
      'Cancelar inscrição',
      'Certeza que quer pular desse date?',
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
            } catch (error) {
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
        s.submissionItem,
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
      <View style={s.submissionHeader}>
        <View style={s.submissionUser}>
          {submission.user_photo ? (
            <Image source={{ uri: submission.user_photo }} style={s.userAvatar} />
          ) : (
            <View style={s.userAvatar}>
              <Text style={s.userAvatarText}>
                {submission.user_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View>
            <Text style={s.userName}>{submission.user_name || 'Usuário'}</Text>
            <Text style={s.submissionDate}>
              {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <View style={[
          s.statusBadge,
          submission.status === 'accepted' && s.statusAccepted,
          submission.status === 'rejected' && s.statusRejected,
          submission.status === 'pending' && s.statusPending
        ]}>
          <Text style={s.statusText}>
            {getStatusLabel(submission.status)}
          </Text>
        </View>
      </View>
      
      {submission.message && (
        <Text style={s.submissionMessage}>"{submission.message}"</Text>
      )}
      
      {submission.status === 'pending' && userStatus?.user_status === 'creator' && (
        <View style={s.submissionActions}>
          <TouchableOpacity 
            style={[s.actionButton, s.acceptButton]}
            onPress={() => handleAcceptSubmission(submission)}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={Colors.white} />
                <Text style={s.actionButtonText}>Aceitar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {submission.status === 'accepted' && userStatus?.user_status === 'creator' && (
        <TouchableOpacity 
          style={s.chatButton}
          onPress={() => handleStartChat(submission)}
        >
          <Ionicons name="chatbubble" size={16} color={Colors.white} />
          <Text style={s.chatButtonText}>Conversar</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
  
  const renderEditForm = () => (
    <Animated.ScrollView 
      style={[s.editForm, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.sectionTitle}>Editar date</Text>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Descrição</Text>
        <TextInput
          style={s.input}
          value={editData.description}
          onChangeText={(text) => setEditData({...editData, description: text})}
          placeholder="Qual a vibe do date?"
          multiline
          numberOfLines={3}
          placeholderTextColor={BrandColors.gray}
        />
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Local</Text>
        <TextInput
          style={s.input}
          value={editData.location}
          onChangeText={(text) => setEditData({...editData, location: text})}
          placeholder="Onde vai rolar?"
          placeholderTextColor={BrandColors.gray}
        />
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Data e hora</Text>
        <TextInput
          style={s.input}
          value={editData.datetime}
          onChangeText={(text) => setEditData({...editData, datetime: text})}
          placeholder="2024-12-31T20:00:00"
          placeholderTextColor={BrandColors.gray}
        />
        <Text style={s.hint}>Formato: 2024-12-31T20:00:00</Text>
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Vagas</Text>
        <TextInput
          style={s.input}
          value={editData.max_participants.toString()}
          onChangeText={(text) => setEditData({...editData, max_participants: parseInt(text) || 1})}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor={BrandColors.gray}
        />
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Tipo de date</Text>
        <View style={s.optionsRow}>
          {['praia', 'bar', 'parque', 'cafe', 'show', 'cinema', 'restaurante', 'outro'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                s.optionButton,
                editData.type === type && s.optionButtonActive
              ]}
              onPress={() => setEditData({...editData, type})}
            >
              <Text style={[
                s.optionText,
                editData.type === type && s.optionTextActive
              ]}>
                {getTypeLabel(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Quem paga?</Text>
        <View style={s.optionsRow}>
          {['both', 'creator', 'invitee'].map((payment) => (
            <TouchableOpacity
              key={payment}
              style={[
                s.optionButton,
                editData.payment === payment && s.optionButtonActive
              ]}
              onPress={() => setEditData({...editData, payment})}
            >
              <Text style={[
                s.optionText,
                editData.payment === payment && s.optionTextActive
              ]}>
                {getPaymentLabel(payment)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.label}>Vibe</Text>
        <View style={s.optionsRow}>
          {['friendship', 'adventure', 'romantic', 'casual'].map((tone) => (
            <TouchableOpacity
              key={tone}
              style={[
                s.optionButton,
                editData.tone === tone && s.optionButtonActive
              ]}
              onPress={() => setEditData({...editData, tone})}
            >
              <Text style={[
                s.optionText,
                editData.tone === tone && s.optionTextActive
              ]}>
                {getToneLabel(tone)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={s.editActions}>
        <TouchableOpacity 
          style={[s.editButton, s.cancelEditButton]}
          onPress={() => setIsEditing(false)}
        >
          <Text style={s.cancelEditText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.editButton, s.saveButton]}
          onPress={handleSaveEdit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="save" size={18} color={Colors.white} />
              <Text style={s.saveText}>Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.ScrollView>
  );
  
  const renderDateInfo = () => (
    <Animated.ScrollView 
      style={[s.dateInfo, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.dateHeader}>
        <View style={s.dateTimeBadge}>
          <Text style={s.dateText}>{date?.date || 'EM BREVE'}</Text>
          <Text style={s.timeText}>{date?.time || ''}</Text>
        </View>
        <View style={s.locationInfo}>
          <Ionicons name="location" size={14} color={BrandColors.gray} />
          <Text style={s.locationDetail}>{date?.location || 'Local a definir'}</Text>
        </View>
      </View>
      
      <Text style={s.detailTitle}>{date?.title || 'date sem nome'}</Text>
      <Text style={s.detailDescription}>{date?.description || 'Vibe real, conexão de verdade.'}</Text>
      
      <View style={s.infoSection}>
        <Text style={s.sectionTitle}>📋 Info</Text>
        <View style={s.infoGrid}>
          <View style={s.infoItem}>
            <Ionicons name="people" size={18} color={BrandColors.lilac} />
            <Text style={s.infoLabel}>Vagas:</Text>
            <Text style={s.infoValue}>
              {date?.attendees || 0}/{date?.maxAttendees || 1}
            </Text>
          </View>
          <View style={s.infoItem}>
            <Ionicons name="cash" size={18} color={BrandColors.lilac} />
            <Text style={s.infoLabel}>Pagamento:</Text>
            <Text style={s.infoValue}>
              {getPaymentLabel(date?.apiData?.payment)}
            </Text>
          </View>
          <View style={s.infoItem}>
            <Ionicons name="calendar" size={18} color={BrandColors.lilac} />
            <Text style={s.infoLabel}>Quando:</Text>
            <Text style={s.infoValue}>
              {formatFullDate(date?.apiData?.datetime)}
            </Text>
          </View>
          <View style={s.infoItem}>
            <Ionicons name="flash" size={18} color={BrandColors.lilac} />
            <Text style={s.infoLabel}>Vibe:</Text>
            <Text style={s.infoValue}>
              {getToneLabel(date?.apiData?.tone)}
            </Text>
          </View>
        </View>
      </View>
      
      {userStatus?.user_status === 'creator' && (
        <View style={s.submissionsSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>👥 Inscrições</Text>
            <Text style={s.sectionSubtitle}>
              {submissions.filter(s => s.status === 'pending').length} pendente(s)
            </Text>
          </View>
          
          {loadingSubmissions ? (
            <ActivityIndicator size="small" color={BrandColors.black} />
          ) : submissions.length > 0 ? (
            <View style={s.submissionsList}>
              {submissions.map((sub, index) => renderSubmissionItem(sub, index))}
            </View>
          ) : (
            <Text style={s.emptySubmissions}>Ninguém se inscreveu ainda</Text>
          )}
        </View>
      )}
      
      {userStatus?.user_status !== 'creator' && (
        <View style={s.participationSection}>
          <Text style={s.sectionTitle}>Participar</Text>
          
          {userStatus?.user_status === 'accepted' ? (
            <Animated.View 
              style={[s.statusCardAccepted, {
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  })
                }]
              }]}
            >
              <Ionicons name="checkmark-circle" size={24} color={BrandColors.green} />
              <View style={s.statusContent}>
                <Text style={s.statusTitleAccepted}>🎉 Aceito!</Text>
                <Text style={s.statusMessage}>
                  Sua vibe foi aprovada! Você tá confirmado nesse date.
                  O organizador pode entrar em contato com detalhes.
                </Text>
                <TouchableOpacity 
                  style={s.chatButton}
                  onPress={() => handleStartChat({ user_id: user?.id, user_name: user?.nome })}
                >
                  <Ionicons name="chatbubble" size={16} color={Colors.white} />
                  <Text style={s.chatButtonText}>Conversar com o host</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : userStatus?.user_status === 'pending' ? (
            <View style={s.statusCardPending}>
              <Ionicons name="time" size={24} color={BrandColors.blue} />
              <View style={s.statusContent}>
                <Text style={s.statusTitlePending}>⏳ Aguardando</Text>
                <Text style={s.statusMessage}>
                  Sua inscrição tá pendente. O organizador vai analisar e você recebe uma resposta.
                  Pode cancelar se mudar de ideia.
                </Text>
                <TouchableOpacity 
                  style={s.cancelSubmissionButton}
                  onPress={handleCancelSubmission}
                >
                  <Ionicons name="close" size={16} color={BrandColors.coral} />
                  <Text style={s.cancelSubmissionText}>Cancelar inscrição</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : userStatus?.user_status === 'rejected' ? (
            <View style={s.statusCardRejected}>
              <Ionicons name="close-circle" size={24} color={BrandColors.coral} />
              <View style={s.statusContent}>
                <Text style={s.statusTitleRejected}>❌ Recusado</Text>
                <Text style={s.statusMessage}>
                  Não rolou dessa vez. Sem stress! 
                  Tem outros dates legais pra curtir.
                </Text>
              </View>
            </View>
          ) : (
            <Animated.View 
              style={[s.submissionForm, {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20]
                  })
                }]
              }]}
            >
              <Text style={s.submissionHint}>
                {date?.availableSlots || 0} vaga{date?.availableSlots !== 1 ? 's' : ''} disponível{date?.availableSlots !== 1 ? 's' : ''}.
              </Text>
              
              <TextInput
                style={s.messageInput}
                placeholder="Fala pro organizador porque você quer entrar nesse date..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                maxLength={300}
                placeholderTextColor={BrandColors.gray}
              />
              <Text style={s.charCount}>{message.length}/300</Text>
              
              <TouchableOpacity 
                style={s.submitButton}
                onPress={handleSubmitToDate}
                disabled={!message.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={Colors.white} />
                    <Text style={s.submitButtonText}>Enviar</Text>
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
      <SafeAreaView style={s.modalContainer}>
        <View style={s.modalHeader}>
          <TouchableOpacity onPress={onClose} style={s.closeButton}>
            <Ionicons name="arrow-back" size={24} color={BrandColors.black} />
          </TouchableOpacity>
          <Text style={s.modalTitle}>
            {isEditing ? 'Editar date' : 'Detalhes'}
          </Text>
          
          {userStatus?.user_status === 'creator' && !isEditing && (
            <TouchableOpacity 
              style={s.editHeaderButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create" size={20} color={BrandColors.black} />
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? renderEditForm() : renderDateInfo()}
        
        {showChatPrompt && acceptedUser && (
          <Animated.View 
            style={[s.chatPrompt, {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })
              }]
            }]}
          >
            <View style={s.chatPromptContent}>
              <Ionicons name="chatbubble-ellipses" size={24} color={BrandColors.lilac} />
              <View style={s.chatPromptTextContainer}>
                <Text style={s.chatPromptTitle}>✅ {acceptedUser.user_name} aceito!</Text>
                <Text style={s.chatPromptMessage}>
                  Chama pra conversar e combinar os detalhes.
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={s.chatPromptButton}
              onPress={() => handleStartChat(acceptedUser)}
            >
              <Ionicons name="chatbubble" size={18} color={Colors.white} />
              <Text style={s.chatPromptButtonText}>Conversar agora</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// Componente principal corrigido
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
            // VERIFICAÇÃO DE SEGURANÇA
            if (!apiDate || typeof apiDate !== 'object') {
              console.warn(`Date inválido no índice ${index}`);
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
            
            // FILTRO POR ABA - CORRIGIDO
            if (activeTab === 'submitted' && userStatus === 'accepted') {
              return null; // Não mostra aceitos na aba "submetidos"
            }
            
            if (activeTab === 'accepted' && userStatus !== 'accepted') {
              return null; // Mostra apenas aceitos na aba "aceitos"
            }
            
            const city = apiDate.location?.split(',')[0]?.trim() || 'Local indefinido';
            const date = new Date(apiDate.datetime);
            
            return {
              id: apiDate.id || `temp-${index}`,
              title: apiDate.description?.split('.')[0]?.substring(0, 30) || apiDate.type || 'date sem nome',
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
        
        // Filtra valores nulos antes de definir o estado
        const validDates = datesWithStatus.filter(date => date !== null);
        setDates(validDates);
        filterDates(validDates, filters);
      }
    } catch (error) {
      console.error('Erro ao carregar dates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // Animação de entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start();
    }
  }, [isAuthenticated, user?.id, activeTab]); // activeTab como dependência
  
  const filterDates = useCallback((datesList: any[], filterOptions: typeof filters) => {
    let filtered = [...datesList];
    
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
  }, [isAuthenticated, activeTab]); // Recarrega quando muda a aba
  
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
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={BrandColors.green} />
        <Text style={s.loadingText}>Carregando dates...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={s.container}>
      <Animated.View style={[s.header, { opacity: fadeAnim }]}>
        <Text style={s.logo}>psique</Text>
        <TouchableOpacity 
          style={s.profileButton}
          onPress={() => router.push('/profile')}
        >
          {user?.foto_perfil ? (
            <Image source={{ uri: user.foto_perfil }} style={s.profileAvatarImage} />
          ) : (
            <View style={s.profileAvatar}>
              <Text style={s.profileInitial}>
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {/* Tabs */}
      <Animated.View style={[s.tabsContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'all' && s.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[s.tabText, activeTab === 'all' && s.tabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'submitted' && s.tabActive]}
          onPress={() => setActiveTab('submitted')}
        >
          <Ionicons 
            name="paper-plane" 
            size={16} 
            color={activeTab === 'submitted' ? BrandColors.green : BrandColors.gray} 
          />
          <Text style={[s.tabText, activeTab === 'submitted' && s.tabTextActive]}>
            Submetidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'accepted' && s.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color={activeTab === 'accepted' ? BrandColors.green : BrandColors.gray} 
          />
          <Text style={[s.tabText, activeTab === 'accepted' && s.tabTextActive]}>
            Aceitos
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Filtros */}
      <Animated.View style={[s.filterSection, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={s.filterToggle}
          onPress={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
        >
          <Ionicons name="filter" size={18} color={BrandColors.green} />
          <Text style={s.filterToggleText}>
            {filters.showFilters ? 'Ocultar' : 'Filtrar'}
          </Text>
        </TouchableOpacity>
        
        {(filters.city || filters.type) && (
          <TouchableOpacity style={s.clearFilterButton} onPress={clearFilters}>
            <Text style={s.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {filters.showFilters && (
        <Animated.View 
          style={[s.filtersContainer, { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }]
          }]}
        >
          <View style={s.filterInputContainer}>
            <Ionicons name="location" size={18} color={BrandColors.lilac} />
            <TextInput
              style={s.filterInput}
              placeholder="Cidade..."
              value={filters.city}
              onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
              placeholderTextColor={BrandColors.gray}
            />
          </View>
          
          <View style={s.filterInputContainer}>
            <Ionicons name="pricetag" size={18} color={BrandColors.lilac} />
            <TextInput
              style={s.filterInput}
              placeholder="Tipo (praia, bar, etc)..."
              value={filters.type}
              onChangeText={(text) => setFilters(prev => ({ ...prev, type: text }))}
              placeholderTextColor={BrandColors.gray}
            />
          </View>
          
          <View style={s.typeChips}>
            {dateTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  s.typeChip,
                  filters.type === type && s.typeChipActive
                ]}
                onPress={() => setFilters(prev => ({ 
                  ...prev, 
                  type: prev.type === type ? '' : type 
                }))}
              >
                <Text style={[
                  s.typeChipText,
                  filters.type === type && s.typeChipTextActive
                ]}>
                  {getTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
      
      <Animated.ScrollView
        style={[s.feed, { opacity: fadeAnim }]}
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
        <View style={s.greeting}>
          <Text style={s.greetingText}>Oi, {user?.nome?.split(' ')[0] || 'amigo'} 👋</Text>
          <Text style={s.greetingSub}>dates com vibe real</Text>
        </View>
        
        <View style={s.quickActions}>
          <QuickAction 
            icon="add-circle" 
            label="Criar" 
            color={BrandColors.green}
            onPress={() => router.push('/create-date')} 
          />
          <QuickAction 
            icon="heart" 
            label="Conexões" 
            color={BrandColors.lilac}
            onPress={() => router.push('/connections')} 
          />
          <QuickAction 
            icon="calendar" 
            label="Meus" 
            color={BrandColors.peach}
            onPress={() => router.push('/my-dates')} 
          />
        </View>
        
        <View style={s.datesSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {activeTab === 'all' && 'dates próximos'}
              {activeTab === 'submitted' && 'Submetidos'}
              {activeTab === 'accepted' && 'Confirmados'}
            </Text>
            <Text style={s.sectionSubtitle}>
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
              style={[s.emptyState, { opacity: fadeAnim }]}
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
              <Text style={s.emptyTitle}>
                {activeTab === 'submitted' ? 'Nenhum submit ainda' :
                 activeTab === 'accepted' ? 'Nenhum date aceito' :
                 'Sem dates por aqui'}
              </Text>
              <Text style={s.emptyText}>
                {activeTab === 'submitted' ? 'Encontre um date legal e manda ver!' :
                 activeTab === 'accepted' ? 'Suba em mais dates e aguarde as confirmações' :
                 'Cria o primeiro date na sua área!'}
              </Text>
              {activeTab === 'all' && (
                <TouchableOpacity 
                  style={s.createButton}
                  onPress={() => router.push('/create-date')}
                >
                  <Text style={s.createButtonText}>Criar meu date</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
        
        <View style={s.bottomSpacer} />
      </Animated.ScrollView>
      
      <View style={s.bottomNav}>
        <NavItem icon="home" label="Início" active color={BrandColors.green} />
        <NavItem icon="compass" label="Explorar" onPress={() => router.push('/explore')} color={BrandColors.lilac} />
        <NavItem icon="chatbubble" label="Chat" onPress={() => router.push('/chat')} color={BrandColors.peach} />
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
    <TouchableOpacity style={s.quickAction} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View 
        style={[
          s.quickIcon, 
          { 
            backgroundColor: color || BrandColors.green,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Ionicons name={icon} size={24} color={Colors.white} />
      </Animated.View>
      <Text style={s.quickLabel}>{label}</Text>
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
    <TouchableOpacity style={s.navItem} onPress={handlePress}>
      <Animated.View 
        style={[
          s.navIconContainer, 
          active && s.navIconContainerActive,
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
        s.navLabel, 
        active && s.navLabelActive,
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

// Estilos atualizados com mais cores e fluidez
const s = StyleSheet.create({
  // Layout
  container: { 
    flex: 1, 
    backgroundColor: BrandColors.offWhite 
  },
  loadingScreen: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: BrandColors.offWhite 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: BrandColors.gray 
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10 
  },
  logo: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: BrandColors.black,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5
  },
  profileButton: { 
    padding: 4 
  },
  profileAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: BrandColors.green, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BrandColors.lilac + '30'
  },
  profileAvatarImage: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BrandColors.lilac + '30'
  },
  profileInitial: { 
    color: Colors.white, 
    fontSize: 18, 
    fontWeight: '700' 
  },
  
  // Tabs
  tabsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: BrandColors.gray + '20'
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center', 
    gap: 6, 
    paddingVertical: 8,
    borderRadius: 8
  },
  tabActive: { 
    backgroundColor: BrandColors.green + '15'
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.gray 
  },
  tabTextActive: { 
    color: BrandColors.green, 
    fontWeight: '700' 
  },
  
  // Filtros
  filterSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12 
  },
  filterToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    padding: 8, 
    backgroundColor: BrandColors.green + '15', 
    borderRadius: 8 
  },
  filterToggleText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.green 
  },
  clearFilterButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    backgroundColor: BrandColors.lilac + '15', 
    borderRadius: 6 
  },
  clearFilterText: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: BrandColors.lilac 
  },
  filtersContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 16,
    backgroundColor: BrandColors.offWhite 
  },
  filterInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: BrandColors.gray + '10', 
    borderRadius: 8,
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginBottom: 8 
  },
  filterInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14,
    color: BrandColors.black, 
    padding: 0 
  },
  typeChips: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 8 
  },
  typeChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    backgroundColor: BrandColors.gray + '10', 
    borderRadius: 20 
  },
  typeChipActive: { 
    backgroundColor: BrandColors.lilac 
  },
  typeChipText: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: BrandColors.gray 
  },
  typeChipTextActive: { 
    color: Colors.white 
  },
  
  // Feed
  feed: { 
    flex: 1 
  },
  greeting: { 
    paddingHorizontal: 20, 
    paddingVertical: 20 
  },
  greetingText: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginBottom: 4, 
    fontFamily: 'Montserrat-Bold' 
  },
  greetingSub: { 
    fontSize: 16, 
    color: BrandColors.lilac,
    fontWeight: '500'
  },
  
  // Quick Actions
  quickActions: { 
    flexDirection: 'row', 
    paddingHorizontal: 20,
    marginBottom: 24, 
    gap: 16 
  },
  quickAction: { 
    alignItems: 'center', 
    flex: 1 
  },
  quickIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center', 
    marginBottom: 8 
  },
  quickLabel: { 
    fontSize: 13, 
    color: BrandColors.black, 
    fontWeight: '600' 
  },
  
  // Dates Section
  datesSection: { 
    paddingHorizontal: 20, 
    paddingBottom: 100 
  },
  sectionHeader: { 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginBottom: 4, 
    fontFamily: 'Montserrat-Bold' 
  },
  sectionSubtitle: { 
    fontSize: 14, 
    color: BrandColors.lilac,
    fontWeight: '500'
  },
  
  // Date Card
  dateCard: {
    backgroundColor: Colors.white, 
    borderRadius: 16,
    overflow: 'hidden', 
    marginBottom: 16,
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20',
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: BrandColors.offWhite
  },
  dateBadge: { 
    alignItems: 'flex-start' 
  },
  dateDay: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: BrandColors.black,
    textTransform: 'uppercase'
  },
  dateTime: { 
    fontSize: 13, 
    color: BrandColors.lilac, 
    marginTop: 2 
  },
  userStatusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  userStatusText: { 
    fontSize: 11, 
    fontWeight: '600', 
    textTransform: 'uppercase' 
  },
  imageContainer: { 
    position: 'relative' 
  },
  cardImage: { 
    width: '100%', 
    height: 180 
  },
  typeBadge: { 
    position: 'absolute', 
    top: 12, 
    left: 12,
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    backgroundColor: BrandColors.black + 'CC', 
    paddingHorizontal: 10,
    paddingVertical: 6, 
    borderRadius: 20 
  },
  typeText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: Colors.white 
  },
  cardContent: { 
    padding: 16 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginBottom: 8 
  },
  locationText: { 
    fontSize: 13, 
    color: BrandColors.lilac 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: BrandColors.black, 
    marginBottom: 8 
  },
  cardDescription: { 
    fontSize: 15, 
    color: BrandColors.gray, 
    lineHeight: 22, 
    marginBottom: 16 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  vibeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    backgroundColor: BrandColors.lilac + '15', 
    borderRadius: 6 
  },
  vibeText: { 
    fontSize: 12, 
    color: BrandColors.lilac, 
    fontWeight: '500' 
  },
  participantInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  participantCount: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.black 
  },
  
  // Empty State
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 60, 
    paddingHorizontal: 20 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginTop: 16, 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: 15, 
    color: BrandColors.gray, 
    textAlign: 'center', 
    marginBottom: 24, 
    lineHeight: 22 
  },
  createButton: { 
    backgroundColor: BrandColors.green, 
    paddingHorizontal: 28, 
    paddingVertical: 14, 
    borderRadius: 10 
  },
  createButtonText: { 
    color: Colors.white, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  
  // Bottom Navigation
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderTopWidth: 1, 
    borderTopColor: BrandColors.gray + '20',
    backgroundColor: Colors.white, 
    position: 'absolute',
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 1000 
  },
  navItem: { 
    alignItems: 'center', 
    paddingHorizontal: 12 
  },
  navIconContainer: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 12 
  },
  navIconContainerActive: { 
    backgroundColor: BrandColors.green + '15' 
  },
  navLabel: { 
    fontSize: 11, 
    color: BrandColors.gray, 
    fontWeight: '500', 
    marginTop: 6 
  },
  navLabelActive: { 
    color: BrandColors.green, 
    fontWeight: '600' 
  },
  bottomSpacer: { 
    height: 100 
  },
  
  // Modal
  modalContainer: { 
    flex: 1, 
    backgroundColor: BrandColors.offWhite 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 16, 
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray + '20', 
    backgroundColor: Colors.white 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: BrandColors.black 
  },
  closeButton: { 
    padding: 4 
  },
  editHeaderButton: { 
    padding: 8 
  },
  
  // Date Info
  dateInfo: { 
    flex: 1, 
    paddingBottom: 20 
  },
  dateHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    padding: 20,
    backgroundColor: Colors.white, 
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray + '20'
  },
  dateTimeBadge: { 
    backgroundColor: BrandColors.green + '15', 
    paddingHorizontal: 12,
    paddingVertical: 8, 
    borderRadius: 8 
  },
  dateText: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: BrandColors.green 
  },
  timeText: { 
    fontSize: 13, 
    color: BrandColors.lilac, 
    marginTop: 2 
  },
  locationInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    flex: 1, 
    marginLeft: 12 
  },
  locationDetail: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    flex: 1 
  },
  detailTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: BrandColors.black, 
    marginHorizontal: 20, 
    marginVertical: 16 
  },
  detailDescription: { 
    fontSize: 16, 
    color: BrandColors.gray, 
    lineHeight: 24, 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  
  // Info Section
  infoSection: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginBottom: 12
  },
  infoGrid: { 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    padding: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20'
  },
  infoItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12, 
    gap: 12 
  },
  infoLabel: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    fontWeight: '500', 
    minWidth: 80 
  },
  infoValue: { 
    fontSize: 14, 
    color: BrandColors.black, 
    flex: 1 
  },
  
  // Submissions
  submissionsSection: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  sectionSubtitle: { 
    fontSize: 14, 
    color: BrandColors.green, 
    fontWeight: '600' 
  },
  submissionsList: { 
    gap: 8 
  },
  submissionItem: { 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    padding: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20'
  },
  submissionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  submissionUser: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  userAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: BrandColors.lilac, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  userAvatarText: { 
    color: Colors.white, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: BrandColors.black 
  },
  submissionDate: { 
    fontSize: 12, 
    color: BrandColors.gray 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  statusAccepted: { 
    backgroundColor: BrandColors.green + '20' 
  },
  statusRejected: { 
    backgroundColor: BrandColors.coral + '20' 
  },
  statusPending: { 
    backgroundColor: BrandColors.blue + '20' 
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: '600', 
    textTransform: 'uppercase' 
  },
  submissionMessage: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    fontStyle: 'italic', 
    marginBottom: 8, 
    lineHeight: 20 
  },
  submissionActions: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 8 
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    gap: 4, 
    flex: 1 
  },
  acceptButton: { 
    backgroundColor: BrandColors.green 
  },
  actionButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: Colors.white 
  },
  chatButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: BrandColors.green, 
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderRadius: 8, 
    gap: 6, 
    marginTop: 8 
  },
  chatButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: Colors.white 
  },
  emptySubmissions: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    textAlign: 'center',
    padding: 20, 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20'
  },
  
  // Participation
  participationSection: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  statusCardAccepted: { 
    flexDirection: 'row', 
    backgroundColor: BrandColors.green + '10',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: BrandColors.green, 
    gap: 12 
  },
  statusCardPending: { 
    flexDirection: 'row', 
    backgroundColor: BrandColors.blue + '10',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: BrandColors.blue, 
    gap: 12 
  },
  statusCardRejected: { 
    flexDirection: 'row', 
    backgroundColor: BrandColors.coral + '10',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: BrandColors.coral, 
    gap: 12 
  },
  statusContent: { 
    flex: 1 
  },
  statusTitleAccepted: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.green, 
    marginBottom: 4 
  },
  statusTitlePending: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.blue, 
    marginBottom: 4 
  },
  statusTitleRejected: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.coral, 
    marginBottom: 4 
  },
  statusMessage: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    lineHeight: 20 
  },
  cancelSubmissionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginTop: 8, 
    paddingVertical: 4 
  },
  cancelSubmissionText: { 
    fontSize: 14, 
    color: BrandColors.coral, 
    fontWeight: '500' 
  },
  
  // Submission Form
  submissionForm: { 
    backgroundColor: Colors.white, 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20' 
  },
  submissionHint: { 
    fontSize: 14, 
    color: BrandColors.lilac, 
    marginBottom: 12 
  },
  messageInput: { 
    backgroundColor: BrandColors.gray + '10', 
    borderRadius: 8, 
    padding: 12,
    fontSize: 15, 
    color: BrandColors.black, 
    minHeight: 100,
    textAlignVertical: 'top', 
    marginBottom: 8 
  },
  charCount: { 
    fontSize: 12, 
    color: BrandColors.gray, 
    textAlign: 'right' 
  },
  submitButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: BrandColors.green, 
    paddingVertical: 14, 
    borderRadius: 8,
    gap: 8, 
    marginTop: 16 
  },
  submitButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: Colors.white 
  },
  
  // Edit Form
  editForm: { 
    flex: 1, 
    padding: 20, 
    paddingBottom: 40 
  },
  formGroup: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.black, 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '30',
    borderRadius: 8, 
    padding: 12, 
    fontSize: 15, 
    color: BrandColors.black 
  },
  hint: { 
    fontSize: 12, 
    color: BrandColors.gray, 
    marginTop: 4 
  },
  optionsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  optionButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8,
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '30' 
  },
  optionButtonActive: { 
    backgroundColor: BrandColors.green, 
    borderColor: BrandColors.green 
  },
  optionText: { 
    fontSize: 13, 
    color: BrandColors.gray, 
    fontWeight: '500' 
  },
  optionTextActive: { 
    color: Colors.white 
  },
  editActions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 24 
  },
  editButton: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 8,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  cancelEditButton: { 
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '30' 
  },
  cancelEditText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: BrandColors.black 
  },
  saveButton: { 
    backgroundColor: BrandColors.green 
  },
  saveText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.white 
  },
  
  // Chat Prompt
  chatPrompt: { 
    margin: 20, 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    padding: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20',
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3 
  },
  chatPromptContent: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12, 
    marginBottom: 16 
  },
  chatPromptTextContainer: { 
    flex: 1 
  },
  chatPromptTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.black, 
    marginBottom: 4 
  },
  chatPromptMessage: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    lineHeight: 20 
  },
  chatPromptButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: BrandColors.lilac, 
    paddingVertical: 14, 
    borderRadius: 8, 
    gap: 8 
  },
  chatPromptButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: Colors.white 
  },
});