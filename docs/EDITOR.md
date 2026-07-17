# Editor autónomo de ReliTree

## Ejecución en Windows

El editor se distribuye como `ReliTree-Editor.html`. No requiere instalación, Python, Java ni un servidor local: basta con abrirlo mediante Microsoft Edge, Chrome o Firefox. Toda la edición ocurre en el equipo del usuario.

## Herramientas

- **Seleccionar (V):** abre el inspector. Un nodo puede arrastrarse horizontalmente entre áreas y carriles, y verticalmente para modificar su año.
- **Desplazar (H):** recorre el lienzo sin modificar elementos.
- **Añadir nodo (N):** crea una tradición en el punto temporal y geográfico pulsado.
- **Crear unión (L):** selecciona primero el nodo de origen y después el de destino.
- **Añadir acontecimiento (E):** crea una línea histórica en el año y área pulsados.

La rueda controla el zoom. `Supr` elimina la selección; `Ctrl+Z` y `Ctrl+Y` deshacen o rehacen; `Ctrl+S` guarda el proyecto; `Ctrl+O` abre otro proyecto.

## Inspector

El inspector permite editar:

- nombre, identificador, área, carril, año inicial y final;
- padre y tipo de relación genealógica;
- familia, clase, estado, importancia y resumen;
- color, grosor, patrón SVG del trazo, opacidad y visibilidad;
- radio del punto y desplazamiento de la etiqueta;
- origen, destino, clase, confianza y nota de las uniones;
- título, año, áreas afectadas, clase y resumen de acontecimientos.

Los patrones de trazo usan la sintaxis SVG: `7 7` crea una línea discontinua, `2 3` una línea punteada y un valor vacío una línea continua.

## Imagen de referencia

El botón **Referencia** carga localmente una imagen y la sitúa detrás de la estructura vectorial. Su posición, escala y opacidad se ajustan en el inspector del proyecto.

La referencia no se guarda por defecto. Activar **Incrustar referencia al guardar** añade la imagen como `data:` URL y puede aumentar mucho el tamaño del JSON; no debe activarse para publicar material de referencia con restricciones de redistribución.

## Formato y publicación

El botón **Guardar proyecto** produce `reli-tree-project.json`. Para que la web adopte los cambios:

1. sustituir `data/reli-tree-project.json` en el repositorio;
2. revisar y confirmar el commit en `main`;
3. dejar que GitHub Actions ejecute la validación y despliegue.

El build comprueba regiones, identificadores, padres y extremos de las relaciones antes de generar `src/data/atlas.json`, la base SQLite, el editor actualizado y GitHub Pages. Un proyecto inválido detiene el despliegue en vez de publicar un árbol corrupto.

## Seguridad de los datos

El editor no transmite el proyecto ni las imágenes a ningún servicio. Las descargas se generan en el navegador. Existe un autoguardado local sin la imagen de referencia como protección adicional, pero el archivo JSON descargado es la copia que debe conservarse y versionarse.
