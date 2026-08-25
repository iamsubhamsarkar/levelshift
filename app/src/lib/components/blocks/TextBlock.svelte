<script>
  import { renderMarkdown } from '../../utils/markdown.js';
  export let block;
</script>

<div class="text-sm text-text-primary">
  {@html renderMarkdown(block.md)}
</div>
