/**
 * LevelShift — Progress Store
 * Central state management for user progress, streak, timeline.
 */

import { writable, derived } from 'svelte/store';
import { loadData, saveData } from '../utils/storage.js';
import { today, addDays, daysBetween, formatDate } from '../utils/dates.js';

// ─── Default State ────────────────────────────────────────────────────────────

function createDefaultState() {
  const now = today();
  return {
    version: 1,
    user: {
      startDate: now,
      interviewDate: addDays(now, 60),
      weekendRest: true,
      dailyMode: 'normal', // 'full' | 'normal' | 'tired'
      onboarded: false
    },
    progress: {
      completedUnits: [],
      currentUnit: 1,
      currentCard: 0,
      currentPhase: 1,
      totalXP: 0
    },
    streak: {
      current: 0,
      longest: 0,
      longestHistory: [],
      lastActiveDate: null,
      freezesAvailable: 0,
      freezesUsed: []
    },
    heatmap: {},
    concepts: {},
    interviewCredits: {
      available: 0,
      lastEarned: null
    },
    ghostRecords: {},
    timeline: {
      estimatedCompletion: addDays(now, 60),
      rollingPace: 0,
      bestCase: addDays(now, 30),
      worstCase: addDays(now, 90)
    }
  };
}

// ─── Store Initialization ─────────────────────────────────────────────────────

const stored = loadData();
const initialState = stored || createDefaultState();

// Core writable stores
export const progress = writable(initialState.progress);
export const streak = writable(initialState.streak);
export const heatmap = writable(initialState.heatmap);
export const concepts = writable(initialState.concepts);
export const userSettings = writable(initialState.user);
export const interviewCredits = writable(initialState.interviewCredits);
export const ghostRecords = writable(initialState.ghostRecords);
export const timeline = writable(initialState.timeline);

// ─── Derived Stores ───────────────────────────────────────────────────────────

/** Readiness score (0-100) based on concept strengths and completion */
export const readinessScore = derived(
  [progress, concepts],
  ([$progress, $concepts]) => {
    const completionWeight = 0.4;
    const strengthWeight = 0.6;

    const completionScore = ($progress.completedUnits.length / 47) * 100;

    const conceptEntries = Object.values($concepts);
    const avgStrength = conceptEntries.length > 0
      ? conceptEntries.reduce((sum, c) => sum + (c.strength || 0), 0) / conceptEntries.length
      : 0;

    return Math.round(completionScore * completionWeight + avgStrength * strengthWeight);
  }
);

/** Days until interview */
export const daysUntilInterview = derived(userSettings, ($settings) => {
  return daysBetween(today(), $settings.interviewDate);
});

/** Timeline formatted for display */
export const timelineDisplay = derived(timeline, ($timeline) => ({
  bestCase: formatDate($timeline.bestCase),
  currentPace: formatDate($timeline.estimatedCompletion),
  worstCase: formatDate($timeline.worstCase)
}));

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Initialize app on first load — check for streak breaks, calculate decay. */
export function initializeApp() {
  const data = loadData();
  if (!data) {
    // First time user — save defaults
    persistAll();
    return;
  }

  // Check if streak needs updating (missed days)
  const lastActive = data.streak.lastActiveDate;
  if (lastActive && lastActive !== today()) {
    const missed = daysBetween(lastActive, today()) - 1;
    if (missed > 0) {
      handleMissedDays(missed);
    }
  }
}

/** Record that user was active today. */
export function recordActivity(mode = 'normal', unitsCompleted = 0, minutesSpent = 0) {
  const now = today();

  heatmap.update(h => {
    h[now] = { units: unitsCompleted, minutes: minutesSpent, mode };
    return h;
  });

  streak.update(s => {
    if (s.lastActiveDate === now) return s; // Already counted today

    if (s.lastActiveDate === addDays(now, -1) || !s.lastActiveDate) {
      // Consecutive day or first day
      s.current += 1;
    } else {
      // Streak was already broken (handled by handleMissedDays)
      s.current = 1;
    }

    s.lastActiveDate = now;
    if (s.current > s.longest) {
      s.longest = s.current;
    }

    // Earn streak freeze every 7 days
    if (s.current > 0 && s.current % 7 === 0 && s.freezesAvailable < 2) {
      s.freezesAvailable += 1;
    }

    return s;
  });

  // Earn interview credit
  interviewCredits.update(ic => {
    if (ic.available < 3) {
      ic.available += 1;
      ic.lastEarned = now;
    }
    return ic;
  });

  persistAll();
}

/** Handle missed days — apply penalties. */
function handleMissedDays(missed) {
  streak.update(s => {
    // Check if freeze available
    if (missed === 1 && s.freezesAvailable > 0) {
      s.freezesAvailable -= 1;
      s.freezesUsed.push(today());
      return s; // Freeze protects streak
    }

    // Streak breaks
    if (s.current > 0) {
      s.longestHistory.push(s.current);
    }
    s.current = 0;
    return s;
  });

  // Lose interview credits for extended absence
  if (missed >= 3) {
    interviewCredits.update(ic => {
      ic.available = Math.max(0, ic.available - Math.floor(missed / 3));
      return ic;
    });
  }

  persistAll();
}

/** Complete a unit. */
export function completeUnit(unitId, xpEarned = 50) {
  progress.update(p => {
    if (!p.completedUnits.includes(unitId)) {
      p.completedUnits.push(unitId);
    }
    p.totalXP += xpEarned;
    p.currentCard = 0;
    p.currentUnit += 1;
    return p;
  });

  persistAll();
}

/** Update concept strength after practice. */
export function updateConceptStrength(conceptId, rating) {
  concepts.update(c => {
    if (!c[conceptId]) {
      c[conceptId] = { strength: 0, lastPracticed: null, repetitions: 0, easeFactor: 2.5, interval: 1, nextReview: today() };
    }
    // SM-2 logic is in the engine — this just stores the result
    c[conceptId].lastPracticed = today();
    return c;
  });

  persistAll();
}

/** Persist all store values to localStorage. */
export function persistAll() {
  let state;

  // Read current values from stores
  const unsubscribers = [];
  let p, s, h, c, u, ic, gr, t;

  unsubscribers.push(progress.subscribe(v => p = v));
  unsubscribers.push(streak.subscribe(v => s = v));
  unsubscribers.push(heatmap.subscribe(v => h = v));
  unsubscribers.push(concepts.subscribe(v => c = v));
  unsubscribers.push(userSettings.subscribe(v => u = v));
  unsubscribers.push(interviewCredits.subscribe(v => ic = v));
  unsubscribers.push(ghostRecords.subscribe(v => gr = v));
  unsubscribers.push(timeline.subscribe(v => t = v));

  unsubscribers.forEach(unsub => unsub());

  state = {
    version: 1,
    user: u,
    progress: p,
    streak: s,
    heatmap: h,
    concepts: c,
    interviewCredits: ic,
    ghostRecords: gr,
    timeline: t
  };

  saveData(state);
}
