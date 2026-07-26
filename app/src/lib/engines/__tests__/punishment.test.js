import { describe, it, expect, vi } from 'vitest';
import { getFeatureLocks, getHeatmapColor, getConsequences, compareWithGhost, checkStreakFreeze } from '../punishment.js';

vi.mock('../../utils/dates.js', () => ({
  today: () => '2026-07-23',
  daysBetween: (from, to) => {
    const a = new Date(from);
    const b = new Date(to);
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  }
}));

describe('Punishment Engine', () => {
  describe('getConsequences', () => {
    it('returns none for 0 missed days', () => {
      const result = getConsequences(0);
      expect(result.level).toBe('none');
      expect(result.xpLoss).toBe(0);
    });

    it('returns warning for 1 missed day', () => {
      const result = getConsequences(1);
      expect(result.level).toBe('warning');
      expect(result.xpLoss).toBe(20);
      expect(result.timelinePush).toBe(1.5);
    });

    it('returns danger for 2 missed days', () => {
      const result = getConsequences(2);
      expect(result.level).toBe('danger');
      expect(result.xpLoss).toBe(50);
    });

    it('returns critical for 3-5 missed days with streak reset', () => {
      const result = getConsequences(4);
      expect(result.level).toBe('critical');
      expect(result.xpLoss).toBe(100);
      expect(result.actions).toContain('streak_reset');
      expect(result.actions).toContain('credits_lost');
    });

    it('returns severe for 6+ missed days', () => {
      const result = getConsequences(7);
      expect(result.level).toBe('severe');
      expect(result.xpLoss).toBe(200);
      expect(result.actions).toContain('credits_zeroed');
      expect(result.actions).toContain('massive_decay');
    });

    it('escalates penalties progressively', () => {
      const warn = getConsequences(1);
      const danger = getConsequences(2);
      const critical = getConsequences(4);
      const severe = getConsequences(7);

      expect(warn.xpLoss).toBeLessThan(danger.xpLoss);
      expect(danger.xpLoss).toBeLessThan(critical.xpLoss);
      expect(critical.xpLoss).toBeLessThan(severe.xpLoss);
    });
  });

  describe('getHeatmapColor', () => {
    // The mock sets today() to '2026-07-23' for all modules
    // Use past dates relative to that
    
    it('returns active for days with units completed', () => {
      const heatmap = { '2026-07-22': { units: 1, minutes: 30, mode: 'normal' } };
      expect(getHeatmapColor('2026-07-22', heatmap)).toBe('active');
    });

    it('returns tired for tired mode days', () => {
      const heatmap = { '2026-07-22': { units: 0, minutes: 5, mode: 'tired' } };
      expect(getHeatmapColor('2026-07-22', heatmap)).toBe('tired');
    });

    it('returns missed for inactive days', () => {
      // With activity the day before, a single missed day = 'missed' not 'critical'
      const heatmap = { '2026-07-21': { units: 1, minutes: 20, mode: 'normal' } };
      expect(getHeatmapColor('2026-07-22', heatmap, { weekendRest: false })).toBe('missed');
    });

    it('returns rest for weekends when enabled', () => {
      // 2026-07-19 is a Sunday
      expect(getHeatmapColor('2026-07-19', {}, { weekendRest: true })).toBe('rest');
    });

    it('returns critical for 3+ consecutive misses', () => {
      // 2026-07-15 has activity, then 16,17,18 missed (3 consecutive) → 18 = critical
      const heatmap = { '2026-07-15': { units: 1, minutes: 30, mode: 'normal' } };
      const color = getHeatmapColor('2026-07-18', heatmap, { weekendRest: false });
      expect(color).toBe('critical');
    });
  });

  describe('compareWithGhost', () => {
    it('returns null if no best exists', () => {
      expect(compareWithGhost({ time: 120, score: 80 }, null)).toBeNull();
    });

    it('detects new personal best', () => {
      const current = { time: 100, score: 90 };
      const best = { bestTime: 120, bestScore: 85, date: '2026-07-20' };
      const result = compareWithGhost(current, best);
      expect(result.isNewBest).toBe(true);
      expect(result.message).toContain('PERSONAL BEST');
    });

    it('detects slower performance', () => {
      const current = { time: 200, score: 70 };
      const best = { bestTime: 100, bestScore: 90, date: '2026-07-20' };
      const result = compareWithGhost(current, best);
      expect(result.isNewBest).toBe(false);
      expect(result.slowerByPercent).toBeGreaterThan(0);
    });

    it('calculates time difference correctly', () => {
      const current = { time: 150, score: 80 };
      const best = { bestTime: 100, bestScore: 80, date: '2026-07-20' };
      const result = compareWithGhost(current, best);
      expect(result.timeDiff).toBe(50);
    });
  });

  describe('checkStreakFreeze', () => {
    it('applies freeze when 1 day missed and freeze available', () => {
      const streakData = { current: 5, freezesAvailable: 1 };
      const result = checkStreakFreeze(streakData, 1);
      expect(result.applied).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('does not apply freeze when multiple days missed', () => {
      const streakData = { current: 5, freezesAvailable: 2 };
      const result = checkStreakFreeze(streakData, 3);
      expect(result.applied).toBe(false);
    });

    it('does not apply freeze when no freezes available', () => {
      const streakData = { current: 5, freezesAvailable: 0 };
      const result = checkStreakFreeze(streakData, 1);
      expect(result.applied).toBe(false);
    });

    it('does not apply freeze when streak is 0', () => {
      const streakData = { current: 0, freezesAvailable: 1 };
      const result = checkStreakFreeze(streakData, 1);
      expect(result.applied).toBe(false);
    });
  });

  describe('getFeatureLocks', () => {
    it('locks interview mode below 5-day streak', () => {
      const result = getFeatureLocks({ current: 3 }, { score: 80 }, { available: 2 });
      expect(result.interviewMode.locked).toBe(true);
    });

    it('locks prove mode below 50% readiness', () => {
      const result = getFeatureLocks({ current: 10 }, { score: 40 }, { available: 2 });
      expect(result.proveMode.locked).toBe(true);
    });

    it('degrades dashboard below 30% readiness', () => {
      const result = getFeatureLocks({ current: 0 }, { score: 20 }, { available: 0 });
      expect(result.dashboard.degraded).toBe(true);
    });

    it('unlocks everything when fully qualified', () => {
      const result = getFeatureLocks({ current: 10 }, { score: 85 }, { available: 3 });
      expect(result.interviewMode.locked).toBe(false);
      expect(result.proveMode.locked).toBe(false);
      expect(result.dashboard.degraded).toBe(false);
    });
  });
});
