import { useEffect, useState, useCallback } from 'react';
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
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation, useFocusEffect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { clientesApi } from '../src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cores locais - usando Colors do theme
const BrandColors = Colors;

interface ProfileData {
  created_at: string;
  email: string;
  foto?: string | null;
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
  const { isAuthenticated, user, logout, loading: authLoading, updateUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    nome: '',
    gosto_comida: '',
    gosto_cor: '',
    gosto_music: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const navigation = useNavigation();

  // Remover header nativo do Expo
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
      
      return () => {
        navigation.setOptions({
          headerShown: undefined,
        });
      };
    }, [navigation])
  );

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
        
        // Usar o nome do usuário do AuthContext OU da API
        const userName = user.nome || apiData.nome || 'Usuário';
        const userPhoto = (apiData.foto && apiData.foto.length > 5) ? apiData.foto : null;

        const profileData: ProfileData = {
          created_at: apiData.created_at || '',
          email: apiData.email || user.email || '',
          foto: userPhoto,
          gosto: apiData.gosto || { comida: '', cor: '', music: '' },
          nome: userName,
          type: apiData.type || 'free',
          updated_at: apiData.updated_at || new Date().toISOString(),
        };
        setProfile(profileData);
        
        // Atualizar editData com o nome correto
        setEditData({
          nome: userName,
          gosto_comida: profileData.gosto.comida || '',
          gosto_cor: profileData.gosto.cor || '',
          gosto_music: profileData.gosto.music || '',
        });
        
        console.log('Perfil carregado com sucesso:', profileData);
      } else {
        // Se não conseguir carregar da API, usar dados do AuthContext
        const profileData: ProfileData = {
          created_at: new Date().toISOString(),
          email: user.email || '',
          foto: null,
          gosto: { comida: '', cor: '', music: '' },
          nome: user.nome || 'Usuário',
          type: 'free',
          updated_at: new Date().toISOString(),
        };
        setProfile(profileData);
        setEditData({
          nome: user.nome || '',
          gosto_comida: '',
          gosto_cor: '',
          gosto_music: '',
        });
        console.log('Usando dados do AuthContext');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback para dados do AuthContext
      const profileData: ProfileData = {
        created_at: new Date().toISOString(),
        email: user?.email || '',
        foto: null,
        gosto: { comida: '', cor: '', music: '' },
        nome: user?.nome || 'Usuário',
        type: 'free',
        updated_at: new Date().toISOString(),
      };
      setProfile(profileData);
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
      setSaving(true);
      
      if (!profile || !user?.id) {
        Alert.alert('Erro', 'Usuário não encontrado');
        return;
      }

      // Validar campos obrigatórios
      if (!editData.nome.trim()) {
        Alert.alert('Atenção', 'O nome é obrigatório');
        setSaving(false);
        return;
      }

      const updatedData = {
        nome: editData.nome.trim(),
        gosto: {
          comida: editData.gosto_comida.trim(),
          cor: editData.gosto_cor.trim(),
          music: editData.gosto_music.trim(),
        },
        updated_at: new Date().toISOString(),
        foto: profile.foto || null,
        email: profile.email,
        type: profile.type,
        created_at: profile.created_at || new Date().toISOString(),
      };

      console.log('Enviando dados para API:', {
        ...updatedData,
        id: user.id
      });

      try {
        // Tentar salvar na API
        const response = await clientesApi.createCliente({
          ...updatedData,
          id: user.id
        });
        
        if (response.success) {
          // Atualizar estado local
          const updatedProfile: ProfileData = {
            ...profile,
            nome: updatedData.nome,
            gosto: updatedData.gosto,
            updated_at: updatedData.updated_at,
          };
          
          setProfile(updatedProfile);
          
          // Atualizar no AuthContext
          await updateUser({
            nome: updatedData.nome,
            gosto: updatedData.gosto,
            updated_at: updatedData.updated_at,
          });
          
          // Salvar também no AsyncStorage para cache
          try {
            await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
          } catch (storageError) {
            console.error('Erro ao salvar no cache:', storageError);
          }
          
          Alert.alert('Sucesso!', 'Perfil atualizado com sucesso!');
          setShowEditModal(false);
          
        } else {
          throw new Error(response.message || 'Erro ao atualizar');
        }
      } catch (apiError: any) {
        console.error('Erro na API, salvando localmente:', apiError);
        
        // Fallback: salvar localmente
        const updatedProfile: ProfileData = {
          ...profile,
          nome: updatedData.nome,
          gosto: updatedData.gosto,
          updated_at: updatedData.updated_at,
        };
        
        setProfile(updatedProfile);
        
        // Atualizar no AuthContext
        await updateUser({
          nome: updatedData.nome,
          gosto: updatedData.gosto,
          updated_at: updatedData.updated_at,
        });
        
        // Salvar no AsyncStorage
        try {
          await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
          Alert.alert('Sucesso!', 'Perfil salvo localmente!');
        } catch (storageError) {
          console.error('Erro ao salvar no cache:', storageError);
          Alert.alert('Aviso', 'Perfil salvo apenas na sessão atual');
        }
        
        setShowEditModal(false);
      }
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil: ' + error.message);
    } finally {
      setSaving(false);
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
        
        // Atualizar perfil com nova foto
        if (profile) {
          const updatedProfile = {
            ...profile,
            foto: newPhotoUri,
            updated_at: new Date().toISOString()
          };
          setProfile(updatedProfile);
          
          // Atualizar no AuthContext
          await updateUser({
            foto: newPhotoUri,
            updated_at: updatedProfile.updated_at,
          });
          
          // Salvar no AsyncStorage
          try {
            await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
          } catch (error) {
            console.error('Erro ao salvar foto no cache:', error);
          }
        }
        
        setUploadingPhoto(false);
        Alert.alert('Sucesso!', 'Foto atualizada!');
      }
    } catch (error) {
      setUploadingPhoto(false);
      Alert.alert('Erro', 'Não foi possível alterar a foto');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return ' - ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch { 
      return 'Data inválida';
    }
  };

  const renderEditModal = () => (
    <Modal 
      visible={showEditModal} 
      animationType="slide" 
      presentationStyle="pageSheet" 
      onRequestClose={() => !saving && setShowEditModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.modalCloseButtonContainer}
            activeOpacity={0.7}
            onPress={() => !saving && setShowEditModal(false)}
            disabled={saving}
          >
            <View style={styles.modalCloseButtonContent}>
              <Text style={[styles.modalCloseText, saving && { opacity: 0.5 }]}>
                Cancelar
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Editar Perfil</Text>
          
          <TouchableOpacity 
            style={styles.modalSaveButtonContainer}
            activeOpacity={0.7}
            onPress={saveProfile}
            disabled={saving}
          >
            <View style={styles.modalSaveButtonContent}>
              {saving ? (
                <ActivityIndicator size="small" color={BrandColors.green} />
              ) : (
                <Text style={styles.modalSaveText}>Salvar</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.editPhotoSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} disabled={uploadingPhoto}>
              {profile?.foto ? (
                <Image source={{ uri: profile.foto }} style={styles.editProfileImage} />
              ) : (
                <View style={[styles.editProfileImage, styles.placeholderCenter]}>
                  <Ionicons name="person" size={50} color={BrandColors.mediumGray} />
                </View>
              )}
              
              <View style={styles.editPhotoOverlay}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color={BrandColors.white} />
                ) : (
                  <Ionicons name="camera" size={24} color={BrandColors.white} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.editPhotoText}>
              {uploadingPhoto ? 'Enviando...' : 'Alterar foto'}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome *</Text>
            <TextInput 
              style={styles.formInput} 
              value={editData.nome} 
              onChangeText={(t) => setEditData({...editData, nome: t})} 
              placeholder="Seu nome" 
              editable={!saving}
            />
            <Text style={styles.formHint}>Obrigatório</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Comida favorita</Text>
            <TextInput 
              style={styles.formInput} 
              value={editData.gosto_comida} 
              onChangeText={(t) => setEditData({...editData, gosto_comida: t})} 
              placeholder="Ex: Pizza, Sushi, Churrasco" 
              editable={!saving}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cor favorita</Text>
            <TextInput 
              style={styles.formInput} 
              value={editData.gosto_cor} 
              onChangeText={(t) => setEditData({...editData, gosto_cor: t})} 
              placeholder="Ex: Azul, Verde, Roxo" 
              editable={!saving}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Música favorita</Text>
            <TextInput 
              style={styles.formInput} 
              value={editData.gosto_music} 
              onChangeText={(t) => setEditData({...editData, gosto_music: t})} 
              placeholder="Ex: Rock, Sertanejo, Eletrônica" 
              editable={!saving}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <Text style={styles.emailText}>{profile?.email || user?.email}</Text>
            <Text style={styles.formHint}>Email não pode ser alterado</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={BrandColors.green} />
            <Text style={styles.infoBoxText}>
              Suas preferências ajudam outras pessoas a conhecerem você melhor!
            </Text>
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
          {comida ? (
            <View style={styles.gostoChip}>
              <Ionicons name="restaurant" size={16} color={BrandColors.green} />
              <Text style={styles.gostoChipText}>{comida}</Text>
            </View>
          ) : null}
          {cor ? (
            <View style={styles.gostoChip}>
              <Ionicons name="color-palette" size={16} color={BrandColors.green} />
              <Text style={styles.gostoChipText}>{cor}</Text>
            </View>
          ) : null}
          {music ? (
            <View style={styles.gostoChip}>
              <Ionicons name="musical-notes" size={16} color={BrandColors.green} />
              <Text style={styles.gostoChipText}>{music}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  if (authLoading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color={BrandColors.green} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header personalizado */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          activeOpacity={0.7}
          onPress={handleBack}
        >
          <View style={styles.backButtonContent}>
            <Ionicons name="chevron-back" size={28} color={BrandColors.black} />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Perfil</Text>
        
        <TouchableOpacity 
          style={styles.editButtonContainer}
          activeOpacity={0.7}
          onPress={handleEditProfile}
        >
          <View style={styles.editButtonContent}>
            <Ionicons name="pencil-outline" size={24} color={BrandColors.black} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={handleEditProfile} 
            activeOpacity={0.9}
          >
            {profile?.foto ? (
              <Image source={{ uri: profile.foto }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderCenter]}>
                <Ionicons name="person" size={60} color={BrandColors.mediumGray} />
              </View>
            )}

            {uploadingPhoto && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={BrandColors.white} size="large" />
              </View>
            )}
            
            <View style={styles.editIconOverlay}>
              <Ionicons name="camera" size={20} color={BrandColors.white} />
            </View>
          </TouchableOpacity>
          
          {/* NOME DO USUÁRIO LOGADO */}
          <Text style={styles.profileName}>
            {user?.nome || profile?.nome || 'Usuário'}
          </Text>
          
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
          
          <View style={styles.accountTypeBadge}>
            <Text style={styles.accountTypeText}>
              {profile?.type === 'free' ? 'Conta Grátis' : 'Premium'}
            </Text>
          </View>
        </View>

        {renderGostos()}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color={BrandColors.gray} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membro desde</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile?.created_at || new Date().toISOString())}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="refresh-outline" size={20} color={BrandColors.gray} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Última atualização</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile?.updated_at || new Date().toISOString())}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Opções</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={22} color={BrandColors.black} />
            </View>
            <Text style={styles.settingText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={18} color={BrandColors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed-outline" size={22} color={BrandColors.black} />
            </View>
            <Text style={styles.settingText}>Privacidade</Text>
            <Ionicons name="chevron-forward" size={18} color={BrandColors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="help-circle-outline" size={22} color={BrandColors.black} />
            </View>
            <Text style={styles.settingText}>Ajuda & Suporte</Text>
            <Ionicons name="chevron-forward" size={18} color={BrandColors.gray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={BrandColors.coral} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>v2.0.3</Text>
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
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
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
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    paddingBottom: 16,
    backgroundColor: BrandColors.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
    minWidth: 60,
    alignItems: 'flex-start',
  },
  backButtonContent: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    fontFamily: 'Montserrat-Bold',
    flex: 1,
    textAlign: 'center',
  },
  editButtonContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  editButtonContent: {
    padding: 4,
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
    backgroundColor: BrandColors.lightGray,
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
  editIconOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: BrandColors.green,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BrandColors.white,
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
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
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
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
  },
  modalCloseButtonContainer: {
    padding: 8,
    minWidth: 80,
  },
  modalCloseButtonContent: {
    padding: 4,
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
  modalSaveButtonContainer: {
    padding: 8,
    minWidth: 80,
  },
  modalSaveButtonContent: {
    padding: 4,
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
    paddingBottom: Spacing.xl,
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
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
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
  formHint: {
    fontSize: 12,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  emailText: {
    fontSize: 16,
    color: BrandColors.black,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: BrandColors.offWhite,
    borderRadius: BorderRadius.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.green,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  infoBoxText: {
    fontSize: 14,
    color: BrandColors.gray,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
});