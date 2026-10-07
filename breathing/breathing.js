'use strict';

window.ButterflyBreathing = (() => {
  const get = id => document.getElementById(id);
  const screen = get('breathing');
  const garden = get('breathing-garden');
  const dots = [...get('breathing-progress').children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const inhaleMs = 3000;
  const cycleMs = inhaleMs + 4000;
  const cycles = dots.length;
  const duration = cycles * cycleMs;
  let state = 'ready';
  let active = false;
  let elapsed = 0;
  let started = 0;
  let frame = null;
  let onStart = () => {};
  let onFinish = () => {};

  function render() {
    const completed = Math.min(cycles, Math.floor(elapsed / cycleMs));
    const cyclePosition = elapsed % cycleMs;
    const inhaling = cyclePosition < inhaleMs;
    const phase = state === 'running' ? (inhaling ? 'inhale' : 'exhale') : state;
    const messages = {
      ready: ['¿Respiramos juntas?', 'Cuando abra las alas, toma aire. Cuando las cierre, suéltalo suavemente.'],
      inhale: ['Toma aire…', 'Suavemente, mientras la mariposa abre sus alas.'],
      exhale: ['Suelta el aire…', 'Despacio, mientras la mariposa cierra sus alas.'],
      paused: ['Descansamos un momentito', 'Respira a tu ritmo. Continuamos cuando quieras.'],
      done: ['¡Qué bonita pausa!', 'La mariposa descansa contigo. Puedes quedarte aquí un ratito.']
    };
    screen.dataset.state = state;
    screen.dataset.phase = phase;
    // Only change the live region at phase boundaries, never at animation speed.
    if (get('breathing-message').textContent !== messages[phase][0]) {
      get('breathing-message').textContent = messages[phase][0];
      get('breathing-cue').textContent = messages[phase][1];
    }
    get('breathing-toggle').textContent = { ready: 'Empezar →', running: 'Ⅱ Pausar', paused: 'Continuar →', done: 'Otra vez →' }[state];
    get('breathing-reset').disabled = state === 'ready';
    const label = `${completed} de ${cycles} respiraciones completadas`;
    get('breathing-progress').setAttribute('aria-label', label);
    get('breathing-count').textContent = state === 'ready' ? 'Cuatro respiraciones, sin prisas' : state === 'done' ? 'Cuatro respiraciones. Un ratito para ti.' : `Respiración ${completed + 1} de ${cycles}`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('complete', index < completed);
      dot.classList.toggle('current', state === 'running' && index === completed);
    });
    const position = state === 'ready' || state === 'done' ? 0 : inhaling ? cyclePosition / inhaleMs : 1 - (cyclePosition - inhaleMs) / (cycleMs - inhaleMs);
    const eased = (1 - Math.cos(Math.PI * position)) / 2;
    garden.style.setProperty('--wing-scale', String(.68 + .32 * eased));
    garden.style.setProperty('--halo-scale', String(.82 + .18 * eased));
    garden.style.setProperty('--rise', `${-12 * eased}px`);
  }

  function stopFrame() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function updateElapsed() {
    elapsed = Math.min(duration, Math.max(0, performance.now() - started));
    if (elapsed === duration) {
      state = 'done';
      stopFrame();
      render();
      onFinish();
      return;
    }
    render();
  }

  function tick() {
    frame = null;
    if (!active || state !== 'running') return;
    updateElapsed();
    if (state === 'running') frame = requestAnimationFrame(tick);
  }

  function pause() {
    if (state !== 'running') return;
    updateElapsed();
    if (state === 'done') return;
    state = 'paused';
    stopFrame();
    render();
  }

  get('breathing-toggle').addEventListener('click', () => {
    if (!active) return;
    if (state === 'running') { pause(); return; }
    if (state !== 'paused') elapsed = 0;
    onStart();
    started = performance.now() - elapsed;
    state = 'running';
    render();
    frame = requestAnimationFrame(tick);
  });
  get('breathing-reset').addEventListener('click', () => {
    stopFrame();
    elapsed = 0;
    state = 'ready';
    render();
  });
  document.addEventListener('keydown', event => {
    if (active && event.key === 'Escape' && state === 'running') { event.preventDefault(); pause(); }
  });
  document.addEventListener('visibilitychange', () => { if (active && document.hidden) pause(); });
  window.addEventListener('blur', () => { if (active) pause(); });
  reducedMotion.addEventListener('change', render);

  return {
    enter(callbacks) {
      active = true;
      onStart = callbacks.onStart;
      onFinish = callbacks.onFinish;
      render();
    },
    leave() {
      if (!active) return;
      pause();
      stopFrame();
      active = false;
    }
  };
})();
