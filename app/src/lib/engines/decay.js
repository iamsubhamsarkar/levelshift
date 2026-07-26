/**
 * LevelShift — Memory Decay Engine
 * 
 * Calculates how much a concept's memory strength has decayed
 * since it was last practiced, using exponential decay based on
 * the concept's stability (interval × easeFactor).
 */

import { today, daysBetween } from '../utils/dates.js';

/**
 * Calculate current memory strength after decay.
 * @param {object} concept - Concept state with lastPracticed, interval, easeFactor, strength
 * @param {string} [asOfDate] - Date to calculate decay for (defaults to today)
 * @returns {number} Current strength (0-100)
 */
export function calculateDecay(concept, asOfDate = null) {
  const { lastPracticed, interval, easeFactor, strength } = concept;

  if (!lastPracticed) return 0;

  const referenceDate = asOfDate || today();
  const daysSince = daysBetween(lastPracticed, referenceDate);

  if (daysSince <= 0) return strength;

  // Half-life: how many days until strength drops to 50%
  // Stronger memories (higher interval × easeFactor) decay slower
  const halfLife = Math.max(1, interval * (easeFactor || 2.5) * 0.7);

  // Exponential decay: strength × e^(-λt) where λ = ln(2)/halfLife
  const decayRate = Math.log(2) / halfLife;
  const retention = Math.exp(-decayRate * daysSince);
  const currentStrength = Math.round(strength * retention);

  return Math.max(0, Math.min(100, currentStrength));
}

/**
 * Apply decay to all concepts and return updated states.
 * Does NOT mutate the input — returns new object.
 * @param {object} concepts - All concept states
 * @returns {object} Updated concepts with decayed strengths
 */
export function applyDecayToAll(concepts) {
  const updated = {};

  for (const [id, data] of Object.entries(concepts)) {
    const decayedStrength = calculateDecay(data);
    updated[id] = {
      ...data,
      currentStrength: decayedStrength // separate from stored 'strength' — this is the live value
    };
  }

  return updated;
}

/**
 * Get concepts that have decayed below a threshold.
 * @param {object} concepts
 * @param {number} threshold - Minimum acceptable strength (default 40)
 * @returns {Array<{id: string, strength: number, decayedTo: number, daysSince: number}>}
 */
export function getDecayingConcepts(concepts, threshold = 40) {
  const decaying = [];

  for (const [id, data] of Object.entries(concepts)) {
    if (!data.lastPracticed) continue;

    const current = calculateDecay(data);
    if (current < threshold && data.strength > threshold) {
      decaying.push({
        id,
        originalStrength: data.strength,
        decayedTo: current,
        daysSince: daysBetween(data.lastPracticed, today()),
        critical: current < 25
      });
    }
  }

  // Sort by most decayed first
  return decaying.sort((a, b) => a.decayedTo - b.decayedTo);
}

/**
 * Generate decay log entries for the dashboard.
 * @param {object} concepts
 * @returns {Array<{id: string, message: string, severity: 'warn'|'critical', daysAgo: number}>}
 */
export function generateDecayLog(concepts) {
  const log = [];

  for (const [id, data] of Object.entries(concepts)) {
    if (!data.lastPracticed || !data.strength) continue;

    const current = calculateDecay(data);
    const drop = data.strength - current;
    const daysAgo = daysBetween(data.lastPracticed, today());

    if (drop < 10 || daysAgo < 2) continue; // Ignore tiny/recent drops

    const conceptName = id.replace(/\./g, ' > ').replace(/\b\w/g, l => l.toUpperCase());

    if (current < 25) {
      log.push({
        id,
        message: `${conceptName}: CRITICAL — dropped below 25%`,
        severity: 'critical',
        strengthFrom: data.strength,
        strengthTo: current,
        daysAgo
      });
    } else if (current < 50) {
      log.push({
        id,
        message: `${conceptName}: ${data.strength}% → ${current}%`,
        severity: 'warn',
        strengthFrom: data.strength,
        strengthTo: current,
        daysAgo
      });
    }
  }

  // Most critical first
  return log.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return a.strengthTo - b.strengthTo;
  });
}
