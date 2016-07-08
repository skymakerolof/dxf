'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/polylines.dxf', 'utf-8');

describe('POLYLINE', () => {

  it('can be parsed', () => {
    const entities = lib.parseString(dfxContents).entities;
    assert.deepEqual(entities.length, 2);
    assert.deepEqual(entities[0], {
      closed: true,
      layer: 'DXF',
      type: 'POLYLINE',
      vertices: [
        { x: 286, y: 279.9999999999999, z: 0 },
        { x: 280, y: 286, z: 0 },
        { x: 20.00000000000011, y: 286, z: 0 },
        { x: 14.00000000000002, y: 280, z: 0 },
        { x: 14, y: 20.00000000000011, z: 0 },
        { x: 20, y: 14.00000000000002, z: 0 },
        { x: 279.9999999999999, y: 14, z: 0 },
        { x: 286, y: 20.00000000000011, z: 0 },
      ]
    });

  });

});
