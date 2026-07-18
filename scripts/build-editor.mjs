import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = resolve(root, 'editor/ReliTree-Editor.template.html');
const projectPath = resolve(root, 'data/reli-tree-project.json');
const outputPath = resolve(root, 'public/editor/Atlas-Studio.html');
const compatibilityPath = resolve(root, 'public/editor/ReliTree-Editor.html');

const [template, projectText] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(projectPath, 'utf8')
]);

const project = JSON.parse(projectText);
const serialized = JSON.stringify(project).replaceAll('</script', '<\\/script');
const marker = '/*__RELITREE_PROJECT__*/null';
if (!template.includes(marker)) throw new Error('No se encontró el marcador del proyecto en la plantilla del editor.');

await mkdir(dirname(outputPath), { recursive: true });
const builtEditor = template.replace(marker, serialized);
await Promise.all([writeFile(outputPath, builtEditor, 'utf8'), writeFile(compatibilityPath, builtEditor, 'utf8')]);
console.log(`Atlas Studio autónomo generado: ${outputPath} (con ruta compatible ReliTree-Editor.html)`);
