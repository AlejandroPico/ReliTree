import initSqlJs, { type Database, type QueryExecResult } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let databasePromise: Promise<Database> | null = null;

export function loadDatabase(): Promise<Database> {
  if (databasePromise) return databasePromise;
  databasePromise = (async () => {
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    const response = await fetch(`${import.meta.env.BASE_URL}data/relitree.sqlite`);
    if (!response.ok) throw new Error(`No se pudo cargar SQLite (${response.status}).`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    return new SQL.Database(bytes);
  })();
  return databasePromise;
}

export async function queryDatabase(sql: string): Promise<QueryExecResult[]> {
  const database = await loadDatabase();
  return database.exec(sql);
}
