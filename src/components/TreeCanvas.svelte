<script lang="ts">
  import { onMount } from 'svelte';
  import type { AtlasData, Camera, CrossRelation, PositionedTradition, RegionId, Tradition } from '../data/types';
  import { formatYear, timelineStops, yearToY } from '../lib/timeline';
  import {
    parentPath, positionTraditions, regionBounds, regionWidth,
    relationPoints, regionX, styledRelationPath, worldWidth, WORLD_HEIGHT, WORLD_LEFT
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
  const canvasWidth = $derived(worldWidth(data.regions));
  const gridStops = $derived([
    ...timelineStops,
    ...(data.metadata.timelineStops ?? []).filter((entry) => !timelineStops.some((stop) => stop.year === entry.year)).map((entry) => ({ year: entry.year, y: yearToY(entry.year), major: entry.major ?? false }))
  ]);
  const byId = $derived(new Map(positioned.map((entry) => [entry.id, entry])));
  const selected = $derived(selectedId ? byId.get(selectedId) ?? null : null);
  const detailLevel = $derived(camera.scale < .2 ? 1 : camera.scale < .42 ? 2 : 3);
  const showEventLabels = $derived(camera.scale >= .18);
  const labelScale = $derived(Math.min(70, Math.max(22, 12 / camera.scale)));
  const nodeRadius = $derived(Math.min(30, Math.max(8, 4.5 / camera.scale)));

  const shownTraditions = $derived(positioned.filter((entry) => visibleIds.has(entry.id) && entry.importance <= detailLevel && !entry.visual?.hidden));
  const shownSet = $derived(new Set(shownTraditions.map((entry) => entry.id)));
  const labelPositions = $derived.by(() => {
    const result = new Map<string, number>();
    const groups = new Map<string, PositionedTradition[]>();
    for (const entry of shownTraditions) {
      const bucket = Math.round(entry.lane * 5);
      const key = `${entry.regionId}:${bucket}`;
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }
    const minimumGap = 18 / camera.scale;
    const maximumShift = 68 / camera.scale;
    for (const entries of groups.values()) {
      entries.sort((a, b) => a.startY - b.startY);
      let cursor = -Infinity;
      for (const entry of entries) {
        const candidate = Math.max(entry.startY, cursor + minimumGap);
        const y = Math.min(candidate, entry.startY + maximumShift);
        result.set(entry.id, y);
        cursor = y;
      }
    }
    return result;
  });

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

  function fitRange(topY: number, bottomY: number, x = 0, width = canvasWidth, shouldAnimate = true): void {
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
    fitRange(120, yearToY(-2600), 0, canvasWidth, shouldAnimate);
  }

  function fitAll(shouldAnimate = true): void {
    fitRange(0, WORLD_HEIGHT, 0, canvasWidth, shouldAnimate);
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

  function relationColors(relation: CrossRelation): string[] {
    if ((relation.visual?.gradientColors?.length ?? 0) > 0) return relation.visual!.gradientColors!;
    if (!relation.visual?.autoRegionGradient) return [];
    const source = byId.get(relation.sourceId);
    const target = byId.get(relation.targetId);
    if (!source || !target) return [];
    return relationPoints(source, target, relation, data.regions).map((point) => point.color ?? '#888888');
  }

  function exportSvg(): void {
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('style', '--inv-scale:1');
    clone.setAttribute('viewBox', `0 0 ${canvasWidth} ${WORLD_HEIGHT}`);
    clone.setAttribute('width', String(canvasWidth));
    clone.setAttribute('height', String(WORLD_HEIGHT));
    clone.querySelector<SVGGElement>('.world-layer')?.setAttribute('transform', 'translate(0 0) scale(1)');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      svg{background:#080a0f;font-family:Inter,Arial,sans-serif}.region-band{fill:#0b0e15}
      .grid-line{stroke:#fff}.region-divider{stroke:#fff}.branch{fill:none;stroke-width:4}
      .parent-link,.cross-link{fill:none;stroke-width:2}.node-dot{stroke:#080a0f;stroke-width:2}.node-label{fill:#f4f0e8;font-weight:650}
      .node-date{fill:#aaa69c}.region-name{fill:#f4f0e8;font-weight:800;letter-spacing:2px}.event-line{stroke:#d9b45a;stroke-dasharray:8 7}
      .event-text{fill:#d9b45a;font-weight:700}.relation-influence,.relation-context{stroke-dasharray:7 7}`;
    clone.prepend(style);
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ReliTree-atlas-vectorial.svg';
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
      <rect class="world-background" width={canvasWidth} height={WORLD_HEIGHT} fill={data.metadata.board?.backgroundColor ?? 'var(--world)'} fill-opacity={data.metadata.board?.backgroundOpacity ?? 1}/>

      <defs>
        {#each data.relations as relation}
          {@const colors = relationColors(relation)}
          {@const source = byId.get(relation.sourceId)}
          {@const target = byId.get(relation.targetId)}
          {@const points = source && target ? relationPoints(source, target, relation, data.regions) : []}
          {#if colors.length > 1 && points.length > 1}
            <linearGradient id={`relation-gradient-${relation.id}`} gradientUnits="userSpaceOnUse" x1={points[0].x} y1={points[0].y} x2={points.at(-1)!.x} y2={points.at(-1)!.y}>
              {#each colors as color, index}
                <stop offset={`${index / (colors.length - 1) * 100}%`} stop-color={color}/>
              {/each}
            </linearGradient>
          {/if}
        {/each}
      </defs>

      {#each data.regions as region}
        {@const left = regionX(region, data.regions)}
        {@const width = regionWidth(region)}
        {@const appearance = region.appearance ?? {}}
        {@const shape = appearance.shape ?? 'column'}
        {@const fill = appearance.fillColor ?? region.color}
        {@const fillOpacity = appearance.fillOpacity ?? .055}
        {@const stroke = appearance.borderColor ?? 'var(--text)'}
        {@const strokeOpacity = appearance.borderOpacity ?? .12}
        {@const strokeWidth = appearance.borderWidth ?? 1}
        <g class="region-column">
          {#if shape !== 'none'}
            {#if shape === 'ellipse'}
              <ellipse class="region-shade" cx={left + width / 2} cy={WORLD_HEIGHT / 2} rx={Math.max(1, width / 2 - 8)} ry={WORLD_HEIGHT / 2 - 8} fill={fill} fill-opacity={fillOpacity} stroke={stroke} stroke-opacity={strokeOpacity} stroke-width={strokeWidth} vector-effect="non-scaling-stroke"/>
            {:else}
              {@const inset = shape === 'outline' ? 8 : 0}
              {@const radius = shape === 'rounded' ? 22 : shape === 'capsule' ? Math.min(width / 2, 180) : 0}
              <rect class="region-shade" x={left + inset} y={inset} width={width - inset * 2} height={WORLD_HEIGHT - inset * 2} rx={radius} fill={shape === 'outline' ? 'none' : fill} fill-opacity={fillOpacity} stroke={stroke} stroke-opacity={strokeOpacity} stroke-width={strokeWidth} vector-effect="non-scaling-stroke"/>
            {/if}
          {/if}
          {#if strokeWidth > 0}<line class="region-divider" x1={left} x2={left} y1="0" y2={WORLD_HEIGHT} stroke={stroke} stroke-opacity={strokeOpacity} stroke-width={strokeWidth}/>{/if}
          {#if data.metadata.board?.headersVisible !== false && appearance.headerVisible !== false}
            <rect x={left + 12} y="84" width={width - 24} height="8" rx="4" fill={appearance.headerColor ?? region.color} fill-opacity={appearance.headerOpacity ?? 1}/>
            <text class="region-name" x={left + width / 2} y="62" text-anchor="middle">{region.name.toLocaleUpperCase('es')}</text>
          {/if}
        </g>
      {/each}

      {#if data.metadata.board?.gridVisible !== false && data.metadata.board?.axisMode !== 'none'}
        {#each gridStops as stop}
          <line class:major={stop.major} class="grid-line" x1={WORLD_LEFT} x2={canvasWidth - 40} y1={stop.y} y2={stop.y} stroke={data.metadata.board?.gridColor ?? 'var(--text)'} stroke-opacity={(data.metadata.board?.gridOpacity ?? .055) * (stop.major ? 2 : 1)}/>
        {/each}
      {/if}

      {#if showEvents}
        {#each data.events as event}
          {@const y = yearToY(event.year)}
          {@const affected = data.regions.filter((region) => event.regionIds.includes(region.id))}
          {@const targeted = (event.entityIds ?? []).map((id) => byId.get(id)).filter((entry): entry is PositionedTradition => Boolean(entry))}
          {@const regionScoped = event.scope !== 'entities' && affected.length > 0}
          {@const entityScoped = event.scope !== 'regions' && targeted.length > 0}
          {@const minOrder = regionScoped ? Math.min(...affected.map((region) => region.order)) : 0}
          {@const maxOrder = regionScoped ? Math.max(...affected.map((region) => region.order)) : 0}
          {@const firstRegion = regionScoped ? data.regions.find((region) => region.order === minOrder) : null}
          {@const lastRegion = regionScoped ? data.regions.find((region) => region.order === maxOrder) : null}
          {@const x1 = firstRegion ? regionX(firstRegion, data.regions) + 20 : (targeted[0]?.x ?? WORLD_LEFT)}
          {@const x2 = lastRegion ? regionX(lastRegion, data.regions) + regionWidth(lastRegion) - 20 : (targeted.at(-1)?.x ?? x1)}
          <g class="event-marker" opacity={event.visual?.opacity ?? 1}>
            {#if regionScoped}<line class="event-line" x1={x1} x2={x2} y1={y} y2={y} stroke={event.visual?.color} style={`stroke-width:${event.visual?.lineWidth ?? 1.2};stroke-dasharray:${event.visual?.lineDash ?? '7 7'}`}/>{/if}
            {#if entityScoped}
              {#each targeted as entity}
                <line class="event-line" x1={entity.x - 18} x2={entity.x + 18} y1={y} y2={y} stroke={event.visual?.color ?? entity.region.color} style={`stroke-width:${event.visual?.lineWidth ?? 2.4};stroke-dasharray:${event.visual?.lineDash ?? ''}`}/>
                <circle cx={entity.x} cy={y} r="4" fill={event.visual?.color ?? entity.region.color}/>
              {/each}
            {/if}
            {#if showEventLabels}<text class="event-text" x={x1 + 10} y={y - 9} fill={event.visual?.color}>{event.title} · {formatYear(event.year, true)}</text>{/if}
          </g>
        {/each}
      {/if}

      <g class="genealogy-links">
        {#each shownTraditions as entry}
          {@const parent = entry.parentId ? byId.get(entry.parentId) : null}
          {#if parent && shownSet.has(parent.id)}
            <path class={`parent-link relation-${entry.relationToParent}`} d={parentPath(entry, parent)} stroke={entry.visual?.parentLineColor ?? entry.region.color} style={`stroke-width:${entry.visual?.parentLineWidth ?? 2};${entry.visual?.parentLineDash ? `stroke-dasharray:${entry.visual.parentLineDash}` : ''}`}/>
          {/if}
          <line class="branch" x1={entry.x} x2={entry.x} y1={entry.startY} y2={entry.endY} stroke={entry.visual?.color ?? entry.region.color} style={`stroke-width:${entry.visual?.timelineWidth ?? entry.visual?.lineWidth ?? 3.5};stroke-dasharray:${entry.visual?.lineDash ?? ''}`} opacity={entry.visual?.opacity ?? .84}/>
        {/each}
      </g>

      {#if showRelations}
        <g class="cross-relations">
          {#each data.relations as relation}
            {@const source = byId.get(relation.sourceId)}
            {@const target = byId.get(relation.targetId)}
            {#if source && target && shownSet.has(source.id) && shownSet.has(target.id)}
              {@const gradient = relationColors(relation)}
              {@const roleDash = relation.role === 'hypothetical' ? '3 7' : relation.role === 'secondary' ? '10 6' : relation.role === 'fusion' ? '14 5 3 5' : relation.kind === 'influence' || relation.kind === 'context' ? '7 7' : ''}
              {@const width = relation.visual?.lineWidth ?? .8 + (relation.strength ?? 70) * .08}
              <path class={`cross-link relation-${relation.kind}`} d={styledRelationPath(source, target, relation, data.regions)} stroke={gradient.length > 1 ? `url(#relation-gradient-${relation.id})` : relation.visual?.color ?? source.region.color} style={`stroke-width:${width};stroke-dasharray:${relation.visual?.lineDash ?? roleDash}`} opacity={relation.visual?.opacity ?? .7}/>
            {/if}
          {/each}
        </g>
      {/if}

      <g class="tradition-nodes">
        {#each shownTraditions as entry (entry.id)}
          {@const lines = wrapLabel(entry.name)}
          {@const labelOffset = (labelPositions.get(entry.id) ?? entry.startY) - entry.startY + (entry.visual?.labelOffsetY ?? 0) / camera.scale}
          {@const labelX = (entry.visual?.labelOffsetX ?? 0) / camera.scale}
          {@const entryRadius = entry.visual?.nodeRadius ? entry.visual.nodeRadius / camera.scale : nodeRadius}
          {@const iconPath = entry.icon?.embeddedDataUrl ?? entry.icon?.resolvedPath ?? entry.icon?.path}
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
            <circle class="node-halo" r={entryRadius * 1.9} fill={entry.visual?.color ?? entry.region.color}/>
            {#if iconPath}
              <circle class="node-icon-bg" r={entryRadius * 1.18} fill="var(--world)" stroke={entry.visual?.color ?? entry.region.color}/>
              <image class="node-icon" href={iconPath} x={-entryRadius} y={-entryRadius} width={entryRadius * 2} height={entryRadius * 2} preserveAspectRatio="xMidYMid meet"/>
            {:else}
              <circle class="node-dot" r={entryRadius} fill={entry.status === 'historical' ? '#11151d' : (entry.visual?.color ?? entry.region.color)}/>
            {/if}
            {#if labelOffset > 1}<path class="label-leader" d={`M ${entryRadius} 0 L ${entryRadius + labelX} ${labelOffset}`} stroke={entry.visual?.color ?? entry.region.color}/>{/if}
            <text class="node-label" text-anchor="middle" x={labelX} y={entryRadius + labelOffset + labelScale} style={`font-size:${labelScale}px`}>
              {#each lines as line, index}<tspan x={labelX} dy={index === 0 ? 0 : labelScale * 1.05}>{line}</tspan>{/each}
            </text>
            <text class="node-subtitle" text-anchor="middle" x={labelX} y={entryRadius + labelOffset + (lines.length + .25) * labelScale * 1.05} style={`font-size:${labelScale * .76}px`}>{entry.subtitle}</text>
            <text class="node-date" text-anchor="middle" x={labelX} y={entryRadius + labelOffset + (lines.length + 1.05) * labelScale * 1.05} style={`font-size:${labelScale * .72}px`}>{formatYear(entry.startYear, true)}</text>
          </g>
        {/each}
      </g>
    </g>
  </svg>

  <div class="canvas-help" aria-hidden="true">rueda · ampliar&nbsp;&nbsp;&nbsp; arrastra · recorrer&nbsp;&nbsp;&nbsp; doble clic · volver</div>
</div>
