'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const lib = require('../..');

const dfxContents = fs.readFileSync(__dirname + '/../resources/texts.dxf', 'utf-8');

describe('MTEXT', () => {

  it('can be parsed', () => {
    const entities = lib.parseString(dfxContents).entities;
    assert.deepEqual(entities.length, 2);

    assert.deepEqual(entities[0], {
      type: "MTEXT",
      layer: "0",
      string: "ISO TEXT",
      styleName: "iso",
      colorNumber: 256,
      nominalTextHeight: 20,
      x: 0,
      y: 20,
      z: 0,
      attachmentPoint: 1,
      columnHeights: 0,
      drawingDirection: 1,
      lineSpacingFactor: 1,
      lineSpacingStyle: 2,
      lineTypeName: "ByLayer",
      refRectangleWidth: 121.6666624266237,
    });
    assert.deepEqual(entities[1], {
      type: "MTEXT",
      layer: "0",
      string: "UNICODE TEXT",
      styleName: "unicode",
      colorNumber: 256,
      nominalTextHeight: 30,
      x: 0,
      y: 100,
      z: 0,
      attachmentPoint: 7,
      columnHeights: 0,
      drawingDirection: 1,
      lineSpacingFactor: 1,
      lineSpacingStyle: 2,
      lineTypeName: "ByLayer",
      refRectangleWidth: 282.5000000000001,
    });

  });

});
