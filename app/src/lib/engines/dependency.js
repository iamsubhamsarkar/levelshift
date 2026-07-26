/**
 * LevelShift — Dependency Resolver (Invisible Review Engine)
 * 
 * Decides which exercise variants to show based on decaying prerequisites.
 * The user never sees "review" — they just get exercises that happen to
 * require old knowledge to solve.
 */

import { calculateDecay } from './decay.js';
import conceptsData from '../data/concepts.json';

/**
 * Get the weakest prerequisite concepts for a given unit.
 * Used to select exercise variants that reinforce decaying skills.
 * 
 * @param {string} unitId - Current unit being practiced
 * @param {object} conceptStrengths - All concept states from store
 * @param {number} maxResults - Maximum concepts to return
 * @returns {Array<{id: string, strength: number}>} Weakest prereqs sorted by strength
 */
export function getWeakPrerequisites(unitId, conceptStrengths, maxResults = 3) {
  // Find which concepts this unit teaches
  const unitConcepts = findConceptsForUnit(unitId);
  
  // Collect all prerequisites for those concepts
  const prereqs = new Set();
  for (const conceptId of unitConcepts) {
    const def = conceptsData.concepts[conceptId];
    if (def && def.prereqs) {
      def.prereqs.forEach(p => prereqs.add(p));
    }
  }

  // Score each prerequisite by current (decayed) strength
  const scored = [];
  for (const prereqId of prereqs) {
    const state = conceptStrengths[prereqId];
    if (!state) {
      // Never practiced — treat as weak
      scored.push({ id: prereqId, strength: 0 });
    } else {
      const current = calculateDecay(state);
      scored.push({ id: prereqId, strength: current });
    }
  }

  // Return weakest first
  return scored
    .sort((a, b) => a.strength - b.strength)
    .slice(0, maxResults);
}

/**
 * Select the best exercise variant for a card based on what needs reinforcement.
 * 
 * @param {object} card - Card data with optional variants
 * @param {object} conceptStrengths - User's concept states
 * @returns {object} The selected exercise variant (or default)
 */
export function selectExerciseVariant(card, conceptStrengths) {
  if (!card.variants || card.variants.length === 0) {
    return card; // No variants available, return as-is
  }

  // Find what's decaying that this card could reinforce
  const weakConcepts = getWeakPrerequisites(card.unitId, conceptStrengths, 5);
  const weakIds = new Set(weakConcepts.filter(c => c.strength < 60).map(c => c.id));

  if (weakIds.size === 0) {
    return card; // Nothing needs reinforcement, use default
  }

  // Score each variant by how many weak concepts it reinforces
  let bestVariant = card;
  let bestScore = 0;

  for (const variant of card.variants) {
    if (!variant.reinforces) continue;
    const score = variant.reinforces.filter(id => weakIds.has(id)).length;
    if (score > bestScore) {
      bestScore = score;
      bestVariant = { ...card, ...variant, isVariant: true };
    }
  }

  return bestVariant;
}

/**
 * Generate a "Daily Puzzle" that targets the weakest concept.
 * Disguised as a fresh challenge, not a review.
 * 
 * @param {object} conceptStrengths - User's concept states
 * @param {string[]} completedUnits - Already completed units
 * @returns {object|null} Puzzle descriptor or null if nothing needs review
 */
export function generateDailyPuzzle(conceptStrengths, completedUnits) {
  // Find weakest concepts from completed content
  const candidates = [];

  for (const [id, state] of Object.entries(conceptStrengths)) {
    if (!state.lastPracticed) continue;
    
    const current = calculateDecay(state);
    if (current < 50 && state.strength >= 30) { // Was known, now fading
      candidates.push({
        conceptId: id,
        strength: current,
        unit: conceptsData.concepts[id]?.unit || null
      });
    }
  }

  if (candidates.length === 0) return null;

  // Pick the weakest
  candidates.sort((a, b) => a.strength - b.strength);
  const target = candidates[0];

  return {
    type: 'daily_puzzle',
    targetConcept: target.conceptId,
    strength: target.strength,
    sourceUnit: target.unit,
    disguise: getPuzzleDisguise(target.conceptId)
  };
}

/**
 * Get all concepts that a given unit's exercises could reinforce.
 * Used for silent scoring after exercise completion.
 * 
 * @param {string} unitId
 * @returns {string[]} Concept IDs that this unit reinforces
 */
export function getReinforcedConcepts(unitId) {
  const teaches = findConceptsForUnit(unitId);
  const reinforces = new Set(teaches);

  // Also include prerequisites (using them = reinforcing them)
  for (const conceptId of teaches) {
    const def = conceptsData.concepts[conceptId];
    if (def && def.prereqs) {
      def.prereqs.forEach(p => reinforces.add(p));
    }
  }

  return Array.from(reinforces);
}

/**
 * Calculate how much a concept should be silently boosted when used as a prerequisite.
 * Less boost than direct practice, but still prevents decay.
 * 
 * @param {object} conceptState
 * @param {boolean} directPractice - true if concept was directly tested
 * @returns {number} Strength points to add (0-15)
 */
export function getReinforcementBoost(conceptState, directPractice = false) {
  if (directPractice) return 10;

  // Indirect reinforcement (concept was used but not directly tested)
  const current = calculateDecay(conceptState);

  // Less boost if already strong
  if (current >= 80) return 2;
  if (current >= 60) return 5;
  if (current >= 40) return 8;
  return 10; // Weak concepts get more boost from indirect use
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Find all concept IDs taught by a given unit.
 */
function findConceptsForUnit(unitId) {
  const results = [];
  for (const [id, def] of Object.entries(conceptsData.concepts)) {
    if (def.unit === unitId) {
      results.push(id);
    }
  }
  return results;
}

/**
 * Generate a disguise label for a daily puzzle to avoid "review" framing.
 */
function getPuzzleDisguise(conceptId) {
  const disguises = [
    '🧩 Quick Challenge',
    '⚡ Speed Round',
    '🎯 Brain Teaser',
    '💡 Pop Quiz',
    '🔥 Warm-Up Drill'
  ];

  // Deterministic selection based on concept ID (consistent per concept)
  const hash = conceptId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return disguises[hash % disguises.length];
}
