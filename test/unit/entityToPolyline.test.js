'use strict';

const fs = require('fs');
const assert = require('chai').assert;

const lib = require('../..');
const entityToPolyline = lib.entityToPolyline;

describe('Entity To Polyline', () => {

  it('supports LINE', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 11);

    const polyline = entityToPolyline(entities[0]);
    assert.deepEqual(polyline, [ [ 0, 0 ], [ 100, 0 ] ]);
  });

  it('supports LWPOLYLINE', () => {

    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/lwpolylines.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 2);

    const p0 = entityToPolyline(entities[0]);
    assert.deepEqual(p0, [
      [ 10, 40],
      [ 70, 0],
      [ 80, 20],
      [ 50, 60],
      [ 10, 40],
    ]);
    const p1 = entityToPolyline(entities[1]);
    assert.deepEqual(p1, [
      [ 10, 60 ],
      [ 0, 90 ],
      [ 30, 80 ],
      [ 20, 110 ],
      [ 50, 80 ],
      [ 40, 120 ],
      [ 60, 100 ],
    ]);
  });

  it('address the observed closed LWPOLYLINE transform bug', () => {

    // There was a bug with LW polyline where the duplicated point
    // used for closing it was no copied by mutated multiple times
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/closedlwpolylinebug.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 1);
    const polyline = entityToPolyline(entities[0]);
    assert.deepEqual(polyline, [
      [ 30, 40 ], [ 50, 40 ], [ 50, 70 ], [ 30, 40 ]
    ]);
  });

  it('supports CIRCLE, ELLIPSE, ARC', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/circlesellipsesarcs.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 5);

    assert.deepEqual(entityToPolyline(entities[0]).length, 73);
    assert.deepEqual(entityToPolyline(entities[1]).length, 39);
    assert.deepEqual(entityToPolyline(entities[2]).length, 40);
    assert.deepEqual(entityToPolyline(entities[3]).length, 18);
    assert.deepEqual(entityToPolyline(entities[4]).length, 73);
  });

  it('supports SPLINE', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/splines.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 2);

    assert.deepEqual(entityToPolyline(entities[0]).length, 101);
    assert.deepEqual(entityToPolyline(entities[1]).length, 101);
  });

  it('supports BLOCK with INSERT', () => {
    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 10);
  });

});
