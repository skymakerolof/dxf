'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

describe('Denormalise', () => {

  it('top-level entities', () => {
    const contents = fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8');
    const parsed = lib.parseString(contents);
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 11);
  });

  it('entities from inserted blocks', () => {
    const contents = fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8');
    const parsed = lib.parseString(contents);
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 10);
  });

  it('for blocks that contain inserts', () => {
    const contents = fs.readFileSync(__dirname + '/../resources/blocks2.dxf', 'utf-8');
    const parsed = lib.parseString(contents);
    const entities = lib.denormalise(parsed);
    assert.equal(entities.length, 14);
    assert.deepEqual(
      entities[3].transforms,
      [
        { x: 0, y: 0, xScale: 2, yScale: 2, rotation: 0 },
        { x: 175, y: 25, xScale: 0.5, yScale: 0.5, rotation: 0 },
      ]);
  });

});
