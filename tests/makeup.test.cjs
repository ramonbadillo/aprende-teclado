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
    // An empty legacy roster starts with the original seven. Seed it before the
    // studio opens so this flow can edit and reload that existing game.
    const legacyRoster = await page.addInitScript(() => {
      const key = 'fabi-estudio-v1:created-dolls';
      if (localStorage.getItem(key) === null) localStorage.setItem(key, '[]');
    });
    await page.locator('#choose-makeup').click();
    await page.getByRole('img', { name: 'Retrato de Fabi', exact: true }).first().waitFor();
    await legacyRoster.dispose();
    const press = name => page.getByRole('button', { name, exact: true }).click();
    const portrait = () => page.locator('#portrait').getAttribute('aria-label');

    // Rasterize the mirror itself, excluding transient effects and ARIA labels.
    async function mirrorPixels(crop) {
      return page.locator('#portrait > svg').evaluate(async (svg, crop) => {
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
        const digest = await crypto.subtle.digest('SHA-256', ctx.getImageData(...(crop || [0, 0, width, height])).data);
        return Array.from(new Uint8Array(digest)).join(',');
      }, crop);
    }

    const ids = ['iris', 'sol', 'luna'];
    const boys = ['leo', 'nico', 'dani', 'mateo'];
    const starterIds = [...ids, ...boys.map(id => 'friend-' + id)];
    const dollButtons = page.locator('#dolls button[data-doll]');
    const dollNames = () => dollButtons.evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
    const dollIds = () => dollButtons.evaluateAll(buttons => buttons.map(button => button.dataset.doll));
    assert.deepEqual(await dollIds(), starterIds);
    assert.deepEqual(await dollNames(), ['Fabi', 'Jade', 'Sofi', 'Leo', 'Nico', 'Dani', 'Mateo']);
    assert(await page.locator('#add-doll').isEnabled(), 'One space is available in the initial group');
    await page.locator('#add-doll').click();
    assert.equal(await page.locator('#new-doll-templates [aria-pressed="true"]').getAttribute('data-template'), 'emma');
    await page.locator('#cancel-new-doll').click();
    assert.equal(await portrait(), 'Retrato de Fabi');
    assert.equal(await page.locator('#dolls [aria-pressed="true"]').getAttribute('data-doll'), 'iris');
    const selectDoll = id => page.locator('#dolls [data-doll="' + id + '"]').click();
    async function selectTool(section, tool) {
      await page.locator('#sections [data-section="' + section + '"]').click();
      await page.locator('#tools [data-tool="' + tool + '"]').click();
    }

    function columnsFor(count) {
      return count === 4 || count >= 7 ? 4 : 3;
    }

    async function openGroup(groupIds = ids) {
      const names = await dollNames();
      await page.locator('#finish').click();
      const card = page.locator('#postcard');
      assert.deepEqual(await card.locator('[data-character]').evaluateAll(figures => figures.map(figure => figure.dataset.character)), groupIds);
      if (groupIds.length > 3) {
        const svgIds = await card.locator('[id]').evaluateAll(elements => elements.map(el => el.id));
        assert.equal(new Set(svgIds).size, svgIds.length, 'Copies of a template need their own SVG titles and paint definitions');
      }
      const description = await card.getAttribute('aria-label');
      const frame = await card.locator(':scope > svg').evaluate(svg => {
        const box = svg.viewBox.baseVal, matrix = svg.getScreenCTM();
        return { x: matrix.e, y: matrix.f, width: box.width * matrix.a, height: box.height * matrix.d };
      });
      const columns = columnsFor(groupIds.length);
      const rows = Math.ceil(groupIds.length / columns);
      for (const [index, id] of groupIds.entries()) {
        const figure = card.locator('[data-character="' + id + '"]');
        const caption = figure.locator('text[data-caption]');
        assert(description.includes(names[index]));
        assert.equal(await caption.textContent(), names[index]);
        assert.equal(await figure.locator('svg[role="img"] title').textContent(), 'Retrato de ' + names[index]);
        const row = Math.floor(index / columns);
        const inRow = Math.min(columns, groupIds.length - row * columns);
        const column = index % columns + (columns - inRow) / 2;
        const label = await caption.boundingBox();
        const columnLeft = frame.x + column * frame.width / columns;
        assert(label.width > 0 && label.x >= columnLeft - 1 && label.x + label.width <= columnLeft + frame.width / columns + 1,
          'Each full name fits beneath its own doll');
        const art = await figure.locator('svg[role="img"]').boundingBox();
        const centerY = art.y + art.height / 2;
        assert(art.height > 0 && centerY >= frame.y + row * frame.height / rows && centerY < label.y, 'The figure appears above her own name');
        assert(art.y >= frame.y - 1 && art.y + art.height <= frame.y + frame.height + 1 &&
          label.y + label.height <= frame.y + (row + 1) * frame.height / rows + 2,
          'Neither the doll nor her caption is clipped by the bottom of the row');
      }
    }

    async function saveGroup(count = 3) {
      const [download] = await Promise.all([page.waitForEvent('download'), press('Guardar imagen')]);
      assert.equal(download.suggestedFilename(), count === 3 ? 'Retrato de las tres muñecas.png' : 'Retrato de ' + count + ' personajes.png');
      const bytes = await fs.readFile(await download.path());
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16), columnsFor(count) * 720);
      assert.equal(bytes.readUInt32BE(20), count > 4 ? 2880 : 1500);
      await page.locator('#edit').click();
      return bytes.toString('base64');
    }

    async function downloadGroup(groupIds = ids) {
      await openGroup(groupIds);
      return saveGroup(groupIds.length);
    }

    // Chrome's antialiasing can differ by a few channel levels on isolated
    // edge pixels when it redraws a complex SVG; edits affect whole features.
    async function assertGroupChange(before, after, expected = {}, groupIds = ids) {
      const actual = await page.evaluate(async ({ before, after, groupIds, columns }) => {
        async function decode(png) {
          const image = new Image();
          image.src = 'data:image/png;base64,' + png;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);
          return ctx.getImageData(0, 0, image.width, image.height);
        }
        const [a, b] = await Promise.all([decode(before), decode(after)]);
        const rows = Math.ceil(groupIds.length / columns);
        const rowHeight = a.height / rows;
        const counts = groupIds.map(() => ({ art: 0, caption: 0 }));
        for (let i = 0; i < a.data.length; i += 4) {
          if (Math.abs(a.data[i] - b.data[i]) <= 5 && Math.abs(a.data[i + 1] - b.data[i + 1]) <= 5 &&
              Math.abs(a.data[i + 2] - b.data[i + 2]) <= 5 && Math.abs(a.data[i + 3] - b.data[i + 3]) <= 5) continue;
          const pixel = i / 4;
          const y = Math.floor(pixel / a.width);
          const row = Math.floor(y / rowHeight);
          const rowSize = Math.min(columns, groupIds.length - row * columns);
          const column = Math.floor((pixel % a.width) / (a.width / columns) - (columns - rowSize) / 2);
          if (column < 0 || column >= rowSize) throw new Error('The scene outside the group changed');
          const region = y - row * rowHeight < rowHeight * .83 ? 'art' : 'caption';
          counts[row * columns + column][region]++;
        }
        return counts;
      }, { before, after, groupIds, columns: columnsFor(groupIds.length) });
      for (const [index, id] of groupIds.entries()) {
        for (const region of ['art', 'caption']) {
          if (expected[id] === region) assert(actual[index][region] > 10, id + ' must visibly change: ' + region);
          else assert.equal(actual[index][region], 0, id + ' must keep her ' + region);
        }
      }
    }

    // Inspect the clothing itself, not the head or the accessible name. Then
    // edit one boy at a time and confirm the exported PNG changes only for him.
    const originalClothes = new Set();
    const editedLooks = new Map();
    let boysPhoto = await downloadGroup(starterIds);
    for (const [index, template] of boys.entries()) {
      const id = 'friend-' + template;
      await selectDoll(id);
      await selectTool('style', 'outfit');
      assert.equal(await page.locator('#portrait [data-garment]').getAttribute('data-garment'),
        ['bomber', 'hoodie', 'stripes', 'dungarees'][index]);
      const original = await mirrorPixels([130, 223, 60, 137]);
      originalClothes.add(original);
      if (index === 0) {
        for (const tool of ['cut', 'outfit']) {
          await selectTool('style', tool);
          const before = await mirrorPixels();
          const choices = page.locator('#palette [data-value]');
          assert.equal(await choices.count(), 8);
          const variants = new Set([before]);
          for (const choice of await choices.all()) {
            if (!(await choice.getAttribute('data-value'))) continue;
            await choice.click();
            variants.add(await mirrorPixels());
          }
          assert.equal(variants.size, 8, tool + ' offers eight distinct looks including Original');
          await page.locator('#palette [data-value=""]').click();
          assert.equal(await mirrorPixels(), before, 'Original restores the ' + tool + ' of this model');
        }
      }
      const replacement = ['hoodie', 'stripes', 'dungarees', 'bomber'][index];
      await page.locator('#palette [data-value="' + replacement + '"]').click();
      assert.notEqual(await mirrorPixels([130, 223, 60, 137]), original, template + ' changes clothes in the mirror');
      editedLooks.set(id, await mirrorPixels());
      const updated = await downloadGroup(starterIds);
      await assertGroupChange(boysPhoto, updated, { [id]: 'art' }, starterIds);
      boysPhoto = updated;
    }
    assert.equal(originalClothes.size, 4, 'Each boy has distinct artwork for his original clothing');
    await page.reload();
    await selectTool('style', 'outfit');
    for (const [id, look] of editedLooks) {
      await selectDoll(id);
      assert.equal(await mirrorPixels(), look, id + ' retains his own edited outfit');
    }
    await assertGroupChange(boysPhoto, await downloadGroup(starterIds), {}, starterIds);
    async function removeCharacter(id) {
      await selectDoll(id);
      page.once('dialog', dialog => dialog.accept());
      await page.locator('#remove-doll').click();
      await page.locator('#dolls [data-doll="' + id + '"]').waitFor({ state: 'detached' });
    }
    for (const id of editedLooks.keys()) await removeCharacter(id);
    await page.reload();
    assert.deepEqual(await dollIds(), ids, 'Removed starter characters stay out of the group');
    const plain = await downloadGroup();
    await selectDoll('luna');
    await press('Cereza');
    const painted = await downloadGroup();
    await assertGroupChange(plain, painted, { luna: 'art' });

    await selectDoll('sol');
    assert.equal(await portrait(), 'Retrato de Jade');
    await press('Ojos');
    await press('Menta');
    await selectDoll('luna');
    assert.equal(await portrait(), 'Retrato de Sofi. Labios: Cereza');
    await press('Deshacer');
    assert.equal(await portrait(), 'Retrato de Sofi');
    const withEyeshadow = await downloadGroup();
    await assertGroupChange(plain, withEyeshadow, { sol: 'art' });

    await selectDoll('sol');
    assert.equal(await portrait(), 'Retrato de Jade. Ojos: Menta');
    assert.equal(await page.getByRole('button', { name: 'Deshacer' }).isEnabled(), true);
    await assertGroupChange(withEyeshadow, await downloadGroup());

    await selectDoll('luna');
    await press('Vestuario');
    let lastPhoto = withEyeshadow;
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
      const nextPhoto = await downloadGroup();
      await assertGroupChange(lastPhoto, nextPhoto, { luna: 'art' });
      await press('Deshacer');
      await assertGroupChange(lastPhoto, await downloadGroup());
      await option.click();
      lastPhoto = nextPhoto;
    }
    await press('Maquillaje');
    await assertGroupChange(lastPhoto, await downloadGroup());

    async function rename(name) {
      await page.locator('#doll-name').fill(name);
      await page.locator('#name-form').getByRole('button', { name: 'Guardar nombre' }).click();
      assert.equal(await page.locator('#mirror-name').textContent(), name);
      assert((await portrait()).startsWith('Retrato de ' + name));
      assert.equal(await page.locator('#portrait svg title').textContent(), 'Retrato de ' + name);
      assert.equal(await page.locator('#dolls [aria-pressed="true"]').getAttribute('aria-label'), name);
    }

    // Angle brackets and ampersands must survive both SVG serialization and PNG rendering.
    const specialName = 'Lía & <Sol> de las Nubes';
    await rename(specialName);
    const renamedPhoto = await downloadGroup();
    await assertGroupChange(lastPhoto, renamedPhoto, { luna: 'caption' });
    const savedDescription = await portrait();
    await selectDoll('sol');
    assert.equal(await portrait(), 'Retrato de Jade. Ojos: Menta');
    await rename('Mar');
    await press('Deshacer');
    assert.equal(await portrait(), 'Retrato de Jade. Ojos: Menta');
    await rename('Mar');
    assert.equal(await page.locator('#doll-name').inputValue(), 'Mar');
    const namedGroup = await downloadGroup();

    await page.reload();
    await selectDoll('luna');
    assert.equal(await portrait(), savedDescription, 'The named doll retains her own outfit after reloading');
    await press('Vestuario');
    await assertGroupChange(namedGroup, await downloadGroup());
    await selectDoll('sol');
    assert.equal(await portrait(), 'Retrato de Mar. Ojos: Menta');

    // Fabi starts untouched. Cycle each palette through its actual buttons,
    // and restore her original look before exercising the next feature.
    await selectDoll('iris');
    const groups = [
      ['makeup', 'lips', /^Quitar /],
      ['makeup', 'eyes', /^Quitar /],
      ['makeup', 'cheeks', /^Quitar /],
      ['makeup', 'stamp', /^Quitar /],
      ['style', 'hair', null],
      ['style', 'dress', null],
      ['style', 'accessory', /^Sin accesorio$/],
      ['appearance', 'hairColor', /original/i],
      ['appearance', 'faceShape', /original/i],
      ['appearance', 'eyeColor', /original/i],
      ['appearance', 'skinTone', /original/i],
    ];
    const palette = page.locator('#palette');
    const clear = page.locator('#clear-choice');
    for (const [section, category, clearLabel] of groups) {
      await selectTool(section, category);
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
        if (category === 'dress') assert.equal(await originalChoice.getAttribute('aria-label'), 'Original');
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

    await selectTool('style', 'hair');
    await press('Trenza');
    await selectTool('makeup', 'eyes');
    await press('Menta');
    await selectTool('makeup', 'lips');
    await press('Cereza');
    for (const [index, trait] of ['hairColor', 'faceShape', 'eyeColor', 'skinTone'].entries()) {
      await selectTool('appearance', trait);
      const option = palette.getByRole('button').nth(index + 1);
      const original = await mirrorPixels();
      await option.click();
      assert.notEqual(await mirrorPixels(), original, trait + ' remains visible with other traits applied');
      await press('Deshacer');
      assert.equal(await mirrorPixels(), original, 'Undo restores the prior traits and cosmetics');
      await option.click();
    }
    // A new hair color must coexist with the haircut, and a new iris color
    // with the eye shadow. Changing each independently must still affect pixels.
    for (const [section, tool, first, replacement] of [
      ['style', 'hair', 'Trenza', 'Coleta alta'],
      ['makeup', 'eyes', 'Menta', 'Lavanda'],
      ['makeup', 'lips', 'Cereza', 'Coral'],
    ]) {
      await selectTool(section, tool);
      assert.equal(await palette.getByRole('button', { name: first, exact: true }).getAttribute('aria-pressed'), 'true');
      const original = await mirrorPixels();
      await palette.getByRole('button', { name: replacement, exact: true }).click();
      assert.notEqual(await mirrorPixels(), original, tool + ' is still visible when all traits are set');
      await press('Deshacer');
      assert.equal(await mirrorPixels(), original);
    }
    let group = await downloadGroup();
    await assertGroupChange(namedGroup, group, { iris: 'art' });
    for (const [id, trait, index] of [['luna', 'hairColor', 7], ['sol', 'skinTone', 6]]) {
      await selectDoll(id);
      await selectTool('appearance', trait);
      await palette.getByRole('button').nth(index).click();
      const updated = await downloadGroup();
      await assertGroupChange(group, updated, { [id]: 'art' });
      group = updated;
    }

    await selectDoll('iris');
    await rename(specialName);
    const finalGroup = await downloadGroup();
    await assertGroupChange(group, finalGroup, { iris: 'caption' });
    assert.equal(await page.locator('#dolls').getByRole('button', { name: specialName, exact: true }).count(), 2);

    const savedLooks = {};
    for (const id of ids) {
      await selectDoll(id);
      await selectTool('appearance', 'hairColor');
      savedLooks[id] = { description: await portrait(), pixels: await mirrorPixels() };
    }
    await page.reload();
    for (const id of ids) {
      await selectDoll(id);
      await selectTool('appearance', 'hairColor');
      assert.equal(await portrait(), savedLooks[id].description, id + ' retains all saved feature choices');
      assert.equal(await mirrorPixels(), savedLooks[id].pixels, id + ' retains her rendered appearance');
    }
    await assertGroupChange(finalGroup, await downloadGroup());

    const backdropIds = ['studio', 'garden', 'beach', 'forest', 'castle', 'night', 'fair', 'snow'];
    const backdrops = page.locator('#backdrops .backdrop-option');
    const activeBackdrop = () => page.locator('#backdrops [aria-pressed="true"]').getAttribute('data-backdrop');
    const samples = [];
    let snowScene;
    for (const key of backdropIds) {
      await openGroup();
      if (key === 'studio') {
        assert.equal(await activeBackdrop(), 'studio');
        const options = await backdrops.evaluateAll(buttons => buttons.map(button => button.dataset.backdrop));
        assert.deepEqual([...options].sort(), [...backdropIds].sort());
      }
      await page.locator('#backdrops [data-backdrop="' + key + '"]').click();
      assert.equal(await activeBackdrop(), key);
      const preview = await page.locator('#postcard > svg').evaluate(svg => new XMLSerializer().serializeToString(svg));
      const png = await saveGroup();
      if (key === 'snow') snowScene = png;
      // Sample the scene above the nameplates at the same resolution in the
      // preview and the actual PNG. The dolls keep the same looks throughout.
      const [shown, exported] = await page.evaluate(async ({ preview, png }) => {
        async function sampleScene(source) {
          const image = new Image();
          image.src = source;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.getContext('2d').drawImage(image, 0, 0);
          const sample = document.createElement('canvas');
          sample.width = 48;
          sample.height = 28;
          const ctx = sample.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(canvas, 60, 60, 2040, 1170, 0, 0, sample.width, sample.height);
          return Array.from(ctx.getImageData(0, 0, sample.width, sample.height).data);
        }
        return Promise.all([
          sampleScene('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(preview)),
          sampleScene('data:image/png;base64,' + png),
        ]);
      }, { preview, png });
      assert(shown.every((channel, index) => Math.abs(channel - exported[index]) <= 3), key + ' must match the downloaded scene');
      for (const previous of samples) {
        const different = exported.filter((channel, index) => Math.abs(channel - previous[index]) > 10);
        assert(different.length > 30, key + ' must be visibly different from every preceding scene');
      }
      samples.push(exported);
    }

    await selectDoll('sol');
    await rename('Amapola');
    await openGroup();
    assert.equal(await activeBackdrop(), 'snow', 'The group scene remains selected after switching and renaming dolls');
    const renamedInSnow = await saveGroup();
    await assertGroupChange(snowScene, renamedInSnow, { sol: 'caption' });
    await page.reload();
    await openGroup();
    assert.equal(await activeBackdrop(), 'snow');
    await assertGroupChange(renamedInSnow, await saveGroup());

    // These records predate the new names. Reads must recognize the previous
    // defaults and preserve deliberate choices, including after another edit.
    await page.evaluate(() => {
      const legacy = {
        iris: { name: 'fabi', look: { stamp: 'moon' } },
        luna: { name: 'Mía', look: { dress: 'denim' } },
        sol: { name: 'jade', look: { accessory: 'crown' } },
      };
      for (const [id, record] of Object.entries(legacy)) localStorage.setItem('fabi-estudio-v1:' + id, JSON.stringify(record));
    });
    await page.reload();
    assert.deepEqual(await dollNames(), ['Fabi', 'Jade', 'Mía']);
    for (const [id, section, tool, value] of [
      ['iris', 'makeup', 'stamp', 'moon'], ['luna', 'style', 'dress', 'denim'], ['sol', 'style', 'accessory', 'crown'],
    ]) {
      await selectDoll(id);
      await selectTool(section, tool);
      assert.equal(await palette.locator('[aria-pressed="true"]').getAttribute('data-value'), value, id + ' retains her legacy look');
    }
    await page.evaluate(() => {
      localStorage.setItem('fabi-estudio-v1:luna', JSON.stringify({ name: 'Luna', look: { dress: 'denim' } }));
    });
    await page.reload();
    assert.deepEqual(await dollNames(), ['Fabi', 'Jade', 'Sofi'], 'An untouched historical name adopts the new default');
    await selectDoll('luna');
    await rename('Luna');
    await page.reload();
    assert.deepEqual(await dollNames(), ['Fabi', 'Jade', 'Luna'], 'A legacy default explicitly chosen today is a saved custom name');
    await selectDoll('luna');
    assert((await portrait()).includes('Mezclilla'), 'Renaming a migrated doll preserves her outfit');

    const addDoll = page.locator('#add-doll');
    const removeDoll = page.locator('#remove-doll');
    const roster = [...ids];
    const names = await dollNames();
    const looks = new Map();
    const templates = new Map();
    await selectTool('makeup', 'lips');
    for (const id of ids) {
      await selectDoll(id);
      assert(await removeDoll.isHidden(), 'The original three dolls stay in the group');
      looks.set(id, await mirrorPixels());
    }
    await addDoll.click();
    assert.deepEqual(await page.locator('#new-doll-templates [data-template]').evaluateAll(options =>
      options.map(option => option.dataset.template).sort()), [...ids, 'emma', ...boys].sort());
    await page.locator('#new-doll-name').fill('Sin guardar');
    await page.locator('#cancel-new-doll').click();
    assert(await page.locator('#new-doll-form').isHidden());
    assert.deepEqual(await dollNames(), names, 'Canceling does not add a doll');

    async function createDoll(template, name) {
      await addDoll.click();
      const option = page.locator('#new-doll-templates [data-template="' + template + '"]');
      await option.click();
      assert.equal(await option.getAttribute('aria-pressed'), 'true');
      await page.locator('#new-doll-name').fill(name);
      await page.locator('#new-doll-form button[type="submit"]').click();
      await page.locator('#new-doll-form').waitFor({ state: 'hidden' });
      const id = await page.locator('#dolls [aria-pressed="true"]').getAttribute('data-doll');
      assert(id && !roster.includes(id), 'A new doll has her own ID and is selected');
      roster.push(id);
      names.push(name || 'Personaje ' + roster.length);
      assert.deepEqual(await dollNames(), names);
      assert.equal(await page.locator('#doll-count').textContent(), roster.length + ' de 8');
      return id;
    }

    let fullGroup;
    for (const [template, name, lipstick] of [
      ['sol', '', 'Coral'], ['sol', 'Personaje 4', 'Cereza'], ['iris', 'Eva', 'Malva'],
      ['luna', 'Sol & <Mar>', 'Sandía'], ['iris', 'Princesa de los Luceros', 'Rubí'],
    ]) {
      const id = await createDoll(template, name);
      await selectTool('makeup', 'lips');
      const initial = await mirrorPixels();
      if (templates.has(template)) assert.equal(initial, templates.get(template), 'A reused template starts with a fresh look');
      templates.set(template, initial);
      await palette.getByRole('button', { name: lipstick, exact: true }).click();
      const styled = await mirrorPixels();
      assert.notEqual(styled, initial);
      looks.set(id, styled);
      await openGroup(roster);
      assert.equal(await activeBackdrop(), 'snow', 'Growing the group preserves its chosen scene');
      fullGroup = await saveGroup(roster.length);
    }
    assert.equal(new Set(templates.values()).size, 3, 'Each template produces a different doll');
    assert(await addDoll.isDisabled());
    await page.reload();
    assert.deepEqual(await dollNames(), names);
    assert(await addDoll.isDisabled());
    await selectTool('makeup', 'lips');
    for (const id of roster) {
      await selectDoll(id);
      assert.equal(await mirrorPixels(), looks.get(id), id + ' restores her own look after reloading');
    }
    await openGroup(roster);
    assert.equal(await activeBackdrop(), 'snow');
    await assertGroupChange(fullGroup, await saveGroup(8), {}, roster);
    const last = roster.at(-1);
    await selectTool('appearance', 'skinTone');
    await palette.getByRole('button').nth(6).click();
    await openGroup(roster);
    await assertGroupChange(fullGroup, await saveGroup(8), { [last]: 'art' }, roster);

    page.once('dialog', dialog => dialog.dismiss());
    await removeDoll.click();
    assert.deepEqual(await dollNames(), names);
    assert(await addDoll.isDisabled());
    page.once('dialog', dialog => dialog.accept());
    await removeDoll.click();
    await page.locator('#dolls [data-doll="' + last + '"]').waitFor({ state: 'detached' });
    roster.pop();
    names.pop();
    assert.deepEqual(await dollNames(), names);
    assert(await addDoll.isEnabled(), 'Removing a created doll frees one place');
    await page.reload();
    for (const id of roster) {
      await selectDoll(id);
      assert.equal(await mirrorPixels(), looks.get(id), id + ' keeps her look after removing another doll');
    }
    await createDoll('emma', 'Abril');
    assert(await addDoll.isDisabled());
    await openGroup(roster);
    assert.equal(await activeBackdrop(), 'snow');
    await saveGroup(8);

    // Older rosters were an array of custom entries. Keep their IDs, names and
    // edits before filling any remaining places with the new starter children.
    const oldEntries = Array.from({ length: 5 }, (_, i) => ({
      id: 'friend-anterior-' + i, templateId: ids[i % ids.length], name: 'Amiga ' + (i + 1),
    }));
    async function loadOldRoster(count) {
      await page.evaluate(entries => {
        localStorage.setItem('fabi-estudio-v1:created-dolls', JSON.stringify(entries));
        localStorage.setItem('fabi-estudio-v1:' + entries[0].id, JSON.stringify({
          name: 'Estrella', nameVersion: 2, look: { accessory: 'crown' },
        }));
      }, oldEntries.slice(0, count));
      await page.reload();
    }
    await loadOldRoster(2);
    assert.deepEqual(await dollIds(), [...ids, ...oldEntries.slice(0, 2).map(entry => entry.id), ...starterIds.slice(3, 6)]);
    await loadOldRoster(5);
    const oldIds = [...ids, ...oldEntries.map(entry => entry.id)];
    assert.deepEqual(await dollIds(), oldIds, 'Migrating a full group keeps all five custom characters');
    assert(await addDoll.isDisabled());
    await selectDoll(oldEntries[0].id);
    assert.equal(await page.locator('#mirror-name').textContent(), 'Estrella');
    assert((await portrait()).includes('Corona'));
    const beforeChange = await downloadGroup(oldIds);
    await page.locator('#change-model').click();
    await page.locator('#new-doll-templates [data-template="mateo"]').click();
    await page.locator('#new-doll-form button[type="submit"]').click();
    await page.locator('#new-doll-form').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#mirror-name').textContent(), 'Estrella');
    assert((await portrait()).includes('Corona'), 'A model change preserves the character’s accessory');
    const converted = await downloadGroup(oldIds);
    await assertGroupChange(beforeChange, converted, { [oldEntries[0].id]: 'art' }, oldIds);
    await page.reload();
    assert.deepEqual(await dollIds(), oldIds);
    await assertGroupChange(converted, await downloadGroup(oldIds), {}, oldIds);
    assert.deepEqual(errors, []);
    console.log('Makeup: legacy group of seven, thirteen palettes, editable models, migrated rosters, eight backdrops and group PNGs for three to eight passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
