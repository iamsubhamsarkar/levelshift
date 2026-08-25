import { describe, it, expect } from 'vitest';
import { LANGUAGE_COMPILERS, getSupportedLanguages, validateOutput, executeCode } from '../code-runner.js';

describe('code-runner language map', () => {
  it('exposes a compiler for every supported language', () => {
    for (const lang of getSupportedLanguages()) {
      expect(LANGUAGE_COMPILERS[lang]).toBeTruthy();
    }
  });

  it('includes the multi-language set the schema promises', () => {
    ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'].forEach((l) => {
      expect(getSupportedLanguages()).toContain(l);
    });
  });

  it('executeCode rejects an unsupported language without hitting the network', async () => {
    const r = await executeCode('cobol', 'x');
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/unsupported/i);
  });
});

describe('validateOutput', () => {
  it('matches trimmed output', () => {
    expect(validateOutput('hello\n', 'hello')).toBe(true);
  });
  it('supports contains matching', () => {
    expect(validateOutput('the answer is 42', '42')).toBe(true);
  });
  it('fails when different', () => {
    expect(validateOutput('foo', 'bar')).toBe(false);
  });
});
