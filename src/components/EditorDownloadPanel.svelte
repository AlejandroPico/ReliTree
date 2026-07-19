<script lang="ts">
  import { Download, FileJson, MonitorDown, X } from '@lucide/svelte';

  let { onclose }: { onclose: () => void } = $props();
</script>

<div class="modal-scrim" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) onclose(); }}>
  <dialog open class="editor-download-panel" aria-labelledby="editor-download-title">
    <header>
      <div><span>HERRAMIENTA AUTÓNOMA</span><h2 id="editor-download-title">Atlas Studio</h2></div>
      <button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={19}/></button>
    </header>
    <div class="editor-download-body">
      <div class="editor-download-icon"><MonitorDown size={34}/></div>
      <p>Editor independiente y vacío. Se abre con doble clic en Windows y después carga el archivo del proyecto que quieras editar.</p>
      <ul>
        <li>Nodos, ramas, conexiones y acontecimientos.</li>
        <li>Grosores, colores, trazos, opacidad y posiciones.</li>
        <li>Lienzo libre, ejes opcionales y varias referencias o fondos.</li>
      </ul>
      <a class="primary-download" href="./editor/Atlas-Studio.html" download="Atlas-Studio.html"><Download size={16}/>Descargar editor vacío</a>
      <a class="secondary-download" href="./data/reli-tree-project.json" download="reli-tree-project.json"><FileJson size={15}/>Descargar proyecto actual</a>
      <small>El archivo guardado por el editor debe subirse al repositorio como <b>data/reli-tree-project.json</b>. La siguiente publicación de GitHub Pages lo convertirá automáticamente en el atlas.</small>
    </div>
  </dialog>
</div>
