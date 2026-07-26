<script>
  import { userSettings, streak, persistAll } from '../stores/progress.js';
  import { exportData, importData, getStorageUsage, clearData } from '../utils/storage.js';
  import { playSuccess } from '../utils/sounds.js';
  import { today, addDays } from '../utils/dates.js';

  export let navigate;

  let interviewDate = $userSettings.interviewDate;
  let weekendRest = $userSettings.weekendRest;
  let soundEnabled = $userSettings.soundEnabled !== false; // default true
  let storageUsage = getStorageUsage();
  let showClearConfirm = false;
  let importInput;

  function saveSettings() {
    userSettings.update(s => ({
      ...s,
      interviewDate,
      weekendRest,
      soundEnabled
    }));
    persistAll();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    saveSettings();
    if (soundEnabled) {
      playSuccess(); // Play a confirmation beep when enabling
    }
  }

  function handleExport() {
    exportData();
  }

  async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const success = await importData(file);
    if (success) {
      window.location.reload();
    }
  }

  function handleClear() {
    clearData();
    window.location.reload();
  }
</script>

<div class="max-w-lg mx-auto px-4 py-6 space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <button class="text-text-muted hover:text-text-secondary" on:click={() => navigate('dashboard')}>←</button>
    <h1 class="text-xl font-bold text-text-primary">Settings</h1>
  </div>

  <!-- Interview Date -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Interview Target</h3>
    <input
      type="date"
      bind:value={interviewDate}
      on:change={saveSettings}
      min={addDays(today(), 7)}
      class="w-full bg-surface-0 border border-surface-3 rounded-lg p-3 
             text-text-primary focus:outline-none focus:border-accent-blue"
    />
  </div>

  <!-- Weekend Rest -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Weekend Rest</h3>
    <label class="flex items-center justify-between cursor-pointer">
      <span class="text-sm text-text-primary">Weekends are rest days (no penalty)</span>
      <input type="checkbox" bind:checked={weekendRest} on:change={saveSettings}
        class="w-5 h-5 rounded border-surface-3 bg-surface-0 text-accent-blue focus:ring-accent-blue" />
    </label>
  </div>

  <!-- Streak Freeze Bank (H-09) -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Streak Freeze Bank</h3>
    <div class="flex items-center justify-between">
      <span class="text-sm text-text-primary">Available freezes</span>
      <div class="flex items-center gap-1.5">
        {#each Array(2) as _, i}
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs
            {i < $streak.freezesAvailable ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40' : 'bg-surface-2 text-text-muted border border-surface-3'}">
            ❄️
          </div>
        {/each}
        <span class="text-xs text-text-muted ml-2">{$streak.freezesAvailable} / 2</span>
      </div>
    </div>
    <div class="text-xs text-text-muted space-y-1 pt-2 border-t border-surface-3">
      <p>• Max: 2 streak freezes at a time</p>
      <p>• Earn rate: 1 freeze per 7-day streak</p>
      <p>• Auto-consumed on first missed day to protect streak</p>
      {#if $streak.freezesUsed && $streak.freezesUsed.length > 0}
        <p class="text-accent-blue">• Last used: {$streak.freezesUsed[$streak.freezesUsed.length - 1]}</p>
      {/if}
    </div>
  </div>

  <!-- Sound Effects -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Sound Effects</h3>
    <label class="flex items-center justify-between cursor-pointer">
      <div>
        <span class="text-sm text-text-primary">Enable sound effects</span>
        <span class="text-xs text-text-muted block mt-0.5">Audio feedback for correct/wrong answers</span>
      </div>
      <input type="checkbox" checked={soundEnabled} on:change={toggleSound}
        class="w-5 h-5 rounded border-surface-3 bg-surface-0 text-accent-blue focus:ring-accent-blue" />
    </label>
  </div>

  <!-- Data Management -->
  <div class="card space-y-4">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Data</h3>
    
    <div class="flex items-center justify-between text-sm">
      <span class="text-text-secondary">Storage used</span>
      <span class="font-mono text-text-primary">{(storageUsage.used / 1024).toFixed(1)} KB / 5 MB</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button class="btn-secondary text-sm" on:click={handleExport}>
        📥 Export Backup
      </button>
      <label class="btn-secondary text-sm text-center cursor-pointer">
        📤 Import Backup
        <input type="file" accept=".json" class="hidden" bind:this={importInput} on:change={handleImport} />
      </label>
    </div>

    <!-- Danger zone -->
    <div class="pt-3 border-t border-surface-3">
      {#if !showClearConfirm}
        <button class="btn-danger text-sm w-full" on:click={() => showClearConfirm = true}>
          🗑 Reset All Data
        </button>
      {:else}
        <div class="space-y-2">
          <p class="text-xs text-accent-red text-center">This will delete ALL progress. Are you sure?</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn-secondary text-sm" on:click={() => showClearConfirm = false}>Cancel</button>
            <button class="btn-danger text-sm" on:click={handleClear}>Yes, Delete Everything</button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Keyboard shortcuts reference -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Keyboard Shortcuts</h3>
    <div class="space-y-1.5 text-sm">
      <div class="flex justify-between">
        <span class="text-text-secondary">Next card</span>
        <kbd class="bg-surface-0 px-2 py-0.5 rounded text-xs font-mono text-text-muted border border-surface-3">→ or Enter</kbd>
      </div>
      <div class="flex justify-between">
        <span class="text-text-secondary">Previous card</span>
        <kbd class="bg-surface-0 px-2 py-0.5 rounded text-xs font-mono text-text-muted border border-surface-3">←</kbd>
      </div>
      <div class="flex justify-between">
        <span class="text-text-secondary">Exit to dashboard</span>
        <kbd class="bg-surface-0 px-2 py-0.5 rounded text-xs font-mono text-text-muted border border-surface-3">Esc</kbd>
      </div>
    </div>
  </div>
</div>
