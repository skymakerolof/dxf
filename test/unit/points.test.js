'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/points.dxf', 'utf-8');

describe('POINT', () => {

  it('can be parsed', () => {
    const entities = lib.parseString(dfxContents).entities;
    assert.deepEqual(entities.length, 2);

    assert.deepEqual(entities[0], {
      type: "POINT",
      colorNumber: 256,
      layer: "0",
      lineTypeName: "ByLayer",
      x: 10,
      y: 20,
    });
    assert.deepEqual(entities[1], {
      type: "POINT",
      colorNumber: 256,
      layer: "0",
      lineTypeName: "ByLayer",
      x: 30,
      y: 10,
    });
  });

});
