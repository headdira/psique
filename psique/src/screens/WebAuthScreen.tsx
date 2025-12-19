import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WebAuthScreen() {
  const [loading, setLoading] = useState(true);

  // URL da sua página de autenticação
  const authUrl = 'https://borababy.netlify.app/auth';

  // Função para capturar navegação
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    console.log('Navegando para:', url);
    
    // Verifica se é um redirecionamento de sucesso
    if (url.includes('/auth/success') || url.includes('token=')) {
      try {
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        
        if (token) {
          // Salva o token e navega para Home
          AsyncStorage.setItem('@dating-app:token', token)
            .then(() => {
              console.log('Token salvo com sucesso');
              router.replace('./Home'); // Usa replace para não voltar
            })
            .catch(error => {
              console.error('Erro ao salvar token:', error);
              router.replace('./Home');
            });
        } else {
          router.replace('./Home');
        }
      } catch (error) {
        console.error('Erro ao processar URL:', error);
        router.replace('./Home');
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: authUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5864" />
          </View>
        )}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF5864" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});