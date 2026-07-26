<script>
  import { progress, streak, concepts, heatmap, userSettings, timeline, readinessScore, daysUntilInterview } from '../stores/progress.js';
  import { calculateReadiness } from '../engines/scoring.js';
  import { calculateTimeline } from '../engines/timeline.js';
  import { calculateDecay } from '../engines/decay.js';
  import Radar from './Radar.svelte';

  export let navigate;

  $: readiness = calculateReadiness($progress, $concepts, $streak);
  $: timelineData = calculateTimeline($progress, $heatmap, $userSettings);
  $: weakConcepts = getWeakConcepts($concepts);
  $: streakHistory = $streak.longestHistory || [];

  function getWeakConcepts(conceptsData) {
    return Object.entries(conceptsData)
      .map(([id, data]) => ({ id, strength: Math.round(calculateDecay(data)) }))
      .filter(c => c.strength < 50)
      .sort((a, b) => a.strength - b.strength)
      .slice(0, 5);
  }

  function getScoreColor(score) {
    if (score >= 70) return 'text-accent-green';
    if (score >= 40) return 'text-accent-yellow';
    return 'text-accent-red';
  }

  function exportHTML() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LevelShift Readiness Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e6edf3; padding: 2rem; max-width: 800px; margin: 0 auto; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
  .header { text-align: center; margin-bottom: 2rem; }
  .score-big { font-size: 4rem; font-weight: 900; }
  .score-green { color: #3fb950; }
  .score-yellow { color: #d29922; }
  .score-red { color: #f85149; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .stat { text-align: center; }
  .stat-value { font-size: 1.5rem; font-weight: 700; }
  .stat-label { font-size: 0.75rem; color: #8b949e; text-transform: uppercase; }
  .bar { height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; margin-top: 0.25rem; }
  .bar-fill { height: 100%; border-radius: 3px; }
  .weak-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #21262d; }
  .meta { text-align: center; font-size: 0.7rem; color: #8b949e; margin-top: 2rem; }
  h2 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #8b949e; margin-bottom: 0.75rem; }
</style>
</head>
<body>
<div class="header">
  <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">📊 LevelShift Readiness Report</h1>
  <p style="color: #8b949e; font-size: 0.85rem;">Generated ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
</div>

<div class="card" style="text-align: center;">
  <h2>Overall Readiness</h2>
  <div class="score-big ${readiness.score >= 70 ? 'score-green' : readiness.score >= 40 ? 'score-yellow' : 'score-red'}">${readiness.score}%</div>
  <p style="color: #8b949e; margin-top: 0.5rem;">${readiness.verdict}</p>
</div>

<div class="card">
  <h2>Score Breakdown</h2>
  <div class="grid">
    <div class="stat">
      <div class="stat-value" style="color: #58a6ff;">${readiness.breakdown.completion}%</div>
      <div class="stat-label">Completion</div>
      <div class="bar"><div class="bar-fill" style="width: ${readiness.breakdown.completion}%; background: #58a6ff;"></div></div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #3fb950;">${readiness.breakdown.strength}%</div>
      <div class="stat-label">Strength</div>
      <div class="bar"><div class="bar-fill" style="width: ${readiness.breakdown.strength}%; background: #3fb950;"></div></div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #d2a8ff;">${readiness.breakdown.consistency}%</div>
      <div class="stat-label">Consistency</div>
      <div class="bar"><div class="bar-fill" style="width: ${readiness.breakdown.consistency}%; background: #d2a8ff;"></div></div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #d29922;">${readiness.breakdown.coverage}%</div>
      <div class="stat-label">Coverage</div>
      <div class="bar"><div class="bar-fill" style="width: ${readiness.breakdown.coverage}%; background: #d29922;"></div></div>
    </div>
  </div>
</div>

<div class="card">
  <h2>Timeline Projection</h2>
  <div class="grid">
    <div class="stat">
      <div class="stat-value" style="color: #3fb950;">${timelineData.bestCase}</div>
      <div class="stat-label">Best Case</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #58a6ff;">${timelineData.estimatedCompletion}</div>
      <div class="stat-label">Current Pace</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #f85149;">${timelineData.worstCase}</div>
      <div class="stat-label">Worst Case</div>
    </div>
    <div class="stat">
      <div class="stat-value">${$daysUntilInterview}</div>
      <div class="stat-label">Days Until Interview</div>
    </div>
  </div>
</div>

<div class="card">
  <h2>Streak History</h2>
  <div style="display: flex; align-items: center; gap: 1rem;">
    <div class="stat">
      <div class="stat-value" style="color: #d29922;">${$streak.current}</div>
      <div class="stat-label">Current Streak</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #3fb950;">${$streak.longest}</div>
      <div class="stat-label">Best Streak</div>
    </div>
  </div>
  ${streakHistory.length > 0 ? `<p style="color: #8b949e; font-size: 0.75rem; margin-top: 0.75rem;">Previous streaks: ${streakHistory.join(', ')} days</p>` : ''}
</div>

${weakConcepts.length > 0 ? `
<div class="card">
  <h2>Top Weak Concepts</h2>
  ${weakConcepts.map(c => `<div class="weak-item"><span>${c.id}</span><span style="color: #f85149;">${c.strength}%</span></div>`).join('')}
</div>` : ''}

<p class="meta">LevelShift • SDET-1 Interview Prep • ${$progress.completedUnits.length}/47 units complete</p>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelshift-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-6 space-y-5">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button class="text-text-muted hover:text-text-secondary" on:click={() => navigate('dashboard')}>←</button>
      <h1 class="text-xl font-bold text-text-primary">📊 Readiness Report</h1>
    </div>
    <button class="btn-primary text-sm" on:click={exportHTML}>
      📥 Export HTML
    </button>
  </div>

  <!-- Big Score -->
  <div class="card text-center space-y-2">
    <p class="text-[10px] text-text-muted uppercase tracking-wider">Overall Readiness</p>
    <p class="text-5xl font-black {getScoreColor(readiness.score)}">{readiness.score}%</p>
    <p class="text-sm text-text-secondary">{readiness.verdict}</p>
    <p class="text-xs text-text-muted">{$daysUntilInterview} days until interview</p>
  </div>

  <!-- Breakdown -->
  <div class="card space-y-4">
    <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Score Breakdown</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-text-secondary">Completion</span>
          <span class="text-accent-blue font-bold">{readiness.breakdown.completion}%</span>
        </div>
        <div class="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div class="h-full bg-accent-blue rounded-full transition-all" style="width: {readiness.breakdown.completion}%"></div>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-text-secondary">Strength</span>
          <span class="text-accent-green font-bold">{readiness.breakdown.strength}%</span>
        </div>
        <div class="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div class="h-full bg-accent-green rounded-full transition-all" style="width: {readiness.breakdown.strength}%"></div>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-text-secondary">Consistency</span>
          <span class="text-accent-purple font-bold">{readiness.breakdown.consistency}%</span>
        </div>
        <div class="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div class="h-full bg-accent-purple rounded-full transition-all" style="width: {readiness.breakdown.consistency}%"></div>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-text-secondary">Coverage</span>
          <span class="text-accent-yellow font-bold">{readiness.breakdown.coverage}%</span>
        </div>
        <div class="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div class="h-full bg-accent-yellow rounded-full transition-all" style="width: {readiness.breakdown.coverage}%"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Skill Radar -->
  <div class="card">
    <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Skill Radar</h3>
    <div class="flex justify-center">
      <Radar size={220} />
    </div>
  </div>

  <!-- Streak History -->
  <div class="card space-y-3">
    <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Streak History</h3>
    <div class="flex items-center gap-6">
      <div class="text-center">
        <p class="text-2xl font-bold text-accent-yellow">{$streak.current}</p>
        <p class="text-[10px] text-text-muted">Current</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-accent-green">{$streak.longest}</p>
        <p class="text-[10px] text-text-muted">Longest</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-text-primary">{streakHistory.length}</p>
        <p class="text-[10px] text-text-muted">Streak Breaks</p>
      </div>
    </div>
    {#if streakHistory.length > 0}
      <div class="flex items-center gap-1.5 flex-wrap">
        {#each streakHistory as s}
          <span class="text-xs bg-surface-2 px-2 py-0.5 rounded-full text-text-secondary">{s}d</span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Timeline Projection -->
  <div class="card space-y-3">
    <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Timeline Projection</h3>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div>
        <p class="text-sm font-bold text-accent-green">{timelineData.bestCase}</p>
        <p class="text-[10px] text-text-muted">Best Case</p>
      </div>
      <div>
        <p class="text-sm font-bold text-accent-blue">{timelineData.estimatedCompletion}</p>
        <p class="text-[10px] text-text-muted">Current Pace</p>
      </div>
      <div>
        <p class="text-sm font-bold text-accent-red">{timelineData.worstCase}</p>
        <p class="text-[10px] text-text-muted">Worst Case</p>
      </div>
    </div>
    <div class="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-surface-3">
      <span>Rolling pace: {timelineData.rollingPace} units/day</span>
      <span>{timelineData.remaining} units remaining</span>
    </div>
  </div>

  <!-- Top Weak Concepts -->
  {#if weakConcepts.length > 0}
    <div class="card space-y-3">
      <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Top Weak Concepts</h3>
      <div class="space-y-2">
        {#each weakConcepts as concept}
          <div class="flex items-center justify-between">
            <span class="text-sm text-text-secondary font-mono">{concept.id}</span>
            <div class="flex items-center gap-2">
              <div class="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div class="h-full bg-accent-red rounded-full" style="width: {concept.strength}%"></div>
              </div>
              <span class="text-xs text-accent-red font-bold w-8 text-right">{concept.strength}%</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Back button -->
  <button class="btn-secondary w-full" on:click={() => navigate('dashboard')}>← Back to Dashboard</button>
</div>
