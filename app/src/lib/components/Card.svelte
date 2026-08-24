<script>
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let type = 'default'; // hook, fail_first, analogy, code, break_it, contrast, explain_back, connect
  export let index = 0;
  export let status = 'active'; // active, correct, wrong, completed

  const typeLabels = {
    hook: '🤔',
    fail_first: '🧪',
    analogy: '💡',
    code: '📝',
    break_it: '⚡',
    contrast: '🔍',
    explain_back: '🎤',
    connect: '🔗',
    theory: '📖',
    build_step: '🛠️'
  };
</script>

<div
  class="card-container"
  class:correct={status === 'correct'}
  class:wrong={status === 'wrong'}
  in:fly={{ x: 30, duration: 300, easing: quintOut, delay: 50 }}
  out:fade={{ duration: 150 }}
>
  <!-- Card type badge -->
  <div class="flex items-center justify-between mb-4">
    <span class="text-xs bg-surface-2 text-text-secondary px-2 py-1 rounded-full">
      {typeLabels[type] || '📄'} {type.replace('_', ' ').toUpperCase()}
    </span>
    <slot name="badge" />
  </div>

  <!-- Card content -->
  <div class="card-body">
    <slot />
  </div>

  <!-- Card footer (actions/navigation) -->
  {#if $$slots.footer}
    <div class="card-footer mt-6 pt-4 border-t border-surface-3">
      <slot name="footer" />
    </div>
  {/if}
</div>

<style>
  .card-container {
    @apply bg-surface-1 border border-surface-3 rounded-xl p-6 
           max-w-2xl mx-auto w-full
           transition-all duration-300 ease-out;
    min-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .card-container.correct {
    @apply border-accent-green;
    box-shadow: 0 0 20px rgba(63, 185, 80, 0.15);
    animation: pulseGreen 0.6s ease-out;
  }

  .card-container.wrong {
    @apply border-accent-red;
    animation: shake 0.4s ease-out;
  }

  .card-body {
    @apply flex-1 flex flex-col justify-center;
  }

  @keyframes pulseGreen {
    0% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.7); }
    100% { box-shadow: 0 0 20px rgba(63, 185, 80, 0.15); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
</style>
