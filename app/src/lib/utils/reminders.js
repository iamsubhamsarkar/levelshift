/**
 * LevelShift — Local daily reminder
 *
 * A no-backend reminder to keep the learner's streak alive. Because LevelShift
 * is a static site with no push server, we CANNOT reliably deliver notifications
 * when the app is closed (true Web Push needs a backend — deferred to the
 * backend phase). What we CAN do reliably:
 *   1. Show an in-app nudge when the user opens the app and hasn't studied today.
 *   2. If the user granted Notification permission, fire a local notification
 *      while the tab is open (e.g. an evening reminder during a session).
 *
 * Settings persist in their own key so they are independent of the main blob.
 */

import { writable } from 'svelte/store';
import { today } from './dates.js';

const SETTINGS_KEY = 'levelshift_reminder';

function load() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function save(v) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(v)); } catch {}
}

const initial = load();

/** { enabled: boolean, time: 'HH:MM', lastNotified: 'YYYY-MM-DD' } */
export const reminderSettings = writable({
  enabled: initial.enabled === true,
  time: initial.time || '19:00',
  lastNotified: initial.lastNotified || null
});

reminderSettings.subscribe(save);

/** Current browser Notification permission, or 'unsupported'. */
export function notificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

/** Ask the browser for notification permission. @returns {Promise<string>} */
export async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Whether we should show an in-app "study today" nudge.
 * @param {string|null} lastActiveDate  from the streak store
 * @returns {boolean}
 */
export function shouldNudgeToday(lastActiveDate) {
  let enabled = false;
  const unsub = reminderSettings.subscribe((s) => { enabled = s.enabled; });
  unsub();
  if (!enabled) return false;
  return lastActiveDate !== today();
}

/**
 * Fire a local (tab-open) notification if permission is granted and the
 * scheduled time has passed today and we haven't already notified today.
 * Safe to call periodically while the app is open.
 * @param {string|null} lastActiveDate
 */
export function maybeFireLocalReminder(lastActiveDate) {
  if (notificationPermission() !== 'granted') return;

  let s;
  const unsub = reminderSettings.subscribe((v) => { s = v; });
  unsub();
  if (!s.enabled) return;

  const todayStr = today();
  if (s.lastNotified === todayStr) return;       // already reminded today
  if (lastActiveDate === todayStr) return;        // already studied today

  const now = new Date();
  const [h, m] = (s.time || '19:00').split(':').map(Number);
  const scheduled = new Date();
  scheduled.setHours(h || 19, m || 0, 0, 0);
  if (now < scheduled) return;                    // not time yet

  try {
    new Notification('LevelShift — keep your streak 🔥', {
      body: "You haven't studied today. 15 minutes keeps your streak alive.",
      icon: '/favicon.svg'
    });
    reminderSettings.update((v) => ({ ...v, lastNotified: todayStr }));
  } catch {
    /* ignore */
  }
}
