import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/texts-in-block.dxf'), 'utf-8')

describe('TEXT', () => {
  it.only('can be parsed', () => {
    const result = parseString(dxfContents)
    const entities = result.entities
    const blocks = result.blocks
    console.log(entities[0])
    expect(entities.length).toEqual(1)

    expect(entities[0].type).toEqual('INSERT')
    expect(blocks.length).toEqual(17)

    const entityBlocks = blocks.filter(block => block.name === entities[0].block)
    expect(entityBlocks.length).toEqual(1)
    expect(entityBlocks[0].entities.length).toEqual(4)
    const texts = entityBlocks[0].entities.filter(item => item.type === 'TEXT')
    expect(texts.length).toEqual(3)
  })
})
