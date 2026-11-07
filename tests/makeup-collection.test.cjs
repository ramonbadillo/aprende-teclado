const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

async function main() {
  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fabi-collection-test-'));
  const studioDir = path.resolve(__dirname, '../estudio-de-maquillaje');
  const origin = process.env.STUDIO_TEST_ORIGIN;
  const studio = origin ? new URL('/estudio-de-maquillaje/', origin).href : pathToFileURL(path.join(studioDir, 'index.html')).href;
  const errors = [];
  let context, page;

  async function startBrowser() {
    context = await chromium.launchPersistentContext(profileDir, {
      channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true, acceptDownloads: true,
    });
    page = context.pages()[0];
    page.on('pageerror', error => errors.push(error.message));
    if (origin) await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ body: '' }));
    else await page.route(/^https?:\/\//, route => route.abort());
    await page.goto(studio);
    await page.locator('#dolls [data-doll]').first().waitFor();
  }

  async function download() {
    const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-group').click()]);
    assert.equal(file.suggestedFilename(), 'personajes-de-fabi.json');
    const bytes = await fs.readFile(await file.path());
    return { bytes, group: JSON.parse(bytes.toString('utf8')) };
  }

  async function upload(bytes) {
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#import-group').click()]);
    assert.equal(await chooser.element().getAttribute('id'), 'group-file');
    await chooser.setFiles({ name: 'grupo.json', mimeType: 'application/json', buffer: bytes });
  }

  async function verifyPreview(group) {
    const dialog = page.locator('#import-group-dialog');
    await dialog.waitFor();
    const summary = await dialog.innerText();
    assert(summary.includes(String(group.characters.length)));
    for (const character of group.characters) assert(summary.includes(character.name), character.name);
    return dialog;
  }

  async function applyImport(bytes, group) {
    await upload(bytes);
    const dialog = await verifyPreview(group);
    await confirm(dialog);
  }

  async function confirm(dialog) {
    await page.locator('#confirm-group-import').click();
    await dialog.waitFor({ state: 'hidden' });
    await page.locator('#group-file-status').filter({ hasText: /grupo cargado/i }).waitFor();
  }

  async function choose(section, tool, value) {
    await page.locator('#sections [data-section="' + section + '"]').click();
    await page.locator('#tools [data-tool="' + tool + '"]').click();
    await page.locator('#palette [data-value="' + value + '"]').click();
  }

  async function rename(name) {
    await page.locator('#doll-name').fill(name);
    await page.locator('#name-form button[type=submit]').click();
    assert.equal(await page.locator('#mirror-name').textContent(), name);
  }

  async function create(name, template) {
    await page.locator('#add-doll').click();
    await page.locator('#new-doll-templates [data-template="' + template + '"]').click();
    await page.locator('#new-doll-name').fill(name);
    await page.locator('#new-doll-form button[type=submit]').click();
    await page.locator('#new-doll-form').waitFor({ state: 'hidden' });
    return page.locator('#dolls [aria-pressed=true]').getAttribute('data-doll');
  }

  async function postcard(backdrop) {
    await page.locator('#finish').click();
    if (backdrop) await page.locator('#backdrops [data-backdrop="' + backdrop + '"]').click();
    const active = await page.locator('#backdrops [aria-pressed=true]').getAttribute('data-backdrop');
    const pictures = await page.locator('#postcard [data-character]').evaluateAll(figures => figures.map(figure => ({
      id: figure.dataset.character, caption: figure.querySelector('[data-caption]').textContent,
      art: new XMLSerializer().serializeToString(figure.querySelector('svg[role=img]')),
    })));
    await page.locator('#edit').click();
    return { active, pictures };
  }

  // Only this test's temporary Chrome profile is used to recreate pre-existing storage.
  async function loadPriorGame(key, value) {
    await page.evaluate(({ key, value }) => {
      const prefix = 'fabi-estudio-v1:';
      for (const entry of Object.keys(localStorage)) {
        if (entry.startsWith(prefix)) localStorage.removeItem(entry);
      }
      localStorage.setItem(prefix + key, value);
    }, { key, value });
    await page.reload();
    await page.locator('#dolls [data-doll]').first().waitFor();
  }

  try {
    const savedFile = await fs.readFile(path.join(studioDir, 'colecciones/personajes-de-fabi.json'));
    const savedGroup = JSON.parse(savedFile.toString('utf8'));
    await startBrowser();
    assert(await page.locator('#import-group-dialog').isHidden(), 'First visit enters the saved group directly');
    const visibleNames = await page.locator('#dolls [data-doll]').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
    assert.deepEqual(visibleNames, savedGroup.characters.map(character => character.name));
    assert.deepEqual((await download()).group, savedGroup, 'A new profile starts with the checked-in collection');
    const firstPortrait = await postcard();
    assert.equal(firstPortrait.active, savedGroup.backdrop);
    assert.deepEqual(firstPortrait.pictures.map(p => [p.id, p.caption]), savedGroup.characters.map(c => [c.id, c.name]));
    for (const [i, character] of savedGroup.characters.entries()) {
      if (character.look.dress) assert(firstPortrait.pictures[i].art.includes('data-garment="' + character.look.dress + '"'));
    }

    const edited = structuredClone(savedGroup);
    edited.characters[0].name = 'Edición propia';
    edited.characters[0].look.stamp = edited.characters[0].look.stamp === 'star' ? 'moon' : 'star';
    edited.backdrop = edited.backdrop === 'night' ? 'beach' : 'night';
    await rename(edited.characters[0].name);
    await choose('makeup', 'stamp', edited.characters[0].look.stamp);
    await postcard(edited.backdrop);
    await page.reload();
    assert.deepEqual((await download()).group, edited, 'Personal edits survive returning to the studio');

    const legacyIds = ['iris', 'sol', 'luna', 'friend-leo', 'friend-nico', 'friend-dani', 'friend-mateo'];
    const olderProfile = { name: 'Mar de antes', look: { hair: 'braid', cheeks: '#ed9b70' } };
    await loadPriorGame('iris', JSON.stringify(olderProfile));
    const profileOnly = (await download()).group;
    assert.deepEqual(profileOnly.characters.map(c => c.id), legacyIds);
    assert.equal(profileOnly.characters[0].name, olderProfile.name);
    assert.deepEqual(profileOnly.characters[0].look, olderProfile.look);
    assert(profileOnly.characters.slice(1).every(c => c.name === c.originalName && Object.keys(c.look).length === 0));
    assert.equal(profileOnly.backdrop, 'studio');

    await loadPriorGame('backdrop', 'forest');
    const backdropOnly = (await download()).group;
    assert.deepEqual(backdropOnly.characters.map(c => c.id), legacyIds);
    assert(backdropOnly.characters.every(c => c.name === c.originalName && Object.keys(c.look).length === 0));
    assert.equal((await postcard()).active, 'forest');
    assert.equal(backdropOnly.backdrop, 'forest');

    await loadPriorGame('created-dolls', '[]');
    const sharedName = 'Lía & <Nube>';
    const design = {
      lips: '#bd385b', eyes: '#71b5ad', cheeks: '#ed9b70', stamp: 'heart', hair: 'quiff', dress: 'hoodie',
      accessory: 'crown', hairColor: 'teal', eyeColor: 'aqua', faceShape: 'round', skinTone: 'honey',
    };
    await rename(sharedName);
    await choose('makeup', 'stamp', 'cherry');
    await page.locator('#dolls [data-doll="friend-leo"]').click();
    await choose('appearance', 'eyeColor', 'amber');
    const extra = await create('Luz', 'emma');
    await rename(sharedName);
    for (const key of ['lips', 'eyes', 'cheeks', 'stamp']) await choose('makeup', key, design[key]);
    for (const key of ['hairColor', 'faceShape', 'eyeColor', 'skinTone']) await choose('appearance', key, design[key]);
    await choose('style', 'cut', design.hair);
    await choose('style', 'outfit', design.dress);
    await choose('style', 'accessory', design.accessory);
    const portraitA = await postcard('snow');
    const a = await download();
    assert.equal(a.group.format, 'estudio-de-fabi');
    assert.equal(a.group.version, 1);
    assert.equal(a.group.backdrop, 'snow');
    const templates = ['iris', 'sol', 'luna', 'leo', 'nico', 'dani', 'mateo', 'emma'];
    const ids = ['iris', 'sol', 'luna', 'friend-leo', 'friend-nico', 'friend-dani', 'friend-mateo', extra];
    const originalNames = ['Fabi', 'Jade', 'Sofi', 'Leo', 'Nico', 'Dani', 'Mateo', 'Luz'];
    const names = [sharedName, ...originalNames.slice(1, 7), sharedName];
    const looks = [{ stamp: 'cherry' }, {}, {}, { eyeColor: 'amber' }, {}, {}, {}, design];
    assert.deepEqual(a.group.characters, ids.map((id, i) => ({
      id, templateId: templates[i], originalName: originalNames[i], name: names[i], look: looks[i],
    })));
    assert.deepEqual(portraitA.pictures.map(p => p.caption), names);

    // Replace the eighth character and edit one of the permanent three before trying to restore A.
    page.once('dialog', confirmation => confirmation.accept());
    await page.locator('#remove-doll').click();
    await page.locator('#dolls [data-doll="' + extra + '"]').waitFor({ state: 'detached' });
    const replacement = await create('Pablo', 'dani');
    assert.notEqual(replacement, extra);
    await page.locator('#dolls [data-doll="iris"]').click();
    await rename('Grupo B');
    await choose('makeup', 'stamp', 'moon');
    await postcard('beach');
    const b = await download();
    await page.reload();
    assert.deepEqual((await download()).group, b.group);
    await upload(a.bytes);
    const dialog = await verifyPreview(a.group);
    assert((await dialog.innerText()).includes('Nieve'));
    await page.locator('#cancel-group-import').click();
    await dialog.waitFor({ state: 'hidden' });
    assert.deepEqual((await download()).group, b.group);

    function changed(edit) {
      const group = structuredClone(a.group);
      edit(group);
      return Buffer.from(JSON.stringify(group));
    }
    const invalid = [
      ['malformed JSON', Buffer.from('{"characters":')],
      ['duplicate ID', changed(g => { g.characters[7].id = g.characters[6].id; })],
      ['two characters', changed(g => { g.characters.length = 2; })],
      ['nine characters', changed(g => g.characters.push({ ...g.characters[7], id: 'friend-ninth' }))],
      ['reordered permanent characters', changed(g => { [g.characters[1], g.characters[2]] = [g.characters[2], g.characters[1]]; })],
      ['unknown design', changed(g => { g.characters[7].look.dress = 'missing-dress'; })],
      ['unknown backdrop', changed(g => { g.backdrop = 'missing-setting'; })],
      ['incompatible version', changed(g => { g.version = 99; })],
      ['too large', Buffer.concat([a.bytes, Buffer.alloc(65_537 - a.bytes.length, 32)])],
    ];
    for (const [reason, bytes] of invalid) {
      await upload(bytes);
      await page.locator('#group-file-status').filter({ hasText: /no se pudo cargar/i }).waitFor();
      assert(await dialog.isHidden(), reason);
      assert.deepEqual((await download()).group, b.group, reason);
    }

    await applyImport(a.bytes, a.group);
    assert.deepEqual((await download()).group, a.group);
    assert.deepEqual(await postcard(), portraitA);
    await context.close();
    context = null;
    await startBrowser();
    assert.deepEqual((await download()).group, a.group, 'restored state is durable after Chrome restarts');
    assert.deepEqual(await postcard(), portraitA);

    // The smallest legal group can omit all looks or explicitly restore an original value with null.
    const three = { ...a.group, characters: structuredClone(a.group.characters.slice(0, 3)) };
    three.characters[1].look = { lips: null };
    const json = Buffer.from(JSON.stringify(three));
    const minimum = Buffer.concat([json, Buffer.alloc(65_536 - json.length, 32)]);
    assert.equal(minimum.byteLength, 65_536);
    await applyImport(minimum, three);
    three.characters[1].look = {};
    await page.reload();
    assert.deepEqual((await download()).group, three);

    await page.goto(new URL('?coleccion=fabi', studio).href);
    const sharedPreview = await verifyPreview(savedGroup);
    await page.locator('#cancel-group-import').click();
    await sharedPreview.waitFor({ state: 'hidden' });
    assert.deepEqual((await download()).group, three);
    await page.reload();
    await confirm(await verifyPreview(savedGroup));
    assert.deepEqual((await download()).group, savedGroup, 'the saved collection exports losslessly');
    assert.deepEqual(await postcard(), firstPortrait, 'First-visit art matches a deliberate import of the saved collection');
    assert.deepEqual(errors, []);
    console.log('Makeup collection: automatic starter, preservation of earlier games, round trip, cancellation, invalid inputs, limits and browser restart passed.');
  } finally {
    if (context) await context.close();
    await fs.rm(profileDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
