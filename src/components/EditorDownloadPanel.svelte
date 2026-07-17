<script lang="ts">
  import { Download, FileJson, MonitorDown, X } from '@lucide/svelte';

  let { onclose }: { onclose: () => void } = $props();
</script>

<div class="modal-scrim" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) onclose(); }}>
  <dialog open class="editor-download-panel" aria-labelledby="editor-download-title">
    <header>
      <div><span>HERRAMIENTA AUTÓNOMA</span><h2 id="editor-download-title">Editor de ReliTree</h2></div>
      <button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={19}/></button>
    </header>
    <div class="editor-download-body">
      <div class="editor-download-icon"><MonitorDown size={34}/></div>
      <p>Aplicación independiente de un solo archivo. Se abre con doble clic en Windows, funciona sin conexión y contiene el atlas actual listo para modificar.</p>
      <ul>
        <li>Nodos, ramas, conexiones y acontecimientos.</li>
        <li>Grosores, colores, trazos, opacidad y posiciones.</li>
        <li>Deshacer, rehacer, imagen de referencia y exportación SVG.</li>
      </ul>
      <a class="primary-download" href="./editor/ReliTree-Editor.html" download="ReliTree-Editor.html"><Download size={16}/>Descargar editor</a>
      <a class="secondary-download" href="./data/reli-tree-project.json" download="reli-tree-project.json"><FileJson size={15}/>Descargar proyecto actual</a>
      <small>El archivo guardado por el editor debe subirse al repositorio como <b>data/reli-tree-project.json</b>. La siguiente publicación de GitHub Pages lo convertirá automáticamente en el atlas.</small>
    </div>
  </dialog>
</div>
