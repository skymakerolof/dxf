import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/polylines.dxf'), 'utf-8')

describe('POLYLINE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)
    expect(entities[0]).toEqual({
      closed: true,
      layer: 'DXF',
      polyfaceMesh: false,
      polygonMesh: false,
      type: 'POLYLINE',
      vertices: [
        { x: 286, y: 279.9999999999999, z: 0 },
        { x: 280, y: 286, z: 0 },
        { x: 20.00000000000011, y: 286, z: 0 },
        { x: 14.00000000000002, y: 280, z: 0 },
        { x: 14, y: 20.00000000000011, z: 0 },
        { x: 20, y: 14.00000000000002, z: 0 },
        { x: 279.9999999999999, y: 14, z: 0 },
        { x: 286, y: 20.00000000000011, z: 0 }
      ]
    })
  })
})
