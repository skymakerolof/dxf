var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var interpolate = dxf.interpolate;

describe('Interpolation', function() {

  it('can be created for line entities', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8'));

    var lines = interpolate(collection.gatherDisplayEntities());
    assert.equal(lines.length, 11);
    assert.deepEqual(lines[0], [ [ 0, 0 ], [ 100, 0 ] ]);
  });

  it('can be created for lwpolylines', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/lwpolylines.dxf', 'utf-8'));

    var lines = interpolate(collection.gatherDisplayEntities());
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

  it('can be created for circles, ellipses and arcs', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/circlesellipsesarcs.dxf', 'utf-8'));

    var lines = interpolate(collection.gatherDisplayEntities());
    assert.equal(lines.length, 5);
    assert.deepEqual(lines[0].length, 73);
    assert.deepEqual(lines[1].length, 73);
    assert.deepEqual(lines[2].length, 39);
    assert.deepEqual(lines[3].length, 40);
    assert.deepEqual(lines[4].length, 18);
  });

  it('can be created for splines', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/splines.dxf', 'utf-8'));

    var lines = interpolate(collection.gatherDisplayEntities());
    assert.equal(lines.length, 3);
    assert.deepEqual(lines[0].length, 100);
    assert.deepEqual(lines[1].length, 100);
    assert.deepEqual(lines[2].length, 100);
  });

  it('can be created for layers', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/layers.dxf', 'utf-8'));

    var lines = interpolate(collection.gatherDisplayEntities());
    assert.equal(lines.length, 9);
  });

  it('can be created for blocks', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8'));

    var polylines = interpolate(collection.gatherDisplayEntities());

    assert.equal(polylines.length, 10);
  });

});
