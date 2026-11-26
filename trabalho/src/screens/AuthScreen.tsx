import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authErrorMessage, signIn, signUp } from '../auth';
import { Button } from '../components';
import { isFirebaseConfigured } from '../firebase'; //verificação da ligação com bd
import { colors } from '../theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login'); //declara estado mode para controlar se está no modo login ou logut mas cmç no login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);//indica se existe um pedido de autenticação em andamento (bloqueia botões) 
  const [error, setError] = useState('');//se der falha na autenticação 

  async function submit() {//entrar ou cadastrar
    setError('');//limpa mensagem de erro
    setBusy(true);//estado de carregamento 
    try {// começo da autenticação 
      if (mode === 'login') {//verificação se o modo atual é login
        await signIn(email, password);//chama a função login
      } else {
        await signUp(email, password);
      }
    } catch (e) {//se der erro de verificação 
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);//desativada 
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.logo}>✦</Text>
        <Text style={styles.title}>AetherDuo</Text>
        <Text style={styles.subtitle}>Hábitos em dupla.</Text>
//retorna a estrutura visual e não deixa o teclado tapar os Campos de e-mail e senha
        {!isFirebaseConfigured && (
          <View style={styles.configNotice}>
            <Text style={styles.configNoticeText}>
              Banco de dados não configurado.
            </Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput//cria um campo input já configurado (email)
          style={styles.input}
          placeholder="Senha (mín. 6 caracteres)"
          placeholderTextColor={colors.muted}
          secureTextEntry//caracteres ocultos
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}// supermet automaticamente após pressionar enterói.
        />

        {!!error && <Text style={styles.error}>{error}</Text>} // o renderiza se tiver erro no estado 

        {busy ? ( // se vdd indica carregamento
          <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />// daí activity ativa
        ) : (
          <Button // se não mostra o botão entrar ou criar conta, associado a função submit, desativada se os campos estiverem vazios 
            title={mode === 'login' ? 'Entrar' : 'Criar conta'}
            onPress={submit}
            disabled={busy || !email.trim() || !password}
            style={{ marginTop: 8 }}
          />
        )}

        <Pressable //botões clicáveis 
          onPress={() => {
            setError('');
            setMode(mode === 'login' ? 'signup' : 'login');
          }}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.switch}>
            {mode === 'login' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', padding: 28, width: '100%', maxWidth: 440, alignSelf: 'center' },
  logo: { fontSize: 44, textAlign: 'center', color: colors.gold },
  title: { fontSize: 34, fontWeight: '800', textAlign: 'center', color: colors.text },
  subtitle: { textAlign: 'center', color: colors.muted, marginBottom: 24, marginTop: 4 },
  configNotice: {
    backgroundColor: colors.goldSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  configNoticeText: {
    color: '#8A5D00',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  error: { color: colors.danger, marginBottom: 8, textAlign: 'center', fontWeight: '500' },
  switch: { textAlign: 'center', color: colors.primary, fontWeight: '600' },
});
