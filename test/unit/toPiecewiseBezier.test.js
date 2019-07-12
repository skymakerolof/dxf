import expect from 'expect'

import { checkPinned, computeInsertions } from '../../src/util/toPiecewiseBezier'

describe('Spline conversion to piecewise bezier', () => {
  it('checks that the spline is pinned', () => {
    expect(checkPinned(4, [0, 0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 1]))
    expect(() => {
      checkPinned(4, [0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,0,0.2,0.4,0.6000000000000001,0.8,1,1,1,1$/)
    expect(() => {
      checkPinned(4, [0, 1, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,1,0,0,0.2,0.4,0.6000000000000001,0.8,1,1,1,1$/)
    expect(() => {
      checkPinned(4, [0, 0, 1, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,1,0,0.2,0.4,0.6000000000000001,0.8,1,1,1,1$/)
    expect(() => {
      checkPinned(4, [0, 0, 0, 1, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,0,1,0.2,0.4,0.6000000000000001,0.8,1,1,1,1$/)

    expect(() => {
      checkPinned(4, [0, 0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 0.9, 1, 1, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,0,0,0.2,0.4,0.6000000000000001,0.8,0.9,1,1,1$/)
    expect(() => {
      checkPinned(4, [0, 0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 0.9, 1, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,0,0,0.2,0.4,0.6000000000000001,0.8,1,0.9,1,1$/)
    expect(() => {
      checkPinned(4, [0, 0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 0.9, 1])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,0,0,0.2,0.4,0.6000000000000001,0.8,1,1,0.9,1$/)
    expect(() => {
      checkPinned(4, [0, 0, 0, 0, 0.2, 0.4, 0.6000000000000001, 0.8, 1, 1, 1, 0.9])
    }).toThrow(/^not pinned. order: 4 knots: 0,0,0,0,0.2,0.4,0.6000000000000001,0.8,1,1,1,0.9$/)
  })

  it('computes the knots to be inserted for a piecewise bezier', () => {
    expect(computeInsertions(4, [0, 0, 0, 0, 1, 2, 2, 2, 2]))
      .toEqual([1, 1])
    expect(computeInsertions(4, [0, 0, 0, 0, 0.5, 2, 2, 2, 2]))
      .toEqual([0.5, 0.5])
    expect(computeInsertions(4, [0, 0, 0, 0, 0.5, 0.5, 0.5, 2, 2, 2, 2]))
      .toEqual([])
    expect(computeInsertions(3, [0, 0, 0, 1, 1, 2, 2, 2]))
      .toEqual([])
    expect(computeInsertions(3, [0, 0, 0, 1, 2, 2, 2]))
      .toEqual([1])
  })
})
