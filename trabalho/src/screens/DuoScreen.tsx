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

export default function DuoScreen({ profile, today }: { profile: Profile; today: string }) {//data, propriedades e perfil 
  return (//visual 
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"> //rodagem e adaptação (fecha o teclado tbm)
      <Text style={styles.h1}>Sua dupla</Text> 
      {profile.partnerUid ? (//verificação se há parceria
        <PartnerPanel profile={profile} partnerUid={profile.partnerUid} today={today} /> //renderiza se tiver 
      ) : (
        <ConnectPanel profile={profile} /> //renderiza 
      )}
    </ScrollView>
  );
}

// Painel de convites quando o usuário ainda não tem dupla
function ConnectPanel({ profile }: { profile: Profile }) {//declara componente connectPanel para qm não tem duo
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);//Block vários clicks depois de enviar email 
  const incoming = useIncomingInvites(profile.emailLower); //procura no db os convites recebidos desse e-mail 
  const outgoing = useOutgoingInvites(profile.uid);//procura no db os convites enviados desse e-mail

  async function invite() {//enviar convite 
    setBusy(true);
    try {//tentativa segura 
      await sendInvite(profile, email);//envia
      setEmail('');
    } catch (e) {//pop-up aviso de erro
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

      {incoming.length > 0 && <Text style={styles.section}>Convites recebidos</Text>}// se tiver convites lista
      {incoming.map((inv) => (
        <Card key={inv.id} style={{ marginBottom: 10 }}>
          <Text style={styles.cardTitle}>{inv.fromEmail} quer formar dupla com você</Text>
          <View style={styles.row}>
            <Button
              title="Aceitar"
              onPress={() =>
                acceptInvite(profile, inv).catch((e) =>
                  notify('Não foi possível aceitar', e instanceof Error ? e.message : String(e)),
                )
              }
              style={{ flex: 1 }}
            />
            <Button
              title="Recusar"
              variant="danger"
              onPress={() => declineInvite(inv.id).catch((e) => notify('Erro', String(e)))}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      ))}

      {outgoing.length > 0 && <Text style={styles.section}>Convites enviados</Text>} //lista com opção de cancelar 
      {outgoing.map((inv) => (
        <Card key={inv.id} style={{ marginBottom: 10 }}>
          <Text style={styles.cardTitle}>Aguardando {inv.toEmail}…</Text>
          <Button
            title="Cancelar convite"
            variant="danger"
            onPress={() => cancelInvite(inv.id).catch((e) => notify('Erro', String(e)))}
          />
        </Card>
      ))}
    </View>
  );
}

// Painel de progresso e ações da dupla formada
function PartnerPanel({ profile, partnerUid, today }: { profile: Profile; partnerUid: string; today: string }) {// quando há dupla, busca os dados
  const partner = usePartner(partnerUid);
  const habits = useHabits(partnerUid);
  const checked = useChecks(partnerUid, today);
  const nudgeSent = useNudgeSent(profile.uid, partnerUid, today);//se o empurrão já foi enviado 

  const done = habits.filter((h) => checked.has(h.id)).length;// calcula quantos concluídos
  const allDone = habits.length > 0 && done === habits.length;// e cê já foi tudo concluído.

  function confirmLeave() {
    confirmAction('Desfazer dupla', 'Vocês deixam de ver o progresso um do outro.', 'Desfazer', () => {
      leaveDuo(profile).catch((e) => notify('Erro', String(e)));//desfaz 
    });
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
        <ProgressBar done={done} total={habits.length} color={colors.gold} /> //barra de progresso da dupla
        {allDone && <Text style={styles.congrats}>Missão cumprida por hoje! 🏔️</Text>}
      </Card>

      {habits.map((h) => {// ciclo de verificação com linha de emoji para hábito do parceiro
        const ok = checked.has(h.id);
        return (
          <View key={h.id} style={styles.partnerHabit}>
            <Text style={{ fontSize: 18 }}>{ok ? '✅' : '⬜'}</Text>
            <Text style={[styles.partnerHabitText, ok && { color: colors.muted }]}>{h.title}</Text>
          </View>
        );
      })}

      <Button
        title={nudgeSent ? 'Empurrão enviado hoje ✓' : '👋 Dar um empurrão'}// desativa se já foi enviado hoje ou não há hábitos
        variant="gold"
        disabled={nudgeSent || allDone || habits.length === 0}
        onPress={() => sendNudge(profile, partnerUid, today).catch((e) => notify('Erro', String(e)))}
        style={{ marginTop: 16 }}
      />
      <Button title="Desfazer dupla" variant="danger" onPress={confirmLeave} style={{ marginTop: 8 }} />// aciona função de confirmação
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, width: '100%', maxWidth: 600, alignSelf: 'center' },
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
