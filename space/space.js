'use strict';

window.SpaceGame = (() => {
  const $ = id => document.getElementById(id);
  const alphabet = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
  const goal = 20;
  const lanes = [20, 50, 80];
  let active = false, phase = 'ready', lives = 6, score = 0;
  let meteors = [], effects = [], frame = 0, last = 0, elapsed = 0, nextSpawn = 0;
  let sound = true, audio, voices = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function tone(hit) {
    if (!sound) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      audio ||= new Context();
      audio.resume().catch(() => {});
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = hit ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(hit ? 900 : 160, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(hit ? 260 : 65, audio.currentTime + .18);
      gain.gain.setValueAtTime(.045, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .23);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + .25);
      voices.push(oscillator);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices = voices.filter(v => v !== oscillator); };
    } catch { /* Audio is optional. */ }
  }
  function silence() { voices.forEach(voice => { try { voice.stop(); } catch {} }); voices = []; }
  function status(message) { $('space-status').textContent = message; }
  function render() {
    $('space-lives').textContent = `${lives} / 6`;
    $('space-hearts').textContent = '♥'.repeat(lives) + '♡'.repeat(6 - lives);
    $('space-health').setAttribute('aria-label', `${lives} de 6 vidas`);
    $('space-score').textContent = `${score} / ${goal}`;
    $('space-progress').value = score;
    $('space-ship').dataset.damage = String(6 - lives);
    $('space-ship').setAttribute('aria-label', `Cohete con astronauta. ${lives} de 6 vidas.`);
    $('space-arena').dataset.phase = phase;
    $('space-pause').disabled = !['playing', 'paused'].includes(phase);
    $('space-pause').textContent = phase === 'paused' ? '▶ Continuar' : 'Ⅱ Pausar';
    $('space-keyboard').querySelectorAll('button').forEach(button => { button.disabled = phase !== 'playing'; });
    $('space-overlay').hidden = phase === 'playing';
    if (phase === 'playing') return;
    const content = {
      ready: ['TU PRIMERA MISIÓN', '¡Al espacio!', 'Escribe la letra de un meteorito para disparar. ¡Salva tu cohete!', '🚀 Despegar'],
      paused: ['UN RESPIRO ENTRE LAS ESTRELLAS', 'Misión en pausa', 'Tu astronauta te espera. Continúa cuando estés listo.', '▶ Continuar misión'],
      won: ['¡MISIÓN CUMPLIDA!', '¡Eres una estrella!', `Destruiste ${goal} meteoritos y llegaste con ${lives} ${lives === 1 ? 'vida' : 'vidas'}.`, '↻ Jugar otra vez'],
      lost: ['VOLVAMOS A INTENTARLO', '¡A reparar el cohete!', `Destruiste ${score} meteoritos. Tu astronauta está a salvo. ¡Prepara otras 6 vidas!`, '↻ Reparar y jugar']
    }[phase];
    ['space-overlay-kicker', 'space-overlay-title', 'space-overlay-text', 'space-start'].forEach((id, i) => { $(id).textContent = content[i]; });
  }
  function spawn() {
    const available = lanes.filter(x => !meteors.some(m => m.lane === x));
    if (!available.length || score + meteors.length >= goal) return;
    const letters = alphabet.filter(letter => !meteors.some(m => m.letter === letter));
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const lane = available[Math.floor(Math.random() * available.length)];
    const node = document.createElement('div');
    node.className = 'space-meteor'; node.dataset.letter = letter;
    node.setAttribute('role', 'img'); node.setAttribute('aria-label', `Meteorito letra ${letter}`);
    const label = document.createElement('span'); label.textContent = letter; node.append(label);
    const meteor = { node, letter, lane, age: 0, duration: Math.max(14000, 21000 - score * 300), x: lane, y: 10 };
    node.style.left = `${lane}%`; node.style.top = '10%';
    $('space-meteors').append(node); meteors.push(meteor);
  }
  function remove(meteor) { meteor.node.remove(); meteors = meteors.filter(m => m !== meteor); }
  function clearEffects() { effects.forEach(effect => effect.node.remove()); effects = []; }
  function effect(className, x, y, text = '') {
    const node = document.createElement('span'); node.className = className; node.textContent = text;
    node.style.left = `${x}%`; node.style.top = `${y}%`;
    $('space-effects').append(node); effects.push({ node, until: elapsed + 550 });
    return node;
  }
  function shoot(meteor) {
    const arena = $('space-arena');
    const x = reducedMotion.matches ? meteor.lane : meteor.x;
    const y = reducedMotion.matches ? 28 : meteor.y;
    const dx = (x - 50) * arena.clientWidth / 100;
    const dy = (y - 78) * arena.clientHeight / 100;
    const beam = effect('space-laser', 50, 78);
    beam.style.width = `${Math.hypot(dx, dy)}px`;
    beam.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    effect('space-burst', x, y, '✦');
    remove(meteor); score++; tone(true); render();
    status(`¡Bien! Letra ${meteor.letter}. ${score} de ${goal} meteoritos.`);
    if (score === goal) finish('won');
    else { spawn(); nextSpawn = elapsed + 3500; }
  }
  function damage(message) {
    lives = Math.max(0, lives - 1); tone(false);
    effect('space-damage-flash', 50, 81, '−1 ♥');
    render(); status(`${message} Te ${lives === 1 ? 'queda 1 vida' : `quedan ${lives} vidas`}.`);
    if (!lives) finish('lost');
  }
  function select(letter) {
    if (!active || phase !== 'playing') return;
    const target = meteors.find(m => m.letter === letter);
    if (target) shoot(target);
    else damage(`La ${letter} no está en los meteoritos.`);
  }
  function finish(result) {
    phase = result; cancelAnimationFrame(frame); render();
    status(result === 'won' ? '¡Misión cumplida! Tu astronauta llegó a salvo.' : 'El cohete necesita reparaciones. Puedes volver a jugar con 6 vidas.');
    $('space-start').focus({ preventScroll: true });
  }
  function tick(now) {
    if (!active || phase !== 'playing') return;
    // Cap long frames so a busy browser cannot skip directly to a collision.
    const dt = Math.min(now - last, 100); last = now; elapsed += dt;
    for (const meteor of [...meteors]) {
      meteor.age += dt;
      const progress = Math.min(meteor.age / meteor.duration, 1);
      meteor.x = meteor.lane + (50 - meteor.lane) * progress;
      meteor.y = 10 + 68 * progress;
      // Reduced motion keeps targets still; a visible ring shows time remaining.
      meteor.node.style.left = `${reducedMotion.matches ? meteor.lane : meteor.x}%`;
      meteor.node.style.top = `${reducedMotion.matches ? 28 : meteor.y}%`;
      meteor.node.style.setProperty('--remaining', `${(1 - progress) * 100}%`);
      if (progress >= 1) {
        remove(meteor); damage(`El meteorito ${meteor.letter} alcanzó tu cohete.`);
        if (phase !== 'playing') return;
        spawn();
      }
    }
    if (elapsed >= nextSpawn) { spawn(); nextSpawn = elapsed + 5000; }
    effects = effects.filter(effect => { if (effect.until > elapsed) return true; effect.node.remove(); return false; });
    frame = requestAnimationFrame(tick);
  }
  function run() { phase = 'playing'; last = performance.now(); render(); $('space-title').focus({ preventScroll: true }); frame = requestAnimationFrame(tick); }
  function start() {
    if (!active) return;
    if (phase === 'paused') { status('¡Seguimos! Escribe una de las letras de los meteoritos.'); run(); return; }
    cancelAnimationFrame(frame); meteors.forEach(m => m.node.remove()); meteors = []; clearEffects();
    lives = 6; score = 0; elapsed = 0; nextSpawn = 5000;
    spawn(); spawn(); run(); status('¡Vamos! Escribe una letra que veas en los meteoritos.');
  }
  function pause() {
    if (phase !== 'playing') return;
    phase = 'paused'; cancelAnimationFrame(frame); clearEffects(); silence(); render(); status('Misión en pausa. No pierdes vidas mientras descansas.');
  }
  function keydown(event) {
    if (!active || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]') || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); pause(); return; }
    const letter = event.key.toLocaleUpperCase('es');
    if (!alphabet.includes(letter)) return;
    if (phase === 'playing') { event.preventDefault(); select(letter); }
  }
  ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'].forEach(row => {
    const group = document.createElement('div'); group.className = 'space-key-row';
    [...row].forEach(letter => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = letter;
      button.setAttribute('aria-label', `Disparar letra ${letter}`); button.addEventListener('click', () => select(letter)); group.append(button);
    });
    $('space-keyboard').append(group);
  });
  $('space-start').addEventListener('click', start);
  $('space-pause').addEventListener('click', () => { if (phase === 'paused') start(); else pause(); });
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  render();
  return {
    enter(options = {}) { active = true; sound = options.sound !== false; render(); document.addEventListener('keydown', keydown); },
    leave() { pause(); active = false; cancelAnimationFrame(frame); silence(); document.removeEventListener('keydown', keydown); },
    setSound(enabled) { sound = enabled; if (!sound) silence(); }
  };
})();
