import React, { useEffect, useState } from 'react';
import { Field, Notice, WinButton, Window, inputStyle } from './components';
import { COPY, SPONSOR_CREATIVES } from './spec';
import { StoreProvider, useStore } from './store';
import type { AppId } from './types';
import { ChatWindow, DiscoverWindow, FaxWindow, ProfileWindow } from './windows/windows';
import {
  GroupsWindow,
  HelpWindow,
  InstallWindow,
  ModesWindow,
  NoticesWindow,
  PowerWindow,
  SafetyWindow,
  SettingsWindow,
} from './windows/windows2';

const ICONS: { id: AppId; label: string; glyph: string }[] = [
  { id: 'discover', label: 'DISCOVER', glyph: 'D' },
  { id: 'profile', label: 'MY PROFILE', glyph: 'P' },
  { id: 'modes', label: 'MODES', glyph: 'M' },
  { id: 'fax', label: 'FAX', glyph: 'F' },
  { id: 'chat', label: 'CHAT', glyph: 'C' },
  { id: 'groups', label: 'GROUP DATE', glyph: 'G' },
  { id: 'safety', label: 'SAFETY', glyph: 'S' },
  { id: 'notices', label: 'NOTICES', glyph: 'N' },
  { id: 'help', label: 'HELP', glyph: '?' },
  { id: 'settings', label: 'SETTINGS', glyph: '⚙' },
  { id: 'install', label: 'INSTALL', glyph: '↓' },
  { id: 'power', label: 'POWER', glyph: '🔋' },
];

function Boot({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{ minHeight: '100vh', background: '#1C1C1C', color: '#fff', padding: 24, fontSize: 22 }}>
      <div style={{ fontSize: 44, fontWeight: 'bold' }}>DURF OPERATING SYSTEM v1.0</div>
      <div style={{ marginTop: 16, lineHeight: 1.5 }}>
        <div>&gt; Loading mutual interest... OK</div>
        <div>&gt; Checking available funds... $0.00</div>
        <div>&gt; Installing courage... 62%</div>
        <div>&gt; Starting DURF.EXE_</div>
      </div>
      <WinButton onClick={onDone} style={{ marginTop: 24 }}>Skip</WinButton>
    </div>
  );
}

const TUTORIALS = [
  { title: 'WELCOME TO DURF', body: 'Meet someone. Get a free date. Actually go. Required funds: $0.00' },
  { title: 'CHOOSE PEOPLE', body: 'Choose people, not a pile of profiles. Durf costs 1 battery. Norf is free and kind.' },
  { title: 'FAX + CODES', body: 'When it clicks, the fax machine wakes up. Go on the date. Trade codes. Keep Durfing.' },
];

