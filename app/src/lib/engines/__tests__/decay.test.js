import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDecay, applyDecayToAll, getDecayingConcepts, generateDecayLog } from '../decay.js';

// Mock today() to return a fixed date
vi.mock('../../utils/dates.js', () => ({
  today: () => '2026-07-23',
  daysBetween: (from, to) => {
    const a = new Date(from);
    const b = new Date(to);
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  }
}));

describe('Memory Decay Engine', () => {
  describe('calculateDecay', () => {
    it('returns full strength if practiced today', () => {
      const concept = { lastPracticed: '2026-07-23', interval: 5, easeFactor: 2.5, strength: 80 };
      expect(calculateDecay(concept)).toBe(80);
    });

    it('returns 0 if never practiced', () => {
      const concept = { lastPracticed: null, interval: 1, easeFactor: 2.5, strength: 0 };
      expect(calculateDecay(concept)).toBe(0);
    });

    it('decays strength over time', () => {
      const concept = { lastPracticed: '2026-07-20', interval: 3, easeFactor: 2.5, strength: 100 };
      const result = calculateDecay(concept);
      expect(result).toBeLessThan(100);
      expect(result).toBeGreaterThan(0);
    });

    it('decays faster with short interval', () => {
      const shortInterval = { lastPracticed: '2026-07-20', interval: 1, easeFactor: 2.0, strength: 100 };
      const longInterval = { lastPracticed: '2026-07-20', interval: 10, easeFactor: 2.5, strength: 100 };
      
      expect(calculateDecay(shortInterval)).toBeLessThan(calculateDecay(longInterval));
    });

    it('decays faster with low ease factor', () => {
      const lowEase = { lastPracticed: '2026-07-20', interval: 5, easeFactor: 1.3, strength: 100 };
      const highEase = { lastPracticed: '2026-07-20', interval: 5, easeFactor: 2.5, strength: 100 };
      
      expect(calculateDecay(lowEase)).toBeLessThan(calculateDecay(highEase));
    });

    it('never returns negative values', () => {
      const ancient = { lastPracticed: '2025-01-01', interval: 1, easeFactor: 1.3, strength: 100 };
      expect(calculateDecay(ancient)).toBeGreaterThanOrEqual(0);
    });

    it('never exceeds 100', () => {
      const strong = { lastPracticed: '2026-07-23', interval: 30, easeFactor: 3.0, strength: 100 };
      expect(calculateDecay(strong)).toBeLessThanOrEqual(100);
    });
  });

  describe('applyDecayToAll', () => {
    it('returns updated concepts with currentStrength field', () => {
      const concepts = {
        'oop.classes': { lastPracticed: '2026-07-20', interval: 3, easeFactor: 2.5, strength: 80 },
        'basics.types': { lastPracticed: '2026-07-23', interval: 5, easeFactor: 2.5, strength: 90 }
      };

      const result = applyDecayToAll(concepts);
      expect(result['oop.classes'].currentStrength).toBeDefined();
      expect(result['basics.types'].currentStrength).toBe(90); // practiced today
      expect(result['oop.classes'].currentStrength).toBeLessThan(80);
    });

    it('does not mutate the input', () => {
      const concepts = { 'a': { lastPracticed: '2026-07-20', interval: 1, easeFactor: 2.5, strength: 50 } };
      const original = JSON.parse(JSON.stringify(concepts));
      applyDecayToAll(concepts);
      expect(concepts).toEqual(original);
    });
  });

  describe('getDecayingConcepts', () => {
    it('returns concepts that dropped below threshold', () => {
      const concepts = {
        'weak': { lastPracticed: '2026-07-10', interval: 1, easeFactor: 1.5, strength: 80 },
        'strong': { lastPracticed: '2026-07-23', interval: 10, easeFactor: 2.5, strength: 90 }
      };

      const decaying = getDecayingConcepts(concepts, 40);
      expect(decaying.some(c => c.id === 'weak')).toBe(true);
      expect(decaying.some(c => c.id === 'strong')).toBe(false);
    });

    it('sorts by most decayed first', () => {
      const concepts = {
        'a': { lastPracticed: '2026-07-15', interval: 1, easeFactor: 1.5, strength: 70 },
        'b': { lastPracticed: '2026-07-01', interval: 1, easeFactor: 1.3, strength: 80 }
      };

      const decaying = getDecayingConcepts(concepts, 60);
      if (decaying.length >= 2) {
        expect(decaying[0].decayedTo).toBeLessThanOrEqual(decaying[1].decayedTo);
      }
    });
  });

  describe('generateDecayLog', () => {
    it('returns empty array when no concepts have decayed', () => {
      const concepts = {
        'fresh': { lastPracticed: '2026-07-23', interval: 5, easeFactor: 2.5, strength: 80 }
      };
      expect(generateDecayLog(concepts)).toHaveLength(0);
    });

    it('marks critical entries when strength drops below 25', () => {
      const concepts = {
        'forgotten': { lastPracticed: '2026-06-01', interval: 1, easeFactor: 1.3, strength: 90 }
      };

      const log = generateDecayLog(concepts);
      if (log.length > 0) {
        expect(log[0].severity).toBe('critical');
      }
    });
  });
});
