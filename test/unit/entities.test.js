'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/entities.dxf', 'utf-8');

describe('All Entities', () => {

  it('can be parsed or ignored silently', () => {
    const result = lib.parseString(dfxContents);
    assert.equal(result.blocks.length, 78);
    assert.equal(result.entities.length, 116);
  });

});
