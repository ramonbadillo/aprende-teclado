// Run with Node.js, Playwright and Chrome installed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const screenshotDirectory = process.env.SCREENSHOT_DIR || '/tmp';

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, acceptDownloads: true });
    const errors = [];
    const externalRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (/^https?:/i.test(request.url())) externalRequests.push(request.url());
    });
    const url = pathToFileURL(path.join(__dirname, '../index.html')).href;
    const output = () => page.locator('#coloring-output').evaluate(canvas => canvas.toDataURL('image/png'));
    const ready = () => page.waitForFunction(() => {
      const canvas = document.getElementById('coloring-output');
      return !canvas.hidden && canvas.width > 0 && !document.getElementById('coloring-download').disabled &&
        document.getElementById('coloring-previews').getAttribute('aria-busy') !== 'true';
    });
    const assertBinary = async () => {
      const pixels = await page.locator('#coloring-output').evaluate(canvas => {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let black = 0, white = 0, other = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] !== 255 || data[i] !== data[i + 1] || data[i] !== data[i + 2]) other++;
          else if (data[i] === 0) black++;
          else if (data[i] === 255) white++;
          else other++;
        }
        return { black, white, other, width: canvas.width, height: canvas.height };
      });
      assert.equal(pixels.other, 0, 'The exported sheet contains only opaque black and white pixels');
      assert.ok(pixels.black > 10, 'The sheet has visible outlines');
      assert.ok(pixels.white > pixels.black, 'The sheet leaves white areas to color');
      return pixels;
    };

    await page.goto(url);
    await page.locator('#choose-coloring').click();
    assert.equal(await page.locator('#coloring').isVisible(), true);
    assert.equal(await page.locator('#coloring-title').evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('#coloring-detail').isDisabled(), true);
    for (const id of ['download', 'print', 'clear']) assert.equal(await page.locator(`#coloring-${id}`).isDisabled(), true);
    assert.equal(await page.locator('#coloring-output').isHidden(), true);

    // A built-in example must produce real printable pixels without a network service.
    await page.locator('#coloring-example').click();
    await ready();
    await assertBinary();
    assert.equal(await page.locator('#coloring-source').isVisible(), true);
    assert.equal(await page.locator('#coloring-detail').isDisabled(), false);
    const defaults = {
      detail: await page.locator('#coloring-detail').inputValue(),
      smoothing: await page.locator('#coloring-smoothing').inputValue(),
      thickness: await page.locator('#coloring-thickness').inputValue(),
    };
    const original = await output();
    await page.screenshot({ path: path.join(screenshotDirectory, 'coloring-desktop.png'), fullPage: true });

    // Every adjustment participates in processing, and reset restores the same result.
    await page.locator('#coloring-detail').fill('95');
    await page.locator('#coloring-smoothing').selectOption('0');
    await page.locator('#coloring-thickness').selectOption('3');
    await page.waitForFunction(previous => document.getElementById('coloring-output').toDataURL('image/png') !== previous, original);
    await ready();
    await assertBinary();
    await page.locator('#coloring-reset').click();
    await ready();
    await page.waitForFunction(previous => document.getElementById('coloring-output').toDataURL('image/png') === previous, original);
    for (const [id, value] of Object.entries(defaults)) assert.equal(await page.locator(`#coloring-${id}`).inputValue(), value);

    // Range controls retain native keyboard behavior without triggering another activity.
    await page.locator('#coloring-detail').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(Number(await page.locator('#coloring-detail').inputValue()), Number(defaults.detail) + 1);
    await page.keyboard.press('Escape');
    await page.keyboard.press('a');
    assert.equal(await page.locator('#pause-dialog').isVisible(), false);
    assert.equal(await page.locator('.soni-particle').count(), 0);
    assert.equal(await page.locator('#coloring').isVisible(), true);
    await page.locator('#coloring-reset').click();
    await ready();
    await page.waitForFunction(previous => document.getElementById('coloring-output').toDataURL('image/png') === previous, original);

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No page overflow at ${width}px`);
      for (const id of ['coloring-source', 'coloring-output']) {
        const bounds = await page.locator(`#${id}`).boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'Previews fit narrow screens');
      }
      await page.screenshot({ path: path.join(screenshotDirectory, `coloring-mobile-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.locator('.coloring-upload').evaluate(async el => { await Promise.all(el.getAnimations().map(animation => animation.finished)); });
    assert.equal(await output(), original, 'Dark mode preserves the white printable image');
    await page.screenshot({ path: path.join(screenshotDirectory, 'coloring-dark.png'), fullPage: true });

    // Generate a local PNG with transparent space, solid colors and fine details.
    const fixture = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 192; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f25485'; ctx.fillRect(22, 28, 63, 76);
      ctx.fillStyle = '#43b4df'; ctx.beginPath(); ctx.arc(135, 66, 35, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1d2945'; ctx.lineWidth = 3; ctx.strokeRect(22, 28, 63, 76);
      ctx.beginPath(); ctx.arc(135, 66, 35, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#90c559'; ctx.fillRect(35, 42, 12, 12);
      ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 115); ctx.lineTo(172, 115); ctx.stroke();
      return canvas.toDataURL('image/png').split(',')[1];
    });
    await page.locator('#coloring-file').setInputFiles({ name: 'dibujo-transparente.png', mimeType: 'image/png', buffer: Buffer.from(fixture, 'base64') });
    await page.waitForFunction(() => document.getElementById('coloring-output').width === 192 && document.getElementById('coloring-output').height === 128);
    await ready();
    const uploaded = await output();
    const dimensions = await assertBinary();
    assert.deepEqual({ width: dimensions.width, height: dimensions.height }, { width: 192, height: 128 });
    const background = await page.locator('#coloring-output').evaluate(canvas => Array.from(canvas.getContext('2d').getImageData(0, 0, 1, 1).data));
    assert.deepEqual(background, [255, 255, 255, 255], 'Transparent image space becomes printable white');

    // The downloaded file is the exact PNG shown in the result preview.
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#coloring-download').click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /\.png$/i);
    const bytes = fs.readFileSync(await download.path());
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal(bytes.readUInt32BE(16), 192);
    assert.equal(bytes.readUInt32BE(20), 128);
    assert.equal(`data:image/png;base64,${bytes.toString('base64')}`, uploaded);

    const validStatus = await page.locator('#coloring-status').textContent();
    await page.locator('#coloring-file').setInputFiles({ name: 'no-es-imagen.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid file') });
    await page.waitForFunction(previous => document.getElementById('coloring-status').textContent !== previous, validStatus);
    assert.ok((await page.locator('#coloring-status').textContent()).trim());
    assert.equal(await output(), uploaded, 'Unsupported files preserve the last successful result');
    const typeStatus = await page.locator('#coloring-status').textContent();
    await page.locator('#coloring-file').setInputFiles({ name: 'roto.png', mimeType: 'image/png', buffer: Buffer.from('this is not a PNG') });
    await page.waitForFunction(previous => document.getElementById('coloring-status').textContent !== previous, typeStatus);
    await ready();
    assert.equal(await output(), uploaded, 'Unreadable image files preserve the last successful result');

    // Rejecting a replacement during a debounced edit must not export stale contours.
    await page.locator('#coloring-detail').fill('95');
    await ready();
    const detailed = await output();
    assert.notEqual(detailed, uploaded, 'The faint fixture line makes the detail setting observable');
    await page.locator('#coloring-reset').click();
    await ready();
    assert.equal(await output(), uploaded);
    await page.evaluate(() => {
      const detail = document.getElementById('coloring-detail');
      detail.value = '95'; detail.dispatchEvent(new Event('input', { bubbles: true }));
      const transfer = new DataTransfer(); transfer.items.add(new File(['invalid'], 'invalid.txt', { type: 'text/plain' }));
      const input = document.getElementById('coloring-file'); input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await ready();
    assert.equal(await page.locator('#coloring-status').getAttribute('data-error'), 'true');
    assert.equal(await page.locator('#coloring-detail').inputValue(), '95');
    assert.equal(await output(), detailed, 'A rejected upload still finishes the pending detail edit');
    const editedDownloadPromise = page.waitForEvent('download');
    await page.locator('#coloring-download').click();
    const editedDownload = await editedDownloadPromise;
    assert.equal(`data:image/png;base64,${fs.readFileSync(await editedDownload.path()).toString('base64')}`, detailed);
    await page.locator('#coloring-reset').click();
    await ready();

    // Print uses the current sheet and hides all non-printing interface elements.
    await page.evaluate(() => { window.coloringPrintCalls = 0; window.print = () => { window.coloringPrintCalls++; }; });
    await page.locator('#coloring-print').click();
    assert.equal(await page.evaluate(() => window.coloringPrintCalls), 1);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('#coloring-output').isVisible(), true);
    for (const selector of ['#coloring-source', '#coloring-controls', '#coloring-status', '#coloring-home', '#coloring-download', '#coloring-title']) {
      assert.equal(await page.locator(selector).isVisible(), false, `${selector} is excluded from the printed page`);
    }
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    await page.emulateMedia({ media: 'screen' });

    await page.locator('#coloring-home').click();
    await page.locator('#choose-soni').click();
    await page.keyboard.press('a');
    assert.ok(await page.locator('.soni-particle').count() > 0, 'The keyboard activity still works after leaving the tool');
    await page.locator('#soni-home').click();
    await page.locator('#choose-coloring').click();
    assert.equal(await output(), uploaded, 'Moving between activities keeps the current sheet');
    await page.locator('#coloring-clear').click();
    assert.equal(await page.locator('#coloring-output').isHidden(), true);
    assert.equal(await page.locator('#coloring-source').isHidden(), true);
    assert.equal(await page.locator('#coloring-detail').isDisabled(), true);
    for (const id of ['download', 'print', 'clear']) assert.equal(await page.locator(`#coloring-${id}`).isDisabled(), true);

    // Dropping a large local image scales both previews without changing its proportions.
    const drop = await page.evaluate(async () => {
      const canvas = document.createElement('canvas'); canvas.width = 2800; canvas.height = 1600;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 2800, 1600);
      ctx.fillStyle = '#e998b4'; ctx.fillRect(200, 200, 1100, 1200);
      ctx.fillStyle = '#67b7da'; ctx.beginPath(); ctx.arc(2100, 800, 450, 0, Math.PI * 2); ctx.fill();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const transfer = new DataTransfer(); transfer.items.add(new File([blob], 'panorama.png', { type: 'image/png' }));
      const zone = document.getElementById('coloring-dropzone');
      const drag = new DragEvent('dragover', { dataTransfer: transfer, bubbles: true, cancelable: true });
      zone.dispatchEvent(drag);
      const highlighted = zone.classList.contains('is-dragging');
      const drop = new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true });
      zone.dispatchEvent(drop);
      return { accepted: drag.defaultPrevented && drop.defaultPrevented, highlighted, cleaned: !zone.classList.contains('is-dragging') };
    });
    assert.deepEqual(drop, { accepted: true, highlighted: true, cleaned: true });
    await ready();
    for (const id of ['coloring-source', 'coloring-output']) {
      assert.deepEqual(await page.locator(`#${id}`).evaluate(canvas => [canvas.width, canvas.height]), [1400, 800]);
    }
    await assertBinary();

    // Clear wins over an image whose native decoder finishes after the clear action.
    await page.evaluate(async base64 => {
      const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
      const transfer = new DataTransfer(); transfer.items.add(new File([bytes], 'pending.png', { type: 'image/png' }));
      const NativeImage = window.Image;
      let decoded;
      window.Image = function () {
        const image = new NativeImage();
        decoded = new Promise(resolve => image.addEventListener('load', () => queueMicrotask(resolve), { once: true }));
        return image;
      };
      try {
        const input = document.getElementById('coloring-file'); input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('coloring-clear').click();
        await decoded;
        await Promise.resolve();
      } finally { window.Image = NativeImage; }
    }, fixture);
    assert.equal(await page.locator('#coloring-output').isHidden(), true, 'A late decode does not restore a cleared image');
    assert.equal(await page.locator('#coloring-source').isHidden(), true);
    assert.equal(await page.locator('#coloring-download').isDisabled(), true);
    await page.locator('#coloring-example').click();
    await ready();
    await page.reload();
    await page.locator('#choose-coloring').click();
    assert.equal(await page.locator('#coloring-output').isHidden(), true, 'Reload does not retain a private image');
    assert.equal(await page.locator('#coloring-download').isDisabled(), true);
    assert.deepEqual(externalRequests, [], 'The entire conversion works offline without external requests');
    assert.deepEqual(errors, []);
    console.log('Coloring: local example, binary outlines, adjustments/reset, transparent upload, PNG export, invalid files/pending edits, drag/drop, large-image scaling, clear during decode, print, keyboard isolation, navigation, privacy, dark mode and mobile layout passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
