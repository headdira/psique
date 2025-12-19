// Se quiser algo mais limpo, aqui está uma versão minimalista:

import { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        window.open('https://borababy.netlify.app/auth', '_blank');
        return;
      }
      
      await WebBrowser.openBrowserAsync('https://borababy.netlify.app/auth');
      
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível abrir a página de login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
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
            Encontros reais pra quem cansou{'\n'}da superficialidade.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.call}>
            Vem viver a vida offline.
          </Text>
        </View>
        
        {/* Botão */}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.buttonText}>Entrar na vibe</Text>
          )}
        </TouchableOpacity>
        
        {/* Footer */}
        <Text style={styles.footer}>
          Conexões reais • Intenção real
        </Text>
        
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  header: {
    marginTop: Spacing.xl,
  },
  logo: {
    ...Typography.h1,
    color: Colors.black,
    letterSpacing: -1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    ...Typography.caption,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xxl,
  },
  hero: {
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.xl,
  },
  divider: {
    width: 100,
    height: 2,
    backgroundColor: Colors.black,
    marginVertical: Spacing.xl,
  },
  call: {
    ...Typography.body,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.green,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.black,
    fontSize: 18,
  },
  footer: {
    ...Typography.caption,
    color: Colors.gray,
    textAlign: 'center',
  },
});