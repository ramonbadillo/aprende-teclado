// Run with Node.js, Playwright and Microsoft Edge installed.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-10-06T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-06T12:01:00Z'));
  const state = () => page.locator('#breathing').getAttribute('data-state');
  const phase = () => page.locator('#breathing').getAttribute('data-phase');
  const wings = () => page.locator('.butterfly-wing-left').evaluate(el => getComputedStyle(el).transform);
  const shot = async name => {
    if (!process.env.SCREENSHOT_DIR) return;
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, name + '.png'), fullPage: true });
  };
  try {
    await page.goto(pathToFileURL(path.join(__dirname, '../index.html')).href);
    assert.equal(await page.locator('.game-choice').count(), 4);
    await shot('breathing-chooser');
    await page.locator('#choose-breathing').click();
    assert.equal(await page.locator('#breathing').isVisible(), true);
    assert.equal(await page.locator('#timer').isVisible(), false);
    assert.equal(await page.locator('#breathing-title').evaluate(el => el === document.activeElement), true);
    assert.equal(await state(), 'ready');
    assert.equal(await page.locator('#breathing-reset').isDisabled(), true);
    await shot('breathing-ready');
    await page.locator('#breathing-toggle').click();
    assert.equal(await phase(), 'inhale');
    const folded = await wings();
    await page.clock.runFor(1500);
    assert.notEqual(await wings(), folded, 'Wings open with the inhale');
    await page.locator('#breathing-toggle').click();
    assert.equal(await state(), 'paused');
    const pausedWings = await wings();
    await page.clock.fastForward(60000);
    assert.equal(await wings(), pausedWings, 'Pause freezes the wings');
    await page.locator('#breathing-toggle').click();
    // Allow the next animation frame to render after the phase boundary.
    await page.clock.runFor(1532);
    assert.equal(await phase(), 'exhale');
    await shot('breathing-open');
    await page.clock.runFor(4000);
    assert.equal(await phase(), 'inhale');
    assert.equal(await page.locator('.breathing-progress .complete').count(), 1);
    await page.keyboard.press('Escape');
    assert.equal(await state(), 'paused');
    assert.equal(await page.locator('#pause-dialog').isVisible(), false);

    // Navigation retains a paused breath; other activities remain isolated.
    await page.locator('#breathing-toggle').click();
    await page.locator('#breathing-home').click();
    assert.equal(await state(), 'paused');
    await page.locator('#choose-soni').click();
    await page.keyboard.press('a');
    assert(await page.locator('.soni-particle').count() > 0);
    await page.locator('#soni-home').click();
    await page.clock.fastForward(60000);
    await page.locator('#choose-breathing').click();
    assert.equal(await state(), 'paused');
    assert.equal(await page.locator('.breathing-progress .complete').count(), 1);
    await page.keyboard.press('a');
    assert.equal(await page.locator('.soni-particle').count(), 0);
    await page.locator('#breathing-toggle').click();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await state(), 'paused');
    await page.locator('#breathing-toggle').click();
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await state(), 'paused', 'Returning to the tab requires an explicit resume');

    await page.evaluate(() => {
      const original = chime;
      window.breathingFinishes = 0;
      chime = (...args) => { window.breathingFinishes++; return original(...args); };
    });
    await page.locator('#breathing-toggle').click();
    await page.clock.fastForward(21000);
    assert.equal(await state(), 'done');
    assert.equal(await page.locator('.breathing-progress .complete').count(), 4);
    assert.equal(await page.evaluate(() => window.breathingFinishes), 1);
    await page.clock.fastForward(60000);
    assert.equal(await page.evaluate(() => window.breathingFinishes), 1);
    await shot('breathing-done');
    await page.locator('#breathing-toggle').click();
    assert.equal(await phase(), 'inhale');
    assert.equal(await page.locator('.breathing-progress .complete').count(), 0);
    await page.clock.runFor(1000);
    await page.locator('#breathing-reset').click();
    assert.equal(await state(), 'ready');
    await page.clock.fastForward(60000);
    assert.equal(await state(), 'ready', 'Reset cancels the running animation');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#breathing-toggle').click();
    assert.equal(await wings(), 'none');
    await page.clock.runFor(3500);
    assert.equal(await phase(), 'exhale');
    assert.equal(await wings(), 'none', 'Reduced motion keeps the butterfly still');
    await page.locator('#breathing-reset').click();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await shot(`breathing-mobile-${width}`);
      await page.locator('#breathing-home').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('#choose-breathing').click();
    }

    await page.evaluate(() => {
      window.breathingAudioNotes = 0;
      const original = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (...args) {
        window.breathingAudioNotes++;
        return original.apply(this, args);
      };
    });
    await page.locator('#sound').click();
    await page.locator('#breathing-toggle').click();
    await page.clock.fastForward(28000);
    assert.equal(await state(), 'done');
    assert.equal(await page.evaluate(() => window.breathingAudioNotes), 0);
    assert.deepEqual(errors, []);
    console.log('Butterfly: breathing phases, animation, pause/resume, reset, navigation, blur/visibility, completion, replay, reduced motion, mobile and mute passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
