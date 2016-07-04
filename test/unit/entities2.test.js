'use strict';

const fs = require('fs');
// const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/blocks2.dxf', 'utf-8');

describe('All Entities', () => {

  it('can be parsed', () => {
    const result = lib.parseString(dfxContents);

    result.blocks.forEach((b) => {
      if (b.name.indexOf('block') !== -1) {
        console.log('BLOCK', b);
      }
    });

    result.entities.forEach((e) => {
      if (e.type === 'INSERT') {
        console.log('INSERT', e);
      }
    });

  });

});
