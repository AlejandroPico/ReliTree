# Modelo de datos de ReliTree

## Principio

ReliTree separa cuatro conceptos que una infografía plana suele mezclar:

1. **Entidad:** religión, tradición, denominación o variante visible en el lienzo mediante título, subtítulo y fecha.
2. **Ubicación:** año, área principal, áreas asociadas y posición relativa dentro de la banda geográfica.
3. **Relación dirigida:** conexión principal, secundaria, hipotética, de fusión, influencia, conflicto o migración; admite puntos de paso territoriales/temporales y cualquier número de entradas y salidas.
4. **Acontecimiento:** hecho histórico que afecta áreas, entidades concretas o ambas sin convertirse por ello en una nueva religión.

## Tablas SQLite

| Tabla | Función |
|---|---|
| `regions` | Zonas o categorías, orden, color semántico, anchura, separación y apariencia vectorial del fondo. |
| `traditions` | Entidades, título, subtítulo, fechas, coordenadas, icono, ficha y estilo. |
| `tradition_regions` | Relación de múltiples áreas con cada entidad. |
| `aliases` | Grafías y denominaciones alternativas. |
| `tradition_sources` | Procedencia editorial de cada entrada. |
| `relations` | Enlaces dirigidos con papel, intensidad, recorrido, gradiente y evidencia. |
| `events` | Migraciones, textos, contactos y transformaciones históricas. |
| `event_regions` | Áreas afectadas por cada acontecimiento. |
| `event_entities` | Ramas concretas marcadas por concilios, cismas, textos u otros hitos. |
| `verifier_catalog` | Nombres extraídos del PDF de comprobación, cartografiados o pendientes. |
| `metadata` | Versión, fecha de generación y aviso metodológico. |

## Escala temporal

El eje no es lineal. Reserva mucho espacio a los últimos cuatro milenios, donde se concentra la documentación nominal, y comprime gradualmente el pasado profundo hasta 400.000 a. e. c. La función por tramos vive en `src/lib/timeline.ts` y dispone de pruebas de reversibilidad.

## Fuente canónica y generación

`data/reli-tree-project.json` es la fuente editorial intercambiable con el editor autónomo. `scripts/generate-data.mjs` la valida y genera `src/data/atlas.json`, que consume la aplicación. `scripts/build-database.mjs` transforma el atlas y el catálogo verificador en `public/data/relitree.sqlite`. El build vuelve a generar los artefactos para impedir divergencias.

## Formato editorial 4

`metadata.board` define el título, el preajuste, la presencia del eje, el color del lienzo y el estilo de cuadrícula. Cada área incorpora `appearance`, con forma, relleno, opacidad, borde y cabecera; estos valores se guardan también en `regions.appearance_json` de SQLite. Así, el color semántico de una categoría deja de obligar a teñir su fondo.

Cada entidad conserva `regionIds`, `placement`, `icon`, `details` y `visual`; `visual.timelineWidth` controla de forma independiente la anchura de su duración vertical. Las áreas poseen anchura, separación, orden y descripción variables.

Las relaciones almacenan `role`, `strength`, `route`, `gradientColors`, `autoRegionGradient` y `waypoints`. Cada punto de paso declara territorio, año, porcentaje horizontal, correcciones y color, mientras los extremos se recalculan desde las entidades para que nunca se desprendan al moverlas. Los acontecimientos incorporan `scope` y `entityIds`. El editor migra automáticamente los formatos anteriores.

Los iconos se resuelven al compilar desde `public/icons/` por identificador o nombre normalizado. También pueden indicarse mediante ruta o incrustarse como SVG en el JSON.
