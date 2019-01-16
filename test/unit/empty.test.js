import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString, denormalise } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/empty.dxf'), 'utf-8')

describe('Empty', () => {
  it('can parsed from a string', () => {
    const parsed = parseString(dxfContents)
    expect(parsed.blocks.length).toEqual(78)
    expect(parsed.entities.length).toEqual(0)

    const entities = denormalise(parsed)
    expect(entities).toEqual([])
  })
})
