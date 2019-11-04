import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/blocks2.dxf'), 'utf-8')

describe('BLOCK 2', () => {
  it('can be parsed', () => {
    const blocks = parseString(dxfContents).blocks
    expect(blocks.length).toEqual(5)
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
    delete (blocks[2].entities)
    expect(blocks[2]).toEqual({
      name: 'block_insert',
      x: 0,
      xref: '',
      y: 0
    })
    expect(entities2.length).toEqual(2)
    expect(entities2[0].type).toEqual('INSERT')
    expect(entities2[1].type).toEqual('INSERT')

    const entities3 = blocks[3].entities
    delete (blocks[3].entities)
    expect(blocks[3]).toEqual({
      name: 'block01',
      x: 0,
      xref: '',
      y: 0
    })
    expect(entities3.length).toEqual(6)
    expect(entities3[0].type).toEqual('LINE')
    expect(entities3[1].type).toEqual('LINE')
    expect(entities3[2].type).toEqual('LINE')
    expect(entities3[3].type).toEqual('LINE')
    expect(entities3[4].type).toEqual('ARC')
    expect(entities3[5].type).toEqual('MTEXT')

    const entities4 = blocks[4].entities
    delete (blocks[4].entities)
    expect(blocks[4]).toEqual({
      name: 'block02',
      x: 0,
      xref: '',
      y: 0
    })
    expect(entities4.length).toEqual(5)
    expect(entities4[0].type).toEqual('LINE')
    expect(entities4[1].type).toEqual('LINE')
    expect(entities4[2].type).toEqual('LINE')
    expect(entities4[3].type).toEqual('MTEXT')
    expect(entities4[4].type).toEqual('ELLIPSE')
  })
})
