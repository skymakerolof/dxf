import fs from 'fs'
import { join } from 'path'
import { assert } from 'chai'

import { parseString, denormalise } from '../../src'

describe('Denormalise', () => {
  it('top-level entities', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/lines.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)
    assert.equal(entities.length, 11)
  })

  it('entities from inserted blocks', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/blocks1.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)
    assert.equal(entities.length, 10)
  })

  it('for blocks that contain inserts', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/blocks2.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)
    assert.equal(entities.length, 14)
    assert.deepEqual(
      entities[3].transforms,
      [
        { x: 0, y: 0, xScale: 2, yScale: 2, rotation: 0 },
        { x: 175, y: 25, xScale: 0.5, yScale: 0.5, rotation: 0 }
      ])
  })
})
