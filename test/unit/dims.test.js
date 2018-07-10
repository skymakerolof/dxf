import fs from 'fs'
import { join } from 'path'
import { assert } from 'chai'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/dims.dxf'), 'utf-8')

describe.only('DIMENSION', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    // console.log(entities)
    assert.deepEqual(entities.length, 1)
    assert.deepEqual(entities[0], {
      type: 'DIMENSION',
      layer: '0',
      x: 22,
      y: 16,
      z: 0,
      from: {
        x: 10,
        y: 5,
        z: 0
      },
      to: {
        x: 22,
        y: 5,
        z: 0
      },
      textCenter: {
        x: 16,
        y: 16.76023192360164,
        z: 0
      },
      measurement: 12,
      dimensionType: 32,
      attachmentPoint: 5
    })
  })
})
