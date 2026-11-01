import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { BATTERY_CAP, DATE_CATALOG, REWARD_CHARGE } from './spec';
import type { Mode } from './spec';
import { SEED_GREETING, SEED_PROFILES, emptyProfile } from './seed';
import { sbInsert, supabase, SUPABASE_CONFIGURED, useLocalStorage } from './supabase';
import type {
  AppId,
  ChatMessage,
  Checkin,
  Fax,
  Group,
  Match,
  Notice,
  Profile,
  UserAccount,
} from './types';

export interface Settings {
  sound: boolean;
  motion: boolean;
  textSize: 'normal' | 'large';
  highContrast: boolean;
  notifyMatch: boolean;
  notifyFax: boolean;
  notifyChat: boolean;
  minAge: number;
  maxAge: number;
  maxDistance: number;
  intent: string;
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  motion: true,
  textSize: 'normal',
  highContrast: false,
  notifyMatch: true,
  notifyFax: true,
  notifyChat: true,
  minAge: 18,
  maxAge: 35,
  maxDistance: 25,
  intent: 'Any',
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function sixDigit() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function inviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export interface Store {
  demoMode: boolean;
  booted: boolean;
  setBooted: () => void;
  tutorialStep: number;
  setTutorialStep: (n: number) => void;
  user: UserAccount | null;
  signUp: (email: string, firstName: string, dob: string, password?: string) => Promise<string | null>;
  signIn: (email: string, password?: string) => Promise<string | null>;
  signOut: () => void;
  saveProfile: (p: Profile) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  couplesCode: string;
  couplesLinked: boolean;
  linkCouples: (code: string) => boolean;
  battery: number;
  lastRefillDay: string;
  openApp: AppId;
  setOpenApp: (a: AppId) => void;
  deck: Profile[];
  deckIndex: number;
  swiped: string[];
  undoAvailable: boolean;
  norf: () => void;
  durf: () => void;
  undoLast: () => void;
  matches: Match[];
  faxes: Fax[];
  incomingFax: Fax | null;
  setIncomingFax: (f: Fax | null) => void;
  openFaxNow: (f: Fax) => void;
  saveFaxForLater: (f: Fax) => void;
  scheduleFax: (faxId: string, when: string) => void;
  rerollFax: (faxId: string) => void;
  archiveFax: (faxId: string) => void;
  cancelFax: (faxId: string) => void;
  messages: ChatMessage[];
  sendMessage: (threadId: string, text: string) => void;
  checkins: Checkin[];
  startCheckin: (faxId: string) => void;
  enterCode: (faxId: string, code: string) => string;
  resetCheckinCodes: (faxId: string) => void;
  groups: Group[];
  createGroup: (title: string, size: 4 | 6) => Group;
  toggleGroupReady: (groupId: string, memberId: string) => void;
  requestGroupFax: (groupId: string) => void;
  sendGroupMessage: (groupId: string, text: string) => void;
  notices: Notice[];
  dismissNotice: (id: string) => void;
  markNoticesRead: () => void;
  blocked: string[];
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  reports: string[];
  reportUser: (id: string, reason: string) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  installSeen: boolean;
  setInstallSeen: () => void;
  watchAd: () => void;
  pushNotice: (kind: Notice['kind'], text: string) => void;
  profileOf: (id: string) => Profile | undefined;
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('Store not mounted');
  return s;
}

function ageFromDob(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [booted, setBootedState] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [user, setUser] = useLocalStorage<UserAccount | null>('durf-user-v1', null);
  const [mode, setModeState] = useLocalStorage<Mode>('durf-mode-v1', 'Dating');
  const [couplesCode] = useState(() => inviteCode());
  const [couplesLinked, setCouplesLinked] = useLocalStorage<boolean>('durf-couples-v1', false);
  const [battery, setBattery] = useLocalStorage<number>('durf-battery-v1', BATTERY_CAP);
  const [lastRefillDay, setLastRefillDay] = useLocalStorage<string>('durf-refill-v1', todayStr());
  const [openApp, setOpenApp] = useState<AppId>('desktop');
  const [deckIndex, setDeckIndex] = useState(0);
  const [swiped, setSwiped] = useLocalStorage<string[]>('durf-swiped-v1', []);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [matches, setMatches] = useLocalStorage<Match[]>('durf-matches-v1', []);
  const [faxes, setFaxes] = useLocalStorage<Fax[]>('durf-faxes-v1', []);
  const [incomingFax, setIncomingFax] = useState<Fax | null>(null);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('durf-messages-v1', []);
  const [checkins, setCheckins] = useLocalStorage<Checkin[]>('durf-checkins-v1', []);
  const [groups, setGroups] = useLocalStorage<Group[]>('durf-groups-v1', []);
  const [notices, setNotices] = useLocalStorage<Notice[]>('durf-notices-v1', []);
  const [blocked, setBlocked] = useLocalStorage<string[]>('durf-blocked-v1', []);
  const [reports, setReports] = useLocalStorage<string[]>('durf-reports-v1', []);
  const [settings, setSettings] = useLocalStorage<Settings>('durf-settings-v1', DEFAULT_SETTINGS);
  const [installSeen, setInstallSeenState] = useLocalStorage<boolean>('durf-install-v1', false);

  // Daily organic refill (spec: one full recharge per rolling day).
  if (user && lastRefillDay !== todayStr()) {
    setBattery(BATTERY_CAP);
    setLastRefillDay(todayStr());
  }

  const demoMode = !SUPABASE_CONFIGURED;

  const pushNotice = useCallback(
    (kind: Notice['kind'], text: string) => {
      setNotices((prev) => [
        { id: uid('notice'), kind, text, ts: Date.now(), read: false },
        ...prev,
      ]);
    },
    [setNotices],
  );

  const profileOf = useCallback(
    (id: string) => {
      if (id === 'me') return user?.profile;
      return SEED_PROFILES.find((p) => p.id === id);
    },
    [user],
  );

  const setBooted = useCallback(() => setBootedState(true), []);

  const signUp = useCallback(
    async (email: string, firstName: string, dob: string, password?: string) => {
      const age = ageFromDob(dob);
      if (age < 18) return 'You must be 18 or older to use Durf.';
      if (!email.includes('@')) return 'Enter a valid email address.';
      if (supabase) {
        if (!password || password.length < 6) return 'Choose a password of at least 6 characters.';
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return error.message;
      }
      const account: UserAccount = {
        id: uid('user'),
        email,
        firstName,
        dob,
        profile: { ...emptyProfile(firstName), age },
        mode: 'Dating',
        battery: BATTERY_CAP,
        lastRefillDay: todayStr(),
      };
      setUser(account);
      setBattery(BATTERY_CAP);
      if (supabase) {
        void sbInsert('users', { id: account.id, email, dob, created_at: new Date().toISOString() });
      }
      return null;
    },
    [setUser, setBattery],
  );

  const signIn = useCallback(
    async (email: string, password?: string) => {
      if (supabase) {
        if (!password) return 'Enter your password.';
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return error.message;
      }
      const existing = user && user.email === email ? user : null;
      if (existing) return null;
      // Demo mode: any email signs into a local account (clearly labeled in UI).
      if (demoMode) {
        const name = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'Friend';
        const cap = name.charAt(0).toUpperCase() + name.slice(1);
        setUser({
          id: uid('user'),
          email,
          firstName: cap,
          dob: '2000-01-01',
          profile: emptyProfile(cap),
          mode: 'Dating',
          battery: BATTERY_CAP,
          lastRefillDay: todayStr(),
        });
        return null;
      }
      return 'No local profile for that email yet — sign up first, then sign in.';
    },
    [demoMode, user, setUser],
  );

  const signOut = useCallback(() => {
    if (supabase) void supabase.auth.signOut();
    setOpenApp('desktop');
  }, []);

  const saveProfile = useCallback(
    (p: Profile) => {
      if (!user) return;
      setUser({ ...user, profile: p });
      if (supabase) {
        void sbInsert('profiles', {
          user_id: user.id,
          first_name: p.firstName,
          age: p.age,
          city: p.city,
          intent: p.intent,
          widgets: p.widgets,
        });
      }
    },
    [user, setUser],
  );

  const setMode = useCallback(
    (m: Mode) => {
      setModeState(m);
      if (user) setUser({ ...user, mode: m });
    },
    [setModeState, user, setUser],
  );

  const linkCouples = useCallback(
    (code: string) => {
      if (code.trim().toUpperCase().length === 6) {
        setCouplesLinked(true);
        pushNotice('ACTION', 'Couples link confirmed. Shared faxes are on.');
        return true;
      }
      return false;
    },
    [setCouplesLinked, pushNotice],
  );

  const deck = useMemo(() => {
    const seen = new Set(swiped);
    const pool = SEED_PROFILES.filter((p) => !seen.has(p.id) && !blocked.includes(p.id));
    const filtered = pool.filter(
      (p) =>
        p.age >= settings.minAge &&
        p.age <= settings.maxAge &&
        p.distanceMiles <= settings.maxDistance &&
        (settings.intent === 'Any' || p.intent === settings.intent),
    );
    return filtered.length > 0 ? filtered : pool;
  }, [swiped, blocked, settings]);

  const currentCard = deck[deckIndex % Math.max(deck.length, 1)];

  const norf = useCallback(() => {
    if (!currentCard) return;
    setSwiped((prev) => [...prev, currentCard.id]);
    setDeckIndex((i) => i + 1);
    setUndoAvailable(true);
  }, [currentCard, setSwiped]);

  const durf = useCallback(() => {
    if (!currentCard || battery <= 0) return;
    const card = currentCard;
    setBattery((b) => Math.max(0, b - 1));
    setSwiped((prev) => [...prev, card.id]);
    setDeckIndex((i) => i + 1);
    setUndoAvailable(true);
    const match: Match = { id: uid('match'), profileId: card.id, createdAt: Date.now() };
    setMatches((prev) => [match, ...prev]);
    const date = DATE_CATALOG[matches.length % DATE_CATALOG.length];
    const fax: Fax = {
      id: uid('fax'),
      matchId: match.id,
      partnerId: card.id,
      partnerName: card.firstName,
      dateId: date.id,
      status: 'new',
      rerolls: 0,
    };
    setFaxes((prev) => [fax, ...prev]);
    setMessages((prev) => [
      ...prev,
      {
        id: uid('msg'),
        threadId: match.id,
        from: 'them',
        text: SEED_GREETING[card.id] ?? 'Hey! Excited for our free date.',
        ts: Date.now(),
      },
    ]);
    pushNotice('NOW', `Mutual interest detected with ${card.firstName}.`);
    pushNotice('NOW', `A free date is printing for you and ${card.firstName}.`);
    setIncomingFax(fax);
    if (supabase && user) {
      void sbInsert('swipes', { user_id: user.id, target_id: card.id, decision: 'durf' });
      void sbInsert('matches', { id: match.id, user_a: user.id, user_b: card.id });
      void sbInsert('faxes', { id: fax.id, match_id: match.id, date_id: date.id, status: 'new' });
    }
  }, [currentCard, battery, matches.length, setBattery, setSwiped, setMatches, setFaxes, setMessages, pushNotice, user]);

  const undoLast = useCallback(() => {
    if (!undoAvailable || swiped.length === 0) return;
    setSwiped((prev) => prev.slice(0, -1));
    setDeckIndex((i) => Math.max(0, i - 1));
    setUndoAvailable(false);
    setBattery((b) => Math.min(BATTERY_CAP, b + 1));
  }, [undoAvailable, swiped.length, setSwiped, setBattery]);

  const openFaxNow = useCallback((f: Fax) => {
    setIncomingFax(null);
    setOpenApp('fax');
    setFaxes((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: 'needs-time' as const } : x)));
  }, [setFaxes]);

  const saveFaxForLater = useCallback((f: Fax) => {
    setIncomingFax(null);
    pushNotice('ACTION', `Fax from ${f.partnerName} saved to your Fax inbox.`);
  }, [pushNotice]);

  const scheduleFax = useCallback(
    (faxId: string, when: string) => {
      setFaxes((prev) =>
        prev.map((x) => (x.id === faxId ? { ...x, status: 'scheduled' as const, scheduledAt: when } : x)),
      );
    },
    [setFaxes],
  );

  const rerollFax = useCallback(
    (faxId: string) => {
      setFaxes((prev) =>
        prev.map((x) => {
          if (x.id !== faxId) return x;
          if (x.rerolls >= 1) return x; // further rerolls need both people to agree
          const next = DATE_CATALOG[(DATE_CATALOG.findIndex((d) => d.id === x.dateId) + 1) % DATE_CATALOG.length];
          return { ...x, dateId: next.id, rerolls: x.rerolls + 1, status: 'needs-time' as const };
        }),
      );
    },
    [setFaxes],
  );

  const archiveFax = useCallback(
    (faxId: string) => {
      setFaxes((prev) => prev.map((x) => (x.id === faxId ? { ...x, archived: true } : x)));
    },
    [setFaxes],
  );

  const cancelFax = useCallback(
    (faxId: string) => {
      setFaxes((prev) => prev.map((x) => (x.id === faxId ? { ...x, status: 'canceled' as const } : x)));
    },
    [setFaxes],
  );

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, { id: uid('msg'), threadId, from: 'me', text: trimmed, ts: Date.now() }]);
    },
    [setMessages],
  );

  const startCheckin = useCallback(
    (faxId: string) => {
      setCheckins((prev) => {
        if (prev.some((c) => c.faxId === faxId)) return prev;
        let mine = sixDigit();
        let theirs = sixDigit();
        if (theirs === mine) theirs = sixDigit();
        return [
          ...prev,
          { faxId, myCode: mine, partnerCode: theirs, partnerEntered: false, myVerified: false, partnerVerified: false, resetUsed: false },
        ];
      });
      setFaxes((prev) => prev.map((x) => (x.id === faxId ? { ...x, status: 'checkin' as const } : x)));
    },
    [setCheckins, setFaxes],
  );

  const enterCode = useCallback(
    (faxId: string, code: string) => {
      const c = checkins.find((x) => x.faxId === faxId);
      if (!c) return 'Start check-in first.';
      if (code.trim() === c.myCode) return "That's your own code. Enter your date's code.";
      if (code.trim() !== c.partnerCode) return 'That code does not match this date.';
      setCheckins((prev) =>
        prev.map((x) => (x.faxId === faxId ? { ...x, partnerEntered: true, myVerified: true, partnerVerified: true } : x)),
      );
      setFaxes((prev) => prev.map((x) => (x.id === faxId ? { ...x, status: 'completed' as const } : x)));
      pushNotice('SYSTEM', 'Two humans verified. Date complete.');
      return 'ok';
    },
    [checkins, setCheckins, setFaxes, pushNotice],
  );

  const resetCheckinCodes = useCallback(
    (faxId: string) => {
      setCheckins((prev) =>
        prev.map((x) => {
          if (x.faxId !== faxId || x.resetUsed) return x;
          let mine = sixDigit();
          let theirs = sixDigit();
          if (theirs === mine) theirs = sixDigit();
          return { ...x, myCode: mine, partnerCode: theirs, resetUsed: true, partnerEntered: false, myVerified: false, partnerVerified: false };
        }),
      );
    },
    [setCheckins],
  );

  const createGroup = useCallback(
    (title: string, size: 4 | 6) => {
      const me = user?.profile.firstName ?? 'You';
      const pool = SEED_PROFILES.slice(0, size - 1);
      const members = [
        { id: 'me', name: me, ready: false, isMe: true },
        ...pool.map((p) => ({ id: p.id, name: p.firstName, ready: false, isSeed: true })),
      ];
      const group: Group = {
        id: uid('group'),
        title,
        size,
        members,
        pairing: [],
        joinCode: inviteCode(),
        messages: [],
      };
      setGroups((prev) => [group, ...prev]);
      pushNotice('ACTION', `Group "${title}" created. Invite code ${group.joinCode}.`);
      return group;
    },
    [user, setGroups, pushNotice],
  );

  const toggleGroupReady = useCallback(
    (groupId: string, memberId: string) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.map((m) => (m.id === memberId ? { ...m, ready: !m.ready } : m)) }
            : g,
        ),
      );
    },
    [setGroups],
  );

  const requestGroupFax = useCallback(
    (groupId: string) => {
      const g = groups.find((x) => x.id === groupId);
      if (!g || !g.members.every((m) => m.ready)) return;
      const date = DATE_CATALOG[groups.length % DATE_CATALOG.length];
      const fax: Fax = {
        id: uid('fax'),
        matchId: groupId,
        partnerId: 'group',
        partnerName: g.title,
        dateId: date.id,
        status: 'new',
        rerolls: 0,
      };
      setFaxes((prev) => [fax, ...prev]);
      setGroups((prev) => prev.map((x) => (x.id === groupId ? { ...x, faxId: fax.id } : x)));
      pushNotice('NOW', `Group fax for "${g.title}" is printing.`);
    },
    [groups, setFaxes, setGroups, pushNotice],
  );

  const sendGroupMessage = useCallback(
    (groupId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, messages: [...g.messages, { id: uid('msg'), threadId: groupId, from: 'me', text: trimmed, ts: Date.now() }] }
            : g,
        ),
      );
    },
    [setGroups],
  );

  const dismissNotice = useCallback(
    (id: string) => setNotices((prev) => prev.filter((n) => n.id !== id)),
    [setNotices],
  );

  const markNoticesRead = useCallback(
    () => setNotices((prev) => prev.map((n) => ({ ...n, read: true }))),
    [setNotices],
  );

  const blockUser = useCallback(
    (id: string) => {
      setBlocked((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [setBlocked],
  );

  const unblockUser = useCallback(
    (id: string) => setBlocked((prev) => prev.filter((x) => x !== id)),
    [setBlocked],
  );

  const reportUser = useCallback(
    (id: string, reason: string) => {
      setReports((prev) => [...prev, `${id}:${reason}`]);
      pushNotice('SYSTEM', 'Report received. Our team will review it.');
    },
    [setReports, pushNotice],
  );

  const setInstallSeen = useCallback(() => setInstallSeenState(true), [setInstallSeenState]);

  const watchAd = useCallback(() => {
    setBattery((b) => Math.min(BATTERY_CAP, b + REWARD_CHARGE));
    pushNotice('SYSTEM', `Rewarded video complete. +${REWARD_CHARGE} battery.`);
  }, [setBattery, pushNotice]);

  const value: Store = {
    demoMode,
    booted,
    setBooted,
    tutorialStep,
    setTutorialStep,
    user,
    signUp,
    signIn,
    signOut,
    saveProfile,
    mode,
    setMode,
    couplesCode,
    couplesLinked,
    linkCouples,
    battery,
    lastRefillDay,
    openApp,
    setOpenApp,
    deck,
    deckIndex,
    swiped,
    undoAvailable,
    norf,
    durf,
    undoLast,
    matches,
    faxes,
    incomingFax,
    setIncomingFax,
    openFaxNow,
    saveFaxForLater,
    scheduleFax,
    rerollFax,
    archiveFax,
    cancelFax,
    messages,
    sendMessage,
    checkins,
    startCheckin,
    enterCode,
    resetCheckinCodes,
    groups,
    createGroup,
    toggleGroupReady,
    requestGroupFax,
    sendGroupMessage,
    notices,
    dismissNotice,
    markNoticesRead,
    blocked,
    blockUser,
    unblockUser,
    reports,
    reportUser,
    settings,
    setSettings,
    installSeen,
    setInstallSeen,
    watchAd,
    pushNotice,
    profileOf,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
