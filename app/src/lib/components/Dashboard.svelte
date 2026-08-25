<script>
  import { progress, streak, timeline, userSettings, interviewCredits, readinessScore, daysUntilInterview } from '../stores/progress.js';
  import { getInterviewLockStatus } from '../engines/scoring.js';
  import { getFeatureLocks } from '../engines/punishment.js';
  import { getReadinessData } from '../engines/gamification.js';
  import Heatmap from './Heatmap.svelte';
  import Radar from './Radar.svelte';
  import Timeline from './Timeline.svelte';
  import DecayLog from './DecayLog.svelte';
  import WeeklyReport from './WeeklyReport.svelte';
  import { theme, toggleTheme } from '../utils/theme.js';
  import { customCourses } from '../stores/courses.js';

  export let navigate;

  $: interviewLock = getInterviewLockStatus($streak, $interviewCredits);
  $: readinessData = getReadinessData();
  $: featureLocks = getFeatureLocks($streak, { score: $readinessScore }, $interviewCredits);

  let dailyMode = $userSettings.dailyMode || 'normal';
  let showWeeklyReport = false;

  // Auto-show weekly report on Mondays
  $: {
    const dayOfWeek = new Date().getDay();
    const lastShown = localStorage.getItem('ls_weekly_report_shown');
    const todayStr = new Date().toISOString().split('T')[0];
    if (dayOfWeek === 1 && lastShown !== todayStr) {
      showWeeklyReport = true;
      localStorage.setItem('ls_weekly_report_shown', todayStr);
    }
  }

  function setDailyMode(mode) {
    dailyMode = mode;
    userSettings.update(s => ({ ...s, dailyMode: mode }));
  }

  // Floating "Enable AI" nudge — only until the user turns AI on.
  $: aiEnabled = $userSettings.aiEnabled === true;
  function goToAiSettings() {
    try { sessionStorage.setItem('ls_focus_ai', '1'); } catch { /* ignore */ }
    navigate('settings');
  }
</script>

