'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/circlesellipsesarcs.dxf', 'utf-8');

describe.only('CIRCLE ELLIPSE ARC', () => {

  it('can be parsed', () => {
    const entities = lib.parseString(dfxContents).entities;
    assert.deepEqual(entities.length, 1);
    assert.deepEqual(entities[0], {
      type: 'CIRCLE',
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      x: 20,
      y: 30,
      r: 40,
    });

  });

});
