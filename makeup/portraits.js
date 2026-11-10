(() => {
  'use strict';

  const characters = [
    { id: 'iris', name: 'Fabi', previousName: 'Iris', gender: 'girl', hair: 'bob', outfit: 'classic' },
    { id: 'sol', name: 'Jade', previousName: 'Sol', gender: 'girl', hair: 'puffs', outfit: 'classic' },
    { id: 'luna', name: 'Sofi', previousName: 'Luna', gender: 'girl', hair: 'waves', outfit: 'classic' },
    { id: 'emma', name: 'Emma', gender: 'girl', hair: 'braid', outfit: 'classic', face: 'heart' },
    { id: 'leo', name: 'Leo', gender: 'boy', hair: 'quiff', outfit: 'bomber', face: 'oval' },
    { id: 'nico', name: 'Nico', gender: 'boy', hair: 'curls', outfit: 'hoodie', face: 'round' },
    { id: 'dani', name: 'Dani', gender: 'boy', hair: 'pixie', outfit: 'stripes', face: 'square' },
    { id: 'mateo', name: 'Mateo', gender: 'boy', hair: 'parted', outfit: 'dungarees', face: 'diamond' },
  ];

  const boyHaircuts = new Set(characters.filter(person => person.gender === 'boy').map(person => person.hair));

  const palettes = {
    luna: {
      skinLight: '#ffe0c3', skin: '#f8c19e', skinShade: '#d38c73', skinInk: '#9f6056',
      hairLight: '#d78a64', hair: '#995238', hairShade: '#60332f', ink: '#583233',
      iris: '#93613b', lip: '#d6877f', dress: '#8b72a7', dressInk: '#655079', collar: '#ffeacb',
    },
    sol: {
      skinLight: '#d79973', skin: '#bc7959', skinShade: '#9c594a', skinInk: '#80473c',
      hairLight: '#916559', hair: '#543c42', hairShade: '#352a35', ink: '#402e37',
      iris: '#805039', lip: '#b96d6f', dress: '#57a492', dressInk: '#3c786b', collar: '#fff0c9',
    },
    iris: {
      skinLight: '#ffe3bf', skin: '#f4c699', skinShade: '#d89e79', skinInk: '#9f6754',
      hairLight: '#738299', hair: '#454760', hairShade: '#353449', ink: '#373649',
      iris: '#606a77', lip: '#d99489', dress: '#df814f', dressInk: '#a75543', collar: '#fff1d5',
    },
    emma: {
      skinLight: '#ffd6b6', skin: '#e2ab88', skinShade: '#c0886c', skinInk: '#946652',
      hairLight: '#eaa772', hair: '#ad623e', hairShade: '#7d4732', ink: '#613b31',
      iris: '#74845b', lip: '#c78078', dress: '#6f9e9f', dressInk: '#4e727c', collar: '#fff0c6',
    },
    leo: {
      skinLight: '#f5c69f', skin: '#dea579', skinShade: '#bb805e', skinInk: '#8e614b',
      hairLight: '#c29466', hair: '#8c5b38', hairShade: '#62412f', ink: '#51392f',
      iris: '#81884e', lip: '#c98d78', dress: '#8c92b6', dressInk: '#616588', collar: '#ffebc8',
    },
    nico: {
      skinLight: '#bf8a6b', skin: '#9f6c53', skinShade: '#81513e', skinInk: '#663e32',
      hairLight: '#80615d', hair: '#4e3a3c', hairShade: '#372b31', ink: '#342a2c',
      iris: '#89633b', lip: '#a96f65', dress: '#bb855b', dressInk: '#966952', collar: '#fff0cd',
    },
    dani: {
      skinLight: '#ffe1c4', skin: '#edbc9b', skinShade: '#ce957d', skinInk: '#9d705e',
      hairLight: '#e5b184', hair: '#b37248', hairShade: '#855236', ink: '#674534',
      iris: '#648b97', lip: '#d59683', dress: '#81a694', dressInk: '#5c7f74', collar: '#fcebd3',
    },
    mateo: {
      skinLight: '#efd0a9', skin: '#d3a680', skinShade: '#af805f', skinInk: '#8c644b',
      hairLight: '#737681', hair: '#43444b', hairShade: '#31323a', ink: '#323039',
      iris: '#725442', lip: '#be8974', dress: '#8f98ae', dressInk: '#616a83', collar: '#fff0cc',
    },
  };

  const hairColors = {
    black:    { label: 'Negro',    hair: '#31323c', hairLight: '#646475', hairShade: '#22232b', ink: '#23212a' },
    chestnut: { label: 'Castaño',  hair: '#794938', hairLight: '#b78462', hairShade: '#52352f', ink: '#4a332e' },
    copper:   { label: 'Cobrizo',  hair: '#b86039', hairLight: '#ea9a62', hairShade: '#914530', ink: '#783d30' },
    gold:     { label: 'Rubio',    hair: '#d8a34f', hairLight: '#ffe39a', hairShade: '#a77737', ink: '#85603c' },
    silver:   { label: 'Plateado', hair: '#b6b7c7', hairLight: '#efedf7', hairShade: '#8a8b9f', ink: '#717184' },
    rose:     { label: 'Rosa',     hair: '#cf789c', hairLight: '#fbb7cc', hairShade: '#ac557b', ink: '#8e496a' },
    lavender: { label: 'Lavanda',  hair: '#a589c4', hairLight: '#dfc1ee', hairShade: '#80669f', ink: '#6d5787' },
    teal:     { label: 'Turquesa', hair: '#5aa5a5', hairLight: '#a2d8d0', hairShade: '#408181', ink: '#366666' },
  };

  const eyeColors = {
    espresso: { label: 'Café',     iris: '#614133' },
    hazel:    { label: 'Avellana', iris: '#967047' },
    amber:    { label: 'Ámbar',    iris: '#bf8b3e' },
    olive:    { label: 'Oliva',    iris: '#879150' },
    jade:     { label: 'Jade',     iris: '#538d70' },
    aqua:     { label: 'Agua',     iris: '#67aaa7' },
    blue:     { label: 'Azul',     iris: '#648dc0' },
    slate:    { label: 'Gris',     iris: '#85919e' },
  };

  const skinTones = {
    porcelain: { label: 'Porcelana', skin: '#f6d5c8', skinLight: '#ffebe0', skinShade: '#dba99a', skinInk: '#a37369' },
    ivory:     { label: 'Marfil',    skin: '#efd2ab', skinLight: '#fff0d4', skinShade: '#d0a47a', skinInk: '#a57d60' },
    peach:     { label: 'Durazno',   skin: '#e9b196', skinLight: '#ffdac4', skinShade: '#c28c74', skinInk: '#9b6c5b' },
    honey:     { label: 'Miel',      skin: '#d8a373', skinLight: '#f3cda3', skinShade: '#b77c54', skinInk: '#8b6249' },
    bronze:    { label: 'Bronce',    skin: '#c28b64', skinLight: '#dfa983', skinShade: '#a46d51', skinInk: '#81513f' },
    umber:     { label: 'Canela',    skin: '#a77357', skinLight: '#c79370', skinShade: '#895842', skinInk: '#714738' },
    cocoa:     { label: 'Cacao',     skin: '#895d4d', skinLight: '#ad7d65', skinShade: '#714838', skinInk: '#5f3a31' },
    ebony:     { label: 'Ébano',     skin: '#69483e', skinLight: '#8a6253', skinShade: '#51352f', skinInk: '#442c29' },
  };

  const originalFace = {
    label: 'Original', chin: 260,
    path: 'M81 143C81 95 113 65 160 64C211 63 240 96 240 143L237 174C235 212 218 233 190 249Q176 258 160 260Q141 258 125 249C98 235 83 211 82 180Z',
  };

  // The temples meet the same hairline and ears. The cheeks, jaw and chin form
  // each silhouette, leaving space for all the fixed eye and cheek decorations.
  const faceShapes = {
    round: {
      label: 'Redonda', chin: 252,
      path: 'M80 145C78 97 112 65 160 64C209 64 242 96 241 145C241 169 245 191 236 211C223 237 190 252 160 252C128 252 98 238 84 213C74 193 79 167 80 145Z',
    },
    oval: {
      label: 'Ovalada', chin: 266,
      path: 'M83 146C83 97 117 63 160 63C204 63 237 96 237 146C237 178 231 205 216 227C201 250 178 266 160 266C142 266 119 250 104 227C90 206 82 177 83 146Z',
    },
    heart: {
      label: 'Corazón', chin: 264,
      path: 'M77 145C74 96 110 60 160 68C209 60 246 97 244 145C244 174 237 197 224 216Q205 234 185 246C173 253 167 264 160 264C153 264 147 253 135 246Q114 235 96 216C83 197 77 172 77 145Z',
    },
    diamond: {
      label: 'Diamante', chin: 261,
      path: 'M85 145C86 100 120 65 160 62C201 65 234 99 235 145C236 161 245 179 242 193C239 208 220 222 205 235C190 246 172 261 160 261C148 261 130 246 115 235C98 221 81 208 78 193C75 179 84 160 85 145Z',
    },
    square: {
      label: 'Cuadrada', chin: 255,
      path: 'M79 144C78 95 112 65 160 64C209 64 242 95 241 144C240 169 241 194 236 222Q232 240 217 246C202 253 181 255 160 255C139 255 119 254 103 246Q88 240 84 222C78 198 81 169 79 144Z',
    },
    long: {
      label: 'Alargada', chin: 273,
      path: 'M86 144C87 93 118 61 160 61C202 61 233 93 234 144C235 175 228 203 221 223C211 250 185 273 160 273C134 273 108 250 99 223C91 200 85 176 86 144Z',
    },
    pear: {
      label: 'Pera', chin: 259,
      path: 'M86 145C89 97 118 66 160 66C202 66 231 97 234 145C234 173 244 193 241 213C238 239 209 259 160 259C111 259 82 239 79 213C76 193 86 173 86 145Z',
    },
    rectangle: {
      label: 'Rectangular', chin: 268,
      path: 'M83 144C81 98 111 64 160 63C209 64 239 98 237 144L234 206Q234 232 226 244C214 261 182 268 160 268C137 268 106 261 94 244Q86 231 86 206Z',
    },
  };

  function choices(options, swatch) {
    return Object.entries(options).map(([id, option]) =>
      swatch ? [option.label, id, option[swatch]] : [option.label, id]);
  }

  const appearanceChoices = {
    hairColor: choices(hairColors, 'hair'),
    faceShape: choices(faceShapes),
    eyeColor: choices(eyeColors, 'iris'),
    skinTone: choices(skinTones, 'skin'),
  };

  function choice(options, id) {
    return Object.hasOwn(options, id) ? options[id] : undefined;
  }

  function validColor(color) {
    return typeof color === 'string' && /^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(color) ? color : null;
  }

  function definitions(id, p, cheeks, hairPalette) {
    return `<defs>
      <radialGradient id="${id}-skin" cx="42%" cy="37%" r="72%">
        <stop stop-color="${p.skinLight}"/><stop offset=".68" stop-color="${p.skin}"/><stop offset="1" stop-color="${p.skinShade}"/>
      </radialGradient>
      <linearGradient id="${id}-hair" x1="0" y1="0" x2=".92" y2=".7">
        <stop stop-color="${hairPalette.hairLight}"/><stop offset=".43" stop-color="${hairPalette.hair}"/><stop offset="1" stop-color="${hairPalette.hairShade}"/>
      </linearGradient>
      <radialGradient id="${id}-blush">
        <stop stop-color="${cheeks}" stop-opacity=".95"/><stop offset=".54" stop-color="${cheeks}" stop-opacity=".68"/>
        <stop offset="1" stop-color="${cheeks}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-lip" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#71344a" stop-opacity=".19"/><stop offset=".46" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#fff0da" stop-opacity=".24"/>
      </linearGradient>
      <pattern id="${id}-fabric" width="22" height="21" patternUnits="userSpaceOnUse" patternTransform="scale(.56)">
        <path d="m9 4 2.4 3-2.4 3-2.4-3Z" fill="#fff2da" opacity=".54"/>
        <circle cx="20" cy="18" r="1.1" fill="#fff2da" opacity=".65"/>
      </pattern>
    </defs>`;
  }

  function moonHair(id, p) {
    const back = `<path d="M156 36C117 30 74 55 65 99C62 119 72 134 59 158C46 182 37 202 50 222C57 233 62 240 51 256C41 275 46 295 63 303C74 309 88 305 93 299C99 314 128 321 147 306L171 299C192 320 214 310 225 300C244 314 269 298 267 278C266 270 261 263 257 259C279 253 280 234 270 219C260 204 255 197 265 176C277 149 265 137 257 117C252 102 253 80 241 62C224 36 187 25 156 36Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="3"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.5" opacity=".67">
        <path d="M77 156C81 182 51 193 62 215S76 245 64 263Q54 279 66 289"/>
        <path d="M248 146C263 171 242 183 247 204S273 235 253 247M81 243Q91 263 78 281"/>
      </g>`;
    const front = `<path d="M157 41C118 34 80 55 69 99C64 119 70 146 81 169C81 151 83 132 101 123C123 113 143 105 163 83C177 106 190 117 208 122C228 127 236 141 239 157C254 136 255 103 239 79C223 51 190 34 157 41Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.6"/>
      <g fill="none" stroke="${p.hairLight}" opacity=".9">
        <path d="M80 115C85 85 115 64 141 60M92 116C114 101 136 95 154 72M181 67C195 88 209 93 223 101" stroke-width="3"/>
        <path d="M93 83Q107 69 124 65M194 69Q202 79 211 82" stroke-width="1.5"/>
      </g>
      <g transform="translate(226 76) rotate(23)" stroke="#995767" stroke-width="2.4">
        <path d="M-1 0C-13-9-22-20-29-13Q-35-9-34 0T-29 15C-21 20-9 9-1 5ZM1 1C14-7 22-19 28-14Q35-8 33 1T29 14C20 18 10 10 1 5Z" fill="#ec98a4"/>
        <path d="M-5 5Q-8 20-18 28L-8 27L-3 32Q3 20 4 7M3 5Q12 16 21 17L16 22L18 28Q7 23 1 12" fill="#df8196"/>
        <path d="M-20-4Q-12-2-7 2M19-5Q11-2 7 2" fill="none"/>
        <rect x="-6" y="-5" width="13" height="14" rx="5" fill="#f7b6b6"/>
      </g>`;
    return { back, front };
  }

  function puff(x, y, rotation, id, p) {
    return `<g transform="translate(${x} ${y}) rotate(${rotation})" stroke="${p.ink}" stroke-width="2.5">
      <path d="M-28-39Q-39-45-46-35Q-56-35-56-22Q-64-17-59-6Q-65 5-55 13Q-58 26-46 32Q-44 46-30 45Q-21 56-10 50Q0 59 10 50Q23 55 29 44Q42 46 46 32Q58 28 54 15Q65 8 59-5Q65-17 55-24Q56-38 44-41Q40-54 27-52Q17-63 7-56Q-4-64-14-56Q-26-56-28-39Z" fill="url(#${id}-hair)"/>
      <g fill="none" stroke="${p.hairLight}" opacity=".8">
        <path d="M-48-16Q-50-31-37-29Q-39-38-27-41M-16-45Q-14-54-4-50M8-46Q18-52 25-41M30-34Q45-36 44-22M-44 6Q-49 16-37 19M-15-24Q-7-36 2-27M12-5Q24-11 28 0"/>
        <path d="M-34 36Q-22 43-18 33M-7 20Q-1 27 6 22" opacity=".5"/>
      </g>
    </g>`;
  }

  function sunHair(id, p, face) {
    const nape = face === originalFace ? 'L224 223L96 223Z' : 'Q228 196 212 207Q162 222 108 207Q89 192 80 175Z';
    const back = `${puff(78, 98, -16, id, p)}${puff(243, 96, 19, id, p)}
      <path d="M80 175C54 138 64 76 106 54C131 39 180 35 208 51C251 72 263 129 242 175${nape}" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="3"/>`;
    const front = `<path d="M77 160Q61 139 73 104C77 78 97 54 125 44Q164 27 201 44C237 59 255 91 249 128Q247 142 240 153Q237 134 230 133Q216 133 216 120Q199 123 194 111Q176 117 168 103Q153 118 139 110Q127 128 112 121Q105 134 94 131Q85 138 77 160Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7"/>
      <path d="M76 116C77 69 117 41 159 41C203 39 238 65 248 109C234 74 200 51 160 51C120 51 86 74 76 116Z" fill="#f4bf55" stroke="#946444" stroke-width="2"/>
      <path d="M93 85Q116 53 154 48" fill="none" stroke="#ffe8a1" stroke-width="2.7"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.4" opacity=".9">
        <path d="M85 113Q87 102 94 103Q97 84 110 83M116 76Q122 64 136 65M143 66Q154 57 161 61M174 62Q188 60 194 72M210 80Q220 82 223 93M99 115Q106 102 116 104M135 96Q144 86 152 92M168 86Q179 79 187 88M196 105Q202 99 209 105"/>
      </g>
      <g transform="translate(220 71) rotate(18)"><path d="m0-13 4 8 9 1-6.8 6.5 1.4 9-8.1-4.2-8.1 4.2 1.4-9L-14-4l9.5-1Z" fill="#ffe6a2" stroke="#ad7748" stroke-width="2"/><path d="m0-8 2 4.5 4 .6" fill="none" stroke="#fff8d8" stroke-width="2"/></g>`;
    return { back, front };
  }

  function bobHair(id, p) {
    const back = `<path d="M157 41C104 36 70 69 63 113C58 141 65 156 60 183Q64 202 53 221Q58 225 65 224Q61 236 54 241C73 249 82 248 91 246Q90 252 85 256Q112 263 132 250L189 253Q222 262 239 250Q246 256 257 248Q249 241 247 234Q259 239 272 230C259 217 260 203 261 188C267 154 264 132 260 113C254 70 216 38 170 41Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="3"/>
      <g stroke="${p.hairLight}" fill="none" stroke-width="2.4" opacity=".7"><path d="M78 165Q82 210 68 232M88 206Q86 226 80 235M248 172Q241 198 253 218M241 216Q242 228 246 232"/></g>`;
    const front = `<path d="M157 43C111 41 82 62 71 101C65 122 71 143 80 164Q81 143 92 130L102 103L101 125Q120 126 130 121L142 98L139 120Q159 121 176 115Q182 105 184 95L188 115Q207 120 221 123L220 107Q232 128 239 151Q250 135 250 113C251 79 212 40 171 43Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.5" opacity=".85"><path d="M89 100Q99 78 118 68M106 102Q113 83 128 75M146 97Q150 82 155 77M202 84Q210 88 216 98"/></g>
      <path d="M69 118C68 68 109 32 162 30C216 28 252 67 254 111C246 76 212 43 163 41C118 40 81 71 69 118Z" fill="#de8587" stroke="#92515f" stroke-width="2"/>
      <path d="M109 49Q130 36 155 35" fill="none" stroke="#ffc5ae" stroke-width="2.6"/>
      ${flower(82, 91, 1.05, '#fff1c9', '#db9252')}`;
    return { back, front };
  }

  function braidHair(id, p) {
    const back = `<path d="M155 40C114 37 80 59 68 101C53 146 64 165 81 194L115 218L218 210C240 188 257 148 247 109C238 67 199 39 155 40Z" stroke="${p.ink}" stroke-width="2.8" fill="url(#${id}-hair)"/>`;
    const braid = `<g stroke="${p.ink}" stroke-width="2.8" fill="url(#${id}-hair)">
      <path d="M81 164C63 153 45 162 44 180Q42 194 51 201C37 209 38 224 47 232Q39 247 50 259Q48 272 63 285C63 307 73 322 91 324C84 311 88 300 77 281Q87 268 82 254Q92 243 85 228Q101 212 91 197C106 180 96 168 81 164Z"/>
      <path d="M76 168C91 170 94 182 86 194C78 201 65 204 54 214Q50 199 66 191Q85 183 76 168Z"/>
      <path d="M50 198C59 205 77 207 83 217Q88 228 77 238Q77 225 61 221Q48 215 50 198Z"/>
      <path d="M79 225C89 243 74 251 62 254Q52 258 51 266Q43 250 57 241Q73 236 79 225Z"/>
      <path d="M53 254C58 263 69 261 76 269Q82 275 73 284Q66 285 62 278Q51 272 53 254Z"/>
      <path d="M72 290Q76 307 83 314" fill="none" stroke="${p.hairLight}" stroke-width="2"/>
      <path d="M48 180Q53 169 61 169M53 204Q58 213 69 215M53 249Q60 245 66 242" fill="none" stroke="${p.hairLight}" stroke-width="2.2"/>
      <path d="M61 282Q68 277 76 279L80 287Q72 292 66 291Z" fill="#a9d6cf" stroke="#578780" stroke-width="2"/>
      </g>`;
    const front = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7">
      <path d="M197 57C171 30 125 34 97 54C65 73 57 111 66 141Q74 158 83 161Q81 145 94 131C119 129 178 105 197 78C206 103 221 118 234 127Q241 138 240 157C260 122 250 81 226 65Q210 54 197 57Z"/>
      <path d="M78 129C86 105 133 107 162 80Q119 99 97 103M84 110C90 84 121 65 152 59M201 71Q216 98 233 108" stroke="${p.hairLight}" stroke-width="2.5" fill="none"/>
      <path d="M79 122C82 116 90 112 99 108" fill="none" stroke="${p.hairLight}" stroke-width="1.3"/>
      </g>
      <g transform="translate(216 85) rotate(23)" stroke="#668889" stroke-width="1.8">
        <path d="M-15-5Q0 0 15 0Q18 2 15 5Q0 6-16 0Q-18-4-15-5Z" fill="#a8d0c5"/>
        <path d="M-13 3Q-1 7 12 7Q15 9 12 11Q-1 12-14 8Q-16 4-13 3Z" fill="#f8d78b" stroke="#ad8a58"/>
      </g>`;
    return { back, front: braid + front };
  }

  function ponytailHair(id, p) {
    const back = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.8">
      <path d="M173 55C190 27 216 18 239 24C267 31 275 62 273 99C270 132 258 170 272 194Q281 210 299 204C281 234 248 219 238 193C224 164 243 119 238 93Q234 76 218 73L195 77Z"/>
      <path d="M226 35C251 38 261 65 258 92M254 122C249 154 246 180 259 197" fill="none" stroke="${p.hairLight}" stroke-width="3"/>
      <path d="M180 48Q192 31 206 32L217 46Q199 51 190 66Z" fill="#eead87" stroke="#ab7467"/>
      <path d="M190 45L198 39" stroke="#ffe4a9" stroke-width="2.7"/>
      <path d="M81 174C54 142 65 90 89 65C109 42 142 34 164 40C199 34 232 56 244 99Q258 150 237 175Z"/>
      </g>`;
    const front = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7">
      <path d="M77 166C55 123 71 75 107 54C136 36 167 38 184 42C220 45 246 71 249 107Q251 135 239 158Q240 135 224 123C205 110 193 96 188 78C162 95 128 107 105 117Q86 129 82 150Q86 151 86 158Q81 155 77 166Z"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.5">
        <path d="M79 118C90 89 128 79 160 61M86 121C113 99 153 91 176 69M204 67Q225 80 234 98"/>
      </g></g>`;
    return { back, front };
  }

  function rolledBun(x, id, p, mirrored) {
    return `<g transform="translate(${x} 54) scale(${mirrored ? -1 : 1} 1)" stroke="${p.ink}" stroke-width="2.7">
      <path d="M-32 8C-41-9-33-30-16-37C0-44 22-38 31-25C45-6 40 13 28 23Q14 35-12 30Q-26 27-32 8Z" fill="url(#${id}-hair)"/>
      <path d="M-29 12C-34-8-17-29 3-29C20-30 30-18 28-7C27 5 8 11 0 4C-7-1-2-10 7-10Q16-10 17-4" stroke="${p.hairLight}" stroke-width="2.6" fill="none"/>
      <path d="M-23 18Q-24 5-18-5M8 19Q24 20 33 10" fill="none" stroke="${p.hair}" stroke-width="2.1"/>
      <path d="M-5 29Q12 18 24 17" fill="none" stroke="#f2bf89" stroke-width="4.5"/>
      </g>`;
  }

  function bunsHair(id, p) {
    const back = `${rolledBun(90, id, p, false)}${rolledBun(230, id, p, true)}
      <path d="M80 175Q60 151 67 107C76 56 113 37 160 39C212 39 248 63 253 119Q256 155 238 175Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.8"/>`;
    const front = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7">
      <path d="M160 40C124 34 96 53 82 76Q64 100 69 133Q72 147 80 158Q77 140 91 127C120 109 144 90 160 71C175 94 201 113 228 128Q241 139 239 155Q256 127 247 99C236 58 199 34 160 40Z"/>
      <path d="M160 47Q155 57 160 69" stroke="${p.hairShade}" fill="none" stroke-width="2"/>
      <g stroke="${p.hairLight}" stroke-width="2.6" fill="none">
        <path d="M80 112Q94 76 133 56M87 118Q118 87 144 71M177 55Q215 68 231 96M183 73Q204 96 225 107"/>
      </g>
      <path d="M79 149C71 166 87 174 88 165Q87 171 82 168Q78 166 81 158M241 146Q249 159 244 165Q239 170 237 162" fill="none" stroke-width="2"/>
      </g>`;
    return { back, front };
  }

  function straightHair(id, p) {
    const back = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7">
      <path d="M157 36C108 35 74 66 70 112C63 167 71 231 55 301Q82 315 114 304Q148 323 183 310Q221 322 259 302C246 228 255 155 247 108C242 61 203 33 157 36Z"/>
      <g stroke="${p.hairLight}" stroke-width="2.2" fill="none" opacity=".83"><path d="M78 162C79 221 74 264 67 294M92 202Q92 253 84 295M241 166Q239 241 248 293M225 223Q224 266 231 297"/></g></g>`;
    const front = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.6">
      <path d="M158 37C114 36 82 60 73 102Q64 135 72 177Q80 221 74 279Q88 261 88 235Q95 256 90 273C108 237 87 191 86 157Q84 133 100 119C125 105 147 87 159 66Q169 90 205 110C230 127 237 145 232 172Q224 197 226 223Q227 247 239 262Q233 242 237 224Q243 249 247 257C240 220 251 192 251 153C253 118 244 75 221 54Q193 34 158 37Z"/>
      <g stroke="${p.hairLight}" stroke-width="2.4" fill="none">
        <path d="M155 48C131 56 102 79 91 103M159 51Q159 59 160 63M168 49C202 54 228 82 235 102M76 145Q75 173 79 196M244 160Q244 185 237 203"/>
      </g></g>`;
    return { back, front };
  }

  function pixieHair(id, p) {
    const back = `<path d="M84 174C74 169 70 160 65 149Q66 153 61 154Q66 146 64 133C58 98 78 61 112 49Q129 38 147 38Q141 34 135 33Q156 26 170 36C191 29 209 44 221 52Q251 76 254 109Q252 127 260 135Q255 138 250 134Q250 151 239 162L230 174Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.8"/>`;
    const front = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.6">
      <path d="M165 38Q151 27 135 32Q147 33 150 39Q122 36 104 49C78 61 66 87 66 112Q63 127 57 134Q65 136 71 132Q69 150 84 163Q81 144 96 132Q119 121 131 111Q129 119 125 126Q154 119 172 97Q170 108 164 115Q188 107 198 90Q207 109 222 118Q226 131 222 138Q235 136 238 124Q245 139 239 153Q254 142 253 124C259 93 242 59 213 47Q188 32 165 38Z"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.7">
        <path d="M76 107Q85 77 119 60M86 112Q115 83 146 72M116 111Q143 98 163 77M188 55Q211 58 226 75M217 89Q227 94 230 103"/>
      </g></g>`;
    return { back, front };
  }

  function quiffHair(id, p) {
    const back = `<path d="M78 171C64 149 64 106 79 86C99 61 131 42 163 43Q218 43 245 100Q257 138 240 172L234 178L85 179Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7"/>`;
    const front = `<g fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7">
      <path d="M76 158C65 140 62 110 77 88Q86 74 102 66C93 63 89 57 89 52Q107 63 128 55C152 42 166 26 191 32Q205 33 210 42Q216 31 214 25C238 40 237 59 228 72C249 84 254 114 246 143L240 158L234 151L233 123Q218 108 214 87C195 108 167 107 143 100Q120 109 97 106Q84 126 83 149Z"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.7"><path d="M91 92Q117 78 143 72Q170 64 188 46M123 91Q162 95 192 69M199 54Q205 48 206 43M233 98Q240 109 240 121"/></g>
    </g>`;
    return { back, front };
  }

  function curlyCropHair(id, p) {
    const back = `<path d="M76 172Q62 159 64 141Q53 131 60 117Q54 102 65 92Q64 77 78 70L239 67Q254 78 249 92Q260 101 254 115Q262 128 254 141Q257 161 240 171Z" fill="${p.hairShade}" stroke="${p.ink}" stroke-width="2.6"/>`;
    const front = `<path d="M77 156Q64 155 65 143Q52 139 55 126Q45 115 54 104Q47 91 58 82Q55 68 69 61Q70 46 85 46Q91 32 106 37Q116 24 129 31Q142 19 154 27Q169 16 181 27Q197 20 205 32Q220 27 227 40Q243 37 247 52Q262 56 258 70Q270 80 262 92Q270 103 260 116Q265 128 253 135Q251 149 240 150Q239 140 231 135Q222 133 223 121Q210 127 203 116Q192 124 185 112Q172 120 163 108Q152 120 140 112Q127 124 117 116Q105 125 97 119Q90 130 82 129Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.7">
        <path d="M64 108Q59 96 69 92Q67 80 80 78M80 63Q82 51 96 54Q102 42 114 46M126 42Q135 34 144 40M158 42Q168 33 179 42M192 47Q202 40 211 53M222 57Q236 55 239 69M244 85Q254 88 250 99"/>
        <path d="M82 105Q80 94 92 92M107 76Q109 66 120 69M135 91Q139 80 150 84M161 64Q165 56 176 62M181 99Q191 91 198 100M211 85Q220 81 225 90"/>
      </g>`;
    return { back, front };
  }

  function partedHair(id, p) {
    const back = `<path d="M77 178Q66 167 67 149Q62 142 60 144Q63 133 60 125C52 79 95 40 152 40Q216 30 244 78C257 100 255 132 252 143Q251 154 257 161Q249 164 242 159L236 177Z" fill="url(#${id}-hair)" stroke="${p.ink}" stroke-width="2.7"/>`;
    const front = `<g stroke="${p.ink}" stroke-width="2.7" fill="url(#${id}-hair)">
      <path d="M150 44C120 36 90 52 74 76Q54 109 66 141Q69 151 78 160Q78 142 95 132Q91 141 88 145Q120 139 138 119Q147 110 153 90Q161 113 181 126Q193 133 208 134Q199 126 199 117Q216 132 231 137Q239 143 239 155C253 139 255 116 250 100C241 66 209 40 181 39Q165 36 150 44Z"/>
      <g fill="none" stroke="${p.hairLight}" stroke-width="2.5"><path d="M151 53Q144 66 151 82M143 59Q116 65 97 92M142 78Q124 110 98 123M165 58Q199 65 218 94M165 75Q178 101 201 113M228 90Q236 106 237 117"/></g>
    </g>`;
    return { back, front };
  }

  function flower(x, y, size, petals, center) {
    return `<g transform="translate(${x} ${y}) scale(${size})">
      <path d="M-3-3C-14-15-5-21-1-11C3-24 14-17 8-8C24-12 23 1 12 2C23 11 14 19 6 11C5 26-7 21-5 11C-17 18-22 7-11 3C-24-3-16-12-7-7Z" fill="${petals}" stroke="#aa785a" stroke-width="1.7"/>
      <circle cx="1" cy="1" r="5.2" fill="${center}" stroke="#b78055" stroke-width="1.3"/><circle cx="-.4" cy="-.6" r="1.4" fill="#fff0a1"/>
    </g>`;
  }

  function shoulders(id, p, chin) {
    const shadowOffset = (chin - originalFace.chin) * headPlacement.scale;
    return `<path d="M145 122Q149 134 147 141Q145 146 132 149L119 152Q112 155 110 164L106 179L119 185Q128 190 132 209L133 239Q157 252 187 239L190 206Q194 188 203 185L215 177L209 159Q205 153 196 151L184 148Q174 145 172 141L172 122Z" fill="url(#${id}-skin)" stroke="${p.skinInk}" stroke-width="1.45"/>
      <path d="M147 131Q159 139 172 129L172 136Q159 144 148 137Z" transform="translate(0 ${shadowOffset})" fill="${p.skinShade}" opacity=".6"/>`;
  }

  function arms(id, p) {
    return `<g fill="url(#${id}-skin)" stroke="${p.skinInk}" stroke-width="1.55">
      <path d="M116 153C109 153 106 161 104 174L98 198Q96 207 93 217C89 231 87 243 83 255Q81 261 77 266Q74 270 75 273Q77 275 80 270C79 275 77 281 79 284Q81 288 84 286Q90 284 95 272Q96 269 96 264C99 251 104 234 109 222Q112 215 115 204L124 176Q131 158 116 153Z"/>
      <path d="M202 153C212 153 217 162 219 173Q224 190 231 204Q234 211 233 217C232 228 228 239 226 246Q224 254 225 260C226 266 226 269 223 270Q221 270 220 265Q219 269 217 275Q215 279 212 278Q208 277 209 271Q210 263 213 257Q214 249 216 241C218 230 219 221 219 216Q219 213 217 210C210 200 203 184 198 174Q193 159 202 153Z"/>
    </g>
    <g stroke="${p.skinInk}" stroke-width="1.05" fill="none" opacity=".67">
      <path d="M83 282Q86 278 87 274M212 274Q212 270 214 267M95 217Q97 219 99 218M223 213Q225 215 228 214"/>
    </g>`;
  }

  function sneakers(color) {
    return `<g fill="${color}" stroke="#585867" stroke-width="1.7">
      <path d="M117 499Q126 504 137 499L140 515Q141 521 135 524L101 525Q92 525 94 518Q96 512 106 509Z"/>
      <path d="M186 500Q197 505 206 498L216 509Q226 510 229 518Q231 525 222 525H192Q185 524 184 518Z"/>
      <g fill="#f8e8cf"><path d="M94 517Q117 521 140 516L139 522Q125 527 98 525Q93 524 94 517Z"/><path d="M185 516Q205 521 229 518Q231 525 224 526L190 525Q185 524 185 516Z"/></g>
      <path d="m113 505 9 3m-14 1 9 3m89-8-8 4m13-1-8 4" fill="none" stroke="#fff2df" stroke-width="2.2"/>
    </g>`;
  }

  function legsAndShoes(id, p, shoe, casual, shoeDetail) {
    return `<ellipse cx="160" cy="526" rx="66" ry="4.5" fill="#997d88" opacity=".16"/>
      <g fill="url(#${id}-skin)" stroke="${p.skinInk}" stroke-width="1.55">
        <path d="M131 290L157 293C156 321 156 345 153 369Q152 379 152 391C153 406 149 424 145 441Q141 456 139 472L136 507Q130 514 119 509L123 471Q123 450 124 434Q125 419 127 404Q129 392 127 382Q124 354 123 328Z"/>
        <path d="M164 292L190 290Q198 323 194 346C192 365 191 378 194 392Q204 424 203 444Q202 468 205 504Q199 513 187 511L182 471Q180 450 177 432Q175 414 173 397C170 381 169 366 168 349Z"/>
      </g>
      <g fill="#fff2df" stroke="#bda292" stroke-width="1.25">
        <path d="M121 479Q129 483 138 479L136 509L118 511Z"/>
        <path d="M184 479Q193 483 204 478L207 509L187 512Z"/>
      </g>
      ${casual ? sneakers(shoe) : `<g fill="${shoe}" stroke="#694958" stroke-width="1.7">
        <path d="M119 501Q125 507 135 502Q138 512 137 519Q134 524 123 524L103 524Q96 523 97 518Q98 514 105 511Q113 509 119 501Z"/>
        <path d="M186 503Q196 509 205 500Q209 506 217 510Q225 514 225 520Q224 524 217 524H197Q187 524 185 519Z"/>
        <path d="M111 509Q117 510 120 514M212 509Q207 511 205 514" stroke="#f9d9bd" stroke-width="2.3" fill="none"/>
        ${shoeDetail === 'lace' ? '<path d="m111 511 7 2m-3-5 7 2m85-2 7-2m-4 6 7-2" fill="none" stroke="#e2cba9" stroke-width="2"/>' : ''}
        ${shoeDetail === 'ribbon' ? '<g fill="#f7dda9" stroke="#a7776a" stroke-width=".8"><path d="m111 513-6-4v7l6-3 6 3v-7Zm101 0-6-4v7l6-3 6 3v-7Z"/></g>' : ''}
        <path d="M100 521Q114 523 134 520M190 521Q207 523 222 520" fill="none" stroke="#846770" stroke-width="1.2"/>
      </g>`}`;
  }

  function classicDress(id, p) {
    const silhouette = 'M138 147Q146 155 159 158Q169 155 180 146L195 149Q207 150 213 160L220 177Q216 182 203 184L197 172Q194 194 190 212L186 241C189 263 211 321 226 349Q164 374 95 350C107 315 124 271 132 242Q127 212 124 181L120 173L115 185Q103 183 97 178L103 161Q108 153 119 151Z';
    return `<path d="${silhouette}" fill="${p.dress}" stroke="${p.dressInk}" stroke-width="1.7"/>
      <path d="${silhouette}" fill="url(#${id}-fabric)"/>
      <g fill="${p.collar}" stroke="${p.dressInk}" stroke-width="1.45">
        <path d="M138 146Q147 155 160 158C154 172 139 170 128 151Z"/><path d="M181 146Q170 155 160 158C167 172 182 169 191 150Z"/>
      </g>
      <g fill="none" stroke="${p.dressInk}" stroke-width="1.1"><path d="M160 166V357M110 165Q114 168 118 173M207 164Q202 168 200 173M144 249Q133 297 125 340M176 250Q188 299 195 342"/></g>
      <path d="M132 238Q159 244 187 238L188 245Q160 251 131 245Z" fill="${p.collar}" stroke="${p.dressInk}" stroke-width="1.25"/>
      <g fill="${p.collar}" stroke="${p.dressInk}" stroke-width=".9"><circle cx="160" cy="176" r="2.3"/><circle cx="160" cy="192" r="2.3"/><circle cx="160" cy="208" r="2.3"/></g>`;
  }

  function floralDress() {
    return `<g stroke="#765282" stroke-width="1.8">
      <path d="M124 153Q133 149 139 147Q147 161 159 161Q172 160 181 146Q195 148 205 156L203 175Q193 190 190 211L186 240Q196 271 218 310Q225 324 239 348Q235 357 223 356Q216 364 204 361Q194 369 181 364Q168 372 154 366Q138 372 124 365Q108 368 98 361Q84 362 77 353Q95 314 113 277L132 241Q127 210 123 190Q121 180 115 174Z" fill="#ad83bc"/>
      <path d="M128 149C117 146 104 151 99 161Q90 173 93 182Q104 190 117 190Q122 184 125 174Q130 164 128 149Z" fill="#d3aedb"/>
      <path d="M193 148C204 146 215 151 221 160Q230 172 226 182Q214 189 201 189Q197 183 195 174Q191 161 193 148Z" fill="#d3aedb"/>
      <path d="M128 151L138 146Q157 168 181 146L193 150Q163 181 128 151Z" fill="#f7deed"/>
      <path d="M132 238Q158 244 187 238L189 246Q163 252 130 246Z" fill="#f1d7e8"/>
      </g>
      <g fill="none" stroke="#94709f" stroke-width="1.4"><path d="M111 157Q102 162 99 172M207 157Q216 164 219 172M142 250Q133 294 111 339M158 253Q154 308 151 348M180 250Q188 297 206 340"/></g>
      <path d="M84 347Q100 358 111 354Q129 364 143 358Q159 365 175 358Q193 363 207 354Q223 357 232 347" fill="none" stroke="#f5deed" stroke-width="3.3"/>
      <g fill="#9cbb95" stroke="#829a78" stroke-width=".9"><path d="M146 179Q140 181 136 176Q141 174 146 179ZM153 179Q154 172 160 174Q161 176 153 179Z"/></g>
      ${flower(149, 180, .37, '#ffe2d3', '#dfa44f')}${flower(122, 343, .43, '#ffe2d3', '#dfa44f')}
      ${flower(187, 345, .38, '#ffe2d3', '#dfa44f')}`;
  }

  function sailorDress() {
    return `<g stroke="#3e736d" stroke-width="1.8">
      <path d="M137 147Q147 159 160 161Q173 157 182 146L198 150Q210 152 215 161L221 176L203 184L198 175Q194 204 188 240Q204 286 222 350Q160 371 97 351L132 239Q125 207 122 173L116 184L96 178L102 161Q110 153 120 150Z" fill="#79b9aa"/>
      <path d="M99 172L117 178L115 184L96 178ZM218 171L201 178L203 184L221 177Z" fill="#fff1cf" stroke-width="1.2"/>
      <path d="M139 146Q148 156 160 160Q172 156 182 146L200 151L194 179L161 194L128 179L122 152Z" fill="#fff0d0"/>
      <path d="M127 152L132 175L160 188L190 175L196 152" fill="none" stroke="#5e9d92" stroke-width="2"/>
      <g fill="#edac78" stroke="#a17353" stroke-width="1.2">
        <path d="M158 177Q144 167 140 170Q137 174 141 181Q148 183 157 181Q153 194 148 200L155 198L158 202Q163 192 164 182Q170 184 178 180Q180 177 178 170Q174 167 162 175Z"/><ellipse cx="160" cy="179" rx="4.2" ry="3.8"/>
      </g>
      <path d="M132 237Q160 242 188 237L190 245Q161 252 130 245Z" fill="#59978c"/>
      <g fill="none" stroke="#5a9b91" stroke-width="1.5"><path d="M140 250L118 347M153 250L144 354M166 250L175 354M180 250L203 347"/></g>
      <path d="M100 340Q159 359 219 339L221 346Q159 365 98 347Z" fill="#ffefd0" stroke="none"/>
      <g fill="#f1ce8e" stroke="#927959" stroke-width="1"><circle cx="143" cy="257" r="2.1"/><circle cx="177" cy="257" r="2.1"/><circle cx="140" cy="269" r="2.1"/><circle cx="180" cy="269" r="2.1"/></g>
      </g>`;
  }

  function partyDress() {
    return `<g stroke="#aa6869" stroke-width="1.75">
      <path d="M123 152Q133 148 140 147Q148 163 161 165Q176 162 182 147Q203 150 210 158L203 178Q194 195 191 214L185 241Q208 292 241 359Q233 371 221 367Q208 377 193 371Q177 380 161 374Q141 380 126 371Q110 376 96 367Q85 371 77 360Q102 299 133 241Q128 211 125 189L116 172Z" fill="#eb9c91"/>
      <path d="M117 152Q129 146 138 147Q135 160 126 169Q115 172 110 177Q102 174 94 179Q97 160 117 152Z" fill="#ffd0b6"/>
      <path d="M202 151Q194 147 181 147Q185 161 193 169Q205 171 211 177Q217 174 226 178Q220 159 202 151Z" fill="#ffd0b6"/>
      <path d="M122 162Q133 155 141 157Q154 164 162 174Q178 158 190 157Q197 157 202 161L200 168Q193 164 185 167Q171 173 162 183Q148 171 134 167Q128 165 123 169Z" fill="#ffe0c2"/>
      <path d="M132 239Q160 245 186 239L189 248Q160 254 129 247Z" fill="#ffdbbc"/>
      <path d="M122 269Q159 282 198 269L217 312Q209 317 197 314Q182 323 168 318Q152 325 137 319Q121 322 111 315Q101 316 101 312Z" fill="#ffc6a9"/>
      <path d="M131 248Q161 255 189 247L204 280Q195 287 185 284Q172 292 160 287Q144 292 133 285Q120 287 115 282Z" fill="#efab9c"/>
      <path d="M85 358Q98 365 110 362M119 366Q132 371 140 367M201 365Q216 371 229 361M103 170Q116 156 126 154M214 169Q205 159 194 155" fill="none" stroke="#ffd9bd" stroke-width="1.8"/>
      <path d="m161 172 4 5-4 6-4-6Z" fill="#f2c862" stroke="#af8156" stroke-width="1.2"/>
      </g>
      <g fill="#fff0cd"><circle cx="132" cy="301" r="1.4"/><circle cx="186" cy="301" r="1.5"/><circle cx="114" cy="344" r="1.6"/><circle cx="205" cy="346" r="1.5"/></g>`;
  }

  function daisyDress() {
    return `<g stroke="#aa804a" stroke-width="1.7">
      <path d="M139 147Q158 160 181 147L197 150Q211 151 216 163L223 179Q216 178 213 184Q208 180 202 184L198 175L187 213H130L123 175Q118 178 116 184Q111 180 105 184Q103 180 96 179L103 161Q108 154 119 151Z" fill="#fff3d6"/>
      <path d="M140 148Q159 164 180 148M102 176Q109 174 116 180M204 178Q212 174 217 176" fill="none" stroke="#ddc397" stroke-width="1.3"/>
      <path d="M128 150L137 147L143 171Q160 177 177 171L183 147L192 150L189 179Q187 196 191 211L187 236Q190 258 203 282Q216 311 231 349Q224 359 212 354Q203 364 190 358Q177 367 162 360Q148 367 134 361Q119 365 108 357Q96 360 89 352Q106 306 124 268Q130 253 133 236Q127 212 125 193Z" fill="#e7b755"/>
      <path d="M128 153L136 151L141 172M185 151L190 153L185 173" fill="none" stroke="#ffe495" stroke-width="2.4"/>
      <path d="M133 232Q160 237 187 232L188 239Q160 245 132 239Z" fill="#fff1cd"/>
      <g fill="none" stroke="#ca984c" stroke-width="1.15"><path d="M142 246Q137 282 122 319M161 246Q162 282 160 329M180 245Q191 280 199 314"/></g>
      <path d="M94 343Q102 350 110 348Q120 356 133 351Q148 359 162 353Q175 359 189 351Q201 355 212 348Q219 350 226 342" fill="none" stroke="#fff2cf" stroke-width="2.8"/>
      </g>
      <g fill="#8b9e62" stroke="#7f8d59" stroke-width="1">
        <path d="M140 199Q130 199 130 191Q137 191 140 199ZM177 204Q181 195 189 197Q187 204 177 204Z"/>
        <path d="M125 325Q116 324 114 317Q121 316 125 325ZM182 337Q185 329 192 329Q191 335 182 337Z"/>
      </g>
      ${flower(147, 201, .59, '#fffbea', '#da9946')}
      ${flower(174, 210, .40, '#fffbea', '#d99c46')}
      ${flower(130, 325, .57, '#fffbea', '#d99c46')}
      ${flower(177, 336, .59, '#fffbea', '#d99c46')}
      ${flower(157, 303, .34, '#fffbea', '#d99c46')}`;
  }

  function overallDress() {
    return `<g stroke="#9c785c" stroke-width="1.7">
      <path d="M138 147Q158 163 182 146L199 150Q209 151 215 163L222 179L204 186L198 177L187 236L131 236L122 176L117 185L96 179L104 160Q109 153 121 151Z" fill="#fff0cd"/>
      <g fill="none" stroke="#e1ba93" stroke-width="2.2"><path d="M100 171L117 177M102 166L119 172M204 177L217 171M202 172L215 166"/></g>
      <path d="M140 148Q160 166 180 147" fill="none" stroke="#d6ad81" stroke-width="2"/>
      </g>
      <g stroke="#58745e" stroke-width="1.8">
        <path d="M124 152L133 149L142 181L178 181L187 149L196 152L187 190L188 214Q189 224 196 228L190 243Q194 276 207 314L216 346Q166 365 105 348Q118 311 127 274Q132 253 132 241L127 228Q135 223 135 213L134 190Z" fill="#8eaa7e"/>
        <path d="M144 192Q159 195 177 192V206Q173 216 161 219Q149 217 145 208Z" fill="#a1b68b"/>
        <g stroke="#f6dfa6" stroke-width="1.2" stroke-dasharray="2 2" fill="none"><path d="M148 198H173M129 157L138 183M190 157L183 183M112 343Q163 356 212 342M160 248V348"/></g>
        <path d="M131 235Q160 240 189 235L192 244Q161 250 131 245Z" fill="#728f6c"/>
        <path d="M128 256Q138 263 147 262L145 277Q139 282 126 281Z" fill="#9eb38a"/>
        <g fill="#f3cf85" stroke="#987a4e" stroke-width="1.2"><circle cx="139" cy="183" r="3.4"/><circle cx="182" cy="183" r="3.4"/><circle cx="137" cy="241" r="2"/></g>
      </g>
      <path d="M159 210Q160 204 167 201Q169 207 161 210Q157 209 154 204Q159 204 159 208Z" fill="#608a6b" stroke="#5b8064" stroke-width=".8"/>`;
  }

  function balletDress() {
    return `<g stroke="#a47598" stroke-width="1.7">
      <path d="M123 152L133 149Q143 172 159 174Q175 173 187 148L197 152Q193 166 194 181L191 207L186 235Q189 258 195 273Q191 291 176 304Q163 311 145 306Q132 300 125 281Q133 257 133 237L126 210Q124 190 121 177Z" fill="#cf9ec2"/>
      <path d="M128 151Q119 148 108 155Q99 161 94 174Q101 171 107 176Q114 173 120 177Q126 168 128 151ZM190 149Q202 148 210 154Q221 161 225 174Q218 171 212 176Q207 173 199 178Q193 167 190 149Z" fill="#edd5e7"/>
      <path d="M134 153Q146 173 159 174Q177 169 185 152" fill="none" stroke="#fae4ee" stroke-width="2.7"/>
      <path d="M132 233Q161 241 186 233C198 256 204 281 239 302Q241 311 231 314Q222 325 211 320Q199 329 186 324Q173 332 160 326Q144 331 132 325Q119 330 109 322Q96 325 89 316Q79 316 78 306C109 282 119 256 132 233Z" fill="#e8c3df"/>
      <path d="M134 236Q161 247 185 236C192 255 201 283 230 295Q222 303 214 298Q201 308 191 303Q177 311 164 305Q148 312 136 306Q121 310 112 301Q100 305 89 297Q120 267 134 236Z" fill="#f2dbe9"/>
      <path d="M133 235Q157 243 186 235L189 243Q163 253 129 243Z" fill="#d89fbb"/>
      <g fill="none" stroke="#c59cb9" stroke-width="1.05"><path d="M141 250Q133 277 122 292M151 251L147 298M165 251Q168 279 172 297M180 250Q194 280 199 292M110 306L104 313M213 304L217 310"/></g>
      <g fill="#fff1d9" stroke="none"><path d="m154 190 2.5 5 4 1-4 2-2 4-1-4-4-2 4-1ZM177 209l1.4 3 3 1-3 1-1.4 3-1-3-3-1 3-1Z"/><circle cx="143" cy="208" r="1.45"/><circle cx="167" cy="200" r="1"/></g>
    </g>`;
  }

  function denimDress() {
    return `<g stroke="#506a83" stroke-width="1.75">
      <path d="M139 146Q159 161 181 146L198 150Q210 151 216 165L228 196L211 203L199 178Q194 208 189 232Q188 246 195 261L212 329Q165 348 109 332C113 310 119 282 127 257Q134 239 130 223L123 178L111 201L94 194L104 163Q108 153 121 150Z" fill="#7197b3"/>
      <path d="M97 184L116 191L111 203L93 196ZM207 191L224 185L229 197L211 204Z" fill="#98b1c4"/>
      <path d="M158 155L165 155L165 340L158 340Z" fill="#6489a6" stroke-width="1.2"/>
      <path d="M139 145Q148 154 159 156L148 172L129 152ZM181 145Q172 154 161 156L171 172L191 151Z" fill="#91aec2"/>
      <path d="M131 179L147 180L146 192Q144 197 138 199L132 195ZM175 180L191 178L189 192L184 198L176 195Z" fill="#769db6" stroke-width="1.25"/>
      <path d="M129 177L148 178L146 184L138 186L130 183ZM173 179L192 176L192 182L183 186L174 184Z" fill="#a1b6c3" stroke-width="1.2"/>
      <g fill="none" stroke="#ead4a9" stroke-width="1.1" stroke-dasharray="2 2">
        <path d="M155 175V337M168 175V336M115 328Q136 336 151 336M172 335Q191 334 205 328M132 156L148 168M188 155L172 168M97 192L110 197M213 199L225 194"/>
      </g>
      <path d="M130 233Q159 239 190 232L191 241Q160 248 131 242Z" fill="#bb8762" stroke="#8e6d56" stroke-width="1.3"/>
      <rect x="156" y="235" width="11" height="8" rx="2" fill="#d8ab69" stroke="#967648" stroke-width="1.2"/>
      <g fill="#e7c387" stroke="#816a52" stroke-width="1"><circle cx="161.5" cy="179" r="1.9"/><circle cx="161.5" cy="199" r="1.9"/><circle cx="161.5" cy="219" r="1.9"/><circle cx="161.5" cy="260" r="1.9"/><circle cx="161.5" cy="282" r="1.9"/><circle cx="161.5" cy="304" r="1.9"/><circle cx="161.5" cy="325" r="1.9"/></g>
      </g>`;
  }

  function trousers(fabric, seam) {
    return `<g stroke="${seam}" stroke-width="1.7" fill="${fabric}">
      <path d="M125 239Q161 245 193 239L198 280C198 313 195 355 198 388Q207 440 209 498Q198 505 183 501Q175 449 166 405Q157 348 158 317Q153 368 151 404L139 500Q126 506 115 499C118 469 119 427 122 391Q125 358 120 316Q117 277 125 239Z"/>
      <path d="M117 488Q130 493 141 486M181 488Q195 491 207 485M129 260Q130 276 121 284M187 260Q186 275 197 279M157 255V279Q165 279 165 263M134 382Q138 385 142 384M176 388Q184 384 190 386" fill="none" stroke-width="1.25"/>
    </g>`;
  }

  function shorts(fabric, seam) {
    return `<g fill="${fabric}" stroke="${seam}" stroke-width="1.75">
      <path d="M124 242Q160 248 194 242Q198 268 199 293L202 344Q181 350 166 346L158 301L154 347Q137 352 115 346Q118 288 119 265Z"/>
      <path d="M117 339Q138 345 154 339M166 339Q184 343 201 337M129 261Q127 276 119 280M187 261Q189 274 198 277M159 258V281Q165 279 165 264" fill="none" stroke-width="1.2"/>
    </g>`;
  }

  const teeShape = 'M139 147Q158 160 181 146L197 150Q210 152 216 164L224 181L205 191L199 180L197 207L195 257Q160 264 125 257L123 209L121 179L114 189L95 181L104 162Q111 152 122 150Z';

  function bomberOutfit() {
    return `${trousers('#bf9b77', '#8f715f')}
      <g stroke="#607e78" stroke-width="1.75">
        <path d="M134 150L142 147Q162 160 180 147L189 151L185 257Q160 262 135 257Z" fill="#f4e7c7"/>
        <path d="M139 147L122 150Q108 151 103 164L95 197L88 224L81 252L95 257Q103 234 110 220L120 195L122 258Q135 264 145 260L151 164Z" fill="#769f91"/>
        <path d="M181 146L200 151Q212 153 219 170L230 201Q238 213 235 221L227 255L215 253Q218 232 219 219L207 200L200 189L198 257Q185 264 175 260L169 164Z" fill="#769f91"/>
        <g fill="#d9c391"><path d="M81 249L96 253L94 261L79 257ZM215 249L228 251L227 259L214 257ZM121 251Q136 258 145 252L145 261Q130 263 122 259ZM175 252Q184 255 198 249V258Q184 264 175 260Z"/>
        <path d="M139 145Q147 152 154 155L150 166Q140 157 135 149ZM181 145Q176 154 167 157L170 165Q182 158 186 150Z"/></g>
        <path d="m126 230 10-8m48-1 11 8" fill="none" stroke-width="2.5"/>
      </g>
      <circle cx="190" cy="178" r="7.3" fill="#e7bd72" stroke="#a8825a" stroke-width="1.2"/><path d="m190 173 1.3 3 3 .6-2.2 2 .6 3-2.7-1.4-2.7 1.4.6-3-2.2-2 3-.6Z" fill="#fff2cc"/>`;
  }

  function hoodieOutfit() {
    return `${shorts('#638987', '#4d6a72')}
      <g stroke="#a77c48" stroke-width="1.7">
        <path d="M136 149Q140 139 148 140Q160 144 172 140Q183 140 188 150L199 153Q213 154 219 172L231 202Q237 212 234 223L227 252L214 251L218 218L200 190L198 258Q162 265 121 258L121 192L111 218L96 254L81 250L92 210L104 166Q110 154 120 152Z" fill="#e5b765"/>
        <path d="M137 147Q148 141 160 148Q172 141 181 146L191 151Q177 158 160 171Q144 160 132 153Z" fill="#efc983"/>
        <path d="M141 147Q152 153 160 162Q168 154 178 147Q160 153 141 147Z" fill="#bc9155"/>
        <path d="M143 219H177L189 236Q185 243 177 244H142Q135 244 130 237Z" fill="#d7a75d"/>
        <path d="M121 250Q160 256 198 249V258Q157 265 122 258ZM82 247L97 251L94 259L79 255ZM214 247L228 249L227 257L213 255Z" fill="#d4a55b"/>
      </g>
      <path d="M152 163L152 180M169 163L168 181" stroke="#fff0ca" stroke-width="2.6"/>
      <path d="M143 197Q151 180 160 192L166 187L179 201H140Z" fill="#859c85"/><path d="m151 190 3-2 4 3-3 2Z" fill="#fff0c7"/>`;
  }

  function stripedOutfit() {
    return `${trousers('#7897ab', '#577384')}
      <path d="${teeShape}" fill="#f9eacb" stroke="#9e886e" stroke-width="1.7"/>
      <g fill="#74a6a0">
        <path d="M108 157Q119 153 133 153Q159 166 182 153L201 153Q210 156 214 164Q159 180 104 166Z"/>
        <path d="M99 175Q156 193 220 174L223 181Q163 199 96 182ZM123 199Q162 209 197 199L197 207Q160 217 123 207ZM124 223Q162 232 196 222L196 231Q158 240 124 231ZM125 247Q161 255 195 247V254Q161 262 125 255Z"/>
      </g>
      <path d="M137 148Q158 164 182 147" fill="none" stroke="#668e8c" stroke-width="3"/>
      <path d="M173 186L189 185V197Q187 203 181 205Q175 204 173 199Z" fill="#719da0" stroke="#577b7f" stroke-width="1.2"/>
      <g fill="#aac0c9" stroke="#577384" stroke-width="1.45"><path d="M114 487Q127 491 141 486L140 500Q128 505 114 500ZM181 486Q194 491 208 485L210 499Q194 504 182 501Z"/></g>`;
  }

  function overallsOutfit() {
    return `${trousers('#697f99', '#505f78')}
      <path d="${teeShape}" fill="#cb8c77" stroke="#956c61" stroke-width="1.7"/>
      <path d="M137 147Q157 164 182 146M99 177L115 183M207 184L220 178" stroke="#edb499" stroke-width="2.4" fill="none"/>
      <g fill="#71879e" stroke="#52667c" stroke-width="1.7">
        <path d="M125 150L135 148L143 181H177L186 148L195 150L186 190L188 218Q190 231 198 234L196 265Q160 273 121 266L122 235Q134 227 134 214V188Z"/>
        <path d="M145 195H176V211Q171 219 161 222Q148 219 145 212Z" fill="#849bb0"/>
        <g fill="#efc781" stroke="#9a7856" stroke-width="1.15"><circle cx="140" cy="183" r="3"/><circle cx="181" cy="183" r="3"/><circle cx="126" cy="243" r="2"/><circle cx="193" cy="243" r="2"/></g>
      </g>
      <g stroke="#e7c99c" fill="none" stroke-width="1.15" stroke-dasharray="2 2"><path d="M129 154L136 179M190 154L183 180M148 200H173M124 259Q161 267 193 258M126 284L124 380M190 284L193 378"/></g>`;
  }

  function casualShirt(bottom, fabric, detail) {
    return bottom + `<path d="${teeShape}" fill="${fabric}" stroke="#635961" stroke-width="1.7"/>` + detail;
  }
  const outfits = {
    soccer: { shoe: '#415976', draw: () => casualShirt(shorts('#415976','#31465d'), '#68af83',
      '<path d="M139 148l21 16 21-16M101 177l13 6m93 1 13-6" fill="none" stroke="#fff1d4" stroke-width="4"/><path d="M151 184h18l-12 30" fill="none" stroke="#fff1d4" stroke-width="6"/>') },
    polo: { shoe: '#886349', draw: () => casualShirt(trousers('#b29c7d','#85715b'), '#dfaa59',
      '<path d="m137 146 22 12-9 12-17-18zm45 0-22 12 9 12 17-18z" fill="#f7d99e"/><path d="M160 160v20" stroke="#a97842" stroke-width="2"/><circle cx="163" cy="170" r="1.6" fill="#fff1cc"/>') },
    spaceTee: { shoe: '#9892b2', draw: () => casualShirt(trousers('#66758e','#49566f'), '#746697',
      '<circle cx="160" cy="201" r="14" fill="#f6bd77"/><ellipse cx="160" cy="201" rx="23" ry="5" transform="rotate(-23 160 201)" stroke="#ffe2a5" stroke-width="3" fill="none"/><path d="m181 181 2 4 4 1-4 2-2 4-1-4-4-2 4-1z" fill="#fff2c9"/>') },
    bomber: { draw: bomberOutfit, shoe: '#72948a' },
    hoodie: { draw: hoodieOutfit, shoe: '#8d9586' },
    stripes: { draw: stripedOutfit, shoe: '#be8672' },
    dungarees: { draw: overallsOutfit, shoe: '#978273' },
  };
  function ceremonySuit(fabric, lapel) {
    return trousers(fabric, lapel) + `<path d="M139 147Q159 160 181 147L195 151L195 262H125V152Z" fill="#fffaf3"/>
      <g fill="${fabric}" stroke="${lapel}" stroke-width="2"><path d="M138 147L117 151Q106 153 101 170L80 255L95 259L119 190L121 270Q145 274 161 255L159 206Z"/><path d="M182 147L201 151Q212 154 218 169L234 212L227 258L214 255L219 217L200 188L199 268Q179 278 159 255V207Z"/></g>
      <path d="M138 146L126 164L137 169L133 174L159 214ZM182 146L194 164L183 169L187 174L160 214Z" fill="${lapel}"/>
      <circle cx="161" cy="225" r="2.5" fill="#d8bd81"/><path d="M177 185l9-6 4 6Z" fill="#ffefd9"/>`;
  }

  function ribbonGown(id, palette, silk, piping, ribbon) {
    return classicDress(id, { ...palette, dress: silk, dressInk: piping, collar: ribbon }) +
      `<path d="M132 240Q160 248 187 240Q203 342 255 486Q168 523 65 487Q110 380 132 240Z" fill="${silk}" stroke="${piping}" stroke-width="2"/>
      <path d="M146 250Q142 360 108 490M175 250Q181 380 214 490M74 475Q164 504 246 475" fill="none" stroke="${ribbon}" stroke-width="4"/>
      <path d="M131 239Q160 247 188 239L189 247Q161 254 129 247Z" fill="${ribbon}"/>
      <path d="M185 244q-18-19-19-4t19 4q22-16 21-2t-21 2l12 28-12-7-5-19Z" fill="${ribbon}" stroke="${piping}"/>`;
  }
  const dresses = {
    skyGown: (id,p) => ribbonGown(id,p,'#a9d8f4','#5993b6','#e7f6ff'),
    mintGown: (id,p) => ribbonGown(id,p,'#a7dfc4','#679b86','#e3fcde'),
    goldGown: (id,p) => ribbonGown(id,p,'#efc66b','#ae823c','#fff0b9'),
    cherryGown: (id,p) => ribbonGown(id,p,'#cd536a','#91394c','#ffbbc4'),
    forestSuit: () => ceremonySuit('#326353','#203f36'),
    wineSuit: () => ceremonySuit('#853c53','#56283b'),
    skySuit: () => ceremonySuit('#80aecb','#537990'),
    lavenderSuit: () => ceremonySuit('#aa93c8','#79688e'),
    midnightSuit: () => ceremonySuit('#263849','#182432'),
    ivorySuit: () => ceremonySuit('#e9dbc5','#af997e'),
    roseGown: () => partyDress() + '<path d="M132 240Q160 250 187 240Q201 335 253 466Q161 508 66 468Q115 341 132 240Z" fill="#ebaac0" stroke="#b7748d" stroke-width="2"/><path d="M79 443Q157 480 241 443M88 420Q161 453 232 420" fill="none" stroke="#ffe1e9" stroke-width="6"/>',
    lilacGown: () => floralDress() + '<path d="M132 239Q157 248 186 239Q192 324 224 398L252 497Q157 524 72 493Q108 404 132 239Z" fill="#c1a4df" stroke="#8b709f" stroke-width="2"/><path d="M134 249Q157 353 231 423Q175 401 128 316" fill="#e3d2ef"/><path d="M132 242Q159 251 187 242" fill="none" stroke="#f5dfb8" stroke-width="6"/>',
    bridal(id,p) {
      return classicDress(id,{ ...p, dress:'#fffaf2', dressInk:'#b89e92', collar:'#f3dfcd' }) +
        '<path d="M132 239Q160 247 187 239C198 298 233 416 270 495Q249 517 221 511Q191 529 163 518Q133 530 102 515Q73 521 50 498C82 423 118 295 132 239Z" fill="#fffaf3" stroke="#c5afa4" stroke-width="2"/><path d="M145 248Q131 373 91 501M173 250Q190 394 224 497M158 249Q155 404 147 510" fill="none" stroke="#e5d6cb" stroke-width="3"/><path d="M130 239Q160 246 188 239L189 248Q158 255 129 248Z" fill="#dbbe98"/>';
    },
    classic: classicDress,
    violet: floralDress, mint: sailorDress, peach: partyDress, daisy: daisyDress,
    overall: overallDress, ballet: balletDress, denim: denimDress,
  };
  const shoeColors = {
    violet: '#9677a0', mint: '#578e86', peach: '#d7948c', daisy: '#bc9665',
    overall: '#8a8b65', ballet: '#d7a5bd', denim: '#9e785f',
  };
  const headPlacement = { x: 88, y: 17, scale: .45 };

  function eye(p, shadow, mirrored, simpleLid) {
    const outline = 'M101 165C108 150 126 149 140 164C139 170 131 179 119 178Q107 178 101 165Z';
    return `<g${mirrored ? ' transform="translate(320 0) scale(-1 1)"' : ''}>
      <path d="M97 144C108 132 124 132 138 140Q142 144 137 145C121 141 111 140 101 147Q96 149 97 144Z" fill="${p.hairShade}"/>
      ${shadow ? `<path d="M97 164C99 150 107 143 120 144Q135 144 142 162L140 166Q120 149 104 169Z" fill="${shadow}"/>
        <path d="M104 151Q111 145 119 146" stroke="#fff4e5" opacity=".66" stroke-width="1.7" fill="none"/>` : ''}
      <path d="${outline}" fill="#fff8e9" stroke="${p.skinInk}" stroke-width="1.2"/>
      <ellipse cx="121" cy="165" rx="11.4" ry="12.4" fill="${p.iris}" stroke="${p.ink}" stroke-width="1.6"/>
      <ellipse cx="121" cy="164" rx="6.8" ry="8.3" fill="${p.ink}"/>
      <circle cx="${mirrored ? 125 : 117}" cy="159.8" r="3.5" fill="#fffaf4"/>
      <circle cx="${mirrored ? 116 : 126}" cy="170" r="1.5" fill="#fff2cb"/>
      ${simpleLid
        ? `<path d="M100 164C109 149 129 149 140 164" stroke="${p.ink}" fill="none" stroke-width="2.4"/>`
        : `<path d="M94 159Q98 163 101 163C110 149 128 148 140 164C130 153 114 153 105 164L101 168Q98 166 94 159Z" fill="${p.ink}"/>
           <path d="M102 162Q98 161 96 156M106 157Q102 154 101 151" fill="none" stroke="${p.ink}" stroke-width="2.3"/>`}
    </g>`;
  }

  function cheekStamp(stamp) {
    const decoration = {
      star: '<path d="m0-12 3.9 7.5 8.3 1.3-6.1 5.9 1.4 8.3L0 7.1-7.5 11l1.4-8.3-6.1-5.9 8.3-1.3Z" fill="#ffd55d" stroke="#a96e40" stroke-width="1.6"/>',
      heart: '<path d="M0-4C-8-15-20-5-10 5L0 14L10 5C20-5 8-15 0-4Z" fill="#ef7997" stroke="#a94f66" stroke-width="1.6"/>',
      flower: flower(0, 0, .72, '#ffdce9', '#f0b643'),
      moon: `<path d="M4-13C-4-9-5-1 0 4Q5 9 12 5C8 16-7 16-12 6C-17-5-7-16 4-13Z" fill="#fae9a2" stroke="#9d7d4b" stroke-width="1.5"/>
        <path d="m10-12 1.4 3.6L15-7l-3.6 1.4L10-2l-1.4-3.6L5-7l3.6-1.4Z" fill="#fff5cd" stroke="#ac8355" stroke-width=".9"/>`,
      butterfly: `<g stroke="#845e95" stroke-width="1.3">
        <path d="M-1 0C-13-15-19-12-16-3Q-15 2-9 4C-16 8-10 15-5 10Q-2 7 0 3Q3 11 9 11Q17 10 11 3Q18 0 16-8Q13-15 2-3Z" fill="#c5a7e5"/>
        <path d="M-12-6Q-8-5-5-1M12-6Q8-5 5-1" fill="none" stroke="#fff0d9" stroke-width="2.3"/>
        <path d="M0-4v11m0-11-2-3m2 3 2-3" fill="none" stroke="#745377" stroke-width="1.8"/>
      </g>`,
      rainbow: `<g fill="none" stroke-width="3.5">
        <path d="M-12 5a12 12 0 0 1 24 0" stroke="#d76980"/>
        <path d="M-8.5 5a8.5 8.5 0 0 1 17 0" stroke="#ffdb79"/>
        <path d="M-5 5a5 5 0 0 1 10 0" stroke="#71b7b1"/>
        </g><path d="M-16 7q-2-4 2-5 2-5 5-2 3-1 4 2 3 3-1 5Z" fill="#fff2e4" stroke="#b69aab" stroke-width="1"/>`,
      sun: `<g stroke="#ab764c" stroke-width="1.25">
        <path d="m0-15 2.6 4.7-2.6 1-2.6-1Zm15 15-4.7 2.6-1-2.6 1-2.6ZM0 15l-2.6-4.7 2.6-1 2.6 1Zm-15-15 4.7-2.6 1 2.6-1 2.6Z" fill="#ffce68"/>
        <path d="M-10-10l2 2M10-10 8-8M10 10 8 8M-10 10l2-2" stroke="#d19b4c" stroke-width="2.4"/>
        <circle r="7.5" fill="#ffdc7a"/><path d="M-3-3q2-2 5-1" fill="none" stroke="#fff5d1" stroke-width="1.8"/>
      </g>`,
      cherry: `<path d="M-7 4Q-4-4 3-10Q3-3 8 2" fill="none" stroke="#587e64" stroke-width="2"/>
        <path d="M2-8Q5-16 13-12Q10-6 2-8Z" fill="#84b58c" stroke="#547e64" stroke-width="1.1"/>
        <g fill="#d85470" stroke="#96506a" stroke-width="1.35"><circle cx="-7" cy="6" r="6"/><circle cx="8" cy="4" r="6.1"/></g>
        <path d="M-10 4q1-2 3-2M5 2q1-2 3-2" fill="none" stroke="#ffe1dc" stroke-width="1.8"/>`,
    }[stamp];
    if (typeof decoration !== 'string') return '';
    return `<g transform="translate(210 190) rotate(14)">
      ${decoration}<path d="m13 12 1-3 1 3 3 1-3 1-1 3-1-3-3-1Z" fill="#ffedc2"/>
      <circle cx="-15" cy="-7" r="1.9" fill="#fff3c7"/>
    </g>`;
  }

  function renderStampPreview(stamp) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="188 168 44 44" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${cheekStamp(stamp)}</svg>`;
  }

  const hairstyles = {
    waves: moonHair, puffs: sunHair, bob: bobHair, braid: braidHair,
    ponytail: ponytailHair, buns: bunsHair, straight: straightHair, pixie: pixieHair,
    quiff: quiffHair, curls: curlyCropHair, parted: partedHair,
  };

  const capColors = {
    cap: ['Azul','#538cb3','#384e77'], capRed: ['Roja','#d66865','#913f48'],
    capGreen: ['Verde','#68a780','#386d55'], capGold: ['Amarilla','#edc55f','#ab823d'],
    capPurple: ['Morada','#a389c5','#715688'], capBlack: ['Negra','#515564','#323641']
  };
  const boyAccessories = new Set([...Object.keys(capColors),'beanie','headphones','sunglasses','glasses','mask']);
  function accessoryArt(accessory) {
    if (Object.hasOwn(capColors, accessory)) return `<g stroke="#354561" stroke-width="3"><path d="M76 107Q74 38 139 29Q205 14 235 89L207 105Z" fill="${capColors[accessory][1]}"/><path d="M77 104Q149 67 227 86Q250 86 268 100Q222 98 177 113Q117 126 77 110Z" fill="${capColors[accessory][2]}"/></g>`;
    if (accessory === 'beanie') return '<g stroke="#785746" stroke-width="3"><path d="M76 107Q69 33 146 23Q228 14 241 100Z" fill="#d99852"/><path d="M72 94Q146 66 239 88L242 112Q157 92 74 119Z" fill="#efb66e"/><circle cx="149" cy="22" r="13" fill="#bf7543"/></g>';
    if (accessory === 'headphones') return '<g stroke="#354059"><path d="M71 169V131C65 18 247 12 249 132V169" fill="none" stroke-width="12"/><g fill="#539a96" stroke-width="4"><rect x="57" y="141" width="27" height="54" rx="12"/><rect x="236" y="141" width="27" height="54" rx="12"/></g></g>';
    if (accessory === 'sunglasses') return '<g stroke="#31394b" stroke-width="5"><path d="M76 154L93 157M145 158Q160 151 175 158M225 157L244 152" fill="none"/><path d="M91 151Q112 145 147 152Q146 178 128 180Q98 187 91 151ZM173 152Q205 145 229 151Q225 180 199 181Q178 182 173 152Z" fill="#50677c"/></g>';
    if (accessory === 'glasses') {
      return `<g stroke="#94546d" stroke-linejoin="round">
        <path d="M79 154L92 159M228 159L241 154" stroke-width="5" fill="none"/>
        <path d="M147 161Q160 152 173 161" stroke-width="3.8" fill="none"/>
        <g fill="#ffe4ee" fill-opacity=".13" stroke-width="4.3">
          <path d="M92 152C105 146 130 146 144 151Q150 155 147 168C145 180 138 186 123 186C106 187 96 180 93 168Q89 158 92 152Z"/>
          <path d="M228 152C215 146 190 146 176 151Q170 155 173 168C175 180 182 186 197 186C214 187 224 180 227 168Q231 158 228 152Z"/>
        </g>
        <path d="M97 154L104 152M178 154L185 152" stroke="#f6b7cf" stroke-width="1.8"/>
        <circle cx="92" cy="156" r="2.1" fill="#e8b870" stroke="none"/><circle cx="228" cy="156" r="2.1" fill="#e8b870" stroke="none"/>
      </g>`;
    }
    if (accessory === 'earrings') {
      const jewel = `<circle r="3.4" fill="#ffe3a4" stroke="#ab7745" stroke-width="1.6"/>
        <ellipse cy="9" rx="4.7" ry="7.5" fill="none" stroke="#c58b46" stroke-width="2.5"/>
        <path d="M0 13Q4 16 7 21Q8 25 0 30Q-8 25-7 21Q-4 16 0 13Z" fill="#58bfb3" stroke="#428a88" stroke-width="1.6"/>
        <path d="m0 16 2 5-2 5-2-5Z" fill="#cff4d8"/>`;
      return `<g transform="translate(75 187) rotate(6)">${jewel}</g><g transform="translate(245 187) rotate(-6)">${jewel}</g>`;
    }
    if (accessory === 'crown') {
      return `<g stroke="#aa7447" stroke-width="2.1">
        <path d="M121 59L110 27L138 42L143 21L154 35L164 9L176 36L191 19L191 42L213 27L203 61Q162 52 121 59Z" fill="#f4c963"/>
        <path d="M120 53Q160 45 204 54L202 62Q159 54 122 61Z" fill="#ffdfa0"/>
        <g fill="#ffebae" stroke-width="1.6"><circle cx="110" cy="27" r="3.5"/><circle cx="143" cy="21" r="3"/><circle cx="164" cy="9" r="3.8"/><circle cx="191" cy="19" r="3"/><circle cx="213" cy="27" r="3.5"/></g>
        <path d="m163 33 7 8-7 10-7-10Z" fill="#c378ae" stroke="#925d87"/><path d="m163 36 2 5-2 4-2-4Z" fill="#ffe0e9" stroke="none"/>
        <g fill="#a8d9cd" stroke-width="1.2"><circle cx="134" cy="47" r="3"/><circle cx="191" cy="47" r="3"/></g>
      </g>`;
    }
    if (accessory === 'bow') {
      return `<g transform="translate(121 54) rotate(-16)" stroke="#477b96" stroke-width="2.3">
        <path d="M-6 4Q-10 19-23 31l10-2 3 8Q1 22 4 10Q9 23 17 28l1-8 9 2Q16 12 11 2Z" fill="#73b6cd"/>
        <path d="M-3-4C-18-14-34-25-42-19Q-48-11-42 9Q-40 18-31 15Q-17 12-3 5ZM6-3C17-11 30-21 37-17Q45-9 42 8Q41 16 32 14Q16 11 6 5Z" fill="#99d6df"/>
        <path d="M-37-13Q-25-10-16-3M36-12Q26-10 19-5" fill="none" stroke="#d6f4ec" stroke-width="2.5"/>
        <path d="M-29 5Q-18 1-8 1M33 5Q20 1 11 1" fill="none" stroke="#659cad" stroke-width="1.8"/>
        <rect x="-7" y="-7" width="17" height="16" rx="5" fill="#fcde9a" stroke="#ab8059"/>
        <path d="M-3-3h7" stroke="#fff4ce" stroke-width="2"/>
      </g>`;
    }
    if (accessory === 'tiara') {
      return `<g>
        <path d="M81 108Q91 63 128 51Q161 36 191 52Q225 63 239 101" fill="none" stroke="#6b805b" stroke-width="6"/>
        <path d="M82 107Q96 68 125 56M189 54q31 9 47 41" fill="none" stroke="#dcb76b" stroke-width="2"/>
        <g fill="#88b39b" stroke="#5a806f" stroke-width="1.6">
          <path d="M103 76Q103 61 114 58Q119 66 103 76ZM122 55Q117 40 123 36Q133 45 122 55Z"/>
          <path d="M140 47Q142 34 154 33Q152 43 140 47ZM175 47Q180 34 190 35Q186 45 175 47Z"/>
          <path d="M198 56Q205 45 215 48Q210 57 198 56ZM224 79Q232 66 240 70Q236 77 224 79Z"/>
        </g>
        ${flower(89, 88, .62, '#ffe8b1', '#d89965')}
        ${flower(111, 65, .78, '#c8b5df', '#facf7c')}
        ${flower(141, 49, .84, '#f3b6c4', '#f2c264')}
        ${flower(169, 45, .92, '#fff0cb', '#e7af65')}
        ${flower(198, 56, .82, '#ddc4eb', '#edb867')}
        ${flower(223, 76, .68, '#f2a8b8', '#f0c96f')}
      </g>`;
    }
    if (accessory === 'clip') {
      return `<g transform="translate(102 114) rotate(-34)" stroke="#aa7350" stroke-width="1.9">
        <path d="M-23 5Q-31 0-22-6Q-4-13 19-9Q28-7 22-2Q0 6-19 8Z" fill="#f4c978"/>
        <path d="M-18 2Q-4-6 16-6Q0 0-18 2Z" fill="#b88162"/>
        <path d="M-10-6Q1-9 14-8" fill="none" stroke="#ffe7ae" stroke-width="1.7"/>
        <path d="m-3-10 6 5-6 5-6-5Z" fill="#89cbc4" stroke="#617f77" stroke-width="1.3"/>
        <path d="m11-10 4 3.7-4 3.8-4-3.8Z" fill="#efad9d" stroke="#af7e6d" stroke-width="1.1"/>
      </g>`;
    }
    if (accessory === 'mask') {
      return `<g stroke="#624776" stroke-width="2.2">
        <path d="M70 144Q80 150 91 153M229 153Q244 149 250 141" fill="none" stroke="#8a699c" stroke-width="4.5"/>
        <path fill-rule="evenodd" d="M78 130C97 136 118 137 137 145Q150 149 160 156Q170 149 183 145C202 137 223 136 242 130C235 141 234 153 230 166Q223 182 207 185Q191 190 177 179Q169 173 163 166Q160 164 157 167Q149 176 142 180Q128 190 113 185Q96 182 90 168C85 156 85 141 78 130Z
          M97 160Q119 142 144 160Q145 171 132 177Q117 183 105 173Q101 169 97 160Z
          M223 160Q201 142 176 160Q175 171 188 177Q203 183 215 173Q219 169 223 160Z" fill="#ab8cca"/>
        <path d="M88 138Q100 142 113 143M232 138Q221 142 207 143" fill="none" stroke="#e4d3ec" stroke-width="2.2"/>
        <path d="m160 152 4 5-4 6-4-6Z" fill="#ffd693" stroke="#aa7b57" stroke-width="1.2"/>
        <g fill="#ffe7ae" stroke="none"><circle cx="94" cy="149" r="2"/><circle cx="100" cy="148" r="1.45"/><circle cx="226" cy="149" r="2"/><circle cx="220" cy="148" r="1.45"/></g>
      </g>`;
    }
    if (accessory === 'headband') {
      return `<g stroke="#915273" stroke-width="2.4">
        <path d="M72 120C68 73 106 31 153 28C209 23 255 63 249 120L241 113C240 75 205 41 160 42C117 42 85 73 81 114Z" fill="#d488a7"/>
        <path d="M91 75C111 46 139 33 167 34Q196 34 216 51" fill="none" stroke="#f1b3cc" stroke-width="2.5"/>
        <g fill="#fff2d2" stroke="none">
          <circle cx="83" cy="91" r="2.3"/><circle cx="99" cy="61" r="2.4"/><circle cx="124" cy="44" r="2.5"/>
          <circle cx="148" cy="36" r="2.6"/><circle cx="175" cy="35" r="2.6"/><circle cx="201" cy="43" r="2.5"/>
          <circle cx="222" cy="59" r="2.4"/><circle cx="238" cy="83" r="2.3"/><circle cx="245" cy="104" r="1.9"/>
        </g>
      </g>`;
    }
    return '';
  }

  function xmlText(value) {
    return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ud800-\udfff\ufffe\uffff]/gu, '�').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
    })[char]);
  }

  function smile(characterId, color, p, id) {
    const mouth = characterId === 'iris'
      ? 'M135 214Q145 211 154 212Q158 212 160 214Q165 210 170 211Q178 212 186 211Q175 231 159 231Q143 229 135 214Z'
      : 'M135 215Q145 212 154 212Q158 212 160 214Q163 211 169 212Q179 212 185 214Q175 230 159 230Q143 229 135 215Z';
    return `<path d="${mouth}" fill="${color}" stroke="${p.skinInk}" stroke-width="1.35"/>
      <path d="${mouth}" fill="url(#${id}-lip)"/>
      ${characterId === 'iris'
        ? `<path d="M137 215Q158 220 183 213Q160 232 137 215Z" fill="#fff4df" stroke="${p.skinInk}" stroke-width="1.25"/>
           <path d="M189 211Q190 212 189 215" fill="none" stroke="${p.skinInk}" stroke-width="1.3"/>`
        : `<path d="M135 215Q157 225 185 214" fill="none" stroke="${p.ink}" stroke-width="1.8"/>`}
      <path d="M155 226Q161 227 166 225" fill="none" stroke="#ffe2d8" stroke-width="1.8" opacity=".76"/>`;
  }

  function relaxedSmile(characterId, color, p, painted) {
    const open = characterId === 'nico' || characterId === 'dani';
    return `<path d="M135 214Q146 214 157 215Q162 216 167 214Q176 213 185 211Q175 227 159 227Q145 226 135 214Z" fill="${color}" fill-opacity="${painted ? 1 : .7}" stroke="${p.skinInk}" stroke-width="1.3"/>
      ${open ? `<path d="M137 215Q162 221 183 212Q174 222 160 223Q148 222 137 215Z" fill="#fff3dd" stroke="${p.skinInk}" stroke-width="1.15"/>`
        : `<path d="M135 214Q159 225 185 211" fill="none" stroke="${p.skinInk}" stroke-width="1.8"/>`}`;
  }

  function renderFacePreview(characterId, look, faceShape) {
    const character = characters.find(({ id }) => id === characterId) || characters[0];
    const skin = choice(skinTones, look?.skinTone) || palettes[character.id];
    const face = choice(faceShapes, faceShape) || choice(faceShapes, character.face) || originalFace;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="56 49 208 238" role="img" aria-label="Cara: ${face.label}" stroke-linejoin="round" stroke-linecap="round">
      <path d="${face.path}" fill="${skin.skin}" stroke="${skin.skinInk}" stroke-width="4"/>
      <g fill="none" stroke="${skin.skinInk}" stroke-width="3.2"><path d="M109 153Q119 148 130 151M190 151Q201 148 211 153M160 177L157 190Q160 192 163 190M143 211Q159 225 178 209"/></g>
      <g fill="${palettes[character.id].ink}"><ellipse cx="121" cy="167" rx="4.5" ry="6"/><ellipse cx="199" cy="167" rx="4.5" ry="6"/></g>
    </svg>`;
  }

  function renderPortrait(characterId, look = {}, prefix = 'portrait', displayName, fullOutfit = false) {
    const character = characters.find(({ id }) => id === characterId) || characters[0];
    const id = String(prefix).replace(/[^\w-]/g, '-') + '-' + character.id;
    const style = character.gender === 'boy'
      ? { ...look, lips: null, eyes: null, cheeks: null, stamp: null }
      : look || {};
    const base = palettes[character.id];
    const p = { ...base, ...choice(skinTones, style.skinTone), iris: choice(eyeColors, style.eyeColor)?.iris || base.iris };
    const hairPalette = choice(hairColors, style.hairColor) || base;
    const face = choice(faceShapes, style.faceShape) || choice(faceShapes, character.face) || originalFace;
    const earDetail = `<path d="M72 169Q79 166 82 181M248 169Q241 166 238 181" fill="none" stroke="${p.skinInk}" stroke-width="1.8"/>`;
    const faceClip = face === originalFace ? '' : ` clip-path="url(#${id}-face)"`;
    const shadow = validColor(style.eyes);
    const lips = validColor(style.lips) || p.lip;
    const cheeks = validColor(style.cheeks);
    const haircut = Object.hasOwn(hairstyles, style.hair) && (character.gender !== 'boy' || boyHaircuts.has(style.hair))
      ? style.hair : character.hair;
    const hair = hairstyles[haircut](id, hairPalette, face);
    const allowedDress = Object.hasOwn(dresses, style.dress) && (character.gender !== 'boy' || style.dress.endsWith('Suit'));
    const garment = allowedDress || Object.hasOwn(outfits, style.dress) ? style.dress : character.outfit;
    const casualOutfit = choice(outfits, garment);
    const clothes = casualOutfit ? casualOutfit.draw() : dresses[garment](id, p);
    const neckStyle = style.neckStyle || (garment.endsWith('Suit') ? 'bow' : '');
    const neckColor = validColor(style.neckColor) || '#78394a';
    let neckwear = '';
    if (neckStyle === 'tie') {
      neckwear = `<g fill="${neckColor}" stroke="#503d4b" stroke-width="1"><path d="M157 164h6l3 31-6 7-6-7Z"/><path d="M154 157h12l-3 9h-6Z"/></g>`;
    } else if (neckStyle === 'bow') {
      neckwear = `<g fill="${neckColor}" stroke="#503d4b" stroke-width="1"><path d="M147 155l13 5 13-5v15l-13-6-13 6Z"/><rect x="157" y="158" width="6" height="8" rx="2"/></g>`;
    }
    const customShoe = validColor(style.slippers) || validColor(style.formalShoes);
    const shoe = customShoe || casualOutfit?.shoe || shoeColors[garment] || p.dress;
    const simpleLid = character.gender === 'boy';
    // Cosmetics use the close-up coordinate system. Zooming the entire figure
    // by the inverse head transform gives both views exactly the same anatomy.
    const { x, y, scale } = headPlacement;
    const headTransform = `translate(${x} ${y}) scale(${scale})`;
    const veil = validColor(style.veil);
    const bouquet = validColor(style.bouquet);
    const blossoms = bouquet ? [[66,238],[80,230],[92,240],[77,246]].map(([cx,cy]) =>
      `<g transform="translate(${cx} ${cy})" fill="${bouquet}" stroke="#996c78" stroke-width=".8">
        ${[0,72,144,216,288].map(angle => `<ellipse cy="-4" rx="4" ry="5" transform="rotate(${angle})"/>`).join('')}
        <circle r="2.8" fill="#f8da88"/></g>`).join('') : '';
    const zoom = fullOutfit ? '' : ` transform="scale(${1 / scale}) translate(${-x} ${-y})"`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 ${fullOutfit ? 550 : 336}" role="img" aria-labelledby="${id}-title" stroke-linecap="round" stroke-linejoin="round">
      <title id="${id}-title">Retrato de ${xmlText(displayName || character.name)}</title>
      ${definitions(id, p, cheeks || '#e48082', hairPalette)}
      ${faceClip ? `<defs><clipPath id="${id}-face"><path d="${face.path}"/></clipPath></defs>` : ''}
      <g${zoom}>
      ${veil ? `<g data-veil="${veil}" stroke="#b9a8b7" stroke-width="1.3"><path d="M111 72Q117 27 158 25Q202 25 210 78C232 220 234 395 297 496Q284 511 266 502Q249 520 226 510Q205 518 189 506L158 91L132 506Q113 519 92 509Q71 520 54 507Q34 516 22 498C81 391 92 217 111 72Z" fill="${veil}" fill-opacity=".78"/><path d="M117 80Q99 378 51 497M202 80Q221 382 269 494" fill="none" stroke="#fff" opacity=".8"/></g>` : ''}
      <g transform="${headTransform}">${hair.back}</g>
      ${fullOutfit ? legsAndShoes(id, p, shoe, !!casualOutfit && !customShoe, customShoe && (style.slippers ? 'ribbon' : 'lace')) : ''}
      ${arms(id, p)}
      ${shoulders(id, p, face.chin)}
      <g data-garment="${garment}">${clothes}${neckwear}</g>
      <g transform="${headTransform}">
      <g fill="url(#${id}-skin)" stroke="${p.skinInk}" stroke-width="2.2">
        <path d="M86 161C65 147 60 169 71 186Q77 194 89 191ZM234 161C255 147 260 169 249 186Q243 194 231 191Z"/>
        ${faceClip ? earDetail : ''}
        <path d="${face.path}"/>
      </g>
      ${faceClip ? '' : earDetail}
      <g${faceClip} fill="url(#${id}-blush)" opacity="${cheeks ? '.95' : '.34'}">
        <ellipse cx="109" cy="190" rx="26" ry="14" transform="rotate(9 109 190)"/>
        <ellipse cx="211" cy="190" rx="26" ry="14" transform="rotate(-9 211 190)"/>
      </g>
      ${eye(p, shadow, false, simpleLid)}${eye(p, shadow, true, simpleLid)}
      <path d="M157 180Q158 188 154 192Q150 196 156 198M162 198Q165 198 167 196" fill="none" stroke="${p.skinInk}" stroke-width="2" opacity=".85"/>
      <path d="M155 187Q156 184 157 182" stroke="#fff5dc" opacity=".7" stroke-width="2.1" fill="none"/>
      <g fill="${p.skinInk}" opacity=".58"><circle cx="111" cy="188" r="1.35"/><circle cx="118" cy="191" r="1.15"/><circle cx="123" cy="187" r="1.35"/><circle cx="131" cy="190" r=".9"/><circle cx="189" cy="187" r="1.1"/><circle cx="195" cy="190" r="1.4"/><circle cx="202" cy="187" r="1.3"/></g>
      ${simpleLid ? relaxedSmile(character.id, lips, p, validColor(style.lips)) : smile(character.id, lips, p, id)}
      <g${faceClip}>${cheekStamp(style.stamp)}</g>
      ${hair.front}
      ${accessoryArt(character.gender !== 'boy' || boyAccessories.has(style.accessory) ? style.accessory : null)}
      </g>
      ${bouquet && fullOutfit ? `<g data-bouquet="${bouquet}"><path d="M66 238L84 272M80 230L84 272L92 240" fill="none" stroke="#59835f" stroke-width="3"/><path d="M80 258q-14-1-17-13q14 0 17 13m3 0q2-17 15-16q-3 12-15 16" fill="#719c64"/>${blossoms}<path d="m80 264 7-2" stroke="#f7d8ad" stroke-width="4"/></g>` : ''}
      </g>
    </svg>`;
  }

  window.MakeupArt = { characters, boyHaircuts, boyAccessories, capColors, casualOutfits: Object.keys(outfits), appearanceChoices, renderPortrait, renderStampPreview, renderFacePreview };
})();
