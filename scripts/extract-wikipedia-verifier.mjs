import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const input = process.argv[2];
const output = resolve(process.argv[3] ?? 'src/data/verifier.json');
if (!input) throw new Error('Uso: node scripts/extract-wikipedia-verifier.mjs <documento.pdf> [salida.json]');

const temporary = await mkdtemp(join(tmpdir(), 'reli3-verifier-'));
const textPath = join(temporary, 'source.txt');

try {
  execFileSync('pdftotext', ['-layout', resolve(input), textPath], { stdio: 'inherit' });
  const text = await readFile(textPath, 'utf8');
  const majorHeadings = new Map([
    ['Eastern religions', 'Religiones orientales'],
    ['Abrahamic religions', 'Religiones abrahámicas'],
    ['Iranian religions', 'Religiones iranias'],
    ['Ethnoreligions', 'Etnorreligiones'],
    ['New religious movements', 'Nuevos movimientos religiosos'],
    ['Historical religions', 'Religiones históricas']
  ]);
  const ignoredPrefixes = [
    'https://', '16/7/26', 'List of religions', 'Retrieved from', 'While the word', 'Many religions',
    'The word religion', 'Some academics', 'Religions that', 'Sects such', 'The four world', 'World religions',
    'The following', 'According to', 'This list', 'See also', 'References', 'Bibliography', 'External links'
  ];
  let section = 'Introducción';
  let started = false;
  const entries = [];
  const seen = new Set();

  for (const raw of text.split(/\r?\n/)) {
    const cleanRaw = raw.replace(/^\f/, '');
    const trimmed = cleanRaw.trim();
    if (majorHeadings.has(trimmed)) {
      section = majorHeadings.get(trimmed);
      started = true;
      continue;
    }
    if (trimmed === 'Other categorisations') break;
    if (!started) continue;
    if (!trimmed || ignoredPrefixes.some((prefix) => trimmed.startsWith(prefix))) continue;
    const indent = cleanRaw.match(/^\s*/)?.[0].length ?? 0;
    if (indent < 5 || trimmed.length > 96) continue;
    if (/\b(is|are|was|were|refers|defines|includes|which|that|these|those)\b/i.test(trimmed)) continue;
    if (/^[\d–—-]/.test(trimmed) || /^Global percentage/.test(trimmed)) continue;
    const name = trimmed.replace(/\[\d+(?:]\[\d+)*]/g, '').replace(/\s+/g, ' ').trim();
    if (/[.,;:]$/.test(name) || /\b(and|or|of|the|a|an)$/i.test(name)) continue;
    if (name.length < 2 || !/\p{L}/u.test(name)) continue;
    const key = `${section}|${name.toLocaleLowerCase('en')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ name, section, depth: Math.max(0, Math.round((indent - 5) / 3)) });
  }

  const payload = {
    metadata: {
      source: 'List of religions and spiritual traditions - Wikipedia',
      role: 'Catálogo verificador; la inclusión no implica que cada entrada sea una religión independiente.',
      extractedAt: '2026-07-17',
      count: entries.length
    },
    entries
  };
  await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Verificador generado: ${entries.length} nombres.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
