import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/blocks1.dxf'), 'utf-8')

describe('INSERT', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)

    expect(entities[0]).toEqual({
      type: 'INSERT',
      block: 'a',
      lineTypeName: 'ByLayer',
      layer: '0',
      colorNumber: 256,
      columnCount: 1,
      columnSpacing: 1,
      rowCount: 1,
      rowSpacing: 1,
      rotation: 45,
      x: 31.21320343559643,
      y: 75.35533905932738,
      z: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 0
    })

    expect(entities[1]).toEqual({
      type: 'INSERT',
      block: 'a',
      lineTypeName: 'ByLayer',
      layer: '0',
      colorNumber: 256,
      columnCount: 1,
      columnSpacing: 2,
      rowCount: 1,
      rowSpacing: 1,
      rotation: 15.00000000000001,
      x: 66.92130429902463,
      y: 59.34255665976439,
      z: 0,
      scaleX: 2,
      scaleY: 1,
      scaleZ: 0
    })
  })
})
