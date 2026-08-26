<script>
  import { createEventDispatcher } from 'svelte';
  import { parseAndValidate, formatJson } from '../courses/validate.js';
  import { buildFullPrompt } from '../courses/prompt.js';
  import { generateCourse, GENERATION_MODELS, DEFAULT_GENERATION_MODEL } from '../courses/generate.js';
  import { hasApiKey } from '../utils/ai.js';
  import { addCourse, setActiveCourse, countTopics } from '../stores/courses.js';

  const dispatch = createEventDispatcher();

  let step = 1;               // 1 = get prompt, 2 = paste JSON, 3 = preview
  let pasted = '';
  let result = null;          // validation result
  let copied = false;
  let userRequest = '';       // what course the user wants (point 2)
  let formatMsg = '';         // feedback for the Format/clean button (point 1)

  // In-app generation (seamless path — BYOK Gemini)
  const aiAvailable = hasApiKey();
  let genModel = DEFAULT_GENERATION_MODEL;
  let generating = false;
  let genStatus = '';         // progress/status text during generation

  // Combined, ready-to-paste prompt = generation prompt + the user's request.
  $: fullPrompt = buildFullPrompt(userRequest);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      copied = false;
    }
  }

  // Seamless: generate the course in-app via the user's chosen model, with the
  // deterministic + guardrailed-repair recovery chain built in.
  async function generate() {
    if (!userRequest.trim() || generating) return;
    generating = true;
    result = null;
    genStatus = 'Asking the model to author your course…';
    try {
      const res = await generateCourse(userRequest, { model: genModel });
      if (res.ok) {
        result = res;
        if (res.repaired) genStatus = 'Generated (auto-fixed formatting).';
        step = 3;
      } else {
        result = { ok: false, errors: res.errors, warnings: [] };
        // If we got raw text back, drop it into the paste box so the user can
        // inspect / hand-fix / retry the deterministic tools on it.
        if (res.raw) { pasted = res.raw; }
        genStatus = '';
      }
    } catch (e) {
      result = { ok: false, errors: [`Generation error: ${e?.message || e}`], warnings: [] };
      genStatus = '';
    } finally {
      generating = false;
    }
  }

  function validate() {
    result = parseAndValidate(pasted);
    if (result.ok) step = 3;
  }

  // Deterministic clean + pretty-print (no AI). Fixes chat-paste corruption
  // (smart quotes / non-breaking / zero-width chars) and indents valid JSON.
  function cleanJson() {
    const res = formatJson(pasted);
    if (res.ok) {
      pasted = res.formatted;
      formatMsg = '✓ Cleaned & formatted';
      setTimeout(() => (formatMsg = ''), 2500);
    } else {
      result = { ok: false, errors: res.errors, warnings: [] };
      formatMsg = '';
    }
  }

  function importFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { pasted = ev.target.result; validate(); };
    reader.readAsText(file);
  }

  function save() {
    if (!result?.ok) return;
    addCourse(result.course);
    setActiveCourse(result.course.id);
    dispatch('done', { courseId: result.course.id });
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-6 space-y-5">
  <div class="flex items-center gap-3">
    <button class="text-text-muted hover:text-text-secondary" on:click={() => dispatch('cancel')}>←</button>
    <h1 class="text-xl font-bold text-text-primary">Add your course</h1>
  </div>

  <!-- Stepper -->
  <div class="flex items-center gap-2 text-xs">
    {#each ['Get prompt', 'Paste JSON', 'Preview'] as label, i}
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full flex items-center justify-center
          {step === i + 1 ? 'bg-accent-blue text-surface-0' : step > i + 1 ? 'bg-accent-green/20 text-accent-green' : 'bg-surface-2 text-text-muted'}">
          {step > i + 1 ? '✓' : i + 1}
        </span>
        <span class="{step === i + 1 ? 'text-text-primary' : 'text-text-muted'}">{label}</span>
        {#if i < 2}<span class="text-text-muted">→</span>{/if}
      </div>
    {/each}
  </div>

  {#if step === 1}
    <div class="card space-y-3">
      <p class="text-sm text-text-primary">
        LevelShift builds courses using any powerful AI you already have. Here's how:
      </p>
      <ol class="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
        <li>Describe the course you want below.</li>
        <li>Copy the combined prompt (your request is baked in).</li>
        <li>Open a capable AI with web search (ChatGPT, Claude, Gemini, etc.) and paste it.</li>
        <li>The AI returns a big JSON. Copy all of it.</li>
        <li>Come back and paste it in the next step.</li>
      </ol>

      <label class="block text-sm text-text-primary font-medium" for="course-request">
        What course do you want?
      </label>
      <textarea
        id="course-request"
        bind:value={userRequest}
        rows="3"
        placeholder={'e.g. "an Agentic AI beginner course in Hindi, include good Hindi YouTube tutorials"'}
        class="w-full bg-surface-0 border border-surface-3 rounded-lg p-3 text-sm
               text-text-primary resize-y focus:outline-none focus:border-accent-blue"
      ></textarea>

      {#if aiAvailable}
        <!-- Seamless in-app generation via the user's BYOK key -->
        <div class="rounded-lg border border-accent-blue/30 bg-accent-blue/5 p-3 space-y-2">
          <p class="text-sm text-text-primary font-medium">✨ Generate it for me</p>
          <p class="text-xs text-text-muted">Uses your own Gemini key. Pick a model — better models cost more of your free quota.</p>
          <select
            bind:value={genModel}
            class="w-full bg-surface-0 border border-surface-3 rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue"
          >
            {#each GENERATION_MODELS as m}
              <option value={m.id}>{m.label}</option>
            {/each}
          </select>
          <button class="btn-primary text-sm w-full" on:click={generate} disabled={!userRequest.trim() || generating}>
            {generating ? '⏳ Generating…' : '✨ Generate course'}
          </button>
          {#if genStatus}<p class="text-xs text-accent-blue">{genStatus}</p>{/if}
          {#if result && !result.ok}
            <div class="text-xs text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 space-y-1">
              <p class="font-semibold">Generation failed:</p>
              {#each result.errors as err}<p>• {err}</p>{/each}
              <p class="text-text-muted">The model's raw output (if any) was placed in the manual paste box (next step) so you can inspect or fix it.</p>
            </div>
          {/if}
        </div>
        <p class="text-xs text-text-muted text-center">— or do it manually —</p>
      {:else}
        <p class="text-xs text-text-muted">Tip: enable AI in Settings to generate courses in-app automatically (no copy-paste).</p>
      {/if}

      <button class="btn-secondary text-sm" on:click={copyPrompt}>
        {copied ? '✓ Copied!' : (userRequest.trim() ? '📋 Copy prompt + my request' : '📋 Copy the generation prompt')}
      </button>
      {#if !userRequest.trim()}
        <p class="text-xs text-text-muted">Tip: type your request above and it'll be combined into the copied prompt — no need to add it in the AI chat yourself.</p>
      {/if}

      <details class="text-xs text-text-muted">
        <summary class="cursor-pointer">Preview the full prompt</summary>
        <pre class="code-block whitespace-pre-wrap mt-2 max-h-60 overflow-y-auto">{fullPrompt}</pre>
      </details>
      <button class="btn-secondary text-sm w-full" on:click={() => step = 2}>I have my JSON → Next</button>
    </div>
  {:else if step === 2}
    <div class="card space-y-3">
      <p class="text-sm text-text-primary">Paste the JSON the AI gave you:</p>
      <textarea
        bind:value={pasted}
        rows="10"
        placeholder="Paste course JSON here (code fences are fine)…"
        class="w-full bg-surface-0 border border-surface-3 rounded-lg p-3 font-mono text-xs
               text-text-primary resize-y focus:outline-none focus:border-accent-blue"
      ></textarea>
      <div class="flex items-center flex-wrap gap-2">
        <button class="btn-primary text-sm" on:click={validate} disabled={!pasted.trim()}>Validate</button>
        <button class="btn-secondary text-sm" on:click={cleanJson} disabled={!pasted.trim()}>🧹 Format / clean JSON</button>
        <label class="btn-secondary text-sm cursor-pointer">
          📤 Import .json file
          <input type="file" accept=".json,application/json" class="hidden" on:change={importFile} />
        </label>
        <button class="btn-secondary text-sm" on:click={() => step = 1}>← Back</button>
      </div>
      {#if formatMsg}
        <p class="text-xs text-accent-green">{formatMsg}</p>
      {/if}
      {#if genStatus}
        <p class="text-xs text-accent-blue">{genStatus}</p>
      {/if}
      <p class="text-xs text-text-muted">Pasting straight from a chat and it won't import? Hit <span class="text-text-secondary">Format / clean JSON</span> — it strips hidden characters (smart quotes, non-breaking spaces) that chat apps add and fixes common formatting issues.</p>
      {#if result && !result.ok}
        <div class="text-xs text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 space-y-1">
          <p class="font-semibold">Couldn't import:</p>
          {#each result.errors as err}<p>• {err}</p>{/each}
        </div>
      {/if}
    </div>
  {:else if step === 3 && result?.ok}
    <div class="card space-y-3">
      <h2 class="text-lg font-bold text-text-primary">{result.course.title}</h2>
      {#if result.course.description}<p class="text-sm text-text-secondary">{result.course.description}</p>{/if}
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">{result.course.modules.length} modules</span>
        <span class="px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">{countTopics(result.course)} topics</span>
        {#each result.course.radarAxes as axis}
          <span class="px-2 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue">{axis}</span>
        {/each}
      </div>

      {#if result.warnings.length > 0}
        <div class="text-xs text-accent-yellow bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-3 space-y-1">
          <p class="font-semibold">Notes ({result.warnings.length}):</p>
          {#each result.warnings.slice(0, 6) as w}<p>• {w}</p>{/each}
          {#if result.warnings.length > 6}<p>…and {result.warnings.length - 6} more.</p>{/if}
        </div>
      {/if}

      <ul class="text-sm text-text-secondary space-y-1 max-h-52 overflow-y-auto">
        {#each result.course.modules as m}
          <li class="font-medium text-text-primary">{m.title}</li>
          {#each m.topics as t}
            <li class="ml-4 text-xs">• {t.title} <span class="text-text-muted">({t.blocks.length} blocks)</span></li>
          {/each}
        {/each}
      </ul>

      <div class="flex gap-2">
        <button class="btn-primary text-sm flex-1" on:click={save}>✓ Add this course</button>
        <button class="btn-secondary text-sm" on:click={() => step = 2}>← Edit</button>
      </div>
    </div>
  {/if}
</div>
