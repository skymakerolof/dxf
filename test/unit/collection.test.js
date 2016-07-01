var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');

describe.skip('Collection', function() {

  it('can parsed from a string', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/float0.dxf', 'utf-8'));

    assert.equal(collection.lwpolylines.length, 3);
    assert.equal(collection.inserts.length, 3);
    assert.isObject(collection.blocks['test']);
    assert.equal(collection.blocks['test'].entities.lwpolylines.length, 3);
  });

  it('can collect entities from inserts and keep the transforms independent', function() {
    var collection = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8'));

    var dE = collection.gatherDisplayEntities();
    assert.deepEqual(dE.circles[0].transform, {
      x: 31.21320343559643,
      y: 75.35533905932738,
      xScale: 1,
      yScale: 1,
      rotation: 45,
    });
    assert.deepEqual(dE.circles[1].transform, {
      rotation: 15.00000000000001,
      x: 66.92130429902463,
      xScale: 2,
      y: 59.34255665976439,
      yScale: 1,
    });
  });

  // Turns out thet LibreCAD doesn't do this correctly, so
  // do NOT use it to verify. This test example can be found
  // here: http://www.artwork.com/acad/engine/dxf2gbr8.htm
  //
  // number were removed for brevity.
  //
  // Verified correct behaviour using
  // - Autodesk Viewer: https://a360.autodesk.com/viewer/
  // - eDrawings viewer: http://www.edrawingsviewer.com/ed/download.htm
  it('can gather entities with transforms for display', function() {
    var c = dxf.parseString(
      fs.readFileSync(__dirname + '/../resources/float0.dxf', 'utf-8'));

    var e1 = c.gatherDisplayEntities();
    assert.equal(e1.lwpolylines.length, 12);

    var e2 = c.gatherDisplayEntities('*');
    assert.equal(e2.lwpolylines.length, 12);

    var e3 = c.gatherDisplayEntities('0');
    assert.equal(e3.lwpolylines.length, 2);

    assert.deepEqual(e3.lwpolylines[0].transform, {
      x: 0,
      y: 0,
      xScale: 1,
      yScale: 1,
      rotation: 0,
    });
    assert.deepEqual(e3.lwpolylines[1].transform, {
      x: 0.76,
      y: 4.4,
      xScale: 1,
      yScale: 1,
      rotation: 0,
    });

    var e4 = c.gatherDisplayEntities('L1');
    assert.equal(e4.lwpolylines.length, 5);

    var e5 = c.gatherDisplayEntities('L2');
    assert.equal(e5.lwpolylines.length, 5);

    var e6 = c.gatherDisplayEntities(['L1', 'L2']);
    assert.equal(e6.lwpolylines.length, 10);
  });

});
