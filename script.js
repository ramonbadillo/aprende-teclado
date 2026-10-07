'use strict';

// Datos independientes: añade sílabas y palabras aquí, siempre en mayúsculas.
const LEVELS = {
  1: { name: 'Encuentra la letra', instruction: 'Encuentra la letra en tu teclado', pools: {
    starter: [...'AEIOUFB'], growing: [...'AEIOUFBMPLSTN'], all: [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ']
  } },
  2: { name: 'Pequeñas sílabas', instruction: 'Escribe la sílaba, una letra a la vez', items: ['MA', 'ME', 'MI', 'PA', 'PE', 'PI', 'LA', 'LE', 'SA', 'SO'] },
  3: { name: 'Mis primeras palabras', instruction: 'Escribe la palabra, una letra a la vez', items: ['FABI', 'CASA', 'GATO', 'PATO', 'SOL', 'LUNA', 'PAN', 'MANO'] }
};
const STORAGE_KEY = 'los-globos-de-fabi-v1';
const DEFAULT_OPTIONS = { level: 1, letters: 'starter', layout: 'es', help: 'always', sound: true, playerName: '' };
const cleanName = value => value.trim().replace(/\s+/g, ' ').slice(0, 24);
const emptyProgress = () => ({ games: 0, letters: 0, practice: {} });
const $ = id => document.getElementById(id);
let storageAvailable = true;

function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { storageAvailable = false; return {}; }
}
const saved = readSaved();
const options = { ...DEFAULT_OPTIONS };
if (saved.options && typeof saved.options === 'object') {
  if (typeof saved.options.playerName === 'string') options.playerName = cleanName(saved.options.playerName);
  for (const [key, allowed] of Object.entries({ level: [1, 2, 3], letters: ['starter', 'growing', 'all'], layout: ['es', 'en'], help: ['always', 'wait', 'request'], sound: [true, false] })) {
    if (allowed.includes(saved.options[key])) options[key] = saved.options[key];
  }
}
let progress = emptyProgress();
if (saved.progress && typeof saved.progress === 'object') {
  for (const key of ['games', 'letters']) {
    if (Number.isSafeInteger(saved.progress[key]) && saved.progress[key] >= 0) progress[key] = saved.progress[key];
  }
  for (const [key, value] of Object.entries(saved.progress.practice || {})) {
    if (/^[A-ZÑ]$/.test(key) && Number.isSafeInteger(value) && value > 0) progress.practice[key] = value;
  }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ options, progress })); }
  catch { storageAvailable = false; }
}

let screen = 'chooser';
let round = null;
let paused = false;
let hintVisible = false;
let hintTimer = null;
let hintStarted = 0;
let hintRemaining = 5000;
let advanceTimer = null;
let advanceStarted = 0;
let advanceRemaining = 650;
let pressedTimer = null;
let audio = null;
const heldKeys = new Set();

