import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const ThemeModeContext = createContext(null);
const STORAGE_KEY = 'bk-theme'; // 'light' | 'dark' | 'system'

function getSystemDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');

  const resolved = useMemo(
    () => (mode === 'system' ? (getSystemDark() ? 'dark' : 'light') : mode),
    [mode]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const [, force] = useState(0);
  useEffect(() => {
    if (mode !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => force((n) => n + 1);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => {
      const eff = m === 'system' ? (getSystemDark() ? 'dark' : 'light') : m;
      return eff === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode, toggle }), [mode, resolved, toggle]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
