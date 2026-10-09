'use strict';
window.PianoGame = (() => {
  const $ = id => document.getElementById(id);
  const notes = [
    ['A', 'Do', 60, 0], ['W', 'Do ♯', 61, .68], ['S', 'Re', 62, 1],
    ['E', 'Re ♯', 63, 1.68], ['D', 'Mi', 64, 2], ['F', 'Fa', 65, 3],
    ['T', 'Fa ♯', 66, 3.68], ['G', 'Sol', 67, 4], ['Y', 'Sol ♯', 68, 4.68],
    ['H', 'La', 69, 5], ['U', 'La ♯', 70, 5.68], ['J', 'Si', 71, 6], ['K', 'Do agudo', 72, 7]
  ].map(([letter, name, midi, position]) => ({ letter, name, midi, position }));
  const song = ['A', 'A', 'G', 'G', 'H', 'H', 'G', 'F', 'F', 'D', 'D', 'S', 'S', 'A'];
  const audio = Piano.createAudio();
  const sources = new Map(), voices = new Map(), timers = new Set();
  let active = false, sound = true, lesson = false, step = 0;

  for (const note of notes) {
    const button = document.createElement('button');
    const black = note.name.includes('♯');
    button.type = 'button';
    button.className = `piano-key ${black ? 'piano-black' : 'piano-white'}`;
    button.dataset.letter = note.letter;
    button.style.setProperty('--position', note.position);
    button.style.setProperty('--note-color', ['#e9a38f', '#e7c779', '#9ecabc', '#a8bbdf', '#b7a4d4', '#e1aabd', '#a5c8d5', '#e9a38f'][Math.floor(note.position)]);
    button.setAttribute('aria-label', `${note.name}, tecla ${note.letter}`);
    button.setAttribute('aria-pressed', 'false');
    const label = document.createElement('span'); label.className = 'piano-key-name'; label.textContent = note.name;
    const letter = document.createElement('kbd'); letter.textContent = note.letter;
    button.append(label, letter); $('piano-keys').append(button);
    note.button = button;
    button.addEventListener('pointerdown', event => {
      if (!active || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      press(`pointer:${event.pointerId}`, note);
    });
    button.addEventListener('lostpointercapture', event => release(`pointer:${event.pointerId}`));
    // Native button activation supports Enter, Space and assistive technology.
    button.addEventListener('click', event => {
      if (!active || event.detail !== 0) return;
      const source = `activate:${note.letter}`;
      press(source, note);
      const timer = setTimeout(() => { release(source); timers.delete(timer); }, 220);
      timers.add(timer);
    });
  }
  function soundMessage() {
    $('piano-audio-message').textContent = !sound ? 'El piano está silenciado. Activa el sonido para escuchar tus notas.'
      : audio.unlock() ? '' : 'Este navegador no puede reproducir el sonido. Puedes seguir explorando las notas.';
  }
  function renderLesson() {
    $('piano-song').setAttribute('aria-pressed', String(lesson));
    $('piano-song').textContent = lesson ? '♫ Tocar libremente' : '✦ Aprender Estrellita';
    $('piano-progress').hidden = !lesson;
    $('piano-progress').setAttribute('aria-label', `${step} de ${song.length} notas completadas`);
    [...$('piano-progress').children].forEach((dot, index) => dot.classList.toggle('complete', index < step));
    notes.forEach(note => {
      const next = lesson && note.letter === song[step];
      note.button.classList.toggle('is-next', next);
      note.button.setAttribute('aria-label', `${note.name}, tecla ${note.letter}${next ? ', siguiente nota' : ''}`);
    });
    if (!lesson) $('piano-guide').textContent = 'Inventa una melodía o sigue las notas de Estrellita.';
    else if (step === song.length) $('piano-guide').textContent = '¡Tocaste Estrellita! Vuelve a pulsar Aprender para tocarla otra vez.';
    else {
      const next = notes.find(note => note.letter === song[step]);
      $('piano-guide').textContent = `Estrellita · ${step} de ${song.length} notas. Toca ${next.name} con la tecla ${next.letter}${step && song[step] === song[step - 1] ? ' otra vez' : ''}.`;
    }
    if (lesson && step === song.length) {
      $('piano-song').textContent = '↻ Aprender Estrellita otra vez';
    }
  }
  song.forEach(() => { const dot = document.createElement('span'); dot.setAttribute('aria-hidden', 'true'); $('piano-progress').append(dot); });
  function press(source, note) {
    if (!active || sources.has(source)) return;
    const alreadyHeld = [...sources.values()].includes(note);
    sources.set(source, note);
    if (alreadyHeld) return;
    soundMessage();
    voices.set(note, audio.note(note.midi));
    note.button.classList.add('is-held');
    note.button.setAttribute('aria-pressed', 'true');
    $('piano-note').textContent = note.name;
    $('piano-note').style.color = note.button.style.getPropertyValue('--note-color');
    if (lesson && note.letter === song[step]) { step++; renderLesson(); }
  }
  function release(source) {
    const note = sources.get(source);
    if (!note) return;
    sources.delete(source);
    if ([...sources.values()].includes(note)) return;
    audio.release(voices.get(note)); voices.delete(note);
    note.button.classList.remove('is-held'); note.button.setAttribute('aria-pressed', 'false');
  }
  function clearHeld() {
    for (const timer of timers) clearTimeout(timer);
    timers.clear(); sources.clear(); voices.clear(); audio.stop();
    notes.forEach(note => { note.button.classList.remove('is-held'); note.button.setAttribute('aria-pressed', 'false'); });
  }
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { clearHeld(); return; }
    if (event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest('input, select, textarea, [contenteditable]')) return;
    const note = notes.find(note => event.code ? event.code === `Key${note.letter}` : event.key.toUpperCase() === note.letter);
    if (!note) return;
    event.preventDefault();
    if (!event.repeat) press(`key:${note.letter}`, note);
  });
  document.addEventListener('keyup', event => {
    const note = notes.find(note => event.code ? event.code === `Key${note.letter}` : event.key.toUpperCase() === note.letter);
    if (note) release(`key:${note.letter}`);
  });
  document.addEventListener('pointerup', event => release(`pointer:${event.pointerId}`));
  document.addEventListener('pointercancel', event => release(`pointer:${event.pointerId}`));
  window.addEventListener('blur', clearHeld);
  document.addEventListener('visibilitychange', clearHeld);
  $('piano-song').addEventListener('click', () => {
    if (!active) return;
    clearHeld();
    lesson = !lesson || step === song.length; step = 0; renderLesson();
  });
  return {
    enter({ sound: enabled = true } = {}) {
      clearHeld(); active = true; sound = enabled; audio.setEnabled(sound);
      lesson = false; step = 0; renderLesson(); soundMessage();
      $('piano-note').textContent = 'Tu música empieza aquí'; $('piano-note').style.color = '';
    },
    leave() { active = false; clearHeld(); },
    setSound(value) { sound = value; audio.setEnabled(value); if (active) soundMessage(); }
  };
})();
