<script>
  import { createEventDispatcher } from 'svelte';
  import { parseAndValidate } from '../courses/validate.js';
  import { GENERATION_PROMPT } from '../courses/prompt.js';
  import { addCourse, setActiveCourse, countTopics } from '../stores/courses.js';

  const dispatch = createEventDispatcher();

  let step = 1;               // 1 = get prompt, 2 = paste JSON, 3 = preview
  let pasted = '';
  let result = null;          // validation result
  let copied = false;

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(GENERATION_PROMPT);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      copied = false;
    }
  }

  function validate() {
    result = parseAndValidate(pasted);
    if (result.ok) step = 3;
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
        <li>Copy the prompt below.</li>
        <li>Open a capable AI with web search (ChatGPT, Claude, Gemini, etc.).</li>
        <li>Paste the prompt, then describe the course you want at the bottom — topic, level, language, and any YouTube videos to include (e.g. <span class="text-text-primary">"Agentic AI course in Hindi, include good Hindi tutorials"</span>).</li>
        <li>The AI returns a big JSON. Copy all of it.</li>
        <li>Come back and paste it in the next step.</li>
      </ol>
      <button class="btn-primary text-sm" on:click={copyPrompt}>
        {copied ? '✓ Copied!' : '📋 Copy the generation prompt'}
      </button>
      <details class="text-xs text-text-muted">
        <summary class="cursor-pointer">Preview the prompt</summary>
        <pre class="code-block whitespace-pre-wrap mt-2 max-h-60 overflow-y-auto">{GENERATION_PROMPT}</pre>
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
      <div class="flex items-center gap-2">
        <button class="btn-primary text-sm" on:click={validate} disabled={!pasted.trim()}>Validate</button>
        <label class="btn-secondary text-sm cursor-pointer">
          📤 Import .json file
          <input type="file" accept=".json,application/json" class="hidden" on:change={importFile} />
        </label>
        <button class="btn-secondary text-sm" on:click={() => step = 1}>← Back</button>
      </div>
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
