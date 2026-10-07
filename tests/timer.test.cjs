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
  // Deterministic elapsed time also simulates a throttled background tab.
  await page.addInitScript(() => {
    window.timerTestNow = Date.now();
    Date.now = () => window.timerTestNow;
  });
  const advance = async ms => page.evaluate(ms => {
    window.timerTestNow += ms;
    document.dispatchEvent(new Event('visibilitychange'));
  }, ms);
  const state = () => page.locator('#timer').getAttribute('data-state');
  const stage = () => page.locator('#timer').getAttribute('data-stage');
  const digits = () => page.locator('#timer-digits').textContent();
  const shot = async name => {
    if (!process.env.SCREENSHOT_DIR) return;
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, name + '.png'), fullPage: true });
  };
  try {
    await page.goto(pathToFileURL(path.join(__dirname, '../index.html')).href);
    await shot('timer-chooser');
    assert.equal(await page.locator('.game-choice').count(), 4);
    await page.locator('#choose-timer').click();
    assert.equal(await page.locator('#timer').isVisible(), true);
    assert.equal(await page.locator('#soni').isVisible(), false);
    assert.equal(await digits(), '5:00');
    await shot('timer-ready');
    assert.equal(await page.locator('#timer-message').textContent(), '¡Tenemos mucho tiempo!');
    await page.locator('[data-minutes="1"]').click();
    assert.equal(await digits(), '1:00');

    // Invalid and fractional durations cannot start a countdown.
    for (const invalid of ['', '0', '121', '1.5']) {
      await page.locator('#timer-minutes').fill(invalid);
      await page.locator('#timer-toggle').click();
      assert.equal(await state(), 'ready');
      assert.equal(await page.locator('#timer-minutes').getAttribute('aria-invalid'), 'true');
    }
    await page.locator('[data-minutes="1"]').click();
    await page.locator('#timer-toggle').click();
    assert.equal(await state(), 'running');
    assert.equal(await page.locator('#timer-minutes').isDisabled(), true);
    assert.equal(await page.locator('[data-minutes="5"]').isDisabled(), true);
    await advance(30000);
    assert.equal(await digits(), '0:30');
    assert.equal(await stage(), 'half');
    assert.equal(await page.locator('#timer-dial').evaluate(el => el.style.getPropertyValue('--remaining')), '50%');
    await shot('timer-half');
    await advance(18000);
    assert.equal(await digits(), '0:12');
    assert.equal(await stage(), 'little');
    await shot('timer-little');
    await page.locator('#timer-toggle').click();
    assert.equal(await state(), 'paused');
    await advance(100000);
    assert.equal(await digits(), '0:12', 'Paused time must remain unchanged');
    await page.locator('#timer-toggle').click();
    await advance(2000);
    assert.equal(await digits(), '0:10');

    // Exiting pauses and retains the remaining time; Soni listeners stay isolated.
    await page.locator('#timer-home').click();
    await page.locator('#choose-soni').click();
    await page.keyboard.press('a');
    assert(await page.locator('.soni-particle').count() > 0);
    await page.locator('#soni-home').click();
    await advance(50000);
    await page.locator('#choose-timer').click();
    assert.equal(await state(), 'paused');
    assert.equal(await digits(), '0:10');
    await page.keyboard.press('a');
    assert.equal(await page.locator('.soni-particle').count(), 0);
    await page.locator('#timer-toggle').click();
    await page.keyboard.press('Escape');
    assert.equal(await state(), 'paused');
    assert.equal(await page.locator('#pause-dialog').isVisible(), false);

    // Count finish notifications while preserving the app's normal sound callback.
    await page.evaluate(() => {
      const originalChime = chime;
      window.timerTestFinishes = 0;
      chime = (...args) => { window.timerTestFinishes++; return originalChime(...args); };
    });
    await page.locator('#timer-toggle').click();
    await advance(12000);
    assert.equal(await state(), 'done');
    assert.equal(await digits(), '0:00');
    assert.equal(await page.locator('#timer-dial').evaluate(el => el.style.getPropertyValue('--remaining')), '0%');
    assert.match(await page.locator('#timer-message').textContent(), /terminó/);
    await advance(60000);
    assert.equal(await page.evaluate(() => window.timerTestFinishes), 1, 'Completion should happen only once');
    await shot('timer-done');
    await page.locator('#timer-toggle').click();
    assert.equal(await digits(), '1:00');
    assert.equal(await state(), 'running');
    await advance(5000);
    await page.locator('#timer-reset').click();
    assert.equal(await state(), 'ready');
    assert.equal(await digits(), '1:00');
    assert.equal(await page.locator('#timer-minutes').isEnabled(), true);
    await page.locator('#timer-minutes').fill('120');
    assert.equal(await digits(), '120:00');
    await page.locator('#timer-minutes').fill('7');
    assert.equal(await digits(), '7:00');
    assert.equal(await page.locator('.timer-presets [aria-pressed="true"]').count(), 0);

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Timer fits a narrow screen');
      await shot(`timer-mobile-${width}`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#timer-toggle').click();
    await advance(420000);
    assert.equal(await state(), 'done');

    // Mute is shared with the games; completion produces no audio nodes.
    await page.evaluate(() => {
      window.timerAudioNotes = 0;
      const Context = window.AudioContext || window.webkitAudioContext;
      const original = Context.prototype.createOscillator;
      Context.prototype.createOscillator = function (...args) {
        window.timerAudioNotes++;
        return original.apply(this, args);
      };
    });
    await page.locator('#sound').click();
    await page.locator('[data-minutes="1"]').click();
    await page.locator('#timer-toggle').click();
    await advance(60000);
    assert.equal(await state(), 'done');
    assert.equal(await page.evaluate(() => window.timerAudioNotes), 0);
    assert.deepEqual(errors, []);
    console.log('Timer: duration validation, visual stages, pause/resume, background elapsed time, navigation, completion, replay, reset, mute and mobile passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
