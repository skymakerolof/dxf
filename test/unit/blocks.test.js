var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var floorPlan1 = fs.readFileSync(__dirname + '/../resources/floorplan.dxf', 'utf-8');

describe('blocks', function() {

  it('can parsed from a string', function() {
    var parser = dxf.createParser();

    var blocks = [];
    parser.on('block', function(block) {
      blocks.push(block);
    });
    parser.parseString(floorPlan1);

    assert.equal(blocks.length, 147);
  });

});