function Tutorial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const t = TUTORIALS[i];
  return (
    <div style={{ minHeight: '100vh', background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#C8C8C8', border: '2px solid', borderColor: '#FFFFFF #404040 #404040 #FFFFFF', padding: 20, maxWidth: 480, width: '100%' }}>
        <div style={{ background: '#00006F', color: '#fff', padding: '6px 10px', fontWeight: 'bold', fontSize: 20 }}>{t.title}</div>
        <p style={{ fontSize: 22 }}>{t.body}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {i < TUTORIALS.length - 1 ? (
            <WinButton primary onClick={() => setI(i + 1)}>Next</WinButton>
          ) : (
            <WinButton primary onClick={onDone}>Start Durfing</WinButton>
          )}
          <WinButton onClick={onDone}>Skip</WinButton>
        </div>
      </div>
    </div>
  );
}

function Auth({ onAuthed }: { onAuthed: (remember: boolean) => void }) {
  const s = useStore();
  const [tab, setTab] = useState<'up' | 'in'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dob, setDob] = useState('');
  const [agree, setAgree] = useState(false);
  // Remember me defaults to on, unless the last session was explicitly
  // ended (logged out, or signed in without "remember me").
  const [remember, setRemember] = useState(() => {
    try {
      return localStorage.getItem('durf-session-v1') !== 'logged-out';
    } catch {
      return true;
    }
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy || (tab === 'up' && !agree)) return;
    setErr('');
    setBusy(true);
    const res =
      tab === 'up'
        ? await s.signUp(email, firstName, dob, password)
        : await s.signIn(email, password);
    setBusy(false);
    if (res) setErr(res);
    else onAuthed(tab === 'up' ? true : remember);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#C8C8C8', border: '2px solid', borderColor: '#FFFFFF #404040 #404040 #FFFFFF', padding: 20, maxWidth: 480, width: '100%' }}>
        <div style={{ background: '#00006F', color: '#fff', padding: '6px 10px', fontWeight: 'bold', fontSize: 20 }}>
          {tab === 'up' ? 'CREATE ACCOUNT.EXE' : 'SIGN_IN.EXE'}
        </div>
        {s.demoMode && (
          <Notice text="Demo mode: no Supabase configured, so this account lives on this device only. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY for real accounts." />
        )}
        <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
          <WinButton primary={tab === 'up'} onClick={() => setTab('up')}>Sign up</WinButton>
          <WinButton primary={tab === 'in'} onClick={() => setTab('in')}>Sign in</WinButton>
        </div>
        {/* A real <form> (not divs + onClick) is what lets the browser offer
            to save the password and autofill it next time. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Field label="Email">
            <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" autoComplete="email" />
          </Field>
          {tab === 'up' && (
            <>
              <Field label="First name">
                <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} name="given-name" autoComplete="given-name" />
              </Field>
              <Field label="Date of birth (18+ only)">
                <input style={inputStyle} value={dob} onChange={(e) => setDob(e.target.value)} type="date" name="bday" autoComplete="bday" />
              </Field>
              <label style={{ display: 'block', fontSize: 17, marginBottom: 10 }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the community guidelines and consent rules.
              </label>
            </>
          )}
          <Field label={s.demoMode ? 'Password (demo only — ignored)' : 'Password'}>
            <input style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" autoComplete={tab === 'up' ? 'new-password' : 'current-password'} />
          </Field>
          {tab === 'in' && (
            <label style={{ display: 'block', fontSize: 17, marginBottom: 10 }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me on this device
            </label>
          )}
          {err && <div style={{ fontSize: 17, color: '#A40000', marginBottom: 8 }}>{err}</div>}
          <WinButton primary type="submit" disabled={busy || (tab === 'up' && !agree)}>
            {busy ? 'Working…' : tab === 'up' ? 'Create account' : 'Sign in'}
          </WinButton>
        </form>
        <div style={{ fontSize: 15, marginTop: 8 }}>Under-18 accounts cannot proceed. Safety copy is plain language, always.</div>
      </div>
    </div>
  );
}

function Desktop({ onLogout }: { onLogout: () => void }) {
  const s = useStore();
  const [adDismissed, setAdDismissed] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Rotate the sponsor creative so the slot behaves like a real ad widget.
  useEffect(() => {
    const t = setInterval(() => setAdIndex((v) => (v + 1) % SPONSOR_CREATIVES.length), 20000);
    return () => clearInterval(t);
  }, []);

  const faxBadge = s.faxes.filter((f) => f.status === 'new').length;
  const chatBadge = s.matches.filter((m) => {
    const msgs = s.messages.filter((x) => x.threadId === m.id);
    const last = msgs[msgs.length - 1];
    return last && last.from === 'them';
  }).length;
  const noticeBadge = s.notices.filter((n) => !n.read).length;

  const badgeFor = (id: AppId): number => {
    if (id === 'fax') return faxBadge;
    if (id === 'chat') return chatBadge;
    if (id === 'notices') return noticeBadge;
    return 0;
  };

  const openIcon = (id: AppId) => {
    if (id === 'power') {
      s.setOpenApp('power');
      return;
    }
    s.setOpenApp(id);
  };

  const renderWindow = () => {
    const close = () => s.setOpenApp('desktop');
    switch (s.openApp) {
      case 'discover':
        return <DiscoverWindow onClose={close} />;
      case 'profile':
        return <ProfileWindow />;
      case 'modes':
        return <ModesWindow />;
      case 'fax':
        return <FaxWindow />;
      case 'chat':
        return <ChatWindow />;
      case 'groups':
        return <GroupsWindow />;
      case 'safety':
        return <SafetyWindow />;
      case 'notices':
        return <NoticesWindow />;
      case 'help':
        return <HelpWindow />;
      case 'settings':
        return <SettingsWindow />;
      case 'install':
        return <InstallWindow onClose={close} />;
      case 'power':
        return <PowerWindow />;
      default:
        return null;
    }
  };

  const windowTitle: Record<string, string> = {
    discover: 'DISCOVER.EXE',
    profile: 'MY_PROFILE.EXE',
    modes: 'MODES.EXE',
    fax: 'FAX.EXE',
    chat: 'CHAT.EXE',
    groups: 'GROUP_DATE.EXE',
    safety: 'SAFETY.EXE',
    notices: 'NOTICES.EXE',
    help: 'HELP.EXE',
    settings: 'SETTINGS.EXE',
    install: 'INSTALL_ME.TXT',
    power: 'POWER.EXE',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#008080', display: 'flex', flexDirection: 'column', paddingBottom: 52 }}>
      <div style={{ padding: 12, flex: 1 }}>
        {s.openApp === 'desktop' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 520, margin: '0 auto' }}>
              {ICONS.map((icon) => {
                const badge = badgeFor(icon.id);
                return (
                  <button
                    key={icon.id}
                    onClick={() => openIcon(icon.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', position: 'relative', padding: 0 }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        margin: '0 auto',
                        background: '#C8C8C8',
                        border: '2px solid',
                        borderColor: '#FFFFFF #404040 #404040 #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 26,
                        fontWeight: 'bold',
                        color: '#1C1C1C',
                      }}
                    >
                      {icon.glyph}
                    </div>
                    <div style={{ color: '#fff', fontSize: 15, marginTop: 4, textAlign: 'center' }}>{icon.label}</div>
                    {badge > 0 && (
                      <span style={{ position: 'absolute', top: -4, right: 8, background: '#A40000', color: '#fff', fontSize: 14, padding: '0 6px', border: '2px solid #fff' }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ maxWidth: 520, margin: '18px auto 0', background: '#C8C8C8', border: '2px solid', borderColor: '#FFFFFF #404040 #404040 #FFFFFF', padding: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>SPONSORED · Why am I seeing this?</div>
              {adDismissed ? (
                <div style={{ fontSize: 17 }}>Sponsored slot hidden for this session. The widget never covers your icons.</div>
              ) : (
                <div>
                  <div style={{ fontSize: 19 }}>{SPONSOR_CREATIVES[adIndex].headline}</div>
                  <div style={{ fontSize: 16, marginTop: 4 }}>{SPONSOR_CREATIVES[adIndex].body}</div>
                  <button onClick={() => setAdDismissed(true)} style={{ fontFamily: 'inherit', cursor: 'pointer', fontSize: 15 }}>Dismiss this creative</button>
                </div>
              )}
            </div>
            <div style={{ maxWidth: 520, margin: '12px auto 0', color: '#fff', fontSize: 17, textAlign: 'center' }}>
              {s.demoMode
                ? 'Demo mode — accounts live on this device. Real Supabase accounts arrive with env vars.'
                : 'Connected to Supabase — accounts are real.'}
            </div>
          </div>
        ) : (
          <Window title={windowTitle[s.openApp] ?? 'DURF.EXE'} onClose={() => s.setOpenApp('desktop')}>
            {renderWindow()}
          </Window>
        )}
      </div>

      {/* Taskbar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#C8C8C8',
          borderTop: '2px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          fontSize: 18,
          zIndex: 50,
        }}
      >
        <button onClick={() => s.setOpenApp('desktop')} style={{ fontFamily: 'inherit', fontWeight: 'bold', fontSize: 18, background: '#C8C8C8', border: '2px solid', borderColor: '#FFFFFF #404040 #404040 #FFFFFF', cursor: 'pointer', padding: '4px 10px' }}>
          [DURF]
        </button>
        <button onClick={() => s.setOpenApp('modes')} style={{ fontFamily: 'inherit', fontSize: 17, background: 'none', border: 'none', cursor: 'pointer' }}>
          Mode: {s.mode}
        </button>
        <button onClick={() => s.setOpenApp('power')} style={{ fontFamily: 'inherit', fontSize: 17, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
          🔋 {s.battery}/10
        </button>
        <span style={{ fontSize: 16 }}>
          {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Log out is a desktop icon in this shell: handled via a dedicated row */}
      {s.openApp === 'desktop' && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 12px 8px', textAlign: 'center' }}>
          {!logoutConfirm ? (
            <button onClick={() => setLogoutConfirm(true)} style={{ fontFamily: 'inherit', fontSize: 16, color: '#fff', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
              Log out of this device
            </button>
          ) : (
            <span style={{ color: '#fff', fontSize: 17 }}>
              Log out of this device?{' '}
              <button onClick={() => { setLogoutConfirm(false); onLogout(); }} style={{ fontFamily: 'inherit', cursor: 'pointer' }}>Yes, log out</button>{' '}
              <button onClick={() => setLogoutConfirm(false)} style={{ fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
            </span>
          )}
        </div>
      )}

      {/* Incoming fax modal */}
      {s.incomingFax && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <div className="fax-feed" style={{ background: '#fff', border: '3px solid #1C1C1C', maxWidth: 460, width: '100%', padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 'bold' }}>INCOMING FAX...</div>
            <div style={{ fontSize: 20, margin: '10px 0' }}>{COPY.match}</div>
            <div style={{ fontSize: 19 }}>A free date is printing for you and {s.incomingFax.partnerName}.</div>
            <div style={{ fontSize: 16, marginTop: 6 }}>SENDER: DURF DATE DEPT.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <WinButton primary onClick={() => s.openFaxNow(s.incomingFax!)}>Open now</WinButton>
              <WinButton onClick={() => s.saveFaxForLater(s.incomingFax!)}>Save to Fax</WinButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Shell() {
  const s = useStore();
  const [phase, setPhase] = useState<'boot' | 'tutorial' | 'auth' | 'desktop'>(s.booted ? (s.user ? 'desktop' : 'auth') : 'boot');
  // Session flag survives reloads; logging out ends the session without
  // deleting the local account (the server copy is authoritative when set).
  // The flag is the remember-me switch: 'logged-out' means the next visit
  // must sign in again, anything else means "remember me".
  const sessionFlagActive = () => {
    try {
      return localStorage.getItem('durf-session-v1') !== 'logged-out';
    } catch {
      return true;
    }
  };
  const [session, setSession] = useState<boolean>(() => {
    try {
      return localStorage.getItem('durf-session-v1') !== 'logged-out' && Boolean(s.user);
    } catch {
      return Boolean(s.user);
    }
  });

  useEffect(() => {
    if (s.booted && phase === 'boot') {
      setPhase(!s.user ? 'tutorial' : sessionFlagActive() ? 'desktop' : 'auth');
    }
  }, [s.booted, s.user, phase]);

  // If a remembered session restored the user after the auth screen already
  // rendered, move straight to the desktop. The flag guard keeps a real
  // logout on the sign-in screen.
  useEffect(() => {
    if (sessionFlagActive() && s.user && phase === 'auth') setPhase('desktop');
  }, [s.user, phase]);

  if (!s.authReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#1C1C1C', color: '#fff', padding: 24, fontSize: 22 }}>
        <div style={{ fontSize: 44, fontWeight: 'bold' }}>DURF OPERATING SYSTEM v1.0</div>
        <div style={{ marginTop: 16 }}>&gt; Restoring session…</div>
      </div>
    );
  }
  if (phase === 'boot') {
    return <Boot onDone={() => { s.setBooted(); setPhase(!s.user ? 'tutorial' : sessionFlagActive() ? 'desktop' : 'auth'); }} />;
  }
  if (phase === 'tutorial') {
    return <Tutorial onDone={() => setPhase('auth')} />;
  }
  if (phase === 'auth' || !session) {
    return (
      <Auth
        onAuthed={(remember) => {
          try {
            localStorage.setItem('durf-session-v1', remember ? 'active' : 'logged-out');
          } catch {
            /* ignore */
          }
          setSession(true);
          setPhase('desktop');
          if (!s.installSeen) s.setOpenApp('install');
        }}
      />
    );
  }
  return (
    <Desktop
      onLogout={() => {
        s.signOut();
        try {
          localStorage.setItem('durf-session-v1', 'logged-out');
        } catch {
          /* ignore */
        }
        setSession(false);
        setPhase('auth');
      }}
    />
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
