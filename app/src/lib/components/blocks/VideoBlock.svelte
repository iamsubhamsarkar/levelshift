<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { loadYouTubeApi } from '../../utils/youtube.js';

  export let block;
  export let state = {};   // { watchedPct, done, notes: [] }

  const dispatch = createEventDispatcher();

  let container;
  let player = null;
  let poll = null;
  let watchedPct = state.watchedPct || 0;
  let done = state.done === true;
  let duration = 0;
  let currentTime = 0;
  let notes = state.notes ? [...state.notes] : [];
  let noteText = '';
  const uid = `yt-${block.videoId}-${Math.random().toString(36).slice(2, 7)}`;

  const completeAt = block.completeAtPercent || 90;

  onMount(async () => {
    const YT = await loadYouTubeApi();
    if (!YT || !container) return;
    player = new YT.Player(uid, {
      host: 'https://www.youtube-nocookie.com',
      videoId: block.videoId,
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onStateChange: onState
      }
    });
  });

  function onState(e) {
    // 1 = playing → start polling watched time
    if (e.data === 1) {
      duration = player.getDuration() || 0;
      startPolling();
    } else {
      stopPolling();
    }
  }

  function startPolling() {
    stopPolling();
    poll = setInterval(() => {
      if (!player || !player.getCurrentTime) return;
      currentTime = player.getCurrentTime();
      duration = duration || player.getDuration() || 0;
      if (duration > 0) {
        const pct = Math.min(100, Math.round((currentTime / duration) * 100));
        if (pct > watchedPct) {
          watchedPct = pct;
          persist();
          if (!done && watchedPct >= completeAt) {
            done = true;
            dispatch('complete', { watchedPct });
          }
        }
      }
    }, 1500);
  }

  function stopPolling() {
    if (poll) { clearInterval(poll); poll = null; }
  }

  function persist() {
    dispatch('progress', { watchedPct, notes });
  }

  function addNote() {
    const t = Math.floor(currentTime || (player?.getCurrentTime?.() ?? 0));
    if (!noteText.trim()) return;
    notes = [...notes, { t, text: noteText.trim() }].sort((a, b) => a.t - b.t);
    noteText = '';
    persist();
  }

  function removeNote(i) {
    notes = notes.filter((_, idx) => idx !== i);
    persist();
  }

  function seekTo(t) {
    if (player && player.seekTo) { player.seekTo(t, true); player.playVideo?.(); }
  }

  function fmt(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onDestroy(() => {
    stopPolling();
    try { player?.destroy?.(); } catch {}
  });
</script>

<div class="space-y-3">
  {#if block.title}
    <p class="text-sm font-medium text-text-primary">{block.title}</p>
  {/if}

  <!-- Responsive 16:9 player -->
  <div class="relative w-full rounded-lg overflow-hidden bg-black" style="padding-top:56.25%">
    <div bind:this={container} class="absolute inset-0">
      <div id={uid} class="w-full h-full"></div>
    </div>
  </div>

  <!-- Watch progress -->
  <div class="space-y-1">
    <div class="flex items-center justify-between text-xs">
      <span class="text-text-muted">Watched</span>
      <span class="{done ? 'text-accent-green' : 'text-text-secondary'}">
        {watchedPct}% {done ? '· ✅ counts as done' : `· ${completeAt}% to complete`}
      </span>
    </div>
    <div class="h-1.5 rounded-full bg-surface-3 overflow-hidden">
      <div class="h-full bg-accent-blue transition-all" style="width:{watchedPct}%"></div>
    </div>
  </div>

  <!-- Timestamp notes -->
  <div class="space-y-2">
    <div class="flex gap-2">
      <input
        bind:value={noteText}
        placeholder="Add a note at current timestamp…"
        class="flex-1 bg-surface-0 border border-surface-3 rounded-lg p-2 text-xs text-text-primary
               focus:outline-none focus:border-accent-blue"
        on:keydown={(e) => e.key === 'Enter' && addNote()}
      />
      <button class="btn-secondary text-xs" on:click={addNote}>+ Note</button>
    </div>
    {#if notes.length > 0}
      <ul class="space-y-1">
        {#each notes as n, i}
          <li class="flex items-center gap-2 text-xs">
            <button class="text-accent-blue font-mono hover:underline" on:click={() => seekTo(n.t)}>{fmt(n.t)}</button>
            <span class="flex-1 text-text-secondary">{n.text}</span>
            <button class="text-text-muted hover:text-accent-red" on:click={() => removeNote(i)}>×</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
