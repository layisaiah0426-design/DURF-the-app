import React, { useState } from 'react';
import { Field, Notice, WinButton, inputStyle } from '../components';
import { COPY } from '../spec';
import { useStore } from '../store';
import type { Mode } from '../spec';

export function ModesWindow() {
  const s = useStore();
  const [pending, setPending] = useState<Mode | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');

  const pick = (m: Mode) => {
    if (m === 'Couples' && !s.couplesLinked) {
      setPending(m);
      return;
    }
    s.setMode(m);
  };

  return (
    <div>
      <div style={{ fontSize: 18, marginBottom: 8 }}>Current mode: <b>{s.mode}</b></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <WinButton primary={s.mode === 'Dating'} onClick={() => pick('Dating')}>Dating — full profiles, Durf/Norf decisions</WinButton>
        <WinButton primary={s.mode === 'Blind Date'} onClick={() => pick('Blind Date')}>Blind Date — photos hidden until you match</WinButton>
        <WinButton primary={s.mode === 'Couples'} onClick={() => pick('Couples')}>Couples — link with a partner, shared faxes</WinButton>
      </div>
      {s.mode === 'Blind Date' && (
        <Notice text="Blind Date: you see age, area, intent, and three widgets — but no photos until a match reveals them." />
      )}
      {pending === 'Couples' && (
        <div style={{ marginTop: 12, border: '2px solid #1C1C1C', padding: 10, background: '#FFF36B' }}>
          <div style={{ fontSize: 19, fontWeight: 'bold' }}>Open Couples Mode and pause your Dating profile?</div>
          <p style={{ fontSize: 17, margin: '6px 0' }}>Your Dating profile pauses while Couples is active. Your matches stay safe.</p>
          <div style={{ fontSize: 17 }}>Your invite code: <b>{s.couplesCode}</b> — share it with your partner.</div>
          <Field label="Enter your partner's 6-character code">
            <input style={inputStyle} value={partnerCode} onChange={(e) => setPartnerCode(e.target.value.toUpperCase())} maxLength={6} />
          </Field>
          <WinButton primary onClick={() => { if (s.linkCouples(partnerCode)) { s.setMode('Couples'); setPending(null); } else setCodeMsg('That code needs 6 characters.'); }}>Open Couples Mode</WinButton>{' '}
          <WinButton onClick={() => setPending(null)}>Cancel</WinButton>
          {codeMsg && <div style={{ fontSize: 16 }}>{codeMsg}</div>}
        </div>
      )}
      {s.mode === 'Couples' && s.couplesLinked && (
        <Notice text={`${COPY.couplesFax} Couples faxes are shared between you and your partner.`} />
      )}
    </div>
  );
}

