// Run with Node.js and Playwright installed; no dependencies are needed to play.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

function testBurstDetector() {
  const sandbox = { Soni: {}, performance }; vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'soni/bursts.js'), 'utf8'), sandbox);
  const detector = sandbox.Soni.createBurstDetector();
  for (let i = 0; i < 7; i++) {
    const reaction = detector.press(i * 20);
    assert.equal(reaction.tier, i === 0 ? 1 : i < 3 ? 2 : i < 6 ? 3 : 4);
    assert.equal(reaction.celebration, i === 6);
  }
  assert.equal(detector.press(140).celebration, false);
  assert.equal(detector.press(500).tier, 1, 'Old downs must expire after 250 ms');
  detector.reset(); assert.equal(detector.press(510).tier, 1);
}

function testAudioLimits() {
  const oscillators = [], gains = [];
  class Node {
    constructor() { this.values = []; this.gain = this.frequency = this.threshold = this.knee = this.ratio = this.attack = this.release = this; }
    setValueAtTime(value) { this.values.push(value); this.value = value; }
    linearRampToValueAtTime(value) { this.values.push(value); }
    exponentialRampToValueAtTime(value) { this.values.push(value); }
    connect() {} disconnect() { this.disconnected = true; }
    start() {} stop() { this.stopped = true; }
  }
  class AudioContext {
    constructor() { this.currentTime = 0; this.state = 'running'; }
    createGain() { const node = new Node(); gains.push(node); return node; }
    createOscillator() { const node = new Node(); oscillators.push(node); return node; }
    createDynamicsCompressor() { return new Node(); }
  }
  const sandbox = { Soni: {}, window: { AudioContext } }; vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'soni/audio.js'), 'utf8'), sandbox);
  const audio = sandbox.Soni.createAudio();
  for (let i = 0; i < 100; i++) audio.note(.5);
  assert.equal(oscillators.length, 8, 'Polyphony is bounded even under heavy input');
  assert.equal(gains[0].value, .16 / 8, 'Eight voices share the single-note volume budget');
  assert(Math.max(...gains[0].values) <= .16, 'Master gain never exceeds its volume budget');
  gains.slice(1).forEach(node => assert(Math.max(...node.values) <= .12));
  audio.celebrate(); assert.equal(oscillators.length, 12);
  assert(oscillators.slice(0, 8).every(node => node.stopped));
  audio.setEnabled(false); audio.note(1); assert.equal(oscillators.length, 12);
  assert(gains.slice(1).every(node => node.disconnected), 'Mute disconnects ongoing and queued notes');
}

