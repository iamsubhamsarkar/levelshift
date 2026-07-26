<script>
  import { progress, timeline, userSettings } from '../stores/progress.js';
  import { formatDate, daysBetween, today } from '../utils/dates.js';

  $: remaining = 47 - $progress.completedUnits.length;
  $: completionPct = Math.round(($progress.completedUnits.length / 47) * 100);
  $: daysToInterview = daysBetween(today(), $userSettings.interviewDate);
</script>

<div class="space-y-4">
  <!-- Three projections -->
  <div class="space-y-2 text-sm">
    <div class="flex justify-between items-center">
      <span class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-accent-green"></span>
        <span class="text-text-secondary">Best case</span>
      </span>
      <span class="text-text-primary font-mono">{formatDate($timeline.bestCase)}</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-accent-yellow"></span>
        <span class="text-text-secondary">Current pace</span>
      </span>
      <span class="text-text-primary font-mono font-semibold">{formatDate($timeline.estimatedCompletion)}</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-accent-red"></span>
        <span class="text-text-secondary">Worst case</span>
      </span>
      <span class="text-text-primary font-mono">{formatDate($timeline.worstCase)}</span>
    </div>
  </div>

  <!-- Progress bar -->
  <div>
    <div class="bg-surface-0 rounded-full h-2.5 overflow-hidden">
      <div 
        class="h-full rounded-full transition-all duration-700 ease-out"
        class:bg-accent-green={completionPct >= 70}
        class:bg-accent-blue={completionPct >= 30 && completionPct < 70}
        class:bg-accent-yellow={completionPct < 30}
        style="width: {completionPct}%"
      ></div>
    </div>
    <div class="flex justify-between mt-1.5 text-xs text-text-muted">
      <span>{$progress.completedUnits.length}/47 units</span>
      <span>{completionPct}%</span>
    </div>
  </div>

  <!-- Interview countdown -->
  {#if daysToInterview > 0}
    <div class="flex items-center justify-between bg-surface-0 rounded-lg p-3 border border-surface-3">
      <span class="text-xs text-text-secondary">Interview in</span>
      <span class="font-mono font-semibold text-sm"
        class:text-accent-green={daysToInterview > 30}
        class:text-accent-yellow={daysToInterview > 14 && daysToInterview <= 30}
        class:text-accent-red={daysToInterview <= 14}
      >
        {daysToInterview} days
      </span>
    </div>
  {/if}

  <!-- Pace info -->
  {#if $timeline.rollingPace > 0}
    <p class="text-xs text-text-muted">
      Pace: {$timeline.rollingPace} units/day (last 7 days)
    </p>
  {/if}
</div>
