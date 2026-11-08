'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const dialog = byId('wedding');
  const next = byId('wedding-next');
  const studioClothes = ['', 'Ropa del estudio'];
  const gowns = [['bridal', 'Vestido de perlas'], ['roseGown', 'Vestido rosa con volantes'],
    ['lilacGown', 'Vestido lila drapeado'], ['skyGown', 'Vestido azul cielo'],
    ['mintGown', 'Vestido verde menta'], ['goldGown', 'Vestido dorado'],
    ['cherryGown', 'Vestido rojo cereza'], studioClothes];
  const suits = [['midnightSuit', 'Traje azul de noche'], ['ivorySuit', 'Traje marfil'],
    ['forestSuit', 'Traje verde bosque'], ['wineSuit', 'Traje color vino'],
    ['skySuit', 'Traje azul cielo'], ['lavenderSuit', 'Traje lavanda'], studioClothes];
  const colors = {
    veil: [['', 'Sin velo'], ['#fffaf3','Perla'], ['#f4c5d5','Rosa'], ['#d8c9ef','Lila'], ['#c4e1f2','Celeste']],
    slippers: [['','Del vestido'], ['#fff5dd','Perla'], ['#e69eb9','Rosa'], ['#bc9ad9','Lila'], ['#d3ad61','Doradas']],
    bouquet: [['', 'Sin ramo'], ['#cf4c63','Rojo'], ['#f5b3cc','Rosa'], ['#bc91df','Lavanda'], ['#ffdc75','Amarillo'], ['#fffaf0','Blanco']]
  };
  const groomOptions = {
    formalShoes: [['','Del traje'], ['#302e32','Negros'], ['#865c47','Café'], ['#455979','Azul marino'], ['#eee1c7','Marfil']],
    neckStyle: [['bow','Moño'], ['tie','Corbata'], ['none','Sin accesorio']],
    neckColor: [['#78394a','Vino'], ['#285487','Azul'], ['#348166','Verde'], ['#cc9a39','Dorado'], ['#9d79b9','Lila'], ['#30303a','Negro']]
  };
  let groom = {};
  let accessories = {};
  let ready = false;
  const studioTitle = document.title;
  let cast = [];
  let pair = [];
  let outfits = [];
  let active = 0;
  let step = 0;

  function isBoy(person) {
    return window.MakeupArt.characters.find(template => template.id === person.templateId)?.gender === 'boy';
  }
  function defaultOutfit(person) {
    return isBoy(person) ? 'midnightSuit' : 'bridal';
  }
  function art(person, dress, prefix, full) {
    const look = { ...person.look, ...(dress && { dress }), ...(person === pair[0] ? accessories : person === pair[1] ? groom : {}) };
    return window.MakeupArt.renderPortrait(person.templateId, look, prefix, person.name, full);
  }
  function card(label, preview, pressed, action, clothing = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = clothing ? 'wedding-look' : 'doll';
    button.setAttribute('aria-pressed', pressed);
    const sample = document.createElement('span');
    if (!clothing) sample.className = 'doll-art';
    sample.setAttribute('aria-hidden','true');
    sample.innerHTML = preview;
    const caption = document.createElement('span');
    caption.className = 'doll-name';
    caption.textContent = label;
    button.append(sample, caption);
    button.onclick = action;
    return button;
  }
  function picker() {
    byId('wedding-slots').replaceChildren(...pair.map((person, i) =>
      card(person.name, art(person, outfits[i], 'slot-'+i, false), active === i, () => {
        active = i;
        draw();
        byId('wedding-slots').children[i].focus();
      })));
    byId('wedding-cast').replaceChildren(...cast.map((person, i) => {
      const button = card(person.name, art(person, '', 'guest-'+i, false), pair[active] === person, () => {
        if (person !== pair[active]) outfits[active] = defaultOutfit(person);
        pair[active] = person;
        draw();
        byId('wedding-cast').children[i].focus();
      });
      button.disabled = isBoy(person) === isBoy(pair[1-active]);
      return button;
    }));
    const boy = isBoy(pair[active]);
    byId('bridal-accessories').hidden = boy;
    byId('groom-accessories').hidden = !boy;
    const selected = boy ? groom : accessories;
    for (const [kind, choices] of Object.entries(boy ? groomOptions : colors)) {
      const holder = byId('wedding-' + kind);
      holder.replaceChildren(...choices.map(([color,label], i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'doll';
        button.textContent = label;
        button.setAttribute('aria-pressed', color === selected[kind]);
        if (color.startsWith('#')) {
          const chip = document.createElement('span');
          chip.style.cssText = 'width:1em;height:1em;border:1px solid #947b88;border-radius:50%;background:'+color;
          button.prepend(chip);
        }
        button.onclick = () => {
          selected[kind] = color;
          draw();
          holder.children[i].focus();
        };
        return button;
      }));
    }
    const wardrobe = boy ? suits : gowns;
    byId('wedding-clothes-title').textContent = boy ? 'Trajes de boda' : 'Vestidos de boda';
    byId('wedding-clothes').replaceChildren(...wardrobe.map(([value, label], i) =>
      card(label, art(pair[active], value, 'fitting-'+i, true), outfits[active] === value, () => {
        outfits[active] = value;
        draw();
        byId('wedding-clothes').children[i].focus();
      }, true)));
  }
  function draw() {
    const names = pair.map(person => person.name).join(' y ');
    byId('wedding-names').textContent = names;
    byId('wedding-kit-title').textContent = step ? 'La ceremonia' : 'Mi vestidor';
    byId('wedding-pair').innerHTML = pair.map((person, i) => art(person, outfits[i], 'wedding-'+i, true)).join('');
    if (!step) picker();
    dialog.dataset.step = step;
    byId('wedding-pickers').hidden = step !== 0;
    byId('wedding-story').textContent = [
      'Estás vistiendo a ' + pair[active].name + '.',
      names + ' caminan hacia el altar.',
      pair[0].name + ' le pone el anillo a ' + pair[1].name + '.',
      '¡' + names + ' se casaron! ¡Que vivan los novios!'
    ][step];
    next.textContent = ['Caminar al altar', 'Dar el anillo 💍', 'Darse un beso', 'Celebrar otra boda'][step];
  }

  function showActivity() {
    const playing = location.hash === '#boda';
    byId('makeup').hidden = playing || location.hash === '#escuela';
    dialog.hidden = !playing;
    document.title = playing ? 'La boda en la iglesia · El mundo de Fabi' : studioTitle;
    if (!playing || !ready) return;
    cast = window.MakeupGame.snapshotGroup().characters;
    step = 0;
    active = 0;
    pair = [cast.find(person => !isBoy(person)), cast.find(isBoy)];
    next.disabled = !pair.every(Boolean);
    if (next.disabled) {
      dialog.dataset.step = 0;
      byId('wedding-pickers').hidden = true;
      byId('wedding-names').textContent = '';
      byId('wedding-pair').replaceChildren();
      byId('wedding-kit-title').textContent = 'Mi vestidor';
      byId('wedding-story').textContent = 'Para jugar, crea una niña y un niño en el estudio de maquillaje.';
      next.textContent = 'Caminar al altar';
      return;
    }
    groom = { formalShoes: '', neckStyle: 'bow', neckColor: '#78394a' };
    accessories = { slippers: '', veil: '', bouquet: '' };
    outfits = pair.map(defaultOutfit);
    draw();
    window.scrollTo(0, 0);
  }
  window.addEventListener('studio-ready', () => { ready = true; showActivity(); });
  window.addEventListener('hashchange', showActivity);
  showActivity();
  next.addEventListener('click', () => {
    step = (step + 1) % 4;
    draw();
    if (step === 0) byId('wedding-slots').children[active].focus();
  });
})();
