# RELI3

Atlas cronológico e interactivo de religiones, tradiciones espirituales y contextos culturales. El proyecto representa linajes, reformas, influencias y sincretismos sobre un lienzo vectorial ampliable, con el tiempo en el eje vertical y doce áreas geoculturales en el eje horizontal.

> Primera base funcional · Svelte 5 · TypeScript 6 · Vite 8 · SQLite/WASM · GitHub Pages

## Qué incluye

- Lienzo SVG sin pérdida de resolución, ampliable y desplazable.
- Eje histórico fijo desde el presente hasta 400.000 a. e. c., con escala temporal por tramos.
- Doce bandas geoculturales inspiradas en la organización de *The Great Tree of Religion 3.0*.
- Tradiciones, vínculos históricos y acontecimientos consultables.
- Diferenciación explícita entre descendencia institucional, reforma, influencia, sincretismo y relación contextual.
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

El proceso `npm run data` regenera `src/data/atlas.json`, y `npm run database` produce `public/data/reli3.sqlite`. Ambos se ejecutan automáticamente antes de compilar.

## GitHub Pages

El workflow de `.github/workflows/deploy.yml` valida, compila y publica `dist/` cuando se actualiza `main`. En el repositorio debe estar seleccionada la fuente **GitHub Actions** en `Settings → Pages`.

Dirección prevista: <https://alejandropico.github.io/ReliTree/>

## Criterio histórico

RELI3 no presupone que las religiones formen un árbol biológico único. Una rama puede representar continuidad institucional, reforma, influencia, adaptación o sincretismo; el tipo y el grado de certeza se almacenan en cada relación. Las fechas antiguas son aproximaciones y se muestran con su nivel de precisión.

## Fuentes y derechos

Los documentos de referencia y la metodología se describen en `SOURCES.md`. La infografía de Simon E. Davies se usa como referencia de investigación y contraste; no se redistribuye ni se incrusta en la aplicación. La interfaz y la base estructurada de RELI3 son una implementación propia.
