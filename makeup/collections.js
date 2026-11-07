(() => {
  'use strict';

  // A collection is portable data, independent of this browser's storage keys.
  const format = 'estudio-de-fabi';
  const version = 1;
  const maxBytes = 64 * 1024;
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const $ = id => document.getElementById(id);

  function connect({ templates, originals, maxDolls, choices, backdrops, cleanName, snapshot, restore }) {
    const dialog = $('import-group-dialog'), picker = $('group-file');
    const status = $('group-file-status');
    let pending = null;
    let readNumber = 0;

    function serialize() {
      return JSON.stringify({ format, version, ...snapshot() }, null, 2) + '\n';
    }

    function validate(data) {
      const fail = message => { throw new Error(message); };
      if (!isObject(data) || data.format !== format || data.version !== version) fail('Este archivo no es una colección compatible del estudio.');
      if (!backdrops.some(([id]) => id === data.backdrop)) fail('El fondo del archivo no está disponible.');
      if (!Array.isArray(data.characters) || data.characters.length < originals.length || data.characters.length > maxDolls) {
        fail('El grupo debe tener entre tres y ocho personajes.');
      }
      const seen = new Set();
      const characters = data.characters.map((entry, index) => {
        if (!isObject(entry)) fail('Hay un personaje incompleto.');
        const { id, templateId, originalName, name, look } = entry;
        const base = templates.find(candidate => candidate.id === templateId);
        const original = originals[index];
        if (!base || typeof id !== 'string' || seen.has(id) || (original
          ? id !== original.id || templateId !== original.id || originalName !== original.name
          : !/^friend-[a-z0-9-]{1,64}$/.test(id))) fail('Revisa los modelos y el orden de los personajes.');
        if (![name, originalName].every(n => typeof n === 'string' && n.length > 0 && cleanName(n) === n)) fail('Hay un nombre vacío o no válido.');
        if (!isObject(look)) fail('Falta el diseño de un personaje.');
        const design = {};
        for (const [key, value] of Object.entries(look)) {
          if (!Object.hasOwn(choices, key) || !(value === null || choices[key].some(([, v]) => v !== '' && v === value))) {
            fail('Hay una opción de diseño que no existe en el estudio.');
          }
          if (value !== null) design[key] = value;
        }
        seen.add(id);
        return { id, templateId, originalName, name, look: design };
      });
      return { characters, backdrop: data.backdrop };
    }

    let published;
    function publishedGroup() {
      if (!published) published = (async () => {
        if (location.protocol !== 'file:') {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4000);
          try {
            const response = await fetch('./colecciones/personajes-de-fabi.json', { cache: 'no-cache', signal: controller.signal });
            if (response.ok) {
              const text = await response.text();
              if (new Blob([text]).size <= maxBytes) return validate(JSON.parse(text));
            }
          } catch { /* Local files and offline visits use the packaged copy. */ }
          finally { clearTimeout(timer); }
        }
        return validate(window.MakeupDefaultCollection);
      })();
      return published;
    }

    async function preview(readGroup) {
      const current = ++readNumber;
      pending = null;
      try {
        const group = await readGroup();
        if (current !== readNumber) return;
        const backdrop = backdrops.find(([id]) => id === group.backdrop)[1];
        $('import-group-summary').textContent = group.characters.length + ' personajes: ' +
          group.characters.map(character => character.name).join(', ') + '. Fondo: ' + backdrop + '.';
        status.textContent = '';
        pending = group;
        if (!dialog.open) dialog.showModal();
        $('cancel-group-import').focus();
      } catch (error) {
        if (current !== readNumber) return;
        const reason = error instanceof SyntaxError ? 'El archivo no contiene JSON válido.' : error.message;
        status.textContent = 'No se pudo cargar. ' + reason + ' Tu grupo sigue igual.';
      }
    }

    $('export-group').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'personajes-de-fabi.json';
      link.href = URL.createObjectURL(new Blob([serialize()], { type: 'application/json;charset=utf-8' }));
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 30000);
      status.textContent = 'Archivo preparado: personajes-de-fabi.json. Puedes volver a cargarlo para seguir jugando.';
    });
    const code = $('group-json');
    function updateCode() {
      if ($('group-json-details').open) code.value = serialize();
    }
    $('group-json-details').addEventListener('toggle', updateCode);
    code.addEventListener('focus', () => { updateCode(); code.select(); });
    $('import-group').addEventListener('click', () => picker.click());
    picker.addEventListener('change', () => {
      const [file] = picker.files;
      picker.value = '';
      if (file) preview(async () => {
        if (file.size > maxBytes) throw new Error('El archivo supera los 64 KB.');
        return validate(JSON.parse(await file.text()));
      });
    });
    $('cancel-group-import').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { pending = null; });
    $('confirm-group-import').addEventListener('click', async () => {
      if (!pending) return;
      const group = pending;
      pending = null;
      dialog.close();
      try {
        await restore(group);
        updateCode();
        status.textContent = 'Grupo cargado: ' + group.characters.length + ' personajes listos para jugar.';
      } catch {
        status.textContent = 'No se pudo guardar el grupo en este navegador. Tu grupo anterior sigue igual.';
      }
    });

    // A shared link can offer the checked-in collection without replacing a visitor's game.
    function openShared() {
      if (new URLSearchParams(location.search).get('coleccion') !== 'fabi') return;
      preview(publishedGroup);
    }
    return { openShared, publishedGroup, updateCode };
  }

  window.MakeupCollections = { connect };
})();
