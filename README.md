# El mundo de Fabi

Diez actividades en español, cada una en su propia página, con un menú inicial: **Globos de letras — Aprende el teclado** conserva los retos originales de letras, sílabas y palabras; **Teclado mágico — Explora colores y sonidos** convierte cualquier pulsación en colores, partículas y sonidos suaves, sin objetivos ni puntuación; **Tiempo con calma** muestra cuánto tiempo queda con un reloj de color que se va vaciando; **Respira con la mariposa** acompaña una pausa con alas que se abren y cierran suavemente; **Mi primer piano** convierte el teclado en un instrumento con acordes y una melodía guiada; **Ahorcado — La palabra secreta** invita a descubrir palabras con pistas y seis intentos. **Mi pop it** ofrece 36 burbujas de colores para presionar y volver a llenar. **Plasticonejo** invita a encontrar letras regadas y estampar palabras en una masa de colores. **Astroletras** lleva a un astronauta entre meteoritos con letras: dispara con el teclado y cuida seis vidas. **A colorear** convierte una imagen local en contornos negros para descargar o imprimir y colorear. HTML, CSS y JavaScript puros: sin dependencias para jugar, compilación, cuentas ni backend. Las actividades y la conversión de imágenes funcionan localmente; el buscador opcional de A colorear consulta Openverse por internet.

## Identidad visual

El logo es un pequeño planeta Tierra de océanos azules y continentes verdes, enmarcado por un borde crema para que destaque sobre fondos claros y oscuros. `assets/fabi-world.svg` contiene el símbolo vectorial del encabezado; `assets/favicon.svg` es su versión simplificada para pestañas. El nombre usa texto adaptable a los modos claro y oscuro. Cada página tiene título y descripción propios, incluidos sus metadatos de Open Graph.

## Ejecutar localmente

Abre `index.html` en un navegador moderno (Chrome, Edge, Firefox o Safari). No necesitas instalar nada. Para un origen local estable y guardar el progreso de forma consistente, puedes servir esta carpeta con `python -m http.server 8000`, si tienes Python, y abrir `http://localhost:8000`. Algunos navegadores restringen localStorage al abrir archivos directamente; el juego funciona igualmente sin guardar.

## Publicar en GitHub Pages

