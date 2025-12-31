import { useEffect, useState } from 'react';
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
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { clientesApi, UserData } from '../src/api/api';

interface ApiResponse {
  success: boolean;
  data: UserData;
  clientId: string;
}

interface ProfileData {
  created_at: string;
  email: string;
  foto?: string;
  gosto: {
    comida: string;
    cor: string;
    music: string;
  };
  nome: string;
  type: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    nome: '',
    gosto_comida: '',
    gosto_cor: '',
    gosto_music: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (!authLoading && !isChecking && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, isChecking]);

  useEffect(() => {
    if (isAuthenticated && !isChecking) {
      loadProfile();
    }
  }, [isAuthenticated, isChecking]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.email) {
        Alert.alert('Erro', 'Email do usuário não encontrado');
        return;
      }

      // Buscar dados da API
      const response = await clientesApi.getClienteByEmail(user.email);
      
      if (response.success && response.userData) {
        // Formatar os dados da API
        const apiData = response.userData;
        const profileData: ProfileData = {
          created_at: apiData.created_at || '',
          email: apiData.email || '',
          foto: apiData.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
          gosto: apiData.gosto || { comida: '', cor: '', music: '' },
          nome: apiData.nome || 'Usuário',
          type: apiData.type || 'free',
          updated_at: apiData.updated_at || '',
        };
        setProfile(profileData);
        
        // Atualizar dados de edição
        setEditData({
          nome: profileData.nome,
          gosto_comida: profileData.gosto.comida || '',
          gosto_cor: profileData.gosto.cor || '',
          gosto_music: profileData.gosto.music || '',
        });
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Falha na conexão com o servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            await logout();
            router.replace('/');
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditData({
        nome: profile.nome,
        gosto_comida: profile.gosto.comida || '',
        gosto_cor: profile.gosto.cor || '',
        gosto_music: profile.gosto.music || '',
      });
      setShowEditModal(true);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      if (!profile || !user?.id) {
        Alert.alert('Erro', 'Dados do perfil não encontrados');
        return;
      }

      // Preparar dados para envio
      const updatedData = {
        nome: editData.nome,
        gosto: {
          comida: editData.gosto_comida,
          cor: editData.gosto_cor,
          music: editData.gosto_music,
        },
        updated_at: new Date().toISOString(),
      };

      // Tentar atualizar via API
      try {
        // Como sua API não tem endpoint de update específico, vamos fazer um PUT para o endpoint geral
        // Ou você pode precisar ajustar isso conforme sua API
        const response = await clientesApi.createCliente({
          ...updatedData,
          id: user.id,
          email: profile.email,
          type: profile.type,
          created_at: profile.created_at,
        });
        
        if (response.success) {
          // Atualizar localmente
          setProfile(prev => ({
            ...prev!,
            ...updatedData,
            updated_at: updatedData.updated_at,
          }));
          
          Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
          setShowEditModal(false);
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar o perfil');
        }
      } catch (apiError) {
        console.error('Erro na API:', apiError);
        // Atualizar localmente como fallback
        setProfile(prev => ({
          ...prev!,
          ...updatedData,
          updated_at: updatedData.updated_at,
        }));
        Alert.alert('Aviso', 'Perfil atualizado localmente (API offline)');
        setShowEditModal(false);
      }

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        
        // Aqui você precisaria implementar o upload real para seu servidor
        // Por enquanto, apenas atualizamos localmente
        const newPhotoUri = result.assets[0].uri;
        
        // Simular upload
        setTimeout(() => {
          setProfile(prev => ({
            ...prev!,
            foto: newPhotoUri,
          }));
          setUploadingPhoto(false);
          Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível alterar a foto');
      setUploadingPhoto(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowEditModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Editar Perfil</Text>
          <TouchableOpacity 
            style={styles.modalSaveButton}
            onPress={saveProfile}
          >
            <Text style={styles.modalSaveText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.editPhotoSection}>
            <TouchableOpacity onPress={pickImage}>
              <Image 
                source={{ uri: profile?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }}
                style={styles.editProfileImage}
              />
              <View style={styles.editPhotoOverlay}>
                <Ionicons name="camera" size={24} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.editPhotoText}>Alterar foto</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome</Text>
            <TextInput
              style={styles.formInput}
              value={editData.nome}
              onChangeText={(text) => setEditData({...editData, nome: text})}
              placeholder="Seu nome"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Comida favorita</Text>
            <TextInput
              style={styles.formInput}
              value={editData.gosto_comida}
              onChangeText={(text) => setEditData({...editData, gosto_comida: text})}
              placeholder="Ex: Pizza"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cor favorita</Text>
            <TextInput
              style={styles.formInput}
              value={editData.gosto_cor}
              onChangeText={(text) => setEditData({...editData, gosto_cor: text})}
              placeholder="Ex: Azul"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Música favorita</Text>
            <TextInput
              style={styles.formInput}
              value={editData.gosto_music}
              onChangeText={(text) => setEditData({...editData, gosto_music: text})}
              placeholder="Ex: Eletrônica"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <Text style={styles.emailText}>{profile?.email}</Text>
            <Text style={styles.emailNote}>O email não pode ser alterado</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tipo de conta</Text>
            <Text style={styles.emailText}>{profile?.type === 'free' ? 'Grátis' : 'Premium'}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderGostos = () => {
    if (!profile?.gosto) return null;

    const { comida, cor, music } = profile.gosto;
    
    return (
      <View style={styles.gostosSection}>
        <Text style={styles.sectionTitle}>Seus Gostos</Text>
        <View style={styles.gostosGrid}>
          {comida ? (
            <View style={styles.gostoChip}>
              <Ionicons name="restaurant" size={16} color={Colors.green} />
              <Text style={styles.gostoChipText}>Comida: {comida}</Text>
            </View>
          ) : null}
          
          {cor ? (
            <View style={styles.gostoChip}>
              <Ionicons name="color-palette" size={16} color={Colors.green} />
              <Text style={styles.gostoChipText}>Cor: {cor}</Text>
            </View>
          ) : null}
          
          {music ? (
            <View style={styles.gostoChip}>
              <Ionicons name="musical-notes" size={16} color={Colors.green} />
              <Text style={styles.gostoChipText}>Música: {music}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  if (authLoading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil-outline" size={22} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Foto e informações básicas */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ 
                uri: profile?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' 
              }}
              style={styles.profileImage}
            />
            {uploadingPhoto && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={Colors.white} />
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>{profile?.nome || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <View style={styles.accountTypeBadge}>
            <Text style={styles.accountTypeText}>
              {profile?.type === 'free' ? 'Conta Grátis' : 'Conta Premium'}
            </Text>
          </View>
        </View>

        {/* Gostos */}
        {renderGostos()}

        {/* Informações da conta */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações da Conta</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color={Colors.gray} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Criada em</Text>
              <Text style={styles.infoValue}>{formatDate(profile?.created_at || '')}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="refresh-outline" size={20} color={Colors.gray} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Última atualização</Text>
              <Text style={styles.infoValue}>{formatDate(profile?.updated_at || '')}</Text>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={22} color={Colors.black} />
            </View>
            <Text style={styles.settingText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.black} />
            </View>
            <Text style={styles.settingText}>Privacidade</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.black} />
            </View>
            <Text style={styles.settingText}>Ajuda & Suporte</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Versão 2.0.0</Text>
          <Text style={styles.footerText}>Psique App © 2026</Text>
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
  },
  editButton: {
    padding: Spacing.xs,
  },

  // Content
  content: {
    flex: 1,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  accountTypeBadge: {
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  accountTypeText: {
    fontSize: 14,
    color: Colors.green,
    fontFamily: 'Inter-Medium',
  },

  // Gostos
  gostosSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  gostosGrid: {
    gap: Spacing.sm,
  },
  gostoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  gostoChipText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },

  // Informações
  infoSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: Spacing.sm,
  },
  infoIcon: {
    marginRight: Spacing.md,
    width: 30,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.black,
    fontFamily: 'Inter-Medium',
  },

  // Settings
  settingsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: Spacing.sm,
  },
  settingIcon: {
    marginRight: Spacing.md,
    width: 30,
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Medium',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  versionText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },

  // Edit Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
  },
  modalSaveButton: {
    padding: Spacing.xs,
  },
  modalSaveText: {
    fontSize: 16,
    color: Colors.green,
    fontFamily: 'Inter-SemiBold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Edit Form
  editPhotoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.sm,
  },
  editPhotoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
  },
  emailText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  emailNote: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
});