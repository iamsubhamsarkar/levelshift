/**
 * LevelShift — Punishment & Reward State Machine
 * 
 * Manages feature locking, heatmap coloring, and consequence
 * escalation based on consistency.
 */

import { today, daysBetween } from '../utils/dates.js';
import { calculateReadiness } from './scoring.js';

// ─── Feature Lock Rules ───────────────────────────────────────────────────────

const LOCK_THRESHOLDS = {
  interviewMode: { minStreak: 5, minReadiness: 70 },
  proveMode: { minStreak: 0, minReadiness: 50 },
  allFeatures: { minStreak: 0, minReadiness: 30 }
};

/**
 * Determine which features are currently locked.
 * @param {object} streakData
 * @param {object} readiness - { score }
 * @param {object} credits
 * @returns {object} Feature lock states
 */
export function getFeatureLocks(streakData, readiness, credits) {
  return {
    interviewMode: {
      locked: streakData.current < LOCK_THRESHOLDS.interviewMode.minStreak ||
              readiness.score < LOCK_THRESHOLDS.interviewMode.minReadiness ||
              credits.available <= 0,
      reason: getInterviewLockReason(streakData, readiness, credits)
    },
    proveMode: {
      locked: readiness.score < LOCK_THRESHOLDS.proveMode.minReadiness,
      reason: readiness.score < 50 ? 'Readiness below 50%. Practice to unlock.' : null
    },
    dashboard: {
      degraded: readiness.score < LOCK_THRESHOLDS.allFeatures.minReadiness,
      reason: readiness.score < 30 ? 'At this rate, you will not be ready.' : null
    }
  };
}

function getInterviewLockReason(streakData, readiness, credits) {
  const reasons = [];
  if (streakData.current < 5) reasons.push(`Need ${5 - streakData.current} more streak days`);
  if (readiness.score < 70) reasons.push(`Readiness: ${readiness.score}% (need 70%)`);
  if (credits.available <= 0) reasons.push('No credits available');
  return reasons.length > 0 ? reasons.join(' • ') : null;
}

// ─── Heatmap State ────────────────────────────────────────────────────────────

/**
 * Determine heatmap square color for a given date.
 * @param {string} date - YYYY-MM-DD
 * @param {object} heatmap - Full heatmap data
 * @param {object} settings - { weekendRest }
 * @returns {'active'|'tired'|'missed'|'critical'|'rest'|'future'}
 */
export function getHeatmapColor(date, heatmap, settings = {}) {
  const now = today();

  // Future dates
  if (daysBetween(now, date) > 0) return 'future';

  // Weekend rest
  if (settings.weekendRest) {
    const day = new Date(date).getDay();
    if (day === 0 || day === 6) return 'rest';
  }

  const entry = heatmap[date];

  if (entry && entry.units > 0) return 'active';
  if (entry && entry.mode === 'tired') return 'tired';

  // Check consecutive misses
  if (!entry || entry === null) {
    const consecutiveMisses = countConsecutiveMissesBefore(date, heatmap, settings);
    if (consecutiveMisses >= 2) return 'critical'; // 3+ total (including this one) = red
    return 'missed';
  }

  return 'missed';
}

/**
 * Count consecutive missed days before a given date.
 */
function countConsecutiveMissesBefore(date, heatmap, settings) {
  let count = 0;
  let checkDate = date;

  for (let i = 1; i <= 7; i++) {
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    const prev = d.toISOString().split('T')[0];

    // Skip weekends if rest enabled
    if (settings.weekendRest) {
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
    }

    const entry = heatmap[prev];
    if (!entry || (entry && entry.units === 0 && entry.mode !== 'tired')) {
      count++;
      checkDate = prev;
    } else {
      break;
    }
  }

  return count;
}

// ─── Consequence Escalation ───────────────────────────────────────────────────

/**
 * Calculate consequences for N missed days.
 * @param {number} missedDays - Consecutive days missed
 * @returns {object} Consequence descriptor
 */
export function getConsequences(missedDays) {
  if (missedDays <= 0) {
    return { level: 'none', xpLoss: 0, timelinePush: 0, actions: [] };
  }

  if (missedDays === 1) {
    return {
      level: 'warning',
      xpLoss: 20,
      timelinePush: 1.5,
      actions: ['decay_starts'],
      message: 'Concepts are starting to fade. Quick session today prevents damage.'
    };
  }

  if (missedDays === 2) {
    return {
      level: 'danger',
      xpLoss: 50,
      timelinePush: 3.5,
      actions: ['heatmap_red', 'decay_accelerated'],
      message: 'Memory decay accelerating. 2 days of progress at risk.'
    };
  }

  if (missedDays <= 5) {
    return {
      level: 'critical',
      xpLoss: 100,
      timelinePush: missedDays * 1.5 + 2,
      actions: ['streak_reset', 'heatmap_red', 'lock_check', 'credits_lost'],
      message: `${missedDays} days missed. Streak lost. Features may lock.`
    };
  }

  // 6+ days
  return {
    level: 'severe',
    xpLoss: 200,
    timelinePush: missedDays * 2,
    actions: ['streak_reset', 'heatmap_red', 'prove_locked', 'credits_zeroed', 'massive_decay'],
    message: `${missedDays} days inactive. Major setback. Recovery needed.`
  };
}

// ─── Ghost Replay ─────────────────────────────────────────────────────────────

/**
 * Compare current performance against personal best.
 * @param {object} current - { time, score }
 * @param {object} best - { bestTime, bestScore, date }
 * @returns {object|null} Comparison result or null if no best exists
 */
export function compareWithGhost(current, best) {
  if (!best) return null;

  const timeDiff = current.time - best.bestTime;
  const scoreDiff = current.score - best.bestScore;
  const timeRatio = best.bestTime > 0 ? Math.round((current.time / best.bestTime) * 100) : 100;

  return {
    isNewBest: current.score >= best.bestScore && current.time <= best.bestTime,
    timeDiff,
    scoreDiff,
    slowerByPercent: timeRatio > 100 ? timeRatio - 100 : 0,
    fasterByPercent: timeRatio < 100 ? 100 - timeRatio : 0,
    message: generateGhostMessage(timeDiff, scoreDiff, timeRatio)
  };
}

function generateGhostMessage(timeDiff, scoreDiff, timeRatio) {
  if (timeRatio <= 100 && scoreDiff >= 0) {
    return `🔥 NEW PERSONAL BEST!`;
  }
  if (timeRatio > 150) {
    return `You are ${timeRatio - 100}% SLOWER than your peak.`;
  }
  if (timeRatio > 100) {
    return `${timeRatio - 100}% slower than your best. Keep practicing.`;
  }
  if (scoreDiff < -20) {
    return `Score dropped ${Math.abs(scoreDiff)} points from peak.`;
  }
  return 'Matching your previous performance.';
}

// ─── Streak Freeze ────────────────────────────────────────────────────────────

/**
 * Check if a streak freeze should be auto-applied.
 * @param {object} streakData
 * @param {number} missedDays
 * @returns {object} { applied, remaining }
 */
export function checkStreakFreeze(streakData, missedDays) {
  if (missedDays === 1 && streakData.freezesAvailable > 0 && streakData.current > 0) {
    return {
      applied: true,
      remaining: streakData.freezesAvailable - 1,
      message: `Streak freeze applied! Your ${streakData.current}-day streak is protected.`
    };
  }

  return { applied: false, remaining: streakData.freezesAvailable, message: null };
}
