'use strict';
// All scenery shares one perspective so the dolls stand on the same floor.
window.schoolInterior = (() => {
  const rect = (x,y,w,h,color,r=3) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+color+'"/>';
  const table = (x,y,w) => rect(x+5,y+8,7,38,'#876447') + rect(x+w-12,y+8,7,38,'#876447') + rect(x,y,w,11,'#cc9566');
  const windowPane = rect(30,18,82,56,'#fff5da') + rect(35,23,32,46,'#acdae3') + rect(72,23,34,46,'#acdae3');
  const board = rect(150,17,154,66,'#ad865d') + rect(155,22,144,56,'#386451');
  const books = ['#d17b69','#94af86','#e6be72','#6b9aa8'].map((c,i)=>rect(348+i*10,58-i%2*5,8,27+i%2*5,c)).join('');
  const cabinet = rect(338,45,70,83,'#a98166') + rect(343,49,60,37,'#594c48') + books;
  const chair = (x,y) => rect(x,y,24,26,'#859d90')+rect(x,y+25,30,6,'#516e60')+rect(x+3,y+30,4,17,'#796956');
  const office = windowPane + cabinet + chair(204,85) + table(156,111,120);
  const lockers = Array.from({length:7},(_,i)=>rect(45+i*47,42,44,94,i%2?'#a6bbaf':'#96adac')+rect(52+i*47,52,24,3,'#647f78')+rect(78+i*47,91,3,11,'#546963')).join('');
  const clock = '<circle cx="315" cy="28" r="11" fill="#fff5d9" stroke="#896e58" stroke-width="2"/><path d="M315 28l-5 -2" stroke="#695846" stroke-width="2"/><path class="scene-clock" d="M315 28v-8" stroke="#695846" stroke-width="2"/>';
  const motion = {
    classroom: clock + '<path class="scene-chalk" d="M174 44h32m10 0h17m-59 12h50" fill="none" stroke="#e2ecd7" stroke-width="3"/>',
    hallway: clock,
    bathroom: '<path class="scene-drip" d="M277 90q-5 7 0 7t0-7" fill="#629ed1"/>',
    coordination: clock,
    direction: clock,
    nurse: clock,
    cafeteria: '<path class="scene-steam" d="M286 72q-6-8 0-14t0-12m12 23q-5-7 0-14" fill="none" stroke="#fff9e9" stroke-width="4"/><path d="M271 70h41q-2 10-20 10t-21-10" fill="#b77058"/>',
    yard: ''
  };
  function tree(x,y) {
    return '<g transform="translate('+x+' '+y+')">'+rect(-4,0,8,44,'#977552')+
      '<g fill="#6ca77b"><circle cy="-9" r="21"/><circle cx="-14" cy="1" r="15"/><circle cx="13" cy="1" r="17"/></g></g>';
  }
  const slide = '<g stroke="#678580" stroke-width="4" fill="none"><path d="M228 128V72h26v56M228 118h26m-26-13h26m-26-13h26"/><path d="M225 72V53h32v19"/></g><path d="M252 71c18 2 24 46 60 46h9v9h-13c-43 0-45-43-60-45Z" fill="#eaa166" stroke="#bd7851" stroke-width="2"/>';
  const hopscotch = '<g transform="translate(215 148) skewX(-18)" fill="none" stroke="#fff6d9" stroke-width="2"><path d="M0 0h22v12H0zm-11 12h44v12h-44zm22 0v12M0 24h22v12H0z"/></g>';
  const scenes = {
    classroom: [windowPane+board+cabinet+[36,166,296].map(x=>chair(x+35,99)+table(x,118,94)).join(''),'Pizarrón, librero y filas de pupitres'],
    hallway: [lockers,'Pasillo con casilleros'],
    bathroom: [rect(16,20,170,115,'#80aaae')+rect(26,26,68,102,'#a9cccb')+rect(107,26,68,102,'#a9cccb')+rect(235,20,128,50,'#b8deea')+rect(222,98,156,12,'#f9f7ea')+rect(237,109,125,27,'#90b8b3')+rect(293,84,5,15,'#84979a')+rect(276,85,19,5,'#84979a'),'Cubículos, espejo y lavabo'],
    coordination: [office+rect(164,99,21,12,'#dfab58')+rect(183,30,75,31,'#d6b57e')+rect(187,34,20,19,'#ffefc1'),'Mostrador, tablero de avisos y lonchera de objetos perdidos'],
    direction: [office+rect(182,29,58,40,'#92775a')+rect(187,34,48,30,'#fff1cd')+rect(226,85,37,24,'#53646b'),'Escritorio de la directora, computadora y diploma'],
    cafeteria: [rect(13,28,125,44,'#4e6d58')+rect(161,81,228,40,'#91b3a5')+rect(153,78,244,9,'#f2d8af')+[180,199,218].map(x=>'<circle cx="'+x+'" cy="72" r="8" fill="#c9634c"/>').join('')+table(30,134,122)+table(244,143,128),'Mostrador con fruta y mesas de comedor'],
    yard: [rect(0,0,440,128,'#bde4eb')+rect(0,108,440,112,'#b2ca91')+tree(22,65)+tree(386,62)+tree(420,80)+slide+hopscotch+'<path d="M30 131L78 29L129 131M78 29H168L211 131" fill="none" stroke="#a67557" stroke-width="7"/>'+'<g class="scene-swing">'+rect(110,32,3,65,'#987c67')+rect(137,32,3,65,'#987c67')+rect(106,95,36,7,'#cb8865')+'</g><circle class="scene-ball" cx="340" cy="126" r="13" fill="#d78d68"/>','Patio con árboles, columpio, resbaladilla, rayuela y pelota'],
    nurse: [windowPane+rect(332,32,68,66,'#fcf5e6')+rect(359,42,12,42,'#c56f6b')+rect(344,57,42,12,'#c56f6b')+table(62,119,181)+rect(58,105,186,16,'#aaccc5')+rect(64,94,48,13,'#faf4de'),'Camilla, almohada y botiquín']
  };
  return key => {
    const [art,label] = scenes[key];
    const outside = key === 'yard';
    const wall = rect(-2000,0,4440,220,outside ? '#bde4eb' : '#f1dfbb',0);
    const floor = rect(-2000,outside ? 108 : 124,4440,112,outside ? '#b2ca91' : '#d8b293',0);
    return '<svg viewBox="0 0 440 220" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+label+'">'+wall+floor+art+motion[key]+'</svg>';
  };
})();