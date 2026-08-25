<script>
  import { userSettings, streak, persistAll } from '../stores/progress.js';
  import { exportData, importData, getStorageUsage, clearData } from '../utils/storage.js';
  import { playSuccess } from '../utils/sounds.js';
  import { today, addDays } from '../utils/dates.js';
  import { hasApiKey, setApiKey, clearApiKey, testApiKey } from '../utils/ai.js';
  import { reminderSettings, notificationPermission, requestNotificationPermission } from '../utils/reminders.js';

  export let navigate;

  let interviewDate = $userSettings.interviewDate;
  let weekendRest = $userSettings.weekendRest;
  let soundEnabled = $userSettings.soundEnabled !== false; // default true
  let osPreference = $userSettings.osPreference || 'windows';
  let storageUsage = getStorageUsage();
  let showClearConfirm = false;
  let importInput;

  // ─── AI (Ask Atlas) BYOK ───────────────────────────────────────────────
  let aiEnabled = $userSettings.aiEnabled === true;
  let showAiGuide = false;
  let keyInput = '';
  let keyConfigured = hasApiKey();
  let testing = false;
  let testResult = null; // {ok:boolean, error?:string}
  let showKey = false;

  function toggleAi() {
    aiEnabled = !aiEnabled;
    userSettings.update(s => ({ ...s, aiEnabled }));
    persistAll();
    if (aiEnabled && !keyConfigured) showAiGuide = true;
  }

  async function saveAndTestKey() {
    testResult = null;
    if (!keyInput || keyInput.trim().length < 10) {
      testResult = { ok: false, error: 'That does not look like a valid key.' };
      return;
    }
    testing = true;
    const result = await testApiKey(keyInput.trim());
    testing = false;
    testResult = result;
    if (result.ok) {
      setApiKey(keyInput.trim());
      keyConfigured = true;
      keyInput = '';
      playSuccess();
    }
  }

  function removeKey() {
    clearApiKey();
    keyConfigured = false;
    testResult = null;
  }

  // ─── Daily reminder ────────────────────────────────────────────────────
  let notifPerm = notificationPermission();

  async function toggleReminder(e) {
    const enabled = e.target.checked;
    if (enabled && notifPerm === 'default') {
      notifPerm = await requestNotificationPermission();
    }
    reminderSettings.update(s => ({ ...s, enabled }));
  }

  function setReminderTime(e) {
    reminderSettings.update(s => ({ ...s, time: e.target.value }));
  }

  function saveSettings() {
    userSettings.update(s => ({
      ...s,
      interviewDate,
      weekendRest,
      soundEnabled,
      osPreference
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

  <!-- OS Preference (for Agentic AI build steps) -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">Build Commands OS</h3>
    <p class="text-xs text-text-muted">Which commands to show in Agentic AI build steps.</p>
    <div class="flex gap-2">
      <button
        class="flex-1 text-sm px-3 py-2 rounded-lg border transition-colors
          {osPreference === 'windows' ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/40' : 'bg-surface-0 text-text-secondary border-surface-3'}"
        on:click={() => { osPreference = 'windows'; saveSettings(); }}
      >🪟 Windows</button>
      <button
        class="flex-1 text-sm px-3 py-2 rounded-lg border transition-colors
          {osPreference === 'ubuntu' ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/40' : 'bg-surface-0 text-text-secondary border-surface-3'}"
        on:click={() => { osPreference = 'ubuntu'; saveSettings(); }}
      >🐧 Ubuntu</button>
    </div>
  </div>
  <!-- AI Assistant (Ask Atlas) — Bring Your Own Key -->
  <div class="card space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-text-muted uppercase">🛰️ Ask Atlas (AI Help)</h3>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple">Optional</span>
    </div>
    <p class="text-xs text-text-muted">
      Turn on an AI tutor that appears on every card. It uses your own free Google Gemini
      API key — your key, your free quota. The key is stored only on this device and is
      <span class="text-text-secondary">never included in your Export backup</span>.
    </p>

    <label class="flex items-center justify-between cursor-pointer">
      <span class="text-sm text-text-primary">Enable AI help</span>
      <input type="checkbox" checked={aiEnabled} on:change={toggleAi}
        class="w-5 h-5 rounded border-surface-3 bg-surface-0 text-accent-blue focus:ring-accent-blue" />
    </label>

    {#if aiEnabled}
      <!-- Key status -->
      <div class="pt-2 border-t border-surface-3 space-y-3">
        {#if keyConfigured}
          <div class="flex items-center justify-between">
            <span class="text-sm text-accent-green">✅ API key saved & verified</span>
            <button class="text-xs text-accent-red hover:underline" on:click={removeKey}>Remove key</button>
          </div>
        {:else}
          <p class="text-xs text-accent-yellow">⚠️ AI is on, but no key is set yet. Add one below.</p>
        {/if}

        <!-- Guide toggle -->
        <button class="text-xs text-accent-blue hover:underline" on:click={() => showAiGuide = !showAiGuide}>
          {showAiGuide ? 'Hide' : 'How do I get a free Gemini key?'}
        </button>

        {#if showAiGuide}
          <ol class="text-xs text-text-secondary space-y-1.5 list-decimal list-inside bg-surface-0 rounded-lg p-3 border border-surface-3">
            <li>Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="text-accent-blue hover:underline">aistudio.google.com/app/apikey</a> and sign in with any Google account.</li>
            <li>Click <span class="text-text-primary font-medium">“Create API key”</span> (no credit card required).</li>
            <li>Choose <span class="text-text-primary font-medium">“Create API key in new project”</span> if asked.</li>
            <li>Copy the key (a long string, e.g. starting with <code class="text-accent-purple">AIza…</code> or <code class="text-accent-purple">AQ…</code>).</li>
            <li>Paste it below and press <span class="text-text-primary font-medium">Save &amp; Test</span>.</li>
          </ol>
          <p class="text-[11px] text-text-muted">
            Tip: LevelShift uses <code class="text-accent-purple">gemini-flash-lite-latest</code> — the free tier
            (generous daily quota). Plenty for studying. Avoid the “Pro” models; they have little/no free quota.
          </p>
        {/if}

        <!-- Key input -->
        {#if !keyConfigured}
          <div class="space-y-2">
            <div class="flex gap-2">
              {#if showKey}
                <input type="text" bind:value={keyInput} placeholder="Paste your Gemini API key"
                  class="flex-1 bg-surface-0 border border-surface-3 rounded-lg p-2.5 text-sm font-mono
                         text-text-primary focus:outline-none focus:border-accent-blue" />
              {:else}
                <input type="password" bind:value={keyInput} placeholder="Paste your Gemini API key"
                  class="flex-1 bg-surface-0 border border-surface-3 rounded-lg p-2.5 text-sm font-mono
                         text-text-primary focus:outline-none focus:border-accent-blue" />
              {/if}
              <button class="btn-secondary text-xs px-2" on:click={() => showKey = !showKey}>
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <button class="btn-primary text-sm w-full" on:click={saveAndTestKey} disabled={testing}>
              {testing ? 'Testing…' : 'Save & Test'}
            </button>
            {#if testResult && !testResult.ok}
              <p class="text-xs text-accent-red">❌ {testResult.error}</p>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Daily Reminder -->
  <div class="card space-y-3">
    <h3 class="text-sm font-semibold text-text-muted uppercase">🔔 Daily Reminder</h3>
    <label class="flex items-center justify-between cursor-pointer">
      <div>
        <span class="text-sm text-text-primary">Remind me to study</span>
        <span class="text-xs text-text-muted block mt-0.5">A nudge to protect your streak</span>
      </div>
      <input type="checkbox" checked={$reminderSettings.enabled} on:change={toggleReminder}
        class="w-5 h-5 rounded border-surface-3 bg-surface-0 text-accent-blue focus:ring-accent-blue" />
    </label>

    {#if $reminderSettings.enabled}
      <div class="flex items-center justify-between pt-2 border-t border-surface-3">
        <span class="text-sm text-text-secondary">Remind at</span>
        <input type="time" value={$reminderSettings.time} on:change={setReminderTime}
          class="bg-surface-0 border border-surface-3 rounded-lg p-2 text-sm text-text-primary
                 focus:outline-none focus:border-accent-blue" />
      </div>
      {#if notifPerm === 'denied'}
        <p class="text-xs text-accent-yellow">Notifications are blocked in your browser — you'll still see an in-app nudge when you open LevelShift.</p>
      {:else if notifPerm === 'unsupported'}
        <p class="text-xs text-text-muted">Your browser doesn't support notifications — you'll still see an in-app nudge on open.</p>
      {:else}
        <p class="text-[11px] text-text-muted">
          Reminders fire while LevelShift is open. Background reminders (when the app is closed)
          arrive in a future update once the backend is ready.
        </p>
      {/if}
    {/if}
  </div>

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
