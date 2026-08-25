<script>
  import { canInstall, promptInstall, dismissInstall } from '../utils/pwa.js';

  async function install() {
    await promptInstall();
  }
</script>

{#if $canInstall}
  <div class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40
              bg-surface-1 border border-surface-3 rounded-xl shadow-2xl p-4 animate-slide-up">
    <div class="flex items-start gap-3">
      <span class="text-2xl">📲</span>
      <div class="flex-1">
        <p class="text-sm font-semibold text-text-primary">Install LevelShift</p>
        <p class="text-xs text-text-muted mt-0.5">
          Add it to your home screen for one-tap access and offline study.
        </p>
        <div class="flex gap-2 mt-3">
          <button class="btn-primary text-xs px-3 py-1.5" on:click={install}>Install</button>
          <button class="btn-secondary text-xs px-3 py-1.5" on:click={dismissInstall}>Not now</button>
        </div>
      </div>
    </div>
  </div>
{/if}
