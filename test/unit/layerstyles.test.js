'use strict';

const fs = require('fs');
const keys = require('lodash.keys');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(
  __dirname + '/../resources/Ceco.NET-Architecture-Tm-53.dxf', 'utf-8');

describe.only('Layer Styles', () => {

  it('can be parsed', () => {
    const result = lib.parseString(dfxContents);
    const expected = {
      '0': {colorNumber: 7},
      'wall high': {colorNumber: 5},
      'wall low': {colorNumber: 140},
      texture: {colorNumber: 253},
      equipment: {colorNumber: 40},
      nivel: {colorNumber: 30},
      doorswindows: {colorNumber: 41},
      projection: {colorNumber: 134},
      names: {colorNumber: 7},
      Defpoints: {colorNumber: 7},
      topography: {colorNumber: 132},
      plants: {colorNumber: 83},
    };

    const reduced = {};
    keys(result.tables.layers).forEach(name => {
      const l = result.tables.layers[name];
      reduced[name] = {colorNumber: l.colorNumber};
    });
    assert.deepEqual(reduced, expected);
  });

});
