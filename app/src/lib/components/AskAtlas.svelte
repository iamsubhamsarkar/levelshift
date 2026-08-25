<script>
  import { userSettings } from '../stores/progress.js';
  import { hasApiKey, askAtlas, describeCard } from '../utils/ai.js';

  /** The card currently on screen ({id, type, content}) or null for theory one-pager. */
  export let card = null;
  /** The full unit data ({title, phase, cards}) for extra context. */
  export let unitData = null;
  export let phase = null;

  let open = false;
  let question = '';
  let loading = false;
  let answer = '';
  let error = '';
  let inputEl;

  // Only show when the user has explicitly enabled AI AND stored a key.
  $: available = $userSettings.aiEnabled === true && hasApiKey();

  function buildUnitContext() {
    if (!unitData || !Array.isArray(unitData.cards)) return '';
    // Brief: list sibling card types + a one-line hint each, capped for tokens.
    return unitData.cards
      .slice(0, 14)
      .map((c, i) => {
        const d = describeCard(c).split('\n').slice(0, 2).join(' ');
        return `${i + 1}. [${c.type}] ${d.slice(0, 140)}`;
      })
      .join('\n');
  }

  async function ask() {
    if (loading) return;
    error = '';
    answer = '';
    loading = true;
    const ctx = {
      unitTitle: unitData?.title,
      phase: phase ?? unitData?.phase,
      cardContext: card ? describeCard(card) : (unitData ? buildUnitContext() : ''),
      unitContext: buildUnitContext()
    };
    const res = await askAtlas(question, ctx);
    loading = false;
    if (res.ok) {
      answer = res.text;
    } else {
      error = res.error || 'Something went wrong.';
    }
  }

  function togglePanel() {
    open = !open;
    if (open) {
      setTimeout(() => inputEl?.focus(), 50);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      ask();
    }
  }

  // Very small markdown-ish rendering: fenced code blocks + line breaks.
  function renderAnswer(text) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // ```code``` blocks
    return escaped.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="code-block my-2 whitespace-pre-wrap">${code.replace(/\n$/, '')}</pre>`
    ).replace(/\n/g, '<br/>');
  }
</script>

{#if available}
  <!-- Floating action button -->
  <button
    class="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full shadow-lg
           bg-accent-purple text-surface-0 px-4 py-3 font-semibold text-sm
           hover:brightness-110 active:scale-95 transition"
    on:click={togglePanel}
    aria-label="Ask Atlas AI tutor"
    title="Ask Atlas — AI tutor"
  >
    🛰️ <span class="hidden sm:inline">Ask Atlas</span>
  </button>

  {#if open}
    <!-- Backdrop -->
    <div class="fixed inset-0 z-40 bg-black/40" on:click={togglePanel} role="presentation"></div>

    <!-- Panel -->
    <div class="fixed z-50 bottom-0 right-0 left-0 sm:left-auto sm:bottom-5 sm:right-5
                sm:w-[420px] max-h-[85vh] flex flex-col
                bg-surface-1 border border-surface-3 sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-surface-3">
        <div class="flex items-center gap-2">
          <span class="text-lg">🛰️</span>
          <div>
            <p class="text-sm font-bold text-text-primary">Ask Atlas</p>
            <p class="text-[10px] text-text-muted">AI tutor · knows this card · uses your Gemini key</p>
          </div>
        </div>
        <button class="text-text-muted hover:text-text-primary text-xl leading-none" on:click={togglePanel}>×</button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {#if !answer && !loading && !error}
          <p class="text-xs text-text-muted">
            Stuck on this card? Ask anything — a hint, a simpler explanation, "why is this wrong?",
            or a follow-up. Atlas can see the current card's content.
          </p>
        {/if}

        {#if loading}
          <div class="text-sm text-text-secondary animate-pulse">🛰️ Atlas is thinking…</div>
        {/if}

        {#if error}
          <div class="text-sm text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-3">
            {error}
          </div>
        {/if}

        {#if answer}
          <div class="text-sm text-text-primary leading-relaxed">
            {@html renderAnswer(answer)}
          </div>
        {/if}
      </div>

      <!-- Input -->
      <div class="border-t border-surface-3 p-3 space-y-2">
        <textarea
          bind:this={inputEl}
          bind:value={question}
          on:keydown={handleKey}
          rows="2"
          placeholder="Ask about this card…  (Ctrl/⌘ + Enter to send)"
          class="w-full bg-surface-0 border border-surface-3 rounded-lg p-2.5 text-sm
                 text-text-primary resize-none focus:outline-none focus:border-accent-blue"
        ></textarea>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-text-muted">Uses your free Gemini quota</span>
          <button class="btn-primary text-sm px-4 py-1.5" on:click={ask} disabled={loading}>
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}
