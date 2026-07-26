<script>
  import { userSettings, persistAll } from '../stores/progress.js';
  import { addDays, today } from '../utils/dates.js';

  export let onComplete;

  let step = 1;
  let interviewDate = addDays(today(), 60);
  let weekendRest = true;
  let dailyMode = 'normal';

  function finish() {
    userSettings.update(s => ({
      ...s,
      interviewDate,
      weekendRest,
      dailyMode,
      onboarded: true
    }));
    persistAll();
    onComplete();
  }
</script>

<div class="min-h-screen bg-surface-0 flex items-center justify-center p-4">
  <div class="card max-w-md w-full space-y-6 animate-fade-in">
    {#if step === 1}
      <!-- Welcome -->
      <div class="text-center space-y-4">
        <div class="text-4xl">⚡</div>
        <h1 class="text-2xl font-bold text-text-primary">Welcome to LevelShift</h1>
        <p class="text-text-secondary">Your SDET-1 prep platform. Designed for lazy people who want results.</p>
        <p class="text-sm text-text-muted">15 minutes/day. No excuses. Let's set up.</p>
      </div>
      <button class="btn-primary w-full" on:click={() => step = 2}>Let's Go →</button>

    {:else if step === 2}
      <!-- Interview date -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-text-primary">📅 When's your target interview?</h2>
        <p class="text-sm text-text-secondary">This drives your timeline and pacing. You can change it later in settings.</p>
        <input
          type="date"
          bind:value={interviewDate}
          min={addDays(today(), 14)}
          class="w-full bg-surface-0 border border-surface-3 rounded-lg p-3 
                 text-text-primary focus:outline-none focus:border-accent-blue"
        />
        <p class="text-xs text-text-muted">
          That's {Math.max(0, Math.ceil((new Date(interviewDate) - new Date(today())) / 86400000))} days from now.
        </p>
      </div>
      <button class="btn-primary w-full" on:click={() => step = 3}>Next →</button>

    {:else if step === 3}
      <!-- Daily Mode -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-text-primary">⚡ Choose your daily mode</h2>
        <p class="text-sm text-text-secondary">How much energy do you typically have for study? You can change this each day.</p>
        
        <div class="space-y-2">
          <button 
            class="w-full p-3 rounded-lg border text-left text-sm transition-all
              {dailyMode === 'full' ? 'border-accent-blue bg-accent-blue/5' : 'border-surface-3'}"
            on:click={() => dailyMode = 'full'}
          >
            <span class="font-medium text-text-primary">⚡ Full focus — 25-30 min</span>
            <span class="text-xs text-text-muted block mt-0.5">Learn new units + challenge practice.</span>
          </button>
          <button 
            class="w-full p-3 rounded-lg border text-left text-sm transition-all
              {dailyMode === 'normal' ? 'border-accent-blue bg-accent-blue/5' : 'border-surface-3'}"
            on:click={() => dailyMode = 'normal'}
          >
            <span class="font-medium text-text-primary">😐 Normal — 15 min</span>
            <span class="text-xs text-text-muted block mt-0.5">One unit of new learning per day.</span>
          </button>
          <button 
            class="w-full p-3 rounded-lg border text-left text-sm transition-all
              {dailyMode === 'tired' ? 'border-accent-blue bg-accent-blue/5' : 'border-surface-3'}"
            on:click={() => dailyMode = 'tired'}
          >
            <span class="font-medium text-text-primary">😴 Tired — 5 min</span>
            <span class="text-xs text-text-muted block mt-0.5">Quick challenge only. Keeps streak alive.</span>
          </button>
        </div>
      </div>
      <button class="btn-primary w-full" on:click={() => step = 4}>Next →</button>

    {:else if step === 4}
      <!-- Weekend preference -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-text-primary">🛋️ Weekends off?</h2>
        <p class="text-sm text-text-secondary">Should missed weekends count against your streak?</p>
        
        <div class="space-y-2">
          <button 
            class="w-full p-3 rounded-lg border text-left text-sm transition-all
              {weekendRest ? 'border-accent-blue bg-accent-blue/5' : 'border-surface-3'}"
            on:click={() => weekendRest = true}
          >
            <span class="font-medium text-text-primary">Yes — weekends are rest days</span>
            <span class="text-xs text-text-muted block mt-0.5">No penalty. No decay. Timeline pauses.</span>
          </button>
          <button 
            class="w-full p-3 rounded-lg border text-left text-sm transition-all
              {!weekendRest ? 'border-accent-blue bg-accent-blue/5' : 'border-surface-3'}"
            on:click={() => weekendRest = false}
          >
            <span class="font-medium text-text-primary">No — I want 7-day consistency</span>
            <span class="text-xs text-text-muted block mt-0.5">Full pressure. Full accountability.</span>
          </button>
        </div>
      </div>
      <button class="btn-primary w-full" on:click={finish}>Start Learning 🚀</button>
    {/if}

    <!-- Step indicator -->
    <div class="flex justify-center gap-2">
      {#each [1, 2, 3, 4] as s}
        <div class="w-2 h-2 rounded-full transition-all"
          class:bg-accent-blue={step >= s}
          class:bg-surface-3={step < s}
        ></div>
      {/each}
    </div>
  </div>
</div>
