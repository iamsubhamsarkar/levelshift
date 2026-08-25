<script>
  import { concepts } from '../stores/progress.js';
  import { calculateDecay } from '../engines/decay.js';

  export let size = 200;
  /**
   * Optional: custom-course mode. When `axes` is provided, the radar renders
   * those axes and scores concepts by their `axis` field in `conceptData`.
   * When omitted, it renders the base course's fixed 6 skill categories.
   */
  export let axes = null;              // string[] | null
  export let conceptData = null;       // Record<id,{strength,lastPracticed,axis,...}> | null

  const baseCategories = [
    { id: 'java', label: 'Java', prefixes: ['basics.', 'oop.', 'collections.', 'exceptions.', 'java8.'] },
    { id: 'dsa', label: 'DSA', prefixes: ['dsa.'] },
    { id: 'restassured', label: 'REST Assured', prefixes: ['restassured.'] },
    { id: 'api', label: 'APIs', prefixes: ['http.', 'rest.', 'apistrategy.'] },
    { id: 'selenium', label: 'Selenium', prefixes: ['selenium.'] },
    { id: 'agentic', label: 'Agentic AI', prefixes: ['agentic.'] }
  ];

  // Build the category list: custom axes (by exact `axis` match) or base prefixes.
  $: categories = (axes && axes.length > 0
    ? axes.map((label) => ({ id: label, label, axisMatch: label }))
    : baseCategories
  ).map((cat, i, arr) => ({
    ...cat,
    angle: -90 + (360 / arr.length) * i
  }));

  // Which concept map to score: injected (custom) or the global base store.
  $: activeConceptData = conceptData || $concepts;
  $: scores = calculateCategoryScores(activeConceptData, categories);

  function calculateCategoryScores(conceptDataMap, cats) {
    return cats.map(cat => {
      const matching = Object.entries(conceptDataMap).filter(([id, data]) => {
        if (cat.axisMatch) return data && data.axis === cat.axisMatch;
        return cat.prefixes.some(prefix => id.startsWith(prefix));
      });

      if (matching.length === 0) return { ...cat, score: 0 };

      const totalStrength = matching.reduce((sum, [_, data]) => {
        return sum + calculateDecay(data);
      }, 0);

      return { ...cat, score: Math.round(totalStrength / matching.length) };
    });
  }

  // SVG geometry
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = (size / 2) - 30;

  function polarToXY(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  }

  $: polygon = scores.map(s => {
    const radius = (s.score / 100) * maxRadius;
    return polarToXY(s.angle, radius);
  });

  $: polygonPath = polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Grid rings
  const rings = [25, 50, 75, 100];
</script>

<div class="flex flex-col items-center">
  <svg width={size} height={size} class="overflow-visible">
    <!-- Grid rings -->
    {#each rings as ring}
      <polygon
        points={categories.map(c => {
          const { x, y } = polarToXY(c.angle, (ring / 100) * maxRadius);
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke="#2d333b"
        stroke-width="0.5"
      />
    {/each}

    <!-- Axis lines -->
    {#each categories as cat}
      {@const end = polarToXY(cat.angle, maxRadius)}
      <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#2d333b" stroke-width="0.5" />
    {/each}

    <!-- Data polygon -->
    {#if polygon.length > 0}
      <path
        d={polygonPath}
        fill="rgba(88, 166, 255, 0.15)"
        stroke="#58a6ff"
        stroke-width="2"
        stroke-linejoin="round"
      />

      <!-- Data points -->
      {#each polygon as point}
        <circle cx={point.x} cy={point.y} r="3" fill="#58a6ff" />
      {/each}
    {/if}

    <!-- Labels -->
    {#each scores as cat}
      {@const labelPos = polarToXY(cat.angle, maxRadius + 18)}
      <text
        x={labelPos.x}
        y={labelPos.y}
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-[10px] fill-current text-text-secondary"
      >
        {cat.label} ({cat.score}%)
      </text>
    {/each}
  </svg>
</div>
