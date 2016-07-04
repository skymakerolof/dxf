'use strict';

const fs = require('fs');
const lib = require('../..');

function createTest(type) {
  it(type, function() {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/' + type + '.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);

    let polylines = [];
    for (let layer in byLayer) {
      polylines = polylines.concat(lib.layerToPolylines(byLayer[layer]));
    }
    const svg = lib.toSVG(polylines);
    fs.writeFileSync(__dirname + '/output/' + type + '.output.svg', svg, 'utf-8');
  });
}

describe('svg entities', function() {
  createTest('lines');
  createTest('lwpolylines');
  createTest('circlesellipsesarcs');
  createTest('splines');
  createTest('blocks');
  createTest('layers');
  createTest('spline_entities');
});
