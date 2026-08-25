import { describe, it, expect, beforeEach, vi } from 'vitest';

// Node test env has no localStorage — provide a minimal in-memory shim.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

async function freshStore() {
  return await import('../courses.js?t=' + Math.random());
}

const course = {
  id: 'custom-test',
  title: 'Test',
  radarAxes: ['A', 'B'],
  concepts: { 'a.one': { prereqs: [], axis: 'A' } },
  modules: [
    { id: 'm1', title: 'M1', topics: [
      { id: 'm1t1', title: 'T1', teaches: ['a.one'], axis: 'A', blocks: [{ type: 'text', md: 'x' }] },
      { id: 'm1t2', title: 'T2', teaches: [], axis: 'B', blocks: [{ type: 'text', md: 'y' }] }
    ] }
  ]
};

describe('courses store', () => {
  it('counts topics and starts at 0% completion', async () => {
    const s = await freshStore();
    s.addCourse(course);
    expect(s.countTopics(course)).toBe(2);
    expect(s.completionPercent(course.id, course)).toBe(0);
  });

  it('completing a topic updates completion and reinforces concepts', async () => {
    const s = await freshStore();
    s.addCourse(course);
    s.completeTopic(course.id, course.modules[0].topics[0]);
    expect(s.completionPercent(course.id, course)).toBe(50);
    const prog = s.getProgress(course.id);
    expect(prog.completedTopics).toContain('m1t1');
    expect(prog.concepts['a.one'].strength).toBeGreaterThan(0);
    expect(prog.concepts['a.one'].lastPracticed).toBeTruthy();
  });

  it('deleting a course removes it and its progress', async () => {
    const s = await freshStore();
    s.addCourse(course);
    s.completeTopic(course.id, course.modules[0].topics[0]);
    s.deleteCourse(course.id);
    expect(s.completionPercent(course.id, course)).toBe(0);
  });

  it('setBlockState persists arbitrary block state', async () => {
    const s = await freshStore();
    s.addCourse(course);
    s.setBlockState(course.id, 'm1t1', 0, { done: true, watchedPct: 95 });
    const prog = s.getProgress(course.id);
    expect(prog.blockState['m1t1:0'].done).toBe(true);
    expect(prog.blockState['m1t1:0'].watchedPct).toBe(95);
  });
});
