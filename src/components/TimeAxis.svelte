<script lang="ts">
  import type { Camera } from '../data/types';
  import { formatYear, timelineStops, yearToY } from '../lib/timeline';

  let { camera, animated = false, customStops = [] }: { camera: Camera; animated?: boolean; customStops?: Array<{ year: number; major?: boolean; label?: string }> } = $props();
  const marks = $derived([
    ...timelineStops.map((entry) => ({ ...entry, label: undefined as string | undefined })),
    ...customStops.filter((entry) => !timelineStops.some((stop) => stop.year === entry.year)).map((entry) => ({ year: entry.year, y: yearToY(entry.year), major: entry.major ?? false, label: entry.label }))
  ].map((stop) => ({ ...stop, screenY: camera.y + stop.y * camera.scale })));
</script>

<aside class:animated class="time-axis" aria-label="Eje cronológico vertical">
  <div class="axis-title"><b>TIEMPO</b><span>presente arriba</span></div>
  <div class="axis-line"></div>
  {#each marks as mark}
    <div class:major={mark.major} class="axis-mark" style={`top:${mark.screenY}px`}>
      <span></span><b>{mark.label || formatYear(mark.year, true)}</b>
    </div>
  {/each}
  <div class="axis-direction" aria-hidden="true">↓ pasado profundo</div>
</aside>
