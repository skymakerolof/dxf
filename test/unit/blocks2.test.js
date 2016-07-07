'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/blocks2.dxf', 'utf-8');

describe('BLOCK', () => {

  it('can be parsed', () => {
    const blocks = lib.parseString(dfxContents).blocks;
    assert.deepEqual(blocks.length, 5);
    assert.deepEqual(blocks[0], {
      name: '*Model_Space',
      entities: [],
      x: 0,
      xref: '',
      y: 0,
      z: 0,
    });
    assert.deepEqual(blocks[1], {
      name: '*Paper_Space',
      entities: [],      
      x: 0,
      xref: '',
      y: 0,
      z: 0,
    });

    const entities2 = blocks[2].entities;
    delete(blocks[2]['entities']);
    assert.deepEqual(blocks[2], {
      name: 'block_insert',
      x: 0,
      xref: '',
      y: 0,
    });
    assert.deepEqual(entities2.length, 2);
    assert.deepEqual(entities2[0].type, 'INSERT');
    assert.deepEqual(entities2[1].type, 'INSERT');

    const entities3 = blocks[3].entities;
    delete(blocks[3]['entities']);
    assert.deepEqual(blocks[3], {
      name: 'block01',
      x: 0,
      xref: '',
      y: 0,
    });
    assert.deepEqual(entities3.length, 6);
    assert.deepEqual(entities3[0].type, 'LINE');
    assert.deepEqual(entities3[1].type, 'LINE');
    assert.deepEqual(entities3[2].type, 'LINE');
    assert.deepEqual(entities3[3].type, 'LINE');
    assert.deepEqual(entities3[4].type, 'ARC');
    assert.deepEqual(entities3[5].type, 'MTEXT');


    const entities4 = blocks[4].entities;
    delete(blocks[4]['entities']);
    assert.deepEqual(blocks[4], {
      name: 'block02',
      x: 0,
      xref: '',
      y: 0,
    });
    assert.deepEqual(entities4.length, 5);
    assert.deepEqual(entities4[0].type, 'LINE');
    assert.deepEqual(entities4[1].type, 'LINE');
    assert.deepEqual(entities4[2].type, 'LINE');
    assert.deepEqual(entities4[3].type, 'MTEXT');
    assert.deepEqual(entities4[4].type, 'ELLIPSE');

  });

});
