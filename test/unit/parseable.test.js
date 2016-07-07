'use strict';

const fs = require('fs');
const lib = require('../..');

const readContents = (filename) => {
  return fs.readFileSync(__dirname + '/../resources/' + filename, 'utf-8');
};

describe('Reference files dont\'t generate errors', () => {

  const createTest = (filename) => {
    return () => {
      const parsed = lib.parseString(readContents(filename));
      const byLayer = lib.gatherByLayer(parsed);
      let polylines = [];
      for (let layer in byLayer) {
        polylines = polylines.concat(lib.layerToPolylines(byLayer[layer]));
      }
      lib.toSVG(polylines);
    };
  };

  // it('entities.dxf', createTest('entities.dxf'));
  it('Ceco.NET-Architecture-Tm-53.dxf', createTest('Ceco.NET-Architecture-Tm-53.dxf'));

});
