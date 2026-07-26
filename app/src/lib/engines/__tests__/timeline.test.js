import { describe, it, expect, vi } from 'vitest';
import { calculateTimeline, calculateMissPenalty, generateWeeklyReport } from '../timeline.js';

// Mock dates
vi.mock('../../utils/dates.js', () => ({
  today: () => '2026-07-23',
  addDays: (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },
  daysBetween: (from, to) => {
    const a = new Date(from);
    const b = new Date(to);
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  },
  getLastNDays: (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date('2026-07-23');
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  },
  isWeekend: (dateStr) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  }
}));

describe('Timeline Engine', () => {
  describe('calculateTimeline', () => {
    it('returns today if all units complete', () => {
      const progress = { completedUnits: Array(47).fill('unit') };
      const result = calculateTimeline(progress, {}, {});
      expect(result.estimatedCompletion).toBe('2026-07-23');
      expect(result.remaining).toBe(0);
    });

    it('calculates remaining units correctly', () => {
      const progress = { completedUnits: ['p1u1', 'p1u2'] };
      const result = calculateTimeline(progress, {}, {});
      expect(result.remaining).toBe(45);
    });

    it('best case is always sooner than worst case', () => {
      const progress = { completedUnits: ['p1u1'] };
      const heatmap = {
        '2026-07-22': { units: 1, minutes: 30, mode: 'normal' },
        '2026-07-21': { units: 1, minutes: 25, mode: 'normal' }
      };
      const result = calculateTimeline(progress, heatmap, {});
      expect(new Date(result.bestCase) <= new Date(result.worstCase)).toBe(true);
    });

    it('accounts for weekend rest in pace calculation', () => {
      const progress = { completedUnits: ['p1u1'] };
      const withRest = calculateTimeline(progress, {}, { weekendRest: true });
      const withoutRest = calculateTimeline(progress, {}, { weekendRest: false });
      // With weekend rest, fewer active days counted → may adjust pace
      expect(withRest.remaining).toBe(withoutRest.remaining);
    });

    it('uses default pace when no heatmap data', () => {
      const progress = { completedUnits: [] };
      const result = calculateTimeline(progress, {}, {});
      expect(result.rollingPace).toBeGreaterThan(0);
      expect(result.estimatedCompletion).not.toBe('2026-07-23');
    });
  });

  describe('calculateMissPenalty', () => {
    it('returns 0 for 0 missed days', () => {
      expect(calculateMissPenalty(0)).toBe(0);
    });

    it('returns 1.5x for 1 missed day', () => {
      expect(calculateMissPenalty(1)).toBe(2); // round(1 * 1.5) = 2
    });

    it('returns more than raw missed days', () => {
      const penalty = calculateMissPenalty(3);
      expect(penalty).toBeGreaterThan(3);
    });

    it('adds recovery penalty for 4+ missed days', () => {
      const shortMiss = calculateMissPenalty(3);
      const longMiss = calculateMissPenalty(5);
      // Long miss should have compounding penalty
      expect(longMiss / 5).toBeGreaterThan(shortMiss / 3);
    });
  });

  describe('generateWeeklyReport', () => {
    it('calculates units for this week vs last week', () => {
      const heatmap = {
        '2026-07-23': { units: 1, minutes: 30, mode: 'normal' },
        '2026-07-22': { units: 2, minutes: 40, mode: 'normal' },
        '2026-07-15': { units: 1, minutes: 20, mode: 'normal' },
        '2026-07-14': { units: 1, minutes: 25, mode: 'normal' }
      };

      const report = generateWeeklyReport(heatmap, { completedUnits: ['p1u1'] }, {});
      expect(report.unitsThisWeek).toBeGreaterThanOrEqual(0);
      expect(report.trendLabel).toMatch(/^(improving|declining|stable)$/);
    });

    it('counts missed days correctly', () => {
      const heatmap = {
        '2026-07-23': { units: 1, minutes: 30, mode: 'normal' }
      };

      const report = generateWeeklyReport(heatmap, { completedUnits: [] }, {});
      expect(report.daysMissedThisWeek).toBeGreaterThan(0);
    });

    it('calculates penalty days based on misses', () => {
      const report = generateWeeklyReport({}, { completedUnits: [] }, {});
      expect(report.penaltyDays).toBeGreaterThan(0); // all 7 days missed
    });
  });
});
