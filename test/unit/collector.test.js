var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var dxfContents = fs.readFileSync(__dirname + '/../resources/collectortest.dxf', 'utf-8');

describe('collector', function() {

  it('can parsed from a string', function() {
    var parser = dxf.createParser();

    var collector = dxf.createCollector(parser);
    parser.parseString(dxfContents);

    assert.equal(collector.circles.length, 2);
    assert.isObject(collector.blocks.fooblock);
    assert.equal(collector.blocks.fooblock.x, 0);
    assert.equal(collector.blocks.fooblock.y, 0);
  });

});
