const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ body: '' }));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('#choose-makeup').click();
    await page.getByRole('img', { name: 'Retrato de Luna', exact: true }).first().waitFor();
    const press = name => page.getByRole('button', { name, exact: true }).click();
    const portrait = () => page.locator('#portrait').getAttribute('aria-label');

    // Rasterize the mirror itself, excluding transient effects and ARIA labels.
    async function mirrorPixels() {
      return page.locator('#portrait > svg').evaluate(async svg => {
        const { width, height } = svg.viewBox.baseVal;
        const copy = svg.cloneNode(true);
        copy.setAttribute('width', width);
        copy.setAttribute('height', height);
        const image = new Image();
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy));
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const digest = await crypto.subtle.digest('SHA-256', ctx.getImageData(0, 0, width, height).data);
        return Array.from(new Uint8Array(digest)).join(',');
      });
    }

    async function downloadPortrait(name, { safeFilename = true } = {}) {
      const description = await portrait();
      await press('Ver mi retrato');
      assert.equal(await page.locator('#postcard').getAttribute('aria-label'), description);
      assert((await page.locator('#postcard text').allTextContents()).includes(name), 'The postcard bears the doll’s name');
      assert.equal(await page.locator('#postcard svg title').textContent(), 'Retrato de ' + name);
      const [download] = await Promise.all([page.waitForEvent('download'), press('Guardar imagen')]);
      if (safeFilename) assert.equal(download.suggestedFilename(), 'Retrato de ' + name + '.png');
      else {
        assert.match(download.suggestedFilename(), /\.png$/i);
        assert.doesNotMatch(download.suggestedFilename(), /[<>:"/\\|?*]/);
      }
      const bytes = await fs.readFile(await download.path());
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16), 720);
      assert.equal(bytes.readUInt32BE(20), 800);
      await page.locator('#edit').click();
      // Compare the illustration separately from the caption so a name change
      // cannot disguise missing clothes, hair or accessories in the export.
      return page.evaluate(async png => {
        const image = new Image();
        image.src = 'data:image/png;base64,' + png;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        async function fingerprint(y, height) {
          const { data } = ctx.getImageData(0, y, canvas.width, height);
          const digest = await crypto.subtle.digest('SHA-256', data);
          return Array.from(new Uint8Array(digest)).join(',');
        }
        return { art: await fingerprint(0, 660), caption: await fingerprint(660, 140) };
      }, bytes.toString('base64'));
    }

    const plainLuna = await downloadPortrait('Luna');
    await press('Cereza');
    const paintedLuna = await downloadPortrait('Luna');
    assert.notEqual(plainLuna.art, paintedLuna.art, 'Changing lipstick must change the downloaded portrait');

    await press('Sol');
    assert.equal(await portrait(), 'Retrato de Sol');
    await press('Ojos');
    await press('Menta');
    await press('Luna');
    assert.equal(await portrait(), 'Retrato de Luna. Labios: Cereza');
    await press('Deshacer');
    assert.equal(await portrait(), 'Retrato de Luna');
    assert.deepEqual(plainLuna, await downloadPortrait('Luna'), 'Undo restores the original exported portrait');

    await press('Sol');
    assert.equal(await portrait(), 'Retrato de Sol. Ojos: Menta');
    assert.equal(await page.getByRole('button', { name: 'Deshacer' }).isEnabled(), true);
    assert.notEqual(plainLuna.art, (await downloadPortrait('Sol')).art);

    await press('Luna');
    await press('Vestuario');
    let lastPhoto = await downloadPortrait('Luna');
    const outfits = [
      ['Peinados', 'puffs'],
      ['Vestidos', 'mint'],
      ['Accesorios', 'crown'],
    ];
    for (const [category, value] of outfits) {
      await press(category);
      const option = page.locator('#palette [data-value="' + value + '"]');
      await option.click();
      assert.equal(await option.getAttribute('aria-pressed'), 'true');
      assert((await portrait()).includes(await option.getAttribute('aria-label')));
      const nextPhoto = await downloadPortrait('Luna');
      assert.notEqual(nextPhoto.art, lastPhoto.art, category + ' must change the downloaded illustration');
      await press('Deshacer');
      assert.deepEqual(await downloadPortrait('Luna'), lastPhoto, 'Undo must restore the previous ' + category);
      await option.click();
      lastPhoto = nextPhoto;
    }
    await press('Maquillaje');
    assert.deepEqual(await downloadPortrait('Luna'), lastPhoto, 'A chosen dress stays in frame when finishing from makeup');

    async function rename(name) {
      await page.locator('#doll-name').fill(name);
      await page.locator('#name-form').getByRole('button', { name: 'Guardar nombre' }).click();
      assert.equal(await page.locator('#mirror-name').textContent(), name);
      assert((await portrait()).startsWith('Retrato de ' + name));
      assert.equal(await page.locator('#portrait svg title').textContent(), 'Retrato de ' + name);
      assert.equal(await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
    }

    // Angle brackets and ampersands must survive both SVG serialization and PNG rendering.
    const specialName = 'Lía & <Sol>';
    await rename(specialName);
    const renamedPhoto = await downloadPortrait(specialName, { safeFilename: false });
    assert.equal(renamedPhoto.art, lastPhoto.art);
    assert.notEqual(renamedPhoto.caption, lastPhoto.caption);
    const savedDescription = await portrait();
    await press('Sol');
    assert.equal(await portrait(), 'Retrato de Sol. Ojos: Menta');
    await rename('Mar');
    await press('Deshacer');
    assert.equal(await portrait(), 'Retrato de Sol. Ojos: Menta');
    await rename('Mar');
    assert.equal(await page.locator('#doll-name').inputValue(), 'Mar');
    await downloadPortrait('Mar');

    await page.reload();
    await press(specialName);
    assert.equal(await portrait(), savedDescription, 'The named doll retains her own outfit after reloading');
    await press('Vestuario');
    assert.deepEqual(await downloadPortrait(specialName, { safeFilename: false }), renamedPhoto);
    await press('Mar');
    assert.equal(await portrait(), 'Retrato de Mar. Ojos: Menta');

    // Iris starts untouched. Cycle each palette through its actual buttons,
    // and restore her original look before exercising the next feature.
    await press('Iris');
    const groups = [
      ['Maquillaje', 'Labios', /^Quitar /],
      ['Maquillaje', 'Ojos', /^Quitar /],
      ['Maquillaje', 'Mejillas', /^Quitar /],
      ['Maquillaje', 'Sellos', /^Quitar /],
      ['Vestuario', 'Peinados', null],
      ['Vestuario', 'Vestidos', null],
      ['Vestuario', 'Accesorios', /^Sin accesorio$/],
    ];
    const palette = page.locator('#palette');
    const clear = page.locator('#clear-choice');
    for (const [section, category, clearLabel] of groups) {
      await press(section);
      await press(category);
      const buttons = await palette.getByRole('button').all();
      assert.equal(buttons.length, 8, category + ' palette size');
      const originalChoice = palette.locator('[aria-pressed="true"]');
      const originalValue = clearLabel ? null : await originalChoice.getAttribute('data-value');
      if (clearLabel) {
        assert(await clear.isVisible());
        assert.match(await clear.getAttribute('aria-label'), clearLabel);
        assert(await clear.isDisabled(), category + ': a clean doll has nothing to remove');
      } else {
        assert(await clear.isHidden(), category + ' uses the original style instead of a clear button');
        if (category === 'Vestidos') assert.equal(await originalChoice.getAttribute('aria-label'), 'Original');
      }
      const originalPixels = await mirrorPixels();
      const seen = new Set();
      for (const button of buttons) {
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        const pixels = await mirrorPixels();
        const label = await button.getAttribute('aria-label');
        assert(!seen.has(pixels), category + ': ' + label + ' must have distinct visible artwork');
        if (clearLabel) assert.notEqual(pixels, originalPixels, category + ': ' + label + ' must be visible on the doll');
        seen.add(pixels);
      }
      if (clearLabel) {
        assert(await clear.isEnabled());
        await clear.click();
        assert(await clear.isDisabled());
      } else {
        await palette.locator('[data-value="' + originalValue + '"]').click();
      }
      assert.equal(await mirrorPixels(), originalPixels, category + ': returning to the original option restores the image');
    }
    assert.deepEqual(errors, []);
    console.log('Makeup: seven complete palettes, distinct visual options, independent looks, names, undo, reload and PNG export passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
