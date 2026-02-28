'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeCtx { theme: Theme; toggle: () => void; }
const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const s = localStorage.getItem('hy_theme') as Theme | null;
    if (s) setTheme(s);
  }, []);

  const toggle = () => setTheme(t => {
    const n = t === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hy_theme', n);
    return n;
  });

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <div data-theme={theme} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
