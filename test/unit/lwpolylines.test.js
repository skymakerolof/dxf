import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'

const dxfContents = fs.readFileSync(join(__dirname, '/../resources/lwpolylines.dxf'), 'utf-8')

describe('LWPOLYLINE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)
    expect(entities[0]).toEqual({
      type: 'LWPOLYLINE',
      vertices: [
        { x: 10, y: 40 },
        { x: 70, y: 0 },
        { x: 80, y: 20 },
        { x: 50, y: 60 }
      ],
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      closed: true
    })

    expect(entities[1]).toEqual({
      type: 'LWPOLYLINE',
      vertices: [
        { x: 10, y: 60 },
        { x: 0, y: 90 },
        { x: 30, y: 80 },
        { x: 20, y: 110 },
        { x: 50, y: 80 },
        { x: 40, y: 120 },
        { x: 60, y: 100 }
      ],
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      closed: false
    })
  })
})
