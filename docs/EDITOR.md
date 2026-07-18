# Editor autónomo de ReliTree

## Ejecución en Windows

El editor se distribuye como `ReliTree-Editor.html`. No requiere instalación, Python, Java ni un servidor local: basta con abrirlo mediante Microsoft Edge, Chrome o Firefox. Toda la edición ocurre en el equipo del usuario.

## Herramientas

- **Seleccionar (V):** abre el inspector. Un nodo puede arrastrarse horizontalmente entre áreas y carriles, y verticalmente para modificar su año.
- **Selección múltiple (M):** acumula entidades, relaciones y acontecimientos para aplicar estilos o eliminarlos en grupo.
- **Desplazar (H):** recorre el lienzo sin modificar elementos.
- **Añadir nodo (N):** crea una entidad en el punto temporal y geográfico pulsado.
- **Crear unión (L):** selecciona primero la entidad de origen y después la de destino. No hay límite de entradas o salidas.
- **Añadir acontecimiento (E):** crea una línea histórica en el año y área pulsados.

La rueda controla el zoom. `Supr` solicita confirmación antes de eliminar; `Ctrl+Z` y `Ctrl+Y` deshacen o rehacen; `Ctrl+S` guarda el proyecto; `Ctrl+O` abre otro proyecto.

## Inspector

El botón **Proyecto** abre una ventana central de configuración: nombre, abreviatura, anchura, separación, color, descripción, orden y eliminación segura de áreas; marcas temporales; presente editorial; cuadrícula; y referencia.

El inspector de entidad permite editar:

- título, subtítulo y fecha, los tres datos visibles en el mapa;
- área principal, múltiples áreas asociadas, posición porcentual y correcciones X/Y;
- separación automática de entidades coincidentes por fecha y territorio;
- icono mediante ruta del repositorio o SVG incrustado;
- familia, clase, estado, resumen, historia, doctrinas, evidencia y bibliografía;
- color, radio, opacidad, visibilidad y desplazamiento de las etiquetas;
- anchura independiente de la línea vertical de duración;
- relaciones de entrada y salida, incluyendo fusiones con varios orígenes;
- título, año, áreas afectadas, clase y resumen de acontecimientos.

El inspector de relación controla origen, destino, papel visual, intensidad de 1 a 100, confianza, forma recta/ortogonal/curva, desplazamiento, color, gradiente multicolor, grosor y patrón discontinuo. Los puntos de paso —editables también arrastrándolos— permiten encaminar una expansión por varias áreas y fechas. El degradado automático adopta los colores del origen, cada escala territorial y el destino.

Los acontecimientos pueden afectar áreas completas, entidades seleccionadas o ambas. Esto permite situar concilios, cismas, decisiones doctrinales, textos, persecuciones y otros hitos sobre una rama sin crear una religión nueva.

Los patrones de trazo usan la sintaxis SVG: `7 7` crea una línea discontinua, `2 3` una línea punteada y un valor vacío una línea continua.

## Iconos automáticos

Los SVG del repositorio se guardan en `public/icons/`. El build intenta asociarlos por identificador (`christianity.svg`) y después por nombre normalizado (`cristianismo.svg`). Mientras no exista icono, la entidad se muestra como una esfera. En ambos casos aparecen debajo título, subtítulo y fecha.

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

Toda eliminación exige una confirmación explícita, incluidas áreas, entidades, relaciones, acontecimientos, marcas temporales, puntos de paso, iconos y referencias. Las eliminaciones confirmadas siguen siendo recuperables mediante `Ctrl+Z` mientras continúe abierta la sesión.

Todos los controles ofrecen ayuda contextual al mantener el puntero sobre ellos. Las listas de entidades se ordenan alfabéticamente en español.
