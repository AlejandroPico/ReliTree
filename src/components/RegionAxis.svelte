<script lang="ts">
  import type { Camera, Region, RegionId } from '../data/types';
  import { regionWidth, regionX } from '../lib/layout';

  let { regions, camera, onfocus }: { regions: Region[]; camera: Camera; onfocus: (id: RegionId) => void } = $props();
</script>

<nav class="region-axis" aria-label="Eje horizontal de áreas geoculturales">
  {#each regions as region}
    <button
      type="button"
      style={`left:calc(${camera.x + regionX(region, regions) * camera.scale}px - var(--axis-width));width:${regionWidth(region) * camera.scale}px;--region:${region.color}`}
      onclick={() => onfocus(region.id)}
      aria-label={`Centrar ${region.name}`}
    >
      <i></i><span>{regionWidth(region) * camera.scale < 86 ? region.shortName : region.name}</span>
    </button>
  {/each}
</nav>
