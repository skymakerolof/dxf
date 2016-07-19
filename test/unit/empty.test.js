'use strict';

const fs = require('fs');
const assert = require('chai').assert;

const lib = require('../..');

const dxfContents = fs.readFileSync(__dirname + '/../resources/empty.dxf', 'utf-8');

describe('Empty', function() {

  it('can parsed from a string', function() {
    const parsed = lib.parseString(dxfContents);
    assert.equal(parsed.blocks.length, 78);
    assert.equal(parsed.entities.length, 0);

    const entities = lib.denormalise(parsed);
    assert.deepEqual(entities, []);
  });

});
