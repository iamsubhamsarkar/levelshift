import { describe, it, expect } from 'vitest';
import { validateCourse, parseAndValidate, extractJson, sanitizeText, sanitizePastedJson, formatJson, repairStructure } from '../validate.js';
import { EXAMPLE_COURSE } from '../schema.js';

describe('validateCourse', () => {
  it('accepts the canonical example course', () => {
    const r = validateCourse(EXAMPLE_COURSE);
    expect(r.ok).toBe(true);
    expect(r.course.title).toBe('Example: Intro to X');
    expect(r.course.format).toBe('topic_page');
    expect(r.course.modules[0].topics[0].blocks.length).toBe(4);
  });

  it('rejects non-object input', () => {
    expect(validateCourse(null).ok).toBe(false);
    expect(validateCourse('nope').ok).toBe(false);
    expect(validateCourse([]).ok).toBe(false);
  });

  it('requires a title', () => {
    const r = validateCourse({ modules: [{ topics: [{ blocks: [{ type: 'text', md: 'hi' }] }] }] });
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/title/i);
  });

  it('requires at least one module', () => {
    const r = validateCourse({ title: 'T', modules: [] });
    expect(r.ok).toBe(false);
  });

  it('drops unknown block types with a warning', () => {
    const r = validateCourse({
      title: 'T',
      radarAxes: ['A'],
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 't1', title: 'T1', blocks: [
        { type: 'evil', payload: 'x' },
        { type: 'text', md: 'ok' }
      ] }] }]
    });
    expect(r.ok).toBe(true);
    expect(r.course.modules[0].topics[0].blocks.length).toBe(1);
    expect(r.warnings.join(' ')).toMatch(/unknown\/invalid block/i);
  });

  it('rejects invalid YouTube IDs and keeps valid ones', () => {
    const r = validateCourse({
      title: 'T', radarAxes: ['A'],
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 't1', title: 'T1', blocks: [
        { type: 'video', videoId: 'not a real id!!' },
        { type: 'video', videoId: 'dQw4w9WgXcQ' }
      ] }] }]
    });
    expect(r.ok).toBe(true);
    const vids = r.course.modules[0].topics[0].blocks.filter(b => b.type === 'video');
    expect(vids.length).toBe(1);
    expect(vids[0].videoId).toBe('dQw4w9WgXcQ');
  });

  it('defaults unsupported practice language to python', () => {
    const r = validateCourse({
      title: 'T', radarAxes: ['A'],
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 't1', title: 'T1', blocks: [
        { type: 'practice', language: 'brainfuck', starter: 'x' }
      ] }] }]
    });
    expect(r.course.modules[0].topics[0].blocks[0].language).toBe('python');
  });

  it('rejects a quiz with a correct index out of range', () => {
    const r = validateCourse({
      title: 'T', radarAxes: ['A'],
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 't1', title: 'T1', blocks: [
        { type: 'quiz', question: 'q', options: ['a', 'b'], correct: 9 },
        { type: 'text', md: 'fallback' }
      ] }] }]
    });
    // quiz dropped, text remains
    expect(r.ok).toBe(true);
    expect(r.course.modules[0].topics[0].blocks.every(b => b.type !== 'quiz')).toBe(true);
  });

  it('auto-creates concepts referenced by topics but not declared', () => {
    const r = validateCourse({
      title: 'T', radarAxes: ['A'],
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 't1', title: 'T1', teaches: ['x.y'], blocks: [
        { type: 'text', md: 'hi' }
      ] }] }]
    });
    expect(r.course.concepts['x.y']).toBeDefined();
    expect(r.course.concepts['x.y'].axis).toBe('A');
  });
});

describe('sanitizeText', () => {
  it('strips script blocks and html tags', () => {
    expect(sanitizeText('<script>alert(1)</script>hello')).toBe('hello');
    expect(sanitizeText('<b>bold</b> text')).toBe('bold text');
  });
  it('neutralizes javascript: URIs and inline handlers', () => {
    expect(sanitizeText('javascript:alert(1)')).not.toMatch(/javascript:/i);
    expect(sanitizeText('onclick=alert(1)')).not.toMatch(/onclick=/i);
  });
});

