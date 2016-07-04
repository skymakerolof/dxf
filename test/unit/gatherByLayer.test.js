'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

describe('Gather By Layer', () => {

  it('gathers top-level entities', () => {
    const contents = fs.readFileSync(__dirname + '/../resources/lines.dxf', 'utf-8');
    const parsed = lib.parseString(contents);
    const byLayer = lib.gatherByLayer(parsed);

    assert.equal(byLayer['0'].length, 11);
  });

  it('entities from inserted blocks', () => {
    const contents = fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8');
    const parsed = lib.parseString(contents);
    const byLayer = lib.gatherByLayer(parsed);
    assert.equal(byLayer['0'].length, 10);
  });

  it('for blocks that contain inserts', () => {
    const contents = fs.readFileSync(__dirname + '/../resources/blocks2.dxf', 'utf-8');
    const parsed = lib.parseString(contents);
    const byLayer = lib.gatherByLayer(parsed);
    assert.equal(byLayer['0'].length, 11);

    assert.deepEqual(
      byLayer['0'][0].transforms,
      [
        { x: 0, y: 0, xScale: 1, yScale: 1, rotation: 0 },
        { x: 175, y: 25, xScale: 1, yScale: 1, rotation: 0 },
      ]);
  });

});
