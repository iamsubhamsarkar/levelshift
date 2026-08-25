/**
 * LevelShift — Custom Courses Store
 *
 * Manages user-imported courses and their per-course progress. Kept entirely
 * separate from the base course's `levelshift_data` blob:
 *   - 'levelshift_courses'          → array of course DEFINITIONS (validated JSON)
 *   - 'levelshift_course_progress'  → { [courseId]: progress } (concept strengths,
 *                                       completed topics, block state, xp)
 *   - 'levelshift_active_course'    → id of the course being viewed ('base' or custom)
 *
 * The base SDET/Agentic course is represented by the id 'base' and is NEVER
 * stored here — it keeps using the existing pipeline/stores untouched.
 */

import { writable, derived, get } from 'svelte/store';

const COURSES_KEY = 'levelshift_courses';
const PROGRESS_KEY = 'levelshift_course_progress';
const ACTIVE_KEY = 'levelshift_active_course';

export const BASE_COURSE_ID = 'base';

// ─── Persistence helpers ────────────────────────────────────────────────────────

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      alert('Storage full! Export a course backup and remove an old course to free space.');
    }
    return false;
  }
}

// ─── Stores ───────────────────────────────────────────────────────────────────

/** @type {import('svelte/store').Writable<object[]>} custom course definitions */
export const customCourses = writable(loadJson(COURSES_KEY, []));
/** @type {import('svelte/store').Writable<Record<string, object>>} per-course progress */
export const courseProgress = writable(loadJson(PROGRESS_KEY, {}));
/** @type {import('svelte/store').Writable<string>} active course id */
export const activeCourseId = writable(loadJson(ACTIVE_KEY, BASE_COURSE_ID));

customCourses.subscribe((v) => saveJson(COURSES_KEY, v));
courseProgress.subscribe((v) => saveJson(PROGRESS_KEY, v));
activeCourseId.subscribe((v) => saveJson(ACTIVE_KEY, v));

/** The active custom course object, or null when the base course is active. */
export const activeCourse = derived(
  [customCourses, activeCourseId],
  ([$courses, $id]) => ($id === BASE_COURSE_ID ? null : $courses.find((c) => c.id === $id) || null)
);

// ─── CRUD ───────────────────────────────────────────────────────────────────────

/** Add (or replace by id) a validated course. Returns the stored course. */
export function addCourse(course) {
  customCourses.update((list) => {
    const idx = list.findIndex((c) => c.id === course.id);
    if (idx >= 0) list[idx] = course;
    else list.push(course);
    return [...list];
  });
  ensureProgress(course.id, course);
  return course;
}

/** Remove a course and its progress. */
export function deleteCourse(courseId) {
  customCourses.update((list) => list.filter((c) => c.id !== courseId));
  courseProgress.update((p) => {
    const next = { ...p };
    delete next[courseId];
    return next;
  });
  // If it was active, fall back to base.
  if (get(activeCourseId) === courseId) activeCourseId.set(BASE_COURSE_ID);
}

/** Set the active course (validates it still exists, else base). */
export function setActiveCourse(courseId) {
  if (courseId === BASE_COURSE_ID) { activeCourseId.set(BASE_COURSE_ID); return; }
  const exists = get(customCourses).some((c) => c.id === courseId);
  activeCourseId.set(exists ? courseId : BASE_COURSE_ID);
}

// ─── Per-course progress ─────────────────────────────────────────────────────────

/** Default progress bucket for a course. */
function defaultProgress() {
  return {
    completedTopics: [],   // topic ids
    blockState: {},        // `${topicId}:${blockIndex}` → { done, watchedPct, notes: [], answer }
    concepts: {},          // conceptId → { strength, lastPracticed, repetitions, easeFactor, interval, nextReview }
    totalXP: 0,
    lastActive: null
  };
}

/** Make sure a progress bucket exists; seeds concepts from the course graph. */
export function ensureProgress(courseId, course) {
  courseProgress.update((p) => {
    if (!p[courseId]) p[courseId] = defaultProgress();
    // seed concept entries so decay/radar have something to track
    if (course && course.concepts) {
      for (const cid of Object.keys(course.concepts)) {
        if (!p[courseId].concepts[cid]) {
          p[courseId].concepts[cid] = {
            strength: 0, lastPracticed: null, repetitions: 0,
            easeFactor: 2.5, interval: 1, nextReview: null
          };
        }
      }
    }
    return { ...p };
  });
}

/** Get a course's progress bucket (or a fresh default, not persisted). */
export function getProgress(courseId) {
  return get(courseProgress)[courseId] || defaultProgress();
}

/** Count total topics in a course (denominator for completion %). */
export function countTopics(course) {
  if (!course || !Array.isArray(course.modules)) return 0;
  return course.modules.reduce((sum, m) => sum + (Array.isArray(m.topics) ? m.topics.length : 0), 0);
}

/** Completion percentage (0-100) for a course. */
export function completionPercent(courseId, course) {
  const total = countTopics(course);
  if (total === 0) return 0;
  const done = getProgress(courseId).completedTopics.length;
  return Math.round((done / total) * 100);
}

/** Persist arbitrary block state for a topic block. */
export function setBlockState(courseId, topicId, blockIndex, patch) {
  courseProgress.update((p) => {
    if (!p[courseId]) p[courseId] = defaultProgress();
    const key = `${topicId}:${blockIndex}`;
    p[courseId].blockState[key] = { ...(p[courseId].blockState[key] || {}), ...patch };
    return { ...p };
  });
}

/** Mark a topic complete and reinforce its concepts (feeds decay/radar). */
export function completeTopic(courseId, topic, quality = 4) {
  courseProgress.update((p) => {
    if (!p[courseId]) p[courseId] = defaultProgress();
    const bucket = p[courseId];
    if (!bucket.completedTopics.includes(topic.id)) {
      bucket.completedTopics.push(topic.id);
      bucket.totalXP += 50;
    }
    bucket.lastActive = new Date().toISOString().split('T')[0];

    // Reinforce concepts this topic teaches (simple SM-2-ish update).
    (topic.teaches || []).forEach((cid) => {
      const c = bucket.concepts[cid] || {
        strength: 0, lastPracticed: null, repetitions: 0, easeFactor: 2.5, interval: 1, nextReview: null
      };
      c.repetitions += 1;
      c.strength = Math.min(100, Math.max(c.strength, 60) + 10);
      c.lastPracticed = bucket.lastActive;
      bucket.concepts[cid] = c;
    });

    return { ...p };
  });
}
