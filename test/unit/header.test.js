var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var dfxContents = fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8');

describe('header', function() {

  it('can parsed from a string', function() {
    var parser = dxf.createParser();

    var header;
    parser.on('header', function(h) {
      header = h;
    });

    parser.parseString(dfxContents);

    assert.deepEqual(header, {
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
