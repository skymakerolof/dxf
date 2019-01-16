/**
 * Converted to expect-format tests from the original test suite:
 * https://github.com/thibauts/b-spline/blob/master/test/index.js
 *
 */
import expect from 'expect'

import interpolate from '../../src/util/bSpline'

const tValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
const degree = 2

describe('B-Spline interpolation', () => {
  it('uniform curve', () => {
    const points = [
      [-1.0, 0.0],
      [-0.5, 0.5],
      [0.5, -0.5],
      [1.0, 0.0]
    ]
    const expected = [
      [ -0.75, 0.25 ],
      [ -0.64, 0.32 ],
      [ -0.51, 0.33 ],
      [ -0.36, 0.28 ],
      [ -0.19, 0.17 ],
      [ 0, 0 ],
      [ 0.19, -0.17 ],
      [ 0.36, -0.28 ],
      [ 0.51, -0.33 ],
      [ 0.64, -0.32 ],
      [ 0.75, -0.25 ]
    ]
    expect(tValues.map(t => interpolate(t, degree, points))).toEqual(expected)
  })

  it('non-uniform curve', () => {
    const points = [
      [-1.0, 0.0],
      [-0.5, 0.5],
      [0.5, -0.5],
      [1.0, 0.0]
    ]
    const knots = [0, 0, 0, 1, 2, 2, 2]
    const expected = [
      [ -1, 0 ],
      [ -0.8, 0.16 ],
      [ -0.6, 0.24 ],
      [ -0.4, 0.24 ],
      [ -0.2, 0.16 ],
      [ 0, 0 ],
      [ 0.2, -0.16 ],
      [ 0.4, -0.24 ],
      [ 0.6, -0.24 ],
      [ 0.8, -0.16 ],
      [ 1, 0 ]
    ]
    expect(tValues.map(t => interpolate(t, degree, points, knots))).toEqual(expected)
  })

  it('closed non-uniform curve', () => {
    const points = [
      [-1.0, 0.0],
      [-0.5, 0.5],
      [0.5, -0.5],
      [1.0, 0.0],
      // ...
      [-1.0, 0.0],
      [-0.5, 0.5],
      [0.5, -0.5]
    ]
    const knots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const expected = [
      [ -0.75, 0.25 ],
      [ -0.4375, 0.3125 ],
      [ 0, 0 ],
      [ 0.4375, -0.3125 ],
      [ 0.75, -0.25 ],
      [ 0.6875, -0.0625 ],
      [ 0, 0 ],
      [ -0.6875, 0.0625 ],
      [ -0.75, 0.25 ],
      [ -0.4375, 0.3125 ],
      [ 0, 0 ]
    ]
    expect(tValues.map(t => interpolate(t, degree, points, knots))).toEqual(expected)
  })

  it('non-uniform rational curve', () => {
    const points = [
      [0.0, -0.5],
      [-0.5, -0.5],
      [-0.5, 0.0],
      [-0.5, 0.5],
      [0.0, 0.5],
      [0.5, 0.5],
      [0.5, 0.0],
      [0.5, -0.5],
      // duplicated first point
      [0.0, -0.5]
    ]
    const knots = [0, 0, 0, 1 / 4, 1 / 4, 1 / 2, 1 / 2, 3 / 4, 3 / 4, 1, 1, 1]
    const w = Math.pow(0.5, 0.5)
    const weights = [1, w, 1, w, 1, w, 1, w, 1]
    const expected = [
      [ 0, -0.5 ],
      [ -0.290554291, -0.406913018 ],
      [ -0.477931623, -0.146905969 ],
      [ -0.477931623, 0.146905969 ],
      [ -0.290554291, 0.406913018 ],
      [ 0, 0.5 ],
      [ 0.290554291, 0.406913018 ],
      [ 0.477931623, 0.146905969 ],
      [ 0.477931623, -0.146905969 ],
      [ 0.290554291, -0.406913018 ],
      [ 0, -0.5 ]
    ]
    expect(tValues.map(t => interpolate(t, degree, points, knots, weights))).toEqual(expected)
  })

  it('non-uniform rational curve with boosted weights', () => {
    const points = [
      [0.0, -0.5],
      [-0.5, -0.5],
      [-0.5, 0.0],
      [-0.5, 0.5],
      [0.0, 0.5],
      [0.5, 0.5],
      [0.5, 0.0],
      [0.5, -0.5],
      // duplicated first point
      [0.0, -0.5]
    ]
    const knots = [0, 0, 0, 1 / 4, 1 / 4, 1 / 2, 1 / 2, 3 / 4, 3 / 4, 1, 1, 1]
    const w = Math.pow(0.5, 0.5)
    const boosted = 4 * w
    const weights = [1, boosted, 1, boosted, 1, boosted, 1, boosted, 1]
    const expected = [
      [ 0, -0.5 ],
      [ -0.404135234, -0.457393437 ],
      [ -0.487382473, -0.29811957 ],
      [ -0.487382473, 0.29811957 ],
      [ -0.404135234, 0.457393437 ],
      [ 0, 0.5 ],
      [ 0.404135234, 0.457393437 ],
      [ 0.487382473, 0.29811957 ],
      [ 0.487382473, -0.29811957 ],
      [ 0.404135234, -0.457393437 ],
      [ 0, -0.5 ]
    ]
    expect(tValues.map(t => interpolate(t, degree, points, knots, weights))).toEqual(expected)
  })
})