describe('extractJson / parseAndValidate', () => {
  it('extracts JSON from a ```json fenced block', () => {
    const text = 'Here you go:\n```json\n{"a":1}\n```\nEnjoy!';
    expect(JSON.parse(extractJson(text))).toEqual({ a: 1 });
  });

  it('extracts a bare object among prose', () => {
    expect(JSON.parse(extractJson('blah {"a":2} blah'))).toEqual({ a: 2 });
  });

  it('extracts JSON whose string values CONTAIN ``` code fences (regression)', () => {
    // A text block with a fenced code sample inside the md string must not
    // confuse the extractor into grabbing the inner fence.
    const course = { title: 'X', md: 'see:\n```ts\nconst a = 1;\n```\ndone' };
    const text = JSON.stringify(course);
    expect(JSON.parse(extractJson(text))).toEqual(course);
  });

  it('parseAndValidate handles fenced full course', () => {
    const text = '```json\n' + JSON.stringify(EXAMPLE_COURSE) + '\n```';
    const r = parseAndValidate(text);
    expect(r.ok).toBe(true);
  });

  it('parseAndValidate reports invalid JSON', () => {
    const r = parseAndValidate('{ not valid json ');
    expect(r.ok).toBe(false);
  });

  it('auto-recovers from a real newline inside a string (was the classic error)', () => {
    // A raw newline inside a string value used to fail with "Bad control
    // character". We now escape it deterministically, so parsing succeeds.
    const bad = '{ "title": "Hi", "md": "line one\nline two" }';
    const cleaned = sanitizePastedJson(bad);
    expect(JSON.parse(cleaned)).toEqual({ title: 'Hi', md: 'line one\nline two' });
  });

  it('hints at truncation for an unterminated object', () => {
    const r = parseAndValidate('{ "title": "Hi", "modules": [ ');
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/cut off|truncat|not closed/i);
  });
});

