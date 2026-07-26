/**
 * LevelShift — Scoring Engine
 * 
 * Handles XP calculations, streak mechanics, readiness score,
 * and interview credit management.
 */

import { today, daysBetween } from '../utils/dates.js';
import { calculateDecay } from './decay.js';

// ─── XP System ────────────────────────────────────────────────────────────────

const XP_REWARDS = {
  cardComplete: 5,
  cardCorrect: 10,
  cardPerfect: 15,      // answered instantly/correctly on first try
  unitComplete: 50,
  streakDay: 10,        // bonus for each consecutive day
  streakMilestone7: 100,
  streakMilestone14: 200,
  streakMilestone30: 500,
  explainBack: 20,      // bonus for typing an explanation
  challengeComplete: 30
};

const XP_PENALTIES = {
  perDecayedConcept: -5,  // per concept below 40% on dashboard load
  streakBreak: -50
};

/**
 * Calculate XP reward for a completed action.
 * @param {'cardComplete'|'cardCorrect'|'cardPerfect'|'unitComplete'|'explainBack'|'challengeComplete'} action
 * @param {object} context - Additional context (streak length, etc.)
 * @returns {number} XP earned (can be negative for penalties)
 */
export function calculateXP(action, context = {}) {
  const base = XP_REWARDS[action] || 0;

  // Streak multiplier: longer streaks earn slightly more XP
  const streakMultiplier = context.streak ? 1 + Math.min(context.streak * 0.02, 0.5) : 1;

  return Math.round(base * streakMultiplier);
}

/**
 * Calculate XP loss from decay penalties.
 * @param {object} concepts - All concept states
 * @returns {number} Total XP penalty (negative number)
 */
export function calculateDecayPenalty(concepts) {
  let penalty = 0;
  for (const data of Object.values(concepts)) {
    if (!data.lastPracticed) continue;
    const current = calculateDecay(data);
    if (current < 40 && data.strength >= 40) {
      penalty += XP_PENALTIES.perDecayedConcept;
    }
  }
  return penalty;
}

// ─── Streak System ────────────────────────────────────────────────────────────

/**
 * Determine streak status based on last activity.
 * @param {object} streakData
 * @returns {object} { status, daysInactive, shouldFreeze }
 */
export function getStreakStatus(streakData) {
  const { lastActiveDate, current, freezesAvailable } = streakData;

  if (!lastActiveDate) {
    return { status: 'new', daysInactive: 0, shouldFreeze: false };
  }

  const inactive = daysBetween(lastActiveDate, today());

  if (inactive === 0) {
    return { status: 'active', daysInactive: 0, shouldFreeze: false };
  }

  if (inactive === 1) {
    return { status: 'at_risk', daysInactive: 1, shouldFreeze: freezesAvailable > 0 };
  }

  return {
    status: 'broken',
    daysInactive: inactive,
    shouldFreeze: inactive === 1 && freezesAvailable > 0
  };
}

/**
 * Check if a streak milestone was just reached.
 * @param {number} streakLength
 * @returns {object|null} Milestone info or null
 */
export function checkStreakMilestone(streakLength) {
  const milestones = [
    { days: 7, label: '1 Week', xp: XP_REWARDS.streakMilestone7, unlock: 'streak_freeze' },
    { days: 14, label: '2 Weeks', xp: XP_REWARDS.streakMilestone14, unlock: 'interview_mode' },
    { days: 30, label: '1 Month', xp: XP_REWARDS.streakMilestone30, unlock: 'export_badge' },
    { days: 60, label: '2 Months', xp: 1000, unlock: 'permanent_interview' },
    { days: 90, label: '3 Months', xp: 2000, unlock: 'mastery_badge' }
  ];

  return milestones.find(m => m.days === streakLength) || null;
}

// ─── Readiness Score ──────────────────────────────────────────────────────────

/**
 * Calculate overall interview readiness score (0-100).
 * Weighted combination of completion, concept strength, and consistency.
 * @param {object} progress
 * @param {object} concepts
 * @param {object} streakData
 * @returns {object} { score, breakdown, verdict }
 */
