import { describe, it, expect } from 'vitest';
import { validateCourse, parseAndValidate, extractJson, sanitizeText } from '../validate.js';
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

  it('gives a helpful message + line for a real newline inside a string', () => {
    // Unescaped newline in a string value (the classic AI mistake).
    const bad = '{ "title": "Hi", "md": "line one\nline two" }';
    const r = parseAndValidate(bad);
    expect(r.ok).toBe(false);
    const joined = r.errors.join(' ');
    expect(joined).toMatch(/line \d+/i);
    expect(joined).toMatch(/line break|control/i);
  });

  it('hints at truncation for an unterminated object', () => {
    const r = parseAndValidate('{ "title": "Hi", "modules": [ ');
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/cut off|truncat|not closed/i);
  });
});
