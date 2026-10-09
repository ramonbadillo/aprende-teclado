// Run with Node.js, Playwright and Microsoft Edge installed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

function testAudio() {
  const oscillators = [], gains = [];
  class AudioNode {
    constructor() { this.gain = this.frequency = this; this.events = []; }
    setValueAtTime(value, time) { this.events.push(['set', value, time]); }
    linearRampToValueAtTime(value, time) { this.events.push(['linear', value, time]); }
    exponentialRampToValueAtTime(value, time) { this.events.push(['exp', value, time]); }
    cancelAndHoldAtTime(time) { this.events.push(['hold', time]); }
    cancelScheduledValues(time) { this.events.push(['cancel', time]); }
    connect() {} disconnect() { this.disconnected = true; }
    start() { this.started = true; } stop(time) { this.stopTime = time; }
  }
  class AudioContext {
    constructor() { this.currentTime = 0; this.state = 'running'; }
    createGain() { const node = new AudioNode(); gains.push(node); return node; }
    createOscillator() { const node = new AudioNode(); oscillators.push(node); return node; }
  }
  const sandbox = { window: { AudioContext } }; vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'piano/audio.js'), 'utf8'), sandbox);
  const audio = sandbox.window.Piano.createAudio();
  const doNote = audio.note(60);
  assert(Math.abs(oscillators[0].frequency.value - 261.625565) < .001, 'Do uses a tuned C4 frequency');
  assert.equal(oscillators[1].frequency.value, oscillators[0].frequency.value * 2);
  audio.release(doNote);
  assert.equal(oscillators[0].stopTime, .14, 'Key release damps the note');
  for (let i = 0; i < 100; i++) audio.note(60 + i % 13);
  assert.equal(oscillators.filter(node => !node.disconnected).length, 16 * 3, 'Rapid input has bounded polyphony');
  assert(gains.filter(node => !node.disconnected).length <= 1 + 16 * 4, 'Overtone gains are cleaned up');
  assert.equal(gains[0].gain.value, .22);
  audio.setEnabled(false);
  assert(oscillators.every(node => node.disconnected));
  const count = oscillators.length; audio.note(60); assert.equal(oscillators.length, count);
  audio.setEnabled(true);
  const fallback = audio.note(60);
  fallback.gain.cancelAndHoldAtTime = undefined;
  audio.release(fallback);
  assert(fallback.gain.events.some(event => event[0] === 'cancel'), 'Older AudioParam implementations still release notes');
  audio.stop();
  const unsupported = { window: {} }; vm.createContext(unsupported);
  vm.runInContext(fs.readFileSync(path.join(root, 'piano/audio.js'), 'utf8'), unsupported);
  assert.equal(unsupported.window.Piano.createAudio().unlock(), false);
}

