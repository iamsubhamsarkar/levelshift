/**
 * LevelShift — AI (Ask Atlas) — Bring Your Own Key
 *
 * Optional, opt-in AI tutor powered by the learner's OWN free Google Gemini
 * API key. LevelShift has no backend, so the browser calls Gemini directly
 * with the user's key — their key, their free quota.
 *
 * SECURITY / PRIVACY NOTES
 * ------------------------
 * - The API key is stored in its OWN localStorage key ('levelshift_ai_key'),
 *   deliberately SEPARATE from the main 'levelshift_data' blob. This keeps the
 *   key OUT of the Export/Import backup JSON, so a user can never accidentally
 *   share their key by sharing a backup file.
 * - In a static (no-backend) app the key necessarily lives client-side. That is
 *   acceptable for BYOK because it is the user's own key and quota. We never
 *   transmit it anywhere except Google's official endpoint.
 *
 * MODEL CHOICE
 * ------------
 * We target `gemini-flash-lite-latest` — a moving alias that always points at
 * Google's current Flash-Lite model. Using the alias (rather than a pinned
 * version like `gemini-2.5-flash-lite`) means we don't break when Google retires
 * old versions: the `2.5-*` models now return 404 "no longer available to new
 * users". Flash-Lite has the most generous free-tier quota.
 */

const AI_KEY_STORAGE = 'levelshift_ai_key';
const DEFAULT_MODEL = 'gemini-flash-lite-latest';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 30000;

// ─── Key storage (kept out of the exportable data blob) ────────────────────────

/** @returns {string|null} */
export function getApiKey() {
  try {
    return localStorage.getItem(AI_KEY_STORAGE) || null;
  } catch {
    return null;
  }
}

/** @param {string} key */
export function setApiKey(key) {
  try {
    localStorage.setItem(AI_KEY_STORAGE, (key || '').trim());
  } catch {
    /* storage disabled */
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(AI_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

/** True if a non-empty key is stored. */
export function hasApiKey() {
  const k = getApiKey();
  return !!(k && k.length > 10);
}

// ─── Low-level Gemini call ─────────────────────────────────────────────────────

/**
 * Call Gemini generateContent with a system instruction + user prompt.
 * @param {string} systemInstruction
 * @param {string} userPrompt
 * @param {object} [opts]
 * @param {string} [opts.model]
 * @param {number} [opts.maxOutputTokens]
 * @param {number} [opts.temperature]
 * @returns {Promise<{ok: boolean, text: string, error?: string}>}
 */
export async function callGemini(systemInstruction, userPrompt, opts = {}) {
  const key = getApiKey();
  if (!key) return { ok: false, text: '', error: 'No API key set. Enable AI in Settings first.' };

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxOutputTokens ?? 1024
    }
  };

  // Try the preferred model; if it 404s (retired/unavailable), retry once with
  // a pinned fallback so a moving alias going away never breaks the feature.
  const models = opts.model ? [opts.model] : [DEFAULT_MODEL, FALLBACK_MODEL];
  let lastError = 'Unknown error.';

  for (const model of models) {
    const url = `${API_BASE}/${model}:generateContent`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': key
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.status === 404) {
        // Model unavailable for this key — try the next candidate.
        lastError = humanizeHttpError(404);
        continue;
      }
      if (!res.ok) {
        return { ok: false, text: '', error: humanizeHttpError(res.status) };
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      if (!text) {
        const blocked = data?.promptFeedback?.blockReason;
        return { ok: false, text: '', error: blocked ? `Blocked by safety filter (${blocked}).` : 'Empty response from Gemini.' };
      }
      return { ok: true, text };
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') return { ok: false, text: '', error: 'Request timed out (30s).' };
      lastError = `Network error: ${err.message}`;
    }
  }

  return { ok: false, text: '', error: lastError };
}

function humanizeHttpError(status) {
  switch (status) {
    case 400: return 'Bad request — your API key may be invalid or malformed.';
    case 403: return 'Access denied — check that the Gemini API is enabled for your key.';
    case 404: return 'Model not available for your key. Google may have retired it — please update LevelShift.';
    case 429: return 'Rate limit hit — you have used your free quota for now. Try again in a minute.';
    case 500:
    case 503: return 'Google’s servers are busy. Try again shortly.';
    default: return `Gemini API error (HTTP ${status}).`;
  }
}

/**
 * Validate a key by making a tiny test call. Used by the "Test key" button.
 * @param {string} key
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function testApiKey(key) {
  const previous = getApiKey();
  setApiKey(key);
  const res = await callGemini(
    'You are a connectivity test. Reply with exactly: OK',
    'Say OK.'
  );
  if (!res.ok) {
    // restore previous key on failure so we don't clobber a working one
    if (previous) setApiKey(previous); else clearApiKey();
    return { ok: false, error: res.error };
  }
  return { ok: true };
}

// ─── Context building (local — no extra AI call) ───────────────────────────────

/**
 * Turn a single card's structured content into readable context text.
 * We reuse the fields the app already stores, so no extra token cost.
 * @param {{id?: string, type: string, content: object}} card
 * @returns {string}
 */
