/**
 * LevelShift — Gamification Manager
 * 
 * Runs on every app load. Processes missed days, applies penalties,
 * updates timeline, generates decay log.
 * Wires the engines into the live app state.
 */

import { get } from 'svelte/store';
import { progress, streak, heatmap, concepts, timeline, interviewCredits, userSettings, persistAll } from '../stores/progress.js';
import { calculateTimeline } from '../engines/timeline.js';
import { calculateDecay, applyDecayToAll } from '../engines/decay.js';
import { getConsequences, checkStreakFreeze } from '../engines/punishment.js';
import { calculateReadiness, getStreakStatus, checkStreakMilestone } from '../engines/scoring.js';
import { today, daysBetween } from '../utils/dates.js';

/**
 * Initialize gamification on app load.
 * Processes any missed days and updates all state.
 * @returns {object|null} Notification data if something happened while away
 */
export function initializeGamification() {
  const streakData = get(streak);
  const notifications = [];

  // Check streak status
  const streakStatus = getStreakStatus(streakData);

  if (streakStatus.status === 'broken' || streakStatus.status === 'at_risk') {
    const missed = streakStatus.daysInactive;

    // Check for streak freeze
    const freeze = checkStreakFreeze(streakData, missed);
    if (freeze.applied) {
      streak.update(s => {
        s.freezesAvailable = freeze.remaining;
        return s;
      });
      notifications.push({ type: 'info', message: freeze.message });
    } else if (missed > 0) {
      // Apply consequences
      const consequences = getConsequences(missed);

      if (consequences.level !== 'none') {
        // Apply XP penalty
        progress.update(p => {
          p.totalXP = Math.max(0, p.totalXP + consequences.xpLoss); // xpLoss is negative
          return p;
        });

        // Reset streak if needed
        if (consequences.actions.includes('streak_reset')) {
          streak.update(s => {
            if (s.current > 0) s.longestHistory.push(s.current);
            s.current = 0;
            return s;
          });
        }

        // Lose interview credits
        if (consequences.actions.includes('credits_lost') || consequences.actions.includes('credits_zeroed')) {
          interviewCredits.update(ic => {
            ic.available = consequences.actions.includes('credits_zeroed') ? 0 : Math.max(0, ic.available - 1);
            return ic;
          });
        }

        notifications.push({
          type: consequences.level,
          message: consequences.message,
          xpLoss: consequences.xpLoss,
          timelinePush: consequences.timelinePush
        });
      }
    }
  }

  // Update timeline
  recalculateTimeline();

  // Persist
  persistAll();

  return notifications.length > 0 ? notifications : null;
}

/**
 * Called after completing a session to update all gamification state.
 * @param {object} sessionSummary - From endSession()
 */
export function processSessionComplete(sessionSummary) {
  const streakData = get(streak);

  // Check for streak milestone
  const milestone = checkStreakMilestone(streakData.current);
  if (milestone) {
    progress.update(p => {
      p.totalXP += milestone.xp;
      return p;
    });
  }

  // Recalculate readiness and timeline
  recalculateTimeline();

  // Persist everything
  persistAll();

  return milestone;
}

/**
 * Recalculate timeline based on current state.
 */
export function recalculateTimeline() {
  const progressData = get(progress);
  const heatmapData = get(heatmap);
  const settings = get(userSettings);

  const newTimeline = calculateTimeline(progressData, heatmapData, settings);
  timeline.set(newTimeline);
}

/**
 * Get current readiness data for display.
 */
export function getReadinessData() {
  const progressData = get(progress);
  const conceptsData = get(concepts);
  const streakData = get(streak);

  return calculateReadiness(progressData, conceptsData, streakData);
}
