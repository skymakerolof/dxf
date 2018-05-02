import fs from 'fs'
import { join } from 'path'
import { assert } from 'chai'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/points.dxf'), 'utf-8')

describe('POINT', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    assert.deepEqual(entities.length, 2)

    assert.deepEqual(entities[0], {
      type: 'POINT',
      colorNumber: 256,
      layer: '0',
      lineTypeName: 'ByLayer',
      x: 10,
      y: 20
    })
    assert.deepEqual(entities[1], {
      type: 'POINT',
      colorNumber: 256,
      layer: '0',
      lineTypeName: 'ByLayer',
      x: 30,
      y: 10
    })
  })
})
