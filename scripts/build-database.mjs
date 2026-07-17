import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const atlas = JSON.parse(await readFile(resolve(root, 'src/data/atlas.json'), 'utf8'));
let verifier = { entries: [] };
try {
  verifier = JSON.parse(await readFile(resolve(root, 'src/data/verifier.json'), 'utf8'));
} catch {
  console.warn('No existe verifier.json; SQLite se generará sin el catálogo auxiliar.');
}

const SQL = await initSqlJs({
  locateFile: (file) => resolve(root, 'node_modules/sql.js/dist', file)
});
const db = new SQL.Database();

db.run(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    color TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    scope TEXT NOT NULL
  );
  CREATE TABLE traditions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL REFERENCES regions(id),
    parent_id TEXT REFERENCES traditions(id),
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    lane REAL NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    date_precision TEXT NOT NULL,
    confidence TEXT NOT NULL,
    family TEXT NOT NULL,
    summary TEXT NOT NULL,
    relation_to_parent TEXT,
    poster_verified INTEGER NOT NULL CHECK (poster_verified IN (0, 1)),
    verifier_matched INTEGER NOT NULL CHECK (verifier_matched IN (0, 1)),
    importance INTEGER NOT NULL CHECK (importance BETWEEN 1 AND 3)
  );
  CREATE TABLE aliases (
    tradition_id TEXT NOT NULL REFERENCES traditions(id),
    alias TEXT NOT NULL,
    PRIMARY KEY (tradition_id, alias)
  );
  CREATE TABLE tradition_sources (
    tradition_id TEXT NOT NULL REFERENCES traditions(id),
    source_id TEXT NOT NULL,
    PRIMARY KEY (tradition_id, source_id)
  );
  CREATE TABLE events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    kind TEXT NOT NULL,
    summary TEXT NOT NULL,
    confidence TEXT NOT NULL
  );
  CREATE TABLE event_regions (
    event_id TEXT NOT NULL REFERENCES events(id),
    region_id TEXT NOT NULL REFERENCES regions(id),
    PRIMARY KEY (event_id, region_id)
  );
  CREATE TABLE relations (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES traditions(id),
    target_id TEXT NOT NULL REFERENCES traditions(id),
    kind TEXT NOT NULL,
    confidence TEXT NOT NULL,
    note TEXT NOT NULL
  );
  CREATE TABLE verifier_catalog (
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    depth INTEGER NOT NULL,
    PRIMARY KEY (name, section)
  );
  CREATE INDEX idx_traditions_region ON traditions(region_id);
  CREATE INDEX idx_traditions_year ON traditions(start_year, end_year);
  CREATE INDEX idx_traditions_family ON traditions(family);
  CREATE INDEX idx_events_year ON events(year);
  CREATE INDEX idx_verifier_name ON verifier_catalog(name);
`);

const insertMetadata = db.prepare('INSERT INTO metadata(key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(atlas.metadata)) insertMetadata.run([key, String(value)]);
insertMetadata.free();

const insertRegion = db.prepare('INSERT INTO regions VALUES (?, ?, ?, ?, ?, ?)');
for (const region of atlas.regions) insertRegion.run([region.id, region.name, region.shortName, region.color, region.order, region.scope]);
insertRegion.free();

const insertTradition = db.prepare(`INSERT INTO traditions VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)`);
const insertAlias = db.prepare('INSERT INTO aliases VALUES (?, ?)');
const insertSource = db.prepare('INSERT INTO tradition_sources VALUES (?, ?)');

const pendingTraditions = [...atlas.traditions];
const orderedTraditions = [];
const insertedIds = new Set();
while (pendingTraditions.length) {
  const ready = pendingTraditions.filter((entry) => !entry.parentId || insertedIds.has(entry.parentId));
  if (!ready.length) throw new Error('No se pudo ordenar la genealogía: existe un ciclo o un padre inexistente.');
  for (const entry of ready) {
    orderedTraditions.push(entry);
    insertedIds.add(entry.id);
    pendingTraditions.splice(pendingTraditions.indexOf(entry), 1);
  }
}

for (const entry of orderedTraditions) {
  insertTradition.run([
    entry.id, entry.name, entry.regionId, entry.parentId, entry.startYear, entry.endYear, entry.lane,
    entry.kind, entry.status, entry.precision, entry.confidence, entry.family, entry.summary,
    entry.relationToParent, Number(entry.posterVerified), Number(entry.verifierMatched), entry.importance
  ]);
  for (const alias of entry.alternativeNames) insertAlias.run([entry.id, alias]);
  for (const source of entry.sources) insertSource.run([entry.id, source]);
}
insertTradition.free();
insertAlias.free();
insertSource.free();

const insertEvent = db.prepare('INSERT INTO events VALUES (?, ?, ?, ?, ?, ?)');
const insertEventRegion = db.prepare('INSERT INTO event_regions VALUES (?, ?)');
for (const event of atlas.events) {
  insertEvent.run([event.id, event.title, event.year, event.kind, event.summary, event.confidence]);
  for (const regionId of event.regionIds) insertEventRegion.run([event.id, regionId]);
}
insertEvent.free();
insertEventRegion.free();

const insertRelation = db.prepare('INSERT INTO relations VALUES (?, ?, ?, ?, ?, ?)');
for (const relation of atlas.relations) insertRelation.run([relation.id, relation.sourceId, relation.targetId, relation.kind, relation.confidence, relation.note]);
insertRelation.free();

const insertVerifier = db.prepare('INSERT OR IGNORE INTO verifier_catalog VALUES (?, ?, ?)');
for (const entry of verifier.entries) insertVerifier.run([entry.name, entry.section, entry.depth]);
insertVerifier.free();

db.run('PRAGMA optimize;');
const output = resolve(root, 'public/data/relitree.sqlite');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, db.export());
db.close();
console.log(`SQLite generado: ${output}`);
