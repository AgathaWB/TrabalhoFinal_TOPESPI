import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './src/auth';
import { useToday } from './src/dates';
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
      </View>
    );
  }
  if (!user) return <AuthScreen />;
  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted, textAlign: 'center', padding: 24 }}>
          Não consegui carregar seu perfil. Confira as regras do Firestore e a conexão.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        {tab === 'habits' ? (
          <HabitsScreen profile={profile} today={today} />
        ) : (
          <DuoScreen profile={profile} today={today} />
        )}
      </View>
      <View style={styles.tabs}>
        <TabButton label="Hábitos" active={tab === 'habits'} onPress={() => setTab('habits')} />
        <TabButton label="✦ Dupla" active={tab === 'duo'} onPress={() => setTab('duo')} />
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


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 8,
    gap: 8,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primarySoft },
  tabText: { fontWeight: '700', color: colors.muted },
  tabTextActive: { color: colors.primary },
});
