import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/points.dxf'), 'utf-8')

describe('POINT', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)

    expect(entities[0]).toEqual({
      type: 'POINT',
      colorNumber: 256,
      layer: '0',
      lineTypeName: 'ByLayer',
      x: 10,
      y: 20
    })
    expect(entities[1]).toEqual({
      type: 'POINT',
      colorNumber: 256,
      layer: '0',
      lineTypeName: 'ByLayer',
      x: 30,
      y: 10
    })
  })
})
