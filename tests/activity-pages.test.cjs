const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const routes = {
  fabi: ['globos-de-letras', 'Globos de letras', ['home', 'game', 'finish'], 'script.js'],
  soni: ['teclado-magico', 'Teclado mágico', ['soni'], 'soni/game.js'],
  timer: ['tiempo-con-calma', 'Tiempo con calma', ['timer'], 'timer/timer.js'],
  breathing: ['respira-con-la-mariposa', 'Respira con la mariposa', ['breathing'], 'breathing/breathing.js'],
  piano: ['mi-primer-piano', 'Mi primer piano', ['piano'], 'piano/piano.js'],
  hangman: ['ahorcado', 'Ahorcado', ['hangman'], 'hangman/hangman.js'],
  popit: ['mi-pop-it', 'Mi pop it', ['popit'], 'popit/popit.js'],
  clay: ['plasticonejo', 'Plasticonejo', ['clay'], 'clay/clay.js'],
  space: ['astroletras', 'Astroletras', ['space'], 'space/space.js'],
  coloring: ['a-colorear', 'A colorear', ['coloring'], 'coloring/coloring.js'],
  numbers: ['mi-tablero-de-numeros', 'Mi tablero de números', ['numbers'], 'numbers/numbers.js']
};
const menu = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const [id, [route, title, screens, script]] of Object.entries(routes)) {
  test(`${title}: independent document, metadata, links and assets`, () => {
    const html = fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
    assert.match(menu, new RegExp(`<a id="choose-${id}" href="\\./${route}/" data-site-link`));
    assert(html.includes(`<title>${title} · El mundo de Fabi</title>`));
    assert.deepEqual([...html.matchAll(/<section id="([^"]+)" class="screen /g)].map(match => match[1]), screens);
    assert(!html.includes('id="chooser"'));
    assert.equal((html.match(/gtag\('config', 'G-DSSKXYFM89'\)/g) || []).length, 1);
    assert(!html.includes('activity_open'));
    assert(html.indexOf('<title>') < html.indexOf('googletagmanager.com'));
    const sourcePaths = [...html.matchAll(/<script src="\.\.\/([^"?]+)/g)].map(match => match[1]);
    for (const [, , , otherScript] of Object.values(routes)) {
      assert.equal(sourcePaths.includes(otherScript), otherScript === script, `Only load this game's controller: ${otherScript}`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'No duplicate DOM IDs');
    for (const [, relative] of html.matchAll(/(?:src|href)="(\.\.?\/[^"?#]*)/g)) {
      assert(fs.existsSync(path.resolve(root, route, relative)), `Missing asset/link: ${relative}`);
    }
    assert.match(html, /href="\.\.\/" data-site-link/);
  });
}

test('homepage contains only the menu and no activity controller', () => {
  assert.equal((menu.match(/<section /g) || []).length, 1);
  assert.equal((menu.match(/<a id="choose-/g) || []).length, Object.keys(routes).length);
  for (const [, , , script] of Object.values(routes)) assert(!menu.includes(`src="./${script}`));
});

test('canonical page path preserves the hosting prefix, query and fragment', () => {
  const source = fs.readFileSync(path.join(root, 'canonical-url.js'), 'utf8');
  for (const input of [
    ['https://example.com/aprende-teclado/mi-primer-piano/index.html?from=link#notes', 'https://example.com/aprende-teclado/mi-primer-piano/?from=link#notes'],
    ['https://example.com/ahorcado/', null],
    ['file:///tmp/site/ahorcado/index.html', null]
  ]) {
    let replacement = null;
    vm.runInNewContext(source, { URL, window: { location: { href: input[0] }, history: { state: null, replaceState: (_, __, url) => { replacement = url; } } } });
    assert.equal(replacement, input[1]);
  }
});

test('local-file links work without a server and do not duplicate index.html', () => {
  const links = ['../', '../mi-pop-it/', '../index.html'].map(href => ({ href, getAttribute: () => href }));
  vm.runInNewContext(fs.readFileSync(path.join(root, 'navigation.js'), 'utf8'), {
    URL, window: { location: { href: 'file:///tmp/site/ahorcado/index.html' } },
    document: { querySelectorAll: () => links }
  });
  assert.deepEqual(links.map(link => link.href), ['file:///tmp/site/index.html', 'file:///tmp/site/mi-pop-it/index.html', 'file:///tmp/site/index.html']);
});

test('shared controller starts only the requested game, keeps saved progress and handles history restoration', () => {
  const handlers = {}, clicks = {}, calls = [];
  let saved = { options: { sound: false, layout: 'en', playerName: 'Local' }, progress: { games: 7 } };
  const game = { enter: options => calls.push(['enter', options.sound]), leave: () => calls.push(['leave']), setSound: value => calls.push(['sound', value]) };
  const sound = { setAttribute() {}, addEventListener: (name, fn) => { clicks[name] = fn; } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'activity-page.js'), 'utf8'), {
    document: { body: { dataset: { activity: 'piano' } }, getElementById: id => id === 'sound' ? sound : {} },
    localStorage: { getItem: () => JSON.stringify(saved), setItem: (_, value) => { saved = JSON.parse(value); } },
    window: { PianoGame: game, addEventListener: (name, fn) => { handlers[name] = fn; } }
  });
  assert.deepEqual(calls, [['sound', false], ['enter', false]]);
  clicks.click();
  assert.equal(saved.options.sound, true);
  assert.equal(saved.options.playerName, 'Local');
  assert.equal(saved.progress.games, 7);
  handlers.pagehide();
  handlers.pageshow({ persisted: true });
  assert.deepEqual(calls.slice(-3), [['leave'], ['sound', true], ['enter', true]]);
});
