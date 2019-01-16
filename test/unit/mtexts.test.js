import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/texts.dxf'), 'utf-8')

describe('MTEXT', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)

    expect(entities[0]).toEqual({
      type: 'MTEXT',
      layer: '0',
      string: 'ISO TEXT',
      styleName: 'iso',
      colorNumber: 256,
      nominalTextHeight: 20,
      x: 0,
      y: 20,
      z: 0,
      extrusionX: 0,
      extrusionY: 0,
      extrusionZ: 1,
      attachmentPoint: 1,
      columnHeights: 0,
      drawingDirection: 1,
      lineSpacingFactor: 1,
      lineSpacingStyle: 2,
      lineTypeName: 'ByLayer',
      refRectangleWidth: 121.6666624266237
    })
    expect(entities[1]).toEqual({
      type: 'MTEXT',
      layer: '0',
      string: 'UNICODE TEXT',
      styleName: 'unicode',
      colorNumber: 256,
      nominalTextHeight: 30,
      x: 0,
      y: 100,
      z: 0,
      extrusionX: 0,
      extrusionY: 0,
      extrusionZ: 1,
      attachmentPoint: 7,
      columnHeights: 0,
      drawingDirection: 1,
      lineSpacingFactor: 1,
      lineSpacingStyle: 2,
      lineTypeName: 'ByLayer',
      refRectangleWidth: 282.5000000000001
    })
  })
})
