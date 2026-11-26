import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Configuração de conexão com o projeto Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBr3X7sXFENpDE36u_7z4jKdGyvwIeUVHI',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aetherduo-d8008.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'aetherduo-d8008',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aetherduo-d8008.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '578359352139',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:578359352139:web:375b4053910ea3ab0be6ce',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-EYL0NE8ME6',
};

// Verifica se as credenciais do Firebase foram preenchidas
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'SUA_API_KEY_AQUI' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'aetherduo-projeto'
);

// Inicializa o app Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configura persistência no AsyncStorage para React Native e padrão do navegador na Web
function createAuth(): firebaseAuth.Auth {
  if (Platform.OS === 'web') {
    return firebaseAuth.getAuth(app);
  }
  const getRnPersistence = (firebaseAuth as Record<string, unknown>).getReactNativePersistence as
    | ((storage: typeof AsyncStorage) => firebaseAuth.Persistence)
    | undefined;
  if (getRnPersistence) {
    try {
      return firebaseAuth.initializeAuth(app, {
        persistence: getRnPersistence(AsyncStorage),
      });
    } catch {
      return firebaseAuth.getAuth(app);
    }
  }
  return firebaseAuth.getAuth(app);
}

// Instâncias de autenticação e banco de dados Firestore
export const auth = createAuth();
export const db = getFirestore(app);
