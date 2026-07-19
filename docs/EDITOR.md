# Atlas Studio · editor autónomo de proyectos

## Ejecución en Windows

El editor se distribuye como `Atlas-Studio.html` y mantiene `ReliTree-Editor.html` como ruta compatible. Siempre se inicia con un proyecto vacío. No requiere instalación, Python, Java ni un servidor local: basta con abrirlo mediante Microsoft Edge, Chrome o Firefox y, si procede, cargar un JSON de proyecto.

## Herramientas

- **Seleccionar (V):** abre el inspector. En un lienzo libre, entidades y acontecimientos pueden arrastrarse a cualquier coordenada; en un tablero estructurado también pueden anclarse a un área y un valor del eje.
- **Selección múltiple (M):** arrastra un recuadro sobre el tablero, como en Windows, para capturar entidades, relaciones y acontecimientos. `Mayús` añade el resultado a la selección existente.
- **Transformar referencia (R):** selecciona cualquiera de las capas de imagen, la mueve y modifica su tamaño con cuatro tiradores visibles a cualquier zoom. `Mayús` conserva la proporción y `Alt` redimensiona desde el centro.
- **Desplazar (H):** recorre el lienzo sin modificar elementos.
- **Añadir nodo (N):** crea una entidad libre exactamente donde se pulsa; las áreas y fechas son opcionales.
- **Crear unión (L):** selecciona primero la entidad de origen y después la de destino. No hay límite de entradas o salidas.
- **Añadir acontecimiento (E):** crea una línea histórica en el año y área pulsados.

La rueda controla el zoom. `Supr` solicita confirmación antes de eliminar; `Ctrl+Z` y `Ctrl+Y` deshacen o rehacen; `Ctrl+S` guarda el proyecto; `Ctrl+O` abre otro proyecto.

## Inspector

El botón **Tablero** abre una ventana central de configuración. El lienzo tiene anchura, altura, color y opacidad propios y no necesita áreas. El eje Y puede ser cronológico, numérico, categórico o inexistente. Cada área opcional dispone de forma, relleno, opacidad, borde y cabecera independientes; incluso la última área puede eliminarse y los objetos afectados pasan a coordenadas libres.

El inspector de entidad permite editar:

- título, subtítulo y fecha, los tres datos visibles en el mapa;
- área principal, múltiples áreas asociadas, posición porcentual y correcciones X/Y;
- separación automática de entidades coincidentes por fecha y territorio;
- icono mediante ruta del repositorio o SVG incrustado, con fondo transparente/blanco/negro/personalizado, opacidad e inversión de colores;
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

## Referencias y fondos

El botón **Referencia** añade una imagen sin sustituir las anteriores. Cada capa puede actuar como referencia o fondo y conserva nombre, anchura, altura, posición, giro, visibilidad y opacidad. Puede transformarse mediante tiradores, encajarse al lienzo o eliminarse con confirmación.

Cada imagen puede guardarse dentro del proyecto como `data:` URL. Esto permite reabrir el JSON sin buscar los archivos originales, aunque aumenta el tamaño y no debe usarse para publicar material con restricciones de redistribución.

## Catálogos del proyecto

Los tipos de entidad, estados, tipos y papeles de relación, tipos de acontecimiento y niveles de confianza son listas editables. Se almacenan en el propio JSON, no en la instalación del editor. Borrar una opción del catálogo no elimina ni altera los objetos que ya conserven su identificador.

## Formato y publicación

El botón **Guardar proyecto** produce un JSON de formato 5. El archivo de ReliTree disponible mediante `Alt` + **Exportar SVG vectorial** continúa siendo un proyecto separado y compatible. Para que la web adopte cambios de ReliTree:

1. sustituir `data/reli-tree-project.json` en el repositorio;
2. revisar y confirmar el commit en `main`;
3. dejar que GitHub Actions ejecute la validación y despliegue.

El build comprueba regiones, identificadores, padres y extremos de las relaciones antes de generar `src/data/atlas.json`, la base SQLite, el editor actualizado y GitHub Pages. Un proyecto inválido detiene el despliegue en vez de publicar un árbol corrupto.

## Seguridad de los datos

El editor no transmite el proyecto ni las imágenes a ningún servicio. Las descargas se generan en el navegador. Existe un autoguardado local sin la imagen de referencia como protección adicional, pero el archivo JSON descargado es la copia que debe conservarse y versionarse.

Toda eliminación exige una confirmación explícita, incluidas áreas, entidades, relaciones, acontecimientos, marcas temporales, puntos de paso, iconos y referencias. Las eliminaciones confirmadas siguen siendo recuperables mediante `Ctrl+Z` mientras continúe abierta la sesión.

Todos los controles ofrecen ayuda contextual al mantener el puntero sobre ellos. Las listas de entidades se ordenan alfabéticamente en español.
