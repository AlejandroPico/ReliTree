# Modelo de datos de ReliTree

## Principio

ReliTree separa cuatro conceptos que una infografía plana suele mezclar:

1. **Tradición:** entidad visible en el lienzo.
2. **Relación parental:** conexión principal que coloca una rama.
3. **Relación transversal:** influencia, contexto o sincretismo que no debe forzarse como padre único.
4. **Acontecimiento:** hecho histórico que afecta una o varias áreas sin ser una religión.

## Tablas SQLite

| Tabla | Función |
|---|---|
| `regions` | Doce bandas geoculturales y su orden horizontal. |
| `traditions` | Nombre, fechas, clasificación, estado, certeza y posición de las ramas. |
| `aliases` | Grafías y denominaciones alternativas. |
| `tradition_sources` | Procedencia editorial de cada entrada. |
| `relations` | Influencias, sincretismos y otros enlaces no jerárquicos. |
| `events` | Migraciones, textos, contactos y transformaciones históricas. |
| `event_regions` | Áreas afectadas por cada acontecimiento. |
| `verifier_catalog` | Nombres extraídos del PDF de comprobación, cartografiados o pendientes. |
| `metadata` | Versión, fecha de generación y aviso metodológico. |

## Escala temporal

El eje no es lineal. Reserva mucho espacio a los últimos cuatro milenios, donde se concentra la documentación nominal, y comprime gradualmente el pasado profundo hasta 400.000 a. e. c. La función por tramos vive en `src/lib/timeline.ts` y dispone de pruebas de reversibilidad.

## Fuente canónica y generación

`data/reli-tree-project.json` es la fuente editorial intercambiable con el editor autónomo. `scripts/generate-data.mjs` la valida y genera `src/data/atlas.json`, que consume la aplicación. `scripts/build-database.mjs` transforma el atlas y el catálogo verificador en `public/data/relitree.sqlite`. El build vuelve a generar los artefactos para impedir divergencias.

## Próximas ampliaciones previstas

- múltiples áreas por tradición, con periodos diferenciados;
- fechas mínimas y máximas en vez de un solo año aproximado;
- citas bibliográficas normalizadas por afirmación;
- importador editorial CSV/JSON con validación de ciclos;
- enlaces múltiples de sincretismo con peso y dirección;
- traducción de nombres y fichas sin duplicar identidades;
- historial de cambios y estado de revisión por especialista.
