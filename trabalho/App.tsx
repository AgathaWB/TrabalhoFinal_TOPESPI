import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, signOut, useAuth } from './src/auth';
import { useToday } from './src/dates';
import { isFirebaseConfigured } from './src/firebase';
import AuthScreen from './src/screens/AuthScreen';
import DuoScreen from './src/screens/DuoScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import { colors } from './src/theme';

function Root() {
  const { user, profile, loading } = useAuth();
  const today = useToday();
  const [tab, setTab] = useState<'habits' | 'duo'>('habits');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.muted }}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Carregando perfil...
        </Text>
        <Text style={{ color: colors.muted, textAlign: 'center', paddingHorizontal: 24, marginBottom: 20 }}>
          Se demorar muito, confira a conexão com a internet e as regras do Firestore.
        </Text>
        <Pressable
          onPress={() => signOut()}
          style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Voltar para o Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {!isFirebaseConfigured && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
             Firebase não configurado.
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {tab === 'habits' ? (
          <HabitsScreen profile={profile} today={today} />
        ) : (
          <DuoScreen profile={profile} today={today} />
        )}
      </View>

      <View style={styles.tabs}>
        <View style={styles.tabsInner}>
          <TabButton label="Hábitos" active={tab === 'habits'} onPress={() => setTab('habits')} />
          <TabButton label="✦ Dupla" active={tab === 'duo'} onPress={() => setTab('duo')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  banner: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
  },
  bannerText: {
    color: '#8A5D00',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  tabs: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabsInner: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primarySoft },
  tabText: { fontWeight: '700', color: colors.muted },
  tabTextActive: { color: colors.primary },
});
