<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Database, Download, Filter, Globe2, Info, Maximize2, Moon, Search, Sun, SunMoon, Tags, X
  } from '@lucide/svelte';
  import atlasJson from './data/atlas.json';
  import verifierJson from './data/verifier.json';
  import type { AtlasData, Camera, RegionId, Tradition, TraditionKind, VerifierEntry } from './data/types';
  import { resolveSolarTheme, type ResolvedTheme, type ThemeMode } from './lib/theme';
  import TreeCanvas from './components/TreeCanvas.svelte';
  import TimeAxis from './components/TimeAxis.svelte';
  import RegionAxis from './components/RegionAxis.svelte';
  import DetailPanel from './components/DetailPanel.svelte';
  import FilterPanel from './components/FilterPanel.svelte';
  import LegendPanel from './components/LegendPanel.svelte';
  import DataPanel from './components/DataPanel.svelte';
  import AboutPanel from './components/AboutPanel.svelte';

  const data = atlasJson as AtlasData;
  const verifier = verifierJson as { metadata: { count: number }; entries: VerifierEntry[] };
  let tree: any;
  let searchInput: HTMLInputElement | null = $state(null);
  let selected = $state<Tradition | null>(null);
  let panel = $state<'search' | 'filter' | 'legend' | 'data' | null>(null);
  let showAbout = $state(false);
  let query = $state('');
  let selectedRegions = $state<RegionId[]>([]);
  let kind = $state<TraditionKind | 'all'>('all');
  let activeOnly = $state(false);
  let posterOnly = $state(false);
  let showEvents = $state(true);
  let showRelations = $state(false);
  let zoomPercent = $state(17);
  let camera = $state<Camera>({ x: 90, y: 10, scale: .17 });
  let axisAnimated = $state(false);
  let axisTimer = 0;
  let themeMode = $state<ThemeMode>('auto');
  let resolvedTheme = $state<ResolvedTheme>('dark');
  let themeTimer = 0;

  function normalize(value: string): string {
    return value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  const needle = $derived(normalize(query.trim()));
  const visibleTraditions = $derived(data.traditions.filter((entry) => {
    const haystack = normalize([entry.name, ...entry.alternativeNames, entry.family, entry.summary, entry.regionId].join(' '));
    return (!needle || haystack.includes(needle))
      && (!selectedRegions.length || selectedRegions.includes(entry.regionId))
      && (kind === 'all' || entry.kind === kind)
      && (!activeOnly || entry.status === 'active')
      && (!posterOnly || entry.posterVerified);
  }));
  const visibleIds = $derived(new Set(visibleTraditions.map((entry) => entry.id)));
  const filtering = $derived(Boolean(needle) || selectedRegions.length > 0 || kind !== 'all' || activeOnly || posterOnly);
  const directResults = $derived(needle ? data.traditions.filter((entry) => normalize([entry.name, ...entry.alternativeNames, entry.family].join(' ')).includes(needle)).slice(0, 12) : []);
  const verifierResults = $derived(needle ? verifier.entries.filter((entry) => normalize(entry.name).includes(needle) && !data.traditions.some((mapped) => normalize(mapped.name) === normalize(entry.name))).slice(0, 10) : []);

  $effect(() => {
    if (selected && !visibleIds.has(selected.id)) selected = null;
  });

  function applyTheme(): void {
    resolvedTheme = themeMode === 'auto' ? resolveSolarTheme() : themeMode;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeMode = themeMode;
  }

  function cycleTheme(): void {
    themeMode = themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto';
    localStorage.setItem('reli3-theme', themeMode);
    applyTheme();
  }

  function toggleSearch(): void {
    panel = panel === 'search' ? null : 'search';
    if (panel === 'search') window.setTimeout(() => searchInput?.focus(), 40);
  }

  function resetFilters(): void {
    query = '';
    selectedRegions = [];
    kind = 'all';
    activeOnly = false;
    posterOnly = false;
  }

  function reveal(entry: Tradition): void {
    query = '';
    selectedRegions = [];
    kind = 'all';
    activeOnly = false;
    posterOnly = false;
    selected = entry;
    panel = null;
    window.setTimeout(() => tree?.focusTradition?.(entry.id), 60);
  }

  function updateCamera(next: Camera, animated: boolean): void {
    camera = next;
    axisAnimated = animated;
    window.clearTimeout(axisTimer);
    if (animated) axisTimer = window.setTimeout(() => axisAnimated = false, 460);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault();
      panel = 'search';
      window.setTimeout(() => searchInput?.focus(), 30);
      return;
    }
    if (event.key !== 'Escape') return;
    if (showAbout) showAbout = false;
    else if (panel) panel = null;
    else if (selected) selected = null;
  }

  onMount(() => {
    const saved = localStorage.getItem('reli3-theme');
    if (saved === 'auto' || saved === 'light' || saved === 'dark') themeMode = saved;
    applyTheme();
    themeTimer = window.setInterval(() => { if (themeMode === 'auto') applyTheme(); }, 60_000);
    return () => {
      window.clearInterval(themeTimer);
      window.clearTimeout(axisTimer);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown}/>
<svelte:head><title>RELI3 · Atlas de las religiones</title></svelte:head>

<main class:detail-open={Boolean(selected)} class="app-shell">
  <TreeCanvas
    bind:this={tree}
    {data}
    {visibleIds}
    selectedId={selected?.id ?? null}
    {showEvents}
    {showRelations}
    onselect={(entry) => selected = entry}
    oncamera={updateCamera}
    onzoom={(value) => zoomPercent = value}
  />
  <TimeAxis {camera} animated={axisAnimated}/>
  <RegionAxis regions={data.regions} {camera} onfocus={(id) => tree?.focusRegion?.(id)}/>

  <div class="brand-mark" aria-label="RELI3"><span>R3</span><div><b>RELI3</b><small>{data.traditions.length} ramas · {data.regions.length} áreas</small></div></div>

  {#if filtering}
    <div class="results-badge"><Search size={13}/><b>{visibleTraditions.length}</b> de {data.traditions.length}<button type="button" aria-label="Quitar filtros" onclick={resetFilters}><X size={13}/></button></div>
  {/if}

  <nav class="hud-toolbar" aria-label="Herramientas del atlas">
    <div class:open={panel === 'search'} class="hud-search-inline">
      <button class:active={panel === 'search'} type="button" data-tooltip="Buscar" aria-label="Buscar" onclick={toggleSearch}><Search size={17}/></button>
      {#if panel === 'search'}
        <label><input bind:this={searchInput} value={query} oninput={(event) => query = event.currentTarget.value} placeholder="Religión, familia, territorio…" aria-label="Buscar en RELI3"/>{#if query}<button type="button" aria-label="Limpiar" onclick={() => query = ''}><X size={14}/></button>{/if}</label>
        {#if query}
          <div class="search-results">
            <header><span>{directResults.length} ramas cartografiadas</span><small>{verifierResults.length} coincidencias aún no cartografiadas</small></header>
            {#each directResults as result}
              {@const region = data.regions.find((entry) => entry.id === result.regionId)}
              <button type="button" onclick={() => reveal(result)}><i style={`--result:${region?.color}`}></i><span><b>{result.name}</b><small>{region?.name} · {result.family}</small></span></button>
            {/each}
            {#if verifierResults.length}<div class="catalog-heading">CATÁLOGO VERIFICADOR · PENDIENTES DE CARTOGRAFÍA</div>{/if}
            {#each verifierResults as result}<div class="catalog-result"><span>{result.name}</span><small>{result.section}</small></div>{/each}
            {#if !directResults.length && !verifierResults.length}<p>No hay coincidencias. Prueba una grafía alternativa o una familia más amplia.</p>{/if}
          </div>
        {/if}
      {/if}
    </div>
    <button class:active={panel === 'filter'} type="button" data-tooltip="Filtros y capas" aria-label="Abrir filtros" onclick={() => panel = panel === 'filter' ? null : 'filter'}><Filter size={17}/></button>
    <button type="button" data-tooltip="Guía y metodología" aria-label="Abrir guía" onclick={() => { panel = null; showAbout = true; }}><Info size={18}/></button>
    <button class:active={panel === 'legend'} type="button" data-tooltip="Leyenda" aria-label="Abrir leyenda" onclick={() => panel = panel === 'legend' ? null : 'legend'}><Tags size={17}/></button>
    <button class:active={panel === 'data'} type="button" data-tooltip="SQLite y datos" aria-label="Abrir datos" onclick={() => panel = panel === 'data' ? null : 'data'}><Database size={17}/></button>
    <button type="button" data-tooltip="Vista completa" aria-label="Encajar todas las épocas" onclick={() => tree?.fitAll?.()}><Globe2 size={17}/></button>
    <button type="button" data-tooltip="Periodo histórico" aria-label="Volver al periodo histórico" onclick={() => tree?.fitModern?.()}><Maximize2 size={17}/></button>
    <button type="button" data-tooltip="Exportar SVG vectorial" aria-label="Exportar SVG" onclick={() => tree?.exportSvg?.()}><Download size={17}/></button>
    <button class:active={themeMode === 'auto'} type="button" data-tooltip={themeMode === 'auto' ? 'Tema automático · ciclo solar de Barcelona' : `Tema ${themeMode}`} aria-label="Cambiar tema" onclick={cycleTheme}>{#if themeMode === 'auto'}<SunMoon size={17}/>{:else if themeMode === 'dark'}<Moon size={17}/>{:else}<Sun size={17}/>{/if}</button>
    <button class="zoom-readout" type="button" data-tooltip="Restablecer periodo histórico" aria-label={`Zoom ${zoomPercent}%`} onclick={() => tree?.fitModern?.()}><b>{zoomPercent}%</b></button>
  </nav>

  {#if panel === 'filter'}
    <FilterPanel
      {data} {selectedRegions} {kind} {activeOnly} {posterOnly} {showEvents} {showRelations}
      onregions={(value) => selectedRegions = value}
      onkind={(value) => kind = value}
      onactive={(value) => activeOnly = value}
      onposter={(value) => posterOnly = value}
      onevents={(value) => showEvents = value}
      onrelations={(value) => showRelations = value}
      onreset={resetFilters}
      onclose={() => panel = null}
    />
  {:else if panel === 'legend'}
    <LegendPanel onclose={() => panel = null}/>
  {:else if panel === 'data'}
    <DataPanel onclose={() => panel = null}/>
  {/if}

  {#if selected}
    <DetailPanel
      tradition={selected}
      {data}
      onclose={() => selected = null}
      onfocus={(id) => tree?.focusTradition?.(id)}
      onselect={reveal}
    />
  {/if}

  {#if showAbout}<AboutPanel onclose={() => showAbout = false}/>{/if}
</main>
