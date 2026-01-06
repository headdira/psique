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
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme/index';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { clientesApi, UserData, FeedPost, ClienteUpdateData } from '../src/api/api';

interface ProfileData {
  id: string;
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
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostType, setNewPostType] = useState<'photo' | 'interest' | 'activity'>('interest');
  const [editData, setEditData] = useState({
    nome: '',
    gosto_comida: '',
    gosto_cor: '',
    gosto_music: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Removida a verificação duplicada de autenticação
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
      loadUserFeed();
    }
  }, [isAuthenticated, isChecking]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.email) {
        Alert.alert('Erro', 'Email do usuário não encontrado');
        return;
      }

      const response = await clientesApi.getClienteByEmail(user.email);
      
      if (response.success && response.userData) {
        const apiData = response.userData;
        const profileData: ProfileData = {
          id: response.userId,
          created_at: apiData.created_at || '',
          email: apiData.email || '',
          foto: apiData.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
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

  const loadUserFeed = async () => {
    if (!profile?.id) return;
    
    try {
      setLoadingFeed(true);
      const response = await clientesApi.getFeedPosts(profile.id);
      
      if (response.success && response.posts) {
        setFeedPosts(response.posts);
      }
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
    } finally {
      setLoadingFeed(false);
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

      if (!result.canceled && result.assets[0] && profile?.id) {
        setUploadingPhoto(true);
        const imageUri = result.assets[0].uri;
        
        try {
          // Upload para a API
          const response = await clientesApi.uploadFoto(profile.id, imageUri);
          
          if (response.success) {
            // Atualizar perfil localmente
            setProfile(prev => ({
              ...prev!,
              foto: imageUri,
              updated_at: new Date().toISOString(),
            }));
            
            Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
          } else {
            Alert.alert('Erro', 'Não foi possível atualizar a foto');
          }
        } catch (error) {
          console.error('Erro no upload:', error);
          Alert.alert('Erro', 'Falha ao enviar foto para o servidor');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível alterar a foto');
      setUploadingPhoto(false);
    }
  };

  const pickImageForPost = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const createPost = async () => {
    if (!profile?.id || (!newPostText && !selectedImage)) {
      Alert.alert('Atenção', 'Adicione um texto ou imagem para criar um post');
      return;
    }

    try {
      setLoadingFeed(true);
      
      const postData = {
        userId: profile.id,
        text: newPostText,
        type: newPostType,
        image: selectedImage || undefined,
      };

      const response = await clientesApi.createFeedPost(postData);
      
      if (response.success) {
        // Adicionar o novo post à lista
        const newPost: FeedPost = {
          id: response.postId,
          userId: profile.id,
          text: newPostText,
          type: newPostType,
          image: selectedImage || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes: [],
        };
        
        setFeedPosts(prev => [newPost, ...prev]);
        setNewPostText('');
        setSelectedImage(null);
        setShowFeedModal(false);
        Alert.alert('Sucesso', 'Post criado com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível criar o post');
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
      Alert.alert('Erro', 'Falha ao criar post');
    } finally {
      setLoadingFeed(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      if (!profile || !user?.id) {
        Alert.alert('Erro', 'Dados do perfil não encontrados');
        return;
      }

      const updatedData: ClienteUpdateData = {
        id: profile.id,
        email: profile.email,
        nome: editData.nome,
        foto: profile.foto,
        type: profile.type,
        gosto: {
          comida: editData.gosto_comida,
          cor: editData.gosto_cor,
          music: editData.gosto_music,
        },
        created_at: profile.created_at,
        updated_at: new Date().toISOString(),
      };

      const response = await clientesApi.updateCliente(updatedData);
      
      if (response.success) {
        setProfile(prev => ({
          ...prev!,
          nome: editData.nome,
          gosto: {
            comida: editData.gosto_comida,
            cor: editData.gosto_cor,
            music: editData.gosto_music,
          },
          updated_at: updatedData.updated_at,
        }));
        
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        setShowEditModal(false);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil');
      }

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
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

  const renderFeedModal = () => (
    <Modal
      visible={showFeedModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFeedModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowFeedModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Novo Post</Text>
          <TouchableOpacity 
            style={styles.modalSaveButton}
            onPress={createPost}
            disabled={loadingFeed}
          >
            {loadingFeed ? (
              <ActivityIndicator size="small" color={Colors.green} />
            ) : (
              <Text style={styles.modalSaveText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.postTypeSelector}>
            <TouchableOpacity 
              style={[styles.postTypeButton, newPostType === 'interest' && styles.postTypeButtonActive]}
              onPress={() => setNewPostType('interest')}
            >
              <Ionicons 
                name="heart-outline" 
                size={20} 
                color={newPostType === 'interest' ? Colors.white : Colors.gray} 
              />
              <Text style={[
                styles.postTypeText,
                newPostType === 'interest' && styles.postTypeTextActive
              ]}>Interesse</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.postTypeButton, newPostType === 'photo' && styles.postTypeButtonActive]}
              onPress={() => setNewPostType('photo')}
            >
              <Ionicons 
                name="camera-outline" 
                size={20} 
                color={newPostType === 'photo' ? Colors.white : Colors.gray} 
              />
              <Text style={[
                styles.postTypeText,
                newPostType === 'photo' && styles.postTypeTextActive
              ]}>Foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.postTypeButton, newPostType === 'activity' && styles.postTypeButtonActive]}
              onPress={() => setNewPostType('activity')}
            >
              <Ionicons 
                name="bicycle-outline" 
                size={20} 
                color={newPostType === 'activity' ? Colors.white : Colors.gray} 
              />
              <Text style={[
                styles.postTypeText,
                newPostType === 'activity' && styles.postTypeTextActive
              ]}>Atividade</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.red} />
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.postInput}
            placeholder="O que você está pensando ou fazendo?"
            placeholderTextColor={Colors.gray}
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.postActionButton}
              onPress={pickImageForPost}
            >
              <Ionicons name="image-outline" size={22} color={Colors.green} />
              <Text style={styles.postActionText}>Foto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderFeedItem = ({ item }: { item: FeedPost }) => (
    <View style={styles.feedItem}>
      <View style={styles.feedItemHeader}>
        <View style={styles.feedItemUser}>
          <Image 
            source={{ uri: profile?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }}
            style={styles.feedUserImage}
          />
          <View>
            <Text style={styles.feedUserName}>{profile?.nome || 'Usuário'}</Text>
            <Text style={styles.feedItemDate}>
              {formatDate(item.created_at)} • {item.type === 'photo' ? '📸 Foto' : item.type === 'activity' ? '🏃 Atividade' : '❤️ Interesse'}
            </Text>
          </View>
        </View>
      </View>
      
      {item.image && (
        <Image 
          source={{ uri: item.image }}
          style={styles.feedImage}
          resizeMode="cover"
        />
      )}
      
      <Text style={styles.feedText}>{item.text}</Text>
      
      <View style={styles.feedItemFooter}>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={18} color={Colors.gray} />
          <Text style={styles.likeCount}>{item.likes?.length || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header simplificado - removido botão de voltar */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Meu Perfil</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.green]}
            tintColor={Colors.green}
          />
        }
      >
        {/* Informações básicas */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} disabled={uploadingPhoto}>
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
              <View style={styles.changePhotoBadge}>
                <Ionicons name="camera" size={14} color={Colors.white} />
              </View>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{profile?.nome || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          
          <TouchableOpacity 
            style={styles.addToFeedButton}
            onPress={() => setShowFeedModal(true)}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addToFeedText}>Adicionar ao Feed</Text>
          </TouchableOpacity>
        </View>

        {/* Feed do usuário */}
        {feedPosts.length > 0 ? (
          <View style={styles.feedSection}>
            <Text style={styles.sectionTitle}>Meu Feed</Text>
            <FlatList
              data={feedPosts}
              renderItem={renderFeedItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyFeed}>
                  <Ionicons name="newspaper-outline" size={48} color={Colors.lightGray} />
                  <Text style={styles.emptyFeedText}>Nenhum post ainda</Text>
                  <Text style={styles.emptyFeedSubtext}>Compartilhe suas experiências!</Text>
                </View>
              }
            />
          </View>
        ) : (
          <View style={styles.emptyFeedContainer}>
            <Ionicons name="newspaper-outline" size={64} color={Colors.lightGray} />
            <Text style={styles.emptyFeedTitle}>Seu feed está vazio</Text>
            <Text style={styles.emptyFeedDescription}>
              Compartilhe fotos, interesses e atividades com seus amigos
            </Text>
            <TouchableOpacity 
              style={styles.emptyFeedButton}
              onPress={() => setShowFeedModal(true)}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.emptyFeedButtonText}>Criar primeiro post</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão de logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.red} />
          <Text style={[styles.logoutText, { color: Colors.red }]}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Versão 2.0.0</Text>
          <Text style={styles.footerText}>Psique App © 2024</Text>
        </View>
      </ScrollView>

      {renderFeedModal()}
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
  headerLeft: {
    width: 40, // Para centralizar o título
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  editButton: {
    padding: Spacing.xs,
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
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.green,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
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
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: Spacing.lg,
  },
  addToFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addToFeedText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },

  // Feed Section
  feedSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  emptyFeedContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  emptyFeedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyFeedDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  emptyFeedButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },

  // Feed Item
  feedItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  feedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  feedItemUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  feedUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  feedUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
  },
  feedItemDate: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  feedImage: {
    width: '100%',
    height: 200,
  },
  feedText: {
    fontSize: 15,
    color: Colors.black,
    lineHeight: 22,
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  feedItemFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  likeCount: {
    fontSize: 14,
    color: Colors.gray,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  modalSaveButton: {
    padding: Spacing.xs,
    minWidth: 60,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    color: Colors.green,
    fontWeight: '600',
  },

  // Post Modal
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  postTypeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  postTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  postTypeButtonActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  postTypeText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  postTypeTextActive: {
    color: Colors.white,
  },
  selectedImageContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  postInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.black,
    minHeight: 120,
    marginBottom: Spacing.lg,
  },
  postActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  postActionText: {
    fontSize: 14,
    color: Colors.green,
    fontWeight: '500',
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
    borderColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
    color: Colors.gray,
  },
});