/**
 * LevelShift — Theme utility
 *
 * Light/dark theme handling. The actual colors live in app.css as CSS
 * variables; here we just toggle the class on <html> and persist the choice.
 *
 * Persistence note: theme is stored in its own localStorage key (not inside
 * the main levelshift_data blob) so it applies instantly on boot — before the
 * Svelte app mounts — avoiding a flash of the wrong theme.
 */

import { writable } from 'svelte/store';

const THEME_KEY = 'levelshift_theme';
const DARK_COLOR = '#0d1117';
const LIGHT_COLOR = '#ffffff';

/** @returns {'dark'|'light'} */
export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' ? 'light' : 'dark'; // default dark
  } catch {
    return 'dark';
  }
}

/** Apply a theme to the document and persist it. @param {'dark'|'light'} theme */
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }

  // Keep the browser UI (address bar / status bar) in sync.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? LIGHT_COLOR : DARK_COLOR);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore quota / disabled storage */
  }
}

// Svelte store other components can subscribe to.
export const theme = writable(getStoredTheme());

/** Toggle between dark and light, updating store + DOM + storage. */
export function toggleTheme() {
  theme.update((current) => {
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
  });
}

/** Set a specific theme. @param {'dark'|'light'} next */
export function setTheme(next) {
  applyTheme(next);
  theme.set(next);
}

/** Initialize theme on boot (call as early as possible). */
export function initTheme() {
  const t = getStoredTheme();
  applyTheme(t);
  theme.set(t);
}
