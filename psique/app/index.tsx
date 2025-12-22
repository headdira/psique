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
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContexts';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated, loading: authLoading } = useAuth();

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
      
      if (result.success) {
        // Redirecionamento automático via useEffect
      } else {
        setError(result.message || 'Email não encontrado');
        
        if (result.message?.includes('não encontrado')) {
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
      setGoogleLoading(true);
      // Implementar lógica de login com Google aqui
      Alert.alert('Em breve', 'Login com Google em desenvolvimento');
    } catch (error) {
      console.error('Erro no login com Google:', error);
      Alert.alert('Erro', 'Não foi possível fazer login com Google');
    } finally {
      setGoogleLoading(false);
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
            
            {/* Cabeçalho minimalista */}
            <View style={styles.header}>
              <Text style={styles.logo}>psique</Text>
            </View>
            
            {/* Conteúdo central */}
            <View style={styles.center}>
              <Text style={styles.tagline}>Vida real acima de aparência</Text>
              
              <View style={styles.hero}>
                <Text style={styles.heroLine1}>Rolê é o</Text>
                <Text style={styles.heroLine2}>novo match.</Text>
              </View>
              
              <Text style={styles.description}>
                Entre com seu email pra{'\n'}encontrar rolês incríveis.
              </Text>
              
              {/* Campo de email */}
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
                  editable={!isLoading && !googleLoading}
                  autoFocus
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>
              
              {/* Botão de login com email */}
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading || googleLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <Text style={styles.buttonText}>Entrar com email</Text>
                )}
              </TouchableOpacity>
              
              {/* Divisor */}
              <View style={styles.orContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>
              
              {/* Botão de login com Google */}
              <TouchableOpacity 
                style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
                onPress={handleGoogleLogin}
                disabled={googleLoading || isLoading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
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
            
            {/* Link para recuperação (sutil) */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              disabled={isLoading || googleLoading}
            >
              <Text style={styles.forgotText}>Esqueceu sua conta?</Text>
            </TouchableOpacity>
            
            {/* Footer */}
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
    fontFamily: 'Inter-Light',
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
    fontFamily: 'Inter-Bold',
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