/**
 * LevelShift — Dynamic Timeline Engine
 * 
 * Calculates estimated completion dates based on rolling pace,
 * applies penalties for missed days, and projects best/worst cases.
 */

import { today, addDays, daysBetween, getLastNDays, isWeekend } from '../utils/dates.js';

const TOTAL_UNITS = 47;
const MISS_PENALTY_MULTIPLIER = 1.5; // Missing 1 day = 1.5 days of timeline push

/**
 * Calculate full timeline projection.
 * @param {object} progress - { completedUnits: string[] }
 * @param {object} heatmap - { 'YYYY-MM-DD': { units, minutes, mode } | null }
 * @param {object} settings - { weekendRest: boolean }
 * @returns {object} Timeline data
 */
export function calculateTimeline(progress, heatmap, settings = {}) {
  const remaining = TOTAL_UNITS - (progress.completedUnits?.length || 0);

  if (remaining <= 0) {
    return {
      estimatedCompletion: today(),
      bestCase: today(),
      worstCase: today(),
      rollingPace: 0,
      remaining: 0,
      daysActive: 0,
      daysMissed: 0,
      weeklyShift: 0
    };
  }

  const last7 = getActivityForDays(heatmap, 7, settings);
  const last14 = getActivityForDays(heatmap, 14, settings);

  // Rolling pace: units per active day (last 7 days)
  const rollingPace = last7.activeDays > 0
    ? last7.totalUnits / last7.activeDays
    : 0.5; // default assumption if no data

  // Effective pace (accounting for miss days)
  const missRate = last7.totalDays > 0 ? last7.missedDays / last7.totalDays : 0;
  const effectivePace = Math.max(0.1, rollingPace * (1 - missRate * 0.5));

  // Best case: 2 units/day, no misses
  const bestPace = 2.0;

  // Worst case: 60% of current effective pace
  const worstPace = Math.max(0.1, effectivePace * 0.6);

  // Calculate dates
  const currentEstimate = Math.ceil(remaining / effectivePace);
  const bestEstimate = Math.ceil(remaining / bestPace);
  const worstEstimate = Math.ceil(remaining / worstPace);

  // Calculate weekly shift (how much timeline moved in last 7 days)
  const weeklyShift = calculateWeeklyShift(last7, last14, remaining);

  return {
    estimatedCompletion: addDays(today(), currentEstimate),
    bestCase: addDays(today(), bestEstimate),
    worstCase: addDays(today(), worstEstimate),
    rollingPace: Math.round(effectivePace * 100) / 100,
    remaining,
    daysActive: last7.activeDays,
    daysMissed: last7.missedDays,
    weeklyShift
  };
}

/**
 * Calculate timeline penalty for missed days.
 * @param {number} missedDays - Number of consecutive days missed
 * @returns {number} Effective days lost (always > missedDays due to penalty)
 */
export function calculateMissPenalty(missedDays) {
  if (missedDays <= 0) return 0;

  // Base penalty: each missed day costs 1.5x
  // Plus compounding: recovery time needed for decayed concepts
  const basePenalty = missedDays * MISS_PENALTY_MULTIPLIER;
  const recoveryPenalty = missedDays > 3 ? Math.floor(missedDays * 0.5) : 0;

  return Math.round(basePenalty + recoveryPenalty);
}

/**
 * Generate the weekly shift report data.
 * @param {object} heatmap
 * @param {object} progress
 * @param {object} settings
 * @returns {object} Weekly report
 */
export function generateWeeklyReport(heatmap, progress, settings) {
  const thisWeek = getActivityForDays(heatmap, 7, settings);
  const lastWeek = getActivityForDays(heatmap, 14, settings, 7); // days 8-14

  const unitsThisWeek = thisWeek.totalUnits;
  const unitsLastWeek = lastWeek.totalUnits;
  const trend = unitsThisWeek - unitsLastWeek;

  return {
    unitsThisWeek,
    unitsLastWeek,
    daysActiveThisWeek: thisWeek.activeDays,
    daysMissedThisWeek: thisWeek.missedDays,
    trend, // positive = improving, negative = declining
    trendLabel: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
    penaltyDays: calculateMissPenalty(thisWeek.missedDays)
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get activity data for last N days from heatmap.
 */
function getActivityForDays(heatmap, days, settings = {}, offset = 0) {
  const dates = getLastNDays(days + offset).slice(0, days);
  let totalUnits = 0;
  let totalMinutes = 0;
  let activeDays = 0;
  let missedDays = 0;
  let totalDays = 0;

  for (const date of dates) {
    // Skip weekends if weekend rest is enabled
    if (settings.weekendRest && isWeekend(date)) continue;

    totalDays++;
    const entry = heatmap[date];

    if (entry && entry.units > 0) {
      totalUnits += entry.units;
      totalMinutes += entry.minutes || 0;
      activeDays++;
    } else if (entry && entry.mode === 'tired') {
      // Tired mode counts as active (prevents penalty) but 0 units
      activeDays++;
    } else {
      missedDays++;
    }
  }

  return { totalUnits, totalMinutes, activeDays, missedDays, totalDays };
}

/**
 * Calculate how much the timeline shifted this week vs last week.
 */
function calculateWeeklyShift(thisWeek, lastWeek, remaining) {
  const thisPace = thisWeek.activeDays > 0 ? thisWeek.totalUnits / thisWeek.activeDays : 0.3;
  const lastPace = lastWeek.activeDays > 0 ? lastWeek.totalUnits / lastWeek.activeDays : 0.3;

  const thisEstimate = thisPace > 0 ? Math.ceil(remaining / thisPace) : 999;
  const lastEstimate = lastPace > 0 ? Math.ceil(remaining / lastPace) : 999;

  return thisEstimate - lastEstimate; // negative = gained days, positive = lost days
}
