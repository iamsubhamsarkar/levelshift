/**
 * LevelShift — Custom Course Validation & Sanitization
 *
 * Course JSON is UNTRUSTED input (pasted from a frontier AI / a file). This
 * module validates it strictly against the v1 schema and returns a normalized,
 * SAFE course object. Anything unexpected is rejected or stripped — never
 * trusted.
 *
 * Security stance:
 *  - Reject unknown block types.
 *  - Never store or render raw HTML — text is treated as markdown and any HTML
 *    is escaped by the renderer (see sanitizeText here + safe render in UI).
 *  - Video is YouTube-only via a validated 11-char ID; we never accept an
 *    arbitrary iframe/embed URL.
 *  - Enforce size + count limits to protect localStorage.
 */

import {
  SCHEMA_VERSION, BLOCK_TYPES, PRACTICE_LANGUAGES, LIMITS
} from './schema.js';

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** @typedef {{ ok: boolean, course?: object, errors: string[], warnings: string[] }} ValidationResult */

/**
 * Validate + normalize a parsed course object.
 * @param {unknown} raw - already JSON.parsed object
 * @returns {ValidationResult}
 */
export function validateCourse(raw) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(raw)) {
    return { ok: false, errors: ['Course must be a JSON object.'], warnings };
  }

  // Size guard (stringify once).
  const byteLen = byteLength(safeStringify(raw));
  if (byteLen > LIMITS.maxCourseBytes) {
    errors.push(`Course is too large (${Math.round(byteLen / 1024)} KB, max ${Math.round(LIMITS.maxCourseBytes / 1024)} KB).`);
    return { ok: false, errors, warnings };
  }

  // schemaVersion
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    warnings.push(`Unknown schemaVersion (${raw.schemaVersion}); expected ${SCHEMA_VERSION}. Proceeding best-effort.`);
  }

  const title = str(raw.title).slice(0, LIMITS.maxTitleChars).trim();
  if (!title) errors.push('Course "title" is required.');

  // radarAxes
  let radarAxes = Array.isArray(raw.radarAxes)
    ? raw.radarAxes.map((a) => str(a).slice(0, 40).trim()).filter(Boolean)
    : [];
  if (radarAxes.length === 0) {
    radarAxes = ['Progress'];
    warnings.push('No radarAxes provided — defaulting to a single "Progress" axis.');
  }
  if (radarAxes.length > LIMITS.maxRadarAxes) {
    radarAxes = radarAxes.slice(0, LIMITS.maxRadarAxes);
    warnings.push(`Too many radar axes; kept first ${LIMITS.maxRadarAxes}.`);
  }
  const axisSet = new Set(radarAxes);

  // modules
  const modulesRaw = Array.isArray(raw.modules) ? raw.modules : [];
  if (modulesRaw.length === 0) errors.push('Course must have at least one module.');
  if (modulesRaw.length > LIMITS.maxModules) {
    errors.push(`Too many modules (max ${LIMITS.maxModules}).`);
  }

  const seenTopicIds = new Set();
  const usedConcepts = new Set();
  const modules = [];

  modulesRaw.slice(0, LIMITS.maxModules).forEach((m, mi) => {
    if (!isPlainObject(m)) { errors.push(`Module #${mi + 1} is not an object.`); return; }
    const mId = str(m.id) || `m${mi + 1}`;
    const mTitle = str(m.title).slice(0, LIMITS.maxTitleChars).trim() || `Module ${mi + 1}`;
    const topicsRaw = Array.isArray(m.topics) ? m.topics : [];
    if (topicsRaw.length > LIMITS.maxTopicsPerModule) {
      errors.push(`Module "${mTitle}" has too many topics (max ${LIMITS.maxTopicsPerModule}).`);
    }

    const topics = [];
    topicsRaw.slice(0, LIMITS.maxTopicsPerModule).forEach((t, ti) => {
      if (!isPlainObject(t)) { errors.push(`Topic #${ti + 1} in "${mTitle}" is not an object.`); return; }
      let tId = str(t.id) || `${mId}t${ti + 1}`;
      if (seenTopicIds.has(tId)) tId = `${tId}_${mi}_${ti}`; // de-dupe ids
      seenTopicIds.add(tId);

      const tTitle = str(t.title).slice(0, LIMITS.maxTitleChars).trim() || `Topic ${ti + 1}`;
      const teaches = Array.isArray(t.teaches)
        ? t.teaches.map((c) => str(c).trim()).filter(Boolean)
        : [];
      teaches.forEach((c) => usedConcepts.add(c));

      let axis = str(t.axis).trim();
      if (axis && !axisSet.has(axis)) {
        warnings.push(`Topic "${tTitle}" references axis "${axis}" not in radarAxes; ignoring.`);
        axis = '';
      }
      if (!axis) axis = radarAxes[0];

      const { blocks, blockErrors, blockWarnings } = validateBlocks(t.blocks, tTitle);
      errors.push(...blockErrors);
      warnings.push(...blockWarnings);

      topics.push({ id: tId, title: tTitle, teaches, axis, blocks });
    });

    modules.push({ id: mId, title: mTitle, topics });
  });

  // concepts (per-course graph). Build/repair so decay/spaced-rep have data.
  const concepts = normalizeConcepts(raw.concepts, usedConcepts, radarAxes, axisSet, warnings);

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  const course = {
    schemaVersion: SCHEMA_VERSION,
    id: str(raw.id) || `custom-${cryptoId()}`,
    title,
    description: str(raw.description).slice(0, 500).trim(),
    format: 'topic_page',
    radarAxes,
    modules,
    concepts,
    createdAt: new Date().toISOString()
  };

  return { ok: true, course, errors, warnings };
}

