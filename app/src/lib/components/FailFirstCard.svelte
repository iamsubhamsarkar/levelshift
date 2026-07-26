<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Card from './Card.svelte';
  import { executeJava, isApiAvailable, validateOutput } from '../utils/code-runner.js';

  export let data = {};
  export let cardState = null; // Restored state from session store
  // data: { prompt, starterCode, expectedOutput?, hint?, solutionCode? }

  const dispatch = createEventDispatcher();

  // Restore state if navigating back to this card
  let code = cardState?.code || data.starterCode || '';
  let output = cardState?.output || '';
  let error = cardState?.error || '';
  let running = false;
  let attempted = cardState?.attempted || false;
  let showHint = cardState?.showHint || false;
  let showSolution = cardState?.showSolution || false;
  let status = cardState?.completed ? (cardState?.correct ? 'correct' : 'wrong') : 'active';
  let apiAvailable = true;
  let offlineMode = cardState?.offlineMode || false;

  onMount(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) offlineMode = true;
  });

  async function handleSubmit() {
    if (!code.trim() || running) return;
    running = true;
    attempted = true;

    if (offlineMode) {
      running = false;
      showSolution = true;
      return;
    }

    const result = await executeJava(code);

    if (result.success) {
      output = result.output;
      error = '';
      if (data.expectedOutput && validateOutput(result.output, data.expectedOutput)) {
        status = 'correct';
        dispatch('answer', { code, output, correct: true, timeSpent: 0, cardLocalState: getLocalState() });
      } else if (!data.expectedOutput) {
        status = 'correct';
        dispatch('answer', { code, output, correct: true, timeSpent: 0, cardLocalState: getLocalState() });
      } else {
        status = 'wrong';
        dispatch('answer', { code, output, correct: false, timeSpent: 0, cardLocalState: getLocalState() });
      }
    } else {
      output = result.output;
      error = result.error;

      // If API returned auth error or network error → switch to offline mode
      if (result.error.includes('Network error') || result.error.includes('timed out') || result.error.includes('401') || result.error.includes('403')) {
        offlineMode = true;
        error = '';
        status = 'active';
        running = false;
        showSolution = true;
        return;
      }

      status = 'wrong';
      dispatch('answer', { code, output: error, correct: false, timeSpent: 0, cardLocalState: getLocalState() });
    }

    running = false;
  }

  function handleShowAnswer() {
    showSolution = true;
  }

  function handleSelfRate(rating) {
    const correct = rating === 'good' || rating === 'easy';
    dispatch('answer', { code, output: '', correct, selfRated: true, rating, timeSpent: 0, cardLocalState: getLocalState() });
    status = correct ? 'correct' : 'wrong';
  }

  function handleSkip() {
    dispatch('skip');
  }

  /** Get current local state for persistence */
  function getLocalState() {
    return { code, output, error, attempted, showHint, showSolution, offlineMode };
  }
</script>

