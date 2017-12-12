import fs from 'fs'
import { join } from 'path'
import { assert } from 'chai'

import { parseString, denormalise } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/empty.dxf'), 'utf-8')

describe('Empty', () => {
  it('can parsed from a string', () => {
    const parsed = parseString(dxfContents)
    assert.equal(parsed.blocks.length, 78)
    assert.equal(parsed.entities.length, 0)

    const entities = denormalise(parsed)
    assert.deepEqual(entities, [])
  })
})
