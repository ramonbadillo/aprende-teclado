const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => .9999; });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.evaluate(() => {
      window.cheerPlays = 0;
      document.getElementById('hangman-cheer').addEventListener('playing', () => window.cheerPlays++);
    });
    await page.locator('#choose-hangman').click();
    await page.waitForFunction(() => document.getElementById('hangman-cheer').readyState >= 2);
    const visible = () => page.locator('#hangman-celebration').isVisible();
    const paused = () => page.locator('#hangman-cheer').evaluate(el => el.paused);
    const type = async word => { for (const letter of word) await page.keyboard.press(letter); };
    await type('tambo');
    assert.equal(await visible(), false, 'Individual letters do not celebrate');
    assert.equal(await page.evaluate(() => cheerPlays), 0);
    await type('r');
    await page.waitForFunction(() => cheerPlays === 1);
    assert.equal(await visible(), true);
    assert.equal(await paused(), false, 'The real local MP3 plays');
    assert.equal(await page.locator('#hangman-celebration span').count(), 18);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await type('r'); assert.equal(await page.evaluate(() => cheerPlays), 1, 'One celebration per win');
    if (process.env.SCREENSHOT_DIR) {
      require('node:fs').mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'hangman-celebration.png') });
    }
    await page.locator('#sound').click();
    assert.equal(await paused(), true, 'Muting stops the active cheer');
    assert.equal(await visible(), false);
    await page.locator('#hangman-next').click();
    await type('piano');
    assert.equal(await visible(), true, 'Muted wins still show emojis');
    assert.equal(await paused(), true);
    assert.equal(await page.evaluate(() => cheerPlays), 1);
    await page.locator('#sound').click();
    assert.equal(await page.evaluate(() => cheerPlays), 1, 'Unmuting does not replay the cheer');
    await page.locator('#hangman-next').click();
    assert.equal(await visible(), false);
    await type('lapiz');
    await page.waitForFunction(() => cheerPlays === 2);
    await page.locator('#hangman-home').click();
    assert.equal(await paused(), true);
    assert.equal(await page.locator('#hangman-celebration span').count(), 0);
    await page.locator('#choose-hangman').click();
    assert.equal(await visible(), false, 'Returning to a won word does not celebrate again');
    await page.locator('#hangman-next').click();
    await type('cama');
    await page.waitForFunction(() => cheerPlays === 3);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await paused(), true);
    assert.equal(await visible(), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#hangman-next').click();
    await type('libro');
    await page.waitForFunction(() => cheerPlays === 4);
    assert.equal(await page.locator('#hangman-celebration span').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.waitForFunction(() => document.getElementById('hangman-celebration').hidden);
    assert.equal(await page.locator('#hangman-celebration span').count(), 0, 'Effects clean up automatically');
    await page.locator('#hangman-next').click();
    await type('bcdfgh'); // PELOTA: six incorrect guesses.
    assert.equal(await page.locator('#hangman').getAttribute('data-state'), 'lost');
    assert.equal(await visible(), false);
    assert.equal(await page.evaluate(() => cheerPlays), 4, 'A loss does not play the cheer');
    assert.deepEqual(errors, []);
    console.log('Celebration passed: real MP3 playback, win only, mute, replay prevention, reset/exit/blur, mobile and reduced motion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
