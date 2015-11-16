var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var toPolylines = dxf.toPolylines;

describe.only('Polylines', function() {

  it('can be created for line entities', function() {
    var parser = dxf.createParser();

    var collector = dxf.createCollector(parser);
    parser.parseString(fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8'));

    var lines = toPolylines(collector);
    assert.equal(lines.length, 11);
    assert.deepEqual(lines[0], [ [ 0, 0 ], [ 100, 0 ] ]);
  });

  it('can be created for lwpolylines', function() {
    var parser = dxf.createParser();

    var collector = dxf.createCollector(parser);
    parser.parseString(fs.readFileSync(__dirname + '/../resources/lwpolylines.dxf', 'utf-8'));

    var lines = toPolylines(collector);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], [
      [
        10,
        10,
      ],
      [
        90,
        10,
      ],
      [
        60,
        40,
      ],
      [
        30,
        20,
      ],
    ]);
  });

});
