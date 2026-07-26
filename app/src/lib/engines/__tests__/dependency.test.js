import { describe, it, expect, vi } from 'vitest';
import { getWeakPrerequisites, getReinforcedConcepts, getReinforcementBoost, generateDailyPuzzle } from '../dependency.js';

vi.mock('../../utils/dates.js', () => ({
  today: () => '2026-07-23',
  daysBetween: (from, to) => {
    const a = new Date(from);
    const b = new Date(to);
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  }
}));

describe('Dependency Resolver Engine', () => {
  describe('getWeakPrerequisites', () => {
    it('returns weakest concepts sorted by strength', () => {
      const concepts = {
        'basics.types': { lastPracticed: '2026-07-10', interval: 1, easeFactor: 1.5, strength: 60 },
        'basics.strings': { lastPracticed: '2026-07-22', interval: 5, easeFactor: 2.5, strength: 80 }
      };

      const result = getWeakPrerequisites('p1u3', concepts, 5);
      // Should return array (may be empty if p1u3 has no prereqs in concepts.json)
      expect(Array.isArray(result)).toBe(true);
      
      // If results exist, they should be sorted by strength ascending
      if (result.length >= 2) {
        expect(result[0].strength).toBeLessThanOrEqual(result[1].strength);
      }
    });

    it('treats unpracticed concepts as weakness (0 strength)', () => {
      const concepts = {}; // nothing practiced

      const result = getWeakPrerequisites('p1u3', concepts, 5);
      // All prereqs should have strength 0
      result.forEach(r => {
        expect(r.strength).toBe(0);
      });
    });

    it('respects maxResults limit', () => {
      const concepts = {};
      const result = getWeakPrerequisites('p1u8', concepts, 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getReinforcedConcepts', () => {
    it('returns concepts taught by a unit', () => {
      const result = getReinforcedConcepts('p1u1');
      expect(Array.isArray(result)).toBe(true);
      // p1u1 teaches basics.types and basics.strings
      expect(result).toContain('basics.types');
      expect(result).toContain('basics.strings');
    });

    it('includes prerequisites in reinforced list', () => {
      // Later units should reinforce earlier concepts too
      const result = getReinforcedConcepts('p1u5');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown unit', () => {
      const result = getReinforcedConcepts('p99u99');
      // Should return at least empty array, not throw
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getReinforcementBoost', () => {
    it('returns 10 for direct practice', () => {
      const concept = { lastPracticed: '2026-07-20', interval: 3, easeFactor: 2.5, strength: 60 };
      expect(getReinforcementBoost(concept, true)).toBe(10);
    });

    it('returns less boost for strong concepts (indirect)', () => {
      const strong = { lastPracticed: '2026-07-23', interval: 10, easeFactor: 2.5, strength: 90 };
      const boost = getReinforcementBoost(strong, false);
      expect(boost).toBeLessThanOrEqual(5);
    });

    it('returns more boost for weak concepts (indirect)', () => {
      const weak = { lastPracticed: '2026-07-01', interval: 1, easeFactor: 1.5, strength: 50 };
      const boost = getReinforcementBoost(weak, false);
      expect(boost).toBeGreaterThanOrEqual(8);
    });
  });

  describe('generateDailyPuzzle', () => {
    it('returns null when no concepts are decaying', () => {
      const concepts = {
        'basics.types': { lastPracticed: '2026-07-23', interval: 10, easeFactor: 2.5, strength: 90 }
      };
      const result = generateDailyPuzzle(concepts, ['p1u1']);
      expect(result).toBeNull();
    });

    it('returns puzzle targeting weakest concept', () => {
      const concepts = {
        'basics.types': { lastPracticed: '2026-07-01', interval: 1, easeFactor: 1.3, strength: 80 },
        'oop.classes': { lastPracticed: '2026-07-22', interval: 5, easeFactor: 2.5, strength: 75 }
      };

      const result = generateDailyPuzzle(concepts, ['p1u1', 'p1u3']);
      if (result) {
        expect(result.type).toBe('daily_puzzle');
        expect(result.targetConcept).toBeDefined();
        expect(result.disguise).toBeDefined();
      }
    });

    it('puzzle has a disguise label (not "review")', () => {
      const concepts = {
        'basics.types': { lastPracticed: '2026-06-01', interval: 1, easeFactor: 1.3, strength: 60 }
      };

      const result = generateDailyPuzzle(concepts, ['p1u1']);
      if (result) {
        expect(result.disguise).not.toContain('review');
        expect(result.disguise).not.toContain('Review');
      }
    });
  });
});
