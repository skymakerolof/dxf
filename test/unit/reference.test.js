'use strict';

const fs = require('fs');
const lib = require('../..');

const readContents = (filename) => {
  return fs.readFileSync(__dirname + '/../resources/' + filename, 'utf-8');
};

describe('Reference files dont\'t generate errors', function() {

  const createTest = function(filename) {
    return function() {
      this.timeout(5000);
      const parsed = lib.parseString(readContents(filename));
      const entities = lib.denormalise(parsed);
      entities.forEach(e => {
        lib.entityToPolyline(e);
      });
      lib.toSVG(parsed);
    };
  };

  it('entities.dxf', createTest('entities.dxf'));
  it('Ceco.NET-Architecture-Tm-53.dxf', createTest('Ceco.NET-Architecture-Tm-53.dxf'));
});
