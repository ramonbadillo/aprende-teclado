(() => {
  'use strict';

  const { characters, renderPortrait, renderStampPreview } = window.MakeupArt;
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
    accessory: {
      name: 'Accesorios', title: 'Elige un accesorio',
      choices: [
        ['Lentes', 'glasses'], ['Aretes', 'earrings'], ['Corona', 'crown'], ['Moño', 'bow'],
        ['Tiara de flores', 'tiara'], ['Pasador', 'clip'], ['Antifaz', 'mask'], ['Diadema', 'headband'],
      ],
    },
  };
  const sections = { makeup: ['lips', 'eyes', 'cheeks', 'stamp'], style: ['hair', 'dress', 'accessory'] };
  const accessoryFrames = {
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
  const profiles = new Map();
  const histories = new Map(characters.map(({ id }) => [id, []]));
  const lastTool = { makeup: 'lips', style: 'hair' };
  let doll = characters[0];
  let section = 'makeup';
  let tool = lastTool[section];
  let sounds = null;
  let saving = false;

  function cleanName(value) {
    if (typeof value !== 'string') return '';
    const text = value.replace(/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/gu, '').trim().replace(/\s+/gu, ' ');
    return Array.from(text).slice(0, 24).join('');
  }

  function loadProfile(character) {
    let record;
    try {
      record = JSON.parse(localStorage.getItem(storagePrefix + character.id));
    } catch { /* El estuche también funciona sin almacenamiento. */ }
    const look = {};
    for (const [key, product] of Object.entries(products)) {
      const value = record?.look?.[key];
      look[key] = value && product.choices.some(choice => choice[1] === value) ? value : null;
    }
    return { name: cleanName(record?.name) || character.name, look };
  }

  for (const character of characters) profiles.set(character.id, loadProfile(character));

  function writeChange(key, value) {
    const profile = profiles.get(doll.id);
    if (key === 'name') profile.name = value;
    else profile.look[key] = value;
    try {
      const saved = loadProfile(doll);
      if (key === 'name') saved.name = value;
      else saved.look[key] = value;
      localStorage.setItem(storagePrefix + doll.id, JSON.stringify(saved));
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

  for (const character of characters) {
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
    el.querySelector('.doll-art').innerHTML = renderPortrait(character.id, look, 'thumb', name);
  }

  function updatePressed(group, key, value) {
    for (const el of group.children) el.setAttribute('aria-pressed', String(el.dataset[key] === value));
  }

  function selectedValue() {
    const value = profiles.get(doll.id).look[tool];
    return value || (tool === 'hair' ? doll.hair : '');
  }

  function updateSelection() {
    const value = selectedValue();
    updatePressed(palette, 'value', value);
    $('clear-choice').disabled = !value;
  }

  function drawTools() {
    updatePressed($('sections'), 'section', section);
    tools.replaceChildren(...sections[section].map(key => {
      const name = products[key].name;
      const el = button(name, 'tool', 'tool', key);
      el.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#kit-' + key + '"/></svg>' + name;
      return el;
    }));
    drawPalette();
  }

  function stylePreview(sample, value) {
    const { name, look } = profiles.get(doll.id);
    const candidate = { ...look, [tool]: value || null };
    sample.className = 'style-preview';
    sample.innerHTML = renderPortrait(doll.id, candidate, 'option-' + (value || 'base'), name, tool === 'dress');
    const svg = sample.firstElementChild;
    // The dress uses the full-length drawing; hair and accessories use the close-up.
    let frame = '0 0 320 336';
    if (tool === 'dress') frame = '69 137 181 246';
    if (tool === 'accessory') frame = accessoryFrames[value];
    svg.setAttribute('viewBox', frame);
  }

  function drawPalette() {
    const product = products[tool];
    const styling = section === 'style';
    $('palette-title').textContent = product.title;
    const clear = $('clear-choice');
    clear.hidden = styling && tool !== 'accessory';
    clear.textContent = tool === 'accessory' ? 'Sin accesorio' : 'Quitar';
    clear.setAttribute('aria-label', tool === 'accessory' ? 'Sin accesorio' : 'Quitar ' + product.title.toLowerCase());
    palette.replaceChildren(...product.choices.map(([name, value]) => {
      const el = button(name, styling ? 'style-option' : 'swatch', 'value', value);
      const sample = document.createElement('span');
      sample.setAttribute('aria-hidden', 'true');
      if (styling) {
        stylePreview(sample, value);
      } else if (tool === 'stamp') {
        sample.className = 'stamp-mark';
        sample.innerHTML = renderStampPreview(value);
      } else {
        sample.style.setProperty('--swatch', value);
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
    $('portrait').innerHTML = renderPortrait(doll.id, look, 'mirror', name, full);
    $('portrait').firstElementChild.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    const features = Object.entries(look).filter(([, value]) => value).map(([key, value]) => {
      const product = products[key];
      const [label] = product.choices.find(choice => choice[1] === value);
      return product.name + ': ' + label;
    });
    $('portrait').setAttribute('aria-label', ['Retrato de ' + name, ...features].join('. '));
    $('mirror-name').textContent = name;
    $('undo').disabled = !histories.get(doll.id).length;
    updatePressed(dolls, 'doll', doll.id);
    updateSelection();
  }

  function flashTool() {
    const flash = $('tool-flash');
    flash.dataset.tool = tool;
    $('flash-icon').setAttribute('href', '#kit-' + tool);
    flash.classList.remove('paint');
    void flash.offsetWidth;
    flash.classList.add('paint');
  }

  dolls.addEventListener('click', event => {
    const el = event.target.closest('[data-doll]');
    if (!el || doll.id === el.dataset.doll) return;
    doll = characters.find(character => character.id === el.dataset.doll);
    const { name } = profiles.get(doll.id);
    $('doll-name').value = name;
    drawPalette();
    drawPortrait();
    $('studio-status').textContent = 'Ahora juegas con ' + name + '.';
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
    histories.get(doll.id).push({ key, previous });
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
      $('studio-status').textContent = 'Ahora tu muñeca se llama ' + name + '.';
    }
  });

  palette.addEventListener('click', event => {
    const el = event.target.closest('[data-value]');
    if (!el || el.dataset.value === selectedValue()) return;
    const value = tool === 'hair' && el.dataset.value === doll.hair ? null : el.dataset.value || null;
    if (!applyChange(tool, value)) return;
    if (value && section === 'makeup') flashTool();
    sounds?.onStamp();
    $('studio-status').textContent = el.getAttribute('aria-label') + ' en ' + profiles.get(doll.id).name + '.';
  });

  $('clear-choice').addEventListener('click', () => {
    if (!applyChange(tool, null)) return;
    sounds?.onStamp();
    $('studio-status').textContent = 'Se quitó la selección de ' + products[tool].name.toLowerCase() + '.';
  });

  $('undo').addEventListener('click', () => {
    const change = histories.get(doll.id).pop();
    if (!change) return;
    writeChange(change.key, change.previous);
    if (change.key === 'name') {
      $('doll-name').value = change.previous;
    } else {
      tool = change.key;
      section = sections.style.includes(tool) ? 'style' : 'makeup';
      lastTool[section] = tool;
    }
    drawThumbnail(doll);
    drawTools();
    drawPortrait();
    $('studio-status').textContent = 'Se deshizo el último cambio de ' + profiles.get(doll.id).name + '.';
  });

  function makePostcard() {
    const { name, look } = profiles.get(doll.id);
    const full = section === 'style' || Boolean(look.dress);
    const art = renderPortrait(doll.id, look, 'photo', name, full);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 400" width="720" height="800" aria-hidden="true">
      <rect width="360" height="400" rx="12" fill="#fff6e9"/>
      <rect x="10" y="10" width="340" height="380" rx="10" fill="none" stroke="#d7aaae" stroke-width="2"/>
      <rect x="21" y="21" width="318" height="309" rx="8" fill="#f2cfd3"/>
      <circle cx="180" cy="165" r="122" fill="#ffe5ce"/>
      <path d="m49 50 3 9 9 3-9 3-3 9-3-9-9-3 9-3zm253 39 3 10 10 3-10 3-3 10-3-10-10-3 10-3zm-19 191 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#ba8159"/>
      <svg x="30" y="23" width="300" height="307">${art}</svg>
      <text x="180" y="369" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-style="italic" fill="#79455e"></text>
      <path d="M28 360h25m254 0h25" stroke="#c8929e" stroke-width="1.5"/>
    </svg>`;
  }

  $('finish').addEventListener('click', () => {
    $('postcard').innerHTML = makePostcard();
    const caption = $('postcard').querySelector('text');
    caption.textContent = profiles.get(doll.id).name;
    $('postcard').setAttribute('aria-label', $('portrait').getAttribute('aria-label'));
    $('photo-status').textContent = '';
    sounds?.onStart();
    sounds?.onFinish();
    dialog.showModal();
    if (caption.getComputedTextLength() > 236) {
      caption.setAttribute('textLength', '236');
      caption.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
  });
  for (const id of ['edit', 'close-photo']) $(id).addEventListener('click', () => dialog.close());

  async function savePostcard() {
    if (saving) return;
    saving = true;
    const save = $('save'), status = $('photo-status');
    const photo = $('postcard').firstElementChild;
    const name = profiles.get(doll.id).name.replace(/[<>:"/\\|?*]/g, '-');
    save.disabled = true;
    status.textContent = 'Preparando tu imagen…';
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(photo)], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 800;
      canvas.getContext('2d').drawImage(img, 0, 0, 720, 800);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'Retrato de ' + name + '.png';
      link.click();
      status.textContent = 'Tu retrato está listo para guardar.';
    } catch {
      status.textContent = 'No se pudo guardar el retrato. Inténtalo otra vez.';
    } finally {
      URL.revokeObjectURL(url);
      save.disabled = false;
      saving = false;
    }
  }
  $('save').addEventListener('click', savePostcard);

  window.MakeupGame = {
    enter(options) {
      sounds = options;
      $('doll-name').value = profiles.get(doll.id).name;
      drawTools();
      drawPortrait();
    },
    leave() {
      sounds = null;
      if (dialog.open) dialog.close();
    },
  };
})();
