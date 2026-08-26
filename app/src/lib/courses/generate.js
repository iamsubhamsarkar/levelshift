/**
 * LevelShift — In-app course generation (BYOK Gemini)
 *
 * The "seamless" path for custom courses: instead of copying a prompt into a
 * chat and pasting JSON back, LevelShift calls Gemini DIRECTLY with the user's
 * own key to AUTHOR the course.
 *
 *   generateCourse(request, model)  → asks the CHOSEN model to author the course
 *
 * Design:
 *  - The GENERATION model is user-selectable (dropdown): quality-sensitive, so
 *    the user picks Flash-Lite / Flash / Pro and spends their own free quota.
 *  - If the model's JSON isn't perfectly valid, we recover DETERMINISTICALLY
 *    (sanitize smart-quotes/newlines/invisible chars + balance brackets) via
 *    parseAndValidate. There is NO AI-based JSON repair — the strengthened
 *    generation prompt (code-block output + self-check) makes the first result
 *    reliable, and deterministic recovery handles the rest without any risk of
 *    an LLM silently altering course content.
 *
 * The network call lives in ai.js (`callGemini`). Orchestration here accepts an
 * injectable `caller` so it is unit-testable without the network.
 */

import { callGemini } from '../utils/ai.js';
import { buildFullPrompt } from './prompt.js';
import { parseAndValidate } from './validate.js';

/**
 * Models offered in the generation dropdown. We use Google's moving `*-latest`
 * aliases where possible so we don't break when specific versions retire.
 * Kept as a single constant so it's trivial to update as models change.
 */
export const GENERATION_MODELS = [
  {
    id: 'gemini-flash-lite-latest',
    label: 'Flash-Lite — fastest, most free quota (~1000/day)',
    note: 'Good for simple courses. Lowest quality of the three.'
  },
  {
    id: 'gemini-flash-latest',
    label: 'Flash — balanced quality & quota (~250/day)',
    note: 'Recommended default for most courses.'
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Pro — best quality, least free quota (~100/day)',
    note: 'Best depth; use when quality matters most.'
  }
];

export const DEFAULT_GENERATION_MODEL = 'gemini-flash-latest';

/** Big enough for a full multi-module course. */
const GENERATION_MAX_TOKENS = 8192;

// ─── Prompt ─────────────────────────────────────────────────────────────────────

/** System instruction for GENERATION — grounds the model as a course author. */
export function generationSystemInstruction() {
  return [
    'You are a course-authoring engine for "LevelShift", a self-study app.',
    'You output the course as ONE valid JSON object inside a single ```json code block.',
    'Escape every double quote inside a string as \\", and every newline as \\n.',
    'Put every topic inside its module\'s "topics" array. Never place a topic at',
    'the modules level. Verify your brackets are balanced and nothing follows the',
    'final closing brace.'
  ].join('\n');
}

// ─── Generation ─────────────────────────────────────────────────────────────────

/**
 * Generate a course via the user's chosen model, then parse + validate. If the
 * model's JSON isn't perfectly valid, parseAndValidate recovers it
 * DETERMINISTICALLY (sanitize + structural bracket repair). No AI repair.
 *
 * @param {string} request     - the user's course request (free text)
 * @param {object} [opts]
 * @param {string} [opts.model] - one of GENERATION_MODELS ids
 * @param {Function} [opts.caller] - injectable (system,user,opts)=>Promise (tests)
 * @returns {Promise<{ ok: boolean, course?: object, errors: string[], warnings: string[], raw?: string, repaired?: boolean }>}
 */
export async function generateCourse(request, opts = {}) {
  const model = opts.model || DEFAULT_GENERATION_MODEL;
  const caller = opts.caller || callGemini;

  const system = generationSystemInstruction();
  const prompt = buildFullPrompt(request);

  // Try the chosen model, then fall back to other known-good aliases if the
  // call fails (e.g. a model that 404s for this key/region). This mirrors the
  // resilience the tutor path already has.
  const fallbacks = [model, ...GENERATION_MODELS.map((m) => m.id).filter((id) => id !== model)];
  let res = null;
  let lastErr = 'Generation failed.';
  for (const m of fallbacks) {
    res = await caller(system, prompt, { model: m, maxOutputTokens: GENERATION_MAX_TOKENS, temperature: 0.6 });
    if (res.ok) break;
    lastErr = res.error || lastErr;
    // Only keep trying other models for availability-type errors; for quota/
    // auth errors, stop early (they'll fail on every model).
    if (!/not available|HTTP 404|update LevelShift/i.test(res.error || '')) break;
  }
  if (!res || !res.ok) {
    return { ok: false, errors: [lastErr], warnings: [] };
  }

  // Deterministic parse + validate (includes sanitize + structural repair).
  const result = parseAndValidate(res.text);
  if (result.ok) return { ...result, raw: res.text, repaired: !!result.structurallyRepaired };

  // Still invalid after deterministic recovery — surface the error and hand
  // back the raw text so the user can inspect / retry / regenerate.
  return { ok: false, errors: result.errors, warnings: result.warnings || [], raw: res.text };
}
