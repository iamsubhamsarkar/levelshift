import { describe, it, expect } from 'vitest';
import { calculateNextReview, labelToRating } from '../spaced-rep.js';

describe('SM-2 Spaced Repetition Engine', () => {
  describe('labelToRating', () => {
    it('maps text labels to numeric ratings', () => {
      expect(labelToRating('easy')).toBe(5);
      expect(labelToRating('good')).toBe(4);
      expect(labelToRating('hard')).toBe(3);
      expect(labelToRating('forgot')).toBe(1);
    });

    it('defaults to 3 for unknown labels', () => {
      expect(labelToRating('unknown')).toBe(3);
      expect(labelToRating('')).toBe(3);
    });
  });

  describe('calculateNextReview', () => {
    const baseState = {
      repetitions: 0,
      easeFactor: 2.5,
      interval: 1,
      strength: 0,
      lastPracticed: '2026-07-20'
    };

    it('sets interval to 1 day on first correct answer', () => {
      const result = calculateNextReview(baseState, 4);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('sets interval to 3 days on second correct answer', () => {
      const state = { ...baseState, repetitions: 1, interval: 1 };
      const result = calculateNextReview(state, 4);
      expect(result.interval).toBe(3);
      expect(result.repetitions).toBe(2);
    });

    it('multiplies interval by easeFactor on subsequent reviews', () => {
      const state = { ...baseState, repetitions: 3, interval: 6, easeFactor: 2.5 };
      const result = calculateNextReview(state, 4);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
    });

    it('resets repetitions on failed answer (rating < 3)', () => {
      const state = { ...baseState, repetitions: 5, interval: 30, easeFactor: 2.5 };
      const result = calculateNextReview(state, 1);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('decreases ease factor on hard answers', () => {
      const state = { ...baseState, repetitions: 3, interval: 6, easeFactor: 2.5 };
      const result = calculateNextReview(state, 2);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('increases strength on correct answers', () => {
      const result = calculateNextReview(baseState, 5);
      expect(result.strength).toBeGreaterThan(baseState.strength);
    });

    it('never lets ease factor go below 1.3', () => {
      const state = { ...baseState, easeFactor: 1.35 };
      const result = calculateNextReview(state, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('caps strength at 100', () => {
      const state = { ...baseState, strength: 98 };
      const result = calculateNextReview(state, 5);
      expect(result.strength).toBeLessThanOrEqual(100);
    });
  });
});
