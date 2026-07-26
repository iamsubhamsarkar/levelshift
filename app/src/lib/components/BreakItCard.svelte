<script>
  import { createEventDispatcher } from 'svelte';
  import Card from './Card.svelte';

  export let data = {};
  export let cardState = null;
  // data: { setup, modification, question, options: string[], correct: number, explanation }

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

<Card type="break_it" {status}>
  <div class="space-y-5">
    <!-- Setup code / context -->
    {#if data.setup}
      <div class="code-block text-sm">
        <pre><code>{data.setup}</code></pre>
      </div>
    {/if}

    <!-- The modification / "what if" -->
    <div class="bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg p-4">
      <p class="text-sm font-medium text-accent-yellow mb-2">⚡ What if:</p>
      <pre class="font-mono text-sm text-text-primary whitespace-pre-wrap">{data.modification}</pre>
    </div>

    <!-- Question -->
    <p class="text-text-primary font-medium">{data.question}</p>

    <!-- Options -->
    <div class="grid grid-cols-1 gap-2">
      {#each data.options as option, i}
        <button
          class="option-btn text-left"
          class:correct={revealed && i === data.correct}
          class:wrong={revealed && i === selected && i !== data.correct}
          disabled={revealed}
          on:click={() => selectOption(i)}
        >
          <span class="inline-flex items-center gap-2">
            <span class="w-6 h-6 flex items-center justify-center rounded-full bg-surface-3 text-xs font-mono">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </span>
        </button>
      {/each}
    </div>

    <!-- Explanation (revealed after answer) -->
    {#if revealed && data.explanation}
      <div class="bg-surface-2 border border-surface-3 rounded-lg p-4 animate-fade-in">
        <p class="text-sm text-text-secondary">
          <span class="font-semibold text-text-primary">Why:</span> {data.explanation}
        </p>
      </div>
    {/if}
  </div>
</Card>
