<script>
  import { createEventDispatcher } from 'svelte';
  import Card from './Card.svelte';

  export let data = {};
  export let cardState = null;
  /**
   * data formats:
   * 
   * fill_blank mode:
   *   { mode: 'fill_blank', prompt, sentence, blanks: string[], distractors: string[] }
   *   sentence has _____ where blanks go
   *   blanks = correct answers in order, distractors = wrong options
   * 
   * pick_best mode:
   *   { mode: 'pick_best', prompt, options: string[], correct: number }
   * 
   * Legacy mode (no mode field — old format):
   *   { prompt, modelAnswer }
   */

  const dispatch = createEventDispatcher();

  // Determine card mode
  $: mode = data.mode || 'legacy';

  // ─── Fill-in-the-Blank State ─────────────────────────────────────────────
  let blankSlots = [];   // User's selections for each blank
  let chipPool = [];     // Available chips to pick from
  let fillRevealed = cardState?.completed || false;
  let fillCorrect = cardState?.correct || false;

  // ─── Pick Best State ─────────────────────────────────────────────────────
  let pickSelected = cardState?.answer?.selected ?? null;
  let pickRevealed = cardState?.completed || false;

  // ─── Legacy State ────────────────────────────────────────────────────────
  let userAnswer = cardState?.userAnswer || '';
  let legacySubmitted = cardState?.completed || false;
  let selfRating = cardState?.rating || null;

  // ─── Overall ─────────────────────────────────────────────────────────────
  let status = cardState?.completed ? (cardState?.correct !== false ? 'correct' : 'wrong') : 'active';

  // Initialize fill_blank mode
  $: if (mode === 'fill_blank' && !fillRevealed) {
    const numBlanks = (data.blanks || []).length;
    if (blankSlots.length === 0) blankSlots = Array(numBlanks).fill(null);
    if (chipPool.length === 0) {
      // Shuffle blanks + distractors together
      chipPool = shuffle([...(data.blanks || []), ...(data.distractors || [])]);
    }
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ─── Fill Blank Actions ──────────────────────────────────────────────────

  function selectChip(chip) {
    if (fillRevealed) return;
    // Find first empty slot
    const emptyIdx = blankSlots.indexOf(null);
    if (emptyIdx === -1) return;
    blankSlots[emptyIdx] = chip;
    blankSlots = blankSlots; // trigger reactivity
  }

  function removeFromSlot(index) {
    if (fillRevealed) return;
    blankSlots[index] = null;
    blankSlots = blankSlots;
  }

  function checkFillBlanks() {
    fillRevealed = true;
    const correct = blankSlots.every((slot, i) => slot === data.blanks[i]);
    fillCorrect = correct;
    status = correct ? 'correct' : 'wrong';
    dispatch('answer', { 
      correct, 
      selected: blankSlots, 
      cardLocalState: { blankSlots, fillRevealed, fillCorrect }
    });
  }

  $: allBlanksFilled = mode === 'fill_blank' && blankSlots.every(s => s !== null);
  $: usedChips = new Set(blankSlots.filter(s => s !== null));

  // ─── Pick Best Actions ───────────────────────────────────────────────────

  function selectPickOption(index) {
    if (pickRevealed) return;
    pickSelected = index;
    pickRevealed = true;
    const correct = index === data.correct;
    status = correct ? 'correct' : 'wrong';
    dispatch('answer', { 
      correct, 
      selected: index,
      cardLocalState: { pickSelected, pickRevealed }
    });
  }

  // ─── Legacy Actions ──────────────────────────────────────────────────────

  function handleLegacySubmit() {
    if (!userAnswer.trim()) return;
    legacySubmitted = true;
    status = 'correct';
    dispatch('answer', { userAnswer, correct: true });
  }

  function handleRating(rating) {
    selfRating = rating;
    dispatch('rating', { rating, userAnswer });
  }

  // ─── Split sentence for fill_blank rendering ─────────────────────────────
  $: sentenceParts = mode === 'fill_blank' ? (data.sentence || '').split('_____') : [];
</script>

<Card type="explain_back" {status}>
  <div class="space-y-4">
    <!-- Prompt header -->
    <div class="bg-surface-2 border border-surface-3 rounded-lg p-3">
      <p class="text-[10px] text-text-muted uppercase tracking-wider mb-1">
        {#if mode === 'fill_blank'}🧩 FILL THE BLANKS{:else if mode === 'pick_best'}🎯 PICK THE BEST ANSWER{:else}🎤 INTERVIEW QUESTION{/if}
      </p>
      <p class="text-text-primary font-medium text-sm">{data.prompt}</p>
    </div>

    <!-- ═══════════════ FILL IN THE BLANKS ═══════════════ -->
    {#if mode === 'fill_blank'}
      
      <!-- Sentence with blank slots -->
      <div class="bg-surface-0 border border-surface-3 rounded-lg p-4 text-sm leading-relaxed">
        {#each sentenceParts as part, i}
          <span class="text-text-secondary">{part}</span>
          {#if i < sentenceParts.length - 1}
            {#if blankSlots[i]}
              <button 
                class="inline-flex items-center px-2 py-0.5 mx-1 rounded text-xs font-mono font-semibold transition-all
                  {fillRevealed && blankSlots[i] === data.blanks[i] ? 'bg-accent-green/20 text-accent-green border border-accent-green/40' : ''}
                  {fillRevealed && blankSlots[i] !== data.blanks[i] ? 'bg-accent-red/20 text-accent-red border border-accent-red/40 line-through' : ''}
                  {!fillRevealed ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40 hover:bg-accent-blue/30 cursor-pointer' : ''}"
                on:click={() => removeFromSlot(i)}
                disabled={fillRevealed}
              >
                {blankSlots[i]}
                {#if !fillRevealed}<span class="ml-1 opacity-50">×</span>{/if}
              </button>
            {:else}
              <span class="inline-block w-24 h-6 mx-1 border-b-2 border-dashed border-text-muted align-middle"></span>
            {/if}
          {/if}
        {/each}
      </div>

      <!-- Correct answers (shown after reveal if wrong) -->
      {#if fillRevealed && !fillCorrect}
        <div class="text-xs text-accent-green bg-accent-green/5 border border-accent-green/20 rounded-lg p-3">
          ✅ Correct: {data.blanks.join(' → ')}
        </div>
      {/if}

      <!-- Chip pool -->
      {#if !fillRevealed}
        <div class="flex flex-wrap gap-2">
          {#each chipPool as chip}
            <button
              class="px-3 py-1.5 text-xs font-mono rounded-lg transition-all
                {usedChips.has(chip) ? 'bg-surface-2 text-text-muted opacity-40 cursor-not-allowed' : 'bg-surface-1 border border-surface-3 text-text-primary hover:border-accent-blue hover:text-accent-blue cursor-pointer'}"
              on:click={() => selectChip(chip)}
              disabled={usedChips.has(chip)}
            >
              {chip}
            </button>
          {/each}
        </div>

        <!-- Submit button -->
        <button 
          class="btn-primary text-sm w-full"
          disabled={!allBlanksFilled}
          on:click={checkFillBlanks}
        >
          Check →
        </button>
      {/if}

    <!-- ═══════════════ PICK BEST ANSWER ═══════════════ -->
    {:else if mode === 'pick_best'}

      <div class="space-y-2">
        {#each data.options as option, i}
          <button
            class="w-full text-left px-4 py-3 rounded-lg border text-sm transition-all
              {pickRevealed && i === data.correct ? 'bg-accent-green/10 border-accent-green/40 text-accent-green' : ''}
              {pickRevealed && i === pickSelected && i !== data.correct ? 'bg-accent-red/10 border-accent-red/40 text-accent-red' : ''}
              {pickRevealed && i !== pickSelected && i !== data.correct ? 'bg-surface-1 border-surface-3 text-text-muted opacity-50' : ''}
              {!pickRevealed ? 'bg-surface-1 border-surface-3 text-text-primary hover:border-accent-blue hover:bg-accent-blue/5 cursor-pointer' : ''}"
            on:click={() => selectPickOption(i)}
            disabled={pickRevealed}
          >
            <span class="inline-flex items-center gap-2">
              <span class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0
                {pickRevealed && i === data.correct ? 'border-accent-green bg-accent-green/20' : ''}
                {pickRevealed && i === pickSelected && i !== data.correct ? 'border-accent-red bg-accent-red/20' : ''}
                {!pickRevealed ? 'border-surface-3' : ''}">
                {#if pickRevealed && i === data.correct}✓{:else if pickRevealed && i === pickSelected && i !== data.correct}✗{:else}{String.fromCharCode(65 + i)}{/if}
              </span>
              <span>{option}</span>
            </span>
          </button>
        {/each}
      </div>

    <!-- ═══════════════ LEGACY (typing) ═══════════════ -->
    {:else}

      {#if !legacySubmitted}
        <div>
          <textarea
            bind:value={userAnswer}
            class="w-full h-24 bg-surface-0 border border-surface-3 rounded-lg p-3 
                   text-sm text-text-primary resize-none
                   focus:outline-none focus:border-accent-blue transition-colors"
            placeholder="2-3 sentences max..."
          ></textarea>
          <button 
            class="btn-primary text-sm mt-2 w-full"
            on:click={handleLegacySubmit}
            disabled={!userAnswer.trim()}
          >
            Show Model Answer
          </button>
        </div>
      {:else}
        <div class="bg-accent-green/5 border border-accent-green/20 rounded-lg p-3">
          <p class="text-xs text-accent-green mb-1 font-semibold">MODEL ANSWER:</p>
          <p class="text-sm text-text-primary">{data.modelAnswer}</p>
        </div>

        {#if selfRating === null}
          <div class="flex justify-center gap-2">
            <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-red/10 text-accent-red border border-accent-red/30" on:click={() => handleRating('forgot')}>Missed</button>
            <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30" on:click={() => handleRating('hard')}>Partial</button>
            <button class="px-3 py-1.5 text-xs rounded-lg bg-accent-green/10 text-accent-green border border-accent-green/30" on:click={() => handleRating('good')}>Got it</button>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</Card>
