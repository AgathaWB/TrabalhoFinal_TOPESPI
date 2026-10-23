import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { Habit, Invite, Nudge, Profile } from './types';

const warn = (e: unknown) => console.warn('[Firestore]', e);
const nudgeId = (from: string, to: string, date: string) => `${from}_${to}_${date}`;

/*  HOOKS (tempo real) */

export function useHabits(uid: string | null | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  useEffect(() => {
    if (!uid) {
      setHabits([]);
      return;
    }
    const q = query(collection(db, 'habits'), where('ownerUid', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Habit, 'id'>) }));
        list.sort((a, b) => a.createdAt - b.createdAt);
        setHabits(list);
      },
      warn,
    );
  }, [uid]);
  return habits;
}

/*IDs dos hábitos marcados como feitos naquele dia */
export function useChecks(uid: string | null | undefined, date: string) {
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!uid) {
      setDone(new Set());
      return;
    }
    const q = query(collection(db, 'checks'), where('ownerUid', '==', uid), where('date', '==', date));
    return onSnapshot(q, (snap) => setDone(new Set(snap.docs.map((d) => d.data().habitId as string))), warn);
  }, [uid, date]);
  return done;
}

export function usePartner(partnerUid: string | null | undefined) {
  const [partner, setPartner] = useState<Profile | null>(null);
  useEffect(() => {
    if (!partnerUid) {
      setPartner(null);
      return;
    }
    return onSnapshot(
      doc(db, 'users', partnerUid),
      (snap) => {
        if (!snap.exists()) return setPartner(null);
        const d = snap.data();
        setPartner({ uid: snap.id, email: d.email, emailLower: d.emailLower, partnerUid: d.partnerUid ?? null });
      },
      warn,
    );
  }, [partnerUid]);
  return partner;
}

export function useIncomingInvites(emailLower: string | undefined) {
  const [invites, setInvites] = useState<Invite[]>([]);
  useEffect(() => {
    if (!emailLower) return;
    const q = query(collection(db, 'invites'), where('toEmail', '==', emailLower), where('status', '==', 'pending'));
    return onSnapshot(
      q,
      (snap) => setInvites(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Invite, 'id'>) }))),
      warn,
    );
  }, [emailLower]);
  return invites;
}

export function useOutgoingInvites(uid: string | undefined) {
  const [invites, setInvites] = useState<Invite[]>([]);
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'invites'), where('fromUid', '==', uid), where('status', '==', 'pending'));
    return onSnapshot(
      q,
      (snap) => setInvites(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Invite, 'id'>) }))),
      warn,
    );
  }, [uid]);
  return invites;
}

/*Empurrões que eu recebi hoje e ainda não vi */
export function useIncomingNudges(uid: string | undefined, date: string) {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'nudges'),
      where('toUid', '==', uid),
      where('date', '==', date),
      where('seen', '==', false),
    );
    return onSnapshot(
      q,
      (snap) => setNudges(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Nudge, 'id'>) }))),
      warn,
    );
  }, [uid, date]);
  return nudges;
}

/*Já mandei empurrão pra essa pessoa hoje? */
export function useNudgeSent(fromUid: string | undefined, toUid: string | null | undefined, date: string) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!fromUid || !toUid) {
      setSent(false);
      return;
    }
    return onSnapshot(doc(db, 'nudges', nudgeId(fromUid, toUid, date)), (s) => setSent(s.exists()), warn);
  }, [fromUid, toUid, date]);
  return sent;
}

/*  AÇÕES  */

export async function addHabit(uid: string, title: string) {
  await setDoc(doc(collection(db, 'habits')), { ownerUid: uid, title: title.trim(), createdAt: Date.now() });
}

export async function removeHabit(habitId: string) {
  await deleteDoc(doc(db, 'habits', habitId));
}

export async function setChecked(uid: string, habitId: string, date: string, checked: boolean) {
  const ref = doc(db, 'checks', `${uid}_${habitId}_${date}`);
  if (checked) await setDoc(ref, { ownerUid: uid, habitId, date });
  else await deleteDoc(ref);
}

export async function sendInvite(me: Profile, toEmailRaw: string) {
  const toEmail = toEmailRaw.trim().toLowerCase();
  if (toEmail === me.emailLower) throw new Error('Você não pode convidar a si mesmo 🙂');
  await setDoc(doc(db, 'invites', `${me.uid}__${toEmail}`), {
    fromUid: me.uid,
    fromEmail: me.email,
    toEmail,
    status: 'pending',
  });
}

export async function cancelInvite(inviteId: string) {
  await deleteDoc(doc(db, 'invites', inviteId));
}

export async function declineInvite(inviteId: string) {
  await updateDoc(doc(db, 'invites', inviteId), { status: 'declined' });
}

/*Aceitar = grava a dupla nos dois perfis de uma vez (batch atômico) */
export async function acceptInvite(me: Profile, inv: Invite) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'invites', inv.id), { status: 'accepted' });
  batch.update(doc(db, 'users', me.uid), { partnerUid: inv.fromUid });
  batch.update(doc(db, 'users', inv.fromUid), { partnerUid: me.uid });
  await batch.commit();
}

export async function leaveDuo(me: Profile) {
  if (!me.partnerUid) return;
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', me.uid), { partnerUid: null });
  batch.update(doc(db, 'users', me.partnerUid), { partnerUid: null });
  await batch.commit();
}

export async function sendNudge(me: Profile, toUid: string, date: string) {
  await setDoc(doc(db, 'nudges', nudgeId(me.uid, toUid, date)), {
    fromUid: me.uid,
    toUid,
    fromEmail: me.email,
    date,
    seen: false,
  });
}

export async function markNudgeSeen(id: string) {
  await updateDoc(doc(db, 'nudges', id), { seen: true });
}
