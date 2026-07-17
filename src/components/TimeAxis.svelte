<script lang="ts">
  import type { Camera } from '../data/types';
  import { formatYear, timelineStops } from '../lib/timeline';

  let { camera, animated = false }: { camera: Camera; animated?: boolean } = $props();
  const marks = $derived(timelineStops.map((stop) => ({ ...stop, screenY: camera.y + stop.y * camera.scale })));
</script>

<aside class:animated class="time-axis" aria-label="Eje cronológico vertical">
  <div class="axis-title"><b>TIEMPO</b><span>presente arriba</span></div>
  <div class="axis-line"></div>
  {#each marks as mark}
    <div class:major={mark.major} class="axis-mark" style={`top:${mark.screenY}px`}>
      <span></span><b>{formatYear(mark.year, true)}</b>
    </div>
  {/each}
  <div class="axis-direction" aria-hidden="true">↓ pasado profundo</div>
</aside>
