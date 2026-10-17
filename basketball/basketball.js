'use strict';

(() => {
  const $ = id => document.getElementById(`basketball-${id}`);
  const court = $('court');
  if (!court) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const speeds = { slow: 150, fast: 240 };
  const goal = 5, hoopX = 500, hoopY = 160, gravity = 1000;
  let active = false, phase = 'ready', speed = 'slow', hooks = {};
  let playerX = 170, direction = 1, score = 0, attempts = 0;
  let ball = null, elapsed = 0, feedbackTime = 0;
  let frame = null, lastTime = null, correction = 1;

  function setPhase(next) {
    phase = next;
    court.dataset.phase = next;
    $('shoot').disabled = next !== 'playing' || Boolean(ball);
    $('pause').disabled = !['playing', 'paused'].includes(next);
    $('pause').textContent = next === 'paused' ? '▶ Continuar' : 'Ⅱ Pausar';
    $('overlay').hidden = next === 'playing';
  }

  function updateScore() {
    $('score').textContent = `${score} / ${goal}`;
    $('attempts').textContent = String(attempts);
    $('medals').setAttribute('aria-label', `${score} de ${goal} canastas`);
    [...$('medals').children].forEach((medal, index) => medal.classList.toggle('earned', index < score));
  }

  function showOverlay(title, text, button, icon, kicker) {
    $('overlay-title').textContent = title;
    $('overlay-text').textContent = text;
    $('start').textContent = button;
    $('overlay-icon').textContent = icon;
    $('overlay-kicker').textContent = kicker;
  }

  function stopFrame() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
  }

  function scheduleFrame() {
    if (active && phase === 'playing' && frame === null) frame = requestAnimationFrame(tick);
  }

  function reset() {
    stopFrame();
    playerX = 170; direction = 1; score = 0; attempts = 0;
    ball = null; elapsed = 0; feedbackTime = 0;
    $('feedback').hidden = true;
    updateScore();
    setPhase('ready');
    showOverlay('¿Listo para jugar?', 'El monito camina solito. Tú eliges cuándo lanzar.', '¡Vamos a jugar! →', '🏀', 'TU CANCHA, TU MOMENTO');
    $('status').textContent = 'Cinco canastas y una gran celebración. ¡Tú puedes!';
    render();
  }

  function start() {
    if (!active || phase === 'playing') return;
    if (phase === 'won') reset();
    hooks.onStart?.();
    setPhase('playing');
    $('status').textContent = ball ? 'El balón sigue su camino. ¡Vamos!' : 'Espera la marca verde y pulsa Espacio o ¡Lanzar!';
    // Clear the start button's focus so Space controls the game after starting.
    $('shoot').focus({ preventScroll: true });
    lastTime = null;
    scheduleFrame();
  }

  function pause(moveFocus = false) {
    if (!active || phase !== 'playing') return;
    stopFrame();
    setPhase('paused');
    showOverlay('Un pequeño descanso', 'Tu partida te espera justo donde la dejaste.', 'Continuar jugando →', '☁', 'SIN PRISAS');
    $('status').textContent = 'Partida en pausa. Pulsa Continuar jugando para volver.';
    if (moveFocus) $('start').focus({ preventScroll: true });
  }

  function feedback(text, kind) {
    $('feedback').textContent = text;
    $('feedback').dataset.kind = kind;
    $('feedback').hidden = false;
    feedbackTime = 1.1;
  }

  function shoot() {
    if (!active || phase !== 'playing' || ball) return;
    hooks.onStart?.();
    // The ball keeps its launch column while the player continues walking.
    ball = { x: playerX, y: 380, vy: -820, scored: false, age: 0, tolerance: 38 * correction };
    attempts += 1;
    updateScore();
    $('shoot').disabled = true;
    $('status').textContent = '¡Balón en el aire!';
    render();
  }

  function finish() {
    stopFrame();
    ball = null;
    setPhase('won');
    $('feedback').hidden = true;
    feedbackTime = 0;
    showOverlay('¡Choca esas cinco!', `Encestaste 5 canastas en ${attempts} tiros. ¡Tu puntería merece un aplauso!`, 'Volver a jugar →', '🏆', '¡RETO COMPLETADO!');
    $('status').textContent = `¡Lo lograste! Cinco canastas en ${attempts} tiros.`;
    hooks.onFinish?.();
    $('start').focus({ preventScroll: true });
  }

  function advance(dt) {
    elapsed += dt;
    playerX += direction * speeds[speed] * dt;
    if (playerX > 910) { playerX = 1820 - playerX; direction = -1; }
    if (playerX < 90) { playerX = 180 - playerX; direction = 1; }
    if (feedbackTime > 0) {
      feedbackTime -= dt;
      if (feedbackTime <= 0) $('feedback').hidden = true;
    }
    if (!ball) return;
    const previousY = ball.y;
    ball.age += dt;
    ball.y += ball.vy * dt + .5 * gravity * dt * dt;
    ball.vy += gravity * dt;
    // A basket only counts once, crossing the rim from above on descent.
    if (!ball.scored && ball.vy > 0 && previousY < hoopY && ball.y >= hoopY && Math.abs(ball.x - hoopX) <= ball.tolerance) {
      ball.scored = true;
      score += 1;
      updateScore();
      feedback('¡Canasta! +1 ★', 'score');
      $('status').textContent = score === goal ? '¡Cinco canastas! ¡Lo lograste!' : `¡Canasta! Llevas ${score} de ${goal}. ¡Sigue así!`;
      if (score < goal) hooks.onCorrect?.();
    }
    if (ball.y >= (ball.scored ? 240 : 536)) {
      if (ball.scored && score === goal) { finish(); return; }
      if (!ball.scored) {
        feedback('¡Prueba otra vez!', 'miss');
        $('status').textContent = '¡Casi! Lanza cuando el monito esté debajo del aro, sobre la marca verde.';
      }
      ball = null;
      $('shoot').disabled = false;
    }
  }

  function render() {
    $('player').setAttribute('transform', `translate(${playerX.toFixed(2)} 0)`);
    const walking = phase === 'playing' && !reducedMotion.matches;
    const step = walking ? Math.sin(elapsed * 13) : 0;
    $('body').setAttribute('transform', `translate(0 ${(-Math.abs(step) * 2).toFixed(2)})`);
    $('left-leg').setAttribute('d', `M-14 482L${(-20 + step * 8).toFixed(2)} 510`);
    $('right-leg').setAttribute('d', `M14 482L${(20 - step * 8).toFixed(2)} 510`);
    $('left-shoe').setAttribute('transform', `translate(${(step * 8).toFixed(2)} 0)`);
    $('right-shoe').setAttribute('transform', `translate(${(-step * 8).toFixed(2)} 0)`);
    $('ball').setAttribute('transform', `translate(${(ball?.x ?? playerX).toFixed(2)} ${(ball?.y ?? 372).toFixed(2)})`);
    $('ball-scale').setAttribute('transform', `scale(${correction.toFixed(4)} 1) rotate(${ball && !reducedMotion.matches ? (ball.age * 230).toFixed(1) : 0})`);
    court.dataset.aligned = String(Math.abs(playerX - hoopX) <= 38 * correction);
  }

  function tick(time) {
    frame = null;
    if (!active || phase !== 'playing') return;
    // Small fixed maximum steps avoid skipping a collision after a slow frame.
    let remaining = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .1);
    lastTime = time;
    while (remaining > 0 && phase === 'playing') {
      const dt = Math.min(remaining, 1 / 120);
      advance(dt);
      remaining -= dt;
    }
    render();
    scheduleFrame();
  }

  function resize() {
    const box = court.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // Preserve round balls and natural character proportions on narrow screens.
    correction = Math.min(2.3, box.height / 560 / (box.width / 1000));
    $('player-art').setAttribute('transform', `scale(${correction} 1)`);
    $('hoop-art').setAttribute('transform', `scale(${correction} 1)`);
    $('target').setAttribute('rx', String(46 * correction));
    $('sun').setAttribute('rx', String(37 * correction));
    if (ball) ball.tolerance = 38 * correction;
    render();
  }

  $('start').addEventListener('click', start);
  $('shoot').addEventListener('click', shoot);
  $('pause').addEventListener('click', () => phase === 'paused' ? start() : pause(true));
  $('reset').addEventListener('click', () => { reset(); $('start').focus({ preventScroll: true }); });
  document.querySelectorAll('[data-speed]').forEach(button => {
    button.addEventListener('click', () => {
      speed = button.dataset.speed;
      document.querySelectorAll('[data-speed]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      $('status').textContent = speed === 'slow' ? 'Ritmo Paseo. Tómate tu tiempo para lanzar.' : 'Ritmo Rápido. ¡Atento al momento!';
    });
  });

  document.addEventListener('keydown', event => {
    // Suppress native button activation as well as game input for shortcuts.
    const isSpace = event.code === 'Space' || event.key === ' ';
    if (isSpace && event.target === $('shoot') && (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing)) event.preventDefault();
    if (!active || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    if (event.key === 'Escape' && phase === 'playing' && !event.repeat) { event.preventDefault(); pause(true); return; }
    if (event.code !== 'Space' && event.key !== ' ') return;
    // Native Space activation remains available on menu, speed and sound buttons.
    if (event.target instanceof Element && event.target.closest('button, a, summary') && event.target !== $('shoot')) return;
    if (phase !== 'playing') return;
    event.preventDefault();
    if (!event.repeat) shoot();
  });

  window.addEventListener('blur', () => pause());
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(court);
  else window.addEventListener('resize', resize);

  window.BasketballGame = {
    enter(options = {}) {
      hooks = options;
      if (!active) {
        active = true;
        reset();
        resize();
      }
    },
    leave() {
      pause();
      active = false;
      stopFrame();
    },
    // Audio is supplied by the shared activity controller and its sound setting.
    setSound() {}
  };
})();
