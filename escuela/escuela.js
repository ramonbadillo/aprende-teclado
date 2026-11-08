'use strict';
(() => {
  const el = id => document.getElementById(id);
  const student = el('student');
  const { grade, 'class-group': group } = el('school-form').elements;
  let roster = [];
  let ready = false;
  const teachers = {
    Blue: ['Ana','Beatriz','Carolina','Daniela','Elena','Fernanda'],
    Yellow: ['Gabriela','Helena','Isabel','Jimena','Karla','Laura'],
    Green: ['Mariana','Natalia','Olivia','Paola','Renata','Sofía']
  };
  const names = new Map();
  const nameField = el('teacher-name');
  function teacherKey(year = grade.value, section = group.value) {
    return 'fabi-escuela:maestra:' + year + ':' + section;
  }
  function teacherName(year = grade.value, section = group.value) {
    const key = teacherKey(year, section);
    if (!names.has(key)) {
      let saved = '';
      try { saved = localStorage.getItem(key) || ''; } catch { /* Disponible durante la partida. */ }
      names.set(key, saved);
    }
    return names.get(key) || teachers[section][Number(year) - 1];
  }
  function classTeacher(year = grade.value, section = group.value) {
    const index = Number(year) - 1;
    const name = teacherName(year, section);
    return { name: 'Maestra ' + name, templateId: ['emma','sol','iris','luna'][index % 4],
      look: { dress: { Blue:'denim', Yellow:'daisy', Green:'mint' }[section] } };
  }
  const className = () => grade.value + '.º ' + group.value;
  const pupil = () => roster.find(person => person.id === student.value);

  function portraits(people) {
    el('school-people').replaceChildren(...people.map((person, i) => {
      const figure = document.createElement('figure');
      figure.innerHTML = window.MakeupArt.renderPortrait(person.templateId, person.look, 'school-'+i, person.name, true);
      const label = document.createElement('figcaption');
      label.textContent = person.name;
      figure.append(label);
      return figure;
    }));
  }
  let enrolled = false;
  const friends = () => roster.filter(person => person.id !== student.value);
  function scene(key) {
    el('school-map').hidden = true;
    el('school-detail').hidden = false;
    el('school-detail').dataset.place = key;
    el('school-furniture').innerHTML = window.schoolInterior(key);
  }
  function map() {
    drawMap();
    el('school-detail').hidden = true;
    el('school-map').hidden = false;
    el('destinations-title').focus();
  }
  el('back-to-map').onclick = map;
  function setup() {
    mapGrade.value = grade.value;
    scene('classroom');
    nameField.value = teacherName();
    el('school-form').hidden = false;
    el('school-play').hidden = true;
    el('class-sign').textContent = 'Salón de ' + className();
    el('school-line').textContent = 'Soy la ' + classTeacher().name.replace('Maestra', 'maestra') + '. Te espero en ' + className() + '.';
    portraits([classTeacher(), pupil()]);
  }
  function room(title, line, actions, people = [pupil()], key = 'classroom') {
    scene(key);
    el('school-form').hidden = true;
    el('school-play').hidden = false;
    el('class-sign').textContent = className() + ' · ' + title;
    el('school-place').textContent = title;
    el('staff-editor').hidden = !staffRoles[key];
    if (staffRoles[key]) el('staff-name').value = staffName(key);
    el('school-line').textContent = line;
    portraits(people);
    el('school-actions').replaceChildren(...actions.map(([label, act]) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.onclick = act;
      return button;
    }));
    el('school-place').focus();
  }
  const rooms = [
    ['🚻 Baño','Entras al baño y cierras la puerta.','Lavarme las manos','Te lavas con agua y jabón y te secas las manos.'],
    ['🗝️ Coordinación','La coordinadora te recibe. ¿Buscas algo?','Preguntar por mi lonchera','¡Aquí está! Reconoces tu lonchera y le das las gracias.'],
    ['🏫 Dirección','La directora te invita a pasar.','Presentarme con la directora','La directora te da la bienvenida y te acompaña a la puerta.'],
    ['🛝 Recreo','Tus compañeros te invitan a jugar en el patio.','Saltar la cuerda','¡Uno, dos, tres saltos! Le pasas la cuerda a tu compañero.'],
    ['🍎 Cafetería','Tomas una charola y te acercas al mostrador.','Pedir fruta y agua','Te sirven fruta y agua. Te sientas a comer con tu grupo.'],
    ['🩹 Enfermería','La enfermera te pregunta cómo te sientes.','Mostrar mi raspón','La enfermera limpia tu raspón y te pone una curita.']
  ];
  function hallway() {
    room('El pasillo','Los casilleros están junto a la entrada.', [['Ver croquis',map]], [pupil(),...friends().slice(0,2)], 'hallway');
  }
  const keys = ['bathroom','coordination','direction','yard','cafeteria','nurse'];
  const staffRoles = {
    coordination: ['Coordinadora','Luz','sol'], direction: ['Directora','Elena','luna'],
    nurse: ['Enfermera','Mar','iris'], cafeteria: ['Don','Luis','leo']
  };
  function staffName(key) {
    const storageKey = 'fabi-escuela:personal:' + key;
    if (!names.has(storageKey)) {
      let saved = '';
      try { saved = localStorage.getItem(storageKey) || ''; } catch {}
      names.set(storageKey,saved);
    }
    return names.get(storageKey) || staffRoles[key][1];
  }
  el('staff-name').addEventListener('input', () => {
    const key = el('school-detail').dataset.place;
    const storageKey = 'fabi-escuela:personal:' + key;
    const value = el('staff-name').value.trim();
    names.set(storageKey,value);
    try {
      if (value) localStorage.setItem(storageKey,value);
      else localStorage.removeItem(storageKey);
    } catch {}
    el('school-people').children[1].querySelector('figcaption').textContent = staffRoles[key][0] + ' ' + staffName(key);
  });
  function visitors(key) {
    const staff = staffRoles[key];
    const people = [pupil()];
    if (staff) people.push({name:staff[0]+' '+staffName(key),templateId:staff[2],look:{}});
    if (key === 'yard') people.push(...friends());
    if (key === 'cafeteria') people.push(...friends().slice(0,5));
    return people;
  }
  const destinations = [

    ['🚪 Pasillo','hallway',hallway],
    ...rooms.map(([title,intro,action,result], i) => {
      const key = keys[i];
      return [title,key, () => room(title,intro,[
        [action, () => room(title,result,[['Ver croquis',map]],visitors(key),key)]
      ],visitors(key),key)];
    })
  ];
  const mapGrade = el('school-map-grade');
  for (let i = 1; i <= 6; i++) mapGrade.add(new Option(i + '.º de primaria', i));
  mapGrade.onchange = drawMap;
  function drawMap() {
    const year = mapGrade.value;
    const classrooms = Object.keys(teachers).map((section,i) => {
      const staff = classTeacher(year,section);
      const children = roster.slice(i*2,i*2+2);
      return [year + '.º ' + section,'classroom',() => {
        const same = grade.value === year && group.value === section;
        grade.value = year;
        group.value = section;
        if (same && enrolled) lesson();
        else { enrolled = false; setup(); }
      },[staff,...children],staff.name,section];
    });
    const others = destinations.map(([label,key,visit]) => {
      const people = key === 'hallway' ? friends().slice(0,2) : visitors(key);
      const staff = ['coordination','direction','nurse','cafeteria'].includes(key) ? people[1] : null;
      return [label,key,visit,people,staff?.name];
    });
    el('school-destinations').replaceChildren(...[...classrooms,...others].map(([label,key,visit,people,staff,section]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.room = key;
      if (section) button.dataset.section = section;
      const scene = document.createElement('span');
      scene.className = 'map-scene';
      scene.setAttribute('aria-hidden','true');
      scene.innerHTML = window.schoolInterior(key);
      const actors = document.createElement('span');
      actors.className = 'map-actors';
      people.forEach((person,i) => {
        const actor = document.createElement('span');
        actor.innerHTML = window.MakeupArt.renderPortrait(person.templateId,person.look,'map-'+(section || key)+'-'+i,person.name,true);
        actors.append(actor);
      });
      scene.append(actors);
      const caption = document.createElement('span');
      caption.textContent = label;
      button.append(scene,caption);
      if (staff) {
        const tag = document.createElement('small');
        tag.textContent = staff;
        button.append(tag);
      }
      button.onclick = visit;
      return button;
    }));
  }
  function lesson() {
    const n = Number(grade.value);
    const question = classTeacher().name + ' escribe en el pizarrón: ¿cuánto es ' + n + ' + 2?';
    room('Clase de matemáticas', question, [n+1,n+2,n+3].map(answer => [String(answer), () => {
      if (answer === n+2) room('Clase de matemáticas','¡Muy bien! ' + n + ' + 2 = ' + answer + '.', [['Salir al pasillo',hallway]]);
      else el('school-line').textContent = 'Cuenta dos más a partir de ' + n + '. Inténtalo otra vez.';
    }]).concat([['Salir al pasillo',hallway]]), [classTeacher(),pupil(),...friends().slice(0,5)]);
  }
  el('school-form').onsubmit = event => {
    event.preventDefault();
    enrolled = true;
    const classmates = friends().slice(0,7);
    room('La presentación',classTeacher().name + ' dice: «Grupo de ' + className() + ', hoy nos acompaña ' + pupil().name + '. ¡Vamos a darle la bienvenida!»',
      [['Saludar a mi grupo', () => room('Mi grupo','Tus compañeros responden: «¡Hola, ' + pupil().name + '! Ven, hay un lugar junto a nosotros».',
        [['Sentarme en clase',lesson],['Explorar la escuela',hallway]], [pupil(),...classmates])]], [classTeacher(),pupil(),...classmates]);
  };
  el('school-restart').onclick = () => { setup(); student.focus(); };
  nameField.addEventListener('input', () => {
    const key = teacherKey();
    const name = nameField.value.trim();
    names.set(key, name);
    try {
      if (name) localStorage.setItem(key, name);
      else localStorage.removeItem(key);
    } catch { /* Conserva el nombre durante la partida. */ }
    el('school-line').textContent = 'Soy la maestra ' + teacherName() + '. Te espero en ' + className() + '.';
    portraits([classTeacher(), pupil()]);
  });
  el('school-form').addEventListener('change', event => {
    if (event.target !== nameField) setup();
  });
  function enter() {
    const playing = location.hash === '#escuela';
    el('school').hidden = !playing;
    if (!playing) return;
    document.title = 'Un día en mi escuela · El mundo de Fabi';
    if (!ready) return;
    roster = window.MakeupGame.snapshotGroup().characters;
    student.replaceChildren(...roster.map(person => new Option(person.name, person.id)));
    enrolled = false;
    mapGrade.value = grade.value;
    map();
  }
  window.addEventListener('studio-ready', () => { ready = true; enter(); });
  window.addEventListener('hashchange', enter);
  enter();
})();
