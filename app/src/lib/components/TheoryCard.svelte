<script>
  import { createEventDispatcher } from 'svelte';
  import Card from './Card.svelte';

  export let data = {};
  export let cardState = null;
  // data: { heading?, body, snippet?, snippetExplanation?, callout? }

  const dispatch = createEventDispatcher();

  let read = cardState?.completed || false;

  function markRead() {
    read = true;
    // Reuse the interactive 'answer' contract so LearnView marks the card complete
    // and unlocks the next section. Reading is always "correct".
    dispatch('answer', { correct: true, read: true });
  }
</script>

<Card type="theory" status={read ? 'completed' : 'active'}>
  <div class="space-y-5 text-left">
    {#if data.heading}
      <h3 class="text-lg font-semibold text-accent-blue leading-snug">{data.heading}</h3>
    {/if}

    {#if data.body}
      <div class="theory-body text-text-primary leading-relaxed whitespace-pre-line">{data.body}</div>
    {/if}

    {#if data.snippet}
      <div class="code-block relative overflow-x-auto text-sm">
        <pre class="leading-relaxed"><code>{data.snippet}</code></pre>
      </div>
    {/if}

    {#if data.snippetExplanation}
      <div class="flex items-start gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-3">
        <span class="text-accent-blue mt-0.5">→</span>
        <p class="text-sm text-text-primary whitespace-pre-line">{data.snippetExplanation}</p>
      </div>
    {/if}

    {#if data.callout}
      <p class="text-sm text-text-secondary italic border-l-2 border-accent-blue/40 pl-3">
        {data.callout}
      </p>
    {/if}
  </div>

  <svelte:fragment slot="footer">
    {#if read}
      <div class="text-center text-accent-green text-sm font-medium">✓ Read</div>
    {:else}
      <button class="btn-primary w-full" on:click={markRead}>✓ Mark as read</button>
    {/if}
  </svelte:fragment>
</Card>

<style>
  .theory-body {
    font-size: 0.95rem;
  }
</style>
