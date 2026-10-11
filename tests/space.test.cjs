const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1050 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('#choose-space').click();
    assert.equal(await page.locator('#space-overlay-title').textContent(), '¡Al espacio!');
    await page.locator('#space-start').click();
    const lives = () => page.locator('#space-lives').textContent();
    const score = () => page.locator('#space-score').textContent();
    const pressLetter = letter => letter.toUpperCase() === 'Ñ' ? page.locator('#space-title').dispatchEvent('keydown', { key: letter, bubbles: true }) : page.keyboard.press(letter);
    const letters = () => page.locator('.space-meteor').evaluateAll(nodes => nodes.map(n => n.dataset.letter));
    const wrong = async () => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find(l => !current.includes(l));
    let current = await letters();
    assert.equal(current.length, 2); assert.equal(new Set(current).size, current.length);
    await pressLetter(current[0].toLowerCase());
    assert.equal(await score(), '1 / 20'); assert.equal(await lives(), '6 / 6');
    assert.equal(await page.locator('.space-laser').count(), 1);
    current = await letters(); const incorrect = await wrong();
    await page.keyboard.down(incorrect); await page.keyboard.down(incorrect); await page.keyboard.up(incorrect);
    assert.equal(await lives(), '5 / 6', 'Held key causes only one error');
    assert.equal(await page.locator('#space-ship').getAttribute('data-damage'), '1');
    await page.keyboard.press('Shift'); await page.keyboard.press('1'); await page.keyboard.press('Control+a');
    assert.equal(await lives(), '5 / 6', 'Modifiers, numbers and shortcuts ignored');
    await page.keyboard.press('Escape');
    const positions = await page.locator('#space-meteors').innerHTML();
    await page.clock.runFor(30000); await page.keyboard.press(incorrect);
    assert.equal(await lives(), '5 / 6'); assert.equal(await page.locator('#space-meteors').innerHTML(), positions);
    await page.locator('#space-start').click();
    await page.locator('#space-home').click(); await page.keyboard.press(incorrect);
    await page.locator('#choose-space').click();
    assert.equal(await lives(), '5 / 6'); assert.equal(await page.locator('#space-overlay-title').textContent(), 'Misión en pausa');
    await page.locator('#space-start').click();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await page.locator('#space-overlay-title').textContent(), 'Misión en pausa');
    await page.locator('#space-start').click();
    for (let i = 0; i < 5; i++) {
      current = await letters(); await page.keyboard.press(await wrong());
      assert.equal(await lives(), `${4 - i} / 6`);
      assert.equal(await page.locator('#space-ship').getAttribute('data-damage'), String(i + 2));
    }
    assert.equal(await page.locator('#space-overlay-title').textContent(), '¡A reparar el cohete!');
    await page.keyboard.press('a'); assert.equal(await lives(), '0 / 6');
    await page.locator('#space-start').click(); assert.equal(await lives(), '6 / 6'); assert.equal(await score(), '0 / 20');
    // A real animation clock advances a meteor into the rocket.
    await page.clock.runFor(21300);
    assert.ok(parseInt(await lives()) < 6, 'Meteor collisions cost lives');
    await page.locator('#space-home').click(); await page.locator('#choose-space').click(); await page.locator('#space-start').click();
    for (let i = 0; i < 20; i++) {
      current = await letters();
      await pressLetter(current[0]);
      assert.equal(await score(), `${i + 1} / 20`);
    }
    assert.equal(await page.locator('#space-overlay-title').textContent(), '¡Eres una estrella!');
    assert.equal(await page.locator('#space-start').evaluate(n => n === document.activeElement), true);
    await page.locator('#space-start').click();
    await page.clock.runFor(5200);
    assert.equal(await page.locator('.space-meteor').count(), 3);
    await page.screenshot({ path: '/tmp/astroletras-desktop.png', fullPage: true });
    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Fits ${width}px`);
      current = await letters();
      await page.getByRole('button', { name: `Disparar letra ${current[0]}`, exact: true }).click();
      if (width === 390) await page.screenshot({ path: '/tmp/astroletras-mobile.png', fullPage: true });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.runFor(200);
    assert.equal(await page.locator('.space-meteor').first().evaluate(n => n.style.top), '28%');
    await page.locator('#sound').click(); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false');
    await page.locator('#space-home').click();
    await page.locator('#choose-clay').click(); assert.equal(await page.locator('#clay').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log('Astroletras: hits, six lives, damage, key repeat, shortcuts, pause, navigation, collisions, win, restart, touch controls, responsive layout, reduced motion and audio passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
