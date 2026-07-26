<script>
  import Card from './Card.svelte';

  export let data = {};
  // data: { question: string, code?: string }
</script>

<Card type="hook">
  <div class="text-center space-y-6">
    <!-- Mystery question -->
    <h2 class="text-xl font-semibold text-text-primary leading-relaxed">
      {data.question}
    </h2>

    <!-- Code snippet (if provided) -->
    {#if data.code}
      <div class="code-block text-left text-sm">
        <pre><code>{data.code}</code></pre>
      </div>
    {/if}

    <!-- Subtle prompt -->
    <p class="text-sm text-text-muted italic">Think about it... then continue →</p>
  </div>
</Card>
