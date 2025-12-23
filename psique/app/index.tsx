import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme';
import { styles } from './index.styles'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o Modal de Recuperação
  const [modalVisible, setModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  
  const { login, loginWithGoogle, signup, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace('/HomeScreen');
    }
  }, [isAuthenticated]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim()) { setError('Digite seu email'); return; }
    if (!validateEmail(email)) { setError('Digite um email válido'); return; }

    setLocalLoading(true);
    setError(null);

    try {
      const result = await login(email);
      if (!result.success) {
        setError(result.message || 'Email não encontrado');
      }
    } catch (error: any) {
      setError('Erro ao fazer login');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.message !== 'Login cancelado ou falhou') {
        Alert.alert('Atenção', result.message || 'Não foi possível entrar com Google');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  const handleSignup = async () => {
    try {
      const result = await signup();
      if (!result.success && result.message !== 'Operação cancelada ou falhou') {
        Alert.alert('Atenção', result.message || 'Erro no cadastro');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao abrir o cadastro');
    }
  };

  const openRecoveryModal = () => {
    setRecoveryEmail(email);
    setModalVisible(true);
  };

  const handleSendRecovery = async () => {
    if (!recoveryEmail.trim() || !validateEmail(recoveryEmail)) {
      Alert.alert('Ops', 'Digite um e-mail válido.');
      return;
    }

    setRecoveryLoading(true);

    setTimeout(() => {
      setRecoveryLoading(false);
      setModalVisible(false);
      Alert.alert(
        'E-mail enviado! 📧',
        `Enviamos um link de recuperação para ${recoveryEmail}. Verifique sua caixa de entrada e spam.`
      );
    }, 1500);
  };

  const isLoading = localLoading || authLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>psique</Text>
            </View>
            
            <View style={styles.center}>
              <Text style={styles.tagline}>Vida real acima de aparência</Text>
              
              <View style={styles.hero}>
                <Text style={styles.heroLine1}>Rolê é o</Text>
                <Text style={styles.heroLine2}>novo match.</Text>
              </View>
              
              <Text style={styles.description}>Entre com seu email pra{'\n'}encontrar rolês incríveis.</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.gray + '70'}
                  value={email}
                  onChangeText={(text) => { setEmail(text); setError(null); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>
              
              {/* Botão Entrar */}
              <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
                {isLoading && !authLoading ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.buttonText}>Entrar com email</Text>}
              </TouchableOpacity>

              {/* Link Cadastrar */}
              <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading}>
                <Text style={styles.signupText}>
                  Não tem uma conta? <Text style={styles.signupTextBold}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>

              {/* Link Esqueci a senha */}
              <TouchableOpacity style={styles.forgotButtonInline} onPress={openRecoveryModal} disabled={isLoading}>
                <Text style={styles.forgotTextInline}>Esqueceu a senha?</Text>
              </TouchableOpacity>
              
              <View style={styles.orContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>
              
              {/* Botão Google */}
              <TouchableOpacity style={[styles.googleButton, isLoading && styles.buttonDisabled]} onPress={handleGoogleLogin} disabled={isLoading} activeOpacity={0.8}>
                {authLoading ? <ActivityIndicator color={Colors.black} /> : (
                  <>
                    <View style={styles.googleIcon}><Text style={styles.googleIconText}>G</Text></View>
                    <Text style={styles.googleButtonText}>Entrar com Google</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <Text style={styles.call}>Vem viver a vida offline.</Text>
            </View>
            
            <Text style={styles.footer}>Conexões reais • Intenção real</Text>
          </View>
          
          {/* MODAL DE RECUPERAÇÃO */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Recuperar Senha</Text>
                <Text style={styles.modalText}>Digite seu e-mail para receber um link de redefinição.</Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.gray + '70'}
                  value={recoveryEmail}
                  onChangeText={setRecoveryEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]} 
                    onPress={handleSendRecovery}
                    disabled={recoveryLoading}
                  >
                    {recoveryLoading ? (
                      <ActivityIndicator color={Colors.black} size="small" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Enviar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}