import { describe, it, expect } from 'vitest';
import {
  generateCourse,
  generationSystemInstruction,
  GENERATION_MODELS,
  DEFAULT_GENERATION_MODEL,
} from '../generate.js';
import { EXAMPLE_COURSE } from '../schema.js';

// A valid course we can hand back from the mock caller.
const VALID = JSON.stringify(EXAMPLE_COURSE);

// Helper: a mock Gemini caller that returns a scripted sequence of responses.
function mockCaller(responses) {
  let i = 0;
  const calls = [];
  const fn = async (system, user, opts) => {
    calls.push({ system, user, opts });
    const r = responses[Math.min(i, responses.length - 1)];
    i++;
    return r;
  };
  fn.calls = calls;
  return fn;
}

describe('generateCourse', () => {
  it('returns a valid course when the model outputs good JSON', async () => {
    const caller = mockCaller([{ ok: true, text: VALID }]);
    const res = await generateCourse('a DSA course', { model: DEFAULT_GENERATION_MODEL, caller });
    expect(res.ok).toBe(true);
    expect(res.repaired).toBe(false);
    expect(res.course.title).toBe('Example: Intro to X');
    // The chosen model id must be passed to the caller.
    expect(caller.calls[0].opts.model).toBe(DEFAULT_GENERATION_MODEL);
  });

  it('extracts JSON from a fenced ```json code block (the primary output format)', async () => {
    const fenced = '```json\n' + VALID + '\n```';
    const caller = mockCaller([{ ok: true, text: fenced }]);
    const res = await generateCourse('x', { caller });
    expect(res.ok).toBe(true);
    expect(res.course.title).toBe('Example: Intro to X');
  });

  it('recovers DETERMINISTICALLY when the model output has fixable quoting', async () => {
    const broken = VALID.replace('"Example: Intro to X"', '"Example: "Intro" to X"');
    const caller = mockCaller([{ ok: true, text: broken }]);
    const res = await generateCourse('x', { caller });
    expect(res.ok).toBe(true);
  });

  it('recovers DETERMINISTICALLY when the model output is missing closing brackets', async () => {
    const truncated = VALID.replace(/\}+$/, ''); // drop trailing closers
    const caller = mockCaller([{ ok: true, text: truncated }]);
    const res = await generateCourse('x', { caller });
    expect(res.ok).toBe(true);
    expect(res.repaired).toBe(true); // structurallyRepaired
  });

  it('propagates a generation error', async () => {
    const caller = mockCaller([{ ok: false, text: '', error: 'No API key set.' }]);
    const res = await generateCourse('x', { caller });
    expect(res.ok).toBe(false);
    expect(res.errors.join(' ')).toMatch(/no api key/i);
  });

  it('falls back to another model on an availability (404) error', async () => {
    const caller = mockCaller([
      { ok: false, text: '', error: 'Model not available for your key.' }, // first model 404
      { ok: true, text: VALID }                                             // fallback works
    ]);
    const res = await generateCourse('x', { model: 'gemini-flash-lite-latest', caller });
    expect(res.ok).toBe(true);
    expect(caller.calls.length).toBe(2);
  });

  it('does NOT retry other models on a non-availability error (e.g. quota)', async () => {
    const caller = mockCaller([{ ok: false, text: '', error: 'Rate limit hit — try again later.' }]);
    const res = await generateCourse('x', { caller });
    expect(res.ok).toBe(false);
    expect(caller.calls.length).toBe(1); // stopped early
  });
});

describe('generationSystemInstruction', () => {
  it('instructs code-block output and structural correctness', () => {
    const s = generationSystemInstruction();
    expect(s).toMatch(/json code block/i);
    expect(s).toMatch(/topics/i);
  });
});

describe('model config', () => {
  it('exposes a non-empty dropdown list with a valid default', () => {
    expect(GENERATION_MODELS.length).toBeGreaterThanOrEqual(2);
    expect(GENERATION_MODELS.some((m) => m.id === DEFAULT_GENERATION_MODEL)).toBe(true);
  });
});
