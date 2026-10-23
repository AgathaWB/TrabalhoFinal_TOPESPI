import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { confirmAction, notify } from '../alert';
import { signOut } from '../auth';
import { Button, Card, ProgressBar } from '../components';
import { prettyToday } from '../dates';
import { addHabit, markNudgeSeen, removeHabit, setChecked, useChecks, useHabits, useIncomingNudges } from '../data';
import { colors } from '../theme';
import { Profile } from '../types';

export default function HabitsScreen({ profile, today }: { profile: Profile; today: string }) {
  const habits = useHabits(profile.uid);
  const checked = useChecks(profile.uid, today);
  const nudges = useIncomingNudges(profile.uid, today);
  const [title, setTitle] = useState('');

  const done = habits.filter((h) => checked.has(h.id)).length;

  async function add() {
    const t = title.trim();
    if (!t) return;
    setTitle('');
    await addHabit(profile.uid, t).catch((e) => notify('Erro', String(e)));
  }

  function confirmRemove(id: string, name: string) {
    confirmAction('Remover hábito', `Apagar "${name}"?`, 'Apagar', () => removeHabit(id));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.date}>{prettyToday()}</Text>
                <Text style={styles.h1}>Seus hábitos</Text>
              </View>
              <Button title="Sair" variant="ghost" onPress={signOut} style={{ paddingHorizontal: 8 }} />
            </View>

            {nudges.map((n) => (
              <Pressable key={n.id} onPress={() => markNudgeSeen(n.id)} style={styles.nudge}>
                <Text style={styles.nudgeText}>
                   {n.fromEmail} te deu um empurrão! Bora marcar seus hábitos. (toque para dispensar)
                </Text>
              </Pressable>
            ))}

            <Card style={{ marginBottom: 16 }}>
              <Text style={styles.progressText}>
                {habits.length === 0 ? 'Cadastre seu primeiro hábito abaixo' : `${done} de ${habits.length} concluídos hoje`}
              </Text>
              <ProgressBar done={done} total={habits.length} />
              {habits.length > 0 && done === habits.length && <Text style={styles.congrats}>Dia completo! ✨</Text>}
            </Card>
          </View>
        }
        renderItem={({ item }) => {
          const isDone = checked.has(item.id);
          return (
            <Pressable
              onPress={() => setChecked(profile.uid, item.id, today, !isDone)}
              onLongPress={() => confirmRemove(item.id, item.title)}
              style={[styles.habit, isDone && styles.habitDone]}
            >
              <View style={[styles.circle, isDone && styles.circleDone]}>{isDone && <Text style={styles.tick}>✓</Text>}</View>
              <Text style={[styles.habitText, isDone && styles.habitTextDone]}>{item.title}</Text>
            </Pressable>
          );
        }}
        ListFooterComponent={habits.length > 0 ? <Text style={styles.hint}>Segure um hábito para apagá-lo</Text> : null}
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Novo hábito (ex: beber 2L de água)"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Button title="+" onPress={add} disabled={!title.trim()} style={{ paddingHorizontal: 22 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  date: { color: colors.muted, fontWeight: '600' },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  nudge: { backgroundColor: colors.goldSoft, borderRadius: 14, padding: 14, marginBottom: 12 },
  nudgeText: { color: colors.text, fontWeight: '600' },
  progressText: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  congrats: { marginTop: 10, color: colors.success, fontWeight: '700' },
  habit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitDone: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  circleDone: { backgroundColor: colors.success, borderColor: colors.success },
  tick: { color: '#fff', fontWeight: '800' },
  habitText: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },
  habitTextDone: { color: colors.muted, textDecorationLine: 'line-through' },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 6 },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
});
