import expect from 'expect'

import round10 from '../../src/util/round10'

describe('round10', () => {
  it('works correctly with some numbers', () => {
    expect(round10(55.55, -1)).toEqual(55.6)
    expect(round10(55.549, -1)).toEqual(55.5)
    expect(round10(55, 1)).toEqual(60)
    expect(round10(54.9, 1)).toEqual(50)
    expect(round10(-55.55, -1)).toEqual(-55.5)
    expect(round10(-55.551, -1)).toEqual(-55.6)
    expect(round10(-55, 1)).toEqual(-50)
    expect(round10(-55.1, 1)).toEqual(-60)
  })
})
