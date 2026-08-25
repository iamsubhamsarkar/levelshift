/**
 * LevelShift — PWA install helper
 *
 * Captures the browser's `beforeinstallprompt` event so we can show our own
 * "Install app" button at a good moment, and tracks whether the app is already
 * running as an installed PWA.
 */

import { writable } from 'svelte/store';

const DISMISS_KEY = 'levelshift_install_dismissed';

/** True once the browser has offered an install prompt we can trigger. */
export const canInstall = writable(false);
/** True when running in standalone (already installed) mode. */
export const isInstalled = writable(false);

let deferredPrompt = null;

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/** Call once on app boot. */
export function initPwa() {
  if (typeof window === 'undefined') return;

  isInstalled.set(isStandalone());

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar; keep the event to trigger later from our UI.
    e.preventDefault();
    deferredPrompt = e;
    // Respect a previous "not now" dismissal.
    let dismissed = false;
    try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch {}
    if (!dismissed) canInstall.set(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    canInstall.set(false);
    isInstalled.set(true);
  });
}

/** Trigger the native install prompt. @returns {Promise<'accepted'|'dismissed'|'unavailable'>} */
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  canInstall.set(false);
  return outcome;
}

/** User clicked "not now" — hide the banner and remember it. */
export function dismissInstall() {
  canInstall.set(false);
  try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
}
