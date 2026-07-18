# Modelo de datos de ReliTree

## Principio

ReliTree separa cuatro conceptos que una infografía plana suele mezclar:

1. **Entidad:** religión, tradición, denominación o variante visible en el lienzo mediante título, subtítulo y fecha.
2. **Ubicación:** año, área principal, áreas asociadas y posición relativa dentro de la banda geográfica.
3. **Relación dirigida:** conexión principal, secundaria, hipotética, de fusión o de migración; una entidad admite cualquier número de entradas y salidas.
4. **Acontecimiento:** hecho histórico que afecta una o varias áreas sin ser una religión.

## Tablas SQLite

| Tabla | Función |
|---|---|
| `regions` | Bandas geoculturales, orden, color, anchura y separación mínima. |
| `traditions` | Entidades, título, subtítulo, fechas, coordenadas, icono, ficha y estilo. |
| `tradition_regions` | Relación de múltiples áreas con cada entidad. |
| `aliases` | Grafías y denominaciones alternativas. |
| `tradition_sources` | Procedencia editorial de cada entrada. |
| `relations` | Enlaces dirigidos con papel, intensidad, recorrido, gradiente y evidencia. |
| `events` | Migraciones, textos, contactos y transformaciones históricas. |
| `event_regions` | Áreas afectadas por cada acontecimiento. |
| `verifier_catalog` | Nombres extraídos del PDF de comprobación, cartografiados o pendientes. |
| `metadata` | Versión, fecha de generación y aviso metodológico. |

## Escala temporal

El eje no es lineal. Reserva mucho espacio a los últimos cuatro milenios, donde se concentra la documentación nominal, y comprime gradualmente el pasado profundo hasta 400.000 a. e. c. La función por tramos vive en `src/lib/timeline.ts` y dispone de pruebas de reversibilidad.

## Fuente canónica y generación

`data/reli-tree-project.json` es la fuente editorial intercambiable con el editor autónomo. `scripts/generate-data.mjs` la valida y genera `src/data/atlas.json`, que consume la aplicación. `scripts/build-database.mjs` transforma el atlas y el catálogo verificador en `public/data/relitree.sqlite`. El build vuelve a generar los artefactos para impedir divergencias.

## Formato editorial 2

Cada entidad conserva `regionIds`, `placement`, `icon`, `details` y `visual`. Las áreas poseen anchura variable. Las relaciones almacenan `role`, `strength` y un estilo capaz de dibujar líneas rectas, ortogonales o curvas con uno o varios colores. El editor migra automáticamente los proyectos de formato 1.

Los iconos se resuelven al compilar desde `public/icons/` por identificador o nombre normalizado. También pueden indicarse mediante ruta o incrustarse como SVG en el JSON.
