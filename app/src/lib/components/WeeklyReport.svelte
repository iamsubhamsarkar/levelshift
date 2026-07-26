<script>
  import { createEventDispatcher } from 'svelte';
  import { heatmap, progress, userSettings, timeline } from '../stores/progress.js';
  import { generateWeeklyReport } from '../engines/timeline.js';
  import { formatDate } from '../utils/dates.js';

  const dispatch = createEventDispatcher();

  $: report = generateWeeklyReport($heatmap, $progress, $userSettings);
  $: timelineShift = report.penaltyDays > 0 ? `+${report.penaltyDays} days` : 'On track';

  function close() {
    dispatch('close');
  }

  function getTrendIcon(label) {
    if (label === 'improving') return '📈';
    if (label === 'declining') return '📉';
    return '➡️';
  }

  function getTrendColor(label) {
    if (label === 'improving') return 'text-accent-green';
    if (label === 'declining') return 'text-accent-red';
    return 'text-text-secondary';
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fixed inset-0 bg-surface-0/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" on:click|self={close}>
  <div class="card max-w-md w-full space-y-5 animate-fade-in shadow-2xl border border-surface-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-text-primary">📅 Weekly Shift Report</h2>
      <button class="text-text-muted hover:text-text-secondary text-xl leading-none" on:click={close}>×</button>
    </div>

    <!-- Trend summary -->
    <div class="text-center py-3 bg-surface-1 rounded-lg">
      <span class="text-3xl">{getTrendIcon(report.trendLabel)}</span>
      <p class="text-sm font-semibold {getTrendColor(report.trendLabel)} mt-1 capitalize">{report.trendLabel}</p>
    </div>

    <!-- Units comparison -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-surface-1 rounded-lg p-3 text-center">
        <p class="text-2xl font-bold text-accent-blue">{report.unitsThisWeek}</p>
        <p class="text-[10px] text-text-muted uppercase">Units this week</p>
      </div>
      <div class="bg-surface-1 rounded-lg p-3 text-center">
        <p class="text-2xl font-bold text-text-secondary">{report.unitsLastWeek}</p>
        <p class="text-[10px] text-text-muted uppercase">Units last week</p>
      </div>
    </div>

    <!-- Activity stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="text-center">
        <p class="text-lg font-bold text-accent-green">{report.daysActiveThisWeek}</p>
        <p class="text-[10px] text-text-muted">Days Active</p>
      </div>
      <div class="text-center">
        <p class="text-lg font-bold text-accent-red">{report.daysMissedThisWeek}</p>
        <p class="text-[10px] text-text-muted">Days Missed</p>
      </div>
      <div class="text-center">
        <p class="text-lg font-bold text-accent-yellow">{report.penaltyDays}</p>
        <p class="text-[10px] text-text-muted">Penalty Days</p>
      </div>
    </div>

    <!-- Timeline shift -->
    <div class="flex items-center justify-between bg-surface-1 rounded-lg p-3">
      <span class="text-xs text-text-secondary">Timeline shift</span>
      <span class="text-sm font-bold {report.penaltyDays > 0 ? 'text-accent-red' : 'text-accent-green'}">
        {timelineShift}
      </span>
    </div>

    <!-- Trend detail -->
    {#if report.trend !== 0}
      <p class="text-xs text-text-muted text-center">
        {#if report.trend > 0}
          You completed <span class="text-accent-green font-semibold">{report.trend} more</span> unit{report.trend > 1 ? 's' : ''} than last week.
        {:else}
          You completed <span class="text-accent-red font-semibold">{Math.abs(report.trend)} fewer</span> unit{Math.abs(report.trend) > 1 ? 's' : ''} than last week.
        {/if}
      </p>
    {/if}

    <!-- Dismiss -->
    <button class="btn-secondary w-full text-sm" on:click={close}>
      Got it
    </button>
  </div>
</div>
