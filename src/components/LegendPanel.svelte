<script lang="ts">
  import { X } from '@lucide/svelte';
  let { onclose }: { onclose: () => void } = $props();
</script>

<aside class="hud-panel legend-panel" aria-label="Leyenda del atlas">
  <header><div><span>CÓDIGO VISUAL</span><h2>Leyenda</h2></div><button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={17}/></button></header>
  <section class="legend-lines">
    <div><i class="line primary"></i><span><b>Relación principal</b><small>Continuidad, descendencia o transformación directa</small></span></div>
    <div><i class="line secondary"></i><span><b>Relación secundaria</b><small>Influencia parcial, contexto o tradición compartida</small></span></div>
    <div><i class="line hypothetical"></i><span><b>Relación hipotética</b><small>Conexión propuesta con evidencia limitada o discutida</small></span></div>
    <div><i class="line fusion"></i><span><b>Fusión o sincretismo</b><small>Dos o más orígenes convergen en una entidad posterior</small></span></div>
    <div><i class="line migration"></i><span><b>Migración o difusión global</b><small>El gradiente puede recorrer varios colores territoriales</small></span></div>
  </section>
  <section class="legend-symbols"><p><i class="active-dot"></i><span><b>Rama activa</b><small>La línea alcanza el presente</small></span></p><p><i class="historic-dot"></i><span><b>Rama histórica</b><small>La línea termina en su fecha final</small></span></p><p><i class="event-dash"></i><span><b>Acontecimiento</b><small>Contexto transversal, no una religión</small></span></p></section>
  <p class="method-note">El grosor representa intensidad editorial de 1 a 100. Los colores pueden formar gradientes multiterritoriales; no codifican “razas”, doctrinas ni grados de verdad.</p>
</aside>
