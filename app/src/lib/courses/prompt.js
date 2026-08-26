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

export const GENERATION_PROMPT = `You are creating a course for "LevelShift", a self-study app. Produce ONE JSON object that EXACTLY matches the schema below, and output it inside a single \`\`\`json code block so it is easy to copy. Put NOTHING before or after the code block.

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

OUTPUT FORMAT (follow exactly):
- Output the WHOLE course as ONE JSON object inside a single \`\`\`json ... \`\`\` fenced code block.
- The JSON must be strictly valid — it must parse with JSON.parse on the first try.
- Do NOT change, invent, or omit any schema key names. Use ONLY the keys shown above.

JSON VALIDITY RULES (these are the ones that usually break — follow them precisely):
1. Escape EVERY double quote inside a string value as \\". A raw " inside a value ends the string early and breaks the whole file. Prefer single quotes ' when quoting words inside prose. Example — WRONG: "md": "ask: "what?" now"   RIGHT: "md": "ask: \\"what?\\" now"   (or)   "md": "ask: 'what?' now".
2. Escape EVERY line break inside a string value as \\n. Never put a raw/literal newline inside a JSON string.
3. Balance ALL brackets and braces. Every { has a matching }, every [ a matching ]. Do not truncate. Nothing may follow the final closing brace.
4. No trailing commas. No comments in the actual output (the // notes above are just documentation).

STRUCTURE RULES:
5. Every "topic" object MUST live inside its module's "topics" array. NEVER place a topic at the "modules" level. Modules contain topics; topics contain blocks.
6. Every conceptId in a topic's "teaches" MUST also appear as a key in top-level "concepts".
7. Every "axis" value (on topics) and every concept "axis" MUST be one of the strings in "radarAxes".

CONTENT RULES:
8. For every "video" block, use a REAL, currently-watchable YouTube video's true 11-character id (the part after v= or youtu.be/). Do NOT invent ids. If you cannot verify a video, omit the video block.
9. Keep it focused: 2-5 modules, 3-8 topics each, 3-8 blocks per topic.
10. Use the requested language for any video/text if the user asked (e.g. "in Hindi").
11. Prefer a HOOK → EXPLAIN → WATCH → PRACTICE → QUIZ flow within a topic.

BEFORE YOU RESPOND — self-check (do this silently, then output only the code block):
- Re-read your JSON and confirm it parses. Every inner " is \\", every newline is \\n.
- Confirm brackets are balanced and nothing follows the last }.
- Confirm every topic is inside a module's "topics" array, and every teaches/axis reference resolves.
If anything fails, fix it, then output the final corrected JSON in the code block.

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
