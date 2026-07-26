<script>
  import { heatmap, userSettings } from '../stores/progress.js';
  import { getHeatmapColor } from '../engines/punishment.js';
  import { getLastNDays, getDayOfWeek, formatDate } from '../utils/dates.js';

  export let days = 90; // Show last 90 days by default

  $: dates = getLastNDays(days);
  $: grid = buildGrid(dates, $heatmap, $userSettings);

  function buildGrid(dates, heatmapData, settings) {
    return dates.map(date => ({
      date,
      color: getHeatmapColor(date, heatmapData, settings),
      tooltip: getTooltip(date, heatmapData)
    }));
  }

  function getTooltip(date, heatmapData) {
    const entry = heatmapData[date];
    if (!entry) return `${formatDate(date)} — No activity`;
    if (entry.mode === 'tired') return `${formatDate(date)} — Quick challenge (${entry.minutes || 0}m)`;
    return `${formatDate(date)} — ${entry.units} unit${entry.units > 1 ? 's' : ''} (${entry.minutes || 0}m)`;
  }

  const colorMap = {
    active: 'bg-accent-green',
    tired: 'bg-accent-green/40',
    missed: 'bg-surface-3',
    critical: 'bg-accent-red',
    rest: 'bg-surface-2',
    future: 'bg-surface-1'
  };
</script>

<div class="space-y-2">
  <!-- Grid -->
  <div class="flex flex-wrap gap-[2px] sm:gap-[3px]">
    {#each grid as cell}
      <div 
        class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm transition-colors duration-200 {colorMap[cell.color] || 'bg-surface-3'}"
        title={cell.tooltip}
      ></div>
    {/each}
  </div>

  <!-- Legend -->
  <div class="flex flex-wrap items-center gap-2 sm:gap-0 sm:justify-between text-[10px] sm:text-xs text-text-muted">
    <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
      <span class="flex items-center gap-1">
        <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-surface-3"></div> Missed
      </span>
      <span class="flex items-center gap-1">
        <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-accent-green/40"></div> Tired
      </span>
      <span class="flex items-center gap-1">
        <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-accent-green"></div> Active
      </span>
      <span class="flex items-center gap-1">
        <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-accent-red"></div> Critical
      </span>
    </div>
  </div>
</div>
