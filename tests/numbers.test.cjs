const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ body: '' }));
    const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
    const cell = (value, row = 0) => page.locator(`.number-cell[data-value="${value}"][data-row="${row}"]`);
    const count = (value, row = 0) => cell(value, row).locator('.number-card').count();
    const pointerDrag = async (source, dest) => {
      await source.scrollIntoViewIfNeeded();
      const a = await source.boundingBox();
      await dest.scrollIntoViewIfNeeded();
      // Keep both ends visible at the desktop viewport used for drag tests.
      const start = await source.boundingBox(), end = await dest.boundingBox();
      assert(a && start && end);
      await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
      await page.mouse.down();
      await page.mouse.move(end.x + end.width - 8, end.y + 12, { steps: 12 });
      await page.mouse.up();
    };
    const dragPlace = async (value, row = 0) => pointerDrag(page.locator(`#numbers-bank [data-value="${value}"]`), cell(value, row));
    const operation = async (a, b) => {
      await page.locator('.numbers-settings').evaluate(el => { el.open = true; });
      await page.locator('#numbers-a').fill(String(a)); await page.locator('#numbers-b').fill(String(b));
      await page.locator('#numbers-operation button').click();
    };
    const ready = async () => { await page.locator('#numbers-example').click(); await page.locator('#numbers-continue').click(); };
    const answer = async number => {
      if (await page.locator('#numbers-continue').isVisible()) await page.locator('#numbers-continue').click();
      await page.locator('#numbers-answer').fill(String(number));
      await page.locator('#numbers-answer-form button').click();
    };
    await page.goto(url); await page.locator('#choose-numbers').click();
    await page.waitForFunction(() => window.NumbersGame && window.dataLayer);
    assert.match(page.url(), /mi-tablero-de-numeros\/index.html/);
    assert.deepEqual(await page.evaluate(() => window.dataLayer.filter(x => x[0] === 'config').map(x => x[1])), ['G-DSSKXYFM89']);
    const initialProblem = await page.locator('#numbers-problem').textContent();
    await page.locator('#numbers-reset').click();
    assert.equal(await page.locator('#numbers-problem').textContent(), initialProblem, 'Reset keeps the current operation');
    const verifyProblem = (problem, mode, min, max) => {
      const [a, b] = problem.match(/\d+/g).map(Number);
      assert(a > 0 && b > 0);
      const size = mode === 'add' ? a + b : a;
      assert(size >= min && size <= max, `${problem} stays in the difficulty range`);
      if (mode === 'subtract') assert(a > b, 'Subtraction never gives zero or negatives');
    };
    for (const mode of ['add', 'subtract']) {
      await page.locator(`[data-mode="${mode}"]`).click();
      for (const [difficulty, min, max] of [['easy', 2, 20], ['medium', 21, 99], ['hard', 100, 999]]) {
        await page.locator(`[data-difficulty="${difficulty}"]`).click();
        assert.equal(await page.locator(`[data-difficulty="${difficulty}"]`).getAttribute('aria-pressed'), 'true');
        let previous = await page.locator('#numbers-problem').textContent();
        verifyProblem(previous, mode, min, max);
        for (let i = 0; i < 10; i++) {
          await page.locator('#numbers-next').click();
          const problem = await page.locator('#numbers-problem').textContent();
          verifyProblem(problem, mode, min, max);
          assert.notEqual(problem, previous, 'No immediate repetition');
          previous = problem;
        }
        const boundaryProblems = await page.evaluate(() => {
          const originalRandom = Math.random;
          const problems = [];
          try {
            for (const value of [0, 1 - Number.EPSILON]) {
              Math.random = () => value;
              for (let i = 0; i < 3; i++) {
                document.getElementById('numbers-next').click();
                problems.push(document.getElementById('numbers-problem').textContent);
              }
            }
          } finally { Math.random = originalRandom; }
          return problems;
        });
        boundaryProblems.forEach((problem, index) => {
          verifyProblem(problem, mode, min, max);
          if (index) assert.notEqual(problem, boundaryProblems[index - 1]);
        });
      }
    }
    // Each operation type remembers its own difficulty; switching levels clears the old board.
    await page.locator('[data-difficulty="easy"]').click();
    await page.locator('[data-mode="add"]').click();
    assert.equal(await page.locator('[data-difficulty="hard"]').getAttribute('aria-pressed'), 'true');
    await page.locator('#numbers-example').click();
    await page.locator('[data-difficulty="medium"]').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#numbers-rows .number-card').count(), 0);
    assert.equal(await page.locator('#numbers-undo').isDisabled(), true);
    await page.locator('[data-mode="subtract"]').click();
    assert.equal(await page.locator('[data-difficulty="easy"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-mode="add"]').click();
    await operation(15, 25);
    assert.equal(await page.locator('#numbers-continue').isDisabled(), true);
    await pointerDrag(page.locator('#numbers-bank [data-value="10"]'), cell(10));
    assert.equal(await count(10), 1);
    await dragPlace(100); assert.equal(await count(100), 0, 'Cannot overfill operand');
    await page.locator('#numbers-bank [data-value="1"]').focus(); await page.keyboard.press('Enter');
    await cell(1).dispatchEvent('keydown', { key: 'Enter' });
    assert.equal(await count(1), 0, 'Keyboard no longer places cards');
    await page.locator('#numbers-bank [data-value="1"]').click();
    await cell(1).click({ position: { x: 5, y: 5 } });
    assert.equal(await count(1), 0, 'Clicking a card then a cell does nothing');
    assert.equal(await page.locator('.number-card[aria-pressed]').count(), 0);
    assert.equal(await page.locator('[data-drop][tabindex="0"]').count(), 0);
    assert.equal(await page.locator('.numbers-help').count(), 0);
    await dragPlace(1); assert.equal(await count(1), 1);
    await page.locator('#numbers-undo').click(); assert.equal(await count(1), 0);
    await page.locator('#numbers-reset').click();
    for (let i = 0; i < 5; i++) await dragPlace(1);
    await dragPlace(10);
    for (let i = 0; i < 5; i++) await dragPlace(1, 1);
    await dragPlace(10, 1); await dragPlace(10, 1);
    assert.equal(await page.locator('#numbers-continue').isEnabled(), true);
    await page.screenshot({ path: '/tmp/numbers-formed.png', fullPage: true });
    await page.locator('#numbers-continue').click();
    assert.equal(await page.locator('#numbers-answer-form').isVisible(), true, 'Go directly from building to answering');
    assert.equal(await page.locator('[data-exchange]').count(), 0, 'No manual exchange controls');
    assert.equal(await page.locator('#numbers-step-2').isVisible(), false);
    assert.equal(await count(1), 0); assert.equal(await count(10), 4);
    await page.locator('#numbers-undo').click();
    assert.equal(await count(1, 0), 5); assert.equal(await count(1, 1), 5);
    await page.locator('#numbers-continue').click();
    await answer(41); assert.equal(await page.locator('#numbers').getAttribute('data-done'), 'false');
    await page.locator('#numbers-answer').fill('40'); await page.locator('#numbers-answer-form button').click();
    assert.equal(await page.locator('#numbers').getAttribute('data-done'), 'true');
    assert.equal(await page.locator('#numbers-problem').textContent(), '15 + 25 = 40');
    await operation(999, 1); assert.match(await page.locator('#numbers-error').textContent(), /menor que 1000/);
    await operation(95, 5); await ready(); assert.equal(await count(100), 1); await answer(100);
    assert.equal(await page.locator('#numbers').getAttribute('data-done'), 'true');
    await page.locator('[data-mode="subtract"]').click(); await operation(32, 15); await ready();
    assert.equal(await count(1), 12); assert.equal(await count(10), 2);
    await pointerDrag(cell(10).locator('button').first(), page.locator('#numbers-removed'));
    assert.equal(await count(10), 1);
    for (let i = 0; i < 5; i++) { await pointerDrag(cell(1).locator('button').first(), page.locator('#numbers-removed')); }
    assert.match(await page.locator('#numbers-removed-count').textContent(), /15 de 15/);
    // Returning a removed card and undoing preserves both sides.
    await pointerDrag(page.locator('#numbers-removed-cards [data-value="1"]').first(), cell(1));
    assert.equal(await count(1), 8); await page.locator('#numbers-undo').click(); assert.equal(await count(1), 7);
    await answer(17); assert.equal(await page.locator('#numbers-problem').textContent(), '32 − 15 = 17');
    await operation(10, 20); assert.match(await page.locator('#numbers-error').textContent(), /número mayor/);
    await operation(100, 27); await ready(); assert.equal(await count(10), 9); assert.equal(await count(1), 10);
    for (const [value, n] of [[10, 2], [1, 7]]) for (let i = 0; i < n; i++) { await pointerDrag(cell(value).locator('button').first(), page.locator('#numbers-removed')); }
    await answer(73); assert.equal(await page.locator('#numbers').getAttribute('data-done'), 'true');
    await operation(0, 0); await ready(); await answer(0); assert.equal(await page.locator('#numbers').getAttribute('data-done'), 'true');
    await page.locator('[data-mode="add"]').click(); await operation(15, 25); await page.locator('#numbers-example').click();
    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}`);
    }
    await page.screenshot({ path: '/tmp/numbers-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1100 }); await page.locator('#theme-toggle').click();
    await page.screenshot({ path: '/tmp/numbers-dark.png', fullPage: true });
    await page.locator('#sound').click(); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false');
    await page.reload(); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'false');
    assert.equal(await count(1), 0); assert.deepEqual(errors, []);
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await touch.newPage(); await mobile.goto(pathToFileURL(path.resolve(__dirname, '../mi-tablero-de-numeros/index.html')).href);
    await mobile.locator('.numbers-settings summary').tap();
    await mobile.locator('#numbers-a').fill('15'); await mobile.locator('#numbers-b').fill('25');
    await mobile.locator('#numbers-operation button').tap();
    await mobile.locator('#numbers-bank [data-value="10"]').tap(); await mobile.locator('.number-cell[data-value="10"]').first().tap();
    assert.equal(await mobile.locator('.number-cell[data-value="10"]').first().locator('button').count(), 0, 'Tapping does not place a card');
    // Native touch pointer events exercise the same drag path as mouse.
    const session = await mobile.context().newCDPSession(mobile);
    await mobile.locator('#numbers-bank [data-value="1"]').scrollIntoViewIfNeeded();
    const src = await mobile.locator('#numbers-bank [data-value="1"]').boundingBox();
    const dst = await mobile.locator('.number-cell[data-value="1"]').nth(1).boundingBox();
    const x = src.x + src.width / 2, y = src.y + src.height / 2, tx = dst.x + dst.width / 2, ty = dst.y + dst.height / 2;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (tx - x) * i / 8, y: y + (ty - y) * i / 8 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await mobile.locator('.number-cell[data-value="1"]').nth(1).locator('button').count(), 1);
    // Dragging at the top edge scrolls toward earlier rows; cancellation leaves no extra card.
    await mobile.locator('#numbers-bank [data-value="1"]').scrollIntoViewIfNeeded();
    const beforeScroll = await mobile.evaluate(() => scrollY);
    const again = await mobile.locator('#numbers-bank [data-value="1"]').boundingBox();
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: again.x + 20, y: again.y + 20 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 20 }] });
    await mobile.waitForFunction(previous => scrollY < previous, beforeScroll);
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    assert.equal(await mobile.locator('.numbers-drag-ghost').count(), 0);
    await touch.close();
    console.log('Numbers: drag-only mouse/touch, no tap or keyboard placement, carry, borrow, undo, validation, zero, responsive layouts, theme, sound and Analytics passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
