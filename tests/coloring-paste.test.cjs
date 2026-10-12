// Run with Node.js, Playwright and Chrome installed. No live image service is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const screenshotDirectory = process.env.SCREENSHOT_DIR || '/tmp';

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, acceptDownloads: true,
      permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route(/^https?:/, async route => {
      network.push(route.request().url());
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Google Images fixture</title>' });
    });
    await page.goto(pathToFileURL(path.join(__dirname, '../index.html')).href);
    await page.locator('#choose-coloring').click();
    const ready = () => page.waitForFunction(() => !document.getElementById('coloring-output').hidden &&
      !document.getElementById('coloring-download').disabled && document.getElementById('coloring-previews').getAttribute('aria-busy') !== 'true');
    const output = () => page.locator('#coloring-output').evaluate(canvas => canvas.toDataURL('image/png'));
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const fixtures = await page.evaluate(() => {
      const create = (width, height, type) => {
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#f19bc2'; ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
        ctx.fillRect(10, 10, width / 3, height - 20); ctx.strokeRect(10, 10, width / 3, height - 20);
        ctx.beginPath(); ctx.arc(width * .72, height / 2, height / 3, 0, Math.PI * 2); ctx.fillStyle = '#84cde0'; ctx.fill(); ctx.stroke();
        return canvas.toDataURL(type).split(',')[1];
      };
      return { png: create(192, 128, 'image/png'), jpeg: create(192, 128, 'image/jpeg'),
        webp: create(192, 128, 'image/webp'), local: create(111, 77, 'image/png') };
    });
    await page.evaluate(data => {
      window.pasteTestFixtures = data;
      window.pasteTestBlob = (kind = 'png') => new Blob([Uint8Array.from(atob(data[kind]), c => c.charCodeAt(0))],
        { type: kind === 'local' ? 'image/png' : `image/${kind}` });
      window.pasteTestItem = (kind = 'png') => ({ types: [kind === 'local' ? 'image/png' : `image/${kind}`],
        getType: async () => window.pasteTestBlob(kind) });
      window.pasteTestNativeClipboard = navigator.clipboard;
      window.pasteTestReads = 0;
      window.pasteTestMode = 'image';
      window.pasteTestInstallMock = () => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        read: async () => {
          window.pasteTestReads++;
          if (window.pasteTestMode === 'denied') throw new DOMException('Permission denied', 'NotAllowedError');
          if (window.pasteTestMode === 'text') return [{ types: ['text/plain'], getType: async () => new Blob(['https://example.org/image.png'], { type: 'text/plain' }) }];
          if (window.pasteTestMode === 'empty') return [];
          if (window.pasteTestMode === 'multiple') return [window.pasteTestItem(), window.pasteTestItem()];
          if (window.pasteTestMode === 'pending') return await new Promise(resolve => { window.pasteTestResolve = resolve; });
          return [window.pasteTestItem()];
        },
      } });
      window.pasteTestInstallMock();
    }, fixtures);
    const paste = (kind, options = {}) => page.evaluate(({ kind, target = '#coloring-status', count = 1, text = '' }) => {
      const transfer = new DataTransfer();
      if (kind) for (let n = 0; n < count; n++) transfer.items.add(new File([window.pasteTestBlob(kind)], `pegado-${n}.${kind}`, { type: `image/${kind}` }));
      if (text) transfer.setData('text/plain', text);
      const event = new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true });
      document.querySelector(target).dispatchEvent(event);
      return event.defaultPrevented;
    }, { kind, ...options });
    const setMode = mode => page.evaluate(value => { window.pasteTestMode = value; }, mode);
    const releaseClipboard = () => page.evaluate(async () => {
      window.pasteTestResolve([window.pasteTestItem()]);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const localUpload = async () => {
      await page.locator('#coloring-file').setInputFiles({ name: 'local-preferido.png', mimeType: 'image/png', buffer: Buffer.from(fixtures.local, 'base64') });
      await ready();
    };

    // Google is an explicit separate-tab action, with a normalized query and safe defaults.
    assert.equal(await page.locator('#coloring-google-search').getAttribute('target'), '_blank');
    assert.match(await page.locator('#coloring-google-search').getAttribute('rel'), /noopener/);
    assert.match(await page.locator('#coloring-google-search').getAttribute('rel'), /noreferrer/);
    assert.equal(await page.locator('#coloring-openverse').evaluate(details => details.open), false);
    await page.locator('#coloring-google-query').fill('   ');
    await page.locator('#coloring-google-search').evaluate(anchor => {
      anchor.addEventListener('click', event => { window.pasteTestGooglePrevented = event.defaultPrevented; }, { once: true });
    });
    await page.locator('#coloring-google-search').click();
    assert.equal(await page.evaluate(() => window.pasteTestGooglePrevented), true, 'An empty query does not open Google');
    assert.equal(await page.locator('#coloring-google-query').evaluate(el => el === document.activeElement), true);
    assert.equal(context.pages().length, 1);
    await page.locator('#coloring-google-query').fill('  Pokémon   flores & gatos  ');
    assert.equal(network.length, 0, 'Typing a query does not access Google');
    assert.equal(await page.evaluate(() => window.pasteTestReads), 0, 'No clipboard access occurs without a paste action');
    const popupPromise = context.waitForEvent('page');
    await page.locator('#coloring-google-search').click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    const google = new URL(popup.url());
    assert.match(google.hostname, /(^|\.)google\.com$/);
    assert.equal(google.searchParams.get('q'), 'Pokémon flores & gatos');
    assert.equal(google.searchParams.get('udm'), '2');
    assert.equal(google.searchParams.get('safe'), 'active');
    assert.equal(google.searchParams.get('hl'), 'es');
    assert.equal(await popup.evaluate(() => window.opener), null);
    await popup.close();
    await page.locator('#coloring-google-query').fill('mariposas para colorear');
    const enterPopupPromise = context.waitForEvent('page');
    await page.locator('#coloring-google-query').press('Enter');
    const enterPopup = await enterPopupPromise;
    await enterPopup.waitForLoadState('domcontentloaded');
    const enterSearch = new URL(enterPopup.url());
    assert.match(enterSearch.hostname, /(^|\.)google\.com$/);
    assert.equal(enterSearch.searchParams.get('q'), 'mariposas para colorear');
    assert.equal(enterSearch.searchParams.get('udm'), '2');
    await enterPopup.close();
    assert.equal(await page.locator('#coloring-openverse').evaluate(details => details.open), false);
    assert.equal(network.some(url => url.includes('api.openverse.org')), false, 'Enter in the primary field searches Google without querying Openverse');
    const googleRequests = network.length;

    // The explicit button reads image bytes, converts them locally and exports the shown result.
    await page.locator('#coloring-paste').click(); await ready();
    assert.equal(await page.evaluate(() => window.pasteTestReads), 1);
    assert.deepEqual(await page.locator('#coloring-output').evaluate(canvas => [canvas.width, canvas.height]), [192, 128]);
    const pastedOutput = await output();
    assert.equal(await page.locator('#coloring-credit').isHidden(), true);
    assert.equal(await page.locator('#coloring-print').isDisabled(), false);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#coloring-download').click();
    const download = await downloadPromise;
    assert.equal(`data:image/png;base64,${fs.readFileSync(await download.path()).toString('base64')}`, pastedOutput);
    const binary = await page.locator('#coloring-output').evaluate(canvas => {
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let black = 0, white = 0, other = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 255 || data[i] !== data[i + 1] || data[i] !== data[i + 2]) other++;
        else if (data[i] === 0) black++;
        else if (data[i] === 255) white++;
        else other++;
      }
      return { black, white, other };
    });
    assert.equal(binary.other, 0); assert.ok(binary.black > 10); assert.ok(binary.white > binary.black);

    // Keyboard paste uses the file carried by the native event, without clipboard permission.
    for (const kind of ['png', 'jpeg', 'webp']) {
      assert.equal(await paste(kind), true, `${kind} paste is accepted`); await ready();
      assert.deepEqual(await page.locator('#coloring-output').evaluate(canvas => [canvas.width, canvas.height]), [192, 128]);
    }
    assert.equal(await page.evaluate(() => window.pasteTestReads), 1, 'Paste events do not read the clipboard again');
    const previous = await output();
    await paste(null, { text: 'https://example.org/private-image.png' });
    assert.match(await page.locator('#coloring-status').textContent(), /Copiar imagen/i);
    assert.equal(await output(), previous, 'Pasted image URLs preserve the existing image and are not fetched');
    await paste('png', { count: 2 });
    assert.match(await page.locator('#coloring-status').textContent(), /una|uno|solo/i);
    assert.equal(await output(), previous, 'Multiple pasted images do not choose an arbitrary file');
    for (const mode of ['denied', 'text', 'empty', 'multiple']) {
      await setMode(mode); await page.locator('#coloring-paste').click();
      await page.waitForFunction(() => document.getElementById('coloring-previews').getAttribute('aria-busy') !== 'true');
      assert.equal(await output(), previous, `${mode} clipboard preserves the current result`);
      assert.match(await page.locator('#coloring-status').textContent(), mode === 'multiple' ? /una|uno|solo/i : /Copiar imagen|Ctrl\+V|⌘\+V|archivo|cargar|pegar/i);
    }
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }));
    await page.locator('#coloring-paste').click();
    assert.match(await page.locator('#coloring-status').textContent(), /Ctrl\+V|⌘\+V|archivo|cargar|pegar/i);
    assert.equal(await output(), previous);
    await page.evaluate(() => window.pasteTestInstallMock());

    // Text entry and other activities retain their normal paste behavior.
    const beforeEditable = await page.locator('#coloring-status').textContent();
    assert.equal(await paste('png', { target: '#coloring-google-query' }), false);
    await page.evaluate(() => {
      const editable = document.createElement('div'); editable.id = 'paste-test-editable'; editable.contentEditable = 'true';
      editable.innerHTML = '<span id="paste-test-editable-child">Escribe aquí</span>'; document.getElementById('coloring').append(editable);
    });
    assert.equal(await paste('png', { target: '#paste-test-editable-child' }), false);
    await page.locator('#paste-test-editable').evaluate(el => el.remove());
    assert.equal(await page.locator('#coloring-status').textContent(), beforeEditable);
    await page.locator('#coloring-home').click();
    assert.equal(await paste('png', { target: 'body' }), false);
    await settle();
    await page.locator('#choose-coloring').click();
    assert.equal(await output(), previous);

    // A delayed permission/read response cannot override a newer user decision.
    await setMode('pending'); await page.locator('#coloring-paste').click();
    await page.waitForFunction(() => typeof window.pasteTestResolve === 'function');
    await localUpload(); const localResult = await output();
    await releaseClipboard(); await settle();
    assert.equal(await output(), localResult);
    assert.equal(await page.locator('#coloring-filename').textContent(), 'local-preferido.png');
    await page.evaluate(() => { window.pasteTestResolve = null; });
    await page.locator('#coloring-paste').click();
    await page.waitForFunction(() => typeof window.pasteTestResolve === 'function');
    await page.locator('#coloring-clear').click(); await releaseClipboard(); await settle();
    assert.equal(await page.locator('#coloring-output').isHidden(), true, 'Clear wins over an unfinished clipboard read');
    await localUpload();
    await page.evaluate(() => { window.pasteTestResolve = null; });
    await page.locator('#coloring-paste').click();
    await page.waitForFunction(() => typeof window.pasteTestResolve === 'function');
    await page.locator('#coloring-home').click(); await releaseClipboard(); await settle();
    await page.locator('#choose-coloring').click();
    assert.equal(await output(), localResult, 'Leaving the activity invalidates a pending paste');
    assert.equal(await page.locator('#coloring-filename').textContent(), 'local-preferido.png');

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Paste interface fits at ${width}px`);
      assert.equal(await page.locator('#coloring-paste').isVisible(), true);
      await page.locator('#coloring-google-search').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(screenshotDirectory, `coloring-paste-mobile-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.locator('#coloring-previews').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(screenshotDirectory, 'coloring-paste-desktop.png'), fullPage: true });
    assert.equal(network.length, googleRequests, 'Paste never fetches a URL or uploads clipboard contents');
    assert.deepEqual(errors, []);
    console.log('Coloring paste: explicit Google tab, empty query, local clipboard conversion/export, PNG/JPEG/WebP paste, text/multiple/denied/unavailable clipboard, editable/activity isolation, stale clipboard reads and mobile layout passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
