<script>
  import { createEventDispatcher } from 'svelte';
  import { executeCode, validateOutput } from '../../utils/code-runner.js';

  export let block;
  export let state = {};   // { code, done }

  const dispatch = createEventDispatcher();

  let code = state.code ?? block.starter ?? '';
  let running = false;
  let output = '';
  let error = '';
  let passed = state.done === true;
  let showSolution = false;

  async function run() {
    if (running) return;
    running = true;
    output = '';
    error = '';
    const res = await executeCode(block.language, code);
    running = false;

    if (!res.success) {
      error = res.error || 'Execution failed.';
      return;
    }
    output = res.output;

    // If an expected output is provided, check it; otherwise any clean run passes.
    const ok = block.expectedOutput
      ? validateOutput(res.output, block.expectedOutput)
      : true;
    if (ok && !passed) {
      passed = true;
      dispatch('complete', { code, correct: true });
    }
  }
</script>

<div class="space-y-3">
  {#if block.prompt}
    <p class="text-sm text-text-primary">{block.prompt}</p>
  {/if}

  <div class="flex items-center justify-between">
    <span class="text-[10px] uppercase tracking-wide text-text-muted">{block.language}</span>
    {#if passed}<span class="text-xs text-accent-green">✅ Passed</span>{/if}
  </div>

  <textarea
    bind:value={code}
    rows="8"
    spellcheck="false"
    class="w-full bg-surface-0 border border-surface-3 rounded-lg p-3 font-mono text-xs
           text-text-primary resize-y focus:outline-none focus:border-accent-blue"
  ></textarea>

  <div class="flex items-center gap-2">
    <button class="btn-primary text-sm" on:click={run} disabled={running}>
      {running ? 'Running…' : '▶ Run'}
    </button>
    {#if block.solution}
      <button class="btn-secondary text-sm" on:click={() => showSolution = !showSolution}>
        {showSolution ? 'Hide' : 'Show'} solution
      </button>
    {/if}
  </div>

  {#if output}
    <pre class="code-block whitespace-pre-wrap text-accent-green">{output}</pre>
  {/if}
  {#if error}
    <pre class="code-block whitespace-pre-wrap text-accent-red">{error}</pre>
  {/if}
  {#if showSolution && block.solution}
    <pre class="code-block whitespace-pre-wrap">{block.solution}</pre>
  {/if}
</div>
