# Los globos de Fabi

Un juego en español para aprender a reconocer letras y encontrarlas en el teclado físico. HTML, CSS y JavaScript puros: sin dependencias, compilación, cuentas, recursos externos ni backend.

## Ejecutar localmente

Abre `index.html` en un navegador moderno (Chrome, Edge, Firefox o Safari). No necesitas instalar nada. Para un origen local estable y guardar el progreso de forma consistente, puedes servir esta carpeta con `python -m http.server 8000`, si tienes Python, y abrir `http://localhost:8000`. Algunos navegadores restringen localStorage al abrir archivos directamente; el juego funciona igualmente sin guardar.

## Publicar en GitHub Pages

1. Sube `index.html`, `styles.css`, `script.js` y `README.md` a la raíz de tu repositorio.
2. En GitHub, entra a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama que contiene estos archivos (por ejemplo, `main`) y la carpeta **/ (root)**. Guarda.
5. Cuando GitHub termine el despliegue, abre la dirección que muestra Pages: `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Los recursos usan rutas relativas y funcionan en un subdirectorio. No necesitas claves, servicios de pago ni configurar un dominio. La entrega contiene el código listo para publicar; no publica ni modifica la configuración remota del repositorio automáticamente.

## Cómo jugar

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
- `README.md`: ejecución, publicación y comprobaciones.

## Comprobación del flujo

Verificado con pruebas automatizadas en Microsoft Edge: los tres niveles, final de partida, errores sin pérdida de avance, mayúsculas/minúsculas, teclas mantenidas, atajos, clics en el teclado guía, tres modos de pista, pausa del temporizador, repetición, descanso, recuperación de preferencias y progreso, borrado confirmado, distribución inglesa, Ñ (evento de teclado simulado), ausencia de repeticiones consecutivas, vista móvil, movimiento reducido y almacenamiento bloqueado. Sin errores de JavaScript en el navegador. También se revisaron visualmente las pantallas de inicio y juego en escritorio y la pantalla de inicio en móvil. La reproducción sonora real y otros navegadores requieren comprobación manual.

1. Inicia cada nivel. Acierta, equivócate y comprueba que las sílabas/palabras conservan el avance.
2. Mantén una tecla pulsada: solo debe contar el primer evento. Ctrl/Alt/Meta, navegación, teclas modificadoras y campos de ajustes no responden retos.
3. En ayuda **Siempre**, verifica el color y contorno en la siguiente tecla. En **A petición**, usa **Ver pista**. En **Después de esperar**, espera cinco segundos; acierta para reiniciar la espera, y pausa a mitad para comprobar que conserva el tiempo restante.
4. Completa diez globos: debe aparecer la felicitación con las letras de la partida. Prueba volver a jugar y descansar.
5. Cambia opciones, silencia, recarga y revisa los ajustes. Comprueba el borrado con Cancelar y después con confirmación.
6. Prueba el alfabeto completo en español y en inglés (sin Ñ), navegación con Tab, una ventana estrecha, zoom y movimiento reducido. El teclado físico sigue siendo necesario en móviles.
7. Bloquea el almacenamiento: debe ser posible jugar, aunque el progreso no sobreviva a la recarga.
