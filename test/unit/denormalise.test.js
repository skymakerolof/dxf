import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString, denormalise } from '../../src'

describe('Denormalise', () => {
  it('top-level entities', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/lines.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)
    expect(entities.length).toEqual(11)
  })

  it('entities from inserted blocks', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/blocks1.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)
    expect(entities.length).toEqual(10)
  })

  it('for blocks that contain inserts', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/blocks2.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)
    expect(entities.length).toEqual(14)
    expect(entities[3].transforms).toEqual([
      { x: 0, y: 0, scaleX: 2, scaleY: 2, scaleZ: 0, rotation: 0 },
      { x: 175, y: 25, scaleX: 0.5, scaleY: 0.5, scaleZ: 0, rotation: 0 }
    ])
  })

  it('inserts with rectangular array of blocks', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/arrayed-holes.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)

    // An insert of a circle should be repeated 14 times
    expect(entities.filter(e => e.type === 'CIRCLE').length).toEqual(14)
  })

  it('rectangular blocks rotate correctly', () => {
    const contents = fs.readFileSync(join(__dirname, '../resources/array-rotated.dxf'), 'utf-8')
    const parsed = parseString(contents)
    const entities = denormalise(parsed)

    // There should be six circles in a 3x2 rotated grid
    expect(entities.length).toEqual(6)

    // If they are arrayed correctly, their transforms should be these:
    expect(entities[0].transforms[0]).toEqual(
      { x: 5, y: 6, scaleX: 1.5, scaleY: -1.5, scaleZ: 0, rotation: 120 }
    )
    expect(entities[1].transforms[0]).toEqual(
      { x: 4.75, y: 6.43301270189222, scaleX: 1.5, scaleY: -1.5, scaleZ: 0, rotation: 120 }
    )
    expect(entities[2].transforms[0]).toEqual(
      { x: 5.866025403784438, y: 6.5, scaleX: 1.5, scaleY: -1.5, scaleZ: 0, rotation: 120 }
    )
    expect(entities[3].transforms[0]).toEqual(
      { x: 5.616025403784438, y: 6.93301270189222, scaleX: 1.5, scaleY: -1.5, scaleZ: 0, rotation: 120 }
    )
    expect(entities[4].transforms[0]).toEqual(
      { x: 6.732050807568878, y: 7, scaleX: 1.5, scaleY: -1.5, scaleZ: 0, rotation: 120 }
    )
    expect(entities[5].transforms[0]).toEqual(
      { x: 6.482050807568878, y: 7.43301270189222, scaleX: 1.5, scaleY: -1.5, scaleZ: 0, rotation: 120 }
    )
  })
})
