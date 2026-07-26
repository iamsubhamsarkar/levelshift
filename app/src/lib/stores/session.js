/**
 * LevelShift — Session Store
 * Ephemeral state for the current learning session (not persisted).
 */

import { writable, derived } from 'svelte/store';

/** Current session state */
export const session = writable({
  active: false,
  mode: null,           // 'full' | 'normal' | 'tired'
  startTime: null,
  unitId: null,
  phaseId: null,
  cards: [],            // loaded card data for current unit
  currentCardIndex: 0,
  highestUnlocked: 0,   // highest card index user can navigate to
  answers: [],          // user's answers for this session
  cardStates: {},       // per-card state: { cardId: { completed, answer, ... } }
  xpEarned: 0,
  conceptsReinforced: [] // concepts touched during session
});

/** Is a session currently in progress? */
export const isSessionActive = derived(session, ($s) => $s.active);

/** Current card data */
export const currentCard = derived(session, ($s) => {
  if (!$s.cards || $s.cards.length === 0) return null;
  return $s.cards[$s.currentCardIndex] || null;
});

/** Session progress (e.g., "5 of 8") */
export const sessionProgress = derived(session, ($s) => ({
  current: $s.currentCardIndex + 1,
  total: $s.cards.length,
  highestUnlocked: $s.highestUnlocked,
  percentage: $s.cards.length > 0
    ? Math.round((($s.currentCardIndex + 1) / $s.cards.length) * 100)
    : 0
}));

/** Whether the current card has been completed */
export const isCurrentCardCompleted = derived(session, ($s) => {
  const card = $s.cards[$s.currentCardIndex];
  if (!card) return false;
  return !!$s.cardStates[card.id]?.completed;
});

/** Get saved state for current card */
export const currentCardState = derived(session, ($s) => {
  const card = $s.cards[$s.currentCardIndex];
  if (!card) return null;
  return $s.cardStates[card.id] || null;
});

// ─── Session Actions ──────────────────────────────────────────────────────────

/** Start a new learning session. */
export function startSession(unitId, phaseId, cards, mode = 'normal') {
  session.set({
    active: true,
    mode,
    startTime: Date.now(),
    unitId,
    phaseId,
    cards,
    currentCardIndex: 0,
    highestUnlocked: 0,
    answers: [],
    cardStates: {},
    xpEarned: 0,
    conceptsReinforced: []
  });
}

/** 
 * Advance to next card. Only allowed if current card is completed
 * or we're moving to an already-unlocked card.
 * @returns {boolean} Whether navigation succeeded
 */
export function nextCard() {
  let moved = false;
  session.update(s => {
    const nextIdx = s.currentCardIndex + 1;
    if (nextIdx >= s.cards.length) return s;
    
    // Can only go forward if current card is completed OR next card is already unlocked
    if (nextIdx <= s.highestUnlocked) {
      s.currentCardIndex = nextIdx;
      moved = true;
    }
    return s;
  });
  return moved;
}

/** Go back to previous card (always allowed). */
export function prevCard() {
  session.update(s => {
    if (s.currentCardIndex > 0) {
      s.currentCardIndex -= 1;
    }
    return s;
  });
}

/** Navigate to a specific card index (only if unlocked). */
export function goToCard(index) {
  session.update(s => {
    if (index >= 0 && index <= s.highestUnlocked && index < s.cards.length) {
      s.currentCardIndex = index;
    }
    return s;
  });
}

/** 
 * Mark the current card as completed and unlock the next one.
 * Call this when a card's interaction is finished (answer submitted, content viewed, etc.)
 */
export function completeCard(cardId, state = {}) {
  session.update(s => {
    // Save card state
    s.cardStates[cardId] = {
      ...s.cardStates[cardId],
      ...state,
      completed: true,
      completedAt: Date.now()
    };
    
    // Unlock next card
    const cardIdx = s.cards.findIndex(c => c.id === cardId);
    if (cardIdx >= 0 && cardIdx >= s.highestUnlocked) {
      s.highestUnlocked = cardIdx + 1;
    }
    
    return s;
  });
}

/** Save card state without marking as complete (e.g., partial input). */
export function saveCardState(cardId, state) {
  session.update(s => {
    s.cardStates[cardId] = {
      ...s.cardStates[cardId],
      ...state
    };
    return s;
  });
}

/** Record an answer for the current card. */
export function recordAnswer(cardId, answer, correct, timeSpent) {
  session.update(s => {
    // Avoid duplicate answers for same card
    if (!s.answers.find(a => a.cardId === cardId)) {
      s.answers.push({ cardId, answer, correct, timeSpent, timestamp: Date.now() });
      if (correct) {
        s.xpEarned += 10;
      }
    }
    return s;
  });
}

/** Add a concept reinforcement to current session. */
export function reinforceConcept(conceptId) {
  session.update(s => {
    if (!s.conceptsReinforced.includes(conceptId)) {
      s.conceptsReinforced.push(conceptId);
    }
    return s;
  });
}

/** End the current session. Returns session summary. */
export function endSession() {
  let summary;
  session.update(s => {
    summary = {
      unitId: s.unitId,
      mode: s.mode,
      duration: Math.round((Date.now() - s.startTime) / 1000 / 60), // minutes
      totalCards: s.cards.length,
      correctAnswers: s.answers.filter(a => a.correct).length,
      xpEarned: s.xpEarned,
      conceptsReinforced: s.conceptsReinforced
    };
    return { ...s, active: false };
  });
  return summary;
}
