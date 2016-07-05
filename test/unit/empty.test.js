const fs = require('fs');
const assert = require('chai').assert;
const keys = require('lodash.keys');

const lib = require('../..');

const dxfContents = fs.readFileSync(__dirname + '/../resources/empty.dxf', 'utf-8');

describe('Empty', function() {

  it('can parsed from a string', function() {
    const parsed = lib.parseString(dxfContents);
    assert.equal(parsed.blocks.length, 78);
    assert.equal(parsed.entities.length, 0);

    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), []);
  });

});