/** Validate the blocks array of a topic. */
function validateBlocks(blocksRaw, topicTitle) {
  const blockErrors = [];
  const blockWarnings = [];
  const blocks = [];

  if (!Array.isArray(blocksRaw) || blocksRaw.length === 0) {
    blockErrors.push(`Topic "${topicTitle}" has no content blocks.`);
    return { blocks, blockErrors, blockWarnings };
  }
  if (blocksRaw.length > LIMITS.maxBlocksPerTopic) {
    blockErrors.push(`Topic "${topicTitle}" has too many blocks (max ${LIMITS.maxBlocksPerTopic}).`);
    return { blocks, blockErrors, blockWarnings };
  }

  blocksRaw.forEach((b, bi) => {
    if (!isPlainObject(b) || !BLOCK_TYPES.includes(b.type)) {
      blockWarnings.push(`Skipped unknown/invalid block #${bi + 1} in "${topicTitle}".`);
      return;
    }

    switch (b.type) {
      case 'text': {
        const md = sanitizeText(str(b.md)).slice(0, LIMITS.maxTextChars);
        if (md.trim()) blocks.push({ type: 'text', md });
        break;
      }
      case 'video': {
        const videoId = str(b.videoId).trim();
        if (!YT_ID_RE.test(videoId)) {
          blockWarnings.push(`Skipped video in "${topicTitle}": invalid YouTube ID.`);
          break;
        }
        let pct = Number(b.completeAtPercent);
        if (!Number.isFinite(pct) || pct < 10 || pct > 100) pct = 90;
        blocks.push({
          type: 'video',
          provider: 'youtube',
          videoId,
          title: sanitizeText(str(b.title)).slice(0, LIMITS.maxTitleChars),
          completeAtPercent: pct
        });
        break;
      }
      case 'practice': {
        let language = str(b.language).toLowerCase().trim();
        if (!PRACTICE_LANGUAGES.includes(language)) {
          blockWarnings.push(`Practice in "${topicTitle}" uses unsupported language "${language}"; defaulting to python.`);
          language = 'python';
        }
        blocks.push({
          type: 'practice',
          language,
          prompt: sanitizeText(str(b.prompt)).slice(0, 2000),
          starter: str(b.starter).slice(0, 10_000),
          expectedOutput: str(b.expectedOutput).slice(0, 5000),
          solution: str(b.solution).slice(0, 10_000)
        });
        break;
      }
      case 'quiz': {
        const options = Array.isArray(b.options)
          ? b.options.map((o) => sanitizeText(str(o)).slice(0, 500)).filter(Boolean)
          : [];
        const correct = Number(b.correct);
        if (options.length < 2 || !Number.isInteger(correct) || correct < 0 || correct >= options.length) {
          blockWarnings.push(`Skipped invalid quiz in "${topicTitle}".`);
          break;
        }
        blocks.push({
          type: 'quiz',
          question: sanitizeText(str(b.question)).slice(0, 1000),
          options,
          correct,
          explanation: sanitizeText(str(b.explanation)).slice(0, 2000)
        });
        break;
      }
    }
  });

  if (blocks.length === 0) {
    blockErrors.push(`Topic "${topicTitle}" has no valid content blocks after validation.`);
  }
  return { blocks, blockErrors, blockWarnings };
}

