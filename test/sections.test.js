var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('..');

describe('sections', function() {

  var floorPlan1 = fs.readFileSync(__dirname + '/../examples/floorplan1.dxf', 'utf-8');

  it('can parsed from a string', function() {
    var result = dxf(floorPlan1);
    console.log(result);
    assert.isFalse(true);
  });

});