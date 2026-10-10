'use strict';
window.ClayGame = (() => {
  const $ = id => document.getElementById(id);
  const defaults = ['ROSAS', 'DIBUJOS', 'JUGUETES', 'PAPA', 'MAMA', 'SILLA', 'COMPUTADORA', 'PEPE', 'LEGO', 'FLORES'];
  const storageKey = 'fabi-clay-words-v1';
  const alphabet = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
  const difficulties = { easy: { label: 'Fácil', count: 20 }, medium: { label: 'Mediano', count: 32 }, hard: { label: 'Difícil', count: 48 } };
  let difficulty = 'medium';
  const normalize = letter => letter.toUpperCase().normalize('NFC').replace(/[ÁÀÄ]/g, 'A').replace(/[ÉÈË]/g, 'E').replace(/[ÍÌÏ]/g, 'I').replace(/[ÓÒÖ]/g, 'O').replace(/[ÚÙÜ]/g, 'U');
  let words = defaults.slice(), index = 0, active = false, stamped = [], buttons = [], onStamp = () => {};
  const bunny = $('clay-bunny');
  function stopCelebrating() { bunny.classList.remove('is-celebrating'); }
  bunny.addEventListener('animationend', event => { if (event.animationName === 'clay-bunny-hop') stopCelebrating(); });
  window.addEventListener('blur', stopCelebrating);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopCelebrating(); });
  function parse(text) {
    const list = [...new Set(text.toUpperCase().normalize('NFC').split(/[,;\n]+/).map(word => word.trim()).filter(Boolean))];
    return list.length && list.length <= 30 && list.every(word => /^[A-ZÑÁÉÍÓÚÜ]{2,12}$/.test(word)) ? list : null;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) words = parse(saved) || words;
  } catch { /* El taller también funciona sin almacenamiento. */ }
  $('clay-list').value = words.join(', ').toLowerCase();
  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
  function renderWord() {
    const word = words[index];
    $('clay-word').replaceChildren(...[...word].map((letter, i) => {
      const slot = document.createElement('span');
      slot.className = 'clay-imprint' + (stamped[i] ? ' is-stamped' : '');
      slot.textContent = stamped[i] || $('clay-guide').checked ? letter : '·';
      slot.setAttribute('aria-hidden', 'true');
      return slot;
    }));
    $('clay-word').classList.toggle('clay-long-word', word.length > 8);
    const count = stamped.filter(Boolean).length;
    $('clay-word').setAttribute('aria-label', $('clay-guide').checked ? `Molde de ${word}. ${count} de ${word.length} letras estampadas.` : `Palabra: ${[...word].map((letter, i) => stamped[i] ? letter : 'espacio').join(', ')}.`);
    $('clay-progress').textContent = `${count} de ${word.length} huellitas`;
  }
  function startWord() {
    stopCelebrating(); bunny.classList.remove('is-happy');
    bunny.setAttribute('aria-label', 'Un conejito de plastilina te acompaña');
    $('clay-bunny-message').textContent = '¡Vamos, tú puedes!';
    const word = words[index];
    stamped = Array(word.length).fill(false);
    $('clay-dough').classList.remove('is-complete');
    $('clay-cue').textContent = 'TU PALABRA DE PLASTILINA';
    $('clay-round').textContent = `Palabra ${index + 1} de ${words.length}`;
    $('clay-status').textContent = 'Busca cualquier letra de la palabra. ¡Tú eliges por dónde empezar!';
    $('clay-next').hidden = true;
    $('clay-hint').disabled = false;
    $('clay-next').textContent = index === words.length - 1 ? 'Volver a jugar ↻' : 'Siguiente palabra →';
    renderLetters();
    renderWord();
  }
  function renderLetters() {
    const letters = [...words[index]].map((letter, i) => ({ letter: normalize(letter), used: stamped[i] }));
    const distractors = alphabet.filter(letter => !letters.some(tile => tile.letter === letter));
    const extras = [];
    // Refill a shuffled alphabet so larger boards reach their exact size.
    while (extras.length < difficulties[difficulty].count - letters.length) {
      for (const letter of shuffle([...distractors])) {
        extras.push({ letter, used: false });
        if (extras.length === difficulties[difficulty].count - letters.length) break;
      }
    }
    const scattered = shuffle([...letters, ...extras]);
    $('clay-letters-top').replaceChildren(); $('clay-letters-bottom').replaceChildren();
    buttons = scattered.map(({ letter, used }, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'clay-letter' + (used ? ' is-used' : ''); button.textContent = letter;
      button.dataset.letter = letter;
      button.setAttribute('aria-label', `Letra ${letter}${used ? ', estampada' : ''}`);
      button.setAttribute('aria-disabled', String(used));
      button.style.setProperty('--turn', `${Math.round(Math.random() * 24 - 12)}deg`);
      button.style.setProperty('--drift', `${Math.round(Math.random() * 14 - 7)}px`);
      button.style.setProperty('--tile', ['#f6bd61', '#f3a7a2', '#9bccc0', '#bba6df', '#95c8e1'][i % 5]);
      button.addEventListener('click', () => select(letter, button));
      $(i < Math.ceil(scattered.length / 2) ? 'clay-letters-top' : 'clay-letters-bottom').append(button);
      return button;
    });
  }
  document.querySelectorAll('[data-clay-difficulty]').forEach(control => control.addEventListener('click', () => {
    if (!active || control.dataset.clayDifficulty === difficulty) return;
    difficulty = control.dataset.clayDifficulty;
    document.querySelectorAll('[data-clay-difficulty]').forEach(button => button.setAttribute('aria-pressed', String(button === control)));
    renderLetters();
    $('clay-status').textContent = `Nivel ${difficulties[difficulty].label}: ${difficulties[difficulty].count} letras. ${stamped.every(Boolean) ? '¡Tu palabra está completa! Puedes pasar a la siguiente.' : '¡Tus huellitas siguen aquí! Busca las que faltan.'}`;
  }));
  function select(letter, chosen) {
    if (!active || stamped.every(Boolean) || chosen?.getAttribute('aria-disabled') === 'true') return;
    const position = [...words[index]].findIndex((char, i) => normalize(char) === letter && !stamped[i]);
    if (position < 0) {
      $('clay-status').textContent = `La ${letter} no hace falta ahora. Prueba otra, ¡tú puedes!`;
      return;
    }
    const tile = chosen || buttons.find(button => button.dataset.letter === letter && button.getAttribute('aria-disabled') !== 'true');
    if (!tile) return;
    tile.setAttribute('aria-disabled', 'true'); tile.classList.add('is-used');
    tile.setAttribute('aria-label', `Letra ${letter}, estampada`);
    buttons.forEach(button => button.classList.remove('is-hint'));
    stamped[position] = true;
    renderWord();
    $('clay-word').children[position].classList.add('just-stamped');
    onStamp();
    if (!stamped.every(Boolean)) {
      $('clay-status').textContent = `¡La ${words[index][position]} dejó su huella! Sigue buscando.`;
      return;
    }
    $('clay-dough').classList.add('is-complete');
    bunny.classList.add('is-happy', 'is-celebrating');
    bunny.setAttribute('aria-label', `El conejito de plastilina celebra: completaste ${words[index]}`);
    $('clay-bunny-message').textContent = index === words.length - 1 ? '¡Lo lograste! ♥' : '¡Bravo, lo hiciste!';
    $('clay-cue').textContent = '✦ ¡PALABRA COMPLETA! ✦';
    $('clay-status').textContent = index === words.length - 1 ? '¡Completaste tu colección! Todas tus palabras dejaron huella.' : `¡Formaste ${words[index]}! Una palabra más en tu colección.`;
    $('clay-next').hidden = false; $('clay-hint').disabled = true;
    const keepsake = document.createElement('span');
    keepsake.className = 'clay-keepsake'; keepsake.textContent = words[index];
    keepsake.dataset.color = $('clay-dough').dataset.color;
    $('clay-gallery').append(keepsake);
    $('clay-total').textContent = String(index + 1); $('clay-empty').hidden = true;
  }
  function keydown(event) {
    if (!active || event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]') || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const letter = normalize(event.key);
    if (!/^[A-ZÑ]$/.test(letter)) return;
    event.preventDefault(); select(letter);
  }
  $('clay-guide').addEventListener('change', renderWord);
  $('clay-hint').addEventListener('click', () => {
    if (!active || stamped.every(Boolean)) return;
    const letter = normalize(words[index][stamped.indexOf(false)]);
    const button = buttons.find(tile => tile.dataset.letter === letter && tile.getAttribute('aria-disabled') !== 'true');
    button.classList.add('is-hint');
    $('clay-status').textContent = `Busca la ${letter}. La marcamos con una estrella para ti.`;
  });
  function resetCollection() {
    index = 0; $('clay-gallery').replaceChildren(); $('clay-total').textContent = '0'; $('clay-empty').hidden = false;
  }
  $('clay-next').addEventListener('click', () => {
    if (!active || !stamped.every(Boolean)) return;
    if (index === words.length - 1) resetCollection(); else index++;
    startWord(); $('clay-title').focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-clay-color]').forEach(button => button.addEventListener('click', () => {
    $('clay-dough').dataset.color = button.dataset.clayColor;
    document.querySelectorAll('[data-clay-color]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
  }));
  $('clay-form').addEventListener('submit', event => {
    event.preventDefault();
    const list = parse($('clay-list').value);
    $('clay-list').setAttribute('aria-invalid', String(!list));
    if (!list) {
      $('clay-list-error').textContent = 'Usa de 1 a 30 palabras de 2 a 12 letras, sin números ni espacios dentro de cada palabra.';
      return;
    }
    words = list; resetCollection(); startWord();
    $('clay-list-error').textContent = '';
    let saved = true;
    try { localStorage.setItem(storageKey, words.join(',')); } catch { saved = false; }
    $('clay-status').textContent = saved ? '¡Tu lista está lista! Vamos a dejar huellas.' : 'Tu lista está lista para jugar. Este navegador no pudo guardarla para después.';
    $('clay-form').closest('details').open = false;
    $('clay-title').focus({ preventScroll: true });
  });
  return {
    enter(options = {}) {
      active = true; onStamp = options.onStamp || (() => {});
      if (!buttons.length) startWord();
      document.addEventListener('keydown', keydown);
    },
    leave() { active = false; stopCelebrating(); document.removeEventListener('keydown', keydown); }
  };
})();