(async () => {
  testAudio();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const key = letter => page.locator(`.piano-key[data-letter="${letter}"]`);
  const held = () => page.locator('.piano-key.is-held').count();
  const emit = (type, code, extra = {}) => page.evaluate(({ type, code, extra }) => {
    const event = new KeyboardEvent(type, { code, key: code.replace('Key', '').toLowerCase(), bubbles: true, cancelable: true, ...extra });
    document.dispatchEvent(event); return event.defaultPrevented;
  }, { type, code, extra });
  const screenshot = async name => {
    if (!process.env.SCREENSHOT_DIR) return;
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, `${name}.png`), fullPage: true });
  };
  try {
    await page.addInitScript(() => {
      window.pianoOscillators = [];
      const original = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (...args) {
        const oscillator = original.apply(this, args);
        window.pianoOscillators.push(oscillator);
        return oscillator;
      };
    });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    assert.equal(await page.locator('.game-choice').count(), 5);
    await screenshot('piano-chooser');
    await page.locator('#choose-piano').click();
    assert.equal(await page.locator('#piano').isVisible(), true);
    assert.equal(await page.locator('#piano-title').evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('.piano-white').count(), 8);
    assert.equal(await page.locator('.piano-black').count(), 5);
    await screenshot('piano-desktop');

    for (const letter of ['a', 'd', 'g']) await page.keyboard.down(letter);
    assert.equal(await held(), 3);
    const frequencies = await page.evaluate(() => window.pianoOscillators.filter((_, i) => i % 3 === 0).map(node => node.frequency.value));
    assert(frequencies.every((frequency, i) => Math.abs(frequency - [261.625565, 329.627557, 391.995436][i]) < .001));
    await page.keyboard.down('g');
    assert.equal(await page.evaluate(() => pianoOscillators.length), 9, 'Held keys do not repeat');
    await page.keyboard.up('d'); assert.equal(await held(), 2);
    await screenshot('piano-chord');
    await page.keyboard.up('a'); await page.keyboard.up('g'); assert.equal(await held(), 0);

    await emit('keydown', 'KeyW', { key: 'W', shiftKey: true });
    assert.equal(await key('W').getAttribute('aria-pressed'), 'true');
    await emit('keyup', 'KeyW');
    assert.equal(await emit('keydown', 'KeyA', { ctrlKey: true }), false, 'Browser shortcuts remain available');
    assert.equal(await held(), 0);

    // Mouse capture releases the key even outside the instrument.
    const box = await key('S').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 20);
    await page.mouse.down(); assert.equal(await held(), 1);
    await page.keyboard.down('s');
    await page.mouse.move(5, 5); await page.mouse.up();
    assert.equal(await held(), 1, 'Mouse and physical keyboard release independently');
    await page.keyboard.up('s'); assert.equal(await held(), 0);
    await key('E').click(); assert.equal(await page.locator('#piano-note').textContent(), 'Re ♯');
    await key('K').focus(); await page.keyboard.press('Enter'); assert.equal(await held(), 1);
    await page.waitForTimeout(260); assert.equal(await held(), 0);

    await page.locator('#piano-song').click();
    assert.equal(await page.locator('.piano-key.is-next').getAttribute('data-letter'), 'A');
    await page.keyboard.press('s');
    assert.equal(await page.locator('.piano-progress .complete').count(), 0, 'Other notes preserve lesson progress');
    await page.keyboard.down('a'); await page.keyboard.down('a');
    assert.equal(await page.locator('.piano-progress .complete').count(), 1, 'Repeated melody notes require a new press');
    await page.keyboard.up('a');
    for (const letter of ['a', 'g', 'g', 'h', 'h', 'g', 'f', 'f', 'd', 'd', 's', 's', 'a']) await page.keyboard.press(letter);
    assert.equal(await page.locator('.piano-progress .complete').count(), 14);
    assert.match(await page.locator('#piano-guide').textContent(), /¡Tocaste Estrellita!/);
    await screenshot('piano-song-done');
    await page.locator('#piano-song').click();
    assert.equal(await page.locator('.piano-progress .complete').count(), 0);
    await page.locator('#piano-song').click();
    assert.equal(await page.locator('#piano-progress').isVisible(), false);

    for (const cleanup of ['blur', 'visibilitychange', 'Escape']) {
      await page.keyboard.down('f'); assert.equal(await held(), 1);
      if (cleanup === 'Escape') await page.keyboard.press('Escape');
      else await page.evaluate(type => (type === 'blur' ? window : document).dispatchEvent(new Event(type)), cleanup);
      assert.equal(await held(), 0);
      await page.keyboard.up('f');
    }
    await page.keyboard.down('h'); await page.locator('#sound').click();
    const mutedCount = await page.evaluate(() => pianoOscillators.length);
    await page.keyboard.up('h'); await page.keyboard.press('a');
    assert.equal(await page.evaluate(() => pianoOscillators.length), mutedCount);
    assert.match(await page.locator('#piano-audio-message').textContent(), /silenciado/);
    await page.locator('#sound').click(); await page.keyboard.press('a');
    assert.equal(await page.evaluate(() => pianoOscillators.length), mutedCount + 3);

    for (let i = 0; i < 3; i++) {
      await page.keyboard.down('a'); await page.locator('#piano-home').click();
      assert.equal(await held(), 0); await page.keyboard.up('a');
      const before = await page.evaluate(() => pianoOscillators.length);
      await page.keyboard.press('a'); assert.equal(await page.evaluate(() => pianoOscillators.length), before);
      await page.locator('#choose-piano').click();
    }
    const before = await page.evaluate(() => pianoOscillators.length);
    await page.keyboard.press('a'); assert.equal(await page.evaluate(() => pianoOscillators.length), before + 3);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal scrolling on phones');
      await screenshot(`piano-mobile-${width}`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.keyboard.press('a'); assert.equal(await held(), 0);
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const touchPage = await touch.newPage();
    await touchPage.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await touchPage.locator('#choose-piano').tap();
    await touchPage.locator('.piano-key[data-letter="G"]').tap();
    assert.equal(await touchPage.locator('#piano-note').textContent(), 'Sol');
    assert.equal(await touchPage.locator('.piano-key.is-held').count(), 0);
    await touch.close();

    await page.locator('.brand').click();
    await page.locator('#choose-soni').click(); await page.keyboard.press('a');
    assert(await page.locator('.soni-particle').count() > 0);
    assert.equal(await held(), 0);
    await page.locator('#soni-home').click(); await page.locator('#choose-piano').click();
    await page.keyboard.press('a'); assert.equal(await page.locator('.soni-particle').count(), 0);

    const noAudio = await browser.newPage();
    await noAudio.addInitScript(() => { window.AudioContext = undefined; window.webkitAudioContext = undefined; });
    await noAudio.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await noAudio.locator('#choose-piano').click(); await noAudio.keyboard.down('a');
    assert.equal(await noAudio.locator('.piano-key.is-held').count(), 1);
    assert.match(await noAudio.locator('#piano-audio-message').textContent(), /no puede reproducir/);
    await noAudio.close();
    assert.deepEqual(errors, []);
    console.log('Piano: tuning, bounded audio, release, chords, repeat, pointer/keyboard ownership, accessibility, lesson, cleanup, mute, navigation, touch, mobile and missing audio passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
