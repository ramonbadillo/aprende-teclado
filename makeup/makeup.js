(() => {
  'use strict';

  const { characters: templates, appearanceChoices, renderPortrait, renderFacePreview, renderStampPreview } = window.MakeupArt;
  const originalGirls = ['iris', 'sol', 'luna'].map(id => templates.find(base => base.id === id));
  const characters = originalGirls.map(base => ({ ...base, templateId: base.id }));
  const starterBoys = templates.filter(base => base.gender === 'boy');
  const maxDolls = 8;
  const { choices: backdropChoices, renderBackdrop } = window.MakeupBackdrops;
  const products = {
    lips: {
      name: 'Labios', title: 'Color de labios',
      choices: [
        ['Rosa', '#e57598'], ['Coral', '#f47769'], ['Cereza', '#bd385b'], ['Malva', '#ac689e'],
        ['Ciruela', '#743d70'], ['Sandía', '#f25283'], ['Terracota', '#a65738'], ['Rubí', '#981e3d'],
      ],
    },
    eyes: {
      name: 'Ojos', title: 'Sombra de ojos',
      choices: [
        ['Lavanda', '#af8ed0'], ['Menta', '#71b5ad'], ['Cielo', '#78b7da'], ['Oro', '#dca54c'],
        ['Rosa', '#e48eab'], ['Índigo', '#6461b8'], ['Perla', '#f5e3ce'], ['Turquesa', '#20a3a8'],
      ],
    },
    cheeks: {
      name: 'Mejillas', title: 'Color de rubor',
      choices: [
        ['Durazno', '#ed9b70'], ['Rosita', '#f187aa'], ['Coral', '#ed756b'], ['Frambuesa', '#c44c74'],
        ['Malva', '#b07daa'], ['Mandarina', '#ed953c'], ['Canela', '#b96948'], ['Bugambilia', '#b14b9b'],
      ],
    },
    stamp: {
      name: 'Sellos', title: 'Sello de mejilla',
      choices: [
        ['Estrella', 'star'], ['Corazón', 'heart'], ['Flor', 'flower'], ['Luna', 'moon'],
        ['Mariposa', 'butterfly'], ['Arcoíris', 'rainbow'], ['Sol', 'sun'], ['Cerezas', 'cherry'],
      ],
    },
    hair: {
      name: 'Peinados', title: 'Elige un peinado',
      choices: [
        ['Ondas', 'waves'], ['Pompones', 'puffs'], ['Melena corta', 'bob'], ['Trenza', 'braid'],
        ['Coleta alta', 'ponytail'], ['Dos chonguitos', 'buns'], ['Lacio', 'straight'], ['Corto', 'pixie'],
      ],
    },
    dress: {
      name: 'Vestidos', title: 'Elige un vestido',
      choices: [
        ['Original', ''], ['De flores', 'violet'], ['Marinero', 'mint'], ['De fiesta', 'peach'],
        ['Margaritas', 'daisy'], ['Jardinera', 'overall'], ['Ballet', 'ballet'], ['Mezclilla', 'denim'],
      ],
    },
    cut: {
      key: 'hair', name: 'Cortes', title: 'Elige un corte de pelo',
      choices: [
        ['Original', ''], ['Copete', 'quiff'], ['Rizos', 'curls'], ['Raya de lado', 'parted'],
        ['Corto', 'pixie'], ['Melena corta', 'bob'], ['Ondas', 'waves'], ['Lacio', 'straight'],
      ],
    },
    outfit: {
      key: 'dress', name: 'Conjuntos', title: 'Elige un conjunto',
      choices: [
        ['Original', ''], ['Bomber', 'bomber'], ['Sudadera', 'hoodie'], ['Camiseta a rayas', 'stripes'],
        ['Peto', 'dungarees'], ['Vestido clásico', 'classic'], ['Jardinera', 'overall'], ['Mezclilla', 'denim'],
      ],
    },
    accessory: {
      name: 'Accesorios', title: 'Elige un accesorio',
      choices: [
        ['Gorra', 'cap'], ['Gorro tejido', 'beanie'], ['Audífonos', 'headphones'], ['Lentes de sol', 'sunglasses'],
        ['Lentes', 'glasses'], ['Aretes', 'earrings'], ['Corona', 'crown'], ['Moño', 'bow'],
        ['Tiara de flores', 'tiara'], ['Pasador', 'clip'], ['Antifaz', 'mask'], ['Diadema', 'headband'],
      ],
    },
    hairColor: { name: 'Pelo', title: 'Color de pelo', choices: appearanceChoices.hairColor },
    faceShape: { name: 'Cara', title: 'Forma de la cara', choices: appearanceChoices.faceShape },
    eyeColor: { name: 'Color de ojos', title: 'Color de ojos', choices: appearanceChoices.eyeColor },
    skinTone: { name: 'Piel', title: 'Tono de piel', choices: appearanceChoices.skinTone },
  };
  const sections = {
    barber: ['cut','hair','hairColor'],
    makeup: ['lips', 'eyes', 'cheeks', 'stamp'],
    appearance: ['hairColor', 'faceShape', 'eyeColor', 'skinTone'],
    style: ['hair', 'cut', 'dress', 'outfit', 'accessory'],
  };
  const availableChoices = Object.fromEntries(Object.keys(products).filter(key => !products[key].key).map(key =>
    [key, Object.values(products).filter(p => p === products[key] || p.key === key).flatMap(p => p.choices)]));
  const lookKey = (key = tool) => products[key].key || key;
  const newAccessories = new Set(['cap','beanie','headphones','sunglasses']);
  const accessoryFrames = {
    cap: '55 8 225 135', beanie: '56 0 205 142', headphones: '46 8 228 208', sunglasses: '65 123 195 89',
    glasses: '69 130 182 80',
    earrings: '207 157 67 77',
    crown: '95 -2 131 82',
    bow: '66 18 115 88',
    tiara: '63 20 195 114',
    clip: '68 85 77 65',
    mask: '63 119 195 78',
    headband: '62 17 196 122',
  };
  const $ = id => document.getElementById(id);
  const dolls = $('dolls'), tools = $('tools'), palette = $('palette'), dialog = $('photo-dialog');
  const storagePrefix = 'fabi-estudio-v1:';
  const rosterKey = storagePrefix + 'created-dolls';
  const createDialog = $('new-doll-dialog');
  let chosenTemplate = templates[0].id;
  let editingModelId = null;
  let rosterInMemory = false;
  const backdropKey = storagePrefix + 'backdrop';
  let selectedBackdrop = backdropChoices[0][0];
  const profiles = new Map();
  const histories = new Map();
  const lastTool = { barber: 'cut', makeup: 'lips', appearance: 'hairColor', style: 'hair' };
  let doll = characters[0];
  let section = 'makeup';
  let tool = lastTool[section];
  let sounds = null;
  let saving = false;
  let collectionFiles;
  let startup;

  function cleanName(value) {
    if (typeof value !== 'string') return '';
    const text = value.replace(/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/gu, '').trim().replace(/\s+/gu, ' ');
    return Array.from(text).slice(0, 24).join('');
  }

  function readCreatedDolls() {
    if (rosterInMemory) return characters.slice(originalGirls.length);
    let record;
    try {
      record = JSON.parse(localStorage.getItem(rosterKey));
    } catch { /* Start with the regular group if storage is unavailable. */ }
    const savedGroup = record?.version === 2 && Array.isArray(record.dolls);
    const entries = savedGroup ? record.dolls : Array.isArray(record) ? record : [];
    const capacity = maxDolls - originalGirls.length;
    const result = [];
    for (const entry of entries) {
      const base = templates.find(template => template.id === entry?.templateId);
      if (!base || typeof entry.id !== 'string' || !/^friend-[a-z0-9-]{1,64}$/.test(entry.id)) continue;
      if (result.some(existing => existing.id === entry.id)) continue;
      const name = cleanName(entry.name) || 'Personaje ' + (originalGirls.length + result.length + 1);
      result.push({ id: entry.id, templateId: base.id, name, hair: base.hair });
      if (result.length === capacity) break;
    }
    // Old groups keep all their characters; the new friends take only empty places.
    if (!savedGroup) for (const boy of starterBoys) {
      if (result.length === capacity) break;
      const id = 'friend-' + boy.id;
      if (!result.some(entry => entry.id === id || entry.templateId === boy.id)) {
        result.push({ id, templateId: boy.id, name: boy.name, hair: boy.hair });
      }
    }
    return result;
  }

  function saveCreatedDolls(extra, selectedId = doll.id) {
    try {
      const dolls = extra.map(({ id, templateId, name }) => ({ id, templateId, name }));
      localStorage.setItem(rosterKey, JSON.stringify({ version: 2, dolls }));
      rosterInMemory = false;
    } catch { rosterInMemory = true; }
    refreshDolls(extra, selectedId);
  }

  function loadProfile(character) {
    let record;
    try {
      record = JSON.parse(localStorage.getItem(storagePrefix + character.id));
    } catch { /* El estuche también funciona sin almacenamiento. */ }
    const look = {};
    for (const [key, choices] of Object.entries(availableChoices)) {
      const value = record?.look?.[key];
      look[key] = value && choices.some(choice => choice[1] === value) ? value : null;
    }
    const savedName = cleanName(record?.name);
    // Older profiles stored the default name even if only the outfit was edited.
    const wasDefault = record?.nameVersion !== 2 && (
      savedName === character.previousName || savedName.toLowerCase() === character.name.toLowerCase()
    );
    return { name: savedName && !wasDefault ? savedName : character.name, look };
  }

  function writeChange(key, value) {
    const profile = profiles.get(doll.id);
    if (key === 'name') profile.name = value;
    else profile.look[key] = value;
    try {
      const saved = loadProfile(doll);
      if (key === 'name') saved.name = value;
      else saved.look[key] = value;
      localStorage.setItem(storagePrefix + doll.id, JSON.stringify({ ...saved, nameVersion: 2 }));
    } catch { /* La partida sigue en memoria si el navegador no permite guardar. */ }
  }

  function button(label, className, key, value) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.dataset[key] = value;
    el.setAttribute('aria-label', label);
    return el;
  }

  function addDollButton(character) {
    const el = button(character.name, 'doll', 'doll', character.id);
    const art = document.createElement('span');
    art.className = 'doll-art';
    art.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'doll-name';
    el.append(art, label);
    dolls.append(el);
    drawThumbnail(character);
  }

  function drawThumbnail(character) {
    const { name, look } = profiles.get(character.id);
    const el = dolls.querySelector('[data-doll="' + character.id + '"]');
    el.setAttribute('aria-label', name);
    el.title = name;
    el.querySelector('.doll-name').textContent = name;
    el.querySelector('.doll-art').innerHTML = renderPortrait(character.templateId, look, 'thumb-' + character.id, name);
  }

  function refreshDolls(extra, selectedId = doll.id) {
    characters.splice(originalGirls.length, characters.length - originalGirls.length, ...extra);
    const ids = new Set(characters.map(character => character.id));
    for (const id of profiles.keys()) {
      if (!ids.has(id)) {
        profiles.delete(id);
        histories.delete(id);
      }
    }
    dolls.replaceChildren();
    for (const character of characters) {
      if (!profiles.has(character.id)) {
        profiles.set(character.id, loadProfile(character));
        histories.set(character.id, []);
      }
      addDollButton(character);
    }
    const expanded = characters.length > originalGirls.length;
    $('doll-count').textContent = characters.length + ' de ' + maxDolls;
    $('add-doll').disabled = characters.length >= maxDolls;
    $('finish-label').textContent = expanded ? 'Ver retrato del grupo' : 'Ver retrato de las tres';
    $('photo-title').textContent = expanded ? 'El retrato del grupo' : 'El retrato de las tres';
    selectDoll(characters.find(character => character.id === selectedId) || characters[0]);
  }

  function updatePressed(group, key, value) {
    for (const el of group.children) el.setAttribute('aria-pressed', String(el.dataset[key] === value));
  }

  function selectedValue() {
    const value = profiles.get(doll.id).look[lookKey()];
    if (isBoy() && tool === 'cut' && !window.MakeupArt.boyHaircuts.has(value)) return '';
    if (tool === 'cut' && value === doll.hair) return '';
    if (tool === 'outfit' && value === templates.find(base => base.id === doll.templateId).outfit) return '';
    return value || (tool === 'hair' ? doll.hair : '');
  }

  function paletteChoices() {
    const choices = products[tool].choices;
    if (tool === 'accessory') return choices.filter(([,value]) => isBoy()
      ? window.MakeupArt.boyAccessories.has(value) : !newAccessories.has(value));
    if (isBoy() && tool === 'cut') return choices.filter(([,value]) =>
      !value || (window.MakeupArt.boyHaircuts.has(value) && value !== doll.hair));
    // Original already draws this character's haircut or clothes. Use its
    // second slot for a different look so all eight previews are distinct.
    if (tool === 'cut') return choices.map(option => option[1] === doll.hair ? ['Trenza', 'braid'] : option);
    if (tool === 'outfit') {
      const base = templates.find(character => character.id === doll.templateId);
      if (isBoy()) return choices.filter(([,value]) => !value || (value !== base.outfit && starterBoys.some(boy => boy.outfit === value)));
      return choices.map(option => option[1] === base.outfit ? ['Marinero', 'mint'] : option);
    }
    return choices;
  }

  function updateSelection() {
    const value = selectedValue();
    updatePressed(palette, 'value', value);
    $('clear-choice').disabled = !value;
  }

  function isBoy() {
    return templates.find(base => base.id === doll.templateId).gender === 'boy';
  }

  function drawTools() {
    const tab = $('primary-kit-tab');
    const primary = isBoy() ? 'barber' : 'makeup';
    tab.dataset.section = primary;
    tab.textContent = isBoy() ? 'Barbería' : 'Maquillaje';
    if ((section === 'barber' || section === 'makeup') && section !== primary) {
      section = primary;
      tool = lastTool[section];
    }
    $('surprise-cut').hidden = section !== 'barber';
    updatePressed($('sections'), 'section', section);
    const visibleTools = sections[section].filter(key => !isBoy() || (key !== 'hair' && key !== 'dress'));
    if (!visibleTools.includes(tool)) tool = section === 'style' ? 'outfit' : 'cut';
    tools.replaceChildren(...visibleTools.map(key => {
      const name = products[key].name;
      const el = button(name, 'tool', 'tool', key);
      el.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#kit-' + key + '"/></svg>' + name;
      return el;
    }));
    drawPalette();
  }

  function stylePreview(sample, value) {
    const { name, look } = profiles.get(doll.id);
    const key = lookKey();
    const candidate = { ...look, [key]: value || null };
    sample.className = 'style-preview';
    sample.innerHTML = renderPortrait(doll.templateId, candidate, 'option-' + (value || 'base'), name, key === 'dress');
    const svg = sample.firstElementChild;
    // The dress uses the full-length drawing; hair and accessories use the close-up.
    let frame = '0 0 320 336';
    if (key === 'dress') frame = tool === 'outfit' ? '55 134 210 395' : '69 137 181 246';
    if (tool === 'accessory') frame = accessoryFrames[value];
    svg.setAttribute('viewBox', frame);
  }

  function drawPalette() {
    const product = products[tool];
    const styling = section === 'style' || (section === 'barber' && tool !== 'hairColor');
    const shape = tool === 'faceShape';
    $('palette-title').textContent = product.title;
    const clear = $('clear-choice');
    clear.hidden = styling && tool !== 'accessory';
    if (section === 'appearance' || tool === 'hairColor') {
      clear.textContent = shape ? 'Forma original' : 'Color original';
      clear.setAttribute('aria-label', 'Restaurar ' + product.title.toLowerCase() + ' original');
    } else {
      clear.textContent = tool === 'accessory' ? 'Sin accesorio' : 'Quitar';
      clear.setAttribute('aria-label', tool === 'accessory' ? 'Sin accesorio' : 'Quitar ' + product.title.toLowerCase());
    }
    palette.dataset.tool = tool;
    palette.replaceChildren(...paletteChoices().map(([name, value, swatch]) => {
      const el = button(name, styling || shape ? 'style-option' : 'swatch', 'value', value);
      const sample = document.createElement('span');
      sample.setAttribute('aria-hidden', 'true');
      if (styling) {
        stylePreview(sample, value);
      } else if (shape) {
        sample.className = 'style-preview face-preview';
        sample.innerHTML = renderFacePreview(doll.templateId, profiles.get(doll.id).look, value);
      } else if (tool === 'stamp') {
        sample.className = 'stamp-mark';
        sample.innerHTML = renderStampPreview(value);
      } else {
        sample.style.setProperty('--swatch', swatch || value);
      }
      const caption = document.createElement('small');
      caption.textContent = name;
      el.append(sample, caption);
      return el;
    }));
    updatePressed(tools, 'tool', tool);
    updateSelection();
  }

  function drawPortrait() {
    const { name, look } = profiles.get(doll.id);
    const full = section === 'style';
    $('portrait').dataset.view = full ? 'outfit' : 'face';
    $('portrait').innerHTML = renderPortrait(doll.templateId, look, 'mirror', name, full);
    $('portrait').firstElementChild.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    const features = Object.entries(look).filter(([key, value]) => value && !(isBoy() && sections.makeup.includes(key))).map(([key, value]) => {
      const product = products[key];
      const family = product.choices.some(choice => choice[1] === value) ? product
        : Object.values(products).find(p => p.key === key && p.choices.some(choice => choice[1] === value));
      const [label] = family.choices.find(choice => choice[1] === value);
      return family.name + ': ' + label;
    });
    $('portrait').setAttribute('aria-label', ['Retrato de ' + name, ...features].join('. '));
    $('mirror-name').textContent = name;
    $('undo').disabled = !histories.get(doll.id).length;
    updatePressed(dolls, 'doll', doll.id);
    updateSelection();
    collectionFiles?.updateCode();
  }

  function flashTool() {
    const flash = $('tool-flash');
    flash.dataset.tool = tool;
    $('flash-icon').setAttribute('href', '#kit-' + tool);
    flash.classList.remove('paint');
    void flash.offsetWidth;
    flash.classList.add('paint');
  }

  function selectDoll(character) {
    const changed = doll.id !== character.id;
    doll = character;
    if (changed && isBoy()) {
      section = 'barber';
      tool = lastTool.barber;
    }
    const { name } = profiles.get(doll.id);
    $('doll-name').value = name;
    $('remove-doll').hidden = doll.id === doll.templateId;
    $('change-model').hidden = doll.id === doll.templateId;
    drawTools();
    drawPortrait();
    $('studio-status').textContent = 'Ahora juegas con ' + name + '.';
  }

  dolls.addEventListener('click', event => {
    const el = event.target.closest('[data-doll]');
    if (!el || doll.id === el.dataset.doll) return;
    selectDoll(characters.find(character => character.id === el.dataset.doll));
  });

  function openModelPicker(editing) {
    editingModelId = editing ? doll.id : null;
    const unused = templates.find(base => !characters.some(character => character.templateId === base.id));
    chosenTemplate = editing ? doll.templateId : (unused || templates[0]).id;
    const choices = $('new-doll-templates');
    if (!choices.childElementCount) {
      for (const base of templates) {
        const el = button(base.name, 'template-choice', 'template', base.id);
        const art = document.createElement('span');
        art.className = 'template-art';
        art.setAttribute('aria-hidden', 'true');
        art.innerHTML = renderPortrait(base.id, {}, 'create', base.name);
        const label = document.createElement('span');
        label.className = 'template-name';
        label.textContent = base.name;
        el.append(art, label);
        choices.append(el);
      }
    }
    updatePressed(choices, 'template', chosenTemplate);
    $('new-doll-name').value = '';
    $('new-doll-name').placeholder = 'Personaje ' + (characters.length + 1);
    $('new-doll-name-field').hidden = editing;
    $('new-doll-title').textContent = editing ? 'Cambiar modelo de ' + profiles.get(doll.id).name : 'Crear personaje';
    $('new-doll-submit').textContent = editing ? 'Guardar modelo' : 'Crear';
    createDialog.showModal();
  }
  $('add-doll').addEventListener('click', () => openModelPicker(false));
  $('change-model').addEventListener('click', () => openModelPicker(true));

  $('new-doll-templates').addEventListener('click', event => {
    const el = event.target.closest('[data-template]');
    if (!el) return;
    chosenTemplate = el.dataset.template;
    updatePressed($('new-doll-templates'), 'template', chosenTemplate);
  });
  $('cancel-new-doll').addEventListener('click', () => createDialog.close());

  // Two open tabs can edit the group. Check its latest membership before writing.
  async function editCollection(action) {
    let entered = false;
    try {
      if (navigator.locks) return await navigator.locks.request(rosterKey, () => {
        entered = true;
        return action();
      });
    } catch (error) {
      // Some browsers deny locks for local files or restricted storage.
      if (entered || !['SecurityError', 'NotAllowedError'].includes(error.name)) throw error;
    }
    return action();
  }

  $('new-doll-form').addEventListener('submit', event => {
    event.preventDefault();
    editCollection(() => {
      if (!createDialog.open) return;
      const extra = readCreatedDolls();
      createDialog.close();
      const base = templates.find(template => template.id === chosenTemplate);
      if (editingModelId) {
        const existing = extra.find(character => character.id === editingModelId);
        if (!existing) { refreshDolls(extra); return; }
        existing.templateId = base.id;
        existing.hair = base.hair;
        saveCreatedDolls(extra, existing.id);
        $('change-model').focus();
        $('studio-status').textContent = 'Modelo guardado para ' + profiles.get(existing.id).name + '.';
        return;
      }
      if (originalGirls.length + extra.length >= maxDolls) {
        refreshDolls(extra);
        $('studio-status').textContent = 'El grupo ya tiene ocho personajes.';
        return;
      }
      const name = cleanName($('new-doll-name').value) || 'Personaje ' + (originalGirls.length + extra.length + 1);
      const unique = Array.from(crypto.getRandomValues(new Uint32Array(3)), n => n.toString(36)).join('-');
      const character = { id: 'friend-' + unique, templateId: base.id, name, hair: base.hair };
      saveCreatedDolls([...extra, character], character.id);
      dolls.querySelector('[aria-pressed="true"]').focus();
      $('studio-status').textContent = name + ' se unió al grupo.';
    });
  });

  $('remove-doll').addEventListener('click', () => {
    const id = doll.id;
    if (id === doll.templateId) return;
    const { name } = profiles.get(id);
    if (!window.confirm('¿Quitar a ' + name + ' del grupo? Se borrará este personaje y su diseño.')) return;
    editCollection(() => {
      saveCreatedDolls(readCreatedDolls().filter(character => character.id !== id));
      try { localStorage.removeItem(storagePrefix + id); } catch { /* Sigue en memoria. */ }
      $('add-doll').focus();
      $('studio-status').textContent = name + ' salió del grupo.';
    });
  });

  window.addEventListener('storage', event => {
    if (!event.key?.startsWith(storagePrefix) || $('studio-layout').inert) return;
    const previousId = doll.id;
    const input = $('doll-name').value;
    const draftName = input !== profiles.get(doll.id)?.name ? input : null;
    if (event.key === backdropKey) {
      selectedBackdrop = backdropChoices.find(([id]) => id === event.newValue)?.[0] || backdropChoices[0][0];
    } else if (event.key !== rosterKey) {
      const character = characters.find(entry => storagePrefix + entry.id === event.key);
      if (!character) return;
      profiles.set(character.id, loadProfile(character));
      histories.set(character.id, []);
    }
    refreshDolls(readCreatedDolls());
    if (draftName !== null && doll.id === previousId) $('doll-name').value = draftName;
    if (dialog.open) { drawBackdropOptions(); drawPostcard(); }
  });

  $('sections').addEventListener('click', event => {
    const el = event.target.closest('[data-section]');
    if (!el || section === el.dataset.section) return;
    section = el.dataset.section;
    tool = lastTool[section];
    drawTools();
    drawPortrait();
  });

  tools.addEventListener('click', event => {
    const el = event.target.closest('[data-tool]');
    if (!el || tool === el.dataset.tool) return;
    tool = el.dataset.tool;
    lastTool[section] = tool;
    drawPalette();
    $('studio-status').textContent = products[tool].title + '.';
  });

  function applyChange(key, value) {
    const profile = profiles.get(doll.id);
    const previous = key === 'name' ? profile.name : profile.look[key];
    if (previous === value) return false;
    histories.get(doll.id).push({ key, previous, tool, section });
    writeChange(key, value);
    drawThumbnail(doll);
    drawPortrait();
    return true;
  }

  $('name-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = cleanName($('doll-name').value) || doll.name;
    $('doll-name').value = name;
    if (applyChange('name', name)) {
      $('studio-status').textContent = 'Ahora tu personaje se llama ' + name + '.';
    }
  });

  $('surprise-cut').addEventListener('click', () => {
    if (section !== 'barber') return;
    tool = lastTool.barber = 'cut';
    const choices = paletteChoices().filter(([,value]) => value && value !== selectedValue());
    const [name, value] = choices[Math.floor(Math.random() * choices.length)];
    applyChange('hair', value);
    drawTools();
    sounds?.onStamp();
    $('studio-status').textContent = '¡Corte sorpresa! ' + name + '.';
  });
  palette.addEventListener('click', event => {
    const el = event.target.closest('[data-value]');
    if (!el || el.dataset.value === selectedValue()) return;
    const key = lookKey();
    const value = tool === 'hair' && el.dataset.value === doll.hair ? null : el.dataset.value || null;
    if (!applyChange(key, value)) return;
    if (value && section === 'makeup') flashTool();
    sounds?.onStamp();
    $('studio-status').textContent = el.getAttribute('aria-label') + ' en ' + profiles.get(doll.id).name + '.';
  });

  $('clear-choice').addEventListener('click', () => {
    if (!applyChange(lookKey(), null)) return;
    sounds?.onStamp();
    $('studio-status').textContent = section === 'appearance'
      ? 'Se restauró este rasgo de ' + profiles.get(doll.id).name + '.'
      : 'Se quitó la selección de ' + products[tool].name.toLowerCase() + '.';
  });

  $('undo').addEventListener('click', () => {
    const change = histories.get(doll.id).pop();
    if (!change) return;
    writeChange(change.key, change.previous);
    if (change.key === 'name') {
      $('doll-name').value = change.previous;
    } else {
      tool = change.tool;
      section = change.section;
      lastTool[section] = tool;
    }
    drawThumbnail(doll);
    drawTools();
    drawPortrait();
    $('studio-status').textContent = 'Se deshizo el último cambio de ' + profiles.get(doll.id).name + '.';
  });

  function postcardScenery(width, height) {
    const art = renderBackdrop(selectedBackdrop, 'photo');
    if (width === 720 && height === 500) return art;

    return `<svg x="19" y="19" width="${width - 38}" height="${height - 105}"
      viewBox="19 19 682 395" preserveAspectRatio="none">${art}</svg>`;
  }

  function makePostcard() {
    const rows = Math.ceil(characters.length / 4);
    const columns = Math.ceil(characters.length / rows);
    const width = columns === 4 ? 960 : 720;
    const height = rows === 2 ? 960 : 500;
    const step = (width - 24) / columns;
    const originalGroup = characters.length === 3;
    const figures = characters.map((character, index) => {
      const row = Math.floor(index / columns);
      const rowSize = Math.min(columns, characters.length - row * columns);
      const center = width / 2 + (index % columns - (rowSize - 1) / 2) * step;
      const { name, look } = profiles.get(character.id);
      const art = renderPortrait(character.templateId || character.id, look, 'group-photo-' + character.id, name, true);
      const labelPlate = row === 0 && rows === 2
        ? '<rect x="20" y="399" width="216" height="69" rx="17" fill="#fff7e9" fill-opacity=".94" stroke="#bda6a1" stroke-width="1.5"/>'
        : '';
      return `<g data-character="${character.id}" transform="translate(${center - 128} ${row * 480})">
        <svg x="16" y="11" width="224" height="${rows === 2 ? 382 : 407}">${art}</svg>
        ${labelPlate}
        <text data-caption="" x="128" y="${rows === 2 ? 442 : 455}" text-anchor="middle" font-family="Georgia,serif" font-size="${originalGroup ? 29 : 35}" font-style="italic" fill="#704457"></text>
      </g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width * 3}" height="${height * 3}" data-rows="${rows}" aria-hidden="true">
      <rect width="${width}" height="${height}" fill="#fff7e9"/>
      <rect x="9" y="9" width="${width - 18}" height="${height - 18}" rx="16" fill="none" stroke="#c8989f" stroke-width="2"/>
      <g data-scene="">${postcardScenery(width, height)}</g>
      ${originalGroup ? '<path d="M239 441v22m242-22v22" stroke="#d7b4b2" stroke-width="1.3"/>' : ''}
      ${figures}
    </svg>`;
  }

  function fitCaption(caption, name) {
    caption.textContent = name.replace(/[\ufffe\uffff]/gu, '�');
    const available = 206;
    if (caption.getComputedTextLength() <= available) return;

    const text = caption.textContent;
    const letters = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(text), part => part.segment)
      : Array.from(text);
    const middle = Math.ceil(letters.length / 2);
    const spaces = letters.map((letter, index) => letter === ' ' ? index + 1 : 0).filter(Boolean);
    const split = spaces.length ? spaces.reduce((a, b) => Math.abs(b - middle) < Math.abs(a - middle) ? b : a) : middle;
    caption.replaceChildren();
    caption.setAttribute('font-size', '28');
    const baseline = Number(caption.getAttribute('y'));
    for (const [index, line] of [letters.slice(0, split), letters.slice(split)].entries()) {
      const span = document.createElementNS(caption.namespaceURI, 'tspan');
      span.setAttribute('x', caption.getAttribute('x'));
      span.setAttribute('y', baseline + (index ? 16 : -12));
      span.textContent = line.join('');
      caption.append(span);
      if (span.getComputedTextLength() > available) {
        span.setAttribute('textLength', available);
        span.setAttribute('lengthAdjust', 'spacingAndGlyphs');
      }
    }
  }

  function drawBackdropOptions() {
    const group = $('backdrops');
    if (!group.childElementCount) {
      for (const [id, label] of backdropChoices) {
        const el = button(label, 'backdrop-option', 'backdrop', id);
        const art = document.createElement('span');
        art.className = 'backdrop-art';
        art.setAttribute('aria-hidden', 'true');
        art.innerHTML = `<svg viewBox="19 19 682 395" preserveAspectRatio="xMidYMid slice">${renderBackdrop(id, 'sample-' + id)}</svg>`;
        const caption = document.createElement('small');
        caption.textContent = label;
        el.append(art, caption);
        group.append(el);
      }
    }
    updatePressed(group, 'backdrop', selectedBackdrop);
  }

  function describePostcard() {
    const names = characters.map(({ id }) => profiles.get(id).name);
    const [, backdropName] = backdropChoices.find(([id]) => id === selectedBackdrop);
    $('postcard').setAttribute('aria-label', 'Retrato de grupo: ' + names.join(', ') + '. Fondo: ' + backdropName + '.');
  }

  $('backdrops').addEventListener('click', event => {
    const el = event.target.closest('button[data-backdrop]');
    if (!el || el.dataset.backdrop === selectedBackdrop) return;
    selectedBackdrop = el.dataset.backdrop;
    const photo = $('postcard').firstElementChild;
    const { width, height } = photo.viewBox.baseVal;
    photo.querySelector('[data-scene]').innerHTML = postcardScenery(width, height);
    updatePressed($('backdrops'), 'backdrop', selectedBackdrop);
    describePostcard();
    $('photo-status').textContent = '';
    try { localStorage.setItem(backdropKey, selectedBackdrop); } catch { /* Sigue en memoria. */ }
    collectionFiles?.updateCode();
  });

  function drawPostcard() {
    const postcard = $('postcard');
    postcard.innerHTML = makePostcard();
    describePostcard();
    $('photo-status').textContent = '';
    postcard.querySelectorAll('[data-caption]').forEach((caption, index) => fitCaption(caption, profiles.get(characters[index].id).name));
  }

  $('finish').addEventListener('click', () => {
    drawBackdropOptions();
    sounds?.onStart();
    sounds?.onFinish();
    dialog.showModal();
    drawPostcard();
  });
  for (const id of ['edit', 'close-photo']) $(id).addEventListener('click', () => dialog.close());

  async function savePostcard() {
    if (saving) return;
    saving = true;
    const save = $('save'), status = $('photo-status');
    const photo = $('postcard').firstElementChild;
    const count = photo.querySelectorAll('[data-character]').length;
    save.disabled = true;
    status.textContent = 'Preparando tu imagen…';
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(photo)], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = count === 3 ? 'Retrato de las tres muñecas.png' : 'Retrato de ' + count + ' personajes.png';
      link.click();
      status.textContent = 'El retrato del grupo está listo para guardar.';
    } catch {
      status.textContent = 'No se pudo guardar el retrato. Inténtalo otra vez.';
    } finally {
      URL.revokeObjectURL(url);
      save.disabled = false;
      saving = false;
    }
  }
  $('save').addEventListener('click', savePostcard);

  function snapshotGroup() {
    return {
      backdrop: selectedBackdrop,
      characters: characters.map(({ id, templateId, name: originalName }) => {
        const { name, look } = profiles.get(id);
        return { id, templateId, originalName, name,
          look: Object.fromEntries(Object.entries(look).filter(([, value]) => value != null)) };
      }),
    };
  }

  function hasStudioSave() {
    try { return Object.keys(localStorage).some(key => key.startsWith(storagePrefix)); }
    catch { return false; }
  }

  function restoreGroup(group, firstVisit = false) {
    return editCollection(() => {
      // A second tab may have saved a game while the published collection loaded.
      if (firstVisit && hasStudioSave()) return;
      const extra = group.characters.slice(originalGirls.length).map(({ id, templateId, originalName }) =>
        ({ id, templateId, name: originalName }));
      const changes = new Map(group.characters.map(({ id, name, look }) =>
        [storagePrefix + id, JSON.stringify({ name, look, nameVersion: 2 })]));
      for (const previous of readCreatedDolls()) {
        const key = storagePrefix + previous.id;
        if (!changes.has(key)) changes.set(key, null);
      }
      changes.set(backdropKey, group.backdrop);
      changes.set(rosterKey, JSON.stringify({ version: 2, dolls: extra }));

      // Keep the current collection intact if any storage write fails.
      const written = new Map();
      try {
        for (const [key, value] of changes) {
          const old = localStorage.getItem(key);
          if (old === value) continue;
          if (value === null) localStorage.removeItem(key);
          else localStorage.setItem(key, value);
          written.set(key, old);
        }
      } catch (error) {
        for (const [key, old] of [...written].reverse()) {
          if (old === null) localStorage.removeItem(key);
          else localStorage.setItem(key, old);
        }
        if (!firstVisit) throw error;
        // Browsers that block storage still open the published designs and can export them.
        rosterInMemory = true;
        selectedBackdrop = group.backdrop;
        for (const { id, name, look } of group.characters) {
          profiles.set(id, { name, look: { ...look } });
          histories.set(id, []);
        }
        refreshDolls(extra.map(character => ({ ...character, hair: templates.find(base => base.id === character.templateId).hair })));
        return;
      }
      rosterInMemory = false;
      selectedBackdrop = group.backdrop;
      profiles.clear();
      histories.clear();
      refreshDolls(readCreatedDolls());
    });
  }

  collectionFiles = window.MakeupCollections.connect({
    templates, originals: originalGirls, maxDolls, choices: availableChoices, backdrops: backdropChoices,
    cleanName, snapshot: snapshotGroup, restore: restoreGroup,
  });

  window.MakeupGame = {
    snapshotGroup,
    async enter(options) {
      sounds = options;
      startup ??= (async () => {
        if (!hasStudioSave()) await restoreGroup(await collectionFiles.publishedGroup(), true);
      })();
      await startup;
      if (!sounds) return;
      if (!rosterInMemory) {
        try {
          const saved = localStorage.getItem(backdropKey);
          selectedBackdrop = backdropChoices.find(([id]) => id === saved)?.[0] || backdropChoices[0][0];
        } catch { /* Keep the in-memory selection. */ }
      }
      refreshDolls(readCreatedDolls());
      drawTools();
      $('studio-layout').inert = false;
      $('studio-layout').setAttribute('aria-busy', 'false');
      collectionFiles.openShared();
      window.dispatchEvent(new Event("studio-ready"));
    },
    leave() {
      sounds = null;
      if (dialog.open) dialog.close();
      if (createDialog.open) createDialog.close();
      if ($('import-group-dialog').open) $('import-group-dialog').close();
    },
  };
})();
