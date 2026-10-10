'use strict';
window.PopitGame = (() => {
  const $ = id => document.getElementById(id);
  const board = $('popit-board'), toy = $('popit-toy');
  const bubbles = [], pointers = new Set(), voices = new Set();
  let active = false, sound = true, audio = null, count = 0, generation = 0;

  function stopSound() {
    generation++;
    for (const voice of voices) { try { voice.stop(); } catch {} }
    voices.clear();
  }
  function playPop(index) {
    if (!sound || !active) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      const token = generation;
      const play = () => {
        if (!active || !sound || token !== generation || audio.state !== 'running') return;
        if (voices.size >= 8) { const oldest = voices.values().next().value; oldest.stop(); voices.delete(oldest); }
        const oscillator = audio.createOscillator(), gain = audio.createGain();
        const now = audio.currentTime;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(480 + (index % 6) * 35, now);
        oscillator.frequency.exponentialRampToValueAtTime(85, now + .055);
        gain.gain.setValueAtTime(.001, now);
        gain.gain.exponentialRampToValueAtTime(.2, now + .004);
        gain.gain.exponentialRampToValueAtTime(.001, now + .095);
        oscillator.connect(gain); gain.connect(audio.destination);
        voices.add(oscillator);
        oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(now); oscillator.stop(now + .1);
      };
      if (audio.state === 'running') play(); else audio.resume().then(play).catch(() => {});
    } catch { /* Las burbujas funcionan también sin audio. */ }
  }
  function pop(button) {
    if (!active || !button || button.getAttribute('aria-pressed') === 'true') return;
    button.setAttribute('aria-pressed', 'true');
    count++;
    $('popit-count').textContent = `${count} / 36 pops`;
    playPop(Number(button.dataset.index));
    if (count === 36) $('popit-status').textContent = '¡Todos hicieron pop! ✨ Dale la vuelta y empieza otra vez.';
  }
  for (let row = 0; row < 6; row++) {
    const strip = document.createElement('div'); strip.className = 'popit-row';
    for (let col = 0; col < 6; col++) {
      const index = row * 6 + col, button = document.createElement('button');
      button.type = 'button'; button.className = 'popit-bubble'; button.dataset.index = index;
      button.setAttribute('aria-label', `Burbuja ${index + 1}, fila ${row + 1}, columna ${col + 1}`);
      button.setAttribute('aria-pressed', 'false');
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener('click', () => pop(button));
      button.addEventListener('focus', () => bubbles.forEach(b => b.tabIndex = b === button ? 0 : -1));
      bubbles.push(button); strip.append(button);
    }
    board.append(strip);
  }
  board.addEventListener('keydown', event => {
    if (!active || event.altKey || event.ctrlKey || event.metaKey) return;
    const index = bubbles.indexOf(event.target);
    if (index < 0) return;
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -6, ArrowDown: 6 };
    if (event.key in steps) { event.preventDefault(); bubbles[(index + steps[event.key] + 36) % 36].focus({ preventScroll: true }); }
  });
  board.addEventListener('pointerdown', event => {
    if (!active || event.button !== 0) return;
    const button = event.target.closest('.popit-bubble');
    if (!button) return;
    pointers.add(event.pointerId);
    // Implicit touch capture would otherwise prevent sliding between bubbles.
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    pop(button);
  });
  board.addEventListener('pointermove', event => {
    if (!active || !pointers.has(event.pointerId)) return;
    const button = document.elementFromPoint(event.clientX, event.clientY)?.closest('.popit-bubble');
    if (button && board.contains(button)) pop(button);
  });
  for (const name of ['pointerup', 'pointercancel']) window.addEventListener(name, event => pointers.delete(event.pointerId));
  function release() { pointers.clear(); stopSound(); }
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  $('popit-flip').addEventListener('click', () => {
    if (!active) return;
    release(); count = 0;
    bubbles.forEach(button => button.setAttribute('aria-pressed', 'false'));
    $('popit-count').textContent = '0 / 36 pops';
    $('popit-status').textContent = '¡Otra vuelta de burbujitas! Empieza donde quieras.';
    toy.classList.remove('flipping'); void toy.offsetWidth; toy.classList.add('flipping');
  });
  toy.addEventListener('animationend', () => toy.classList.remove('flipping'));
  document.querySelectorAll('[data-popit-palette]').forEach(button => button.addEventListener('click', () => {
    if (!active) return;
    toy.dataset.palette = button.dataset.popitPalette;
    document.querySelectorAll('[data-popit-palette]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
  }));
  return {
    enter(options = {}) { active = true; sound = options.sound !== false; },
    leave() { active = false; release(); toy.classList.remove('flipping'); },
    setSound(value) { sound = value; if (!sound) stopSound(); }
  };
})();