1. Sube el contenido del sitio a la raíz del repositorio, incluidas las diez carpetas de páginas de actividades indicadas abajo, las carpetas de recursos y los archivos compartidos `activity-page.js`, `canonical-url.js`, `navigation.js`, `theme.js`, `styles.css` y `theme.css`.
2. En GitHub, entra a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama que contiene estos archivos (por ejemplo, `main`) y la carpeta **/ (root)**. Guarda.
5. Cuando GitHub termine el despliegue, abre la dirección que muestra Pages: `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Los enlaces públicos usan direcciones de carpeta, sin `index.html`. `canonical-url.js` normaliza las direcciones terminadas en `index.html` antes de inicializar Analytics; `navigation.js` conserva la navegación entre archivos al abrir el sitio localmente. Los recursos usan rutas relativas y funcionan en un subdirectorio. No necesitas claves, servicios de pago ni configurar un dominio. La entrega contiene el código listo para publicar; no publica ni modifica la configuración remota del repositorio automáticamente.

Los scripts compartidos y los recursos del piano y del ahorcado tienen una versión en su URL (`?v=…`) para descargar el código actualizado aunque GitHub Pages conserve archivos anteriores en caché. Al modificar esos archivos en una publicación futura, incrementa su versión en las páginas que los cargan. Si el navegador conserva el HTML anterior, usa **Ctrl + F5** después de publicar.

## Páginas de actividades y Google Analytics

La portada es únicamente el menú. Cada tarjeta es un enlace normal a un documento HTML independiente con título, descripción y recursos de su actividad. Las direcciones funcionan al abrirlas directamente, recargar, compartirlas o usar Atrás/Adelante; también admiten publicación bajo un subdirectorio de GitHub Pages.

| Actividad | Dirección |
| --- | --- |
| Globos de letras | `/globos-de-letras/` |
| Teclado mágico | `/teclado-magico/` |
| Tiempo con calma | `/tiempo-con-calma/` |
| Respira con la mariposa | `/respira-con-la-mariposa/` |
| Mi primer piano | `/mi-primer-piano/` |
| Ahorcado | `/ahorcado/` |
| Mi pop it | `/mi-pop-it/` |
| Plasticonejo | `/plasticonejo/` |
| Astroletras | `/astroletras/` |
| A colorear | `/a-colorear/` |

Las doce páginas (menú, diez actividades y agradecimiento) incluyen la etiqueta `G-DSSKXYFM89` una sola vez. Analytics registra la visita normal de cada documento con su ruta y título. Se retiró el evento `activity_open`: ya no hace falta una dimensión personalizada para comparar actividades ni se envían visitas virtuales al pausar, reiniciar o cambiar de nivel dentro de un juego.

Después de publicar, abre **Informes → Interacción → Páginas y pantallas** en Analytics. Usa **Título de página** o **Ruta de página**, y ordena por **Vistas** o **Usuarios activos** para identificar las actividades más visitadas. El tiempo de interacción indica cuánto tiempo permanece la página en primer plano, no necesariamente tiempo jugando. Los datos nuevos comienzan al publicar; los usos anteriores no se redistribuyen entre las nuevas rutas. Si ese informe no aparece en el menú de tu propiedad, un editor puede añadirlo desde la biblioteca de informes.

Referencia: [Informe Páginas y pantallas de GA4](https://support.google.com/analytics/answer/12926732?hl=es-419).

El tema, el sonido y el progreso que ya se guardaba en localStorage se comparten entre páginas del mismo origen. Abrir de nuevo una actividad desde el menú comienza una sesión nueva; las partidas e imágenes que solo estaban en memoria no se guardan al salir. El botón Atrás puede restaurar un documento anterior según la caché del navegador. Cada actividad detiene sus efectos al abandonarla.

`node --test tests/activity-pages.test.cjs` verifica rutas, títulos, recursos, ausencia de juegos ajenos en cada documento, una sola configuración de Analytics, compatibilidad con subdirectorios y preferencias compartidas.

## Fiesta de 7 años de Fabi

La página `fiesta-de-7-anos/index.html` ahora agradece a quienes acompañaron a Fabi en su cumpleaños y los invita a seguir jugando en El mundo de Fabi. Conserva la ilustración del castillo, el estilo de cuento y Google Analytics. El enlace del encabezado y el botón del planeta abren el menú principal mediante una ruta relativa.

Se retiraron los datos del evento, el mapa y la confirmación por WhatsApp, junto con el archivo `rsvp.js`. La carpeta antigua `invitacion/` se eliminó; su dirección ya no redirige. La página de agradecimiento conserva la dirección `/fiesta-de-7-anos/`.

## Cómo jugar

El botón de luna junto al sonido activa el **modo oscuro**: un cielo con estrellas de brillo suave, una luna y colores nocturnos en el menú y las diez actividades. El botón de sol vuelve al modo claro. El modo claro es el predeterminado, con un cielo azul suave y tarjetas pastel para reducir las superficies blancas; después se recuerda la elección en este navegador con `fabi-theme-v1`. Funciona también si el navegador no permite guardar. Las estrellas permanecen quietas cuando se solicita movimiento reducido. `theme.js` aplica la preferencia antes de mostrar la página y `theme.css` contiene los colores y el cielo nocturno.

Elige **Globos de letras**, **Teclado mágico**, **Tiempo con calma**, **Respira con la mariposa**, **Mi primer piano** o **Ahorcado** al abrir la página. Los botones para elegir otra actividad y el logo permiten volver al selector. En Globos de letras, **Inicio**, **Descansar** y **Volver al inicio** mantienen su comportamiento original y regresan a la configuración de Globos de letras.

### A colorear · Tu dibujo, nuevos colores

- **Buscar en Google** es la opción principal: abre el tema escrito en otra pestaña, con búsqueda segura activada. También se puede pulsar **Enter** en ese campo. En Google, usa **Copiar imagen** (no copiar enlace), vuelve a la herramienta y pulsa **Pegar imagen**, o **Ctrl+V / ⌘+V** fuera de un campo de texto. No extrae resultados de Google ni requiere claves, backend o intermediarios; funciona en GitHub Pages.
- **Buscar también en Openverse · Opcional** aparece después del área de pegado y carga, cerrado al abrir la página. Pulsa su encabezado para expandirlo o volver a cerrarlo; abrirlo no inicia búsquedas y cerrarlo conserva los resultados de la sesión. Tiene su propio campo de búsqueda, independiente del de Google.
- El botón de pegado pide acceso al portapapeles solo al pulsarlo; el navegador puede solicitar permiso. Si no lo admite o se rechaza, se puede usar el atajo de pegar o elegir un archivo descargado. No lee el portapapeles al abrir la actividad. Pegar un enlace muestra instrucciones y no descarga esa dirección. Los campos de texto conservan su pegado normal.
- **Buscar imágenes** permite escribir una idea, ver una galería y pulsar **Colorear** para procesar la imagen elegida directamente. Las sugerencias Gatos, Mariposas, Flores y Dinosaurios ayudan a empezar. Se buscan **Dibujos** de forma predeterminada; **Dibujos y fotos** amplía el catálogo. **Ver más imágenes** carga otra página.
- El buscador usa la [API pública de Openverse](https://api.openverse.org/v1/) sin cuentas, claves ni backend. Consulta imágenes declaradas CC0 o de dominio público y excluye los resultados marcados como sensibles por el proveedor (`mature=false`). Algunos temas o personajes pueden tener pocas imágenes en este catálogo. Los nombres en inglés también pueden ayudar.
- La búsqueda envía a Openverse el texto escrito y los filtros; las miniaturas y la imagen seleccionada se descargan desde su servicio de imágenes. La conversión ocurre en el navegador y no se suben archivos propios ni resultados. El buscador no hace peticiones externas hasta iniciar una búsqueda; Analytics se carga al abrir la página. Los resultados se conservan temporalmente en memoria para evitar consultas repetidas.
- Se muestran enlaces a la fuente y licencia de cada resultado, y el crédito de la imagen seleccionada. La resolución depende del original disponible. Si el original falla, intenta usar la miniatura disponible y avisa cuando el resultado tiene menor resolución; las miniaturas que fallan se retiran de la galería. Si el servicio no responde, limita las búsquedas o una imagen no se puede descargar, se muestra un mensaje y la carga local sigue disponible. Elegir otro archivo, quitar la imagen o salir de la actividad cancela la descarga pendiente.
- Elige una imagen **JPG, PNG o WebP**, o arrastra un archivo al recuadro. Admite hasta 20 MB y 40 megapíxeles. **Probar con un ejemplo** dibuja un pequeño jardín localmente para ver la transformación sin elegir un archivo.
- Compara el original con los contornos. Ajusta **Cantidad de detalles**, **Limpiar el dibujo** y **Grosor del trazo**; el resultado se actualiza automáticamente. **Restablecer ajustes** vuelve a los valores iniciales. Las zonas transparentes se convierten en blanco.
- **Descargar PNG** guarda exactamente la hoja mostrada, en blanco y negro y sin interfaz. **Imprimir mi dibujo** abre la impresión del navegador y solo imprime la hoja, incluso en modo oscuro. Las imágenes grandes se reducen conservando su proporción a un máximo de 1400 píxeles en el lado largo; el tamaño final aparece sobre el resultado.
- Funciona mejor con ilustraciones de colores definidos y fondos claros. La conversión es procesamiento local de contornos, sin inteligencia artificial ni servicios externos: las fotos pueden conservar sombras y texturas, y los trazos oscuros anchos pueden dejar contornos dobles. Más limpieza y menos detalle pueden ayudar; no interpreta objetos ni reconstruye partes del dibujo.
- No carga la imagen a internet ni la guarda en localStorage. Se conserva en memoria mientras esta página permanece abierta; **Quitar imagen**, recargar o volver al menú la retira de la herramienta. Los archivos inválidos muestran un mensaje y conservan la última imagen válida.
- `coloring/filters.js` detecta bordes en los canales de color, suaviza, conecta contornos y ajusta el grosor. `coloring/coloring.js` maneja carga, vista previa y exportación; `coloring/search.js` contiene búsqueda, galería, caché y cancelación; `coloring/coloring.css` incluye impresión, móvil y tema oscuro. Todo funciona también abriendo `index.html` directamente.
- `BROWSER_CHANNEL=chrome node tests/coloring-search.test.cjs` comprueba búsqueda y selección con respuestas controladas, errores, cancelación, atribución y exportación sin depender del servicio real (requiere Playwright).
- `BROWSER_CHANNEL=chrome node tests/coloring-paste.test.cjs` comprueba Google en otra pestaña, pegado de imágenes, permisos, enlaces, navegación y cancelación de lecturas pendientes (requiere Playwright).
- `node tests/coloring-filters.test.cjs` comprueba bordes, transparencia, áreas cerradas y ajustes sin dependencias. `BROWSER_CHANNEL=chrome node tests/coloring.test.cjs` comprueba el flujo completo, PNG descargado, errores, navegación, privacidad, impresión y pantallas estrechas (requiere Playwright).

### Astroletras · Una misión de otro planeta

- Pulsa **Despegar** y escribe cualquiera de las letras de los meteoritos para disparar desde el cohete. También puedes usar el teclado en pantalla. Se aceptan mayúsculas, minúsculas y Ñ; mantener una tecla no repite disparos ni daños. Los atajos y las teclas que no son letras se ignoran.
- Empiezas con **6 vidas**. Una letra que no aparece en los meteoritos o un meteorito que alcanza el cohete resta una vida. Las grietas, las alas dañadas y el humo muestran cómo se va destruyendo la nave. Al agotarlas, puedes reparar y reiniciar con seis vidas.
- Destruye **20 meteoritos** para ganar. Empiezas con dos y aparecen hasta tres a la vez, con letras diferentes. Tardan entre 14 y 21 segundos en acercarse; la barrita bajo cada uno muestra el tiempo restante.
- **Pausar**, Escape, salir al menú y cambiar de ventana o pestaña detienen el juego. Al regresar de una pausa, pulsa **Continuar misión**. Abrir la actividad desde el menú o recargar reinicia la partida; no se guardan datos adicionales.
- Comparte el control de sonido. Los efectos y dibujos se generan localmente, sin descargas. Con movimiento reducido, los meteoritos se quedan quietos y sus barras muestran cuánto falta para el impacto.
- `space/space.js` controla la partida y `space/space.css` su aspecto. `BROWSER_CHANNEL=chrome node tests/space.test.cjs` comprueba aciertos, errores, seis vidas, choques, pausa, victoria, reinicio, navegación y pantallas pequeñas (requiere Playwright).

### Plasticonejo · Busca, toca y estampa

- Elige **Fácil (20 letras)**, **Mediano (32 letras)** o **Difícil (48 letras)** y busca con el teclado, el ratón o la pantalla táctil. Empieza en Mediano. Puedes cambiar de dificultad sin perder las huellitas de la palabra actual ni tu colección; solo se reorganizan las letras. La dificultad vuelve a Mediano al abrir la actividad desde el menú o recargar. Incluyen todas las letras de la palabra y otras para hacer más entretenida la búsqueda. Cada acierto estampa una letra en la plastilina del centro; puedes encontrarlas en cualquier orden. Las repetidas se estampan una por una, sin perder el avance al equivocarse. No hay reloj ni vidas.
- La lista inicial es **rosas, dibujos, juguetes, papa, mama, silla, computadora, pepe, lego y flores**. Se recorre en ese orden; **Siguiente palabra** aparece al completar cada una. Todas quedan en una colección durante la sesión. **Volver a jugar** empieza una colección nueva al terminar.
- Un conejito de plastilina acompaña la palabra. Al completarla levanta las patitas, da tres saltitos y se queda sonriendo. El festejo se detiene al salir, perder el foco o cambiar de pestaña; con movimiento reducido, celebra con su sonrisa y estrellas sin saltar.
- **Ver el molde** muestra las siluetas de las letras. Desmárcalo para descubrirlas sin ver la palabra. **Dame una pista** señala una letra pendiente con una estrella, sin resolverla. Elige plastilina lila, durazno o menta sin perder el avance.
- **Cambiar la lista de palabras** admite hasta 30 palabras distintas, de 2 a 12 letras, separadas por comas, punto y coma o renglones. Permite tildes y Ñ. Guardar reinicia la colección; solo la lista se conserva en este navegador mediante `fabi-clay-words-v1`. No se envían datos. Si no se puede guardar, permite jugar e informa de la limitación.
- Acepta vocales sin tilde para estampar su forma acentuada; N y Ñ son diferentes. Mantener una tecla no estampa repetidamente. Los campos de edición y los atajos del navegador no responden como letras del juego.
- Abrir la actividad desde el menú inicia una partida nueva; la página anterior deja de recibir letras al salir. Comparte el sonido con los otros juegos y respeta movimiento reducido. Los dibujos y efectos se crean localmente con CSS.
- `clay/clay.js` controla las palabras y entradas; `clay/clay.css` define la masa y los sellos. `BROWSER_CHANNEL=chrome node tests/clay.test.cjs` verifica una colección completa, letras repetidas, errores, pistas, personalización, guardado, tildes/Ñ, navegación, tacto y diseño a 320/390 px (requiere Playwright).

### Mi pop it · Pop, pop, ¡pop!

- Presiona las 36 burbujas con ratón, pantalla táctil o teclado; desliza el dedo o arrastra el ratón para presionar varias. Cada burbuja cuenta una sola vez hasta darle la vuelta.
- Elige **Arcoíris**, **Océano** o **Caramelo** sin perder el avance. **Darle la vuelta** restaura todas las burbujas en cualquier momento. Al completar el tablero aparece una invitación a jugar de nuevo, sin reloj ni penalizaciones.
- Con Tab llegas al tablero; las flechas recorren las burbujas y Enter/Espacio las presionan. La preferencia de sonido es compartida y el pop se genera localmente, sin descargar audio. Abrir la actividad desde el menú o recargar reinicia el tablero.
- `popit/popit.js` controla las burbujas, entradas y audio; `popit/popit.css` define el juguete, paletas y diseño adaptable. Prueba con `BROWSER_CHANNEL=chrome node tests/popit.test.cjs` si Playwright está disponible: clics, arrastre, teclado, deslizamiento táctil, reinicio, navegación, colores y anchos de 390/320 px.

### Ahorcado · La palabra secreta

- Escoge una categoría arriba del dibujo: **Todas**, **Animales**, **Naturaleza**, **Comida**, **En casa**, **Música** o **Compañeritos de Fabi**. Hay 24 palabras y nueve nombres: Mariano, Isabela, Jade, Cami, Sarah, Farah, Fabian, Sofi Macias y Sofi Mongalo. Cada reto incluye una pista. Se barajan sin repetirse hasta recorrer la categoría y se evita repetir el último al empezar otra vuelta.
- Al cambiar de categoría empieza un reto con seis intentos y una letra de regalo disponible. **Otra palabra** sigue en la categoría elegida. El espacio entre nombre y apellido ya está puesto: no hace falta adivinarlo, no cuenta como letra ni consume la ayuda. La selección dura mientras permanece abierta la página; abrirla desde el menú o recargar la reinicia.
- Escribe una letra o pulsa los botones en pantalla. Cada fallo añade una parte al dibujo; tienes seis intentos. Una letra repetida no resta intentos y todas sus apariciones se revelan juntas. Se aceptan mayúsculas, minúsculas y vocales con tilde; Ñ y N son letras diferentes. ÁRBOL y LÁPIZ muestran su ortografía con tilde.
- **Regálame una letra** descubre una letra pendiente una vez por palabra, sin gastar intentos. **Otra palabra** permite cambiar en cualquier momento. Al acertar o agotar los intentos, se revela la palabra completa y puedes jugar otra vez.
- Al completar una palabra suena un festejo de niños y aparecen emojis de celebración. El audio está incluido localmente bajo CC0 (fuente y licencia en `hangman/AUDIO-LICENSE.txt`). El festejo termina al silenciar, cambiar de palabra, salir o perder el foco; con movimiento reducido, los emojis aparecen sin animación.
- Funciona con teclado, ratón y pantalla táctil, sin reloj. Al volver al menú deja de recibir letras; abrir la actividad otra vez o recargar inicia de nuevo. Comparte la preferencia de sonido, sin guardar progreso adicional.

### Mi primer piano · para Fabi y Soni

- Toca una octava de Do a Do agudo: **A S D F G H J K** corresponden a las ocho teclas blancas; **W E T Y U** a las cinco negras (sostenidos). Las letras indican posiciones físicas del teclado, también al mantener Shift.
- Puedes tocar acordes manteniendo varias teclas. Cada tecla se ilumina hasta soltarla; mantenerla pulsada no repite la nota. También funciona con clics, pantalla táctil o Enter/Espacio al enfocar un botón del piano.
- **Aprender Estrellita** guía las primeras 14 notas de la canción con una estrella en la siguiente tecla y puntos de avance. Las otras notas suenan libremente y no restan progreso. Suelta y vuelve a pulsar para las notas repetidas. Puedes volver al modo libre o repetir al terminar.
- El sonido se sintetiza localmente con un ataque suave y armónicos que decaen, sin descargar grabaciones. Hay un máximo de 16 voces, incluidas las notas que se están apagando. Soltar una tecla amortigua la nota; silenciar, salir, Escape o cambiar de ventana/pestaña detiene el audio y limpia las teclas.
- Comparte el botón de sonido y su preferencia guardada con las otras actividades. Si el navegador no ofrece Web Audio, muestra un aviso y permite seguir explorando las notas visualmente. La melodía se reinicia al salir y no guarda datos adicionales.

### Respira con la mariposa · para Fabi y Soni

- Pulsa **Empezar** para acompañar cuatro respiraciones: las alas se abren durante tres segundos con **Toma aire…** y se cierran durante cuatro segundos con **Suelta el aire…**, sin retener la respiración. Los mensajes invitan a seguir un ritmo cómodo y parar cuando se quiera.
- Cuatro puntos muestran el avance. Al terminar, la mariposa descansa y suena una sola campanita si el sonido está activado. **Otra vez** inicia una nueva pausa.
- **Pausar**, Escape y cambiar de pestaña o de ventana congelan la animación y el avance. **Continuar** retoma desde ese punto; **Volver a empezar** deja la actividad lista sin iniciarla. Abrir la actividad desde el menú o recargar la reinicia.
- Funciona con ratón, teclado o pantalla táctil. Con movimiento reducido, la mariposa permanece quieta y los textos siguen guiando cada fase. Los lectores de pantalla reciben las instrucciones al cambiar de fase.
- El dibujo SVG, la animación y los sonidos se generan localmente, sin recursos externos ni datos guardados adicionales.

### Tiempo con calma · para Fabi y Soni

- Selecciona una duración de 1, 3, 5 o 10 minutos, o escribe de 1 a 120 minutos completos. Se puede usar con ratón, teclado o pantalla táctil.
- El área de color disminuye en proporción al tiempo restante: verde mientras queda más de la mitad, amarillo entre la mitad y el 20%, y coral durante el último 20%. El tamaño de la porción y los mensajes **Mucho**, **La mitad** y **Poquito** permiten entenderlo sin depender del color ni de los números.
- **Empezar**, **Pausar**, **Continuar** y **Volver a empezar** controlan el reloj. Escape también pausa. Para cambiar la duración durante la cuenta, primero vuelve a empezar.
- Cambiar de pestaña o de ventana no lo pausa: calcula lo que queda con la hora real, aunque el navegador ralentice sus actualizaciones. Al volver actualiza la vista. Salir al menú detiene el reloj. Abrir de nuevo la actividad desde el menú inicia un reloj nuevo.
- Al llegar a cero aparece **Nuestro ratito terminó** y suena una campanita suave si el sonido está activado. No hay alarmas repetidas, parpadeos ni penalizaciones. **Otra vez** inicia la misma duración.
- El reloj no se guarda al recargar. Comparte el botón de sonido con los juegos; no altera sus retos ni su progreso. Los lectores de pantalla anuncian los cambios de etapa y la pausa, sin anunciar cada segundo.

### Teclado mágico

- Solo pulsa el teclado físico. Letras, números, modificadores, flechas y demás teclas que lleguen a la página producen efectos. El teclado dibujado es una guía, sin controles táctiles ni respuestas incorrectas.
- Puedes mantener varias teclas: cada una permanece iluminada hasta soltarla. Se utilizan códigos físicos (`event.code`) para reconocer la posición incluso al mantener Shift. Las dos teclas Shift/Ctrl/Alt se siguen por separado. Se muestra Ñ en distribución española y punto y coma en inglesa.
- Cada nueva pulsación cambia de color. Las teclas sostenidas usan colores distintos mientras haya colores disponibles en la paleta. Mantener una tecla no repite los efectos.
- La ventana de 250 ms distingue 1, 2–3, 4–6 y 7 o más pulsaciones nuevas, aumentando partículas y dando una celebración para las ráfagas grandes. Un intervalo de 900 ms limita las celebraciones; los efectos normales siguen respondiendo al instante.
- **Espacio** lanza un arcoíris, **Enter** una lluvia de estrellas, **Backspace** burbujas y las **flechas** envían partículas en esa dirección.
- Hay como máximo 120 partículas activas y 8 voces cortas de Web Audio. Las notas siguen una escala agradable de grave a agudo de izquierda a derecha; la ganancia maestra se divide entre las voces activas para que los acordes compartan el volumen de una nota, con un compresor adicional. Silenciar también detiene las notas pendientes.
- Space, Tab y Enter no desplazan, cambian el foco o activan accidentalmente botones mientras se juega. Los atajos reservados por el navegador y el sistema pueden interrumpir el juego. F5/F11/F12 y combinaciones Meta conservan su comportamiento; perder foco o cambiar la visibilidad limpia inmediatamente teclas, efectos y sonidos.
- Al salir se retiran los listeners, partículas y temporizadores. Se respeta movimiento reducido con efectos breves de opacidad. El juego sigue funcionando si no hay audio disponible.

### Globos de letras

- Escribe tu nombre, elige cualquiera de los tres niveles y pulsa **Jugar** (o Enter desde el campo del nombre). El saludo y la felicitación usan ese nombre; puedes cambiarlo al volver al inicio. Se recuerda en este navegador. Cada partida tiene diez retos, sin reloj, vidas ni penalizaciones.
- Escribe la letra destacada usando el teclado físico. Las letras completadas se marcan, y un error conserva lo ya escrito. Se aceptan mayúsculas y minúsculas, incluida la Ñ.
- El teclado dibujado es solo una guía: hacer clic en él no responde. Muestra la tecla que se acaba de pulsar.
- **Ver pista** revela la siguiente tecla. En los ajustes puedes mostrarla siempre, tras cinco segundos sin acertar o solo a petición.
- **Pausa** o Escape detiene el juego y la espera de la pista. Cambiar de pestaña o ventana también pausa. **Inicio** deja la partida; conserva las letras acertadas, pero no suma una partida completada.
- El sonido suave se puede silenciar en todo momento. Solo se inicia tras una interacción. El juego respeta la preferencia del sistema de reducir movimiento.
- En el nivel 1 puedes ampliar de vocales y letras de FABI a un grupo intermedio y después a todo el abecedario. La distribución inglesa elimina la Ñ tanto del teclado como de los retos.

## Progreso y privacidad

Se guarda nombre, nivel, ayuda, grupo de letras, distribución, sonido, partidas completadas, letras acertadas y letras por practicar en `localStorage`, con la clave `los-globos-de-fabi-v1`. El progreso no se envía a ningún servidor. El buscador opcional de imágenes consulta Openverse con las palabras que escribas, como se explica en A colorear. El progreso es compartido en este navegador: cambiar el nombre no crea un perfil independiente. Los cambios de ajustes se usan en la siguiente partida; el sonido cambia inmediatamente.

Una respuesta incorrecta aumenta en uno la necesidad de practicar la letra objetivo; acertarla la reduce en uno. Cuando llega a cero se retira de la lista. Es una orientación sencilla para acompañar a quien juega, no una calificación. Se muestran primero las letras que acumulan más intentos pendientes.

El guardado corresponde a este navegador y origen, no se sincroniza entre dispositivos y puede desaparecer al borrar los datos del navegador. Si localStorage no está disponible, se continúa en memoria. **Borrar progreso** requiere confirmación y conserva las preferencias. No se reanuda una partida incompleta tras recargar.

## Organización

- `index.html`: menú con enlaces a las diez actividades.
- Cada carpeta de página contiene su `index.html` independiente; los controles y diálogos de Globos están en `globos-de-letras/index.html`.
- `activity-page.js`: preferencias compartidas e inicio/salida del juego de la página actual.
- `canonical-url.js` y `navigation.js`: direcciones consistentes para Analytics y enlaces compatibles con archivos locales.
- `styles.css`: cielo, globos, diseño adaptable, foco visible y movimiento reducido.
- `script.js`: datos `LEVELS` al principio, lógica de partidas, teclado, audio y guardado. Añade palabras o sílabas en `LEVELS[2].items` y `LEVELS[3].items`; usa A–Z y Ñ en mayúsculas, sin espacios ni tildes. Los retos se barajan por grupos y evitan repeticiones consecutivas.
- `soni/keyboard.js`: distribución física, conjunto `Set` de teclas sostenidas, colores, keydown/keyup y limpieza por pérdida de foco.
- `soni/bursts.js`: detección de ráfagas dentro de 250 ms, intensidad y límite de celebraciones.
- `soni/audio.js`: síntesis suave, escala pentatónica, máximo de voces, volumen normalizado y silencio.
- `soni/particles.js`: elementos animados, límite de 120, eliminación y temporizadores de respaldo.
- `soni/effects.js`: efectos normales, reacciones especiales y celebraciones. Añade nuevos efectos aquí.
- `soni/game.js`: ciclo de entrada/salida y coordinación; `soni/soni.css`: selector y diseño de Teclado mágico, con clases independientes de Globos de letras.
- `timer/timer.js`: cuenta basada en tiempo real, etapas visuales, validación de duración y pausa al salir; `timer/timer.css`: reloj de color y controles táctiles.
- `breathing/breathing.js`: cuatro ciclos, animación sincronizada, pausa y limpieza al salir; `breathing/breathing.css`: jardín, alas, selector y movimiento reducido.
- `piano/audio.js`: afinación, armónicos, apagado de notas y límite de voces; `piano/piano.js`: teclado físico y táctil, acordes, limpieza y guía de Estrellita; `piano/piano.css`: instrumento adaptable y teclas iluminadas.
- `hangman/hangman.js`: palabras, pistas, intentos, letras de regalo y teclado físico/táctil; `hangman/hangman.css`: dibujo, letras y diseño adaptable.
- `tests/hangman.test.cjs`: aciertos, final de partida, letras repetidas, pistas, tildes/Ñ, navegación y pantallas pequeñas.
- `tests/piano.test.cjs`: afinación y límites de audio, acordes, entradas simultáneas, melodía, accesibilidad, silencio, navegación, pantalla táctil y vistas móviles.
- `tests/breathing.test.cjs`: integración de la mariposa en Edge con reloj controlado, navegación, pausas, sonido y vistas móviles.
- `tests/timer.test.cjs`: integración del timer en Edge, con tiempo controlado para comprobar etapas, pausa, final y navegación sin esperar minutos reales.
- `tests/keyboard.test.cjs`: pruebas de integración con Edge y Playwright, además de pruebas de intensidad y límites de audio.
- `README.md`: ejecución, publicación y comprobaciones.

Los archivos de Teclado mágico se cargan con scripts clásicos `defer` ordenados; también funcionan abriendo `index.html` directamente, sin requerir un servidor para módulos JavaScript.

## Comprobar el nuevo juego

Con Node.js, Playwright disponible y Microsoft Edge instalado, ejecuta `node tests/keyboard.test.cjs`. Las pruebas usan un navegador de prueba sin interfaz visible, sin alterar el perfil habitual. La variable opcional `SCREENSHOT_DIR` guarda capturas para revisar el diseño.

Para comprobar el ahorcado, ejecuta `node tests/hangman.test.cjs`. También puedes usar Chrome con `BROWSER_CHANNEL=chrome node tests/hangman.test.cjs`. `SCREENSHOT_DIR` guarda capturas. `node tests/hangman-celebration.test.cjs` comprueba la reproducción real del audio local, el silencio, los emojis y su limpieza; también acepta `BROWSER_CHANNEL=chrome`. `node tests/hangman-categories.test.cjs` comprueba categorías, los nueve nombres, espacios, ayudas y distribución de nombres largos en móvil.

Para comprobar el timer, ejecuta también `node tests/timer.test.cjs`. Revisa duraciones inválidas, las tres etapas y el área restante, pausa/continuación, salida y regreso, Escape, final único, repetición, reinicio, silencio, movimiento reducido y vistas de 390 y 320 px.

Para comprobar la mariposa, ejecuta `node tests/breathing.test.cjs`. Revisa apertura y cierre de alas, fases de respiración, pausa precisa, Escape, pérdida de foco, cambio de pestaña, navegación entre actividades, final único, repetición, reinicio, silencio, movimiento reducido y vistas de 390 y 320 px. `SCREENSHOT_DIR` permite guardar capturas.

Para comprobar el piano, ejecuta `node tests/piano.test.cjs`. Revisa la afinación Do/Mi/Sol, los límites y la limpieza del audio, acordes, pulsaciones sostenidas, teclado y ratón sobre una misma nota, liberación fuera del piano, Enter, Estrellita, Escape, pérdida de foco, silencio, navegación, pantalla táctil, movimiento reducido, vistas de 390 y 320 px y funcionamiento sin Web Audio. `SCREENSHOT_DIR` guarda capturas. La calidad sonora en los altavoces se comprueba manualmente.

Para comprobar una actualización con archivos antiguos en caché, ejecuta `node tests/navigation-cache.test.cjs`. Sirve las páginas localmente, guarda la URL anterior del script en la caché HTTP del navegador y comprueba que el menú actualizado abre el piano y permite tocar y volver al inicio.

Se comprueban A+S+D+F+J sostenidas, auto-repeat sin partículas nuevas, siete teclas simultáneas, modificadores independientes, teclas numéricas/numpad compartidas, Space/Tab/Enter, efectos especiales, 160 pulsaciones rápidas, límite y eliminación de partículas, limpieza de foco/visibilidad, silencio, diseño móvil, movimiento reducido y entradas/salidas repetidas. También se completan los tres niveles de Globos de letras con errores, pausa y repetición, comprobando que no haya errores JavaScript.

Para comprobar manualmente: entra en Teclado mágico, mantén A+S+D+F+J, suelta solo D y verifica que las otras cuatro siguen iluminadas; golpea varias zonas del teclado y cambia de ventana mientras mantienes teclas. Al volver todas deben estar apagadas. Escucha el resultado real con sonido activado y silenciado: las pruebas comprueban los límites del audio, pero no evalúan cómo suena en tus altavoces.

## Comprobación del flujo

Verificado con pruebas automatizadas en Microsoft Edge: los tres niveles, final de partida, errores sin pérdida de avance, mayúsculas/minúsculas, teclas mantenidas, atajos, clics en el teclado guía, tres modos de pista, pausa del temporizador, repetición, descanso, recuperación de preferencias y progreso, borrado confirmado, distribución inglesa, Ñ (evento de teclado simulado), ausencia de repeticiones consecutivas, vista móvil, movimiento reducido y almacenamiento bloqueado. Sin errores de JavaScript en el navegador. También se revisaron visualmente las pantallas de inicio y juego en escritorio y la pantalla de inicio en móvil. La reproducción sonora real y otros navegadores requieren comprobación manual.

1. Inicia cada nivel. Acierta, equivócate y comprueba que las sílabas/palabras conservan el avance.
2. Mantén una tecla pulsada: solo debe contar el primer evento. Ctrl/Alt/Meta, navegación, teclas modificadoras y campos de ajustes no responden retos.
3. En ayuda **Siempre**, verifica el color y contorno en la siguiente tecla. En **A petición**, usa **Ver pista**. En **Después de esperar**, espera cinco segundos; acierta para reiniciar la espera, y pausa a mitad para comprobar que conserva el tiempo restante.
4. Completa diez globos: debe aparecer la felicitación con las letras de la partida. Prueba volver a jugar y descansar.
5. Cambia opciones, silencia, recarga y revisa los ajustes. Comprueba el borrado con Cancelar y después con confirmación.
6. Prueba el alfabeto completo en español y en inglés (sin Ñ), navegación con Tab, una ventana estrecha, zoom y movimiento reducido. El teclado físico sigue siendo necesario en móviles.
7. Bloquea el almacenamiento: debe ser posible jugar, aunque el progreso no sobreviva a la recarga.
