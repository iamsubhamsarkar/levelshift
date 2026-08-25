<script>
  import { createEventDispatcher } from 'svelte';
  import TextBlock from './blocks/TextBlock.svelte';
  import VideoBlock from './blocks/VideoBlock.svelte';
  import PracticeBlock from './blocks/PracticeBlock.svelte';
  import QuizBlock from './blocks/QuizBlock.svelte';
  import { courseProgress, setBlockState, completeTopic } from '../stores/courses.js';
  import { recordActivity } from '../stores/progress.js';

  export let course;
  export let topic;

  const dispatch = createEventDispatcher();

  // Blocks that require an interaction to be "done".
  const INTERACTIVE = new Set(['video', 'practice', 'quiz']);

  $: progress = $courseProgress[course.id] || {};
  $: blockState = progress.blockState || {};
  $: alreadyComplete = (progress.completedTopics || []).includes(topic.id);

  function keyFor(i) { return `${topic.id}:${i}`; }
  function stateFor(i) { return blockState[keyFor(i)] || {}; }

  // A topic is complete when every INTERACTIVE block is done. (Text-only topics
  // are completable via the button immediately.)
  $: requiredIndexes = topic.blocks
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => INTERACTIVE.has(b.type))
    .map(({ i }) => i);

  $: allDone = requiredIndexes.every((i) => stateFor(i).done === true);

  function onBlockComplete(i) {
    setBlockState(course.id, topic.id, i, { done: true });
  }
  function onBlockProgress(i, detail) {
    setBlockState(course.id, topic.id, i, detail);
  }
  function onPracticeComplete(i, detail) {
    setBlockState(course.id, topic.id, i, { done: true, code: detail.code });
  }
  function onQuizComplete(i, detail) {
    setBlockState(course.id, topic.id, i, { done: true, answer: detail.answer });
  }

  function finishTopic() {
    if (!alreadyComplete) {
      completeTopic(course.id, topic);
      // Custom-course activity counts toward the global streak/heatmap
      // (activity is activity), matching the base course.
      recordActivity('normal', 1, 15);
    }
    dispatch('complete', { topicId: topic.id });
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <button class="text-text-muted hover:text-text-secondary" on:click={() => dispatch('exit')}>←</button>
    <div>
      <p class="text-[10px] uppercase tracking-wide text-text-muted">{course.title}</p>
      <h1 class="text-lg font-bold text-text-primary">{topic.title}</h1>
    </div>
  </div>

  <!-- Blocks -->
  {#each topic.blocks as block, i (i)}
    <div class="card">
      {#if block.type === 'text'}
        <TextBlock {block} />
      {:else if block.type === 'video'}
        <VideoBlock {block} state={stateFor(i)}
          on:complete={() => onBlockComplete(i)}
          on:progress={(e) => onBlockProgress(i, e.detail)} />
      {:else if block.type === 'practice'}
        <PracticeBlock {block} state={stateFor(i)}
          on:complete={(e) => onPracticeComplete(i, e.detail)} />
      {:else if block.type === 'quiz'}
        <QuizBlock {block} state={stateFor(i)}
          on:complete={(e) => onQuizComplete(i, e.detail)} />
      {/if}
    </div>
  {/each}

  <!-- Complete -->
  <div class="sticky bottom-4">
    <button
      class="btn-primary w-full"
      disabled={!allDone && !alreadyComplete}
      on:click={finishTopic}
    >
      {#if alreadyComplete}
        ✓ Completed — Back to course
      {:else if allDone}
        Mark topic complete →
      {:else}
        Finish the video / practice / quiz to complete
      {/if}
    </button>
  </div>
</div>
