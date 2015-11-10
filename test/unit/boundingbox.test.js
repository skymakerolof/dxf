var assert = require('chai').assert;

var BB = require('../../').BoundingBox;

describe('BoundingBox', function() {

  it('is initialized', function() {
    var bb = new BB();

    assert.equal(bb.left, Infinity);
    assert.equal(bb.right, -Infinity);
    assert.equal(bb.top, -Infinity);
    assert.equal(bb.bottom, Infinity);
  });

  it('can expand', function() {
    var bb = new BB();

    bb.expandByPoint(10, 30);

    assert.equal(bb.left, 10);
    assert.equal(bb.right, 10);
    assert.equal(bb.top, 30);
    assert.equal(bb.bottom, 30);

    bb.expandByPoint(-5, 2);

    assert.equal(bb.left, -5);
    assert.equal(bb.right, 10);
    assert.equal(bb.top, 30);
    assert.equal(bb.bottom, 2);

    bb.expandByPoint(17, 7);

    assert.equal(bb.left, -5);
    assert.equal(bb.right, 17);
    assert.equal(bb.top, 30);
    assert.equal(bb.bottom, 2);

    bb.expandByPoint(3, -9);

    assert.equal(bb.left, -5);
    assert.equal(bb.right, 17);
    assert.equal(bb.top, 30);
    assert.equal(bb.bottom, -9);

    assert.equal(bb.width, 22);
    assert.equal(bb.height, 39);
  });

  it('can expand by a translated box', function() {
    var bb1 = new BB();
    bb1.expandByPoint(0, 0);
    bb1.expandByPoint(20, 10);

    var bb2 = new BB();
    bb2.expandByTranslatedBox(bb1, -7, 23);

    assert.equal(bb2.left, -7);
    assert.equal(bb2.right, 13);
    assert.equal(bb2.top, 33);
    assert.equal(bb2.bottom, 23);
  });

});
