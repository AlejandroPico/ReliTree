<script lang="ts">
  import { X } from '@lucide/svelte';
  let { onclose }: { onclose: () => void } = $props();
</script>

<aside class="hud-panel legend-panel" aria-label="Leyenda del atlas">
  <header><div><span>CÓDIGO VISUAL</span><h2>Leyenda</h2></div><button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={17}/></button></header>
  <section class="legend-lines">
    <div><i class="line descent"></i><span><b>Continuidad o descendencia</b><small>Enlace institucional o genealógico razonablemente directo</small></span></div>
    <div><i class="line reform"></i><span><b>Reforma</b><small>Reorganización consciente de una tradición anterior</small></span></div>
    <div><i class="line influence"></i><span><b>Influencia</b><small>Préstamo o impacto sin relación padre-hijo</small></span></div>
    <div><i class="line syncretism"></i><span><b>Sincretismo</b><small>Combinación histórica de repertorios distintos</small></span></div>
    <div><i class="line context"></i><span><b>Contexto</b><small>Origen en un mismo entorno; no implica descendencia</small></span></div>
  </section>
  <section class="legend-symbols"><p><i class="active-dot"></i><span><b>Rama activa</b><small>La línea alcanza el presente</small></span></p><p><i class="historic-dot"></i><span><b>Rama histórica</b><small>La línea termina en su fecha final</small></span></p><p><i class="event-dash"></i><span><b>Acontecimiento</b><small>Contexto transversal, no una religión</small></span></p></section>
  <p class="method-note">Los colores codifican áreas geoculturales, no “razas”, doctrinas ni grados de verdad.</p>
</aside>
