import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/dimensions.dxf'), 'utf-8')

describe('DIMENSION', () => {
  it('can be parsed', () => {
    const parsed = parseString(dxfContents)
    const entities = parsed.entities
    const dimensions = entities.filter(e => e.type === 'DIMENSION')
    const header = parsed.header
    console.log(entities)
    expect(dimensions.length).toEqual(2)

    expect(dimensions[0]).toEqual({
      type: 'DIMENSION',
      block: '*D1',
      dimensionType: 32,
      attachementPoint: 5,
      start: { x: 90, y: 20, z: 0 },
      textMidpoint: { x: 50, y: 21.875, z: 0 },
      measureStart: { x: 10, y: 10, z: 0 },
      measureEnd: { x: 90, y: 10, z: 0 },
      extrudeDirection: { x: 0, y: 0, z: 1 },
      layer: '0',
      colorNumber: 256,
      lineTypeName: 'ByLayer'
    })

    expect(header.dimArrowSize).toEqual(2.5)
  })
})
