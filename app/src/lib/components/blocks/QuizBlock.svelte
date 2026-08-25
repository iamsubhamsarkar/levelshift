<script>
  import { createEventDispatcher } from 'svelte';
  export let block;
  export let state = {};   // { answer, done }

  const dispatch = createEventDispatcher();
  let selected = state.answer ?? null;
  let answered = state.done === true;

  function choose(i) {
    if (answered) return;
    selected = i;
    answered = true;
    const correct = i === block.correct;
    dispatch('complete', { answer: i, correct });
  }
</script>

<div class="space-y-3">
  <p class="text-sm font-medium text-text-primary">{block.question}</p>
  <div class="space-y-2">
    {#each block.options as opt, i}
      <button
        class="option-btn w-full text-left"
        class:correct={answered && i === block.correct}
        class:wrong={answered && i === selected && i !== block.correct}
        on:click={() => choose(i)}
        disabled={answered}
      >
        {opt}
      </button>
    {/each}
  </div>
  {#if answered && block.explanation}
    <p class="text-xs text-text-secondary bg-surface-0 border border-surface-3 rounded-lg p-3">
      {selected === block.correct ? '✅ Correct. ' : '❌ '}{block.explanation}
    </p>
  {/if}
</div>
