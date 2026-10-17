'use strict';

// Shared preferences and lifecycle for independently loaded activity documents.
(() => {
  const storageKey = 'los-globos-de-fabi-v1';
  const activity = document.body.dataset.activity;
  function readSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch { return {}; }
  }
  const options = { sound: readSaved().options?.sound !== false };
  const layout = readSaved().options?.layout === 'en' ? 'en' : 'es';
  const soundButton = document.getElementById('sound');
  let audio;
  const game = {
    soni: window.SoniGame,
    timer: window.VisualTimer,
    breathing: window.ButterflyBreathing,
    piano: window.PianoGame,
    hangman: window.HangmanGame,
    popit: window.PopitGame,
    clay: window.ClayGame,
    space: window.SpaceGame,
    coloring: window.ColoringTool,
    numbers: window.NumbersGame,
    basketball: window.BasketballGame
  }[activity];

  function enableAudio() {
    if (!options.sound) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      audio ||= new Context();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch { /* Sound is optional. */ }
  }
  function chime(celebrate = false) {
    if (!options.sound || !audio || audio.state !== 'running') return;
    try {
      (celebrate ? [523.25, 659.25, 783.99] : [659.25]).forEach((frequency, index) => {
        const start = audio.currentTime + index * .13;
        const oscillator = audio.createOscillator(), gain = audio.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.055, start + .02);
        gain.gain.exponentialRampToValueAtTime(.001, start + .3);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(start); oscillator.stop(start + .32);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Visual feedback remains available. */ }
  }
  function renderSound() {
    soundButton.setAttribute('aria-pressed', String(options.sound));
    document.getElementById('sound-label').textContent = options.sound ? 'Sonido activado' : 'Sonido silenciado';
    game?.setSound?.(options.sound);
  }
  soundButton.addEventListener('click', () => {
    options.sound = !options.sound;
    renderSound();
    if (!options.sound && audio) audio.suspend().catch(() => {});
    if (options.sound) enableAudio();
    try {
      const saved = readSaved();
      saved.options = { ...saved.options, sound: options.sound };
      localStorage.setItem(storageKey, JSON.stringify(saved));
    } catch { /* Keep the choice for this page if storage is unavailable. */ }
  });
  function enter() {
    options.sound = readSaved().options?.sound !== false;
    renderSound();
    if (activity === 'soni') game.start({ sound: options.sound, layout });
    else game?.enter({
      sound: options.sound,
      onStart: enableAudio,
      onFinish: () => chime(activity === 'timer' || activity === 'basketball'),
      onCorrect: () => { enableAudio(); chime(); },
      onStamp: () => { enableAudio(); chime(); }
    });
  }
  enter();
  window.addEventListener('pagehide', () => {
    if (activity === 'soni') game.stop();
    else game?.leave();
    if (audio) audio.suspend().catch(() => {});
  });
  // Browsers may restore an existing document when using Back/Forward.
  window.addEventListener('pageshow', event => { if (event.persisted) enter(); });
})();
