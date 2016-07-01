'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8');

describe.only('header2', () => {

  it('can parse the header', () => {
    const parsed = lib.parseString(dfxContents);
    assert.deepEqual(parsed.header, {
      "extMin": {
        "x": 0,
        "y": 0,
        "z": 0,
      },
      "extMax": {
        "x": 100,
        "y": 99.2820323027551,
        "z": 0
      },
    });
  });

});
