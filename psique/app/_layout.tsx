import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
// CORREÇÃO: Adicionado '../src/' e removido o 's' do final do arquivo
import { AuthProvider } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.offWhite 
      }}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={Colors.offWhite} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.offWhite,
          },
          headerTintColor: Colors.black,
          headerTitleStyle: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.offWhite,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="HomeScreen" 
          options={{ 
            headerShown: false,
            // Isso previne voltar para o login com gesto de arrastar
            gestureEnabled: false 
          }} 
        />
        {/* Caso o arquivo se chame home.tsx (minúsculo), mantenha esta linha também */}
        <Stack.Screen 
          name="home" 
          options={{ 
            title: 'psique',
            headerBackVisible: false,
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}