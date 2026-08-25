/**
 * LevelShift — Custom Course Schema (v1)
 *
 * A "custom course" is a user-imported course in the TOPIC-PAGE format
 * (distinct from the base course's card-deck format). One course JSON contains
 * modules → topics → ordered content blocks. The same JSON is what the
 * frontier-AI generation prompt asks the model to produce, and what the import
 * box validates.
 *
 * This module is the single source of truth for the shape. `validate.js`
 * enforces it; the import wizard shows the prompt built from these rules.
 */

export const SCHEMA_VERSION = 1;

/** Allowed content block types inside a topic. */
export const BLOCK_TYPES = ['text', 'video', 'practice', 'quiz'];

/** Languages we can execute (maps to Wandbox in code-runner.js). */
export const PRACTICE_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'c',
  'csharp', 'go', 'rust', 'ruby', 'php', 'bash'
];

/** Size guardrails (localStorage is ~5MB total; keep one course sane). */
export const LIMITS = {
  maxCourseBytes: 1_500_000,     // ~1.5MB per course JSON
  maxModules: 60,
  maxTopicsPerModule: 60,
  maxBlocksPerTopic: 60,
  maxRadarAxes: 8,
  maxTextChars: 20_000,          // per text block
  maxTitleChars: 200
};

/**
 * Canonical example course — used in the generation prompt so the frontier AI
 * has an exact target to imitate. Kept intentionally small.
 */
export const EXAMPLE_COURSE = {
  schemaVersion: SCHEMA_VERSION,
  id: 'custom-example',
  title: 'Example: Intro to X',
  description: 'A one-line description of the course.',
  radarAxes: ['Fundamentals', 'Practice', 'Advanced'],
  modules: [
    {
      id: 'm1',
      title: 'Getting Started',
      topics: [
        {
          id: 'm1t1',
          title: 'What is X?',
          teaches: ['fund.intro'],
          axis: 'Fundamentals',
          blocks: [
            { type: 'text', md: 'X is **a thing**. Here is why it matters.' },
            {
              type: 'video',
              provider: 'youtube',
              videoId: 'dQw4w9WgXcQ',
              title: 'Intro video',
              completeAtPercent: 90
            },
            {
              type: 'practice',
              language: 'python',
              prompt: 'Print hello.',
              starter: "print('hello')",
              expectedOutput: 'hello'
            },
            {
              type: 'quiz',
              question: 'What is X?',
              options: ['A thing', 'Another thing'],
              correct: 0,
              explanation: 'X is a thing.'
            }
          ]
        }
      ]
    }
  ],
  concepts: {
    'fund.intro': { prereqs: [], axis: 'Fundamentals' }
  }
};
