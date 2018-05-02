import fs from 'fs'
import { join } from 'path'
import { assert } from 'chai'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/blocks1.dxf'), 'utf-8')

describe('BLOCK', () => {
  it('can be parsed', () => {
    const blocks = parseString(dxfContents).blocks
    assert.deepEqual(blocks.length, 3)
    assert.deepEqual(blocks[0], {
      name: '*Model_Space',
      entities: [],
      x: 0,
      xref: '',
      y: 0,
      z: 0
    })
    assert.deepEqual(blocks[1], {
      name: '*Paper_Space',
      entities: [],
      x: 0,
      xref: '',
      y: 0,
      z: 0
    })

    const entities2 = blocks[2].entities
    delete (blocks[2]['entities'])
    assert.deepEqual(blocks[2], {
      name: 'a',
      x: 0,
      xref: '',
      y: 0
    })
    assert.deepEqual(entities2.length, 5)
    assert.deepEqual(entities2[0].type, 'LINE')
    assert.deepEqual(entities2[1].type, 'LINE')
    assert.deepEqual(entities2[2].type, 'LINE')
    assert.deepEqual(entities2[3].type, 'LINE')
    assert.deepEqual(entities2[4].type, 'CIRCLE')
  })
})
