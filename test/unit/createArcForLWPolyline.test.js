import expect from 'expect'

import createArcForLWPolyine from '../../src/util/createArcForLWPolyline'

describe('Arc for LWPOLYLINE', () => {
  it('can be created for an angle < 180 degrees', () => {
    const from = [10, 0]
    const to = [0, 0]
    const bulge = Math.tan(Math.PI / 2 / 4)

    expect(createArcForLWPolyine(from, to, bulge, 15)).toEqual([
      [ 8.53553390593274, 1.1237243569579451 ],
      [ 6.830127018922194, 1.8301270189221936 ],
      [ 5, 2.0710678118654755 ],
      [ 3.169872981077806, 1.8301270189221936 ],
      [ 1.4644660940672636, 1.123724356957946 ]
    ])
  })

  it('can be created for an angle > 180 degrees', () => {
    const from = [10, 0]
    const to = [0, 0]
    const bulge = Math.tan(Math.PI * 3 / 2 / 4)

    expect(createArcForLWPolyine(from, to, bulge, 45)).toEqual([
      [ 12.071067811865476, 4.999999999999999 ],
      [ 10, 9.999999999999998 ],
      [ 5, 12.071067811865474 ],
      [ 8.881784197001252e-16, 10 ],
      [ -2.0710678118654746, 5 ]
    ])
  })

  it('can be created for negative bulge', () => {
    const from = [10, 0]
    const to = [0, 0]
    const bulge = -Math.tan(Math.PI * 3 / 2 / 4)

    expect(createArcForLWPolyine(from, to, bulge, 45)).toEqual([
      [ 12.071067811865476, -5.000000000000001 ],
      [ 9.999999999999998, -10 ],
      [ 4.999999999999999, -12.071067811865474 ],
      [ -8.881784197001252e-16, -9.999999999999998 ],
      [ -2.0710678118654746, -4.999999999999998 ]
    ])
  })
})
