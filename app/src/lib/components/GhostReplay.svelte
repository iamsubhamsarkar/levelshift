<script>
  import { compareWithGhost } from '../engines/punishment.js';

  /** @type {{ time: number, score: number }} */
  export let current;

  /** @type {{ bestTime: number, bestScore: number, date: string }|null} */
  export let best;

  $: comparison = compareWithGhost(current, best);
</script>

{#if comparison}
  <div class="card space-y-4 border {comparison.isNewBest ? 'border-accent-green/40' : 'border-surface-3'}">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">👻 Ghost Replay</h3>
      {#if comparison.isNewBest}
        <span class="text-xs bg-accent-green/10 text-accent-green px-2 py-0.5 rounded-full font-medium animate-pulse">
          NEW BEST
        </span>
      {/if}
    </div>

    <!-- Side-by-side comparison -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Your performance -->
      <div class="bg-surface-1 rounded-lg p-3 space-y-2">
        <p class="text-[10px] text-text-muted uppercase tracking-wider">This Session</p>
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs text-text-secondary">Time</span>
            <span class="text-sm font-bold text-text-primary">{current.time}m</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-text-secondary">Score</span>
            <span class="text-sm font-bold text-text-primary">{current.score}</span>
          </div>
        </div>
      </div>

      <!-- Personal best -->
      <div class="bg-surface-1 rounded-lg p-3 space-y-2">
        <p class="text-[10px] text-text-muted uppercase tracking-wider">Personal Best</p>
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs text-text-secondary">Time</span>
            <span class="text-sm font-bold text-accent-purple">{best.bestTime}m</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-text-secondary">Score</span>
            <span class="text-sm font-bold text-accent-purple">{best.bestScore}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Diff indicators -->
    <div class="flex items-center justify-center gap-4 text-xs">
      {#if comparison.timeDiff < 0}
        <span class="text-accent-green">⚡ {Math.abs(comparison.timeDiff)}m faster</span>
      {:else if comparison.timeDiff > 0}
        <span class="text-accent-red">🐢 {comparison.timeDiff}m slower</span>
      {:else}
        <span class="text-text-muted">⏱ Same time</span>
      {/if}

      {#if comparison.scoreDiff > 0}
        <span class="text-accent-green">📈 +{comparison.scoreDiff} pts</span>
      {:else if comparison.scoreDiff < 0}
        <span class="text-accent-red">📉 {comparison.scoreDiff} pts</span>
      {:else}
        <span class="text-text-muted">🎯 Same score</span>
      {/if}
    </div>

    <!-- Ghost message -->
    <p class="text-center text-sm font-medium {comparison.isNewBest ? 'text-accent-green' : 'text-text-secondary'}">
      {comparison.message}
    </p>

    {#if best.date}
      <p class="text-center text-[10px] text-text-muted">
        Personal best set on {new Date(best.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    {/if}
  </div>
{/if}
