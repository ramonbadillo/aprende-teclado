'use strict';
window.SoniGame = (() => {
  const stage = document.getElementById('soni-stage');
  const particles = Soni.createParticles(document.getElementById('soni-particles'));
  const effects = Soni.createEffects(particles);
  const audio = Soni.createAudio();
  const bursts = Soni.createBurstDetector();
  let running = false;
  const keyboard = Soni.createKeyboard(document.getElementById('soni-keyboard'), {
    onPress(key) {
      const { tier, celebration } = bursts.press();
      stage.classList.add('has-played'); effects.press(key, tier);
      if (celebration) { effects.celebrate(); audio.celebrate(); }
      else audio.note(key.x);
    },
    onReset() { bursts.reset(); particles.clear(); audio.stop(); }
  });
  return {
    start({ sound = true, layout = 'es' } = {}) {
      if (running) return;
      running = true; audio.setEnabled(sound); audio.unlock(); stage.classList.remove('has-played'); keyboard.start(layout);
    },
    stop() { if (!running) return; running = false; keyboard.stop(); },
    setSound(value) { audio.setEnabled(value); if (value && running) audio.unlock(); }
  };
})();
