<script>
  import { createEventDispatcher } from 'svelte';
  import Card from './Card.svelte';

  export let data = {};
  export let cardState = null;
  // data: { label, codeA, codeB, question, options: string[], correct: number, explanation }

  const dispatch = createEventDispatcher();

  let selected = cardState?.answer?.selected ?? null;
  let revealed = cardState?.completed || false;
  let status = cardState?.completed ? (cardState?.correct ? 'correct' : 'wrong') : 'active';

  function selectOption(index) {
    if (revealed) return;
    selected = index;
    revealed = true;
    status = index === data.correct ? 'correct' : 'wrong';
    dispatch('answer', { selected: index, correct: index === data.correct });
  }
</script>

<Card type="contrast" {status}>
  <div class="space-y-5">
    <!-- Label -->
    {#if data.label}
      <p class="text-sm font-medium text-accent-purple">{data.label}</p>
    {/if}

    <!-- Side-by-side code comparison -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Code A -->
      <div class="rounded-lg overflow-hidden border border-surface-3">
        <div class="bg-surface-2 px-3 py-1.5 text-xs font-mono text-text-muted border-b border-surface-3">
          CODE A
        </div>
        <div class="bg-surface-0 p-3">
          <pre class="font-mono text-sm text-text-primary whitespace-pre-wrap">{data.codeA}</pre>
        </div>
      </div>

      <!-- Code B -->
      <div class="rounded-lg overflow-hidden border border-surface-3">
        <div class="bg-surface-2 px-3 py-1.5 text-xs font-mono text-text-muted border-b border-surface-3">
          CODE B
        </div>
        <div class="bg-surface-0 p-3">
          <pre class="font-mono text-sm text-text-primary whitespace-pre-wrap">{data.codeB}</pre>
        </div>
      </div>
    </div>

    <!-- Question -->
    <p class="text-text-primary font-medium">{data.question}</p>

    <!-- Options -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {#each data.options as option, i}
        <button
          class="option-btn text-center"
          class:correct={revealed && i === data.correct}
          class:wrong={revealed && i === selected && i !== data.correct}
          disabled={revealed}
          on:click={() => selectOption(i)}
        >
          {option}
        </button>
      {/each}
    </div>

    <!-- Explanation -->
    {#if revealed && data.explanation}
      <div class="bg-surface-2 border border-surface-3 rounded-lg p-4 animate-fade-in">
        <p class="text-sm text-text-secondary">
          <span class="font-semibold text-text-primary">Key difference:</span> {data.explanation}
        </p>
      </div>
    {/if}
  </div>
</Card>