describe('sanitizePastedJson (chat-paste corruption)', () => {
  it('strips BOM and zero-width characters', () => {
    const dirty = '\uFEFF{\u200B"a"\u200C:\u200D1\u2060}';
    expect(sanitizePastedJson(dirty)).toBe('{"a":1}');
  });

  it('converts non-breaking / narrow spaces to regular spaces', () => {
    const dirty = '{\u00A0"a":\u202F1,\u2007"b":2}';
    expect(sanitizePastedJson(dirty)).toBe('{ "a": 1, "b":2}');
  });

  it('straightens smart double and single quotes', () => {
    const dirty = '{\u201Ca\u201D:\u20181\u2019}';
    expect(sanitizePastedJson(dirty)).toBe('{"a":\'1\'}');
  });

  it('lets extractJson recover JSON corrupted by smart quotes (the real bug)', () => {
    // Emulate a chat UI that replaced straight quotes with curly ones and
    // inserted a non-breaking space + zero-width char.
    const dirty = '\uFEFF{\u201Ctitle\u201D:\u00A0\u201CHi\u201D,\u200B\u201Cn\u201D:1}';
    const extracted = extractJson(dirty);
    expect(JSON.parse(extracted)).toEqual({ title: 'Hi', n: 1 });
  });

  it('parseAndValidate now imports a smart-quote-corrupted course', () => {
    const clean = JSON.stringify(EXAMPLE_COURSE);
    const dirty = '\uFEFF' + clean
      .replace(/"/g, '\u201D')      // all double quotes -> curly close quote
      .replace(/ /g, '\u00A0');     // spaces -> NBSP
    const r = parseAndValidate(dirty);
    expect(r.ok).toBe(true);
    expect(r.course.title).toBe('Example: Intro to X');
  });

  it('escapes RAW newlines that sit inside string values (the chat-wrap bug)', () => {
    // A literal newline inside a string value is invalid JSON ("Bad control
    // character"). Chat UIs inject these when long strings wrap on copy.
    const dirty = '{"title":"Pattern-Based DSA for MAANG\n Interviews"}';
    const cleaned = sanitizePastedJson(dirty);
    expect(() => JSON.parse(dirty)).toThrow();          // baseline: raw is invalid
    expect(JSON.parse(cleaned)).toEqual({ title: 'Pattern-Based DSA for MAANG\n Interviews' });
  });

  it('escapes raw tabs/CR inside strings but leaves structural whitespace alone', () => {
    const dirty = '{\n  "a": "x\ty",\r\n  "b": 1\n}';
    const cleaned = sanitizePastedJson(dirty);
    const obj = JSON.parse(cleaned);
    expect(obj).toEqual({ a: 'x\ty', b: 1 });
  });

  it('does NOT corrupt already-escaped sequences inside strings', () => {
    // Already-valid \n must survive as a single newline, and \" must not end
    // the string early.
    const good = '{"md":"line1\\nline2 with a \\" quote"}';
    const cleaned = sanitizePastedJson(good);
    expect(JSON.parse(cleaned)).toEqual({ md: 'line1\nline2 with a " quote' });
  });

  it('parseAndValidate imports a course whose text blocks have raw newlines', () => {
    const clean = JSON.stringify(EXAMPLE_COURSE);
    // Inject raw newlines inside every string value (simulate chat wrapping).
    const dirty = clean.replace(/"([^"]{10,})"/g, (_m, inner) => '"' + inner.replace(/ /g, '\n') + '"');
    const r = parseAndValidate(dirty);
    expect(r.ok).toBe(true);
  });

  it('escapes UNESCAPED double quotes inside a string value (the AI-quote bug)', () => {
    // The AI wrote inner quotes without escaping them; the raw string ends the
    // value early at the first inner quote. We repair it to \".
    const bad = '{"md":"ask: "What\'s this?" now"}';
    expect(() => JSON.parse(bad)).toThrow();
    const cleaned = sanitizePastedJson(bad);
    expect(JSON.parse(cleaned)).toEqual({ md: 'ask: "What\'s this?" now' });
  });

  it('repairs multiple unescaped quotes across several values', () => {
    const bad = '{"a":"say "hi" ok","b":"and "bye" too"}';
    const cleaned = sanitizePastedJson(bad);
    expect(JSON.parse(cleaned)).toEqual({ a: 'say "hi" ok', b: 'and "bye" too' });
  });

  it('does NOT corrupt valid JSON when repairing quotes (structural quotes preserved)', () => {
    // Values that legitimately contain delimiters or a colon must survive.
    const cases = [
      { a: '', b: [1, 2] },
      { a: 'hello, world}', b: [1, 2] },
      { x: { y: [{ z: 'v' }] }, s: 'end' },
      { md: 'He said \"hi\" to me.' },        // already escaped
      { a: 'done.', b: 'next' },
      { url: 'http://x.com', note: 'a:b' },
    ];
    for (const obj of cases) {
      const json = JSON.stringify(obj);
      const cleaned = sanitizePastedJson(json);
      expect(JSON.parse(cleaned)).toEqual(obj);
    }
  });

  it('parseAndValidate imports the real-world DSA-style course with unescaped quotes', () => {
    const bad = JSON.stringify({
      schemaVersion: 1, title: 'T', radarAxes: ['A'],
      concepts: { 'c1': { prereqs: [], axis: 'A' } },
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 'm1t1', title: 'T1', teaches: ['c1'], axis: 'A', blocks: [
        { type: 'text', md: 'PLACEHOLDER' }
      ] }] }]
    // Now break it the way the AI did: unescaped inner quotes in the md value.
    }).replace('"PLACEHOLDER"', '"Interviewers ask: "What is the time complexity?" You must answer."');
    expect(() => JSON.parse(bad)).toThrow();
    const r = parseAndValidate(bad);
    expect(r.ok).toBe(true);
    expect(r.course.modules[0].topics[0].blocks[0].md).toBe('Interviewers ask: "What is the time complexity?" You must answer.');
  });

  it('deterministically repairs missing closing brackets (truncation)', () => {
    const full = JSON.stringify({
      schemaVersion: 1, title: 'T', radarAxes: ['A'],
      concepts: { c1: { prereqs: [], axis: 'A' } },
      modules: [{ id: 'm1', title: 'M', topics: [{ id: 'm1t1', title: 'T1', teaches: ['c1'], axis: 'A', blocks: [{ type: 'text', md: 'hello world content' }] }] }]
    });
    // Drop the trailing closers (simulate a truncated / one-bracket-off paste).
    const truncated = full.replace(/\}+$/, '');
    expect(() => JSON.parse(truncated)).toThrow();
    const r = parseAndValidate(truncated);
    expect(r.ok).toBe(true);
    expect(r.course.modules[0].topics[0].blocks[0].md).toBe('hello world content');
  });

  it('repairStructure does not touch braces inside string values', () => {
    // A value containing } must not confuse the balancer.
    const s = '{"a":"text with } brace","b":[1,2';  // missing ] and }
    const fixed = repairStructure(s);
    expect(fixed).not.toBeNull();
    expect(JSON.parse(fixed)).toEqual({ a: 'text with } brace', b: [1, 2] });
  });

  it('repairStructure refuses an unterminated string (unsafe to guess)', () => {
    expect(repairStructure('{"a":"unterminated')).toBeNull();
  });
});

describe('formatJson (Format / clean button)', () => {
  it('sanitizes then pretty-prints valid (but dirty) JSON', () => {
    const dirty = '\uFEFF{"a":1,"b":[2,3]}';
    const res = formatJson(dirty);
    expect(res.ok).toBe(true);
    expect(res.formatted).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it('pretty-prints JSON extracted from a fenced block', () => {
    const res = formatJson('```json\n{"a":1}\n```');
    expect(res.ok).toBe(true);
    expect(res.formatted).toBe('{\n  "a": 1\n}');
  });

  it('returns actionable errors for truly invalid JSON instead of throwing', () => {
    const res = formatJson('{ "a": }');
    expect(res.ok).toBe(false);
    expect(Array.isArray(res.errors)).toBe(true);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('returns an error when there is nothing to format', () => {
    const res = formatJson('just some prose, no json');
    expect(res.ok).toBe(false);
    expect(res.errors.join(' ')).toMatch(/nothing to format|paste the json/i);
  });
});
