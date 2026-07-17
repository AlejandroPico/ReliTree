<script lang="ts">
  import { ExternalLink, X } from '@lucide/svelte';
  let { onclose }: { onclose: () => void } = $props();
</script>

<aside class="about-panel" aria-label="Guía y metodología de RELI3">
  <header><div><span>METODOLOGÍA Y ALCANCE</span><h2>Cómo leer RELI3</h2></div><button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={19}/></button></header>
  <div class="about-body">
    <p class="about-lead">RELI3 es un atlas histórico, no una clasificación de la verdad ni un árbol biológico. El eje vertical representa tiempo; el horizontal organiza ámbitos geoculturales para facilitar la lectura.</p>
    <section><span>01</span><div><h3>Qué significa una rama</h3><p>Una línea vertical marca la duración aproximada de una tradición. La conexión de origen puede significar continuidad, reforma, migración, influencia, sincretismo o contexto. El tipo aparece en la ficha.</p></div></section>
    <section><span>02</span><div><h3>Fechas y pasado profundo</h3><p>Las fundaciones modernas pueden fecharse por año. Las religiones antiguas suelen emerger gradualmente y se muestran por siglo o milenio. Antes de la escritura sólo se representan complejos arqueológicos, nunca doctrinas inventadas.</p></div></section>
    <section><span>03</span><div><h3>Territorio no es esencia</h3><p>Las bandas horizontales son lugares de origen o desarrollo histórico, no fronteras rígidas. Las migraciones y diásporas cruzan bandas; una misma tradición puede generar desarrollos regionales diferentes.</p></div></section>
    <section><span>04</span><div><h3>Tres niveles de comprobación</h3><p>La infografía principal aporta la matriz cronológica; la versión beta ayuda a resolver ramas grandes; el PDF de Wikipedia funciona como verificador nominal. RELI3 añade tipos de relación y niveles de certeza que la imagen no puede expresar por sí sola.</p></div></section>
    <section><span>05</span><div><h3>Ampliación progresiva</h3><p>El catálogo verificador contiene más nombres que el lienzo actual. Una entrada pasa al mapa cuando tiene región, cronología, relación y control de fuentes suficientes. Así puede crecer sin degradar la fiabilidad.</p></div></section>
    <footer>
      <p><b>Referencia visual acreditada</b><br/>Simon E. Davies, <em>The Great Tree of Religion 3.0</em>. La obra original no se redistribuye en RELI3.</p>
      <a href="https://www.treeofreligion.com/" target="_blank" rel="noreferrer">Sitio del autor <ExternalLink size={14}/></a>
      <a href="https://en.wikipedia.org/wiki/List_of_religions_and_spiritual_traditions" target="_blank" rel="noreferrer">Listado verificador <ExternalLink size={14}/></a>
    </footer>
  </div>
</aside>