export function calculateReadiness(progress, concepts, streakData) {
  // Weight distribution
  const WEIGHTS = {
    completion: 0.30,   // How much content covered
    strength: 0.40,     // Average concept memory strength
    consistency: 0.15,  // Streak-based consistency
    coverage: 0.15      // Coverage across all 5 topic areas
  };

  // 1. Completion score
  const completionScore = (progress.completedUnits.length / 47) * 100;

  // 2. Average concept strength (with decay applied)
  const conceptEntries = Object.values(concepts);
  let avgStrength = 0;
  if (conceptEntries.length > 0) {
    const totalStrength = conceptEntries.reduce((sum, c) => {
      return sum + calculateDecay(c);
    }, 0);
    avgStrength = totalStrength / conceptEntries.length;
  }

  // 3. Consistency score (based on current streak vs target)
  const targetStreak = 14; // 2 weeks of consistency = full marks
  const consistencyScore = Math.min(100, (streakData.current / targetStreak) * 100);

  // 4. Coverage score (are all 5 categories being practiced?)
  const coverageScore = calculateCoverageScore(concepts);

  // Weighted total
  const score = Math.round(
    completionScore * WEIGHTS.completion +
    avgStrength * WEIGHTS.strength +
    consistencyScore * WEIGHTS.consistency +
    coverageScore * WEIGHTS.coverage
  );

  // Verdict
  let verdict;
  if (score >= 80) verdict = 'READY';
  else if (score >= 60) verdict = 'ALMOST';
  else if (score >= 40) verdict = 'IN PROGRESS';
  else verdict = 'NOT READY';

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      completion: Math.round(completionScore),
      strength: Math.round(avgStrength),
      consistency: Math.round(consistencyScore),
      coverage: Math.round(coverageScore)
    },
    verdict
  };
}

/**
 * Calculate how evenly the user is covering all topic categories.
 * Penalizes if one area is strong but others are neglected.
 */
function calculateCoverageScore(concepts) {
  const categories = { java: [], dsa: [], api: [], restassured: [], selenium: [] };

  for (const [id, data] of Object.entries(concepts)) {
    // Determine category from concept ID
    let cat;
    if (id.startsWith('basics.') || id.startsWith('oop.') || id.startsWith('collections.') ||
        id.startsWith('exceptions.') || id.startsWith('java8.')) cat = 'java';
    else if (id.startsWith('dsa.')) cat = 'dsa';
    else if (id.startsWith('http.') || id.startsWith('rest.') || id.startsWith('apistrategy.')) cat = 'api';
    else if (id.startsWith('restassured.')) cat = 'restassured';
    else if (id.startsWith('selenium.')) cat = 'selenium';
    else continue;

    if (cat) categories[cat].push(calculateDecay(data));
  }

  // Average strength per category
  const catAverages = Object.values(categories).map(strengths => {
    if (strengths.length === 0) return 0;
    return strengths.reduce((a, b) => a + b, 0) / strengths.length;
  });

  // Coverage = how balanced the categories are (penalize imbalance)
  const avg = catAverages.reduce((a, b) => a + b, 0) / catAverages.length;
  if (avg === 0) return 0;

  const variance = catAverages.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / catAverages.length;
  const balanceScore = Math.max(0, 100 - Math.sqrt(variance));

  return Math.round(balanceScore * (avg / 100)); // Scale by overall level
}

// ─── Interview Credits ────────────────────────────────────────────────────────

/**
 * Check if mock interview mode should be locked.
 * @param {object} streakData
 * @param {object} credits
 * @returns {object} { locked, reason, unlockIn }
 */
export function getInterviewLockStatus(streakData, credits) {
  if (streakData.current >= 5 && credits.available > 0) {
    return { locked: false, reason: null, unlockIn: 0 };
  }

  if (credits.available === 0) {
    return {
      locked: true,
      reason: 'No interview credits available. Practice daily to earn credits.',
      unlockIn: 5 - streakData.current
    };
  }

  return {
    locked: true,
    reason: `Requires 5-day streak. Current: ${streakData.current} days.`,
    unlockIn: 5 - streakData.current
  };
}
