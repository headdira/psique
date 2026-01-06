import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { clientesApi, UserData } from '../src/api/api';

// Cores locais
const BrandColors = {
  black: '#0E0E0E',
  gray: '#2B2B2B',
  offWhite: '#F5F4F2',
  green: '#5FF0A9',
  lilac: '#C7B5FF',
  coral: '#FF6B6B', 
  white: '#FFFFFF',
  lightGray: '#E5E5E5',
  mediumGray: '#888888' // Cor para o ícone de placeholder
};

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
      if (!user?.email) return;

      const response = await clientesApi.getClienteByEmail(user.email);
      
      if (response.success && response.userData) {
        const apiData = response.userData;
        const profileData: ProfileData = {
          created_at: apiData.created_at || '',
          email: apiData.email || '',
          // Se não tiver foto, deixa undefined para ativar o ícone de fallback
          foto: apiData.foto || undefined, 
          gosto: apiData.gosto || { comida: '', cor: '', music: '' },
          nome: apiData.nome || 'Usuário',
          type: apiData.type || 'free',
          updated_at: apiData.updated_at || '',
        };
        setProfile(profileData);
        
        setEditData({
          nome: profileData.nome,
          gosto_comida: profileData.gosto.comida || '',
          gosto_cor: profileData.gosto.cor || '',
          gosto_music: profileData.gosto.music || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Erro ao sair:", error);
            } finally {
              router.dismissAll();
              router.replace('/');
            }
          },
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
      if (!profile || !user?.id) return;

      const updatedData = {
        nome: editData.nome,
        gosto: {
          comida: editData.gosto_comida,
          cor: editData.gosto_cor,
          music: editData.gosto_music,
        },
        updated_at: new Date().toISOString(),
      };

      try {
        const response = await clientesApi.createCliente({
          ...updatedData,
          id: user.id,
          email: profile.email,
          type: profile.type,
          created_at: profile.created_at,
        });
        
        if (response.success) {
          setProfile(prev => ({ ...prev!, ...updatedData, updated_at: updatedData.updated_at }));
          Alert.alert('Sucesso', 'Perfil atualizado!');
          setShowEditModal(false);
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar');
        }
      } catch (apiError) {
        setProfile(prev => ({ ...prev!, ...updatedData, updated_at: updatedData.updated_at }));
        Alert.alert('Aviso', 'Perfil salvo localmente');
        setShowEditModal(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
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
        const newPhotoUri = result.assets[0].uri;
        setTimeout(() => {
          setProfile(prev => ({ ...prev!, foto: newPhotoUri }));
          setUploadingPhoto(false);
        }, 1000);
      }
    } catch (error) {
      setUploadingPhoto(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return ' - ';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch { return dateString; }
  };

  const renderEditModal = () => (
    <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditModal(false)}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowEditModal(false)}>
            <Text style={styles.modalCloseText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Editar Perfil</Text>
          <TouchableOpacity style={styles.modalSaveButton} onPress={saveProfile}>
            <Text style={styles.modalSaveText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.editPhotoSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarEditWrapper}>
              {profile?.foto ? (
                <Image source={{ uri: profile.foto }} style={styles.editProfileImage} />
              ) : (
                <View style={[styles.editProfileImage, styles.placeholderCenter]}>
                  <Ionicons name="person" size={50} color={BrandColors.mediumGray} />
                </View>
              )}
              <View style={styles.editPhotoOverlay}><Ionicons name="camera" size={24} color={BrandColors.white} /></View>
            </TouchableOpacity>
            <Text style={styles.editPhotoText}>Alterar foto</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome</Text>
            <TextInput style={styles.formInput} value={editData.nome} onChangeText={(t) => setEditData({...editData, nome: t})} placeholder="Seu nome" />
          </View>
          <View style={styles.formGroup}><Text style={styles.formLabel}>Comida favorita</Text><TextInput style={styles.formInput} value={editData.gosto_comida} onChangeText={(t) => setEditData({...editData, gosto_comida: t})} placeholder="Ex: Pizza" /></View>
          <View style={styles.formGroup}><Text style={styles.formLabel}>Cor favorita</Text><TextInput style={styles.formInput} value={editData.gosto_cor} onChangeText={(t) => setEditData({...editData, gosto_cor: t})} placeholder="Ex: Azul" /></View>
          <View style={styles.formGroup}><Text style={styles.formLabel}>Música favorita</Text><TextInput style={styles.formInput} value={editData.gosto_music} onChangeText={(t) => setEditData({...editData, gosto_music: t})} placeholder="Ex: Eletrônica" /></View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <Text style={styles.emailText}>{profile?.email}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderGostos = () => {
    if (!profile?.gosto) return null;
    const { comida, cor, music } = profile.gosto;
    if (!comida && !cor && !music) return null;

    return (
      <View style={styles.gostosSection}>
        <Text style={styles.sectionTitle}>Gostos</Text>
        <View style={styles.gostosGrid}>
          {comida ? <View style={styles.gostoChip}><Ionicons name="restaurant" size={16} color={BrandColors.green} /><Text style={styles.gostoChipText}>{comida}</Text></View> : null}
          {cor ? <View style={styles.gostoChip}><Ionicons name="color-palette" size={16} color={BrandColors.green} /><Text style={styles.gostoChipText}>{cor}</Text></View> : null}
          {music ? <View style={styles.gostoChip}><Ionicons name="musical-notes" size={16} color={BrandColors.green} /><Text style={styles.gostoChipText}>{music}</Text></View> : null}
        </View>
      </View>
    );
  };

  if (authLoading || isChecking) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={BrandColors.green} /></View>;
  if (!isAuthenticated) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={BrandColors.green} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={BrandColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil-outline" size={24} color={BrandColors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ÁREA DA FOTO DE PERFIL */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleEditProfile} activeOpacity={0.9}>
            
            {/* LÓGICA DO ÍCONE DE FALLBACK SE NÃO TIVER FOTO */}
            {profile?.foto ? (
              <Image 
                source={{ uri: profile.foto }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderCenter]}>
                <Ionicons name="person" size={60} color={BrandColors.mediumGray} />
              </View>
            )}

            {uploadingPhoto && <View style={styles.uploadingOverlay}><ActivityIndicator color={BrandColors.white} /></View>}
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{profile?.nome || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <View style={styles.accountTypeBadge}>
            <Text style={styles.accountTypeText}>{profile?.type === 'free' ? 'Conta Grátis' : 'Premium'}</Text>
          </View>
        </View>

        {renderGostos()}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}><Ionicons name="calendar-outline" size={20} color={BrandColors.gray} /></View>
            <View style={styles.infoContent}><Text style={styles.infoLabel}>Membro desde</Text><Text style={styles.infoValue}>{formatDate(profile?.created_at || '')}</Text></View>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}><Ionicons name="refresh-outline" size={20} color={BrandColors.gray} /></View>
            <View style={styles.infoContent}><Text style={styles.infoLabel}>Última atualização</Text><Text style={styles.infoValue}>{formatDate(profile?.updated_at || '')}</Text></View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Opções</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}><Ionicons name="notifications-outline" size={22} /></View>
            <Text style={styles.settingText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={18} color={BrandColors.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}><Ionicons name="lock-closed-outline" size={22} /></View>
            <Text style={styles.settingText}>Privacidade</Text>
            <Ionicons name="chevron-forward" size={18} color={BrandColors.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}><Ionicons name="help-circle-outline" size={22} /></View>
            <Text style={styles.settingText}>Ajuda & Suporte</Text>
            <Ionicons name="chevron-forward" size={18} color={BrandColors.gray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={BrandColors.coral} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>v2.0.2</Text>
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.offWhite,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightGray,
    backgroundColor: BrandColors.offWhite,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    fontFamily: 'Montserrat-Bold',
  },
  editButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
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
    borderColor: BrandColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: BrandColors.lightGray, // Garante que o círculo exista mesmo sem foto
  },
  placeholderCenter: {
    justifyContent: 'center',
    alignItems: 'center',
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
    color: BrandColors.black,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  accountTypeBadge: {
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.green,
    borderRadius: BorderRadius.sm,
  },
  accountTypeText: {
    fontSize: 14,
    color: BrandColors.green,
    fontFamily: 'Inter-Medium',
  },
  gostosSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Spacing.md,
  },
  gostosGrid: {
    gap: Spacing.sm,
  },
  gostoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
    gap: Spacing.sm,
  },
  gostoChipText: {
    fontSize: 16,
    color: BrandColors.black,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
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
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: BrandColors.black,
    fontFamily: 'Inter-Medium',
  },
  settingsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
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
    color: BrandColors.black,
    fontFamily: 'Inter-Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.coral,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: BrandColors.coral,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  versionText: {
    fontSize: 13,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightGray,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalCloseText: {
    fontSize: 16,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    fontFamily: 'Montserrat-Bold',
  },
  modalSaveButton: {
    padding: Spacing.xs,
  },
  modalSaveText: {
    fontSize: 16,
    color: BrandColors.green,
    fontFamily: 'Inter-SemiBold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  editPhotoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.sm,
    backgroundColor: BrandColors.lightGray,
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
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
  },
  avatarEditWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.black,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  formInput: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: BrandColors.black,
    fontFamily: 'Inter-Regular',
  },
  emailText: {
    fontSize: 16,
    color: BrandColors.black,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  emailNote: {
    fontSize: 13,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
  },
});