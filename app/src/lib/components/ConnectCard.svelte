<script>
  import Card from './Card.svelte';

  export let data = {};
  // data: { text, code?, note? }
</script>

<Card type="connect">
  <div class="space-y-5">
    <!-- Connection icon + intro -->
    <div class="flex items-center gap-2">
      <span class="text-2xl">🔗</span>
      <span class="text-sm font-medium text-accent-blue">WHERE THIS LIVES IN YOUR PROJECT</span>
    </div>

    <!-- Connection explanation -->
    <p class="text-text-primary leading-relaxed">{data.text}</p>

    <!-- Future code preview -->
    {#if data.code}
      <div class="code-block text-sm opacity-80">
        <pre><code>{data.code}</code></pre>
      </div>
    {/if}

    <!-- Note -->
    {#if data.note}
      <p class="text-sm text-text-secondary italic border-l-2 border-accent-blue/30 pl-3">
        {data.note}
      </p>
    {/if}
  </div>
</Card>
