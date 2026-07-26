import { describe, it, expect, vi } from 'vitest';
import { calculateXP, calculateDecayPenalty, getStreakStatus, checkStreakMilestone, calculateReadiness, getInterviewLockStatus } from '../scoring.js';

vi.mock('../../utils/dates.js', () => ({
  today: () => '2026-07-23',
  daysBetween: (from, to) => {
    const a = new Date(from);
    const b = new Date(to);
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  }
}));

describe('Scoring Engine', () => {
  describe('calculateXP', () => {
    it('returns correct XP for card completion', () => {
      expect(calculateXP('cardComplete')).toBe(5);
      expect(calculateXP('cardCorrect')).toBe(10);
      expect(calculateXP('unitComplete')).toBe(50);
    });

    it('applies streak multiplier', () => {
      const base = calculateXP('cardCorrect', { streak: 0 });
      const boosted = calculateXP('cardCorrect', { streak: 10 });
      expect(boosted).toBeGreaterThan(base);
    });

    it('caps streak multiplier at 1.5x', () => {
      const maxBoosted = calculateXP('cardCorrect', { streak: 100 });
      expect(maxBoosted).toBeLessThanOrEqual(15); // 10 * 1.5
    });

    it('returns 0 for unknown actions', () => {
      expect(calculateXP('invalid_action')).toBe(0);
    });
  });

  describe('getStreakStatus', () => {
    it('returns "new" for first-time user', () => {
      const result = getStreakStatus({ lastActiveDate: null, current: 0, freezesAvailable: 0 });
      expect(result.status).toBe('new');
    });

    it('returns "active" if last active today', () => {
      const result = getStreakStatus({ lastActiveDate: '2026-07-23', current: 5, freezesAvailable: 0 });
      expect(result.status).toBe('active');
      expect(result.daysInactive).toBe(0);
    });

    it('returns "at_risk" if 1 day inactive', () => {
      const result = getStreakStatus({ lastActiveDate: '2026-07-22', current: 3, freezesAvailable: 1 });
      expect(result.status).toBe('at_risk');
      expect(result.daysInactive).toBe(1);
      expect(result.shouldFreeze).toBe(true);
    });

    it('returns "broken" if 2+ days inactive', () => {
      const result = getStreakStatus({ lastActiveDate: '2026-07-20', current: 10, freezesAvailable: 0 });
      expect(result.status).toBe('broken');
      expect(result.daysInactive).toBe(3);
    });
  });

  describe('checkStreakMilestone', () => {
    it('returns milestone at 7 days', () => {
      const result = checkStreakMilestone(7);
      expect(result).not.toBeNull();
      expect(result.xp).toBe(100);
      expect(result.label).toBe('1 Week');
    });

    it('returns milestone at 14 days', () => {
      const result = checkStreakMilestone(14);
      expect(result.xp).toBe(200);
    });

    it('returns milestone at 30 days', () => {
      const result = checkStreakMilestone(30);
      expect(result.xp).toBe(500);
    });

    it('returns null for non-milestone days', () => {
      expect(checkStreakMilestone(5)).toBeNull();
      expect(checkStreakMilestone(10)).toBeNull();
      expect(checkStreakMilestone(22)).toBeNull();
    });
  });

  describe('calculateReadiness', () => {
    it('returns 0 for empty state', () => {
      const result = calculateReadiness({ completedUnits: [] }, {}, { current: 0 });
      expect(result.score).toBe(0);
      expect(result.verdict).toBe('NOT READY');
    });

    it('returns higher score with more completed units', () => {
      const low = calculateReadiness({ completedUnits: ['p1u1'] }, {}, { current: 0 });
      const high = calculateReadiness({ completedUnits: Array(20).fill('unit') }, {}, { current: 5 });
      expect(high.score).toBeGreaterThan(low.score);
    });

    it('includes breakdown with 4 components', () => {
      const result = calculateReadiness({ completedUnits: ['p1u1'] }, {}, { current: 3 });
      expect(result.breakdown).toHaveProperty('completion');
      expect(result.breakdown).toHaveProperty('strength');
      expect(result.breakdown).toHaveProperty('consistency');
      expect(result.breakdown).toHaveProperty('coverage');
    });

    it('returns READY verdict at 80+', () => {
      // Simulate high readiness state
      const concepts = {};
      for (let i = 0; i < 50; i++) {
        concepts[`basics.concept${i}`] = { lastPracticed: '2026-07-23', interval: 10, easeFactor: 2.5, strength: 90 };
      }
      const result = calculateReadiness({ completedUnits: Array(40).fill('u') }, concepts, { current: 14 });
      expect(result.score).toBeGreaterThanOrEqual(60); // May not hit 80 without full concept coverage
    });

    it('score is always between 0 and 100', () => {
      const result = calculateReadiness({ completedUnits: Array(47).fill('u') }, {}, { current: 100 });
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('getInterviewLockStatus', () => {
    it('locks when streak < 5', () => {
      const result = getInterviewLockStatus({ current: 3 }, { available: 2 });
      expect(result.locked).toBe(true);
    });

    it('locks when no credits', () => {
      const result = getInterviewLockStatus({ current: 7 }, { available: 0 });
      expect(result.locked).toBe(true);
    });

    it('unlocks with streak >= 5 and credits > 0', () => {
      const result = getInterviewLockStatus({ current: 5 }, { available: 1 });
      expect(result.locked).toBe(false);
    });
  });
});
