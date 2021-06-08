import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/texts-in-block.dxf'), 'utf-8')

describe('TEXT', () => {
  it('can be parsed', () => {
    const result = parseString(dxfContents)
    const entities = result.entities
    const blocks = result.blocks
    expect(entities.length).toEqual(1)

    expect(entities[0].type).toEqual('INSERT')
    expect(blocks.length).toEqual(17)

    const entityBlocks = blocks.filter(block => block.name === entities[0].block)
    expect(entityBlocks.length).toEqual(1)
    expect(entityBlocks[0].entities.length).toEqual(7)
    const texts = entityBlocks[0].entities.filter(item => item.type === 'TEXT')
    expect(texts[0]).toEqual({
      type: 'TEXT',
      string: 'FIRST FLOOR PLAN',
      layer: 'PEN45',
      lineTypeName: 'CENTER',
      lineTypeScale: 0.03,
      x: 10054.40134510397,
      y: -6695.714851337092,
      z: 0,
      textHeight: 23.8125,
      styleName: 'textstyle11'
    })
  })
})
