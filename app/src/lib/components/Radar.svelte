<script>
  import { concepts } from '../stores/progress.js';
  import { calculateDecay } from '../engines/decay.js';

  export let size = 200;

  const categories = [
    { id: 'java', label: 'Java', prefixes: ['basics.', 'oop.', 'collections.', 'exceptions.', 'java8.'] },
    { id: 'dsa', label: 'DSA', prefixes: ['dsa.'] },
    { id: 'restassured', label: 'REST Assured', prefixes: ['restassured.'] },
    { id: 'api', label: 'APIs', prefixes: ['http.', 'rest.', 'apistrategy.'] },
    { id: 'selenium', label: 'Selenium', prefixes: ['selenium.'] },
    { id: 'agentic', label: 'Agentic AI', prefixes: ['agentic.'] }
  ].map((cat, i, arr) => ({
    // Distribute axes evenly around the circle, starting from the top (-90deg).
    ...cat,
    angle: -90 + (360 / arr.length) * i
  }));

  $: scores = calculateCategoryScores($concepts);

  function calculateCategoryScores(conceptData) {
    return categories.map(cat => {
      const matching = Object.entries(conceptData).filter(([id]) =>
        cat.prefixes.some(prefix => id.startsWith(prefix))
      );

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