export function describeCard(card) {
  if (!card || !card.content) return '';
  const c = card.content;
  const lines = [`Card type: ${card.type}`];

  switch (card.type) {
    case 'hook':
      if (c.question) lines.push(`Question: ${c.question}`);
      if (c.code) lines.push(`Code:\n${c.code}`);
      break;
    case 'fail_first':
      if (c.prompt) lines.push(`Task: ${c.prompt}`);
      if (c.starterCode) lines.push(`Starter code:\n${c.starterCode}`);
      if (c.hint) lines.push(`Hint: ${c.hint}`);
      if (c.solutionCode) lines.push(`Model solution:\n${c.solutionCode}`);
      break;
    case 'analogy':
      if (c.text) lines.push(`Analogy: ${c.text}`);
      break;
    case 'code':
      if (c.code) lines.push(`Code:\n${c.code}`);
      if (c.annotation) lines.push(`Notes: ${c.annotation}`);
      break;
    case 'break_it':
      if (c.setup) lines.push(`Setup:\n${c.setup}`);
      if (c.modification) lines.push(`Change: ${c.modification}`);
      if (c.question) lines.push(`Question: ${c.question}`);
      if (c.explanation) lines.push(`Explanation: ${c.explanation}`);
      break;
    case 'contrast':
      if (c.label) lines.push(c.label);
      if (c.codeA) lines.push(`Option A:\n${c.codeA}`);
      if (c.codeB) lines.push(`Option B:\n${c.codeB}`);
      if (c.question) lines.push(`Question: ${c.question}`);
      if (c.explanation) lines.push(`Explanation: ${c.explanation}`);
      break;
    case 'explain_back':
      if (c.prompt) lines.push(`Prompt: ${c.prompt}`);
      if (c.sentence) lines.push(`Fill-in: ${c.sentence}`);
      break;
    case 'connect':
      if (c.text) lines.push(c.text);
      if (c.code) lines.push(`Code:\n${c.code}`);
      if (c.note) lines.push(`Note: ${c.note}`);
      break;
    case 'theory':
      if (c.title) lines.push(`Title: ${c.title}`);
      if (Array.isArray(c.sections)) {
        c.sections.forEach((s) => {
          if (s?.heading) lines.push(`Section: ${s.heading}`);
          if (s?.body) lines.push(s.body);
        });
      }
      if (c.body) lines.push(c.body);
      break;
    case 'build_step':
      if (c.goal) lines.push(`Goal: ${c.goal}`);
      if (c.why) lines.push(`Why: ${c.why}`);
      if (c.verify) lines.push(`Verify: ${c.verify}`);
      break;
    default:
      // Fallback: stringify shallowly
      lines.push(JSON.stringify(c).slice(0, 800));
  }
  return lines.join('\n');
}

/**
 * Build the system instruction that grounds Gemini as a LevelShift tutor,
 * including the current date/time (the model is stateless and has no clock).
 * @param {object} ctx
 * @param {string} [ctx.unitTitle]
 * @param {number} [ctx.phase]
 * @param {string} [ctx.cardContext]  full text from describeCard()
 * @param {string} [ctx.unitContext]  brief summary of sibling cards
 * @returns {string}
 */
export function buildSystemInstruction(ctx = {}) {
  const now = new Date();
  const dateStr = now.toLocaleString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });

  return [
    'You are "Atlas", a friendly, sharp coding tutor embedded inside LevelShift,',
    'a self-paced SDET/Java/Agentic-AI learning app. The learner is studying and',
    'may be stuck or curious about the CURRENT card they are looking at.',
    '',
    `The current real-world date and time is: ${dateStr}.`,
    'Use this if the learner asks about time, dates, deadlines, or "today".',
    '',
    ctx.unitTitle ? `Current unit: "${ctx.unitTitle}" (phase ${ctx.phase ?? '?'}).` : '',
    '',
    'CURRENT CARD CONTENT:',
    ctx.cardContext || '(none)',
    '',
    ctx.unitContext ? `OTHER CARDS IN THIS UNIT (for context):\n${ctx.unitContext}` : '',
    '',
    'TUTORING RULES:',
    '- Be concise and encouraging. Prefer short paragraphs and small examples.',
    '- Explain the CONCEPT and guide the learner to the answer. Do NOT just dump',
    '  the final quiz answer if the card is a quiz — nudge them toward it.',
    '- For coding questions, give minimal, correct examples.',
    '- If the question is unrelated to the card, still help, but stay on learning.',
    '- Use plain language. Format code in fenced code blocks.'
  ].filter(Boolean).join('\n');
}

/**
 * High-level helper the UI calls: ask Atlas about the current card.
 * @param {string} userQuestion
 * @param {object} ctx  same shape as buildSystemInstruction ctx
 * @returns {Promise<{ok: boolean, text: string, error?: string}>}
 */
export async function askAtlas(userQuestion, ctx = {}) {
  const system = buildSystemInstruction(ctx);
  const prompt = userQuestion?.trim() || 'Explain this card in simple terms.';
  return callGemini(system, prompt);
}