(async () => {
  testBurstDetector(); testAudioLimits();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  const held = () => page.locator('.soni-key.is-held').count();
  const particles = () => page.locator('.soni-particle').count();
  const screenshot = async name => {
    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, name + '.png'), fullPage: true });
    }
  };
  const emit = async (type, code, key = code, extra = {}) => page.evaluate(({ type, code, key, extra }) => {
    const event = new KeyboardEvent(type, { code, key, bubbles: true, cancelable: true, ...extra });
    document.dispatchEvent(event); return event.defaultPrevented;
  }, { type, code, key, extra });
  try {
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    assert.equal(await page.locator('#chooser').isVisible(), true);
    await screenshot('chooser');
    await page.locator('#choose-soni').click();
    assert.equal(await page.locator('#soni').isVisible(), true);
    await page.setViewportSize({ width: 1365, height: 768 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true, 'Keyboard fits on a laptop screen');
    await screenshot('soni-laptop');
    await page.setViewportSize({ width: 1365, height: 900 });
    for (const key of ['a', 's', 'd', 'f', 'j']) await page.keyboard.down(key);
    assert.equal(await held(), 5, 'All five physical keys stay illuminated');
    const colors = await page.locator('.soni-key.is-held').evaluateAll(keys => keys.map(k => k.style.getPropertyValue('--key-color')));
    assert(colors.every(Boolean));
    assert.equal(new Set(colors).size, 5, 'Held keys use different colors while palette colors are available');
    const before = await particles();
    await page.keyboard.down('j');
    assert.equal(await particles(), before, 'Auto-repeat must not create more effects');
    await page.keyboard.up('d'); assert.equal(await held(), 4);
    for (const key of ['a', 's', 'f', 'j']) await page.keyboard.up(key);
    assert.equal(await held(), 0);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.evaluate(() => {
      for (const letter of 'ASDFJKL') document.dispatchEvent(new KeyboardEvent('keydown', { code: `Key${letter}`, key: letter.toLowerCase(), bubbles: true, cancelable: true }));
    });
    assert.equal(await held(), 7);
    assert(await page.locator('.soni-particle').filter({ hasText: '🎉' }).count() > 0, 'Seven downs in 250 ms celebrate');
    await screenshot('soni-held');
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true, 'Desktop stage and keyboard fit on screen');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));

    // Both shifts and a main-row/numpad alias must release independently.
    for (const [code, key] of [['ShiftLeft', 'Shift'], ['ShiftRight', 'Shift'], ['ControlLeft', 'Control'], ['AltLeft', 'Alt']]) await emit('keydown', code, key);
    assert.equal(await held(), 4);
    await emit('keyup', 'ShiftLeft', 'Shift'); assert.equal(await held(), 3);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await held(), 0); assert.equal(await particles(), 0);
    await emit('keydown', 'Digit1', '1'); await emit('keydown', 'Numpad1', '1');
    await emit('keyup', 'Digit1', '1'); assert.equal(await held(), 1);
    await emit('keyup', 'Numpad1', '1'); assert.equal(await held(), 0);

    await page.locator('#soni-home').focus();
    for (const [code, key] of [['Space', ' '], ['Tab', 'Tab'], ['Enter', 'Enter'], ['Backspace', 'Backspace']]) {
      assert.equal(await emit('keydown', code, key), true);
      await emit('keyup', code, key);
    }
    assert.equal(await page.locator('#soni').isVisible(), true, 'Enter must not activate a focused exit control');
    assert.equal(await page.evaluate(() => window.scrollY), 0, 'Space must not scroll');
    assert(await page.locator('.rainbow-wave').count() > 0);
    assert(await page.locator('.bubble').count() > 0);
    for (const code of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) { await emit('keydown', code); await emit('keyup', code); }
    for (let i = 0; i < 160; i++) { await emit('keydown', 'KeyA', 'a'); await emit('keyup', 'KeyA', 'a'); }
    assert(await particles() <= 120, 'Particle count stays capped during rapid input');
    await page.waitForTimeout(2600); assert.equal(await particles(), 0, 'Effects must leave the DOM');
    await emit('keydown', 'KeyQ', 'q'); await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    assert.equal(await held(), 0); assert.equal(await particles(), 0);
    await page.locator('#sound').click();
    assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false');

    // Responsive keyboard should fit without requiring horizontal scrolling.
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot('soni-mobile');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await emit('keydown', 'KeyA', 'a'); await emit('keyup', 'KeyA', 'a');
    await page.waitForTimeout(650); assert.equal(await particles(), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1365, height: 900 });
    await page.locator('#soni-home').click(); assert.equal(await held(), 0); assert.equal(await particles(), 0);

    // Fabi's existing levels, pause, wrong answers, completion and replay.
    await page.locator('#choose-fabi').click();
    await page.locator('#player-name').fill('Fabi');
    for (const level of [1, 2, 3]) {
      await page.locator(`input[name="level"][value="${level}"]`).check();
      await page.locator('#play').click(); assert.equal(await page.locator('#game').isVisible(), true);
      const current = await page.locator('#target-text .current').innerText();
      await page.keyboard.press(current === 'Z' ? 'x' : 'z');
      assert.equal(await page.locator('#target-text .current').innerText(), current);
      await page.keyboard.press('Escape'); assert.equal(await page.locator('#pause-dialog').isVisible(), true);
      await page.locator('#resume').click();
      let guard = 0;
      while (await page.locator('#game').isVisible()) {
        assert(++guard < 70, 'Fabi round must complete');
        const letter = await page.locator('#target-text .current').innerText();
        await page.keyboard.press(letter.toLowerCase());
        if (await page.locator('#target-balloon.pop').count()) await page.waitForTimeout(700);
      }
      assert.equal(await page.locator('#finish').isVisible(), true);
      assert.equal(await page.locator('#finish-title').innerText(), '¡Lo hiciste, Fabi!');
      await page.locator('#replay').click(); assert.equal(await page.locator('#game').isVisible(), true);
      await page.locator('#go-home').click();
    }
    await page.locator('#fabi-chooser').click();
    // Repeated mounting must never multiply keyboard listeners.
    for (let i = 0; i < 3; i++) { await page.locator('#choose-soni').click(); await page.locator('#soni-home').click(); }
    await page.locator('#choose-soni').click();
    await emit('keydown', 'KeyA', 'a'); assert.equal(await particles(), 5);
    await emit('keyup', 'KeyA', 'a');
    await page.locator('.brand').click(); assert.equal(await page.locator('#chooser').isVisible(), true);
    assert.equal(await held(), 0); assert.equal(await particles(), 0);
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('PASS: burst tiers, bounded audio, physical held keys, repeat, aliases, focus cleanup, special effects, 160 rapid presses, particle cleanup, reduced motion, mobile, all Fabi levels, replay and navigation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
