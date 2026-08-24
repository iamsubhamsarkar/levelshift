<script>
  import { createEventDispatcher } from 'svelte';
  import Card from './Card.svelte';
  import { userSettings } from '../stores/progress.js';

  export let data = {};
  export let cardState = null;
  // data: { goal, why?, commands: {windows?, ubuntu?}, code?, verify?, troubleshoot?, reference? }

  const dispatch = createEventDispatcher();

  let done = cardState?.completed || false;
  let showTroubleshoot = false;

  // OS tab reflects the user's saved preference; changing it persists to settings.
  let os = $userSettings.osPreference || 'windows';

  function setOs(next) {
    os = next;
    userSettings.update(s => ({ ...s, osPreference: next }));
  }

  $: hasWindows = !!data.commands?.windows;
  $: hasUbuntu = !!data.commands?.ubuntu;
  $: activeCommands = os === 'ubuntu' ? data.commands?.ubuntu : data.commands?.windows;

  function markDone() {
    done = true;
    dispatch('answer', { correct: true, verified: true });
  }
</script>

<Card type="build_step" status={done ? 'completed' : 'active'}>
  <div class="space-y-4 text-left">
    <!-- Goal -->
    <div>
      <div class="text-xs font-medium text-accent-green mb-1">DO THIS</div>
      <p class="text-text-primary font-medium leading-relaxed">{data.goal}</p>
    </div>

    <!-- Why -->
    {#if data.why}
      <p class="text-sm text-text-secondary italic border-l-2 border-accent-blue/30 pl-3">{data.why}</p>
    {/if}

    <!-- OS tabs + commands -->
    {#if hasWindows || hasUbuntu}
      <div>
        <div class="flex gap-2 mb-2">
          {#if hasWindows}
            <button
              class="os-tab {os === 'windows' ? 'os-tab-active' : ''}"
              on:click={() => setOs('windows')}
            >🪟 Windows</button>
          {/if}
          {#if hasUbuntu}
            <button
              class="os-tab {os === 'ubuntu' ? 'os-tab-active' : ''}"
              on:click={() => setOs('ubuntu')}
            >🐧 Ubuntu</button>
          {/if}
        </div>
        <div class="code-block relative overflow-x-auto text-sm">
          <pre class="leading-relaxed"><code>{activeCommands || '(no commands for this OS)'}</code></pre>
        </div>
      </div>
    {/if}

    <!-- Optional code to add to a file -->
    {#if data.code}
      <div>
        <div class="text-xs font-medium text-text-secondary mb-1">ADD THIS CODE</div>
        <div class="code-block relative overflow-x-auto text-sm">
          <pre class="leading-relaxed"><code>{data.code}</code></pre>
        </div>
      </div>
    {/if}

    <!-- Verify -->
    {#if data.verify}
      <div class="flex items-start gap-2 bg-accent-green/10 border border-accent-green/20 rounded-lg p-3">
        <span class="text-accent-green mt-0.5">✓</span>
        <div>
          <div class="text-xs font-medium text-accent-green mb-0.5">YOU'LL KNOW IT WORKED WHEN</div>
          <p class="text-sm text-text-primary whitespace-pre-line">{data.verify}</p>
        </div>
      </div>
    {/if}

    <!-- Troubleshoot (collapsible) -->
    {#if data.troubleshoot}
      <div>
        <button class="text-xs text-text-muted hover:text-text-primary underline"
          on:click={() => (showTroubleshoot = !showTroubleshoot)}>
          {showTroubleshoot ? 'Hide' : 'Stuck?'} troubleshooting
        </button>
        {#if showTroubleshoot}
          <p class="text-sm text-text-secondary mt-2 whitespace-pre-line">{data.troubleshoot}</p>
        {/if}
      </div>
    {/if}

    <!-- Reference back to theory -->
    {#if data.reference}
      <p class="text-xs text-text-muted">📖 {data.reference}</p>
    {/if}
  </div>

  <svelte:fragment slot="footer">
    {#if done}
      <div class="text-center text-accent-green text-sm font-medium">✓ Verified & done</div>
    {:else}
      <button class="btn-primary w-full" on:click={markDone}>✓ I did this and verified it</button>
    {/if}
  </svelte:fragment>
</Card>

<style>
  .os-tab {
    @apply text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-secondary
           border border-surface-3 transition-colors;
  }
  .os-tab-active {
    @apply bg-accent-blue/15 text-accent-blue border-accent-blue/40;
  }
</style>
