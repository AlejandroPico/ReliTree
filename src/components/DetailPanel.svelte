<script lang="ts">
  import { CalendarRange, ChevronRight, Focus, GitBranch, MapPin, Network, ShieldCheck, X } from '@lucide/svelte';
  import type { AtlasData, RelationKind, Tradition } from '../data/types';
  import { dateRange, formatYear } from '../lib/timeline';

  let {
    tradition,
    data,
    onclose,
    onfocus,
    onselect
  }: {
    tradition: Tradition;
    data: AtlasData;
    onclose: () => void;
    onfocus: (id: string) => void;
    onselect: (tradition: Tradition) => void;
  } = $props();

  let tab = $state<'summary' | 'lineage' | 'evidence'>('summary');
  const region = $derived(data.regions.find((entry) => entry.id === tradition.regionId)!);
  const regions = $derived(data.regions.filter((entry) => (tradition.regionIds ?? [tradition.regionId]).includes(entry.id)));
  const parent = $derived(tradition.parentId ? data.traditions.find((entry) => entry.id === tradition.parentId) ?? null : null);
  const children = $derived(data.traditions.filter((entry) => entry.parentId === tradition.id));
  const relations = $derived(data.relations.filter((entry) => entry.sourceId === tradition.id || entry.targetId === tradition.id));
  const relationLabels: Record<RelationKind, string> = {
    descent: 'continuidad / descendencia', schism: 'cisma', reform: 'reforma', influence: 'influencia',
    syncretism: 'sincretismo', fusion: 'fusión', adoption: 'adopción', transmission: 'transmisión',
    coexistence: 'coexistencia', opposition: 'oposición', migration: 'migración / difusión',
    revival: 'revitalización', succession: 'sucesión', context: 'contexto compartido'
  };
  const confidenceLabels = { high: 'alta', medium: 'media', low: 'baja', hypothesis: 'hipótesis' } as const;
  const precisionLabels = {
    year: 'año documentado', decade: 'década aproximada', century: 'siglo aproximado', millennium: 'milenio aproximado',
    'deep-time': 'intervalo de pasado profundo', disputed: 'cronología discutida'
  } as const;
  const sourceLabels = {
    'poster-3': 'The Great Tree of Religion 3.0',
    'poster-beta': 'The Great Tree of Religion 3.0 · beta',
    'wikipedia-list': 'Listado verificador de Wikipedia',
    'academic-synthesis': 'Síntesis histórico-comparativa inicial'
  } as const;
</script>

