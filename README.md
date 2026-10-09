# Fabi y Soni · Juega con el teclado

Cinco actividades en español con un selector inicial: **Fabi — Aprende el teclado** conserva los retos originales de letras, sílabas y palabras; **Soni — Teclado Mágico** convierte cualquier pulsación en colores, partículas y sonidos suaves, sin objetivos ni puntuación; **Tiempo con calma** muestra cuánto tiempo queda con un reloj de color que se va vaciando; **Respira con la mariposa** acompaña una pausa con alas que se abren y cierran suavemente; **Mi primer piano** convierte el teclado en un instrumento con acordes y una melodía guiada. HTML, CSS y JavaScript puros: sin dependencias para jugar, compilación, cuentas, recursos externos ni backend.

## Ejecutar localmente

Abre `index.html` en un navegador moderno (Chrome, Edge, Firefox o Safari). No necesitas instalar nada. Para un origen local estable y guardar el progreso de forma consistente, puedes servir esta carpeta con `python -m http.server 8000`, si tienes Python, y abrir `http://localhost:8000`. Algunos navegadores restringen localStorage al abrir archivos directamente; el juego funciona igualmente sin guardar.

## Publicar en GitHub Pages

1. Sube `index.html`, `styles.css`, `script.js`, las carpetas completas `soni/`, `timer/`, `breathing/` y `piano/`, y `README.md` a la raíz de tu repositorio.
2. En GitHub, entra a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama que contiene estos archivos (por ejemplo, `main`) y la carpeta **/ (root)**. Guarda.
5. Cuando GitHub termine el despliegue, abre la dirección que muestra Pages: `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Los recursos usan rutas relativas y funcionan en un subdirectorio. No necesitas claves, servicios de pago ni configurar un dominio. La entrega contiene el código listo para publicar; no publica ni modifica la configuración remota del repositorio automáticamente.

## Cómo jugar

Elige **Fabi**, **Soni**, **Tiempo con calma**, **Respira con la mariposa** o **Mi primer piano** al abrir la página. Los botones para elegir otra actividad y el logo permiten volver al selector. En Fabi, **Inicio**, **Descansar** y **Volver al inicio** mantienen su comportamiento original y regresan a la configuración de Fabi.

### Mi primer piano · para Fabi y Soni

- Toca una octava de Do a Do agudo: **A S D F G H J K** corresponden a las ocho teclas blancas; **W E T Y U** a las cinco negras (sostenidos). Las letras indican posiciones físicas del teclado, también al mantener Shift.
- Puedes tocar acordes manteniendo varias teclas. Cada tecla se ilumina hasta soltarla; mantenerla pulsada no repite la nota. También funciona con clics, pantalla táctil o Enter/Espacio al enfocar un botón del piano.
- **Aprender Estrellita** guía las primeras 14 notas de la canción con una estrella en la siguiente tecla y puntos de avance. Las otras notas suenan libremente y no restan progreso. Suelta y vuelve a pulsar para las notas repetidas. Puedes volver al modo libre o repetir al terminar.
- El sonido se sintetiza localmente con un ataque suave y armónicos que decaen, sin descargar grabaciones. Hay un máximo de 16 voces, incluidas las notas que se están apagando. Soltar una tecla amortigua la nota; silenciar, salir, Escape o cambiar de ventana/pestaña detiene el audio y limpia las teclas.
- Comparte el botón de sonido y su preferencia guardada con las otras actividades. Si el navegador no ofrece Web Audio, muestra un aviso y permite seguir explorando las notas visualmente. La melodía se reinicia al salir y no guarda datos adicionales.

### Respira con la mariposa · para Fabi y Soni

- Pulsa **Empezar** para acompañar cuatro respiraciones: las alas se abren durante tres segundos con **Toma aire…** y se cierran durante cuatro segundos con **Suelta el aire…**, sin retener la respiración. Los mensajes invitan a seguir un ritmo cómodo y parar cuando se quiera.
- Cuatro puntos muestran el avance. Al terminar, la mariposa descansa y suena una sola campanita si el sonido está activado. **Otra vez** inicia una nueva pausa.
- **Pausar**, Escape, cambiar de pestaña o de ventana y volver al selector congelan la animación y el avance. **Continuar** retoma desde ese punto; **Volver a empezar** deja la actividad lista sin iniciarla. Recargar reinicia la actividad.
- Funciona con ratón, teclado o pantalla táctil. Con movimiento reducido, la mariposa permanece quieta y los textos siguen guiando cada fase. Los lectores de pantalla reciben las instrucciones al cambiar de fase.
- El dibujo SVG, la animación y los sonidos se generan localmente, sin recursos externos ni datos guardados adicionales.

### Tiempo con calma · para Fabi y Soni

- Selecciona una duración de 1, 3, 5 o 10 minutos, o escribe de 1 a 120 minutos completos. Se puede usar con ratón, teclado o pantalla táctil.
- El área de color disminuye en proporción al tiempo restante: verde mientras queda más de la mitad, amarillo entre la mitad y el 20%, y coral durante el último 20%. El tamaño de la porción y los mensajes **Mucho**, **La mitad** y **Poquito** permiten entenderlo sin depender del color ni de los números.
- **Empezar**, **Pausar**, **Continuar** y **Volver a empezar** controlan el reloj. Escape también pausa. Para cambiar la duración durante la cuenta, primero vuelve a empezar.
- Cambiar de pestaña o de ventana no lo pausa: calcula lo que queda con la hora real, aunque el navegador ralentice sus actualizaciones. Al volver actualiza la vista. Salir al selector o usar el logo lo pausa y conserva lo que queda al entrar de nuevo.
- Al llegar a cero aparece **Nuestro ratito terminó** y suena una campanita suave si el sonido está activado. No hay alarmas repetidas, parpadeos ni penalizaciones. **Otra vez** inicia la misma duración.
- El reloj no se guarda al recargar. Comparte el botón de sonido con los juegos; no altera sus retos ni su progreso. Los lectores de pantalla anuncian los cambios de etapa y la pausa, sin anunciar cada segundo.

### Teclado Mágico de Soni

- Solo pulsa el teclado físico. Letras, números, modificadores, flechas y demás teclas que lleguen a la página producen efectos. El teclado dibujado es una guía, sin controles táctiles ni respuestas incorrectas.
- Puedes mantener varias teclas: cada una permanece iluminada hasta soltarla. Se utilizan códigos físicos (`event.code`) para reconocer la posición incluso al mantener Shift. Las dos teclas Shift/Ctrl/Alt se siguen por separado. Se muestra Ñ en distribución española y punto y coma en inglesa.
- Cada nueva pulsación cambia de color. Las teclas sostenidas usan colores distintos mientras haya colores disponibles en la paleta. Mantener una tecla no repite los efectos.
- La ventana de 250 ms distingue 1, 2–3, 4–6 y 7 o más pulsaciones nuevas, aumentando partículas y dando una celebración para las ráfagas grandes. Un intervalo de 900 ms limita las celebraciones; los efectos normales siguen respondiendo al instante.
- **Espacio** lanza un arcoíris, **Enter** una lluvia de estrellas, **Backspace** burbujas y las **flechas** envían partículas en esa dirección.
- Hay como máximo 120 partículas activas y 8 voces cortas de Web Audio. Las notas siguen una escala agradable de grave a agudo de izquierda a derecha; la ganancia maestra se divide entre las voces activas para que los acordes compartan el volumen de una nota, con un compresor adicional. Silenciar también detiene las notas pendientes.
- Space, Tab y Enter no desplazan, cambian el foco o activan accidentalmente botones mientras se juega. Los atajos reservados por el navegador y el sistema pueden interrumpir el juego. F5/F11/F12 y combinaciones Meta conservan su comportamiento; perder foco o cambiar la visibilidad limpia inmediatamente teclas, efectos y sonidos.
- Al salir se retiran los listeners, partículas y temporizadores. Se respeta movimiento reducido con efectos breves de opacidad. El juego sigue funcionando si no hay audio disponible.

### Los globos de Fabi

- Escribe tu nombre, elige cualquiera de los tres niveles y pulsa **Jugar** (o Enter desde el campo del nombre). El saludo y la felicitación usan ese nombre; puedes cambiarlo al volver al inicio. Se recuerda en este navegador. Cada partida tiene diez retos, sin reloj, vidas ni penalizaciones.
- Escribe la letra destacada usando el teclado físico. Las letras completadas se marcan, y un error conserva lo ya escrito. Se aceptan mayúsculas y minúsculas, incluida la Ñ.
- El teclado dibujado es solo una guía: hacer clic en él no responde. Muestra la tecla que se acaba de pulsar.
- **Ver pista** revela la siguiente tecla. En los ajustes puedes mostrarla siempre, tras cinco segundos sin acertar o solo a petición.
- **Pausa** o Escape detiene el juego y la espera de la pista. Cambiar de pestaña o ventana también pausa. **Inicio** deja la partida; conserva las letras acertadas, pero no suma una partida completada.
- El sonido suave se puede silenciar en todo momento. Solo se inicia tras una interacción. El juego respeta la preferencia del sistema de reducir movimiento.
- En el nivel 1 puedes ampliar de vocales y letras de FABI a un grupo intermedio y después a todo el abecedario. La distribución inglesa elimina la Ñ tanto del teclado como de los retos.

## Progreso y privacidad

Se guarda nombre, nivel, ayuda, grupo de letras, distribución, sonido, partidas completadas, letras acertadas y letras por practicar en `localStorage`, con la clave `los-globos-de-fabi-v1`. No se envía ningún dato. El progreso es compartido en este navegador: cambiar el nombre no crea un perfil independiente. Los cambios de ajustes se usan en la siguiente partida; el sonido cambia inmediatamente.

Una respuesta incorrecta aumenta en uno la necesidad de practicar la letra objetivo; acertarla la reduce en uno. Cuando llega a cero se retira de la lista. Es una orientación sencilla para acompañar a Fabi, no una calificación. Se muestran primero las letras que acumulan más intentos pendientes.

El guardado corresponde a este navegador y origen, no se sincroniza entre dispositivos y puede desaparecer al borrar los datos del navegador. Si localStorage no está disponible, se continúa en memoria. **Borrar progreso** requiere confirmación y conserva las preferencias. No se reanuda una partida incompleta tras recargar.

## Organización

- `index.html`: pantallas, controles, diálogos accesibles y dibujos SVG locales.
- `styles.css`: cielo, globos, diseño adaptable, foco visible y movimiento reducido.
- `script.js`: datos `LEVELS` al principio, lógica de partidas, teclado, audio y guardado. Añade palabras o sílabas en `LEVELS[2].items` y `LEVELS[3].items`; usa A–Z y Ñ en mayúsculas, sin espacios ni tildes. Los retos se barajan por grupos y evitan repeticiones consecutivas.
- `soni/keyboard.js`: distribución física, conjunto `Set` de teclas sostenidas, colores, keydown/keyup y limpieza por pérdida de foco.
- `soni/bursts.js`: detección de ráfagas dentro de 250 ms, intensidad y límite de celebraciones.
- `soni/audio.js`: síntesis suave, escala pentatónica, máximo de voces, volumen normalizado y silencio.
- `soni/particles.js`: elementos animados, límite de 120, eliminación y temporizadores de respaldo.
- `soni/effects.js`: efectos normales, reacciones especiales y celebraciones. Añade nuevos efectos aquí.
- `soni/game.js`: ciclo de entrada/salida y coordinación; `soni/soni.css`: selector y diseño de Soni, con clases independientes de Fabi.
- `timer/timer.js`: cuenta basada en tiempo real, etapas visuales, validación de duración y pausa al salir; `timer/timer.css`: reloj de color y controles táctiles.
- `breathing/breathing.js`: cuatro ciclos, animación sincronizada, pausa y limpieza al salir; `breathing/breathing.css`: jardín, alas, selector y movimiento reducido.
- `piano/audio.js`: afinación, armónicos, apagado de notas y límite de voces; `piano/piano.js`: teclado físico y táctil, acordes, limpieza y guía de Estrellita; `piano/piano.css`: instrumento adaptable y teclas iluminadas.
- `tests/piano.test.cjs`: afinación y límites de audio, acordes, entradas simultáneas, melodía, accesibilidad, silencio, navegación, pantalla táctil y vistas móviles.
- `tests/breathing.test.cjs`: integración de la mariposa en Edge con reloj controlado, navegación, pausas, sonido y vistas móviles.
- `tests/timer.test.cjs`: integración del timer en Edge, con tiempo controlado para comprobar etapas, pausa, final y navegación sin esperar minutos reales.
- `tests/keyboard.test.cjs`: pruebas de integración con Edge y Playwright, además de pruebas de intensidad y límites de audio.
- `README.md`: ejecución, publicación y comprobaciones.

Los archivos de Soni se cargan con scripts clásicos `defer` ordenados; también funcionan abriendo `index.html` directamente, sin requerir un servidor para módulos JavaScript.

## Comprobar el nuevo juego

Con Node.js, Playwright disponible y Microsoft Edge instalado, ejecuta `node tests/keyboard.test.cjs`. Las pruebas usan un navegador de prueba sin interfaz visible, sin alterar el perfil habitual. La variable opcional `SCREENSHOT_DIR` guarda capturas para revisar el diseño.

Para comprobar el timer, ejecuta también `node tests/timer.test.cjs`. Revisa duraciones inválidas, las tres etapas y el área restante, pausa/continuación, salida y regreso, Escape, final único, repetición, reinicio, silencio, movimiento reducido y vistas de 390 y 320 px.

Para comprobar la mariposa, ejecuta `node tests/breathing.test.cjs`. Revisa apertura y cierre de alas, fases de respiración, pausa precisa, Escape, pérdida de foco, cambio de pestaña, navegación entre actividades, final único, repetición, reinicio, silencio, movimiento reducido y vistas de 390 y 320 px. `SCREENSHOT_DIR` permite guardar capturas.

Para comprobar el piano, ejecuta `node tests/piano.test.cjs`. Revisa la afinación Do/Mi/Sol, los límites y la limpieza del audio, acordes, pulsaciones sostenidas, teclado y ratón sobre una misma nota, liberación fuera del piano, Enter, Estrellita, Escape, pérdida de foco, silencio, navegación, pantalla táctil, movimiento reducido, vistas de 390 y 320 px y funcionamiento sin Web Audio. `SCREENSHOT_DIR` guarda capturas. La calidad sonora en los altavoces se comprueba manualmente.

Se comprueban A+S+D+F+J sostenidas, auto-repeat sin partículas nuevas, siete teclas simultáneas, modificadores independientes, teclas numéricas/numpad compartidas, Space/Tab/Enter, efectos especiales, 160 pulsaciones rápidas, límite y eliminación de partículas, limpieza de foco/visibilidad, silencio, diseño móvil, movimiento reducido y entradas/salidas repetidas. También se completan los tres niveles originales de Fabi con errores, pausa y repetición, comprobando que no haya errores JavaScript.

Para comprobar manualmente: entra en Soni, mantén A+S+D+F+J, suelta solo D y verifica que las otras cuatro siguen iluminadas; golpea varias zonas del teclado y cambia de ventana mientras mantienes teclas. Al volver todas deben estar apagadas. Escucha el resultado real con sonido activado y silenciado: las pruebas comprueban los límites del audio, pero no evalúan cómo suena en tus altavoces.

## Comprobación del flujo

Verificado con pruebas automatizadas en Microsoft Edge: los tres niveles, final de partida, errores sin pérdida de avance, mayúsculas/minúsculas, teclas mantenidas, atajos, clics en el teclado guía, tres modos de pista, pausa del temporizador, repetición, descanso, recuperación de preferencias y progreso, borrado confirmado, distribución inglesa, Ñ (evento de teclado simulado), ausencia de repeticiones consecutivas, vista móvil, movimiento reducido y almacenamiento bloqueado. Sin errores de JavaScript en el navegador. También se revisaron visualmente las pantallas de inicio y juego en escritorio y la pantalla de inicio en móvil. La reproducción sonora real y otros navegadores requieren comprobación manual.

1. Inicia cada nivel. Acierta, equivócate y comprueba que las sílabas/palabras conservan el avance.
2. Mantén una tecla pulsada: solo debe contar el primer evento. Ctrl/Alt/Meta, navegación, teclas modificadoras y campos de ajustes no responden retos.
3. En ayuda **Siempre**, verifica el color y contorno en la siguiente tecla. En **A petición**, usa **Ver pista**. En **Después de esperar**, espera cinco segundos; acierta para reiniciar la espera, y pausa a mitad para comprobar que conserva el tiempo restante.
4. Completa diez globos: debe aparecer la felicitación con las letras de la partida. Prueba volver a jugar y descansar.
5. Cambia opciones, silencia, recarga y revisa los ajustes. Comprueba el borrado con Cancelar y después con confirmación.
6. Prueba el alfabeto completo en español y en inglés (sin Ñ), navegación con Tab, una ventana estrecha, zoom y movimiento reducido. El teclado físico sigue siendo necesario en móviles.
7. Bloquea el almacenamiento: debe ser posible jugar, aunque el progreso no sobreviva a la recarga.
