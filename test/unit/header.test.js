var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var floorPlan = fs.readFileSync(__dirname + '/../resources/floorplan.dxf', 'utf-8');

describe('header', function() {

  it('can parsed from a string', function() {
    var parser = dxf.createParser();

    var header;
    parser.on('header', function(h) {
      header = h;
    });

    parser.parseString(floorPlan);

    assert.deepEqual(header, {
      "extMin": {
        "x": -724.9812134527413,
        "y": -522.2677920555756,
        "z": 0,
      },
      "extMax": {
        "x": 239.4172364631111,
        "y": 416.2792808352739,
        "z": 0
      },
    });

  });

});
