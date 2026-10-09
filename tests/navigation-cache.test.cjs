// Verify a new page opens the piano even with the previous script URL in HTTP cache.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

(async () => {
  let legacyRequests = 0;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    response.setHeader('Cache-Control', 'public, max-age=3600');
    if (url.pathname === '/previous') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<!doctype html><html><head><script src="/script.js" defer></script></head><body>Previous release</body></html>');
      return;
    }
    if (url.pathname === '/script.js' && !url.search) {
      legacyRequests++;
      response.setHeader('Content-Type', 'text/javascript');
      response.end('window.legacyNavigationLoaded = true;');
      return;
    }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(origin + '/previous');
    assert.equal(await page.evaluate(() => window.legacyNavigationLoaded), true);
    assert.equal(legacyRequests, 1);
    await page.goto(origin + '/index.html');
    await page.locator('#choose-piano').click();
    assert.equal(await page.locator('#piano').isVisible(), true, 'New navigation loads despite cached legacy script');
    assert.equal(await page.locator('#chooser').isVisible(), false);
    await page.keyboard.down('a');
    assert.equal(await page.locator('.piano-key.is-held').count(), 1);
    await page.keyboard.up('a');
    await page.locator('#piano-home').click();
    assert.equal(await page.locator('#chooser').isVisible(), true);
    assert.equal(legacyRequests, 1, 'The original URL stays cached and is not requested again');
    assert.deepEqual(errors, []);
    console.log('Navigation cache: previous script cached, updated menu opens piano, keyboard and return to chooser passed.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
