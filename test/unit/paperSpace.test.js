import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/testModelPaperSpace.dxf'), 'utf-8')

describe('PAPERSPACE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    let circle = entities.find( e => e.type === 'CIRCLE' )

    expect(circle.paperSpace).toEqual(1)
  })
})
