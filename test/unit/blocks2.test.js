'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8');

describe('blocks2', () => {

  it('can parse the blocks', () => {
    const blocks = lib.parseString(dfxContents).blocks;
    assert.deepEqual(blocks.length, 3);
    assert.deepEqual(blocks[0], {
      name: '*Model_Space',
      x: 0,
      xref: '',
      y: 0,
      z: 0,
    });
    assert.deepEqual(blocks[1], {
      name: '*Paper_Space',
      x: 0,
      xref: '',
      y: 0,
      z: 0,
    });
    const entities = blocks[2].entities;
    delete(blocks[2]['entities']);
    assert.deepEqual(blocks[2], {
      name: 'a',
      x: 0,
      xref: '',
      y: 0,
    });
    assert.deepEqual(entities.length, 5);
  });

});
