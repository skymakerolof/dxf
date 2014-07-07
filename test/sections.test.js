var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('..');

describe('sections', function() {

  var floorPlan1 = fs.readFileSync(__dirname + '/../examples/floorplan1.dxf', 'utf-8');

  it('can parsed from a string', function() {
    var parser = dxf.create();

    var polylines = [];
    parser.on('lwpolyline', function(polyline) {
      polylines.push(polyline);
    });

    parser.parseString(floorPlan1);

    assert.equal(polylines.length, 124);
  });

});