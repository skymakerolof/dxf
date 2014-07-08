var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('..');
var floorPlan1 = fs.readFileSync(__dirname + '/../examples/floorplan1.dxf', 'utf-8');

describe('polylines', function() {


  it('can parsed from a string', function() {
    var parser = dxf.create();

    var entities = [];
    parser.on('lwpolyline', function(entity) {
      entities.push(entity);
    });

    parser.parseString(floorPlan1);

    assert.equal(entities.length, 124);
  });

});

describe('lines', function() {

  it('can parsed from a string', function() {
    var parser = dxf.create();

    var entities = [];
    parser.on('line', function(entity) {
      entities.push(entity);
    });

    parser.parseString(floorPlan1);

    assert.equal(entities.length, 624);
  });

});

describe('circles', function() {

  it('can parsed from a string', function() {
    var parser = dxf.create();

    var entities = [];
    parser.on('circle', function(entity) {
      entities.push(entity);
    });

    parser.parseString(floorPlan1);

    assert.equal(entities.length, 9);
  });

});