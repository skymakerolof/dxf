'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const keys = require('lodash.keys');

const lib = require('../..');
const layerToPolyline = lib.layerToPolyline;

describe('Layer To Lines', () => {

  it('supports LINE', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const lines = layerToPolyline(byLayer['0']);
    assert.equal(lines.length, 11);
    assert.deepEqual(lines[0], [ [ 0, 0 ], [ 100, 0 ] ]);
  });

  it('supports LWPOLYLINE', () => {

    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/lwpolylines.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const lines = layerToPolyline(byLayer['0']);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], [
      [ 10, 40],
      [ 70, 0],
      [ 80, 20],
      [ 50, 60],
      [ 10, 40],
    ]);
    assert.deepEqual(lines[1], [
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

    const lines = layerToPolyline(byLayer['0']);
    assert.equal(lines.length, 5);
    assert.deepEqual(lines[0].length, 73);
    assert.deepEqual(lines[1].length, 39);
    assert.deepEqual(lines[2].length, 40);
    assert.deepEqual(lines[3].length, 18);
    assert.deepEqual(lines[4].length, 73);
  });

  it('supports SPLINE', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/splines.dxf', 'utf-8'));
    const byLayer = lib.gatherByLayer(parsed);
    assert.deepEqual(keys(byLayer), ['0']);

    const lines = layerToPolyline(byLayer['0']);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0].length, 100);
    assert.deepEqual(lines[1].length, 100);
  });

});
