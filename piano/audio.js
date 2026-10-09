'use strict';
window.Piano = window.Piano || {};
window.Piano.createAudio = function () {
  let context, master, enabled = true;
  const voices = new Set();
  const MAX_VOICES = 16;

  function dispose(voice) {
    if (!voices.delete(voice)) return;
    voice.gain.disconnect();
    for (const overtone of voice.overtones) overtone.disconnect();
    for (const oscillator of voice.oscillators) {
      oscillator.onended = null;
      try { oscillator.stop(); } catch { /* Already ended. */ }
      oscillator.disconnect();
    }
  }
  function stop() { for (const voice of [...voices]) dispose(voice); }
  function unlock() {
    if (!enabled) return true;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return false;
      if (!context) {
        context = new Context();
        master = context.createGain();
        // Fixed headroom for up to sixteen voices, including release tails.
        master.gain.value = .22;
        master.connect(context.destination);
      }
      if (context.state === 'closed') return false;
      if (context.state === 'suspended') context.resume().catch(() => {});
      return true;
    } catch { return false; }
  }
  function note(midi) {
    if (!enabled || !unlock()) return null;
    if (voices.size >= MAX_VOICES) dispose(voices.values().next().value);
    const voice = { oscillators: [], overtones: [], gain: null, released: false, start: context.currentTime };
    try {
      const start = context.currentTime;
      const frequency = 440 * 2 ** ((midi - 69) / 12);
      voice.gain = context.createGain();
      voice.gain.gain.setValueAtTime(0, start);
      voice.gain.gain.linearRampToValueAtTime(1 / MAX_VOICES, start + .008);
      voice.gain.gain.exponentialRampToValueAtTime(.0001, start + 4);
      voice.gain.connect(master);
      voices.add(voice);
      // A soft fundamental and quickly fading harmonics suggest a struck piano string.
      for (const [harmonic, volume, decay] of [[1, .72, 3.5], [2, .2, 1.4], [3, .08, .65]]) {
        const oscillator = context.createOscillator();
        const overtone = context.createGain();
        voice.overtones.push(overtone);
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency * harmonic;
        overtone.gain.setValueAtTime(volume, start);
        overtone.gain.exponentialRampToValueAtTime(.0001, start + decay);
        oscillator.connect(overtone); overtone.connect(voice.gain);
        voice.oscillators.push(oscillator);
        oscillator.onended = () => {
          overtone.disconnect();
          if (oscillator === voice.oscillators[0]) dispose(voice);
        };
        oscillator.start(start); oscillator.stop(start + 4.05);
      }
      return voice;
    } catch {
      dispose(voice);
      return null;
    }
  }
  function release(voice) {
    if (!voice || !voices.has(voice) || voice.released) return;
    voice.released = true;
    const now = context.currentTime;
    if (voice.gain.gain.cancelAndHoldAtTime) voice.gain.gain.cancelAndHoldAtTime(now);
    else {
      voice.gain.gain.cancelScheduledValues(now);
      const decay = Math.min(1, Math.max(0, (now - voice.start - .008) / (4 - .008)));
      voice.gain.gain.setValueAtTime((1 / MAX_VOICES) * (.0001 * MAX_VOICES) ** decay, now);
    }
    voice.gain.gain.exponentialRampToValueAtTime(.0001, now + .12);
    for (const oscillator of voice.oscillators) oscillator.stop(now + .14);
  }
  return { unlock, note, release, stop, setEnabled(value) { enabled = value; if (!enabled) stop(); } };
};