/** Build a clean per-course concept graph, filling in any concept referenced by topics. */
function normalizeConcepts(conceptsRaw, usedConcepts, radarAxes, axisSet, warnings) {
  const concepts = {};
  const src = isPlainObject(conceptsRaw) ? conceptsRaw : {};

  // Start from declared concepts.
  for (const [id, def] of Object.entries(src)) {
    const cid = str(id).trim();
    if (!cid) continue;
    const prereqs = isPlainObject(def) && Array.isArray(def.prereqs)
      ? def.prereqs.map((p) => str(p).trim()).filter(Boolean)
      : [];
    let axis = isPlainObject(def) ? str(def.axis).trim() : '';
    if (!axisSet.has(axis)) axis = radarAxes[0];
    concepts[cid] = { prereqs, axis };
  }

  // Ensure every concept referenced by a topic exists.
  for (const cid of usedConcepts) {
    if (!concepts[cid]) {
      concepts[cid] = { prereqs: [], axis: radarAxes[0] };
    }
  }

  // Drop prereqs that point to non-existent concepts (avoid dangling graph).
  for (const def of Object.values(concepts)) {
    def.prereqs = def.prereqs.filter((p) => concepts[p]);
  }

  if (Object.keys(concepts).length === 0) {
    warnings.push('Course has no concepts — spaced-repetition/decay will be limited.');
  }
  return concepts;
}

// ─── Sanitization helpers ──────────────────────────────────────────────────────

/**
 * Neutralize anything script-like in text. We keep markdown characters but
 * strip HTML tags and dangerous URI schemes. The UI renderer additionally
 * escapes HTML, so this is defense-in-depth.
 * @param {string} s
 * @returns {string}
 */
export function sanitizeText(s) {
  return String(s || '')
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '') // drop script blocks
    .replace(/<[^>]+>/g, '')                                 // strip all HTML tags
    .replace(/javascript:/gi, '')                            // neutralize js: URIs
    .replace(/data:text\/html/gi, '')                        // neutralize data html
    .replace(/on\w+\s*=/gi, '');                             // strip inline handlers
}

// ─── Small utilities ────────────────────────────────────────────────────────────

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
function str(v) {
  return typeof v === 'string' ? v : (v == null ? '' : String(v));
}
function byteLength(s) {
  // Works in browser and Node.
  if (typeof Blob !== 'undefined') return new Blob([s]).size;
  return Buffer.byteLength(s, 'utf8');
}
function safeStringify(v) {
  try { return JSON.stringify(v); } catch { return ''; }
}
function cryptoId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID().slice(0, 8);
  } catch {}
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Parse a raw JSON string and validate. Tolerates code fences / stray prose
 * around the JSON (frontier AIs often wrap output in ```json ... ```).
 * @param {string} text
 * @returns {ValidationResult}
 */
export function parseAndValidate(text) {
  const extracted = extractJson(text);
  if (extracted == null) {
    // Most common reason we can't even find a complete {...}: the paste is
    // truncated (opening brace but no matching close), or there's no JSON.
    const hasOpen = String(text || '').includes('{');
    const errors = hasOpen
      ? ['Could not find a complete JSON object — it looks cut off (no matching closing "}"). The AI response may have been truncated; ask it to "continue" or regenerate, then paste the full JSON.']
      : ['Could not find any JSON in the pasted text. Paste the JSON the AI produced (it should start with "{").'];
    return { ok: false, errors, warnings: [] };
  }
  let parsed;
  try {
    parsed = JSON.parse(extracted);
  } catch (e) {
    return { ok: false, errors: describeJsonError(e, extracted), warnings: [] };
  }
  return validateCourse(parsed);
}

/**
 * Turn a raw JSON.parse error into an actionable, human-friendly message with
 * line/column and the likely cause (the #1 cause with AI output is a string
 * that contains a real line break or was left unterminated).
 * @param {Error} err
 * @param {string} src
 * @returns {string[]}
 */
