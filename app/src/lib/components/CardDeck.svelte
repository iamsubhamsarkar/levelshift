<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { session, sessionProgress, isCurrentCardCompleted } from '../stores/session.js';

  export let unitTitle = '';
  export let phaseTitle = '';

  const dispatch = createEventDispatcher();

  let timerSeconds = 0;
  let timerInterval;

  // Can go forward?
  $: canGoNext = $sessionProgress.current - 1 < $sessionProgress.highestUnlocked;

  // Keyboard navigation
  function handleKeydown(e) {
    switch(e.key) {
      case 'ArrowRight':
      case 'Enter':
        if (canGoNext) dispatch('next');
        break;
      case 'ArrowLeft':
        dispatch('prev');
        break;
      case 'Escape':
        dispatch('exit');
        break;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    timerInterval = setInterval(() => timerSeconds++, 1000);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (timerInterval) clearInterval(timerInterval);
  });

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
</script>

<div class="card-deck min-h-screen bg-surface-0 flex flex-col">
  <!-- Top bar -->
  <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-surface-3 gap-2 sm:gap-0">
    <div class="flex items-center gap-2 text-xs sm:text-sm">
      <button class="text-text-muted hover:text-text-secondary transition-colors" on:click={() => dispatch('exit')}>
        ← 
      </button>
      <span class="text-text-secondary truncate max-w-[80px] sm:max-w-none">{phaseTitle}</span>
      <span class="text-text-muted">›</span>
      <span class="text-text-primary font-medium truncate max-w-[100px] sm:max-w-none">{unitTitle}</span>
    </div>

    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Timer -->
      <span class="text-xs text-text-muted font-mono">⏱ {formatTime(timerSeconds)}</span>

      <!-- Progress dots -->
      <div class="hidden sm:flex items-center gap-1">
        {#each Array($sessionProgress.total) as _, i}
          <div 
            class="progress-dot"
            class:active={i === $sessionProgress.current - 1}
            class:completed={i < $sessionProgress.current - 1 && i <= $sessionProgress.highestUnlocked}
            class:locked={i > $sessionProgress.highestUnlocked}
          ></div>
        {/each}
      </div>

      <!-- Card counter -->
      <span class="text-xs text-text-secondary font-mono">
        {$sessionProgress.current}/{$sessionProgress.total}
      </span>
    </div>
  </header>

  <!-- Card area -->
  <main class="flex-1 flex items-center justify-center p-2 sm:p-4">
    <slot />
  </main>

  <!-- Bottom navigation -->
  <footer class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-surface-3">
    <button 
      class="btn-secondary text-xs sm:text-sm"
      disabled={$sessionProgress.current <= 1}
      on:click={() => dispatch('prev')}
    >
      ← Back
    </button>

    <span class="text-[10px] sm:text-xs text-text-muted hidden sm:inline">
      {#if !canGoNext}
        Complete this card to continue →
      {:else}
        ← → to navigate • Esc to exit
      {/if}
    </span>

    <button 
      class="text-xs sm:text-sm {canGoNext ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}"
      disabled={!canGoNext}
      on:click={() => canGoNext && dispatch('next')}
    >
      {#if $sessionProgress.current >= $sessionProgress.total}
        Finish ✓
      {:else}
        Next →
      {/if}
    </button>
  </footer>
</div>

<style>
  .progress-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2d333b;
    transition: all 0.3s ease;
  }

  .progress-dot.active {
    background: #58a6ff;
    width: 10px;
    border-radius: 4px;
  }

  .progress-dot.completed {
    background: #3fb950;
  }

  .progress-dot.locked {
    background: #1c2128;
    opacity: 0.4;
  }
</style>
