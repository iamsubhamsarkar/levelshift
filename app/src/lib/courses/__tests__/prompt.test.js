import { describe, it, expect } from 'vitest';
import { GENERATION_PROMPT, buildFullPrompt } from '../prompt.js';

const PLACEHOLDER_HINT = '<<< describe your course here';

describe('buildFullPrompt', () => {
  it('substitutes the user request into the request slot', () => {
    const req = 'an Agentic AI beginner course in Hindi, include good Hindi YouTube tutorials';
    const out = buildFullPrompt(req);
    // Request is present, placeholder is gone.
    expect(out).toContain(req);
    expect(out).not.toContain(PLACEHOLDER_HINT);
    // Still contains the schema/rules from the base prompt.
    expect(out).toContain('NOW CREATE THE COURSE FOR THIS REQUEST:');
    expect(out).toContain('"schemaVersion": 1');
  });

  it('falls back to the untouched generation prompt when request is empty', () => {
    expect(buildFullPrompt('')).toBe(GENERATION_PROMPT);
    expect(buildFullPrompt('   ')).toBe(GENERATION_PROMPT);
    expect(buildFullPrompt(undefined)).toBe(GENERATION_PROMPT);
  });

  it('trims surrounding whitespace from the request', () => {
    const out = buildFullPrompt('   just this   ');
    expect(out).toContain('NOW CREATE THE COURSE FOR THIS REQUEST:\njust this');
    expect(out).not.toContain(PLACEHOLDER_HINT);
  });
});
