<script>
  import { progress } from '../stores/progress.js';
  import phasesData from '../data/phases.json';

  export let navigate;

  $: completedUnits = new Set($progress.completedUnits);
  $: currentPhase = $progress.currentPhase;
  $: currentUnit = $progress.currentUnit;

  // Determine unit status
  function getUnitStatus(phaseIdx, unitIdx) {
    const phase = phasesData.phases[phaseIdx];
    const unit = phase.units[unitIdx];
    
    if (completedUnits.has(unit.id)) return 'completed';
    if (phaseIdx + 1 === currentPhase && unitIdx + 1 === currentUnit) return 'current';
    
    return 'unlocked';
  }

  function handleUnitClick(phaseIdx, unitIdx) {
    // Update progress to this unit and navigate to learn
    progress.update(p => {
      p.currentPhase = phaseIdx + 1;
      p.currentUnit = unitIdx + 1;
      p.currentCard = 0;
      return p;
    });
    navigate('learn');
  }

  function getPhaseProgress(phaseIdx) {
    const phase = phasesData.phases[phaseIdx];
    const completed = phase.units.filter(u => completedUnits.has(u.id)).length;
    return { completed, total: phase.units.length, percentage: Math.round((completed / phase.units.length) * 100) };
  }

  const phaseEmojis = ['☕', '📦', '⚡', '🧮', '🔗', '🎯', '🌐'];
  const phaseColors = ['accent-blue', 'accent-purple', 'accent-yellow', 'accent-green', 'accent-blue', 'accent-purple', 'accent-green'];
</script>

<div class="min-h-screen bg-surface-0">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-surface-0 border-b border-surface-3 px-4 py-3">
    <div class="max-w-3xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="text-text-muted hover:text-text-secondary transition-colors" on:click={() => navigate('dashboard')}>
          ← 
        </button>
        <h1 class="text-lg font-bold text-text-primary">Course Map</h1>
      </div>
      <div class="text-xs text-text-muted">
        {$progress.completedUnits.length}/{phasesData.totalUnits} units
      </div>
    </div>
  </header>

  <!-- Course content -->
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-6">
    {#each phasesData.phases as phase, phaseIdx}
      {@const phaseProgress = getPhaseProgress(phaseIdx)}
      {@const isCurrentPhase = phaseIdx + 1 === currentPhase}
      
      <!-- Phase header -->
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-xl">{phaseEmojis[phaseIdx]}</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-text-primary">Phase {phase.id}: {phase.title}</h2>
              {#if isCurrentPhase}
                <span class="text-[10px] bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded-full font-medium">CURRENT</span>
              {/if}
              {#if phaseProgress.percentage === 100}
                <span class="text-[10px] bg-accent-green/10 text-accent-green px-1.5 py-0.5 rounded-full font-medium">✓ DONE</span>
              {/if}
            </div>
            <p class="text-xs text-text-muted">{phase.subtitle}</p>
          </div>
          <span class="text-xs text-text-muted font-mono">{phaseProgress.completed}/{phaseProgress.total}</span>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-surface-2 rounded-full overflow-hidden">
          <div 
            class="h-full bg-{phaseColors[phaseIdx]} rounded-full transition-all duration-500"
            style="width: {phaseProgress.percentage}%"
          ></div>
        </div>

        <!-- Units list -->
        <div class="space-y-1.5 pl-8">
          {#each phase.units as unit, unitIdx}
            {@const status = getUnitStatus(phaseIdx, unitIdx)}
            
            <button
              class="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer
                {status === 'completed' ? 'bg-accent-green/5 border border-accent-green/20 hover:bg-accent-green/10' : ''}
                {status === 'current' ? 'bg-accent-blue/10 border border-accent-blue/30 hover:bg-accent-blue/15' : ''}
                {status === 'unlocked' ? 'bg-surface-1 border border-surface-3 hover:border-text-muted hover:bg-surface-2' : ''}"
              on:click={() => handleUnitClick(phaseIdx, unitIdx)}
            >
              <!-- Status icon -->
              <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                {status === 'completed' ? 'bg-accent-green/20 text-accent-green' : ''}
                {status === 'current' ? 'bg-accent-blue/20 text-accent-blue animate-pulse' : ''}
                {status === 'unlocked' ? 'bg-surface-2 text-text-muted' : ''}">
                {#if status === 'completed'}✓
                {:else if status === 'current'}▶
                {:else}{unitIdx + 1}
                {/if}
              </div>

              <!-- Unit info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate
                  {status === 'completed' ? 'text-accent-green' : ''}
                  {status === 'current' ? 'text-accent-blue' : ''}
                  {status === 'unlocked' ? 'text-text-primary' : ''}">
                  {unit.title}
                </p>
                <p class="text-[10px] text-text-muted">
                  {unit.cards} cards · {unit.minutes} min
                </p>
              </div>

              <!-- Right arrow -->
              <span class="text-text-muted text-xs">→</span>
            </button>
          {/each}
        </div>
      </div>
    {/each}

    <!-- Bottom padding -->
    <div class="h-8"></div>
  </div>
</div>
