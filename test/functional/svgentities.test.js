'use strict';

const fs = require('fs');
const lib = require('../..');

function createTest(type) {
  it(type, function() {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/' + type + '.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    const svg = lib.toSVG(byLayer);
    fs.writeFileSync(__dirname + '/output/' + type + '.output.svg', svg, 'utf-8');
  });
}

describe('svg entities', function() {
  createTest('lines');
  createTest('lwpolylines');
  createTest('circlesellipsesarcs');
  createTest('splines');
  createTest('blocks');
  createTest('blocks2');
  createTest('layers');
  createTest('supported_entities');
  createTest('empty');
  createTest('floorplan');
  createTest('polylines');
  createTest('Ceco.NET-Architecture-Tm-53');
});
