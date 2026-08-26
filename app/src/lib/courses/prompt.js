/**
 * LevelShift — Frontier-AI course generation prompt
 *
 * The user copies this prompt, pastes it into any capable AI (ChatGPT, Claude,
 * Gemini with browsing, etc.), appends what course they want (and any video
 * preferences), and pastes the returned JSON into LevelShift's import box.
 *
 * The prompt embeds the exact schema so the model has a precise target.
 */

import { EXAMPLE_COURSE, PRACTICE_LANGUAGES } from './schema.js';

export const GENERATION_PROMPT = `You are creating a course for "LevelShift", a self-study app. Output ONLY a single valid JSON object (no prose, no markdown fences) that EXACTLY matches this schema.

TOP LEVEL:
{
  "schemaVersion": 1,
  "id": "custom-<short-unique-slug>",
  "title": "<course title>",
  "description": "<one line>",
  "radarAxes": ["<3-6 skill areas this course develops>"],
  "concepts": { "<conceptId>": { "prereqs": ["<otherConceptId>"], "axis": "<one of radarAxes>" } },
  "modules": [ { "id": "m1", "title": "<module title>", "topics": [ <topic> ] } ]
}

TOPIC:
{
  "id": "m1t1",
  "title": "<topic title>",
  "teaches": ["<conceptId>", "..."],   // must appear in top-level "concepts"
  "axis": "<one of radarAxes>",
  "blocks": [ <block>, <block>, ... ]  // ordered page content
}

BLOCK TYPES (use a rich mix):
- { "type": "text", "md": "<markdown: headings, **bold**, lists, \`code\`, links>" }
- { "type": "video", "provider": "youtube", "videoId": "<REAL 11-char YouTube video id>", "title": "<title>", "completeAtPercent": 90 }
- { "type": "practice", "language": "<one of: ${PRACTICE_LANGUAGES.join(', ')}>", "prompt": "<task>", "starter": "<starter code>", "expectedOutput": "<exact stdout to match, optional>", "solution": "<full solution, optional>" }
- { "type": "quiz", "question": "<q>", "options": ["a","b","c"], "correct": <0-based index>, "explanation": "<why>" }

RULES:
1. Output MUST be valid JSON and nothing else. Do NOT wrap it in markdown, and do NOT add commentary before or after.
2. CRITICAL: inside any string value, escape every line break as \\n. Never put a raw/literal newline inside a JSON string. Prefer compact JSON. Make sure every string and bracket is closed — do not truncate.
3. For every "video" block, find a REAL, currently-watchable YouTube video and use its true 11-character id (the part after v= or youtu.be/). Do NOT invent ids. If you cannot verify a video, omit the video block.
4. Every conceptId in a topic's "teaches" must exist in top-level "concepts".
5. Keep it focused: 2-5 modules, 3-8 topics each, 3-8 blocks per topic.
6. Use the requested language for any video/text if the user asked (e.g. "in Hindi").
7. Prefer a HOOK → EXPLAIN → WATCH → PRACTICE → QUIZ flow within a topic.

Here is a tiny EXAMPLE of the exact shape (imitate the structure, not the content):
${JSON.stringify(EXAMPLE_COURSE, null, 2)}

NOW CREATE THE COURSE FOR THIS REQUEST:
<<< describe your course here — topic, level, language, and any specific YouTube videos or a long video you want included, e.g. "an Agentic AI beginner course in Hindi, include good Hindi YouTube tutorials" >>>`;

/**
 * The placeholder line in GENERATION_PROMPT where the user's course request
 * goes. buildFullPrompt swaps this out for what the user typed in-app.
 */
const REQUEST_PLACEHOLDER =
  '<<< describe your course here — topic, level, language, and any specific YouTube videos or a long video you want included, e.g. "an Agentic AI beginner course in Hindi, include good Hindi YouTube tutorials" >>>';

/**
 * Build ONE ready-to-paste prompt = the full generation prompt (schema + rules
 * + example) with the user's own course request substituted into the request
 * slot. This lets the user type WHAT they want inside LevelShift and copy a
 * single combined prompt, instead of copying the prompt and hand-appending
 * their request in the AI chat.
 *
 * If the request is empty, we fall back to the placeholder so the copied prompt
 * still makes sense on its own.
 *
 * @param {string} userRequest - free-text course request typed by the user
 * @returns {string}
 */
export function buildFullPrompt(userRequest) {
  const req = String(userRequest || '').trim();
  if (!req) return GENERATION_PROMPT;
  return GENERATION_PROMPT.replace(REQUEST_PLACEHOLDER, req);
}
