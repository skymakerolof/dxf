import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/splines.dxf'), 'utf-8')

// A spline containing control point weights
const dxfSquircle = fs.readFileSync(join(__dirname, '/../resources/squircle2.dxf'), 'utf-8')

describe('SPLINE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)

    expect(entities[0]).toEqual({
      type: 'SPLINE',
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      closed: false,
      flag: 8,
      controlPointTolerance: 1e-7,
      controlPoints: [
        { x: 10, y: 10, z: 0 },
        { x: 50, y: 10, z: 0 },
        { x: 80, y: 40, z: 0 },
        { x: 90, y: 20, z: 0 }
      ],
      degree: 3,
      knotTolerance: 1e-7,
      knots: [0, 0, 0, 0, 1, 1, 1, 1],
      numberOfControlPoints: 4,
      numberOfFitPoints: 0,
      numberOfKnots: 8,
      extrusionX: 0,
      extrusionY: 0,
      extrusionZ: 0
    })

    expect(entities[1]).toEqual({
      type: 'SPLINE',
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      closed: false,
      flag: 8,
      controlPointTolerance: 1e-7,
      controlPoints: [
        { x: 30, y: 30, z: 0 },
        { x: 30, y: 50, z: 0 },
        { x: 85, y: 55, z: 0 },
        { x: 90, y: 80, z: 0 },
        { x: 30, y: 50, z: 0 },
        { x: 20, y: 80, z: 0 },
        { x: 55, y: 100, z: 0 },
        { x: 90, y: 90, z: 0 }
      ],
      degree: 3,
      knotTolerance: 1e-7,
      knots: [0, 0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 1],
      numberOfControlPoints: 8,
      numberOfFitPoints: 0,
      numberOfKnots: 12,
      extrusionX: 0,
      extrusionY: 0,
      extrusionZ: 0
    })
  })

  it('parses control weights', () => {
    const entities = parseString(dxfSquircle).entities
    expect(entities.length).toEqual(1)

    expect(entities[0].weights).toEqual([
      1,
      0.7071067811865476,
      1,
      0.7071067811865476,
      1,
      0.7071067811865476,
      1,
      0.7071067811865476,
      1
    ])
  })
})
