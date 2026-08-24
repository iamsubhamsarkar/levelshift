<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { currentCardState, completeCard } from '../stores/session.js';
  import HookCard from './HookCard.svelte';
  import FailFirstCard from './FailFirstCard.svelte';
  import AnalogyCard from './AnalogyCard.svelte';
  import CodeCard from './CodeCard.svelte';
  import BreakItCard from './BreakItCard.svelte';
  import ContrastCard from './ContrastCard.svelte';
  import ExplainBackCard from './ExplainBackCard.svelte';
  import ConnectCard from './ConnectCard.svelte';
  import TheoryCard from './TheoryCard.svelte';
  import BuildStepCard from './BuildStepCard.svelte';

  export let card = null;

  const dispatch = createEventDispatcher();

  // Non-interactive card types auto-complete on view
  const READ_ONLY_TYPES = ['hook', 'analogy', 'code', 'connect'];

  onMount(() => {
    if (card && READ_ONLY_TYPES.includes(card.type)) {
      // Auto-complete read-only cards after a brief moment (user has "seen" it)
      completeCard(card.id, { viewed: true });
    }
  });

  function handleAnswer(event) {
    dispatch('answer', { cardId: card.id, ...event.detail });
  }

  function handleRating(event) {
    dispatch('rating', { cardId: card.id, ...event.detail });
  }

  function handleSkip() {
    dispatch('skip', { cardId: card.id });
  }
</script>

{#if card}
  {#if card.type === 'hook'}
    <HookCard data={card.content} />
  {:else if card.type === 'fail_first'}
    <FailFirstCard data={card.content} cardState={$currentCardState} on:answer={handleAnswer} on:skip={handleSkip} />
  {:else if card.type === 'analogy'}
    <AnalogyCard data={card.content} />
  {:else if card.type === 'code'}
    <CodeCard data={card.content} />
  {:else if card.type === 'break_it'}
    <BreakItCard data={card.content} cardState={$currentCardState} on:answer={handleAnswer} />
  {:else if card.type === 'contrast'}
    <ContrastCard data={card.content} cardState={$currentCardState} on:answer={handleAnswer} />
  {:else if card.type === 'explain_back'}
    <ExplainBackCard data={card.content} cardState={$currentCardState} on:answer={handleAnswer} on:rating={handleRating} />
  {:else if card.type === 'connect'}
    <ConnectCard data={card.content} />
  {:else if card.type === 'theory'}
    <TheoryCard data={card.content} cardState={$currentCardState} on:answer={handleAnswer} />
  {:else if card.type === 'build_step'}
    <BuildStepCard data={card.content} cardState={$currentCardState} on:answer={handleAnswer} />
  {:else}
    <div class="card text-center">
      <p class="text-text-muted">Unknown card type: {card.type}</p>
    </div>
  {/if}
{/if}
