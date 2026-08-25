/**
 * LevelShift — Minimal safe Markdown renderer
 *
 * Renders a SMALL subset of markdown to HTML. Input is treated as untrusted:
 * we HTML-escape everything FIRST, then apply formatting on the escaped text.
 * This guarantees no raw HTML/script from the source can execute — combined
 * with the sanitizeText() pass in validate.js it's defense-in-depth.
 *
 * Supported: headings (#..###), bold, italic, inline code, fenced code blocks,
 * links (safe http/https only), unordered lists, paragraphs, line breaks.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(md) {
  const src = String(md || '');
  const lines = src.split('\n');
  let html = '';
  let inCode = false;
  let codeBuf = [];
  let inList = false;

  const flushList = () => { if (inList) { html += '</ul>'; inList = false; } };

  for (let raw of lines) {
    // Fenced code blocks
    const fence = raw.trim().match(/^```(\w+)?$/);
    if (fence) {
      if (inCode) {
        html += `<pre class="code-block my-2 whitespace-pre-wrap">${escapeHtml(codeBuf.join('\n'))}</pre>`;
        codeBuf = []; inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuf.push(raw); continue; }

    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); continue; }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const sizes = { 1: 'text-lg font-bold', 2: 'text-base font-bold', 3: 'text-sm font-semibold' };
      html += `<h${level} class="${sizes[level]} text-text-primary mt-3 mb-1">${inline(h[2])}</h${level}>`;
      continue;
    }

    // Unordered list
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      if (!inList) { html += '<ul class="list-disc list-inside space-y-1 my-2">'; inList = true; }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }

    flushList();
    html += `<p class="my-2 leading-relaxed">${inline(line)}</p>`;
  }

  if (inCode) html += `<pre class="code-block my-2 whitespace-pre-wrap">${escapeHtml(codeBuf.join('\n'))}</pre>`;
  flushList();
  return html;
}

/** Inline formatting on already-safe (escaped) text. */
function inline(text) {
  let t = escapeHtml(text);
  // inline code
  t = t.replace(/`([^`]+)`/g, '<code class="px-1 rounded bg-surface-0 text-accent-purple">$1</code>');
  // bold, italic
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // links — only http/https, open in new tab
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent-blue underline">$1</a>');
  return t;
}
