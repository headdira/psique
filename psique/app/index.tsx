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
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme';

// Importando os estilos separados
import { styles } from './index.styles'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();

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
    if (!email.trim()) {
      setError('Digite seu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Digite um email válido');
      return;
    }

    setLocalLoading(true);
    setError(null);

    try {
      const result = await login(email);
      
      if (!result.success) {
        setError(result.message || 'Email não encontrado');
        
        if (result.message?.includes('não encontrado') || result.message?.includes('criar')) {
          Alert.alert(
            'Email não cadastrado',
            'Deseja criar uma conta com este email?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Criar conta', 
                onPress: () => {
                  Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
                }
              }
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError('Erro ao fazer login');
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
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
      console.error('Erro no login com Google:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar senha',
      'Entre em contato com o suporte para recuperar sua conta.',
      [{ text: 'OK' }]
    );
  };

  const isLoading = localLoading || authLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
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
              
              <Text style={styles.description}>
                Entre com seu email pra{'\n'}encontrar rolês incríveis.
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.gray + '70'}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading && !authLoading ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <Text style={styles.buttonText}>Entrar com email</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.orContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity 
                style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {authLoading ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <>
                    <View style={styles.googleIcon}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Entrar com Google</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <Text style={styles.call}>
                Vem viver a vida offline.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotText}>Esqueceu sua conta?</Text>
            </TouchableOpacity>
            
            <Text style={styles.footer}>
              Conexões reais • Intenção real
            </Text>
            
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}