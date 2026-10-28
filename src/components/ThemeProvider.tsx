'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { App as AntApp, ConfigProvider, theme as antdTheme } from 'antd';
import { createExternalStore } from '@/lib/createExternalStore';
import { darkTokens, lightTokens } from '@/theme';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

const themeStore = createExternalStore<ThemeMode>(readStoredMode());

function subscribe(listener: () => void) {
  return themeStore.subscribe(listener);
}

function getServerMode(): ThemeMode {
  return 'light';
}

/**
 * Reads and flips the colour scheme.
 *
 * The preference lives in a module-level store (not component state) so the
 * first render is deterministic on the server and every consumer updates at
 * the same time.
 */
export function useThemeMode() {
  const mode = useSyncExternalStore(subscribe, themeStore.get, getServerMode);

  const setMode = (next: ThemeMode) => {
    themeStore.set(next);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled: the toggle still works for the session.
    }

    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
  };

  return {
    mode,
    setMode,
    toggle: () => setMode(mode === 'dark' ? 'light' : 'dark'),
  };
}

export default function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const mode = useSyncExternalStore(subscribe, themeStore.get, getServerMode);

  // Keep the CSS custom properties in globals.css in step with the Ant Design
  // algorithm. Writing to the DOM is an external-system sync, not React state,
  // so this does not trigger cascading renders.
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const theme = {
    ...(mode === 'dark' ? darkTokens : lightTokens),
    algorithm:
      mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={theme}>
      <AntApp message={{ maxCount: 3 }}>{children}</AntApp>
    </ConfigProvider>
  );
}
