'use strict';
window.Soni = window.Soni || {};

// Physical codes keep Shift, accents and simultaneous modifiers predictable.
Soni.keyboardRows = [
  [['Escape', 'Esc'], ...Array.from({ length: 12 }, (_, i) => [`F${i + 1}`, `F${i + 1}`])],
  [['Backquote', 'º'], ...[...'1234567890'].map(n => [`Digit${n}`, n]), ['Minus', '−'], ['Equal', '+'], ['Backspace', '⌫', 2]],
  [['Tab', 'Tab', 1.5], ...[...'QWERTYUIOP'].map(l => [`Key${l}`, l]), ['BracketLeft', '['], ['BracketRight', ']'], ['Backslash', '\\', 1.5]],
  [['CapsLock', 'Bloq', 1.8], ...[...'ASDFGHJKL'].map(l => [`Key${l}`, l]), ['Semicolon', 'Ñ'], ['Quote', '´'], ['Enter', 'Enter ↵', 2.2]],
  [['ShiftLeft', 'Shift', 2.3], ['IntlBackslash', '<'], ...[...'ZXCVBNM'].map(l => [`Key${l}`, l]), ['Comma', ','], ['Period', '.'], ['Slash', '/'], ['ShiftRight', 'Shift', 1.7]],
  [['ControlLeft', 'Ctrl', 1.3], ['MetaLeft', '◆'], ['AltLeft', 'Alt', 1.2], ['Space', 'Espacio', 5], ['AltRight', 'Alt', 1.2], ['ControlRight', 'Ctrl', 1.3], ['ArrowLeft', '←'], ['ArrowUp', '↑'], ['ArrowDown', '↓'], ['ArrowRight', '→']]
];
Soni.palette = ['#ffd77e', '#a5e5cf', '#c4b5fd', '#ffb3cb', '#92d8f4', '#ffb58a'];
Soni.createKeyboard = function (container, { onPress, onReset }) {
  const pressed = new Set();
  const keys = new Map();
  let listening = false;
  function render(layout) {
    keys.clear(); container.replaceChildren();
    Soni.keyboardRows.forEach((items, rowIndex) => {
      const row = document.createElement('div'); row.className = 'soni-keyboard-row';
      const total = items.reduce((sum, item) => sum + (item[2] || 1), 0);
      let offset = 0;
      items.forEach(([code, label, width = 1]) => {
        const key = document.createElement('span'); key.className = 'soni-key';
        key.dataset.code = code; key.style.flex = String(width);
        key.textContent = code === 'Semicolon' && layout === 'en' ? ';' : label;
        key.setAttribute('aria-label', code === 'Backspace' ? 'Backspace' : key.textContent);
        keys.set(code, { element: key, x: (offset + width / 2) / total, row: rowIndex });
        offset += width; row.append(key);
      });
      container.append(row);
    });
  }
  function identity(event) {
    if (event.code) return event.code;
    if (/^[a-z]$/i.test(event.key)) return `Key${event.key.toUpperCase()}`;
    if (/^[0-9]$/.test(event.key)) return `Digit${event.key}`;
    return ({ ' ': 'Space', Shift: 'ShiftLeft', Control: 'ControlLeft', Alt: 'AltLeft', Meta: 'MetaLeft', 'ñ': 'Semicolon', 'Ñ': 'Semicolon' })[event.key] || event.key;
  }
  function visualKey(code) {
    const alias = { NumpadEnter: 'Enter', NumpadDecimal: 'Period', NumpadAdd: 'Equal', NumpadSubtract: 'Minus', NumpadDivide: 'Slash', NumpadMultiply: 'Digit8' };
    return keys.get(/^Numpad\d$/.test(code) ? code.replace('Numpad', 'Digit') : alias[code] || code);
  }
  function down(event) {
    if (!listening || event.isComposing) return;
    // System/browser shortcuts that do not reach the page remain outside its control.
    if (event.cancelable && !event.metaKey && !['F5', 'F11', 'F12'].includes(event.key)) event.preventDefault();
    const code = identity(event);
    if (event.repeat || pressed.has(code)) return;
    pressed.add(code);
    const key = visualKey(code);
    const previous = key?.element.style.getPropertyValue('--key-color');
    const used = new Set([...keys.values()].filter(item => item.element.classList.contains('is-held')).map(item => item.element.style.getPropertyValue('--key-color')));
    const unused = Soni.palette.filter(color => color !== previous && !used.has(color));
    const colors = unused.length ? unused : Soni.palette.filter(color => color !== previous);
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (key) {
      key.element.style.setProperty('--key-color', color);
      key.element.classList.add('is-held');
    }
    onPress({ code, x: key?.x ?? Math.random(), color });
  }
  function up(event) {
    const code = identity(event); pressed.delete(code);
    const key = visualKey(code);
    // Numpad and main-row keys may share a visual key without sharing held state.
    if (key && ![...pressed].some(other => visualKey(other) === key)) key.element.classList.remove('is-held');
  }
  function reset() {
    pressed.clear(); keys.forEach(key => key.element.classList.remove('is-held')); onReset();
  }
  return {
    pressed,
    start(layout) {
      render(layout); listening = true;
      document.addEventListener('keydown', down, true); document.addEventListener('keyup', up, true);
      window.addEventListener('blur', reset); document.addEventListener('visibilitychange', reset);
    },
    stop() {
      listening = false; reset();
      document.removeEventListener('keydown', down, true); document.removeEventListener('keyup', up, true);
      window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset);
    }
  };
};
