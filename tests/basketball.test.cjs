const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ body: '' }));
    await page.clock.install({ time: new Date('2026-10-17T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-10-17T12:00:01Z'));
    const url = pathToFileURL(path.resolve(__dirname, '../a-encestar/index.html')).href;
    const phase = () => page.locator('#basketball-court').getAttribute('data-phase');
    const score = async () => Number((await page.locator('#basketball-score').textContent()).match(/\d+/)[0]);
    const attempts = async () => Number(await page.locator('#basketball-attempts').textContent());
    const playerX = () => page.locator('#basketball-player').evaluate(element => element.transform.baseVal.consolidate().matrix.e);
    const clearFocus = () => page.evaluate(() => document.activeElement?.blur());
    const advance = duration => page.clock.runFor(duration);
    const align = async () => {
      for (let step = 0; step < 250; step++) {
        const x = await playerX();
        if (Math.abs(x - 500) <= 9) return x;
        await advance(50);
      }
      throw new Error('The moving player never reached the basket alignment');
    };
    const pressSpace = async () => { await clearFocus(); await page.keyboard.press('Space'); };
    const start = async () => {
      await page.locator('#basketball-start').click();
      assert.equal(await phase(), 'playing');
    };

    await page.goto(url);
    await page.waitForFunction(() => window.BasketballGame);
    assert.equal(await phase(), 'ready');
    assert.equal(await score(), 0);
    assert.equal(await attempts(), 0);
    const waitingX = await playerX();
    await advance(1000);
    assert.equal(await playerX(), waitingX, 'The player waits for the explicit start');
    assert.equal(await page.locator('#basketball-shoot').isDisabled(), true);
    await start();
    await page.screenshot({ path: '/tmp/basketball-playing.png', fullPage: true });
    for (const modifier of ['Control', 'Alt', 'Meta', 'Shift']) {
      await page.locator('#basketball-shoot').focus();
      await page.keyboard.press(`${modifier}+Space`);
      assert.equal(await attempts(), 0, `${modifier}+Space cannot trigger the focused shoot button natively`);
    }

    // The player walks automatically, speed choices work, and both bounds reflect.
    const slowStart = await playerX();
    await advance(400);
    assert(Math.abs(Math.abs(await playerX() - slowStart) - 60) < 6, 'Slow speed moves about 150 units per second');
    await page.locator('[data-speed="fast"]').click();
    assert.equal(await page.locator('[data-speed="fast"]').getAttribute('aria-pressed'), 'true');
    const fastStart = await playerX();
    await advance(400);
    assert(Math.abs(Math.abs(await playerX() - fastStart) - 96) < 7, 'Fast speed moves about 240 units per second');
    let previousX = await playerX(), previousDirection = 1, reversals = 0;
    for (let step = 0; step < 50; step++) {
      await advance(200);
      const x = await playerX();
      assert(x >= 90 && x <= 910, `Player remains in court at x=${x}`);
      const direction = Math.sign(x - previousX);
      if (direction !== previousDirection) reversals++;
      previousDirection = direction;
      previousX = x;
    }
    assert(reversals >= 2, 'The player reverses at both sides of the court');
    await page.locator('[data-speed="slow"]').click();

    await page.locator('#basketball-pause').click();
    assert.equal(await phase(), 'paused');
    const pausedX = await playerX();
    await advance(2000);
    await pressSpace();
    assert.equal(await playerX(), pausedX, 'Pause freezes motion');
    assert.equal(await attempts(), 0, 'Pause blocks shots');
    await page.locator('#basketball-pause').click();
    assert.equal(await phase(), 'playing');

    // Shortcut modifiers, auto-repeat, and typing must never launch a ball.
    await clearFocus();
    await page.keyboard.press('Control+Space');
    await page.keyboard.press('Alt+Space');
    await page.keyboard.press('Meta+Space');
    await page.keyboard.press('Shift+Space');
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', repeat: true, bubbles: true })));
    assert.equal(await attempts(), 0, 'Repeated or modified Space is ignored');
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'typing-check';
      document.body.append(input);
      input.focus();
    });
    await page.keyboard.press('Space');
    assert.equal(await attempts(), 0, 'Typing a space into an input does not shoot');
    await page.locator('#typing-check').evaluate(input => input.remove());

    // A centered shot crosses the rim twice: it only scores while descending.
    await align();
    await pressSpace();
    assert.equal(await attempts(), 1);
    await advance(400);
    assert.equal(await score(), 0, 'Passing upward through the rim does not score');
    await pressSpace();
    assert.equal(await attempts(), 1, 'Only one ball can be in flight');
    await clearFocus();
    await page.keyboard.press('Escape');
    assert.equal(await phase(), 'paused');
    const flightPausedX = await playerX();
    await advance(3000);
    assert.equal(await score(), 0, 'An in-flight shot is frozen during pause');
    assert.equal(await playerX(), flightPausedX);
    await page.locator('#basketball-pause').click();
    await advance(1200);
    assert.equal(await score(), 1, 'A centered descending ball scores');
    await advance(2500);
    assert.equal(await score(), 1, 'A scored ball cannot count twice');

    // A deliberately wide shot is a miss, with encouraging feedback and another try.
    for (let step = 0; step < 100 && Math.abs(await playerX() - 500) < 160; step++) await advance(50);
    assert(Math.abs(await playerX() - 500) >= 160);
    await page.locator('#basketball-shoot').click();
    await advance(2200);
    assert.equal(await score(), 1);
    assert.equal(await attempts(), 2);
    assert.equal(await page.locator('#basketball-shoot').isEnabled(), true);
    assert((await page.locator('#basketball-status').textContent()).trim().length > 0, 'A miss provides feedback');

    // Losing focus pauses automatically and does not silently resume.
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await phase(), 'paused');
    const blurredX = await playerX();
    await advance(1000);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    assert.equal(await phase(), 'paused');
    assert.equal(await playerX(), blurredX);
    await page.locator('#basketball-pause').click();
    // Simulate the browser's visibility notification without relying on headless tab focus.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
      delete document.hidden;
      delete document.visibilityState;
    });
    assert.equal(await phase(), 'paused', 'A hidden tab pauses automatically');
    await page.locator('#basketball-pause').click();

    for (let expected = 2; expected <= 5; expected++) {
      await align();
      await page.locator('#basketball-shoot').click();
      await advance(2200);
      assert.equal(await score(), expected, `Clean shot ${expected} scores exactly once`);
    }
    assert.equal(await phase(), 'won');
    assert.equal(await attempts(), 6);
    assert.equal(await page.locator('#basketball-shoot').isDisabled(), true);
    const wonX = await playerX();
    await advance(1000);
    await pressSpace();
    assert.equal(await playerX(), wonX, 'Winning stops the player');
    assert.equal(await attempts(), 6, 'Winning blocks further shots');
    await page.screenshot({ path: '/tmp/basketball-won.png', fullPage: true });

    await page.locator('#basketball-reset').click();
    assert.equal(await phase(), 'ready');
    assert.equal(await score(), 0);
    assert.equal(await attempts(), 0);
    await start();
    await page.locator('#basketball-shoot').focus();
    await page.keyboard.down('Space');
    assert.equal(await attempts(), 1);
    await advance(2200);
    await page.keyboard.down('Space');
    assert.equal(await attempts(), 1, 'Holding Space does not shoot again when the previous ball finishes');
    await page.keyboard.up('Space');
    assert.equal(await attempts(), 1, 'Releasing held Space does not add a native button click');
    await page.locator('#basketball-shoot').click();
    await advance(300);
    await page.locator('#basketball-reset').click();
    await advance(2000);
    assert.equal(await phase(), 'ready');
    assert.equal(await score(), 0, 'Reset removes an unfinished shot');
    assert.equal(await attempts(), 0);

    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}px`);
      const court = await page.locator('#basketball-court').boundingBox();
      assert(court && court.width > 250 && court.height > 120, `Court remains visible at ${width}px`);
    }
    await page.screenshot({ path: '/tmp/basketball-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.locator('#theme-toggle').click();
    await page.screenshot({ path: '/tmp/basketball-dark.png', fullPage: true });
    await page.locator('#sound').click();
    assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false');
    await page.reload();
    assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false', 'Sound preference persists');
    await page.locator('#basketball-home').click();
    assert.match(page.url(), /\/index\.html$/);
    assert(!page.url().includes('/a-encestar/'), 'Home returns to the game selection');

    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await touch.newPage();
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.route('https://www.googletagmanager.com/**', route => route.fulfill({ body: '' }));
    await mobile.clock.install({ time: new Date('2026-10-17T12:00:00Z') });
    await mobile.clock.pauseAt(new Date('2026-10-17T12:00:01Z'));
    await mobile.goto(url);
    await mobile.locator('#basketball-start').tap();
    await mobile.screenshot({ path: '/tmp/basketball-touch-playing.png', fullPage: true });
    await mobile.locator('#basketball-shoot').tap();
    assert.equal(Number(await mobile.locator('#basketball-attempts').textContent()), 1, 'A touch launches exactly one ball');
    await mobile.clock.runFor(300);
    await mobile.locator('#basketball-pause').tap();
    assert.equal(await mobile.locator('#basketball-court').getAttribute('data-phase'), 'paused');
    await mobile.locator('#basketball-pause').tap();
    await mobile.clock.runFor(2000);
    await mobile.locator('#basketball-reset').tap();
    assert.equal(await mobile.locator('#basketball-court').getAttribute('data-phase'), 'ready');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await touch.close();
    assert.deepEqual(errors, []);
    console.log('Basketball: automatic motion, speed, reflection, physics, miss, one score per descent, keyboard guards, pause, blur/visibility, win, reset, mobile layout, touch, theme, sound and navigation passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
