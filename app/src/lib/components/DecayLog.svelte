<script>
  import { concepts } from '../stores/progress.js';
  import { generateDecayLog } from '../engines/decay.js';

  $: logEntries = generateDecayLog($concepts);
  $: hasEntries = logEntries.length > 0;
</script>

<div class="space-y-2">
  {#if hasEntries}
    <div class="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
      {#each logEntries as entry}
        <div 
          class="flex items-start gap-2 py-1.5 px-2 rounded-md text-sm
            {entry.severity === 'critical' ? 'bg-accent-red/5' : ''}
            {entry.severity === 'warn' ? 'bg-accent-yellow/5' : ''}"
        >
          <span class="mt-0.5 flex-shrink-0">
            {#if entry.severity === 'critical'}
              🔴
            {:else}
              ⚠️
            {/if}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-text-secondary truncate">
              {entry.message}
            </p>
            <p class="text-xs text-text-muted">
              {entry.daysAgo} day{entry.daysAgo > 1 ? 's' : ''} ago
            </p>
          </div>
          <span class="text-xs font-mono flex-shrink-0"
            class:text-accent-red={entry.severity === 'critical'}
            class:text-accent-yellow={entry.severity === 'warn'}
          >
            {entry.strengthTo}%
          </span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-sm text-text-muted italic py-4 text-center">
      ✅ No decaying concepts. Keep up the consistency!
    </div>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #2d333b;
    border-radius: 2px;
  }
</style>
