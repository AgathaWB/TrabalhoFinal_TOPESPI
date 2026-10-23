import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { confirmAction, notify } from '../alert';
import { Button, Card, ProgressBar } from '../components';
import {
  acceptInvite,
  cancelInvite,
  declineInvite,
  leaveDuo,
  sendInvite,
  sendNudge,
  useChecks,
  useHabits,
  useIncomingInvites,
  useNudgeSent,
  useOutgoingInvites,
  usePartner,
} from '../data';
import { colors } from '../theme';
import { Profile } from '../types';

export default function DuoScreen({ profile, today }: { profile: Profile; today: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Sua dupla</Text>
      {profile.partnerUid ? (
        <PartnerPanel profile={profile} partnerUid={profile.partnerUid} today={today} />
      ) : (
        <ConnectPanel profile={profile} />
      )}
    </ScrollView>
  );
}

/*ainda sem dupla: convidar / aceitar */
function ConnectPanel({ profile }: { profile: Profile }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const incoming = useIncomingInvites(profile.emailLower);
  const outgoing = useOutgoingInvites(profile.uid);

  async function invite() {
    setBusy(true);
    try {
      await sendInvite(profile, email);
      setEmail('');
    } catch (e) {
      notify('Não foi possível convidar', e instanceof Error ? e.message : 'Tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <Text style={styles.sub}>Convide um amigo pelo e-mail que ele usou para criar a conta.</Text>

      <Card style={{ marginBottom: 16 }}>
        <TextInput
          style={styles.input}
          placeholder="E-mail do amigo"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <Button title="Enviar convite" onPress={invite} disabled={busy || !email.includes('@')} />
      </Card>

      {incoming.length > 0 && <Text style={styles.section}>Convites recebidos</Text>}
      {incoming.map((inv) => (
        <Card key={inv.id} style={{ marginBottom: 10 }}>
          <Text style={styles.cardTitle}>{inv.fromEmail} quer formar dupla com você</Text>
          <View style={styles.row}>
            <Button
              title="Aceitar"
              onPress={() => acceptInvite(profile, inv).catch((e) => notify('Erro', String(e)))}
              style={{ flex: 1 }}
            />
            <Button title="Recusar" variant="danger" onPress={() => declineInvite(inv.id)} style={{ flex: 1 }} />
          </View>
        </Card>
      ))}

      {outgoing.length > 0 && <Text style={styles.section}>Convites enviados</Text>}
      {outgoing.map((inv) => (
        <Card key={inv.id} style={{ marginBottom: 10 }}>
          <Text style={styles.cardTitle}>Aguardando {inv.toEmail}…</Text>
          <Button title="Cancelar convite" variant="danger" onPress={() => cancelInvite(inv.id)} />
        </Card>
      ))}
    </View>
  );
}

/*com dupla: painel do amigo  */
function PartnerPanel({ profile, partnerUid, today }: { profile: Profile; partnerUid: string; today: string }) {
  const partner = usePartner(partnerUid);
  const habits = useHabits(partnerUid);
  const checked = useChecks(partnerUid, today);
  const nudgeSent = useNudgeSent(profile.uid, partnerUid, today);

  const done = habits.filter((h) => checked.has(h.id)).length;
  const allDone = habits.length > 0 && done === habits.length;

  function confirmLeave() {
    confirmAction('Desfazer dupla', 'Vocês deixam de ver o progresso um do outro.', 'Desfazer', () => leaveDuo(profile));
  }

  return (
    <View>
      <Text style={styles.sub}>{partner?.email ?? 'Carregando…'}</Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.big}>
          {habits.length === 0
            ? 'Seu amigo ainda não cadastrou hábitos'
            : `Seu amigo concluiu ${done} de ${habits.length} hábitos hoje`}
        </Text>
        <ProgressBar done={done} total={habits.length} color={colors.gold} />
        {allDone && <Text style={styles.congrats}>Missão cumprida por hoje! 🏔️</Text>}
      </Card>

      {habits.map((h) => {
        const ok = checked.has(h.id);
        return (
          <View key={h.id} style={styles.partnerHabit}>
            <Text style={{ fontSize: 18 }}>{ok ? '✅' : '⬜'}</Text>
            <Text style={[styles.partnerHabitText, ok && { color: colors.muted }]}>{h.title}</Text>
          </View>
        );
      })}

      <Button
        title={nudgeSent ? 'Empurrão enviado hoje ✓' : '👋 Dar um empurrão'}
        variant="gold"
        disabled={nudgeSent || allDone || habits.length === 0}
        onPress={() => sendNudge(profile, partnerUid, today).catch((e) => notify('Erro', String(e)))}
        style={{ marginTop: 16 }}
      />
      <Button title="Desfazer dupla" variant="danger" onPress={confirmLeave} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  section: { fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 6 },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '600', color: colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  big: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  congrats: { marginTop: 10, color: colors.success, fontWeight: '700' },
  partnerHabit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerHabitText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
});
