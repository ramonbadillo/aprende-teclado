'use strict';
Soni.createAudio = function () {
  let context, master, enabled = true;
  const voices = new Set();
  const notes = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
  function balanceVolume() {
    if (master) master.gain.setValueAtTime(.16 / Math.max(1, voices.size), context.currentTime);
  }
  function unlock() {
    if (!enabled) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      if (!context) {
        context = new Context(); master = context.createGain(); master.gain.value = .16;
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -18; limiter.knee.value = 0; limiter.ratio.value = 20;
        limiter.attack.value = .003; limiter.release.value = .1;
        master.connect(limiter); limiter.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch { /* Magic still works without audio. */ }
  }
  function tone(frequency, delay = 0, duration = .22) {
    if (!enabled || !context || context.state !== 'running' || voices.size >= 8) return;
    try {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const start = context.currentTime + delay;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      // Normalize by live voices so chords share the same total volume budget.
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.12, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain); gain.connect(master);
      const voice = { oscillator, gain }; voices.add(voice); balanceVolume();
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); if (voices.delete(voice)) balanceVolume(); };
      oscillator.start(start); oscillator.stop(start + duration + .02);
    } catch { /* Optional Web Audio support. */ }
  }
  function stop() {
    for (const { oscillator, gain } of voices) {
      gain.disconnect(); try { oscillator.stop(); } catch { /* Already stopped. */ }
    }
    voices.clear(); balanceVolume();
  }
  return {
    unlock, stop,
    setEnabled(value) { enabled = value; if (!enabled) stop(); },
    note(x) { unlock(); tone(notes[Math.min(notes.length - 1, Math.floor(x * notes.length))]); },
    celebrate() {
      unlock(); stop(); [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => tone(note, i * .07, .3));
    }
  };
};
