import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Expo Router v3 usa essa abordagem
export default function App() {
  // @ts-ignore - Expo Router fornece o contexto
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

// Registra o componente principal
registerRootComponent(App);