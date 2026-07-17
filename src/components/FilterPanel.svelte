<script lang="ts">
  import { RotateCcw, X } from '@lucide/svelte';
  import type { AtlasData, RegionId, TraditionKind } from '../data/types';

  let {
    data, selectedRegions, kind, activeOnly, posterOnly, showEvents, showRelations,
    onregions, onkind, onactive, onposter, onevents, onrelations, onreset, onclose
  }: {
    data: AtlasData;
    selectedRegions: RegionId[];
    kind: TraditionKind | 'all';
    activeOnly: boolean;
    posterOnly: boolean;
    showEvents: boolean;
    showRelations: boolean;
    onregions: (regions: RegionId[]) => void;
    onkind: (kind: TraditionKind | 'all') => void;
    onactive: (value: boolean) => void;
    onposter: (value: boolean) => void;
    onevents: (value: boolean) => void;
    onrelations: (value: boolean) => void;
    onreset: () => void;
    onclose: () => void;
  } = $props();

  function toggleRegion(id: RegionId): void {
    onregions(selectedRegions.includes(id) ? selectedRegions.filter((entry) => entry !== id) : [...selectedRegions, id]);
  }
</script>

<aside class="hud-panel filter-panel" aria-label="Filtros del atlas">
  <header><div><span>VISIBILIDAD</span><h2>Filtros</h2></div><button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={17}/></button></header>
  <section><span class="panel-label">ÁREAS GEOCULTURALES</span><div class="region-filter-grid">{#each data.regions as region}<button class:active={selectedRegions.includes(region.id)} style={`--region:${region.color}`} type="button" onclick={() => toggleRegion(region.id)}><i></i>{region.shortName}</button>{/each}</div></section>
  <label class="select-field"><span>TIPO DE ENTRADA</span><select value={kind} onchange={(event) => onkind(event.currentTarget.value as TraditionKind | 'all')}><option value="all">Todos los tipos</option><option value="religion">Religiones</option><option value="denomination">Denominaciones</option><option value="movement">Movimientos</option><option value="philosophy">Filosofías</option><option value="folk">Tradiciones locales</option><option value="ritual-complex">Complejos rituales</option><option value="substrate">Sustratos arqueológicos</option></select></label>
  <section class="switch-list">
    <label><span><b>Sólo activas</b><small>Oculta tradiciones históricas</small></span><input type="checkbox" checked={activeOnly} onchange={(event) => onactive(event.currentTarget.checked)}/><i></i></label>
    <label><span><b>Verificadas en el póster</b><small>Oculta añadidos contextuales</small></span><input type="checkbox" checked={posterOnly} onchange={(event) => onposter(event.currentTarget.checked)}/><i></i></label>
    <label><span><b>Acontecimientos</b><small>Migraciones, contactos y textos</small></span><input type="checkbox" checked={showEvents} onchange={(event) => onevents(event.currentTarget.checked)}/><i></i></label>
    <label><span><b>Relaciones transversales</b><small>Influencia, contexto y sincretismo</small></span><input type="checkbox" checked={showRelations} onchange={(event) => onrelations(event.currentTarget.checked)}/><i></i></label>
  </section>
  <button class="panel-reset" type="button" onclick={onreset}><RotateCcw size={14}/>Restablecer filtros</button>
</aside>
