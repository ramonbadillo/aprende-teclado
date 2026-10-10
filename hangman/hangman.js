'use strict';
window.HangmanGame = (() => {
  const $ = id => document.getElementById(id);
  const classmatesCategory = 'Compañeritos de Fabi';
  const classmates = ['MARIANO', 'ISABELA', 'JADE', 'CAMI', 'SARAH', 'FARAH', 'FABIAN', 'SOFI MACIAS', 'SOFI MONGALO'];
  const words = [
    ...classmates.map(name => [name, classmatesCategory, name.includes(' ') ? 'Nombre y apellido de una compañerita de Fabi.' : 'Un nombre del grupo de Fabi.']),
    ['GATO', 'Animales', 'Dice miau y tiene bigotes.'],
    ['PERRO', 'Animales', 'Mueve la cola y dice guau.'],
    ['CONEJO', 'Animales', 'Tiene orejas largas y le gusta saltar.'],
    ['RANA', 'Animales', 'Salta cerca del agua y dice croac.'],
    ['PATO', 'Animales', 'Tiene pico y nada en el estanque.'],
    ['ABEJA', 'Animales', 'Visita las flores y hace miel.'],
    ['LUNA', 'Naturaleza', 'La puedes ver en el cielo de noche.'],
    ['SOL', 'Naturaleza', 'Nos da luz y calor durante el día.'],
    ['FLOR', 'Naturaleza', 'Tiene pétalos de muchos colores.'],
    ['NUBE', 'Naturaleza', 'Flota en el cielo y a veces trae lluvia.'],
    ['ARBOL', 'Naturaleza', 'Tiene tronco, ramas y hojas.'],
    ['PLAYA', 'Naturaleza', 'Hay arena y puedes ver las olas.'],
    ['MANZANA', 'Comida', 'Una fruta crujiente, roja o verde.'],
    ['PIÑA', 'Comida', 'Una fruta tropical con una corona de hojas.'],
    ['PAN', 'Comida', 'Lo preparan en la panadería.'],
    ['QUESO', 'Comida', 'Se hace con leche y queda rico en una quesadilla.'],
    ['SOPA', 'Comida', 'La comes con cuchara y puede llevar fideos.'],
    ['UVA', 'Comida', 'Una fruta pequeña que crece en racimos.'],
    ['PELOTA', 'En casa', 'Es redonda y puedes jugar a lanzarla.'],
    ['LIBRO', 'En casa', 'Tiene páginas e historias para leer.'],
    ['CAMA', 'En casa', 'Es donde te acuestas a dormir.'],
    ['LAPIZ', 'En casa', 'Sirve para escribir y se puede borrar.'],
    ['PIANO', 'Música', 'Tiene teclas blancas y negras para hacer música.'],
    ['TAMBOR', 'Música', 'Suena al golpearlo: ¡pum, pum!']
  ];
  const spelling = { ARBOL: 'ÁRBOL', LAPIZ: 'LÁPIZ' };
  const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  const buttons = new Map();
  const categoryButtons = new Map();
  let category = 'Todas';
  const cheer = $('hangman-cheer');
  cheer.volume = .275;
  let sound = true, celebrationTimer = null;
  let active = false, current = null, bag = [], guessed = new Set(), mistakes = 0, hintUsed = false;
  let onCorrect = () => {};
  const won = () => [...current[0]].every(letter => letter === ' ' || guessed.has(letter));
  const finished = () => mistakes === 6 || won();
  const normalize = letter => letter.toUpperCase().normalize('NFC').replace(/[ÁÀÄÂ]/g, 'A').replace(/[ÉÈËÊ]/g, 'E').replace(/[ÍÌÏÎ]/g, 'I').replace(/[ÓÒÖÔ]/g, 'O').replace(/[ÚÙÜÛ]/g, 'U');

  for (const [name, emoji] of [['Todas', '🌈'], ['Animales', '🐾'], ['Naturaleza', '🌿'], ['Comida', '🍎'], ['En casa', '🏠'], ['Música', '🎵'], [classmatesCategory, '🧒']]) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'hangman-category-button'; button.dataset.category = name;
    button.setAttribute('aria-pressed', String(name === category));
    const icon = document.createElement('span'); icon.textContent = emoji; icon.setAttribute('aria-hidden', 'true');
    button.append(icon, ` ${name}`);
    button.addEventListener('click', () => {
      if (!active || category === name) return;
      category = name; bag = [];
      for (const [value, control] of categoryButtons) control.setAttribute('aria-pressed', String(value === category));
      nextWord();
    });
    categoryButtons.set(name, button); $('hangman-categories').append(button);
  }
  for (const row of ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']) {
    const container = document.createElement('div'); container.className = 'hangman-key-row';
    for (const letter of row) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'hangman-key'; button.dataset.letter = letter;
      button.textContent = letter;
      button.addEventListener('click', () => guess(letter));
      container.append(button); buttons.set(letter, button);
    }
    $('hangman-keyboard').append(container);
  }
  for (let i = 0; i < 6; i++) { const dot = document.createElement('span'); $('hangman-lives').append(dot); }

  function stopCelebration() {
    clearTimeout(celebrationTimer); celebrationTimer = null;
    $('hangman-celebration').hidden = true;
    $('hangman-celebration').replaceChildren();
    cheer.pause();
    try { cheer.currentTime = 0; } catch { /* Audio may still be loading. */ }
  }
  function celebrate() {
    stopCelebration();
    const emojis = ['🎉', '🥳', '🎊', '⭐', '🙌', '🌟'];
    for (let i = 0; i < 18; i++) {
      const emoji = document.createElement('span');
      emoji.textContent = emojis[i % emojis.length];
      emoji.style.setProperty('--left', `${6 + (i % 9) * 11}%`);
      emoji.style.setProperty('--delay', `${Math.floor(i / 9) * .3 + (i % 3) * .09}s`);
      emoji.style.setProperty('--turn', `${i % 2 ? 25 : -25}deg`);
      emoji.style.setProperty('--row', `${35 + Math.floor(i / 9) * 20}%`);
      $('hangman-celebration').append(emoji);
    }
    $('hangman-celebration').hidden = false;
    celebrationTimer = setTimeout(stopCelebration, 3800);
    if (sound) {
      try { cheer.play().catch(() => {}); } catch { /* The visual celebration works without audio. */ }
    }
  }

  function render(message) {
    const done = finished(), victory = won();
    $('hangman').dataset.state = done ? (victory ? 'won' : 'lost') : 'playing';
    $('hangman-category').textContent = current[1];
    $('hangman-clue').textContent = current[2];
    $('hangman-attempts').textContent = `Te ${6 - mistakes === 1 ? 'queda 1 intento' : `quedan ${6 - mistakes} intentos`}`;
    [...$('hangman-lives').children].forEach((dot, i) => dot.classList.toggle('used', i < mistakes));
    document.querySelectorAll('.hangman-part').forEach((part, i) => part.classList.toggle('visible', i < mistakes));
    $('hangman-word').replaceChildren();
    const visibleWord = spelling[current[0]] || current[0];
    current[0].split(' ').forEach((part, partIndex) => {
      const group = document.createElement('span'); group.className = 'hangman-word-group';
      group.setAttribute('aria-hidden', 'true');
      [...part].forEach((letter, i) => {
        const tile = document.createElement('span');
        tile.textContent = guessed.has(letter) || done ? visibleWord.split(' ')[partIndex][i] : '';
        tile.className = `hangman-letter${done && !guessed.has(letter) ? ' revealed' : ''}`;
        group.append(tile);
      });
      $('hangman-word').append(group);
    });
    const progress = [...current[0]].map((letter, i) => letter === ' ' ? 'espacio' : guessed.has(letter) || done ? visibleWord[i] : 'guion').join(', ');
    const subject = current[1] === classmatesCategory ? 'Nombre' : 'Palabra';
    $('hangman-word').setAttribute('aria-label', `${subject} de ${current[0].replace(/ /g, '').length} letras: ${progress}`);
    for (const [letter, button] of buttons) {
      const used = guessed.has(letter), correct = current[0].includes(letter);
      button.classList.toggle('correct', used && correct); button.classList.toggle('incorrect', used && !correct);
      // Keep used keys focusable so touch and keyboard focus stay in place.
      button.setAttribute('aria-disabled', String(used || done));
      button.setAttribute('aria-label', `${letter}${used ? (correct ? ', está en la palabra' : ', no está en la palabra') : ''}`);
    }
    $('hangman-hint').disabled = hintUsed || done;
    $('hangman-hint').textContent = hintUsed ? '✦ Letra de regalo usada' : '✦ Regálame una letra';
    $('hangman-next').textContent = done ? 'Jugar otra vez →' : 'Otra palabra →';
    $('hangman-status').textContent = done
      ? victory ? `¡Lo descubriste! ${subject === 'Nombre' ? 'El nombre' : 'La palabra'} es ${visibleWord}.` : `${subject === 'Nombre' ? 'El nombre' : 'La palabra'} era ${visibleWord}. ¡Vamos con otra!`
      : message;
    if (!done) {
      const announcement = document.createElement('span');
      announcement.className = 'hangman-sr-only'; announcement.textContent = ` Palabra: ${progress}.`;
      $('hangman-status').append(announcement);
    }
  }
  function nextWord() {
    if (!active) return;
    stopCelebration();
    if (!bag.length) {
      bag = words.filter(item => category === 'Todas' || item[1] === category);
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (bag.at(-1) === current) [bag[0], bag[bag.length - 1]] = [bag.at(-1), bag[0]];
    }
    current = bag.pop(); guessed = new Set(); mistakes = 0; hintUsed = false;
    render(`¡Elige tu primera letra! ${current[0].includes(' ') ? 'El espacio ya está puesto.' : ''}`.trim());
  }
  function guess(letter, gift = false) {
    if (!active || !current || finished() || guessed.has(letter) || !alphabet.includes(letter) || letter.length !== 1) return;
    guessed.add(letter);
    const correct = current[0].includes(letter);
    if (!correct) mistakes++;
    render(gift ? `Te regalamos la ${letter}.` : correct ? `¡Bien! La ${letter} está en la palabra.` : `La ${letter} no está. Te quedan ${6 - mistakes} intentos.`);
    if (correct) {
      if (won()) celebrate();
      else onCorrect(false);
    }
  }
  document.addEventListener('keydown', event => {
    if (!active || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
    const letter = normalize(event.key);
    if (letter.length !== 1 || !alphabet.includes(letter)) return;
    event.preventDefault(); guess(letter);
  });
  $('hangman-next').addEventListener('click', nextWord);
  $('hangman-hint').addEventListener('click', () => {
    if (!active || !current || hintUsed || finished()) return;
    hintUsed = true; guess([...current[0]].find(letter => letter !== ' ' && !guessed.has(letter)), true);
  });
  window.addEventListener('blur', stopCelebration);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopCelebration(); });
  return {
    enter({ onCorrect: callback = () => {}, sound: enabled = true } = {}) {
      active = true; onCorrect = callback; sound = enabled; cheer.muted = !sound;
      if (!current) nextWord();
    },
    leave() { active = false; stopCelebration(); },
    setSound(enabled) { sound = enabled; cheer.muted = !sound; if (!sound) stopCelebration(); }
  };
})();
