var assert = require('chai').assert;

const lib = require('../..');
var BB = lib.BoundingBox;

describe('BoundingBox', function() {

  it('is initialized', function() {
    var bb = new BB();

    assert.equal(bb.minX, Infinity);
    assert.equal(bb.maxX, -Infinity);
    assert.equal(bb.maxY, -Infinity);
    assert.equal(bb.minY, Infinity);
  });

  it('can expand by a point', function() {
    var bb = new BB();

    bb.expandByPoint(10, 30);

    assert.equal(bb.minX, 10);
    assert.equal(bb.maxX, 10);
    assert.equal(bb.maxY, 30);
    assert.equal(bb.minY, 30);

    bb.expandByPoint(-5, 2);

    assert.equal(bb.minX, -5);
    assert.equal(bb.maxX, 10);
    assert.equal(bb.maxY, 30);
    assert.equal(bb.minY, 2);

    bb.expandByPoint(17, 7);

    assert.equal(bb.minX, -5);
    assert.equal(bb.maxX, 17);
    assert.equal(bb.maxY, 30);
    assert.equal(bb.minY, 2);

    bb.expandByPoint(3, -9);

    assert.equal(bb.minX, -5);
    assert.equal(bb.maxX, 17);
    assert.equal(bb.maxY, 30);
    assert.equal(bb.minY, -9);

    assert.equal(bb.width, 22);
    assert.equal(bb.height, 39);
  });

  it('can expand by a box', function() {
    var bb1 = new BB();
    bb1.expandByPoint(10, 20);
    bb1.expandByPoint(15, 27);

    var bb2 = new BB();
    bb2.expandByPoint(19, -7);

    bb1.expandByBox(bb2);

    assert.equal(bb1.minX, 10);
    assert.equal(bb1.maxX, 19);
    assert.equal(bb1.maxY, 27);
    assert.equal(bb1.minY, -7);
  });

  it('can expand by a translated box', function() {
    var bb1 = new BB();
    bb1.expandByPoint(0, 0);
    bb1.expandByPoint(20, 10);

    var bb2 = new BB();
    bb2.expandByTranslatedBox(bb1, -7, 23);

    assert.equal(bb2.minX, -7);
    assert.equal(bb2.maxX, 13);
    assert.equal(bb2.maxY, 33);
    assert.equal(bb2.minY, 23);
  });

});
