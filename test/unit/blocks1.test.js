import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/blocks1.dxf'), 'utf-8')

describe('BLOCK', () => {
  it('can be parsed', () => {
    const blocks = parseString(dxfContents).blocks
    expect(blocks.length).toEqual(3)
    expect(blocks[0]).toEqual({
      name: '*Model_Space',
      entities: [],
      x: 0,
      xref: '',
      y: 0,
      z: 0
    })
    expect(blocks[1]).toEqual({
      name: '*Paper_Space',
      entities: [],
      x: 0,
      xref: '',
      y: 0,
      z: 0
    })

    const entities2 = blocks[2].entities
    delete (blocks[2]['entities'])
    expect(blocks[2]).toEqual({
      name: 'a',
      x: 0,
      xref: '',
      y: 0
    })
    expect(entities2.length).toEqual(5)
    expect(entities2[0].type).toEqual('LINE')
    expect(entities2[1].type).toEqual('LINE')
    expect(entities2[2].type).toEqual('LINE')
    expect(entities2[3].type).toEqual('LINE')
    expect(entities2[4].type).toEqual('CIRCLE')
  })
})