export function GroupsWindow() {
  const s = useStore();
  const [title, setTitle] = useState('');
  const [size, setSize] = useState<4 | 6>(4);
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const group = s.groups.find((g) => g.id === openId);
  if (group) {
    const allReady = group.members.every((m) => m.ready);
    return (
      <div>
        <WinButton onClick={() => setOpenId(null)}>← Groups</WinButton>
        <h2 style={{ fontSize: 24, margin: '8px 0' }}>{group.title} — {group.size}-person lobby ({group.members.length}/{group.size})</h2>
        <div style={{ fontSize: 16 }}>Invite code: <b>{group.joinCode}</b> · Pairings are confirmed by each person, never automatic.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          {group.members.map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #1C1C1C', padding: '8px 10px', background: '#fff' }}>
              <span style={{ fontSize: 19 }}>{m.name}{m.isMe ? ' (you)' : ''}</span>
              <WinButton primary={m.ready} onClick={() => s.toggleGroupReady(group.id, m.id)}>{m.ready ? 'READY ✓' : 'Mark ready'}</WinButton>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <WinButton primary disabled={!allReady} onClick={() => s.requestGroupFax(group.id)}>
            {allReady ? 'FAX THE GROUP A DATE' : 'Waiting for everyone to be ready…'}
          </WinButton>
        </div>
        {group.faxId && <Notice text="Group fax requested. It lands in your Fax inbox." />}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 19, fontWeight: 'bold' }}>Group chat</div>
          {group.messages.map((m) => (
            <div key={m.id} style={{ fontSize: 18, background: '#fff', border: '2px solid #1C1C1C', padding: '6px 10px', marginBottom: 6 }}>{m.text}</div>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Plan logistics…" onKeyDown={(e) => { if (e.key === 'Enter') { s.sendGroupMessage(group.id, msg); setMsg(''); } }} />
            <WinButton primary onClick={() => { s.sendGroupMessage(group.id, msg); setMsg(''); }}>Send</WinButton>
          </div>
          <div style={{ fontSize: 15, marginTop: 6 }}>If someone leaves before the date, the lobby pauses — nobody is automatically re-paired.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 8 }}>Build a double or triple date</div>
      <Field label="Group title">
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Saturday crew" />
      </Field>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <WinButton primary={size === 4} onClick={() => setSize(4)}>Double date (4)</WinButton>
        <WinButton primary={size === 6} onClick={() => setSize(6)}>Triple date (6)</WinButton>
      </div>
      <WinButton primary onClick={() => { if (title.trim()) { const g = s.createGroup(title.trim(), size); setOpenId(g.id); } }}>Create lobby</WinButton>
      <div style={{ marginTop: 14 }}>
        {s.groups.length === 0 && <Notice text="No groups yet. Group mode is for agreed pairs, not an automated matching pool." />}
        {s.groups.map((g) => (
          <div key={g.id} style={{ border: '2px solid #1C1C1C', padding: 10, marginBottom: 8, background: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{g.title}</div>
            <div style={{ fontSize: 16 }}>{g.members.filter((m) => m.ready).length}/{g.members.length} ready · code {g.joinCode}</div>
            <WinButton onClick={() => setOpenId(g.id)} style={{ marginTop: 6 }}>Open lobby</WinButton>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SafetyWindow() {
  const s = useStore();
  const [personId, setPersonId] = useState('');
  const [reason, setReason] = useState('Harassment');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const people = s.matches.map((m) => s.profileOf(m.profileId)).filter(Boolean);

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 'bold' }}>Safety Center</div>
      <p style={{ fontSize: 17 }}>
        Safety screens use calm, literal language. Durf does not monitor your date. If you ever feel unsafe, leave, contact someone you trust, and use local emergency resources.
      </p>
      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>Report a person</div>
      <Field label="Who">
        <select style={inputStyle} value={personId} onChange={(e) => setPersonId(e.target.value)}>
          <option value="">Choose a match…</option>
          {people.map((p) => <option key={p!.id} value={p!.id}>{p!.firstName}</option>)}
        </select>
      </Field>
      <Field label="Reason">
        <select style={inputStyle} value={reason} onChange={(e) => setReason(e.target.value)}>
          {['Harassment', 'Sexual content', 'Threat', 'Scam', 'Impersonation', 'Underage', 'Other'].map((r) => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Context (optional — explain what will be included)">
        <input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
      </Field>
      <WinButton primary onClick={() => { if (personId) { s.reportUser(personId, reason); setDone(true); } }}>Send report</WinButton>
      {done && <div style={{ fontSize: 17, marginTop: 8 }}>Report received. Blocking and unmatching are separate choices — you can do either from Chat.</div>}
      <div style={{ fontSize: 18, fontWeight: 'bold', margin: '14px 0 6px' }}>Date safety tools</div>
      <p style={{ fontSize: 17 }}>Share your plan with a trusted contact: time, place, match first name, and planned activity. Meet in public places. Set a private check-in reminder with a friend.</p>
      <div style={{ fontSize: 18, fontWeight: 'bold', margin: '14px 0 6px' }}>Blocked accounts ({s.blocked.length})</div>
      {s.blocked.length === 0 && <div style={{ fontSize: 17 }}>Nobody blocked. Blocked people cannot message, discover, invite, or view you.</div>}
      {s.blocked.map((id) => (
        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17 }}>
          <span>{s.profileOf(id)?.firstName ?? id}</span>
          <WinButton onClick={() => s.unblockUser(id)}>Unblock</WinButton>
        </div>
      ))}
    </div>
  );
}

export function NoticesWindow() {
  const s = useStore();
  const groups: Record<string, typeof s.notices> = { NOW: [], ACTION: [], MESSAGE: [], SYSTEM: [] };
  s.notices.forEach((n) => { (groups[n.kind] ?? groups.SYSTEM).push(n); });
  return (
    <div>
      <WinButton onClick={s.markNoticesRead}>Mark all read</WinButton>
      {(['NOW', 'ACTION', 'MESSAGE', 'SYSTEM'] as const).map((k) => (
        <div key={k} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>{k}</div>
          {groups[k].length === 0 && <div style={{ fontSize: 16 }}>Nothing here.</div>}
          {groups[k].map((n) => (
            <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 17, background: n.read ? '#C8C8C8' : '#fff', border: '2px solid #1C1C1C', padding: '6px 10px', marginBottom: 6 }}>
              <span>{n.text}</span>
              <button onClick={() => s.dismissNotice(n.id)} style={{ fontFamily: 'inherit', cursor: 'pointer' }}>Dismiss</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function HelpWindow() {
  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 'bold' }}>Quick start</div>
      <ol style={{ fontSize: 18, paddingLeft: 20 }}>
        <li>Desktop → Discover → Fax → Codes. That is the whole app.</li>
        <li>Durf someone to spend 1 battery and print a free-date fax.</li>
        <li>Go on the date. Trade 6-digit codes. Keep Durfing.</li>
      </ol>
      <div style={{ fontSize: 19, fontWeight: 'bold', marginTop: 12 }}>Glossary</div>
      <div style={{ fontSize: 17 }}>
        <p><b>What's a Durf?</b> Interest action — and the product name.</p>
        <p><b>What's a Norf?</b> A respectful pass. No hard feelings. File closed.</p>
        <p><b>Battery?</b> How decisions and charging work: 10 decisions max, +5 per rewarded video, one full refill per day.</p>
        <p><b>Modes?</b> Dating, Blind Date, Couples — three ways to play, one free-date engine.</p>
        <p><b>Fax?</b> Your date plans live here, even when you save them for later.</p>
      </div>
      <div style={{ fontSize: 17, marginTop: 12 }}>Support: having trouble? Close the window and reopen it. If a fax jams, your match is safe — retry from the Fax inbox.</div>
    </div>
  );
}

export function SettingsWindow() {
  const s = useStore();
  const set = (patch: Partial<typeof s.settings>) => s.setSettings({ ...s.settings, ...patch });
  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 'bold' }}>Discovery preferences</div>
      <Field label="Age range">
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={inputStyle} type="number" value={s.settings.minAge} onChange={(e) => set({ minAge: Number(e.target.value) })} />
          <input style={inputStyle} type="number" value={s.settings.maxAge} onChange={(e) => set({ maxAge: Number(e.target.value) })} />
        </div>
      </Field>
      <Field label="Max distance (miles)">
        <input style={inputStyle} type="number" value={s.settings.maxDistance} onChange={(e) => set({ maxDistance: Number(e.target.value) })} />
      </Field>
      <Field label="Who you see">
        <select style={inputStyle} value={s.settings.intent} onChange={(e) => set({ intent: e.target.value })}>
          <option>Any</option>
          <option>Go on fun dates</option>
          <option>Open to a relationship</option>
          <option>Looking seriously</option>
        </select>
      </Field>
      <div style={{ fontSize: 19, fontWeight: 'bold', marginTop: 12 }}>Privacy</div>
      <label style={{ display: 'block', fontSize: 17 }}><input type="checkbox" checked={s.settings.notifyChat} onChange={(e) => set({ notifyChat: e.target.checked })} /> Chat notifications</label>
      <label style={{ display: 'block', fontSize: 17 }}><input type="checkbox" checked={s.settings.notifyMatch} onChange={(e) => set({ notifyMatch: e.target.checked })} /> Match notifications</label>
      <label style={{ display: 'block', fontSize: 17 }}><input type="checkbox" checked={s.settings.notifyFax} onChange={(e) => set({ notifyFax: e.target.checked })} /> Fax notifications</label>
      <div style={{ fontSize: 17, marginTop: 6 }}>Read receipts: off by default. Online status: hidden by default. Precise location: never shown.</div>
      <div style={{ fontSize: 19, fontWeight: 'bold', marginTop: 12 }}>Appearance</div>
      <label style={{ display: 'block', fontSize: 17 }}><input type="checkbox" checked={s.settings.sound} onChange={(e) => set({ sound: e.target.checked })} /> Sounds</label>
      <label style={{ display: 'block', fontSize: 17 }}><input type="checkbox" checked={s.settings.motion} onChange={(e) => set({ motion: e.target.checked })} /> Motion (off = dissolve only)</label>
      <label style={{ display: 'block', fontSize: 17 }}><input type="checkbox" checked={s.settings.highContrast} onChange={(e) => set({ highContrast: e.target.checked })} /> High contrast</label>
      <Field label="Text size">
        <select style={inputStyle} value={s.settings.textSize} onChange={(e) => set({ textSize: e.target.value as 'normal' | 'large' })}>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </Field>
      <div style={{ fontSize: 19, fontWeight: 'bold', marginTop: 12 }}>Data</div>
      <WinButton onClick={() => {
        const blob = new Blob([JSON.stringify({ profile: s.user?.profile, matches: s.matches, faxes: s.faxes }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'durf-data.json';
        a.click();
        URL.revokeObjectURL(url);
      }}>Download my data</WinButton>
      <div style={{ fontSize: 16, marginTop: 6 }}>Account deletion is handled in the deployed backend with re-authentication; in this scaffold, signing out clears the local session.</div>
    </div>
  );
}

export function InstallWindow({ onClose }: { onClose: () => void }) {
  const s = useStore();
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 'bold' }}>INSTALL_ME.TXT — Get Durf on your home screen</div>
      <p style={{ fontSize: 18 }}>Durf is a web app. Install it like an app and it opens full-screen from your home screen.</p>
      <div style={{ fontSize: 18, fontWeight: 'bold' }}>iPhone</div>
      <ol style={{ fontSize: 18, paddingLeft: 20 }}>
        <li>Open the Durf site in Safari.</li>
        <li>Tap Share (the square with the arrow).</li>
        <li>Tap Add to Home Screen, then Add.</li>
      </ol>
      <div style={{ fontSize: 18, fontWeight: 'bold' }}>Android</div>
      <ol style={{ fontSize: 18, paddingLeft: 20 }}>
        <li>Open the Durf site in your browser.</li>
        <li>Tap Install app (or Add to Home screen in the menu).</li>
        <li>Confirm, and Durf lands on your home screen.</li>
      </ol>
      <WinButton primary onClick={() => { s.setInstallSeen(); onClose(); }}>Got it — back to desktop</WinButton>
    </div>
  );
}

export function PowerWindow() {
  const s = useStore();
  const [charging, setCharging] = useState(false);
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 'bold' }}>POWER.EXE</div>
      <div style={{ fontSize: 20, margin: '8px 0' }}>Battery: {s.battery} / 10 decisions</div>
      <div style={{ background: '#fff', border: '2px solid #1C1C1C', height: 26, padding: 2 }}>
        <div style={{ height: '100%', width: `${s.battery * 10}%`, background: '#00006F' }} />
      </div>
      <p style={{ fontSize: 17 }}>
        One full recharge per rolling day. Only new discovery pauses at 0 — you can keep chatting, planning, and checking in.
        Battery is never sold. Watching a video is optional.
      </p>
      {charging ? (
        <div style={{ fontSize: 18 }}>Playing sponsored video… (rewarded placeholder — real AdMob comes later)</div>
      ) : (
        <WinButton primary disabled={s.battery >= 10} onClick={() => { setCharging(true); setTimeout(() => { s.watchAd(); setCharging(false); }, 1200); }}>
          Watch video: +5 battery
        </WinButton>
      )}
      {s.battery >= 10 && <div style={{ fontSize: 17, marginTop: 8 }}>{COPY.batteryFull}</div>}
    </div>
  );
}
