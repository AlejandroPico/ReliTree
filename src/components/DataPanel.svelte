<script lang="ts">
  import { onMount } from 'svelte';
  import { Database, Download, Play, X } from '@lucide/svelte';
  import { queryDatabase } from '../lib/database';

  let { onclose }: { onclose: () => void } = $props();
  let loading = $state(true);
  let error = $state('');
  let stats = $state<Record<string, number>>({});
  let sql = $state(`SELECT name, start_year, family
FROM traditions
WHERE start_year BETWEEN -800 AND 800
ORDER BY start_year
LIMIT 20;`);
  let columns = $state<string[]>([]);
  let rows = $state<unknown[][]>([]);

  async function loadStats(): Promise<void> {
    loading = true;
    error = '';
    try {
      const result = await queryDatabase(`
        SELECT 'traditions' AS item, COUNT(*) AS total FROM traditions
        UNION ALL SELECT 'regions', COUNT(*) FROM regions
        UNION ALL SELECT 'events', COUNT(*) FROM events
        UNION ALL SELECT 'relations', COUNT(*) FROM relations
        UNION ALL SELECT 'verifier', COUNT(*) FROM verifier_catalog;
      `);
      stats = Object.fromEntries((result[0]?.values ?? []).map(([key, value]) => [String(key), Number(value)]));
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'No se pudo abrir la base de datos.';
    } finally {
      loading = false;
    }
  }

  async function execute(): Promise<void> {
    error = '';
    try {
      if (!/^\s*(SELECT|WITH|PRAGMA)\b/i.test(sql)) throw new Error('El explorador público sólo permite consultas de lectura.');
      const result = await queryDatabase(sql);
      columns = result[0]?.columns ?? [];
      rows = result[0]?.values ?? [];
    } catch (cause) {
      columns = [];
      rows = [];
      error = cause instanceof Error ? cause.message : 'Consulta no válida.';
    }
  }

  onMount(loadStats);
</script>

<aside class="hud-panel data-panel" aria-label="Base de datos ReliTree">
  <header><div><span>SQLITE · WEBASSEMBLY</span><h2>Datos</h2></div><button class="icon-button" type="button" aria-label="Cerrar" onclick={onclose}><X size={17}/></button></header>
  {#if loading}<p class="loading-state"><Database size={18}/>Abriendo la base SQLite…</p>{:else if error && !Object.keys(stats).length}<p class="error-state">{error}</p>{:else}
    <section class="database-stats"><div><b>{stats.traditions ?? 0}</b><span>ramas cartografiadas</span></div><div><b>{stats.verifier ?? 0}</b><span>nombres en el verificador</span></div><div><b>{stats.events ?? 0}</b><span>acontecimientos</span></div><div><b>{stats.relations ?? 0}</b><span>vínculos transversales</span></div></section>
    <section class="sql-console">
      <div><span>CONSULTA DE SÓLO LECTURA</span><button type="button" onclick={execute}><Play size={13}/>Ejecutar</button></div>
      <textarea bind:value={sql} spellcheck="false" aria-label="Consulta SQL"></textarea>
      {#if error}<p class="error-state">{error}</p>{/if}
      {#if columns.length}
        <div class="sql-results"><table><thead><tr>{#each columns as column}<th>{column}</th>{/each}</tr></thead><tbody>{#each rows as row}<tr>{#each row as value}<td>{value ?? '—'}</td>{/each}</tr>{/each}</tbody></table></div>
      {/if}
    </section>
    <a class="database-download" href={`${import.meta.env.BASE_URL}data/relitree.sqlite`} download><Download size={15}/>Descargar relitree.sqlite</a>
  {/if}
</aside>
