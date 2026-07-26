<script>
  import { onMount } from 'svelte';
  import Card from './Card.svelte';
  import { concepts, recordActivity, persistAll } from '../stores/progress.js';
  import { generateDailyPuzzle } from '../engines/dependency.js';
  import { calculateNextReview, labelToRating } from '../engines/spaced-rep.js';
  import conceptsData from '../data/concepts.json';

  export let navigate;

  let puzzle = null;
  let userAnswer = '';
  let submitted = false;
  let selfRating = null;

  onMount(() => {
    puzzle = generateDailyPuzzle($concepts, []);
    if (!puzzle) {
      // No weak concepts — generate a random one from learned concepts
      const learned = Object.keys($concepts).filter(id => $concepts[id].strength > 0);
      if (learned.length > 0) {
        const randomId = learned[Math.floor(Math.random() * learned.length)];
        puzzle = {
          type: 'daily_puzzle',
          targetConcept: randomId,
          strength: $concepts[randomId].strength || 50,
          disguise: '🧩 Quick Challenge'
        };
      }
    }
  });

  function handleSubmit() {
    if (!userAnswer.trim()) return;
    submitted = true;
  }

  function handleRate(rating) {
    selfRating = rating;

    // Update concept strength
    if (puzzle?.targetConcept) {
      const smRating = labelToRating(rating);
      concepts.update(c => {
        if (c[puzzle.targetConcept]) {
          const updated = calculateNextReview(c[puzzle.targetConcept], smRating);
          c[puzzle.targetConcept] = { ...c[puzzle.targetConcept], ...updated };
        }
        return c;
      });
    }

    // Record as tired-day activity
    recordActivity('tired', 0, 5);
    persistAll();
  }

  function getConceptLabel(id) {
    return id ? id.replace(/\./g, ' › ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';
  }
</script>

<div class="min-h-screen bg-surface-0 flex items-center justify-center p-4">
  <div class="max-w-lg w-full space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <button class="text-text-muted hover:text-text-secondary text-sm" on:click={() => navigate('dashboard')}>
        ← Dashboard
      </button>
      <span class="text-xs bg-accent-yellow/10 text-accent-yellow px-2 py-1 rounded-full">
        😴 Tired Mode — 5 min
      </span>
    </div>

    {#if !puzzle}
      <div class="card text-center">
        <p class="text-text-primary">No challenges available yet.</p>
        <p class="text-sm text-text-muted mt-2">Complete at least one unit first!</p>
        <button class="btn-primary mt-4" on:click={() => navigate('learn')}>Start Learning →</button>
      </div>
    {:else if selfRating}
      <!-- Done -->
      <div class="card text-center space-y-4 animate-fade-in">
        <div class="text-3xl">✅</div>
        <h2 class="text-lg font-semibold text-text-primary">Challenge Complete!</h2>
        <p class="text-sm text-text-secondary">Streak protected. Decay prevented.</p>
        <button class="btn-primary" on:click={() => navigate('dashboard')}>Back to Dashboard</button>
      </div>
    {:else}
      <!-- Challenge card -->
      <div class="card space-y-5">
        <div class="flex items-center gap-2">
          <span class="text-lg">{puzzle.disguise?.split(' ')[0] || '🧩'}</span>
          <span class="text-sm font-medium text-text-secondary">{puzzle.disguise || 'Quick Challenge'}</span>
        </div>

        <div class="bg-surface-0 border border-surface-3 rounded-lg p-4">
          <p class="text-xs text-text-muted mb-2">Topic: {getConceptLabel(puzzle.targetConcept)}</p>
          <p class="text-text-primary font-medium">
            Explain this concept as if in an interview. What is it? Why does it matter? Give a one-line example.
          </p>
        </div>

        {#if !submitted}
          <textarea
            bind:value={userAnswer}
            class="w-full h-28 bg-surface-0 border border-surface-3 rounded-lg p-4 
                   text-sm text-text-primary resize-none
                   focus:outline-none focus:border-accent-blue transition-colors"
            placeholder="Type your explanation..."
          ></textarea>
          <button 
            class="btn-primary w-full"
            on:click={handleSubmit}
            disabled={!userAnswer.trim()}
          >
            Done — How did I do?
          </button>
        {:else}
          <!-- Self-rating -->
          <div class="bg-surface-2 rounded-lg p-3 text-sm text-text-secondary italic">
            "{userAnswer}"
          </div>
          <div class="space-y-2">
            <p class="text-xs text-text-muted text-center">Rate your answer honestly:</p>
            <div class="grid grid-cols-4 gap-2">
              <button class="btn-danger text-xs py-2" on:click={() => handleRate('forgot')}>Blanked</button>
              <button class="btn-secondary text-xs py-2" on:click={() => handleRate('hard')}>Vague</button>
              <button class="btn-secondary text-xs py-2 border-accent-green/30" on:click={() => handleRate('good')}>Decent</button>
              <button class="btn-primary text-xs py-2 bg-accent-green" on:click={() => handleRate('easy')}>Perfect</button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
