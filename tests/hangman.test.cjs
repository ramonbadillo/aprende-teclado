// Run with Playwright and Edge, or BROWSER_CHANNEL=chrome for Chrome.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    // Keep the shuffle deterministic: the first word is TAMBOR, then PIANO.
    await page.addInitScript(() => { Math.random = () => .9999; });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.locator('#choose-hangman').click();
    assert.equal(await page.locator('#hangman').isVisible(), true);
    assert.equal(await page.locator('#hangman-title').evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('.hangman-key').count(), 27);
    const key = letter => page.locator(`.hangman-key[data-letter="${letter}"]`);
    const state = () => page.locator('#hangman').getAttribute('data-state');
    const attempts = () => page.locator('#hangman-attempts').textContent();
    const screenshot = async name => {
      if (!process.env.SCREENSHOT_DIR) return;
      fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, name + '.png'), fullPage: true });
    };
    await page.keyboard.press('Shift+t');
    assert.equal(await page.locator('.hangman-letter').first().textContent(), 'T');
    await page.keyboard.down('x'); await page.keyboard.down('x'); await page.keyboard.up('x');
    await key('X').click({ force: true });
    assert.match(await attempts(), /5 intentos/);
    assert.equal(await page.locator('.hangman-part.visible').count(), 1);
    await page.keyboard.press('Control+c');
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', isComposing: true })));
    assert.match(await attempts(), /5 intentos/);
    await page.locator('#hangman-hint').click();
    assert.equal(await key('A').getAttribute('aria-disabled'), 'true');
    assert.equal(await page.locator('#hangman-hint').isDisabled(), true);
    assert.match(await attempts(), /5 intentos/);
    await screenshot('hangman-desktop');
    await page.locator('#hangman-home').click();
    await page.keyboard.press('q');
    await page.locator('#choose-hangman').click();
    assert.match(await attempts(), /5 intentos/);
    assert.equal(await key('Q').getAttribute('aria-disabled'), 'false');
    for (const letter of 'mbor') await page.keyboard.press(letter);
    assert.equal(await state(), 'won');
    assert.match(await page.locator('#hangman-status').textContent(), /TAMBOR/);
    await page.keyboard.press('z'); assert.match(await attempts(), /5 intentos/);
    await screenshot('hangman-win');
    await page.locator('#hangman-next').click();
    assert.equal(await page.locator('#hangman-hint').isDisabled(), false);
    for (const letter of 'bcdefg') await page.keyboard.press(letter);
    assert.equal(await state(), 'lost');
    assert.equal(await page.locator('.hangman-part.visible').count(), 6);
    assert.equal(await page.locator('#hangman-word').innerText(), 'P\nI\nA\nN\nO');
    await page.keyboard.press('a'); assert.equal(await state(), 'lost');
    await screenshot('hangman-loss');
    await page.locator('#hangman-next').click(); // LAPIZ: accented input maps to its vowel.
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'á', bubbles: true })));
    assert.equal(await key('A').getAttribute('aria-disabled'), 'true');
    // Repeated letters are revealed together (MANZANA, word 13 in this bag).
    for (let i = 0; i < 9; i++) await page.locator('#hangman-next').click();
    await page.keyboard.press('a');
    assert.equal(await page.locator('.hangman-letter').evaluateAll(els => els.filter(el => el.textContent === 'A').length), 3);
    // PIÑA is the previous entry in the shuffled bag; get it in a fresh context.
    await page.reload(); await page.locator('#choose-hangman').click();
    for (let i = 0; i < 10; i++) await page.locator('#hangman-next').click();
    await page.keyboard.press('n'); assert.match(await attempts(), /5 intentos/);
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ñ', bubbles: true })));
    assert.equal(await key('Ñ').getAttribute('aria-disabled'), 'true');
    assert.match(await attempts(), /5 intentos/);
    await key('P').focus(); await page.keyboard.press('Enter');
    await key('I').focus(); await page.keyboard.press('Space');
    await key('A').click(); assert.equal(await state(), 'won');
    await page.locator('#hangman-next').click();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await screenshot(`hangman-mobile-${width}`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.hangman-part').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    await page.locator('.brand').click();
    await page.locator('#choose-piano').click();
    await page.keyboard.down('a'); assert.equal(await page.locator('.piano-key.is-held').count(), 1);
    await page.keyboard.up('a');
    const touch = await browser.newPage({ hasTouch: true, viewport: { width: 390, height: 844 } });
    await touch.addInitScript(() => { Math.random = () => .9999; });
    await touch.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await touch.locator('#choose-hangman').tap();
    await touch.locator('.hangman-key[data-letter="T"]').tap();
    assert.equal(await touch.locator('.hangman-letter').first().textContent(), 'T');
    assert.deepEqual(errors, []);
    console.log('Hangman: guesses, win/loss, hints, repeat, accents/Ñ, navigation, keyboard/touch and mobile layouts passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
