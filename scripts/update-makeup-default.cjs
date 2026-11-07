'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'estudio-de-maquillaje', 'colecciones', 'personajes-de-fabi.json');
const target = path.join(root, 'makeup', 'default-collection.js');
const collection = JSON.parse(fs.readFileSync(source, 'utf8'));

// Keep names and keys as JSON data, even if a name contains a quote or </script>.
const jsonString = JSON.stringify(JSON.stringify(collection))
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
const header = '// Archivo generado. Para actualizarlo, ejecuta node scripts/update-makeup-default.cjs.';
fs.writeFileSync(target, header + '\nwindow.MakeupDefaultCollection = JSON.parse(' + jsonString + ');\n');
