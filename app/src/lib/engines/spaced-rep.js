/**
 * LevelShift — SM-2 Spaced Repetition Engine
 * 
 * Based on the SuperMemo SM-2 algorithm.
 * Calculates optimal review intervals based on self-rated recall quality.
 * 
 * Rating scale:
 *   0 = Complete blackout (forgot entirely)
 *   1 = Incorrect, but recognized after seeing answer
 *   2 = Incorrect, but answer felt familiar
 *   3 = Correct with significant difficulty
 *   4 = Correct with minor hesitation
 *   5 = Perfect recall, instant
 */

import { addDays, today } from '../utils/dates.js';

/**
 * Calculate next review parameters after a review session.
 * @param {object} concept - Current concept state
 * @param {number} rating - Quality of recall (0-5)
 * @returns {object} Updated concept parameters
 */
export function calculateNextReview(concept, rating) {
  let {
    repetitions = 0,
    easeFactor = 2.5,
    interval = 1,
    strength = 0
  } = concept;

  // Rating must be between 0-5
  rating = Math.max(0, Math.min(5, rating));

  if (rating < 3) {
    // Failed recall — reset repetitions, short interval
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall — increase interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else if (repetitions === 2) {
      interval = 7;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  // Cap interval at 180 days
  interval = Math.min(interval, 180);

  // Calculate memory strength (0-100%)
  // Strength grows with successful repetitions
  if (rating >= 3) {
    strength = Math.min(100, Math.round(20 + (repetitions / 6) * 80));
  } else {
    strength = Math.max(0, strength - 30);
  }

  return {
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    strength,
    lastPracticed: today(),
    nextReview: addDays(today(), interval)
  };
}

/**
 * Convert simplified rating (0-3) to SM-2 scale (0-5).
 * Used by the UI which shows: Forgot / Hard / Good / Easy
 * @param {'forgot'|'hard'|'good'|'easy'} label
 * @returns {number} SM-2 rating (0-5)
 */
export function labelToRating(label) {
  const map = {
    'forgot': 1,
    'hard': 3,
    'good': 4,
    'easy': 5
  };
  return map[label] || 3;
}

/**
 * Get all concepts due for review today.
 * @param {object} concepts - All concept states { conceptId: { nextReview, strength, ... } }
 * @returns {string[]} Array of concept IDs due for review
 */
export function getDueReviews(concepts) {
  const now = today();
  return Object.entries(concepts)
    .filter(([_, data]) => data.nextReview && data.nextReview <= now)
    .sort((a, b) => a[1].strength - b[1].strength) // weakest first
    .map(([id]) => id);
}

/**
 * Get the number of overdue reviews.
 * @param {object} concepts
 * @returns {number}
 */
export function getOverdueCount(concepts) {
  return getDueReviews(concepts).length;
}

/**
 * Check if a concept is considered "mastered" (stable in long-term memory).
 * @param {object} concept
 * @returns {boolean}
 */
export function isMastered(concept) {
  return concept.repetitions >= 5 && concept.strength >= 90 && concept.interval >= 30;
}
