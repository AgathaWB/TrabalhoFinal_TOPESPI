export type Profile = { uid: string; email: string; emailLower: string; partnerUid: string | null };
export type Habit = { id: string; ownerUid: string; title: string; createdAt: number };
export type Invite = {
  id: string;
  fromUid: string;
  fromEmail: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
};
export type Nudge = { id: string; fromUid: string; toUid: string; fromEmail: string; date: string; seen: boolean };
