import React from 'react';
import { COLORS } from './spec';

export function bevelOut(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: COLORS.silver,
    border: '2px solid',
    borderColor: '#FFFFFF #404040 #404040 #FFFFFF',
    boxShadow: 'inset 1px 1px 0 #DFDFDF, inset -1px -1px 0 #808080',
    ...extra,
  };
}

export function bevelIn(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: COLORS.paper,
    border: '2px solid',
    borderColor: '#404040 #FFFFFF #FFFFFF #404040',
    boxShadow: 'inset 1px 1px 0 #808080',
    ...extra,
  };
}

export function WinButton({
  children,
  onClick,
  primary,
  danger,
  disabled,
  style,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...bevelOut(),
        background: primary ? COLORS.yellow : danger ? '#E8A0A0' : COLORS.silver,
        color: COLORS.ink,
        fontFamily: 'inherit',
        fontSize: 18,
        fontWeight: 'bold',
        padding: '8px 14px',
        minHeight: 44,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Window({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        ...bevelOut(),
        width: wide ? 'min(680px, 96vw)' : 'min(520px, 96vw)',
        maxHeight: '86vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: COLORS.navy,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          fontWeight: 'bold',
          fontSize: 19,
          letterSpacing: 0.5,
        }}
      >
        <span>{title}</span>
        <button
          onClick={onClose}
          aria-label="Close window"
          style={{
            ...bevelOut(),
            width: 32,
            height: 28,
            fontFamily: 'inherit',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          X
        </button>
      </div>
      <div style={{ overflowY: 'auto', padding: 12 }}>{children}</div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <div style={{ fontSize: 15, marginBottom: 3 }}>{label}</div>
      {children}
    </label>
  );
}

export const inputStyle: React.CSSProperties = {
  ...bevelIn(),
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: 18,
  padding: '8px 10px',
  color: COLORS.ink,
};

export function Avatar({
  label,
  size = 72,
  hidden,
}: {
  label: string;
  size?: number;
  hidden?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: hidden ? '#808080' : COLORS.navy,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 'bold',
        border: '2px solid #1C1C1C',
        flexShrink: 0,
      }}
    >
      {hidden ? '?' : label}
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...bevelOut(),
        display: 'inline-block',
        padding: '3px 8px',
        fontSize: 15,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div>
      {label && <div style={{ fontSize: 15, marginBottom: 4 }}>{label}</div>}
      <div style={{ ...bevelIn(), height: 22, padding: 2 }}>
        <div
          style={{
            height: '100%',
            width: `${Math.max(0, Math.min(100, pct))}%`,
            background: `repeating-linear-gradient(90deg, ${COLORS.navy} 0 10px, transparent 10px 14px)`,
          }}
        />
      </div>
    </div>
  );
}

export function Notice({ text }: { text: string }) {
  return (
    <div style={{ ...bevelIn(), padding: '8px 10px', marginBottom: 8, fontSize: 17 }}>{text}</div>
  );
}
