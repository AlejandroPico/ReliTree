<script lang="ts">
  import type { Camera, Region, RegionId } from '../data/types';
  import { REGION_WIDTH, regionX } from '../lib/layout';

  let { regions, camera, onfocus }: { regions: Region[]; camera: Camera; onfocus: (id: RegionId) => void } = $props();
</script>

<nav class="region-axis" aria-label="Eje horizontal de áreas geoculturales">
  {#each regions as region}
    <button
      type="button"
      style={`left:${camera.x + regionX(region) * camera.scale}px;width:${REGION_WIDTH * camera.scale}px;--region:${region.color}`}
      onclick={() => onfocus(region.id)}
      aria-label={`Centrar ${region.name}`}
    >
      <i></i><span>{REGION_WIDTH * camera.scale < 86 ? region.shortName : region.name}</span>
    </button>
  {/each}
</nav>
