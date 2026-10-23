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
      unsubProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          if (!snap.exists()) {
            // primeiro acesso: cria o perfil (o listener dispara de novo em seguida)
            setDoc(doc(db, 'users', user.uid), {
              email,
              emailLower: email.toLowerCase(),
              partnerUid: null,
              createdAt: Date.now(),
            }).catch((e) => console.warn('[perfil]', e));
            return;
          }
          const d = snap.data();
          setState({
            user,
            loading: false,
            profile: { uid: user.uid, email: d.email, emailLower: d.emailLower, partnerUid: d.partnerUid ?? null },
          });
        },
        (e) => {
          console.warn('[perfil]', e);
          setState({ user, profile: null, loading: false });
        },
      );
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const signUp = (email: string, password: string) => createUserWithEmailAndPassword(auth, email.trim(), password);
export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password);
export const signOut = () => fbSignOut(auth);

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
      return 'Sem conexão com a internet.';
    default:
      return 'Algo deu errado. Tente de novo.';
  }
}
