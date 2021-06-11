import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/dimensions.dxf'), 'utf-8')

const verticalDxfDimension = fs.readFileSync(join(__dirname, '/../resources/dimension-vertical.dxf'), 'utf-8')

describe('DIMENSION', () => {
  it('can be parsed', () => {
    const parsed = parseString(dxfContents)
    const entities = parsed.entities
    const dimensions = entities.filter(e => e.type === 'DIMENSION')
    const header = parsed.header
    expect(dimensions.length).toEqual(2)

    expect(dimensions[0]).toEqual({
      type: 'DIMENSION',
      block: '*D1',
      dimensionType: 0,
      attachementPoint: 5,
      start: { x: 90, y: 20, z: 0 },
      textMidpoint: { x: 50, y: 21.875, z: 0 },
      measureStart: { x: 10, y: 10, z: 0 },
      measureEnd: { x: 90, y: 10, z: 0 },
      extrudeDirection: { x: 0, y: 0, z: 1 },
      textRotation: 0,
      uniqueBlockReference: true,
      layer: '0',
      colorNumber: 256,
      lineTypeName: 'ByLayer'
    })

    expect(header.dimArrowSize).toEqual(2.5)
  })
  it('can handle rotation for vertical dimension', () => {
    const parsed = parseString(verticalDxfDimension)
    const entities = parsed.entities
    const dimensions = entities.filter(e => e.type === 'DIMENSION')
    const header = parsed.header
    expect(dimensions.length).toEqual(1)

    expect(dimensions[0]).toEqual({
      type: 'DIMENSION',
      dimensionType: 0,
      uniqueBlockReference: true,
      userDefinedLocation: true,
      attachementPoint: 5,
      start: { x: 88.15777111112607, y: 148.1076419471065, z: 0 },
      textMidpoint: { x: 88.15777111112607, y: 121.3576419471065, z: 0 },
      measureStart: { x: 187.8323741464143, y: 148.1076419471065, z: 0 },
      measureEnd: { x: 109.5740206784428, y: 94.60764194710634, z: 0 },
      rotation: 90,
      layer: '0'
    })

    expect(header.dimArrowSize).toEqual(3)
  })
})
