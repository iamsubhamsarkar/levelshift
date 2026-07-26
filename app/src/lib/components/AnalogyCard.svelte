<script>
  import Card from './Card.svelte';

  export let data = {};
  // data: { text: string, visual?: string }
</script>

<Card type="analogy">
  <div class="flex flex-col items-center justify-center text-center space-y-6">
    <!-- Analogy icon -->
    <div class="text-4xl">💡</div>

    <!-- Analogy text -->
    <p class="text-lg text-text-primary leading-relaxed max-w-lg font-medium">
      {data.text}
    </p>

    <!-- Optional visual (SVG or image placeholder) -->
    {#if data.visual}
      <div class="w-full max-w-md bg-surface-2 rounded-lg p-4 border border-surface-3">
        <img src={data.visual} alt="Visual analogy" class="w-full h-auto" />
      </div>
    {/if}
  </div>
</Card>
