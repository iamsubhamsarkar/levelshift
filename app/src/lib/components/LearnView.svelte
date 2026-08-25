<script>
  import { onMount } from 'svelte';
  import CardDeck from './CardDeck.svelte';
  import CardRenderer from './CardRenderer.svelte';
  import TheoryPage from './TheoryPage.svelte';
  import GhostReplay from './GhostReplay.svelte';
  import AskAtlas from './AskAtlas.svelte';
  import { session, currentCard, sessionProgress, startSession, nextCard, prevCard, endSession, recordAnswer, completeCard } from '../stores/session.js';
  import { progress, completeUnit, recordActivity, updateConceptStrength, ghostRecords, persistAll } from '../stores/progress.js';
  import { calculateNextReview, labelToRating } from '../engines/spaced-rep.js';
  import { getReinforcedConcepts, getReinforcementBoost } from '../engines/dependency.js';
  import { processSessionComplete } from '../engines/gamification.js';
  import phasesData from '../data/phases.json';

  export let navigate;

  let unitData = null;
  let loading = true;
  let sessionComplete = false;
  let summary = null;
  let ghostCurrent = null;
  let ghostBest = null;

  onMount(async () => {
    await loadCurrentUnit();
  });

  async function loadCurrentUnit() {
    loading = true;
    const phaseIdx = $progress.currentPhase - 1;
    const unitIdx = $progress.currentUnit - 1;
    const phase = phasesData.phases[phaseIdx];
    
    if (!phase || !phase.units[unitIdx]) {
      loading = false;
      return;
    }

    const unit = phase.units[unitIdx];

    try {
      // Try to load pre-built JSON
      const module = await import(`../data/cards/phase${$progress.currentPhase}/${unit.id}.json`);
      unitData = module.default || module;
    } catch (e) {
      // Fallback: create placeholder cards
      console.warn(`Unit data not found for ${unit.id}, using placeholder`);
      unitData = {
        unitId: unit.id,
        title: unit.title,
        cards: [
          { id: `${unit.id}_c1`, type: 'hook', content: { question: `Welcome to: ${unit.title}`, code: null } },
          { id: `${unit.id}_c2`, type: 'analogy', content: { text: `Content for "${unit.title}" is being authored. Check back soon!` } }
        ]
      };
    }

    // Start session
    startSession(unit.id, phase.id, unitData.cards, $progress.dailyMode || 'normal');
    loading = false;
  }

  function handleNext() {
    if ($sessionProgress.current >= $sessionProgress.total) {
      completeCurrentSession();
    } else {
      nextCard();
    }
  }

  function handlePrev() {
    prevCard();
  }

  function handleExit() {
    navigate('dashboard');
  }

  function handleAnswer(event) {
    const { cardId, correct, cardLocalState } = event.detail;
    recordAnswer(cardId, event.detail, correct, 0);

    // Mark card as completed so next card unlocks
    // Include any local state the card component wants to persist
    completeCard(cardId, { correct, answer: event.detail, ...(cardLocalState || {}) });

    // Silent reinforcement of prerequisite concepts
    if (unitData?.teaches) {
      const reinforced = getReinforcedConcepts(unitData.unitId);
      reinforced.forEach(conceptId => {
        updateConceptStrength(conceptId, correct ? 4 : 2);
      });
    }
  }

  function handleRating(event) {
    const { rating } = event.detail;
    const smRating = labelToRating(rating);
    const cardId = $currentCard?.id;

    // Mark card as completed
    if (cardId) {
      completeCard(cardId, { rating, selfRated: true });
    }

    if (unitData?.teaches) {
      unitData.teaches.forEach(conceptId => {
        updateConceptStrength(conceptId, smRating);
      });
    }
  }

  /** Handle cards that don't have interactive elements (hook, analogy, code, connect) */
  function handleSkip(event) {
    const cardId = event?.detail?.cardId || $currentCard?.id;
    if (cardId) {
      completeCard(cardId, { skipped: true });
    }
  }

  function completeCurrentSession() {
    summary = endSession();
    sessionComplete = true;

    // Mark unit complete + record activity
    const phaseIdx = $progress.currentPhase - 1;
    const unitIdx = $progress.currentUnit - 1;
    const phase = phasesData.phases[phaseIdx];
    const unit = phase?.units[unitIdx];

    if (unit) {
      completeUnit(unit.id, summary.xpEarned + 50); // 50 bonus for unit completion

      // Ghost replay: compare and record
      const currentPerf = { time: summary.duration, score: summary.correctAnswers };
      ghostCurrent = currentPerf;

      let existingBest = null;
      const unsub = ghostRecords.subscribe(gr => { existingBest = gr[unit.id] || null; });
      unsub();
      ghostBest = existingBest;

      // Update personal best if this session is better
      if (!existingBest || 
          (currentPerf.score >= existingBest.bestScore && currentPerf.time <= existingBest.bestTime) ||
          (currentPerf.score > existingBest.bestScore)) {
        ghostRecords.update(gr => {
          gr[unit.id] = {
            bestTime: currentPerf.time,
            bestScore: currentPerf.score,
            date: new Date().toISOString().split('T')[0]
          };
          return gr;
        });
      }
    }

    recordActivity(summary.mode, 1, summary.duration);

    // Process gamification (streak milestones, timeline recalc)
    const milestone = processSessionComplete(summary);
    if (milestone) {
      summary.milestone = milestone;
    }

    persistAll();
  }

  function handleContinue() {
    sessionComplete = false;
    summary = null;
    ghostCurrent = null;
    ghostBest = null;
    loadCurrentUnit(); // Load next unit
  }

  // A theory unit (Phase 9): all cards are 'theory' → render as a one-pager.
  $: isTheoryUnit = !!unitData
    && Array.isArray(unitData.cards)
    && unitData.cards.length > 0
    && unitData.cards.every(c => c.type === 'theory');

  /** One-pager "Mark chapter as read": complete all cards, then finish the unit. */
  function handleTheoryComplete() {
    if (unitData?.cards) {
      unitData.cards.forEach(c => completeCard(c.id, { read: true }));
    }
    if (unitData?.teaches) {
      unitData.teaches.forEach(conceptId => updateConceptStrength(conceptId, 4));
    }
    completeCurrentSession();
  }
