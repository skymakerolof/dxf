'use strict';

const fs = require('fs');

const dxf = require('..');
const parsed = dxf.parseString(fs.readFileSync(
  './test/resources/Ceco.NET-Architecture-Tm-53.dxf', 'utf-8'));

// Open this SVG in your browser or other SVG viewer
const svg = dxf.toSVG(parsed);
fs.writeFileSync(__dirname + '/example.svg', svg, 'utf-8');
