<script>
  import { createEventDispatcher } from 'svelte';

  export let unitData = null;
  export let phaseTitle = '';

  const dispatch = createEventDispatcher();

  // The last card in a theory unit is the "Check Your Understanding" section.
  $: sections = unitData?.cards?.map(c => c.content) || [];
  $: isCheckSection = (s) => (s.heading || '').toLowerCase().startsWith('check your understanding');

  function markRead() {
    dispatch('complete');
  }

  function exit() {
    dispatch('exit');
  }
</script>

<div class="theory-page min-h-screen bg-surface-0">
  <!-- Top bar -->
  <div class="sticky top-0 z-10 bg-surface-0/90 backdrop-blur border-b border-surface-3">
    <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
      <button class="text-text-muted hover:text-text-primary" on:click={exit}>← Back</button>
      <span class="text-xs text-text-muted uppercase tracking-wide">{phaseTitle} · Theory</span>
    </div>
  </div>

  <div class="max-w-3xl mx-auto px-4 py-8 space-y-8">
    <!-- Chapter title -->
    <header class="text-center space-y-2">
      <div class="text-4xl">📖</div>
      <h1 class="text-2xl font-bold text-text-primary">{unitData?.title}</h1>
      <p class="text-sm text-text-muted">Read the chapter, then mark it read at the bottom.</p>
    </header>

    <!-- Sections -->
    {#each sections as s}
      <section
        class="section-block rounded-xl p-5 border"
        class:check-block={isCheckSection(s)}
      >
        {#if s.heading}
          <h2 class="section-heading" class:check-heading={isCheckSection(s)}>
            {#if isCheckSection(s)}✅ {/if}{s.heading}
          </h2>
        {/if}

        {#if s.body}
          <div class="section-body whitespace-pre-line">{s.body}</div>
        {/if}

        {#if s.snippet}
          <div class="snippet-block">
            <pre><code>{s.snippet}</code></pre>
          </div>
        {/if}

        {#if s.snippetExplanation}
          <div class="explain-box">
            <span class="explain-arrow">→</span>
            <p class="whitespace-pre-line">{s.snippetExplanation}</p>
          </div>
        {/if}

        {#if s.callout}
          <p class="callout-box">{s.callout}</p>
        {/if}
      </section>
    {/each}

    <!-- Completion -->
    <div class="text-center pt-2 pb-12">
      <button class="btn-primary px-8 py-3 text-base" on:click={markRead}>
        ✓ Mark chapter as read
      </button>
      <p class="text-xs text-text-muted mt-3">Marks the chapter complete and keeps your streak going.</p>
    </div>
  </div>
</div>

<style>
  .section-block {
    background: linear-gradient(180deg, rgba(88,166,255,0.05), rgba(88,166,255,0.01));
    border-color: rgba(88,166,255,0.18);
  }
  .section-block.check-block {
    background: linear-gradient(180deg, rgba(63,185,80,0.07), rgba(63,185,80,0.02));
    border-color: rgba(63,185,80,0.25);
  }
  .section-heading {
    @apply text-lg font-semibold mb-3 leading-snug;
    color: #58a6ff;
  }
  .section-heading.check-heading {
    color: #3fb950;
  }
  .section-body {
    @apply text-text-primary leading-relaxed;
    font-size: 0.97rem;
  }
  .snippet-block {
    @apply mt-4 rounded-lg overflow-x-auto;
    background: #0d1117;
    border: 1px solid #2d333b;
    padding: 0.9rem 1rem;
  }
  .snippet-block pre { margin: 0; }
  .snippet-block code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.82rem;
    color: #adbac7;
    white-space: pre;
  }
  .explain-box {
    @apply mt-4 flex items-start gap-2 rounded-lg p-3;
    background: rgba(88,166,255,0.10);
    border: 1px solid rgba(88,166,255,0.22);
  }
  .explain-arrow { color: #58a6ff; margin-top: 2px; }
  .explain-box p { @apply text-sm text-text-primary; }
  .callout-box {
    @apply mt-4 text-sm italic pl-3 py-1;
    color: #d2a8ff;
    border-left: 3px solid rgba(188,140,255,0.5);
  }
</style>
