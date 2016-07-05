'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const keys = require('lodash.keys');

const lib = require('../..');
const layerToPolylines = lib.layerToPolylines;

describe('Layer To Lines', () => {

  it('supports LINE', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const polylines = layerToPolylines(byLayer['0']);
    assert.equal(polylines.length, 11);
    assert.deepEqual(polylines[0], [ [ 0, 0 ], [ 100, 0 ] ]);
  });

  it('supports LWPOLYLINE', () => {

    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/lwpolylines.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const polylines = layerToPolylines(byLayer['0']);
    assert.equal(polylines.length, 2);
    assert.deepEqual(polylines[0], [
      [ 10, 40],
      [ 70, 0],
      [ 80, 20],
      [ 50, 60],
      [ 10, 40],
    ]);
    assert.deepEqual(polylines[1], [
      [ 10, 60 ],
      [ 0, 90 ],
      [ 30, 80 ],
      [ 20, 110 ],
      [ 50, 80 ],
      [ 40, 120 ],
      [ 60, 100 ],
    ]);
  });

  it('supports CIRCLE, ELLIPSE, ARC', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/circlesellipsesarcs.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const polylines = layerToPolylines(byLayer['0']);
    assert.equal(polylines.length, 5);
    assert.deepEqual(polylines[0].length, 73);
    assert.deepEqual(polylines[1].length, 39);
    assert.deepEqual(polylines[2].length, 40);
    assert.deepEqual(polylines[3].length, 18);
    assert.deepEqual(polylines[4].length, 73);
  });

  it('supports SPLINE', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/splines.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const polylines = layerToPolylines(byLayer['0']);
    assert.equal(polylines.length, 2);
    assert.deepEqual(polylines[0].length, 101);
    assert.deepEqual(polylines[1].length, 101);
  });

  it('supports BLOCK with INSERT', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const polylines = layerToPolylines(byLayer['0']);
    assert.equal(polylines.length, 10);
  });

});