<Card type="fail_first" {status}>
  <div class="space-y-4">
    <!-- Challenge prompt -->
    <p class="text-text-primary font-medium">{data.prompt}</p>

    <!-- Offline indicator -->
    {#if offlineMode}
      <div class="flex items-center gap-2 text-xs text-accent-yellow bg-accent-yellow/10 px-3 py-1.5 rounded-lg">
        <span>⚡</span> Offline mode — code execution unavailable. Write code, then self-rate.
      </div>
    {/if}

    <!-- Code editor -->
    <div class="relative">
      <textarea
        bind:value={code}
        class="w-full h-40 bg-surface-0 border border-surface-3 rounded-lg p-4 
               font-mono text-sm text-text-primary resize-none
               focus:outline-none focus:border-accent-blue transition-colors"
        placeholder="Write your code here..."
        spellcheck="false"
      ></textarea>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center gap-3 flex-wrap">
      <button 
        class="btn-primary text-sm flex items-center gap-2"
        on:click={handleSubmit}
        disabled={running || !code.trim()}
      >
        {#if running}
          <span class="animate-spin">⚙</span> Running...
        {:else if offlineMode}
          👁 Check Solution
        {:else}
          ▶ Run Code
        {/if}
      </button>

      {#if data.hint && !showHint}
        <button class="btn-secondary text-sm" on:click={() => showHint = true}>
          💡 Hint
        </button>
      {/if}

      {#if !showSolution}
        <button class="btn-secondary text-sm" on:click={handleShowAnswer}>
          📖 Show Answer
        </button>
      {/if}

      {#if attempted && !showSolution}
        <button class="text-sm text-text-muted hover:text-text-secondary" on:click={handleSkip}>
          Skip →
        </button>
      {/if}
    </div>

    <!-- Hint -->
    {#if showHint && data.hint}
      <div class="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-3 text-sm text-accent-yellow">
        💡 {data.hint}
      </div>
    {/if}

    <!-- Output (online mode) -->
    {#if (output || error) && !offlineMode}
      <div class="rounded-lg overflow-hidden border border-surface-3">
        {#if output}
          <div class="bg-surface-0 p-3 text-sm font-mono text-accent-green">
            <span class="text-text-muted text-xs block mb-1">OUTPUT:</span>
            {output}
          </div>
        {/if}
        {#if error}
          <div class="bg-accent-red/5 p-3 text-sm font-mono text-accent-red">
            <span class="text-text-muted text-xs block mb-1">ERROR:</span>
            <pre class="whitespace-pre-wrap">{error}</pre>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Model Answer Section -->
    {#if showSolution}
      <div class="rounded-lg overflow-hidden border border-accent-blue/30 bg-surface-1">
        <div class="bg-accent-blue/10 px-3 py-2 text-xs font-semibold text-accent-blue border-b border-accent-blue/20">
          📖 MODEL ANSWER
        </div>
        <div class="p-3 space-y-3">
          {#if data.solutionCode}
            <pre class="font-mono text-sm text-text-primary whitespace-pre-wrap bg-surface-0 p-3 rounded border border-surface-3">{data.solutionCode}</pre>
          {:else}
            <!-- Fallback: construct a simple model answer from hint + expected -->
            <div class="font-mono text-sm text-text-primary bg-surface-0 p-3 rounded border border-surface-3">
              {#if data.hint}
                <p class="text-text-secondary text-xs mb-2">Solution approach:</p>
                <p class="text-accent-green">{data.hint}</p>
              {/if}
            </div>
          {/if}

          {#if data.expectedOutput}
            <div class="flex items-center gap-2 text-sm">
              <span class="text-text-muted">Expected output:</span>
              <code class="bg-surface-0 px-2 py-0.5 rounded text-accent-green font-mono">{data.expectedOutput}</code>
            </div>
          {/if}
        </div>
      </div>

      <!-- Self-rating buttons -->
      <div class="space-y-2 pt-2">
        <p class="text-xs text-text-muted text-center">How well did you understand this?</p>
        <div class="flex justify-center gap-2 flex-wrap">
          <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20 transition-colors" on:click={() => handleSelfRate('forgot')}>
            ❌ Didn't get it
          </button>
          <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30 hover:bg-accent-yellow/20 transition-colors" on:click={() => handleSelfRate('hard')}>
            🤔 Partially
          </button>
          <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 transition-colors" on:click={() => handleSelfRate('good')}>
            ✅ Got it
          </button>
          <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 transition-colors" on:click={() => handleSelfRate('easy')}>
            🔥 Easy
          </button>
        </div>
      </div>
    {/if}

    <!-- Encouragement -->
    {#if !attempted && !showSolution}
      <p class="text-xs text-text-muted italic text-center">
        Don't worry about getting it wrong — that's the point. Try first, learn after.
      </p>
    {/if}
  </div>
</Card>
