import fs from 'fs'
import { join } from 'path'
import { assert } from 'chai'

import { parseString } from '../../src'

const dxfContents = fs.readFileSync(join(__dirname, '/../resources/lwpolylines.dxf'), 'utf-8')

describe('LWPOLYLINE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    assert.deepEqual(entities.length, 2)
    assert.deepEqual(entities[0], {
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

    assert.deepEqual(entities[1], {
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
