import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { Profile } from './types';

type AuthState = { user: User | null; profile: Profile | null; loading: boolean };
const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true });

// provedor de estado de autenticação e perfil do usuário
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true });

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubProfile?.();
      unsubProfile = undefined;

      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }

      const email = user.email ?? '';
      const fallbackProfile: Profile = {
        uid: user.uid,
        email,
        emailLower: email.toLowerCase(),
        partnerUid: null,
      };

      unsubProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          if (!snap.exists()) {
            setState({
              user,
              loading: false,
              profile: fallbackProfile,
            });

            if (!snap.metadata.fromCache) {
              setDoc(
                doc(db, 'users', user.uid),
                {
                  email,
                  emailLower: email.toLowerCase(),
                  partnerUid: null,
                  createdAt: Date.now(),
                },
                { merge: true }
              ).catch((e) => console.warn('[perfil]', e));
            }
            return;
          }

          const d = snap.data();
          setState({
            user,
            loading: false,
            profile: {
              uid: user.uid,
              email: d.email || email,
              emailLower: d.emailLower || email.toLowerCase(),
              partnerUid: d.partnerUid ?? null,
            },
          });
        },
        (e) => {
          console.warn('[perfil snapshot erro]', e);
          setState({
            user,
            profile: fallbackProfile,
            loading: false,
          });
        }
      );
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// Hook para acessar usuário e perfil autenticados
export const useAuth = () => useContext(AuthContext);

// Cria uma nova conta e registra o perfil inicial no Firestore
export async function signUp(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await setDoc(
      doc(db, 'users', cred.user.uid),
      {
        email: cred.user.email,
        emailLower: (cred.user.email || '').toLowerCase(),
        partnerUid: null,
        createdAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('[perfil inicial cadastro]', e);
  }
  return cred;
}

// autentica usuário com e-mail e senha
export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

// Encerra a sessão atual
export const signOut = () => fbSignOut(auth);

// retorna mensagem amigável para códigos de erro do Firebase Auth
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/missing-password':
      return 'Digite a senha.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Esse e-mail já tem conta. Tente entrar.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha incorretos.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Verifique sua rede.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Chave do Firebase não configurada. Veja as instruções em src/firebase.ts.';
    case 'auth/operation-not-allowed':
      return 'O login por E-mail/Senha não está ativado no Firebase Console.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
    default:
      return 'Algo deu errado. Verifique os dados e a conexão.';
  }
}