<aside class="detail-panel" style={`--accent:${region.color}`} aria-label={`Ficha de ${tradition.name}`}>
  <header class="detail-heading">
    <div>
      <span class="eyebrow">{tradition.status === 'active' ? 'TRADICIÓN ACTIVA' : tradition.status === 'historical' ? 'TRADICIÓN HISTÓRICA' : tradition.status.toLocaleUpperCase('es')}</span>
      <h2>{tradition.name}</h2>
      <p>{tradition.subtitle || tradition.family}</p>
    </div>
    <button class="icon-button" type="button" aria-label="Cerrar ficha" onclick={onclose}><X size={19}/></button>
  </header>

  <nav class="detail-tabs" aria-label="Secciones de la ficha">
    <button class:active={tab === 'summary'} type="button" onclick={() => tab = 'summary'}><CalendarRange size={14}/>Resumen</button>
    <button class:active={tab === 'lineage'} type="button" onclick={() => tab = 'lineage'}><GitBranch size={14}/>Relaciones</button>
    <button class:active={tab === 'evidence'} type="button" onclick={() => tab = 'evidence'}><ShieldCheck size={14}/>Evidencia</button>
  </nav>

  <div class="detail-body">
    {#if tab === 'summary'}
      <p class="detail-lead">{tradition.details?.overview || tradition.summary}</p>
      <dl class="plain-facts">
        <div><dt><CalendarRange size={14}/>Cronología</dt><dd>{dateRange(tradition.startYear, tradition.endYear)}</dd></div>
        <div><dt><MapPin size={14}/>Ámbito horizontal</dt><dd>{regions.map((entry) => entry.name).join(' · ')}</dd></div>
        <div><dt><Network size={14}/>Clasificación</dt><dd>{tradition.kind} · {tradition.family}</dd></div>
      </dl>
      {#if tradition.alternativeNames.length}
        <section class="detail-section"><span>NOMBRES ALTERNATIVOS</span><p>{tradition.alternativeNames.join(' · ')}</p></section>
      {/if}
      {#if tradition.details?.history}<section class="detail-section"><span>DESARROLLO HISTÓRICO</span><p>{tradition.details.history}</p></section>{/if}
      {#if tradition.details?.beliefs}<section class="detail-section"><span>DOCTRINAS Y PRÁCTICAS</span><p>{tradition.details.beliefs}</p></section>{/if}
      <button class="focus-button" type="button" onclick={() => onfocus(tradition.id)}><Focus size={15}/>Centrar esta rama en el lienzo</button>
    {:else if tab === 'lineage'}
      <p class="section-intro">Los vínculos no significan siempre descendencia. Cada conexión declara su lectura histórica.</p>
      {#if parent}
        <section class="lineage-section">
          <span>ANTECEDENTE REPRESENTADO · {relationLabels[tradition.relationToParent ?? 'context']}</span>
          <button type="button" onclick={() => onselect(parent)}><div><b>{parent.name}</b><small>{formatYear(parent.startYear)}</small></div><ChevronRight size={16}/></button>
        </section>
      {/if}
      {#if children.length}
        <section class="lineage-section">
          <span>RAMAS POSTERIORES · {children.length}</span>
          {#each children as child}
            <button type="button" onclick={() => onselect(child)}><div><b>{child.name}</b><small>{relationLabels[child.relationToParent ?? 'context']} · {formatYear(child.startYear)}</small></div><ChevronRight size={16}/></button>
          {/each}
        </section>
      {/if}
      {#if relations.length}
        <section class="relation-list">
          <span>RELACIONES TRANSVERSALES</span>
          {#each relations as relation}
            {@const otherId = relation.sourceId === tradition.id ? relation.targetId : relation.sourceId}
            {@const other = data.traditions.find((entry) => entry.id === otherId)}
            <article><b>{relationLabels[relation.kind]} · {other?.name}</b><p>{relation.note}</p><small>certeza {confidenceLabels[relation.confidence]}</small></article>
          {/each}
        </section>
      {/if}
      {#if !parent && !children.length && !relations.length}<p class="empty-state">Esta entrada aún no tiene relaciones estructuradas.</p>{/if}
    {:else}
      <p class="section-intro">La fecha del lienzo es una ayuda de navegación. El registro conserva por separado su precisión y la confianza editorial.</p>
      <dl class="plain-facts">
        <div><dt>Fecha representada</dt><dd>{formatYear(tradition.startYear)}</dd></div>
        <div><dt>Precisión</dt><dd>{precisionLabels[tradition.precision]}</dd></div>
        <div><dt>Confianza inicial</dt><dd>{confidenceLabels[tradition.confidence]}</dd></div>
        <div><dt>Estado</dt><dd>{tradition.status}</dd></div>
      </dl>
      <section class="source-flags">
        <span>CONTROL DE FUENTES</span>
        {#each tradition.sources as source}<p><ShieldCheck size={14}/>{sourceLabels[source]}</p>{/each}
        <p class:missing={!tradition.posterVerified}>{tradition.posterVerified ? 'Localizada en la infografía principal' : 'Añadida como contexto; no verificada en el póster'}</p>
        <p class:missing={!tradition.verifierMatched}>{tradition.verifierMatched ? 'Tiene correspondencia en el catálogo verificador' : 'Entrada arqueológica o de síntesis; sin correspondencia nominal'}</p>
      </section>
      {#if tradition.details?.evidence}<section class="detail-section"><span>NOTAS DE EVIDENCIA</span><p>{tradition.details.evidence}</p></section>{/if}
      {#if tradition.details?.bibliography}<section class="detail-section"><span>BIBLIOGRAFÍA EDITORIAL</span><p>{tradition.details.bibliography}</p></section>{/if}
    {/if}
  </div>
</aside>