</script>

{#if loading}
  <div class="min-h-screen bg-surface-0 flex items-center justify-center">
    <div class="text-text-muted animate-pulse">Loading...</div>
  </div>
{:else if sessionComplete && summary}
  <!-- Session Complete Screen -->
  <div class="min-h-screen bg-surface-0 flex items-center justify-center p-4">
    <div class="card max-w-md w-full text-center space-y-6 animate-fade-in">
      <div class="text-4xl">🎉</div>
      <h2 class="text-xl font-bold text-text-primary">Unit Complete!</h2>
      
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-accent-green">{summary.correctAnswers}</p>
          <p class="text-xs text-text-muted">Correct</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-accent-blue">+{summary.xpEarned + 50}</p>
          <p class="text-xs text-text-muted">XP Earned</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-accent-purple">{summary.duration}m</p>
          <p class="text-xs text-text-muted">Time</p>
        </div>
      </div>

      <!-- Ghost Replay Comparison -->
      {#if ghostCurrent && ghostBest}
        <GhostReplay current={ghostCurrent} best={ghostBest} />
      {/if}

      <div class="space-y-2">
        <button class="btn-primary w-full" on:click={handleContinue}>
          Next Unit →
        </button>
        <button class="btn-secondary w-full" on:click={() => navigate('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
{:else if unitData}
  {#if isTheoryUnit}
    <!-- Phase 9: theory chapter as a colorful one-pager -->
    <TheoryPage
      {unitData}
      phaseTitle={`Phase ${$progress.currentPhase}`}
      on:complete={handleTheoryComplete}
      on:exit={handleExit}
    />
    <AskAtlas card={null} {unitData} phase={$progress.currentPhase} />
  {:else}
    <!-- Active Learning Session (card deck) -->
    <CardDeck
      unitTitle={unitData.title}
      phaseTitle={`Phase ${$progress.currentPhase}`}
      on:next={handleNext}
      on:prev={handlePrev}
      on:exit={handleExit}
    >
      {#key $currentCard?.id}
        <CardRenderer 
          card={$currentCard} 
          on:answer={handleAnswer}
          on:rating={handleRating}
          on:skip={handleNext}
        />
      {/key}
    </CardDeck>
    <AskAtlas card={$currentCard} {unitData} phase={$progress.currentPhase} />
  {/if}
{:else}
  <div class="min-h-screen bg-surface-0 flex items-center justify-center">
    <div class="card text-center">
      <h2 class="text-xl font-semibold text-accent-green mb-2">🎓 All Done!</h2>
      <p class="text-text-secondary">You've completed all available units.</p>
      <button class="btn-primary mt-4" on:click={() => navigate('dashboard')}>Dashboard</button>
    </div>
  </div>
{/if}
