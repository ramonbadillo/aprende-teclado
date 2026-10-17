'use strict';
(() => {
  const $ = id => document.getElementById(`numbers-${id}`);
  const root = $('title').closest('section');
  const values = [100, 10, 1];
  const names = { 100: 'centenas', 10: 'decenas', 1: 'unidades' };
  const empty = () => ({ 100: 0, 10: 0, 1: 0 });
  const total = cards => values.reduce((sum, value) => sum + value * cards[value], 0);
  const digits = number => ({ 100: Math.floor(number / 100), 10: Math.floor(number / 10) % 10, 1: number % 10 });
  let state, history = [], drag = null, callbacks = {}, active = false;
  const difficulties = {
    easy: { min: 2, max: 20 },
    medium: { min: 21, max: 99 },
    hard: { min: 100, max: 999 }
  };
  const chosenDifficulty = { add: 'easy', subtract: 'easy' };
  function randomOperation(mode) {
    const { min, max } = difficulties[chosenDifficulty[mode]];
    const size = min + Math.floor(Math.random() * (max - min + 1));
    let a = mode === 'add' ? 1 + Math.floor(Math.random() * (size - 1)) : size;
    let b = mode === 'add' ? size - a : 1 + Math.floor(Math.random() * (a - 1));
    if (state?.mode === mode && a === state.a && b === state.b) {
      if (mode === 'add') {
        if (size === 2) b = 2;
        else { a = a % (size - 1) + 1; b = size - a; }
      } else if (a === 2) a = 3;
      else b = b % (a - 1) + 1;
    }
    reset(mode, a, b);
  }
  const say = message => { $('status').textContent = message; };
  const result = () => state.mode === 'add' ? state.a + state.b : state.a - state.b;
  const rowsReady = () => total(state.rows[0]) === state.a && (state.mode === 'subtract' || total(state.rows[1]) === state.b);
  function prepareSubtraction() {
    // Prepare enough small cards to remove the remaining amount, including loans through zero tens.
    const cards = digits(total(state.rows[0]));
    const needed = digits(state.b - total(state.removed));
    if (cards[1] < needed[1]) {
      if (cards[10] === 0) { cards[100]--; cards[10] += 10; }
      cards[10]--; cards[1] += 10;
    }
    if (cards[10] < needed[10]) { cards[100]--; cards[10] += 10; }
    state.rows[0] = cards;
  }
  function save() { history.push(JSON.stringify(state)); if (history.length > 100) history.shift(); }
  function reset(mode = state?.mode || 'add', a = state?.a ?? 15, b = state?.b ?? 25) {
    cancelDrag();
    state = { mode, a, b, phase: 'build', rows: [empty(), empty()], removed: empty(), done: false };
    history = [];
    $('a').value = a; $('b').value = b; $('answer').value = ''; $('error').textContent = '';
    render(); say('Arrastra una tarjeta hasta su columna. Cada tarjeta tiene su propio valor.');
  }
  function card(value, source, row = 0, index = 0) {
    return `<button class="number-card" data-value="${value}" data-source="${source}" data-row="${row}" data-index="${index}" aria-label="Tarjeta de ${value}${source === 'removed' ? ', retirada; arrastra para devolver' : ', fila ' + (row + 1)}" tabindex="-1" ${state.done ? 'disabled' : ''}>${value}</button>`;
  }
  function render() {
    root.dataset.done = String(state.done);
    const build = state.phase === 'build', add = state.mode === 'add';
    $('problem').textContent = `${state.a} ${add ? '+' : '−'} ${state.b} = ${state.done ? result() : '?'}`;
    $('sign').textContent = add ? '+' : '−';
    root.querySelectorAll('[data-difficulty]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.difficulty === chosenDifficulty[state.mode]));
    });
    const { min, max } = difficulties[chosenDifficulty[state.mode]];
    $('difficulty-note').textContent = add
      ? `Sumas al azar con resultados de ${min} a ${max}.`
      : `Restas al azar con un primer número de ${min} a ${max}.`;
    root.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
    $('step-2').hidden = add;
    $('step-2').textContent = '2. Quita';
    $('step-3').textContent = add ? '2. Cuenta' : '3. Cuenta';
    const step = build ? 1 : state.phase === 'solve' ? 2 : 3;
    [1, 2, 3].forEach(n => { if (n === step) $(`step-${n}`).setAttribute('aria-current', 'step'); else $(`step-${n}`).removeAttribute('aria-current'); });
    $('instruction').textContent = state.done ? '¡Lo descubriste! Tus tarjetas muestran el resultado.' : build ? (add ? `Forma el ${state.a} en la primera fila y el ${state.b} en la segunda.` : `Primero forma el ${state.a}. Después quitaremos ${state.b}.`) : state.phase === 'answer' ? 'Cuenta las tarjetas del tablero y escribe el resultado.' : `Arrastra a «Quitar tarjetas» lo que vas restando, hasta quitar ${state.b}.`;
    const shown = build && add ? [0, 1] : [0];
    $('rows').innerHTML = shown.map(row => {
      const target = row === 0 ? state.a : state.b;
      const label = build ? `Forma el <b>${target}</b>` : state.done ? 'Tu resultado' : add ? 'Todas juntas' : 'Lo que queda';
      return `<div class="numbers-row"><div class="numbers-row-label"><div>${label}</div><span>${build ? `Llevas ${total(state.rows[row])} de ${target}` : 'Cada tarjeta cuenta'}</span></div><div class="numbers-cells">${values.map(value => `<div class="number-cell" data-drop="cell" data-row="${row}" data-value="${value}" role="group" aria-label="${names[value]}, ${build ? 'formar ' + target : 'resultado'}. ${state.rows[row][value]} tarjetas." aria-describedby="numbers-instruction">${Array.from({ length: state.rows[row][value] }, (_, index) => card(value, 'board', row, index)).join('')}</div>`).join('')}</div></div>`;
    }).join('');
    $('bank').hidden = !build;
    $('removed').hidden = build || add;
    $('removed-count').textContent = `Has quitado ${total(state.removed)} de ${state.b}.`;
    $('removed-cards').innerHTML = values.map(value => Array.from({ length: state.removed[value] }, (_, index) => card(value, 'removed', 0, index)).join('')).join('');
    $('continue').hidden = state.phase === 'answer';
    $('continue').textContent = build ? (add ? 'Contar el resultado →' : 'Ahora vamos a quitar →') : 'Ya conté mis tarjetas →';
    $('continue').disabled = build ? !rowsReady() : (!add && total(state.removed) !== state.b);
    $('example').hidden = !build;
    $('undo').disabled = !history.length;
    $('answer-form').hidden = state.phase !== 'answer' || state.done;
  }
  function transact(change, message) {
    save();
    if (state.phase === 'answer') state.phase = 'solve';
    change(); state.done = false;
    if (state.phase === 'solve' && state.mode === 'subtract') prepareSubtraction();
    $('answer').value = ''; render(); say(message); callbacks.onCorrect?.();
  }
  function place(target, item) {
    if (!item || !target || state.done) return;
    const { source, value, row } = item;
    const dest = target.dataset.drop;
    if (source === 'board' && state.rows[row][value] < 1 || source === 'removed' && state.removed[value] < 1) return;
    if (dest === 'cell') {
      const toRow = Number(target.dataset.row), toValue = Number(target.dataset.value);
      if (value !== toValue) { say(`Esta tarjeta vale ${value}. Colócala en ${names[value]}.`); return; }
      if (state.phase === 'build') {
        if (source === 'board' && row === toRow) return;
        if (!['bank', 'board'].includes(source)) return;
        const limit = toRow === 0 ? state.a : state.b;
        if (total(state.rows[toRow]) + value > limit) { say(`Con esa tarjeta te pasarías de ${limit}. Prueba una tarjeta de menor valor.`); return; }
        transact(() => { if (source === 'board') state.rows[row][value]--; state.rows[toRow][value]++; }, `Añadiste ${value}. Sigue formando el número.`);
      } else if (source === 'removed') {
        transact(() => { state.removed[value]--; state.rows[0][value]++; }, `Devolviste ${value} al tablero.`);
      }
    } else if (dest === 'bank' && source === 'board' && state.phase === 'build') {
      transact(() => state.rows[row][value]--, `Devolviste una tarjeta de ${value}. Puedes intentarlo otra vez.`);
    } else if (dest === 'removed' && source === 'board' && state.mode === 'subtract' && state.phase !== 'build') {
      if (total(state.removed) + value > state.b) { say(`Solo necesitamos quitar ${state.b}. Elige una tarjeta de menor valor.`); return; }
      transact(() => { state.rows[0][value]--; state.removed[value]++; }, `Quitaste ${value}. Llevas ${total(state.removed) + value} de ${state.b}.`);
    }
  }
  function cancelDrag() {
    if (drag?.frame) cancelAnimationFrame(drag.frame);
    drag?.ghost?.remove(); drag = null;
    root.querySelectorAll('.numbers-drop-active').forEach(el => el.classList.remove('numbers-drop-active'));
  }
  root.addEventListener('pointerdown', event => {
    const tile = event.target.closest('.number-card');
    if (!active || !tile || tile.disabled || event.button !== 0) return;
    cancelDrag();
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, tile, item: { source: tile.dataset.source, value: Number(tile.dataset.value), row: Number(tile.dataset.row || 0), index: Number(tile.dataset.index || 0) }, ghost: null };
    tile.setPointerCapture(event.pointerId);
  });
  function trackDrop() {
    if (!drag?.ghost) return;
    root.querySelectorAll('.numbers-drop-active').forEach(el => el.classList.remove('numbers-drop-active'));
    document.elementFromPoint(drag.pointerX, drag.pointerY)?.closest('[data-drop]')?.classList.add('numbers-drop-active');
  }
  function scrollWhileDragging() {
    if (!drag?.ghost) return;
    const edge = 70;
    const offset = drag.pointerY < edge ? -10 : drag.pointerY > innerHeight - edge ? 10 : 0;
    if (offset) { window.scrollBy(0, offset); trackDrop(); }
    drag.frame = requestAnimationFrame(scrollWhileDragging);
  }
  root.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
    drag.pointerX = event.clientX; drag.pointerY = event.clientY;
    if (!drag.ghost) {
      drag.ghost = document.createElement('div'); drag.ghost.className = 'number-card numbers-drag-ghost';
      drag.ghost.dataset.value = drag.item.value; drag.ghost.textContent = drag.item.value;
      drag.ghost.setAttribute('aria-hidden', 'true'); document.body.append(drag.ghost);
      drag.frame = requestAnimationFrame(scrollWhileDragging);
    }
    drag.ghost.style.left = `${event.clientX}px`; drag.ghost.style.top = `${event.clientY}px`;
    trackDrop();
  });
  root.addEventListener('pointerup', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const { item, ghost } = drag;
    if (ghost) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-drop]');
      cancelDrag(); place(target, item);
    } else cancelDrag();
  });
  root.addEventListener('pointercancel', cancelDrag);
  root.addEventListener('lostpointercapture', cancelDrag);
  window.addEventListener('blur', cancelDrag);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelDrag(); });
  root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mode === state.mode) return;
    randomOperation(button.dataset.mode);
  }));
  root.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => {
    const difficulty = button.dataset.difficulty;
    if (chosenDifficulty[state.mode] === difficulty) return;
    chosenDifficulty[state.mode] = difficulty;
    randomOperation(state.mode);
  }));
  $('operation').addEventListener('submit', event => {
    event.preventDefault();
    const a = Number($('a').value), b = Number($('b').value);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > 999 || b > 999) { $('error').textContent = 'Escribe dos números enteros del 0 al 999.'; return; }
    if (state.mode === 'add' && a + b > 999) { $('error').textContent = 'El resultado debe ser menor que 1000 para caber en el tablero.'; return; }
    if (state.mode === 'subtract' && a < b) { $('error').textContent = 'Pon primero el número mayor. Así podremos quitar las tarjetas.'; return; }
    reset(state.mode, a, b); root.querySelector('details').open = false;
  });
  $('example').addEventListener('click', () => {
    transact(() => { state.rows = [digits(state.a), state.mode === 'add' ? digits(state.b) : empty()]; }, 'Así se forman los números. Cuenta cuánto vale cada grupo de tarjetas.');
  });
  $('continue').addEventListener('click', () => {
    if (state.phase === 'build' && rowsReady()) {
      const add = state.mode === 'add';
      transact(() => {
        if (add) {
          state.rows = [digits(total(state.rows[0]) + total(state.rows[1])), empty()];
          state.phase = 'answer';
        } else state.phase = 'solve';
      }, add ? 'Las tarjetas ya están juntas. Cuenta y escribe el resultado.' : `Las tarjetas están listas. Arrastra las que necesitas quitar hasta completar ${state.b}.`);
      if (add) $('answer').focus();
    } else if (state.phase === 'solve' && total(state.removed) === state.b) {
      save(); state.rows[0] = digits(total(state.rows[0])); state.phase = 'answer';
      render(); say('Cuenta centenas, decenas y unidades. ¿Qué número formaste?'); $('answer').focus();
    }
  });
  $('answer-form').addEventListener('submit', event => {
    event.preventDefault();
    if (state.phase !== 'answer' || state.done) return;
    const answer = Number($('answer').value);
    if (answer !== result()) { say('Vamos a contar otra vez: cada centena vale 100, cada decena 10 y cada unidad 1.'); $('answer').select(); return; }
    save(); state.done = true; render(); say(`¡Lo lograste! ${state.a} ${state.mode === 'add' ? 'más' : 'menos'} ${state.b} es ${answer}.`); callbacks.onCorrect?.(); $('next').focus();
  });
  $('undo').addEventListener('click', () => { if (!history.length) return; cancelDrag(); state = JSON.parse(history.pop()); $('answer').value = ''; render(); say('Deshicimos el último paso. Puedes volver a intentarlo.'); });
  $('reset').addEventListener('click', () => reset());
  $('next').addEventListener('click', () => randomOperation(state.mode));
  window.NumbersGame = {
    enter(options = {}) { callbacks = options; active = true; if (!state) randomOperation('add'); },
    leave() { active = false; cancelDrag(); }
  };
})();
