import type { Mode, WidgetKind } from './spec';

export interface ProfileWidget {
  kind: WidgetKind;
  value: string;
}

export interface Profile {
  id: string;
  firstName: string;
  age: number;
  city: string;
  distanceMiles: number;
  intent: string;
  height?: string;
  school?: string;
  faithContext?: string;
  photos: string[]; // initials-avatar labels; no real photos in the scaffold
  widgets: ProfileWidget[];
  isSeed?: boolean; // starter catalog, NOT a real user (see seed.ts)
}

export interface Fax {
  id: string;
  matchId: string;
  partnerId: string;
  partnerName: string;
  dateId: string;
  status: 'new' | 'scheduled' | 'needs-time' | 'checkin' | 'completed' | 'archived' | 'canceled';
  scheduledAt?: string;
  rerolls: number;
  archived?: boolean;
}

export interface Match {
  id: string;
  profileId: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  from: 'me' | 'them';
  text: string;
  ts: number;
}

export interface Checkin {
  faxId: string;
  myCode: string;
  partnerCode: string;
  partnerEntered: boolean;
  myVerified: boolean;
  partnerVerified: boolean;
  resetUsed: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  ready: boolean;
  isMe?: boolean;
  isSeed?: boolean;
}

export interface Group {
  id: string;
  title: string;
  size: 4 | 6;
  members: GroupMember[];
  pairing: string[][];
  faxId?: string;
  messages: ChatMessage[];
  joinCode: string;
}

export interface Notice {
  id: string;
  kind: 'NOW' | 'ACTION' | 'MESSAGE' | 'SYSTEM';
  text: string;
  ts: number;
  read: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  dob: string;
  profile: Profile;
  mode: Mode;
  battery: number;
  lastRefillDay: string;
}

export type AppId =
  | 'discover'
  | 'profile'
  | 'modes'
  | 'fax'
  | 'chat'
  | 'groups'
  | 'safety'
  | 'notices'
  | 'help'
  | 'settings'
  | 'install'
  | 'power'
  | 'desktop';
