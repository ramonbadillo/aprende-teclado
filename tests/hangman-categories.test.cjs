const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => .9999; });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('#choose-hangman').click();
    const choose = category => page.locator(`.hangman-category-button[data-category="${category}"]`).click();
    const next = () => page.locator('#hangman-next').click();
    const type = async word => { for (const letter of new Set(word.replace(/ /g, '').toLowerCase())) await page.keyboard.press(letter); };
    const category = () => page.locator('#hangman-category').textContent();
    assert.equal(await page.locator('.hangman-category-button').count(), 7);
    const counts = { Animales: 6, Naturaleza: 6, Comida: 6, 'En casa': 4, 'Música': 2 };
    for (const [name, count] of Object.entries(counts)) {
      await choose(name);
      const clues = new Set();
      let previous;
      for (let i = 0; i < count; i++) {
        assert.equal(await category(), name);
        previous = await page.locator('#hangman-clue').textContent();
        clues.add(previous);
        await next();
      }
      assert.equal(clues.size, count, 'Every word appears once before the bag repeats');
      assert.notEqual(await page.locator('#hangman-clue').textContent(), previous);
    }
    await choose('Compañeritos de Fabi');
    assert.equal(await page.locator('#hangman-word .hangman-letter').count(), 11);
    assert.equal(await page.locator('.hangman-word-group').count(), 2, 'Space separates name and surname');
    assert.match(await page.locator('#hangman-word').getAttribute('aria-label'), /11 letras.*espacio/);
    assert.equal(await page.locator('#hangman-hint').isEnabled(), true);
    for (const width of [1280, 650, 601, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('#hangman-word').evaluate(el => el.scrollWidth <= el.clientWidth), true);
      if (process.env.SCREENSHOT_DIR && [1280, 320].includes(width)) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, `hangman-categories-${width}.png`), fullPage: true });
      }
    }
    await type('soi mongalo'); // Leave F for the gift; spaces must never consume it.
    await choose('Compañeritos de Fabi');
    assert.match(await page.locator('#hangman-word').getAttribute('aria-label'), /S, O, guion, I/);
    await page.locator('#hangman-hint').click();
    assert.equal(await page.locator('#hangman').getAttribute('data-state'), 'won');
    assert.match(await page.locator('#hangman-status').textContent(), /SOFI MONGALO/);
    assert.equal(await page.locator('#hangman-celebration').isVisible(), true);
    const expected = ['SOFI MACIAS', 'FABIAN', 'FARAH', 'SARAH', 'CAMI', 'JADE', 'ISABELA', 'MARIANO'];
    for (const name of expected) {
      await next(); await type(name);
      assert.equal(await category(), 'Compañeritos de Fabi');
      assert.equal(await page.locator('#hangman').getAttribute('data-state'), 'won');
      assert.match(await page.locator('#hangman-status').textContent(), new RegExp(name));
      assert.match(await page.locator('#hangman-attempts').textContent(), /6 intentos/);
    }
    await next(); await page.keyboard.press('x');
    await page.locator('#hangman-home').click(); await page.locator('#choose-hangman').click();
    assert.equal(await page.locator('.hangman-category-button[aria-pressed="true"]').getAttribute('data-category'), 'Compañeritos de Fabi');
    assert.match(await page.locator('#hangman-attempts').textContent(), /5 intentos/);
    await choose('Comida');
    assert.match(await page.locator('#hangman-attempts').textContent(), /6 intentos/);
    assert.equal(await page.locator('#hangman-hint').isEnabled(), true);
    assert.equal(await page.locator('#hangman-celebration').isVisible(), false);
    await choose('Todas');
    const mixed = new Set();
    for (let i = 0; i < 33; i++) { mixed.add(await category()); await next(); }
    assert.equal(mixed.size, 6);
    assert.deepEqual(errors, []);
    console.log('Categories passed: filters, all nine names, spaces, hints, wins, reset, navigation, shuffled bags and responsive layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
