// Run with Node.js, Playwright and Chrome installed. All remote responses are fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const screenshotDirectory = process.env.SCREENSHOT_DIR || '/tmp';
const api = 'https://api.openverse.org/v1/images/';
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const item = (n, title, extra = {}) => ({
  id: id(n), title, creator: 'Ilustradora de prueba', license: 'cc0', mature: false,
  thumbnail: `${api}${id(n)}/thumb/`, foreign_landing_url: `https://example.org/dibujo/${n}`,
  ...extra,
});
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, acceptDownloads: true });
    const errors = [], unexpected = [], searches = [], fullImages = [], fallbackImages = [], allRequests = [];
    const slowSearch = { started: deferred(), release: deferred(), completed: deferred() };
    let slowImage = null;
    let png;
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) allRequests.push(request.url()); });
    await page.route(/^https?:/, async route => {
      const url = new URL(route.request().url());
      const cors = { 'access-control-allow-origin': '*' };
      if (url.origin !== 'https://api.openverse.org') {
        unexpected.push(url.href);
        await route.abort();
        return;
      }
      if (url.pathname === '/v1/images/') {
        searches.push(url);
        const query = url.searchParams.get('q');
        if (query === 'sin conexión') { await route.abort('internetdisconnected'); return; }
        if (query === 'límite') { await route.fulfill({ status: 429, headers: cors, body: '{}' }); return; }
        if (query === 'consulta lenta') {
          slowSearch.started.resolve();
          await slowSearch.release.promise;
        }
        let rows = [item(1, 'Gato de colores'), item(2, 'Mariposa azul', { license: 'pdm' }),
          item(3, '<img src=x onerror="window.coloringInjected=true">', {
            creator: '<script>window.coloringInjected=true</script>',
            foreign_landing_url: 'javascript:window.coloringInjected=true',
          })];
        let pageCount = 1;
        if (query === 'gato & flores') {
          pageCount = 2;
          rows = url.searchParams.get('page') === '2' ? [item(4, 'Flor del jardín')] : [...rows,
            item(5, 'Contenido excluido', { mature: true }),
            item(6, 'Licencia excluida', { license: 'by-nc' }),
            item(7, 'Proveedor desconocido', { thumbnail: 'https://untrusted.example/image.png' }),
            item(8, 'URL en lugar de identificador', { id: 'https://untrusted.example/image.png' }),
            item(9, 'Contenido sensible', { unstable__sensitivity: ['sensitive'] })];
        }
        if (query === 'vacío') rows = [];
        if (query === 'consulta lenta') rows = [item(10, 'Resultado obsoleto')];
        if (query === 'consulta actual') rows = [item(11, 'Resultado actual')];
        if (query === 'carga lenta') rows = [item(12, 'Imagen pendiente')];
        if (query === 'imagen rota') rows = [item(13, 'Imagen rota')];
        if (query === 'miniatura rota') rows = [item(14, 'Miniatura rota')];
        if (query === 'original no disponible') rows = [item(15, 'Original no disponible')];
        if (query === 'formato no compatible') rows = [item(16, 'Formato no compatible')];
        if (query === 'original corrupto') rows = [item(17, 'Original corrupto')];
        if (query === 'original enorme') rows = [item(18, 'Original enorme')];
        if (query === 'imagen limitada') rows = [item(19, 'Imagen limitada')];
        await route.fulfill({ status: 200, contentType: 'application/json', headers: cors,
          body: JSON.stringify({ result_count: rows.length, page_count: pageCount, results: rows }) }).catch(() => {});
        if (query === 'consulta lenta') slowSearch.completed.resolve();
        return;
      }
      if (/^\/v1\/images\/[0-9a-f-]+\/thumb\/$/.test(url.pathname)) {
        let waiting;
        if (url.pathname.includes(id(14))) { await route.fulfill({ status: 404, headers: cors, body: '' }); return; }
        if (!url.searchParams.has('full_size') && route.request().resourceType() === 'fetch') {
          fallbackImages.push(url);
          if (url.pathname.includes(id(13))) { await route.fulfill({ status: 424, headers: cors, body: '' }); return; }
        }
        if (url.searchParams.get('full_size') === 'true') {
          fullImages.push(url);
          if (url.pathname.includes(id(13))) { await route.fulfill({ status: 404, headers: cors, body: '' }); return; }
          if (url.pathname.includes(id(15))) { await route.fulfill({ status: 424, headers: cors, body: '' }); return; }
          if (url.pathname.includes(id(16))) { await route.fulfill({ status: 200, headers: cors, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }); return; }
          if (url.pathname.includes(id(17))) { await route.fulfill({ status: 200, headers: cors, contentType: 'image/png', body: 'broken PNG' }); return; }
          if (url.pathname.includes(id(18))) { await route.fulfill({ status: 200, headers: { ...cors, 'content-length': String(21 * 1024 * 1024) }, contentType: 'image/png', body: png }); return; }
          if (url.pathname.includes(id(19))) { await route.fulfill({ status: 429, headers: cors, body: '' }); return; }
          if (url.pathname.includes(id(12)) && slowImage) {
            waiting = slowImage;
            waiting.started.resolve();
            await waiting.release.promise;
          }
        }
        await route.fulfill({ status: 200, headers: cors, contentType: 'image/png', body: png }).catch(() => {});
        if (waiting) waiting.completed.resolve();
        return;
      }
      unexpected.push(url.href);
      await route.abort();
    });

    const output = () => page.locator('#coloring-output').evaluate(canvas => canvas.toDataURL('image/png'));
    const ready = () => page.waitForFunction(() => !document.getElementById('coloring-output').hidden &&
      !document.getElementById('coloring-download').disabled && document.getElementById('coloring-previews').getAttribute('aria-busy') !== 'true');
    const searchFinished = () => page.waitForFunction(() => document.getElementById('coloring-search-results').getAttribute('aria-busy') === 'false' &&
      !document.getElementById('coloring-search-status').textContent.startsWith('Buscando'));
    const search = async query => {
      await page.locator('#coloring-search-query').fill(query);
      await page.locator('#coloring-search-submit').click();
      await searchFinished();
    };
    const pick = title => page.getByRole('button', { name: `Colorear ${title}`, exact: true });
    const upload = async () => {
      await page.locator('#coloring-file').setInputFiles({ name: 'mi-imagen.png', mimeType: 'image/png', buffer: png });
      await ready();
    };
    await page.goto(pathToFileURL(path.join(__dirname, '../index.html')).href);
    await page.locator('#choose-coloring').click();
    assert.equal(await page.locator('#coloring-openverse').evaluate(details => details.open), false, 'Openverse starts as a closed secondary option');
    await page.locator('#coloring-openverse > summary').click();
    png = Buffer.from(await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 192; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ee8da8'; ctx.fillRect(15, 20, 62, 85);
      ctx.strokeStyle = '#30462d'; ctx.lineWidth = 3; ctx.strokeRect(15, 20, 62, 85);
      ctx.beginPath(); ctx.arc(132, 62, 39, 0, 2 * Math.PI); ctx.fillStyle = '#81cfdc'; ctx.fill(); ctx.stroke();
      return canvas.toDataURL('image/png').split(',')[1];
    }), 'base64');
    assert.equal(allRequests.length, 0, 'Opening the tool makes no remote requests');
    await page.locator('#coloring-search-query').fill('gato & flores');
    assert.equal(allRequests.length, 0, 'Typing does not send the query');
    await page.locator('#coloring-search-submit').click();
    await searchFinished();
    assert.equal(searches.length, 1);
    assert.equal(searches[0].searchParams.get('q'), 'gato & flores', 'Special query characters are encoded correctly');
    assert.equal(searches[0].searchParams.get('category'), 'illustration');
    assert.equal(searches[0].searchParams.get('mature'), 'false');
    assert.equal(searches[0].searchParams.get('page_size'), '12');
    assert.deepEqual(searches[0].searchParams.get('license').split(',').sort(), ['cc0', 'pdm']);
    assert.equal(await page.locator('.coloring-search-pick').count(), 3, 'Unsafe and unsupported API records are excluded');
    assert.equal(await page.locator('#coloring-search-results script').count(), 0);
    assert.equal(await page.locator('#coloring-search-results img').count(), 3, 'Titles are rendered as text, not HTML');
    assert.equal(await page.evaluate(() => window.coloringInjected), undefined);
    assert.equal(await page.locator('#coloring-search-results a[href^="javascript:"]').count(), 0);
    for (const anchor of await page.locator('#coloring-search-results a').all()) {
      assert.match(await anchor.getAttribute('href'), /^https:\/\//);
      assert.match(await anchor.getAttribute('rel'), /noopener/);
    }
    assert.equal(fullImages.length, 0, 'Full-size pixels are fetched only after selection');

    await pick('Gato de colores').click();
    await ready();
    assert.equal(fullImages.length, 1);
    const pixels = await page.locator('#coloring-output').evaluate(canvas => {
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let black = 0, white = 0, other = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== data[i + 1] || data[i] !== data[i + 2] || data[i + 3] !== 255) other++;
        else if (data[i] === 0) black++;
        else if (data[i] === 255) white++;
        else other++;
      }
      return { width: canvas.width, height: canvas.height, black, white, other };
    });
    assert.equal(pixels.width, 192); assert.equal(pixels.height, 128);
    assert.equal(pixels.other, 0); assert.ok(pixels.black > 10); assert.ok(pixels.white > pixels.black);
    assert.equal(await page.locator('#coloring-credit').isVisible(), true);
    assert.match(await page.locator('#coloring-credit').textContent(), /Gato de colores/);
    assert.match(await page.locator('#coloring-credit').textContent(), /Ilustradora de prueba/);
    assert.match(await page.locator('#coloring-credit').textContent(), /CC0/);
    const converted = await output();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#coloring-download').click();
    const download = await downloadPromise;
    assert.equal(`data:image/png;base64,${fs.readFileSync(await download.path()).toString('base64')}`, converted,
      'Download is the exact processed preview, not the original remote image');

    await page.locator('#coloring-search-more').click();
    await searchFinished();
    assert.equal(searches.at(-1).searchParams.get('page'), '2');
    assert.equal(await page.locator('.coloring-search-pick').count(), 4);
    assert.equal(await page.locator('#coloring-search-more').isHidden(), true);
    await pick('Mariposa azul').click(); await ready();
    assert.match(await page.locator('#coloring-credit').textContent(), /Mariposa azul/);
    assert.doesNotMatch(await page.locator('#coloring-credit').textContent(), /Gato de colores/);
    await pick('<img src=x onerror="window.coloringInjected=true">').click(); await ready();
    assert.equal(await page.locator('#coloring-credit script, #coloring-credit img, #coloring-credit a[href^="javascript:"]').count(), 0);
    assert.equal(await page.evaluate(() => window.coloringInjected), undefined);
    await pick('Gato de colores').click(); await ready();

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}px`);
      for (const selector of ['#coloring-search-query', '#coloring-search-submit', '#coloring-search-results']) {
        const rect = await page.locator(selector).boundingBox();
        assert.ok(rect.x >= 0 && rect.x + rect.width <= width + 1, `${selector} fits at ${width}px`);
      }
      await page.screenshot({ path: path.join(screenshotDirectory, `coloring-search-mobile-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.screenshot({ path: path.join(screenshotDirectory, 'coloring-search-desktop.png'), fullPage: true });
    await page.locator('#theme-toggle').click();
    assert.equal(await output(), converted, 'Theme changes preserve the printable pixels');
    await page.locator('.coloring-upload').evaluate(async el => { await Promise.all(el.getAnimations().map(animation => animation.finished)); });
    await page.locator('#coloring-previews').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(screenshotDirectory, 'coloring-search-dark.png'), fullPage: true });
    await page.evaluate(() => { window.coloringPrintCalls = 0; window.print = () => { window.coloringPrintCalls++; }; });
    await page.locator('#coloring-print').click();
    assert.equal(await page.evaluate(() => window.coloringPrintCalls), 1);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('#coloring-output').isVisible(), true);
    for (const panel of await page.locator('.coloring-search-panel').all()) {
      assert.equal(await panel.isHidden(), true, 'Both search panels and the gallery are excluded from printing');
    }
    assert.equal(await page.locator('#coloring-credit').isHidden(), true);
    await page.emulateMedia({ media: 'screen' });

    await page.locator('#coloring-search-kind').selectOption('all');
    await page.locator('[data-coloring-query="flores"]').click(); await searchFinished();
    assert.equal(searches.at(-1).searchParams.get('q'), 'flores');
    assert.equal(searches.at(-1).searchParams.has('category'), false, 'All images removes the illustration filter');
    for (const [query, expected] of [['vacío', /No encontramos/], ['límite', /límite/], ['sin conexión', /conectarnos|conexión/]]) {
      await search(query);
      assert.match(await page.locator('#coloring-search-status').textContent(), expected);
      assert.equal(await page.locator('.coloring-search-pick').count(), 0);
      assert.equal(await output(), converted, 'Search failure or empty results preserve the current sheet');
      assert.equal(await page.locator('#coloring-search-more').isHidden(), true);
    }
    await search('imagen rota'); await pick('Imagen rota').click();
    await page.waitForFunction(() => document.getElementById('coloring-status').getAttribute('data-error') === 'true');
    assert.equal(await output(), converted, 'Failure of both original and thumbnail preserves the last successful sheet');
    assert.match(await page.locator('#coloring-credit').textContent(), /Gato de colores/);
    assert.ok(fallbackImages.some(url => url.pathname.includes(id(13))), 'An unavailable original attempts the cached thumbnail');

    // Some original hosts are unavailable to Openverse while its cached preview still works.
    for (const [query, title, fixtureId] of [
      ['original no disponible', 'Original no disponible', 15],
      ['formato no compatible', 'Formato no compatible', 16],
      ['original corrupto', 'Original corrupto', 17],
      ['original enorme', 'Original enorme', 18],
    ]) {
      const previousFallbacks = fallbackImages.length;
      await search(query); await pick(title).click(); await ready();
      assert.equal(fallbackImages.length, previousFallbacks + 1, `${query} falls back once to cached pixels`);
      assert.ok(fallbackImages.at(-1).pathname.includes(id(fixtureId)));
      assert.equal(await output(), converted, 'Cached preview is processed into the same black and white PNG');
      assert.match(await page.locator('#coloring-credit').textContent(), new RegExp(title));
      assert.match(await page.locator('#coloring-credit').textContent(), /Vista previa de menor resolución/);
      assert.equal(await page.locator('#coloring-print').isDisabled(), false);
    }
    const fallbackDownloadPromise = page.waitForEvent('download');
    await page.locator('#coloring-download').click();
    const fallbackDownload = await fallbackDownloadPromise;
    assert.equal(`data:image/png;base64,${fs.readFileSync(await fallbackDownload.path()).toString('base64')}`, converted,
      'Fallback PNG downloads the processed preview');
    const previousFallbacks = fallbackImages.length;
    await search('imagen limitada'); await pick('Imagen limitada').click();
    await page.waitForFunction(() => document.getElementById('coloring-status').getAttribute('data-error') === 'true');
    assert.equal(fallbackImages.length, previousFallbacks, 'Rate limiting does not cause another provider request');
    assert.equal(await output(), converted);
    assert.match(await page.locator('#coloring-credit').textContent(), /Original enorme/);
    await search('miniatura rota');
    await page.waitForFunction(() => document.querySelector('.coloring-search-pick').textContent.includes('Imagen no disponible'));
    assert.equal(await page.locator('.coloring-search-pick').isDisabled(), true, 'Unavailable thumbnails cannot be selected');
    assert.equal(await page.locator('.coloring-search-card').isHidden(), true, 'Broken thumbnails are hidden from the gallery');

    // An old response may arrive after a replacement query; it must never replace the gallery.
    await page.locator('#coloring-search-query').fill('consulta lenta');
    await page.locator('#coloring-search-submit').click();
    await slowSearch.started.promise;
    await search('consulta actual');
    slowSearch.release.resolve();
    await slowSearch.completed.promise;
    await pick('Resultado actual').waitFor();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await pick('Resultado obsoleto').count(), 0);
    assert.equal(await page.locator('.coloring-search-pick').count(), 1);

    // Local selection and clear both invalidate an unfinished remote image request.
    await search('carga lenta');
    slowImage = { started: deferred(), release: deferred(), completed: deferred() };
    await pick('Imagen pendiente').click(); await slowImage.started.promise;
    await upload();
    slowImage.release.resolve();
    await slowImage.completed.promise;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator('#coloring-filename').textContent(), 'mi-imagen.png');
    assert.equal(await page.locator('#coloring-credit').isHidden(), true, 'A local file clears remote credits');
    slowImage = { started: deferred(), release: deferred(), completed: deferred() };
    await pick('Imagen pendiente').click(); await slowImage.started.promise;
    await page.locator('#coloring-clear').click();
    slowImage.release.resolve();
    await slowImage.completed.promise;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator('#coloring-output').isHidden(), true);
    assert.equal(await page.locator('#coloring-credit').isHidden(), true);
    assert.equal(await page.locator('#coloring-download').isDisabled(), true);
    await page.locator('#coloring-example').click(); await ready();
    assert.equal(await page.locator('#coloring-credit').isHidden(), true);
    assert.deepEqual(unexpected, [], 'Remote image URLs cannot direct the browser to arbitrary hosts');
    assert.deepEqual(errors, []);
    console.log('Coloring search: explicit query, filters, safe results and links, pagination, PNG conversion/download, credits, original-to-preview fallback, failed thumbnails, error recovery, stale searches/imports, mobile, dark mode and print passed. All network responses were fixtures.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
