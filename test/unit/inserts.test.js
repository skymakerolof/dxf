'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8');

describe('INSERT', () => {

  it('can be parsed', () => {
    const entities = lib.parseString(dfxContents).entities;
    assert.equal(entities.length, 2);

    assert.deepEqual(entities[0], {
      type: 'INSERT',
      block: 'a',
      lineTypeName: 'ByLayer',
      layer: '0',
      colorNumber: 256,
      columnCount: 1,
      columnSpacing: 1,
      rowCount: 1,
      rowSpacing: 1,
      rotation: 45,
      x: 31.21320343559643,
      y: 75.35533905932738,
      z: 0,
      xscale: 1,
      yscale: 1,
      zscale: 0,
    });

    assert.deepEqual(entities[1], {
      type: 'INSERT',
      block: 'a',
      lineTypeName: 'ByLayer',
      layer: '0',
      colorNumber: 256,
      columnCount: 1,
      columnSpacing: 2,
      rowCount: 1,
      rowSpacing: 1,
      rotation: 15.00000000000001,
      x: 66.92130429902463,
      y: 59.34255665976439,
      z: 0,
      xscale: 2,
      yscale: 1,
      zscale: 0,
    });

  });

});
