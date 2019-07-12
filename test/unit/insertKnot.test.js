import expect from 'expect'

import insertKnot from '../../src/util/insertKnot'

describe('Insert knot', () => {
  it('throws error if knot is invalid', () => {
    const controlPoints = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 20 },
      { x: 10, y: 20 }
    ]
    const k = 4
    const knots = [0, 0, 0, 0, 1, 2, 3, 3, 3, 3]
    expect(() => {
      insertKnot(k, controlPoints, knots, 4)
    }).toThrow(/^invalid new knot$/)
    expect(() => {
      insertKnot(k, controlPoints, knots, -1)
    }).toThrow(/^invalid new knot$/)
    const newSpline = insertKnot(k, controlPoints, knots, 1)
    expect(newSpline.controlPoints).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 6.666666666666668, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 20 },
      { x: 10, y: 20 }
    ])
    expect(newSpline.knots).toEqual([0, 0, 0, 0, 1, 1, 2, 3, 3, 3, 3])
  })
})
