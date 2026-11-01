import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Field, Notice, WinButton, inputStyle } from '../components';
import { COPY, DATE_CATALOG, WIDGET_LABEL, WIDGET_LIBRARY } from '../spec';
import { useStore } from '../store';
import type { Fax, Profile } from '../types';
import { DATE_BUDGET_LABEL } from './shared';

export function ProfileCard({
  profile,
  blind,
  onReport,
  onBlock,
}: {
  profile: Profile;
  blind?: boolean;
  onReport?: () => void;
  onBlock?: () => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar label={profile.photos[0] ?? '?'} hidden={blind} />
        <div>
          <div style={{ fontSize: 26, fontWeight: 'bold' }}>
            {profile.firstName}, {profile.age}
          </div>
          <div style={{ fontSize: 17 }}>
            {profile.city}
            {profile.distanceMiles > 0 ? ` · ${profile.distanceMiles} miles away` : ''} · {profile.intent}
          </div>
          {profile.school && <div style={{ fontSize: 16 }}>{profile.school}</div>}
          {profile.faithContext && <div style={{ fontSize: 16 }}>{profile.faithContext}</div>}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        {(blind ? profile.widgets.slice(0, 3) : profile.widgets).map((w, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>{WIDGET_LABEL[w.kind]}</div>
            <div style={{ fontSize: 18, whiteSpace: 'pre-wrap' }}>{w.value}</div>
          </div>
        ))}
      </div>
      {(onReport || onBlock) && (
        <div style={{ marginTop: 8, fontSize: 16 }}>
          Safety: {onReport && <button onClick={onReport} style={{ fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>Report</button>}
          {' '}{onBlock && <button onClick={onBlock} style={{ fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>Block</button>}
          {' '}<span>· Hide</span>
        </div>
      )}
    </div>
  );
}

export function DiscoverWindow({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [confirmDurf, setConfirmDurf] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const card = s.deck[s.deckIndex % Math.max(s.deck.length, 1)];
  const blind = s.mode === 'Blind Date';
  // Fresh real profiles every time Discover opens (refreshDeck is stable).
  useEffect(() => {
    void s.refreshDeck();
  }, []);

  if (!card) {
    return (
      <div>
        <Notice
          text={
            s.demoMode
              ? 'Nothing in this folder yet. Try a wider search in Settings.'
              : 'No real profiles here yet. You are one of the first — invite someone to join Durf and they will show up here.'
          }
        />
        <WinButton onClick={onClose}>Desktop</WinButton>
      </div>
    );
  }

  if (s.battery <= 0) {
    return (
      <div>
        <Notice text="DISCOVER.EXE needs power." />
        <p style={{ fontSize: 18 }}>{COPY.batteryLow} Watching a rewarded video adds 5 battery, or wait for the daily refill.</p>
        <WinButton primary onClick={() => s.setOpenApp('power')}>Open POWER.EXE</WinButton>{' '}
        <WinButton onClick={onClose}>Desktop</WinButton>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 16, marginBottom: 8 }}>
        Battery: {s.battery}/10 · Mode: {s.mode} · {s.deck.length} nearby
      </div>
      {showFull ? (
        <ProfileCard
          profile={card}
          blind={blind}
          onReport={() => s.reportUser(card.id, 'other')}
          onBlock={() => s.blockUser(card.id)}
        />
      ) : (
        <ProfileCard profile={card} blind={blind} />
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <WinButton danger onClick={() => { s.norf(); setShowFull(false); }}>NORF</WinButton>
        <WinButton primary onClick={() => setConfirmDurf(true)}>DURF</WinButton>
        <WinButton onClick={() => setShowFull(!showFull)}>{showFull ? 'Less' : 'More'}</WinButton>
        <WinButton disabled={!s.undoAvailable} onClick={s.undoLast}>Undo (1/session)</WinButton>
      </div>
      {confirmDurf && (
        <div style={{ marginTop: 12, border: '2px solid #1C1C1C', padding: 10, background: '#FFF36B' }}>
          <div style={{ fontSize: 19, fontWeight: 'bold' }}>Spend 1 battery unit to Durf {card.firstName}?</div>
          <p style={{ fontSize: 17, margin: '6px 0' }}>A mutual Durf creates a match and prints a free-date fax. No swipe-only browsing.</p>
          <WinButton primary onClick={() => { setConfirmDurf(false); s.durf(); setShowFull(false); }}>Yes, Durf</WinButton>{' '}
          <WinButton onClick={() => setConfirmDurf(false)}>Keep reading</WinButton>
        </div>
      )}
      <div style={{ fontSize: 15, marginTop: 10 }}>
        Safety footer: Report / Block / Hide live on the full profile. Viewing is free — only a confirmed Durf spends battery.
      </div>
    </div>
  );
}

export function ProfileWindow() {
  const s = useStore();
  const me = s.user?.profile;
  const [draft, setDraft] = useState<Profile | undefined>(me);
  const [saved, setSaved] = useState(false);
  if (!me || !draft) return <div>Sign in to edit your profile.</div>;

  const toggleWidget = (kind: string) => {
    const has = draft.widgets.some((w) => w.kind === kind);
    if (has) {
      if (draft.widgets.length <= 3) return;
      setDraft({ ...draft, widgets: draft.widgets.filter((w) => w.kind !== kind) });
    } else {
      if (draft.widgets.length >= 5) return;
      const lib = WIDGET_LIBRARY.find((w) => w.kind === kind);
      if (!lib) return;
      setDraft({ ...draft, widgets: [...draft.widgets, { kind: kind as never, value: '' }] });
    }
  };

  return (
    <div>
      <div style={{ fontSize: 17, marginBottom: 8 }}>
        {s.demoMode ? 'Demo profile — saved on this device.' : 'Profile saved to your account.'} Pick exactly 3–5 widgets.
      </div>
      <Field label="First name">
        <input style={inputStyle} value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <Field label="Age">
          <input style={inputStyle} type="number" value={draft.age} onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })} />
        </Field>
        <Field label="City">
          <input style={inputStyle} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        </Field>
      </div>
      <Field label="Relationship intent">
        <select style={inputStyle} value={draft.intent} onChange={(e) => setDraft({ ...draft, intent: e.target.value })}>
          <option>Go on fun dates</option>
          <option>Open to a relationship</option>
          <option>Looking seriously</option>
        </select>
      </Field>
      <Field label="Faith context (optional, your words)">
        <input style={inputStyle} value={draft.faithContext ?? ''} onChange={(e) => setDraft({ ...draft, faithContext: e.target.value })} placeholder="e.g. Sunday services and weekday study" />
      </Field>
      <div style={{ fontSize: 16, marginBottom: 6 }}>
        Photos: up to 4. This scaffold uses initial tiles; real photo uploads via Supabase Storage are a later pass.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {draft.photos.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Avatar label={p} size={56} />
            <button onClick={() => setDraft({ ...draft, photos: draft.photos.filter((_, j) => j !== i) })} style={{ fontFamily: 'inherit', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        {draft.photos.length < 4 && (
          <WinButton onClick={() => setDraft({ ...draft, photos: [...draft.photos, String(draft.photos.length + 1)] })}>+ Add tile</WinButton>
        )}
      </div>
      <div style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 6 }}>Widget library (choose 3–5)</div>
      {WIDGET_LIBRARY.map((w) => {
        const existing = draft.widgets.find((x) => x.kind === w.kind);
        return (
          <div key={w.kind} style={{ marginBottom: 10 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 17 }}>
              <input type="checkbox" checked={Boolean(existing)} onChange={() => toggleWidget(w.kind)} />
              {WIDGET_LABEL[w.kind]} — {w.prompt} ({w.limit})
            </label>
            {existing && (
              <input
                style={{ ...inputStyle, marginTop: 4 }}
                value={existing.value}
                maxLength={w.kind === 'joys' ? 80 : 100}
                onChange={(e) =>
                  setDraft({ ...draft, widgets: draft.widgets.map((x) => (x.kind === w.kind ? { ...x, value: e.target.value } : x)) })
                }
                placeholder={w.kind === 'joys' ? 'Separate three joys with |' : w.prompt}
              />
            )}
          </div>
        );
      })}
      <WinButton
        primary
        onClick={() => {
          if (draft.widgets.length < 3 || draft.widgets.length > 5) return;
          s.saveProfile(draft);
          setSaved(true);
        }}
      >
        Save profile
      </WinButton>
      {saved && <div style={{ marginTop: 8, fontSize: 18 }}>{COPY.profileSaved}</div>}
      {draft.widgets.length < 3 && <div style={{ fontSize: 16, color: '#A40000' }}>Pick at least 3 widgets.</div>}
    </div>
  );
}

export function FaxWindow() {
  const s = useStore();
  const [tab, setTab] = useState<'new' | 'scheduled' | 'completed' | 'archived'>('new');
  const [openId, setOpenId] = useState<string | null>(null);
  const [when, setWhen] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeMsg, setCodeMsg] = useState('');

  const list = s.faxes.filter((f) => {
    if (tab === 'new') return f.status === 'new' || f.status === 'needs-time';
    if (tab === 'scheduled') return f.status === 'scheduled' || f.status === 'checkin';
    if (tab === 'completed') return f.status === 'completed';
    return f.archived === true;
  });

  const open = s.faxes.find((f) => f.id === openId);
  const date = open ? DATE_CATALOG.find((d) => d.id === open.dateId) : undefined;
  const checkin = open ? s.checkins.find((c) => c.faxId === open.id) : undefined;

  if (open && date) {
    return (
      <div>
        <WinButton onClick={() => setOpenId(null)}>← Back to inbox</WinButton>
        <h2 style={{ fontSize: 26, margin: '10px 0 4px' }}>{date.title}</h2>
        <div style={{ fontSize: 19 }}>
          With {open.partnerName} · {DATE_BUDGET_LABEL} · {date.time}
        </div>
        <p style={{ fontSize: 18 }}>{date.prompt}</p>
        <ol style={{ fontSize: 18, paddingLeft: 20 }}>
          {date.steps.map((st, i) => <li key={i}>{st}</li>)}
        </ol>
        <div style={{ fontSize: 17 }}>
          <div><b>BRING:</b> {date.bring}</div>
          <div><b>ACCESS:</b> {date.access}</div>
          <div><b>INDOOR SWAP:</b> {date.indoorSwap}</div>
          <div><b>COST PROOF:</b> No purchase, entry fee, required supplies, or paid transport.</div>
        </div>
        {open.status !== 'completed' && open.status !== 'canceled' && (
          <div style={{ marginTop: 12 }}>
            <Field label="Propose a date/time">
              <input style={inputStyle} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </Field>
            <WinButton primary onClick={() => when && s.scheduleFax(open.id, when)}>Schedule</WinButton>{' '}
            <WinButton onClick={() => s.rerollFax(open.id)} disabled={open.rerolls >= 1}>
              {open.rerolls >= 1 ? 'Reroll needs both to agree' : 'Reroll (1 free)'}
            </WinButton>{' '}
            <WinButton onClick={() => s.archiveFax(open.id)}>Archive</WinButton>{' '}
            <WinButton danger onClick={() => s.cancelFax(open.id)}>Cancel date</WinButton>
          </div>
        )}
        {open.scheduledAt && <div style={{ fontSize: 17, marginTop: 8 }}>Scheduled: {new Date(open.scheduledAt).toLocaleString()}</div>}
        <div style={{ marginTop: 14, borderTop: '2px solid #1C1C1C', paddingTop: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>DATE AUTHENTICATOR — 2FA-style check-in</div>
          {!checkin && (
            <div>
              <p style={{ fontSize: 17 }}>After the scheduled start, tap Start check-in. Each of you gets a unique 6-digit code. Enter your date's code — never your own.</p>
              <WinButton primary onClick={() => s.startCheckin(open.id)}>Start check-in</WinButton>
            </div>
          )}
          {checkin && !checkin.myVerified && (
            <div>
              <div style={{ fontSize: 19, margin: '8px 0' }}>Give this code to {open.partnerName}:</div>
              <div style={{ fontSize: 40, fontWeight: 'bold', letterSpacing: 4 }}>{checkin.myCode.slice(0, 3)} {checkin.myCode.slice(3)}</div>
              <div style={{ fontSize: 15 }}>Expires in 24 hours. Do not post it publicly.</div>
              <Field label={`Enter ${open.partnerName}'s code`}>
                <input style={inputStyle} value={codeInput} onChange={(e) => setCodeInput(e.target.value)} inputMode="numeric" maxLength={6} />
              </Field>
              <WinButton primary onClick={() => { const r = s.enterCode(open.id, codeInput); setCodeMsg(r === 'ok' ? COPY.checkinDone : r); }}>Verify date</WinButton>{' '}
              {!checkin.resetUsed && <WinButton onClick={() => s.resetCheckinCodes(open.id)}>Request new codes (1 reset)</WinButton>}
              {codeMsg && <div style={{ fontSize: 18, marginTop: 8 }}>{codeMsg}</div>}
              {s.demoMode && <div style={{ fontSize: 15, marginTop: 6 }}>Demo only: your date's code is {checkin.partnerCode} — with real users, they give it to you in person.</div>}
            </div>
          )}
          {checkin?.myVerified && (
            <div style={{ fontSize: 20, marginTop: 8 }}>{COPY.checkinDone} DATE COMPLETE — this fax moved to Completed.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {(['new', 'scheduled', 'completed', 'archived'] as const).map((t) => (
          <WinButton key={t} primary={tab === t} onClick={() => setTab(t)}>{t.toUpperCase()}</WinButton>
        ))}
      </div>
      {list.length === 0 && <Notice text="No faxes in this folder yet. Matches print here." />}
      {list.map((f: Fax) => {
        const d = DATE_CATALOG.find((x) => x.id === f.dateId);
        return (
          <div key={f.id} style={{ border: '2px solid #1C1C1C', padding: 10, marginBottom: 8, background: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{d?.title ?? 'Free date'} — {f.partnerName}</div>
            <div style={{ fontSize: 16 }}>Status: {f.status} · $0.00 · {d?.time}</div>
            <WinButton onClick={() => setOpenId(f.id)} style={{ marginTop: 6 }}>Open dossier</WinButton>
          </div>
        );
      })}
    </div>
  );
}

export function ChatWindow() {
  const s = useStore();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [safetyOpen, setSafetyOpen] = useState(false);

  const threads = useMemo(() => {
    return s.matches.map((m) => {
      const msgs = s.messages.filter((x) => x.threadId === m.id);
      const last = msgs[msgs.length - 1];
      return { match: m, profile: s.profileOf(m.profileId), last };
    });
  }, [s.matches, s.messages, s]);

  if (threadId) {
    const thread = threads.find((t) => t.match.id === threadId);
    const msgs = s.messages.filter((x) => x.threadId === threadId);
    const fax = s.faxes.find((f) => f.matchId === threadId);
    return (
      <div>
        <WinButton onClick={() => setThreadId(null)}>← Threads</WinButton>
        <div style={{ fontSize: 22, fontWeight: 'bold', margin: '8px 0' }}>
          {thread?.profile?.firstName ?? 'Chat'}
          {fax && <span style={{ fontSize: 16 }}> · Fax: {fax.status}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {msgs.length === 0 && <Notice text="Say hi. Keep it kind — this is a real person." />}
          {msgs.map((m) => (
            <div key={m.id} style={{ alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', background: m.from === 'me' ? '#FFF36B' : '#fff', border: '2px solid #1C1C1C', padding: '6px 10px', maxWidth: '85%', fontSize: 18 }}>
              {m.text}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => { if (e.key === 'Enter') { s.sendMessage(threadId, draft); setDraft(''); } }} />
          <WinButton primary onClick={() => { s.sendMessage(threadId, draft); setDraft(''); }}>Send</WinButton>
        </div>
        <div style={{ marginTop: 10 }}>
          <WinButton onClick={() => setSafetyOpen(!safetyOpen)}>Safety menu</WinButton>{' '}
          {fax && <WinButton onClick={() => s.setOpenApp('fax')}>Open fax</WinButton>}
        </div>
        {safetyOpen && thread?.profile && (
          <div style={{ marginTop: 8, fontSize: 17 }}>
            <WinButton onClick={() => s.reportUser(thread.profile!.id, 'other')}>Report user</WinButton>{' '}
            <WinButton danger onClick={() => s.blockUser(thread.profile!.id)}>Block user</WinButton>{' '}
            <span>Mute and unmatch live here too — blocking ends this thread.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {threads.length === 0 && <Notice text={COPY.noChats} />}
      {threads.map((t) => (
        <button
          key={t.match.id}
          onClick={() => setThreadId(t.match.id)}
          style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', border: '2px solid #1C1C1C', padding: 10, marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar label={t.profile?.photos[0] ?? '?'} size={48} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>{t.profile?.firstName ?? 'Match'}</div>
              <div style={{ fontSize: 16 }}>{t.last ? t.last.text : 'New match — say hi.'}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
