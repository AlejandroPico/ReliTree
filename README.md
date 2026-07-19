# ReliTree

Atlas cronológico e interactivo de religiones, tradiciones espirituales y contextos culturales. El proyecto representa linajes, reformas, influencias y sincretismos sobre un lienzo vectorial ampliable, con el tiempo en el eje vertical y doce áreas geoculturales en el eje horizontal.

> Primera base funcional · Svelte 5 · TypeScript 6 · Vite 8 · SQLite/WASM · GitHub Pages

## Qué incluye

- Lienzo SVG sin pérdida de resolución, ampliable y desplazable.
- Eje histórico fijo desde el presente hasta el año -400.000, con escala temporal por tramos y años con signo.
- Bandas geoculturales de anchura configurable, inspiradas en la organización de *The Great Tree of Religion 3.0*.
- Tradiciones, vínculos históricos y acontecimientos consultables.
- Entidades con título, subtítulo, fecha, múltiples áreas, iconos SVG y fichas editoriales extensas.
- Relaciones múltiples de entrada y salida, fusiones, intensidades, recorridos multipunto y gradientes territoriales multicolor.
- Acontecimientos regionales o anclados a ramas concretas, útiles para concilios, cismas y otros hitos sin crear entidades artificiales.
- Selección múltiple por recuadro, confirmación universal de borrado y ayuda contextual detallada en el editor autónomo.
- Plantilla de tablero configurable: lienzo, eje, cuadrícula y fondos de zona con forma, relleno, opacidad, borde y cabecera independientes.
- Imagen de referencia transformable sobre el lienzo mediante tiradores, proporciones bloqueables, giro y coordenadas exactas.
- Autoubicación por fecha y territorio con separación automática de colisiones y ajuste manual posterior.
- Buscador, filtros, capas, temas claro/oscuro/automático y fichas documentales.
- Base `SQLite` generada en cada build y consultable en el navegador mediante WebAssembly.
- Catálogo verificador extraído del listado de Wikipedia aportado como documento de referencia.
- Exportación vectorial SVG de la vista completa.

## Desarrollo

Requiere Node.js 24.

```bash
npm install
npm run dev
```

Validación completa:

```bash
npm run validate
```

El proceso `npm run data` valida `data/reli-tree-project.json` y regenera `src/data/atlas.json`; `npm run editor` construye la herramienta autónoma y `npm run database` produce `public/data/relitree.sqlite`. Los tres se ejecutan automáticamente antes de compilar.

## GitHub Pages

El workflow de `.github/workflows/deploy.yml` valida, compila y publica `dist/` cuando se actualiza `main`. En el repositorio debe estar seleccionada la fuente **GitHub Actions** en `Settings → Pages`.

Dirección prevista: <https://alejandropico.github.io/ReliTree/>

## Criterio histórico

ReliTree no presupone que las religiones formen un árbol biológico único. Una rama puede representar continuidad institucional, reforma, influencia, adaptación o sincretismo; el tipo y el grado de certeza se almacenan en cada relación. Las fechas antiguas son aproximaciones y se muestran con su nivel de precisión.

## Fuentes y derechos

Los documentos de referencia y la metodología se describen en `SOURCES.md`. La infografía de Simon E. Davies se usa como referencia de investigación y contraste; no se redistribuye ni se incrusta en la aplicación. La interfaz y la base estructurada de ReliTree son una implementación propia.

## Editor autónomo

`Alt` + clic sobre el botón **Exportar SVG vectorial** abre dos descargas separadas: **Atlas Studio**, que siempre arranca completamente vacío, y el archivo **Proyecto actual**, que contiene los datos de ReliTree. Para editar el atlas hay que descargar ambos y abrir el JSON desde Atlas Studio.

Atlas Studio es un único HTML que funciona sin conexión en Windows. Su lienzo libre no exige áreas, columnas ni fechas; admite ejes cronológicos, numéricos, categóricos o ninguno, varias capas de referencia/fondo, catálogos editables y objetos con coordenadas absolutas.

Para publicar los cambios del editor:

1. Guardar el proyecto desde el editor.
2. Sustituir `data/reli-tree-project.json` en el repositorio.
3. Hacer commit en `main`; GitHub Actions valida el formato y reconstruye el atlas, SQLite y Pages.

El formato 5 de Atlas Studio guarda dentro de cada proyecto sus dimensiones de lienzo, eje opcional, áreas opcionales, catálogos, entidades, relaciones, acontecimientos, estilos de icono y múltiples imágenes de referencia. El formato 4 de ReliTree continúa siendo compatible y se migra al abrirlo, sin modificar el archivo original.

Manual completo: [`docs/EDITOR.md`](docs/EDITOR.md).
