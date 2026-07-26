<script>
  import Card from './Card.svelte';

  export let data = {};
  // data: { code: string, highlight?: number[], annotation?: string }

  $: lines = data.code ? data.code.split('\n') : [];
  $: highlightSet = new Set(data.highlight || []);
</script>

<Card type="code">
  <div class="space-y-4">
    <!-- Code block with line numbers and highlighting -->
    <div class="code-block relative overflow-x-auto">
      <pre class="leading-relaxed"><code>{#each lines as line, i}<span 
          class="code-line"
          class:highlighted={highlightSet.has(i + 1)}
        ><span class="line-number">{i + 1}</span>{line}</span>
{/each}</code></pre>
    </div>

    <!-- Annotation (key insight) -->
    {#if data.annotation}
      <div class="flex items-start gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-3">
        <span class="text-accent-blue mt-0.5">→</span>
        <p class="text-sm text-text-primary">{data.annotation}</p>
      </div>
    {/if}
  </div>
</Card>

<style>
  .code-line {
    display: block;
    padding: 1px 0;
    padding-left: 2.5rem;
    position: relative;
  }

  .code-line.highlighted {
    background: rgba(88, 166, 255, 0.08);
    border-left: 2px solid #58a6ff;
    margin-left: -1rem;
    padding-left: calc(2.5rem + 1rem - 2px);
  }

  .line-number {
    position: absolute;
    left: 0;
    width: 2rem;
    text-align: right;
    color: #484f58;
    font-size: 0.75rem;
    user-select: none;
  }
</style>
