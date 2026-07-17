<script lang="ts">
  import { onMount } from 'svelte';
  import type { AtlasData, Camera, PositionedTradition, RegionId, Tradition } from '../data/types';
  import { formatYear, timelineStops, yearToY } from '../lib/timeline';
  import {
    parentPath, positionTraditions, REGION_WIDTH, relationPath, regionBounds,
    regionX, WORLD_HEIGHT, WORLD_LEFT, WORLD_WIDTH
  } from '../lib/layout';

  let {
    data,
    visibleIds,
    selectedId = null,
    showEvents = true,
    showRelations = false,
    onselect,
    oncamera = () => {},
    onzoom = () => {}
  }: {
    data: AtlasData;
    visibleIds: Set<string>;
    selectedId?: string | null;
    showEvents?: boolean;
    showRelations?: boolean;
    onselect: (tradition: Tradition | null) => void;
    oncamera?: (camera: Camera, animated: boolean) => void;
    onzoom?: (percent: number) => void;
  } = $props();

  let viewport: HTMLDivElement;
  let svg: SVGSVGElement;
  let resizeObserver: ResizeObserver | null = null;
  let dragging = $state(false);
  let animated = $state(false);
  let animationTimer = 0;
  let pointer = { x: 0, y: 0 };
  let camera = $state<Camera>({ x: 90, y: 10, scale: .17 });
  const positioned = $derived(positionTraditions(data));
  const byId = $derived(new Map(positioned.map((entry) => [entry.id, entry])));
  const selected = $derived(selectedId ? byId.get(selectedId) ?? null : null);
  const detailLevel = $derived(camera.scale < .2 ? 1 : camera.scale < .42 ? 2 : 3);
  const labelScale = $derived(Math.min(70, Math.max(22, 12 / camera.scale)));
  const nodeRadius = $derived(Math.min(30, Math.max(8, 4.5 / camera.scale)));

  const shownTraditions = $derived(positioned.filter((entry) => visibleIds.has(entry.id) && entry.importance <= detailLevel));
  const shownSet = $derived(new Set(shownTraditions.map((entry) => entry.id)));

  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function setCamera(next: Camera, shouldAnimate = false): void {
    camera = next;
    animated = shouldAnimate;
    window.clearTimeout(animationTimer);
    if (shouldAnimate) animationTimer = window.setTimeout(() => animated = false, 440);
    oncamera(camera, shouldAnimate);
    onzoom(Math.round(camera.scale * 100));
  }

  function fitRange(topY: number, bottomY: number, x = 0, width = WORLD_WIDTH, shouldAnimate = true): void {
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const availableWidth = Math.max(280, rect.width - 112);
    const availableHeight = Math.max(240, rect.height - 86);
    const scale = clamp(Math.min(availableWidth / width, availableHeight / (bottomY - topY)), .075, 1.8);
    setCamera({
      scale,
      x: 98 + (availableWidth - width * scale) / 2 - x * scale,
      y: 48 + (availableHeight - (bottomY - topY) * scale) / 2 - topY * scale
    }, shouldAnimate);
  }

  function fitModern(shouldAnimate = true): void {
    fitRange(120, yearToY(-2600), 0, WORLD_WIDTH, shouldAnimate);
  }

  function fitAll(shouldAnimate = true): void {
    fitRange(0, WORLD_HEIGHT, 0, WORLD_WIDTH, shouldAnimate);
  }

  function focusRegion(regionId: RegionId, shouldAnimate = true): void {
    const bounds = regionBounds(regionId, data.regions);
    fitRange(120, yearToY(-4200), bounds.x - 30, bounds.width + 60, shouldAnimate);
  }

  function focusTradition(id: string, shouldAnimate = true): void {
    const entry = byId.get(id);
    if (!entry || !viewport) return;
    const rect = viewport.getBoundingClientRect();
    const scale = clamp(Math.max(camera.scale, .75), .32, 1.5);
    setCamera({
      scale,
      x: rect.width * .45 - entry.x * scale,
      y: rect.height * .45 - entry.startY * scale
    }, shouldAnimate);
  }

  function zoomAt(clientX: number, clientY: number, factor: number): void {
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const scale = clamp(camera.scale * factor, .06, 3.4);
    const worldX = (px - camera.x) / camera.scale;
    const worldY = (py - camera.y) / camera.scale;
    setCamera({ scale, x: px - worldX * scale, y: py - worldY * scale });
  }

  function handleWheel(event: WheelEvent): void {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * .00125));
  }

  function pointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('button, [data-node]')) return;
    dragging = true;
    pointer = { x: event.clientX, y: event.clientY };
    viewport.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent): void {
    if (!dragging) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    setCamera({ ...camera, x: camera.x + dx, y: camera.y + dy });
    pointer = { x: event.clientX, y: event.clientY };
  }

  function pointerUp(event: PointerEvent): void {
    dragging = false;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  }

  function wrapLabel(value: string): string[] {
    const limit = 26;
    if (value.length <= limit) return [value];
    const words = value.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > limit && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  function exportSvg(): void {
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('style', '--inv-scale:1');
    clone.setAttribute('viewBox', `0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`);
    clone.setAttribute('width', String(WORLD_WIDTH));
    clone.setAttribute('height', String(WORLD_HEIGHT));
    clone.querySelector<SVGGElement>('.world-layer')?.setAttribute('transform', 'translate(0 0) scale(1)');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      svg{background:#080a0f;font-family:Inter,Arial,sans-serif}.region-band{fill:#0b0e15}.region-shade{opacity:.055}
      .grid-line{stroke:#fff;stroke-opacity:.08}.region-divider{stroke:#fff;stroke-opacity:.12}.branch{fill:none;stroke-width:4}
      .parent-link,.cross-link{fill:none;stroke-width:2}.node-dot{stroke:#080a0f;stroke-width:2}.node-label{fill:#f4f0e8;font-weight:650}
      .node-date{fill:#aaa69c}.region-name{fill:#f4f0e8;font-weight:800;letter-spacing:2px}.event-line{stroke:#d9b45a;stroke-dasharray:8 7}
      .event-text{fill:#d9b45a;font-weight:700}.relation-influence,.relation-context{stroke-dasharray:7 7}`;
    clone.prepend(style);
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RELI3-atlas-vectorial.svg';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  onMount(() => {
    resizeObserver = new ResizeObserver(() => fitModern(false));
    resizeObserver.observe(viewport);
    requestAnimationFrame(() => fitModern(false));
    return () => {
      resizeObserver?.disconnect();
      window.clearTimeout(animationTimer);
    };
  });

  export { fitModern, fitAll, focusRegion, focusTradition, exportSvg };
</script>

<div
  bind:this={viewport}
  class:dragging
  class:animated
  class="tree-viewport"
  role="application"
  aria-label="Lienzo cronológico de religiones. Usa la rueda para ampliar y arrastra para recorrer."
  onwheel={handleWheel}
  onpointerdown={pointerDown}
  onpointermove={pointerMove}
  onpointerup={pointerUp}
  onpointercancel={pointerUp}
  ondblclick={() => fitModern()}
>
  <svg bind:this={svg} class="tree-svg" style={`--inv-scale:${1 / camera.scale}`} aria-label="Árbol cronológico vectorial">
    <g class="world-layer" transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}>
      <rect class="world-background" width={WORLD_WIDTH} height={WORLD_HEIGHT}/>

      {#each data.regions as region}
        {@const left = regionX(region)}
        <g class="region-column">
          <rect class="region-band" x={left} y="0" width={REGION_WIDTH} height={WORLD_HEIGHT}/>
          <rect class="region-shade" x={left} y="0" width={REGION_WIDTH} height={WORLD_HEIGHT} fill={region.color}/>
          <line class="region-divider" x1={left} x2={left} y1="0" y2={WORLD_HEIGHT}/>
          <rect x={left + 12} y="84" width={REGION_WIDTH - 24} height="8" rx="4" fill={region.color}/>
          <text class="region-name" x={left + REGION_WIDTH / 2} y="62" text-anchor="middle">{region.name.toLocaleUpperCase('es')}</text>
        </g>
      {/each}

      {#each timelineStops as stop}
        <line class:major={stop.major} class="grid-line" x1={WORLD_LEFT} x2={WORLD_WIDTH - 40} y1={stop.y} y2={stop.y}/>
      {/each}

      {#if showEvents}
        {#each data.events as event}
          {@const y = yearToY(event.year)}
          {@const affected = data.regions.filter((region) => event.regionIds.includes(region.id))}
          {@const minOrder = Math.min(...affected.map((region) => region.order))}
          {@const maxOrder = Math.max(...affected.map((region) => region.order))}
          {@const x1 = WORLD_LEFT + minOrder * REGION_WIDTH + 20}
          {@const x2 = WORLD_LEFT + (maxOrder + 1) * REGION_WIDTH - 20}
          <g class="event-marker">
            <line class="event-line" x1={x1} x2={x2} y1={y} y2={y}/>
            <text class="event-text" x={x1 + 10} y={y - 9}>{event.title} · {formatYear(event.year, true)}</text>
          </g>
        {/each}
      {/if}

      <g class="genealogy-links">
        {#each shownTraditions as entry}
          {@const parent = entry.parentId ? byId.get(entry.parentId) : null}
          {#if parent && shownSet.has(parent.id)}
            <path class={`parent-link relation-${entry.relationToParent}`} d={parentPath(entry, parent)} stroke={entry.region.color}/>
          {/if}
          <line class="branch" x1={entry.x} x2={entry.x} y1={entry.startY} y2={entry.endY} stroke={entry.region.color}/>
        {/each}
      </g>

      {#if showRelations}
        <g class="cross-relations">
          {#each data.relations as relation}
            {@const source = byId.get(relation.sourceId)}
            {@const target = byId.get(relation.targetId)}
            {#if source && target && shownSet.has(source.id) && shownSet.has(target.id)}
              <path class={`cross-link relation-${relation.kind}`} d={relationPath(source, target)} stroke={source.region.color}/>
            {/if}
          {/each}
        </g>
      {/if}

      <g class="tradition-nodes">
        {#each shownTraditions as entry (entry.id)}
          {@const lines = wrapLabel(entry.name)}
          <g
            data-node
            class:selected={entry.id === selectedId}
            class="tradition-node"
            role="button"
            tabindex="0"
            aria-label={`${entry.name}, ${formatYear(entry.startYear)}`}
            transform={`translate(${entry.x} ${entry.startY})`}
            onclick={(event) => { event.stopPropagation(); onselect(entry); }}
            onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') onselect(entry); }}
          >
            <circle class="node-halo" r={nodeRadius * 1.9} fill={entry.region.color}/>
            <circle class="node-dot" r={nodeRadius} fill={entry.status === 'historical' ? '#11151d' : entry.region.color}/>
            <text class="node-label" x={nodeRadius + 8 / camera.scale} y={-((lines.length - 1) * labelScale * .56)} style={`font-size:${labelScale}px`}>
              {#each lines as line, index}<tspan x={nodeRadius + 8 / camera.scale} dy={index === 0 ? 0 : labelScale * 1.05}>{line}</tspan>{/each}
            </text>
            {#if detailLevel >= 2}
              <text class="node-date" x={nodeRadius + 8 / camera.scale} y={(lines.length * labelScale * 1.05) + 5 / camera.scale} style={`font-size:${labelScale * .76}px`}>{formatYear(entry.startYear, true)}</text>
            {/if}
          </g>
        {/each}
      </g>
    </g>
  </svg>

  <div class="canvas-help" aria-hidden="true">rueda · ampliar&nbsp;&nbsp;&nbsp; arrastra · recorrer&nbsp;&nbsp;&nbsp; doble clic · volver</div>
</div>
