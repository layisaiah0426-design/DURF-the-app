import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_CONFIGURED = Boolean(URL && KEY);

export let supabase: SupabaseClient | null = null;
if (SUPABASE_CONFIGURED) {
  supabase = createClient(URL as string, KEY as string);
}

/** Best-effort write to Supabase when configured; never throws into the UI. */
export async function sbInsert(table: string, row: Record<string, unknown>) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).insert(row);
    if (error) console.warn(`[durf] supabase insert ${table} failed:`, error.message);
  } catch (e) {
    console.warn(`[durf] supabase insert ${table} threw:`, e);
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        /* storage unavailable — session-only */
      }
      return v;
    });
  };
  return [value, set] as const;
}
