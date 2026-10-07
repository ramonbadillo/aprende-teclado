'use strict';

window.VisualTimer = (() => {
  const get = id => document.getElementById(id);
  const screen = get('timer');
  const minutes = get('timer-minutes');
  const presets = [...screen.querySelectorAll('[data-minutes]')];
  let duration = 5 * 60000;
  let remaining = duration;
  let deadline = 0;
  let state = 'ready';
  let active = false;
  let ticker = null;
  let onStart = () => {};
  let onFinish = () => {};

  function render() {
    const fraction = Math.max(0, Math.min(1, remaining / duration));
    const stage = state === 'done' ? 'done' : fraction > .5 ? 'plenty' : fraction > .2 ? 'half' : 'little';
    const seconds = Math.ceil(remaining / 1000);
    const messages = {
      plenty: '¡Tenemos mucho tiempo!',
      half: 'Vamos por la mitad.',
      little: 'Queda poquito. Vamos terminando.',
      done: '¡Nuestro ratito terminó!'
    };
    const message = state === 'paused' ? 'El tiempo está en pausa.' : messages[stage];
    screen.dataset.state = state;
    screen.dataset.stage = stage;
    get('timer-dial').style.setProperty('--remaining', `${fraction * 100}%`);
    get('timer-dial').setAttribute('aria-label', `${Math.floor(seconds / 60)} minutos y ${seconds % 60} segundos restantes. ${Math.round(fraction * 100)}% del tiempo. ${state === 'paused' ? 'En pausa.' : messages[stage]}`);
    get('timer-digits').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    get('timer-face').textContent = state === 'done' ? '✓' : state === 'paused' ? 'Ⅱ' : '☀';
    get('timer-caption').textContent = state === 'done' ? '¡lo hicimos!' : state === 'paused' ? 'en pausa' : 'por disfrutar';
    // Announce only meaningful changes, rather than every second.
    if (get('timer-message').textContent !== message) get('timer-message').textContent = message;
    get('timer-toggle').textContent = { ready: 'Empezar →', running: 'Ⅱ Pausar', paused: 'Continuar →', done: 'Otra vez →' }[state];
    get('timer-settings').disabled = ['running', 'paused'].includes(state);
    get('timer-reset').disabled = state === 'ready';
    presets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.minutes) * 60000 === duration)));
  }

  function clearTicker() {
    clearInterval(ticker);
    ticker = null;
  }

  function tick() {
    if (state !== 'running') return;
    // Use elapsed wall time: background tabs may throttle interval callbacks.
    remaining = Math.max(0, deadline - Date.now());
    if (remaining === 0) {
      state = 'done';
      clearTicker();
      render();
      onFinish();
      return;
    }
    render();
  }

  function setDuration() {
    if (!minutes.checkValidity()) {
      minutes.setAttribute('aria-invalid', 'true');
      get('timer-error').textContent = 'Elige de 1 a 120 minutos completos.';
      return false;
    }
    minutes.removeAttribute('aria-invalid');
    get('timer-error').textContent = '';
    duration = Number(minutes.value) * 60000;
    remaining = duration;
    state = 'ready';
    render();
    return true;
  }

  function pause() {
    if (state !== 'running') return;
    tick();
    if (state === 'done') return;
    state = 'paused';
    clearTicker();
    render();
  }

  get('timer-toggle').addEventListener('click', () => {
    if (state === 'running') { pause(); return; }
    if (state !== 'paused' && !setDuration()) { minutes.focus(); return; }
    onStart();
    deadline = Date.now() + remaining;
    state = 'running';
    render();
    ticker = setInterval(tick, 200);
  });
  get('timer-reset').addEventListener('click', () => {
    clearTicker();
    remaining = duration;
    state = 'ready';
    render();
  });
  presets.forEach(button => button.addEventListener('click', () => {
    minutes.value = button.dataset.minutes;
    setDuration();
  }));
  minutes.addEventListener('input', setDuration);
  document.addEventListener('keydown', event => {
    if (active && event.key === 'Escape' && state === 'running') { event.preventDefault(); pause(); }
  });
  document.addEventListener('visibilitychange', () => { if (active && !document.hidden) tick(); });

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
      clearTicker();
      active = false;
    }
  };
})();
