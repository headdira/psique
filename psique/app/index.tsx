import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
// CORREÇÃO: Usando a biblioteca certa para Safe Area
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// CORREÇÃO: Caminho apontando para src
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
  },
  logo: {
    ...Typography.h1,
    color: Colors.black,
    letterSpacing: -1,
    fontSize: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xxl * 1.5,
  },
  hero: {
    marginBottom: Spacing.xl * 1.5,
  },
  heroLine1: {
    fontSize: 56,
    fontWeight: '300',
    fontFamily: 'Inter-Regular', 
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 56,
  },
  heroLine2: {
    fontSize: 56,
    fontWeight: '900',
    fontFamily: 'Montserrat-Bold',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: -2,
  },
  description: {
    ...Typography.body,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl * 1.5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.black,
    height: 52,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF6B6B',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.green,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    width: '100%',
  },
  buttonText: {
    ...Typography.button,
    color: Colors.black,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  orText: {
    ...Typography.caption,
    color: Colors.gray,
    marginHorizontal: Spacing.md,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  googleIconText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    ...Typography.button,
    color: Colors.black,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    width: 80,
    height: 1,
    backgroundColor: Colors.black,
    marginVertical: Spacing.xl,
    opacity: 0.2,
  },
  call: {
    ...Typography.body,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  forgotButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  forgotText: {
    ...Typography.caption,
    color: Colors.gray,
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  footer: {
    ...Typography.caption,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
});