function enableAudio() {
  if (!options.sound) return;
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!audio) audio = new Context();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { /* El sonido es opcional; el juego sigue funcionando. */ }
}
function chime(celebrate = false) {
  if (!options.sound || !audio || audio.state !== 'running') return;
  try {
    const notes = celebrate ? [523.25, 659.25, 783.99] : [659.25];
    notes.forEach((frequency, index) => {
      const start = audio.currentTime + index * .13;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.055, start + .02);
      gain.gain.exponentialRampToValueAtTime(.001, start + .3);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(start); oscillator.stop(start + .32);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { /* Si el audio no está disponible, las respuestas siguen funcionando. */ }
}
function renderSound() {
  $('sound').setAttribute('aria-pressed', String(options.sound));
  $('sound-label').textContent = options.sound ? 'Sonido activado' : 'Sonido silenciado';
}
function showScreen(next) {
  window.SoniGame.stop();
  window.VisualTimer.leave();
  screen = next;
  for (const id of ['chooser', 'soni', 'timer', 'home', 'game', 'finish']) $(id).hidden = id !== next;
  document.body.classList.toggle('playing-soni', next === 'soni');
  document.body.classList.toggle('showing-timer', next === 'timer');
  $('settings-open').hidden = !['home', 'finish'].includes(next);
  if (next === 'soni') window.SoniGame.start({ sound: options.sound, layout: options.layout });
  if (next === 'timer') window.VisualTimer.enter({ onStart: enableAudio, onFinish: () => chime(true) });
}
function poolFor(settings) {
  const level = LEVELS[settings.level];
  const pool = settings.level === 1 ? level.pools[settings.letters] : level.items;
  return pool.filter(item => settings.layout === 'es' || !item.includes('Ñ'));
}
function makeChallenges(pool) {
  const challenges = [];
  let bag = [];
  while (challenges.length < 10) {
    if (!bag.length) bag = [...pool];
    let choices = bag.filter(item => item !== challenges.at(-1));
    if (!choices.length) { bag = [...pool]; choices = bag.filter(item => item !== challenges.at(-1)); }
    const next = choices[Math.floor(Math.random() * choices.length)] || pool[0];
    bag.splice(bag.indexOf(next), 1);
    challenges.push(next);
  }
  return challenges;
}
function targetLetter() { return round.challenges[round.index][round.position]; }
function renderKeyboard() {
  $('keyboard').replaceChildren();
  const rows = ['QWERTYUIOP', round.options.layout === 'es' ? 'ASDFGHJKLÑ' : 'ASDFGHJKL', 'ZXCVBNM'];
  for (const letters of rows) {
    const row = document.createElement('div'); row.className = 'keyboard-row';
    for (const letter of letters) {
      const key = document.createElement('span'); key.className = 'key'; key.dataset.letter = letter; key.textContent = letter; row.append(key);
    }
    $('keyboard').append(row);
  }
}
function renderKeys() {
  const target = round && !round.transitioning ? targetLetter() : null;
  document.querySelectorAll('.key').forEach(key => {
    const isTarget = hintVisible && key.dataset.letter === target;
    key.classList.toggle('target', isTarget);
    key.setAttribute('aria-label', key.dataset.letter + (isTarget ? ', siguiente tecla' : ''));
  });
}
function renderProgress() {
  $('progress').innerHTML = Array.from({ length: 10 }, (_, i) => `<svg aria-hidden="true" class="${i < round.index ? 'earned' : ''}"><use href="#star"/></svg>`).join('');
  $('progress').setAttribute('aria-label', `${round.index} de 10 retos completados`);
}
function renderTarget() {
  const word = round.challenges[round.index];
  $('target-text').replaceChildren();
  $('target-text').classList.toggle('word', word.length > 1);
  [...word].forEach((letter, i) => {
    const span = document.createElement('span'); span.textContent = letter;
    span.className = i < round.position ? 'done' : i === round.position ? 'current' : 'pending';
    span.setAttribute('aria-hidden', 'true'); $('target-text').append(span);
  });
  $('target-text').setAttribute('aria-label', `${word}. ${round.position < word.length ? 'Siguiente letra: ' + targetLetter() : 'Completado'}`);
}
function clearHintTimer() { clearTimeout(hintTimer); hintTimer = null; }
function scheduleHint() {
  if (paused || hintVisible || round.transitioning || round.options.help !== 'wait') return;
  hintStarted = performance.now();
  hintTimer = setTimeout(() => { hintTimer = null; hintRemaining = 0; hintVisible = true; renderKeys(); }, hintRemaining);
}
function resetHint() {
  clearHintTimer(); hintRemaining = 5000; hintVisible = round.options.help === 'always';
  renderKeys(); scheduleHint();
}
function feedback(text, retry = false) { $('feedback').textContent = text; $('feedback').classList.toggle('retry', retry); }
function startGame() {
  const playerName = cleanName($('player-name').value);
  if (!playerName) {
    $('name-message').textContent = 'Escribe tu nombre para empezar a jugar.';
    $('player-name').setAttribute('aria-invalid', 'true');
    $('player-name').focus();
    return;
  }
  options.playerName = playerName;
  $('player-name').value = playerName;
  enableAudio(); clearHintTimer(); clearTimeout(advanceTimer); heldKeys.clear();
  paused = false;
  round = { options: { ...options }, challenges: makeChallenges(poolFor(options)), index: 0, position: 0, letters: 0, seen: new Set(), transitioning: false };
  $('target-balloon').classList.remove('pop'); $('particles').classList.remove('burst');
  $('level-label').textContent = `NIVEL ${options.level} · ${LEVELS[options.level].name}`;
  $('game-title').textContent = LEVELS[options.level].instruction;
  showScreen('game'); renderKeyboard(); renderProgress(); renderTarget(); resetHint();
  feedback(`¡Vamos, ${round.options.playerName}! Busca la letra.`); $('pause').focus({ preventScroll: true }); persist();
}
function burst() {
  $('particles').replaceChildren();
  for (let i = 0; i < 9; i++) {
    const star = document.createElement('span'); star.textContent = i % 2 ? '✦' : '✧';
    const angle = i / 9 * Math.PI * 2;
    star.style.setProperty('--x', `${Math.cos(angle) * 120}px`); star.style.setProperty('--y', `${Math.sin(angle) * 95}px`);
    star.style.setProperty('--angle', `${i * 40}deg`); $('particles').append(star);
  }
  $('particles').classList.add('burst');
}
function scheduleAdvance() {
  advanceStarted = performance.now();
  advanceTimer = setTimeout(() => {
    advanceTimer = null; round.index++; round.position = 0; round.transitioning = false;
    renderProgress();
    if (round.index === 10) { finishGame(); return; }
    $('target-balloon').classList.remove('pop'); $('particles').classList.remove('burst');
    renderTarget(); resetHint(); feedback('¡Vamos con el siguiente globo!');
  }, advanceRemaining);
}
function finishGame() {
  clearHintTimer(); progress.games++; persist(); showScreen('finish');
  $('finish-title').textContent = `¡Lo hiciste, ${round.options.playerName}!`;
  $('round-letters').textContent = round.letters; $('round-new').textContent = round.seen.size;
  $('finish-message').textContent = `Hoy practicaste: ${[...round.seen].join(' · ')}. ¡Cada letra cuenta!`;
  chime(true); $('finish-title').focus({ preventScroll: true });
}
function pauseGame() {
  if (screen !== 'game' || paused) return;
  paused = true;
  if (hintTimer !== null) { hintRemaining = Math.max(0, hintRemaining - (performance.now() - hintStarted)); clearHintTimer(); }
  if (advanceTimer !== null) { advanceRemaining = Math.max(0, advanceRemaining - (performance.now() - advanceStarted)); clearTimeout(advanceTimer); advanceTimer = null; }
  $('pause-dialog').showModal(); $('resume').focus();
}
function resumeGame() {
  $('pause-dialog').close(); paused = false; enableAudio();
  if (round.transitioning) scheduleAdvance(); else scheduleHint();
  $('pause').focus({ preventScroll: true });
}
function goHome() {
  clearHintTimer(); clearTimeout(advanceTimer); advanceTimer = null; heldKeys.clear();
  if ($('pause-dialog').open) $('pause-dialog').close();
  paused = false; round = null; showScreen('home'); $('play').focus({ preventScroll: true });
}
function markPhysicalKey(letter) {
  clearTimeout(pressedTimer); document.querySelectorAll('.key.pressed').forEach(key => key.classList.remove('pressed'));
  const key = [...document.querySelectorAll('.key')].find(item => item.dataset.letter === letter);
  if (key) { key.classList.add('pressed'); pressedTimer = setTimeout(() => key.classList.remove('pressed'), 220); }
}
document.addEventListener('keydown', event => {
  const identity = event.code || event.key;
  const repeated = event.repeat || heldKeys.has(identity);
  heldKeys.add(identity);
  if (screen !== 'game' || paused || $('settings').open || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.target instanceof Element && event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
  if (event.key === 'Escape') { event.preventDefault(); pauseGame(); return; }
  const letter = event.key.normalize('NFC').toUpperCase();
  if (!/^[A-ZÑ]$/.test(letter) || repeated) return;
  event.preventDefault(); markPhysicalKey(letter);
  if (round.transitioning) return;
  enableAudio();
  const expected = targetLetter();
  if (letter !== expected) {
    progress.practice[expected] = Math.min(9999, (progress.practice[expected] || 0) + 1); persist();
    feedback('Prueba otra tecla. ¡Lo estás haciendo bien!', true); return;
  }
  round.position++; round.letters++; round.seen.add(letter); progress.letters++;
  if (progress.practice[letter]) { progress.practice[letter]--; if (!progress.practice[letter]) delete progress.practice[letter]; }
  persist(); renderTarget();
  if (round.position === round.challenges[round.index].length) {
    round.transitioning = true; clearHintTimer(); renderKeys(); feedback('¡Muy bien! Una estrella para ti.');
    $('target-balloon').classList.add('pop'); burst(); chime(true);
    advanceRemaining = 650; scheduleAdvance();
  } else { feedback(`¡Bien! Ahora busca la ${targetLetter()}.`); chime(); resetHint(); }
});
document.addEventListener('keyup', event => heldKeys.delete(event.code || event.key));
window.addEventListener('blur', () => { heldKeys.clear(); pauseGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { heldKeys.clear(); pauseGame(); } });
$('play').addEventListener('click', startGame); $('replay').addEventListener('click', startGame);
$('go-home').addEventListener('click', goHome); $('rest').addEventListener('click', goHome); $('pause-home').addEventListener('click', goHome);
function chooseGame() {
  goHome(); showScreen('chooser'); $('chooser-title').focus({ preventScroll: true });
}
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); chooseGame(); });
$('fabi-chooser').addEventListener('click', chooseGame);
$('soni-home').addEventListener('click', chooseGame);
$('timer-home').addEventListener('click', chooseGame);
$('choose-fabi').addEventListener('click', () => { showScreen('home'); $('player-name').focus({ preventScroll: true }); });
$('choose-soni').addEventListener('click', () => { showScreen('soni'); $('soni-title').focus({ preventScroll: true }); });
$('choose-timer').addEventListener('click', () => { showScreen('timer'); $('timer-title').focus({ preventScroll: true }); });
$('pause').addEventListener('click', pauseGame); $('resume').addEventListener('click', resumeGame);
$('pause-dialog').addEventListener('cancel', event => { event.preventDefault(); resumeGame(); });
$('hint').addEventListener('click', () => { if (screen !== 'game' || paused || round.transitioning) return; clearHintTimer(); hintVisible = true; renderKeys(); });
$('sound').addEventListener('click', () => { options.sound = !options.sound; renderSound(); window.SoniGame.setSound(options.sound); if (options.sound && screen !== 'soni') { enableAudio(); chime(); } persist(); });
document.querySelectorAll('input[name="level"]').forEach(input => {
  input.checked = Number(input.value) === options.level;
  input.addEventListener('change', () => { options.level = Number(input.value); persist(); });
});
for (const [id, key] of [['letter-set', 'letters'], ['layout', 'layout'], ['help', 'help']]) {
  $(id).value = options[key]; $(id).addEventListener('change', () => { options[key] = $(id).value; persist(); });
}
function renderSavedStats() {
  $('saved-stats').textContent = `${progress.games} partidas completadas · ${progress.letters} letras acertadas`;
  const practice = Object.entries(progress.practice).sort((a, b) => b[1] - a[1]).map(([letter]) => letter);
  $('practice-stats').textContent = practice.length ? `Para seguir practicando: ${practice.join(' · ')}.` : '¡Todo listo para seguir descubriendo letras!';
  $('storage-note').textContent = storageAvailable ? 'El progreso se guarda solo en este navegador y computadora.' : 'No se puede guardar en este navegador. Puedes jugar; el progreso durará hasta cerrar o recargar la página.';
}
$('settings-open').addEventListener('click', () => { renderSavedStats(); $('erase-confirm').hidden = true; $('erase').hidden = false; $('settings').showModal(); });
$('erase').addEventListener('click', () => { $('erase-confirm').hidden = false; $('erase').hidden = true; $('erase-no').focus(); });
$('erase-no').addEventListener('click', () => { $('erase-confirm').hidden = true; $('erase').hidden = false; $('erase').focus(); });
$('erase-yes').addEventListener('click', () => { progress = emptyProgress(); persist(); renderSavedStats(); $('erase-confirm').hidden = true; $('erase').hidden = false; $('erase').focus(); });
$('player-name').value = options.playerName;
$('player-name').addEventListener('input', () => {
  $('name-message').textContent = '';
  $('player-name').removeAttribute('aria-invalid');
});
$('player-name').addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.isComposing && !event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    startGame();
  }
});
renderSound();
showScreen('chooser');