<div class="max-w-6xl mx-auto px-4 py-6 space-y-5">
  <!-- Weekly Report Modal -->
  {#if showWeeklyReport}
    <WeeklyReport on:close={() => showWeeklyReport = false} />
  {/if}

  <!-- Degraded Dashboard Warning (H-11) -->
  {#if featureLocks.dashboard.degraded}
    <div class="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 animate-pulse">
      <div class="flex items-center gap-2">
        <span class="text-lg">⚠️</span>
        <div>
          <p class="text-sm font-semibold text-accent-red">Dashboard Degraded</p>
          <p class="text-xs text-text-secondary">{featureLocks.dashboard.reason}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Header -->
  <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
    <div class="flex items-center gap-3">
      <h1 class="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">LevelShift</h1>
      <span class="text-xs bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded-full font-medium">SDET-1</span>
    </div>
    <div class="flex items-center gap-3 sm:gap-5 text-sm">
      <!-- Streak -->
      <div class="flex items-center gap-1">
        <span class="text-base sm:text-lg">{$streak.current > 0 ? '🔥' : '💀'}</span>
        <span class="text-text-primary font-bold">{$streak.current}</span>
        <span class="text-text-muted text-xs hidden sm:inline">day{$streak.current !== 1 ? 's' : ''}</span>
        {#if $streak.freezesAvailable > 0}
          <span class="text-accent-blue text-xs" title="{$streak.freezesAvailable} streak freeze{$streak.freezesAvailable > 1 ? 's' : ''} available">❄️{$streak.freezesAvailable}</span>
        {/if}
        {#if $streak.freezesUsed && $streak.freezesUsed.length > 0 && $streak.freezesUsed[$streak.freezesUsed.length - 1] === new Date().toISOString().split('T')[0]}
          <span class="text-[9px] bg-accent-blue/10 text-accent-blue px-1 py-0.5 rounded-full animate-pulse">FROZEN</span>
        {/if}
      </div>
      <!-- XP -->
      <div class="flex items-center gap-1">
        <span class="text-accent-purple">⚡</span>
        <span class="text-text-primary font-bold">{$progress.totalXP}</span>
        <span class="text-text-muted text-xs hidden sm:inline">XP</span>
      </div>
      <!-- Readiness -->
      <div class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full"
          class:bg-accent-green={$readinessScore >= 70}
          class:bg-accent-yellow={$readinessScore >= 40 && $readinessScore < 70}
          class:bg-accent-red={$readinessScore < 40}
        ></span>
        <span class="text-text-primary font-mono text-xs">{$readinessScore}%</span>
      </div>
      <!-- Theme toggle -->
      <button
        class="text-text-muted hover:text-text-secondary transition-colors"
        title="Toggle light / dark theme"
        aria-label="Toggle theme"
        on:click={toggleTheme}
      >
        {$theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <!-- Settings -->
      <button class="text-text-muted hover:text-text-secondary transition-colors" on:click={() => navigate('settings')}>
        ⚙
      </button>
    </div>
  </header>

  <!-- Daily Mode Selector -->
  <div class="flex items-center gap-2">
    <span class="text-xs text-text-muted">Today I have:</span>
    <button
      class="px-3 py-1 text-xs rounded-full transition-all"
      class:bg-accent-blue={dailyMode === 'full'}
      class:text-surface-0={dailyMode === 'full'}
      class:bg-surface-2={dailyMode !== 'full'}
      class:text-text-secondary={dailyMode !== 'full'}
      on:click={() => setDailyMode('full')}
    >⚡ Full focus</button>
    <button
      class="px-3 py-1 text-xs rounded-full transition-all"
      class:bg-accent-blue={dailyMode === 'normal'}
      class:text-surface-0={dailyMode === 'normal'}
      class:bg-surface-2={dailyMode !== 'normal'}
      class:text-text-secondary={dailyMode !== 'normal'}
      on:click={() => setDailyMode('normal')}
    >😐 Normal</button>
    <button
      class="px-3 py-1 text-xs rounded-full transition-all"
      class:bg-accent-blue={dailyMode === 'tired'}
      class:text-surface-0={dailyMode === 'tired'}
      class:bg-surface-2={dailyMode !== 'tired'}
      class:text-text-secondary={dailyMode !== 'tired'}
      on:click={() => setDailyMode('tired')}
    >😴 Tired</button>
  </div>

  <!-- Main Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Continue Learning -->
    <div class="card space-y-3">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Continue Learning</h3>
      <div>
        <p class="text-lg font-semibold text-text-primary">
          Phase {$progress.currentPhase} › Unit {$progress.currentUnit}
        </p>
        <p class="text-sm text-text-secondary mt-0.5">
          Card {$progress.currentCard + 1} of 10
        </p>
      </div>
      <button class="btn-primary w-full" on:click={() => navigate('learn')}>
        {$progress.currentCard > 0 ? 'Resume' : 'Start'} →
      </button>
    </div>

    <!-- Skill Radar -->
    <div class="card">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Skill Radar</h3>
      <Radar size={200} />
    </div>

    <!-- Timeline -->
    <div class="card">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Timeline</h3>
      <Timeline />
    </div>

    <!-- Heatmap -->
    <div class="card">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Activity</h3>
      <Heatmap days={60} />
      <div class="mt-3 flex items-center justify-between text-xs text-text-muted">
        <span>Longest streak: <span class="text-text-primary font-semibold">{$streak.longest} days</span></span>
        {#if $streak.freezesAvailable > 0}
          <span>❄️ {$streak.freezesAvailable} freeze{$streak.freezesAvailable > 1 ? 's' : ''}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Decay Log -->
  <div class="card">
    <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Decay Log</h3>
    <DecayLog />
  </div>

  <!-- Action Buttons -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <button 
      class="card text-center hover:border-accent-blue/50 transition-colors cursor-pointer"
      on:click={() => navigate('course')}
    >
      <span class="text-xl mb-1 block">📚</span>
      <span class="text-xs text-text-secondary">Course Map</span>
      <span class="text-[10px] text-text-muted block mt-0.5">{$progress.completedUnits.length}/47 units</span>
    </button>

    <button 
      class="card text-center hover:border-accent-purple/50 transition-colors cursor-pointer"
      on:click={() => navigate('courses')}
    >
      <span class="text-xl mb-1 block">🧭</span>
      <span class="text-xs text-text-secondary">Your Courses</span>
      <span class="text-[10px] text-text-muted block mt-0.5">{$customCourses.length} custom</span>
    </button>

    <button 
      class="card text-center hover:border-accent-blue/50 transition-colors cursor-pointer"
      on:click={() => navigate('challenge')}
    >
      <span class="text-xl mb-1 block">🧩</span>
      <span class="text-xs text-text-secondary">Quick Challenge</span>
      <span class="text-[10px] text-text-muted block mt-0.5">5 min</span>
    </button>

    <button 
      class="card text-center transition-colors {featureLocks.interviewMode.locked ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent-purple/50 cursor-pointer'}"
      disabled={featureLocks.interviewMode.locked}
      on:click={() => !featureLocks.interviewMode.locked && navigate('interview')}
    >
      <span class="text-xl mb-1 block">{featureLocks.interviewMode.locked ? '🔒' : '🎤'}</span>
      <span class="text-xs text-text-secondary">Mock Interview</span>
      {#if featureLocks.interviewMode.locked}
        <span class="text-[10px] text-accent-red block mt-0.5">
          {featureLocks.interviewMode.reason || 'Locked'}
        </span>
      {:else}
        <span class="text-[10px] text-text-muted block mt-0.5">{$interviewCredits.available} credit{$interviewCredits.available !== 1 ? 's' : ''}</span>
      {/if}
    </button>

    <button 
      class="card text-center hover:border-accent-green/50 transition-colors cursor-pointer"
      on:click={() => navigate('report')}
    >
      <span class="text-xl mb-1 block">📊</span>
      <span class="text-xs text-text-secondary">Readiness Report</span>
      <span class="text-[10px] text-text-muted block mt-0.5">Export</span>
    </button>
  </div>

  <!-- Weekly Report Trigger -->
  <button 
    class="card w-full text-left hover:border-accent-yellow/50 transition-colors cursor-pointer"
    on:click={() => showWeeklyReport = true}
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-lg">📅</span>
        <div>
          <span class="text-xs text-text-secondary">Weekly Shift Report</span>
          <span class="text-[10px] text-text-muted block">View this week's progress vs last week</span>
        </div>
      </div>
      <span class="text-text-muted text-xs">→</span>
    </div>
  </button>

  <!-- Feature Lock Status (H-11) -->
  {#if featureLocks.proveMode.locked || featureLocks.interviewMode.locked}
    <div class="card space-y-2">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">🔒 Locked Features</h3>
      {#if featureLocks.interviewMode.locked}
        <div class="flex items-center gap-2 text-xs">
          <span class="text-accent-red">●</span>
          <span class="text-text-secondary">Mock Interview — {featureLocks.interviewMode.reason}</span>
        </div>
      {/if}
      {#if featureLocks.proveMode.locked}
        <div class="flex items-center gap-2 text-xs">
          <span class="text-accent-yellow">●</span>
          <span class="text-text-secondary">Prove Mode — {featureLocks.proveMode.reason}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Floating "Enable AI" discovery button — hidden once AI is on -->
{#if !aiEnabled}
  <button
    class="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full shadow-lg
           bg-accent-purple/90 text-surface-0 px-4 py-3 font-semibold text-sm
           hover:brightness-110 active:scale-95 transition animate-slide-up"
    on:click={goToAiSettings}
    title="Enable the Ask Atlas AI tutor"
  >
    ✨ <span>Enable AI</span>
  </button>
{/if}