export function describeJsonError(err, src) {
  const msg = String(err && err.message || err);
  const posMatch = msg.match(/position (\d+)/);
  const errors = [];

  if (posMatch) {
    const pos = Number(posMatch[1]);
    const before = src.slice(0, pos);
    const line = before.split('\n').length;
    const col = pos - before.lastIndexOf('\n');
    const snippet = src.slice(Math.max(0, pos - 40), pos + 40).replace(/\n/g, '⏎');
    errors.push(`Invalid JSON near line ${line}, column ${col}.`);
    errors.push(`…${snippet}…`);
  } else {
    errors.push(`Invalid JSON: ${msg}`);
  }

  // Common-cause hints.
  if (/control character|Bad control/i.test(msg)) {
    errors.push('Likely cause: a text value contains a real line break. In JSON, line breaks inside a string must be written as \\n. Ask the AI to "return valid minified JSON with newlines escaped as \\\\n".');
  } else if (/Unterminated|Unexpected end|end of/i.test(msg)) {
    errors.push('Likely cause: the JSON was cut off (a string or bracket is not closed). The AI response may have been truncated — ask it to "continue" or regenerate, and paste the complete JSON.');
  } else if (/property name/i.test(msg)) {
    errors.push('Likely cause: a missing comma, a trailing comma, or an unclosed string just before this point.');
  }
  return errors;
}

/**
 * Deterministically clean text pasted from a chat UI before parsing.
 *
 * WHY: Copying JSON directly out of a chat bubble (Gemini/Claude/GPT) often
 * fails to import even though the SAME JSON works when saved as a .json file
 * or run through a prettifier. That means the JSON is valid — the chat UI is
 * corrupting the paste with invisible/typographic characters. This strips the
 * usual culprits so JSON.parse can succeed. No AI, no dependencies — all native
 * String operations.
 *
 * Handled:
 *  - BOM (U+FEFF) and zero-width chars (U+200B..U+200D, U+2060, U+FEFF)
 *  - Non-breaking / narrow-no-break spaces (U+00A0, U+202F, U+2007) -> ' '
 *  - Smart/curly double quotes (U+201C/U+201D, and low/prime variants) -> "
 *  - Smart/curly single quotes (U+2018/U+2019/U+201B) -> '
 *  - Unicode NFC normalization
 *
 * NOTE: quote replacement is intended for the JSON *structure* the AI emits.
 * A genuine curly quote inside a text value will also be straightened, which is
 * a harmless, acceptable trade for making the paste importable. Course content
 * is markdown/plain text, not typography-sensitive.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitizePastedJson(text) {
  let s = String(text || '');

  // 1) Strip BOM + zero-width characters entirely.
  s = s.replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '');

  // 2) Normalize exotic spaces to a regular space.
  s = s.replace(/[\u00A0\u2007\u202F]/g, ' ');

  // 3) Straighten smart double quotes -> "
  s = s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u00AB\u00BB]/g, '"');

  // 4) Straighten smart single quotes -> '
  s = s.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // 5) Unicode NFC normalization (composes accents, etc.).
  try { s = s.normalize('NFC'); } catch { /* older engines: skip */ }

  return s;
}

/**
 * Sanitize + parse + pretty-print JSON found in arbitrary pasted text.
 * Used by the "Format / clean JSON" button so the user sees clean, valid,
 * indented JSON (and any remaining REAL error is easy to spot).
 *
 * @param {string} text
 * @returns {{ ok: boolean, formatted?: string, errors?: string[] }}
 */
export function formatJson(text) {
  const extracted = extractJson(text);
  if (extracted == null) {
    const hasOpen = String(text || '').includes('{');
    return {
      ok: false,
      errors: hasOpen
        ? ['Could not find a complete JSON object to format — it looks cut off (no matching closing "}").']
        : ['Nothing to format — paste the JSON the AI produced (it should start with "{").'],
    };
  }
  try {
    const obj = JSON.parse(extracted);
    return { ok: true, formatted: JSON.stringify(obj, null, 2) };
  } catch (e) {
    return { ok: false, errors: describeJsonError(e, extracted) };
  }
}

/** Pull the JSON object out of arbitrary text. Robust against ```json fences
 *  AND against markdown code fences that appear INSIDE string values.
 *  Sanitizes chat-UI paste corruption (smart quotes / NBSP / zero-width) first. */
export function extractJson(text) {
  const s = sanitizePastedJson(text);

  // Strategy: find the outer-most {...} by brace span in the raw text first.
  // This is correct even when the JSON contains ``` fences inside its strings.
  const rawSpan = braceSpan(s);
  if (rawSpan) return rawSpan;

  // Fallback: the whole thing may be wrapped in a ```json ... ``` fence with
  // no braces detectable outside it (rare). Try fenced content.
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const inner = braceSpan(fence[1]);
    if (inner) return inner;
  }
  return null;
}

/** Return the substring from the first `{` to the last `}`, or null. */
function braceSpan(str) {
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return str.slice(start, end + 1);
}
